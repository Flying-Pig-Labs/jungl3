# Jungle3 — Deep Research Cluster 2026-04-21

## Decision packet (working copy)

**Purpose.** A print-friendly working copy for human review of the 12-report deep-research cluster. Designed to be marked up with a pen: divergences to lean on, candidate ADRs to accept/adjust/reject, deferrals to affirm.

**How to use.** Read §1 for framing (2 min). Work through §2 divergences (the real decisions), writing your lean in the space provided. Work through §3 candidate ADRs, noting any that should be opened, reshaped, or dropped. Glance §4 deferrals and strike through anything that should *not* stay deferred. §5 is the decision backlog index — scan for anything missing.

**Sources.** Full synthesis: [`SYNTHESIS.md`](./SYNTHESIS.md). Per-report summaries: [`EXECUTIVE_SUMMARIES.md`](./EXECUTIVE_SUMMARIES.md). Flat backlog: [`DECISIONS.md`](./DECISIONS.md). Raw reports: [`deep-research-2026-04-21/results/`](./deep-research-2026-04-21/results/).

---

## 1. Framing

Twelve ultra4x Parallel AI reports were commissioned by [`research3.md`](./research3.md) and captured on 2026-04-21. Together they span ~7,200 lines and cover: what makes a synthetic enterprise feel real (01), v1 domain anchor (02), MVR threshold (03), synthetic data (04), event/workflow patterns (05), stubs (06), packaging (07), cost floor (08), observability UX (09), personas (10), regulated-environment cues (11), and extension model (12).

Nothing in this cluster is repo policy. The purpose of the synthesis is to compress the external-analysis sweep into a form the maintainers can ratify — or reject — via ADRs.

**The 8 convergences** (multiple reports independently agree):

1. **Plausibility collapse** is the dominant failure mode.
2. **Dual correlation IDs** — `trace_id` (W3C) + `case_id` (business).
3. **CloudEvents v1.0** as event envelope.
4. **Maker-checker** as the highest-signal regulated cue (backend-enforced).
5. **MVR numbers** — 4–7 services / 8–10 personas / 3–5 async / 2–4 stubs.
6. **Declarative-first** for data, stubs, personas, packs.
7. **Customer-in-account** is a constraint, not a preference (validates ADR 0003).
8. **Hybrid simulation** — deterministic golden paths + stochastic background.

<div style="page-break-after: always"></div>

---

## 2. Divergences (the real decisions)

Five tensions the cluster surfaced. Each has space for your lean and notes.

---

### D1. v1 domain anchor — chargebacks vs. insurance

**The tension.** Report 02 explicitly recommends **e-commerce chargeback / dispute handling**. Reports 10 and 11 wrote their entire persona taxonomy, pre-seeded workload spec, and regulated-cues analysis assuming **insurance claims proper**. These select different roles, different stubs, different documents, different regulatory tone.

**Downstream effect.** Blocks persona roster, scenario packs, stub catalog, MVR role count, and what "the v1 pack" contains.

**Interacts with.** CLAUDE.md §11 #19 (Domain Starter anchor), #21 (first-customer context).

**Your lean:** ☐ insurance   ☐ chargebacks   ☐ other (__________)   ☐ need more info

**Notes:**

<br><br><br><br><br><br>

---

### D2. Custom admin UI — scope vs. idle cost

