# Research context

You are producing a deep-research report for **Jungl3** (stylized `jungl3`), a product with the following characteristics.

## What Jungl3 is

Jungl3 generates, deploys, and vends pre-built, integrated, "Frankenstein" enterprise applications so product teams can start from a living, working system rather than from a blank page. Teams then **subtract** and reshape the generated system into their real product, instead of additively building from scratch.

Key properties:

- Distributed as an **AWS Marketplace** listing. Customers subscribe, launch a CloudFormation template into their own AWS account, and operate their own Jungl3 instance entirely inside that account. There is no hosted multi-tenant SaaS version of Jungl3 itself.
- Each "Jungle" is a synthetic but believable enterprise environment: microservices, queues, events, stubs, scheduled jobs, seed data, personas, dashboards, audit trails, workflow state transitions, and background activity — all deployed, running, and interacting on day one.
- The v1 domain anchor is loosely **insurance-adjacent case processing** (claims, reviews, approvals, exception handling), but this is explicitly up for pressure-testing.
- The central product thesis is "time to real": time from `subscribe` to the first click on running software that feels like a real enterprise system, not a demo.
- The central failure mode is **plausibility collapse**: the moment a user (builder, judge, buyer) spots that the data, workflows, personas, or system behavior are obviously fake, every other investment loses value.

## Who the research audience is

Jungl3 engineering and product leadership. They want **actionable, decision-ready findings** — concrete recommendations, named trade-offs, and named failure modes — not a survey. Assume they are technically sophisticated. Prefer opinionated synthesis over neutral hedging. Cite named systems, companies, and patterns where useful.

## Output expectations for every research task

Every deep-research report should end with a section titled **"Decision-ready recommendations for Jungl3"** that states, in 5–10 bullets:

- What Jungl3 should do in v1.
- What Jungl3 should explicitly defer past v1.
- The single biggest risk if Jungl3 ignores this topic.
- Any cross-links to the other 11 research topics where this one has knock-on effects.

Treat this as a genuine advisory document. Be direct. It is better to be sharply opinionated and wrong in a named way than to be vaguely comprehensive.
# Topic 12: Extension model for future domain variants

See `00-context.md` for product framing.

## Research questions

Jungl3's v1 picks one domain anchor (see Topic 2), but the long-term vision is multiple domain variants — different synthetic worlds sharing a common platform. Research how to architect the platform so domain variance is cheap to add, without premature abstraction in v1.

Investigate:

1. **Universal platform pieces.** Which components are domain-agnostic and should live in a shared core: control plane, deployment, observability, auth, event bus, workflow engine, stub framework, seed-data generator, admin surface, billing/entitlement? What is the minimal shared core?

2. **Domain modules.** Which components must be domain-specific: entity schemas, workflow definitions, personas, scenario packs, seed fixtures, domain-specific stubs, domain-specific UIs? How should these be packaged — as plugins, npm packages, CDK constructs, Terraform modules, declarative YAML?

3. **Schema standardization.** What common schema primitives generalize across domains (case, actor, event, document, approval, assignment, comment, attachment)? Cite prior art: FHIR (healthcare), ACORD (insurance), schema.org, OpenTelemetry event conventions.

4. **Event taxonomy.** Can a single cross-domain event taxonomy (created, updated, assigned, approved, escalated, completed) cover most needs, with domain-specific extensions for the rest? What do cross-domain tools like Segment, mParticle, CloudEvents do?

5. **Seed/scenario pack swapping.** How should scenario packs be discoverable, versioned, and swappable at install time or runtime? Reference patterns: Helm charts, dbt seeds, Terraform modules, Temporal namespaces, multi-tenant database fixtures.

6. **Stub reusability across domains.** Are stubs best organized as a generic framework (declarative "I want a stub API with these endpoints and state") or as a catalog of domain-specific prebuilt stubs? How do tools like WireMock, LocalStack, and Prism handle this?

7. **Premature-abstraction risk.** When does building for multi-domain extensibility in v1 become the "enterprise museum" trap the research3.md doc warns about? What abstractions are *safe* to introduce early (schema shape, event taxonomy, stub framework) vs *dangerous* to build speculatively (plugin loader, domain-SDK, cross-domain dashboard)?

8. **Reference platforms that got this right or wrong.** Survey platforms that successfully generalized across domains (Salesforce, ServiceNow, Airtable, Retool, Temporal) and ones that didn't (internal tools, failed PaaS plays). What design decisions differentiated the outcomes?

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
