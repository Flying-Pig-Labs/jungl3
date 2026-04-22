# Deep research cluster: findings and v1 direction

*Second revision. Written 2026-04-21, revised same day after a review pass from the founder.*

---

## 0. Preface: how to read this document

This document does two things. First, it tells you what the 2026-04-21 twelve-report deep-research cluster actually said when read as a single argument instead of twelve parallel ones. Second — new in this revision — it records the direction that came out of reviewing that synthesis: what's decided, what's still open, and what the next build steps are.

The underlying research files are unchanged and still authoritative as "what the external analysis claimed":

- [`SYNTHESIS.md`](./SYNTHESIS.md), [`EXECUTIVE_SUMMARIES.md`](./EXECUTIVE_SUMMARIES.md), [`DECISIONS.md`](./DECISIONS.md) — the structured synthesis artifacts.
- [`deep-research-2026-04-21/results/`](./deep-research-2026-04-21/results/) — the raw 7,200-line report cluster.

This document is the bridge between those reads and action. It is **not** repo policy until the ADRs referenced in §9 are written and accepted. But it is further along than "research" — several things that were open yesterday are now direction, and the document distinguishes which is which at every turn.

I use three distinct voices throughout:

- **"Report N argues X"** — claim from the research cluster, cited to its source report so you can check.
- **"My read"** or **"my stitch"** — my interpretation or assembly that no single report makes. I'll call this out every time.
- **"Decided"** — a commitment made during review, with a date. These are the direction-setting calls. Not ADR-ratified yet, but ratified enough to plan against.

If a section starts feeling like it's arguing with you, check whether it says "decided" at the top. If so, the argument is over and the section is archival — explaining the reasoning that led to the decision, not re-opening it.

---

## 1. What's decided now (the short version)

During the review pass on 2026-04-21, the following moved from open-question to direction. Each is written out in detail later in the document; this is the quick read.

**Domain anchor: insurance claims processing, claims-only.** No underwriting in v1. Narrower than either option originally proposed — reports 02, 10, and 11's assumptions mostly port over directly; report 02's "claims-adjacent retail" framing is set aside for v1 and available as a future pack. Rationale in §6.1.

**Eight research convergences accepted as direction.** Dual correlation IDs (`trace_id` + `case_id`), CloudEvents v1.0 envelopes with reverse-DNS typing, stateful state-machine workflows, maker-checker approvals enforced at the backend, the MVR numeric floors (4–7 services / 3+ personas / 10–15 event types / 2+ stubs / 3–5 background jobs), declarative-first artifact design, hybrid deterministic-golden-path + stochastic-background simulation loop, and the customer-in-account constraint. Details and teach-ins in §5.

**Cost ceiling: $100/month infrastructure, separately metered LLM budget on top.** A default $50/month LLM meter ships alongside, hard cutoff at exhaustion, visibly labeled as a distinct line item. Total install under heavy use is $150/month, under light use is $100/month. This is tighter than report 08's $110–150 default-realism target — achievable by dropping OpenSearch entirely and leaning on serverless idle floors. Rationale in §6.3.

**Observability stack: CloudWatch Logs + CloudWatch Logs Insights + X-Ray.** No OpenSearch. No OTLP export by default (opt-in config flag only). Simpler to set up, cheaper to run, familiar to operators. Rationale in §6.3.

**LLM strategy: prominent, via Claude Code SDK, constrained to deterministic tool use.** Agents do not generate claims about system state; they invoke tools (CloudWatch Logs Insights queries, X-Ray trace lookups, DynamoDB reads) and summarize what the tools returned, with citations back to raw output. This preserves the audit-trail integrity that report 11 argued for while delivering the LLM-powered admin experience that replaces report 09's dashboard-heavy approach. Concrete sketch in §7.

**Lifecycle: ephemeral-capable with fresh seed per install.** Target <10 min install, <5 min teardown. Fresh seed means "18 months of history" is generated deterministically at install time rather than persisted across installs. Trades some plausibility (timestamps are suspicious on close inspection) for a development and demo workflow that lets you spin up, observe, and tear down freely. Mitigations in §8.

**Microservice count: 7.** Specifically enumerated in §6.5 against the insurance-claims domain. My call; within report 03's 4–7 sweet spot and report 01's 8–12 range. Below 10 to stay under the $100 ceiling.

**What's still open.** The event envelope ADR (convergence §5.1 — uncontested across five reports; this is the first ADR I'll draft, in a separate commit). The specific maker-checker workflow (depends on which claims workflow becomes canonical — depends on first design-partner conversation). The LLM budget enforcement mechanism (sketched in §7, needs a real design doc).

---

## 2. The organizing failure mode

Ten of the twelve reports name the same failure mode, usually in their first or second paragraph. They give it different names — "plausibility collapse," "the illusion shattering," "immediately reveals itself as a passive demo" — but it's the same thing: *the moment a curious user realizes they are looking at a toy and not a working enterprise system.* Once that moment happens, nothing downstream recovers. The demo is over. The hackathon team stops taking it seriously. The buyer decides it's a novelty.

This is the organizing claim of the entire research sweep. It's also, when you internalize it, a weirdly useful filter for everything else, because it reframes every design question from "is this technically correct?" to "does this survive a curious person looking closely for thirty seconds?"

Three examples of how that filter reshapes a question:

