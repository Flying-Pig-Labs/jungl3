# Topic 4: Realistic event and workflow-stage distributions in P&C claims

See `00-context.md` for product framing. [findings.md §5.7](../findings.md) commits to a hybrid simulation loop (deterministic golden paths + stochastic background) and names specific distributions (nonhomogeneous Poisson arrivals, lognormal-Pareto service times). [findings.md §8](../findings.md) commits to seeded state with ~800 policyholders, ~60 in-flight claims, ~1,800 historical closed claims over 18 months. This topic is about grounding those numbers in empirical data so the v1 install *looks* empirical under close inspection.

## Research questions

1. **Claim arrival distributions.** For a mid-sized regional P&C carrier, what is the real hourly/daily/weekly arrival rate of new claims by type (auto collision, auto comp, property theft, property water, property fire, disability)? Cite NAIC data, state DOI filings, academic insurance data sets, published carrier annual reports. Give concrete rate parameters for a nonhomogeneous Poisson process that would match.

2. **Workflow-stage distribution for in-flight claims.** At any given moment, across all open claims at a real carrier, what fraction are in each workflow stage? (intake, awaiting assessment, in assessment, pending approval, approved-awaiting-payment, in payment, escalated, on-hold-for-SIU). Cite sources. This drives the v1 seeded-state distribution for the 60 in-flight claims.

3. **Claim-to-close timing.** Distribution of time-to-close by claim type and severity. Many claims close in days; some span months (SIU-flagged, high-value, litigation). What distribution (lognormal, Pareto, mixture) actually fits? Cite published claims-aging studies or insurance industry data.

4. **Closed-claim outcome mix.** Of closed claims: what fraction are paid in full, paid partial, denied-and-not-reopened, denied-and-reopened, withdrawn by claimant, subrogated, totaled? Cite industry proportions.

5. **Document and communication volumes.** Per claim, what is the typical number of notes from the adjuster, emails to the claimant, photos attached, phone-call log entries? This is what makes a seeded claim look lived-in rather than synthetic. Cite operational benchmarks where possible.

6. **Seasonality.** Real P&C claim arrivals are seasonal (property claims spike in storm season, auto claims have post-holiday and bad-weather patterns). What seasonality coefficients should the install's seeded 18-month history include? The numbers don't have to be precisely 2024–2026 actuals, but they should match *shape*.

7. **Anomaly frequency.** What fraction of claims have at least one "interesting" event (re-assignment, supervisor intervention, SIU referral, DLQ hit, payment reversal)? Operators inspecting the demo install should find one of these within a few minutes of random browsing; they shouldn't be so common they dominate.

8. **Event-per-claim distribution.** How many audit-trail-worthy events does a typical claim accumulate from submission to close? Separate median from long-tail. This is a sizing input for the audit-service hash-chain load and the [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) cost model.

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
