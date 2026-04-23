# Research context (cluster 2026-04-22)

You are producing a deep-research report for **Jungl3** (stylized `jungl3`), a product with the following characteristics.

## What Jungl3 is

Jungl3 generates, deploys, and vends pre-built, integrated, "Understory" enterprise applications so product teams can start from a living, working system rather than from a blank page. Teams shape the generated system — subtracting what doesn't belong, substituting components, adding where the baseline stops — into their real product.

Key properties:

- Distributed as an **AWS Marketplace** listing. Customers subscribe, launch a CloudFormation template into their own AWS account, and operate their own Jungl3 instance entirely inside that account. There is no hosted multi-tenant SaaS version of Jungl3 itself.
- Each "Jungle" is a synthetic but believable enterprise environment: microservices, queues, events, stubs, scheduled jobs, seed data, personas, workflows, audit trails, and background activity — all deployed, running, and interacting on day one.
- The central product thesis is "time to real": time from `subscribe` to the first click on running software that feels like a real enterprise system, not a demo.
- The central failure mode is **plausibility collapse**: the moment a user (builder, judge, buyer) spots that the data, workflows, personas, or system behavior are obviously fake, every other investment loses value.

## Where we are now

The 2026-04-21 deep-research cluster (twelve reports) and the subsequent review pass turned many open questions into decisions. The commitments are now on record as ADRs 0005–0009:

- **ADR 0005:** Event envelope is CloudEvents v1.0 with reverse-DNS typing; every event/log/audit record carries both `trace_id` (W3C Trace Context) and `case_id` (business-domain identifier).
- **ADR 0006:** v1 domain anchor is P&C insurance claims processing, claims-only (no underwriting). Seven services: `policy-service`, `claim-intake`, `claim-workflow`, `assessment-service`, `payment-service`, `notification-service`, `audit-service`. Two stubs: payment gateway, notification.
- **ADR 0007:** Infrastructure cost ceiling $100/month per install; LLM budget separately metered at $50/month default, hard cutoff, graceful degradation. Observability is CloudWatch Logs + Logs Insights + X-Ray only. LLMs are prominent via a single `llm-gateway` Lambda constrained to deterministic tool use.
- **ADR 0008:** Every multi-step business process is an AWS Step Functions state machine. Maker-checker is enforced at the state-machine level, not the UI.
- **ADR 0009:** The audit trail is a separate DynamoDB table (`jungle3-audit`), append-only, hash-chained with SHA-256 `prev_hash`, owned by `audit-service`, subscribed to every domain event.

The full findings document these derive from is at `docs/research/findings.md` in the repo; the reports that fed it are at `docs/research/deep-research-2026-04-21/results/`.

## Who the research audience is

Jungl3 engineering leadership. They want **actionable, decision-ready findings** that move the ADRs above from "decided" to "buildable" — concrete recommendations, real numbers, named failure modes, and named trade-offs. Assume they are technically sophisticated and have already read the ADRs. Prefer opinionated synthesis over neutral hedging. Cite named systems, companies, open-source projects, and specifications where useful.

## What this cluster is for

ADRs 0005–0009 are decisions. Now they have to be built. This cluster is about the **next layer of detail** — the specific data models, numeric distributions, library choices, calibration plans, and edge cases that each ADR exposed as still-unknown.

Do not re-argue the ADRs. They are settled. Accept their framing and go deeper.

## Output expectations for every research task

Every deep-research report should end with a section titled **"Decision-ready recommendations for Jungl3"** that states, in 5–10 bullets:

- What Jungl3 should do in the next implementation step for this topic.
- What Jungl3 should explicitly defer past v1.
- The single biggest risk if Jungl3 ignores this topic.
- Any cross-links to the other 9 topics in this cluster where this one has knock-on effects.

Treat this as a genuine advisory document. Be direct. Cite real systems, real pricing, real code where possible. It is better to be sharply opinionated and wrong in a named way than to be vaguely comprehensive.


---

# Topic 6: LLM cost pre-estimation accuracy for Claude with tool use

See `00-context.md` for product framing. [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) commits to a $50/month default LLM budget enforced by an `llm-gateway` Lambda that **pre-estimates** each call's cost, debits the budget before the call, and reconciles after. The reliability of this scheme depends entirely on how accurate the pre-estimator is, and the current design is sketched but not calibrated. This topic is about making the estimator real.

## Research questions

1. **Anthropic token accounting, exactly.** For the current (2026-04-22) Claude Sonnet and Claude Haiku APIs, what does "input tokens" actually include — system prompt, conversation history, tool definitions, tool call results, cache reads, cache writes? What is the prompt-caching billing model, and how does it interact with tool use? Cite current Anthropic docs and pricing.

2. **Tool-use overhead.** Each tool call adds round-trips. How much does a tool call inflate input and output tokens relative to a pure text completion? Empirical measurements are ideal; worst-case bounds are acceptable. What is the per-tool-call token "tax"?

3. **Output length bounding.** `max_tokens` bounds output cost. But for an agent that may make multiple model calls per user turn, how do you bound total-turn cost? What abstractions do production Claude users (Cursor, Perplexity, Zed, Codeium) rely on — per-turn token ceilings, mid-stream cancellation, budget envelopes on the entire agent loop?

4. **Pre-estimation methods.** Concrete approaches to estimating cost before the call: (a) counting input tokens via `tiktoken` or Anthropic's tokenizer, (b) adding a fixed tool-call overhead per registered tool, (c) bounding output at `max_tokens * price_per_token`, (d) historical per-query-class averages. Which combination gives you ≤10% error on real workloads? Cite any published analyses.

5. **Reconciliation after the call.** Anthropic API responses include `usage.input_tokens` and `usage.output_tokens`. What is the cleanest pattern for the `llm-gateway` to reconcile estimate → actual and refund/debit the delta? Cite FinOps patterns for similar pay-per-inference services.

6. **Price drift.** Anthropic pricing changes. A static estimator calibrated on April pricing becomes wrong in May. How do production systems keep their cost estimators current — polling a pricing endpoint, pinned SDK versions, manual config updates, deploy-gated calibration runs? What is the maintenance cadence?

7. **Per-user and per-purpose budgets.** ADR 0007 defaults to a per-install budget. Is there a clear point (multi-tenant install, multi-operator deployment, per-team billing) at which per-user or per-purpose budgets become necessary? What data model supports both gracefully?

8. **Top-up UX.** When a customer wants to extend a budget mid-month — via CLI, Console, or the admin UI — what is the cleanest UX? How do similar metered-LLM products (Anthropic Console, OpenAI Platform, Braintrust, LangSmith) handle this?

9. **Validation harness.** What does a real cost-estimation validation harness look like? Replay historical calls, compare estimates against actuals, report error distribution. What should the v1 gate be — the estimator must predict within ±N% on M% of calls?

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
