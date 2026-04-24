# Triangulating P&C Claims Data: Grounding Jungl3's Synthetic Environment in Empirical Reality

## Executive Summary

To prevent plausibility collapse in Jungl3's v1 P&C claims environment, synthetic data generation must be anchored in reconciled empirical benchmarks. Analysis of statutory filings and vendor data reveals stark operational realities: property claims now average 44 days to close [1], auto total loss frequencies have hit a record 23.1% [2], and up to 51% of homeowner claims close without payment [3]. Furthermore, a "lived-in" auto claim requires a median of 21 distinct communications [4]. Because vendor data (e.g., CCC, Verisk) inherently skews toward severe or litigated claims, Jungl3 must reconcile these operational metrics against NAIC statutory baselines to maintain realistic overall frequencies and cost ceilings under ADR 0007.

## Source Inventory & Reconciliation Methodology

### Balancing statutory truth against vendor severity bias

To generate defendable parameters, we must reconcile conflicting data sources. Statutory data provides the ground truth for macro frequencies, while vendor data provides the micro-operational texture required for plausibility. 

| Source Category | Key Providers | Usage in Jungl3 v1 | Access/Data Quality Constraints |
| :--- | :--- | :--- | :--- |
| **Statutory/Regulatory** | NAIC Auto Database [5], State DOIs | Baseline claim frequencies, macro outcome mixes. | High credibility, but lags by 1-2 years. Lacks operational workflow granularity. |
| **Claims Processing Vendors** | CCC Intelligent Solutions [2], Verisk [6] | Auto total loss rates, repair cycle times, property severity. | Skews severe. Vendors see claims that require their software; minor/fast-track claims are underrepresented. |
| **Workflow/Communication** | Five Sigma [4], OpsDog [7] | Artifact density (emails, notes), stage dwell times. | Highly actionable for UI realism, but represents specific customer bases rather than industry averages. |
| **Fraud/SIU** | Shift Technology [8], Coalition Against Fraud [9] | SIU referral rates, automated trigger percentages. | High credibility for anomaly rates, but definitions of "referral" vary by carrier. |
| **Consumer Satisfaction** | J.D. Power [1], Weiss Ratings [3] | End-to-end cycle times, zero-payment closure rates. | Survey-based or aggregated; excellent for identifying worst-case bottlenecks. |

**Reconciliation Method:** 
1. **Weights:** Weight NAIC data at 80% for top-level arrival frequencies. Weight vendor data (CCC, Five Sigma) at 90% for artifact density and cycle times.
2. **Recency:** Prioritize 2024-2026 data to capture post-pandemic supply chain inflation and rising litigation trends [10].
3. **Data Quality Warning:** Data regarding "partial denials" and "reopened claims" is notoriously weak across all sources, as carriers classify these differently. Jungl3 should use conservative point estimates for these edge cases.

## Defendable Claim Frequencies & Arrival Parameters

### NAIC baselines dictate 5.2% auto collision and 1.6% property water frequencies

To size the 800-policy, 18-month seed, we rely on NAIC and industry compilations to set the Non-Homogeneous Poisson Process (NHPP) lambdas.

| Claim Type | Recommended Annual Frequency (Lambda) | Source Justification |
| :--- | :--- | :--- |
| **Auto Collision** | 0.052 (5.2%) | NAIC countrywide averages [5]. |
| **Auto Comprehensive** | 0.018 (1.8%) | NAIC countrywide averages [5]. |
| **Property Water** | 0.016 (1.6%) | Industry standard (1 in 60 homes). |
| **Property Fire/Theft** | 0.008 (0.8%) | Industry standard compilations. |

## Cycle Times & Workflow Stage Dwell

### Property claims average 44 days to close, requiring heavy-tailed distributions

Cycle times have elongated significantly. J.D. Power reports an average of 44 days from FNOL to final payment for property claims [1]. Auto claims are also delayed due to repair complexity and parts shortages [10].

| Workflow Stage | Auto Dwell Time (Lognormal Median) | Property Dwell Time (Lognormal Median) | Operational Driver |
| :--- | :--- | :--- | :--- |
| **Intake/Triage** | 1 day | 1 day | Automated routing and initial FNOL capture. |
| **Awaiting Assessment** | 3 days | 7 days | Vendor/adjuster scheduling bottlenecks. |
| **In Assessment** | 5 days | 14 days | Repair complexity, calibrations [10], and spatial documentation. |
| **Pending Approval** | 2 days | 4 days | Maker-checker reviews for high-severity estimates. |
| **Payment/Closure** | 2 days | 5 days | Financial clearing and final negotiations. |

## Closed-Claim Outcomes & Financials

### Zero-payment property closures hit 40-50%, while auto total losses reach 23.1%

Outcome probabilities must diverge sharply by Line of Business (LOB). Applying a generic "70% paid" rule across all claims will trigger immediate plausibility collapse.

