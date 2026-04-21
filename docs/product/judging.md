# Judging as interaction

How judging works in a Jungle3 event. Product framing, not architecture. For the DMZ's role in this see [`../architecture/dmz.md`](../architecture/dmz.md); for terms see [`../glossary.md`](../glossary.md).

## The shift

In most innovation events, judges watch presentations. Teams perform a demo; judges grade the performance. The prototype is secondary to the pitch.

Jungle3 inverts that. Prototypes are already deployed in their DMZs, already accessible, already alive. A judge does not watch the prototype; a judge *uses* it.

## How it works

Each judge receives a **persona card** and a small set of **tasks** to attempt inside a prototype. They enter the DMZ as their assigned persona — first-time customer, frustrated repeat user, operations analyst, administrator, small-business partner — and interact with the prototype the way that persona would.

They score based on what they experienced:

- Clarity of the experience
- Usefulness
- Speed to value
- Fit for the persona
- Overall innovation

These are facets of one underlying question: **did the prototype do something useful for someone who has actually tried to use it?** A presentation cannot answer that question. A persona-driven interaction can.

## Why this works

Three reasons.

1. **Judging becomes grounded.** The judge has evidence they can point to — screens they saw, steps they tried, places they got stuck. Scores stop being taste and start being observations.
2. **Teams build for users, not for juries.** When the judging surface is the product itself, teams optimize the product, not the pitch. The incentives align with the event's actual purpose.
3. **Cross-team comparison stays honest.** Every judge experiences every prototype through the same persona lens. The variance that usually comes from "some teams had better slides" collapses.

## What the platform provides

For this model to work, the DMZ has to make the persona entry real. Concretely:

- Every prototype exposes persona-based entry points — a judge clicks "enter as operations analyst," not "log in" followed by "figure out who I'm supposed to be."
- Personas are seeded with realistic state — history, prior activity, relationships — so the prototype can react the way it would for a real version of that user.
- Feedback capture is built into the prototype's DMZ, not a separate form.
- Task completion is visible to organizers without requiring teams to instrument it.

These live in the DMZ's experience layer. See [`../architecture/dmz.md`](../architecture/dmz.md).

## Beyond the sprint

Persona-driven judging is the minimum case. The same mechanics support:

- External beta testing by real users playing themselves.
- Lightweight product validation with a controlled audience.
- Customer co-creation sessions where the prototype evolves between interactions.

In every case the DMZ is the same thing: a controlled surface where a real person meets a prototype and something gets learned. Judging is just the formalized version.

## What this doc deliberately omits

- **Scoring rubrics, weights, and tiebreakers.** Event-specific; not platform concerns.
- **Persona catalog.** Event- and domain-specific; lives with Domain Starters, not here.
- **Feedback-capture mechanics.** Architectural, not product — lives in the DMZ doc when it earns its place.

## Related

- [`../architecture/dmz.md`](../architecture/dmz.md) — where this actually happens
- [`../glossary.md#dmz`](../glossary.md#dmz)
- [`../glossary.md#sprint--event`](../glossary.md#sprint--event)
- [`./positioning.md`](./positioning.md)
