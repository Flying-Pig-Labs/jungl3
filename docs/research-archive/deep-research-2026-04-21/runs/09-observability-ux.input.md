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
# Topic 9: Observability UX for builders

See `00-context.md` for product framing.

## Research questions

Research what engineers, product managers, and operators actually want to inspect when working in a synthetic enterprise environment — and what custom observability surfaces Jungl3 should build versus what it should offload to raw CloudWatch / X-Ray.

Investigate:

1. **Queue health views.** What do effective queue-health dashboards show (depth, age of oldest message, throughput, failure rate, DLQ count)? Survey best-in-class: Amazon SQS console, Temporal Web, Camunda Operate, Orkes Conductor UI, Celery Flower, RabbitMQ management.

2. **Event-timeline model.** What is the best paradigm for letting a builder trace an event through a synthetic system — per-entity timeline (all events for case #123), per-type timeline (all claim-submitted events), or per-service (all events in service X)? How do tools like Honeycomb, Tempo, and Temporal approach this?

3. **Failure inspection.** What do builders want when something fails — full stack trace? Replay button? Context-diff against a successful run? How do best-in-class systems surface this without the user needing to know CloudWatch filter syntax?

4. **Replay UX.** For a system with reprocessable events, what replay affordances matter: single-event replay, batch replay with dry-run, scenario-level reset, "time-travel" scrubbing? What prior art exists (event sourcing tools, Temporal's replay, CDC replay)?

5. **CloudWatch exposure: help or punishment?** For a customer-installed product, how much direct CloudWatch/X-Ray exposure should Jungl3 rely on vs wrap in its own admin UI? At what team size/sophistication does raw CloudWatch become friction?

6. **Custom admin surface — necessary or bloat?** Make a case for and against building a custom observability/admin app as part of Jungl3. Who pays the maintenance cost? What are the must-have views if built?

7. **Persona-specific observability.** What does an engineer want to see versus a product manager versus a demo-giver versus a buyer evaluating the product? Are these the same dashboards or different ones?

8. **Prior art.** Review what LocalStack, Temporal, Camunda, Kestra, Workato, Retool, and observability vendors (Datadog, Honeycomb) expose, and identify patterns that would translate to a Jungle.

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
