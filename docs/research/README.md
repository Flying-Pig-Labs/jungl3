# docs/research/

Captured third-party analysis, market research, and external memos that inform Jungle3 design. **Not repo policy.**

## What lives here

Documents that:

- were written by someone (or something) outside the Jungle3 maintainers,
- make specific claims, recommendations, or arguments,
- and that we want to preserve so we can trace where decisions came from.

This is the paper trail behind ADRs, not a substitute for them.

## How to read anything in here

1. Check the frontmatter at the top of each file. It names what the document is, what it argued, and which ADR (if any) has already consumed its load-bearing conclusions.
2. Specific recommendations — pricing numbers, service choices, stack shapes, timelines — are **not** adopted unless the corresponding ADR says so. If a recommendation here isn't in an ADR, it is a proposal, not a decision.
3. If a document here argues for something that contradicts current repo content, that's information. Raise it — either as an open question in `../../CLAUDE.md` §11 or as a candidate ADR. Don't "reconcile" silently.

## Filename convention

`researchN.md` or `researchN-short-slug.md` for numbered captures, monotonically increasing. No renumbering. If a file is obsolete, keep it and mark status in the frontmatter; don't delete. The slug (if present) is kebab-case and names the subject of the capture, not just its position.

## Files

| # | Captured | Subject | Status |
| --- | --- | --- | --- |
| [research1-aws-installable-shape.md](./research1-aws-installable-shape.md) | 2026-04-21 | Analyst memo: installable-vs-hosted; proposed v1 AWS service set | Installable-vs-hosted accepted by [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md); other recommendations open in §11. |
| [research2-v1-service-build-plan.md](./research2-v1-service-build-plan.md) | 2026-04-21 | Service-by-service v1 build plan (10 services, Work Item anchor); derived from research1 | Partially routed: observations landed in `CLAUDE.md` §11 (items 7, 11, 16–19) and as pointers from `architecture/system-context.md`, `architecture/dmz.md`, and the `Domain Starter` glossary entry. Service-set decomposition, Control Plane runtime, realism threshold, Admin-vs-Agent-Layer overlap, and Domain Starter anchor remain open; each is a candidate for a future ADR. |
| [research3.md](./research3.md) | 2026-04-21 | Research questions commissioned for a 12-topic deep-research sweep (followed up by the `deep-research-2026-04-21/` cluster) | Question set only; answers live in the cluster below. |

## Deep research clusters

Larger multi-report sweeps. Each cluster has raw reports plus a synthesis layer.

### [`deep-research-2026-04-21/`](./deep-research-2026-04-21/)

Twelve ultra4x Parallel AI reports commissioned by [`research3.md`](./research3.md), covering: what makes a synthetic enterprise feel real, v1 domain anchor, minimum viable realism threshold, synthetic data generation, event/workflow patterns, stubs and simulators, AWS Marketplace packaging, cost floor, observability UX, personas and workload realism, regulated-environment cues, and the extension model for future domain variants. Raw reports are in [`deep-research-2026-04-21/results/`](./deep-research-2026-04-21/results/).

Synthesis layer:

- [`SYNTHESIS.md`](./SYNTHESIS.md) — cross-report convergences, divergences, decision surface, and 6 candidate ADRs.
- [`EXECUTIVE_SUMMARIES.md`](./EXECUTIVE_SUMMARIES.md) — one-paragraph distillation per report.
- [`DECISIONS.md`](./DECISIONS.md) — flat backlog of ~60 decisions the cluster surfaces, all `status: open`.

**Status:** Raw reports and synthesis are **not adopted as repo policy**. The candidate ADRs in `SYNTHESIS.md` §4 are candidates — nothing has been accepted. Several decisions overlap with existing [`CLAUDE.md`](../../CLAUDE.md) §11 entries (notably #16–#19); cross-references are in `DECISIONS.md`.

## Related

- [`../decisions/`](../decisions/) — where research conclusions become decisions
- [`../../CLAUDE.md`](../../CLAUDE.md) §7 — information placement rules
- [`../../CLAUDE.md`](../../CLAUDE.md) §11 — open decisions (many informed by files here)
