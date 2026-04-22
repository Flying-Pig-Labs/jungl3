# What the deep-research cluster actually said

*A plain-English read of the 12 reports in `deep-research-2026-04-21/`, written for the person who commissioned them and now has to do something with them.*

---

## What this document is

On 2026-04-21 I pushed twelve ultra4x Parallel AI deep-research queries into the research pipeline — one for each of the twelve questions in [`research3.md`](./research3.md). Together they came back with roughly 7,200 lines of analysis across [`deep-research-2026-04-21/results/`](./deep-research-2026-04-21/results/). The three synthesis files already in this directory — [`SYNTHESIS.md`](./SYNTHESIS.md), [`EXECUTIVE_SUMMARIES.md`](./EXECUTIVE_SUMMARIES.md), [`DECISIONS.md`](./DECISIONS.md) — compress that output into decision-surface artifacts.

This document does something different. It tells you what the reports *said* when you read them as a single argument instead of twelve parallel ones. It's organized the way the research actually resolved in my head after reading it, not the way the questions were originally posed. When I'm summarizing a report I'll point to it (e.g. "report 05 argues…") so you can read the source. When I'm adding my own interpretation — stitching, taking a position, calling something out — I'll name that.

Everything here is pre-decision. Nothing in this document is repo policy. The point is to get you to the place where the right set of ADRs is obvious.

---

## The thing the reports are actually about

Ten of the twelve reports name the same failure mode, usually in their first or second paragraph. They give it different names — "plausibility collapse," "the illusion shattering," "immediately reveals itself as a passive demo" — but it's the same thing: *the moment a user realizes they are looking at a toy and not a working enterprise system.* Once that moment happens, nothing downstream recovers. The demo is over. The hackathon team stops taking it seriously. The buyer decides it's a novelty.

This is the organizing claim of the entire research sweep. It's also, when you internalize it, a weirdly useful filter for everything else, because it reframes every other question from "is this technically correct?" to "does this survive a curious person looking closely for thirty seconds?"

Some examples of how that filter reshapes a question:

- **Synthetic data.** The technically correct answer is "generate plausible distributions of rows." The plausibility-collapse answer is "make sure the timestamps across services tell a consistent story, because the first thing a curious person does is sort by `created_at` and look for things that should correlate and don't." These produce very different data layers. Report 04 takes the second answer.
- **Microservice count.** The technically correct answer is "however many the domain requires." The plausibility-collapse answer is "enough that there's visible inter-service traffic, few enough that you can seed all of them with consistent state." Report 03 lands at 4–7 on exactly this reasoning.
- **Observability.** The technically correct answer is "CloudWatch, X-Ray, logs." The plausibility-collapse answer is "the admin UI needs a per-case timeline because the first thing a curious operator does is pick a case ID and try to trace it end-to-end — and if they can't, it's over." Report 09 is built on that observation.

Almost every convergence across the reports, when you trace it, is a specific mitigation for plausibility collapse. The rest of this document is organized around the ones that matter.

---

## What the reports converged on

These are the points where at least three reports, working independently on different questions, arrived at the same answer. I'm ordering them by how much downstream work they foreclose — things near the top are the most decided, in the sense that disagreeing with them would require disagreeing with a lot of material at once.

### 1. Every business event and every log line carries two IDs: a `trace_id` and a `case_id`

This is the strongest cross-report convergence in the set. Reports 05, 09, 10, 11, and 12 all arrive here independently. The reasoning is the same every time: operational observability (what happened in the distributed system) and business observability (what happened to *this specific claim/return/dispute*) are different questions, and one ID can't answer both.

- `trace_id` is the W3C Trace Context identifier — the thing that propagates via the `traceparent` HTTP header and threads through OpenTelemetry / X-Ray. It tells you which spans belong to which request. It's machine-useful and human-hostile.
- `case_id` is the business-domain identifier — the return, the chargeback, the claim. It lives at the application layer, it's human-readable, and it's what someone looking at the admin UI actually wants to filter on.

The reports converge on: **both IDs propagate through every async hop** — across SQS messages, Step Functions executions, EventBridge events, scheduled jobs, stub callbacks — and **every log line, every event envelope, and every audit-trail entry carries both**. This is not a nice-to-have in the sense that, say, distributed tracing is optional in a small system. It's a prerequisite for the admin UI in report 09 being possible at all, and for the audit trail in report 11 being useful at all.

