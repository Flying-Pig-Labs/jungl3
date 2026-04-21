# CLAUDE.md — jungl3

Guidance for Cursor Agent (and any Claude-family assistant) working in this repo.
Read this **before** making changes. It encodes constraints that are not obvious from the file tree.

---

## 1. What jungl3 is

jungl3 (pronounced "jungle three") is the working name for an **AI-native prototype platform** for time-boxed innovation sprints. The full concept lives in `doc.md` and `doc2.md`; the condensed version:

- **Jungle** — a pre-provisioned builder environment (app scaffold + DB + storage + seeded data + stubbed services) where a team and its AI agents modify a living system rather than build from scratch.
- **DMZ** — an isolated, externally accessible runtime where a team's prototype is deployed for real users, beta customers, and judges to interact with.
- **Marketplace** — the shared discovery and judging front door. Each team's prototype appears as a tile; judges launch into prototypes through a controlled gateway.
- **Synthetic Runtime** — fake-but-believable data, event streams, queue traffic, and stubbed APIs that make every environment feel alive on day one.
- **Agent Layer** — specialized sub-agents (Data, API, Event, Auth, Marketplace, Environment) that the primary operator agent routes questions to. Sub-agents return structured `{status, summary, evidence, recommended_action}`.
- **Control Plane / CLI** — a Claude-Code-CLI-style operator surface for vending jungles, inspecting state, running agents, registering to the marketplace. Text-forward, not a dashboard.

Design principle carried throughout: **start with too much, trim down**. Teams do not build up from a blank scaffold; they shape a Frankenstein that already runs.

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

## 7. Commits, pushes, PRs

- Never commit or push without the user asking. (See the global AGENT.md in `~/CLAUDE.md` for the truthfulness rules.)
- Never use `gh` CLI. Use the GitHub MCP tools if GitHub work is needed. If GitHub MCP is unavailable, ask the user.
- Never force-push to `main`. Lovable also pushes to `main`; a force-push would destroy its work.
- Prefer feature branches for non-trivial changes in our subdirs; the website (Lovable territory) stays on `main` per Lovable's convention.

---

## 8. Skills

Skills for this repo live in `.cursor/skills/`. See `.cursor/skills/README.md` for the convention.

**Growth policy**: add a skill only when a pattern has been repeated — or is clearly about to be — and the instructions are non-obvious enough that re-deriving them next time would waste effort. Do not seed speculative skills. The authoring tool is the existing workspace-level `create-skill` skill at `/Users/williamprior/.cursor/skills-cursor/create-skill/SKILL.md`.

### Skill candidates (watchlist)

Patterns I'll watch for. Each gets promoted to a real skill once it actually repeats or the user confirms it's worth codifying.

- **`aws-deploy-jungl3`** — how we actually push a domain subdir to AWS (which tool: CDK vs Terraform vs SAM; which region; which account; how the OIDC role is assumed). Promote once the first domain deploys.
- **`vend-a-jungle`** — the repeatable flow for provisioning a new per-team DMZ account + stack. Promote once the control-plane has its first working vend.
- **`register-to-marketplace`** — the integration-contract implementation checklist (`/metadata`, `/health`, `/launch-config`, `/demo-reset`). Promote once the contract is finalized and the marketplace-api consumes it.
- **`synthetic-data-seed`** — how to author + wire a new fake-data generator / event emitter for a domain starter. Promote once there are two of them.
- **`sub-agent-author`** — the response contract (`{status, summary, evidence, recommended_action}`) and the tooling scaffold for writing a new specialist agent. Promote once the second sub-agent is written.
- **`cli-command-author`** — how to add a new command to the operator CLI (conventions for output shape, exit codes, logging). Promote once the CLI has three commands.
- **`lovable-safe-edit`** — the protocol for editing `src/` safely alongside Lovable without trampling each other. Promote if/when we find ourselves doing this repeatedly.

---

## 9. Open decisions (unresolved, do not invent answers)

Flag these when they become relevant to a task. Do **not** guess an answer; ask the user.

1. **Website deploy target.** Today: Cloudflare Workers via Wrangler (Lovable default). Stated user intent: AWS. Likely resolution: website stays on Cloudflare for Lovable's publish loop; all other domains deploy to AWS. Not confirmed yet.
2. **Domain(s) and DNS.** No domain chosen. `doc.md` hints at a scheme like `team-x.dmz.example.com`; the real apex is TBD.
3. **IaC tool.** CDK vs Terraform vs SAM vs Pulumi — not decided. `doc.md` mentions both CDK and Terraform. Pick one per-domain, or one for the whole platform — TBD.
4. **Account strategy for v1.** `doc.md` recommends Control Tower + per-team accounts. Acceptable fallback: single sandbox account with namespace isolation. Which one for the first event is TBD.
5. **GitHub Actions + OIDC role ARN.** Not yet set up.
6. **Sprint / event name and dates.** The TTL tags in `doc.md` imply an event calendar — not yet provided.
7. **Data classification rules.** `doc.md` §8 says "synthetic, public, or scrubbed only." Who approves exceptions is TBD.
8. **Kiro CLI vs custom CLI.** `doc2.md` floats wiring in Kiro CLI/IDE for architecture + deploy. Undecided.

---

## 10. Style

- TypeScript for all new code in the repo unless a domain has a principled reason otherwise (e.g., a Python-native agent, a Go-native CLI).
- ES modules, named exports, `async/await`.
- shadcn/ui + Tailwind v4 for any UI inside the Lovable-owned website; for our own UIs in subdirs, we may choose differently.
- Comments explain **why**, not what. No narration comments. No "Import the module" / "Return the result" noise.
- Prefer deletion over addition. Prefer clarity over cleverness. Each abstraction must earn its place.

---

## 11. If in doubt

Ask. Especially before:
- Touching anything in the Lovable-owned path list.
- Deploying or modifying any AWS resource.
- Creating a new top-level subdirectory.
- Adding a root-level config, tool, or dependency.
- Committing or pushing.
