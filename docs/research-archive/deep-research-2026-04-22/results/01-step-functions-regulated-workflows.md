# Jungl3 Deep-Research Report: Data Retention and Archival Strategy

## Executive Summary

* **[OVERCOMING THE 90-DAY LIMIT]**: AWS Step Functions enforces a hard 90-day retention limit on Standard workflow execution history [1], [2]. To meet enterprise audit requirements, Jungl3 must explicitly configure Step Functions to stream execution history to CloudWatch Logs [3], [4].
* **[COST-AWARE LOG EXPORT]**: CloudWatch Logs ingestion is expensive at $0.50 per GB [5], [6]. To stay under the ADR 0007 $100/month ceiling, Jungl3 must implement a strict 7-day retention policy in CloudWatch, paired with automated exports to Amazon S3 [7], [8], followed by lifecycle transitions to Glacier Deep Archive [9].
* **[DYNAMODB DATA LIFECYCLE]**: Operational, non-audit DynamoDB data must utilize Time to Live (TTL) for automatic, zero-capacity-cost expiration [10]. Conversely, the `jungle3-audit` table must remain strictly append-only and hash-chained to guarantee cryptographic immutability [11], [12].
* **[BUDGET VIABILITY]**: Cost projections indicate that a "Medium" scale deployment (5GB logs/month, 5GB operational data, growing audit table) will cost approximately $99.02 over 24 months for storage and retention, safely fitting within the $100/month infrastructure ceiling.

## CloudWatch Logs and Step Functions History Retention

### Overcoming the 90-Day Step Functions Limit
By default, AWS Step Functions retains the execution history for Standard workflows for exactly 90 days after an execution closes, after which the data is permanently deleted [1], [2]. This is a hard service quota [13]. Furthermore, Express workflows do not record execution history natively at all [3], [2]. 

To ensure long-term auditability and plausibility for enterprise customers, Jungl3 cannot rely on the native Step Functions console for historical data. Instead, all state machines must be configured to log their execution history directly to Amazon CloudWatch Logs [3], [4]. This provides a unified, queryable log stream for both Standard and Express workflows.

### CloudWatch to S3 Export Pipeline
While CloudWatch Logs is excellent for immediate operational querying via Logs Insights, it is not cost-effective for long-term storage. CloudWatch ingestion costs $0.50 per GB [5], [6], and standard storage costs accumulate quickly. 

Jungl3 must implement a short retention window (e.g., 7 days) on the CloudWatch Log Groups. Before the logs expire, an automated process (such as an EventBridge scheduled rule triggering a Lambda function) must use the `CreateExportTask` API to export the log data to an Amazon S3 bucket [7], [14], [8]. This approach drastically reduces storage costs while preserving the data for compliance purposes.

## DynamoDB Data Lifecycle and Audit Immutability

### TTL for Non-Audit Operational Data
For standard operational data (e.g., temporary claim states, idempotency tokens, or session data), Jungl3 should leverage DynamoDB's Time to Live (TTL) feature. TTL allows you to define a per-item expiration timestamp; DynamoDB automatically deletes expired items without consuming any Write Capacity Units (WCUs) [10]. This is critical for maintaining a lean database footprint and avoiding unnecessary storage costs ($0.25 per GB-month for Standard storage) [15].

### Preserving the Immutable Audit Chain
In stark contrast to operational data, the `jungle3-audit` table (defined in ADR 0009) must never use TTL. This table serves as the cryptographic source of truth. It must be strictly append-only, utilizing hash-chaining to ensure that any tampering is mathematically detectable [11], [12]. 

To verify the integrity of this chain without incurring massive read costs, Jungl3 should provide an operator runbook or a lightweight Lambda utility that can sequentially query the table by `case_id` and recompute the SHA-256 hashes to validate the `prev_hash` links.

## S3 Lifecycle and Glacier Deep Archive Strategy

### Long-Term Archival Tiers
Once execution history and application logs are exported to Amazon S3, they should not remain in the S3 Standard storage class indefinitely. Jungl3 must configure S3 Lifecycle rules to automatically transition older objects to colder, cheaper storage tiers [9].

For compliance data that is rarely accessed but must be retained for years, S3 Glacier Deep Archive is the optimal target. While S3 Standard costs roughly $0.023 per GB-month, Glacier Deep Archive drops this cost to approximately $0.00099 per GB-month. A standard lifecycle rule should transition logs from S3 Standard to Glacier Deep Archive 30 days after the export date.

## 12-to-24-Month Cost Projections

