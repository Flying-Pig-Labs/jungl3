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
# Topic 4: Synthetic data realism design

See `00-context.md` for product framing.

## Research questions

Bad fake data is the fastest way to kill the illusion of a real enterprise environment. Research how to design synthetic operational datasets that hold up under scrutiny from engineers, analysts, product managers, and domain experts.

Investigate:

1. **What believable operational datasets look like.** What distinguishes a synthetic dataset that "feels real" from one that obviously doesn't? Specifically: name distributions, address/geography realism, temporal patterns (work-hour clustering, weekday/weekend effects, holiday dips, quarterly spikes), value distributions (power-law vs uniform), text-field entropy, missing-field patterns, versioning artifacts, duplicate/near-duplicate records.

2. **How records age.** How do real operational records evolve over time? Status changes, reassignment, notes accretion, attachments appearing out of order, late-arriving updates, corrections, retroactive edits. How should a synthetic dataset show aged records at different lifecycle points simultaneously?

3. **Lifecycle distributions.** What are realistic distributions for case/record lifecycles? % resolved cleanly, % stuck in manual review, % escalated, % abandoned, % reopened, % fraud/anomaly, % duplicated. Reference real industry data where available.

4. **Ratio of clean vs messy cases.** What ratio of edge cases / exceptions / errors in a dataset signals "real operations" without being overwhelming? Too few → fake. Too many → demo-of-chaos.

5. **Deterministic vs randomized seeding.** Trade-offs between deterministic seeds (reproducible demos, shareable scenarios, debuggable) vs randomized generation (organic feel, harder to memorize). What do top-tier demo environments do?

6. **Scenario packs vs continuous generation.** Should Jungle3 ship curated "scenario packs" (named, narrative-driven seed sets) or run a continuous background generator that produces new records over time, or both? What are the operational costs of each?

7. **Tools and libraries.** Survey the current state of synthetic data generation: Faker, Mimesis, SDV, Gretel, Mostly AI, LLM-based generators, domain-specific synthesizers. Which are production-grade? Which can hit believability without requiring real data for training?

8. **Anti-patterns.** Obvious tells: "John Doe," monotonic IDs, uniformly-distributed timestamps, identical-format phone numbers, placeholder lorem-ipsum in document bodies, perfectly clean foreign keys, no soft-deletes, no orphan records.

9. **Privacy / safety.** How to ensure synthetic data doesn't accidentally resemble real PII, especially for a product that will be installed into customer AWS accounts.

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
