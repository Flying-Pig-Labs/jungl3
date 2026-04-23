# 0001 — Lovable owns repo root; platform domains live in subdirs

**Status:** Accepted
**Date:** 2026-04-21

## Context

Jungl3 is a multi-domain platform (marketplace website, control plane, DMZ provisioning, synthetic runtime, agents, CLI, shared AWS infra, integration contracts). A "domain = subdir" monorepo layout is the natural fit: each domain builds, tests, and deploys independently, with its own dependency manifest.

The website — currently a TanStack Start + React 19 + Tailwind v4 + shadcn/ui app on Cloudflare Workers — is scaffolded and maintained by **Lovable.dev**, which commits directly to `main` autonomously. Lovable's file-writing logic assumes a standard Vite project **at repo root**: `src/`, `package.json`, `vite.config.ts`, `wrangler.jsonc`, `.lovable/`, and related files all live where Lovable expects them.

Moving the website into a subdirectory would break Lovable's next autonomous commit. There is no configuration knob to redirect Lovable to a subpath.

## Decision

**Each platform domain lives in its own top-level subdirectory of the repo — except the website, which stays at repo root.**

The website occupies the repo root because Lovable requires it. Every other domain (`control-plane/`, `marketplace-api/`, `dmz/`, `synthetic-runtime/`, `agents/`, `cli/`, `infra/`, `contracts/`, etc.) lives under a named top-level directory and is created only when real work starts in it.

Cursor Agent (and any other non-Lovable contributor) treats the Lovable-owned paths listed in `CLAUDE.md` §3 as off-limits for structural changes. Surgical edits inside `src/` are permitted when explicitly requested, but refactors, file moves, and renames are not.

## Consequences

**Enables:**
- Lovable continues to operate without modification.
- Other domains can have independent stacks, dependencies, and deploy pipelines.
- Clear territorial rule: root = Lovable; subdirs = us.

**Forecloses:**
- No root-level monorepo manager (workspaces, Turborepo, Nx) until a second domain proves the need. Today there is nothing to unify.
- The website cannot adopt a structure that other domains might benefit from (shared `apps/*` convention, for example).

**Accepts:**
- Merge conflicts on Lovable-owned paths are possible. Default resolution: Lovable wins.
- Website deploy target stays on Cloudflare as long as Lovable targets Cloudflare; migrating the website to AWS would require either replacing Lovable or splitting build from publish. Unresolved — see `CLAUDE.md` §9.
- The repo root looks like a Vite app, not like a platform root. Newcomers must read `CLAUDE.md` to understand it is actually both.

## Alternatives considered

- **Move website into `website/` or `marketplace-web/`.** Rejected: breaks Lovable autonomously, on its next run. Non-starter unless Lovable is first replaced.
- **Keep website at root, put nothing else in the repo.** Rejected: the platform is larger than the website; the repo will hold IaC, agents, CLI, and more. Splitting into multiple repos would fragment the design work we are doing now.
- **Multi-repo from the start.** Rejected for the same reason: Jungl3 is in the concept-to-architecture phase, and coherence across domains matters more than independent release cadence right now. A split can happen later if a domain outgrows the shared repo.
