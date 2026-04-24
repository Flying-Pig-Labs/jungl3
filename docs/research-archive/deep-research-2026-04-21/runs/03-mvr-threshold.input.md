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
# Topic 3: Minimum viable realism threshold

See `00-context.md` for product framing.

## Research questions

What is the **minimum** system complexity that causes a synthetic enterprise environment to cross the line from "demo" into "living, breathing environment" — and at what point does added complexity stop improving fidelity and start hurting installability, comprehension, and cost?

Research:

1. **Minimum counts.** For a believable synthetic enterprise environment, what is the minimum needed of each:
   - Microservices (named, deployed, interacting)
   - Distinct user roles / personas
   - End-to-end workflows (not just APIs — full multi-step flows with state)
   - Event/message types flowing through the system
   - External-system stubs
   - Background jobs / scheduled tasks
   - Seeded documents, records, or cases
   - Distinct UIs or admin surfaces
   - Data domains / tables
   
   Cite any published guidance, developer-experience research, or observed heuristics from production systems.

2. **Complexity-ceiling failure mode.** At what point does added realism begin to actively damage the product — slowing install, confusing users, inflating cost, making documentation unmaintainable? Are there known thresholds (# microservices past which new engineers disengage, # UIs past which users stop exploring)?

3. **The "living" threshold specifically.** What is the smallest configuration that exhibits continuous, observable background activity — events flowing, queues moving, jobs firing, state transitioning — without constant user input? This is the threshold between "demo" and "alive."

4. **Trade-off curve.** Plot realism vs cost and realism vs comprehension. Where are the knees?

5. **Prior art on minimalist realism.** Which products, platforms, training environments, or research projects have explicitly aimed at *minimalist* believability (Stripe's test mode, Temporal sample apps, AWS workshops, Salesforce org scratch orgs)? What design choices do they share?

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
