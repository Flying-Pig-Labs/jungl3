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

6. **Scenario packs vs continuous generation.** Should Jungl3 ship curated "scenario packs" (named, narrative-driven seed sets) or run a continuous background generator that produces new records over time, or both? What are the operational costs of each?

7. **Tools and libraries.** Survey the current state of synthetic data generation: Faker, Mimesis, SDV, Gretel, Mostly AI, LLM-based generators, domain-specific synthesizers. Which are production-grade? Which can hit believability without requiring real data for training?

8. **Anti-patterns.** Obvious tells: "John Doe," monotonic IDs, uniformly-distributed timestamps, identical-format phone numbers, placeholder lorem-ipsum in document bodies, perfectly clean foreign keys, no soft-deletes, no orphan records.

9. **Privacy / safety.** How to ensure synthetic data doesn't accidentally resemble real PII, especially for a product that will be installed into customer AWS accounts.

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
