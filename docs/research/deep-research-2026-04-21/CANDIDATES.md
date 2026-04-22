# Candidate ADRs — cluster 1 (2026-04-21)

Lifted out of [`SYNTHESIS.md` §4](./SYNTHESIS.md) for use. Each entry is a candidate ADR this cluster explicitly named. Three of the six have since been resolved by accepted ADRs; three remain open.

The flat decision backlog — ~60 smaller decisions this cluster also surfaced — lives in [`DECISIONS.md`](./DECISIONS.md). Candidates below are the ones the cluster itself flagged as "ready enough to have an explicit ADR conversation."

Readiness legend:

- **Resolved** — an accepted ADR now closes this candidate.
- **Ready** — evidence and shape are clear; could be drafted next.
- **Needs decision** — evidence is clear; a choice is required before an ADR can be written.
- **Needs scoping** — real question, needs a scoping pass first.

---

## Index

| ID | Title | Status | Resolved by / Blocks |
|---|---|---|---|
| [A](#a--v1-domain-anchor) | v1 domain anchor | **Resolved** | [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md) |
| [B](#b--minimum-viable-realism-threshold) | Minimum viable realism threshold | Needs scoping | — |
| [C](#c--event-envelope-and-correlation-id-model) | Event envelope and correlation-ID model | **Resolved** | [ADR 0005](../../decisions/0005-event-envelope-and-correlation-identifiers.md) |
| [D](#d--v1-custom-admin-surface-scope) | v1 custom admin surface scope | Partially resolved | [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) pins the tech stack; scope is still open |
| [E](#e--extension-architecture-minimal-core--versioned-packs) | Extension architecture (minimal core + versioned packs) | Needs decision | — |
| [F](#f--v1-cost-profile-and-default-cost-controls) | v1 cost profile and default cost controls | **Resolved** | [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) |

Three of six resolved (A, C, F). Three open (B, D partially, E).

---

## A — v1 domain anchor

**Status: Resolved by [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md)** — mid-sized regional P&C insurance claims processing.

**Original frame.** Pick the v1 domain anchor from six candidates in [`../research2-v1-service-build-plan.md`](../research2-v1-service-build-plan.md) §8. The sharpest cluster-1 tension was report 02's chargebacks recommendation versus reports 10 and 11's insurance-native assumptions.

**How it resolved.** ADR 0006 chose insurance-claims-only (claims, not underwriting), seven services, two stubs. The chargebacks alternative was rejected.

**Cluster-1 source.** [SYNTHESIS.md §2.1](./SYNTHESIS.md), [SYNTHESIS.md §4 Candidate A](./SYNTHESIS.md).

---

## B — Minimum viable realism threshold

**Status: Needs scoping.**

**Frame.** Ratify a concrete MVR threshold as a shipping gate: the first Jungle cannot ship below this floor on any axis.

**Source.** [SYNTHESIS.md §1.5](./SYNTHESIS.md) (convergent numbers) and [SYNTHESIS.md §4 Candidate B](./SYNTHESIS.md), derived from reports 01, 03, and 10.

**Proposed numbers (must be accepted, adjusted, or rejected by the ADR).**

- 4–7 microservices with real inter-service calls.
- 8 personas (upper end — seeded history matters more than raw count).
- 3–5 async event types producing visible queue activity.
- 2–4 intentionally visible stubs.
- Inspectable audit trail, feature flags, at least one seeded dashboard.
- Seeded data older than the install.

**Forces.**

- Reports 01, 03, and 10 converge on a narrow band; picking numbers lets later scope decisions be measured against a gate rather than argued ad hoc.
- Without a pinned floor, domain-starter scope creeps in both directions: too thin fails plausibility, too rich blows the cost ceiling ([ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md)).
- [CLAUDE.md §11 #17](../../../CLAUDE.md) explicitly notes this decision is undecided.

**The decision you'd be making.** Accept the band, tighten/widen one axis, or reject the whole framing in favor of a workflow-count-based gate.

**Dependencies.** None upstream. Downstream: any domain-starter ADR (including cluster 2's Candidate E).

**Related accepted ADRs.** [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md) (the v1 domain to measure against), [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) (the cost ceiling the MVR must live under).

**Why Needs scoping.** The numbers are proposed but not stress-tested against ADR 0006's seven-service choice. A scoping pass needs to confirm that "4–7 services + 8 personas + 3–5 event types" is what ADR 0006 actually ships — and if it isn't, whether that's a problem with the MVR or with ADR 0006.

**Closes.** [CLAUDE.md §11 #17](../../../CLAUDE.md) outright if drafted.

---

## C — Event envelope and correlation-ID model

**Status: Resolved by [ADR 0005](../../decisions/0005-event-envelope-and-correlation-identifiers.md)** — CloudEvents v1.0 + reverse-DNS typing + `{trace_id, case_id}` dual correlation.

**Original frame.** The strongest cross-report convergence in cluster 1 (reports 05, 09, 10, 11, 12). Foundational choice — changing it later is expensive.

**How it resolved.** ADR 0005 adopted CloudEvents v1.0 with reverse-DNS type naming, mandatory `{trace_id, case_id}` on every event/log/audit entry, propagation mechanism specified.

**Cluster-1 source.** [SYNTHESIS.md §1.2, §1.3](./SYNTHESIS.md), [SYNTHESIS.md §4 Candidate C](./SYNTHESIS.md).

---

## D — v1 custom admin surface scope

**Status: Partially resolved.**

**Frame.** Commit to a custom, opinionated admin surface in v1, with a bounded, named view set, and an explicit idle cost target.

**Source.** [SYNTHESIS.md §2.2](./SYNTHESIS.md) (tension: report 09 says build, report 08 imposes cost discipline, overlap with Agent Layer unresolved), [SYNTHESIS.md §4 Candidate D](./SYNTHESIS.md).

**What ADR 0007 resolved.** The *technology stack* (LLM agent over deterministic tools via Claude Code SDK, metered LLM gateway, CloudWatch/X-Ray observability). See [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md).

**What's still open.**

- **Which views are in v1.** Candidate set from report 09: (1) per-entity case timeline, (2) queue health with business framing, (3) failure inspection with one-click replay. Not pinned.
- **Admin surface vs Agent Layer overlap.** [CLAUDE.md §11 #18](../../../CLAUDE.md) as currently worded captures only part of this — it covers LLM budget enforcement details, not the Agent-Layer-vs-admin-surface overlap. The original cluster-1 question ("is the admin surface the same as the Agent-Layer inspection specialists, a complementary layer, or distinct?") is ambient.
- **Build vs link policy.** What's built in-product vs deep-linked to AWS consoles.

**The decision you'd be making.** Pin the view set; decide Agent-Layer relationship; commit a build-vs-link policy.

**Dependencies.** None upstream now. Downstream: every admin-UI implementation ticket.

**Related accepted ADRs.** [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md), [ADR 0002](../../decisions/0002-sub-agent-response-contract.md) (Agent Layer response contract).

**Why Needs decision.** Evidence is complete; choice is a scope call.

---

## E — Extension architecture (minimal core + versioned packs)

**Status: Needs decision.**

**Frame.** Commit to **minimal core + versioned domain packs** architecture now, even though v1 ships with one pack.

**Source.** [SYNTHESIS.md §4 Candidate E](./SYNTHESIS.md), derived from report 12 (extension model). Report 12's explicit claim: deferring this boundary produces a monolithic v1 where domain logic is fused to core, and the system becomes structurally un-extensible — a rewrite waiting to happen.

**What the ADR would decide.**

- What belongs in core (deployment/lifecycle, entitlement, observability plumbing, event envelope, declarative runtimes).
- What must live in packs (entity schemas, workflow definitions, personas, UI, seed data, stub mappings).
- Pack manifest format, versioning policy (SemVer 2.0.0), compatibility range declaration.
- Runtime isolation model (resource prefixing + scoped IAM).
- Signing and verification requirements for v1 (SHA-256 digest + manifest signing minimum; full Sigstore deferrable).

**Forces.**

- Report 12 argues the cost of committing now is small (it's a coding discipline); the cost of deferring is a rewrite.
- Interacts with [CLAUDE.md §11 #2](../../../CLAUDE.md) (Marketplace stack structure) — nested-optional-components maps cleanly onto packs; single-stack doesn't.
- Interacts with [CLAUDE.md §11 #3](../../../CLAUDE.md) (upgrade strategy) — packs are how you ship new versions without breaking the core.
- [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md) shipped seven services monolithically; an extension-pack ADR would either retroactively declare those "the insurance pack" or force a refactor.

**The decision you'd be making.** Commit now, defer, or commit with a narrower scope (e.g., "pack boundary is where seeded data lives, not full service boundaries").

**Dependencies.** None upstream. Strong downstream: [CLAUDE.md §11 #2, #3](../../../CLAUDE.md), any Marketplace-packaging ADR.

**Related accepted ADRs.** [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md), [ADR 0003](../../decisions/0003-installable-via-aws-marketplace.md).

**Why Needs decision.** The evidence supports commitment; the cost of deferral is real. But the pack boundary has at least two sensible shapes (service-level vs. data-and-workflow-level), and picking one is a scope call.

---

## F — v1 cost profile and default cost controls

**Status: Resolved by [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md)** — $100/month infra ceiling + $50/month metered LLM budget + default AWS Budgets + log-class tiering.

**Original frame.** Ratify a target idle cost band for the default install and commit to shipping cost controls by default.

**How it resolved.** ADR 0007 pinned the $100 infra + $50 LLM split (the cluster-1 synthesis had proposed a single $110–150/month Default-Realism profile; the ADR split it into infra and LLM). Default Budgets and log-class tiering are specified.

**Cluster-1 source.** [SYNTHESIS.md §4 Candidate F](./SYNTHESIS.md), derived from report 08.

---

## Summary

Three candidates resolved (A, C, F) are now closed; they appear here for the audit trail. Three remain:

- **B** (MVR threshold) — Needs scoping. Low-urgency until we're ready to measure the insurance-claims v1 against a floor.
- **D** (admin surface scope) — Partially resolved; still needs view-set pin + Agent-Layer relationship decision.
- **E** (extension architecture) — Needs decision. Highest leverage of the three — defers get expensive.

See [`../../decisions/BACKLOG.md`](../../decisions/BACKLOG.md) for the cross-cluster view and suggested drafting order.
