# CLAUDE.md — jungl3

Guidance for Cursor Agent (and any Claude-family assistant) working in this repo.
Read this **before** making changes. It encodes constraints that are not obvious from the file tree.

---

## 1. What jungl3 is

jungl3 (pronounced "jungle three") is the working name for an **AI-native prototype platform** for time-boxed innovation sprints. The full concept lives in `doc.md` and `doc2.md`; the refined distillation lives in `docs/`.

Canonical term definitions live in [`docs/glossary.md`](./docs/glossary.md). The current high-level shape, diagrammed: [`docs/architecture/system-context.md`](./docs/architecture/system-context.md).

One-line summary: **Jungle3 vends isolated "Jungles" (builder environments that are alive on day one), prototypes deploy from a Jungle to a matching DMZ (the customer-facing runtime), and DMZs appear as tiles in a shared Marketplace for users and judges.** A Control Plane vends and manages all of it.

Design principle carried throughout: **start with too much, trim down**. The primary development motion is **subtraction**, not addition: teams do not build up from a blank scaffold, they shape a [Frankenstein app](./docs/glossary.md#frankenstein-app) that already runs. See [`docs/product/positioning.md`](./docs/product/positioning.md) for the full framing.

---

## 2. What this repo currently contains

The repo root is a **TanStack Start + React 19 + Tailwind v4 + shadcn/ui** app scaffolded by [Lovable.dev](https://lovable.dev), with Cloudflare Workers as the deploy target (`wrangler.jsonc`, `@cloudflare/vite-plugin`). It is the **marketplace landing page** — currently a password-gated hero + "System Modules / Idea Engine" sections, styled around a "Welcome to the Jungl3" poster.

This is one domain of the larger platform. It is **not** the whole platform.

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

Expected domain subdirs (create on first use, not speculatively):

| Subdir | What lives there |
| --- | --- |
| `control-plane/` | Environment vending, orchestration, account/OU provisioning, lifecycle. |
| `marketplace-api/` | Backend for marketplace listings, judging workflow, feedback capture. |
| `dmz/` | Per-team DMZ runtime templates and provisioning (IaC). |
| `synthetic-runtime/` | Fake data generators, event emitters, queue producers, stubbed services. |
| `agents/` | Data/API/Event/Auth/Marketplace/Environment sub-agents + orchestrator. |
| `cli/` | The Claude-Code-CLI-style operator console. |
| `infra/` | Shared AWS foundation — Organizations, Control Tower, OIDC, WAF, Route 53. |
| `contracts/` | Shared types: integration contract, persona schemas, event schemas. |

None of these exist yet. Create them only when starting real work in them. Each should carry its own `README.md` and its own dependency manifest (`package.json`, `pyproject.toml`, `go.mod`, CDK app, etc.) so it can be built, tested, and deployed independently. **Do not create a root-level monorepo manager (workspaces, Turborepo, Nx) until there is a second subdir that proves the need.** Favor deletion over addition.

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

### Target architecture

Per `doc.md`, the platform uses an **AWS Organizations + Control Tower** model: one control-plane account, per-team DMZ accounts vended through Account Factory, shared sandbox account for lightweight experiments. Primary runtime for team apps is **ECS on Fargate** behind **ALB + WAF**, with Route 53, ACM, S3, DynamoDB, Secrets Manager, SSM Parameter Store, CloudWatch, and VPC Flow Logs as defaults. Read `doc.md` §2–§13 before designing anything that touches AWS.

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

Patterns to watch for. Each gets promoted to a real skill the second time we do one, or when the user confirms it's worth codifying.

**Repo-process skills (meta, about how we work in this repo):**

- **`diagram-author`** — authoring/updating a Mermaid diagram to the §8 style rules. Promote on the second diagram.
- **`architecture-note-synthesis`** — turning a rough architecture idea or transcript fragment into the right doc(s) in `docs/architecture/`. Promote on the second synthesis pass.
- **`concept-to-doc-placement`** — the routing logic in §7. Promote if we find ourselves re-deriving where something goes.
- **`terminology-consistency`** — scanning edits for glossary drift and fixing it. Promote if/when drift actually happens.
- **`adr-author`** — writing a new ADR from context + decision + consequences. Promote on ADR #2.

**Platform-build skills (about Jungle3 itself):**

- **`aws-deployment-synthesis`** — turning an architecture decision into concrete AWS service selection (account, region, runtime, networking). Promote once the first domain deploys.
- **`vend-a-jungle`** — the repeatable flow for provisioning a new per-team Jungle+DMZ. Promote once the control plane has its first working vend.
- **`register-to-marketplace`** — the Integration Contract implementation checklist. Promote once the contract is finalized and the marketplace-api consumes it.
- **`synthetic-data-seed`** — authoring + wiring a new fake-data generator / event emitter for a domain starter. Promote once there are two of them.
- **`sub-agent-author`** — the `{status, summary, evidence, recommended_action}` response contract plus tooling scaffold for a new specialist agent. Promote on the second sub-agent.
- **`cli-command-author`** — adding a new command to the operator CLI. Promote once the CLI has three commands.
- **`lovable-safe-edit`** — editing `src/` safely alongside Lovable. Promote if we do it repeatedly.

---

## 11. Open decisions (unresolved, do not invent answers)

Flag these when they become relevant to a task. Do **not** guess an answer; ask the user. When a question here is resolved, promote it to `docs/decisions/NNNN-slug.md` and remove it from this list.

1. **Website deploy target.** Today: Cloudflare Workers via Wrangler (Lovable default). Stated user intent: AWS. Likely resolution: website stays on Cloudflare for Lovable's publish loop; all other domains deploy to AWS. Not confirmed yet.
2. **Domain(s) and DNS.** No domain chosen. `doc.md` hints at a scheme like `team-x.dmz.example.com`; the real apex is TBD.
3. **IaC tool.** CDK vs Terraform vs SAM vs Pulumi — not decided. `doc.md` mentions both CDK and Terraform. Pick one per-domain, or one for the whole platform — TBD.
4. **Account strategy for v1.** `doc.md` recommends Control Tower + per-team accounts. Acceptable fallback: single sandbox account with namespace isolation. Which one for the first event is TBD.
5. **GitHub Actions + OIDC role ARN.** Not yet set up.
6. **Sprint / event name and dates.** The TTL tags in `doc.md` imply an event calendar — not yet provided.
7. **Data classification rules.** `doc.md` §8 says "synthetic, public, or scrubbed only." Who approves exceptions is TBD.
8. **Kiro CLI vs custom CLI.** `doc2.md` floats wiring in Kiro CLI/IDE for architecture + deploy. Undecided.

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
