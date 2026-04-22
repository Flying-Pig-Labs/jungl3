# CLAUDE.md — jungl3

Guidance for Cursor Agent (and any Claude-family assistant) working in this repo.
Read this **before** making changes. It encodes constraints that are not obvious from the file tree.

---

## 1. What jungl3 is

jungl3 (pronounced "jungle three") is the working name for an **AI-native prototype platform** for time-boxed innovation sprints. The full concept lives in `doc.md` and `doc2.md`; the refined distillation lives in `docs/`.

Canonical term definitions live in [`docs/glossary.md`](./docs/glossary.md). The current high-level shape, diagrammed: [`docs/architecture/system-context.md`](./docs/architecture/system-context.md).

One-line summary: **Jungle3 is distributed as an AWS Marketplace listing; once installed in a customer's AWS account, an in-account Control Plane vends isolated "Jungles" (builder environments that are alive on day one, built on an [Understory](./docs/glossary.md#understory) of pre-wired application baseline), and prototypes deploy from a Jungle to a DMZ — the single exposure surface where external visitors find, test, and judge them.** Everything else stays hidden inside the install. See [ADR 0003](./docs/decisions/0003-installable-via-aws-marketplace.md) and [ADR 0004](./docs/decisions/0004-canonical-platform-vocabulary.md).

