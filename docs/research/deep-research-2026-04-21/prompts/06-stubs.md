# Topic 6: Stub and simulator design philosophy

See `00-context.md` for product framing.

## Research questions

The stub/simulator layer — fake versions of external systems that the synthetic enterprise depends on (payment processors, identity providers, document OCR, notification services, partner APIs, core banking, etc.) — may become one of the most reused parts of Jungle3. Research what makes stubs genuinely useful for builders rather than decorative placeholders.

Investigate:

1. **Contract fidelity.** How faithfully should a stub mirror the real external API's contract — endpoints, auth, rate limits, error shapes, webhooks, pagination? What level of fidelity is required for the stub to be *replaceable* by the real system later without a rewrite?

2. **Stateful vs stateless stubs.** Should stubs store state (so that "create → read → update" works across calls) or respond statelessly? When is each correct? What are the cost/complexity trade-offs for stateful stubs?

3. **Latency and error simulation.** How much should stubs simulate realistic latency distributions, rate limits, transient errors, maintenance windows, slow pages? Does controlled chaos help or hurt a v1 product?

4. **Exposing stub internals.** Should builders be able to peek inside a stub's state, replay its history, force specific error responses, or inject scenarios? What admin surface is appropriate?

5. **Swap-out story.** How should the path from stub → real integration work? Same SDK with a config flip? Adapter layer? Published contract tests the stub and real system both satisfy?

6. **Reusability.** Should stubs be domain-specific (a "fake insurance adjuster service") or built on a reusable framework that accepts declarative specs and generates behavior? Review prior art: WireMock, MockServer, Hoverfly, Prism, MSW, Pact stubs, LocalStack, Kubecon demos.

7. **AI-driven stubs.** Is there a role for LLM-backed stubs that generate plausible responses on demand rather than relying on static fixtures? What fidelity/cost/reproducibility trade-offs does this introduce?

8. **Known failure modes.** Why do stubs typically become either "trusted too much" (blocking switch to real) or "trusted too little" (ignored, worked around)? What makes stubs earn durable trust?

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
