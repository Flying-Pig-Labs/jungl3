# Second deep-research cluster: synthesis and next direction

*Written 2026-04-22, same day the ten reports came back. Companion to [`findings.md`](../findings.md) from the first cluster. Read that first — this one assumes the ADRs 0005–0009 are in place and asks the follow-on questions.*

---

## 0. Preface: how to read this document

This is the synthesis of the 2026-04-22 deep-research cluster — ten Parallel.ai `ultra4x` reports totaling ~1,260 lines, targeted at the concrete unknowns that opened up once [`findings.md`](../findings.md) was ratified and ADRs [0005](../../decisions/0005-event-envelope-and-correlation-identifiers.md), [0006](../../decisions/0006-v1-domain-anchor-insurance-claims.md), [0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md), [0008](../../decisions/0008-workflows-are-state-machines.md), and [0009](../../decisions/0009-audit-trail-is-append-only-hash-chained.md) were written.

Raw material: [`results/01-*.md`](./results/) through [`results/10-*.md`](./results/). Prompts: [`prompts/`](./prompts/). The three prior synthesis documents ([`findings.md`](../findings.md), [`SYNTHESIS.md`](../deep-research-2026-04-21/SYNTHESIS.md), [`DECISIONS.md`](../deep-research-2026-04-21/DECISIONS.md)) remain authoritative for the first cluster.

I keep the same three voices from `findings.md`:

- **"Report N says X"** — claim from one of the ten reports, cited to file.
- **"My read"** or **"my stitch"** — my interpretation or assembly that no single report makes.
- **"Decided"** — a commitment. None appear in this document yet; this is pre-decision material.

I add one new voice for this pass:

- **"Gap exposed"** — a concrete way one of the five accepted ADRs will fail in practice if we build it naively. These are the most actionable findings in the cluster and the ones most likely to become ADR amendments or new ADRs.

If a section header says "Gap exposed," the implied question is: *what do we do about this before v1 ships?*

---

## 1. The one-paragraph framing

The first cluster was breadth — it mapped the space and established that the organizing failure mode is plausibility collapse. This cluster is depth. Every prompt was written knowing the ADRs were now load-bearing, and every prompt asked a variant of the same question: *where does this decision break when you try to implement it?* The answers cluster into two shapes. First: five of the ten reports surface specific, nameable walls inside the ADRs — the 15-minute Lambda hard cap versus the 1-hour CloudFormation timeout, the 14-day `PutLogEvents` lookback limit, the Firehose-to-S3 PUT-request cost cliff, Claude's lack of a seed parameter, Step Functions' 90-day execution history. None of these invalidate an ADR. Each of them requires a specific implementation choice that must be documented before we build, or the ADR silently fails. Second: four of the reports open territory we did not have enough material to write ADRs for before — seeder/reaper architecture, persona generation economics, forensic posture toward install-age metadata, and cost pre-estimation accuracy. These are now ADR-ready or nearly so.

---

## 2. Validation pass: what happened to each ADR

For each of ADR 0005–0009, I asked: did this cluster confirm it, refine it, or expose a gap? Ordered by how load-bearing each ADR is.

### 2.1 ADR 0005 — Event envelope and correlation IDs

**Validated.** Every report that touched events used the `{trace_id, case_id}` pair without friction. Report 09 ([`09-pc-regulated-cues-beyond-maker-checker.md`](./results/09-pc-regulated-cues-beyond-maker-checker.md)) specifically cites the pair as the foundation for the examiner-export package — `case_id` is the claim ID examiners sort by, `trace_id` is the operational chain they use to reconstruct what the system did.

**Refinement (minor).** Report 05 ([`05-claude-code-sdk-agent-patterns.md`](./results/05-claude-code-sdk-agent-patterns.md)) adds a third identifier to the correlation set: `tool_call_id`. When the admin agent summarizes a CloudWatch query, the SDK returns a `ToolResultBlock` with a stable `tool_call_id`, and the agent's claims must cite into that ID. My read: this does not belong *in* the event envelope. It belongs in the audit record for agent actions specifically — an audit entry for an `agent_invoked_tool` event should carry `{trace_id, case_id, tool_call_id}`. ADR 0005 is silent on this and should stay silent; it's an ADR 0009 concern, handled in §2.5.

