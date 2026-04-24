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

# Topic 2: DynamoDB append-only hash-chained audit design

See `00-context.md` for product framing. [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) commits to a single DynamoDB table (`jungle3-audit`) as the append-only hash-chained audit store. This topic is about getting the data model, IAM surface, and operational patterns right.

## Research questions

1. **Schema concretely.** Propose a concrete DynamoDB schema: partition key, sort key, attribute list, GSIs needed for the admin agent's query patterns (per-case reads, per-actor reads, per-event-type reads, time-range reads). Include byte-level estimates of a typical record size for an insurance-claims domain event. What pagination and DynamoDB limits (400KB item, 1MB query page) actually bite at realistic scale?

2. **Hash-chain correctness.** The canonical hash input is "SHA-256 of the immediately-preceding record for the same `case_id`." What exactly is canonicalized (field ordering, timestamp format, nested object serialization)? Survey real implementations — QLDB's journal, Certificate Transparency logs, Trillian, AWS's own blog posts on DynamoDB ledger patterns. Cite the gotchas: JSON canonicalization instability, timestamp timezone drift, nested-map key ordering.

3. **Write-path concurrency.** Two events for the same `case_id` arrive at `audit-service` milliseconds apart. Both try to read "the last record" to compute `prev_hash`. Both try to `PutItem` with the same sequence number. Give the full resolution pattern — DynamoDB conditional write semantics, retry-with-backoff, idempotency keys, poison-message handling. How does this behave when a service emits bursts of events for a single case during a Step Functions fan-out?

4. **IAM and tamper resistance.** ADR 0009 says the table denies `UpdateItem` and `DeleteItem` for every principal. What is the cleanest way to enforce this — resource policy, SCP, IAM conditions, AWS Backup with PITR? What attack vectors survive this (root credentials, AWS support console, DynamoDB table-level delete)? What additional AWS-native controls (AWS Config rules, CloudTrail integrity validation, KMS key rotation) close those gaps?

5. **Verification performance.** The `verify_chain(case_id)` admin-agent tool re-hashes the chain. For a case with 200 audit records (a representative high-touch claim), how long does a full chain verification take — including DynamoDB read, hash computation, comparison? What's a realistic latency target before verification becomes operationally unusable?

6. **Archive to Glacier.** ADR 0009 offers Glacier archive as an install-config option. Survey patterns: DynamoDB Streams → Firehose → S3 → Glacier transition, scheduled Lambda exports, AWS Backup cold storage. Which preserves chain verifiability after archive? What is the cost profile?

7. **Compared with QLDB.** Amazon QLDB offers cryptographic verifiability natively. ADR 0009 rejects it for v1 on cost and dependency grounds. Pressure-test that: what does QLDB actually cost at v1 scale in 2026, and is there a threshold (record count, customer regulatory requirement) beyond which QLDB genuinely becomes the right answer?

8. **Data model for maker-checker audit entries.** A maker-checker transition produces two audit records. What fields make the two-identity pair inspectable and diff-able? How does the admin agent render this to an operator asking "show me the approval trail for claim X"?

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
