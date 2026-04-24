# Jungl3 — roadmap & action items

Technical action list from the current state through v1. A checklist, not a spec.

**How to read this.** Three phases (v0.1 skeleton → v0.5 wedge → v1 full), outer frame. Inside each phase, action items grouped by track. Every item carries a link to its canonical source (an ADR, a `CLAUDE.md §11` item, a research candidate in [`decisions/BACKLOG.md`](./decisions/BACKLOG.md), or a plan section). This doc **never invents scope** — if it's not linked, it's not real.

**Companion to this doc.**
- [`overview.md`](./overview.md) — narrative orientation.
- [`reviews/2026-04-24-v0.1-plan.md`](./reviews/2026-04-24-v0.1-plan.md) — full v0.1 plan. **Canonical for v0.1.** This file mirrors it in checklist form.
- [`decisions/0012-v0.5-wedge-scope.md`](./decisions/0012-v0.5-wedge-scope.md) — **canonical for v0.5.**
- [`decisions/STATUS.md`](./decisions/STATUS.md) — one-page investor view of what's decided.
- [`decisions/BACKLOG.md`](./decisions/BACKLOG.md) — candidate ADRs with drafting order.
- [`../CLAUDE.md`](../CLAUDE.md) §11 — open decisions.

**Status posture.** Advisory, live. Updated when items complete, close, or get reshuffled. Durable changes this roadmap implies (new ADRs, scope edits) land in the canonical docs, not here.

---

## Contents

