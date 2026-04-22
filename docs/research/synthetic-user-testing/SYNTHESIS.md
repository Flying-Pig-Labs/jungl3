# Synthetic user testing drop, 2026-04-22: synthesis

## Preface

Five reports landed in this directory on 2026-04-22. Unlike clusters 1 and 2, they were not commissioned by a `run.py` run against a prompt set in this repo — they showed up as a user drop. Unlike the `sideband-2026-04-22/` reports (adjacent-market landscape), these are closer to the Jungle3 product surface and genuinely relevant to design.

They split into two groups:

- **Group A — AI-agent synthetic user testing (reports 01–04).** Claude Computer Use, Playwright MCP, multi-agent orchestration, persona-scoring frameworks. This touches the DMZ's "judging as interaction" model and the seeded-persona open question (`CLAUDE.md` §11 #9). It is **new capability territory**, not an ADR refinement.
- **Group B — AWS Marketplace monetization guide (`aws-marketplace-monetization-guide.md`).** Hits `CLAUDE.md` §11 open questions #1 (pricing), #2 (stack structure), #6 (account scenarios), #7 (IaC tooling), #8 (CI/CD) directly. Implementation-relevant, not novel.

This synthesis:
1. Summarizes what each report says.
2. Flags what it actually changes (or could change) for Jungle3.
3. Proposes — but does not draft — candidate additions to the ADR backlog.
4. Updates no policy documents. Decisions are the user's to make.

**Reading order:** §2 for what the reports contain, §3 for the Jungle3-specific consequences, §4 for candidate ADRs, §5 for what does *not* change, §6 for the disposition.

---

## 1. Framing

