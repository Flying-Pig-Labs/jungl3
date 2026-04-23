# 0007 — v1 cost profile and LLM metering

**Status:** Accepted
**Date:** 2026-04-22

## Context

Jungl3 runs inside a customer's AWS account ([ADR 0003](./0003-installable-via-aws-marketplace.md)). The cost of the install is visible on the customer's bill, reviewed by the customer's FinOps team, and — crucially — is the first thing a labs-team sponsor has to defend when the install shows up in an internal cost review. A Jungl3 that runs $500/month idle is a product that gets killed in its first cost review regardless of how real it feels.

The 2026-04-21 research cluster produced three intersecting findings:

- **Report 08** costed out a default-realism install at $110–$150/month and named the services that quietly dominate the bill (CloudWatch Logs ingestion, NAT Gateway, OpenSearch, inter-AZ transfer).
- **Report 09** argued for three admin dashboards hosted on a Fargate task, which pushes against both the cost floor and the idle-footprint floor.
- **Report 11** argued for OpenSearch to back audit-trail search, which adds $150/month on its own and makes the entire cost target infeasible.

Separately, [findings.md §6.4](../research/findings.md#6.4-llm-scope-in-v1--resolved-prominent-claude-code-sdk-tool-constrained) commits to LLMs as a prominent v1 surface (the admin agent, seed-data text generation, persona writing style). LLM inference is a cost category AWS doesn't meter; without a discipline, it is the line item that quietly eats the FinOps budget and makes the install feel expensive in ways the customer can't predict.

This ADR pins the cost ceiling, the observability stack that fits under it, and the LLM strategy that keeps inference visible and controllable.

## Decision

**1. Infrastructure cost ceiling: $100/month per install.** This is the default-realism target. Minimum-realism installs are lower; maximum-realism installs may exceed it and warn the operator.

**2. LLM budget: separately metered, default $50/month per install.** Visible as a distinct CloudWatch metric and a line item in the admin UI. Hard cutoff at exhaustion, resets monthly (UTC). Total install under heavy use: $150/month. Under light use: $100/month. The LLM meter is *not* included in the $100 infra ceiling — it is a separate category with separate customer-facing visibility.

**3. Observability stack: CloudWatch Logs + CloudWatch Logs Insights + AWS X-Ray only.**

- All services log to CloudWatch Log Groups as structured JSON with `trace_id` and `case_id` as top-level fields (per [ADR 0005](./0005-event-envelope-and-correlation-identifiers.md)).
- Log Groups have **7-day retention** by default. Customer can extend via install config; the default bounds storage cost.
- X-Ray is enabled on every service with **10% sampling** by default.
- **No OpenSearch.** Audit-trail search is re-solved via the admin agent's DynamoDB and Logs Insights tools.
- **No OTLP export by default.** An opt-in install-config flag sets up a Firehose → customer endpoint. Off unless the customer turns it on.

**4. LLM strategy: prominent surface, deterministic-tool-constrained, via the Claude Code SDK.**

LLMs appear in four places: the admin agent (primary interactive surface), seed-data text generation (install-time), persona writing-style generation (install-time), and some stub response bodies (runtime, cached). In every case:

- **Agents invoke tools; they do not generate claims about system state.** The admin agent's response is always a summary of tool output with inline citations back to the raw tool results. This preserves the audit-trail integrity argument in [findings.md §6.2](../research/findings.md#6.2-admin-ui--resolved-llm-agent-over-deterministic-cloudwatchx-ray-tools).
- **All LLM traffic goes through a single `llm-gateway` Lambda.** No service calls Anthropic directly. The gateway enforces the budget by pre-estimating cost, debiting a DynamoDB budget record with a conditional write before the call, and reconciling against actual token usage after.
- **Graceful degradation at the cutoff.** When the budget is exhausted, the admin UI still works: simple keyword matching selects tools, the tools run, and raw output is returned with a banner indicating the LLM summary layer is unavailable until reset.

**5. Default model tier: Claude Sonnet, with Haiku selectable for cost-sensitive installs.** Admin config surfaces the choice; the LLM gateway honors it.

Resolves [`CLAUDE.md`](../../CLAUDE.md) §11 open question #18 (admin/observability surface vs Agent Layer inspection specialists — resolved by the agent-over-deterministic-tools design).

## Consequences

**Enables:**

- A Jungl3 install is cost-predictable. A customer can look at the $100 infra + $50 LLM figures on the Marketplace listing and know what the bill will look like before subscribing.
- The admin surface is one chat UI backed by tools — not three dashboards, not a search index. This is cheaper, simpler, and per [findings.md §6.2](../research/findings.md#6.2-admin-ui--resolved-llm-agent-over-deterministic-cloudwatchx-ray-tools) arguably better UX for the per-case observability question.
- Audit integrity is preserved: the agent cannot invent facts about system state because every answer is cited to a tool invocation. The audit trail remains the source of truth.
- The LLM gateway becomes a single point of policy enforcement — budget, model selection, retry logic, rate limiting. Every future LLM-using surface inherits these for free.
- Customers can set their own CloudWatch alarms on the `Jungl3/LLM/BudgetRemaining` metric and on infra spend.

**Forecloses:**

- OpenSearch in v1. A later ADR may reintroduce it; v1 does not.
- Default OTLP export to external observability backends. Customer opt-in only.
- Services calling Anthropic (or any LLM provider) directly. The gateway is the sole path.
- Traditional "click to drill" dashboards for the admin surface. Chat plus tools is the v1 affordance. Visualization comes in v2 if operator feedback justifies it.
- Soft budget warnings. The LLM cutoff is a hard stop; graceful degradation is the fallback, not "a warning the operator can dismiss."

**Accepts:**

- Chat-only admin UX is a bet. If operators find it insufficient for real work, v2 layers visualization on top of the same tools — but operators have to put up with chat-only until then.
- X-Ray at 10% sampling loses some traces. The trade is cost-for-coverage; 100% sampling was $360/month at default-realism traffic volumes per report 08.
- 7-day log retention is aggressive. Customers needing longer retention extend it and pay. The default optimizes for the cost ceiling, not for forensic reach.
- LLM cost estimation is imprecise. The gateway reconciles actual against estimate after each call, but within-call the estimate is what gates admission. A consistently-wrong estimator is a real failure mode and the gateway needs a calibration test.
- An LLM line item on a customer's bill is unfamiliar territory. Customers accustomed to AWS-only billing will ask about this; listing documentation has to explain it in plain language.
- The maker-checker workflow in [findings.md §5.4](../research/findings.md#5.4-maker-checker-four-eyes-is-the-single-highest-signal-regulated-cue) cannot be LLM-generated or LLM-approved. All compliance-adjacent transitions are enforced at the state-machine level ([ADR 0008](./0008-workflows-are-state-machines.md)) and land in the hash-chained audit store ([ADR 0009](./0009-audit-trail-is-append-only-hash-chained.md)), both out of the LLM's reach.

## Alternatives considered

- **Single combined budget (infra + LLM under one $150 ceiling).** Simpler for the customer. Rejected — LLM cost is variable and unfamiliar; folding it into infra hides the variability and makes surprises harder to reason about. Separate meters give the customer the FinOps hooks they need.
- **OpenSearch for audit-trail search.** Report 11's recommendation. Rejected — $150/month on its own blows the ceiling, and the agent's `dynamodb_get_case` + `cloudwatch_logs_insights_query` tools re-solve the underlying operator need. If search UX becomes load-bearing in v2, reintroduce.
- **Three dashboards on Fargate for the admin surface** (report 09). More conventional UX. Rejected — Fargate idle cost is a persistent floor, and the dashboards are fixed views; the agent handles arbitrary operator questions using the same tools. Revisit if chat-only proves insufficient.
- **100% X-Ray sampling.** Complete trace coverage. Rejected — $360/month at default-realism traffic volumes. 10% preserves service-map visualization and per-case sampling for the admin agent's use; operators needing more can bump the sample rate via config.
- **Default OTLP export to third-party APM.** Matches common enterprise observability stacks. Rejected — persistent export is persistent egress and persistent third-party cost, both invisible to the customer at install time. Opt-in is the right default for a product that runs in the customer's account.
- **Soft LLM budget warnings instead of hard cutoff.** Less jarring UX at the threshold. Rejected — soft warnings get ignored, the whole point of the meter is FinOps predictability, and the graceful-degradation fallback means "exhausted" still lets the operator do their job with raw tool output.
- **Let services call Anthropic directly, gateway later.** Faster first implementation. Rejected — once services have direct SDK clients, retrofitting a gateway means revising every call site. Gateway-first is structurally cheaper.
- **Defer the LLM strategy past v1.** Ship without LLMs; add them in v2. Rejected — the admin-agent-over-tools design is what reconciles the fight between report 09 (UX need) and report 08 (cost) and report 11 (audit integrity). Deferring LLMs means reviving dashboards + OpenSearch, which does not fit the cost ceiling.
