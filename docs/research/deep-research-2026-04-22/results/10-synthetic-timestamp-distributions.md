# Beating Plausibility Collapse: Synthetic Timestamps That Survive AWS Forensics

## Executive Summary

Jungle3's core value proposition relies on "time to real"—delivering a believable enterprise environment instantly. However, fresh-seed installs are trivially timestamp-fingerprinted by AWS control-plane metadata. CloudWatch and DynamoDB expose "minutes-old" creation times that cannot be backdated. Attempting to fake 18 months of CloudWatch logs is impossible due to hard API caps (14-day lookback limit). 

The winning strategy is to **own what you can't hide**. Accept the install recency at the infrastructure layer, but redirect realism to the domain-layer timelines and in-flight state. By using Inhomogeneous Poisson Processes (NHPP) for realistic arrival times, heavy-tailed distributions for lifecycle stages, and a cryptographically sound write-time hash chain for the audit log, Jungle3 can survive forensic inspection by its target audiences while staying well under the $100/month ADR 0007 budget.

## 1) Forensic Tells You Cannot Hide: Treat install-age metadata as visible truth

Control-plane and log metadata will reveal a new install. Fighting AWS clocks is a losing battle; use narrative and domain realism instead.

### Evidence a reviewer will actually pull

Forensic reviewers and security teams rely on immutable AWS APIs to determine resource age. CloudFormation's `DescribeStacks` API explicitly returns the `CreationTime` of the stack [1]. Similarly, DynamoDB's `DescribeTable` exposes a `CreationDateTime` attribute [2] [3]. 

For logging, CloudWatch `DescribeLogGroups` reveals `creationTime` [4], while `DescribeLogStreams` exposes `creationTime`, `firstEventTimestamp`, `lastEventTimestamp`, and `lastIngestionTime` [5]. IAM roles also betray their youth; `GetRole` returns a `CreateDate` [6], and `GetAccessKeyLastUsed` shows exactly when credentials were first utilized [7].

### Blast radius of metadata exposure

The blast radius of these immutable timestamps is absolute. An inspector can infer the install age within minutes. There is no supported AWS mechanism to backdate the creation time of a DynamoDB table, an IAM role, or a CloudWatch Log Group. 

### Playbook: Acknowledge recency, simulate history

Because infrastructure age cannot be spoofed, Jungle3 must explicitly acknowledge it in documentation and UX. The narrative must be: "This is a freshly provisioned environment pre-loaded with a synthetic historical backstory."

| Service | API/Query | High-Signal Fields | Strength of Tell | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| CloudFormation | `DescribeStacks` | `CreationTime` | High | Acknowledge in UX; do not attempt to hide. |
| CloudWatch Logs | `DescribeLogStreams` | `creationTime`, `lastIngestionTime` | High | Pre-warm only 7-14 days of logs; rely on domain data. |
| DynamoDB | `DescribeTable` | `CreationDateTime` | High | Focus realism on item-level `created_at` attributes. |
| Step Functions | `DescribeExecution` | `startDate`, `stopDate` | Medium | Seed active executions with recent start dates. |
| IAM | `GetRole` | `CreateDate` | High | Document as a security feature (fresh, isolated roles). |

*Table 1: High-signal age artifacts and queries. Infrastructure metadata provides a high-strength tell that cannot be spoofed, requiring a narrative mitigation strategy.*

## 2) Timestamp Spreading That Looks Like Operations: NHPP with calendar effects

An inhomogeneous Poisson process (NHPP) with workday, weekend, and holiday terms yields believable 18-month claim arrivals.

### Modeling arrival rates with diurnal and weekly terms

Real-world insurance claims do not arrive at a flat rate. They follow diurnal cycles (peaks during business hours), drop off on weekends, and pause on holidays. To model this, Jungle3 should use an Inhomogeneous Poisson Process where the rate parameter λ(t) varies over time. Fourier terms can effectively model these seasonal patterns by capturing cyclical behaviors through their oscillatory nature [8]. 

