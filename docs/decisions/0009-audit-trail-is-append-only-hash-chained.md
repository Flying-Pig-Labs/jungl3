# 0009 — Audit trail is a separate append-only hash-chained store

**Status:** Accepted
**Date:** 2026-04-22

## Context

The v1 [Understory](../glossary.md#understory) needs an audit trail that survives close inspection. Two converging pressures force its shape.

**Regulatory realism.** The domain anchor is insurance claims processing ([ADR 0006](./0006-v1-domain-anchor-insurance-claims.md)). Every regulated-feel cue in the research cluster — maker-checker, role separation, reviewable workflow history — assumes an audit trail that a state-DOI auditor could plausibly inspect. A trail that can be quietly rewritten by the service that emits it is the trail pattern of a demo, not a regulated system. [findings.md §5.4](../research/findings.md#5.4-maker-checker-four-eyes-is-the-single-highest-signal-regulated-cue) and report 11 are emphatic: audit-trail tamper-evidence is the thing that lets everything else feel real.

**LLM containment.** [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md) puts an LLM agent at the center of the admin surface. The integrity argument for that design rests on one property: the agent cannot invent facts about system state. Every claim it makes is cited to a tool invocation. For that property to hold, the tool output itself has to be authoritative — meaning the audit trail has to be the source of truth and has to be a place the LLM reads from but never writes to.

**What the audit trail is not.** It is not CloudWatch Logs. Logs are high-volume, noisy, and have 7-day default retention per [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md). Logs record *what happened in the distributed system*; the audit trail records *what happened to each case*, permanently, in a shape an auditor would recognize. Different retention, different integrity guarantees, different access patterns, different store.

[findings.md §6.5 item 7](../research/findings.md#6.5-microservice-count--resolved-7) names `audit-service` as one of the seven v1 services specifically so this separation is structural, not a convention.

## Decision

**The audit trail is a separate DynamoDB table, append-only at the application layer, with hash-chained tamper-evidence, owned by the `audit-service`.**

Concretely:

- **One DynamoDB table, `jungle3-audit`.** Partition key is `case_id` ([ADR 0005](./0005-event-envelope-and-correlation-identifiers.md)). Sort key is a monotonically increasing sequence number scoped to the case.
- **Every record is immutable.** The `audit-service` writes new records; it never updates or deletes. IAM policy on the table denies `UpdateItem` and `DeleteItem` for every principal including the service's own write role.
- **Every record carries a `prev_hash` field** — a SHA-256 of the canonical JSON serialization of the immediately preceding record for the same `case_id`. The first record in a case has `prev_hash` set to the all-zeros digest.
- **Every record also carries `trace_id`, `case_id`, event `type` (per [ADR 0005](./0005-event-envelope-and-correlation-identifiers.md)), timestamp, actor identity, and the canonical event body.**
- **`audit-service` subscribes to every domain event** emitted by every service. Subscription is declarative (an EventBridge rule that targets the audit-service ingest Lambda). A service that emits a domain event has by definition caused an audit record; the emitter does not write to the audit table directly.
- **Maker-checker transitions emit two audit records:** one for the maker's proposal (state change to `pending_approval`) and one for the checker's approval or rejection. Both carry the respective actor identity. The state-machine guard in [ADR 0008](./0008-workflows-are-state-machines.md) is what ensures these are different identities; the audit trail is what makes that fact inspectable after the fact.
- **Retention is unlimited by default.** Customers can archive to S3 Glacier via an install-config option; the default keeps the trail live in DynamoDB. This is distinct from the 7-day log retention default in [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md).
- **Verification tool.** `audit-service` exposes a `verify_chain(case_id)` tool that re-hashes the chain and confirms integrity. This is one of the admin-agent tools in [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md).

The `audit-service` is the only writer. No other service has IAM permission to write to `jungle3-audit`. The admin agent has read-only access via its tools; nothing — including the LLM gateway — has write access.

## Consequences

**Enables:**

- An operator, an auditor, or the admin agent can reconstruct the complete history of any case by reading the audit trail end to end.
- Tamper evidence is verifiable: re-hashing the chain shows whether any record has been altered or any record is missing.
- The maker-checker property in [findings.md §5.4](../research/findings.md#5.4-maker-checker-four-eyes-is-the-single-highest-signal-regulated-cue) is inspectable after the fact — not just enforced at the transition, but visible in the audit record's two-identity pair.
- The LLM admin agent's integrity argument holds. The LLM reads from `audit-service` tools; it cannot write. A customer auditor can verify that the agent has not and cannot mutate the trail.
- Retention for audit is independent of retention for logs. The [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md) 7-day log default doesn't force audit compromises.
- Archive-to-Glacier is available for customers whose compliance posture needs it, without making it the default.

**Forecloses:**

- Using CloudWatch Logs as the audit trail. Logs remain operational observability; audit is separate.
- Any service writing its own audit records directly. Domain events are the mechanism; `audit-service` subscribes.
- `UpdateItem` / `DeleteItem` on the audit table. If the data model needs to change, the migration writes new records documenting the correction, not edits to historical records.
- LLM agents writing to the audit trail. This is architectural, not just policy — the LLM gateway has no IAM path to the table.

**Accepts:**

- DynamoDB storage cost for an unbounded-retention table. At the v1 scale this is negligible (18 months of history for ~1,800 closed claims is small), but it grows with install age. Customers who want to cap storage use the Glacier-archive option.
- Hash-chain maintenance adds a small write-path latency: the audit-service ingest Lambda has to read the last record for the case before writing the new one. In practice this is one DynamoDB query plus one `PutItem`, a few milliseconds on the hot path.
- Sequence numbers scoped per-case mean concurrent writes for the same case must serialize at the audit-service. `audit-service` uses a DynamoDB conditional write on sequence number to reject duplicates and retry. Contention per case is low (events are ordered by the workflow state machine), so this is tolerable.
- Hash-chain verification is O(n) per case. The `verify_chain` tool is not free for long-lived cases; a customer running it across all cases as a batch is a real operation that has cost.
- This trail is not cryptographic notary grade. A motivated adversary with write access to DynamoDB directly (at the AWS API level, bypassing the service) can rewrite history and recompute hashes. The tamper-evidence is at the application layer; the *root* defense is IAM policy on the table. Customers who need notary-grade evidence need a separate solution (e.g. QLDB, a blockchain-backed ledger); v1 does not claim that property.

## Alternatives considered

- **Single audit log in CloudWatch Logs.** Free-ish, no new service. Rejected — log retention is wrong, tamper-evidence is absent, and the admin-agent integrity argument collapses because the agent's read path is the same service that writes the logs.
- **Amazon QLDB.** Purpose-built for immutable cryptographically-verifiable ledgers. Rejected for v1 — adds a service Jungle3 doesn't currently use, its pricing model is less predictable for the [ADR 0007](./0007-v1-cost-profile-and-llm-metering.md) cost ceiling, and DynamoDB with a hash-chain covers the application-layer property well enough. Revisit if a customer genuinely needs notary-grade.
- **Per-service audit tables.** Each service owns its slice. Rejected — fragments the per-case view, violates the "one audit trail" mental model operators expect, and makes the admin-agent tool fan out across N tables.
- **Write the audit record inside each service's handler.** No audit-service. Rejected — couples every service to audit-table IAM, and a buggy service could skip writes or write out-of-order records. Subscription decouples; the emitter's only job is to emit the event.
- **Allow the LLM admin agent to write corrections ("note: this event was a false positive").** Convenient UX. Rejected — ends the integrity argument. Corrections, when needed, come through the state machine emitting a new event ("claim reopened with note"), which creates a new audit record, leaving the original untouched.
- **Unlimited retention for everything including failed/cancelled transient events.** Simpler rule. Rejected in favor of "unlimited retention for audit records; limited retention for logs." The audit-service subscribes to domain events specifically; noise stays in logs.
