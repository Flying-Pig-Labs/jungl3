# 2026-04-25 — Second Viability & Competitive Review (revised hypothesis)

**Frame.** A second VC-shaped internal review against Jungl3 as it exists in the repo on 2026-04-25, after the [hypothesis revision](./2026-04-25-product-hypothesis-revision.md) and the [OpenClaw + Moltbook ecosystem synthesis](../research/deep-research-2026-04-25/ecosystem-synthesis.md). Pairs with the [2026-04-24 first viability review](./2026-04-24-viability-review.md); this one judges the **revised** product, not the original.

**How to read this.** Same conventions as the first review. `[Inference]` for extrapolation. `[Unverified]` for things the repo cannot answer. Sections that materially changed from the first review are flagged **(Δ from 2026-04-24)**; sections that did not are flagged **(carries)**. The point of doing a second review is the deltas; the carries are stated briefly so a reader knows they were checked, not skipped.

**Status.** Advisory. Not repo policy. Any change this review implies has to land as an ADR, an edit to `CLAUDE.md §11`, an edit to `positioning.md`, or a `BACKLOG.md` entry — not as appeals to this document.

---

## 1. Problem Clarity (carries, with one sharpening)

**The stated problem.** Unchanged. Innovation teams burn the front half of any sprint on scaffolding. Jungl3 collapses that front half by vending a living [Understory](../glossary.md#understory). See [`positioning.md`](../product/positioning.md). The first viability review's reframe — that the *real* wedge is **plausibility-collapse-aware regulated-domain realism**, not "faster scaffolding" — still holds.

**What sharpened (Δ).** The revised hypothesis adds a *second* failure mode the product is now opinionated about: **builder onboarding plausibility collapse.** [Input 7](./2026-04-25-product-hypothesis-revision.md#input-7--herzog-phone-first-onboarding-agent-clarified-to-text-first) (Herzog) names the moment a sprint participant first touches the system as itself a plausibility test — if the onboarding feels like a Typeform, the sprint never gets going. Plausibility collapse now has two surfaces: the prototype (regulated-domain realism) and the on-ramp (Herzog).

**Must-have or nice-to-have?** Same answer as before. For enterprise innovation labs, plausibly must-have. For everyone else on the audience list, nice-to-have. **The ICP is still narrower than `positioning.md` implies.** [§11 #33](../../CLAUDE.md) (ICP narrowing) and [§11 #31](../../CLAUDE.md) (first design partner) are still the two highest-leverage open items — the revision did not move them.

**The unstated problem (Δ).** The first review named plausibility collapse as the organizing failure mode. The revision adds a second: **builders not having a working artifact to react to from minute zero.** [Input 6](./2026-04-25-product-hypothesis-revision.md#input-6--identical-v01-prototype-continuously-graded) ("identical v0.1, continuously graded") posits that a team's first hour is wasted if they're configuring rather than reacting. This is consistent with what the first review's research base ([`findings.md §2`](../research/findings.md)) said about momentum, but it's a sharper claim about *when* plausibility matters: not at the demo, but at t=0.

---

## 2. Market & Category Positioning (Δ — emerging cohort)

**Category.** Jungl3 still sits at the intersection of the same four adjacent categories the first review named (AI app generators, IDPs, synthetic data, domain sandboxes). **A fifth category emerged in the revision research:** *self-hosted persistent agent runtimes* (OpenClaw, Mastra, LangGraph, Inngest) and *agent-social-network platforms* (Moltbook, and `[Speculative]` whatever Anthropic and OpenAI ship next in the AI-as-collaborator-network space).

**Implication.** The first review concluded "no named competitor in the regulated-domain prototype foundry framing." That's still true on the *prototype foundry* axis. **It is no longer true on the agent-runtime axis** — Jungl3's revised hypothesis adopts OpenClaw at the install level, which puts Jungl3 inside the agent-runtime conversation whether it likes it or not. Bedrock Agents, Claude Agent SDK, OpenClaw, Mastra are all within scope as buyer alternatives for the question *"what runs my agents?"* See [§11 #42](../../CLAUDE.md) for the live decision.

**What bucket users will reach for (Δ).** The revision makes this *worse*, not better. The first review worried about "Lovable but for AWS." The revised product adds enough surface that prospects can now anchor on:

- "Lovable but for AWS" (prototype foundry framing)
- "Bedrock Agents but you ship it" (runtime framing)
- "Reddit for our internal AI agents" (Crit framing)
- "Cursor for sprints" (Herzog framing)

Each anchor judges Jungl3 against tools that do that one thing better. **The revision compounded the positioning liability the first review flagged.** The mitigation is still the same: pick one frame and commit. The revision strengthens the case for committing to *regulated-domain prototype foundry* — Herzog, Crit, and the customer-OpenClaw are *enabling* surfaces, not the headline product.

**TAM (carries).** Same answer as before. Won't fabricate a number. Low thousands of logos globally `[Inference, low confidence]`. Venture-scale only if ACVs are meaningful.

---

## 3. Competitive Landscape (Δ — new cohort, same conclusion)

**Direct competitors (carries).** Still arguably none with this exact shape. Backstage + an AWS account template is still the default for any org with a platform team. Port / Humanitec are still in the IDP frame. Lovable / v0 / Bolt / Replit Agent are still UI-first.

**New: agent-runtime cohort (Δ).** Per the [ecosystem synthesis §4 / Finding 4](../research/deep-research-2026-04-25/ecosystem-synthesis.md#finding-4--bedrock-agents-is-the-legitimate-competitor), AWS Bedrock Agents is the legitimate competitor for the agent-runtime piece. **This is not a competitor for the *whole product*** — Bedrock Agents doesn't ship a regulated-domain Understory, doesn't run synthetic data, doesn't vend per-team environments. It competes for the **runtime substrate**, which is one layer of Jungl3, not the product. The implication is operational, not strategic: if Bedrock Agents is good enough at the runtime layer, Jungl3 saves a build. If it's not, [§11 #42](../../CLAUDE.md) becomes a real engineering investment.

**Indirect competitors (carries with one shift).** Consulting firms, AWS Innovation Sandbox, and `[Unverified]` insurtech sandboxes still carry. **The new indirect competitor is "an agentic Lovable."** `[Speculative]` Lovable + a hypothetical "hackathon mode" that ships a working app + mock data + onboarding agent could hit the same use case for the non-regulated audience. This doesn't beat Jungl3 in P&C claims (no domain content), but it would beat Jungl3 in any audience segment where regulated-domain plausibility doesn't matter — i.e. the broader audience `positioning.md` currently names. **Reinforces:** narrow the ICP.

**Default competitor (carries).** Still Figma + a contractor + a scripted CEO walkthrough. Still ~$50–150K per event. Still the honest baseline.

**Where Jungl3 loses immediately (Δ — one new entry).**
- Same four entries as the first review.
- **New:** against AWS Bedrock Agents on "we want our agents native to our AWS account." Mitigation: Jungl3 *uses* Bedrock for inference (per the customer-OpenClaw shape) and the customer-OpenClaw is the agent runtime. The "native" framing is preserved. This is a positioning fight, not a product fight, but Jungl3 has to prepare for the question.

---

## 4. Differentiation Analysis (Δ — three additions, two erosions)

**What is actually unique now.** The first review named four. The revision adds:

5. **(New) Single-operator OpenClaw at install scope.** [Finding 1](../research/deep-research-2026-04-25/ecosystem-synthesis.md#finding-1--openclaw-is-a-single-operator-runtime-which-fits-one-per-customer-install): one customer-OpenClaw per install, on EC2 + Bedrock, operated by the install admin, orchestrating per-team provisioning *and* continuously critiquing every team's DMZ. This is a deployment shape no other vendor in the cohort runs, and it's validated end-to-end by the founder's own running configuration. **This is genuinely unique.**
6. **(New) Always-on AI critique from t=0.** [Input 6](./2026-04-25-product-hypothesis-revision.md#input-6--identical-v01-prototype-continuously-graded). Builders open their Jungle and an agent pool is *already* finding things wrong with what they haven't built yet. **No competitor in any cohort ships this shape.**
7. **(New) Text-first onboarding agent (Herzog) with cross-discipline homework.** [Input 7](./2026-04-25-product-hypothesis-revision.md#input-7--herzog-phone-first-onboarding-agent-clarified-to-text-first). PMs get sent to engineers, engineers sent to PMs. The mechanism is novel — the *idea* of an onboarding agent isn't.

**What got eroded (Δ).** Two of the first review's four:

- **The two-surface DMZ → Canopy model** ([ADR 0011](../decisions/0011-canopy-and-ai-first-dmz.md)) is **partially superseded** by [Q-G](./2026-04-25-product-hypothesis-revision.md#4-new-questions-opened) — promotion stops being a discrete event and becomes threshold-crossing on a continuous stream. The narrative is still defensible ("we test with agents continuously, then promote to humans"), but the architectural elegance the first review praised is changing shape. The first review's "narrative enterprise buyers can repeat" benefit may survive the rewording or may not; depends on how Q-G resolves.
- **The inspection-specialist agent contract** ([ADR 0002](../decisions/0002-sub-agent-response-contract.md)) is **scope-shrunk** by the per-team Agent Layer collapse (per the [per-team environments architecture doc](../architecture/per-team-environments.md)). The contract becomes a prompt/behavior convention the customer-OpenClaw enforces, not a per-Jungle runtime. Still useful as a discipline; less impressive as a differentiator.

**Easily copied in 6–12 months (Δ — one addition).** Same list as the first review, plus: the customer-OpenClaw deployment shape itself. Once one vendor in the cohort proves "single-operator agent runtime per install" is the right pattern, others will copy. Jungl3's advantage on this axis is timing, not architecture.

**Impressive but probably doesn't matter (carries).** Forest metaphor; service decomposition; ADR discipline. Same answer.

**The one durable differentiator (carries with one strengthening).** The **library of regulated-domain Understories** is still the most durable moat candidate. The revision *strengthens* this — because the customer-OpenClaw, Crit, and Herzog are all per-install infrastructure that any Understory plugs into, the marginal cost of adding the second Understory drops. The library compounds faster.

---

## 5. Founder Advantage (Δ — one validated, one sharpened)

The first review noted: AWS-literate, ADR-disciplined, domain-tasteful, willing to defer glamour, solo, using Lovable autonomously. **All of that carries.** Two updates:

**(Δ — validated.) The founder is already running the customer-OpenClaw end-to-end.** EC2 + Bedrock + Telegram. This is concrete operational evidence of one specific decision (OpenClaw at install scope) the revision pivots on. The first review's `[Unverified]` qualifier on AWS Marketplace literacy carries; the customer-OpenClaw shape is *not* `[Unverified]` — it's running.

**(Δ — sharpened.) The wedge moved.** The first review identified the wedge as "P&C insurance innovation labs, ~$5M+ innovation budget." The revision adds **Herzog as the on-ramp for that wedge.** Herzog isn't a separate market — it's how the P&C wedge gets sold. A Telegram message-thread that elicits problem statements at 11pm Sunday is the founder's specific advantage in a market segment that does not respond to cold email.

**Where the founder is just another smart engineer (carries with one addition).** Same three from the first review (enterprise sales, SME commissioning, support). Add: **agent-runtime decision under time pressure.** [§11 #42](../../CLAUDE.md) (Bedrock Agents vs Claude Agent SDK vs other) is a Jungl3-specific framework decision the founder will own and can't outsource. Wrong answer here costs months.

**What is not yet present (carries).** Still: a first design partner, a first paid customer, a security-review packet, a commissioned persona corpus, an actual published Marketplace listing, a pricing decision ([§11 #1](../../CLAUDE.md)). **The revision did not move any of these.** That is the load-bearing observation of this review.

---

## 6. Technical Reality (Δ — net more complex, with one simplification)

**What's actually hard (Δ — three additions, one reduction).**

**Carries from the first review:**
- Upgrades without data loss ([§11 #3](../../CLAUDE.md)).
- Plausibility of synthetic data over time.
- AI-agent evaluation in the DMZ without prompt injection (citing [UST-R1](../research/synthetic-user-testing/RISKS.md#r1--prompt-injection-from-untrusted-prototype-ui)).
- The LLM gateway ([ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md)).
- Cross-install support.

**New (Δ):**
- **Continuous DMZ evaluation cost.** Agent pools running 24/7 across N team-Jungles is a lot of inference. Per the revision review §1.6, this hits [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md)'s `$50/month metered LLM` ceiling hard unless throttled. The accuracy of the cost estimate — *can* a customer-OpenClaw critique pool actually run within $50/month? — is **unverified and the load-bearing engineering risk of the revised hypothesis**. If continuous critique costs $500/month, [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) needs to break or the feature gets cut.
- **Customer-OpenClaw failure modes.** Single EC2 host with EBS persistence. If it crashes mid-sprint, every team's DMZ critique stops. No HA shape decided. [§11 #45](../../CLAUDE.md) (cardinality) and the implicit reliability question are not yet ADR-shaped.
- **Crit as a v1 commitment.** Per the [ecosystem synthesis Q-J resolution](../research/deep-research-2026-04-25/ecosystem-synthesis.md#q-j--q-k--q-l--moltbook-trust-boundary-cross-install-gossip-public-egress--resolved-skip-moltbook-entirely-build-crit), Crit replaces Moltbook integration. The deep-dive estimated ~$950K/yr, ~12-15 months for a full Crit build. Even discounting that estimate by 75% (it presumes a multi-tenant SaaS shape Jungl3 doesn't need), Crit is months of work for one engineer. **The first review did not have to consider this.**

**Reduction (Δ):**
- **Per-team Agent Layer collapses.** Per the [per-team environments doc](../architecture/per-team-environments.md), there is no separate agent runtime *inside* each team's Jungle. The customer-OpenClaw covers it. This is a real simplification — [ADR 0002](../decisions/0002-sub-agent-response-contract.md)'s contract becomes a convention rather than a runtime to ship. Saves weeks-to-months of per-Jungle-agent-runtime work.

**Net (Δ).** **More complex, not less.** The Agent Layer reduction is real but smaller than the additions (continuous critique cost, customer-OpenClaw reliability, Crit). The first review's read — "the composition is fragile and the blast radius of a bug is large" — is *more* true under the revised hypothesis, not less.

**What looks hard but is commodity (carries).** Same list as the first review. Step Functions, CloudEvents, DynamoDB audit, CFN — all still commodity.

**Where complexity kills momentum (Δ).** The first review flagged DMZ ⇄ Canopy dual provisioning as the existing tax. The revision adds **continuous critique inference cost** and **customer-OpenClaw operational responsibility** as new taxes. The Agent Layer collapse partially offsets. **Net: the surface area for a single bug to embarrass the product grew.**

**Overengineering flags (Δ).** First review flagged the six-specialist Agent Layer; the revision *partially fixes* this by collapsing the per-team Agent Layer. New flag: **Crit as a v1 commitment is overengineering for v1.** The reasoning in the synthesis (build self-hosted Reddit-shape gossip surface) is sound; the *timing* (v1.0) is wrong. A v1.0 with no Crit and "DMZ critique events appear in CloudWatch + a chat thread" works for the first 3-5 customers. Crit is a v1.x feature, not a v1.0 one.

---

## 7. Go-To-Market Reality (Δ — Herzog as wedge, same gating risk)

**How the first 10 users happen.** **Same gating risk as the first review:** the absence of a first design partner ([§11 #31](../../CLAUDE.md)) is still the load-bearing GTM problem. Nothing in the revision moves it.

**(Δ) The wedge sharpened.** [Input 7](./2026-04-25-product-hypothesis-revision.md#input-7--herzog-phone-first-onboarding-agent-clarified-to-text-first) (Herzog text-first onboarding) names a specific motion: **first conversation is on Telegram or WhatsApp at 11pm Sunday.** This is consistent with how innovation-lab leaders actually behave per the [first viability review §7](./2026-04-24-viability-review.md). Herzog is not a separate product — it's the founder's *channel* into the P&C carrier innovation lead's evening.

**Implication.** The revised first-10 motion is:

1. Founder makes Herzog real enough to demo by text.
2. Warm intro to a P&C carrier innovation lead.
3. **Herzog is the demo.** "Text this number, see what it does."
4. Innovation lead text-converses with Herzog over a weekend, gets cross-discipline homework, runs one micro-sprint inside their org.
5. They tell one peer.
6. Repeat 6-8 times.

This is materially different from a calendared product demo. It's also `[Speculative]` — the founder has Herzog text-running in their own configuration, not in a customer's hands.

**(Δ) New risk:** Telegram/WhatsApp as primary channels are excellent for individual onboarding and **terrible for procurement.** The motion that lands the first 10 users does not scale to enterprise procurement; the first 10 are pre-procurement (design partners, pilots). Procurement is still the cliff after the wedge.

**How the first 100 users happen (carries).** Same answer. Channel partner (consulting firm using Jungl3 as their sprint delivery tool), or additional Understory domains, or both.

**Wedge vs. boiling the ocean (Δ — strengthened).** The first review concluded "the right wedge is P&C insurance innovation labs." The revision adds Herzog as the *channel* to that wedge. Both still hold. **The audience list in `positioning.md` is *more* misleading post-revision, not less,** because the revision adds more user-facing surfaces (Crit, Gallery, Herzog, Guide, Builder) that prospects can imagine themselves using — none of which matter without the P&C wedge first.

**Discoverability (carries).** Still: not a product customers search for. Founder still has to go to them. Telegram-via-Herzog is a *route* to that "going to them," not a substitute.

---

## 8. Moat Assessment (Δ — one strengthening, one new entry)

| Candidate moat | First review (2026-04-24) | Second review (2026-04-25) |
| --- | --- | --- |
| Data network effects | Illusion (per-account isolation). | **Carries.** [§11 #15](../../CLAUDE.md) is still default-no. Crit being per-install reinforces this. |
| Regulated-domain Understory library | Real, if built. Slow. | **Strengthened (Δ).** Customer-OpenClaw + Herzog + Crit are install-level infra that any Understory plugs into; marginal cost of Understory #2 drops. The library compounds faster. |
| Workflow lock-in | Weak (CFN install can be ripped out). | **Carries.** |
| Brand | Nonexistent today. | **Carries.** |
| AI agent sophistication | Eroding (18-month half-life). | **Carries, more so.** Bedrock Agents and Claude Agent SDK are commoditizing this on faster timescales than the first review estimated. |
| "First in AWS Marketplace for AI-native prototype platforms" | Weak. | **Carries.** |
| Domain-specific trust | Real but slow (12-24 months per customer). | **Carries.** |
| **(New)** Customer-OpenClaw as agent-runtime substrate | n/a | **Real but slow.** Once a customer install has Herzog + Crit + customer-OpenClaw + 18 months of `MEMORY.md` accreted, switching cost is meaningful — they're not just losing the prototype foundry, they're losing the agent ops history. Accrues over a customer's lifetime, not per sprint. |

**(Δ) Blunt read updated.** First review: "most durable moat is the Understory library compounded by per-customer operational trust. Both slow." Still true. **Add:** the customer-OpenClaw's accreted state (memory, heartbeat history, persona-pool calibration) is itself a per-customer moat after 12+ months of operation. **All three are slow. All three require customers first. Jungl3 still has no moat on day one.**

---

## 9. Biggest Risks (Δ — one new existential, others reordered)

**Structural (market doesn't care). Medium-high. Carries.**

Same as the first review. Buyers feel pain; procurement cycles are long; political risk is real.

**Execution (too complex for one person). High → Higher (Δ).**

The first review called this High. **The revision raised it.** The Agent Layer collapse helps; continuous critique + Crit + Herzog more than offset. **The revised hypothesis is materially harder to ship solo than the original.** The single most important consequence: ship discipline gets stricter. The v0.5 wedge ([ADR 0012](../decisions/0012-v0.5-wedge-scope.md)) **must explicitly exclude** the revision's net-new commitments (Crit, Herzog, continuous critique) or v0.5 ships in 2027 instead of 2026.

**Timing. Medium. Carries.**

Same answer as the first review. Not too early; probably not too late.

**(New) Cost-model breakage. Medium-high.**

Continuous DMZ critique against [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md)'s `$50/month metered LLM` ceiling. **`[Unverified]` whether this fits.** If it doesn't, ADR 0007 either breaks (revisited and broken) or the feature breaks (continuous evaluation downgraded to scheduled evaluation). The first review treated cost as solved-by-ADR-0007; the revision unsolves it.

**(New) Cohort positioning. Medium.**

The agent-runtime cohort emerging in 2026 (Bedrock Agents, OpenClaw, Mastra, Claude Agent SDK) makes prospects more likely to anchor on "what's your agent runtime?" and harder to keep on "regulated-domain prototype foundry." Mitigation: positioning discipline. Same shape of risk the first review flagged for "Lovable but for AWS"; same mitigation.

**The sleeper risk (Δ — sharpened).**

First review: founder burnout, not competition. **Carries, made worse.** The revision's net-new surface (Crit, Herzog, customer-OpenClaw, continuous critique) gives the backlog more places to hide from "no first customer." The §11 list grew from 33 items to 46 in this triage pass. **More design work, no more customers — exactly the failure mode the first review named, now more probable.**

---

## 10. Constraint-Aware Strategy (Δ — three new cuts, two reaffirmed double-downs)

**Cut immediately (Δ — three additions to the first review's list).**

Carry from the first review:
- The broad audience framing in `positioning.md`. Pick "P&C insurance innovation labs" and commit.
- The DMZ ⇄ Canopy split as a v1 selling point. (Now amplified by Q-G — promotion is becoming a threshold, not an event; the architectural-elegance pitch is changing shape anyway.)
- The Claude-Code-CLI operator console polish.
- The website audiences beyond innovation labs.

**New (Δ):**
- **Crit from v1.0.** Push to v1.x. v1.0 ships with "DMZ critique events flow to CloudWatch + a chat thread per team." That works for the first 3-5 customers and proves whether continuous critique is even the right shape before Jungl3 commits 6+ months to building Reddit-for-agents.
- **Herzog as voice (already deferred per Input 7).** Reaffirm. Voice is a 2027+ decision; v1 is text-only via Telegram and one of {WhatsApp, SMS} — pick one.
- **Cross-cloud reach** ([§11 #40](../../CLAUDE.md)) from v1 scope. v2+. Mentioning it on the website is fine; building it is not.

**(Δ) Reconsidered:** the first review said "ship two specialists, add the others when a customer asks." The per-team Agent Layer collapse partially supersedes this — there is no per-team Agent Layer to ship two specialists *of*. The customer-OpenClaw covers it. The first review's prescription is now: **ship the customer-OpenClaw with one critique persona-pool, add additional persona behaviors as customers ask.** Same logic, new mechanism.

**Double down on (Δ — two reaffirmed, one new).**

Carry:
- The P&C claims Understory.
- SME commissioning ([§11 #24](../../CLAUDE.md)).
- One specific design partner conversation.
- Upgrade safety.

**New (Δ):**
- **The customer-OpenClaw shape.** It's running end-to-end in the founder's configuration. **Hardening it for one customer install (not many)** is a higher-leverage spend than building Crit. The customer-OpenClaw is the architectural commitment with the longest reach in the revised hypothesis; getting it right for the first install is the leverage point.

**The smallest viable wedge (Δ — narrower).**

First review's wedge: *"A P&C claims innovation sandbox that one real carrier's innovation lead can install into their AWS account, run a two-day internal sprint on, and emerge with a working prototype a line-of-business owner will actually look at."*

Revised wedge: *"That same sandbox, where the innovation lead's first contact with the product is a Telegram message-thread with Herzog at 11pm Sunday, and on Monday morning their three teams open identical P&C-claims Jungles that are already being critiqued by an agent pool they did not have to configure."*

The wedge got *narrower and more specific*, not broader. Everything else — Crit, the Builder/Guide split, cross-cloud, additional domains, two-tier shaping — is downstream of that loop working once.

---

## Synthesis

**Should this exist? Yes — same conditional as the first review, with one upgrade.** The revised product is more opinionated, more differentiated, and operationally validated in one specific way: the customer-OpenClaw is running. That is a real piece of evidence the first review did not have. **The revision does not change whether Jungl3 should exist; it changes the shape of how it would.**

**Did the first review's load-bearing finding survive? Yes.** [§11 #31](../../CLAUDE.md) — the absence of a first design partner — is still the single most concerning item in the repo. The revision opened 13 new questions and resolved zero customer-acquisition blockers. **The hypothesis got more interesting; the GTM got no easier.**

**The most realistic path to traction for a solo founder (Δ — one step changed).**

1. Land one named P&C carrier innovation lead as design partner. **Unchanged.**
2. **(Δ) Make Herzog real enough to be the first contact.** Even minimum-viable Herzog — Telegram-only, scripted Q&A, no persona depth — is the shape of the first conversation. This is a one-week build for the founder; it makes the design-partner conversation start in the right channel.
3. Ship a v0.5 that is 30-40% of the *current* design (down from 40% in the first review's prescription). One Understory (P&C claims), one exposure surface, customer-OpenClaw with one critique persona-pool, the LLM gateway, the synthetic runtime. **No DMZ/Canopy split, no Crit, no Gallery polish, no continuous critique at full intensity.**
4. Run one real sprint with them. Fix what breaks. Write the case study.
5. Use that case study to land three more carriers.
6. *Then* add the second Understory, the DMZ/Canopy split, Crit, the full Builder/Guide split, continuous critique tuning. In that order.

**The single most important change that increases odds of success (carries, sharpened).** First review said: warm intro to a P&C carrier innovation lead this month. **Carries.** Sharpening: **make sure that intro lands in Telegram, not in a calendar app.** Herzog is the format of the conversation; the format determines the founder's leverage in the conversation.

**The most likely failure mode (carries, made more concrete).**

First review: dies quietly, with a very well-organized `docs/` tree, from lack of a customer.

**Carries.** **The revision adds a specific mechanism for the failure:** §11 grew from 33 items to 46 in the triage pass after the revision. Each new item is a defensible piece of design work that feels like progress and is not. **The revision did not save Jungl3 from this failure mode; it gave the failure mode 13 new ways to look like productivity.** Mitigation: ruthless prioritization against #31. Everything else can wait.

**One honest caveat.** This review was written the same day as the hypothesis revision and the founder's PM correction on customer-OpenClaw cardinality. Some of its harder claims — particularly on continuous critique cost, on Crit's actual build cost, on Herzog's effectiveness as a wedge — are `[Speculative]` because the data to verify them is exactly the data you get from running the v0.5 sprint. The point of v0.5 is to make these `[Speculative]` claims either falsifiable or supported. **Until then, this review is calibrated guessing, and a customer's actual reaction beats any of it.**

---

## Related

- [`2026-04-24-viability-review.md`](./2026-04-24-viability-review.md) — first viability review; this one's parent.
- [`2026-04-25-product-hypothesis-revision.md`](./2026-04-25-product-hypothesis-revision.md) — the hypothesis this review judges.
- [`../research/deep-research-2026-04-25/ecosystem-synthesis.md`](../research/deep-research-2026-04-25/ecosystem-synthesis.md) — OpenClaw + Moltbook research; Q-I and Q-J resolutions; Q-E sharpened.
- [`../architecture/per-team-environments.md`](../architecture/per-team-environments.md) — per-team layout; the structural shift that the per-team Agent Layer collapses into.
- [`../decisions/0011-canopy-and-ai-first-dmz.md`](../decisions/0011-canopy-and-ai-first-dmz.md) — DMZ/Canopy split; partially superseded by Q-G in the revised hypothesis.
- [`../decisions/0007-v1-cost-profile-and-llm-metering.md`](../decisions/0007-v1-cost-profile-and-llm-metering.md) — `$50/month metered LLM` ceiling; cost-model breakage risk lives here.
- [`../decisions/0012-v0.5-wedge-scope.md`](../decisions/0012-v0.5-wedge-scope.md) — v0.5 wedge; this review reaffirms its scope discipline against the revision's net-new commitments.
- [`../../CLAUDE.md`](../../CLAUDE.md) §11 — open decisions; #31 is still the single most concerning item.
