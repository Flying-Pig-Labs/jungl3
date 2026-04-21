# Topic 3: Minimum viable realism threshold

See `00-context.md` for product framing.

## Research questions

What is the **minimum** system complexity that causes a synthetic enterprise environment to cross the line from "demo" into "living, breathing environment" — and at what point does added complexity stop improving fidelity and start hurting installability, comprehension, and cost?

Research:

1. **Minimum counts.** For a believable synthetic enterprise environment, what is the minimum needed of each:
   - Microservices (named, deployed, interacting)
   - Distinct user roles / personas
   - End-to-end workflows (not just APIs — full multi-step flows with state)
   - Event/message types flowing through the system
   - External-system stubs
   - Background jobs / scheduled tasks
   - Seeded documents, records, or cases
   - Distinct UIs or admin surfaces
   - Data domains / tables
   
   Cite any published guidance, developer-experience research, or observed heuristics from production systems.

2. **Complexity-ceiling failure mode.** At what point does added realism begin to actively damage the product — slowing install, confusing users, inflating cost, making documentation unmaintainable? Are there known thresholds (# microservices past which new engineers disengage, # UIs past which users stop exploring)?

3. **The "living" threshold specifically.** What is the smallest configuration that exhibits continuous, observable background activity — events flowing, queues moving, jobs firing, state transitioning — without constant user input? This is the threshold between "demo" and "alive."

4. **Trade-off curve.** Plot realism vs cost and realism vs comprehension. Where are the knees?

5. **Prior art on minimalist realism.** Which products, platforms, training environments, or research projects have explicitly aimed at *minimalist* believability (Stripe's test mode, Temporal sample apps, AWS workshops, Salesforce org scratch orgs)? What design choices do they share?

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
