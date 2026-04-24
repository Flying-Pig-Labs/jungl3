# docs/research-archive/

**Frozen.** Raw research inputs absorbed into ADRs 0001–0012 and `CLAUDE.md §11`. Moved here on 2026-04-24 to reduce the working surface in [`../research/`](../research/). See the [research-sufficiency note](../reviews/2026-04-24-research-sufficiency.md) for the reasoning.

**Nothing in this tree should be edited.** If a claim here contradicts current repo state, that's a note for a future ADR, not a reason to rewrite the archive. The synthesis layer in [`../research/`](../research/) is the working interpretation of this material; come back here only when you need the original evidence.

---

## What lives here

| Subdir | Contents | Why archived |
| --- | --- | --- |
| [`first-generation/`](./first-generation/) | `research1-aws-installable-shape.md`, `research2-v1-service-build-plan.md`, `research3.md` | Pre-cluster analyst memos. `research1`/`research2` cited from [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md), [ADR 0004](../decisions/0004-canonical-platform-vocabulary.md), `docs/architecture/`. `research3` is the question set that produced Cluster 1. All three frozen per ADR 0004 §62. |
| [`deep-research-2026-04-21/`](./deep-research-2026-04-21/) | `prompts/`, `runs/`, `logs/`, `results/` — Parallel.ai submission + response artifacts for Cluster 1. | Raw reports; synthesis lives in [`../research/deep-research-2026-04-21/`](../research/deep-research-2026-04-21/). The synthesis there references `./results/...` — those paths resolve through symlinks back here. |
| [`deep-research-2026-04-22/`](./deep-research-2026-04-22/) | `prompts/`, `runs/`, `logs/`, `results/`, `run.py` for Cluster 2. | Same as Cluster 1 — synthesis lives active; raw material here. `run.py` is the one-time Parallel.ai submit/poll script. |
| [`sideband-2026-04-22/`](./sideband-2026-04-22/) | Seven raw reports `01..07-*.md` | Raw reports; synthesis lives in [`../research/sideband-2026-04-22/SYNTHESIS.md`](../research/sideband-2026-04-22/SYNTHESIS.md). The synthesis references `./01-*.md` — those resolve through symlinks back here. |
| [`user-memos-2026-04-24/`](./user-memos-2026-04-24/) | Four standalone third-party memos dropped 2026-04-24. | Absorbed into `CLAUDE.md §11` items #35 (FTR posture), #36 (Vendor Insights), #37 (co-sell/ACE/MDF), and cross-linked from [`findings.md`](../research/findings.md). Specific claims (seed counts, "ClaimsGuard AI" product naming) are **not** adopted as repo policy. |

### Still active — not archived

For orientation: the following cluster was **kept in** `../research/` because it's still load-bearing for undecided `CLAUDE.md §11` items:

- [`../research/synthetic-user-testing/`](../research/synthetic-user-testing/) — 5 reports + synthesis + 7 candidate ADRs (C1–C7). Load-bearing for §11 #26 (DMZ agent runtime choice) and #28 (synthetic-user-tester placement).

Likewise, every cluster's synthesis layer (`SYNTHESIS.md`, `CANDIDATES.md`, `RISKS.md`, `DECISIONS.md`, `EXECUTIVE_SUMMARIES.md`, `findings.md`) stays in `../research/`. Only raw inputs moved here.

---

## How the split works

The synthesis documents (live in `../research/<cluster>/`) keep their original link targets (`./results/...`, `./prompts/...`, `./01-*.md`). Those targets still resolve because the active cluster directories carry **symlinks** to this archive:

```
docs/research/deep-research-2026-04-21/results  →  docs/research-archive/deep-research-2026-04-21/results
docs/research/deep-research-2026-04-22/results  →  docs/research-archive/deep-research-2026-04-22/results
docs/research/sideband-2026-04-22/01-*.md       →  docs/research-archive/sideband-2026-04-22/01-*.md
(…and so on for prompts/, runs/, logs/, and the other sideband numbered files)
```

This means: **no synthesis-doc links were rewritten during the archive move.** If you're reading a SYNTHESIS.md and follow a `./results/XX-report.md` link, you land in the archive transparently. Only links that originally named the root-level first-generation files or 2026-04-24 memos were rewritten to point into `../research-archive/`.

---

## If an archived document becomes re-relevant

Don't resurrect the file here. Do one of:

1. **Quote into a new ADR or architecture doc** at `../decisions/` or `../architecture/`, citing the archived path.
2. **Open a new `CLAUDE.md §11` item** that references the archived claim and says "resolves when …"
3. **Run new research** with the archived material as input — don't rewrite the archive, write new.

The archive is a paper trail, not a workspace.

---

## Related

- [`../research/`](../research/) — the active working surface (synthesis layer).
- [`../research/README.md`](../research/README.md) — topic index into both active synthesis and archived raw.
- [`../reviews/2026-04-24-research-sufficiency.md`](../reviews/2026-04-24-research-sufficiency.md) — why this split exists.
- [`../decisions/`](../decisions/) — where archived research became policy.
- [`../../CLAUDE.md`](../../CLAUDE.md) §11 — open questions some of this archive informed.
