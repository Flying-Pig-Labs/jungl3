# Architecture Decisions

This directory holds **decisions we have made and will not casually revisit.** They are durable, numbered, and dated.

Format follows the Nygard-style ADR convention, trimmed down.

## Filename convention

```
NNNN-short-slug.md
```

- `NNNN` is zero-padded, monotonically increasing. Never reuse numbers.
- `short-slug` is kebab-case, ≤ 6 words, describing the decision not the topic.

## Structure of an ADR

Every file has these sections, in order:

```markdown
# NNNN — Title

**Status:** Accepted | Superseded by NNNN | Deprecated
**Date:** YYYY-MM-DD

## Context
What situation forced a decision? What constraints mattered?

## Decision
What did we choose? Stated plainly.

## Consequences
What this enables, what it forecloses, what pain we accept.

## Alternatives considered
What we rejected and why. Brief.
```

Keep each section short. An ADR is not an essay. If it runs past a page, it's probably two decisions.

## When to write one

Write an ADR when a choice:
- shapes the system in a way that would be costly to reverse,
- closes off a set of future options, or
- resolves an open question from `../../CLAUDE.md` §9.

Do **not** write an ADR for:
- implementation details that will change weekly,
- style preferences,
- things that haven't actually been decided (those belong in `CLAUDE.md` §9 as open decisions).

## Superseding

Decisions evolve. When a new decision overrides an older one:

1. Write the new ADR.
2. Edit the old ADR's status line to `Superseded by NNNN`.
3. Do **not** delete or edit the old ADR's body. History matters.

## Index

| # | Status | Title |
| --- | --- | --- |
| [0001](./0001-lovable-owns-repo-root.md) | Accepted | Lovable owns repo root; platform domains live in subdirs |
| [0002](./0002-sub-agent-response-contract.md) | Accepted | Sub-agent response contract |
| [0003](./0003-installable-via-aws-marketplace.md) | Accepted (rider partly superseded by 0004 and 0011) | Jungle3 is distributed as an installable AWS Marketplace listing |
| [0004](./0004-canonical-platform-vocabulary.md) | Accepted (DMZ-absorbs-Gallery rider superseded by 0011) | Canonical platform vocabulary: Understory, Substrate, DMZ-absorbs-Gallery |
| [0005](./0005-event-envelope-and-correlation-identifiers.md) | Accepted | Event envelope and correlation identifiers |
| [0006](./0006-v1-domain-anchor-insurance-claims.md) | Accepted | v1 domain anchor: insurance claims processing |
| [0007](./0007-v1-cost-profile-and-llm-metering.md) | Accepted | v1 cost profile and LLM metering |
| [0008](./0008-workflows-are-state-machines.md) | Accepted | Workflows are state machines, not event chains |
| [0009](./0009-audit-trail-is-append-only-hash-chained.md) | Accepted | Audit trail is a separate append-only hash-chained store |
| [0010](./0010-seeder-and-reaper-patterns.md) | Accepted | Seeder and Reaper patterns for install and teardown |
| [0011](./0011-canopy-and-ai-first-dmz.md) | Accepted | Canopy is the human exposure surface; DMZ is the AI evaluation surface |

## Candidate ADRs and status

- **[`BACKLOG.md`](./BACKLOG.md)** — single cross-cluster view of every candidate ADR (accepted, pending, resolved), drafting order, and the candidate-to-risk map.
- **[`STATUS.md`](./STATUS.md)** — one-page investor/reviewer view: what's accepted, what's next, what's open.

Per-cluster candidate and risk detail:

- Cluster 1 (2026-04-21): [`CANDIDATES.md`](../research/deep-research-2026-04-21/CANDIDATES.md), [`RISKS.md`](../research/deep-research-2026-04-21/RISKS.md)
- Cluster 2 (2026-04-22): [`CANDIDATES.md`](../research/deep-research-2026-04-22/CANDIDATES.md), [`RISKS.md`](../research/deep-research-2026-04-22/RISKS.md)
- Cluster 4 (synthetic-user-testing): [`CANDIDATES.md`](../research/synthetic-user-testing/CANDIDATES.md), [`RISKS.md`](../research/synthetic-user-testing/RISKS.md)
