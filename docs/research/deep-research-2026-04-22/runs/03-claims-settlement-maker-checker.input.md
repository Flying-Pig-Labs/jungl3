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

# Topic 3: Canonical maker-checker workflow in real P&C claims operations

See `00-context.md` for product framing. [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md) pins the v1 domain to P&C insurance claims and leaves *which specific workflow becomes the canonical maker-checker example* open, pending the first design-partner conversation. My default is "settlement approval above a dollar threshold." This topic is about sharpening that default.

## Research questions

1. **Candidate workflows, ranked.** What are the actual maker-checker-shaped workflows in real mid-sized P&C claims operations? Include at minimum: (a) settlement approval above a dollar threshold, (b) policy exception approval, (c) high-value payment issuance, (d) SIU investigation outcome, (e) salvage/subrogation decisions, (f) reserve adjustments. For each: how common is it, what is the dollar threshold or trigger criterion in real-world practice, and how observable is the maker-checker pair to an auditor?

2. **Settlement-approval thresholds in practice.** At a regional P&C carrier, what dollar thresholds trigger supervisor review? What role hierarchies exist (adjuster → senior adjuster → supervisor → claims manager → VP)? How often do claims escalate? Cite industry data (NAIC, AICPCU, trade publications) and real company disclosures.

3. **Regulatory anchoring.** Which workflows have explicit regulatory text behind them (state DOI regulations, NAIC Model Acts, UCC, ERISA for disability)? A maker-checker example tied to a specific regulation is harder to dismiss than one that could be internal policy. Cite specific regulations where applicable.

4. **Failure modes a real auditor would spot.** A state DOI market-conduct examiner walks the system through claim `CLM-2026-04-002137`, which has a settlement approval at $47,500 by Adjuster Sarah and Supervisor Marcus. What would they actually check? Timestamps, separation of duties, reason codes, supporting documentation attached, downstream payment authorization linkage? For each check, is the Jungle3 audit-trail shape (from [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md)) sufficient? What is missing?

5. **Timing realism.** How long does a real settlement approval take end to end — from adjuster submission to supervisor decision? What's the distribution (mean, median, p95, p99)? This matters because the seeded state in v1 has to place 60 in-flight claims at realistic workflow stages.

6. **Rejection and revision cycles.** How often does a supervisor reject and return a settlement proposal? What are the common rejection reasons? How should the v1 seeded state include rejected-and-revised claims so the admin agent has something to show when an operator asks "show me claims that were sent back for revision"?

7. **Counterexamples.** Workflows that *sound* like maker-checker but aren't — rubber-stamp approvals, automated-above-threshold escalations, auto-pay under-threshold flows. Which of these exist at real P&C carriers, and how do we avoid accidentally modeling a theater-only approval in v1?

8. **Narrative credibility.** For a demo audience (prospective design partners, AWS Marketplace reviewers), which single workflow tells the cleanest 90-second story? "Adjuster Sarah proposes $47,500, Supervisor Marcus catches pre-existing damage and rejects, Sarah revises to $32,000, Marcus approves" — does that land, or is there a cleaner narrative?

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
