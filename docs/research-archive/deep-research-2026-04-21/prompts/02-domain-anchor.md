# Topic 2: Best domain anchor for Jungl3 v1

See `00-context.md` for product framing.

## Research questions

Jungl3's v1 needs a single domain anchor — the business domain whose entities, workflows, personas, seed data, and stubs shape the initial Frankenstein app. The current default is **insurance-adjacent case processing**, but this should be pressure-tested against alternatives.

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
- **Future extensibility** — does mastering this domain open adjacent domains cleanly, or does it lock Jungl3 into a narrow world?
- **Regulated-feel without actual regulatory baggage** — does it *feel* like a regulated business without requiring HIPAA/SOX/PCI-accurate simulation?
- **Audience resonance** — which is most compelling to the current Jungl3 buyer (internal innovation teams, hackathon organizers, product-discovery groups, enterprise labs)?

Also research:

- **Existing synthetic-domain platforms** in each space (e.g., Salesforce's "Trailhead" playgrounds, SAP demo tenants, Mambu sandboxes, Guidewire demo instances, MuleSoft scenario packs). What did they pick and why?
- **Lock-in risk** — are there domains where a v1 anchor would taint Jungl3's brand/positioning in ways hard to undo?
- **Hackathon/demo fit specifically** — which domain produces the best demo in 48 hours?

Produce an opinionated ranking with a named #1 recommendation, named #2 fallback, and named domains to avoid.

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
