# Glossary

Canonical terminology for Jungle3. **Single source of truth.** Other docs should link here, not redefine terms.

If you introduce a new term, add it here in the same pass. If a term drifts in usage, fix the drift here first, then propagate.

---

## Jungle3

The platform itself. Also the name of this repo. Not the name of any one component. Pronounced "jungle three."

## Jungle

The **builder environment** — a pre-provisioned workspace where a team (and its AI agents) shape a prototype by modifying a living system rather than scaffolding from scratch. A Jungle includes a [Frankenstein app](#frankenstein-app), database, storage, auth, seeded users, synthetic runtime, and connected APIs, all already running. Plural: *jungles*.

Jungles are vended by the Control Plane. Each team gets its own.

## Frankenstein app

The **initial application state** inside a freshly vended Jungle: deployed, integrated, emitting, rendering. Deliberately over-complete — multiple integrations already wired, UI screens already populated, data already flowing — and therefore deliberately a little chaotic. Teams shape it by **subtraction**: removing features, simplifying flows, swapping data sources, refining UI. "Frankenstein" names the intent; a scaffold is empty framing, a Frankenstein app is stitched-together and alive.

## DMZ

The **customer-facing runtime** — an isolated, externally accessible environment where a prototype is deployed for real users, beta customers, and judges to interact with. The DMZ is the exposure surface; the Jungle is the build surface.

"DMZ" is used in the networking-inspired sense: public-ish in access, private in blast radius.

## Marketplace

The **shared discovery and judging layer** — the front door where users, beta testers, and judges browse all deployed prototypes, select a persona or test scenario, and launch into a prototype's DMZ through a controlled gateway. Each team gets a tile. The Marketplace does not host the prototype itself; it routes into it.

## Control Plane

The **orchestration layer** — the system that vends Jungles and DMZs on demand, manages templates, handles DNS and routing, bootstraps auth, and enforces lifecycle (creation, expiration, teardown). The Control Plane runs in a dedicated platform account; Jungles and DMZs are vended into separate isolated environments.

The operator surface for the Control Plane is a Claude-Code-CLI-style text-forward console, not a dashboard.

## Synthetic Runtime

The **live-system illusion** — the set of fake data generators, event emitters, queue producers, and stubbed service endpoints that run inside every Jungle from the moment it's provisioned. The Synthetic Runtime is what makes an environment feel alive on day one instead of feeling like empty scaffolding.

Synthetic Runtime is a *layer*, not a single service. It spans data (fake records being continuously generated), events (queues receiving traffic), and services (stubs returning realistic responses).

## Agent Layer

The **AI-driven components** that operate inside and alongside a Jungle. Two roles, sharing a deployment surface but not a responsibility:

**Operational agents** — they *modify* the system.

- **Builder / modifier agents** — author and change the app under team direction.
- **Clicker agent** (future) — a computer-use agent that navigates the UI and attempts workflows.
- **User-simulation agent** — generates persona-based dialogue feedback on the prototype.

**Inspection specialists** — they *explain and validate* the system, one per domain (Data, API, Event, Auth, Environment, Marketplace). Each owns inspection for its slice and is fronted by an orchestrator that handles routing, composition, and rendering. Specialists must be attached to a real inspection surface rather than prompt memory. See [`architecture/agent-layer.md`](./architecture/agent-layer.md).

Every inspection specialist returns the same structured shape: `{status, summary, evidence, recommended_action}`. The contract is pinned in [ADR 0002](./decisions/0002-sub-agent-response-contract.md).

The Agent Layer is not a single orchestrator pretending to know everything. It is a routed network of small specialists coordinated by a top-level agent.

## Integration Contract

The **standard interface** a team's prototype implements so the Marketplace can surface it consistently. At minimum:

- `/metadata` — name, description, team, persona, screenshot, status
- `/health` — is the prototype available
- `/launch-config` — launch URL, auth hints, available personas
- `/demo-reset` (optional) — resets demo state between judges
- `/events` (optional) — telemetry stream

A prototype that satisfies the contract can auto-register to the Marketplace.

## Sprint / Event

The time-boxed container in which Jungles are vended and DMZs are exposed. Jungles and DMZs are **ephemeral by default** — they expire and are torn down on a schedule tied to the sprint. Retention past the sprint is explicit opt-in.

## Lovable-owned

Files and paths in this repo that Lovable.dev modifies autonomously. See `../CLAUDE.md` §3. The term applies to the website scaffold at repo root only. Nothing in `docs/`, `.cursor/`, or future domain subdirs is Lovable-owned.
