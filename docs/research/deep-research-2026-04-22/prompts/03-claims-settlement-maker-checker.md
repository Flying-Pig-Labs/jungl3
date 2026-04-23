# Topic 3: Canonical maker-checker workflow in real P&C claims operations

See `00-context.md` for product framing. [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md) pins the v1 domain to P&C insurance claims and leaves *which specific workflow becomes the canonical maker-checker example* open, pending the first design-partner conversation. My default is "settlement approval above a dollar threshold." This topic is about sharpening that default.

## Research questions

1. **Candidate workflows, ranked.** What are the actual maker-checker-shaped workflows in real mid-sized P&C claims operations? Include at minimum: (a) settlement approval above a dollar threshold, (b) policy exception approval, (c) high-value payment issuance, (d) SIU investigation outcome, (e) salvage/subrogation decisions, (f) reserve adjustments. For each: how common is it, what is the dollar threshold or trigger criterion in real-world practice, and how observable is the maker-checker pair to an auditor?

2. **Settlement-approval thresholds in practice.** At a regional P&C carrier, what dollar thresholds trigger supervisor review? What role hierarchies exist (adjuster → senior adjuster → supervisor → claims manager → VP)? How often do claims escalate? Cite industry data (NAIC, AICPCU, trade publications) and real company disclosures.

3. **Regulatory anchoring.** Which workflows have explicit regulatory text behind them (state DOI regulations, NAIC Model Acts, UCC, ERISA for disability)? A maker-checker example tied to a specific regulation is harder to dismiss than one that could be internal policy. Cite specific regulations where applicable.

4. **Failure modes a real auditor would spot.** A state DOI market-conduct examiner walks the system through claim `CLM-2026-04-002137`, which has a settlement approval at $47,500 by Adjuster Sarah and Supervisor Marcus. What would they actually check? Timestamps, separation of duties, reason codes, supporting documentation attached, downstream payment authorization linkage? For each check, is the Jungl3 audit-trail shape (from [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md)) sufficient? What is missing?

5. **Timing realism.** How long does a real settlement approval take end to end — from adjuster submission to supervisor decision? What's the distribution (mean, median, p95, p99)? This matters because the seeded state in v1 has to place 60 in-flight claims at realistic workflow stages.

6. **Rejection and revision cycles.** How often does a supervisor reject and return a settlement proposal? What are the common rejection reasons? How should the v1 seeded state include rejected-and-revised claims so the admin agent has something to show when an operator asks "show me claims that were sent back for revision"?

7. **Counterexamples.** Workflows that *sound* like maker-checker but aren't — rubber-stamp approvals, automated-above-threshold escalations, auto-pay under-threshold flows. Which of these exist at real P&C carriers, and how do we avoid accidentally modeling a theater-only approval in v1?

8. **Narrative credibility.** For a demo audience (prospective design partners, AWS Marketplace reviewers), which single workflow tells the cleanest 90-second story? "Adjuster Sarah proposes $47,500, Supervisor Marcus catches pre-existing damage and rejects, Sarah revises to $32,000, Marcus approves" — does that land, or is there a cleaner narrative?

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
