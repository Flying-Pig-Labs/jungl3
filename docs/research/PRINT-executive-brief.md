# Jungle3 — Deep Research Cluster 2026-04-21

## Executive brief (1 page)

**What this is.** A one-sheet synopsis of a 12-report Parallel AI deep-research sweep commissioned by `research3.md`. Full synthesis lives in [`SYNTHESIS.md`](./SYNTHESIS.md); per-report distillations in [`EXECUTIVE_SUMMARIES.md`](./EXECUTIVE_SUMMARIES.md); ~60-item decision backlog in [`DECISIONS.md`](./DECISIONS.md). **Nothing below is repo policy** — candidate ADRs must go through the normal path to become decisions.

---

### The 8 convergences (≥3 reports independently agree)

1. **Plausibility collapse** is the dominant failure mode. 10 of 12 reports name it.
2. **Dual correlation IDs** — technical `trace_id` (W3C) + business `case_id`, propagated everywhere. Strongest technical convergence in the set.
3. **CloudEvents v1.0** as the event envelope, reverse-DNS type naming.
4. **Maker-checker** (four-eyes) is the single highest-signal regulated cue; backend-enforced, not UI-only.
5. **MVR numbers** tight band: 4–7 services, 8–10 personas, 3–5 async event types, 2–4 visible stubs.
6. **Declarative-first** for data, stubs, personas, packs — imperative only when declarative fails.
7. **Customer-in-account** shapes every decision (validates [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md)).
8. **Hybrid simulation** — Step Functions for golden paths + EventBridge/Lambda for stochastic background activity.

### The 5 divergences (real tensions to resolve)

1. **Domain anchor.** Report 02 → chargebacks. Reports 10, 11 → insurance claims (throughout). Cannot both be v1.
2. **Admin UI scope vs. idle cost.** 09 says build it; 08 says every idle service has a cost floor; Agent Layer overlap unresolved.
3. **Observability backend.** Stacking CloudWatch + OpenSearch + optional OTLP from three reports would produce a composition no single report recommends or costs.
4. **LLM scope in v1.** Bounded (templated text behind gateway) is consistent; how *prominent* differs.
5. **Microservice upper bound.** 03 says 7; 01 says 12; research2 assumes 10.

### The 6 candidate ADRs

| # | Name | Blocked on? | Difficulty |
|---|------|-------------|------------|
| **A** | v1 domain anchor | First-customer context (§11 #21) | High (divergent evidence) |
| **B** | MVR threshold | A (partially) | Low (ratify numbers) |
| **C** | CloudEvents + dual correlation IDs | — | Low (5 reports converge) |
| **D** | v1 custom admin surface scope | F (needs cost budget); Agent Layer overlap | High |
| **E** | Minimal core + versioned packs | — | Medium (mostly mechanical from report 12) |
| **F** | v1 cost profile + default controls | — | Low (ratify $110–150/mo target) |

### Biggest risk

**Plausibility collapse** — the moment a user detects the data, workflows, or system behavior are obviously fake, and the illusion of a real enterprise system shatters. Every convergence in this cluster is structured around avoiding it.

### Suggested next single step

Open **Candidate ADR-C** (CloudEvents + dual correlation IDs). Lowest-controversy, highest-leverage, not blocked on the domain-anchor question. Writing it exercises the synthesis-to-ADR path on an easy case before the hard ones.

---

*Committed at `b61ec48`. Raw reports at `011d839`. Pausing for human review before opening any ADR.*
