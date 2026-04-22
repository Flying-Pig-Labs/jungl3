# Research context (cluster 2026-04-22)

You are producing a deep-research report for **Jungle3** (stylized `jungl3`), a product with the following characteristics.

## What Jungle3 is

Jungle3 generates, deploys, and vends pre-built, integrated, "Understory" enterprise applications so product teams can start from a living, working system rather than from a blank page. Teams shape the generated system — subtracting what doesn't belong, substituting components, adding where the baseline stops — into their real product.

Key properties:

- Distributed as an **AWS Marketplace** listing. Customers subscribe, launch a CloudFormation template into their own AWS account, and operate their own Jungle3 instance entirely inside that account. There is no hosted multi-tenant SaaS version of Jungle3 itself.
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

Jungle3 engineering leadership. They want **actionable, decision-ready findings** that move the ADRs above from "decided" to "buildable" — concrete recommendations, real numbers, named failure modes, and named trade-offs. Assume they are technically sophisticated and have already read the ADRs. Prefer opinionated synthesis over neutral hedging. Cite named systems, companies, open-source projects, and specifications where useful.

## What this cluster is for

ADRs 0005–0009 are decisions. Now they have to be built. This cluster is about the **next layer of detail** — the specific data models, numeric distributions, library choices, calibration plans, and edge cases that each ADR exposed as still-unknown.

Do not re-argue the ADRs. They are settled. Accept their framing and go deeper.

## Output expectations for every research task

Every deep-research report should end with a section titled **"Decision-ready recommendations for Jungle3"** that states, in 5–10 bullets:

- What Jungle3 should do in the next implementation step for this topic.
- What Jungle3 should explicitly defer past v1.
- The single biggest risk if Jungle3 ignores this topic.
- Any cross-links to the other 9 topics in this cluster where this one has knock-on effects.

Treat this as a genuine advisory document. Be direct. Cite real systems, real pricing, real code where possible. It is better to be sharply opinionated and wrong in a named way than to be vaguely comprehensive.


---

# Topic 9: P&C insurance regulated cues beyond maker-checker

See `00-context.md` for product framing. [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md) picks P&C insurance claims as the v1 domain. [findings.md §5.4](../findings.md) treats maker-checker as the highest-signal regulated cue. This topic is about everything *else* a domain-expert reviewer from the insurance industry would look for — and notice missing.

## Research questions

1. **Regulatory surface, concretely.** What state and federal regulations apply to P&C claims operations that a domain-expert reviewer would expect to see reflected in a working system? NAIC Model Acts, state Unfair Claims Settlement Practices Acts, state DOI market-conduct exam protocols, Gramm-Leach-Bliley for data, CFPB for mortgage-property overlap. Which of these have concrete system-visible requirements (audit fields, retention rules, notice requirements, timing constraints)?

2. **Timing-based requirements.** Many states have specific acknowledge-within-N-days, respond-within-N-days, pay-within-N-days rules. What are the most commonly-enforced timing rules across major states (CA, TX, FL, NY), and how are they reflected in a real claims system (SLA timers on cases, escalation rules, automated notices)?

3. **Reserve-setting and reserve-adjustment patterns.** Reserves are the money set aside for a claim's eventual payout. They adjust over time as information develops. What does the audit trail of a reserve history look like in a real system, and what does an examiner check? This is a second maker-checker candidate that topic 3 also touches.

4. **SIU (Special Investigations Unit) patterns.** Fraud-referral workflows have their own regulatory surface. What does a real SIU referral look like — the data captured, the routing, the segregation from the regular claims workflow, the audit trail back to the decision? Cite Insurance Information Institute data, state fraud-bureau reporting requirements.

5. **Reinsurance and subrogation cues.** A claim over a threshold may trigger reinsurance notification; a claim where a third party is at fault triggers subrogation. Both are industry-standard workflows but often missing from simple claim demos. What minimal representation in the v1 seeded state makes these visible without turning them into full workflows?

6. **Compliance reports the system produces.** What reports does a claims system typically produce for regulators — closed-claim count by state, reserve-movement report, anti-fraud metrics, diversity/demographic reports for certain states? Do any of these have industry-standard formats that the admin agent could plausibly surface on request?

7. **Notes that matter.** What do "claims notes" look like in a regulated system? Timestamped, signed, often immutable. Do they live in a separate store from the operational claim record? How does the Jungle3 audit trail shape ([ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md)) align with real claim-notes immutability requirements?

8. **What a hostile domain-expert reviewer would test first.** If an insurance-industry VP sits down with the Jungle3 demo for 15 minutes, what are the five specific questions they'd ask to test plausibility? ("What state DOI is this simulating?" "Show me the diary system." "Where's the reserve history?" "What's the fraud-referral workflow?") Cite real examples of domain-expert evaluations of insurance-tech demos if any are published.

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