If there's a single ADR that should be written first — before any of the harder, more contested ones — it is this one. It's the cheapest to commit to, it unlocks the most downstream work, and it's blocked on nothing.

### 2. The event envelope is CloudEvents v1.0, with reverse-DNS typing

Five reports (05, 09, 10, 11, 12) assume this without arguing about it. The reasoning, where given, is that CloudEvents is the only envelope standard widely supported across AWS services (EventBridge has native support), and that inventing a custom envelope to avoid it is a choice to spend bytes on NIH syndrome. The convention that came up repeatedly was reverse-DNS type naming — `com.jungle3.<domain>.<entity>.<verb_past_tense>` — with a constrained verb vocabulary (`created`, `updated`, `deleted`, `assigned`, `approved`, `rejected`, `escalated`, `completed`, `failed`). Concrete enough to commit; not so prescriptive that it forecloses anything.

### 3. Workflows are stateful state machines, not chains of Lambdas

Report 05 is the cleanest articulation of this, but reports 06, 10, and 11 assume it. "Business process" means a Step Functions state machine (or equivalent orchestrator) where the state is inspectable, transitions are named, retries are declarative, and failures route to DLQs. The anti-pattern the reports repeatedly warn against is "event-chain architecture" — Lambda A writes to SQS which triggers Lambda B which writes to SQS which triggers Lambda C — because the workflow is then *implicit in the topology* and can only be reconstructed by reading the code. For plausibility, the workflow has to be an *artifact* that someone can look at, not an emergent property of the deployment.

This has a knock-on effect on the admin UI (report 09): if workflows are real state machines, the per-case timeline is basically "render the execution history," which is a tractable engineering problem. If workflows are implicit in topology, the per-case timeline is an archaeology project that has to reconstruct causality from traces, which is much harder and much less legible.

### 4. Maker-checker (four-eyes) is the single highest-signal regulated cue

Report 11 is emphatic about this, and reports 01 and 10 echo it. If Jungle3 needs one thing to make the environment *feel* like a real regulated enterprise, it's that at least one workflow has a backend-enforced approval step — person A submits, person B approves, and the system refuses to advance without both. Not a UI checkbox that gets ignored if bypassed; a state transition that literally won't happen without the second signature.

The convergence isn't on *which* workflow gets maker-checker — that depends on the domain anchor — but on the claim that *some* workflow must have it, and that it has to be enforced at the state-machine level, not at the UI level. Reports 10 and 11 add a second cue that showed up repeatedly: append-only audit trails with tamper-evidence (checksums or hash-chaining), distinct from application logs. The language report 11 uses around this is worth internalizing: it calls the trail "tamper-evident" rather than "compliant," "tamper-proof," or "immutable," because those last three imply guarantees Jungle3 can't actually make, and implying them is where legal exposure starts.

### 5. The numbers for "minimum viable realism" are tighter than you'd guess

Report 03 gives the floor. Below these numbers the system feels like a demo; at or above them it starts to feel alive.

| Thing | Floor | Source |
|---|---|---|
| Microservices with real inter-service calls | **4** | 03 |
| Microservices (upper end of "sweet spot") | **7** | 03 |
| Distinct user roles / personas | **3** (operator, reviewer/approver, admin/auditor) | 03 |
| Multi-step workflows | **3** (user-facing, administrative, async/long-running) | 03 |
| Distinct event types | **10–15** | 03 |
| External-system stubs | **2** (payment gateway + notification/logistics API) | 03 |
| Background jobs / scheduled tasks | **3–5** | 03 |
| Distinct UIs | **2–3** | 03 |
| Seeded data domains / tables | **10–15** | 03 |

Report 10 layers a *recommended* number on top of the *floor*: **8 personas** specifically, with seeded history, owned workloads, and activity rhythms — not just name/role tuples. The number 8 comes from role coverage (operator × {primary, senior}, reviewer, approver, admin, auditor, external counterparty, subject matter expert), not from a target.

