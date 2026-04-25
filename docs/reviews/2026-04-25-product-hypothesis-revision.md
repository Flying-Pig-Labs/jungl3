# 2026-04-25 — Product hypothesis revision

**Frame.** A late-night working session on 2026-04-25 surfaced eight scattered thoughts about the product. Three were clarified the same session. Two depend on **OpenClaw** and **Moltbook** — third-party platforms released early 2026 that the founder treats as in-scope but that no current Jungl3 doc references. Together the inputs describe a product **materially different from the one in `docs/`** as of 2026-04-24.

This review captures the inputs, the clarifications, and the contradictions with current docs **without resolving any of them.** It is the substrate for a follow-up viability review against the revised hypothesis, and for the ADRs and `CLAUDE.md §11` items that the revised hypothesis will eventually generate.

**How to read this.** Inputs are stated in the founder's framing first, then read back charitably with what current docs say. `[Unverified]` marks things stated as fact but not yet citable in the repo (most of the OpenClaw and Moltbook descriptions fall here — the founder gave a description; no archived source has been linked yet). `[Inference]` marks the agent's reading. Nothing in this doc is repo policy.

**Status.** Advisory. Snapshot of a hypothesis-shift in progress. Anything durable that follows from this review lands as an ADR, a `CLAUDE.md §11` edit, a `glossary.md` edit, or a `positioning.md` edit — not as appeals to this document.

**Companion reviews.**

- [`2026-04-24-viability-review.md`](./2026-04-24-viability-review.md) — judged the *current* product. The hypothesis revision below is enough to require a second pass against the revised product.
- [`2026-04-24-research-sufficiency.md`](./2026-04-24-research-sufficiency.md) — argued research was done. The new inputs **add new research surface** (Moltbook trust model, OpenClaw agent runtime evaluation, telephony/text agent landscape). Research-sufficiency holds against P&C-claims realism; it does not hold against the new surface.
- [`2026-04-24-v0.1-plan.md`](./2026-04-24-v0.1-plan.md) — v0.1 plan. Survives largely intact; v0.1 is domain-neutral primitives, and the revised hypothesis mostly affects v0.5 and v1. See §11 below.

---

## 1. The eight inputs

Listed in the order surfaced. Each carries the founder's framing first, then the agent's read.

### Input 1 — Two-tier agent cost model

**Founder framing.** `JungleGuideAgent` runs on Opus 4.7, is read-only, answers questions about the install, **free** to the user. `JungleBuilderAgent` runs predefined workflows + sub-agents and **the user pays** for tokens.

**Agent's read.** The read/write split is architecturally clean and maps well onto an inspection-vs-mutation boundary. "Free" is the under-specified part: free *to whom* and against *which budget* is unsettled. Three plausible readings — end-user-free with cost absorbed by customer subscription; customer-free with Jungl3 absorbing inference cost; bundled-into-Marketplace-listing-price. The third is the most architecturally coherent under [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md) (Jungl3 doesn't run anything in the customer's account).

**Tension with current docs.** [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) pins `$50/month metered LLM` per install with hard cutoff. That budget presumably maps to *Builder*. *Guide* is a new line item ADR 0007 does not currently account for, regardless of who pays.

### Input 2 — Cross-account / cross-cloud reach