- [Priority legend](#priority-legend)
- [Phase 0 — v0.1 skeleton](#phase-0--v01-skeleton)
- [Phase 1 — v0.5 wedge](#phase-1--v05-wedge)
- [Phase 2 — v1 full](#phase-2--v1-full)
- [Cross-cutting hardening](#cross-cutting-hardening)
- [What reshuffles this plan](#what-reshuffles-this-plan)

---

## Priority legend

- **P0** — blocks the current phase from shipping.
- **P1** — blocks the next phase from starting.
- **P2** — must land before the phase closes, can interleave.
- **P3** — nice to land in-phase, acceptable to defer.

---

## Phase 0 — v0.1 skeleton

**Canonical plan:** [`reviews/2026-04-24-v0.1-plan.md`](./reviews/2026-04-24-v0.1-plan.md). **Scope:** promotable tiny claims Understory; proves Control Plane vend/reap, Understory alive on day one, Integration Contract first shape, deterministic seeding, observability. **Does NOT prove** the product thesis — that's v0.5's job.

### Track A — Design-partner outreach (P0, runs continuously)

Per [v0.1 plan §4 Track A](./reviews/2026-04-24-v0.1-plan.md). The [viability review §7](./reviews/2026-04-24-viability-review.md) names this as "the single most concerning item in the repo" via [`../CLAUDE.md`](../CLAUDE.md) §11 #31.

- [ ] **A1 (P0).** List 5 named P&C innovation-lead targets. Human names, not company placeholders. Closes part of [§11 #31](../CLAUDE.md).
- [ ] **A2 (P0).** Identify warm-intro path for each; mark cold-outreach separately.
- [ ] **A3 (P1).** Draft outreach template. 4 sentences, 30-minute ask, frame as "AI-native prototype foundry scoped against P&C claims innovation." No decks. Agent can draft on request.
- [ ] **A4 (P0).** Send 3 intros this week, 2 next week.
- [ ] **A5 (P0 trigger).** When a call gets booked → stop-the-world (see end of this doc).

**Phase-exit for Track A:** at least one design-partner call booked. This is the gate on [v0.5 authorization per ADR 0012](./decisions/0012-v0.5-wedge-scope.md) — v0.5 is scoped *for* a named partner, not in the abstract.

### Track B — Architecture-hardening (P1, interleaved)

Per [v0.1 plan §4 Track B](./reviews/2026-04-24-v0.1-plan.md). Half-day decision-closing passes on inputs the repo already has. No new research.

- [ ] **B1 (P2).** Pin MVR floor. Closes [§11 #17](../CLAUDE.md). Inputs: [`findings.md §5.5`](./research/findings.md), archived [`research1-aws-installable-shape.md`](./research-archive/first-generation/research1-aws-installable-shape.md), archived [`aws-innovation-environment-design-report.md`](./research-archive/user-memos-2026-04-24/aws-innovation-environment-design-report.md). Produces a new ADR.
- [ ] **B2 (P1).** Pick IaC authoring tool. Closes [§11 #7](../CLAUDE.md). One-day exercise: write vend-a-Jungle in CDK vs raw CFN; pick. Unblocks most of Track C. Produces a new ADR.
- [ ] **B3 (P1).** Pin Control Plane runtime. Closes [§11 #11](../CLAUDE.md). The v0.1 vend Lambda (C2) is itself the test — if Lambda handles vend/reap <30s, Lambda wins for v0.1 with explicit "revisit at v1." Produces a new ADR.
- [ ] **B4 (P2).** LLM cost-estimate empirical study. Closes open part of [§11 #18](../CLAUDE.md). ~5 representative agent tasks, log tokens, compare to [ADR 0007](./decisions/0007-v1-cost-profile-and-llm-metering.md). Updates ADR 0007's accuracy assumption.

**Phase-exit for Track B:** B2 and B3 pinned (v0.1 can ship without B1/B4, but not without IaC + runtime decisions).

### Track C — v0.1 skeleton build (P0)

Per [v0.1 plan §4 Track C](./reviews/2026-04-24-v0.1-plan.md). Target: vendable + reapable claims Understory in a dev AWS account. Cost expectation: ≪ $5/install/month.

- [x] **C0.** AWS MCP servers installed (`aws-docs`, `aws-api` read-only). Confirmed 2026-04-24.
- [ ] **C1 (P0).** Create `control-plane/` subdir per [`../CLAUDE.md`](../CLAUDE.md) §4 — `README.md` + dependency manifest, TypeScript. Default to raw CloudFormation if B2 hasn't landed.
- [ ] **C2 (P0).** Vend Lambda. Inputs `{install_id, team_name}`; creates nested stack containing one Understory.
- [ ] **C3 (P0).** Reap Lambda. Destroys nested stack, verifies no orphans. Enforces [ADR 0010](./decisions/0010-seeder-and-reaper-patterns.md) shape even at this scale.
- [ ] **C4 (P0).** Create `control-plane/understories/claims/`: DynamoDB table (`Claim`), Lambda API (POST/GET/PATCH), static HTML+JS page, seed script (~12 records). **Budget: ≤400 LOC total.** Vanilla HTML + fetch, no framework.
- [ ] **C5 (P0).** Create `contracts/` subdir with `integration-contract.v0.ts` — one type, one field (`prototype_id`). Grows with use.
- [ ] **C6 (P0).** Structured JSON logging, `install_id` + `trace_id` on every line. Shape-compatible with [ADR 0005](./decisions/0005-event-envelope-and-correlation-identifiers.md) but not full events yet.
- [ ] **C7 (P0).** End-to-end manual run: vend one install, open the URL, create a claim, see it persist, reap, verify cleanup.
- [ ] **C8 (P0).** Determinism check: vend/reap three times back-to-back, same seed state each time, nothing leaks.
- [ ] **C9 (P2).** `control-plane/RUNBOOK.md` — 1 page: vend/reap steps, log inspection, stuck-stack diagnosis.

**Phase-exit for Track C (= phase-exit for v0.1):** C7 + C8 pass. The scaffolding is proven. `docs/reviews/` gets a short "v0.1 done" addendum.

### Non-goals for Phase 0

From [v0.1 plan §7](./reviews/2026-04-24-v0.1-plan.md):

- Marketplace submission.
- Any DMZ or Canopy code.
- Any LLM integration.
- Any maker-checker logic.
- Any upgrade-safety work.
- Any multi-account / cross-install capability.
- Any auth beyond `install_id` as security boundary (dev-account only, short-lived installs).

---

## Phase 1 — v0.5 wedge

**Canonical scope:** [ADR 0012](./decisions/0012-v0.5-wedge-scope.md) (Proposed). **Gating condition in the ADR:** "v0.5 is scoped *for* a named design partner. Until [`CLAUDE.md`](../CLAUDE.md) §11 #31 and #32 show concrete progress, v0.5 is a plan, not a build target."

### Gating: do not start until

- [ ] **G1 (P0).** A named design partner exists — closes [§11 #31](../CLAUDE.md).
- [ ] **G2 (P0).** v0.1 complete (Phase 0 phase-exit above).
- [ ] **G3 (P0).** ADR 0012 accepted (currently Proposed). Acceptance likely triggered by G1.
- [ ] **G4 (P1).** ICP narrowing done — closes [§11 #33](../CLAUDE.md). Blocked on G1.

### Track D — v0.5 architecture choices (P1, blocked on G1)

The v0.5 ADR pins scope; these are the concrete follow-ons it opens. Each is a candidate ADR from [`decisions/BACKLOG.md`](./decisions/BACKLOG.md).

- [ ] **D1 (P0).** **Retention tiering (CloudWatch → S3 → Glacier Deep Archive).** Candidate [C2-C](./research/deep-research-2026-04-22/CANDIDATES.md#c--retention-tiering-cloudwatch--s3--glacier-deep-archive). High readiness. Closes [R-C2-4](./research/deep-research-2026-04-22/RISKS.md#r-c2-4--cloudwatch-retention-default-compounds-past-cost-ceiling) cost-compound risk.
- [ ] **D2 (P0).** **Pre-generated seed artifact.** Candidate [C2-B](./research/deep-research-2026-04-22/CANDIDATES.md#b--seed-data-generation-pre-generated-shipped-as-immutable-artifact). High readiness. Closes [§11 #24](../CLAUDE.md); resolves [R-C2-3](./research/deep-research-2026-04-22/RISKS.md#r-c2-3--live-llm-seed-generation-breaks-budget--determinism). Unblocks Marketplace-listing build pipeline.
- [ ] **D3 (P1).** **Regulatory surface for v1 insurance claims.** Candidate [C2-E](./research/deep-research-2026-04-22/CANDIDATES.md#e--regulatory-surface-for-v1-insurance-claims). Medium readiness (scope question: how many of 5 cues is minimum-viable). Closes [§11 #22](../CLAUDE.md). Highest product-credibility payoff of the remaining opens.
- [ ] **D4 (P1).** **Canonical v1 maker-checker workflow** ($47,500 settlement). Candidate [C2-F](./research/deep-research-2026-04-22/CANDIDATES.md#f--canonical-v1-maker-checker-workflow). Medium readiness. Best drafted *with design-partner voice in the room.* Closes [§11 #16](../CLAUDE.md).
- [ ] **D5 (P2).** **Document integrity (application-layer SHA-256).** Candidate [C2-D](./research/deep-research-2026-04-22/CANDIDATES.md#d--document-integrity-application-layer-sha-256-hashing-of-supporting-documents). Scope: what counts as a "supporting document" in v1.

### Track E — v0.5 build (P1)

v0.5 keeps at full fidelity ([ADR 0012 decision](./decisions/0012-v0.5-wedge-scope.md)): Synthetic Runtime, LLM gateway + budget enforcement, CloudEvents envelope + dual correlation IDs ([ADR 0005](./decisions/0005-event-envelope-and-correlation-identifiers.md)), hash-chained audit trail ([ADR 0009](./decisions/0009-audit-trail-is-append-only-hash-chained.md)), seven-service P&C claims decomposition ([ADR 0006](./decisions/0006-v1-domain-anchor-insurance-claims.md)), Seeder/Reaper ([ADR 0010](./decisions/0010-seeder-and-reaper-patterns.md)), installable delivery model ([ADR 0003](./decisions/0003-installable-via-aws-marketplace.md)).

- [ ] **E1 (P0).** Expand `control-plane/understories/claims/` from v0.1's 1-entity/3-state shape to [ADR 0006](./decisions/0006-v1-domain-anchor-insurance-claims.md)'s 7-service decomposition. Budget: much larger than v0.1's 400 LOC; scope to what the design partner's sprint actually needs.
- [ ] **E2 (P0).** Build the **LLM gateway** per [ADR 0007](./decisions/0007-v1-cost-profile-and-llm-metering.md): pre-estimate → debit → reconcile, hard cutoff with graceful degradation. Per-install budget record. Interacts with [§11 #18](../CLAUDE.md) (enforcement mechanism detail) and [§11 #23](../CLAUDE.md) (mid-execution signaling).
- [ ] **E3 (P1).** Implement Step Functions for multi-step workflows per [ADR 0008](./decisions/0008-workflows-are-state-machines.md). Maker-checker ($47,500 threshold, per D4) is the canonical example.
- [ ] **E4 (P1).** Implement the hash-chained audit trail per [ADR 0009](./decisions/0009-audit-trail-is-append-only-hash-chained.md). Separate DynamoDB table, append-only, owned by `audit-service`.
- [ ] **E5 (P1).** Implement CloudEvents envelope + `{trace_id, case_id}` correlation per [ADR 0005](./decisions/0005-event-envelope-and-correlation-identifiers.md) across all cross-service boundaries.
- [ ] **E6 (P1).** Build **Agent Layer** with exactly two specialists per ADR 0012: **Environment** and **Data**. Both return `{status, summary, evidence, recommended_action}` per [ADR 0002](./decisions/0002-sub-agent-response-contract.md). See [`architecture/agent-layer.md`](./architecture/agent-layer.md). Closes part of [§11 #13 admin surface](../CLAUDE.md).
- [ ] **E7 (P2).** Minimum Canopy surface for the design partner's sprint. Likely a single static listing page, not the full Gallery (per ADR 0012's "no Gallery" rider). Single human exposure surface (no DMZ in v0.5).
- [ ] **E8 (P2).** CLI operator console — minimum for founder to operate the install. **Not a selling point** per ADR 0012.

### Track F — v0.5 operational readiness (P2)

- [ ] **F1 (P2).** Install in design partner's AWS account (or shared dev account with their involvement). Real install, not simulated.
- [ ] **F2 (P2).** Capture empirical cost data against [ADR 0007](./decisions/0007-v1-cost-profile-and-llm-metering.md) targets ($100/mo infra + $50/mo LLM). Feeds B4 if not already closed.
- [ ] **F3 (P2).** Capture first real feedback from design partner. Document in `docs/reviews/`.
- [ ] **F4 (P3).** Honest scope-comms doc — "this is v0.5; here's what v1 adds." Per ADR 0012 "Consequences — Accepts."

### Non-goals for Phase 1

From [ADR 0012](./decisions/0012-v0.5-wedge-scope.md):

- The DMZ/Canopy split ([ADR 0011](./decisions/0011-canopy-and-ai-first-dmz.md) remains v1 target).
- The other four inspection specialists (API, Event, Auth, Listing).
- Domain Starter selection UI, pack authoring tooling, hooks for additional domains.
- Full Gallery.
- Marketplace listing publication (v0.5 runs with a named partner, not on Marketplace).

---

## Phase 2 — v1 full

**Canonical shape:** the accepted ADRs 0001–0011 + whatever ADRs land in Phases 0–1. **Definition:** the Marketplace listing goes public. v0.5's four deliberate reductions are undone.

### Track G — Marketplace listing mechanics (P1)

Mostly `CLAUDE.md §11` items that are not research-gated; they become concrete when the listing build starts.

- [ ] **G1 (P1).** **Marketplace pricing model.** Candidate [UST-C6](./research/synthetic-user-testing/CANDIDATES.md#c6--marketplace-pricing-model-v1). Closes [§11 #1](../CLAUDE.md). Business call; needs investor/partner input.
- [ ] **G2 (P0).** **Marketplace stack structure + extension architecture.** Candidates [UST-C7](./research/synthetic-user-testing/CANDIDATES.md#c7--marketplace-stack-structure) + [C1-E](./research/deep-research-2026-04-21/CANDIDATES.md#e--extension-architecture-minimal-core--versioned-packs). Draft as a pair — pack boundary and CFN stack structure are the same decision. Closes [§11 #2](./../CLAUDE.md); informs [§11 #3](../CLAUDE.md).
- [ ] **G3 (P0).** **Update/upgrade strategy.** Closes [§11 #3](../CLAUDE.md) — the genuinely hard problem. Informed by G2. How new listing versions ship to existing installs without destroying customer data. Becomes a design doc first, then ADR.
- [ ] **G4 (P1).** **Minimum IAM permissions** the install requires. Closes [§11 #4](../CLAUDE.md). Security-review-driven. Every additional permission is a customer security-team conversation.
- [ ] **G5 (P1).** **Supported AWS regions at launch.** Closes [§11 #5](../CLAUDE.md). Business call.
- [ ] **G6 (P1).** **Supported customer account scenarios.** Closes [§11 #6](../CLAUDE.md). Single-account vs Control Tower vs both. Interacts with G2.
- [ ] **G7 (P2).** **Listing CI/CD.** Closes [§11 #8](../CLAUDE.md). GitHub Actions + OIDC into Jungl3's build account.
- [ ] **G8 (P1).** **FTR / "Deployed on AWS" posture.** Closes [§11 #35](../CLAUDE.md). Pursue FTR on v1, defer, or target later milestone.
- [ ] **G9 (P2).** **Vendor Insights posture.** Closes [§11 #36](../CLAUDE.md). Depends on G4 (IAM minimums) + customer security requirements.
- [ ] **G10 (P2).** **Co-sell / ACE / MDF strategy.** Closes [§11 #37](../CLAUDE.md). Blocks on having at least one joint-sell story.
- [ ] **G11 (P2).** **Solo-support operating model.** Closes [§11 #34](../CLAUDE.md). What "support" means when one human is all the company.

### Track H — DMZ (P0 for v1 proper)

Restoring the split deferred in v0.5. All opened by [ADR 0011](./decisions/0011-canopy-and-ai-first-dmz.md).

- [ ] **H1 (P0).** **DMZ agent runtime choice.** Closes [§11 #26](../CLAUDE.md). Claude Computer Use / Playwright MCP / custom. Cluster 4 synthesis maps the landscape: [`synthetic-user-testing/`](./research/synthetic-user-testing/).
- [ ] **H2 (P0).** **DMZ AWS topology.** Closes [§11 #27](../CLAUDE.md). Distinct from Canopy topology — different threat model (AI tool-use scoping, no public ingress).
- [ ] **H3 (P0).** **DMZ → Canopy promotion gate shape.** Closes [§11 #25](../CLAUDE.md). Explicit AI evaluation criteria / required human approval / hybrid.
- [ ] **H4 (P1).** **Promotion criteria.** Closes [§11 #29](../CLAUDE.md). What "passed" means. Needs first concrete evaluation run.
- [ ] **H5 (P1).** **Synthetic-user-tester placement.** Candidate [UST-C1](./research/synthetic-user-testing/CANDIDATES.md#c1--synthetic-user-tester-placement). Closes [§11 #28](../CLAUDE.md). Agent-Layer specialist vs top-level domain. Leaning Agent Layer specialist per `CLAUDE.md §11`.
- [ ] **H6 (P1).** **Pre-human pass framing.** Candidate [UST-C2](./research/synthetic-user-testing/CANDIDATES.md#c2--pre-human-pass-framing). Product-framing: the DMZ is a *pre-human pass*, not a human-test replacement.
- [ ] **H7 (P1).** **Planner-Executor split for browser-capable agents.** Candidate [UST-C3](./research/synthetic-user-testing/CANDIDATES.md#c3--planner-executor-split-for-browser-capable-agents). Becomes prompt-injection containment requirement per [UST-R1](./research/synthetic-user-testing/RISKS.md#r1--prompt-injection-from-untrusted-prototype-ui).
- [ ] **H8 (P1).** **Persona schema pinned (6-point).** Candidate [UST-C4](./research/synthetic-user-testing/CANDIDATES.md#c4--persona-schema-pinned).
- [ ] **H9 (P2).** **Persona reasoning traces as audit events.** Candidate [UST-C5](./research/synthetic-user-testing/CANDIDATES.md#c5--persona-reasoning-traces-as-audit-events). Closes [UST-R2](./research/synthetic-user-testing/RISKS.md#r2--think-aloud--pii-leakage-863) CoT PII leakage.
- [ ] **H10 (P1).** **Persona schema alignment (DMZ vs Canopy).** Closes [§11 #30](../CLAUDE.md). Shared vs divergent schema.

### Track I — Canopy at full fidelity (P0 for v1 proper)

- [ ] **I1 (P0).** **Canopy authentication mechanism.** Closes [§11 #9](../CLAUDE.md). Recommendation on record: magic link + password-guest + seeded personas + role-based. Design call.
- [ ] **I2 (P0).** **Canopy AWS topology.** Closes [§11 #10](../CLAUDE.md). VPC shape, ALB/WAF pattern, per-team subdomain or path routing, DNS apex.
- [ ] **I3 (P0).** **Full Gallery.** Restores what v0.5 punted. Tiles backed by [Integration Contract](./glossary.md#integration-contract) `/metadata`, launch through controlled gateway, per [ADR 0011](./decisions/0011-canopy-and-ai-first-dmz.md).
- [ ] **I4 (P1).** **Canopy prototype lifespan.** Closes [§11 #12](../CLAUDE.md). Retention criteria, extension path, teardown enforcement.
- [ ] **I5 (P1).** **Canopy telemetry + feedback capture.** Closes [§11 #13](../CLAUDE.md). What every Canopy-deployed prototype must emit.
- [ ] **I6 (P2).** **Data classification rules.** Closes [§11 #14](../CLAUDE.md). Recommendation shape + exception-approval flow within customer's data boundary.

### Track J — Agent Layer at full fidelity (P1)

- [ ] **J1 (P0).** Expand from v0.5's 2 specialists to **all 6**: Environment, Data, API, Event, Auth, Listing. Each attached to a real [inspection surface](./glossary.md#inspection-surface), each returning the `{status, summary, evidence, recommended_action}` contract ([ADR 0002](./decisions/0002-sub-agent-response-contract.md)). See [`architecture/agent-layer.md`](./architecture/agent-layer.md).
- [ ] **J2 (P1).** **Top-level orchestrator** routing + composition. Per [`architecture/agent-layer.md`](./architecture/agent-layer.md).
- [ ] **J3 (P1).** **v1 admin surface scope (remaining).** Candidate [C1-D](./research/deep-research-2026-04-21/CANDIDATES.md#d--v1-custom-admin-surface-scope). Low readiness. View set + Agent-Layer relationship. Closes what [ADR 0007](./decisions/0007-v1-cost-profile-and-llm-metering.md) left open.
- [ ] **J4 (P2).** **Minimum viable realism threshold** ratified as ADR. Candidate [C1-B](./research/deep-research-2026-04-21/CANDIDATES.md#b--minimum-viable-realism-threshold). Depends on B1 (MVR floor); ratify once enough downstream has firmed.

### Track K — Domain Starters (P2)

First move toward the multi-domain capability deferred by [ADR 0012](./decisions/0012-v0.5-wedge-scope.md).

- [ ] **K1 (P0).** Second [Domain Starter](./glossary.md#domain-starter) ships — this is what turns "P&C claims Understory" into "one of N starters." Which domain depends on second-customer signal.
- [ ] **K2 (P1).** Domain Starter selection UI in the Control Plane.
- [ ] **K3 (P2).** Pack authoring tooling — once there are ≥3 starters and a pattern is visible. Per [`../CLAUDE.md`](../CLAUDE.md) §4's "favor deletion over addition" discipline: don't build the authoring tool before the second starter proves it's needed.

### Track L — Tooling/CLI (P2)

- [ ] **L1 (P1).** **Kiro CLI vs custom CLI.** Closes [§11 #20](../CLAUDE.md). Decide when the CLI has enough commands to justify the question (≥3 per [`../CLAUDE.md`](../CLAUDE.md) §10 `cli-command-author` promotion criterion).
- [ ] **L2 (P2).** CLI operator surface at full polish (not the v0.5 minimum).

### Non-goals for Phase 2

- Cross-install discoverability. Closes [§11 #15](../CLAUDE.md) negatively — default is "no." A federated Gallery is a separate future design.
- Solving first-sponsor context. Closes [§11 #21](../CLAUDE.md) — accumulates organically, not a build item.

---

## Cross-cutting hardening

These spans multiple phases or aren't owned by any single track. Called out here so they don't get lost.

### Observability

- v0.1: structured JSON logs with `install_id` + `trace_id`.
- v0.5: full [ADR 0005](./decisions/0005-event-envelope-and-correlation-identifiers.md) event envelope; hash-chained audit trail ([ADR 0009](./decisions/0009-audit-trail-is-append-only-hash-chained.md)).
- v1: retention tiering per **D1** (`CloudWatch → S3 → Glacier Deep Archive`). Resolves [R-C2-2](./research/deep-research-2026-04-22/RISKS.md#r-c2-2--kinesis-firehose-put-request-cost-cliff) + [R-C2-4](./research/deep-research-2026-04-22/RISKS.md#r-c2-4--cloudwatch-retention-default-compounds-past-cost-ceiling).

### Cost discipline

- v0.1: informal expectation (≪ $5/install/month dev).
- v0.5: [ADR 0007](./decisions/0007-v1-cost-profile-and-llm-metering.md) targets enforced; F2 captures first empirical data.
- v1: LLM gateway enforcement details ([§11 #18](../CLAUDE.md)) + mid-execution signaling ([§11 #23](../CLAUDE.md)) pinned in design docs driven by E2.

### Security posture

- v0.1: `install_id` as security boundary, dev-account only, short-lived. Explicit non-production posture.
- v0.5: design partner's threat model — partner accepts they're in a sprint with known-unstable prototypes.
- v1: real IAM minimums (G4), Canopy auth (I1), data classification rules (I6), DMZ prompt-injection containment (H7), CoT leakage controls (H9).

### Documentation lifecycle

- Every ADR that lands removes a `CLAUDE.md §11` item (or adds one). Keep `decisions/STATUS.md` current — it's the one-page view investors and reviewers will read.
- Reviews in `docs/reviews/` are opinion, not policy. Any durable change a review implies must land as an ADR, a `§11` edit, or a `positioning.md` edit.
- Research is frozen ([`research-archive/README.md`](./research-archive/README.md)). If a claim needs re-litigating, open a new `§11` item or ADR — don't rewrite the archive.

---

## What reshuffles this plan

From [v0.1 plan §6](./reviews/2026-04-24-v0.1-plan.md) and the viability review:

- **A design-partner call gets booked** → pause Track C at natural boundary; move to call prep. Its output rewrites Phase 1 priorities.
- **Cost surprises upward in Track C** (> $20/install/month) → pause C, investigate, update [§11 #18](../CLAUDE.md) with empirical data.
- **Vend or reap > 5 minutes** → pause, reconsider [§11 #11](../CLAUDE.md) (Lambda vs Fargate) and [§11 #3](../CLAUDE.md) (upgrade strategy).
- **First design-partner call reveals ICP is not P&C insurance** → [`CLAUDE.md §11 #33`](../CLAUDE.md) resolves differently; parts of Track D (especially D3, D4) re-scope; v0.1's domain overlay changes (primitives survive).
- **AWS Marketplace ISV program changes** (e.g. new FTR requirements, Vendor Insights mandates) → G8/G9 re-scope.
- **A competitor ships the bundle** → [viability review §3](./reviews/2026-04-24-viability-review.md) names this as the scenario to watch; would force a repositioning conversation, not a scope change.

---

## Related

- [`overview.md`](./overview.md) — narrative end-to-end orientation.
- [`../CLAUDE.md`](../CLAUDE.md) — repo policy, §0 current phase, §11 open decisions.
- [`reviews/2026-04-24-v0.1-plan.md`](./reviews/2026-04-24-v0.1-plan.md) — canonical v0.1 plan.
- [`reviews/2026-04-24-viability-review.md`](./reviews/2026-04-24-viability-review.md) — honest external read.
- [`reviews/2026-04-24-research-sufficiency.md`](./reviews/2026-04-24-research-sufficiency.md) — why research is frozen.
- [`decisions/STATUS.md`](./decisions/STATUS.md) — one-page decided/next/open.
- [`decisions/BACKLOG.md`](./decisions/BACKLOG.md) — candidate ADRs with drafting order.
- [`decisions/0012-v0.5-wedge-scope.md`](./decisions/0012-v0.5-wedge-scope.md) — canonical v0.5 scope.
