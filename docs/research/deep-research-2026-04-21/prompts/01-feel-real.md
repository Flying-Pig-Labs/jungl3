# Topic 1: What makes a synthetic enterprise environment feel real to builders

See `00-context.md` for product framing. Summarize context briefly at the top of your answer.

## Research questions

Identify, with evidence from production systems, developer platforms, and engineering research, what cues make an enterprise application feel *real* versus *demo-like* to an experienced engineer, product manager, designer, or technical buyer encountering it for the first time.

Specifically:

1. **Cues that matter most.** Which of the following are the highest-signal "realness" cues, and why: message queues with visible backlog, approval workflows, stale or aging data, retries and dead-letter queues, cross-team handoffs, audit trails, role and permission boundaries, notifications, exception paths, manual-review loops, reprocessing, scheduled/batch jobs, webhook callbacks, escalations, outage/degraded-service states, multi-region/timezone behavior, email/pdf artifacts, legacy integrations with odd semantics? Rank them by signal strength.

2. **Cues that are theater.** Which commonly-included cues in "demo environments" are mostly ceremony, add noise without adding plausibility, and should be skipped in v1 of a product like Jungle3?

3. **Threshold of believability.** How much operational clutter is enough before it stops improving perceived realism and starts actively hurting comprehension, installability, and cost? Cite concrete thresholds where possible (e.g., "more than N microservices before a new engineer gives up mapping them").

4. **Engineer-specific vs role-specific cues.** Which cues convince engineers specifically? Which convince product people? Which convince non-technical buyers or judges? Are these sets different?

5. **Examples in the wild.** Are there known products, internal platforms, or research projects (commercial or academic) that have explicitly tried to generate plausible synthetic enterprise environments? What worked, what failed? Look at: hackathon starter kits, training environments (e.g., Gartner's work, SAP sandboxes, Salesforce dev orgs, Microsoft demo tenants), security-industry honeypots, chaos engineering platforms, and any published research on "synthetic organization" or "enterprise simulation."

6. **Anti-patterns.** What patterns are known to instantly break the illusion? (Obvious fake names like "John Doe," uniformly distributed timestamps, synchronous-only flows, empty error logs, placeholder text in UI, perfectly clean reference data.)

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