**The tension.** Report 09 argues **build the admin surface** — per-entity timeline + queue health + failure/replay — as v1 scope. Report 08 warns **every idle service has a cost floor**. Overlaps with the Agent Layer inspection specialists (CLAUDE.md §11 #18).

**Downstream effect.** Determines idle cost profile, what the builder actually sees on day one, whether Agent Layer and admin UI are the same surface or distinct.

**Interacts with.** §11 #18, #11.

**Your lean:** build all 3 views  ☐ / build subset ☐ / defer to v2 ☐

**Notes:**

<br><br><br><br><br><br>

---

### D3. Observability backend — stacking problem

**The tension.** Report 09 → OTel Collector → CloudWatch/X-Ray, opt-in OTLP. Report 11 → OpenSearch for audit search. Report 08 → OpenSearch alone adds ~$70/mo idle floor; defer until customer opts in. Naïvely stacking all three is expensive and un-costed.

**Your lean:** CloudWatch-only ☐ / CloudWatch + CW Logs Insights ☐ / + OpenSearch opt-in ☐ / + OTLP export opt-in ☐

**Notes:**

<br><br><br><br><br><br>

---

### D4. LLM usage scope in v1

**The tension.** Reports 04, 10 use LLMs for templated text (notes, emails, persona writing style). Report 11 warns against anything that could imply automated compliance attestation. Boundary is consistent; prominence differs.

**Your lean:** LLMs v1 default-on ☐ / default-off / opt-in ☐ / deferred entirely ☐

**Notes:**

<br><br><br><br><br><br>

---

### D5. Microservice upper bound

**The tension.** Report 03 → 4–7. Report 01 → 8–12. research2 → 10. Same question, different altitudes.

**Your lean:** ceiling at ☐ 7   ☐ 10   ☐ 12

**Notes:**

<br><br>

<div style="page-break-after: always"></div>

---

## 3. Candidate ADRs

Six decisions the cluster chewed on enough to support an ADR conversation. Ordered by suggested sequence.

---

### ADR-C — Event envelope + dual correlation IDs *(suggested first)*

**Why first.** Strongest cross-report convergence (reports 05, 09, 10, 11, 12). Not blocked on domain anchor. Foundational for every observability / audit / async decision.

**What it would decide.**
- CloudEvents v1.0 as the envelope, always.
- Reverse-DNS type naming: `com.jungle3.<domain>.<noun>.<verb_past_tense>`.
- Canonical verb set: `created`, `updated`, `deleted`, `assigned`, `approved`, `rejected`, `escalated`, `completed`, `failed`.
- `trace_id` via W3C Trace Context (`traceparent`).
- `case_id` mandatory on every business-workflow event/log/audit entry.
- Propagation across SQS, Step Functions, EventBridge, scheduled jobs.

**Open questions.**

**Decision:** ☐ open ADR   ☐ adjust scope: _________________   ☐ reject   ☐ defer

**Notes:**

<br><br><br>

---

### ADR-E — Minimal core + versioned packs

**Why.** Report 12 is explicit: deferring this boundary produces a monolithic v1 where domain logic fuses to core. Cost of commit-now = coding discipline. Cost of defer = rewrite.

**What it would decide.**
- What lives in core (deploy/lifecycle, entitlement, observability plumbing, event envelope, declarative runtimes).
- What lives in packs (entity schemas, workflows, personas, UI, seed data, stubs).
- Pack manifest format, SemVer 2.0.0, compatibility range declaration.
- Runtime isolation model (resource prefixing + scoped IAM).
- v1 signing floor (SHA-256 + manifest signing minimum; Sigstore/Cosign as upgrade path).

**Open questions.** Does this ADR need to happen before or after ADR-A? (Arg for before: adopting E clarifies that A is picking the v1 pack, not the v1 architecture.)

**Decision:** ☐ open ADR   ☐ adjust scope: _________________   ☐ reject   ☐ defer

**Notes:**

<br><br><br>

---

### ADR-B — Minimum Viable Realism threshold

**Why.** Reports 01, 03, 10 converge on a narrow band (see §1 bullet 5). Ratifying gives every future scope argument a shipping gate to measure against.

**What it would decide.**
- 4–7 microservices with real inter-service calls.
- 8 personas (upper end — seeded history matters more than raw count).
- 3–5 async event types producing visible queue activity.
- 2–4 intentionally visible stubs.
- Inspectable audit trail, feature flags, at least one seeded dashboard.
- Seeded data older than the install.

**Interacts with.** §11 #17, #16.

**Decision:** ☐ open ADR   ☐ adjust numbers: _________________   ☐ reject   ☐ defer

**Notes:**

<br><br><br>

---

### ADR-F — v1 cost profile and default cost controls

**Why.** Report 08 names idle cost as an existential risk — $400–800/mo idle install is fatal; $110–150/mo is achievable with discipline. Every other ADR has cost implications that should measure against an agreed target.

**What it would decide.**
- Default-Realism profile: **$110–150/mo steady state**.
- Demo profile: $40–60/mo, ephemeral.
- Stress profile: opt-in, no upper bound.
- Default in every install: AWS Budget + SNS alert, log-class tiering (Standard vs. IA), single-AZ NAT in dev.

**Decision:** ☐ open ADR   ☐ adjust targets: _________________   ☐ reject   ☐ defer

**Notes:**

<br><br><br>

---

### ADR-A — v1 domain anchor *(hardest — D1 above)*

**Why.** Forks every downstream persona/scenario/stub decision. Report 02 says chargebacks; reports 10, 11 assume insurance.

**What it would decide.** Pick one of the six candidate anchors from research2 §8. Reconcile reports 10/11's persona+cues work (port it or redo it for the chosen domain).

**Interacts with.** §11 #19, #21, #16, #17.

**Decision:** ☐ open ADR   ☐ gather more info first   ☐ wait on §11 #21   ☐ defer

**Notes:**

<br><br><br><br>

---

### ADR-D — v1 custom admin surface scope *(hardest — D2 above)*

**Why.** Has to reconcile "build it, it's the product" (09) with "every idle service has a cost floor" (08) *and* resolve Agent Layer overlap (§11 #18).

**What it would decide.**
- Which views ship in v1 (proposed: timeline + queue health + failure/replay).
- Same surface as Agent Layer, complementary, or distinct?
- Idle cost budget (needs ADR-F first).
- Build-vs-link policy.

**Decision:** ☐ open ADR   ☐ wait for ADR-F   ☐ needs §11 #18 resolution first   ☐ defer

**Notes:**

<br><br><br>

<div style="page-break-after: always"></div>

---

## 4. Deferrals — affirm or strike

Items multiple reports explicitly recommended *against* building in v1. Check if they should stay deferred; strike through if you disagree.

- ☐ **F1.** Cryptographic WORM storage, PKI integration, cross-service RBAC engine, N-of-M approvals (11)
- ☐ **F2.** Automated compliance attestation reports (11 — legally perilous)
- ☐ **F3.** AI-driven RCA, automated remediation playbooks (09)
- ☐ **F4.** Hosted multi-tenant control plane / SaaS admin dashboard (12 — contradicts in-account model)
- ☐ **F5.** Runtime plugin loader for customer-authored code (12)
- ☐ **F6.** Cross-domain analytics dashboard (12 — premature normalization)
- ☐ **F7.** Fully autonomous LLM agents making business decisions (04, 10)
- ☐ **F8.** Follow-the-sun multi-region persona coverage (10)
- ☐ **F9.** Full legal-hold / e-discovery workflow (11)
- ☐ **F10.** Formal SOC 2 / HIPAA certification (10 — architecture readiness is v1; certification is post-v1)

**Anything I'm missing that should be explicitly deferred?**

<br><br>

---

## 5. Backlog scan — anything missing?

The 60-item decision backlog in [`DECISIONS.md`](./DECISIONS.md) is grouped as:

- Architecture (10) — A1–A10
- Data (10) — D1–D10
- Observability (8) — O1–O8
- Packaging & distribution (9) — P1–P9
- Cost (5) — C1–C5
- Compliance feel (8) — R1–R8
- Personas & content (8) — X1–X8
- Deferrals (10) — F1–F10

**Gaps noticed during review (decisions the cluster didn't surface but should have):**

<br><br><br><br>

**Decisions that should be merged or split:**

<br><br>

**Decisions that should be demoted (not actually decisions):**

<br><br>

---

## 6. After review — next actions

**Adopted now as direction (not yet ADR):**

<br><br>

**ADRs to open next, in order:**

1. <br>
2. <br>
3. <br>

**Blocked on:**

- [ ] First-customer context (§11 #21)
- [ ] ___________________________________
- [ ] ___________________________________

**Sign-off:**   Date: __________   Reviewer: __________

---

*Committed at `b61ec48` (synthesis) and `011d839` (raw cluster). Re-print from this file anytime the source synthesis is updated — this packet is re-derivable, not canonical.*
