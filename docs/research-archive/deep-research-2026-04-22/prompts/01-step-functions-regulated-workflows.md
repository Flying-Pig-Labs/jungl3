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
