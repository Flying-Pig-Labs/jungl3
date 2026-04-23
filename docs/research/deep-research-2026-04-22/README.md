# Deep-research cluster 2026-04-22

Second Parallel.ai deep-research cluster for Jungl3. Companion to `deep-research-2026-04-21/`.

## Why this cluster exists

The 2026-04-21 cluster (twelve reports on first-principles platform shape) produced [findings.md](../findings.md) and five ADRs — 0005 (event envelope), 0006 (domain anchor), 0007 (cost profile + LLM metering), 0008 (workflows as state machines), 0009 (append-only hash-chained audit).

Those ADRs turn "decided" into "still to be built." The open questions are no longer about first principles — they're about specific data models, numeric distributions, library choices, calibration plans, and edge cases that each ADR exposed. This cluster asks those.

## Structure

```
prompts/        Ten scoped research topics (00 is shared context).
runs/           Per-topic submission records (run_id, processor, status).
logs/           Per-topic poll logs for monitoring long-running runs.
results/        Per-topic results as they come back.
run.py          Submit one or all prompts to the Parallel Task API.
```

## The ten topics

1. **Step Functions for regulated workflows with maker-checker** — makes ADR 0008 + ADR 0009 buildable.
2. **DynamoDB append-only hash-chained audit design** — makes ADR 0009 concretely implementable.
3. **Canonical maker-checker workflow in real P&C claims operations** — sharpens the deferred decision in ADR 0006.
4. **Realistic event and workflow-stage distributions in P&C claims** — grounds the seeded-state numbers in `findings.md` §8 in empirical data.
5. **Claude Code SDK agent patterns for deterministic tool-constrained agents** — makes the admin-agent design in ADR 0007 buildable.
6. **LLM cost pre-estimation accuracy for Claude with tool use** — closes the §9.3 open question from `findings.md`, makes the LLM-gateway budget mechanism reliable.
7. **CloudFormation seeder and reaper Lambda patterns** — pressure-tests the ephemeral-lifecycle targets in `findings.md` §8.
8. **Persona writing-style generation with LLMs, deterministic from seed** — makes the 8-persona install in `findings.md` §6.4 concretely executable.
9. **P&C insurance regulated cues beyond maker-checker** — hardens domain plausibility beyond the single regulated-cue example.
10. **Synthetic timestamp distributions that survive forensic inspection** — honest accounting of the fresh-seed plausibility cost in `findings.md` §8.

## Launch

Set `PARALLEL_AI_KEY` (or `PARALLEL_API_KEY`) in the environment, then from the cluster directory:

```bash
python3 run.py submit-all --processor ultra4x
```

This submits all ten prompts async and writes `runs/NN-slug.start.json` records with their `run_id`s. The script exits immediately; runs are in flight.

To poll a single run:

```bash
python3 run.py poll <run_id>
```

To fetch all completed results into `results/`:

```bash
python3 run.py collect-all
```

See `../deep-research-2026-04-21/` for the prior cluster's shape.

## Processor choice

`ultra4x` (matching the prior cluster). Each topic is a multi-faceted deep-research question that benefits from the highest-depth processor. Expected runtime: 5–90 min per topic, async; all ten in flight simultaneously.
