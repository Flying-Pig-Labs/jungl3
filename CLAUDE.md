# CLAUDE.md — jungl3

Guidance for Cursor Agent (and any Claude-family assistant) working in this repo.
Read this **before** making changes. It encodes constraints that are not obvious from the file tree.

---

## 0. Current phase

**End-to-end orientation:** [`docs/overview.md`](./docs/overview.md) — narrative map of what Jungl3 is, the shape it takes, how customers and teams use it, how we got here, and where everything lives. [`docs/roadmap.md`](./docs/roadmap.md) — phased action checklist from v0.1 through v1, every item linked to its canonical source. Read both (and `CLAUDE.md`) before acting on anything non-trivial.

**v0.1 skeleton build** (scoping in [`docs/reviews/2026-04-24-v0.1-plan.md`](./docs/reviews/2026-04-24-v0.1-plan.md)). Target: a vendable + reapable "promotable tiny claims Understory" running in a dev AWS account, proving the Control Plane / Understory / Integration Contract / install–teardown primitives on a minimal P&C surface. No LLM, no DMZ agents, no maker-checker, no Gallery, no Marketplace submission — those are v0.5/v1.

**Research is frozen.** The absorbed paper trail is in [`docs/research-archive/`](./docs/research-archive/); the active synthesis layer is in [`docs/research/`](./docs/research/). Reasoning in the [research-sufficiency note](./docs/reviews/2026-04-24-research-sufficiency.md). Do not spelunk the archive for Phase 2 tasks unless a specific claim needs a citation.

**Current ADRs through 0012** (0012 Proposed, others Accepted). ADRs 0013+ are build-driven, not research-driven.

---

## 1. What jungl3 is

jungl3 (pronounced "jungle three") is the working name for an **AI-native prototype platform** for time-boxed innovation sprints. The full concept lives in `doc.md` and `doc2.md`; the refined distillation lives in `docs/`.

Canonical term definitions live in [`docs/glossary.md`](./docs/glossary.md). The current high-level shape, diagrammed: [`docs/architecture/system-context.md`](./docs/architecture/system-context.md).

One-line summary: **Jungl3 is distributed as an AWS Marketplace listing; once installed in a customer's AWS account, an in-account Control Plane vends isolated "Jungles" (builder environments that are alive on day one, built on an [Understory](./docs/glossary.md#understory) of pre-wired application baseline). A prototype deploys from its Jungle to its [DMZ](./docs/glossary.md#dmz) — a private, AI-first evaluation environment where agents probe it — and is then promoted to its [Canopy](./docs/glossary.md#canopy), the human exposure surface where judges, beta users, and other outsiders find, try, and judge it through the [Gallery](./docs/glossary.md#gallery).** Everything else stays hidden inside the install. See [ADR 0003](./docs/decisions/0003-installable-via-aws-marketplace.md), [ADR 0004](./docs/decisions/0004-canonical-platform-vocabulary.md), and [ADR 0011](./docs/decisions/0011-canopy-and-ai-first-dmz.md).

