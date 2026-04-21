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
| [research2-v1-service-build-plan.md](./research2-v1-service-build-plan.md) | 2026-04-21 | Service-by-service v1 build plan (10 services, Work Item anchor); derived from research1 | Not yet routed. Substantially overlaps §11 items 2, 7, 11; candidate for future ADRs. |

## Related

- [`../decisions/`](../decisions/) — where research conclusions become decisions
- [`../../CLAUDE.md`](../../CLAUDE.md) §7 — information placement rules
- [`../../CLAUDE.md`](../../CLAUDE.md) §11 — open decisions (many informed by files here)
