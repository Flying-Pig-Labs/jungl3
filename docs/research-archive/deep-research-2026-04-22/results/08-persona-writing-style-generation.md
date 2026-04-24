# Engineering Plausibility: Deterministic Persona Generation and Cost-Zero Artifact Caching for Jungl3

## Executive Summary

* **[DETERMINISM & CACHING]: Claude Sonnet lacks a true seed parameter, making live install-time generation inherently non-deterministic.** → **Action:** Abandon live generation during CloudFormation deployment. Pre-generate a canonical, shared JSON artifact bundle containing all 7.5M tokens of seed text and ship it via S3/AMI to guarantee byte-for-byte determinism across all customer installs.
* **[COST COMPLIANCE]: Live generation of the 7.5M token seed corpus costs ~$154 on Claude Sonnet, instantly blowing the $50/month ADR 0007 budget.** → **Action:** By shifting to a pre-generated shared artifact, install-time LLM cost drops to $0. Offer a "custom unique generation" as an opt-in, paid premium feature using Llama 3 8B on Spot instances (costing ~$2.03) or GPT-4o-mini ($75).
* **[PLAUSIBILITY & ANTI-PATTERNS]: LLMs naturally produce overly polished, uniform "bureaucratese" that fails blind reads.** → **Action:** Implement a hybrid steering stack: use the LLM for semantic content (prompt + 3 SME exemplars), but rely on a deterministic, stateless Python post-processor (seeded via HMAC-SHA256) to inject persona-specific fragments, abbreviations, and sparse typos (0-1%).
* **[EXEMPLAR SOURCING]: Scraping public court dockets or FEMA datasets for real adjuster notes carries unacceptable PII, PHI, and copyright risks for an AWS Marketplace listing.** → **Action:** Commission 24 synthetic-but-realistic exemplars (8 personas × 3 notes) from domain SMEs under explicit work-for-hire copyright assignment.
* **[PROMPT STABILITY]: Minor environment differences (newlines, JSON key ordering) destroy prompt caching efficiency and break cryptographic audit hashes.** → **Action:** Enforce strict RFC 8785 JSON Canonicalization and Unicode Normalization (NFC) across the entire generation pipeline before hashing or sending to the LLM gateway.
* **[STYLE DRIFT]: Modeling 18-month longitudinal style drift requires complex state management for negligible plausibility gains.** → **Action:** Explicitly defer style drift to v1.1. Maintain static persona profiles for v1, ensuring intra-claim consistency is prioritized over inter-month evolution.

## 1. The Determinism and Cost Imperative — Pre-generation is the only viable path for v1

Live generation of the Jungl3 seed corpus during CloudFormation deployment violates two core constraints: the ADR 0007 cost ceiling and the strict determinism requirement. 

### Claude's lack of a seed parameter breaks install-time determinism

The Claude Messages API does not expose a seed parameter for reproducibility [1]. This is a core architectural constraint that prevents deterministic output generation, even when all controllable parameters (model, temperature, system prompt, user message) are identical [1]. Furthermore, setting `temperature=0` does not guarantee determinism in Large Language Models due to floating-point arithmetic variations and GPU parallelism [2] [3]. Relying on live API calls at install time guarantees that no two Jungl3 instances will be byte-for-byte identical, breaking cryptographic audit trails (ADR 0009).

### 7.5M token corpus costs $154 on Sonnet, exceeding the $50 ADR 0007 budget

Generating the baseline synthetic environment requires approximately 3.02M input tokens and 4.54M output tokens (7.56M total tokens). 

| Generation Approach | Input Cost | Output Cost | Total Cost | Deterministic? |
| :--- | :--- | :--- | :--- | :--- |
| **Live: Claude Sonnet (Bedrock)** | $18.15 | $136.20 | **$154.35** | No |
| **Live: GPT-4o-mini (OpenAI)** | $7.56 | $68.10 | **$75.66** | Mostly (via seed) |
| **Live: Llama 3 8B (Spot EC2)** | N/A | N/A | **~$2.03** | No |
| **Pre-generated Shared Artifact** | $0.00 | $0.00 | **$0.00** | **Yes** |

*Takeaway: Live generation on Claude Sonnet immediately blows the $50/month LLM budget established in ADR 0007. Even cheaper models consume a massive portion of the budget.*

### The Solution: Ship a canonical, immutable JSON artifact bundle via S3/AMI

To satisfy both cost and determinism constraints, Jungl3 must abandon live generation for the default install. Instead, the engineering team must pre-generate the entire 7.5M token corpus during the build phase. This corpus should be packaged as an immutable, content-addressed JSON artifact bundle and distributed via the AWS Marketplace AMI or an S3 bucket. This reduces the install-time LLM cost to $0 and guarantees 100% determinism across all baseline installs.

