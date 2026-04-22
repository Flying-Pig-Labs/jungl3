# Glossary

Canonical terminology for Jungle3. **Single source of truth.** Other docs should link here, not redefine terms.

If you introduce a new term, add it here in the same pass. If a term drifts in usage, fix the drift here first, then propagate.

**Terminology rules.**

- The word "Marketplace" in Jungle3 documentation always means **AWS Marketplace** (where Jungle3 is distributed per [ADR 0003](./decisions/0003-installable-via-aws-marketplace.md)).
- **DMZ has been redefined** per [ADR 0011](./decisions/0011-canopy-and-ai-first-dmz.md). Until 2026-04-22 the DMZ was the single public-facing exposure surface. It is now the **AI-first evaluation environment** (private, no human traffic). The human-facing role moved to a new term, [**Canopy**](#canopy). When you encounter "DMZ" in captures dated before 2026-04-22 (frozen research files, `doc.md`, `doc2.md`, ADRs 0001–0010), it means what *Canopy* means now.
- **Gallery** is back, scoped differently. ADR 0004 retired it; [ADR 0011](./decisions/0011-canopy-and-ai-first-dmz.md) reintroduces it as the listing/discovery UI *inside the [Canopy](#canopy)*, not as a peer surface.
- Earlier docs called the pre-built application inside a Jungle the "Frankenstein app." It is now the **[Understory](#understory)** per [ADR 0004](./decisions/0004-canonical-platform-vocabulary.md). When you encounter "Frankenstein app" in frozen captures (research files, `doc.md`, `doc2.md`), read it as Understory.

---

## Jungle3

The platform itself. Also the name of this repo. Not the name of any one component. Pronounced "jungle three."

## Jungle

The **builder environment** — a pre-provisioned workspace where a team (and its AI agents) shape a prototype by modifying a living system rather than scaffolding from scratch. A Jungle includes an [Understory](#understory), database, storage, auth, seeded users, synthetic runtime, and connected APIs, all already running. Plural: *jungles*.

Jungles are vended by the Control Plane inside the customer's AWS account. Each team gets its own, isolated by namespace, IAM, and tagging within that account. Cross-customer isolation is by AWS account boundary (different installs, different accounts).

Conceptually a Jungle sits on a [Substrate](#substrate) of AWS primitives. Everything inside a Jungle is hidden from the outside world. A prototype leaves the Jungle in two steps: first into its [DMZ](#dmz) for AI evaluation, then into its [Canopy](#canopy) for human exposure. See [ADR 0011](./decisions/0011-canopy-and-ai-first-dmz.md).

## Understory

The **baseline application layer** inside a freshly vended Jungle: deployed, integrated, emitting, rendering. A team's own work grows on top of the Understory the way a canopy grows on its supporting layer — the Understory holds things up so the team can focus on what rises above it.

An Understory ships complete enough to be useful on day one: real users, real data, real events, real audit trail, multiple integrations already wired. Teams are not starting from a blank scaffold; they are starting from a living template they can shape by addition, substitution, or selective removal.

Previously called the *Frankenstein app*. Renamed in [ADR 0004](./decisions/0004-canonical-platform-vocabulary.md).

## Substrate

The **AWS primitives a Jungle sits on** — networking, identity, storage, compute, observability. Substrate is *what the customer's platform team operates*; the [Understory](#understory) is *what ships inside the install as product*. The distinction matters at procurement: a CTO asks what their platform team must own versus what arrives pre-operated.

Substrate is provisioned by the installation's CloudFormation template (per [ADR 0003](./decisions/0003-installable-via-aws-marketplace.md)) and lives entirely inside the customer's AWS account. Concrete service selection is an open question — see [`../CLAUDE.md`](../CLAUDE.md) §11.

## DMZ

The **AI-first evaluation environment** — a secure, private environment where AI agents interact with a prototype before any human does. Humans do not enter the DMZ. AI agents do: as seeded personas (low-tech-literacy claims analyst, accessibility-constrained policyholder, ops auditor), as fuzzers, as chaos monkeys, as focus-group facsimiles, as pressure testers. Their job is to surface defects, misuse paths, and persona-specific failures at a volume and speed no human panel can match.

A prototype deploys to its DMZ *first*, and is promoted from the DMZ to its [Canopy](#canopy) once it has passed whatever AI evaluation gates are configured. Per [ADR 0011](./decisions/0011-canopy-and-ai-first-dmz.md), the DMZ and Canopy are **two different environments, not two views of one**.

The DMZ is tightly isolated: no outside human traffic, no path to production, no shared data with the customer's enterprise, only synthetic or explicitly-scrubbed data. "DMZ" is used in the networking-inspired sense — a hardened isolated zone — but the threat model is specific to AI tool-use: prompt-injection containment, tool-use scoping, credential isolation. See [`architecture/dmz.md`](./architecture/dmz.md).

A DMZ lives inside the customer's AWS account. Jungle3 provides the provisioning templates and operational patterns; the customer owns the network boundary.

> **What changed.** Until 2026-04-22 the DMZ was the *single* exposure surface, shared between AI probing and human judging. [ADR 0011](./decisions/0011-canopy-and-ai-first-dmz.md) split these into DMZ (AI) and [Canopy](#canopy) (humans). In captures written before that date — frozen research files, `doc.md`, `doc2.md`, and ADRs 0001–0010 — "DMZ" refers to what the [Canopy](#canopy) now names.

## Canopy

The **human exposure surface** — the externally reachable environment where judges, beta users, stakeholders, and other invited outsiders find, try, and judge prototypes. The Canopy is what the outside world sees.

A prototype reaches the Canopy only after passing through its [DMZ](#dmz). The two are sequenced: DMZ (AI evaluation) first, then Canopy (human exposure). See [ADR 0011](./decisions/0011-canopy-and-ai-first-dmz.md).

A Canopy lives inside the customer's AWS account, behind the customer's ALB, under the customer's DNS apex. Its security posture is the public-ish-access / private-blast-radius shape that the old DMZ carried:

> Public-ish in access, private in blast radius.

Concretely, the Canopy must provide externally accessible prototype URLs, lightweight authentication, per-prototype isolation, seeded personas and test accounts (for humans), session analytics, feedback capture, and a listing surface (the [Gallery](#gallery)). Concrete AWS topology (VPC layout, ALB/WAF pattern, DNS apex strategy) is a deployment-topology decision, not settled — see [`../CLAUDE.md`](../CLAUDE.md) §11. For the full shape see [`architecture/canopy.md`](./architecture/canopy.md).

The forest metaphor: the *Canopy* is the layer the forest shows to the sky — what outsiders see — sitting above the living [Understory](#understory).

## Gallery

The **listing and discovery UI inside the [Canopy](#canopy).** Deployed prototypes appear as tiles with metadata from the [Integration Contract](#integration-contract); each tile launches the visitor into its prototype through a controlled gateway. The Gallery is where a judge or beta user *finds* a prototype to try.

Gallery is a sub-concept of the Canopy, not a peer surface. A prototype's listing lives in the Gallery; the prototype itself runs behind it, still in the Canopy, still inside the customer's install. See [ADR 0011](./decisions/0011-canopy-and-ai-first-dmz.md) for the reintroduction of this term after its retirement in [ADR 0004](./decisions/0004-canonical-platform-vocabulary.md).

## Control Plane

The **orchestration layer** — the system that vends Jungles and DMZs on demand, manages templates, handles DNS and routing within the install's scope, bootstraps auth, and enforces lifecycle (creation, expiration, teardown). The Control Plane runs **inside the customer's AWS account**, provisioned by the Jungle3 CloudFormation stack; it is not a Jungle3-hosted service. See [ADR 0003](./decisions/0003-installable-via-aws-marketplace.md).

The operator surface for the Control Plane is a Claude-Code-CLI-style text-forward console, not a dashboard.

## Synthetic Runtime

The **live-system illusion** — the set of fake data generators, event emitters, queue producers, and stubbed service endpoints that run inside every Jungle from the moment it's provisioned. The Synthetic Runtime is what makes an environment feel alive on day one instead of feeling like empty scaffolding.

Synthetic Runtime is a *layer*, not a single service. It spans data (fake records being continuously generated), events (queues receiving traffic), and services (stubs returning realistic responses).

## Domain Starter

A **pre-configured variant** of the Understory with domain-native UI, data model, seeded entities, and workflows. Teams do not start from a generic application and invent a domain; they pick a Domain Starter that already looks and behaves like a specific kind of system (customer shopping, support intake, operations dashboard, document workflow, case management, data exploration) and reshape it from there.

Domain Starters share the same underlying platform primitives — Synthetic Runtime, Agent Layer, auth, storage — but diverge in the surface a team sees on day one. Their purpose is to get teams to "interesting" faster. See [`architecture/canopy.md`](./architecture/canopy.md).

An alternative candidate list — framed around realism-per-unit-of-complexity rather than UI shape — is proposed in [`research/research2-v1-service-build-plan.md`](./research/research2-v1-service-build-plan.md) (insurance-like case operations, service request processing, benefits enrollment, order exception handling, loan/application review, permit/compliance workflow). Which anchor ships first is open — see [`../CLAUDE.md`](../CLAUDE.md) §11.

## Agent Layer

The **AI-driven components** that operate inside and alongside a Jungle. Two roles, sharing a deployment surface but not a responsibility:

**Operational agents** — they *modify* the system.

- **Builder / modifier agents** — author and change the app under team direction.
- **Clicker agent** (future) — a computer-use agent that navigates the UI and attempts workflows.
- **User-simulation agent** — generates persona-based dialogue feedback on the prototype.

**Inspection specialists** — they *explain and validate* the system, one per domain (Data, API, Event, Auth, Environment, Listing). Each owns inspection for its slice and is fronted by an orchestrator that handles routing, composition, and rendering. Specialists must be attached to a real inspection surface rather than prompt memory. See [`architecture/agent-layer.md`](./architecture/agent-layer.md).

Every inspection specialist returns the same structured shape: `{status, summary, evidence, recommended_action}`. The contract is pinned in [ADR 0002](./decisions/0002-sub-agent-response-contract.md).

The Agent Layer is not a single orchestrator pretending to know everything. It is a routed network of small specialists coordinated by a top-level agent.

## Integration Contract

The **standard interface** a team's prototype implements so the [Canopy](#canopy)'s [Gallery](#gallery) can surface it consistently. At minimum:

- `/metadata` — name, description, team, persona, screenshot, status
- `/health` — is the prototype available
- `/launch-config` — launch URL, auth hints, available personas
- `/demo-reset` (optional) — resets demo state between judges
- `/events` (optional) — telemetry stream

A prototype that satisfies the contract can auto-register into its install's Gallery (inside the Canopy).

## Inspection surface

The **real, programmatically checkable state** an inspection specialist is attached to — live connection config, a queryable schema registry, actual queue depth, real health-check endpoints, the current deployment manifest, the live Gallery listing record inside the Canopy. A specialist without an inspection surface is prompt memory with a hard hat on; its `evidence` cannot be independently verified.

Inspection surface is the guardrail on the [Agent Layer](#agent-layer). See [`architecture/agent-layer.md`](./architecture/agent-layer.md).

## Sprint / Event

The time-boxed container in which Jungles are vended, DMZs run evaluations, and Canopies are exposed. Jungles, DMZs, and Canopies are **ephemeral by default** — they expire and are torn down on a schedule tied to the sprint. Retention past the sprint is explicit opt-in.

## Lovable-owned

Files and paths in this repo that Lovable.dev modifies autonomously. See `../CLAUDE.md` §3. The term applies to the website scaffold at repo root only. Nothing in `docs/`, `.cursor/`, or future domain subdirs is Lovable-owned.