**No gap exposed.** ADR 0005 is the most stable of the five.

### 2.2 ADR 0006 — v1 domain anchor: insurance claims

**Validated and deepened.** Two reports materially fill this in:

- Report 04 ([`04-pc-claims-event-distributions.md`](./results/04-pc-claims-event-distributions.md)) gives us defensible numbers for the seed: 5.2% annual auto collision frequency, 1.6% property water frequency, 44-day median property claim cycle time, 23.1% auto total-loss rate, 45% of property claims closing with zero payment, median 21 communications per auto claim. These are the parameters an insurance VP will notice are *right* in a 15-minute plausibility test.
- Report 09 ([`09-pc-regulated-cues-beyond-maker-checker.md`](./results/09-pc-regulated-cues-beyond-maker-checker.md)) catalogs the regulatory cues a former DOI examiner looks for: state-specific acknowledgment SLAs (CA 15 calendar days, TX 15 business days, FL 7 calendar days, NY 15 business days), append-only reserve ledgers, segregated SIU cases, large-loss reinsurance notifications at $250K thresholds, MCAS-style examiner exports. Almost none of this was in ADR 0006.

**Gap exposed:** ADR 0006 named the seven services and the two stubs, but it did not name the *regulatory surface* that Jungl3's insurance domain must exhibit to pass a 15-minute plausibility test. A demo with no jurisdiction field on claims, no reserve ledger, no SIU referral, and no state-aware SLA timer is not credible insurance — it's "a claims-shaped app." My read: ADR 0006 needs an amendment or a sibling ADR that pins the minimum regulatory-cue surface for v1.

**Candidate follow-on ADR** (§4): "Regulatory surface for v1 insurance claims."

### 2.3 ADR 0007 — v1 cost profile and LLM metering

**Validated for the infra ceiling.** Report 01 ([`01-step-functions-regulated-workflows.md`](./results/01-step-functions-regulated-workflows.md)) confirms $100/month is achievable for Low and Medium workloads (1K–50K events/day) across the full audit and observability pipeline. Report 02 ([`02-dynamodb-hash-chained-audit.md`](./results/02-dynamodb-hash-chained-audit.md)) confirms DynamoDB On-Demand is the right v1 default and that QLDB, while cheaper, should remain deferred.

**Gap exposed #1 — the Firehose PUT-request cliff.** Report 02 finds that at High workloads (500K events/day), the DynamoDB audit stack costs ~$187/month *purely because S3 PUT requests from unbuffered Firehose delivery cost ~$150/month on their own*. Mitigation: configure Firehose with 64 MB / 15-minute buffer hints. Without buffering, the audit pipeline breaches the $100 ceiling on its own. ADR 0007 does not mention Firehose buffering. It should.

**Gap exposed #2 — CloudWatch retention silently eats the ceiling.** Report 01 finds that CloudWatch Logs ingestion is $0.50/GB and storage compounds continuously if retention is left at the default "Never Expire." At 5 GB/month ingest the Medium-scenario infra cost is ~$49/month over 24 months; at 20 GB/month it breaches the ceiling outright. ADR 0007 specifies "7-day log retention" but does not mention the S3 export + Glacier Deep Archive lifecycle needed to satisfy enterprise audit expectations without the compounded CloudWatch bill. This is an ADR 0007 amendment, or a new ADR pinning the retention tiering.

