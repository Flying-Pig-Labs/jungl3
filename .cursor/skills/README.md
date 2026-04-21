# jungl3 skills

Project-scoped skills for Cursor Agent working in this repo. Workspace-level skills (in `~/.cursor/skills/` and `~/.cursor/skills-cursor/`) still apply.

## Where skills live

```
.cursor/skills/
  <skill-name>/
    SKILL.md        # required, frontmatter + instructions
    <support-files> # optional: templates, scripts, reference data
```

One directory per skill. The directory name is the skill name (kebab-case).

## When to add a skill

Add a skill when **all** of the following hold:

1. A task has been done, or is clearly about to be done, more than once.
2. The right way to do it is non-obvious — re-deriving it from the codebase costs real time.
3. The instructions are stable enough to write down without immediate rot.

Do **not** add skills speculatively. An empty or aspirational `SKILL.md` is worse than none — it pollutes discovery and trains the agent to trust a placeholder.

The watchlist of candidate skills — patterns we're tracking but haven't promoted yet — lives in `../../CLAUDE.md` §8 under "Skill candidates." Move an entry from that list into this directory when it's ready to be a real skill.

## How to author one

Use the workspace-level authoring skill: `/Users/williamprior/.cursor/skills-cursor/create-skill/SKILL.md`. It covers frontmatter, the "Use when..." trigger line, tone, and file layout. Follow it.

## Scope boundary

These skills are **repo-specific**. They should reference jungl3 concepts (jungle, DMZ, gallery, synthetic runtime, the Lovable boundary, AWS Marketplace listing packaging). General-purpose skills — CLI hygiene, git workflow, review habits — belong at the workspace level, not here.

## Lovable safety

Any skill that touches files inside the Lovable-owned paths listed in `../../CLAUDE.md` §3 must include a "Lovable boundary" section stating what the skill will and will not modify, and must prefer surgical edits over restructuring.
