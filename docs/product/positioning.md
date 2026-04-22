# Positioning

How Jungle3 is framed for the people who build, fund, judge, and use it. This is product framing, not architecture. For architecture see [`../architecture/system-context.md`](../architecture/system-context.md); for terms see [`../glossary.md`](../glossary.md).

## One-liner

**Start with a working product. Then make it worth using.**

Longer form: Jungle3 generates and deploys a working, integrated application so teams can start from reality instead of from scratch.

## The mental flip

The traditional motion is **additive from zero**:

> idea → design → scaffold → wire infra → connect services → deploy → test → iterate

Jungle3's motion is **shape a living baseline**:

> idea → vend a living system → trim, substitute, and extend → test → iterate

Teams are not handed a blank page. They are handed an [Understory](../glossary.md#understory): deployed, integrated, emitting, rendering — a baseline that is already complete enough to be real on day one. Their job is to **shape it into the prototype they intend.** That shaping includes cutting parts that do not belong, substituting in parts that do, and adding what the baseline does not cover. Subtraction is a primary motion, not the only one.

This is how most production systems actually evolve. Jungle3 just compresses the front half of that curve.

## Why a living baseline

Starting from zero delays the first real interaction with a product. A team building up from nothing spends its early days on scaffolding, auth, data wiring, deploy plumbing — work that doesn't answer the one question that matters: *does this solve anything for anyone?*

Starting from a living baseline collapses that gap. Because the system is already alive, the first decision is a product decision, not an infrastructure one.

Trade-off, stated plainly: teams inherit complexity they didn't choose. Shaping an over-complete system is harder than it sounds. That cost is accepted intentionally — it mirrors real-world product work, where nobody gets to start from zero either.

## Who it's for

- Internal innovation teams moving faster than their own IT can provision.
- Hackathon and innovation-sprint organizers who want teams demoing on day one, not day two.
- Product-discovery groups validating a concept with real users before committing engineering.
- Enterprise "labs" where time-to-first-click has become the binding constraint.
- Engineers who have built the same boilerplate enough times.
- Non-engineering product people who need to see a running thing to think clearly about it.

## What it replaces

The early-stage work that delays the first real user interaction:

- Scaffolding an app.
- Wiring integrations.
- Provisioning infrastructure.
- Producing realistic fake data.
- Setting up auth.
- Getting to a deployable artifact.

Jungle3 absorbs all of that into vending. A team's first action is editing something that runs, not assembling the things that let it run.

## What the platform optimizes for

1. **Time to real.** Not time to code. Time to something someone can click.
2. **Constraint.** Starting with an existing system forces decisions, tradeoffs, and simplification. A blank page invites abstraction theater.
3. **Momentum.** People react to working software faster and more usefully than they react to diagrams.

## Product pillars, in platform terms

Each of these is elaborated elsewhere; listed here only to show how the product framing maps onto the architecture.

| Pillar (product language) | Platform concept |
| --- | --- |
| Pre-built baseline app | [Jungle](../glossary.md#jungle) + [Understory](../glossary.md#understory) |
| Runs in your AWS account | [Substrate](../glossary.md#substrate) + [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md) |
| AI-driven architecture + deployment | [Control Plane](../glossary.md#control-plane) |
| Shape-a-living-baseline development model | Repo-wide principle — see [`../../CLAUDE.md`](../../CLAUDE.md) §1 |
| Built-in integrations | [Synthetic Runtime](../glossary.md#synthetic-runtime) |
| AI-first evaluation, then human exposure | [DMZ](../glossary.md#dmz) (AI) → [Canopy](../glossary.md#canopy) (humans) + [Integration Contract](../glossary.md#integration-contract) |
| Synthetic system + synthetic users | [Synthetic Runtime](../glossary.md#synthetic-runtime) + [Agent Layer](../glossary.md#agent-layer) (user-simulation) |
| CLI-native control plane | [Control Plane](../glossary.md#control-plane) operator surface |

No new concepts introduced here. If a pillar can't be expressed in existing vocabulary, the glossary is wrong and should be fixed first.

## How it ships

Jungle3 is distributed as an **AWS Marketplace listing**. A customer subscribes, launches the CloudFormation template into their own AWS account, and from that moment forward operates their own Jungle3 instance — Control Plane, Jungles, DMZs, Canopies, all of it — inside their account. Jungle3 the company does not run a hosted multi-tenant platform. See [ADR 0003](../decisions/0003-installable-via-aws-marketplace.md) and [ADR 0011](../decisions/0011-canopy-and-ai-first-dmz.md).

## Pitch form

> It's an AI system that spins up a complete, running application with integrations, data, and infrastructure already wired. Instead of spending weeks setting things up, teams start by editing something real on day one and immediately put it in front of users.

## Related

- [`../glossary.md`](../glossary.md) — canonical terms
- [`../architecture/system-context.md`](../architecture/system-context.md) — layer model
- [`../../CLAUDE.md`](../../CLAUDE.md) — repo-level guidance and the subtraction principle
