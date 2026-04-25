# Customer-OpenClaw

The single OpenClaw instance that runs **inside a customer's install**, alongside the Control Plane in the [Substrate](../glossary.md#substrate). It is the install-level agent runtime that orchestrates per-team provisioning and continuously critiques every team's [DMZ](../glossary.md#dmz). Read [`./system-context.md`](./system-context.md) and [`./per-team-environments.md`](./per-team-environments.md) first; this doc zooms into one component of those diagrams.

> Diagrams in this repo are normally Mermaid (`CLAUDE.md` §8). This doc is prose-only because the customer-OpenClaw's responsibilities are still settling and a premature diagram would lock a shape that should stay malleable until the implied ADRs land.

## Why this lives in Substrate

The [per-team environments doc](./per-team-environments.md) draws three environments per team (Understory, DMZ, Canopy) on top of one shared Substrate. The customer-OpenClaw belongs in Substrate for two reasons:

1. **Install-level scope.** It orchestrates provisioning *across* teams and critiques *across* every team's DMZ. That's not a per-team concern; it's an install concern.
2. **Single-trusted-operator design.** OpenClaw is single-operator-by-design ([ecosystem synthesis Finding 1](../research/deep-research-2026-04-25/ecosystem-synthesis.md#finding-1--openclaw-is-a-single-operator-runtime-which-fits-one-per-customer-install)). One per install, run by the customer's install admin, fits exactly. Per-team OpenClaws would violate the design; a multi-tenant OpenClaw would also violate the design.

## What it is

A long-lived agent runtime, hosted on a single EC2 instance inside the customer's AWS account, calling Bedrock for inference, with file-system persistence (Markdown + JSONL) on attached EBS. The same shape OpenClaw is documented to support, with no fork required.

The vocabulary it uses (`SOUL.md`, `AGENTS.md`, `HEARTBEAT.md`, `MEMORY.md`, `IDENTITY.md`, skills directory, explicit-consent tool model) is the convention adopted from OpenClaw — see the [ecosystem synthesis §3](../research/deep-research-2026-04-25/ecosystem-synthesis.md#3-architectural-primitives-worth-inheriting-for-crit-and-the-agent-layer) for the inheritance list.

## What it does

Two responsibilities, both install-wide:

1. **Provisioning orchestration.** Vends per-team Substrate slices, Understory clones, DMZ stacks, and Canopy stacks per the install's templates. The Control Plane and the customer-OpenClaw cooperate here — the Control Plane owns AWS-resource lifecycle (CloudFormation stacks, IAM, networking); the customer-OpenClaw owns the *agent* side of provisioning (deciding when to vend, parameterizing the templates, reacting to vend failures). `[Speculative]` — exact split between Control Plane authority and customer-OpenClaw authority is not yet ADR-shaped. See [§11 #11](../../CLAUDE.md) (Control Plane runtime) for the related open decision.
2. **Continuous DMZ critique.** Runs an agent-pool against every team's DMZ, from t=0 of each team's Jungle. Per [Input 6 of the hypothesis revision](../reviews/2026-04-25-product-hypothesis-revision.md#input-6--identical-v01-prototype-continuously-graded), every team's prototype is being graded the moment it exists, against an identical baseline. The customer-OpenClaw is what runs that grading.

It does **not**:

- Run inside a team's Jungle. There is no per-team agent runtime — see the [per-team environments doc](./per-team-environments.md).
- Expose any surface to teams or judges. Teams interact with their Understory; judges interact with their team's Canopy. The customer-OpenClaw is operated by the install admin via Telegram (or a similar text channel — the choice is not yet pinned). `[Speculative]` on which channels are supported in v1; the founder's running configuration uses Telegram.
- Run inference outside Bedrock. Keeping inference in-account is what makes this consistent with [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md) (everything stays in the customer's AWS account).

## How it relates to other layers

In the install's layer model:

```
Substrate
├── Control Plane           (AWS-resource lifecycle)
├── Customer-OpenClaw       (agent-side orchestration + continuous critique)
├── Networking, identity, observability primitives
└── ...

  ↑ vended by

Per-team layers (replicated per team)
├── Understory  (cloned app templates; team-shaped)
├── DMZ         (AI-only staging; critiqued continuously by the customer-OpenClaw)
└── Canopy      (human-exposure surface; promotion target)
```

The customer-OpenClaw reaches *up* into every team's DMZ to read prototype state and post critique events. It does not reach into Understory (that's the team's working surface) or Canopy (that's external-facing; critique on Canopy would be a different concern).

## What it inherits from OpenClaw, and what it doesn't

**Inherits** (file conventions, behavior contract):

- `SOUL.md` for behavioral boundaries.
- `AGENTS.md` for SOPs.
- `HEARTBEAT.md` for the cron-driven critique cadence.
- `MEMORY.md` for cross-sprint state.
- Skills directory for modular extensions.
- Explicit-consent tool model for elevated actions (maps cleanly to the maker-checker primitive in [ADR 0008](../decisions/0008-workflows-are-state-machines.md)).

**Does not inherit** (architectural assumptions that don't fit the install shape):

- Public agent identity / Moltbook-style external participation. The customer-OpenClaw is install-private.
- The single-host laptop deployment shape. Customer-OpenClaw runs on EC2 with EBS persistence, not on the operator's laptop. Same single-trusted-operator design; different host.
- The "shared gateway / mutually untrusted users" anti-pattern. Each install gets exactly one customer-OpenClaw with one trusted operator (the install admin). That's the design OpenClaw supports.

See the [ecosystem synthesis §3](../research/deep-research-2026-04-25/ecosystem-synthesis.md#3-architectural-primitives-worth-inheriting-for-crit-and-the-agent-layer) for the full inheritance table.

## Why this collapses the per-team Agent Layer

[ADR 0002](../decisions/0002-sub-agent-response-contract.md) defined a sub-agent response contract for an Agent Layer that was assumed to live per-team. Under the revised hypothesis, the customer-OpenClaw runs the critique work centrally on behalf of every team's persona pool. There is **no separate runtime inside each team's Jungle**.

What survives of ADR 0002: the response contract (`{status, summary, evidence, recommended_action}`) becomes a *prompt and behavior convention* the customer-OpenClaw enforces in its critique outputs, not a per-Jungle runtime to be built. Whether ADR 0002's status changes (Accepted → Superseded by NNNN) is decided when the ADR for the customer-OpenClaw lands. See [§11 #42](../../CLAUDE.md) for the live runtime question for agent work *outside* the customer-OpenClaw's scope.

## Open questions

These are the live items, all rooted in `CLAUDE.md` §11. Each is a real decision, not a placeholder.

- **Cardinality** ([§11 #45](../../CLAUDE.md), Q-M). One customer-OpenClaw per install lifetime, or one per *event* (if a customer runs multiple consecutive hackathons in the same install). Affects state isolation between events, reaping, install reuse semantics. The synthesis recommends nothing here; it identifies the question.
- **Persona-pool implementation** ([§11 #46](../../CLAUDE.md), Q-N). Inside the customer-OpenClaw, do we run one session that roleplays many personas, or many sub-agent sessions (one per persona)? Affects observability, isolation between persona viewpoints, per-persona cost attribution.
- **Continuous critique cost** (interacts with [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) and [§11 #18](../../CLAUDE.md)). Agent pools running 24/7 across N team-DMZs is a lot of inference. The [second viability review §6](../reviews/2026-04-25-viability-review.md) names this as the load-bearing engineering risk of the revised hypothesis. `[Unverified]` whether the configuration fits the `$50/month metered LLM` ceiling. Resolves with a measurement, not a design.
- **Reliability / failure modes.** Single EC2 host. If it fails mid-sprint, every team's continuous critique stops. No HA shape decided. `[Speculative]` whether v1 ships with an HA pair, a warm standby, or single-instance + restart-on-fail. The Substrate vs. Understory boundary discussion (per the [per-team environments doc, Open Questions](./per-team-environments.md#open-questions)) interacts here.
- **Operator channel.** Telegram is what the founder uses. WhatsApp Business and SMS are open candidates. The choice has implications for procurement (some enterprises block Telegram); not yet pinned. Becomes concrete with the first design-partner conversation.
- **Adoption of the OpenClaw file conventions as repo policy.** Per the [ecosystem synthesis §6](../research/deep-research-2026-04-25/ecosystem-synthesis.md#6-open-questions-remaining-after-this-synthesis), this is small enough to be an architecture-doc decision (an amendment to [`agent-layer.md`](./agent-layer.md)) rather than its own ADR. Pending.

## What this doc deliberately omits

- **The ADR for the decision.** Adopting one OpenClaw per customer install + collapsing the per-team Agent Layer is foundational and requires its own ADR. This doc describes the *shape*; the ADR will pin the *commitment*. Per the [adr-author skill](../../.cursor/skills/adr-author/SKILL.md), foundational ADRs require draft-first-then-write with explicit user approval; the draft is not in this doc.
- **Crit's relationship to the customer-OpenClaw.** Crit (the per-install agent gossip surface, [§11 #44](../../CLAUDE.md)) is downstream of this — DMZ critique events would be one of the first things Crit consumes. But Crit is a v1 commitment, above the v0.5 wedge ([ADR 0012](../decisions/0012-v0.5-wedge-scope.md)) and outside this doc's scope.
- **Herzog's relationship to the customer-OpenClaw.** Herzog ([Input 7 of the hypothesis revision](../reviews/2026-04-25-product-hypothesis-revision.md#input-7--herzog-phone-first-onboarding-agent-clarified-to-text-first), [§11 #43](../../CLAUDE.md)) is the install's onboarding agent, plausibly co-hosted in or near the customer-OpenClaw. Whether Herzog *is* a behavior of the customer-OpenClaw or a separate process is open. Probably the same OpenClaw with a different `SOUL.md`; that decision rides with Q-N.
- **Bedrock model selection.** Which Bedrock models the customer-OpenClaw uses for which task is implementation-level. The repo doesn't pick yet. Becomes concrete when the first install ships.

## Related

- [`./system-context.md`](./system-context.md) — install-level layer model. Read first.
- [`./per-team-environments.md`](./per-team-environments.md) — per-team replication of the upper layers. Reads next.
- [`./agent-layer.md`](./agent-layer.md) — the sub-agent contract (ADR 0002) the customer-OpenClaw enforces as convention.
- [`../glossary.md`](../glossary.md) — Substrate, Understory, DMZ, Canopy, Agent Layer.
- [`../decisions/0002-sub-agent-response-contract.md`](../decisions/0002-sub-agent-response-contract.md) — the contract the customer-OpenClaw enforces. Status may change when the customer-OpenClaw ADR lands.
- [`../decisions/0003-installable-via-aws-marketplace.md`](../decisions/0003-installable-via-aws-marketplace.md) — the install model that scopes "one OpenClaw per install."
- [`../decisions/0007-v1-cost-profile-and-llm-metering.md`](../decisions/0007-v1-cost-profile-and-llm-metering.md) — the LLM cost ceiling that continuous critique has to fit under.
- [`../decisions/0011-canopy-and-ai-first-dmz.md`](../decisions/0011-canopy-and-ai-first-dmz.md) — the DMZ definition the customer-OpenClaw critiques against.
- [`../research/deep-research-2026-04-25/ecosystem-synthesis.md`](../research/deep-research-2026-04-25/ecosystem-synthesis.md) — the research that established the one-per-install shape and the file-convention inheritance list.
- [`../reviews/2026-04-25-product-hypothesis-revision.md`](../reviews/2026-04-25-product-hypothesis-revision.md) — the revision review where this shape was first named.
- [`../reviews/2026-04-25-viability-review.md`](../reviews/2026-04-25-viability-review.md) — the second viability review; names the continuous-critique cost as load-bearing.
- [`../../CLAUDE.md`](../../CLAUDE.md) §11 — open decisions; #42 (agent runtime), #45 (cardinality), #46 (persona pool) are the live items rooted here.