**Gap exposed #3 — LLM pre-estimation is achievable but non-trivial.** Report 06 ([`06-llm-cost-estimation-accuracy.md`](./results/06-llm-cost-estimation-accuracy.md)) is the strongest report in the cluster. It says: ±10% pre-estimation accuracy is reachable, but only with the exact Anthropic formula (`total_input = cache_read + cache_write + uncached_input`), hardcoded per-tool token taxes (+346 for system, +245 for bash, +700 for text_editor, +466–499 for computer-use), pessimistic cache-miss assumptions, and a per-turn envelope declared upfront by Step Functions planners. ADR 0007 says "pre-estimation + debit + reconcile" but does not pin the formula. This is implementation detail that should live in the `llm-gateway` service design, not in the ADR — but the design doc must exist before we build.

**Candidate follow-on ADR** (§4): "Retention tiering — CloudWatch → S3 → Glacier Deep Archive." Narrower than amending ADR 0007.

### 2.4 ADR 0008 — Workflows are state machines

**Validated.** Every report that named workflow orchestration used Step Functions. Report 09 makes the state-machine choice load-bearing for state-specific SLA timers: a `Wait` state with a `TimestampPath` reading `$.jurisdiction` is exactly the shape ADR 0008 enables.

**Refinement.** Report 03 ([`03-claims-settlement-maker-checker.md`](./results/03-claims-settlement-maker-checker.md)) proposes a specific canonical workflow: settlement approvals above $25,000, demoed with a $47,500 claim that gets rejected (pre-existing damage) and revised down to $32,000 before approval. This is the best canonical workflow candidate I've seen — it has real stakes, a forced escalation path, an iterative rejection loop, and a plausible reason code. My read: this should become the first Step Functions state machine we build.

**Gap exposed — Step Functions history retention is 90 days, hard.** Report 01 finds that Standard workflows retain execution history for exactly 90 days; Express workflows don't retain it at all. Enterprise examiners expect multi-year audit availability. Mitigation: configure every state machine to log execution history to CloudWatch Logs, then S3-export + Glacier per the retention tiering above. This interacts with ADR 0008 and the retention-tiering candidate ADR. ADR 0008 should reference this by amendment or cross-link.

**Gap exposed — seeding in-flight workflows is not natively supported.** Report 07 ([`07-cloudformation-seeder-reaper.md`](./results/07-cloudformation-seeder-reaper.md)) finds that Step Functions does not support starting an execution at a mid-workflow state. The clean pattern is: design workflows with `.waitForTaskToken` callback tasks, start executions from the beginning with deterministic inputs, then use `SendTaskSuccess` / `SendTaskFailure` to fast-forward them to the target state. This shapes how we author ADR 0008-compliant workflows from day one — they must be callback-token-shaped, not inline-synchronous, or seeding the 60 in-flight claims becomes impossible. This is a *constraint on ADR 0008 state machine design*, not a gap in the ADR itself.

### 2.5 ADR 0009 — Audit trail is append-only hash-chained

**Validated.** Reports 02, 03, and 09 all treat the hash-chained DynamoDB ledger as the foundation. Report 09 extends it to reserve movements specifically ("every reserve adjustment is a distinct item with `old_value`, `new_value`, `reason_code`, `authority_level`, `changed_by`, `prev_hash`"). This is exactly the shape ADR 0009 specified.

**Gap exposed #1 — S3 ETags do not hash multipart uploads as plain MD5.** Report 03 finds that if we rely on S3 ETags to prove document integrity (estimates, photos), the integrity claim silently fails for any document larger than the multipart threshold — the ETag becomes a composite hash, not a standard MD5. Mitigation: enforce application-layer SHA-256 hashing of all supporting documents at upload time, embed the hash in the CloudEvents extension attributes, and chain through the audit record. ADR 0009 does not mention document-level hashing; it should be amended.

**Gap exposed #2 — write-order vs. event-time chaining at install time.** Report 10 ([`10-synthetic-timestamp-distributions.md`](./results/10-synthetic-timestamp-distributions.md)) raises a subtle point: at install time, we backfill 18 months of domain events into the audit table in write-order over a few minutes. If the chain is built on `event_time` (the simulated historical timestamp), it breaks because events arrive out of their simulated order. If the chain is built on `write_time` (actual write sequence), it stays cryptographically sound but requires the ADR to explicitly say so. ADR 0009 is ambiguous. My read: chain on write sequence, hash `event_time` inside the payload. This is a one-line amendment to ADR 0009.

