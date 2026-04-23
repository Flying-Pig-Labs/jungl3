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
# Topic 6: Stub and simulator design philosophy

See `00-context.md` for product framing.

## Research questions

The stub/simulator layer — fake versions of external systems that the synthetic enterprise depends on (payment processors, identity providers, document OCR, notification services, partner APIs, core banking, etc.) — may become one of the most reused parts of Jungl3. Research what makes stubs genuinely useful for builders rather than decorative placeholders.

Investigate:

1. **Contract fidelity.** How faithfully should a stub mirror the real external API's contract — endpoints, auth, rate limits, error shapes, webhooks, pagination? What level of fidelity is required for the stub to be *replaceable* by the real system later without a rewrite?

2. **Stateful vs stateless stubs.** Should stubs store state (so that "create → read → update" works across calls) or respond statelessly? When is each correct? What are the cost/complexity trade-offs for stateful stubs?

3. **Latency and error simulation.** How much should stubs simulate realistic latency distributions, rate limits, transient errors, maintenance windows, slow pages? Does controlled chaos help or hurt a v1 product?

4. **Exposing stub internals.** Should builders be able to peek inside a stub's state, replay its history, force specific error responses, or inject scenarios? What admin surface is appropriate?

5. **Swap-out story.** How should the path from stub → real integration work? Same SDK with a config flip? Adapter layer? Published contract tests the stub and real system both satisfy?

6. **Reusability.** Should stubs be domain-specific (a "fake insurance adjuster service") or built on a reusable framework that accepts declarative specs and generates behavior? Review prior art: WireMock, MockServer, Hoverfly, Prism, MSW, Pact stubs, LocalStack, Kubecon demos.

7. **AI-driven stubs.** Is there a role for LLM-backed stubs that generate plausible responses on demand rather than relying on static fixtures? What fidelity/cost/reproducibility trade-offs does this introduce?

8. **Known failure modes.** Why do stubs typically become either "trusted too much" (blocking switch to real) or "trusted too little" (ignored, worked around)? What makes stubs earn durable trust?

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