Design principle carried throughout: **start with a living baseline, shape it.** Teams do not build up from a blank scaffold; they shape an [Understory](./docs/glossary.md#understory) that already runs. Shaping includes subtraction (the primary motion — cutting what doesn't belong), substitution (swapping parts), and addition (extending where the baseline stops). See [`docs/product/positioning.md`](./docs/product/positioning.md) for the full framing.

---

## 2. What this repo currently contains

The repo root is a **TanStack Start + React 19 + Tailwind v4 + shadcn/ui** app scaffolded by [Lovable.dev](https://lovable.dev), with Cloudflare Workers as the deploy target (`wrangler.jsonc`, `@cloudflare/vite-plugin`). It is the **AWS Marketplace listing landing page** — the public-facing sales and documentation surface for the Jungl3 AWS Marketplace listing. Currently a password-gated hero + "System Modules / Idea Engine" sections, styled around a "Welcome to the Jungl3" poster.

This is one domain of the larger platform. It is **not** the whole platform, and it is **not** a Jungl3 instance — a Jungl3 instance runs in a customer's AWS account after they subscribe via AWS Marketplace. See [ADR 0003](./docs/decisions/0003-installable-via-aws-marketplace.md).

---

## 3. 🚨 The Lovable Boundary — READ THIS FIRST

**Lovable.dev is an autonomous collaborator on this repo.** It commits directly to `main` (look at `git log` — the `Changes` commits are Lovable's). Lovable's file-writing logic assumes a standard Vite project at repo root.

### Lovable-owned paths (do NOT restructure, rename, or move)

```
src/                     # all application source
public/                  # if/when added
index.html               # if/when added
package.json
package-lock.json
bun.lockb
bunfig.toml
vite.config.ts
wrangler.jsonc
tsconfig.json
eslint.config.js
components.json
.prettierrc
.prettierignore
.lovable/                # Lovable's plan/state directory
```

### Rules for Cursor Agent in Lovable's territory

1. **Never move, rename, or restructure** any file in the list above. It will break Lovable's next autonomous edit.
2. **Prefer deferral**: if the user asks for a visual/content change to the website, first propose driving it through Lovable (describe the change the user should prompt Lovable with). Only edit `src/` directly when (a) the user explicitly asks you to, or (b) the change is too mechanical / too narrow for Lovable (e.g., fixing a single typo, a TypeScript error, a broken import).
3. **Surgical edits only**: any direct edit inside `src/` should be as small as possible. Avoid refactors, file splits, or pattern changes — Lovable may overwrite them on its next run anyway.
4. **Do not run `npm install`** at the repo root. Lovable uses Bun (`bunfig.toml`, `bun.lockb`). Running npm will fight the lockfile. If a dep is truly needed, use `bun add`.
5. **Merge conflicts**: if a local change conflicts with a Lovable commit in Lovable-owned files, **Lovable wins by default** unless the user says otherwise. Our work lives in subdirs precisely to avoid this.
6. **Do not add a `CLAUDE.md`, `AGENTS.md`, or similar agent-config file inside `src/` or `.lovable/`**. Agent guidance for the website lives only in this root file.

### What you (Cursor Agent) may freely do at repo root

- Edit this `CLAUDE.md`, `doc.md`, `doc2.md`.
- Create and edit anything inside `.cursor/`.
- Create new top-level domain subdirectories (see §4) and put anything you want inside them.
- Edit `.gitignore` if a new domain requires it.

---

## 4. Domain = subdir (with one exception)

Policy: **each platform domain lives in its own top-level subdirectory of the repo.** The sole exception is the website, which must stay at repo root because of the Lovable boundary (§3).

Expected domain subdirs (create on first use, not speculatively). Framing is **per-install**: these components ship inside the AWS Marketplace listing and run in the customer's AWS account. They are *not* Jungl3-hosted services.

| Subdir | What lives there |
| --- | --- |
| `marketplace-listing/` | AWS Marketplace packaging: the CloudFormation/CDK template the customer launches, metadata, pricing config, security-review artifacts, and listing docs. |
| `control-plane/` | In-account orchestration code: vending Jungles, DMZs, and Canopies within the customer's account, lifecycle, install-scoped DNS and routing. |
| `dmz/` | DMZ provisioning templates (IaC): the AI-first evaluation environment, including agent runtime scoping, persona seeding, evaluation-run capture. See [ADR 0011](./docs/decisions/0011-canopy-and-ai-first-dmz.md). |
| `canopy/` | Canopy provisioning templates (IaC) that stand up the human exposure surface inside the customer's VPC, plus the Gallery (listing/discovery UI) and feedback surface within it. See [ADR 0011](./docs/decisions/0011-canopy-and-ai-first-dmz.md). |
| `synthetic-runtime/` | Fake data generators, event emitters, queue producers, stubbed services. Installed per-Jungle. |
| `agents/` | Data/API/Event/Auth/Environment/Listing sub-agents + orchestrator. See [ADR 0002](./docs/decisions/0002-sub-agent-response-contract.md) and [`docs/architecture/agent-layer.md`](./docs/architecture/agent-layer.md). |
| `cli/` | The Claude-Code-CLI-style operator console. |
| `contracts/` | Shared types: integration contract, persona schemas, event schemas, sub-agent response contract. |

None of these exist yet. Create them only when starting real work in them. Each should carry its own `README.md` and its own dependency manifest (`package.json`, `pyproject.toml`, `go.mod`, CDK app, etc.) so it can be built, tested, and deployed independently. **Do not create a root-level monorepo manager (workspaces, Turborepo, Nx) until there is a second subdir that proves the need.** Favor deletion over addition.

There is no `infra/` subdir. Under the installable model there is no "shared AWS foundation" — Jungl3 does not run its own AWS Org or host anything other than the Marketplace listing build/test. See [ADR 0003](./docs/decisions/0003-installable-via-aws-marketplace.md).

---

## 5. AWS rules

### Profile

**Always use the default AWS profile.** Never pass `--profile` to any AWS CLI or SDK call. This applies to every service: CDK, Terraform, `aws` CLI, `wrangler` (N/A — but noted), Boto3, etc.

```bash
# correct
aws sts get-caller-identity
aws s3 ls

# WRONG — never do this
aws sts get-caller-identity --profile anything
```

### Read-only unless told otherwise

AWS infrastructure actions are **read-only by default**. You may run `describe`, `list`, `get`, `head` freely. You may **not** deploy, modify, or delete AWS resources — including `cdk deploy`, `terraform apply`, `aws ... create-*`, `aws ... put-*`, `aws ... delete-*` — without the user's explicit go-ahead in the current turn.

### Scope of these rules

The profile and read-only rules apply to **Jungl3's own AWS account** — the account used to build, test, and publish the AWS Marketplace listing. That is the only AWS account Jungl3 operates directly. Customer accounts are the customer's responsibility; Jungl3 does not have credentials into them.

### Target architecture (within a customer's account)

The installed Jungl3 runs inside a single customer AWS account. Concrete topology — whether the Control Plane runs on Lambda or ECS/Fargate, single CFN stack vs nested components, IAM role minimums — is intentionally not fixed yet. Open in §11.

Historical note: `doc.md` and `doc2.md` describe a pre-[ADR 0003](./docs/decisions/0003-installable-via-aws-marketplace.md) **Jungl3-hosted** shape. Each file now carries its own frontmatter saying so; read them as design transcripts, not current architecture.

---

## 6. Authorship

Code in this repo is authored by:
- **Lovable.dev** — autonomously, inside the Lovable-owned paths (§3).
- **Cursor Agent** — everywhere else, driven by the user.

Do not sign commits with `Co-Authored-By: Claude`, `Co-Authored-By: Cursor`, or similar. Commit messages should describe the change, not the tool.

---

## 7. Information placement

Jungl3 is in the concept-to-architecture phase. Ideas arrive in fragments. Your job is to land each one where future humans and agents will find it — not leave it stranded in a random file.

When a new piece of information arrives, classify it and route it:

| Kind of information | Destination |
| --- | --- |
| What a Jungl3 concept *means* (a term, a noun) | [`docs/glossary.md`](./docs/glossary.md) |
| How the system is structured (layers, boundaries, interactions) | `docs/architecture/<topic>.md` |
| How the product is framed (positioning, audience, principle) | `docs/product/<topic>.md` |
| A **decision** we are making (closes off options, costly to reverse) | `docs/decisions/NNNN-slug.md` (see [`docs/decisions/README.md`](./docs/decisions/README.md)) |
| An **open question** we haven't answered yet | §11 of this file |
| Product vision / raw strategic thinking | `doc.md`, `doc2.md` — unchanged source material |
| A **flow** that would benefit from visualization | Mermaid diagram inside the relevant architecture doc (see §8) |
| A pattern that has repeated and needs codifying for agents | `.cursor/skills/<name>/SKILL.md` (see §10) |
| Repo-level guidance for AI agents | This file — `CLAUDE.md` is canonical |
| Lovable-specific guidance | §3 of this file only — do not fragment into other files |

**Do not:**
- Duplicate a concept definition in two places. Define once in `glossary.md`, link everywhere else.
- Create empty scaffolding (stub docs, stub directories) in anticipation of content. Create the file the first time there is real material for it.
- Leave an architecture idea in a scratch comment, a commit message, or a chat log if it actually shapes the system. Move it to the right doc.
- Let `doc.md` / `doc2.md` grow as catch-alls. Those are raw source; refined material goes to `docs/`.

**Reduce entropy on every pass.** If you notice terminology drift, stale duplication, or an idea stranded in the wrong file while doing other work, fix it in the same commit or flag it.

---

## 8. Mermaid style

Diagrams in this repo are **Mermaid**, embedded in the docs they support. The canonical diagram is [`docs/architecture/system-context.md`](./docs/architecture/system-context.md); match its style.

### Rules

- **One concept per diagram.** If it takes a paragraph to explain what the diagram shows, split it.
- **Short labels.** `Control Plane` not `The Jungl3 Control Plane Orchestration Service`.
- **Same names everywhere.** Pull labels from [`docs/glossary.md`](./docs/glossary.md). If a node is called `DMZ` in one diagram, it's `DMZ` in every diagram.
- **Layout: left-to-right (`flowchart LR`) or top-to-bottom (`flowchart TB`).** Pick one and stick with it inside a doc.
- **Separate concerns.** Conceptual architecture ≠ runtime flow ≠ deployment topology. Don't mix them into one diagram.
- **Arrow labels name the relationship.** `-->|vends|`, `-->|deploys to|`, `-->|registers with|`. Not unlabelled arrows unless the relationship is obvious.
- **No crossing lines if you can avoid them.** If you can't, the diagram is too dense — split it.
- **Title + one sentence.** Each diagram has a heading above it and, if useful, a single short sentence of context. Not a paragraph.
- **Must render.** Validate Mermaid before committing. Broken diagrams are worse than no diagrams.

### When to add a diagram

Add one when a concept is **being documented for a real reason** (an architecture doc, an ADR context section, a flow explanation) and a picture would teach it faster than prose.

**Do not** add a diagram just because a topic "feels architectural." Decorative diagrams violate the clarity-over-completeness principle.

### Split, don't crowd

If a diagram grows past ~8 nodes or starts mixing concerns, split it into multiple small ones. Multiple 5-node diagrams beat one 15-node diagram every time.

### When a diagram directory is justified

Diagrams live next to the doc they support. A dedicated `docs/diagrams/` directory is created only when we have enough cross-referenced diagrams (say, four or more referenced from multiple docs) to justify centralizing them. Until then, no.

---

## 9. Commits, pushes, PRs

- Never commit or push without the user asking. (See the global AGENT.md in `~/CLAUDE.md` for the truthfulness rules.)
- Never use `gh` CLI. Use the GitHub MCP tools if GitHub work is needed. If GitHub MCP is unavailable, ask the user.
- Never force-push to `main` without explicit user instruction. Lovable also pushes to `main`; a force-push would destroy its work.
- Prefer feature branches for non-trivial changes in our subdirs; the website (Lovable territory) stays on `main` per Lovable's convention.

---

## 10. Skills

Skills for this repo live in `.cursor/skills/`. See [`.cursor/skills/README.md`](./.cursor/skills/README.md) for the convention.

**Growth policy**: add a skill only when a pattern has been repeated — or is clearly about to be — and the instructions are non-obvious enough that re-deriving them next time would waste effort. Do not seed speculative skills. The authoring tool is the existing workspace-level `create-skill` skill at `/Users/williamprior/.cursor/skills-cursor/create-skill/SKILL.md`.

### Skill candidates (watchlist)

Patterns to watch for. Each gets promoted to a real skill the second time we do one, or when the user confirms it's worth codifying. Already-promoted skills live in [`.cursor/skills/`](./.cursor/skills/); entries below are candidates only.

**Repo-process skills (meta, about how we work in this repo):**

- **`diagram-author`** — authoring/updating a Mermaid diagram to the §8 style rules. Promote on the second diagram.
- **`concept-to-doc-placement`** — the routing logic in §7. Promote if we find ourselves re-deriving where something goes.
- **`terminology-consistency`** — scanning edits for glossary drift and fixing it. Promote if/when drift actually happens.

**Platform-build skills (about Jungl3 itself):**

- **`aws-deployment-synthesis`** — turning an architecture decision into concrete AWS service selection (account, region, runtime, networking). Promote once the first domain deploys.
- **`vend-a-jungle`** — the repeatable flow for provisioning a new per-team Jungle + DMZ + Canopy. Promote once the control plane has its first working vend.
- **`register-to-canopy`** — the Integration Contract implementation checklist for getting a prototype listed inside its install's Canopy Gallery. Promote once the contract is finalized and the Gallery consumes it.
- **`synthetic-data-seed`** — authoring + wiring a new fake-data generator / event emitter for a domain starter. Promote once there are two of them.
- **`sub-agent-author`** — the `{status, summary, evidence, recommended_action}` response contract (pinned in [ADR 0002](./docs/decisions/0002-sub-agent-response-contract.md); architecture in [`docs/architecture/agent-layer.md`](./docs/architecture/agent-layer.md)) plus tooling scaffold for a new specialist agent. Promote on the second sub-agent.
- **`cli-command-author`** — adding a new command to the operator CLI. Promote once the CLI has three commands.
- **`lovable-safe-edit`** — editing `src/` safely alongside Lovable. Promote if we do it repeatedly.

---

## 11. Open decisions (unresolved, do not invent answers)

Flag when relevant to a task. Do **not** guess an answer; ask. When resolved, promote to `docs/decisions/NNNN-slug.md` and remove from this list. Each item is one line — the source (ADR / review / archived memo) is linked inline for detail when needed.

### AWS Marketplace listing & packaging

1. **Pricing model.** Free / subscription / usage-based / private-offer. Analyst recommendation on record: free or low-cost subscription initially.
2. **Stack structure.** Single CloudFormation stack vs nested components. Affects upgrade strategy (#3).
3. **Update/upgrade strategy.** How new listing versions ship to existing installs without destroying customer data. The hard problem.
4. **Minimum IAM permissions.** The permission set the install requires. Every permission is a security-review conversation; fewer is better. Interacts with #36 (Vendor Insights).
5. **Supported AWS regions at launch.**
6. **Supported customer account scenarios.** Single-account vs Control Tower / multi-account. Each adds install-time branching.
7. **IaC authoring tool.** CFN directly / CDK / SAM / Pulumi. Becomes concrete the moment `control-plane/` starts.
8. **CI/CD for the listing itself.** GitHub Actions + OIDC into Jungl3's build account. Not yet set up.
34. **Solo-support operating model.** Opened by the [2026-04-24 viability review](./docs/reviews/2026-04-24-viability-review.md) §5. Support commitment on the listing (SLA, scope limits, paid-support tier) undecided. Becomes concrete before publication.
35. **FTR and "Deployed on AWS" designation posture.** Opened by the archived [sales strategy memo](./docs/research-archive/user-memos-2026-04-24/aws-marketplace-sales-strategy-report.md). Pursue on v1 listing, defer, or target a later milestone — undecided. Interacts with #34.
36. **Vendor Insights adoption.** Opened by the archived [sales strategy memo](./docs/research-archive/user-memos-2026-04-24/aws-marketplace-sales-strategy-report.md). Publish at launch, defer until first enterprise prospect asks, or skip entirely — undecided.
37. **Co-sell / ACE / MDF posture.** Opened by the archived [sales strategy memo](./docs/research-archive/user-memos-2026-04-24/aws-marketplace-sales-strategy-report.md). Blocked on #31 — no co-sell story without a reference customer.

### In-install operation (customer's AWS account)

9. **Canopy authentication for external users.** See [`docs/architecture/canopy.md`](./docs/architecture/canopy.md). (Previously "DMZ authentication"; re-homed by [ADR 0011](./docs/decisions/0011-canopy-and-ai-first-dmz.md).)
10. **Canopy AWS topology within a customer account.** VPC / ALB / WAF / DNS apex. (Previously "DMZ topology"; re-homed by [ADR 0011](./docs/decisions/0011-canopy-and-ai-first-dmz.md).)
11. **Control Plane runtime.** Lambda vs ECS/Fargate vs other. A decision here must name runtime for both Control Plane and application compute.
12. **Canopy prototype lifespan.** Retention criteria, extension path, teardown enforcement.
13. **Required Canopy telemetry and feedback capture.** What every Canopy-deployed prototype must emit. Affects judging. Interacts with #25.
14. **Data classification rules.** Jungl3 advises, customer enforces under the installable model. Recommendation shape and exception flow TBD.
15. **Cross-install discoverability.** Default per [ADR 0003](./docs/decisions/0003-installable-via-aws-marketplace.md) is no. A federated model would require a new design.
16. **Canonical maker-checker workflow for v1.** Opened by [ADR 0006](./docs/decisions/0006-v1-domain-anchor-insurance-claims.md). Default absent other input: settlement approval above a threshold. Resolves with first design-partner conversation.
17. **Realism threshold for a first Jungle.** [`findings.md §5.5`](./docs/research/findings.md#5.5-the-numbers-for-minimum-viable-realism-are-tighter-than-youd-guess) adopts tighter numbers implicitly than the archived first-gen memos. Whether to pin in an ADR is undecided.
18. **LLM budget enforcement mechanism details.** Opened by [ADR 0007](./docs/decisions/0007-v1-cost-profile-and-llm-metering.md). Budget-record data model, pricing-calibration plan, top-up UX, cost-estimate validation harness — all undecided. Becomes a design doc when the `llm-gateway` Lambda is implemented.
22. **State-aware SLA timers vs generic SLA with a `jurisdiction` field.** Opened by [2026-04-22 SYNTHESIS.md §5](./docs/research/deep-research-2026-04-22/SYNTHESIS.md). Resolves during the Candidate E ("regulatory surface") ADR draft.
23. **Mid-execution LLM budget exhaustion signaling.** Opened by [2026-04-22 SYNTHESIS.md §5](./docs/research/deep-research-2026-04-22/SYNTHESIS.md). How `llm-gateway` signals `InsufficientFunds` to a mid-loop Step Functions state machine, and how it degrades without plausibility collapse.
24. **SME exemplar commission timing.** Opened by [2026-04-22 SYNTHESIS.md §3.2](./docs/research/deep-research-2026-04-22/SYNTHESIS.md). Whether v1 gates on 24 SME-authored exemplars first, or ships with placeholders and swaps in.

### DMZ / Canopy (opened by [ADR 0011](./docs/decisions/0011-canopy-and-ai-first-dmz.md))

25. **DMZ → Canopy promotion gate shape.** AI criteria, human approval, or hybrid. Interacts with #13 and #29.
26. **DMZ agent runtime choice.** Claude Computer Use / Playwright MCP / custom / mix. See [`docs/research/synthetic-user-testing/`](./docs/research/synthetic-user-testing/).
27. **DMZ AWS topology within a customer account.** No external ingress; threat model differs from #10 (Canopy topology).
28. **Synthetic-user-tester placement.** UST-C1 candidate ([`synthetic-user-testing/CANDIDATES.md`](./docs/research/synthetic-user-testing/CANDIDATES.md)). Agent Layer specialist vs own top-level domain vs DMZ primitive. Leaning Agent Layer specialist.
29. **Promotion criteria for the DMZ → Canopy gate.** Narrower than #25: what "passed" looks like. Needs a first concrete evaluation run to resolve.
30. **DMZ vs Canopy persona schema alignment.** One schema consumed differently, or two schemas intentionally.

### Other

20. **Kiro CLI vs custom CLI.**
21. **First-sponsor / first-customer context.** Docs stay sponsor-agnostic; specific context accumulates separately when relevant.
31. **First design partner acquisition path.** Opened by [2026-04-24 viability review](./docs/reviews/2026-04-24-viability-review.md) §7 — "the single most concerning item in the repo." See also [research-sufficiency note](./docs/reviews/2026-04-24-research-sufficiency.md). Resolves when a named conversation is on the calendar.
32. **v0.5 scope vs v1 scope.** Draft resolution in [ADR 0012](./docs/decisions/0012-v0.5-wedge-scope.md) (Proposed). Resolves when that ADR is accepted or rejected.
33. **ICP narrowing in [`positioning.md`](./docs/product/positioning.md).** Held pending #31 — narrowing on founder opinion is weaker than narrowing on a named customer.

For **decided** things, see [`docs/decisions/`](./docs/decisions/).

---

## 12. Style

- TypeScript for all new code in the repo unless a domain has a principled reason otherwise (e.g., a Python-native agent, a Go-native CLI).
- ES modules, named exports, `async/await`.
- shadcn/ui + Tailwind v4 for any UI inside the Lovable-owned website; for our own UIs in subdirs, we may choose differently.
- Comments explain **why**, not what. No narration comments. No "Import the module" / "Return the result" noise.
- Prefer deletion over addition. Prefer clarity over cleverness. Each abstraction must earn its place.
- Keep docs minimal. A good doc teaches one thing well.

---

## 13. If in doubt

Ask. Especially before:
- Touching anything in the Lovable-owned path list.
- Deploying or modifying any AWS resource.
- Creating a new top-level subdirectory.
- Creating a new file in `docs/architecture/` or `docs/decisions/` — check §7 placement first.
- Adding a root-level config, tool, or dependency.
- Committing or pushing.
- Writing a diagram or doc that invents architecture detail not present in `doc.md`, `doc2.md`, or existing `docs/`.
