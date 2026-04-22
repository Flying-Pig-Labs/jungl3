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

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
