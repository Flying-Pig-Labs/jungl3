# docs/research/

Captured third-party analysis, market research, and external memos that inform Jungle3 design. **Not repo policy.**

## Contents

- [What lives here](#what-lives-here)
- [How to read anything in here](#how-to-read-anything-in-here)
- [Tree layout](#tree-layout)
- [Topic index](#topic-index) — search by subject
- [First-generation captures](#first-generation-captures) — `researchN-*.md`
- [Cluster 1: `deep-research-2026-04-21/`](#cluster-1-deep-research-2026-04-21) — 12 reports + synthesis + findings
- [Cluster 2: `deep-research-2026-04-22/`](#cluster-2-deep-research-2026-04-22) — 10 reports + synthesis, ADR-targeted
- [Cluster 3: `sideband-2026-04-22/`](#cluster-3-sideband-2026-04-22) — 7 adjacent-market reports + synthesis
- [Synthesis layer at a glance](#synthesis-layer-at-a-glance)
- [Filename conventions](#filename-conventions)
- [Related](#related)

---

## What lives here

Documents that:

- were written by someone (or something) outside the Jungle3 maintainers,
- make specific claims, recommendations, or arguments,
- and that we want to preserve so we can trace where decisions came from.

This is the paper trail behind ADRs, not a substitute for them.

## How to read anything in here

1. Check the frontmatter at the top of each raw report. Parallel.ai report files carry a `query:`, `processor:`, `run_id:`, and `date:`. First-generation captures carry a prose preamble.
2. Specific recommendations — pricing numbers, service choices, stack shapes, timelines — are **not** adopted unless the corresponding ADR says so. If a recommendation here isn't in an ADR, it is a proposal, not a decision.
3. If a document here argues for something that contradicts current repo content, that's information. Raise it — either as an open question in `../../CLAUDE.md` §11 or as a candidate ADR. Don't "reconcile" silently.
4. The synthesis files (`findings.md`, each cluster's `SYNTHESIS.md`) are the reading order if you're new to this tree. Start there, drop into raw reports when you need evidence.

---

## Tree layout

```
docs/research/
├── README.md                                  # this file
├── findings.md                                # cluster-1 narrative read + v1 direction (cited from ADRs 0005–0010)
├── research1-aws-installable-shape.md         # installable-vs-hosted analyst memo (cited from ADR 0003)
├── research2-v1-service-build-plan.md         # 10-service v1 proposal (cited from ADRs 0003/0004, architecture, glossary)
├── research3.md                               # 12-topic question set that produced cluster 1
├── deep-research-2026-04-21/                  # Cluster 1
│   ├── README (this is in-tree, see below)
│   ├── SYNTHESIS.md                           # cross-report synthesis + 6 candidate ADRs
│   ├── EXECUTIVE_SUMMARIES.md                 # one-paragraph distillations per report
│   ├── DECISIONS.md                           # flat backlog of ~60 open decisions surfaced by cluster 1
│   ├── prompts/ runs/ logs/ results/          # Parallel.ai submission + response artifacts
├── deep-research-2026-04-22/                  # Cluster 2 — ADR-targeted
│   ├── README.md
│   ├── SYNTHESIS.md                           # 10-report synthesis, 7 candidate follow-on ADRs, 5 risks
│   ├── prompts/ runs/ logs/ results/
│   └── run.py .gitignore
└── sideband-2026-04-22/                       # Cluster 3 — adjacent-market landscape
    ├── SYNTHESIS.md                           # validates "novel category" positioning
    └── 01..07-*.md                            # 7 reports (report 07 is unrelated; see filename)
```

---

## Topic index

Search by subject. Each row lists the documents that discuss the topic meaningfully (not every passing mention). "→ ADR" marks topics already pinned by a Nygard ADR.

| Topic | Where to look |
|---|---|
| **AI agent frameworks** (LangGraph, CrewAI, AutoGen, OpenHands/OpenDevin, Devin, smolagents) | [sideband 04](./sideband-2026-04-22/04-ai-software-generation-multiagent.md), [sideband 01](./sideband-2026-04-22/01-persistent-state-agents-and-openclaw.md) |
| **Agent: admin-agent design, Claude Code SDK, tool-constrained** | [cluster 2 report 05](./deep-research-2026-04-22/results/05-claude-code-sdk-agent-patterns.md), [cluster 2 SYNTHESIS](./deep-research-2026-04-22/SYNTHESIS.md), [findings.md §6.2](./findings.md) → [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) |
| **Agent: sandboxed execution, OIDC workload identity** | [sideband 04](./sideband-2026-04-22/04-ai-software-generation-multiagent.md) §5 |
| **Agent: persistent Git-backed memory (OpenClaw pattern)** | [sideband 01](./sideband-2026-04-22/01-persistent-state-agents-and-openclaw.md), [sideband SYNTHESIS §4](./sideband-2026-04-22/SYNTHESIS.md) |
| **Audit trail: append-only, hash-chained, tamper-evident** | [cluster 2 report 02](./deep-research-2026-04-22/results/02-dynamodb-hash-chained-audit.md), [cluster 1 report 11](./deep-research-2026-04-21/results/11-regulated-cues.md), [findings.md §5.4](./findings.md) → [ADR 0009](../decisions/0009-audit-trail-is-append-only-hash-chained.md) |
| **AWS Marketplace: packaging, delivery, listing** | [research1-aws-installable-shape.md](./research1-aws-installable-shape.md), [cluster 1 report 07](./deep-research-2026-04-21/results/07-packaging.md) → [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md) |
| **Chaos engineering, fault injection, k6, Gremlin, Chaos Mesh** | [sideband 05](./sideband-2026-04-22/05-synthetic-data-and-chaos-engineering.md) |
| **CloudFormation seeder/reaper patterns** | [cluster 2 report 07](./deep-research-2026-04-22/results/07-cloudformation-seeder-reaper.md), [findings.md §8](./findings.md) → [ADR 0010](../decisions/0010-seeder-and-reaper-patterns.md) |
| **Cost floor, infra cost, FinOps** | [cluster 1 report 08](./deep-research-2026-04-21/results/08-cost-floor.md), [findings.md §6.3](./findings.md) → [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) |
| **Correlation IDs, `trace_id`/`case_id`, CloudEvents envelope** | [cluster 1 reports 05/11](./deep-research-2026-04-21/results/), [findings.md §5.1–5.2](./findings.md) → [ADR 0005](../decisions/0005-event-envelope-and-correlation-identifiers.md) |
| **Domain anchor: P&C insurance claims** | [cluster 1 report 02](./deep-research-2026-04-21/results/02-domain-anchor.md), [cluster 2 report 03](./deep-research-2026-04-22/results/03-claims-settlement-maker-checker.md), [findings.md §6.1](./findings.md) → [ADR 0006](../decisions/0006-v1-domain-anchor-insurance-claims.md) |
| **DMZ, isolated sandboxes, microVMs** | [sideband 02](./sideband-2026-04-22/02-innovation-sandbox-platform-landscape.md) |
| **Ephemeral environments: TTL, teardown, cost control (Env0)** | [sideband 05](./sideband-2026-04-22/05-synthetic-data-and-chaos-engineering.md), [cluster 2 report 07](./deep-research-2026-04-22/results/07-cloudformation-seeder-reaper.md) |
| **Event distributions, arrival times, Poisson/NHPP** | [cluster 2 report 04](./deep-research-2026-04-22/results/04-pc-claims-event-distributions.md), [cluster 2 report 10](./deep-research-2026-04-22/results/10-synthetic-timestamp-distributions.md) |
| **Event/workflow patterns** | [cluster 1 report 05](./deep-research-2026-04-21/results/05-event-workflow.md), [cluster 2 report 01](./deep-research-2026-04-22/results/01-step-functions-regulated-workflows.md) → [ADR 0008](../decisions/0008-workflows-are-state-machines.md) |
| **Extension model, future domain variants** | [cluster 1 report 12](./deep-research-2026-04-21/results/12-extension-model.md) |
| **IDPs, platform engineering (Backstage, Port, Cortex, Humanitec, Crossplane, Kratix)** | [sideband 03](./sideband-2026-04-22/03-idps-and-platform-engineering.md) |
| **Ideation bazaar, trend detection, scraping law** | [sideband 06](./sideband-2026-04-22/06-ideation-bazaar-and-trend-detection.md) |
| **LLM cost: pre-estimation, metering, budget enforcement** | [cluster 2 report 06](./deep-research-2026-04-22/results/06-llm-cost-estimation-accuracy.md), [findings.md §6.3–6.4](./findings.md) → [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) |
| **Maker-checker, four-eyes, approval workflows** | [cluster 1 report 11](./deep-research-2026-04-21/results/11-regulated-cues.md), [cluster 2 report 03](./deep-research-2026-04-22/results/03-claims-settlement-maker-checker.md), [findings.md §5.4](./findings.md) |
| **Minimum viable realism: entity counts, role counts** | [cluster 1 report 03](./deep-research-2026-04-21/results/03-mvr-threshold.md), [research1](./research1-aws-installable-shape.md) |
| **Novel category positioning, no-single-vendor-bundle** | [sideband 02](./sideband-2026-04-22/02-innovation-sandbox-platform-landscape.md), [sideband SYNTHESIS §3](./sideband-2026-04-22/SYNTHESIS.md) |
| **Observability: CloudWatch, X-Ray, per-case inspection** | [cluster 1 report 09](./deep-research-2026-04-21/results/09-observability-ux.md), [findings.md §6.2](./findings.md) → [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) |
| **Personas, role mix, writing style** | [cluster 1 report 10](./deep-research-2026-04-21/results/10-personas.md), [cluster 2 report 08](./deep-research-2026-04-22/results/08-persona-writing-style-generation.md), [research2](./research2-v1-service-build-plan.md) |
| **Regulated cues beyond maker-checker** | [cluster 1 report 11](./deep-research-2026-04-21/results/11-regulated-cues.md), [cluster 2 report 09](./deep-research-2026-04-22/results/09-pc-regulated-cues-beyond-maker-checker.md) |
| **Service decomposition (10 vs 7 services)** | [research2-v1-service-build-plan.md](./research2-v1-service-build-plan.md), [findings.md §6.5](./findings.md) → [ADR 0006](../decisions/0006-v1-domain-anchor-insurance-claims.md) |
| **Step Functions state machines for regulated workflows** | [cluster 2 report 01](./deep-research-2026-04-22/results/01-step-functions-regulated-workflows.md) → [ADR 0008](../decisions/0008-workflows-are-state-machines.md) |
| **Stubs and simulators** | [cluster 1 report 06](./deep-research-2026-04-21/results/06-stubs.md) |
| **Synthetic data: high-fidelity, Gretel/Tonic/MOSTLY AI/YData** | [sideband 05](./sideband-2026-04-22/05-synthetic-data-and-chaos-engineering.md), [cluster 1 report 04](./deep-research-2026-04-21/results/04-synthetic-data.md) |
| **"Feel real" — what makes a synthetic enterprise plausible** | [cluster 1 report 01](./deep-research-2026-04-21/results/01-feel-real.md), [findings.md §5.5](./findings.md) |

---

## First-generation captures

Older convention, before the deep-research cluster format. Three files; all cited from repo policy docs, therefore **frozen** (see [ADR 0004](../decisions/0004-canonical-platform-vocabulary.md) §62).

| # | Captured | Subject | Status |
| --- | --- | --- | --- |
| [research1-aws-installable-shape.md](./research1-aws-installable-shape.md) | 2026-04-21 | Analyst memo: installable-vs-hosted; proposed v1 AWS service set | Installable-vs-hosted accepted by [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md); other recommendations open in [`CLAUDE.md`](../../CLAUDE.md) §11. |
| [research2-v1-service-build-plan.md](./research2-v1-service-build-plan.md) | 2026-04-21 | Service-by-service v1 build plan (10 services, Work Item anchor); derived from research1 | Partially routed into CLAUDE.md §11 (items 7, 11, 16–19) and into architecture docs. Service-set decomposition, Control Plane runtime, realism threshold, Admin-vs-Agent-Layer overlap, and Domain Starter anchor remain open. |
| [research3.md](./research3.md) | 2026-04-21 | 12-topic question set that produced Cluster 1 | Question set only; answers live in [`deep-research-2026-04-21/`](./deep-research-2026-04-21/). |

[`findings.md`](./findings.md) is the narrative read of Cluster 1 plus the v1 direction. It sits at this level (not inside the cluster directory) because it is heavily cited from ADRs 0005–0010 and by `CLAUDE.md`, and moving it would break those citations. **Start here if you want the v1 story**: insurance-claims-only domain, LLM-agent-over-deterministic-tools admin, CloudWatch/X-Ray observability, $100 infra + $50 LLM metered ceiling, ephemeral-capable lifecycle.

---

## Cluster 1: `deep-research-2026-04-21/`

**Twelve ultra4x Parallel.ai reports** commissioned by [`research3.md`](./research3.md). Covers what-makes-a-synthetic-enterprise-feel-real, the v1 domain anchor, minimum viable realism, synthetic data generation, event/workflow patterns, stubs and simulators, AWS Marketplace packaging, cost floor, observability UX, personas and workload realism, regulated-environment cues, and the extension model.

**Synthesis layer (read in this order):**

1. [`../findings.md`](./findings.md) — narrative read + adopted v1 direction (cited from ADRs 0005–0010).
2. [`deep-research-2026-04-21/SYNTHESIS.md`](./deep-research-2026-04-21/SYNTHESIS.md) — structured cross-report synthesis, convergences, divergences, decision surface, 6 candidate ADRs.
3. [`deep-research-2026-04-21/EXECUTIVE_SUMMARIES.md`](./deep-research-2026-04-21/EXECUTIVE_SUMMARIES.md) — one-paragraph distillation per report.
4. [`deep-research-2026-04-21/DECISIONS.md`](./deep-research-2026-04-21/DECISIONS.md) — flat backlog of ~60 open decisions.

**Raw reports:** [`deep-research-2026-04-21/results/`](./deep-research-2026-04-21/results/) — `01-feel-real.md` through `12-extension-model.md`, each with matching `.json`.

**Status:** Raw reports and synthesis are **not adopted as repo policy**. ADRs 0005–0010 are the policy output of this cluster. Remaining candidates are tracked in SYNTHESIS.md §4 and DECISIONS.md.

---

## Cluster 2: `deep-research-2026-04-22/`

**Ten ultra4x Parallel.ai reports**, ADR-path-targeted. Each topic sharpens an implementation detail exposed by ADRs 0005–0010 (Step Functions for regulated workflows, DynamoDB hash-chained audit, canonical maker-checker workflow, P&C event distributions, Claude Code SDK agent patterns, LLM cost-estimation accuracy, CloudFormation seeder/reaper patterns, persona writing-style generation, P&C regulated cues beyond maker-checker, synthetic timestamp distributions).

**Synthesis:** [`deep-research-2026-04-22/SYNTHESIS.md`](./deep-research-2026-04-22/SYNTHESIS.md) — validates each ADR, surfaces 7 candidate follow-on ADRs, names 7 new open questions and 5 "will hit this wall" risks.

**Raw reports:** [`deep-research-2026-04-22/results/`](./deep-research-2026-04-22/results/) — `01-step-functions-regulated-workflows.md` through `10-synthetic-timestamp-distributions.md`, each with matching `.json`.

**Cluster README:** [`deep-research-2026-04-22/README.md`](./deep-research-2026-04-22/README.md) — includes submit/poll instructions for re-runs.

**Status:** This cluster produced [ADR 0010](../decisions/0010-seeder-and-reaper-patterns.md). Six other candidate ADRs (retention tiering, document integrity, regulatory surface, canonical workflow, ADR 0009 amendments, seed-data generation) are still queued.

---

## Cluster 3: `sideband-2026-04-22/`

**Seven reports** dropped into the repo on 2026-04-22 that do *not* follow the ADR path. They are an adjacent-market landscape sweep. The cluster's central finding: **no single vendor offers the Jungle3 bundle** — the category does not exist as a product, which validates Jungle3's novel-category positioning.

| # | Report | Topic |
|---|---|---|
| 01 | [`01-persistent-state-agents-and-openclaw.md`](./sideband-2026-04-22/01-persistent-state-agents-and-openclaw.md) | OpenClaw, Git-backed agent memory, stateful vs ephemeral agents |
| 02 | [`02-innovation-sandbox-platform-landscape.md`](./sideband-2026-04-22/02-innovation-sandbox-platform-landscape.md) | Multi-tenant innovation sandboxes; no vendor ships the bundle |
| 03 | [`03-idps-and-platform-engineering.md`](./sideband-2026-04-22/03-idps-and-platform-engineering.md) | Backstage, Port, Cortex, Humanitec, Crossplane, Kratix |
| 04 | [`04-ai-software-generation-multiagent.md`](./sideband-2026-04-22/04-ai-software-generation-multiagent.md) | Devin, OpenHands, SWE-agent, LangGraph vs CrewAI vs AutoGen |
| 05 | [`05-synthetic-data-and-chaos-engineering.md`](./sideband-2026-04-22/05-synthetic-data-and-chaos-engineering.md) | Gretel/Tonic/MOSTLY AI/YData, Env0 TTL, k6 + Gremlin + Chaos Mesh |
| 06 | [`06-ideation-bazaar-and-trend-detection.md`](./sideband-2026-04-22/06-ideation-bazaar-and-trend-detection.md) | Exploding Topics, Parallel.ai, Diffbot, hiQ v. LinkedIn, GDPR |
| 07 | [`07-unrelated-individual-communication-strategies.md`](./sideband-2026-04-22/07-unrelated-individual-communication-strategies.md) | Psychology of interpersonal communication. No Jungle3 hook — the filename is the disposition. |

**Synthesis:** [`sideband-2026-04-22/SYNTHESIS.md`](./sideband-2026-04-22/SYNTHESIS.md) — what each report says, what it changes for Jungle3 (mostly: nothing yet), what becomes useful later.

**Status:** No ADR amendments, no new candidate ADRs, no CLAUDE.md §11 changes from this material. Reference-grade, not decision-grade.

---

## Synthesis layer at a glance

If you only read four files in this tree:

1. [`findings.md`](./findings.md) — the v1 story.
2. [`deep-research-2026-04-21/SYNTHESIS.md`](./deep-research-2026-04-21/SYNTHESIS.md) — how that story was derived.
3. [`deep-research-2026-04-22/SYNTHESIS.md`](./deep-research-2026-04-22/SYNTHESIS.md) — what the ADRs exposed as still-to-build.
4. [`sideband-2026-04-22/SYNTHESIS.md`](./sideband-2026-04-22/SYNTHESIS.md) — the adjacent market, for positioning.

---

## Filename conventions

- **First-generation captures:** `researchN.md` or `researchN-short-slug.md`, monotonically increasing. No renumbering. If a file is obsolete, keep it and mark status in its preamble; don't delete. Slugs are kebab-case. These three files (`research1-*.md`, `research2-*.md`, `research3.md`) are **frozen** per ADR 0004.
- **Cluster directories:** `deep-research-YYYY-MM-DD/` for Parallel.ai ADR-path clusters, `sideband-YYYY-MM-DD/` for off-path landscape sweeps. Each has its own synthesis layer at the cluster root.
- **Inside a cluster:** numbered files `NN-short-slug.md` in `results/` (for Parallel.ai clusters) or at cluster root (for sideband). Numbers are 1-indexed and stable — `07-unrelated-…` communicates through its slug.
- **Synthesis files:** uppercase at the cluster root — `SYNTHESIS.md`, `EXECUTIVE_SUMMARIES.md`, `DECISIONS.md`. This distinguishes them visually from raw reports.

## Related

- [`../decisions/`](../decisions/) — where research conclusions become decisions
- [`../../CLAUDE.md`](../../CLAUDE.md) §7 — information placement rules
- [`../../CLAUDE.md`](../../CLAUDE.md) §11 — open decisions (many informed by files here)
