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

# Topic 1: Step Functions for regulated workflows with maker-checker

See `00-context.md` for product framing. ADR 0008 commits to AWS Step Functions as the substrate for every multi-step business process in v1, and ADR 0009 commits to append-only hash-chained audit. This topic is about getting the Step Functions design right for a regulated claims workflow.

## Research questions

1. **Maker-checker patterns in Step Functions.** How have real regulated systems (financial services, insurance, healthcare) implemented four-eyes approval at the Step Functions state-machine level? Cite specific patterns — callback tokens, `WaitForTaskToken`, human-task integrations with SQS queues seeded per role, Choice states with IAM-context guards. Which pattern most cleanly enforces "the checker must be a different principal from the maker" at the state machine itself, not at the UI?

2. **State-machine authoring style.** ASL (Amazon States Language) JSON vs CDK (`@aws-cdk/aws-stepfunctions`) vs Workflow Studio vs Pulumi vs Terraform. For a state machine that has to be **reviewable as a compliance artifact**, which authoring path produces the most auditor-legible artifact? Cite concrete examples where possible.

3. **Standard vs Express Workflows.** For a claim lifecycle that spans days (intake → assessment → approval → payment → close) with occasional long human-task waits: Standard. For high-frequency short transitions (stub webhook callbacks, assessment rule runs): Express. Where is the actual boundary, and what is the cost delta at the [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) $100/month ceiling at realistic traffic volumes?

4. **Execution history retention and export.** Step Functions retains execution history for 90 days by default. For audit-inspectable workflows, this is insufficient. What is the cleanest pattern to export execution history to the `jungle3-audit` append-only store from [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) — `GetExecutionHistory` periodic export, EventBridge on every state transition, CloudWatch Logs streaming, something else? Which pattern preserves ordering and hash-chain integrity?

5. **DLQ and retry patterns for regulated workflows.** When a transition fails inside a regulated workflow, the failure has to be visible, routable, and replayable *by name*, not by trace archaeology. What DLQ patterns (per-state SQS DLQs, a single workflow-level DLQ, Step Functions `Catch` + EventBridge, AWS Lambda destinations) give the cleanest audit and replay UX? Cite production systems.

6. **Versioning and migration.** A claim in flight when a state-machine definition changes has to continue under the old definition; new claims use the new. Step Functions versioning and aliasing was released in late 2023 — is it production-ready, and what are the known gotchas for long-running workflows (weeks-to-months)?

7. **Observability integration.** How do you tie a Step Functions execution to the `trace_id` + `case_id` dual-ID design from [ADR 0005](../../decisions/0005-event-envelope-and-correlation-identifiers.md) without losing fidelity at each Task state call? Specifically: how do downstream Lambda Task invocations inherit the trace context, and how is the CloudEvents envelope preserved across a Step Functions boundary?

8. **Cost at realistic traffic.** Given the v1 scale (~60 in-flight claims, background activity at ~2 events/second per [findings.md §5.7](../findings.md), multi-month execution durations), what is the real Step Functions line item? Separate state-transition cost from Task invocation cost from execution duration (Standard Workflows bill duration for paused executions in some cases).

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
