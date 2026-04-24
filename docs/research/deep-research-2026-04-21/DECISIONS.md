> **What this is:** A flat backlog of the decisions surfaced by the 12 ultra4x deep-research reports captured on 2026-04-21. Each entry is a question the cluster produced that the maintainers will eventually have to answer — not an answer.
> **Captured:** 2026-04-21.
> **Status:** **Nothing here is decided.** Every entry is `status: open`. When one is adopted it should be promoted to an ADR in [`../../decisions/`](../../decisions/) and removed from this list. Some entries overlap with existing CLAUDE.md §11 open decisions; that is called out per-entry.
> **How to read:** as a backlog. Cite the source report(s) and this file when opening an ADR; once an ADR exists, cite the ADR.

See [`SYNTHESIS.md`](./SYNTHESIS.md) for the cross-report synthesis and grouping of these into candidate ADRs. See [`EXECUTIVE_SUMMARIES.md`](./EXECUTIVE_SUMMARIES.md) for per-report distillations.

---

## Legend

- **Source** — the report(s) in [`results/`](./results/) that surfaced this decision.
- **CLAUDE.md §11** — the open-decision entry that this decision corresponds to, if any.
- **Candidate ADR** — the candidate grouping in [`SYNTHESIS.md`](./SYNTHESIS.md) §4 that this rolls into, if any.
- **Status** — always `open` in this file. When resolved, promote to ADR and remove.

---

## Architecture

### A1. v1 domain anchor
Pick one of the six candidate anchors (insurance claims, chargebacks, benefits enrollment, order exception, loan/application review, permit/compliance). Report 02 recommends chargebacks; reports 10 and 11 assume insurance claims throughout. Must be resolved before persona taxonomy, scenario pack schema, and stub catalog can be fixed.
- **Source:** 02, 10, 11.
- **CLAUDE.md §11:** #19.
- **Candidate ADR:** A.
- **Status:** open.

### A2. Minimum viable realism threshold
Ratify concrete floor numbers (microservices, personas, background jobs, stubs) as a v1 shipping gate.
- **Source:** 01, 03, 10.
- **CLAUDE.md §11:** #17.
- **Candidate ADR:** B.
- **Status:** open.

### A3. v1 service set and decomposition
Whether v1 ships with the ten-service decomposition from [`research2-v1-service-build-plan.md`](../../research-archive/first-generation/research2-v1-service-build-plan.md), a smaller set, or a domain-shaped set. Interacts with A1 and A2.
- **Source:** 01, 02 (research2), 03.
- **CLAUDE.md §11:** #16.
- **Status:** open.

### A4. Minimal core + versioned packs boundary
Commit to the minimal core + domain packs architecture now, even though v1 ships with one pack. Define what lives in core vs. packs.
- **Source:** 12.
- **Candidate ADR:** E.
- **Status:** open.

### A5. Pack manifest format and versioning policy
If A4 is adopted: pack manifest schema (suggested: `pack.yaml`), SemVer 2.0.0 policy for packs and core, core-version compatibility range declaration.
- **Source:** 12.
- **Candidate ADR:** E (sub-decision).
- **Status:** open.

### A6. Runtime isolation model for packs
If A4 is adopted: how packs are isolated at runtime. Report 12 proposes resource-name prefixing (`jungle3-<pack_id>-*`) + scoped IAM policies + per-pack DB schemas / Temporal namespaces / SQS prefixes.
- **Source:** 12.
- **Candidate ADR:** E (sub-decision).
- **Status:** open.

### A7. Pack signing and verification
If A4 is adopted: what signing is required for v1 (SHA-256 digest + manifest signing minimum; Sigstore/Cosign + Rekor transparency log as upgrade path) and whether SBOM is mandatory.
- **Source:** 12.
- **Candidate ADR:** E (sub-decision).
- **Status:** open.

### A8. Hybrid compute profile: Lambda + Fargate split
Which workloads run on Lambda (spiky/async) vs. Fargate (long-lived/high-throughput). Report 07 recommends hybrid; the boundary needs naming.
- **Source:** 07.
- **CLAUDE.md §11:** #11.
- **Status:** open.

### A9. Hybrid simulation orchestration
Step Functions for deterministic golden-path demos + EventBridge/Lambda for stochastic background activity. Named as a single pattern across 04, 05, 10.
- **Source:** 04, 05, 10.
- **Status:** open.

### A10. Orchestration engine choice
Step Functions vs. Temporal vs. other for business workflow orchestration. Report 05 defaults to Step Functions; report 12 mentions Temporal namespaces for pack isolation. Interacts with A8.
- **Source:** 05, 10, 12.
- **Status:** open.

