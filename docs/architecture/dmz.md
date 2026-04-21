# DMZ

The customer-facing prototype zone. For the term itself see [`../glossary.md#dmz`](../glossary.md#dmz); for where it fits in the platform see [`./system-context.md`](./system-context.md).

## The split: build surface vs exposure surface

A Jungle and a DMZ are easy to conflate and must not be.

- A **Jungle** is the *build surface*. Teams and agents reshape a [Frankenstein app](../glossary.md#frankenstein-app) inside it. Isolation is looser: builders need broad access to the running system to modify it.
- A **DMZ** is the *exposure surface*. Real users, beta customers, and judges interact with a deployed prototype through it. Isolation is tight: the DMZ is the only place outside traffic reaches, and it is deliberately narrow.

The Jungle gives teams speed. The DMZ gives them exposure. They are distinct isolation boundaries with distinct users and distinct risk profiles.

## Three layers

The path from "a team is building" to "a customer is clicking" has three layers. They are not separate deployables — they are stages of one pipeline — but naming them keeps responsibilities from blurring.

1. **Builder layer.** The Jungle itself: Frankenstein app, Synthetic Runtime, Agent Layer. See [`./agent-layer.md`](./agent-layer.md) for the agent role split.
2. **Deployment pipeline.** The bridge between building and exposure. Teams must be able to push a prototype from Jungle to DMZ with minimal friction — standardized hosting, auth, routing. The point is not to make teams solve deployment as part of the sprint.
3. **Experience layer.** What a visitor actually encounters when they enter the DMZ. This is the part most prone to being left vague; the rest of this doc is about it.

## What the experience layer must provide

A visitor entering the DMZ should not feel like they are entering raw infrastructure. They should feel like they are entering a curated prototype environment. Concretely, the DMZ must support:

- **Externally accessible prototype URLs.** The prototype is reachable without VPN gymnastics.
- **Lightweight authentication.** Enough to gate access; not an identity-architecture project. See open questions below.
- **Isolation per prototype.** One team's prototype cannot accidentally read another's data, users, or events.
- **Seeded personas and test accounts.** Users do not invent credentials; they pick a persona. One concrete proposal for the role mix inside a running prototype — Builder Operator, Supervisor, Ops Admin, Auditor Observer, Partner, optional Customer — lives in [`../research/research2-v1-service-build-plan.md`](../research/research2-v1-service-build-plan.md); not yet adopted.
- **Minimum-necessary data and service access.** The DMZ sees only what the prototype needs to demonstrate its behavior. Nothing more.
- **Logging and analytics.** Session activity, feedback, interaction telemetry — captured for the team to learn from.
- **A feedback mechanism.** Built in, not bolted on.

## Security posture

The operating rule:

> The DMZ is public-ish in access, but private in blast radius.

Easy enough for an invited external user to enter. Constrained enough that if a prototype is messy, weird, or wrong, nothing outside its own boundary is affected.

Practically, this means the DMZ assumes:

- No direct path to sensitive enterprise systems. If a prototype needs real data, that's a data-classification decision that escalates; it does not happen by default.
- Only synthetic, public, or explicitly-scrubbed data lives inside a DMZ.
- Prototypes are isolated from each other.
- The DMZ is separated from any internal enterprise environment.
- Access and activity are auditable.
- Prototypes are time-boxed by default.

Concrete AWS topology for the DMZ (VPC layout, ALB/WAF pattern, account structure, DNS) is a deployment-topology decision, not settled here. Relevant open questions live in `CLAUDE.md` §11.

## Domain Starters

A team does not begin with a generic Frankenstein app. It begins with a [Domain Starter](../glossary.md#domain-starter): a pre-configured variant of the Frankenstein app with domain-native UI, data model, seeded entities, and workflows. Candidate starters include:

- Customer shopping flow
- Support ticket intake
- Internal operations dashboard
- Document workflow
- Case management portal
- Data exploration and reporting surface

Domain Starters exist to get teams to "interesting" faster. A generic starter forces teams to spend their first hour choosing a shape; a domain-native starter lets them start editing the shape immediately. Domain Starters share the same underlying platform primitives — Synthetic Runtime, Agent Layer, auth, storage — but diverge in UI, schema, and seeded behavior.

Deciding the initial Domain Starter catalog is a product-scoping task, not a platform-architecture one. Adding a starter should go through the `synthetic-data-seed` skill watchlist pattern in `CLAUDE.md` §10 once it promotes.

## Judging as interaction, not presentation

The DMZ enables a judging model that does not involve slide decks. Judges are assigned personas, given specific tasks to attempt inside a prototype's DMZ, and score based on what they actually experienced. That is a product concept, not an architectural one; it lives at [`../product/judging.md`](../product/judging.md).

## What this doc deliberately omits

- **AWS topology.** VPC shape, ALB/WAF specifics, DNS apex, account structure — all unresolved. See `CLAUDE.md` §11.
- **Authentication mechanism.** Recommendation on record (magic link, password-guest, seeded personas, role-based), not decided. See `CLAUDE.md` §11.
- **Data classification and exception process.** Who approves a non-synthetic dataset, and how. See `CLAUDE.md` §11.
- **MVP scoping and stack choices.** "What to ship first" is a scoping question, not architecture. Not here.
- **Ephemerality details.** That a DMZ expires is in the glossary's [Sprint / Event](../glossary.md#sprint--event) entry. The lifecycle (provision → live → expire → teardown) gets a flow diagram when it earns one.

## Related

- [`../glossary.md#dmz`](../glossary.md#dmz)
- [`../glossary.md#domain-starter`](../glossary.md#domain-starter)
- [`./system-context.md`](./system-context.md)
- [`./agent-layer.md`](./agent-layer.md)
- [`../product/judging.md`](../product/judging.md)
