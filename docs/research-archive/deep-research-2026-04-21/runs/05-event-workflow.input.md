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
# Topic 5: Event and workflow patterns that create operational life

See `00-context.md` for product framing.

## Research questions

Identify the smallest set of async/event/workflow patterns that collectively create the strongest "this is a real enterprise system" feel. This is probably the single largest contributor to perceived aliveness.

Research:

1. **The minimum pattern set.** Of the following, which are essential, which are nice-to-have, and which are ceremony-only for v1:
   - Retries with backoff
   - Dead-letter queues (DLQs)
   - Idempotency keys
   - Timeout behavior and visible timeout handling
   - Manual-review loops (human-in-the-loop)
   - Webhook callbacks (inbound and outbound)
   - Escalation rules
   - Scheduled / cron jobs
   - Replay and reprocessing
   - State-machine-driven workflows with visible state transitions
   - Sagas / compensating transactions
   - Event sourcing / audit log
   - Eventual consistency with visible lag
   - Circuit breakers
   - Rate limiting / throttling
   - Fan-out / fan-in patterns
   - Outbox pattern

2. **Tech choices.** For each of the above, what are the canonical AWS-native implementations that are cheap at rest, well-understood, and easy for a customer to inspect? (EventBridge, SQS, SFN, SNS, Lambda destinations, etc.)

3. **Observable signals of life.** What background activity is most visible and reassuring to an operator opening a dashboard for the first time — queues with non-zero depth, recent-event feeds, last-run timestamps, error rates hovering non-zero, approval queues?

4. **What kills plausibility.** Which patterns are commonly used in demo systems that *decrease* plausibility? (All-synchronous APIs. Perfectly-zero queue depths. No error logs. Instant transitions. No stuck cases.)

5. **Reference architectures.** Survey published reference architectures for "enterprise-feeling" event-driven systems: AWS Well-Architected case studies, Uber/Netflix/Stripe engineering blogs on async patterns, Temporal's sample applications, Orkes/Camunda/Zeebe workflow patterns.

6. **Cost profile of "alive."** What does each pattern cost in idle (e.g., EventBridge rules firing every minute, Step Functions waiting, Lambda cold starts, SQS long-polling)? See Topic 8 but surface headline figures here.

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