---

## Data

### D1. Event envelope standard
Adopt CloudEvents v1.0 with reverse-DNS type naming (`com.jungle3.<domain>.<noun>.<verb_past_tense>`) and the canonical verb set (`created`, `updated`, `deleted`, `assigned`, `approved`, `rejected`, `escalated`, `completed`, `failed`).
- **Source:** 05, 09, 12.
- **Candidate ADR:** C.
- **Status:** open.

### D2. Correlation ID model
Dual `trace_id` (W3C Trace Context) + business `case_id` propagated through every event, log, and audit entry. Four reports converge on this.
- **Source:** 05, 09, 10, 11.
- **Candidate ADR:** C.
- **Status:** open.

### D3. Correlation ID propagation for async hops
How `trace_id` and `case_id` are carried across SQS messages, Step Functions context, EventBridge events, scheduled jobs. Propose SQS MessageAttributes + SFN ExecutionContext.
- **Source:** 05, 09.
- **Candidate ADR:** C (sub-decision).
- **Status:** open.

### D4. Idempotency model
Producer-generated `eventId` (stable across retries) + consumer-side deduplication store. Plus separate `idempotencyKey` for external side effects.
- **Source:** 05, 09.
- **Status:** open.

### D5. Cross-domain schema primitives
Adopt minimal schema primitives (Case/Work-Item, Actor, Event, Document) using JSON Schema as a domain-agnostic vocabulary, with domain-specific fields in `custom_fields` or domain-owned schemas.
- **Source:** 12.
- **Candidate ADR:** E (sub-decision).
- **Status:** open.

### D6. Synthetic data generation pipeline
Event-first Scenario Pack model: parameterized, seed-controlled scripts that drive entities through event sequences. Deterministic `run_seed` for reproducibility.
- **Source:** 04.
- **Status:** open.

### D7. LLM usage scope and guardrails
LLMs bounded to templated free-text generation (notes, emails, descriptions), behind a gateway that enforces PII scrubbing, cost budgets, and circuit breakers. No LLM-driven business decisions.
- **Source:** 04, 10.
- **Status:** open.

### D8. Identity generation safety rules
Names from census distributions; contact artifacts safe-by-construction (`@example.invalid`, 555 phone numbers, non-existent street numbers in real cities); do-not-generate list for public figures.
- **Source:** 04, 10.
- **Status:** open.

### D9. Backlog shape model
Nonhomogeneous Poisson Process for arrivals (diurnal/weekly patterns) + Lognormal-Pareto mixture for service times (80/20 effort concentration). Aging distribution targets: 40-55% 0-7d, 25-35% 8-30d, 10-20% 31-90d, 3-8% 91d+.
- **Source:** 10.
- **Status:** open.

### D10. Audit event required fields
Server-generated `event_id`, `event_ts` with timezone, `actor_id`, `actor_role_at_time`, `action_type`, `object_type`/`object_id`, `correlation_id`, before/after diffs, per-event checksum, chain-hash.
- **Source:** 11.
- **Status:** open.

---

## Observability

### O1. v1 custom admin surface scope
Which views ship in v1. Report 09 proposes: per-entity (case) timeline, queue health with business framing, failure inspection with one-click replay.
- **Source:** 09.
- **CLAUDE.md §11:** #18.
- **Candidate ADR:** D.
- **Status:** open.

### O2. Admin surface vs. Agent Layer relationship
Same surface, complementary layers, or one-replaces-the-other. Currently described in two places ([`docs/architecture/agent-layer.md`](../../architecture/agent-layer.md) and research2).
- **Source:** 09, research2.
- **CLAUDE.md §11:** #18.
- **Candidate ADR:** D (sub-decision).
- **Status:** open.

### O3. Observability telemetry stack
ADOT Collector → CloudWatch/X-Ray as default; opt-in OTLP export path to Grafana Cloud / Honeycomb / self-managed.
- **Source:** 09.
- **Status:** open.

### O4. Search and analytics layer
CloudWatch Logs Insights only (cheapest) vs. OpenSearch (~$70/month idle floor) vs. Athena-over-Parquet for historical. Report 08 warns against OpenSearch by default; reports 09 and 11 assume it.
- **Source:** 08, 09, 11.
- **Status:** open.

### O5. Default-provisioned observability artifacts
What ships by default via CloudFormation: dashboards, alarms, log query definitions, X-Ray groups, synthetic canaries.
- **Source:** 09.
- **Status:** open.

