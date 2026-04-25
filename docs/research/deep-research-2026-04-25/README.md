# Deep-research cluster 2026-04-25

Targeted research pass on **OpenClaw** and **Moltbook**, the two third-party platforms named in [`docs/reviews/2026-04-25-product-hypothesis-revision.md`](../../reviews/2026-04-25-product-hypothesis-revision.md). Companion to the prior `deep-research-2026-04-21/` and `deep-research-2026-04-22/` clusters, but smaller in scope and tightly bounded.

## Why this cluster exists

The 2026-04-25 product hypothesis revision named OpenClaw and Moltbook as load-bearing dependencies — implicitly proposing OpenClaw as the runtime substrate for the Agent Layer and Moltbook as the public gossip channel for DMZ critic agents. Neither was citable in the repo. This cluster converts both descriptions from `[Unverified]` to grounded findings, so Q-I (OpenClaw lock-in), Q-J/K/L (Moltbook trust boundary), and Q-E (agent runtime selection) from the [hypothesis revision §4](../../reviews/2026-04-25-product-hypothesis-revision.md#4-new-questions-opened) can be answered from sources rather than guessed.

The cluster does **not** produce ADRs. The synthesis resolves research-grade questions; ADRs follow a deliberate process per the [`adr-author` skill](../../../.cursor/skills/adr-author/SKILL.md).

## Structure

```
ecosystem-synthesis.md    The reconciled narrative across all four sources.
                          Read this first.

sources/                  Primary survey provided by the user (~50 citations).
  moltbook-openclaw-ecosystem-survey.md

results/                  Parallel.ai deep-research outputs.
  openclaw-survey.{md,json}        pro-fast first-pass survey
  moltbook-survey.{md,json}        pro-fast first-pass survey
  openclaw-deep-dive.{md,json}     ultra4x-fast integration analysis
  moltbook-deep-dive.{md,json}     ultra4x-fast integration analysis
```

No `prompts/`, `runs/`, `logs/`, or `run.py` (unlike the larger 2026-04-21 and 2026-04-22 clusters). This was a four-prompt, two-tool ad-hoc cluster, not a scripted batch.

## Reading order

1. [`ecosystem-synthesis.md`](./ecosystem-synthesis.md) — the reconciled findings and the resolutions it offers for the hypothesis revision.
2. [`sources/moltbook-openclaw-ecosystem-survey.md`](./sources/moltbook-openclaw-ecosystem-survey.md) — densest single source. Best for the integration-side primer (`SOUL.md`, `AGENTS.md`, `HEARTBEAT.md`, submolt mechanics, claim flow).
3. [`results/openclaw-deep-dive.md`](./results/openclaw-deep-dive.md) — integration-grade analysis. Cite for AWS topology, persistence, scheduler, fork cost.
4. [`results/moltbook-deep-dive.md`](./results/moltbook-deep-dive.md) — legal and security analysis. Cite for ToS verbatim and breach details.
5. [`results/openclaw-survey.md`](./results/openclaw-survey.md), [`results/moltbook-survey.md`](./results/moltbook-survey.md) — first-pass surveys; lower information density, useful corroboration.

## What the synthesis resolves

- **Q-I** (OpenClaw lock-in) → Resolved: don't lock in. Adopt file conventions; reject runtime.
- **Q-J / Q-K / Q-L** (Moltbook trust boundary, cross-install gossip, public egress) → Resolved: skip Moltbook. Build **Crit** as a self-hosted, per-install, private-by-default agent gossip surface inside each Canopy.
- **Q-E** (agent runtime selection) → Sharpened, not closed. Live comparison is now Bedrock Agents vs. Claude Agent SDK + custom durable execution vs. another framework. Needs a separate first-hand evaluation.

See the [hypothesis revision §4](../../reviews/2026-04-25-product-hypothesis-revision.md#4-new-questions-opened) for the full status update.

## Cost and processor choice

- Two `pro-fast` runs (~30s–5min each) — first-pass surveys to establish the shape.
- Two `ultra4x-fast` runs (~5min–40min each, hit the 9-min poll timeout once and required a second poll) — integration-grade deep dives.
- All runs went through the [parallel-deep-research skill](https://docs.parallel.ai). The user-saved primary survey (`sources/`) was independently produced.

`ultra4x-fast` was used for the deep dives rather than `ultra4x` (standard) because freshness was not the priority — both topics are platform-internals questions that don't change hourly — and faster turnaround mattered for being able to iterate within the same working session.
