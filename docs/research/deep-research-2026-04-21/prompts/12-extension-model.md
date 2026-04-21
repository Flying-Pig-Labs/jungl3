# Topic 12: Extension model for future domain variants

See `00-context.md` for product framing.

## Research questions

Jungle3's v1 picks one domain anchor (see Topic 2), but the long-term vision is multiple domain variants — different synthetic worlds sharing a common platform. Research how to architect the platform so domain variance is cheap to add, without premature abstraction in v1.

Investigate:

1. **Universal platform pieces.** Which components are domain-agnostic and should live in a shared core: control plane, deployment, observability, auth, event bus, workflow engine, stub framework, seed-data generator, admin surface, billing/entitlement? What is the minimal shared core?

2. **Domain modules.** Which components must be domain-specific: entity schemas, workflow definitions, personas, scenario packs, seed fixtures, domain-specific stubs, domain-specific UIs? How should these be packaged — as plugins, npm packages, CDK constructs, Terraform modules, declarative YAML?

3. **Schema standardization.** What common schema primitives generalize across domains (case, actor, event, document, approval, assignment, comment, attachment)? Cite prior art: FHIR (healthcare), ACORD (insurance), schema.org, OpenTelemetry event conventions.

4. **Event taxonomy.** Can a single cross-domain event taxonomy (created, updated, assigned, approved, escalated, completed) cover most needs, with domain-specific extensions for the rest? What do cross-domain tools like Segment, mParticle, CloudEvents do?

5. **Seed/scenario pack swapping.** How should scenario packs be discoverable, versioned, and swappable at install time or runtime? Reference patterns: Helm charts, dbt seeds, Terraform modules, Temporal namespaces, multi-tenant database fixtures.

6. **Stub reusability across domains.** Are stubs best organized as a generic framework (declarative "I want a stub API with these endpoints and state") or as a catalog of domain-specific prebuilt stubs? How do tools like WireMock, LocalStack, and Prism handle this?

7. **Premature-abstraction risk.** When does building for multi-domain extensibility in v1 become the "enterprise museum" trap the research3.md doc warns about? What abstractions are *safe* to introduce early (schema shape, event taxonomy, stub framework) vs *dangerous* to build speculatively (plugin loader, domain-SDK, cross-domain dashboard)?

8. **Reference platforms that got this right or wrong.** Survey platforms that successfully generalized across domains (Salesforce, ServiceNow, Airtable, Retool, Temporal) and ones that didn't (internal tools, failed PaaS plays). What design decisions differentiated the outcomes?

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