## 2. Persona Style Specification and Steering — Combining LLM semantics with deterministic post-processing

LLMs naturally gravitate toward a "mean" style characterized by overly polished prose, uniform sentence length, and repetitive transitional phrases [4] [5]. This "bureaucratese" is a massive tell that causes plausibility collapse.

### The 9-dimension JSON style schema

To reliably steer personas, Jungl3 should adopt a compact, measurable JSON schema for each of the 8 personas. 

| Schema Field | Description | Target Range / Example |
| :--- | :--- | :--- |
| `sentence_length_mean` | Target average words per sentence | 8 (terse) to 22 (verbose) |
| `formality_bucket` | Register of the text | `informal`, `neutral`, `formal` |
| `jargon_density` | Frequency of domain-specific terms | 2% to 15% |
| `abbreviation_list` | Persona-specific shorthand | `["clmt", "s/w", "insd"]` |
| `fragment_rate` | Percentage of incomplete sentences | 5% to 20% |
| `punctuation_profile` | Use of dashes, ellipses, exclamation marks | High dash usage for rushed adjusters |
| `typo_rate` | Frequency of character-level errors | 0% to 1.5% |
| `signoff_template` | Standard closing | `"- [Initials]"` or `"Best, [Name]"` |

*Takeaway: These low-dimensional fields provide concrete targets for both LLM prompting and post-processing validation.*

### The minimal effective prompt stack: System prompt + 3 exemplars + lexical steering

To make the 8 personas reliably distinguishable in a blind read, the LLM prompt must include a strong system prompt defining the archetype, exactly 3 short (30-120 words) high-quality exemplars demonstrating the target style, and a block of lexical steering tokens (e.g., "Use terms like: subrogation, claimant, dec page"). 

### Defeating the "LLM Tell": Injecting abbreviations and typos via HMAC-SHA256 PRNG

LLMs are notoriously bad at simulating human flaws like typos or telegraphic shorthand consistently. Instead of forcing the LLM to make mistakes, Jungl3 should use the LLM to generate clean, semantically correct text, and then pass it through a deterministic Python post-processor. 

This post-processor must be completely stateless. It should use a counter-based Pseudo-Random Number Generator (PRNG) seeded via HMAC-SHA256 [6]. By deriving a key from the `install_seed` and a `context_key` (e.g., `persona:alice|claim:12345`), the post-processor can deterministically inject abbreviations (e.g., replacing "spoke with" with "s/w") and sparse typos (0-1% rate) without requiring external state lookups.

## 3. Legal and Ethical Exemplar Sourcing — Avoiding the PII/PHI trap of public datasets

Writing-style specs require real-world exemplars to anchor the LLM. However, sourcing these exemplars presents significant legal risks.

### Why FEMA and PACER datasets fail AWS Marketplace compliance

Public datasets like the FIMA NFIP Redacted Claims [7] or court filings from CourtListener [8] are legally toxic for commercial redistribution. Even "redacted" datasets often suffer from imperfect de-identification, risking the exposure of Protected Health Information (PHI) or Personally Identifiable Information (PII) [9]. Distributing an AWS Marketplace product containing accidentally unredacted PII/PHI violates vendor Terms of Service and exposes Jungl3 to massive liability.

### Commissioning the 24-exemplar library via SME work-for-hire

The lowest-risk path is to completely avoid scraped public data. Jungl3 should commission domain Subject Matter Experts (SMEs) to write synthetic-but-realistic exemplars. For 8 personas with 3 exemplars each, this requires only 24 short texts (30-120 words each). 

### Establishing provenance metadata and copyright assignment

These commissioned texts must be secured under explicit work-for-hire agreements or copyright assignments [10]. The resulting JSON artifact must include provenance metadata (author ID, date, copyright assignment hash) to prove to AWS Marketplace auditors that the seed data is 100% owned and unencumbered.

## 4. Pipeline Engineering and CI/CD Validation — Ensuring byte-for-byte stability

To maintain the integrity of the audit trail (ADR 0009) and maximize prompt caching efficiency, the generation pipeline must be ruthlessly deterministic.

### Enforcing RFC 8785 JSON Canonicalization to protect prompt caching

Minor environmental differences—such as newline variations (CRLF vs LF) or JSON key ordering—will change the cryptographic hash of a prompt. This breaks prompt caching (costing money) and breaks the SHA-256 hash chains in the `jungle3-audit` table. Jungl3 must enforce strict RFC 8785 JSON Canonicalization [11] [12] and Unicode Normalization Form C (NFC) [13] on all inputs before they are hashed or sent to the LLM gateway.

