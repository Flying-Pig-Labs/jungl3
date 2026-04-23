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

# Topic 5: Claude Code SDK agent patterns for deterministic tool-constrained agents

See `00-context.md` for product framing. [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) commits to the LLM admin agent being implemented via the [Claude Code SDK](https://docs.claude.com/en/api/agent-sdk/overview), constrained to invoke deterministic tools and summarize their output with citations — explicitly forbidden from inventing claims about system state. This topic is about how to actually build an agent that holds to that contract.

## Research questions

1. **SDK surface, concretely.** What are the relevant Claude Code SDK primitives for building a tool-calling agent? Survey the public documentation and any available examples. How does tool registration work, how does tool-call streaming work, how does the SDK surface structured tool inputs/outputs to the model and back? Cite specific SDK versions and code patterns.

2. **Preventing confabulation.** What are the known patterns for building an agent that *refuses to state system facts not grounded in a tool result*? System prompts are part of it; what else — structured output constraints, required-citation post-processing, response-schema enforcement, adversarial test patterns? Cite real implementations where published (Anthropic's own cookbook, published papers, notable open-source agent frameworks with this property).

3. **Tool-call grounding patterns.** When the agent invokes `cloudwatch_logs_insights_query` and gets rows back, how does it cite those rows in its natural-language summary such that a reader can verify? Patterns: inline markdown citation, structured "citation" field in the response schema, rendered evidence blocks. What do other production tool-using agents do? Cite Perplexity, Claude's own browser-tool pattern, Cursor's agent citations, etc.

4. **Failure-mode catalog.** When a Claude-Sonnet-class agent with tool use does misbehave, what does the misbehavior look like? Tool-arg hallucination, tool-name hallucination, invented rows in summaries, ignoring tool errors, re-asking the same tool repeatedly, cycles. What are the testable mitigations for each?

5. **Cost profile of tool-use round-trips.** A tool-calling agent often makes 2–4 round-trips to the model per user question (reason → tool call → reason → tool call → answer). For a Claude Sonnet-class model, what is the real token profile of a single admin-agent query at v1 scale? Cite Anthropic pricing and measured examples. Include a concrete per-query cost estimate for a representative operator question.

6. **Degraded-mode without the LLM.** ADR 0007 requires graceful degradation — when the budget is exhausted, the admin UI still works, with keyword matching selecting tools and raw output returned. What is the cleanest pattern for this fallback? Sub-agent design (a keyword-only "sibling" that shares the tool set), a tool-name dispatch table, a small local model (ONNX/distilled) for intent classification?

7. **Evaluation harness.** How should Jungl3 continuously test that the admin agent (a) picks the right tool for common queries, (b) does not invent facts, and (c) degrades correctly at budget exhaustion? Cite eval frameworks for tool-using agents (Anthropic's MCP evals, OpenAI evals, Braintrust, LangSmith, etc.). What does a real eval suite for this agent look like?

8. **Claude Code SDK vs alternatives.** Briefly: is there a reason to reconsider the Claude Code SDK choice in favor of bare Anthropic API, MCP over Anthropic API, LangChain/LangGraph, or Bedrock Converse API? ADR 0007 is settled; this is a sanity check on whether the SDK ships what we assume it ships.

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
