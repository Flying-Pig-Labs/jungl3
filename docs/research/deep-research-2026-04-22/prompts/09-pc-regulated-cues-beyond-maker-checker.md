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
