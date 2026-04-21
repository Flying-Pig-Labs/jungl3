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
# Topic 10: Persona and workload realism

See `00-context.md` for product framing.

## Research questions

A living enterprise system is not just services and queues — it is people with roles, ownership, backlogs, handoffs, and awkward boundaries. Research what persona/workload design makes the human side of a synthetic environment feel real.

Investigate:

1. **Essential internal roles.** For v1 (insurance-adjacent or whichever domain anchor is chosen in Topic 2), what is the minimum role taxonomy that creates plausible handoff dynamics — e.g., intake clerk, case adjuster, senior adjuster, approver, fraud review, customer service, IT-ops-style roles (on-call, admin, auditor)? What is sufficient without overpopulation?

2. **Useful role tension.** Real organizations have friction: approvers who sit on queues, reviewers who disagree, ownership ambiguity, escalation loops. How much of this should be simulated? Where does "realistic friction" become "simulation of dysfunction" that annoys users?

3. **Pre-seeded ownership.** What should each seeded persona already "own" — open cases, assigned backlog, pending approvals, draft documents, in-progress comments? This is what makes the environment feel *inhabited* rather than blank.

4. **Handoff modeling.** How should handoffs between personas work — assignment queues, notification patterns, SLA timers, reassignment on inactivity? What prior art exists (ServiceNow ITSM workflows, Jira Service Management, Zendesk, Salesforce case routing)?

5. **Backlog shape.** Realistic backlogs are not flat. What are plausible shapes — aging distributions, priority skew, Pareto-style concentration of heavy cases? Cite operational research.

6. **External actors.** Customers, partners, vendors, auditors — which external personas should have observable behavior in the synthetic environment (submitting cases, responding late, triggering exceptions)? How is their behavior simulated — scripted schedules, agent-based simulation, LLM-driven?

7. **Simulated vs scripted behavior.** Trade-offs between a scripted scenario (reproducible, demo-friendly) and continuous agent-based simulation (organic, unpredictable). Can Jungle3 use both?

8. **Cross-reference.** How does this tie to Topic 2 (domain anchor choice affects persona set), Topic 4 (synthetic data feeds personas), Topic 5 (events drive persona activity), and Topic 11 (role separation affects regulated-feel)?

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
