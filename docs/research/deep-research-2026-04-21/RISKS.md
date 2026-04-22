# Risks — cluster 1 (2026-04-21)

Lifted out of [`SYNTHESIS.md`](./SYNTHESIS.md). Cluster 1 did not have a dedicated "risks" section — its risk content lives in §1.1 (plausibility collapse as dominant failure mode), §2 (unresolved tensions), and §5 (deferrals and anti-recommendations, which function as risks-if-scope-drifts). This file consolidates them into pickable form.

Each entry: trigger, mitigation shape, current disposition.

---

## Index

| ID | Risk | Kind | Severity | Current disposition |
|---|---|---|---|---|
| [R-C1-1](#r-c1-1--plausibility-collapse-via-operational-thinness) | Plausibility collapse via operational thinness | Product | Existential | Partially mitigated by ADRs 0005/0006/0008/0009; reinforced by Candidate B |
| [R-C1-2](#r-c1-2--stacked-observability-backend-blows-past-cost-ceiling) | Stacked observability backend blows past cost ceiling | Infra/Cost | High | Resolved by [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) |
| [R-C1-3](#r-c1-3--marketing-language-implies-compliance-certification) | Marketing language implies compliance certification | Legal | High | Documented warning — requires ongoing copy discipline |
| [R-C1-4](#r-c1-4--scope-creep-into-enterprise-wormpkirbac) | Scope creep into enterprise WORM/PKI/RBAC | Product scope | Medium | Anti-recommendation; becomes ADR constraint if Candidate E lands |
| [R-C1-5](#r-c1-5--llm-scope-creeps-beyond-templated-text-behind-gateway) | LLM scope creeps beyond templated text behind gateway | Product scope | Medium | Partially bounded by [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md); reinforced if Candidate D pins scope |
| [R-C1-6](#r-c1-6--admin-ui-idle-cost-dominates-default-install) | Admin UI idle cost dominates default install | Infra/Cost | Medium | Pressured by [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md); final shape waits on Candidate D |
| [R-C1-7](#r-c1-7--ui-only-maker-checker-enforcement-is-worse-than-none) | UI-only maker-checker enforcement is worse than none | Product/Credibility | High | Resolved by [ADR 0008](../../decisions/0008-workflows-are-state-machines.md) — maker-checker is state-machine-enforced |

Four of seven either resolved or meaningfully constrained by accepted ADRs. Three remain as ongoing warnings or candidate-ADR requirements.

---

## R-C1-1 — Plausibility collapse via operational thinness

**What happens.** A user inspects the system — opens CloudWatch, looks at IAM roles, clicks through a case timeline, reads the audit trail — and detects that it's fake. Not because the UI is wrong; because the *operational depth* isn't there. No correlated telemetry, no queue retry behavior, no audit events, no async activity. The illusion of a real enterprise system collapses irrecoverably.

**Source.** [SYNTHESIS.md §1.1](./SYNTHESIS.md) — ten of twelve reports named this as the dominant failure mode. Reports 01, 04, 09, 10, 11 named it explicitly as the biggest risk.

**Why this is load-bearing for Jungle3.** Plausibility is won or lost in the operational depth, not the UI skin. Engineers inspect AWS resources; buyers ask about compliance controls; product people click through case timelines. Any one of those populations can collapse the illusion independently.

**Triggers.**

- Shipping a Jungle with a real UI but no meaningful background activity.
- Shipping an audit trail that only records UI actions, not the async backend events.
- Shipping workflows as single-step synchronous calls instead of state machines.
- Shipping a case timeline that's sparse because events aren't correlated by `case_id`.

**Mitigation shape.**

- Event envelope with dual correlation IDs ([ADR 0005](../../decisions/0005-event-envelope-and-correlation-identifiers.md)) — every event traces to the case.
- Insurance-domain-seeded realism with seven services and two stubs ([ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md)).
- State-machine workflows ([ADR 0008](../../decisions/0008-workflows-are-state-machines.md)).
- Append-only hash-chained audit ([ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md)).
- Pinned minimum viable realism threshold (Candidate B in [CANDIDATES.md](./CANDIDATES.md)) — so "operational thinness" is measurable against a gate.

**Disposition.** Partially mitigated by the five accepted ADRs. Fully mitigated only when Candidate B is drafted and a shipping gate exists. Until then, a team could build a seven-service Jungle that passes the ADRs but fails plausibility because no one axis is thick enough.

---

## R-C1-2 — Stacked observability backend blows past cost ceiling

**What happens.** The reports individually recommended sensible observability choices — report 09 suggested OpenTelemetry → CloudWatch/X-Ray + opt-in OTLP, report 11 suggested OpenSearch for audit search, report 08 warned OpenSearch idle alone is ~$70/month. Stacking all three in a default install breaches any reasonable cost ceiling *before the user writes a single event*.

**Source.** [SYNTHESIS.md §2.3](./SYNTHESIS.md).

**Triggers.**

- Taking each report's recommendation at face value without costing the composition.
- Making OpenSearch default-on rather than opt-in.
- Leaving CloudWatch retention at "Never Expire."

**Mitigation shape.**

- [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) pinned CloudWatch Logs / Insights + X-Ray as the default observability stack. OpenSearch deferred.
- The $100/month infra ceiling forces this discipline: no silent additions to the default stack.
- Retention tiering (cluster-2 Candidate C) will further close the CloudWatch compounding risk.

**Disposition.** Resolved by ADR 0007. Documented here because the composition risk — adding a "just one more" observability service — recurs whenever a new tool is considered for default install.

---

## R-C1-3 — Marketing language implies compliance certification

**What happens.** Product copy, UI text, or marketing uses terms like "compliant," "certified," "audited," "SOC 2," "HIPAA" to describe Jungle3's regulated-cue surface. A regulator, a customer's legal team, or a judge in a lawsuit reads those terms as attestation. Legal exposure.

**Source.** [SYNTHESIS.md §5](./SYNTHESIS.md) ("Marketing language discipline: no 'compliant,' 'certified,' 'audited'") and report 11.

**Why this is Jungle3-specific.** Jungle3's value prop is *plausibility* — an install feels like a regulated system. That plausibility is the thing that invites the wrong marketing claim. Every cluster-1 regulated-cue feature (maker-checker, hash-chained audit, state-aware SLAs) is simultaneously an asset (credible demo) and a trap (reads like certification).

**Triggers.**

- Marketing copy drafted by someone not steeped in the posture.
- A sales deck claiming "Jungle3 is SOC 2 ready."
- Admin UI labels like "Compliance report" instead of "Audit inspection view."
- A feature called "Automated compliance check."

**Mitigation shape.**

- No built-in compliance-attestation reports. Anti-recommendation already on record ([SYNTHESIS.md §5](./SYNTHESIS.md)).
- Forensic-posture doc (cluster 2 §3.3 candidate architecture doc) should codify the language discipline.
- Marketing review checklist: no "compliant," "certified," "audited," "SOC 2," "HIPAA," "PCI-DSS" in any customer-facing copy unless specifically vetted.

**Disposition.** Documented warning. Will never become a single ADR — it's an ongoing discipline. Likely best expressed as a short `docs/product/language-discipline.md` when the product-copy surface grows.

---

## R-C1-4 — Scope creep into enterprise WORM/PKI/RBAC

**What happens.** A customer or reviewer asks for "real" enterprise controls — cryptographic WORM storage, full PKI, a complete RBAC engine with hundreds of roles — and the team treats it as a reasonable v1 scope addition. The idle cost, build time, and complexity all multiply.

**Source.** [SYNTHESIS.md §5](./SYNTHESIS.md) — report 11 explicitly defers cryptographic WORM, enterprise PKI, and full RBAC engines as "high cost, low plausibility ROI for v1."

**Triggers.**

- A first design-partner conversation asking for enterprise features.
- Confusing "credible to a DOI examiner" with "certified to SOC 2."
- A team member saying "we should just do RBAC properly."

**Mitigation shape.**

- Append-only hash-chained audit ([ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md)) is the WORM substitute. It's cheaper, simpler, and sufficient for the plausibility use case.
- S3 Object Lock is the escalation path if a customer later opts in.
- Role-at-time attribution on audit entries (report 11's recommendation) is the RBAC substitute — shows authority without requiring a role engine.

**Disposition.** Anti-recommendation on record. Becomes an explicit ADR constraint when Candidate E (extension architecture) is drafted — the pack boundary is where enterprise-grade controls would live if a customer needs them, not in core.

---

## R-C1-5 — LLM scope creeps beyond templated text behind gateway

**What happens.** LLMs get used for business decisions — claim approvals, policy determinations, routing to SIU. What started as "generate a plausible adjuster note" becomes "let the LLM decide whether to pay the claim." Auditability collapses, compliance posture collapses.

**Source.** [SYNTHESIS.md §2.4](./SYNTHESIS.md) and anti-recommendation in [SYNTHESIS.md §5](./SYNTHESIS.md) ("Fully autonomous LLM agents making business decisions").

**Triggers.**

- A new feature request framed as "let the AI handle X" where X is load-bearing.
- Template-text LLM calls expanding their prompts to include decision logic.
- Admin UI agent (the [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) one) being asked to "auto-remediate" a failure instead of just explaining it.

**Mitigation shape.**

- [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md): LLMs route through the `llm-gateway`, budget-capped, tool-constrained.
- [ADR 0002](../../decisions/0002-sub-agent-response-contract.md): agents report status/summary/evidence/recommended-action — the recommendation is for a human or state machine to act on, not an action.
- Candidate D (admin surface scope) would pin the admin agent's bounded view set explicitly.

**Disposition.** Partially bounded. The gateway + response contract limit LLM blast radius. Fully mitigated only when Candidate D pins the view set.

---

## R-C1-6 — Admin UI idle cost dominates default install

**What happens.** A custom admin UI with persistent compute (e.g., Fargate + OpenSearch + dashboard backend) adds $100+/month to the idle floor. The default install now costs more than a team can justify leaving on.

**Source.** [SYNTHESIS.md §2.2](./SYNTHESIS.md) — report 08's cost warning, report 09's "build the admin UI" argument, neither costed against the other.

**Triggers.**

- Admin UI chosen as a persistent service rather than serverless.
- OpenSearch added as admin UI's search backend.
- Dashboards with always-on compute.
- CloudWatch Logs ingestion from the admin UI itself compounding into the bill.

**Mitigation shape.**

- [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md): CloudWatch/X-Ray default, no OpenSearch, $100/month infra ceiling.
- LLM-agent-over-tools pattern means no persistent search cluster; queries are on-demand.
- Retention tiering (cluster-2 Candidate C) closes the compounding-log problem.
- Candidate D (admin surface scope) would pin the compute profile explicitly.

**Disposition.** Pressured by ADR 0007. Final shape waits on Candidate D.

---

## R-C1-7 — UI-only maker-checker enforcement is worse than none

**What happens.** The product shows a maker-checker approval UI but enforces it in the frontend only. A technical reviewer opens the API directly, bypasses the UI, pushes an approval as the same user who submitted the request. The entire regulated-cue story collapses — and collapses more violently than if there had been no maker-checker at all, because the reviewer now knows the compliance posture is theater.

**Source.** Report 11, surfaced in [SYNTHESIS.md §1.4](./SYNTHESIS.md).

**Triggers.**

- Maker-checker implemented as a UI gate with no backend state-machine enforcement.
- The same user ID allowed to submit and approve.
- Approvals not recorded in the audit trail with distinct `submitted_by` and `approved_by` attributions.

**Mitigation shape.**

- [ADR 0008](../../decisions/0008-workflows-are-state-machines.md) makes workflows state machines — maker-checker is enforced at the state-machine level, not the UI.
- [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) records actor attribution (`submitted_by`, `approved_by`) in audit entries.
- [CLAUDE.md §11 #16](../../../CLAUDE.md) (canonical maker-checker workflow) pins the specific v1 instance; cluster-2 Candidate F ($47,500 settlement revised to $32,000) is the leading shape.

**Disposition.** Resolved by ADRs 0008 and 0009. Kept in this list because the *implementation risk* — someone future-you ships a UI-only gate against the state machine's intent — is ongoing.

---

## Summary: what these risks mean for the investor conversation

- **Plausibility collapse (R-C1-1)** is the dominant product risk. Five ADRs explicitly counter it. Candidate B closes the remaining gap.
- **Cost blowout (R-C1-2, R-C1-6)** was serious at synthesis time; [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) is the primary defense. Cluster-2 Candidate C tightens it further.
- **Legal/marketing discipline (R-C1-3)** will never be a single ADR; it's an ongoing posture.
- **Scope creep (R-C1-4, R-C1-5)** is bounded but recurring — every new feature request is a potential vector.
- **Credibility traps (R-C1-7)** are resolved at the architecture level; they recur only if someone ships contrary to the architecture.

See [`RISKS-CLUSTER-2.md` equivalent](../deep-research-2026-04-22/RISKS.md) (once written) for cluster-2 risks and [`../../decisions/BACKLOG.md`](../../decisions/BACKLOG.md) for the cross-cluster candidate ADR view.
