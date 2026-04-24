# Research context

You are producing a deep-research report for **Jungl3** (stylized `jungl3`), a product with the following characteristics.

## What Jungl3 is

Jungl3 generates, deploys, and vends pre-built, integrated, "Frankenstein" enterprise applications so product teams can start from a living, working system rather than from a blank page. Teams then **subtract** and reshape the generated system into their real product, instead of additively building from scratch.

Key properties:

- Distributed as an **AWS Marketplace** listing. Customers subscribe, launch a CloudFormation template into their own AWS account, and operate their own Jungl3 instance entirely inside that account. There is no hosted multi-tenant SaaS version of Jungl3 itself.
- Each "Jungle" is a synthetic but believable enterprise environment: microservices, queues, events, stubs, scheduled jobs, seed data, personas, dashboards, audit trails, workflow state transitions, and background activity — all deployed, running, and interacting on day one.
- The v1 domain anchor is loosely **insurance-adjacent case processing** (claims, reviews, approvals, exception handling), but this is explicitly up for pressure-testing.
- The central product thesis is "time to real": time from `subscribe` to the first click on running software that feels like a real enterprise system, not a demo.
- The central failure mode is **plausibility collapse**: the moment a user (builder, judge, buyer) spots that the data, workflows, personas, or system behavior are obviously fake, every other investment loses value.

## Who the research audience is

Jungl3 engineering and product leadership. They want **actionable, decision-ready findings** — concrete recommendations, named trade-offs, and named failure modes — not a survey. Assume they are technically sophisticated. Prefer opinionated synthesis over neutral hedging. Cite named systems, companies, and patterns where useful.

## Output expectations for every research task

Every deep-research report should end with a section titled **"Decision-ready recommendations for Jungl3"** that states, in 5–10 bullets:

- What Jungl3 should do in v1.
- What Jungl3 should explicitly defer past v1.
- The single biggest risk if Jungl3 ignores this topic.
- Any cross-links to the other 11 research topics where this one has knock-on effects.

Treat this as a genuine advisory document. Be direct. It is better to be sharply opinionated and wrong in a named way than to be vaguely comprehensive.
# Topic 1: What makes a synthetic enterprise environment feel real to builders

See `00-context.md` for product framing. Summarize context briefly at the top of your answer.

## Research questions

Identify, with evidence from production systems, developer platforms, and engineering research, what cues make an enterprise application feel *real* versus *demo-like* to an experienced engineer, product manager, designer, or technical buyer encountering it for the first time.

Specifically:

1. **Cues that matter most.** Which of the following are the highest-signal "realness" cues, and why: message queues with visible backlog, approval workflows, stale or aging data, retries and dead-letter queues, cross-team handoffs, audit trails, role and permission boundaries, notifications, exception paths, manual-review loops, reprocessing, scheduled/batch jobs, webhook callbacks, escalations, outage/degraded-service states, multi-region/timezone behavior, email/pdf artifacts, legacy integrations with odd semantics? Rank them by signal strength.

2. **Cues that are theater.** Which commonly-included cues in "demo environments" are mostly ceremony, add noise without adding plausibility, and should be skipped in v1 of a product like Jungl3?

3. **Threshold of believability.** How much operational clutter is enough before it stops improving perceived realism and starts actively hurting comprehension, installability, and cost? Cite concrete thresholds where possible (e.g., "more than N microservices before a new engineer gives up mapping them").

4. **Engineer-specific vs role-specific cues.** Which cues convince engineers specifically? Which convince product people? Which convince non-technical buyers or judges? Are these sets different?

5. **Examples in the wild.** Are there known products, internal platforms, or research projects (commercial or academic) that have explicitly tried to generate plausible synthetic enterprise environments? What worked, what failed? Look at: hackathon starter kits, training environments (e.g., Gartner's work, SAP sandboxes, Salesforce dev orgs, Microsoft demo tenants), security-industry honeypots, chaos engineering platforms, and any published research on "synthetic organization" or "enterprise simulation."

6. **Anti-patterns.** What patterns are known to instantly break the illusion? (Obvious fake names like "John Doe," uniformly distributed timestamps, synchronous-only flows, empty error logs, placeholder text in UI, perfectly clean reference data.)

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
