# docs/research/

Captured third-party analysis, market research, and external memos that inform Jungl3 design. **Not repo policy.**

## Contents

- [What lives here](#what-lives-here)
- [How to read anything in here](#how-to-read-anything-in-here)
- [Archive convention](#archive-convention) — what moved to `docs/research-archive/` on 2026-04-24 and why
- [Tree layout](#tree-layout)
- [Topic index](#topic-index) — search by subject
- [Cluster 1: `deep-research-2026-04-21/`](#cluster-1-deep-research-2026-04-21) — synthesis layer (raw reports in archive)
- [Cluster 2: `deep-research-2026-04-22/`](#cluster-2-deep-research-2026-04-22) — synthesis layer (raw reports in archive)
- [Cluster 3: `sideband-2026-04-22/`](#cluster-3-sideband-2026-04-22) — synthesis (raw reports in archive)
- [Cluster 4: `synthetic-user-testing/`](#cluster-4-synthetic-user-testing) — 5 reports + synthesis, implementation-relevant (not archived)
- [Synthesis layer at a glance](#synthesis-layer-at-a-glance)
- [Filename conventions](#filename-conventions)
- [Related](#related)

---

## What lives here

Documents that:

- were written by someone (or something) outside the Jungl3 maintainers,
- make specific claims, recommendations, or arguments,
- and that we want to preserve so we can trace where decisions came from.

This is the paper trail behind ADRs, not a substitute for them.

## How to read anything in here

1. Check the frontmatter at the top of each raw report. Parallel.ai report files carry a `query:`, `processor:`, `run_id:`, and `date:`. First-generation captures carry a prose preamble.
2. Specific recommendations — pricing numbers, service choices, stack shapes, timelines — are **not** adopted unless the corresponding ADR says so. If a recommendation here isn't in an ADR, it is a proposal, not a decision.
3. If a document here argues for something that contradicts current repo content, that's information. Raise it — either as an open question in `../../CLAUDE.md` §11 or as a candidate ADR. Don't "reconcile" silently.
4. The synthesis files (`findings.md`, each cluster's `SYNTHESIS.md`) are the reading order if you're new to this tree. Start there, drop into raw reports when you need evidence.

---

## Archive convention

On 2026-04-24 this tree was split. Everything here is still pointed at from ADRs and `CLAUDE.md`, so nothing was deleted — but **raw inputs** (Parallel.ai `prompts/`, `runs/`, `logs/`, `results/`; first-generation captures `research1/2/3.md`; sideband raw reports `01..07-*.md`; the 2026-04-24 user memos) moved to [`../research-archive/`](../research-archive/).

The **synthesis layer stays here**: `findings.md`, every cluster's `SYNTHESIS.md` / `CANDIDATES.md` / `RISKS.md` / `DECISIONS.md` / `EXECUTIVE_SUMMARIES.md`, the cluster `README.md`s, and the still-load-bearing `synthetic-user-testing/` cluster in full.

Inside each archived-raw cluster, the synthesis documents reference `./results/...` and `./prompts/...` paths. Those paths still resolve — the active cluster directories carry symlinks to their archived siblings so synthesis → raw report links work unchanged. See [`../research-archive/README.md`](../research-archive/README.md) for the archive's own index.

Motivation: the research inputs have been absorbed into ADRs 0001–0012 and `CLAUDE.md §11`. Reading them again to re-derive what's already pinned is the "very well-organized `docs/` tree" failure mode the [2026-04-24 viability review](../reviews/2026-04-24-viability-review.md) and [research-sufficiency note](../reviews/2026-04-24-research-sufficiency.md) name. This tree is now the *working surface*: synthesis + digested candidates + decision-ready risks.

---

## Tree layout

```
docs/research/                                 # the working surface — synthesis layer
├── README.md                                  # this file
├── findings.md                                # cluster-1 narrative read + v1 direction (cited from ADRs 0005–0010)
├── deep-research-2026-04-21/                  # Cluster 1 — synthesis only; raw reports symlinked from archive
│   ├── SYNTHESIS.md                           # cross-report synthesis + 6 candidate ADRs
│   ├── EXECUTIVE_SUMMARIES.md                 # one-paragraph distillations per report
│   ├── DECISIONS.md                           # flat backlog of ~60 open decisions surfaced by cluster 1
│   ├── CANDIDATES.md                          # decision-ready: 6 candidate ADRs (A–F), 3 of them resolved
│   ├── RISKS.md                               # decision-ready: 7 named risks
│   └── results/ prompts/ runs/ logs/          # → symlinks to ../../research-archive/deep-research-2026-04-21/
├── deep-research-2026-04-22/                  # Cluster 2 — synthesis only; raw reports symlinked from archive
│   ├── README.md
│   ├── SYNTHESIS.md                           # 10-report synthesis, 7 candidate follow-on ADRs, 5 risks
│   ├── CANDIDATES.md                          # decision-ready: 7 candidate ADRs (A–G), 1 resolved
│   ├── RISKS.md                               # decision-ready: 8 named risks
│   └── results/ prompts/ runs/ logs/          # → symlinks to ../../research-archive/deep-research-2026-04-22/
├── sideband-2026-04-22/                       # Cluster 3 — adjacent-market landscape
│   ├── SYNTHESIS.md                           # validates "novel category" positioning
│   └── 01..07-*.md                            # → symlinks to ../../research-archive/sideband-2026-04-22/ (raw reports)
└── synthetic-user-testing/                    # Cluster 4 — still active, NOT archived; load-bearing for §11 #26 #28
    ├── SYNTHESIS.md                           # 5-report synthesis; 7 candidate ADRs; 3 risks
    ├── CANDIDATES.md                          # decision-ready: 7 candidate ADRs (C1–C7) individually pickable
    ├── RISKS.md                               # decision-ready: 5 named risks (R1–R5), triggers, mitigations
    ├── 01-existing-platforms.md               # WebArena/OSWorld/AgentBench; UserTesting/Maze/Hotjar
    ├── 02-ai-computer-use-tech.md             # Claude Computer Use vs OpenAI Operator/CUA
    ├── 03-persona-simulation-methodology.md   # fidelity gap, PII leakage, dual-loop personas
    ├── 04-build-it-yourself-claude-sdk.md     # Planner/Executor split, Playwright MCP, PersonaGym
    └── aws-marketplace-monetization-guide.md  # fees, Concurrent Agreements, CDK→CFN, CPPO

docs/research-archive/                         # frozen — raw inputs, first-gen captures, absorbed memos
├── README.md                                  # archive index
├── first-generation/
│   ├── research1-aws-installable-shape.md     # cited from ADR 0003, ADR 0004
│   ├── research2-v1-service-build-plan.md     # cited from ADR 0003, ADR 0004, architecture docs
│   └── research3.md                           # question set that produced Cluster 1
├── deep-research-2026-04-21/
│   └── prompts/ runs/ logs/ results/          # Parallel.ai submission + response artifacts
├── deep-research-2026-04-22/
│   ├── prompts/ runs/ logs/ results/
│   └── run.py
├── sideband-2026-04-22/
│   └── 01..07-*.md                            # 7 raw reports
└── user-memos-2026-04-24/
    ├── aws-innovation-environment-design-report.md
    ├── aws-marketplace-insurtech-deployment-proposal.md
    ├── aws-marketplace-sales-strategy-report.md
    └── innovation-sandbox-ai-driven-product-development.md
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
| **AWS Marketplace: packaging, delivery, listing** | [research1 (archived)](../research-archive/first-generation/research1-aws-installable-shape.md), [cluster 1 report 07](./deep-research-2026-04-21/results/07-packaging.md), [insurtech deployment proposal (archived)](../research-archive/user-memos-2026-04-24/aws-marketplace-insurtech-deployment-proposal.md) → [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md) |
| **AWS Marketplace: pricing, metering, CPPO, Concurrent Agreements** | [synthetic-user-testing/aws-marketplace-monetization-guide.md](./synthetic-user-testing/aws-marketplace-monetization-guide.md), [synthetic-user-testing SYNTHESIS §2.5](./synthetic-user-testing/SYNTHESIS.md), [sales strategy report (archived)](../research-archive/user-memos-2026-04-24/aws-marketplace-sales-strategy-report.md), [insurtech deployment proposal (archived)](../research-archive/user-memos-2026-04-24/aws-marketplace-insurtech-deployment-proposal.md) |
| **AWS Marketplace: seller go-to-market (FTR, Vendor Insights, ACE co-sell, MDF, listing SEO)** | [sales strategy report (archived)](../research-archive/user-memos-2026-04-24/aws-marketplace-sales-strategy-report.md) |
| **AWS Marketplace: version lifecycle, Managed Entitlements, CloudFormation delivery** | [insurtech deployment proposal (archived)](../research-archive/user-memos-2026-04-24/aws-marketplace-insurtech-deployment-proposal.md), [synthetic-user-testing/aws-marketplace-monetization-guide.md](./synthetic-user-testing/aws-marketplace-monetization-guide.md) |
| **AI-agent browser automation (Claude Computer Use, Playwright MCP, Stagehand)** | [synthetic-user-testing 02](./synthetic-user-testing/02-ai-computer-use-tech.md), [synthetic-user-testing 04](./synthetic-user-testing/04-build-it-yourself-claude-sdk.md) |
| **Chaos engineering, fault injection, k6, Gremlin, Chaos Mesh** | [sideband 05](./sideband-2026-04-22/05-synthetic-data-and-chaos-engineering.md) |
| **CloudFormation seeder/reaper patterns** | [cluster 2 report 07](./deep-research-2026-04-22/results/07-cloudformation-seeder-reaper.md), [findings.md §8](./findings.md) → [ADR 0010](../decisions/0010-seeder-and-reaper-patterns.md) |
| **Cost floor, infra cost, FinOps** | [cluster 1 report 08](./deep-research-2026-04-21/results/08-cost-floor.md), [findings.md §6.3](./findings.md) → [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) |
| **Correlation IDs, `trace_id`/`case_id`, CloudEvents envelope** | [cluster 1 reports 05/11](./deep-research-2026-04-21/results/), [findings.md §5.1–5.2](./findings.md) → [ADR 0005](../decisions/0005-event-envelope-and-correlation-identifiers.md) |
| **Domain anchor: P&C insurance claims** | [cluster 1 report 02](./deep-research-2026-04-21/results/02-domain-anchor.md), [cluster 2 report 03](./deep-research-2026-04-22/results/03-claims-settlement-maker-checker.md), [findings.md §6.1](./findings.md) → [ADR 0006](../decisions/0006-v1-domain-anchor-insurance-claims.md) |
| **DMZ (AI evaluation) and Canopy (human exposure)** | [sideband 02](./sideband-2026-04-22/02-innovation-sandbox-platform-landscape.md) (sandboxes, microVMs), [synthetic-user-testing/](./synthetic-user-testing/) (AI-agent probing) → [ADR 0011](../decisions/0011-canopy-and-ai-first-dmz.md) |
| **Ephemeral environments: TTL, teardown, cost control (Env0)** | [sideband 05](./sideband-2026-04-22/05-synthetic-data-and-chaos-engineering.md), [cluster 2 report 07](./deep-research-2026-04-22/results/07-cloudformation-seeder-reaper.md) |
| **Event distributions, arrival times, Poisson/NHPP** | [cluster 2 report 04](./deep-research-2026-04-22/results/04-pc-claims-event-distributions.md), [cluster 2 report 10](./deep-research-2026-04-22/results/10-synthetic-timestamp-distributions.md) |
| **Event/workflow patterns** | [cluster 1 report 05](./deep-research-2026-04-21/results/05-event-workflow.md), [cluster 2 report 01](./deep-research-2026-04-22/results/01-step-functions-regulated-workflows.md) → [ADR 0008](../decisions/0008-workflows-are-state-machines.md) |
| **Extension model, future domain variants** | [cluster 1 report 12](./deep-research-2026-04-21/results/12-extension-model.md) |
| **IDPs, platform engineering (Backstage, Port, Cortex, Humanitec, Crossplane, Kratix)** | [sideband 03](./sideband-2026-04-22/03-idps-and-platform-engineering.md) |
| **Ideation bazaar, trend detection, scraping law** | [sideband 06](./sideband-2026-04-22/06-ideation-bazaar-and-trend-detection.md) |
| **LLM cost: pre-estimation, metering, budget enforcement** | [cluster 2 report 06](./deep-research-2026-04-22/results/06-llm-cost-estimation-accuracy.md), [findings.md §6.3–6.4](./findings.md) → [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) |
| **Maker-checker, four-eyes, approval workflows** | [cluster 1 report 11](./deep-research-2026-04-21/results/11-regulated-cues.md), [cluster 2 report 03](./deep-research-2026-04-22/results/03-claims-settlement-maker-checker.md), [findings.md §5.4](./findings.md) |
| **Minimum viable realism: entity counts, role counts** | [cluster 1 report 03](./deep-research-2026-04-21/results/03-mvr-threshold.md), [research1 (archived)](../research-archive/first-generation/research1-aws-installable-shape.md), [innovation env design report (archived)](../research-archive/user-memos-2026-04-24/aws-innovation-environment-design-report.md) |
| **Insurance-domain AI workflows: IDP (Textract/Comprehend), Rekognition damage validation, Zero-Touch claims** | [insurtech deployment proposal (archived)](../research-archive/user-memos-2026-04-24/aws-marketplace-insurtech-deployment-proposal.md), [innovation env design report (archived)](../research-archive/user-memos-2026-04-24/aws-innovation-environment-design-report.md) |
| **Novel category positioning, no-single-vendor-bundle** | [sideband 02](./sideband-2026-04-22/02-innovation-sandbox-platform-landscape.md), [sideband SYNTHESIS §3](./sideband-2026-04-22/SYNTHESIS.md), [innovation-sandbox memo (archived)](../research-archive/user-memos-2026-04-24/innovation-sandbox-ai-driven-product-development.md) |
| **MCP Gateway / MCPJungle (naming collision — unrelated to Jungl3)** | [innovation-sandbox memo (archived)](../research-archive/user-memos-2026-04-24/innovation-sandbox-ai-driven-product-development.md) |
| **Observability: CloudWatch, X-Ray, per-case inspection** | [cluster 1 report 09](./deep-research-2026-04-21/results/09-observability-ux.md), [findings.md §6.2](./findings.md) → [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md) |
| **Personas, role mix, writing style** | [cluster 1 report 10](./deep-research-2026-04-21/results/10-personas.md), [cluster 2 report 08](./deep-research-2026-04-22/results/08-persona-writing-style-generation.md), [research2 (archived)](../research-archive/first-generation/research2-v1-service-build-plan.md) |
| **Persona simulation methodology (fidelity, PII, dual-loop, SUS "OK" bias)** | [synthetic-user-testing 03](./synthetic-user-testing/03-persona-simulation-methodology.md), [synthetic-user-testing SYNTHESIS §2.3/§3.2](./synthetic-user-testing/SYNTHESIS.md) |
| **Prompt injection via untrusted UI / webpage content** | [synthetic-user-testing 02](./synthetic-user-testing/02-ai-computer-use-tech.md), [synthetic-user-testing 04](./synthetic-user-testing/04-build-it-yourself-claude-sdk.md) |
| **Synthetic user testing: agentic execution vs AI-assisted analytics** | [synthetic-user-testing 01](./synthetic-user-testing/01-existing-platforms.md), [synthetic-user-testing SYNTHESIS](./synthetic-user-testing/SYNTHESIS.md) |
| **Regulated cues beyond maker-checker** | [cluster 1 report 11](./deep-research-2026-04-21/results/11-regulated-cues.md), [cluster 2 report 09](./deep-research-2026-04-22/results/09-pc-regulated-cues-beyond-maker-checker.md) |
| **Service decomposition (10 vs 7 services)** | [research2 (archived)](../research-archive/first-generation/research2-v1-service-build-plan.md), [findings.md §6.5](./findings.md) → [ADR 0006](../decisions/0006-v1-domain-anchor-insurance-claims.md) |
| **Step Functions state machines for regulated workflows** | [cluster 2 report 01](./deep-research-2026-04-22/results/01-step-functions-regulated-workflows.md) → [ADR 0008](../decisions/0008-workflows-are-state-machines.md) |
| **Stubs and simulators** | [cluster 1 report 06](./deep-research-2026-04-21/results/06-stubs.md) |
| **Synthetic data: high-fidelity, Gretel/Tonic/MOSTLY AI/YData** | [sideband 05](./sideband-2026-04-22/05-synthetic-data-and-chaos-engineering.md), [cluster 1 report 04](./deep-research-2026-04-21/results/04-synthetic-data.md) |
| **"Feel real" — what makes a synthetic enterprise plausible** | [cluster 1 report 01](./deep-research-2026-04-21/results/01-feel-real.md), [findings.md §5.5](./findings.md) |

---

## Findings — the v1 story

[`findings.md`](./findings.md) is the narrative read of Cluster 1 plus the adopted v1 direction. It sits at this level (not inside the cluster directory) because it is heavily cited from ADRs 0005–0010 and by `CLAUDE.md`, and moving it would break those citations. **Start here if you want the v1 story**: insurance-claims-only domain, LLM-agent-over-deterministic-tools admin, CloudWatch/X-Ray observability, $100 infra + $50 LLM metered ceiling, ephemeral-capable lifecycle.

First-generation captures (`research1-*.md`, `research2-*.md`, `research3.md`) were the input `findings.md` digested; they now live in [`../research-archive/first-generation/`](../research-archive/first-generation/). They are **frozen** per [ADR 0004](../decisions/0004-canonical-platform-vocabulary.md) §62.

---

## Cluster 1: `deep-research-2026-04-21/`

**Twelve ultra4x Parallel.ai reports** commissioned by [`research3.md` (archived)](../research-archive/first-generation/research3.md). Covers what-makes-a-synthetic-enterprise-feel-real, the v1 domain anchor, minimum viable realism, synthetic data generation, event/workflow patterns, stubs and simulators, AWS Marketplace packaging, cost floor, observability UX, personas and workload realism, regulated-environment cues, and the extension model.

**Synthesis layer (read in this order):**

1. [`../findings.md`](./findings.md) — narrative read + adopted v1 direction (cited from ADRs 0005–0010).
2. [`deep-research-2026-04-21/SYNTHESIS.md`](./deep-research-2026-04-21/SYNTHESIS.md) — structured cross-report synthesis, convergences, divergences, decision surface, 6 candidate ADRs.
3. [`deep-research-2026-04-21/EXECUTIVE_SUMMARIES.md`](./deep-research-2026-04-21/EXECUTIVE_SUMMARIES.md) — one-paragraph distillation per report.
4. [`deep-research-2026-04-21/DECISIONS.md`](./deep-research-2026-04-21/DECISIONS.md) — flat backlog of ~60 open decisions.

**Decision-ready artifacts (lifted from the synthesis for use):**

- [`deep-research-2026-04-21/CANDIDATES.md`](./deep-research-2026-04-21/CANDIDATES.md) — 6 candidate ADRs (A–F). Three resolved (A → [ADR 0006](../decisions/0006-v1-domain-anchor-insurance-claims.md), C → [ADR 0005](../decisions/0005-event-envelope-and-correlation-identifiers.md), F → [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md)). Three open (B: minimum viable realism; D: admin surface scope; E: extension architecture).
- [`deep-research-2026-04-21/RISKS.md`](./deep-research-2026-04-21/RISKS.md) — 7 named risks (R-C1-1 through R-C1-7). Four resolved or meaningfully constrained by accepted ADRs; three remain as ongoing warnings or candidate-ADR requirements.

**Raw reports:** [`deep-research-2026-04-21/results/`](./deep-research-2026-04-21/results/) — `01-feel-real.md` through `12-extension-model.md`, each with matching `.json`.

**Status:** Raw reports and synthesis are **not adopted as repo policy**. ADRs 0005–0010 are the policy output of this cluster. Remaining candidates are tracked in [`CANDIDATES.md`](./deep-research-2026-04-21/CANDIDATES.md) and the cross-cluster [`BACKLOG.md`](../decisions/BACKLOG.md).

---

## Cluster 2: `deep-research-2026-04-22/`

**Ten ultra4x Parallel.ai reports**, ADR-path-targeted. Each topic sharpens an implementation detail exposed by ADRs 0005–0010 (Step Functions for regulated workflows, DynamoDB hash-chained audit, canonical maker-checker workflow, P&C event distributions, Claude Code SDK agent patterns, LLM cost-estimation accuracy, CloudFormation seeder/reaper patterns, persona writing-style generation, P&C regulated cues beyond maker-checker, synthetic timestamp distributions).

**Synthesis:** [`deep-research-2026-04-22/SYNTHESIS.md`](./deep-research-2026-04-22/SYNTHESIS.md) — validates each ADR, surfaces 7 candidate follow-on ADRs, names 7 new open questions and 5 "will hit this wall" risks.

**Decision-ready artifacts (lifted from the synthesis for use):**

- [`deep-research-2026-04-22/CANDIDATES.md`](./deep-research-2026-04-22/CANDIDATES.md) — 7 candidate ADRs (A–G). One resolved (A → [ADR 0010](../decisions/0010-seeder-and-reaper-patterns.md)); six open (B: pre-generated seed artifact; C: retention tiering; D: document integrity; E: regulatory surface; F: canonical maker-checker workflow; G: ADR 0009 amendments).
- [`deep-research-2026-04-22/RISKS.md`](./deep-research-2026-04-22/RISKS.md) — 8 named risks (R-C2-1 through R-C2-8). One resolved by ADR 0010; four with clear mitigations tied to candidates B/C/E; three remaining as warnings or architecture-doc-shaped.

**Raw reports:** [`deep-research-2026-04-22/results/`](./deep-research-2026-04-22/results/) — `01-step-functions-regulated-workflows.md` through `10-synthetic-timestamp-distributions.md`, each with matching `.json`.

**Cluster README:** [`deep-research-2026-04-22/README.md`](./deep-research-2026-04-22/README.md) — includes submit/poll instructions for re-runs.

**Status:** This cluster produced [ADR 0010](../decisions/0010-seeder-and-reaper-patterns.md). Six other candidate ADRs are still queued — see [`CANDIDATES.md`](./deep-research-2026-04-22/CANDIDATES.md) or the cross-cluster [`BACKLOG.md`](../decisions/BACKLOG.md).

---

## Cluster 3: `sideband-2026-04-22/`

**Seven reports** dropped into the repo on 2026-04-22 that do *not* follow the ADR path. They are an adjacent-market landscape sweep. The cluster's central finding: **no single vendor offers the Jungl3 bundle** — the category does not exist as a product, which validates Jungl3's novel-category positioning.

| # | Report | Topic |
|---|---|---|
| 01 | [`01-persistent-state-agents-and-openclaw.md`](./sideband-2026-04-22/01-persistent-state-agents-and-openclaw.md) | OpenClaw, Git-backed agent memory, stateful vs ephemeral agents |
| 02 | [`02-innovation-sandbox-platform-landscape.md`](./sideband-2026-04-22/02-innovation-sandbox-platform-landscape.md) | Multi-tenant innovation sandboxes; no vendor ships the bundle |
| 03 | [`03-idps-and-platform-engineering.md`](./sideband-2026-04-22/03-idps-and-platform-engineering.md) | Backstage, Port, Cortex, Humanitec, Crossplane, Kratix |
| 04 | [`04-ai-software-generation-multiagent.md`](./sideband-2026-04-22/04-ai-software-generation-multiagent.md) | Devin, OpenHands, SWE-agent, LangGraph vs CrewAI vs AutoGen |
| 05 | [`05-synthetic-data-and-chaos-engineering.md`](./sideband-2026-04-22/05-synthetic-data-and-chaos-engineering.md) | Gretel/Tonic/MOSTLY AI/YData, Env0 TTL, k6 + Gremlin + Chaos Mesh |
| 06 | [`06-ideation-bazaar-and-trend-detection.md`](./sideband-2026-04-22/06-ideation-bazaar-and-trend-detection.md) | Exploding Topics, Parallel.ai, Diffbot, hiQ v. LinkedIn, GDPR |
| 07 | [`07-unrelated-individual-communication-strategies.md`](./sideband-2026-04-22/07-unrelated-individual-communication-strategies.md) | Psychology of interpersonal communication. No Jungl3 hook — the filename is the disposition. |

**Synthesis:** [`sideband-2026-04-22/SYNTHESIS.md`](./sideband-2026-04-22/SYNTHESIS.md) — what each report says, what it changes for Jungl3 (mostly: nothing yet), what becomes useful later.

**Status:** No ADR amendments, no new candidate ADRs, no CLAUDE.md §11 changes from this material. Reference-grade, not decision-grade.

---

## Cluster 4: `synthetic-user-testing/`

**Five reports** dropped into the repo on 2026-04-22 (separate from the sideband drop). Unlike clusters 1–2 these were not commissioned via a `run.py` here, and unlike cluster 3 they are closer to the Jungl3 product surface — they describe capabilities that could live inside an install (AI-agent synthetic-user testing) and monetization mechanics the Marketplace listing will need (fees, metering, CDK→CFN, CPPO).

| # | Report | Topic |
|---|---|---|
| 01 | [`01-existing-platforms.md`](./synthetic-user-testing/01-existing-platforms.md) | WebArena, OSWorld, AgentBench; UserTesting AI vs Maze vs Hotjar; agentic execution vs AI-assisted analytics |
| 02 | [`02-ai-computer-use-tech.md`](./synthetic-user-testing/02-ai-computer-use-tech.md) | Claude Computer Use vs OpenAI Operator/CUA; CDP bridge pattern; prompt-injection defenses |
| 03 | [`03-persona-simulation-methodology.md`](./synthetic-user-testing/03-persona-simulation-methodology.md) | 6-point persona schema; PII leakage via Think-Aloud; determinism deception; SUS "OK" bias |
| 04 | [`04-build-it-yourself-claude-sdk.md`](./synthetic-user-testing/04-build-it-yourself-claude-sdk.md) | Planner/Executor split; Playwright MCP; PersonaGym; Stagehand/Steel/BrowserBase |
| — | [`aws-marketplace-monetization-guide.md`](./synthetic-user-testing/aws-marketplace-monetization-guide.md) | Fee tiers; Concurrent Agreements (2026-06-01); Private Offers; CDK→CFN synthesis; TaskCat; CPPO |

**Synthesis:** [`synthetic-user-testing/SYNTHESIS.md`](./synthetic-user-testing/SYNTHESIS.md) — splits the drop into two groups (AI-agent testing, Marketplace monetization), identifies 7 candidate ADRs (5 synthetic-user-testing, 2 Marketplace), names 3 Jungl3-specific risks (prompt injection from untrusted prototype UI, Think-Aloud PII leakage, "OK" bias).

**Decision-ready artifacts (lifted from the synthesis for use):**

- [`synthetic-user-testing/CANDIDATES.md`](./synthetic-user-testing/CANDIDATES.md) — 7 candidate ADRs (C1–C7) as individually-pickable entries. Each names the forces, the decision-to-be-made, dependencies on other candidates, related accepted ADRs, readiness rating, and a suggested drafting order.
- [`synthetic-user-testing/RISKS.md`](./synthetic-user-testing/RISKS.md) — 5 named risks (R1–R5) with triggers, mitigation shape, and expected disposition (ADR constraint vs. documented warning).

**Status:** No ADR amendments, no new ADRs drafted, no `CLAUDE.md` §11 entries resolved or added. §11 items 1, 2, 7, 8, 9 are **informed** (not answered) by this material; C6 and C7 close §11 #1 and #2 outright if drafted.

**Convention note:** The directory name is `synthetic-user-testing/` (topic-named) rather than `sideband-YYYY-MM-DD/` or `deep-research-YYYY-MM-DD/` because it arrived as a user drop, not a commissioned cluster. See [Filename conventions](#filename-conventions) below.

---

## Synthesis layer at a glance

If you only read five files in this tree:

1. [`findings.md`](./findings.md) — the v1 story.
2. [`deep-research-2026-04-21/SYNTHESIS.md`](./deep-research-2026-04-21/SYNTHESIS.md) — how that story was derived.
3. [`deep-research-2026-04-22/SYNTHESIS.md`](./deep-research-2026-04-22/SYNTHESIS.md) — what the ADRs exposed as still-to-build.
4. [`sideband-2026-04-22/SYNTHESIS.md`](./sideband-2026-04-22/SYNTHESIS.md) — the adjacent market, for positioning.
5. [`synthetic-user-testing/SYNTHESIS.md`](./synthetic-user-testing/SYNTHESIS.md) — AI-personas-as-testers capability + Marketplace monetization answer-key.

---

## Filename conventions

- **First-generation captures:** `researchN.md` or `researchN-short-slug.md`, monotonically increasing. No renumbering. If a file is obsolete, keep it and mark status in its preamble; don't delete. Slugs are kebab-case. These three files (`research1-*.md`, `research2-*.md`, `research3.md`) are **frozen** per ADR 0004.
- **Cluster directories:** `deep-research-YYYY-MM-DD/` for Parallel.ai ADR-path clusters, `sideband-YYYY-MM-DD/` for off-path landscape sweeps, `topic-slug/` (e.g., `synthetic-user-testing/`) for user-dropped reports organized by subject. Each has its own synthesis layer at the cluster root.
- **Inside a cluster:** numbered files `NN-short-slug.md` in `results/` (for Parallel.ai clusters) or at cluster root (for sideband / topic clusters). Numbers are 1-indexed and stable — `07-unrelated-…` communicates through its slug. Topic clusters may also hold un-numbered files when there's only one report in a thread (e.g., `aws-marketplace-monetization-guide.md`).
- **Synthesis files:** uppercase at the cluster root — `SYNTHESIS.md`, `EXECUTIVE_SUMMARIES.md`, `DECISIONS.md`. This distinguishes them visually from raw reports.

## Related

- [`../decisions/`](../decisions/) — where research conclusions become decisions
- [`../decisions/BACKLOG.md`](../decisions/BACKLOG.md) — single cross-cluster view of every candidate ADR, drafting order, candidate-to-risk map
- [`../decisions/STATUS.md`](../decisions/STATUS.md) — one-page accepted + next-up + open view (investor/reviewer-friendly)
- [`../../CLAUDE.md`](../../CLAUDE.md) §7 — information placement rules
- [`../../CLAUDE.md`](../../CLAUDE.md) §11 — open decisions (many informed by files here)