**Gap exposed #3 — the audit table has no reserve ledger or agent-tool-use variant.** Report 05 wants `tool_call_id` in agent-action audit records. Report 09 wants `old_value / new_value / reason_code / authority_level` in reserve-change audit records. ADR 0009 defined one generic envelope. My read: the generic envelope stays, but specific event types need documented extension attribute schemas. This is documentation-in-architecture-doc territory, not new-ADR territory.

**Candidate follow-on ADR** (§4): "Document integrity — application-layer SHA-256 hashing of supporting documents."

---

## 3. Net-new territory: where this cluster broke fresh ground

Four reports opened territory that was under-explored in the first cluster. Each is now ADR-shaped or close to it.

### 3.1 Seeder / reaper architecture

Source: Report 07 ([`07-cloudformation-seeder-reaper.md`](./results/07-cloudformation-seeder-reaper.md)). This is the single most actionable report in the cluster. It says: our <10-minute install and <5-minute teardown SLAs are not free; they have specific failure modes that will hit us on day one of building.

The report's headline claims:

- **The 15-min-Lambda / 1-hour-CloudFormation trap.** A synchronous Lambda-backed custom resource that runs out of time at 15 minutes, without sending a `FAILED` signal to the pre-signed S3 `ResponseURL`, causes CloudFormation to hang for 45 more minutes before rolling back. This destroys the "time to real" thesis the first time it fires in a customer's account. Mitigation: async Step Functions handoff from the custom resource Lambda, or the CDK Provider Framework's `isCompleteHandler` polling pattern.
- **Deterministic seeding requires per-entity, not global, seeds.** A global `Faker.seed(1234)` breaks the moment entity insertion order changes due to concurrency. Derive every entity's attributes from `HMAC-SHA256(global_seed || entity_id)`. This pattern also appears in Report 08's persona generation.
- **Fast-forwarding in-flight workflows is done via `SendTaskSuccess` against `.waitForTaskToken` tasks.** This is a constraint on how we author the ADR 0008 state machines, not a runtime pattern. If we author a synchronous state machine and then try to seed in-flight instances later, we're stuck.
- **The Reaper has a concrete orphan checklist.** CloudFormation will not delete non-empty S3 buckets, running Step Functions executions, or Lambda-created CloudWatch Log Groups. A dedicated Reaper Lambda on stack `Delete` must batch-`DeleteObjects` (1,000 per call), `StopExecution` all running state machine instances, and `DeleteLogGroup` on all `/aws/lambda/jungle3-*` groups. Skip any of these and teardown breaches the 5-minute SLA or fails outright.
- **ALBs and VPC Lambdas are incompatible with the SLAs.** ALB provisioning eats minutes; VPC-attached Lambdas eat up to 20 minutes on ENI detachment at teardown. Use Lambda Function URLs or API Gateway; keep Lambdas out of the VPC unless strictly required.

**My read:** this is ADR-shaped, and it's the next highest-priority ADR to draft. Call it "Seeder and Reaper patterns for <10m install and <5m teardown." It would pin: the async Step Functions seeder pattern, the HMAC-SHA256 per-entity seed derivation, the Reaper's orphan-eradication responsibilities, and the architectural ban on ALBs and VPC Lambdas in v1.

### 3.2 Persona and artifact generation economics

Source: Report 08 ([`08-persona-writing-style-generation.md`](./results/08-persona-writing-style-generation.md)). This report kills a comfortable assumption: that we can generate persona writing styles and claim-note text *live at install time* via Claude.

The report's headline claims:

- **Claude has no seed parameter.** Even at `temperature=0`, floating-point and GPU-parallelism variation mean install-time generation is inherently non-deterministic. Two customer installs running the same CloudFormation template would generate different seed corpora. This breaks the cryptographic audit hashes in ADR 0009 — the install-to-install hash of the seed state would differ.
- **Live Sonnet generation of the 7.5M-token seed corpus costs ~$154**, against a $50/month LLM budget. Live generation is structurally incompatible with ADR 0007.
- **The solution is pre-generation as a shipped artifact.** Generate the canonical seed corpus once during the build-the-Marketplace-listing phase, ship the JSON bundle via S3 / AMI, and pay $0 at install time with byte-for-byte determinism.
- **Live LLM style generation without deterministic post-processing produces "bureaucratese" — uniformly polished prose that fails a blind read.** The hybrid pattern: LLM for semantics, HMAC-SHA256-seeded Python post-processor for abbreviations, fragments, and sparse typos (0–1%). The post-processor is stateless and deterministic by construction.
- **Scraping FEMA or PACER datasets for style exemplars is legally toxic** for an AWS Marketplace product. Commission 24 SME-authored synthetic exemplars (8 personas × 3 each) under work-for-hire.

**My read:** ADR-shaped. Call it "Seed-data generation: pre-generated, shipped as an immutable artifact." It pins the build-time-vs-install-time decision, the determinism guarantee, the legal posture on exemplar sourcing, and the hybrid LLM + deterministic-post-processor pattern. This ADR would interact with ADR 0007 (install-time LLM cost = $0) and ADR 0009 (install seeds chain cleanly because they're byte-stable).

### 3.3 Forensic posture toward install-age metadata

Source: Report 10 ([`10-synthetic-timestamp-distributions.md`](./results/10-synthetic-timestamp-distributions.md)). This report forces a posture we had been avoiding: what do we do about the fact that AWS itself narcs on the age of every install?

The report's headline claims:

- **Install age is trivially visible.** CloudFormation's `DescribeStacks.CreationTime`, DynamoDB's `DescribeTable.CreationDateTime`, CloudWatch Logs' `DescribeLogGroups.creationTime`, IAM's `GetRole.CreateDate`, and every Step Functions `DescribeExecution.startDate` will show minutes-old timestamps on a fresh install. There is no AWS API to backdate any of these.
- **`PutLogEvents` caps backdating at 14 days.** We cannot pre-warm 18 months of CloudWatch logs even if we wanted to. 14 days is the ceiling, and `@ingestionTime` will still cluster at install.
- **The winning strategy is "own what you can't hide."** Acknowledge install recency in product copy and in a banner. Put realism entirely at the domain layer — simulate 18 months of claim history, reserve movements, communications, and workflow state in DynamoDB and the audit table, not in CloudWatch Logs or in Step Functions execution history.
- **Domain-layer realism needs NHPP + copulas + write-order hash chaining.** Non-Homogeneous Poisson Process (NHPP) with diurnal/weekly/holiday intensity terms for arrival times. Copulas for correlated lifecycle durations (claims that assess slow also approve slow). Hash-chain on write sequence, not event time.
- **Recommended default: Tier 2 (seasonality + lifecycle correlations).** Tier 3 (thin 7–14 day log pre-warm) as a toggle for security-review mode. Tier 4 (synthetic Step Functions execution histories) deferred past v1.

**My read:** this is *posture*, and it's worth writing down as architecture even though it may not become an ADR. It's a stance that shapes UX copy, reviewer-notes documentation, and what the seeder actually builds. Candidate: architecture doc at `docs/architecture/forensic-posture.md`.

### 3.4 Agent implementation patterns — Claude Code SDK specifics

Source: Report 05 ([`05-claude-code-sdk-agent-patterns.md`](./results/05-claude-code-sdk-agent-patterns.md)). The first cluster chose "LLM agent over tools" for the admin UI. This report supplies the implementation patterns.

The report's headline claims:

- **Use in-process MCP servers via `create_sdk_mcp_server`.** This eliminates subprocess and IPC overhead — critical for Lambda deployment. Tools are just Python functions registered at SDK init.
- **Structured output with a mandatory `citations` array** mapping every factual claim to the `tool_call_id` it came from. A deterministic Python post-processor verifies each cited substring exists in the referenced tool's output. Claims that don't verify are dropped.
- **Known SDK failure mode (Issue #425): message-queue backpressure causes the model to hallucinate `<function_calls>` blocks as plain text instead of executing actual tools.** Mitigation: aggressively drain the message stream and keep the control protocol unblocked.
- **Circuit-breaker pattern via `PreToolUse` hooks.** Track invocations per tool per session; deny if the same tool is called 3+ consecutive times without progress. Prevents infinite retry loops.
- **Prompt caching cuts heavy-query costs from $0.0279 to $0.0225.** Mandatory to maximize the $50/month budget.
- **Degraded mode via ONNX MiniLM INT8 intent classifier (~22 MB, <30 ms).** When the LLM budget is exhausted, fall back to deterministic tool routing rather than breaking the admin UI entirely.

**My read:** these are implementation patterns, not decisions. They belong in an `llm-gateway` service design doc and an `agents/admin/` service README when we build those. Not ADR-shaped.

---

## 4. Candidate follow-on ADRs

Ordered by readiness — how much more design work each needs before it's a clean ADR.

| # | Candidate title | Readiness | Depends on | Origin |
|---|---|---|---|---|
| A | Seeder and Reaper patterns for <10m install and <5m teardown | **High** — ready to draft | ADR 0008 (`.waitForTaskToken` state-machine shape) | Report 07 |
| B | Seed-data generation: pre-generated, shipped as immutable artifact | **High** — ready to draft | ADR 0007, ADR 0009 | Report 08 |
| C | Retention tiering: CloudWatch 7-day → S3 Standard 30-day → Glacier Deep Archive | **High** — ready to draft | ADR 0007 | Reports 01, 02 |
| D | Document integrity: application-layer SHA-256 hashing of supporting documents | **Medium** — needs decision on what counts as a "supporting document" | ADR 0009 | Report 03 |
| E | Regulatory surface for v1 insurance claims (state-aware SLAs, reserve ledger, SIU segregation, reinsurance notify, examiner export) | **Medium** — needs scoping pass (how many of the cues are minimum-viable?) | ADR 0006, ADR 0008, ADR 0009 | Report 09 |
| F | Canonical v1 maker-checker workflow: $47,500 settlement with forced revision | **Medium** — this was already an open question (old CLAUDE.md §11 #16) | ADR 0008 | Report 03 |
| G | ADR 0009 amendments: chain-on-write-sequence, document hashes, reserve-change and agent-tool-use extension schemas | **Low** — better as an amendment PR than a new ADR | ADR 0009 | Reports 03, 05, 09, 10 |

My recommendation for ordering if we do them: **A, C, B, E, F, D, G.** Rationale: A and C unblock the concrete build path for install/teardown and retention — both are visible failure modes the first time we deploy. B is close behind because seed-data generation economics block the `marketplace-listing/` build pipeline. E and F together define the v1 domain surface that a reviewer actually sees. D and G are refinements that tighten existing ADRs.

---

## 5. New open questions (for CLAUDE.md §11 candidacy)

Questions this cluster surfaced that do *not* have a clear answer yet, and that I should not invent one for:

1. **What counts as a "supporting document" in v1?** Candidate D needs a scope. Estimates and photos, clearly. Adjuster notes? Email bodies? Each answer changes the hashing-pipeline cost profile.
2. **Do we ship state-specific SLA timers in v1, or a single generic SLA with a `jurisdiction` field that doesn't drive behavior?** Report 09 wants the former; ADR 0006 implied the latter by omission. The former is materially more work and much more credible to an examiner.
3. **What's the default install's jurisdiction?** If we seed with CA, FL, TX, and NY mixed, the demo is richer but the story is harder to tell. If we seed with one state, the story is clean but a multi-state reviewer notices.
4. **Is the "security review mode" toggle (Report 10's Tier 3 thin log pre-warm) an install-time parameter, a post-install switch, or an entirely separate install path?** Each answer has different CloudFormation and documentation implications.
5. **How does the `llm-gateway` handle mid-execution budget exhaustion inside a running Step Functions state machine?** ADR 0007 says "hard cutoff with graceful degradation." Report 06 implies the state machine itself must handle an `InsufficientFunds` abort signal without plausibility collapse. The mechanism is not specified.
6. **Do we commission SME exemplars as part of the Marketplace listing build, or do we gate v1 on that commission happening?** Report 08 says commission; but the 24-exemplar library does not yet exist, and the listing build pipeline cannot produce the shipped seed artifact without it.
7. **Does the reserve ledger (Report 09) live in `jungle3-audit` directly, or in a dedicated `reserve-ledger` table that writes through to `jungle3-audit`?** The former is simpler; the latter has cleaner access patterns for examiner export.

I would promote questions #2, #5, and #6 to CLAUDE.md §11 as-is. #1, #3, #4, and #7 should wait until we start drafting candidates D or E — they'll resolve in those drafts.

---

## 6. The five "will hit this wall" risks

Concrete failure modes this cluster named, ranked by how early they will hit us if unaddressed:

1. **Synchronous Lambda custom resource times out at 15 minutes and hangs CloudFormation for 45 more.** Hits the first time we try to seed more than ~10K rows. Mitigation: Candidate A. Report 07.
2. **Kinesis Firehose writes individual audit events as one S3 PUT each, and S3 PUT-request charges blow through the $100 ceiling.** Hits whenever audit volume exceeds ~100K events/day — before we have real customers, it'll hit in load testing. Mitigation: 64 MB / 15-min Firehose buffer hints. Report 02.
3. **Live LLM generation of the seed corpus at install time costs ~$154 against a $50 budget and produces non-deterministic output.** Hits the first time we try to ship a Marketplace listing that uses Claude at install. Mitigation: Candidate B, pre-generated artifact. Report 08.
4. **CloudWatch log retention left at default causes infra cost to compound continuously past $100/month.** Hits in month 3 or 4 of any real install. Mitigation: Candidate C, 7-day retention + S3 export + Glacier lifecycle. Report 01.
5. **A Marketplace reviewer or insurance VP opens the admin UI and sees generic CRUD workflows with no jurisdiction field, no reserve ledger, no SIU referral.** Hits the first serious plausibility test. Mitigation: Candidate E, regulatory surface. Report 09.

Every one of these is a concrete AWS limit or a concrete cost-model detail. None require invention; each requires a decision.

---

## 7. What I would do next, in order

1. **Draft Candidate A** (Seeder / Reaper). Highest load-bearing, ready to write, one report to draw from. ~1 hour.
2. **Draft Candidate C** (Retention tiering). Short ADR, high-confidence, unblocks ADR 0007's rougher edges. ~45 min.
3. **Draft Candidate B** (Pre-generated seed artifact). Interacts with ADR 0007 and 0009; needs a careful cross-link pass. ~1 hour.
4. **Amendment PR to ADR 0009** folding in Candidate G (chain-on-write, document hash, extension schemas). Not a new ADR; a supersession of specific sections. ~45 min.
5. **Scope conversation on Candidate E** (Regulatory surface) before drafting. Several open sub-questions in §5 need to settle first.
6. **Defer Candidate D and F** until we have a design partner or a real domain expert on the call. Both benefit from a real voice in the room rather than a synthesized one.

After that, we probably don't need another research cluster for a while. The next unknowns are the ones only a design partner can answer.

---

## Ledger

Ten reports, ~1,260 lines, zero contradictions across reports on any material claim. Nine of ten reports cross-referenced the specific ADRs they pressure-tested. Five concrete gaps surfaced in the five accepted ADRs, all narrow enough to close with amendments or tightly-scoped new ADRs. Four net-new territories opened; two are ADR-ready now, one is architecture-doc-ready, one is implementation-design-doc-ready. Seven new open questions; three of those belong in CLAUDE.md §11.

No fabrication. Every numeric or mechanical claim in this document traces to a specific report file in [`results/`](./results/).
