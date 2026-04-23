# Canopy

The human exposure surface. For the term itself see [`../glossary.md#canopy`](../glossary.md#canopy); for where it fits in the platform see [`./system-context.md`](./system-context.md); for the AI-evaluation surface that precedes it see [`./dmz.md`](./dmz.md). The split between the two is pinned in [ADR 0011](../decisions/0011-canopy-and-ai-first-dmz.md).

The Canopy is the **human-facing exposure surface** of a Jungl3 install. It is the environment where judges, beta customers, stakeholders, and other invited outsiders find, try, and judge prototypes. The Canopy is what the outside world sees of the install.

## The split: build surface, evaluation surface, exposure surface

A Jungle, a DMZ, and a Canopy are easy to conflate and must not be.

- A **[Jungle](../glossary.md#jungle)** is the *build surface*. Teams and agents reshape an [Understory](../glossary.md#understory) inside it. Isolation is looser: builders need broad access to the running system to modify it.
- A **[DMZ](../glossary.md#dmz)** is the *AI evaluation surface*. Synthetic personas and adversarial agents probe a prototype before any human sees it. Isolation is tight and the threat model is AI-specific (prompt injection, tool-use scoping, credential boundaries).
- A **Canopy** is the *human exposure surface*. Real humans interact with a prototype through it. Isolation is tight in a different way: it is the only place outside *human* traffic reaches, and the threat model is conventional public-web exposure.

The Jungle gives teams speed. The DMZ gives them cheap pre-human stress testing. The Canopy gives them exposure. Three distinct isolation boundaries with three distinct users and three distinct risk profiles.

## Promotion: DMZ first, then Canopy

A prototype does not reach the Canopy directly. The path is:

1. Team builds inside the Jungle.
2. Prototype deploys from Jungle to its DMZ.
3. AI agents exercise it in the DMZ (roast, focus-group, pressure-test, chaos-monkey, persona-probe).
4. Once the prototype passes whatever evaluation gates are configured, it is promoted from the DMZ to the Canopy.
5. Humans meet the prototype in the Canopy.

Concrete mechanics of promotion (which gates, who decides, what "passes" looks like) are a follow-on question — see [`../../CLAUDE.md`](../../CLAUDE.md) §11.

## What the Canopy must provide

A human entering the Canopy should not feel like they are entering raw infrastructure. They should feel like they are entering a curated prototype environment. Concretely, the Canopy must support:

- **Externally accessible prototype URLs.** The prototype is reachable without VPN gymnastics.
- **Lightweight authentication.** Enough to gate access; not an identity-architecture project. See open questions below.
- **Isolation per prototype.** One team's prototype cannot accidentally read another's data, users, or events.
- **Seeded personas and test accounts (for humans).** Visitors do not invent credentials; they pick a persona. One concrete proposal for the role mix inside a running prototype — Builder Operator, Supervisor, Ops Admin, Auditor Observer, Partner, optional Customer — lives in [`../research/research2-v1-service-build-plan.md`](../research/research2-v1-service-build-plan.md); not yet adopted.
- **A [Gallery](../glossary.md#gallery).** External visitors — judges, beta users, stakeholders — find prototypes by entering the install's Canopy and browsing its Gallery. Each deployed prototype appears as a tile with metadata from the [Integration Contract](../glossary.md#integration-contract); the tile launches the visitor into that prototype through a controlled gateway. The Gallery is a sub-concept of the Canopy, not a peer surface.
- **Minimum-necessary data and service access.** The Canopy sees only what the prototype needs to demonstrate its behavior. Nothing more.
- **Logging and analytics.** Session activity, feedback, interaction telemetry — captured for the team to learn from.
- **A feedback mechanism.** Built in, not bolted on.

## Security posture

The operating rule:

> The Canopy is public-ish in access, but private in blast radius.

Easy enough for an invited external human to enter. Constrained enough that if a prototype is messy, weird, or wrong, nothing outside its own boundary is affected.

Practically, the Canopy assumes:

- No direct path to sensitive enterprise systems. If a prototype needs real data, that's a data-classification decision that escalates; it does not happen by default.
- Only synthetic, public, or explicitly-scrubbed data lives inside a Canopy.
- Prototypes are isolated from each other.
- The Canopy is separated from any internal enterprise environment.
- Access and activity are auditable.
- Prototypes are time-boxed by default.

Concrete AWS topology for the Canopy (VPC layout, ALB/WAF pattern, account structure, DNS) is a deployment-topology decision, not settled here. Relevant open questions live in [`../../CLAUDE.md`](../../CLAUDE.md) §11.

## Domain Starters

A team does not begin with a generic Understory. It begins with a [Domain Starter](../glossary.md#domain-starter): a pre-configured variant of the Understory with domain-native UI, data model, seeded entities, and workflows. Candidate starters include:

- Customer shopping flow
- Support ticket intake
- Internal operations dashboard
- Document workflow
- Case management portal
- Data exploration and reporting surface

Domain Starters exist to get teams to "interesting" faster. A generic starter forces teams to spend their first hour choosing a shape; a domain-native starter lets them start editing the shape immediately. Domain Starters share the same underlying platform primitives — Synthetic Runtime, Agent Layer, auth, storage — but diverge in UI, schema, and seeded behavior.

Deciding the initial Domain Starter catalog is a product-scoping task, not a platform-architecture one. Adding a starter should go through the `synthetic-data-seed` skill watchlist pattern in [`../../CLAUDE.md`](../../CLAUDE.md) §10 once it promotes.

## Judging as interaction, not presentation

The Canopy enables a judging model that does not involve slide decks. Judges are assigned personas, given specific tasks to attempt inside a prototype's Canopy, and score based on what they actually experienced. That is a product concept, not an architectural one; it lives at [`../product/judging.md`](../product/judging.md).

## What this doc deliberately omits

- **AWS topology.** VPC shape, ALB/WAF specifics, DNS apex, account structure — all unresolved. See [`../../CLAUDE.md`](../../CLAUDE.md) §11.
- **Authentication mechanism.** Recommendation on record (magic link, password-guest, seeded personas, role-based), not decided. See [`../../CLAUDE.md`](../../CLAUDE.md) §11.
- **Data classification and exception process.** Who approves a non-synthetic dataset, and how. See [`../../CLAUDE.md`](../../CLAUDE.md) §11.
- **Promotion criteria.** What it means for a prototype in the DMZ to "pass" into the Canopy. Open.
- **MVP scoping and stack choices.** "What to ship first" is a scoping question, not architecture. Not here.
- **Ephemerality details.** That a Canopy expires is in the glossary's [Sprint / Event](../glossary.md#sprint--event) entry.

## Related

- [`../glossary.md#canopy`](../glossary.md#canopy)
- [`../glossary.md#gallery`](../glossary.md#gallery)
- [`../glossary.md#domain-starter`](../glossary.md#domain-starter)
- [`./dmz.md`](./dmz.md) — the AI evaluation surface that precedes the Canopy
- [`./system-context.md`](./system-context.md)
- [`./agent-layer.md`](./agent-layer.md)
- [`../product/judging.md`](../product/judging.md)
- [`../decisions/0011-canopy-and-ai-first-dmz.md`](../decisions/0011-canopy-and-ai-first-dmz.md)
