# Research context

You are producing a deep-research report for **Jungle3** (stylized `jungl3`), a product with the following characteristics.

## What Jungle3 is

Jungle3 generates, deploys, and vends pre-built, integrated, "Frankenstein" enterprise applications so product teams can start from a living, working system rather than from a blank page. Teams then **subtract** and reshape the generated system into their real product, instead of additively building from scratch.

Key properties:

- Distributed as an **AWS Marketplace** listing. Customers subscribe, launch a CloudFormation template into their own AWS account, and operate their own Jungle3 instance entirely inside that account. There is no hosted multi-tenant SaaS version of Jungle3 itself.
- Each "Jungle" is a synthetic but believable enterprise environment: microservices, queues, events, stubs, scheduled jobs, seed data, personas, dashboards, audit trails, workflow state transitions, and background activity — all deployed, running, and interacting on day one.
- The v1 domain anchor is loosely **insurance-adjacent case processing** (claims, reviews, approvals, exception handling), but this is explicitly up for pressure-testing.
- The central product thesis is "time to real": time from `subscribe` to the first click on running software that feels like a real enterprise system, not a demo.
- The central failure mode is **plausibility collapse**: the moment a user (builder, judge, buyer) spots that the data, workflows, personas, or system behavior are obviously fake, every other investment loses value.

## Who the research audience is

Jungle3 engineering and product leadership. They want **actionable, decision-ready findings** — concrete recommendations, named trade-offs, and named failure modes — not a survey. Assume they are technically sophisticated. Prefer opinionated synthesis over neutral hedging. Cite named systems, companies, and patterns where useful.

## Output expectations for every research task

Every deep-research report should end with a section titled **"Decision-ready recommendations for Jungle3"** that states, in 5–10 bullets:

- What Jungle3 should do in v1.
- What Jungle3 should explicitly defer past v1.
- The single biggest risk if Jungle3 ignores this topic.
- Any cross-links to the other 11 research topics where this one has knock-on effects.

Treat this as a genuine advisory document. Be direct. It is better to be sharply opinionated and wrong in a named way than to be vaguely comprehensive.
# Topic 2: Best domain anchor for Jungle3 v1

See `00-context.md` for product framing.

## Research questions

Jungle3's v1 needs a single domain anchor — the business domain whose entities, workflows, personas, seed data, and stubs shape the initial Frankenstein app. The current default is **insurance-adjacent case processing**, but this should be pressure-tested against alternatives.

Evaluate these candidate domain anchors:

1. **Insurance-like case processing** (claim intake → triage → adjudication → payout, with exceptions)
2. **Generic service-request operations** (internal help desk, IT service management, SRE on-call)
3. **Claims-adjacent workflows in adjacent industries** (warranty, returns, disputes, chargebacks)
4. **Permit / review workflows** (city permitting, regulatory submissions, grant review)
5. **Loan / application review** (mortgage, small-business loans, credit decisions, benefits eligibility)
6. **Order exception handling** (e-commerce fulfillment, 3PL ops, reverse logistics)

For each, score on:

- **Realism payoff** — how vivid can the synthetic environment feel? How rich are the edge cases?
- **Ease of understanding** — can a brand-new engineer grok the domain in under 30 minutes?
- **Seed-data simplicity** — how hard is it to produce believable synthetic records? What PII, formatting, locale, and temporal complications exist?
- **Workflow richness** — does it naturally surface async, escalations, approvals, retries, and manual review?
- **Future extensibility** — does mastering this domain open adjacent domains cleanly, or does it lock Jungle3 into a narrow world?
- **Regulated-feel without actual regulatory baggage** — does it *feel* like a regulated business without requiring HIPAA/SOX/PCI-accurate simulation?
- **Audience resonance** — which is most compelling to the current Jungle3 buyer (internal innovation teams, hackathon organizers, product-discovery groups, enterprise labs)?

Also research:

- **Existing synthetic-domain platforms** in each space (e.g., Salesforce's "Trailhead" playgrounds, SAP demo tenants, Mambu sandboxes, Guidewire demo instances, MuleSoft scenario packs). What did they pick and why?
- **Lock-in risk** — are there domains where a v1 anchor would taint Jungle3's brand/positioning in ways hard to undo?
- **Hackathon/demo fit specifically** — which domain produces the best demo in 48 hours?

Produce an opinionated ranking with a named #1 recommendation, named #2 fallback, and named domains to avoid.

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
