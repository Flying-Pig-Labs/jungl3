# Topic 8: Persona writing-style generation with LLMs, deterministic from seed

See `00-context.md` for product framing. [findings.md §6.4](../findings.md) and §5.5 commit to 8 personas — each with seeded history, owned workloads, and activity rhythms — and to LLM-generated seed text (claim notes, adjuster narratives, email bodies) with a *writing-style spec* per persona. Personas diverge in voice: terse vs. verbose, formal vs. informal, domain-idiosyncratic vs. generic. This topic is about how to make that actually work at install time, deterministic from seed, without blowing the budget.

## Research questions

1. **Writing-style spec, concretely.** What fields describe a persona's writing style effectively for LLM steering? Candidate fields: sentence length distribution, formality, vocabulary register, use of jargon, typical signoff, typo propensity, sentence-opener patterns. Which of these actually move the output in a measurable way for a Claude Sonnet-class model? Cite any published research on style-controlled generation.

2. **Seeded divergence.** If all 8 personas emit through the same model, how do you make their outputs *reliably distinguishable* in a blind read? Patterns: distinct system prompts, few-shot exemplars per persona, constrained vocabularies, post-hoc style transforms. What is the minimum bar for "an operator skimming the claim notes queue can guess which adjuster wrote what"?

3. **Determinism constraints.** The install has to be deterministic from the seed — same seed produces the same generated text. LLMs are generally nondeterministic. What controls (temperature=0, top_p=1, seed parameter where available, cached outputs) give full install-time determinism? What breaks? Cite Anthropic's docs on determinism.

4. **Install-time cost.** Generating ~1,800 closed claims × (say) 3 claim notes per closed claim + 60 in-flight claims × more notes + emails to the claimant + adjuster narratives is a meaningful LLM workload at install time. What is the realistic token count and cost for a full seed run? Does it fit under the $50/month LLM budget from [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md), or does it need a separate one-time install budget?

5. **Caching across installs.** Two customers install Jungle3 with the same default seed. Should the generated text be identical across installs (cacheable in a Jungle3-managed artifact) or uniquely regenerated (every install pays the cost)? Security and cost trade-offs of each.

6. **Anti-patterns that give away the fake.** What are the LLM tells that make generated claim notes look generated to a practiced reader? Overly polished prose, absent-minded consistency, no abbreviations, no trailing thoughts, no jargon, no typos, no carriage-returns-in-weird-places. How do real adjuster notes actually read? Cite any available claim-notes corpora or published examples.

7. **Persona exemplar sourcing.** Writing-style specs are stronger with 2–3 real exemplars. Are there any publicly-available corpora of insurance-adjuster notes, email threads, or internal comms that could seed the exemplar library without copyright issues? Public court-filing exhibits, training datasets, academic research datasets?

8. **Style drift across a long history.** A persona's writing style in a claim note from 18 months ago should be consistent with their notes from last week — but a real person's style does drift (new jargon, promotions, seasonal events). How is this modeled? Is the effort worth the plausibility gain?

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
