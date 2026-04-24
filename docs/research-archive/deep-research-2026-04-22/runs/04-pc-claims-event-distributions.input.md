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