### Sustaining the $100/Month Ceiling
To validate that this retention strategy aligns with the ADR 0007 infrastructure cost ceiling of $100/month, we modeled three traffic scenarios over a 24-month period. The model assumes a 7-day CloudWatch retention, monthly S3 exports, and a continuously growing DynamoDB audit table.

| Scenario | Monthly Log Ingest | Operational DDB Storage | Audit Table Growth | 12-Month Cumulative Cost | 24-Month Cumulative Cost | Budget Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Low** | 1 GB | 1 GB | +0.05 GB/month | ~$11.52 | ~$23.04 | **Safe** |
| **Medium** | 5 GB | 5 GB | +0.05 GB/month | ~$49.51 | ~$99.02 | **Safe** |
| **High** | 20 GB | 20 GB | +0.05 GB/month | ~$191.95 | ~$383.91 | **Violates Ceiling** |

*Takeaway: The "Medium" scenario (5GB of logs and 5GB of operational data) scales perfectly within the $100/month ceiling over two years. However, if a customer generates 20GB of logs monthly, the ingestion and storage costs will breach the ADR 0007 limit, necessitating aggressive log sampling or a budget exception.*

## Decision-ready recommendations for Jungl3

* **Configure Step Functions to log to CloudWatch:** Explicitly enable CloudWatch logging for all state machines to bypass the native 90-day execution history limit.
* **Implement aggressive CloudWatch retention:** Set CloudWatch Log Group retention to 7 days to minimize storage costs, paired with a weekly automated export task to Amazon S3.
* **Enforce S3 Lifecycle rules:** Configure the destination S3 bucket to transition exported logs to S3 Glacier Deep Archive after 30 days for ultra-low-cost, long-term compliance storage.
* **Apply DynamoDB TTL to operational data:** Use TTL on all non-audit DynamoDB tables to automatically purge stale data without consuming write capacity.
* **Protect the `jungle3-audit` table:** Explicitly disable TTL on the audit table and restrict IAM permissions to prevent any `UpdateItem` or `DeleteItem` operations, ensuring the hash-chain remains immutable.
* **Defer past v1:** Do not build a custom UI for querying Glacier Deep Archive logs; rely on standard AWS operator tools (e.g., Athena or S3 Select) for v1 compliance audits.
* **Single biggest risk:** If CloudWatch Log retention is left at the default (Never Expire) without S3 exports, the $0.03/GB-month storage cost will compound continuously, eventually breaching the $100/month infrastructure ceiling and causing a budget-driven plausibility collapse.
* **Cross-links:** This strategy directly supports the observability constraints in ADR 0007 and the audit immutability requirements in ADR 0009.

## References

1. *Step Functions service quotas - AWS Documentation*. https://docs.aws.amazon.com/step-functions/latest/dg/service-quotas.html
2. *typescript - How Do I Set A TTL Of Step Function Executions ...*. https://stackoverflow.com/questions/75470667/how-do-i-set-a-ttl-of-step-function-executions
3. *AWS Step Functions Logging and Observability - Developer Guide*. https://www.amazon.com/step-functions/latest/dg/cw-logs.html
4. *Using CloudWatch Logs to log execution history in Step ...*. https://docs.aws.amazon.com/step-functions/latest/dg/cw-logs.html
5. *https://www.amazon.com/cloudwatch/pricing*. https://www.amazon.com/cloudwatch/pricing
6. *CloudWatch Logs pricing: ingestion, retention, and queries*. https://cloudcostkit.com/guides/aws-cloudwatch-logs-pricing/
7. *Exporting log data to Amazon S3 - Amazon CloudWatch Logs*. https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/S3Export.html
8. *How to Export CloudWatch Logs to S3*. https://oneuptime.com/blog/post/2026-02-12-export-cloudwatch-logs-s3/view
9. *https://www.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html*. https://www.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html
10. *Using time to live (TTL) in DynamoDB*. https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html
11. *Building an Append-Only Ledger in NoSQL | by Ahmed Waseem ...*. https://ahmed-waseem.medium.com/building-an-append-only-ledger-in-nosql-caebd3786193
12. *Hash Chains Explained: How Cryptographic Integrity Works*. https://hyrelog.com/blog/hash-chains-explained
13. *Retrieve or store AWS Step function Execution history older ...*. https://repost.aws/questions/QUAI3EztFATuiADOEyTPTU0A/retrieve-or-store-aws-step-function-execution-history-older-than-90-days
14. *CreateExportTask - Amazon CloudWatch Logs*. https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateExportTask.html
15. *Amazon DynamoDB Pricing | NoSQL Key-Value Database | Amazon ...*. https://aws.amazon.com/dynamodb/pricing/