### Implementation via thinning algorithms

To generate these timestamps programmatically, the "thinning" algorithm is the standard approach. Candidate event times are generated at the maximal rate for the interval, and then thinned out by accepting a proportion of them based on the ratio of the instantaneous rate to the maximal rate [9]. This can be implemented efficiently in Python using libraries like `numpy` and `scipy`.

### Quality checks using time-rescaling

To validate the generated timestamps, the time-rescaling theorem can be applied. This theorem states that any point process with an integrable conditional intensity function may be transformed into a Poisson process with a unit rate [10]. By applying this transformation, Jungle3 can use standard Kolmogorov-Smirnov (K-S) tests to ensure the synthetic arrivals statistically match the target distribution [11].

## 3) Lifecycle Timing Without Tells: Heavy tails and copulas

Mixed lognormal, Weibull, and gamma distributions with shared copulas create natural stage durations and avoid "exact-gap" artifacts.

### Distributions by claim type and severity

Stage durations in claims processing (e.g., intake to assessment) are rarely normally distributed; they exhibit heavy tails. Heavy-tailed distributions such as Pareto, Lognormal, and Weibull are standard for modeling insurance claim data [12]. Complex claims will draw from the longer tail of a Weibull or Lognormal distribution, while simple claims resolve quickly.

### Correlations across workflow stages

A claim that takes unusually long to assess is also likely to take longer to approve. To model this without creating mechanical, fixed-minute gaps, Jungle3 should use Copulas. A copula is a multivariate cumulative distribution function that allows for modeling the dependence between random variables independently of their marginal distributions [13]. The Gaussian copula can be used to stitch together arbitrary marginals (like our Weibull durations) to achieve the desired correlation [14].

### Enforcing precedence with micro-jitter

To enforce the strict DAG of a claim (`created_at` < `assessed_at` < `closed_at`), durations must be sampled sequentially. To avoid forensic tells where timestamps land exactly on the second, micro-jitter (0-999 milliseconds) must be injected into every generated timestamp.

## 4) Logs: What’s Feasible to Backfill under AWS constraints

CloudWatch limits backdating; pre-warm only 7–14 days and rely on domain history elsewhere.

### PutLogEvents constraints and hard limits

AWS strictly limits historical log insertion. The `PutLogEvents` API rejects events that are older than 14 days or more than 2 hours in the future [15]. Furthermore, the time span in a single batch cannot exceed 24 hours, the maximum batch size is 1,048,576 bytes, and a batch can contain a maximum of 10,000 events [15]. 

### Patterns that maximize plausibility within limits

Because 18 months of logs cannot be backfilled, Jungle3 should only pre-warm the last 7 to 14 days of logs. This creates enough "background noise" for a demo or initial inspection. CloudWatch Logs Insights automatically discovers fields like `@timestamp` (the event time) and `@ingestionTime` (when CloudWatch received it) [16]. Reviewers will see that `@ingestionTime` is clustered at install, which must be accepted as a known limitation.

| Approach | Max Lookback | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `PutLogEvents` Backfill | 14 days | Native API, easy to implement | Hard 14-day cap, `@ingestionTime` reveals install | **Adopt** for recent 7-14 day "veneer". |
| Historical S3 Import | Unlimited | Bypasses 14-day limit | Only supports CloudTrail Event Data Stores [17] | **Reject**. Not applicable for app logs. |
| Do Nothing | 0 days | Zero cost, zero install time | Immediate plausibility collapse on log inspection | **Reject**. |

*Table 2: Log backfill options. The 14-day hard limit on PutLogEvents dictates a "thin pre-warm" strategy rather than deep historical faking.*

## 5) Audit Trail (ADR 0009) Under Backdating: Chain on write order

Use write-time sequence for `prev_hash`; include `event_time` inside the hash payload; partition chains per producer.

### Schema and hash material design