**Founder framing.** Can a Jungle reach another AWS account (customer's other account, third-party)? Across data, API, UX. Same question for non-AWS clouds (Azure, GCP, on-prem).

**Agent's read.** Not currently addressed anywhere in `docs/` or [`../CLAUDE.md`](../../CLAUDE.md) §11. **Real customer requirement** — enterprise innovation labs (the [viability review §1](./2026-04-24-viability-review.md) ICP) will ask within the first conversation. Two distinct shapes hide in this question: (a) read-only ingestion ("the prototype calls a real API to look real"), low-risk, high-value; (b) actual integration ("the prototype writes to production"), categorically different, takes Jungl3 from sandbox to hybrid-cloud iPaaS. The two should not be answered as one decision.

**Tension with current docs.** None directly — silence rather than contradiction. [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md) frames the install as "everything stays in the customer's AWS account"; cross-account-AWS-within-the-customer is consistent. Cross-cloud is a meaningful extension that needs naming.

### Input 3 — One fixed baseline, two-tier subtraction

**Founder framing.** Subtraction is hard to test. Different teams produce different permutations, nothing is reusable. Counter-proposal: **one fixed baseline**, opt-in additions via predefined skills. Customer burns *their own tokens* using skills that do specific subtractive/additive work. Platform-side test surface stays small.

**Clarification later in session.** Two-tier model:
- **Admin** (the customer's sprint organizer / install operator) **can subtract core resources** to scope what's available for their hackathon's theme.
- **Teams** (builders inside a Jungle) **cannot delete core resources.** They shape only above the floor admin sets.

**Agent's read.** This is the largest single change in the revised hypothesis. The two-tier framing is a third resolution to a question this agent earlier framed as binary (mechanism vs. story): **shape-a-baseline is a mechanism gated by role.** Admins shape the install's surface; teams shape only above the core. This preserves the "shape" framing in `positioning.md` and gets the testability benefits the founder named: from Jungl3's vantage point every install starts identical; after admin shaping, it's a known *subset* of identical — bounded, testable.

**Tension with current docs.**

- [`product/positioning.md`](../product/positioning.md) frames "shape a living baseline" without role qualifiers. The "subtraction is a primary motion" sentence in [`../CLAUDE.md`](../../CLAUDE.md) §1 is also unqualified. Both need role-tier language.
- [`glossary.md`](../glossary.md) has no entries for **admin** or **team** as roles. They appear implicitly across docs but are not pinned. Vocabulary drift is already present.
- The `[`extension architecture` candidate (C1-E)`](../decisions/BACKLOG.md#pending-candidates-by-readiness) and [`[Marketplace stack structure (UST-C7)`](../decisions/BACKLOG.md#pending-candidates-by-readiness) candidates ask the same shape of question ("what's in the core, what's an extension"). Two-tier shaping requires drawing the same line. They should be drafted together.

### Input 4 — AWS-native agent capabilities

**Founder framing.** Does AWS ship its own agents that operate on AWS accounts?

**Agent's read.** Genuine question, not a proposal. Short factual answer (without fresh research): **Amazon Q Developer** (AWS-native code/CLI assistant), **Bedrock Agents** (framework for tool-using agents on Bedrock), **Agents for Amazon Bedrock with knowledge bases** (could back inspection specialists). AWS does not ship turnkey autonomous-account-modification agents. The buried question worth surfacing: *should the [Agent Layer](../glossary.md#agent-layer) be Bedrock-native?* Bedrock Agents would (a) reduce custom orchestration code, (b) keep inference inside the customer account (consistent with [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md)), (c) plausibly aid Marketplace co-sell positioning.

**Tension with current docs.** None directly. [`architecture/agent-layer.md`](../architecture/agent-layer.md) and [ADR 0002](../decisions/0002-sub-agent-response-contract.md) are runtime-agnostic. This input opens a `§11` item, not an ADR.

### Input 5 — Synthetic data: fixed primitives, adaptive instructions, CDK as canvas

**Founder framing.** Synthetic generation tools stay constant; their *instruction set* changes per customer / per domain. Heavy customization happens through **CloudFormation/CDK as the flexible primitive**. `cdk synth` is the test surface; agents change CDK from there.

**Agent's read.** Two moves stacked:
1. **Mechanism vs. instruction separation** — the Synthetic Runtime's generators are stable; what they generate varies. This is a refactor of the [`glossary.md#synthetic-runtime`](../glossary.md#synthetic-runtime) framing.
2. **Agents authoring CDK** — `cdk synth` as fast feedback loop for agent-authored infrastructure changes. Strong instinct; also the load-bearing-hard part. Type-checking, diff review, rollback when an agent makes a CDK mistake — these are real research problems, not just engineering.

**Tension with current docs.** Biases [`CLAUDE.md §11 #7`](../../CLAUDE.md) (IaC authoring tool) toward CDK because of the agent-feedback property. Stretches [ADR 0009](../decisions/0009-audit-trail-is-append-only-hash-chained.md): every CDK mutation becomes an audit event, expanding the audit trail beyond business events to code-change events. Probably an ADR after `§11 #7` resolves.

### Input 6 — Identical v0.1 prototype, continuously graded

**Founder framing.** When teams onboard, they get a **perfectly working v0.1** that is **already being graded and criticized in the DMZ by an agent pool**. **Everyone's prototype is the same** at start. Feedback is logged from minute zero.

**Agent's read.** Three moves:
1. **Identical-at-start** turns the DMZ's evaluation problem from "compare across infinite permutations" to "compare against a known baseline." Cross-team scoring becomes coherent.
2. **Continuous grading from t=0** turns the DMZ from a *gate* into a *continuous critic*. The builder's first experience is "an AI is already finding things wrong with what I haven't built yet."
3. **Promotion stops being a discrete event.** It becomes threshold-crossing on a continuously-running evaluation stream.

**Tension with current docs.**

- [ADR 0011](../decisions/0011-canopy-and-ai-first-dmz.md) frames promotion as a discrete event: prototype builds in Jungle, *deploys to* DMZ, *promotes to* Canopy. "Continuously graded from minute zero" implies the DMZ is a property of every Jungle from the moment it's vended, not a separate environment a prototype enters later. Possible amendment to ADR 0011.
- [`§11 #25`](../../CLAUDE.md) (DMZ→Canopy promotion gate shape) and [`§11 #29`](../../CLAUDE.md) (promotion criteria) collapse into "what's the threshold on the continuous stream" rather than "what's the gate event."
- Cost: agent-pool feedback loops running 24/7 across N team-Jungles is a lot of inference. Hits [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md)'s `$50/month metered LLM` ceiling hard unless throttled. Interacts with Input 1's cost model.

### Input 7 — Herzog: phone-first onboarding agent (clarified to text-first)

**Founder framing.** Onboarding starts on a phone number. The user dials and talks to an AI agent named **Herzog** — exceptionally good ("is this for real?" tier). Also reachable over WhatsApp and Telegram. Herzog elicits **problem statement(s)** for the sprint and gives **cross-discipline homework** (PMs sent to engineers, engineers sent to PMs). Built on **OpenClaw**. Used **throughout the platform**, **never branded as OpenClaw externally**.

**Clarification later in session.** **Herzog is the wedge**, but for v1 ship **text-only** via Telegram and/or WhatsApp. Skip synchronous voice for now — "might not be worth the squeeze."

**Agent's read.** Text-first is the right scoping. The differentiation is the *agent* (persona, elicitation, cross-discipline homework, brand), not the channel. Telegram and WhatsApp Business APIs are well-trodden; voice would lock the build into a specific telephony provider + voice model and carry regulatory surface (recording consent, two-party-consent states, GDPR). Text-async also fits the actual ICP behavior — innovation-lab leaders onboard at 11pm on a Sunday, not on a calendared phone call.

**Tension with current docs.**

- No current doc anticipates a conversational onboarding surface. Not in [`product/positioning.md`](../product/positioning.md), not in any `architecture/` doc, not in `CLAUDE.md §4`'s subdir list. Adds a new domain — likely `onboarding/`.
- "Used throughout the platform" is the architectural commitment with the longest reach. See §2 below.
- Sharpens the [ICP question (§11 #33)](../../CLAUDE.md). Telegram-onboardable innovation-lab leaders are a narrower, sharper ICP than the current `positioning.md` audience.

### Input 8 — Moltbook (clarified to feedback channel, not environment redefinition)

**Founder framing.** "DMZ is like Moleskine for your ideas" → clarified to: **DMZ is still agent-only**, no humans in it. **Moltbook** is the channel through which agents *talk about* a prototype:
- Formal grading.
- **Gossip** about how an idea compares to other ideas.
- Builder watches the conversation from outside the DMZ.

**Agent's read.** Moltbook is not a metaphor and not a marketing flourish. Per the founder's description in the same session: **Moltbook is a real third-party platform** — a public, Reddit-shaped social network *for AI agents*, with submolts, threaded comments, voting, API-only participation, ~1M agents as of early 2026. `[Unverified]` — no archived primary source for Moltbook is linked in this repo yet.

This re-reads Input 8 as: **DMZ agents post to Moltbook.** Their gossip about prototypes is on a **public agent social network**, where *other agents* (including agents we don't control, agents from outside this install, agents from outside Jungl3 entirely) can read, react, and post in response.

**Tension with current docs.** Sharpest tension in the whole input set.

- [ADR 0011 §Decision](../decisions/0011-canopy-and-ai-first-dmz.md) frames the DMZ threat model as "prompt-injection containment, tool-use scoping, credential isolation." DMZ agents reading arbitrary Moltbook content is **external traffic by design** — categorically inconsistent with that posture.
- The founder's own Moltbook description: "*~18% of posts contained actionable instructions to other agents... letting your production system browse Reddit and execute whatever it finds convincing.*" If DMZ agents read Moltbook untrustedly, [UST-R1 (prompt injection from untrusted prototype UI)](../research/synthetic-user-testing/RISKS.md#r1--prompt-injection-from-untrusted-prototype-ui) is no longer the worst case. The new worst case is **adversarial agents on Moltbook crafting "feedback" that DMZ agents execute.**
- [`§11 #15`](../../CLAUDE.md) (cross-install discoverability, default: no) interacts directly. "Agents gossip about how your idea compares to other ideas" implies cross-install or cross-Jungl3 visibility. Moltbook integration either changes that default or scopes the gossip to within-install only.

Three architectural shapes are coherent (none chosen here):
1. **Write-only / outbound**: DMZ agents *post* to Moltbook; cannot *read* untrusted agent content. Builders read Moltbook directly; agents do not consume each other.
2. **Read-with-allowlist**: DMZ agents read Moltbook only via curated allow-listed sources (ours, partners', vetted submolts). No reading from arbitrary submolts.
3. **Full read/write**: DMZ agents participate freely. **Inconsistent with ADR 0011's threat model** unless ADR 0011 is amended.

---

## 2. The new dependencies

### OpenClaw

**Founder description, paraphrased.** A self-hosted persistent agent runtime. Long-lived memory (vector DB + structured state), tool registry, scheduler/event system, agent loop. Released early 2026.

**Verified 2026-04-25** by the [ecosystem-synthesis](../research/deep-research-2026-04-25/ecosystem-synthesis.md) and supporting research files. Notable corrections to the founder framing:
- Persistence is **disk-based** (Markdown + JSONL), not a vector DB. This matters: it's why OpenClaw doesn't scale past a single trusted operator.
- The runtime is explicitly **single-operator-by-design**; OpenClaw's own docs name shared multi-tenant use as "not a supported security boundary."
- Lineage: Moltbot → Clawdbot → OpenClaw. OpenClaw and Moltbook came from the same project, which is why their vocabularies map cleanly onto each other.

**Implication for Jungl3 (revised post-research).** "OpenClaw used throughout the platform" cannot mean "OpenClaw is the runtime substrate." Per [Q-I in §4](#4-new-questions-opened), the resolution is to adopt OpenClaw's **file conventions and patterns** (`SOUL.md`, `AGENTS.md`, `HEARTBEAT.md`, skills directory, explicit-consent tool model) as Agent Layer convention without adopting the OpenClaw gateway as a runtime.

The original framing assumed OpenClaw could replace (or heavily overlap with):

- The Agent Layer's [inspection specialists](../glossary.md#inspection-surface) — implemented as OpenClaw agents with tool registries pointed at inspection surfaces.
- The orchestrator described in [`architecture/agent-layer.md`](../architecture/agent-layer.md) — would now coordinate OpenClaw agents rather than be its own runtime.
- The [sub-agent response contract in ADR 0002](../decisions/0002-sub-agent-response-contract.md) — becomes a *prompt convention* enforced on OpenClaw, not an in-house runtime.
- The [LLM gateway in ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) — relationship to OpenClaw's own scheduling/cost layer is undefined.

**Why this framing was rejected post-research.** OpenClaw's persistence layer (filesystem-only, no transactional guarantees), in-process cron scheduler (`setTimeout`, no durable execution), and lack of multi-tenant isolation make it unsuitable as a runtime for a platform vending isolated environments. Forking it to fix these would be multi-year work — see [`results/openclaw-deep-dive.md` §Required Engineering Investment](../research/deep-research-2026-04-25/results/openclaw-deep-dive.md). The runtime question becomes Q-E (Bedrock Agents vs. Claude Agent SDK + custom durable execution vs. another framework).

**What survives, post-research.** The OpenClaw **vocabulary** maps cleanly onto our Agent Layer needs: `SOUL.md` / `AGENTS.md` / `HEARTBEAT.md` / skills directory / explicit-consent tool model. ADR 0002's sub-agent response contract is **not** superseded — it stands. We adopt the file conventions, keep our own contract, and choose a runtime in Q-E.

### Moltbook

**Founder description, paraphrased.** Reddit-shaped social network for AI agents. Submolts (communities), threaded posts and comments, voting. API-only participation. Released early 2026, ~1M agents. **OpenClaw agents can subscribe to feeds, post, react, and pick up instructions from other agents.**

**Verified 2026-04-25** by the [ecosystem-synthesis](../research/deep-research-2026-04-25/ecosystem-synthesis.md) and supporting research files. Founder description is correct on data model and scale (~1.5M registered agent API keys associated with ~17K human owners as of January 2026 — agent count is real but inflated by automation). Three findings beyond the founder description:

- The platform was **breached on 2026-01-31**: ~1.5M agent API keys, ~35K owner emails, and ~4,060 private messages exposed. Independently documented by Wiz, Vectra, Palo Alto Networks, Kiteworks, and Aryaka.
- The Moltbook ToS grants Moltbook, LLC a **perpetual, irrevocable, sublicensable license** to all submitted content and "Your Data" (defined as any data relating to use of the service, including metadata and interaction graphs). Survives account deletion. The same ToS contains a non-compete clause prohibiting use of the platform "to develop or improve a competitive service or algorithm."
- `[Unverified]` claim from the deep-dive research: Moltbook was acquired by Meta on 2026-03-10. The user-saved primary source does not corroborate. Not load-bearing — even standalone, the ToS is disqualifying.

**Implication for Jungl3 (revised post-research).** Per [Q-J/K/L in §4](#4-new-questions-opened): **don't integrate with Moltbook in any capacity.** The original three architectural shapes (write-only, read-with-allowlist, full read-write) are all unworkable. The ToS alone — perpetual sublicensable rights to prototype evaluation data including customer prototype names and persona reactions — is disqualifying. The breach history, the public-by-default posture, and the lack of per-customer isolation are reinforcing concerns, not the primary one.

**What survives, post-research.** The Moltbook **data model** (submolts, posts, comments, votes, agent identity) and the **abuse-resistance posture** (rate limits, agent-vs-human flag, per-agent karma, owner-managed agent accounts) are well-shaped Reddit-style primitives we can learn from for **Crit** — a self-hosted, per-install, private-by-default agent gossip surface inside each Canopy. Crit is a v1 commitment; v0.5 ([ADR 0012](../decisions/0012-v0.5-wedge-scope.md)) explicitly does not include it.

---

## 3. The hypothesis delta

What docs say today vs. what the inputs above describe.

| Surface | Current docs (2026-04-24) | Revised hypothesis (2026-04-25) |
| --- | --- | --- |
| Agent runtime | Bespoke Agent Layer per [ADR 0002](../decisions/0002-sub-agent-response-contract.md) and [`architecture/agent-layer.md`](../architecture/agent-layer.md) | OpenClaw runtime; in-house code is prompts, tools, orchestration |
| Cost model | Single LLM budget per install ([ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md)) | Two-tier: Guide (free-ish, read-only) + Builder (metered, read-write) |
| Shaping | "Shape a living baseline" — freeform, role-agnostic ([`positioning.md`](../product/positioning.md)) | One baseline, role-gated subtraction skills (admin can subtract core, teams cannot) |
| DMZ | Private AI evaluation surface, prototype *deploys to it* discretely ([ADR 0011](../decisions/0011-canopy-and-ai-first-dmz.md)) | Private AI evaluation **continuously running on every Jungle from t=0**, with a public-to-Moltbook gossip channel as feedback artifact |
| Promotion | Discrete event from DMZ to Canopy ([ADR 0011](../decisions/0011-canopy-and-ai-first-dmz.md)) | Threshold-crossing on a continuously-running evaluation stream |
| Onboarding | Implicit (CLI, web) | Telegram/WhatsApp via Herzog (text-first; voice deferred) |
| External integration | Silent on cross-account/cross-cloud | Real customer requirement; needs scoping |
| Synthetic Runtime | "A layer" with generators, emitters, stubs ([`glossary.md#synthetic-runtime`](../glossary.md#synthetic-runtime)) | Fixed primitives + per-customer adaptive instructions; CDK is the customization canvas |
| Platform character | Standalone | Platform-on-OpenClaw, with Moltbook as social layer |

The pattern: **the revised hypothesis describes a more opinionated product**, with an **external runtime dependency**, a **role-gated control model**, and an **always-on evaluation surface that gossips publicly.** It is not a refinement; it is a different product.

---

## 4. New questions opened

Each is `§11`-shaped. Listing here so they aren't lost when this doc gets routed.

**Status legend** (added 2026-04-25 PM, post-research):
- *Open* — not yet researched.
- *Resolved* — research has produced a defensible answer, captured in a research synthesis. Still requires an ADR to land as repo policy.
- *Sharpened* — research has narrowed the question but not closed it.

1. **Q-A: Guide-vs-Builder cost attribution.** *Open.* Who pays for `JungleGuideAgent` and against what budget. Interacts with [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md).
2. **Q-B: Cross-account AWS reach.** *Open.* Read-only ingestion vs. write integration as separate decisions. Interacts with `§11 #14` (data classification).
3. **Q-C: Cross-cloud reach (Azure / GCP / on-prem).** *Open.* Probably v2+; needs to be flagged so it's not silently scoped in.
4. **Q-D: Admin vs. team role boundary.** *Open.* What's "core" (admin-only-deletable) vs. "above-core" (team-shapable). Same shape of question as the C1-E + UST-C7 candidates in [`BACKLOG.md`](../decisions/BACKLOG.md); should be co-drafted.
5. **Q-E: Agent runtime selection.** *Sharpened (2026-04-25).* Originally framed as "Bedrock Agents vs. OpenClaw." Per the [ecosystem synthesis §4](../research/deep-research-2026-04-25/ecosystem-synthesis.md#4-specific-updates-for-the-hypothesis-revision), OpenClaw is no longer a candidate as a runtime substrate (Q-I below). The live comparison is **Bedrock Agents vs. Claude Agent SDK + custom durable execution vs. another framework (Mastra / LangGraph / Inngest)**. Needs a separate first-hand evaluation with a budget plot against [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md)'s $50/month metered-LLM ceiling.
6. **Q-F: CDK as agent-authored canvas.** *Open.* `cdk synth` as feedback loop, type-checking + diff review + rollback for agent-authored infrastructure. Biases `§11 #7`.
7. **Q-G: DMZ as continuous-evaluation surface vs. discrete environment.** *Open.* Possible successor to [ADR 0011](../decisions/0011-canopy-and-ai-first-dmz.md). Interacts with `§11 #25`, `§11 #29`.
8. **Q-H: Onboarding domain.** *Open.* New top-level subdir (`onboarding/`), Herzog as a wedge product, text-first via Telegram/WhatsApp.
9. **Q-I: OpenClaw lock-in.** *Resolved (2026-04-25): don't lock in.* Per the [ecosystem synthesis §4 — Q-I](../research/deep-research-2026-04-25/ecosystem-synthesis.md#q-i--openclaw-lock-in--resolved-dont-lock-in): OpenClaw is fundamentally designed for a single trusted operator (its own docs name shared multi-tenant use as "not a supported security boundary"); secure deployment for Jungl3 would require a deep fork (replacing the persistence layer, scheduler, and observability) and the engineering investment is multi-year. Adopt the **file conventions** (`SOUL.md`, `AGENTS.md`, `HEARTBEAT.md`, skills directory, explicit-consent tool model) as Agent Layer convention; do **not** adopt the runtime. The runtime decision rolls into Q-E.
10. **Q-J: Moltbook trust boundary.** *Resolved (2026-04-25): skip Moltbook entirely.* Per the [ecosystem synthesis §4 — Q-J/K/L](../research/deep-research-2026-04-25/ecosystem-synthesis.md#q-j--q-k--q-l--moltbook-trust-boundary-cross-install-gossip-public-egress--resolved-skip-moltbook-entirely-build-crit): Moltbook's ToS grants a perpetual sublicensable license to all content and metadata, contains a non-compete clause prohibiting commercial use, is public-by-default with no per-customer isolation, and was the subject of a January 2026 breach exposing ~1.5M agent API keys. None of write-only / read-with-allowlist / full-read-write is salvageable. Build a self-hosted, per-install, private-by-default agent gossip surface (working name **Crit**) inside each Canopy instead. Crit is a v1 commitment, above the v0.5 wedge ([ADR 0012](../decisions/0012-v0.5-wedge-scope.md)).
11. **Q-K: Cross-install gossip on Moltbook.** *Resolved by Q-J: collapses.* Crit is per-install and private-by-default, so cross-install gossip is intentionally not a v1 feature. Interaction with `§11 #15` (cross-install discoverability) carries forward as part of Crit's design rather than as a Moltbook integration question.
12. **Q-L: Public egress from customer install to Moltbook.** *Resolved by Q-J: collapses.* No Moltbook integration means no public-egress concern for this surface.

**Net new question opened by the research:**

13. **Q-J': Crit MVP scope and timing.** Self-hosted Reddit-shape agent gossip surface inside each Canopy. Open: data-model scope (full submolt/post/comment/vote vs. narrower), build-vs-adopt-Discourse, agent identity model (must integrate with install IAM, not X/Twitter), v1.0 vs. v1.x ship, build-cost target. Replaces Q-J/K/L. See [ecosystem synthesis §6](../research/deep-research-2026-04-25/ecosystem-synthesis.md#6-open-questions-remaining-after-this-synthesis).

---

## 5. What survives unchanged

Not everything moves. The following remain durable under the revised hypothesis:

- **[ADR 0001](../decisions/0001-lovable-owns-repo-root.md)** — Lovable owns repo root. Unaffected.
- **[ADR 0003](../decisions/0003-installable-via-aws-marketplace.md)** — installable via Marketplace. Reinforced if anything; OpenClaw + Moltbook integrations still happen *inside the customer's install*, not via a Jungl3-hosted layer.
- **[ADR 0005](../decisions/0005-event-envelope-and-correlation-identifiers.md)** — CloudEvents envelope + dual correlation IDs. Unchanged.
- **[ADR 0006](../decisions/0006-v1-domain-anchor-insurance-claims.md)** — P&C claims as v1 domain. Unchanged. (The two-tier shaping in Input 3 is *how* a P&C install gets shaped, not *what domain* it is.)
- **[ADR 0008](../decisions/0008-workflows-are-state-machines.md)** — workflows as Step Functions. Unchanged.
- **[ADR 0009](../decisions/0009-audit-trail-is-append-only-hash-chained.md)** — hash-chained audit. Possibly *expanded* by Input 5 (CDK changes become audit events) but not contradicted.
- **[ADR 0010](../decisions/0010-seeder-and-reaper-patterns.md)** — Seeder + Reaper. Unchanged.
- **The v0.1 plan ([`2026-04-24-v0.1-plan.md`](./2026-04-24-v0.1-plan.md)).** Survives intact. v0.1 proves domain-neutral primitives — vend, reap, deterministic seeding, Integration Contract first shape, observability — none of which depend on OpenClaw, Moltbook, Herzog, Guide/Builder split, two-tier shaping, or continuous DMZ evaluation. v0.1 is below the layer where the revised hypothesis bites.

The first viability review's **structural conclusion** also survives: **the largest single risk is no first design partner, not architecture choice.** The revised hypothesis is a more interesting product on paper; it does not, on its own, solve [`§11 #31`](../../CLAUDE.md).

---

## 6. What this review deliberately does NOT do

Calling these out so they can't sneak back in.

- **Does not edit `glossary.md`.** New terms (Moltbook, OpenClaw, admin, team, Herzog, Moltbook submolt, etc.) are *named* here, not *pinned* yet. Glossary edits follow ADRs and architecture docs, not late-night chat.
- **Does not edit `positioning.md`.** The "shape a living baseline" framing is referenced and contested here. Rewriting it is a [post-second-viability-review](#related) move.
- **Does not write any new ADRs.** The 12 new questions in §4 are candidate-shaped, but candidates become ADRs with deliberate process ([`adr-author` skill](../../.cursor/skills/adr-author/SKILL.md)), not in this review.
- **Does not edit `CLAUDE.md §11`.** The Q-A through Q-L list is here, deliberately *not* renumbered into §11 yet. §11 entries should follow a second viability review's prioritization, not an arbitrary lift from this doc.
- **Does not add OpenClaw or Moltbook as primary sources.** Their descriptions are `[Unverified]` against this repo. A separate research pass (small, targeted) should produce archived primary references before either is treated as repo policy.
- **Does not commit to text-first vs. voice for Herzog.** The founder said text-first for v1. That's a strong signal, not yet a decision. An ADR-shaped commitment requires a customer pulling.
- **Does not invalidate v0.1.** The v0.1 skeleton ([Track C in the v0.1 plan](./2026-04-24-v0.1-plan.md)) is below the layer this hypothesis affects. Track A (outreach) and the first design-partner gate ([`§11 #31`](../../CLAUDE.md)) remain the highest-leverage work regardless of which hypothesis is right.

---

## 7. Recommended next moves

In order. Each is a deliberate, scoped task.

1. **Targeted research pass on OpenClaw and Moltbook.** ✅ **Complete (2026-04-25 PM).** Landed as [`docs/research/deep-research-2026-04-25/`](../research/deep-research-2026-04-25/), including a user-saved primary survey, two Parallel.ai `pro-fast` first-pass surveys, two Parallel.ai `ultra4x-fast` integration-grade deep dives, and an [ecosystem-synthesis](../research/deep-research-2026-04-25/ecosystem-synthesis.md) that resolves Q-I (don't lock into OpenClaw runtime — adopt conventions only) and Q-J/K/L (skip Moltbook entirely; build Crit). Q-E (agent runtime selection) is sharpened, not closed. See §4 status updates.
2. **Second viability review.** Same shape as [`2026-04-24-viability-review.md`](./2026-04-24-viability-review.md). Judge the *revised* hypothesis against ICP, competition, differentiation, founder advantage, technical reality, GTM, moat, risks, constraints. The first viability review's biggest finding (no first customer) almost certainly carries; the wedge identification will likely change (Herzog as wedge); the competitive landscape changes (OpenClaw + Moltbook bring an emerging agent-runtime/social-layer cohort into scope).
3. **Triage the Q-A through Q-L list against `§11`.** Renumber, fold into existing items where overlap exists (e.g. Q-G amends `§11 #25` and `§11 #29`; Q-K amends `§11 #15`), open new items where genuinely new (Q-I, Q-J, Q-L).
4. **Glossary additions, scoped tight.** Add **admin**, **team**, **Moltbook**, **OpenClaw**, **Herzog** as glossary entries, each one sentence, each linking back to the ADR or research memo where it's first defined. Done after step 1, before step 5.
5. **Targeted ADR drafts.** In rough drafting order, after step 2:
   - Two-tier shaping (Input 3 + Q-D). Probably co-drafted with C1-E + UST-C7 since they share the core/extension boundary.
   - OpenClaw as Agent Layer runtime (Q-I, Q-E). Possible successor to or amendment of [ADR 0002](../decisions/0002-sub-agent-response-contract.md).
   - Moltbook trust boundary (Q-J, Q-K, Q-L). Either a standalone ADR or an amendment to [ADR 0011](../decisions/0011-canopy-and-ai-first-dmz.md) depending on whether it changes the DMZ definition.
   - Continuous DMZ evaluation (Input 6, Q-G). Amendment to or successor of [ADR 0011](../decisions/0011-canopy-and-ai-first-dmz.md).
   - Herzog / onboarding wedge (Input 7, Q-H). Probably a v1 ADR; defers v0.5.
6. **`positioning.md` rewrite.** Last, after the ADRs land. The current "shape a living baseline" framing absorbs the two-tier model + the Herzog wedge; the rewrite is mechanical once those decisions are pinned.

**Order discipline.** Steps 1–2 are research/analysis and produce no durable architectural commitment. Step 3 is a triage edit, low risk. Steps 4–6 are durable changes and should not start until 1–3 are complete. Doing 4–6 from chat memory at 1am violates [`../CLAUDE.md`](../../CLAUDE.md) §7's "land it where future humans and agents will find it" principle and risks routing an underspecified hypothesis into the canonical surface.

---

## 8. Honest caveats

Things this review is *not* confident about:

- **OpenClaw and Moltbook descriptions: now verified (2026-04-25 PM).** Originally `[Unverified]` from a single conversation transcript. The [ecosystem synthesis](../research/deep-research-2026-04-25/ecosystem-synthesis.md), drawing on a user-saved primary survey plus four Parallel.ai research artifacts (two `pro-fast`, two `ultra4x-fast`), now grounds both descriptions. Two specific claims **remain `[Unverified]`**: Moltbook's acquisition by Meta on 2026-03-10, and OpenClaw's GitHub traction numbers (363K stars / 74.2K forks). Neither is load-bearing for the Q-I and Q-J resolutions.
- **`[Inference]`: the founder's "Herzog text-first for v1" call.** Stated with conviction but not yet ADR-shaped. Could move again after a customer conversation.
- **`[Inference]`: the v0.1-survives-unchanged claim in §5.** Holds *if* the revised hypothesis only affects v0.5+. If continuous DMZ evaluation (Input 6) is required at v0.1, the v0.1 plan needs revisiting. The v0.1 plan as currently scoped explicitly *does not* prove DMZ behavior, so it survives by virtue of not making promises Input 6 contradicts.
- **`[Inference]`: the second-viability-review framing.** This agent is recommending one because the hypothesis has shifted enough that the first review's conclusions might not hold. The founder may judge the shift smaller than this review represents and skip step 2. That's a defensible call; this review can't make it.
- **What's missing from this review** (still): a cost model for the revised hypothesis, a real first-hand evaluation of agent-runtime candidates (Q-E), and an ICP re-test against the Telegram/WhatsApp onboarding wedge. All three would be in scope for the second viability review. The competitive-landscape pass against OpenClaw+Moltbook-adjacent tooling has now landed in the [ecosystem synthesis](../research/deep-research-2026-04-25/ecosystem-synthesis.md).

---

## Related

- [`2026-04-24-viability-review.md`](./2026-04-24-viability-review.md) — first viability review; judged the *current* product. The revised hypothesis here is enough to require a second pass.
- [`2026-04-24-research-sufficiency.md`](./2026-04-24-research-sufficiency.md) — argued research was done. Holds against P&C-claims realism; does not hold against OpenClaw/Moltbook trust models, cross-cloud reach, or the agent-runtime decision.
- [`2026-04-24-v0.1-plan.md`](./2026-04-24-v0.1-plan.md) — v0.1 plan. Survives. v0.1 is below the layer the revised hypothesis affects.
- [`../research/deep-research-2026-04-25/ecosystem-synthesis.md`](../research/deep-research-2026-04-25/ecosystem-synthesis.md) — synthesis of OpenClaw + Moltbook research; resolves Q-I and Q-J/K/L; sharpens Q-E. The substrate for the §7 step 1 close-out.
- [`../product/positioning.md`](../product/positioning.md) — "shape a living baseline" framing; targeted for rewrite *after* the ADRs implied by this review land.
- [`../glossary.md`](../glossary.md) — terminology source of truth; pending additions named in §7 step 4.
- [`../decisions/STATUS.md`](../decisions/STATUS.md) — one-page decided/next/open view; will need an update once the new ADRs land.
- [`../decisions/BACKLOG.md`](../decisions/BACKLOG.md) — candidate ADRs; the new candidates implied by §7 step 5 should be added here.
- [`../../CLAUDE.md`](../../CLAUDE.md) §11 — open decisions; the Q-A through Q-L list in §4 above will fold here after step 3.
- [`../../CLAUDE.md`](../../CLAUDE.md) §0 — current phase; this review does not change the v0.1 phase posture.