Jungle3 v1 has, on record (`docs/architecture/dmz.md`):
- **Seeded personas and test accounts** as a DMZ requirement.
- **Judging as interaction** — judges are assigned personas, given tasks, and score from what they experience, not from slide decks.
- An open question (§11 #9) on how DMZ auth is structured (magic link + password-guest + seeded persona + role-based is the recommendation on record, not decided).

The missing pieces these reports speak to:
- **Can a seeded persona be non-human?** I.e., an AI agent that walks through a prototype in a DMZ as though it were a specific kind of user (low-tech-literacy claims analyst, accessibility-constrained policyholder, ops auditor) before any human judge arrives, generating a clickstream, friction log, and "think-aloud" trace.
- **If yes, where does that capability sit?** In the DMZ itself? In a new domain (`synthetic-testing/` as a top-level subdir per `CLAUDE.md` §4)? Inside the existing Agent Layer?
- **How is it monetized?** The Marketplace report closes most of the v1 monetization open questions.

---

## 2. What each report says

### 2.1 Report 01 — Existing platforms and benchmarks

The 2025 landscape bifurcated into two categories that get conflated:

- **Agentic execution:** closed-loop systems that perceive a GUI, plan, and act autonomously. Examples: WebArena, OSWorld, AgentBench benchmarks; BrowserGym, Playwright AI execution toolkits; Skyvern, Simular agentic startups; specialized perception models (UI-JEPA, OmniParser, UGround).
- **AI-assisted analytics:** LLMs summarizing human-generated session data. Examples: UserTesting AI, Maze, Hotjar AI.

OSWorld (369 desktop tasks across Ubuntu/Windows/macOS) and WebArena (812 long-horizon web tasks) are the execution-based benchmarks. Maze has an AI moderator running autonomous interviews across time zones. The report recommends a **three-phase rollout**: smoke-testing agents → exploratory agents → persona-driven UX agents.

**Most relevant to Jungle3:** the distinction between execution and analytics. Jungle3 would be in the execution category — an agent acting as a seeded persona inside a DMZ-hosted prototype.

### 2.2 Report 02 — AI computer-use tech (Claude vs OpenAI Operator)

Two paradigms:
- **Anthropic Claude Computer Use:** low-level API, visual coordinates, developer builds the agent loop. Opus 4.7 supports resolutions up to 2576px, drag-and-drop, zoom, modifier-key clicks.
- **OpenAI Operator / CUA model (GPT-5.4):** integrated browser loop, RL-trained specifically for GUIs.

Architecture pattern: **CDP bridge** (Chrome DevTools Protocol) + agent "observes visually, acts via stable accessibility tree IDs" (Stagehand, Browser Use). Ephemeral Docker + Xvfb for isolation.

**Risks named:**
- Prompt injection via malicious webpage text is the critical threat. Both vendors have classifier-based defenses, but defense-in-depth (allowlisted egress, ephemeral credentials, HITL for destructive actions) is mandatory.
- Cost and latency are non-trivial: $0.50–$2.00 per complex action; agents run ~10× slower than scripted automation.
- **Hybrid strategy recommended:** AI for exploration, Playwright for deterministic regression.

**Most relevant to Jungle3:** the security posture and the hybrid pattern. A DMZ-hosted prototype being probed by an AI persona is exactly the shape where prompt injection from untrusted UI content matters — the prototype itself is untrusted (it was written in a sprint, against a synthetic Understory, by a team Jungle3 does not certify).

### 2.3 Report 03 — Persona simulation methodology

The methodological core. Key findings that directly bear on how a Jungle3 persona would be built:

- **Fidelity gap:** persona variables explain <10% of variance in highly subjective NLP tasks; up to 81% in high-predictability domains. Synthetic personas are good at functional task-success; weak on emotional resonance.
- **PII leakage via Chain-of-Thought:** Think-Aloud protocols (which is what you'd want from a persona) increase PII leakage by 34 percentage points (52.3% → 86.3%). If we ever ask a persona to reason out loud over real or near-real data, reasoning traces become an exfiltration channel.
- **Determinism deception:** even with `temperature=0` and fixed seed, backend "system fingerprints" drift. Longitudinal auditability requires version-locking and fingerprint logging.
- **"OK" bias:** synthetic users rate systems ~50.9 mean on SUS (System Usability Scale), "OK," which masks real functional failures.
- **Dual-loop architecture (UXAgent):** Fast Loop for perception/action, Slow Loop for wondering/reflection — mimics human cognitive drift.

Recommended **6-point persona schema:** demographics, tech proficiency, goals & frustrations, mental model, accessibility needs, language style.

**Most relevant to Jungle3:** the PII leakage risk and the determinism-logging requirement. Both feed directly into [ADR 0009's](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) audit chain (persona reasoning traces would need the same tamper-evidence treatment as operational events) and [ADR 0007's](../../decisions/0007-v1-cost-profile-and-llm-metering.md) LLM budget ceiling (Think-Aloud is token-expensive).

### 2.4 Report 04 — Build-it-yourself with Claude SDK

Architecture patterns for a ground-up implementation:

- **Planner-Executor split:** Claude Computer Use as Planner (visual reasoning, high-level intent), Playwright MCP as Executor (accessibility-tree references, deterministic actions). Bridged by a JSON action-plan contract so credentials never flow to the LLM.
- **Multi-agent roles:** Planner → Navigator → Observer → Critic → Evaluator. Each is a specialist; a dedicated Critic verifies DOM state changes after actions. Output is a `PersonaScore` (0–100).
- **Infrastructure options:** BrowserBase (managed cloud browsers + proxy rotation + CAPTCHA solving), Steel (open-source browser API), Stagehand (Playwright + LLM primitives), Vercel's agent-browser (Rust daemon, low-token snapshots).
- **Cost:** ~$0.53 per complex action without caching; Stagehand's server-side caching can make repeat runs ~free.

**Most relevant to Jungle3:** the Planner-Executor contract pattern is directly compatible with our Agent Layer's existing `{status, summary, evidence, recommended_action}` response contract ([ADR 0002](../../decisions/0002-sub-agent-response-contract.md)). A synthetic-user-tester *would be a specialist sub-agent* in the existing Agent Layer, not a new architectural primitive.

### 2.5 Report 05 — AWS Marketplace monetization guide

Directly actionable material for the Marketplace listing open questions:

- **Fee structure:** tiered SaaS listing fees (3% under $1M TCV, 2% $1M–$10M, 1.5% above $10M); flat 1.5% on renewals; +0.5% uplift for Channel Partner Private Offers.
- **Private Offers:** negotiate custom pricing/EULAs; installment plans supported; BYOL not supported.
- **Concurrent Agreements:** starting June 1, 2026, new SaaS products must use `CustomerAWSAccountId` + `LicenseArn` to support multiple purchases per account.
- **Metering:** `BatchMeterUsage` API, up to 25 `UsageRecords`/request, <1 MB payload, 6-hour active backfill window, 1-hour cancellation window.
- **CDK → Marketplace:** synthesize CDK to CFN, validate with TaskCat across regions, use `cfn-guard` for policy checks, hooks for security rules. IAM must be least-privilege; no long-term access keys.
- **AMIs:** EC2 Image Builder + CIS Benchmarks + Amazon Inspector scanning; SSM Patch Manager for lifecycle.
- **Go-to-market:** ACE program for co-sell; channel partners (CPPO) realize 234% ROI and 50% faster closures (Forrester); 14× YoY enterprise software growth cited (Contentsquare).
- **Compliance:** W-9/W-8 onboarding; Standard Contract for AWS Marketplace (SCMP) to reduce legal friction on private offers.

**Most relevant to Jungle3:** this is implementation guidance for questions the repo has already decided to face ([ADR 0003](../../decisions/0003-installable-via-aws-marketplace.md)) but not yet specified. It is not "a new idea"; it is "a pre-written answer key" for the v1 Marketplace work. No ADR impact yet, but high-value when we reach that work.

---

## 3. What this drop actually changes for Jungle3

### 3.1 The DMZ's "seeded personas" requirement can be read two ways

The DMZ doc says (`docs/architecture/dmz.md`):

> Users do not invent credentials; they pick a persona.

That has always been interpreted as **human users picking a persona**. Reports 01–04 open a second reading: **an AI agent, acting as the persona, performing a pre-human test pass before humans arrive**. Concretely, the value proposition would be:

- A prototype deploys to the DMZ.
- Before a judge logs in, a persona-driven agent (e.g., "low-tech-literacy claims analyst persona") navigates the prototype end-to-end, produces a clickstream, a friction log, a Think-Aloud trace, and a `PersonaScore`.
- When a human judge arrives, they have that pre-pass as context — they know where the rough edges already are, and they can focus on emotional/subjective judgment (where synthetic users are weakest, per report 03's fidelity gap).

This is a genuinely new capability. It is not in any current ADR. It fits naturally into the existing Agent Layer (as another specialist per [ADR 0002](../../decisions/0002-sub-agent-response-contract.md)) rather than requiring a new architectural layer.

### 3.2 Three Jungle3-specific risks the reports surface

1. **Prompt injection via a prototype's own UI (report 02).** Jungle3-built prototypes are *specifically untrusted* — they were shaped in a sprint, they're not certified. If an AI persona probes them, the prototype's page text can attempt to hijack the persona's tool use. Mitigation is the standard defense-in-depth stack (allowlisted egress, ephemeral creds, HITL on destructive actions, content boundaries) but it must be a built-in of any Jungle3 synthetic-testing facility, not an afterthought.
2. **Think-Aloud + PII = 86% leakage rate (report 03).** If personas are ever pointed at real or scrubbed-but-traceable data, their reasoning traces can resurface that data in the clear. Synthetic-only data is the standing rule ([ADR 0003](../../decisions/0003-installable-via-aws-marketplace.md), `CLAUDE.md` §11 #14), which mitigates most of this, but persona reasoning traces themselves would still need the audit-chain treatment ([ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md)) since they may contain synthetic persona detail the install wants to tamper-evidence for judging integrity.
3. **"OK" bias means persona-only judging is unsafe.** SUS ~50.9 mean from synthetic users masks functional failures. Synthetic-persona testing **supplements** human judging; it does not replace it. Any Jungle3 capability here should be framed as *pre-pass*, not *judgment*. The human-in-the-loop calibration loop in report 03 §4.2 is the right pattern.

### 3.3 The Marketplace report is an answer key, not an insight

Report 05 is directly useful when we start the Marketplace listing work, but it doesn't pressure any existing ADR. [ADR 0003](../../decisions/0003-installable-via-aws-marketplace.md) committed to the Marketplace path; this report gives us:
- A concrete fee model for #1 (pricing).
- A reason to lean toward nested-optional-components stack for #2 (so Private Offers can package differently).
- A validation tool (TaskCat) for #5 (supported regions).
- A CDK→CFN synthesis pipeline for #7 (IaC authoring tool).
- A `cfn-guard` + CloudFormation Hooks pattern for #8 (CI/CD).

None of these are decisions we need to make today. But when we do, this report reduces the research burden to almost zero.

---

## 4. Candidate additions to the ADR backlog (not drafts)

These are *candidates for user consideration*, not proposals I've drafted. They follow the same restraint as the cluster-2 synthesis (`deep-research-2026-04-22/SYNTHESIS.md` §4).

1. **"Synthetic-user-tester as an Agent Layer specialist."** Decide whether the persona-as-agent capability lives as a new `synthetic-user-testing/` domain (per `CLAUDE.md` §4), as a specialist sub-agent inside the existing Agent Layer (per [ADR 0002](../../decisions/0002-sub-agent-response-contract.md) + `docs/architecture/agent-layer.md`), or as a DMZ-side capability. Leaning toward Agent Layer specialist; the response contract is already right.
2. **"Pre-human pass vs. replacement."** Decide the framing: synthetic-persona testing runs *before* human judging, as context. Non-decision: replacing human judging with synthetic-persona scoring. Report 03's "OK" bias makes replacement unsafe.
3. **"Planner-Executor split adopted for browser-capable agents."** If Jungle3 ever runs a browser-capable agent (synthetic user tester or otherwise), the split is Claude Computer Use as Planner + Playwright MCP as Executor, bridged by a JSON action-plan contract. Credentials never reach the LLM. Directly derivable from report 04.
4. **"Persona schema pinned."** If we adopt synthetic-persona testing, pin the 6-point schema (demographics, tech proficiency, goals/frustrations, mental model, accessibility needs, language style) from report 03 §2.1.
5. **"Persona reasoning traces are audit events."** Extend [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md)'s hash-chained audit trail to cover persona reasoning traces (Think-Aloud content) when persona testing is active. Or deliberately carve them out with a documented reason.

And two Marketplace-shaped candidates, derived from report 05 plus `CLAUDE.md` §11 items 1/2/7/8:

6. **"Marketplace pricing model v1."** Use report 05 §1.1 fee structure; decide between free-tier, subscription, private-offer-only. Closes `CLAUDE.md` §11 #1.
7. **"Marketplace stack structure."** Decide single-stack vs nested-optional-components. Report 05 argues for nested given the Private-Offer / Channel Partner patterns. Closes `CLAUDE.md` §11 #2.

---

## 5. What this drop does *not* change

- **No accepted ADR is contradicted.** ADRs 0001–0010 all hold.
- **No current ADR candidate (cluster 2's seven queued candidates) is pressured.** They still stand on their own.
- **No `CLAUDE.md` §11 entry is resolved by this drop alone.** Items 1, 2, 7, 8, 9 are *informed*, not *answered*. The informing is valuable; the answering remains the user's call.
- **No architecture doc is rewritten.** In particular, `docs/architecture/dmz.md` stands. If a synthetic-user-tester capability is adopted, it probably lives in `docs/architecture/agent-layer.md` (as a specialist) with a cross-reference from the DMZ doc, not as a new DMZ-side primitive.
- **No new open question is added to `CLAUDE.md` §11.** The candidates in §4 above are ADR candidates, not unresolved questions; they would be answered by drafting the ADRs, not by research.

---

## 6. What might become actionable later

A watchlist, not a backlog:

1. **Claude Computer Use + Playwright MCP combo as the reference implementation** for any Jungle3 browser-capable agent. If the user approves candidate ADR #3 above, this becomes the adopted pattern.
2. **PersonaGym (report 04) as a possible evaluation framework** if synthetic-user-testing is adopted. Gives us a PersonaScore metric without building one from scratch.
3. **UXAgent's dual-loop architecture** (fast perception/action + slow reflection) as the cognitive model for any persona agent, rather than a single-loop prompt-in-prompt-out shape.
4. **BrowserBase or Steel** as managed execution infrastructure, instead of running our own browser farm. Both handle the prompt-injection and isolation story adequately; BrowserBase integrates with Stagehand.
5. **TaskCat** for cross-region CFN validation when the Marketplace listing work begins.
6. **`cfn-guard` + CloudFormation Hooks** for listing-stack policy validation. Replaces a hand-rolled lint pass.
7. **Concurrent Agreements (report 05)** as a design constraint for the SaaS integration, since it becomes mandatory for new listings starting 2026-06-01 — which is six weeks from today.
8. **CPPO / Channel Partner Private Offers as a v2+ motion**, once there's a v1 listing to wrap.
9. **Env0-style TTL patterns (from `sideband-2026-04-22/05-synthetic-data-and-chaos-engineering.md`)** remain relevant here too — a synthetic-user-testing run is itself an ephemeral compute workload with a natural TTL.

---

## 7. File disposition

All five reports stay. No renames. No moves. Specifically:

- `01-existing-platforms.md` — landscape reference; keep in place.
- `02-ai-computer-use-tech.md` — technical reference for Claude/OpenAI paradigms; keep.
- `03-persona-simulation-methodology.md` — methodological reference; keep.
- `04-build-it-yourself-claude-sdk.md` — build-pattern reference; keep.
- `aws-marketplace-monetization-guide.md` — answer-key for Marketplace open questions; keep.

The directory is `synthetic-user-testing/`, not `sideband-2026-04-22-*/` or `deep-research-2026-04-22-*/`, because it was user-dropped rather than commissioned. The filename convention drift is noted in [`../README.md`](../README.md) §Filename conventions; not renaming to preserve user-intended semantics.

---

## Ledger

- Reports read: 5, total ~64K words.
- ADR amendments: 0.
- New ADRs drafted: 0.
- Candidate ADRs named (for user consideration): 7 (5 synthetic-user-testing, 2 Marketplace).
- `CLAUDE.md` §11 open questions informed: 5 (#1, #2, #7, #8, #9); resolved: 0.
- New `CLAUDE.md` §11 open questions proposed: 0.
- Architecture docs changed: 0.
- Risks named: 3 (prompt injection from untrusted prototype UI, Think-Aloud PII leakage, "OK" bias masking functional failure).