### O6. Telemetry-to-vendor policy
Default-off, opt-in via CloudWatch OAM sink or subscription filter. Support bundle workflow for debugging (buyer runs tool, generates sanitized S3 export, shares pre-signed URL).
- **Source:** 09.
- **Status:** open.

### O7. Destructive action safety (replay, purge, redrive)
Backend-enforced RBAC, dry-run preview with diff, multi-step approval flow (Step Functions `waitForTaskToken`), immutable audit record with `replayId`, rate limiting, blast radius controls.
- **Source:** 09.
- **Status:** open.

### O8. Local development observability parity
Docker Compose stack (LocalStack + OTel Collector + Jaeger/Tempo + Prometheus + Grafana + Loki) with same W3C TraceContext semantics as cloud.
- **Source:** 09.
- **Status:** open.

---

## Packaging and distribution

### P1. IaC authoring tool
CloudFormation at publish (Marketplace requirement); authoring can be CFN directly, CDK, SAM, or Pulumi. Report 07 recommends CDK-authored, CFN-published.
- **Source:** 07.
- **CLAUDE.md §11:** #7.
- **Status:** open.

### P2. Stack structure
Single CloudFormation stack vs. nested stacks with optional components.
- **Source:** 07.
- **CLAUDE.md §11:** #2.
- **Status:** open.

### P3. Installer UX
Two-stage guided install: (1) lightweight bootstrap stack creates IAM role + KMS + S3, (2) installer wizard collects parameters and launches full stack.
- **Source:** 07.
- **Status:** open.

### P4. Marketplace listing model
Single SaaS/container listing with in-product pack entitlements for v1; standalone pack listings + Offer Sets + Channel Partner Private Offers post-v1.
- **Source:** 07, 12.
- **Status:** open.

### P5. Entitlement integration
In-account control plane calls `GetEntitlements` against AWS Marketplace Entitlement Service, caches locally, reconciles periodically. Metering Service for usage-based pricing.
- **Source:** 07, 12.
- **Status:** open.

### P6. Supported AWS regions at launch
Not decided. Report 07 does not recommend a list.
- **Source:** 07.
- **CLAUDE.md §11:** #5.
- **Status:** open.

### P7. Account scenarios supported at launch
Single-account vs. Control Tower / multi-account. Report 07 proposes supporting both with branching; report does not pick a v1 scope.
- **Source:** 07.
- **CLAUDE.md §11:** #6.
- **Status:** open.

### P8. Upgrade/update strategy
Blue/green via separate CFN stacks + routing layer switch. How to migrate customer data across versions without orphaning resources.
- **Source:** 07, 12.
- **CLAUDE.md §11:** #3.
- **Status:** open.

### P9. Minimum IAM permissions
The permission set the install requires from the subscribing customer. Every additional permission is a security-team conversation.
- **Source:** 07.
- **CLAUDE.md §11:** #4.
- **Status:** open.

---

## Cost

### C1. v1 cost profile targets
Demo ($40-60/mo, ephemeral) / Default-Realism ($110-150/mo steady) / Stress (opt-in).
- **Source:** 08.
- **Candidate ADR:** F.
- **Status:** open.

### C2. Default cost controls in every install
AWS Budget + SNS alerts at 80%/100%, log-class tiering (Standard vs. IA), single-AZ NAT in dev, S3 lifecycle policies, aggressive log retention defaults.
- **Source:** 08.
- **Candidate ADR:** F.
- **Status:** open.

### C3. Trace sampling strategy
Tail-based sampling: 100% of error traces, 100% of SLO-breaching traces, 5-10% of successful traces.
- **Source:** 08, 09.
- **Status:** open.

### C4. Log retention tiers
Hot: 30 days CloudWatch Standard. Warm: 90 days CloudWatch IA. Cold: optional S3 export → Glacier.
- **Source:** 08, 09.
- **Status:** open.

### C5. OpenSearch deferral policy
Default off; opt-in only when customer requests it. Interacts with O4.
- **Source:** 08.
- **Status:** open.

---

## Compliance feel

### R1. Maker-checker approval workflow
Backend-enforced four-eyes: API-layer check that `approver_id != maker_id`. UI-only enforcement is insufficient. Mandatory comment on approver action.
- **Source:** 01, 10, 11.
- **Status:** open.

### R2. Append-only audit trail implementation
DynamoDB with PITR (default profile) or Aurora INSERT-only with triggers (enterprise profile). Includes fields from D10.
- **Source:** 11.
- **Status:** open.

