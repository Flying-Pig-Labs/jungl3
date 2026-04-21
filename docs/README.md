# docs/

Navigator for Jungle3 documentation.

Jungle3 is in the **concept-to-architecture phase**. These docs are living artifacts, not a finished manual. Their job is to reduce ambiguity in system design and give future contributors (human and agent) a place to land a new idea without it getting lost.

## Layout

```
docs/
  README.md                    # this file
  glossary.md                  # canonical terminology — single source of truth
  architecture/                # how the system is shaped
    system-context.md          # layer model + context diagram
  product/                     # product framing (what it is, who it's for, why)
    positioning.md
  decisions/                   # what we've actually decided, and why
    README.md
    0001-lovable-owns-repo-root.md
```

The tree is intentionally thin. New files are created when there is real material to put in them — not preemptively. See `../CLAUDE.md` §7 "Information placement" for where a new piece of information should land.

## What goes where

| Kind of information | Destination |
| --- | --- |
| What a Jungle3 concept *means* (a term, a noun) | `glossary.md` |
| How the system is structured (layers, boundaries, interactions) | `architecture/<topic>.md` |
| How the product is framed (positioning, audience, principle) | `product/<topic>.md` |
| A decision we have made and will not casually revisit | `decisions/NNNN-slug.md` |
| An open question we haven't answered yet | `../CLAUDE.md` §9 |
| A rough idea that isn't ready to commit to anywhere | Stay in `../doc.md`, `../doc2.md`, or a named scratch file — not in these docs |
| A pattern that has repeated and needs codifying for future agents | `../.cursor/skills/<name>/SKILL.md` |
| Guidance for any AI agent working in this repo | `../CLAUDE.md` (canonical) |

## What these docs are not

- **Not a product spec.** `doc.md` and `doc2.md` are the raw strategic/design source material. `docs/` is the refined, structured distillation — but only of material that is ready to be committed to.
- **Not a wiki.** Every file should earn its place. Empty or speculative stubs belong in the open-decisions list in `CLAUDE.md`, not here.
- **Not exhaustive.** If a topic isn't documented yet, it's because no one has done the work of synthesizing it. That is a feature, not a gap.

## Diagramming

Diagrams are **Mermaid**, embedded in the doc they support. One concept per diagram. See `../CLAUDE.md` §8 "Mermaid style" for the rules. A dedicated `diagrams/` directory will be created only if we accumulate enough cross-referenced diagrams to justify one.