A hash chain is the successive application of a cryptographic hash function to a piece of data, used to produce a tamper-evident log [18]. Because Jungle3 backfills historical domain events at install time, the audit trail must chain based on the *write order* (when the seeder inserts them), not the *event time* (the simulated historical date). The hash payload must include `prev_hash`, `event_id`, `event_time`, `write_time`, and `payload_digest`.

### Ordering and late arrivals

By chaining on `write_time` (or a monotonic sequence number), the append-only ledger remains cryptographically sound even if the `event_time` is months in the past. This mimics real-world systems where delayed events or corrections are appended to the end of the ledger, preserving the integrity of the chain [19].

## 6) Edge Cases & Temporal Correctness: UTC and monotonic clocks

Store all times as RFC3339 UTC; simulate local-time effects only in derived views; use monotonic clocks for durations.

### Time policy and storage format

All timestamps must be stored in UTC using the ISO 8601 / RFC 3339 format [20]. Storing UTC values in timezone-aware data types (like PostgreSQL's `timestamptz`) prevents arithmetic errors across daylight saving time boundaries [21]. Timezone metadata should be stored separately on the user persona to render local times in the UI.

### Jitter bounds and clock sources

When calculating elapsed time or latencies for synthetic logs, generators should conceptually rely on monotonic clocks (like Linux's `CLOCK_MONOTONIC`) rather than real-time clocks, as monotonic clocks are immune to NTP adjustments and leap seconds [22]. 

## 7) Observability Under ADR 0007: Schemas, traces, sampling

Minimal but rich fields keep costs low and support self-audit and plausibility checks.

### Log schema and X-Ray strategy

To correlate logs and traces, every log line must include `trace_id` and `span_id`. X-Ray segments should use annotations (which are indexed for search) for business identifiers like `case_id` and `claim_type` [23]. To stay within the $100/month budget, X-Ray sampling rules should be configured with a low fixed rate (e.g., 5%) and a small reservoir (e.g., 1 request per second) [24].

## 8) Honeypot/Chaos Lessons Applied: Background noise that passes sniff tests

Avoid static patterns; add small, protocol-correct churn.

### Quick wins from deception tech

Honeypot research shows that attackers easily fingerprint systems using static banners, default configurations, and missing error handling [25]. Jungle3 must avoid "perfect" data. The generator should inject benign 4xx/5xx errors, simulate retries, and rotate actor personas. Chaos engineering principles (like those used by Gremlin or Chaos Mesh) demonstrate that injecting controlled faults (latency, minor network drops) increases the realism of the environment [26] [27].

## 9) Cost-Benefit Tiers & Default Posture: Realism within minutes

T2 (correlated lifecycles) + optional T3 (thin logs) meets demo needs under minute-scale install.

### Install time and monthly costs

Based on AWS pricing (Lambda at $0.20/1M reqs [28], Step Functions at $0.000025/transition [29], DynamoDB at $0.25/GB-month [30]), we can model the cost of 25,000 claims over 18 months.

| Tier | Features | Install Time | Monthly Cost | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| T0 | Minimal (1 write per claim) | < 1 min | ~$0.03 | Too fake. |
| T1 | Ops-seasonality (NHPP) | ~1 min | ~$0.08 | Insufficient correlation. |
| T2 | Lifecycle correlations (Copulas) | ~1.5 min | ~$0.22 | **Default for v1.** |
| T3 | Thin log pre-warm (14 days) | ~3 min | ~$0.27 | **Toggle for Sec Reviews.** |
| T4 | Synthetic Step Functions history | ~6 min | ~$0.56 | Defer past v1. |

*Table 3: Cost-benefit tiers for forensic plausibility. Tier 2 provides the best balance of domain realism and low cost, while Tier 3 can be toggled on for deeper technical scrutiny.*

## 10) Audience & Inspection Playbooks: Who checks what

Security reviewers and Marketplace focus on AWS metadata; buyers care about domain plausibility.

| Audience | Likely Checks | Must Pass Signals | Playbook Strategy |
| :--- | :--- | :--- | :--- |
| Security Reviewers | CloudTrail, IAM `CreateDate`, Log ingestion | Append-only audit integrity, proper IAM scoping | Acknowledge fresh install; provide audit verification CLI. |
| Marketplace Reviewers | CloudFormation templates, Security parameters | Template validity, least privilege | Pass `cfn-lint`; ensure no hardcoded secrets. |
| Solutions Architects | CloudWatch Logs, X-Ray traces | Trace/Log correlation, realistic latencies | T3 (Thin logs) + X-Ray sampling. |
| Business Buyers | UI, Workflow states, Claim data | Plausible dates, correlated stages | T2 (Lifecycle correlations). |

*Table 4: Audience inspection matrix. Different audiences require different levels of deception; attempting to fool security reviewers on infrastructure age is futile.*

## 11) Calibration & Validation: CI gates for "looks real"

Automate NHPP/time-series and lifecycle tests; red-team with classifiers; ship only when p-values and AUCs pass thresholds.

### Metrics and thresholds

Jungle3 must statistically verify its generators in CI. 
* **Arrivals**: Use the Kolmogorov-Smirnov (K-S) test [11] on time-rescaled arrivals; fail the build if p < 0.05.
* **Seasonality Drift**: Use the Population Stability Index (PSI). A PSI < 0.1 indicates stable distributions; PSI >= 0.25 indicates significant drift and should fail the build [31].
* **Red-Team Classifiers**: Train a Classifier Two-Sample Test (C2ST) [32] to distinguish synthetic data from proxy datasets. If the classifier achieves an AUC > 0.7, the synthetic data is too easily distinguishable and needs tuning.

## Decision-ready recommendations for Jungle3

* **Acknowledge the Install Age**: Make "install-age is visible" an explicit product posture. Add Reviewer Notes and an in-product banner stating: "This environment is freshly provisioned; data history is synthetic; logs are not backfilled beyond 14 days by AWS design."
* **Implement NHPP and Copulas**: Use an NHPP-based arrival generator with diurnal/weekly/holiday factors (seeded RNG). Sample lifecycle durations using mixed heavy-tailed distributions conditioned on claim severity, tied together with a Gaussian copula.
* **Audit Chain on Write Sequence**: Adopt an audit-chain design that chains on `write_seq` while hashing `event_time` and business identifiers inside the payload. Provide a verifier CLI.
* **Cap Log Backfill at 14 Days**: Limit CloudWatch log pre-warm to a thin 7–14 day veneer for key services. Do not attempt >14-day backfill due to `PutLogEvents` API limits.
* **Set T2 as Default**: Choose Tier T2 (seasonality + lifecycle correlations) as the v1 default. Offer T3 (thin logs) as an install-time toggle for "Security review mode." Explicitly defer T4 (synthetic Step Functions execution histories) beyond v1.
* **Implement Plausibility CI**: Block release if K-S tests fail (p<0.05), if weekday/holiday ratios drift (PSI > 0.25), or if a C2ST classifier distinguishes synthetic vs proxy data with AUC > 0.7.
* **Biggest Risk**: Investing engineering cycles in deep log backfills or execution-history fakery that AWS limits or metadata trivially disproves, leading to plausibility collapse during due diligence.

## References

1. *describe-stacks — AWS CLI 2.34.30 Command Reference*. https://docs.aws.amazon.com/cli/latest/reference/cloudformation/describe-stacks.html
2. *describe-table — AWS CLI 2.34.28 Command Reference*. https://docs.aws.amazon.com/cli/latest/reference/dynamodb/describe-table.html
3. *DescribeTable - Amazon DynamoDB*. https://docs.amazonaws.cn/en_us/amazondynamodb/latest/APIReference/API_DescribeTable.html
4. *DescribeLogGroups - Amazon CloudWatch Logs*. https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeLogGroups.html
5. *DescribeLogStreams - Amazon CloudWatch Logs*. https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeLogStreams.html
6. *GetRole - AWS Identity and Access Management*. https://docs.aws.amazon.com/IAM/latest/APIReference/API_GetRole.html
7. *GetAccessKeyLastUsed - AWS Identity and Access Management*. https://docs.aws.amazon.com/IAM/latest/APIReference/API_GetAccessKeyLastUsed.html
8. *Understanding Fourier Terms for Seasonality in Time Series Analysis*. https://python.plainenglish.io/understanding-fourier-terms-for-seasonality-in-time-series-analysis-a43b4ddbfd9e
9. *python - How to simulate a Non-Homogenous Poisson Process ...*. https://stackoverflow.com/questions/72970651/how-to-simulate-a-non-homogenous-poisson-process
10. *The Time-Rescaling Theorem and Its Application to Neural ...*. https://sites.stat.columbia.edu/liam/teaching/neurostat-fall13/papers/brown-et-al/time-rescaling.pdf
11. *1.3.5.16. Kolmogorov-Smirnov Goodness-of-Fit Test - NIST*. https://www.itl.nist.gov/div898/handbook/eda/section3/eda35g.htm
12. *Statistical Modeling of Insurance Data with Heavy-Tailed ...*. https://www.researchgate.net/publication/394598278_Statistical_Modeling_of_Insurance_Data_with_Heavy-Tailed_Distributions_Computation_of_Actuarial_Functions_through_Equilibrium_Distribution_Simulation
13. *Copula (statistics)*. https://en.wikipedia.org/wiki/Copula_(statistics)
14. *Gaussian Copula - Colab*. https://colab.research.google.com/github/tensorflow/probability/blob/main/tensorflow_probability/examples/jupyter_notebooks/Gaussian_Copula.ipynb
15. *PutLogEvents - Amazon CloudWatch Logs*. https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
16. *Supported logs and discovered fields*. https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html
17. *CreateImportTask - Amazon CloudWatch Logs*. https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateImportTask.html
18. *Hash chain*. https://en.wikipedia.org/wiki/Hash_chain
19. *Append-only ledger tables - SQL Server | Microsoft Learn*. https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-append-only-ledger-tables?view=sql-server-ver17
20. *http://datatracker.ietf.org/doc/html/rfc3339*. http://datatracker.ietf.org/doc/html/rfc3339
21. *Don't Do This - PostgreSQL wiki*. https://wiki.postgresql.org/wiki/Don't_Do_This
22. *Understanding Timekeeping and Clocks in Linux - Baeldung*. https://www.baeldung.com/linux/timekeeping-clocks
23. *Recording annotations, metadata, and user IDs - AWS X-Ray*. https://docs.aws.amazon.com/xray/latest/devguide/scorekeep-annotations.html
24. *Configuring sampling rules - AWS X-Ray*. https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html
25. *A Review of Honeypots: Fingerprinting Techniques, Detection ...*. https://www.mdpi.com/1999-5903/18/4/190
26. *Basic Features*. https://chaos-mesh.org/docs/basic-features
27. *Fault Injection > Experiments | Gremlin Docs*. https://www.gremlin.com/docs/fault-injection-experiments
28. *AWS Lambda Pricing*. https://aws.amazon.com/lambda/pricing/
29. *AWS Step Functions Pricing*. https://aws.amazon.com/step-functions/pricing/
30. *Amazon DynamoDB Pricing | NoSQL Key-Value Database | Amazon ...*. https://aws.amazon.com/dynamodb/pricing/
31. *Population Stability Index (PSI) - GeeksforGeeks*. https://www.geeksforgeeks.org/data-science/population-stability-index-psi/
32. *[1610.06545] Revisiting Classifier Two-Sample Tests - arXiv.org*. https://arxiv.org/abs/1610.06545