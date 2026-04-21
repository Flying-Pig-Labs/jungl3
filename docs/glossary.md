# Glossary

Canonical terminology for Jungle3. **Single source of truth.** Other docs should link here, not redefine terms.

If you introduce a new term, add it here in the same pass. If a term drifts in usage, fix the drift here first, then propagate.

**Terminology rules.**

- The word "Marketplace" in Jungle3 documentation always means **AWS Marketplace** (where Jungle3 is distributed per [ADR 0003](./decisions/0003-installable-via-aws-marketplace.md)). Earlier docs called the in-install judging and discovery layer "Marketplace," then briefly "Gallery"; both are now folded into **[DMZ](#dmz)** per [ADR 0004](./decisions/0004-canonical-platform-vocabulary.md).
- Earlier docs called the pre-built application inside a Jungle the "Frankenstein app." It is now the **[Understory](#understory)** per [ADR 0004](./decisions/0004-canonical-platform-vocabulary.md). When you encounter "Frankenstein app" in frozen captures (research files, `doc.md`, `doc2.md`), read it as Understory.

---

## Jungle3

The platform itself. Also the name of this repo. Not the name of any one component. Pronounced "jungle three."

## Jungle

The **builder environment** — a pre-provisioned workspace where a team (and its AI agents) shape a prototype by modifying a living system rather than scaffolding from scratch. A Jungle includes an [Understory](#understory), database, storage, auth, seeded users, synthetic runtime, and connected APIs, all already running. Plural: *jungles*.

Jungles are vended by the Control Plane inside the customer's AWS account. Each team gets its own, isolated by namespace, IAM, and tagging within that account. Cross-customer isolation is by AWS account boundary (different installs, different accounts).

Conceptually a Jungle sits on a [Substrate](#substrate) of AWS primitives. Everything inside a Jungle is hidden from the outside world; the single exposure surface is the [DMZ](#dmz).

## Understory

The **baseline application layer** inside a freshly vended Jungle: deployed, integrated, emitting, rendering. A team's own work grows on top of the Understory the way a canopy grows on its supporting layer — the Understory holds things up so the team can focus on what rises above it.

An Understory ships complete enough to be useful on day one: real users, real data, real events, real audit trail, multiple integrations already wired. Teams are not starting from a blank scaffold; they are starting from a living template they can shape by addition, substitution, or selective removal.

Previously called the *Frankenstein app*. Renamed in [ADR 0004](./decisions/0004-canonical-platform-vocabulary.md).

## Substrate

The **AWS primitives a Jungle sits on** — networking, identity, storage, compute, observability. Substrate is *what the customer's platform team operates*; the [Understory](#understory) is *what ships inside the install as product*. The distinction matters at procurement: a CTO asks what their platform team must own versus what arrives pre-operated.

Substrate is provisioned by the installation's CloudFormation template (per [ADR 0003](./decisions/0003-installable-via-aws-marketplace.md)) and lives entirely inside the customer's AWS account. Concrete service selection is an open question — see [`../CLAUDE.md`](../CLAUDE.md) §11.

## DMZ

The **single exposure surface** — an isolated, externally accessible environment where a prototype is loaded in and made available for external judging, testing, and demo. Everything else — Jungle, Understory, Substrate, Agent Layer, Synthetic Runtime, Control Plane — stays hidden inside the customer's install.

A DMZ is the *exposure surface*; a Jungle is the *build surface*. They are distinct isolation boundaries with distinct users and distinct risk profiles — conflating them is the most common mistake in reading the architecture. See [`architecture/dmz.md`](./architecture/dmz.md) for the three-layer model (builder, pipeline, experience), security posture, and what the experience layer must provide.

A DMZ lives inside the customer's AWS account, behind the customer's ALB, under the customer's DNS apex. Jungle3 provides the provisioning templates and operational patterns; the customer owns the network boundary.

The DMZ is also where judges, beta users, and other external visitors **find** prototypes — a listing surface within the DMZ's experience layer presents deployed prototypes as tiles, and each tile launches into its prototype through a controlled gateway. This listing role was previously a separate concept called *Gallery*; [ADR 0004](./decisions/0004-canonical-platform-vocabulary.md) folded it into DMZ so there is one exposure surface, not two.

"DMZ" is used in the networking-inspired sense:

> Public-ish in access, private in blast radius.

## Control Plane

The **orchestration layer** — the system that vends Jungles and DMZs on demand, manages templates, handles DNS and routing within the install's scope, bootstraps auth, and enforces lifecycle (creation, expiration, teardown). The Control Plane runs **inside the customer's AWS account**, provisioned by the Jungle3 CloudFormation stack; it is not a Jungle3-hosted service. See [ADR 0003](./decisions/0003-installable-via-aws-marketplace.md).

The operator surface for the Control Plane is a Claude-Code-CLI-style text-forward console, not a dashboard.

## Synthetic Runtime

The **live-system illusion** — the set of fake data generators, event emitters, queue producers, and stubbed service endpoints that run inside every Jungle from the moment it's provisioned. The Synthetic Runtime is what makes an environment feel alive on day one instead of feeling like empty scaffolding.

Synthetic Runtime is a *layer*, not a single service. It spans data (fake records being continuously generated), events (queues receiving traffic), and services (stubs returning realistic responses).

## Domain Starter

A **pre-configured variant** of the Understory with domain-native UI, data model, seeded entities, and workflows. Teams do not start from a generic application and invent a domain; they pick a Domain Starter that already looks and behaves like a specific kind of system (customer shopping, support intake, operations dashboard, document workflow, case management, data exploration) and reshape it from there.

Domain Starters share the same underlying platform primitives — Synthetic Runtime, Agent Layer, auth, storage — but diverge in the surface a team sees on day one. Their purpose is to get teams to "interesting" faster. See [`architecture/dmz.md`](./architecture/dmz.md).

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

The **standard interface** a team's prototype implements so the DMZ's listing surface can surface it consistently. At minimum:

- `/metadata` — name, description, team, persona, screenshot, status
- `/health` — is the prototype available
- `/launch-config` — launch URL, auth hints, available personas
- `/demo-reset` (optional) — resets demo state between judges
- `/events` (optional) — telemetry stream

A prototype that satisfies the contract can auto-register into its install's DMZ.

## Inspection surface

The **real, programmatically checkable state** an inspection specialist is attached to — live connection config, a queryable schema registry, actual queue depth, real health-check endpoints, the current deployment manifest, the live listing record. A specialist without an inspection surface is prompt memory with a hard hat on; its `evidence` cannot be independently verified.

Inspection surface is the guardrail on the [Agent Layer](#agent-layer). See [`architecture/agent-layer.md`](./architecture/agent-layer.md).

## Sprint / Event

The time-boxed container in which Jungles are vended and DMZs are exposed. Jungles and DMZs are **ephemeral by default** — they expire and are torn down on a schedule tied to the sprint. Retention past the sprint is explicit opt-in.

## Lovable-owned

Files and paths in this repo that Lovable.dev modifies autonomously. See `../CLAUDE.md` §3. The term applies to the website scaffold at repo root only. Nothing in `docs/`, `.cursor/`, or future domain subdirs is Lovable-owned.