Reports 01 and 03 disagree mildly on the upper microservice bound — 01 floats 8–12, 03 argues 7 — but both agree the *floor* is 4 and the *risk* is piling on breadth without depth. `research2` (which predates this cluster) assumes 10. Any of those is defensible; fewer than 4 is not.

### 6. Declarative-first, imperative as a fallback

This shows up in four reports (04, 06, 10, 12) applied to four different surfaces — synthetic data, stubs, personas, and domain packs — but it's the same pattern each time. The recommendation is: describe the artifact in a declarative manifest (YAML/JSON schema), and only drop to code when the declarative form genuinely can't express what you need.

- **Data:** Scenario Packs (declarative seed descriptions) first, LLM text generation second, hand-coded generators last (report 04).
- **Stubs:** Declarative response tables with latency/error injection first, imperative handlers only for stateful stubs that need real logic (report 06).
- **Personas:** Declarative persona specs (role, rhythm, writing style, workload) first, imperative behavior only for personas that drive complex workflows (report 10).
- **Domain packs:** Declarative manifests describing entities/workflows/UI bindings first, imperative plugin code only at documented extension points (report 12).

The reasoning across all four is: declarative artifacts are reviewable, diffable, signable, and shareable. Imperative code is none of those things, and once a customer's environment starts accumulating imperative extensions you've lost the ability to reason about what it's doing. Report 12 is the one that makes this most explicit — it treats the declarative/imperative boundary as the central architectural decision for the extension model.

### 7. The simulation loop is hybrid: deterministic golden paths + stochastic background

Reports 03, 05, and 10 converge on this. The "alive" feeling comes from two layers running simultaneously:

- **Golden paths:** a small number (3–5) of deterministic, scripted, end-to-end workflows that always work and always tell a coherent story. These are what a demo walks through. These are Step Functions state machines.
- **Background activity:** a stochastic event generator running continuously (report 08 recommends ~2 events/second default), producing realistic-but-not-scripted activity across the same services. This is what makes queue depths fluctuate, traces accumulate, and dashboards look populated even when no one is driving the system.

Report 10 is specific about the math: background event arrivals follow a nonhomogeneous Poisson process (time-varying rate — more activity during business hours), and service times per workflow follow a lognormal-Pareto mixture (most things fast, occasional long tail). These aren't arbitrary — they're the distributions empirical workflow data actually follows, so the background activity *looks* empirical when you graph it.

### 8. The customer-in-account deployment model is a constraint, not a preference

This one isn't a new finding — it's already decided, as [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md) — but the cluster treats it as an inviolate input, which is worth noting because it shapes *everything*. Reports 07, 08, 09, and 12 all make non-trivial design concessions to this constraint:

- No hosted control plane (report 12 explicitly defers multi-tenant management, saying the entire product model forbids it).
- Cost has to be visible and controllable to the customer on day one (report 08's budget-by-default recommendation).
- Observability can't phone home by default (report 09 treats OTLP export as opt-in).
- Every piece of customer data lives in the customer's account and is KMS-encrypted with the customer's keys (reports 07, 11).

The validation of ADR 0003 is essentially unanimous across the cluster. No report pushed back.

---

## What the reports fought about

Convergences are where you have permission to commit. Divergences are where you still have leverage — and therefore where the hard decisions actually live. There are five real fights in the material.

### Fight 1: What domain is v1 actually in?

This is the largest and most consequential disagreement, and it's the one I got slightly wrong in my first pass at the synthesis. Here's what each report actually claims.

Report 02 — the one explicitly commissioned to answer this question — evaluates six candidate domains (claims-adjacent workflows, insurance case processing, e-commerce fulfillment, ITSM, loan origination, permit review) and recommends **claims-adjacent workflows** as #1, with **insurance case processing** as the #2 fallback. Importantly, "claims-adjacent workflows" in report 02 is a *superset* that includes warranty claims, e-commerce returns, payment disputes, and chargebacks — treated as a family rather than a single choice. The argument for this superset is that it's universally understood (everyone has returned something or disputed a charge), rich enough to surface real workflow complexity, and avoids the plausibility risk of heavily-regulated domains without losing the "serious, rules-based" feel.

Reports 10 and 11, meanwhile, wrote their entire output — persona taxonomy, pre-seeded workload, regulated-cues analysis — assuming the v1 domain is **insurance claims proper**. Roles like "claims adjuster," "underwriter," "SIU investigator" are baked into report 10's persona roster. Report 11's regulated-cues analysis leans heavily on insurance-specific regulatory scaffolding (NAIC, state insurance departments).

So the fight isn't quite "chargebacks vs. insurance" the way I first characterized it. It's:

- **Option A: Claims-adjacent family** (02's recommendation). v1 picks a specific expression within it — likely e-commerce returns with a chargebacks sub-flow, per 02's detailed narrative. Reports 10 and 11's work has to be ported (personas rewritten as RMA agents, warehouse inspectors, chargeback specialists; regulated cues rewritten around payment network rules instead of state insurance regulation).
- **Option B: Insurance claims proper** (02's fallback, 10 and 11's implicit assumption). Report 02 is explicit that this is defensible — it calls insurance "unmatched workflow richness" — but warns about steep learning curve, difficult seed data (PII-sensitive), and brand-pigeonholing risk.

The reports *do not agree* on this. Report 02 made a deliberate recommendation; reports 10 and 11 made a deliberate assumption. Neither side is wrong, but only one domain can ship. This interacts directly with [CLAUDE.md §11 #19](../../CLAUDE.md) (Domain Starter anchor) and [§11 #21](../../CLAUDE.md) (first-customer context), both of which are listed as open. My read is that the open §11 items are the blocker here, not the research — the research has said what it can say, and the missing input is "who is the first customer and what do they work on day-to-day."

### Fight 2: How much custom admin UI ships in v1?

Report 09 argues — at length and persuasively — that the custom admin surface *is* v1. Its claim is that generic AWS console views (CloudWatch logs, X-Ray service map, SQS queue metrics) are illegible to a builder trying to understand the synthetic enterprise, because they show the *system* and not the *business*. The three views report 09 says must ship are:

1. **Per-entity timeline.** Given a `case_id`, render every event, state transition, audit entry, and stub call that touched it, in order. This is the thing that makes "trace a claim end-to-end" a thirty-second task instead of a twenty-minute one.
2. **Queue health view.** Live depth, age-of-oldest-message, DLQ population, and redrive controls for every async boundary.
3. **Failure inspection & replay.** Pick a failed execution, see why, re-run with the same inputs.

Report 08, meanwhile, spends considerable time on the fact that *every service you deploy has a cost floor*, and the thing that breaks the recommended cost profile most reliably is adding a service that runs 24/7 "just to host a dashboard." Its OpenSearch analysis (43% of default-realism monthly cost, ~$150/mo just for a small cluster) is the load-bearing example. Any admin UI with a search backend is in this trap.

These aren't formally contradictory — you can build report 09's admin surface cheaply if you're disciplined about the implementation (ALB + Fargate + CloudWatch Logs Insights, skip OpenSearch by default) — but the reports don't resolve *how*, and there's an additional wrinkle: [CLAUDE.md §11 #18](../../CLAUDE.md) mentions an "Agent Layer" with "inspection specialists," and it's unclear whether the admin UI and the Agent Layer are:

- the same surface under two names,
- complementary surfaces that must cross-link,
- or distinct surfaces serving different audiences.

Resolving this fight needs a cost budget (a v1 cost ceiling decision — see §6 below) *and* a resolution of the Agent Layer question in §11. It's the most tangled of the five fights because it touches three separate unresolved threads at once.

### Fight 3: Where does observability data actually go?

Three reports each recommend a component for a specific reason:

- Report 09: **OTel Collector → CloudWatch + X-Ray**, with optional OTLP export for customers who want to pipe to their own backend.
- Report 11: **OpenSearch** for the audit trail, because the audit search UX is much better there than CloudWatch Logs Insights.
- Report 08: **neither OpenSearch nor persistent OTLP export by default**, because each adds a fixed idle-cost floor that breaks the recommended ~$110–150/mo target.

None of the three reports *proposes* stacking all three. But if you read them sequentially (as I did when first synthesizing) it's easy to assume the stack is "CloudWatch + X-Ray + OpenSearch + OTLP export" — which is a stack no report actually endorses and that blows through the cost ceiling by roughly 2x. The resolution here is a single decision about the observability backend: what ships by default, what's opt-in, and — critically — what the audit trail actually lives on. My read, stitching the reports together: **CloudWatch Logs + CloudWatch Logs Insights + X-Ray by default** (report 08's position); **OpenSearch gated behind a "regulated cues upgrade" opt-in**, priced visibly (+$150/mo) so the customer sees what they're buying (report 08's + report 11's positions reconciled); **OTLP export always available, never default** (report 09's position). But that's my stitch, not any single report's claim.

### Fight 4: How prominently does v1 use LLMs?

Reports 04, 10, and 11 all treat LLMs the same way on the boundaries — bounded, gated, never for compliance-relevant output, always templated with deterministic structure — but they differ on how *visible* LLM-generated content is in the v1 experience.

- Report 04 (synthetic data) treats LLM generation as a tool for producing plausible text content (notes, emails, case summaries), gated behind a gateway service so it's swappable and rate-limited. Fine-grained about the boundary but assumes the feature ships.
- Report 10 (personas) uses LLMs to give personas *writing style* — so that when Persona A writes a case note and Persona B writes a case note, the notes don't read identically. This is a plausibility move, not a feature move. Also assumes it ships.
- Report 11 (regulated cues) warns strongly against anything that implies automated compliance attestation, legal advice, or regulatory decision-making. Doesn't oppose LLM use, but draws a sharp line around what LLM-generated text is allowed to *claim*.

These aren't in conflict; they're calibrated to each other. But the v1 decision is whether LLM content is **default-on** (ships as part of the install, with the gateway configured against a reasonable default model), **opt-in** (customer configures their own model endpoint during setup), or **deferred** (static seeded text in v1, LLM generation in v2). The reports as written assume default-on or opt-in; none argues for deferral. But none argues *against* deferral either, which means that's a live option.

### Fight 5: How many microservices, exactly?

Report 03 says **4–7**. Report 01 says **8–12**. `research2` assumed 10. This looks like a fight but mostly isn't — the reports are answering slightly different questions. Report 03 is asking "what is the minimum to feel alive" (floor: 4; sweet spot: 7). Report 01 is asking "what does a plausible enterprise look like" (8–12 feels more enterprise-y because enterprises *are* fragmented). `research2` is a planning document that assumed a specific count so the rest of the plan could be concrete.

My read: pick 6–8. Above 4 (report 03's floor), well within report 01's range, close enough to report 03's sweet spot to get the "curated depth, not breadth" benefit. Below 10 because every additional service has a cost floor (report 08) and a seed-data floor (report 04). This is a decision the founder should make with the domain anchor decision, because *which* services depends on *which* domain, and counting them in the abstract is less useful than enumerating them in the concrete.

---

## What v1 should look like if you take the convergences seriously

*This section is my synthesis — me stitching the reports together into a concrete picture. It's not what any single report says. It's what I think falls out if you accept the eight convergences above and resolve the five fights in the most conservative direction each time. You should push back on any specific piece that feels wrong.*

A v1 Jungle3 install, by this reading, is:

**Shape.** One CloudFormation stack, deployed into a customer AWS account via Marketplace, into a single region (us-east-1 by default), single-AZ by default (multi-AZ opt-in). Hybrid compute — Lambda for event-driven work, a small number of Fargate tasks for things that genuinely need to be persistent (UI, admin surface, one or two stateful workers). Serverless-first data plane (DynamoDB on-demand for operational state, S3 with lifecycle policies for artifacts, no RDS in v1).

**Domain.** A claims-adjacent scenario — whichever specific expression (warranty / returns / chargebacks / insurance) falls out of the first-customer decision, not chosen in the abstract. Whatever's chosen, the seed state includes ~18 months of history so the install doesn't look fresh.

**Microservices.** 6–8 of them, each owning its own data, each with real inter-service calls on the golden paths. For a chargebacks/returns expression: customer-facing portal, RMA/case-intake service, inventory/fulfillment service, payments-and-disputes service, notification service, audit service, a workflow orchestrator (Step Functions as a service in its own right), and probably one finance/reporting service. Exact decomposition is a domain-anchor consequence.

**Personas.** 8 seeded personas with owned workloads and activity rhythms — not 8 rows in a users table, but 8 distinct participants who have each touched dozens of cases with their own tempo and writing style. Three role archetypes minimum (operator, reviewer/approver, admin/auditor); the other five come from the domain's natural role structure.

**Workflows.** 3–5 multi-step workflows, all modeled as Step Functions state machines, at least one with a backend-enforced maker-checker step. One user-facing, one administrative, at least one async/long-running with retries and visible DLQ. Each workflow is an *artifact* the customer can look at, not an emergent property of which Lambda calls which.

**Event plane.** CloudEvents v1.0 envelopes. 10–15 distinct event types, reverse-DNS named. Every envelope carries `trace_id` (W3C) and `case_id` (business). EventBridge as the bus, SQS as the queue, DLQs wired on every async boundary. Background event generator producing ~2 events/sec average, with business-hours rhythm.

**Stubs.** At least 2 external-system stubs — a payments gateway and a notifications/logistics API at minimum. Stateful, glass-box (the customer can see what they're doing and why), declarative where possible. Both inject latency and occasional errors to force the real application to implement retries and webhook handlers. Under no circumstances should the stubs pretend to be the real external systems; they are labeled, inspectable, and swappable.

**Data layer.** DynamoDB for operational state; S3 for artifacts. Seed data generated by Scenario Packs (declarative) with LLM-generated narrative text where needed, gated through an LLM gateway service that's rate-limited and swappable. Cross-service data is consistent — a case that exists in the intake service also exists, in the right state, in the workflow orchestrator, the audit trail, and the reporting service.

**Regulated feel.** Maker-checker on at least one workflow, enforced at the state machine. Append-only audit trail with hash-chained tamper-evidence. Versioning-with-diffs on any entity that has legal consequence. Careful marketing language — "tamper-evident," never "tamper-proof" or "compliant." No claims about certification; no automated compliance attestation.

**Admin surface.** Build it. Three views: per-case timeline, queue health + redrive, failure inspection + replay. Ships on the default stack, hosted on the existing Fargate task (no OpenSearch, no new cluster). CloudWatch Logs Insights powers the search. OTLP export is a config flag, off by default. If a customer later wants OpenSearch-backed search, it's a priced upgrade with a visible line item.

**Cost.** Default-Realism profile, targeting **$110–$150/month** in the customer's account. A CloudFormation-default AWS Budget is created at $200/month with an SNS alert, because report 08's FinOps finding is that $200–$400/mo is the first threshold that triggers procurement review, and the product needs to sit *under* that threshold by default while giving the customer the visibility to know if they're approaching it. Demo profile ($40–60/mo, ephemeral) and Stress profile (opt-in, no upper bound) both ship but aren't default.

**Extension model.** The core / pack boundary gets defined *now*, not after v2. Core owns: deploy/lifecycle, the event envelope spec, the dual-ID convention, the declarative runtimes (for data, stubs, personas), the observability plumbing. Packs own: entity schemas, workflows, UI bindings, seed data, stubs-for-this-domain, personas-for-this-domain. The v1 pack is the chosen domain. Pack manifests are signed (SHA-256 + manifest signing is the v1 floor; Sigstore is the upgrade path). SemVer 2.0.0 for pack versions, with compatibility ranges declared against core.

**What doesn't ship in v1.** Cryptographic WORM storage. Real PKI. SOC 2 / HIPAA certification paperwork (architecture readiness is fine, certification is not a v1 exercise). AI-driven root-cause analysis or automated remediation. A hosted multi-tenant control plane (the product model actively forbids it). A runtime plugin loader for customer-authored code. Cross-domain analytics dashboards (premature normalization across packs). Multi-region persona coverage. Full legal-hold / e-discovery workflow. Automated compliance attestation reports (legally perilous, per report 11). Fully autonomous LLM agents making business decisions.

That's a concrete v1. It's recognizably the system the twelve reports are arguing for. The places where I'm taking a position beyond what the reports say are: the specific microservice count (I said 6–8; reports disagree within 4–12), the specific observability stack (I stitched three reports into one stack; no single report says this), and the specific treatment of LLMs (I leaned default-on with a gateway; defer-to-v2 is also defensible). Flag any of those if my stitch isn't what you'd stitch.

---

## What actually blocks forward motion

There's a ~60-item decision backlog in [`DECISIONS.md`](./DECISIONS.md). Most of those are fine to resolve incrementally, in the course of writing code. Three of them block everything else, in the sense that you can't make progress on the rest without resolving them first.

### Block 1: The domain anchor (fight 1 above)

You can't seed data, design personas, pick the maker-checker workflow, size the microservices, write the first pack, or draft the first admin-UI mock without knowing whether the domain is claims-adjacent-retail or insurance-claims-proper. This decision sits on top of CLAUDE.md §11 #19 and #21, and the research's read is that the blocker is missing first-customer context, not missing research. My recommendation: don't write this ADR from the research alone. Pick the first design-partner conversation first, then write the ADR with their context in it.

### Block 2: The v1 cost ceiling (fight 3 and the financial frame for fight 2)

Every architectural decision downstream has a cost shadow. Report 08's $110–150/mo target is defensible and well-supported, and it sits under the $200–400/mo FinOps-review threshold. Ratifying it as policy — with the default AWS Budget as part of the install — is a small ADR that unlocks the ability to *reject* future design proposals on cost grounds. Without it, every cost conversation re-opens the whole question. This one's cheap and high-leverage.

### Block 3: The event envelope + dual-ID convention (convergence 1 and 2 above)

This is the cheapest ADR in the set. Five reports agree, nothing contests it, no other decision is blocked on it, and writing it costs an hour. It unlocks a lot of downstream work — every service, every stub, every test harness depends on this convention — and shipping code that doesn't follow it accumulates technical debt from day zero. Write this one first.

There are three more ADRs worth considering after these (the MVR threshold, the custom admin surface, the extension-model boundary), but they're less blocking — you can make concrete progress on code without them, and writing them under the pressure of actual implementation will produce better ADRs than writing them from research alone. I wouldn't rush those three.

---

## What I think you should do next

Open the event-envelope / dual-ID ADR first. It's cheap, uncontested, unlocks a lot of work, and exercises the synthesis-to-ADR path on the easiest possible case before you take it into harder territory. While you're writing that, get the first design-partner conversation onto a calendar — because the domain-anchor ADR is genuinely gated on it, and waiting on that conversation to start *other* ADRs is a waste of time. Ratify the cost ceiling ADR in parallel; it's independent of everything and lets you say no to expensive ideas.

After those three, the right sequence is: extension-model boundary (decides what's in core vs. in packs) → MVR threshold (ratifies the floor numbers so scope arguments have a gate) → domain anchor (requires the first-customer context) → admin-UI scope (requires cost ceiling + Agent Layer resolution from CLAUDE.md §11 #18). That sequence minimizes dependency order and maximizes how much cheap work you can do while the expensive conversations catch up.

The one thing I'd not do is treat the synthesis files — this one included — as decisions. They're a read of what the reports said. ADRs are decisions. The gap between those two things is where the actual product gets made.

---

## Cross-references

- Raw reports: [`deep-research-2026-04-21/results/`](./deep-research-2026-04-21/results/). Twelve markdown files, ~7,200 lines total.
- Per-report summaries: [`EXECUTIVE_SUMMARIES.md`](./EXECUTIVE_SUMMARIES.md). One paragraph per report; useful when a claim above makes you suspicious and you want to check a source.
- Cross-report synthesis (structured form of what's above): [`SYNTHESIS.md`](./SYNTHESIS.md).
- Flat decision backlog: [`DECISIONS.md`](./DECISIONS.md). ~60 items, all status:open.
- Original research brief: [`research3.md`](./research3.md).
- Related existing ADRs: [0003-installable-via-aws-marketplace](../decisions/0003-installable-via-aws-marketplace.md) (validated unanimously by the cluster); [0004-canonical-platform-vocabulary](../decisions/0004-canonical-platform-vocabulary.md) (not from this cluster; touches naming conventions relevant to the event-envelope ADR).

---

*Written 2026-04-21, same day as the research cluster. If the underlying synthesis files change, this document is re-derivable from them — it's a read, not a source.*
