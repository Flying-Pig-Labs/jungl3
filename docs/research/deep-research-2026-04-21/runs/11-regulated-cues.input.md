# Research context

You are producing a deep-research report for **Jungle3** (stylized `jungl3`), a product with the following characteristics.

## What Jungle3 is

Jungle3 generates, deploys, and vends pre-built, integrated, "Frankenstein" enterprise applications so product teams can start from a living, working system rather than from a blank page. Teams then **subtract** and reshape the generated system into their real product, instead of additively building from scratch.

Key properties:

- Distributed as an **AWS Marketplace** listing. Customers subscribe, launch a CloudFormation template into their own AWS account, and operate their own Jungle3 instance entirely inside that account. There is no hosted multi-tenant SaaS version of Jungle3 itself.
- Each "Jungle" is a synthetic but believable enterprise environment: microservices, queues, events, stubs, scheduled jobs, seed data, personas, dashboards, audit trails, workflow state transitions, and background activity — all deployed, running, and interacting on day one.
- The v1 domain anchor is loosely **insurance-adjacent case processing** (claims, reviews, approvals, exception handling), but this is explicitly up for pressure-testing.
- The central product thesis is "time to real": time from `subscribe` to the first click on running software that feels like a real enterprise system, not a demo.
- The central failure mode is **plausibility collapse**: the moment a user (builder, judge, buyer) spots that the data, workflows, personas, or system behavior are obviously fake, every other investment loses value.

## Who the research audience is

Jungle3 engineering and product leadership. They want **actionable, decision-ready findings** — concrete recommendations, named trade-offs, and named failure modes — not a survey. Assume they are technically sophisticated. Prefer opinionated synthesis over neutral hedging. Cite named systems, companies, and patterns where useful.

## Output expectations for every research task

Every deep-research report should end with a section titled **"Decision-ready recommendations for Jungle3"** that states, in 5–10 bullets:

- What Jungle3 should do in v1.
- What Jungle3 should explicitly defer past v1.
- The single biggest risk if Jungle3 ignores this topic.
- Any cross-links to the other 11 research topics where this one has knock-on effects.

Treat this as a genuine advisory document. Be direct. It is better to be sharply opinionated and wrong in a named way than to be vaguely comprehensive.
# Topic 11: Regulated-environment cues — real vs ceremony

See `00-context.md` for product framing.

## Research questions

Jungle3 wants the *atmosphere* of a regulated environment (audit trails, approvals, separation of duties, retention, immutability, compliance-adjacent behavior) without committing to the cost and complexity of actual regulatory compliance in v1. Research which regulated-environment cues meaningfully improve realism and which are pure drag.

Investigate:

1. **Audit trail expectations.** What does an engineer or auditor expect to see in a regulated system: append-only event log, actor attribution, before/after diffs, timestamps at minute resolution, correlation IDs? What is high-signal vs ceremony?

2. **Approval semantics.** Single-approver, dual-approver, N-of-M, delegated approval, automatic-on-timeout. Which are common across industries? What minimum set communicates "this is a regulated shop"?

3. **Separation-of-duties cues.** What role-based-access patterns are recognizable as SoD without modeling the full RBAC complexity (e.g., "maker/checker," "initiator cannot approve their own case," "four-eyes principle")? How to surface these without fully enforcing them technically?

4. **Record immutability.** What immutability cues matter — write-once fields, version history, tombstone-on-delete, retention timers? Cite how SOC 2, HIPAA, SOX, PCI, and banking regulations show up in product UX.

5. **Document handling expectations.** How do regulated systems handle documents — checksums, versioned storage, redaction, access logs, watermarks, export controls? What low-cost cues convey this?

6. **Retention and versioning.** Retention schedules (e.g., 7-year, 10-year), legal-hold flags, automatic archival. Which are useful in a synthetic environment vs pure theater?

7. **Which compliance-adjacent behaviors meaningfully improve realism.** Rank: audit log, actor attribution, approvals, SoD, immutability, retention, access logs, signed exports, change management tickets, break-glass flows.

8. **Which are pure drag in v1.** Which commonly-included regulated-system behaviors add maintenance burden without improving plausibility for Jungle3's target audience?

9. **Cross-industry patterns.** Are there cues that are recognizable across many regulated industries (healthcare, finance, insurance, government) vs industry-specific? Favor cross-industry cues for v1.

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
