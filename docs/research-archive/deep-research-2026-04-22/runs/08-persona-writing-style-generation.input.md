# Research context (cluster 2026-04-22)

You are producing a deep-research report for **Jungl3** (stylized `jungl3`), a product with the following characteristics.

## What Jungl3 is

Jungl3 generates, deploys, and vends pre-built, integrated, "Understory" enterprise applications so product teams can start from a living, working system rather than from a blank page. Teams shape the generated system — subtracting what doesn't belong, substituting components, adding where the baseline stops — into their real product.

Key properties:

- Distributed as an **AWS Marketplace** listing. Customers subscribe, launch a CloudFormation template into their own AWS account, and operate their own Jungl3 instance entirely inside that account. There is no hosted multi-tenant SaaS version of Jungl3 itself.
- Each "Jungle" is a synthetic but believable enterprise environment: microservices, queues, events, stubs, scheduled jobs, seed data, personas, workflows, audit trails, and background activity — all deployed, running, and interacting on day one.
- The central product thesis is "time to real": time from `subscribe` to the first click on running software that feels like a real enterprise system, not a demo.
- The central failure mode is **plausibility collapse**: the moment a user (builder, judge, buyer) spots that the data, workflows, personas, or system behavior are obviously fake, every other investment loses value.

## Where we are now

The 2026-04-21 deep-research cluster (twelve reports) and the subsequent review pass turned many open questions into decisions. The commitments are now on record as ADRs 0005–0009:

- **ADR 0005:** Event envelope is CloudEvents v1.0 with reverse-DNS typing; every event/log/audit record carries both `trace_id` (W3C Trace Context) and `case_id` (business-domain identifier).
- **ADR 0006:** v1 domain anchor is P&C insurance claims processing, claims-only (no underwriting). Seven services: `policy-service`, `claim-intake`, `claim-workflow`, `assessment-service`, `payment-service`, `notification-service`, `audit-service`. Two stubs: payment gateway, notification.
- **ADR 0007:** Infrastructure cost ceiling $100/month per install; LLM budget separately metered at $50/month default, hard cutoff, graceful degradation. Observability is CloudWatch Logs + Logs Insights + X-Ray only. LLMs are prominent via a single `llm-gateway` Lambda constrained to deterministic tool use.
- **ADR 0008:** Every multi-step business process is an AWS Step Functions state machine. Maker-checker is enforced at the state-machine level, not the UI.
- **ADR 0009:** The audit trail is a separate DynamoDB table (`jungle3-audit`), append-only, hash-chained with SHA-256 `prev_hash`, owned by `audit-service`, subscribed to every domain event.

The full findings document these derive from is at `docs/research/findings.md` in the repo; the reports that fed it are at `docs/research/deep-research-2026-04-21/results/`.

## Who the research audience is

Jungl3 engineering leadership. They want **actionable, decision-ready findings** that move the ADRs above from "decided" to "buildable" — concrete recommendations, real numbers, named failure modes, and named trade-offs. Assume they are technically sophisticated and have already read the ADRs. Prefer opinionated synthesis over neutral hedging. Cite named systems, companies, open-source projects, and specifications where useful.

## What this cluster is for

ADRs 0005–0009 are decisions. Now they have to be built. This cluster is about the **next layer of detail** — the specific data models, numeric distributions, library choices, calibration plans, and edge cases that each ADR exposed as still-unknown.

Do not re-argue the ADRs. They are settled. Accept their framing and go deeper.

## Output expectations for every research task

Every deep-research report should end with a section titled **"Decision-ready recommendations for Jungl3"** that states, in 5–10 bullets:

- What Jungl3 should do in the next implementation step for this topic.
- What Jungl3 should explicitly defer past v1.
- The single biggest risk if Jungl3 ignores this topic.
- Any cross-links to the other 9 topics in this cluster where this one has knock-on effects.

Treat this as a genuine advisory document. Be direct. Cite real systems, real pricing, real code where possible. It is better to be sharply opinionated and wrong in a named way than to be vaguely comprehensive.


---

# Topic 8: Persona writing-style generation with LLMs, deterministic from seed

See `00-context.md` for product framing. [findings.md §6.4](../findings.md) and §5.5 commit to 8 personas — each with seeded history, owned workloads, and activity rhythms — and to LLM-generated seed text (claim notes, adjuster narratives, email bodies) with a *writing-style spec* per persona. Personas diverge in voice: terse vs. verbose, formal vs. informal, domain-idiosyncratic vs. generic. This topic is about how to make that actually work at install time, deterministic from seed, without blowing the budget.

## Research questions

1. **Writing-style spec, concretely.** What fields describe a persona's writing style effectively for LLM steering? Candidate fields: sentence length distribution, formality, vocabulary register, use of jargon, typical signoff, typo propensity, sentence-opener patterns. Which of these actually move the output in a measurable way for a Claude Sonnet-class model? Cite any published research on style-controlled generation.

2. **Seeded divergence.** If all 8 personas emit through the same model, how do you make their outputs *reliably distinguishable* in a blind read? Patterns: distinct system prompts, few-shot exemplars per persona, constrained vocabularies, post-hoc style transforms. What is the minimum bar for "an operator skimming the claim notes queue can guess which adjuster wrote what"?

3. **Determinism constraints.** The install has to be deterministic from the seed — same seed produces the same generated text. LLMs are generally nondeterministic. What controls (temperature=0, top_p=1, seed parameter where available, cached outputs) give full install-time determinism? What breaks? Cite Anthropic's docs on determinism.

4. **Install-time cost.** Generating ~1,800 closed claims × (say) 3 claim notes per closed claim + 60 in-flight claims × more notes + emails to the claimant + adjuster narratives is a meaningful LLM workload at install time. What is the realistic token count and cost for a full seed run? Does it fit under the $50/month LLM budget from [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md), or does it need a separate one-time install budget?

5. **Caching across installs.** Two customers install Jungl3 with the same default seed. Should the generated text be identical across installs (cacheable in a Jungl3-managed artifact) or uniquely regenerated (every install pays the cost)? Security and cost trade-offs of each.

6. **Anti-patterns that give away the fake.** What are the LLM tells that make generated claim notes look generated to a practiced reader? Overly polished prose, absent-minded consistency, no abbreviations, no trailing thoughts, no jargon, no typos, no carriage-returns-in-weird-places. How do real adjuster notes actually read? Cite any available claim-notes corpora or published examples.

7. **Persona exemplar sourcing.** Writing-style specs are stronger with 2–3 real exemplars. Are there any publicly-available corpora of insurance-adjuster notes, email threads, or internal comms that could seed the exemplar library without copyright issues? Public court-filing exhibits, training datasets, academic research datasets?

8. **Style drift across a long history.** A persona's writing style in a claim note from 18 months ago should be consistent with their notes from last week — but a real person's style does drift (new jargon, promotions, seasonal events). How is this modeled? Is the effort worth the plausibility gain?

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
