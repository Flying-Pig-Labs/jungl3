# Candidate ADRs — synthetic-user-testing drop

Lifted out of [`SYNTHESIS.md`](./SYNTHESIS.md) §4 for use. Each row is a candidate ADR that this drop argues for; none are drafts, none are decisions. "Readiness" is my call — you may disagree.

Readiness legend:

- **Ready** — evidence and shape are clear; could be drafted next without further research.
- **Needs decision** — evidence is clear; you need to make a choice before an ADR can be written.
- **Needs more research** — there's a real question here but the drop doesn't answer it.

---

## Index

| ID | Title | Theme | Readiness | Closes/informs CLAUDE.md §11 |
|---|---|---|---|---|
| [C1](#c1--synthetic-user-tester-placement) | Synthetic-user-tester placement | Agent Layer shape | Needs decision | informs #18 |
| [C2](#c2--pre-human-pass-framing) | Pre-human pass vs. replacement framing | Product posture | Ready | — |
| [C3](#c3--planner-executor-split-for-browser-capable-agents) | Planner-Executor split for browser-capable agents | Browser-agent architecture | Ready (if C1 lands) | — |
| [C4](#c4--persona-schema-pinned) | Persona schema pinned (6-point) | Persona authoring | Ready (if C1 lands) | — |
| [C5](#c5--persona-reasoning-traces-as-audit-events) | Persona reasoning traces as audit events | Audit surface | Needs decision | — |
| [C6](#c6--marketplace-pricing-model-v1) | Marketplace pricing model v1 | Monetization | Needs decision | closes #1 |
| [C7](#c7--marketplace-stack-structure) | Marketplace stack structure | Packaging | Needs decision | closes #2 |

Two of the 7 (C6, C7) close existing §11 items outright if drafted. One (C1) informs #18 (Admin/observability surface vs Agent Layer inspection specialists) by adding a new kind of Agent-Layer specialist. The other four create their own scope.

---

## C1 — Synthetic-user-tester placement

**One-line.** Decide where a persona-as-AI-agent capability lives: a new top-level `synthetic-user-testing/` domain, a specialist inside the existing Agent Layer, or a DMZ-side capability.

**Source.** [`SYNTHESIS.md` §4 item 1](./SYNTHESIS.md), derived from [`04-build-it-yourself-claude-sdk.md` §2](./04-build-it-yourself-claude-sdk.md) and [`03-persona-simulation-methodology.md` §3.1](./03-persona-simulation-methodology.md).

**Forces.**
- The Planner-Executor-Critic-Evaluator role split in report 04 §2 is already the `{status, summary, evidence, recommended_action}` shape from [ADR 0002](../../decisions/0002-sub-agent-response-contract.md).
- [`docs/architecture/agent-layer.md`](../../architecture/agent-layer.md) already describes a routed network of specialists. Adding one more is cheap; adding a new top-level domain is expensive.
- Per [`CLAUDE.md` §4](../../../CLAUDE.md) "create on first use, not speculatively" — a new top-level subdir needs real work in it to justify creation.

**The decision you'd be making.** Pick one of {new top-level domain, Agent-Layer specialist, DMZ-side primitive}. The synthesis leans toward Agent-Layer specialist.

**Dependencies.** None. This unlocks C3 and C4 (which only make sense if C1 chose "we're doing this at all"). If C1 decides "not now," C3–C5 drop off the backlog.

**Related accepted ADRs.** [ADR 0002](../../decisions/0002-sub-agent-response-contract.md), [ADR 0004](../../decisions/0004-canonical-platform-vocabulary.md). Architecture: [`agent-layer.md`](../../architecture/agent-layer.md), [`dmz.md`](../../architecture/dmz.md).

**Why I rate it Needs decision, not Ready.** The evidence is fully assembled but the choice is a scope call only you can make: is Jungle3 in the business of synthetic-persona testing, or not? A draft ADR can't pick that for you.

---

## C2 — Pre-human pass framing

**One-line.** If synthetic-persona testing is adopted, pin the framing: it runs *before* human judging as context, never as replacement.

**Source.** [`SYNTHESIS.md` §4 item 2](./SYNTHESIS.md), derived from [`03-persona-simulation-methodology.md` §1.1](./03-persona-simulation-methodology.md) (fidelity gap: persona variables explain <10% of variance in subjective tasks) and §4.1 ("OK" bias: SUS mean ~50.9 masks functional failures).

**Forces.**
- Report 03's fidelity gap and "OK" bias together are load-bearing: synthetic personas are systematically bad at emotional resonance and usability judgment.
- [`docs/architecture/dmz.md`](../../architecture/dmz.md) already commits to "judging as interaction" with human judges and seeded personas. A persona-as-agent pre-pass *complements* that without replacing anything.
- Reframing synthetic testing as replacement (not pre-pass) would contradict the human-in-the-loop calibration loop in report 03 §4.2.

**The decision you'd be making.** Just accepting the framing. This is the shortest, cleanest candidate in the drop.

**Dependencies.** Downstream of C1. If C1 is "no," C2 is moot.

**Related accepted ADRs.** None yet. Architecture: [`dmz.md`](../../architecture/dmz.md), [`../product/judging.md`](../../product/judging.md).

**Why Ready.** No choice to make — the evidence lands the position. It's the cheapest ADR in this group to write.

---

## C3 — Planner-Executor split for browser-capable agents

**One-line.** Any Jungle3 browser-capable agent uses Claude Computer Use as Planner + Playwright MCP as Executor, bridged by a JSON action-plan contract. Credentials never reach the LLM.

**Source.** [`SYNTHESIS.md` §4 item 3](./SYNTHESIS.md), derived from [`04-build-it-yourself-claude-sdk.md` §1](./04-build-it-yourself-claude-sdk.md) (Planner-Executor framework) and [`02-ai-computer-use-tech.md` §2](./02-ai-computer-use-tech.md) (CDP bridge pattern).

**Forces.**
- Report 02 and report 04 both converge on visual-observation + accessibility-tree-action as the stable pattern. Pure pixel grounding is brittle and token-expensive.
- The JSON action-plan contract is a security boundary: credential placeholders get resolved after leaving the LLM. Without it, secrets flow to an LLM turn.
- [`CLAUDE.md` §11 #11](../../../CLAUDE.md) (Control Plane runtime) is orthogonal — this constrains agent execution, not control-plane compute.

**The decision you'd be making.** Accepting the split as the reference implementation whenever a Jungle3 agent touches a browser. Not "build one now"; just "if one exists, it's shaped like this."

**Dependencies.** Downstream of C1. Also relies on C5 (reasoning-trace handling) for a clean audit story.

**Related accepted ADRs.** [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) (LLM budget enforcement applies to Planner turns).

**Why Ready (conditional).** Evidence is complete; architecture is concrete. Only gated by C1 because if there's no browser-capable agent in v1, this is a reference-only ADR without a home.

---

## C4 — Persona schema pinned

**One-line.** If synthetic-persona testing is adopted, pin the 6-point schema from report 03 §2.1: demographics, tech proficiency, goals & frustrations, mental model, accessibility needs, language style.

**Source.** [`SYNTHESIS.md` §4 item 4](./SYNTHESIS.md), derived from [`03-persona-simulation-methodology.md` §2.1](./03-persona-simulation-methodology.md).

**Forces.**
- `docs/architecture/dmz.md` already commits to "seeded personas and test accounts" without specifying their schema.
- A pinned schema makes personas versionable, diff-able, and testable. An un-pinned schema means every persona is bespoke prose.
- The 6-point schema is compact enough to live in an install's seed JSON without bloat.

**The decision you'd be making.** Adopting the 6-point schema verbatim, or naming a variant. Report 03 gives specific defaults per field (e.g., weighted demographic sampling per §1.1).

**Dependencies.** Downstream of C1.

**Related accepted ADRs.** Relates to [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md) (which names personas at a role level — claims analyst, supervisor, auditor — but not at a schema level).

**Why Ready (conditional).** Schema is well-specified in the source report. Gated by C1.

---

## C5 — Persona reasoning traces as audit events

**One-line.** Extend [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) to cover persona Think-Aloud reasoning traces when persona testing is active — or deliberately carve them out with a documented reason.

**Source.** [`SYNTHESIS.md` §4 item 5](./SYNTHESIS.md), derived from [`03-persona-simulation-methodology.md` §5.1](./03-persona-simulation-methodology.md) (CoT PII leakage at 86.3%) and [`SYNTHESIS.md` §3.2](./SYNTHESIS.md).

**Forces.**
- Report 03 §5.1: Think-Aloud prompting raises PII leakage from 52.3% to 86.3%. Reasoning traces are sensitive by construction.
- [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) already demands tamper-evidence for business events. Reasoning traces that *drive judging outcomes* have the same integrity requirement.
- But chaining every reasoning token is cost-prohibitive. A hash-per-trace (not per-token) is the likely middle ground.
- Carving them out entirely is defensible if the judging outcome never depends on the trace — but that contradicts the whole point of a pre-pass.

**The decision you'd be making.** Choose between {extend ADR 0009 to cover reasoning traces, carve them out with a documented reason, adopt a hash-per-trace middle ground}. Tradeoff: integrity vs. cost.

**Dependencies.** Downstream of C1. Interacts with [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md)'s LLM budget (reasoning traces are both a cost driver and an audit surface).

**Related accepted ADRs.** [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md), [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md).

**Why Needs decision.** Three viable shapes; none is obvious without a cost/integrity preference you haven't stated.

---

## C6 — Marketplace pricing model v1

**One-line.** Pick a pricing model for the AWS Marketplace listing: free-tier, subscription, or private-offer-only. Closes [`CLAUDE.md` §11 #1](../../../CLAUDE.md).

**Source.** [`SYNTHESIS.md` §4 item 6](./SYNTHESIS.md), derived from [`aws-marketplace-monetization-guide.md` §1](./aws-marketplace-monetization-guide.md).

**Forces.**
- Marketplace fee tiers are economic: 3% under $1M TCV, 2% $1M–$10M, 1.5% above, flat 1.5% on renewals. Bigger deals = dramatically better take-rate. (Guide §1.1.)
- Private Offers support installment plans, custom EULAs, negotiated pricing. They do *not* support BYOL. (Guide §1.2.)
- Analyst memo on record ([`../research1-aws-installable-shape.md`](../research1-aws-installable-shape.md)) recommended free or low-cost subscription initially. The guide doesn't contradict that but sharpens the why.
- There's no v1 customer yet (`CLAUDE.md` §11 #21), which constrains concrete pricing decisions.

**The decision you'd be making.** Pick one of {free, subscription, private-offer-only, hybrid}. Each has downstream consequences for CI/CD, stack structure (C7), and go-to-market.

**Dependencies.** Lightly coupled with C7 (stack structure): private-offer-only would favor a nested-optional-components stack so components can be packaged per-offer.

**Related accepted ADRs.** [ADR 0003](../../decisions/0003-installable-via-aws-marketplace.md).

**Why Needs decision.** The evidence is laid out; the choice is a business call, not a technical one.

---

## C7 — Marketplace stack structure

**One-line.** Decide whether the Marketplace listing is a single CloudFormation stack or a root template that nests optional components. Closes [`CLAUDE.md` §11 #2](../../../CLAUDE.md).

**Source.** [`SYNTHESIS.md` §4 item 7](./SYNTHESIS.md), derived from [`aws-marketplace-monetization-guide.md` §2](./aws-marketplace-monetization-guide.md).

**Forces.**
- Nested-optional-components lets Private Offers package different component sets for different customers. Single-stack can't do that — every customer gets the same surface area.
- Nested is harder to upgrade (each nested stack has its own state), which reloads `CLAUDE.md` §11 #3 (update/upgrade strategy).
- Guide §2.1: CDK→CFN synthesis + TaskCat cross-region validation applies equally to either shape.
- Guide §2.2: `cfn-guard` + CloudFormation Hooks work on both.
- [ADR 0010](../../decisions/0010-seeder-and-reaper-patterns.md) already mandates an async Step Functions seeder; that pattern is stack-structure-agnostic.

**The decision you'd be making.** Pick one of {single stack, root + nested optional components}.

**Dependencies.** Coupled with C6 (pricing) — private-offer-only pushes toward nested; free/subscription allows either. Coupled with `CLAUDE.md` §11 #3 (upgrade strategy) downstream.

**Related accepted ADRs.** [ADR 0003](../../decisions/0003-installable-via-aws-marketplace.md), [ADR 0010](../../decisions/0010-seeder-and-reaper-patterns.md).

**Why Needs decision.** Straight architectural trade-off. The guide doesn't push hard either way; the answer depends on whether Private Offers are a v1 motion (C6).

---

## Suggested drafting order

If you pick these up for drafting, a natural order:

1. **C2** (pre-human pass framing) — cheapest, sets up the posture for everything else in this group.
2. **C1** (placement) — the gate for C3–C5.
3. **C6** (pricing) — unlocks C7. Independent of C1–C5.
4. **C7** (stack structure) — follows C6.
5. **C3** (Planner-Executor split) and **C4** (persona schema) — parallel, both derive cleanly once C1 is decided.
6. **C5** (reasoning-trace audit) — last; needs C1 and the cost posture from revisiting [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md).

C1 and C6 are the two independent gates. Everything else hangs off one of them.
