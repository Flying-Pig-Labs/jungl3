# 0002 — Sub-agent response contract

**Status:** Accepted
**Date:** 2026-04-21

## Context

The Agent Layer in Jungle3 is not a single orchestrator with universal knowledge. It is a routed network: a primary operator agent delegates to domain-specific sub-agents (Data, API, Event, Auth, Environment, Marketplace) that own inspection and validation for their slice of the system. See [`../architecture/agent-layer.md`](../architecture/agent-layer.md).

For the orchestrator to compose sub-agent output into coherent answers — and for the system to remain trustworthy rather than "an eloquent liar in a hard hat" — every sub-agent must return the same structured shape.

This shape is already referenced informally across the repo: the glossary describes sub-agents as returning `{status, summary, evidence, recommended_action}` to the orchestrator, and the `sub-agent-author` skill candidate in `CLAUDE.md` §10 assumes the same contract. Without pinning it, two sub-agents authored independently could drift on field names, status enums, or `evidence` shape, and the orchestrator would have to grow special cases per specialist.

## Decision

Every sub-agent returns a response object with exactly these fields:

- `status` — one of `healthy`, `degraded`, `unavailable`, `unknown`.
- `summary` — plain-English explanation, one to three sentences. The orchestrator may reuse this verbatim or rephrase it for the user.
- `evidence` — an object whose keys are domain-specific (e.g. `dataset_name`, `last_successful_query`, `endpoint_url`, `log_line_ref`) and whose purpose is traceability: a human reader must be able to independently check the claim in `summary`.
- `recommended_action` — a string describing what to do next if the status is not `healthy`, or `null` if no action is needed.

`evidence` is intentionally loosely typed. Each specialist defines the keys it uses in its own domain. Tightening `evidence` per-domain is a future, per-specialist decision, not a platform-wide one.

## Consequences

**Enables:**

- The orchestrator can compose, route, and render sub-agent output uniformly without per-specialist branching.
- A response to the user can always cite its source via `evidence`, supporting the "attached to a real inspection surface" principle in [`../architecture/agent-layer.md`](../architecture/agent-layer.md).
- `sub-agent-author` as a skill becomes authorable — the contract is the non-obvious part of writing a new specialist.

**Forecloses:**

- Alternative response shapes (`{ok, message, details}`, free-form prose, per-domain bespoke schemas) are rejected across the Agent Layer.
- Sub-agents cannot return additional top-level fields. Domain-specific information belongs inside `evidence`.

**Accepts:**

- `evidence` is loosely typed, and different specialists will use different keys. This is intentional — tightening it platform-wide would force a lowest-common-denominator schema that serves none of them well.
- `status` enum is small. Finer-grained states ("partially healthy," "queued for repair") must be expressed through `summary` and `recommended_action`, not new enum values, until a concrete second case forces a revision.

## Alternatives considered

- **`{ok, message, details}`.** Too thin — no status granularity beyond boolean, no explicit action. Rejected.
- **Free-form natural-language responses.** The current implicit state. Doesn't compose; orchestrator has to parse prose. Rejected.
- **Per-domain bespoke shapes.** Lets each specialist optimize. Guarantees drift and forces the orchestrator to know every specialist's shape. Rejected.
- **Pin `evidence` to a strict schema now.** Premature — we have zero implemented specialists; schema decisions need real use cases. Deferred per-specialist.
