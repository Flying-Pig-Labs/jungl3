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

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