| Outcome Category | Auto PD Probability | Property Probability | Source / Justification |
| :--- | :--- | :--- | :--- |
| **Paid in Full / Settled** | 60% | 45% | Baseline expectation for standard claims. |
| **Total Loss** | 23.1% | 0% | CCC reports record 23.1% total loss frequency due to aging car parc [2]. |
| **Denied / Zero Payment** | 8% | 45% | Weiss Ratings shows 14 large insurers closed 40-51% of homeowner claims with no payment [3]. |
| **Subrogated** | 6% | 2% | Higher in auto due to multi-vehicle fault assignment. |
| **Withdrawn / Reopened** | 2.9% | 8% | Edge cases and appeals. |

## Artifact Density & Anomaly Rates

### Median auto claims require 21 communications and a 2% SIU referral rate

To make claims look "lived-in" without blowing up the ADR 0007 DynamoDB/CloudWatch budget, artifact generation must be tightly bounded.

| Artifact / Anomaly | Recommended Target | Source / Justification |
| :--- | :--- | :--- |
| **Communications (Emails/Calls)** | Median 21 (Auto), 16 (Home) | Five Sigma benchmarking [4]. |
| **SIU Referral Rate** | 2% | Shift Technology / Coalition Against Fraud (1-3% range) [8]. |
| **Automated SIU Referrals** | 45% of all SIU flags | Coalition Against Fraud notes 45% of referrals are now automated [9]. |
| **Supervisor Escalation** | 10% | Standard operational maker-checker thresholds. |

## Sensitivity, Geography, and Replication

### Adjusting parameters for auto-heavy vs. homeowners-heavy books

The parameters above assume a standard mid-latitude US book. 
* **Geography Sensitivity:** If simulating a coastal/Florida book, property denial rates should be pushed to the 51% upper bound [3], and storm-surge multipliers must be injected into the NHPP.
* **Replication Instructions:** To update these parameters in the future, operators should query the annual NAIC Auto Insurance Database Report for frequency shifts, and the annual CCC Crash Course report for total loss and severity updates.

## Decision-ready recommendations for Jungl3

* **Implement LOB-specific outcome routing:** Hardcode the Step Functions to force a 23.1% total loss rate for auto claims and a 45% zero-payment/denial rate for property claims to match 2024-2026 realities.
* **Cap artifact generation:** Constrain the data seeder to generate a median of 21 communications per auto claim [4] to maintain realism while strictly adhering to the ADR 0007 $100/month infrastructure cap.
* **Set SIU triggers at 2%:** Configure the `claim-workflow` service to flag exactly 2% of claims for SIU review, ensuring reviewers find anomalies within 5 minutes without over-saturating the system.
* **Defer regional localization:** Explicitly defer state-specific regulatory timelines and localized weather seasonality past v1; use the generic US mid-latitude blended averages provided above.
* **Biggest Risk:** Using generic, blended cycle times across both auto and property will cause immediate plausibility collapse; property claims *must* dwell longer (averaging 44 days) than auto claims.
* **Cross-links:** These parameters directly dictate the state-machine transition probabilities in **ADR 0008** and the storage sizing calculations required for **ADR 0007** and **ADR 0009**.

## References

1. *Homeowners Repair Cycle Length Reaches All-Time High*. https://www.iamagazine.com/news/homeowners-repair-cycle-length-reaches-all-time-high/
2. *CCC Crash Course 2026 Report Finds Higher Severity and Record Total Loss Frequency - CCCIS*. https://www.cccis.com/news-and-insights/posts/ccc-crash-course-2026-report-finds-higher-severity-and-record-total-loss-frequency
3. *14 Large U.S. Insurers Closed Nearly Half of Homeowner Claims ...*. https://weissratings.com/en/weiss-news/14-large-u-s-insurers-closed-nearly-half-of-homeowner-claims-with-no-payment-in-2024
4. *Simplify With an Omnichannel Communication Hub | Five Sigma*. https://fivesigmalabs.com/blog/simplify-your-claim-management-with-an-omni/
5. *2022/2023 Auto Insurance Database Report*. https://content.naic.org/sites/default/files/publication-aut-pb-auto-insurance-database.pdf
6. *ClaimSearch® Trends - Year-end Analysis - Verisk*. https://www.verisk.com/496d93/siteassets/media/campaigns/gated/claims/claimsearch-trends-report-2025-year-end-analysis.pdf
7. *P&C Claim Settlement Cycle Time Definition & Benchmark*. https://opsdog.com/products/cycle-time-claims-settlement
8. *SHIFT TECHNOLOGY*. https://8595762.fs1.hubspotusercontent-na1.net/hubfs/8595762/Shift%20Technology%20Insurance%20Perspectives/Shift%20Technology%20Insurance%20Perspectives%202023%20SIU%20Claims%20Fraud%20Benchmark%20Report.pdf
9. *insurancefraud.org*. https://insurancefraud.org/wp-content/uploads/2024-Insurer-SIU-Benchmarking-Study.pdf
10. *Auto Claims Severity Rises as Total Loss Frequency Hits ...*. https://www.claimspages.com/news/auto-claims-severity-rises-as-total-loss-frequency-hits-record-23-percent-ccc-finds-20260413