- **Synthetic data.** The technically correct answer is "generate plausible distributions of rows." The plausibility-collapse answer is "make sure the timestamps across services tell a consistent story, because the first thing a curious person does is sort by `created_at` and look for things that should correlate and don't." These produce very different data layers. Report 04 takes the second answer.
- **Microservice count.** The technically correct answer is "however many the domain requires." The plausibility-collapse answer is "enough that there's visible inter-service traffic, few enough that you can seed all of them with consistent state." Report 03 lands at 4–7 on exactly this reasoning.
- **Admin UI.** The technically correct answer is "CloudWatch, X-Ray, logs." The plausibility-collapse answer is "an operator needs to pick a case ID and trace it end-to-end in thirty seconds — and if they can't, it's over." Report 09 is built on that observation. Our v1 answer (LLM agent with deterministic tools) is a reframing of the *mechanism* that keeps the same answer to the *user question*.

Almost every convergence across the reports, when you trace it, is a specific mitigation for plausibility collapse. Everything in §5 should be read in that light.

---

## 3. What's decided vs. what the reports said

Because this document is both a research synthesis and a decision record, it's worth being explicit about where the two diverge. These are the places where the direction departs from, narrows, or reframes the research:

| Topic | What the reports said | What was decided |
|---|---|---|
| Domain | Claims-adjacent family (02 #1) or insurance-proper (02 #2, 10/11 assumption) | Insurance claims processing, **no underwriting** |
| Admin UI | Build three dashboards on Fargate (09) | LLM agent over deterministic CloudWatch/X-Ray tools |
| Cost ceiling | $110–150/mo default-realism (08) | $100/mo infra, separate $50/mo LLM meter |
| Observability | Multiple proposals (CW+X-Ray / OpenSearch / OTLP), no single stack | CloudWatch + Logs Insights + X-Ray only |
| LLMs in v1 | Bounded, gated, optional (04/10/11 consensus) | Prominent, via Claude Code SDK, constrained to tool use |
| Lifecycle | Assumed persistent (10: aged history as core plausibility mechanism) | Ephemeral-capable with fresh deterministic seed |
| Microservice count | 4–7 (03) vs 8–12 (01) | 7, specifically enumerated |

Everything else in the reports ports directly. The convergences in §5 are accepted without modification.

---

## 4. What the reports agreed on: the eight convergences

These are the points where at least three reports, working independently on different questions, arrived at the same answer. Ordered by how much downstream work they foreclose. Each is now **accepted as direction** and listed here in archival form — these are the commitments, with the reasoning that supports them.

Where a concept is likely unfamiliar, I teach it from zero inside the section rather than assuming you've seen it before.

### 5.1 Every business event and every log line carries two IDs: `trace_id` and `case_id`

This is the strongest cross-report convergence. Reports 05, 09, 10, 11, and 12 all arrive here independently. The reasoning is the same every time: operational observability (what happened in the distributed system) and business observability (what happened to *this specific claim*) are different questions, and one ID can't answer both.

**The two IDs, plainly:**

- `trace_id` is the W3C Trace Context identifier — the thing that propagates via the `traceparent` HTTP header and threads through OpenTelemetry / AWS X-Ray. It tells you which spans belong to which request across service hops. It's a hex string. It's machine-useful and human-hostile — you can't eyeball one.
- `case_id` is the business-domain identifier — for insurance claims, something like `CLM-2026-04-002137`. It lives at the application layer, it's human-readable, and it's what an adjuster or auditor actually wants to filter on when they ask "what happened to this claim?"

**What the commitment means in practice:**

- Both IDs propagate through every async hop — across SQS messages (in message attributes), Step Functions executions (as input/output state), EventBridge events (in the envelope), scheduled jobs (in the triggering event), and stub callbacks.
- Every log line emitted by any service includes both IDs as structured fields.
- Every entry in the audit trail includes both.
- Every CloudEvent envelope (see §5.2) carries both in its extensions.

**Why it's a bigger deal than it looks.** The admin UI in §7 is possible because of this — "show me everything that ever touched case CLM-2026-04-002137" becomes a single CloudWatch Logs Insights query if `case_id` is on every log line. If it's *not*, you end up reconstructing the case history from distributed traces, which is archaeology, not observability. Report 09 explicitly names this as the make-or-break requirement for the per-case timeline view.

**Cost of being wrong.** High. This convention has to be baked into the first service written, the first event envelope, the first log format. Retrofitting it after the fact means rewriting every log call and every event emitter in the system.

**Status:** Accepted. First ADR I'll draft (see §9). Not blocked on anything.

### 5.2 The event envelope is CloudEvents v1.0, with reverse-DNS typing

Five reports (05, 09, 10, 11, 12) assume this without arguing about it.

**Teach-in: what CloudEvents is and why this matters.**

CloudEvents is a [CNCF specification](https://cloudevents.io/) for a standard event envelope — the metadata wrapper around your actual event payload. It defines a small set of required fields (`id`, `source`, `specversion`, `type`) and a convention for optional extensions. It's deliberately boring; that's its virtue.

An event in CloudEvents v1.0 looks like:

```json
{
  "specversion": "1.0",
  "type": "com.jungle3.claims.claim.submitted",
  "source": "/services/claim-intake",
  "id": "evt-01HX7K2J4M9PQV3R5T8B2NX4W6",
  "time": "2026-04-21T14:03:22.417Z",
  "subject": "CLM-2026-04-002137",
  "datacontenttype": "application/json",
  "traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  "caseid": "CLM-2026-04-002137",
  "data": { "claimantId": "...", "policyNumber": "...", ... }
}
```

**Why this specifically, and not a custom envelope:**

- AWS EventBridge has native CloudEvents support — you don't have to translate in and out.
- Every library you'd use (AWS SDKs, OpenTelemetry, most log aggregators) recognizes the shape.
- Customers auditing the system can search "CloudEvents v1.0" and know what they're looking at, rather than learning a Jungle3-specific schema.
- The alternative is NIH syndrome: invent your own envelope, spend engineering effort on a problem that was already solved, and make every downstream consumer have to learn it.

**The reverse-DNS typing convention.** Event types follow the pattern `<reverse-dns-namespace>.<domain>.<entity>.<verb_past_tense>`:

- `com.jungle3.claims.claim.submitted`
- `com.jungle3.claims.claim.assigned`
- `com.jungle3.claims.claim.approved`
- `com.jungle3.claims.claim.rejected`
- `com.jungle3.claims.payment.issued`

**Why reverse-DNS.** It namespaces cleanly against future domain packs (a retail pack would emit `com.jungle3.retail.return.requested` without collision risk), it's the Java/JVM convention everyone already knows, and it sorts hierarchically, so log queries like "all events in the claims domain" become a simple prefix match.

**Constrained verb vocabulary.** The verb set is deliberately small: `created`, `updated`, `deleted`, `assigned`, `approved`, `rejected`, `escalated`, `completed`, `failed`. This avoids the classic event-naming drift where one service emits `claim.opened` and another emits `claim.started` and a third emits `claim.initiated` for the same transition. One verb per transition, chosen from the canonical list.

**Status:** Accepted. Part of the first ADR (§9).

### 5.3 Workflows are stateful state machines, not chains of Lambdas

Report 05 is the cleanest articulation of this, but reports 06, 10, and 11 assume it. A "business process" means an AWS Step Functions state machine (or equivalent orchestrator) where the state is inspectable, transitions are named, retries are declarative, and failures route to dead-letter queues (DLQs).

The anti-pattern the reports repeatedly warn against is *event-chain architecture* — Lambda A writes to SQS which triggers Lambda B which writes to SQS which triggers Lambda C — because the workflow is then *implicit in the topology* and can only be reconstructed by reading the code. For plausibility, the workflow has to be an *artifact* someone can look at, not an emergent property of the deployment.

**Downstream effect on the admin UI (§7):** if workflows are real state machines, the per-case timeline is basically "render the execution history," which is a tractable engineering problem — Step Functions gives you the history for free via `GetExecutionHistory`. If workflows are implicit in topology, the per-case timeline is archaeology across traces. This is why the LLM-agent-over-deterministic-tools approach works: one of the tools is "query Step Functions execution history for case X."

**Status:** Accepted.

### 5.4 Maker-checker (four-eyes) is the single highest-signal regulated cue

Report 11 is emphatic about this, and reports 01 and 10 echo it. If Jungle3 needs one thing to make the environment *feel* like a real regulated enterprise, it's maker-checker. This is the concept you said you wanted taught; here it is from zero.

**What maker-checker is.**

Maker-checker (also called "four-eyes") is a compliance pattern where at least two distinct people are required to complete a high-stakes action. One person — the *maker* — proposes the change. A second person — the *checker* — reviews the proposal and either approves or rejects it. The change does not take effect until the checker has approved.

A concrete insurance-claims example:

1. **Adjuster Sarah** reviews claim `CLM-2026-04-002137` and proposes a settlement of $47,500. She clicks "submit for approval." The claim is now in state `pending_approval`, and a task appears in the queue of every adjuster at her seniority level or higher.
2. **Supervisor Marcus** opens the task, reviews Sarah's proposal, the claim file, and the photographic evidence. He sees that Sarah correctly applied the policy terms but notices the photos show pre-existing damage not covered under the claim. He rejects the proposal with a note and returns it to Sarah.
3. **Sarah** revises the settlement to $32,000 (excluding the pre-existing damage), adds a note, and resubmits.
4. **Marcus** approves. The claim transitions to state `approved`, an event is emitted, and the payment service is authorized to issue the settlement.

**Why "backend-enforced" specifically matters.** The critical detail — and the reason report 11 is emphatic about this — is that the approval has to be enforced *at the state machine*, not at the UI. A pattern you see often in poorly-built compliance systems is: the UI has an "approve" button that only appears for approvers, but the API endpoint that advances the workflow is callable by anyone. In a real regulated enterprise, that's a finding on the next audit. The state machine itself refuses to transition from `pending_approval` to `approved` unless the API call is authenticated as a user with the checker role, and that user is *different* from the user who put the claim in `pending_approval`. Bypassing the UI does not help.

**Why this is the highest-signal cue.** Every adjacent convention — audit trails, versioning, append-only logs, role-based access — can be faked superficially. Maker-checker can't, because it requires *two separate, seeded personas* to complete a workflow. When a reviewer walks through the system and sees that claim `CLM-...-002137` was proposed by Sarah Chen and approved by Marcus Rodriguez on separate timestamps with distinct authentication events, that's a concrete, verifiable piece of realism. It's the one thing in the regulated-feel toolkit that requires the system to have *actual* organizational depth to fake convincingly.

**What Jungle3 will do.** At least one canonical workflow in the v1 pack has maker-checker enforced at the Step Functions state-machine level. The specific workflow (claim settlement approval, policy exception approval, or high-value payment issuance) depends on which canonical workflow comes out of the first design-partner conversation.

**Status:** Accepted. Specific workflow TBD.

### 5.5 The numbers for "minimum viable realism" are tighter than you'd guess

Report 03 gives the floor. Below these numbers the system feels like a demo; at or above them it starts to feel alive.

| Thing | Floor | Source |
|---|---|---|
| Microservices with real inter-service calls | **4** | 03 |
| Microservices (upper end of sweet spot) | **7** | 03 |
| Distinct user roles / personas (minimum) | **3** (operator, reviewer/approver, admin/auditor) | 03 |
| Multi-step workflows | **3** (user-facing, administrative, async/long-running) | 03 |
| Distinct event types | **10–15** | 03 |
| External-system stubs | **2** (payment gateway + notification/logistics API) | 03 |
| Background jobs / scheduled tasks | **3–5** | 03 |
| Distinct UIs | **2–3** | 03 |
| Seeded data domains / tables | **10–15** | 03 |

Report 10 layers a *recommended* persona number on top of the *floor*: **8 personas** specifically, with seeded history, owned workloads, and activity rhythms — not just name/role tuples. The number 8 comes from role coverage (primary operator × 2 seniority levels, reviewer, approver, admin, auditor, external counterparty, subject-matter expert). Jungle3 v1 targets 8.

**Status:** Accepted. Concrete v1 counts are in §6.5.

### 5.6 Declarative-first, imperative as a fallback

This shows up in four reports (04, 06, 10, 12) applied to four different surfaces — synthetic data, stubs, personas, and domain packs — but it's the same pattern each time. Describe the artifact in a declarative manifest (YAML/JSON schema), and only drop to code when the declarative form genuinely can't express what's needed.

- **Data:** Scenario Packs (declarative seed descriptions) first; LLM text generation for narrative text (claim notes, emails) second; hand-coded generators last.
- **Stubs:** Declarative response tables with latency and error injection first; imperative handlers only for stateful stubs that need real logic.
- **Personas:** Declarative persona specs (role, rhythm, writing style, workload) first; imperative behavior only for personas driving complex workflows.
- **Domain packs:** Declarative manifests describing entities, workflows, and UI bindings first; imperative plugin code only at documented extension points.

**Why.** Declarative artifacts are reviewable, diffable, signable, and shareable. Imperative code is none of those things; once a customer's environment starts accumulating imperative extensions, you've lost the ability to reason about what it's doing.

**Status:** Accepted.

### 5.7 The simulation loop is hybrid: deterministic golden paths + stochastic background

Reports 03, 05, and 10 converge on this. The "alive" feeling comes from two layers running simultaneously:

- **Golden paths:** 3–5 deterministic, scripted, end-to-end workflows that always work and always tell a coherent story. These are Step Functions state machines. These are what a demo walks through.
- **Background activity:** a stochastic event generator running continuously (report 08 recommends ~2 events/second default), producing realistic-but-not-scripted activity across the same services. This is what makes queue depths fluctuate, traces accumulate, and dashboards populate even when no one is driving the system.

Report 10 is specific about the math: background arrivals follow a nonhomogeneous Poisson process (time-varying rate — more activity during business hours), and service times per workflow follow a lognormal-Pareto mixture (most things fast, occasional long tail). These aren't arbitrary — they're the distributions empirical workflow data actually follows, so the background activity *looks* empirical when you graph it.

**Status:** Accepted.

### 5.8 The customer-in-account deployment model is an inviolate constraint

Already decided as [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md), but the cluster treats it as a foundational input, and every convergence above respects it: no hosted control plane, cost visible and controllable to the customer, observability that doesn't phone home by default, customer-owned KMS encryption.

Validation of ADR 0003 across the cluster was unanimous. No report pushed back.

**Status:** Accepted (was already decided; cluster confirms).

---

## 6. Fights, resolved

The research surfaced five real disagreements. Each is now resolved by a decision on 2026-04-21. Sections below restate each fight briefly and record the resolution.

### 6.1 Domain anchor — RESOLVED: insurance claims processing, claims-only

**The fight.** Report 02 recommended "claims-adjacent workflows" as a family (warranty / returns / disputes / chargebacks), with insurance-proper as a #2 fallback. Reports 10 and 11 had written their persona taxonomy and regulated-cues analysis assuming insurance-proper throughout.

**Decided:** insurance claims processing, claims-only, **no underwriting**.

**Reasoning.** Two things drove this narrower target:

1. The insurance-claims-proper framing preserves report 10's and report 11's work — personas (adjuster, supervisor, SIU investigator, auditor) and regulated cues (NAIC structure, state insurance regulation tone) port directly. Choosing "claims-adjacent retail" instead would have required porting that work to e-commerce roles and payment-network regulation, which is real cost for no obvious benefit now that insurance-familiarity isn't blocking.
2. Dropping underwriting drops the hardest seed-data surface. Underwriting requires synthetic applicants with income and credit profiles, which report 02 flagged specifically as a plausibility-collapse risk — get it slightly wrong and a domain-expert reviewer spots it immediately. Claims-only lets us seed from a *given* population of policyholders with *already-bought* policies, which is a much narrower synthesis problem: we're generating claim events against stable reference data, not generating the reference data itself.

**What this means concretely.** v1 simulates a mid-sized regional P&C (property and casualty) insurer. Seeded state includes ~800 active policyholders, ~60 claims in flight at various workflow stages, ~1,800 historical closed claims spanning 18 months, and the full cast of personas listed in §6.5. The claim types span auto (collision, comprehensive, liability), property (theft, water damage, fire), and a small number of disability/accident claims. No life insurance, no health insurance, no commercial lines — these add regulatory surface without adding realism-per-effort.

**What's deferred.** Underwriting (policy origination, risk assessment, pricing) is explicitly out of scope for v1. The claims-adjacent retail framing from report 02 is also out — available as a future pack once the core platform is proven, not as the v1 anchor.

**Open sub-decision.** The specific canonical workflow that gets maker-checker treatment depends on the first design-partner conversation. My default, absent other input: *claim settlement approval above a dollar threshold* — it's the most visible, most common regulated-feel workflow in claims and has the strongest real-world grounding.

### 6.2 Admin UI — RESOLVED: LLM agent over deterministic CloudWatch/X-Ray tools

**The fight.** Report 09 argued for three dashboards (per-case timeline, queue health, failure inspection + replay) hosted on a Fargate task. Report 08 warned that every long-running service has a cost floor and that OpenSearch (which a search-heavy admin UI would likely reach for) adds $150/month idle on its own.

**Decided:** No dashboards in the traditional sense. Instead, an **LLM agent interface** powered by the Claude Code SDK, where the agent's capabilities are scoped to a specific set of deterministic tools that query CloudWatch and X-Ray directly.

**How it works.**

An operator opens the admin surface — which is a minimal chat UI — and asks a question in plain English: "What happened to claim CLM-2026-04-002137?" or "Which claims are stuck in pending_approval for more than 24 hours?" or "Show me the last five failed payment events and why they failed."

The agent has access to a constrained toolkit:

1. **`cloudwatch_logs_insights_query(query, log_group, time_range)`** — runs a CloudWatch Logs Insights query. Returns raw results.
2. **`xray_get_trace(trace_id)`** — fetches a specific X-Ray trace. Returns the span tree.
3. **`xray_get_service_map(time_range)`** — fetches the current service map.
4. **`stepfunctions_get_execution_history(case_id)`** — fetches the Step Functions execution history for a given `case_id` (resolved via a lookup table).
5. **`dynamodb_get_case(case_id)`** — reads the current state of a case from the operational store, scoped IAM-restricted to read-only.
6. **`sqs_get_queue_attributes(queue_name)`** — reads current queue depth, age of oldest message, DLQ population.

The agent reasons about which tool(s) to invoke, invokes them, and then summarizes the tool output in plain English with **citations back to the raw tool output** — so the operator can always see "the agent ran this CloudWatch query and got these rows."

**Why this reconciles the fight.**

- Report 09's user requirement (operator needs to trace a case end-to-end in thirty seconds) is satisfied, arguably better than by three dashboards — one interface covers every question type.
- Report 08's cost objection is satisfied — no OpenSearch, no always-on search backend. The agent runs on Lambda, the tools hit managed AWS services. Infrastructure cost rounds to zero.
- Report 11's audit-integrity requirement is satisfied because the agent *cannot invent facts about system state*. Every claim the agent makes is a summary of tool output it has to cite. The audit trail remains the source of truth; the agent is convenience UX over it. (Note: this was the specific concern flagged during review; the tool-constrained design is the resolution.)

**What this costs.** LLM inference, metered separately (see §6.3). A typical operator query is one or two tool invocations plus a summary response — roughly 2,000–8,000 tokens of Claude Sonnet-class usage per query, call it $0.01–$0.05 each. At 100 queries/day that's $1–$5/day, well within the $50/month LLM meter.

**What this defers.** Any UI richer than chat. No charts. No drag-and-drop. No "click to replay" (that becomes an agent tool: "replay the failed execution for trace X"). If the chat-only UX turns out to be insufficient for real operator work, v2 can layer visualization on top of the same tools — but the tools come first.

**Open sub-decision.** Which specific model tier to default to. My read: **Claude Sonnet** for the agent, with an option to downgrade to Haiku for cost-sensitive installs. Haiku is fine for simple lookups, marginal for multi-tool reasoning. This is a tunable in §7.

### 6.3 Observability backend — RESOLVED: CloudWatch + Logs Insights + X-Ray

**The fight.** Report 09 recommended OpenTelemetry Collector → CloudWatch/X-Ray with optional OTLP export. Report 11 argued OpenSearch for audit trail search. Report 08 warned either OpenSearch or persistent OTLP export blows the cost target.

**Decided:** CloudWatch Logs + CloudWatch Logs Insights + X-Ray. Nothing else in v1.

**What ships.**

- All services log to CloudWatch Log Groups, structured JSON, with `trace_id` and `case_id` as top-level fields (per §5.1).
- Log Groups have **7-day retention** by default. Customers can extend via config; the default keeps storage cost bounded.
- X-Ray is enabled on every service. **Sampling at 10%** by default — report 08 noted 100% tracing is $360/mo at default-realism traffic volumes, 1% is $3/mo, so 10% gives us the visual-service-map population at ~$30/mo.
- The audit trail is a separate DynamoDB table (append-only, hash-chained — see §6.4), queried via the agent tools in §6.2. Not in CloudWatch; audit entries have different retention and integrity requirements than logs.
- **No OpenSearch.** If a customer later wants richer search, it's a priced v2 upgrade.
- **No OTLP export by default.** Opt-in config flag sets up a Firehose → customer endpoint. Off unless the customer enables it.

**Why simpler wins here.** You named familiarity as a reason — you know CloudWatch and X-Ray, and OpenSearch adds complexity you don't need. Report 08 supports this on cost grounds. Report 11's argument for OpenSearch was specifically about audit-trail *search* UX, and that problem is re-solved by the agent in §6.2 — the agent's `dynamodb_get_case` and `cloudwatch_logs_insights_query` tools give an operator the same "find entries matching X" capability that OpenSearch would have, without the $150/mo floor.

### 6.4 LLM scope in v1 — RESOLVED: prominent, Claude Code SDK, tool-constrained

**The fight.** Reports 04, 10, and 11 all agreed LLMs should be *bounded* — never for compliance output, always gated, rate-limited — but differed on how *visible* LLM-generated content is in v1.

**Decided:** LLMs are **prominent** across multiple use cases, implemented via the [Claude Code SDK](https://docs.claude.com/en/api/agent-sdk/overview), with three guardrails:

1. **Deterministic tools only.** As in §6.2: agents don't generate claims about system state; they invoke tools and summarize output.
2. **Separately metered budget.** Default $50/month per install, visible line item, hard cutoff at exhaustion (see §7).
3. **Graceful degradation at the cutoff.** When the budget is exhausted, the admin UI still works — it just shows the raw tool output instead of a summary. "Here's the CloudWatch query you asked about; here are the rows. No LLM summary available until the budget resets."

**Where LLMs show up.**

- **Admin agent** (§6.2). Primary interactive surface.
- **Seed data text.** Claim notes, adjuster narratives, email bodies. Generated at install time, deterministic from seed, no runtime cost.
- **Persona writing style.** Each persona has a writing style spec (terse vs. verbose, formal vs. informal, domain-idiosyncratic vs. generic) that the LLM applies when generating their seeded text. Also install-time.
- **Stub response generation.** Some stubs (particularly notification/email simulators) generate body text via LLM. Runtime, but cheap and cached.

**What's explicitly not LLM-generated.** Anything in the audit trail. Anything with regulatory implications. Anything claiming to be a system fact. Per report 11.

**Status:** Accepted. Budget enforcement design in §7.

### 6.5 Microservice count — RESOLVED: 7

**The fight.** Report 03: 4–7. Report 01: 8–12. `research2`: 10.

**Decided:** 7. Specifically:

1. **`policy-service`** — reference data: policyholders, policies, coverage terms. Read-heavy. Seeded at install, mutated rarely.
2. **`claim-intake`** — receives new claim submissions (from customer portal or phone-agent stub), runs initial validation, creates `case_id`, emits `claim.submitted`.
3. **`claim-workflow`** — the Step Functions orchestrator. Owns the claim lifecycle state machine. Routes to assessors, manages approvals, handles escalations.
4. **`assessment-service`** — specialist workflows: damage assessment, fraud screening, SIU investigation triage. Mix of automated rules and human-task queues seeded against personas.
5. **`payment-service`** — issues settlements, handles reversals, integrates with the payment-gateway stub. Owns maker-checker for high-value payments.
6. **`notification-service`** — outbound communication: claimant emails/SMS, internal notifications. Integrates with the notification stub.
7. **`audit-service`** — the tamper-evident append-only trail. Not a passive log — it subscribes to every domain event and hash-chains entries. Queried by the admin agent (§6.2).

**Why 7.** Within report 03's 4–7 sweet spot (just at the top). Within report 01's 8–12 lower bound. Each service has clear ownership of one bounded context in the insurance-claims domain. Each one has real inter-service calls: intake → workflow, workflow → assessment, workflow → payment (with approval gate), every service → audit, every service → notification. Nothing is a cosmetic split.

**What's *not* a service.** The LLM admin agent is deployed as a Lambda + small frontend, not a microservice — it doesn't own domain data, it's glue over tools. The background-activity generator is a scheduled Lambda — not a service, a cron. The stubs are separate (§6.5.1 below).

**Cost implication.** 7 services on serverless infra (Lambda + DynamoDB on-demand + SQS + EventBridge + Step Functions) is the lowest-idle-cost microservice architecture AWS supports. No Fargate tasks running 24/7 except the chat UI itself. This is what makes the $100 ceiling realistic with 7 services.

#### 6.5.1 The two stubs

Per report 03's floor:

- **Payment gateway stub** — simulates a third-party payments processor. Accepts payment authorization requests, returns synchronous auth responses (with latency injection), and sends asynchronous webhook callbacks (success, chargeback, reversal) on realistic delays. Stateful (knows which auth codes it has issued), glass-box (the admin agent can query "what did the payment stub see?"), declarative response table for most cases, imperative for the webhook timing logic.
- **Notification stub** — simulates an email/SMS delivery provider. Accepts send requests, returns tracking IDs, emits delivery-status events (delivered, bounced, opened) on realistic distributions. Declarative-first.

Both stubs are labeled as stubs in every interface — report 06 is adamant that stubs must be inspectable and swappable, never pretending to be the real external service.

---

## 7. LLM budget and metering: a concrete sketch

*This section is my design, not research. You flagged "how do we implement user-triggered LLM costs" as something to figure out. Here's a proposal — a starting point, not a final answer.*

### The user-facing model

Every Jungle3 install has an **LLM budget** (default: $50/month), visible in the admin UI and in the AWS Console as a CloudWatch custom metric. The budget resets on the first of each month (UTC).

Every LLM invocation has a **pre-estimated cost** computed before the call is made, based on:

- model tier (Sonnet vs. Haiku)
- context size (input tokens)
- expected output length (capped)
- tool-use overhead (each tool call round-trip adds tokens)

The estimated cost is charged against the budget *before* the call. If insufficient budget remains, the call is rejected with a structured error and the UI shows graceful-degradation mode: "LLM budget exhausted. Falling back to raw tool output."

After the call completes, the *actual* cost (from the Claude API response) reconciles against the estimate — if the estimate was too high, the delta refunds to the budget.

### The technical shape

- **`llm-gateway` Lambda** — sole entry point for all LLM calls across the platform. Other services don't call Claude directly; they call this gateway with a prompt and a purpose tag.
- **Budget DynamoDB table** — single-record-per-install, atomic-update semantics. The gateway uses conditional writes to debit the budget before the Claude call.
- **Cost estimation library** — `estimate_cost(model, input_tokens, max_output_tokens, tools_count)`. Calibrated against [Claude API pricing](https://docs.claude.com/en/docs/about-claude/pricing).
- **Reconciliation hook** — after a call, the gateway reads the actual `input_tokens` and `output_tokens` from the Claude response and refunds or debits the delta.
- **CloudWatch custom metric** — `Jungle3/LLM/BudgetRemaining`, emitted on every call. Customer can set their own CloudWatch alarms on it.

### Graceful degradation

The admin agent (§6.2) has a "no-LLM mode." When invoked, it:

1. Parses the operator's query with simple keyword matching (not an LLM) to identify the likely tool(s).
2. Runs the tools.
3. Returns raw tool output with a banner: "LLM budget exhausted — showing raw results."

This is deliberately worse UX than the LLM-enabled mode, but it's still functional. The operator can still trace a case; they just have to read the CloudWatch query results themselves.

### What I'm uncertain about

- Whether per-user vs. per-install budgets are needed. v1 is per-install; v2 might need per-user for multi-tenant installs.
- Whether the budget should be a hard cutoff or a soft warning. I defaulted to hard cutoff because soft warnings get ignored and the whole point is FinOps-friendly behavior. Open to argument.
- How to handle the customer topping up mid-month. Probably a CLI command that increments the Budget record. Not in v1.

This section is explicitly a starting point. It will need a real design doc before implementation.

---

## 8. Ephemeral-capable lifecycle

*Section addresses the "easy to turn on and off" requirement. Also my design, not research.*

### Targets

- **Install:** <10 min from CloudFormation stack creation to "first CloudEvent flowing through the system."
- **Teardown:** <5 min from "delete stack" to full resource cleanup, no orphaned S3 objects, no orphaned CloudWatch log retention.
- **Seed determinism:** the same seed input produces the same synthetic state, every install.

### Install flow

1. CloudFormation stack creates all infrastructure (Lambdas, DynamoDB tables, SQS queues, Step Functions, EventBridge bus, ALB + Fargate for chat UI, IAM roles, Budgets).
2. A **`seeder` Lambda** runs post-deploy (via a CloudFormation custom resource). It:
   a. Generates 800 policyholders, 1,800 historical claims, 60 in-flight claims, 8 personas. Deterministic from a seed value that defaults to the stack name + creation timestamp.
   b. Writes the historical claims directly to DynamoDB with fabricated timestamps spread over the past 18 months.
   c. Kicks off the 60 in-flight claims as Step Functions executions in mid-workflow states (so the system has ongoing activity on day zero, not just historical records).
   d. Starts the background-activity generator (§5.7).
3. Install complete.

### The plausibility cost of fresh seed

You chose fresh-seed-per-install for lifecycle convenience. Report 10's realism argument depended on *aged, persistent* state. The tension is real; here's what mitigates it.

- **Timestamps are deterministic but *spread*.** The 1,800 historical claims don't all have `created_at = install_time - <random>`. They have a realistic distribution — denser in the last 6 months, sparser earlier, with the rate reflecting plausible business-hours patterns and a small annual seasonality. A casual reviewer doesn't spot this.
- **In-flight state is *mid-workflow*.** The 60 in-flight claims aren't all freshly submitted; they're distributed across the workflow (10 in intake, 15 in assessment, 20 awaiting approval, 10 in payment, 5 escalated). A reviewer opening the queue sees a realistic snapshot of a working system, not a clean-slate tutorial environment.
- **What survives close inspection doesn't matter for your use case.** A forensically curious reviewer comparing `created_at` on the underlying DynamoDB records against CloudWatch log emission times will spot the fresh install. But that reviewer doesn't exist in the "turn on, observe, turn off" flow you described. For customer installs that stay up, fresh-seed still works because customer usage generates genuine aged state over time.

### Teardown flow

1. `cloudformation delete-stack` tears down everything.
2. A **`reaper` Lambda** runs as a CloudFormation custom resource on the way down. It:
   a. Empties S3 buckets (CloudFormation won't delete non-empty buckets).
   b. Deletes CloudWatch Log Groups explicitly (they sometimes outlive the stack otherwise).
   c. Clears any remaining EventBridge rules or Step Functions execution history the stack's IAM role can reach.
3. Teardown complete.

### What this enables

- You can test a change locally, deploy, observe for an hour, tear down, and pay ~$0.15 for the whole exercise.
- Demos can be spun up, run, and torn down per-session.
- Customer installs are still long-lived; they pay the Default-Realism $100/mo as long as the stack exists.

---

## 9. What's still open

Three items remain genuinely open.

### 9.1 The event envelope ADR

Block 3 from the first pass. Not contested across any report (five reports independently converge on the CloudEvents-plus-dual-ID design in §5.1–5.2). Not blocked on anything. This is the next artifact I'll draft — **ADR 0005: event envelope and correlation identifiers**, in a separate commit.

What it will decide:

- CloudEvents v1.0 as the mandatory envelope.
- Reverse-DNS type naming (`com.jungle3.<domain>.<entity>.<verb>`).
- Constrained verb vocabulary.
- `trace_id` via W3C Trace Context on every event, log line, and audit entry.
- `case_id` required on every domain event.
- Propagation rules across SQS, EventBridge, Step Functions, and scheduled jobs.

### 9.2 The specific maker-checker workflow

Insurance claims has several candidates: settlement approval above a dollar threshold, policy exception approval, high-value payment issuance, SIU investigation outcome. My default is *settlement approval above a threshold* — it's the most common regulated-feel workflow in real claims operations and has the clearest demo narrative. But the final choice depends on which workflow resonates most with the first design partner, which is a decision I don't have input for yet.

Deferred until the first design-partner conversation happens.

### 9.3 LLM budget enforcement mechanism details

§7 is a sketch, not a design. It needs:

- A real data model for the budget record (per-install, per-user?, per-purpose?).
- A pricing-calibration plan (prices change; how do we keep the estimator accurate without frequent deploys?).
- A top-up UX.
- A cost-estimate accuracy validation harness (does the estimator actually predict costs within, say, ±10%?).

This becomes a design doc once §6.2 (the admin agent) is being implemented, not before.

---

## 10. What to do next

The research phase is over. Three ADRs should be drafted, in this order, before any meaningful code is written:

1. **ADR 0005: Event envelope and correlation identifiers.** (§9.1 above.) I'll draft this next, in a separate commit. Scope: §5.1 and §5.2 from this document.
2. **ADR 0006: v1 domain anchor — insurance claims processing.** Codifies §6.1. Includes the claims-only scope, the rationale for excluding underwriting, and the 7-service decomposition from §6.5.
3. **ADR 0007: v1 cost profile and LLM metering.** Codifies §6.3 (observability stack), §6.4 (LLM scope), §7 (LLM budget mechanism), and the $100 infra + $50 LLM-meter ceilings.

After those three are accepted, the first code to write is the `llm-gateway` Lambda from §7 — it's foundational to everything interactive, and writing it first forces a real (not sketched) answer to the §9.3 open questions.

Two ADRs that can wait for v1 to actually be in progress:

- An ADR covering the MVR floors (§5.5) — worth having as an explicit gate so future scope arguments have something to measure against, but not blocking.
- An ADR covering the extension-model core/pack boundary — not urgent until the second pack is being considered, but should not be deferred past v2 start.

Everything else from [`DECISIONS.md`](./DECISIONS.md) is fine to resolve incrementally during implementation.

---

## 11. Cross-references

- **Source reports:** [`deep-research-2026-04-21/results/`](./deep-research-2026-04-21/results/). Twelve markdown files, ~7,200 lines total. Authoritative for what the external analysis claimed.
- **Structured synthesis:** [`SYNTHESIS.md`](./SYNTHESIS.md). Same claims, more rigorously organized. Frozen as a "what the reports said" record; not updated with post-decision content.
- **Per-report summaries:** [`EXECUTIVE_SUMMARIES.md`](./EXECUTIVE_SUMMARIES.md). Useful when a specific claim makes you suspicious and you want to check the source fast.
- **Decision backlog:** [`DECISIONS.md`](./DECISIONS.md). ~60 items, most resolved implicitly by this document; the rest fine to handle incrementally.
- **Original research brief:** [`research3.md`](./research3.md). The 12 questions that generated the cluster.
- **Related existing ADRs:** [0003-installable-via-aws-marketplace](../decisions/0003-installable-via-aws-marketplace.md) (validated unanimously), [0004-canonical-platform-vocabulary](../decisions/0004-canonical-platform-vocabulary.md) (not from this cluster; touches naming conventions relevant to ADR 0005).

---

*Revision history: v1 written 2026-04-21 from research cluster alone; v2 revised same day incorporating review decisions on domain, admin UI, observability, LLM scope, cost, and lifecycle. The underlying research files (`SYNTHESIS.md`, `EXECUTIVE_SUMMARIES.md`, `DECISIONS.md`) are unchanged — they remain the authoritative "what the reports said." This document is "what we decided to do about it."*