### CI/CD Stylometric Gates: Flesch-Kincaid, KL divergence, and TTR thresholds

Before shipping a new default artifact bundle, the CI/CD pipeline must run a quantitative evaluation harness. This harness should measure:
* **Readability**: Flesch-Kincaid Grade Level [14].
* **Lexical Diversity**: Type-Token Ratio (TTR) [15].
* **Distribution**: KL divergence of sentence lengths against the persona spec [16].

If a generated batch deviates from the persona's target thresholds by more than 15%, the CI build must fail.

### Explicit deferral of 18-month style drift to v1.1

Modeling slow style drift (e.g., an adjuster learning new jargon over 18 months) requires complex, stateful tracking of time-indexed deltas. The plausibility gain from this micro-variation is negligible compared to the engineering cost and the risk of breaking intra-claim consistency. Style drift should be explicitly deferred to v1.1.

## 5. Decision-Ready Recommendations for Jungl3

* **Pre-generate the v1 seed corpus:** Do not execute live LLM calls for baseline synthetic data during CloudFormation deployment. Ship a pre-generated, canonical JSON artifact bundle to guarantee determinism and keep install-time LLM costs at $0 (satisfying ADR 0007).
* **Implement a hybrid steering stack:** Use Claude Sonnet for semantic generation (guided by 3 SME-authored exemplars), followed by a deterministic, HMAC-SHA256 seeded Python post-processor to inject abbreviations, fragments, and typos.
* **Commission SME exemplars:** Do not scrape public datasets (FEMA, PACER) due to PII/PHI and copyright risks. Pay domain SMEs to write 24 synthetic exemplars under strict copyright assignment.
* **Enforce RFC 8785 Canonicalization:** Apply strict JSON canonicalization and Unicode NFC normalization to all prompts and outputs to ensure stable cryptographic hashes for the `jungle3-audit` table (ADR 0009).
* **Defer style drift:** Explicitly defer 18-month longitudinal style drift to v1.1. Keep persona styles static across the timeline for v1.
* **Biggest Risk:** Plausibility collapse due to "LLM bureaucratese." If the deterministic post-processor is cut from scope, the generated claim notes will look uniformly polished and obviously fake to any domain expert.

## References

1. *Non-Determinism and Consistency | shanraisshan/claude-code ...*. https://deepwiki.com/shanraisshan/claude-code-best-practice/8.2-non-determinism-and-consistency
2. *Why LLMs Are Not Deterministic Even at Temperature 0*. https://www.qanswer.ai/blog/llm-non-determinism-temperature-zero
3. *Uncovering the Hidden Chaos in LLMs, Temperature = 0 ...*. https://medium.com/@aruna.kolluru/uncovering-the-hidden-chaos-in-llms-temperature-0-isnt-deterministic-2da8a85e1d7d
4. *How to Tell if Something Was Written by AI: 7 Signs (2026)*. https://www.eyesift.com/blog/how-to-tell-if-ai-written/
5. *Common Words and Phrases in AI-Generated Text - Grammarly*. https://www.grammarly.com/blog/ai/common-ai-words
6. *hmac — Keyed-Hashing for Message Authentication*. https://docs.python.org/3/library/hmac.html
7. *FIMA NFIP Redacted Claims (OpenFEMA) - Catalog*. https://catalog.data.gov/dataset/fima-nfip-redacted-claims-openfema
8. *CourtListener Research and Awareness Website | Free Law ...*. https://free.law/projects/courtlistener/
9. *Guidance Regarding Methods for De-identification of Protected ...*. https://www.hhs.gov/hipaa/for-professionals/special-topics/de-identification/index.html
10. *Free Assignment of Copyright Template (US)*. https://www.lawdepot.com/us/business/assignment-of-copyright
11. *RFC 8785: JSON Canonicalization Scheme (JCS)*. https://www.rfc-editor.org/rfc/rfc8785
12. *RFC 8785 - JSON Canonicalization Scheme (JCS)*. https://datatracker.ietf.org/doc/html/rfc8785
13. *Zero-Width Characters: The Invisible Bug That’s Breaking Your ...*. https://thetexttool.com/blog/zero-width-characters-invisible-bug
14. *Flesch–Kincaid Readability - Continuous Eval*. https://continuous-eval.docs.relari.ai/metrics/generation/deterministic/flesch_kincaid_readability
15. *Type Token Ratios — TRUNAJOD 0.1.1 documentation*. https://trunajod20.readthedocs.io/en/latest/api_reference/ttr.html
16. *entropy — SciPy v1.17.0 Manual*. https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.entropy.html