### R3. Tamper-evidence method
Per-event SHA-256 checksum + chain-hash linking to previous event. Cheaper than cryptographic WORM; sufficient for v1 plausibility.
- **Source:** 11.
- **Status:** open.

### R4. Record versioning model
New immutable version record per edit; never mutate history. 'View prior version' read-only flow. Human-readable diffs. Tombstone-on-delete.
- **Source:** 11.
- **Status:** open.

### R5. Legal hold and retention UI
Per-record Legal Hold toggle (prevents archival/deletion). Retention presets (1/3/7/10 years) with regulation tooltips. `archived_on` / `expires_on` metadata.
- **Source:** 11.
- **Status:** open.

### R6. Document control cues
Per-document checksum display, append-only access history (views/downloads/exports), on-export watermarking (user + timestamp + case ID), logged redaction events.
- **Source:** 11.
- **Status:** open.

### R7. Marketing language discipline
Never use "compliant," "certified," "audited," "validated," or regulation-specific claims. Use "designed for," "supports," "tamper-evident." Publish a Shared Responsibility Model document.
- **Source:** 11.
- **Status:** open.

### R8. Separation-of-duties cues without full RBAC
Role-at-time display in audit entries; disabled self-approve buttons with explanatory tooltips; enriched personas with department/business unit.
- **Source:** 10, 11.
- **Status:** open.

---

## Personas and content

### X1. v1 role taxonomy
If A1 = insurance: 8 roles (FNOL/Intake, Triage, Adjuster Jr, Adjuster Sr, Approver, Fraud/SIU, CSR, SysAdmin/Auditor). If A1 = chargebacks: TBD. Directly blocked on A1.
- **Source:** 10.
- **Status:** open.

### X2. Pre-seeded workload portfolios per persona
Per-role target counts and state mix (e.g., an adjuster starts with 40-100 active claims across states). Spec in report 10.
- **Source:** 10.
- **Status:** open.

### X3. External actor simulation model
Primary: Policyholder/Customer (web intake, email/SMS, S3 file drops), Vendor (B2B EDI stubs, invoices), Regulator (implicit SLA constraints).
- **Source:** 10.
- **Status:** open.

### X4. Friction tuning parameters and presets
Tunable rates (evidence gap 25%, approval delay 30%, misroute 2%, reopen 12%, conflict 8%) with safety bounds. Presets: Demo-friendly, Realistic Ops, Stress Surge, Auditor View.
- **Source:** 10.
- **Status:** open.

### X5. Content and document realism
Templated notes/emails (Jinja-style), fillable PDF templates for formal docs, synthetic attachments (blurred photos, CSVs). Mandatory watermarks + metadata disclaimers ("SYNTHETIC DATA").
- **Source:** 04, 10.
- **Status:** open.

### X6. Stub catalog v1 scope
Which external systems get pre-built stubs. Report 06 candidates: payment gateway (Stripe-shaped), OAuth2/OIDC IdP, doc storage (S3 pre-signed), credit bureau. Interacts with A1.
- **Source:** 06.
- **Status:** open.

### X7. Stub fidelity tier for v1
Wire / Behavioral / Integration. Report 06 recommends Integration-grade for all v1 stubs.
- **Source:** 06.
- **Status:** open.

### X8. Realism self-check / "Realism Score"
Automated statistical checks (KS test, autocorrelation, n-gram entropy, trace coherence) surfaced as a score in the admin UI.
- **Source:** 04.
- **Status:** open.

---

## Deferrals (tracked so they stay deferred)

Items explicitly recommended against for v1 by multiple reports. Not decisions — commitments to not decide yet.

- **F1.** Cryptographic WORM storage, enterprise PKI integration, granular cross-service RBAC engines, N-of-M approval workflows (report 11).
- **F2.** Automated compliance attestation reports (report 11 — legally perilous).
- **F3.** AI-driven root cause analysis, automated remediation playbooks (report 09).
- **F4.** Fully-hosted multi-tenant control plane / SaaS admin dashboard (report 12 — contradicts in-account deployment).
- **F5.** Runtime plugin loader for customer-authored code (report 12).
- **F6.** Cross-domain analytics dashboard (report 12 — premature normalization).
- **F7.** Fully autonomous LLM agents making business decisions (reports 04, 10).
- **F8.** Follow-the-sun multi-region persona coverage (report 10).
- **F9.** Full legal-hold and e-discovery workflow (report 11).
- **F10.** Formal SOC 2 / HIPAA certification (report 10 — architecture should be readiness-focused, certification is post-v1).
