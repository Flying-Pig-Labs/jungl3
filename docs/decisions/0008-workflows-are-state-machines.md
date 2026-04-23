# 0008 — Workflows are state machines, not event chains

**Status:** Accepted
**Date:** 2026-04-22

## Context

Business processes inside the v1 [Understory](../glossary.md#understory) can be built two ways, and the choice has large downstream consequences.

**The anti-pattern** the research cluster warned against (reports 05, 06, 10, 11 — see [findings.md §5.3](../research/findings.md#5.3-workflows-are-stateful-state-machines-not-chains-of-lambdas)) is an *event-chain architecture*: Lambda A writes to SQS, which triggers Lambda B, which writes to SQS, which triggers Lambda C. The workflow is implicit in the deployment topology and can only be reconstructed by reading the code. There is no single artifact called "the claim lifecycle"; there is only the set of Lambdas and the messages they happen to produce.

**The alternative** is to make the workflow an *artifact*: a declarative state machine where states are named, transitions are explicit, retries and timeouts are configured declaratively, and failures route to named dead-letter queues.

Two downstream consequences ride on this choice:

1. **Admin agent tractability.** [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md) commits to an LLM agent answering operator questions via deterministic tools. One of the tools is "fetch the execution history for case X." If workflows are state machines in AWS Step Functions, that tool is one API call (`GetExecutionHistory`). If workflows are event chains, the tool becomes archaeology across X-Ray traces, CloudWatch logs, and DynamoDB reads — too fragile and slow for interactive use.
2. **Maker-checker enforcement.** [findings.md §5.4](../research/findings.md#5.4-maker-checker-four-eyes-is-the-single-highest-signal-regulated-cue) requires that approval gates be enforced at the state machine itself, not at the UI. In a state-machine architecture that enforcement is a guard on a transition. In an event-chain architecture it is a conditional branch somewhere inside a Lambda that the next auditor has to find and trust.

The cluster's convergence on this point was uncontested. This ADR pins it.

## Decision

**Every business process in the v1 Understory that spans more than one service call or crosses an async boundary is implemented as an AWS Step Functions state machine.**

Concretely:

- `claim-workflow` ([ADR 0006](./0006-v1-domain-anchor-insurance-claims.md)) is a Step Functions state machine owning the claim lifecycle. States are named (`intake`, `in_assessment`, `pending_approval`, `approved`, `rejected`, `paid`, `closed`, `escalated`, etc.). Transitions are explicit.
- `assessment-service` long-running assessments (damage assessment, SIU triage) are Step Functions state machines.
- `payment-service` settlement issuance, including the maker-checker approval gate for high-value payments, is a Step Functions state machine.
- The maker-checker transition specifically is enforced at the state-machine level: the state machine refuses to transition from `pending_approval` to `approved` unless the invoking identity has the checker role and is a different principal from the identity that put the case in `pending_approval`. Bypassing the UI does not help; the guard is in the workflow, not in the client.

Single-service, synchronous handlers (e.g. `policy-service` reads) are not workflows and do not need Step Functions.

Every Step Functions execution carries the `case_id` and `trace_id` ([ADR 0005](./0005-event-envelope-and-correlation-identifiers.md)) as input and propagates both into every Task state's downstream calls.

## Consequences

**Enables:**

- The admin-agent tool `stepfunctions_get_execution_history(case_id)` is a real tool, not archaeology. Operators asking "what happened to claim X?" get a deterministic, complete answer.
- Maker-checker is enforceable at a place an auditor can point to: a guard on a named transition, in a state machine definition that is itself a reviewable artifact.
- Retries, timeouts, and DLQ routing are declarative in the state machine definition, not scattered across Lambda handlers.
- The state machine is the workflow artifact. A new operator can read the JSON/ASL definition and understand the claim lifecycle in minutes, rather than reading the topology.
- Dead-letter routing is explicit per transition. Failure cases are legible.

**Forecloses:**

- Implementing any multi-step business process as a chain of event-triggered Lambdas. If a process crosses an async boundary, it's a state machine.
- Enforcing maker-checker or other compliance gates anywhere except at the state-machine level. UI-only enforcement is rejected.
- Alternate orchestrators in v1 (SWF, custom DynamoDB-based workflow engines, imperative Lambda chains labeled as "workflows"). Step Functions is the substrate.

**Accepts:**

- Step Functions state transition cost. At default-realism traffic volumes this is within the [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md) $100/month infra ceiling, but it is a real line item and must be monitored. Standard Workflows are the default; Express Workflows are used for high-frequency short-lived cases only.
- A Step Functions state machine is harder to author than a Lambda chain for the first workflow. The tooling tax is real; the payoff is in operability, not in first-hour velocity.
- The state machine definition is itself an artifact that has to be maintained. Schema changes to a workflow require versioning discipline. This is a net win for audit and operability, but it is not free.
- Some patterns (long-running human-task queues spanning days) require Step Functions callback patterns or external task tokens; these are more elaborate than a naive in-memory state loop. The elaboration is the cost of making the workflow inspectable.

## Alternatives considered

- **Event-chain architecture (Lambdas wired by SQS/EventBridge).** Cheapest first-line-of-code. Rejected — implicit workflow, no artifact to review, maker-checker unenforceable at the right layer, admin-agent tool becomes archaeology. The research cluster was uncontested on this.
- **A custom DynamoDB-based workflow engine.** More control, no Step Functions dependency. Rejected — reinventing an AWS-native primitive, and the engine itself becomes a service Jungl3 owns forever.
- **AWS SWF (Simple Workflow Service).** Older AWS workflow service. Rejected — deprecated in practice, poorer tooling, no modern reason to prefer over Step Functions.
- **Temporal or other third-party orchestrators.** Richer workflow semantics, often better DX. Rejected for v1 — adds a non-AWS dependency to an AWS-native install model ([ADR 0003](./0003-installable-via-aws-marketplace.md)), adds cost, and Step Functions is sufficient for the v1 workload. Revisit if v1's workflows grow beyond what Step Functions serves well.
- **Step Functions only for long-running workflows, event chains for short ones.** Hybrid. Rejected — the distinction is fuzzy, and the argument for artifact-based workflows applies equally to short ones. Uniform rule is easier to enforce and easier to teach.