Design principle carried throughout: **start with a living baseline, shape it.** Teams do not build up from a blank scaffold; they shape an [Understory](./docs/glossary.md#understory) that already runs. Shaping includes subtraction (the primary motion — cutting what doesn't belong), substitution (swapping parts), and addition (extending where the baseline stops). See [`docs/product/positioning.md`](./docs/product/positioning.md) for the full framing.

---

## 2. What this repo currently contains

The repo root is a **TanStack Start + React 19 + Tailwind v4 + shadcn/ui** app scaffolded by [Lovable.dev](https://lovable.dev), with Cloudflare Workers as the deploy target (`wrangler.jsonc`, `@cloudflare/vite-plugin`). It is the **AWS Marketplace listing landing page** — the public-facing sales and documentation surface for the Jungle3 AWS Marketplace listing. Currently a password-gated hero + "System Modules / Idea Engine" sections, styled around a "Welcome to the Jungl3" poster.

This is one domain of the larger platform. It is **not** the whole platform, and it is **not** a Jungle3 instance — a Jungle3 instance runs in a customer's AWS account after they subscribe via AWS Marketplace. See [ADR 0003](./docs/decisions/0003-installable-via-aws-marketplace.md).

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

Expected domain subdirs (create on first use, not speculatively). Framing is **per-install**: these components ship inside the AWS Marketplace listing and run in the customer's AWS account. They are *not* Jungle3-hosted services.

| Subdir | What lives there |
| --- | --- |
| `marketplace-listing/` | AWS Marketplace packaging: the CloudFormation/CDK template the customer launches, metadata, pricing config, security-review artifacts, and listing docs. |
| `control-plane/` | In-account orchestration code: vending Jungles and DMZs within the customer's account, lifecycle, install-scoped DNS and routing. |
| `dmz/` | DMZ provisioning templates (IaC) that stand up the exposure surface inside the customer's VPC, plus the listing/judging/feedback surface within it. |
| `synthetic-runtime/` | Fake data generators, event emitters, queue producers, stubbed services. Installed per-Jungle. |
| `agents/` | Data/API/Event/Auth/Environment/Listing sub-agents + orchestrator. See [ADR 0002](./docs/decisions/0002-sub-agent-response-contract.md) and [`docs/architecture/agent-layer.md`](./docs/architecture/agent-layer.md). |
| `cli/` | The Claude-Code-CLI-style operator console. |
| `contracts/` | Shared types: integration contract, persona schemas, event schemas, sub-agent response contract. |

None of these exist yet. Create them only when starting real work in them. Each should carry its own `README.md` and its own dependency manifest (`package.json`, `pyproject.toml`, `go.mod`, CDK app, etc.) so it can be built, tested, and deployed independently. **Do not create a root-level monorepo manager (workspaces, Turborepo, Nx) until there is a second subdir that proves the need.** Favor deletion over addition.

There is no `infra/` subdir. Under the installable model there is no "shared AWS foundation" — Jungle3 does not run its own AWS Org or host anything other than the Marketplace listing build/test. See [ADR 0003](./docs/decisions/0003-installable-via-aws-marketplace.md).

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

The profile and read-only rules apply to **Jungle3's own AWS account** — the account used to build, test, and publish the AWS Marketplace listing. That is the only AWS account Jungle3 operates directly. Customer accounts are the customer's responsibility; Jungle3 does not have credentials into them.

### Target architecture (within a customer's account)

The installed Jungle3 runs inside a single customer AWS account. Concrete topology — whether the Control Plane runs on Lambda or ECS/Fargate, single CFN stack vs nested components, IAM role minimums — is intentionally not fixed yet. Open in §11.

Historical note: `doc.md` and `doc2.md` describe a pre-[ADR 0003](./docs/decisions/0003-installable-via-aws-marketplace.md) **Jungle3-hosted** shape. Each file now carries its own frontmatter saying so; read them as design transcripts, not current architecture.

---

## 6. Authorship

Code in this repo is authored by:
- **Lovable.dev** — autonomously, inside the Lovable-owned paths (§3).
- **Cursor Agent** — everywhere else, driven by the user.

Do not sign commits with `Co-Authored-By: Claude`, `Co-Authored-By: Cursor`, or similar. Commit messages should describe the change, not the tool.

---

## 7. Information placement

Jungle3 is in the concept-to-architecture phase. Ideas arrive in fragments. Your job is to land each one where future humans and agents will find it — not leave it stranded in a random file.

When a new piece of information arrives, classify it and route it:

| Kind of information | Destination |
| --- | --- |
| What a Jungle3 concept *means* (a term, a noun) | [`docs/glossary.md`](./docs/glossary.md) |
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
- **Short labels.** `Control Plane` not `The Jungle3 Control Plane Orchestration Service`.
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

**Platform-build skills (about Jungle3 itself):**

- **`aws-deployment-synthesis`** — turning an architecture decision into concrete AWS service selection (account, region, runtime, networking). Promote once the first domain deploys.
- **`vend-a-jungle`** — the repeatable flow for provisioning a new per-team Jungle+DMZ. Promote once the control plane has its first working vend.
- **`register-to-dmz`** — the Integration Contract implementation checklist for getting a prototype listed inside its install's DMZ. Promote once the contract is finalized and the DMZ listing surface consumes it.
- **`synthetic-data-seed`** — authoring + wiring a new fake-data generator / event emitter for a domain starter. Promote once there are two of them.
- **`sub-agent-author`** — the `{status, summary, evidence, recommended_action}` response contract (pinned in [ADR 0002](./docs/decisions/0002-sub-agent-response-contract.md); architecture in [`docs/architecture/agent-layer.md`](./docs/architecture/agent-layer.md)) plus tooling scaffold for a new specialist agent. Promote on the second sub-agent.
- **`cli-command-author`** — adding a new command to the operator CLI. Promote once the CLI has three commands.
- **`lovable-safe-edit`** — editing `src/` safely alongside Lovable. Promote if we do it repeatedly.

---

## 11. Open decisions (unresolved, do not invent answers)

Flag these when they become relevant to a task. Do **not** guess an answer; ask the user. When a question here is resolved, promote it to `docs/decisions/NNNN-slug.md` and remove it from this list.

### AWS Marketplace listing & packaging

1. **Pricing model.** Free, subscription, usage-based, private-offer-only contract. Analyst recommendation on record: free or low-cost subscription initially. Not decided.
2. **Stack structure.** Single CloudFormation stack vs a root template that nests optional components (modular, parameterized, partial-install). Affects upgrade strategy.
3. **Update/upgrade strategy.** How new listing versions ship to existing installs without destroying customer data or orphaning resources. This is the hard problem.
4. **Minimum IAM permissions.** The permission set the install requires from the subscribing customer. Every additional permission is a security-team conversation; fewer is better.
5. **Supported AWS regions at launch.** No region list decided.
6. **Supported customer account scenarios.** Single-account customer? Mandatory Control Tower / multi-account? Both? Each scenario adds install-time branching.
7. **IaC authoring tool.** The listing is CloudFormation at publish time; authoring can be CFN directly, CDK compiled to CFN, SAM, or Pulumi compiled. Not decided. (Both [`docs/research/research1-aws-installable-shape.md`](./docs/research/research1-aws-installable-shape.md) and [`docs/research/research2-v1-service-build-plan.md`](./docs/research/research2-v1-service-build-plan.md) implicitly assume CloudFormation via Marketplace without committing to an authoring tool.)
8. **CI/CD for the listing itself.** GitHub Actions + OIDC into Jungle3's own build account to publish listing versions. Not yet set up.

### In-install operation (customer's AWS account)

9. **DMZ authentication for external users.** Recommendation on record: magic link + password-guest access + seeded persona/test accounts + role-based access (judge, beta user, builder, admin). Not yet decided. See [`docs/architecture/dmz.md`](./docs/architecture/dmz.md).
10. **DMZ AWS topology within a customer account.** VPC shape, ALB/WAF pattern, per-team subdomain or path routing, DNS apex strategy (customer-provided vs install-generated).
11. **Control Plane runtime.** Lambda vs ECS/Fargate vs other. `doc.md`'s ECS-Fargate recommendation was for a Jungle3-hosted shape; the installable's cost and idle-footprint profile is different. [`docs/research/research1-aws-installable-shape.md`](./docs/research/research1-aws-installable-shape.md) argues ECS/Fargate for **packaging**; [`docs/research/research2-v1-service-build-plan.md`](./docs/research/research2-v1-service-build-plan.md) implicitly proposes Lambda for **application compute**. These are easily conflated but not in conflict — a decision here must name both.
12. **DMZ prototype lifespan.** Ephemeral by default per glossary; retention criteria, extension path, and teardown enforcement mechanism within a customer-installed deployment are TBD.
13. **Required DMZ telemetry and feedback capture.** What every DMZ-deployed prototype must emit (session activity, feedback, task completion). Affects judging and cross-team comparison.
14. **Data classification rules.** `doc.md` §8 says "synthetic, public, or scrubbed only." Under the installable model, Jungle3 advises; the customer enforces. Recommendation shape, exception-approval flow, and how they're expressed inside a DMZ's data boundary are TBD.
15. **Cross-install discoverability.** Can a DMZ in Customer A's install surface prototypes from Customer B's install (for multi-company events)? Default under [ADR 0003](./docs/decisions/0003-installable-via-aws-marketplace.md) is no. A federated model would require a new design.
16. **Canonical maker-checker workflow for v1.** Opened by [ADR 0006](./docs/decisions/0006-v1-domain-anchor-insurance-claims.md). The v1 domain (insurance claims) has multiple candidates for the maker-checker canonical example — settlement approval above a threshold, policy exception approval, high-value payment issuance, SIU investigation outcome. Default absent other input: settlement approval above a threshold. Final choice depends on the first design-partner conversation.
17. **Realism threshold for a first Jungle.** [`docs/research/research1-aws-installable-shape.md`](./docs/research/research1-aws-installable-shape.md) names a "minimum viable realism" floor (5–8 entities, 3–5 roles, 4–6 async event types, 2–4 stubs, scheduled background activity, observable queues/failures, basic authz/audit, flags, dashboards). [findings.md §5.5](./docs/research/findings.md#5.5-the-numbers-for-minimum-viable-realism-are-tighter-than-youd-guess) adopts tighter numbers implicitly. Whether to pin the floor in an ADR is undecided.
18. **LLM budget enforcement mechanism details.** Opened by [ADR 0007](./docs/decisions/0007-v1-cost-profile-and-llm-metering.md). The ADR pins the $50/month default, hard cutoff, graceful degradation, and gateway-based enforcement. Still open: a real data model for the budget record (per-install, per-user?, per-purpose?), a pricing-calibration plan (LLM prices change; how does the estimator stay accurate?), a top-up UX, and a cost-estimate accuracy validation harness (does the estimator predict actual cost within, say, ±10%?). Becomes a design doc when the `llm-gateway` Lambda is implemented.
22. **State-aware SLA timers vs. generic SLA with a `jurisdiction` field.** Surfaced by the 2026-04-22 research cluster ([SYNTHESIS.md §5](./docs/research/deep-research-2026-04-22/SYNTHESIS.md), [Report 09](./docs/research/deep-research-2026-04-22/results/09-pc-regulated-cues-beyond-maker-checker.md)). State insurance codes mandate distinct acknowledgment and decision timelines (CA 15 calendar days, TX 15 business days, FL 7 calendar days, NY 15 business days). v1 could ship state-specific Step Functions `Wait` states driven by a `jurisdiction` field, or ship a single generic SLA with the field present but inert. The former is materially more credible to a former DOI examiner; the latter is materially less work. Resolves during the Candidate E ("regulatory surface") ADR draft.
23. **Mid-execution LLM budget exhaustion signaling.** Surfaced by the 2026-04-22 research cluster ([SYNTHESIS.md §5](./docs/research/deep-research-2026-04-22/SYNTHESIS.md), [Report 06](./docs/research/deep-research-2026-04-22/results/06-llm-cost-estimation-accuracy.md)). [ADR 0007](./docs/decisions/0007-v1-cost-profile-and-llm-metering.md) pins "hard cutoff with graceful degradation" but does not specify how the `llm-gateway` signals an `InsufficientFunds` event back to a Step Functions state machine that is mid-agent-loop, or how the state machine degrades without plausibility collapse. Becomes concrete when the `llm-gateway` and the first LLM-using state machine are designed together.
24. **SME exemplar commission timing.** Surfaced by the 2026-04-22 research cluster ([SYNTHESIS.md §3.2](./docs/research/deep-research-2026-04-22/SYNTHESIS.md), [Report 08](./docs/research/deep-research-2026-04-22/results/08-persona-writing-style-generation.md)). Pre-generated seed data (the shape of Candidate B ADR) requires 24 SME-authored exemplars (8 personas × 3 each) under work-for-hire copyright assignment to steer persona writing styles. Whether v1 gates on that commission happening first, or ships with placeholder exemplars and swaps them in, is undecided.

### Other

20. **Kiro CLI vs custom CLI.** `doc2.md` floats wiring in Kiro CLI/IDE for architecture + deploy. Undecided.
21. **First-sponsor / first-customer context.** Docs are intentionally sponsor-agnostic. Specific first-customer context (who, sprint name, dates, domain-starter priorities) accumulates separately when relevant.

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
