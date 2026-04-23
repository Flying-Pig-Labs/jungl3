# Risks — cluster 2 (2026-04-22)

Lifted out of [`SYNTHESIS.md` §6](./SYNTHESIS.md) ("The five 'will hit this wall' risks"). Each entry is a concrete failure mode the cluster surfaced, ranked by how early it would hit us if unaddressed. One has since been resolved by [ADR 0010](../../decisions/0010-seeder-and-reaper-patterns.md); four remain.

Each entry: trigger, mitigation shape, current disposition.

---

## Index

| ID | Risk | Kind | Severity | Current disposition |
|---|---|---|---|---|
| [R-C2-1](#r-c2-1--synchronous-lambda-custom-resource-hangs-cloudformation-for-45-min) | Synchronous Lambda custom resource hangs CloudFormation for 45 min | Install/SLA | High | **Resolved** by [ADR 0010](../../decisions/0010-seeder-and-reaper-patterns.md) |
| [R-C2-2](#r-c2-2--kinesis-firehose-put-request-cost-cliff) | Kinesis Firehose PUT-request cost cliff | Infra/Cost | High | Mitigation known; to be pinned by [Candidate C](./CANDIDATES.md#c--retention-tiering-cloudwatch--s3--glacier-deep-archive) |
| [R-C2-3](#r-c2-3--live-llm-seed-generation-breaks-budget--determinism) | Live LLM seed generation breaks budget + determinism | Product/Cost | High | Mitigation known; to be pinned by [Candidate B](./CANDIDATES.md#b--seed-data-generation-pre-generated-shipped-as-immutable-artifact) |
| [R-C2-4](#r-c2-4--cloudwatch-retention-default-compounds-past-cost-ceiling) | CloudWatch retention default compounds past cost ceiling | Infra/Cost | High | Mitigation known; to be pinned by [Candidate C](./CANDIDATES.md#c--retention-tiering-cloudwatch--s3--glacier-deep-archive) |
| [R-C2-5](#r-c2-5--first-plausibility-test-finds-no-regulatory-surface) | First plausibility test finds no regulatory surface | Product/Credibility | High | Mitigation known; to be pinned by [Candidate E](./CANDIDATES.md#e--regulatory-surface-for-v1-insurance-claims) |
| [R-C2-6](#r-c2-6--step-functions-history-retention-capped-at-90-days) | Step Functions history retention capped at 90 days | Compliance/Audit | Medium | Partial mitigation via Candidate C; cross-link in [ADR 0008](../../decisions/0008-workflows-are-state-machines.md) needed |
| [R-C2-7](#r-c2-7--s3-etag-not-plain-md5-for-multipart-uploads-silent-integrity-break) | S3 ETag not plain MD5 for multipart uploads (silent integrity break) | Compliance/Audit | Medium | Mitigation known; to be pinned by [Candidate D](./CANDIDATES.md#d--document-integrity-application-layer-sha-256-hashing-of-supporting-documents) |
| [R-C2-8](#r-c2-8--install-age-visible-via-aws-metadata-apis-forensic-exposure) | Install age visible via AWS metadata APIs (forensic exposure) | Product/Plausibility | Medium | Architecture-doc-shaped; pinned posture needed |

One resolved (R-C2-1). Four attached to High-readiness candidates (R-C2-2, R-C2-3, R-C2-4, R-C2-5). Three remain as documented warnings or Medium-priority future work.

---

## R-C2-1 — Synchronous Lambda custom resource hangs CloudFormation for 45 min

**What happens.** A synchronous Lambda-backed CloudFormation custom resource times out at 15 minutes without sending a `FAILED` signal to the pre-signed S3 `ResponseURL`. CloudFormation hangs for another 45 minutes waiting. Total install time: 1 hour, visible to the customer as "stuck" for 45 of those 60 minutes. The "time to real" thesis ([`findings.md`](../findings.md) §1) dies the first time this fires.

**Source.** [SYNTHESIS.md §6 risk #1](./SYNTHESIS.md), report 07.

**Triggers.**

- Trying to seed more than ~10K rows synchronously in a custom-resource Lambda.
- Any install-time work that exceeds 15 minutes (always hits the wall).
- Generic synchronous custom resource pattern adopted without thought.

**Mitigation shape.**

- Async Step Functions handoff from a thin custom-resource Lambda that immediately returns `SUCCESS` to the `ResponseURL` and starts a state machine. [ADR 0010](../../decisions/0010-seeder-and-reaper-patterns.md) pinned this.
- Alternative: CDK Provider Framework's `isCompleteHandler` polling pattern. Pre-built; heavier; also acceptable under ADR 0010.

**Disposition.** **Resolved by [ADR 0010](../../decisions/0010-seeder-and-reaper-patterns.md).** Kept in this list because the risk persists for any future custom-resource additions: the ADR is a pattern to follow, not a guard rail — deviation is possible.

---

## R-C2-2 — Kinesis Firehose PUT-request cost cliff

**What happens.** Kinesis Firehose, configured with default buffer hints, writes individual audit events as one S3 PUT each. At High workload (500K events/day), S3 PUT-request charges alone cost ~$150/month — blowing through [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md)'s $100 infra ceiling before any other cost is counted.

**Source.** [SYNTHESIS.md §6 risk #2](./SYNTHESIS.md), report 02.

**Triggers.**

- Firehose deployed with default settings.
- Audit volume exceeding ~100K events/day (hits in load testing, long before real customers).
- Adding additional Firehose streams without aggregating them.

**Mitigation shape.**

- 64 MB / 15-minute buffer hints on Firehose. One config line; eliminates ~$150/month of PUT charges.
- This is a requirement of [Candidate C](./CANDIDATES.md#c--retention-tiering-cloudwatch--s3--glacier-deep-archive) (retention tiering); it belongs in the same ADR.

**Disposition.** Mitigation known. Becomes a required constraint when Candidate C is drafted. Until then, documented here as a warning to anyone setting up Firehose before C lands.

---

## R-C2-3 — Live LLM seed generation breaks budget + determinism

**What happens.** The team attempts to generate the seed corpus (claim notes, adjuster communications, persona writing-style samples) live at install time via Claude. Two failures:

1. **Cost.** 7.5M tokens at Sonnet pricing = ~$154 per install. [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md)'s $50/month LLM budget blown on install day one.
2. **Determinism.** Claude has no `seed` parameter. Even at `temperature=0`, floating-point and GPU-parallelism variation produce different output across calls. Two customer installs running the same CloudFormation template get different seed corpora, breaking [ADR 0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md)'s hash-chain integrity.

**Source.** [SYNTHESIS.md §6 risk #3](./SYNTHESIS.md), report 08.

**Triggers.**

- Any design that puts Claude on the install-time critical path for seed generation.
- Confusing "LLMs power the admin agent at runtime" (ADR 0007, correct) with "LLMs generate seed data at install" (not sustainable).

**Mitigation shape.**

- Pre-generate the seed corpus during the Marketplace-listing build phase. Ship as immutable JSON bundle via S3 or AMI. Install-time LLM cost: $0.
- Hybrid architecture: LLM for semantics (once, at build time), HMAC-SHA256-seeded Python post-processor for abbreviations / fragments / sparse typos (deterministic at install time).
- Commission 24 SME-authored exemplars under work-for-hire copyright assignment (not scraping FEMA/PACER).

**Disposition.** Mitigation known. Becomes a required constraint when [Candidate B](./CANDIDATES.md#b--seed-data-generation-pre-generated-shipped-as-immutable-artifact) is drafted. [CLAUDE.md §11 #24](../../../CLAUDE.md) tracks the SME-exemplar commission timing.

---

## R-C2-4 — CloudWatch retention default compounds past cost ceiling

**What happens.** CloudWatch Logs retention is left at the default "Never Expire." At 5 GB/month ingest over 24 months the Medium-scenario infra cost reaches ~$49/month. At 20 GB/month ingest it breaches [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md)'s $100 ceiling. The install got cheap-feeling at month one; by month four the bill is embarrassing.

**Source.** [SYNTHESIS.md §6 risk #4](./SYNTHESIS.md), report 01.

**Triggers.**

- Any log group created without an explicit retention policy (AWS default is "Never Expire").
- An install with volume growth that looked fine at deploy time but compounds over months.
- Admin UI or Agent Layer adding CloudWatch Logs ingestion without a retention decision.

**Mitigation shape.**

- 7-day default retention on application logs.
- S3 export + S3 Standard 30-day tier + Glacier Deep Archive for long-term.
- CloudFormation template enforces retention at log-group creation (not post-hoc).
- [Candidate C](./CANDIDATES.md#c--retention-tiering-cloudwatch--s3--glacier-deep-archive) pins this end-to-end.

**Disposition.** Mitigation known. [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) specifies 7-day retention; Candidate C adds the S3/Glacier tail. Documented here because the compounding nature makes it easy to miss during short-horizon testing.

---

## R-C2-5 — First plausibility test finds no regulatory surface

**What happens.** A Marketplace reviewer, insurance VP, or former DOI examiner opens the admin UI of a fresh Jungl3 install. They see a clean claims-intake screen, a maker-checker approval flow, and a case timeline. They look for the insurance-specific cues they actually expect. There's no jurisdiction field on claims. No reserve ledger. No SIU referral workflow. No state-specific SLA timer. The maker-checker is generic; the audit trail is generic; there's no large-loss reinsurance notification. They conclude — correctly — that it's a "claims-shaped app," not insurance.

**Source.** [SYNTHESIS.md §6 risk #5](./SYNTHESIS.md), report 09.

**Why this is worse than no plausibility attempt at all.** The reviewer had been willing to believe it was real insurance until the absence of specific cues made that impossible. Same dynamic as [cluster-1 R-C1-7](../deep-research-2026-04-21/RISKS.md#r-c1-7--ui-only-maker-checker-enforcement-is-worse-than-none): asymmetric risk, because the demo shape raised expectations that the domain fills.

**Triggers.**

- Shipping [ADR 0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md)'s seven services without the regulatory-cue surface.
- Treating "insurance" as a label on a generic case-management workflow.
- Demo to a real insurance-domain person without the cues in place.

**Mitigation shape.**

- [Candidate E](./CANDIDATES.md#e--regulatory-surface-for-v1-insurance-claims) pins the minimum cue set: state-aware SLAs, reserve ledger, SIU segregation, reinsurance notify, examiner export.
- Prioritize before first external demo.

**Disposition.** Mitigation known; Candidate E is the deliverable. Scoping call (how many of the five cues are minimum-viable) is the main gate.

---

## R-C2-6 — Step Functions history retention capped at 90 days

**What happens.** Step Functions Standard workflows retain execution history for exactly 90 days; Express workflows don't retain history at all. Enterprise examiners expect multi-year audit availability. A month-six audit request produces gaps.

**Source.** [SYNTHESIS.md §2.4](./SYNTHESIS.md), report 01.

**Triggers.**

- Relying on Step Functions history as the durable audit record.
- Not exporting execution history to CloudWatch Logs + S3.
- Using Express workflows for any state machine that needs audit.

**Mitigation shape.**

- Every state machine logs execution history to CloudWatch Logs by default.
- That CloudWatch Logs group participates in Candidate C's tiering.
- [ADR 0008](../../decisions/0008-workflows-are-state-machines.md) should reference this constraint by amendment or cross-link.
- Candidate G (ADR 0009 amendments) could include a line on state-machine history as audit feed.

**Disposition.** Partially mitigated by Candidate C when drafted. Cross-link in [ADR 0008](../../decisions/0008-workflows-are-state-machines.md) still needed.

---

## R-C2-7 — S3 ETag not plain MD5 for multipart uploads (silent integrity break)

**What happens.** The team relies on S3 ETags to prove supporting-document integrity — claim estimates, photos, reports. For any document larger than the multipart threshold (5 MB by default), the ETag silently becomes a composite hash, not a standard MD5. External verifiers computing "just the MD5" get the wrong value and the integrity claim fails. By then, the audit chain has recorded the ETag value — no obvious way to detect from inside the system.

**Source.** [SYNTHESIS.md §2.5](./SYNTHESIS.md), report 03.

**Triggers.**

- Any supporting document larger than 5 MB (common for photos).
- Treating S3 ETag as a general-purpose integrity hash.
- No application-layer hashing at upload time.

**Mitigation shape.**

- SHA-256 hash at application layer at upload time; embed in CloudEvents extension attributes; chain through audit record.
- [Candidate D](./CANDIDATES.md#d--document-integrity-application-layer-sha-256-hashing-of-supporting-documents) pins this.

**Disposition.** Mitigation known. Candidate D is the deliverable. Scope question ("what counts as a supporting document") gates the draft.

---

## R-C2-8 — Install age visible via AWS metadata APIs (forensic exposure)

**What happens.** A reviewer who knows where to look calls `CloudFormation DescribeStacks.CreationTime`, `DynamoDB DescribeTable.CreationDateTime`, `CloudWatch Logs DescribeLogGroups.creationTime`, `IAM GetRole.CreateDate`, or `Step Functions DescribeExecution.startDate`. Every one of them shows minutes-old timestamps on a fresh install. The "18 months of claim history" demo loses to a 15-second API call. There is no AWS API that backdates these.

**Source.** [SYNTHESIS.md §3.3](./SYNTHESIS.md), report 10.

**Why this is a Jungl3-specific issue.** For most AWS workloads, install-age visibility is a non-issue — the install is a new deployment of a real system. For Jungl3, where the install is *claiming to host 18 months of history*, the metadata contradicts the story.

**Triggers.**

- Any sufficiently technical reviewer calling AWS APIs directly.
- A sales demo where the reviewer uses their own AWS skills to inspect the account.

**Mitigation shape (from report 10, the "own what you can't hide" strategy).**

- Acknowledge install recency explicitly — in product copy, in a banner, in reviewer-notes documentation.
- Put realism entirely at the domain layer: simulate 18 months in DynamoDB and in the audit table, not in CloudWatch Logs or in Step Functions execution history.
- Use NHPP + copulas for realistic temporal distribution in the domain data.
- Tier 2 (seasonality + lifecycle correlations) is the recommended default. Tier 3 (thin 7–14-day log pre-warm) as an opt-in. Tier 4 (synthetic Step Functions histories) deferred past v1.

**Disposition.** Architecture-doc-shaped rather than ADR-shaped. Proposed future doc: `docs/architecture/forensic-posture.md`. Not drafted. Candidate for promotion to an architecture doc once the install strategy firms up.

---

## Summary: what these risks mean for the investor conversation

All eight risks name concrete AWS-platform or cost-model failure modes. Each has a named mitigation — no open research needed for any of them. Status distribution:

- **1 resolved** by a drafted ADR (R-C2-1 → ADR 0010).
- **4 with clear mitigations** tied to specific candidate ADRs still in the backlog (R-C2-2, R-C2-3, R-C2-4, R-C2-5 → Candidates B, C, E).
- **1 partially mitigated** (R-C2-6) with cross-link work still to do.
- **1 with mitigation at a candidate** (R-C2-7 → Candidate D).
- **1 architecture-doc-shaped** (R-C2-8) not yet written.

Talking point for an investor: every wall this cluster named has a named mitigation, and no mitigation is blocked by research — they're all blocked by drafting decisions, which is a tractable path.

See [`../../decisions/BACKLOG.md`](../../decisions/BACKLOG.md) for the cross-cluster candidate view.
