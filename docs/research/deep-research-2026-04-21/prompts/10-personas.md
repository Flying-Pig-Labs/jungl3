# Topic 10: Persona and workload realism

See `00-context.md` for product framing.

## Research questions

A living enterprise system is not just services and queues — it is people with roles, ownership, backlogs, handoffs, and awkward boundaries. Research what persona/workload design makes the human side of a synthetic environment feel real.

Investigate:

1. **Essential internal roles.** For v1 (insurance-adjacent or whichever domain anchor is chosen in Topic 2), what is the minimum role taxonomy that creates plausible handoff dynamics — e.g., intake clerk, case adjuster, senior adjuster, approver, fraud review, customer service, IT-ops-style roles (on-call, admin, auditor)? What is sufficient without overpopulation?

2. **Useful role tension.** Real organizations have friction: approvers who sit on queues, reviewers who disagree, ownership ambiguity, escalation loops. How much of this should be simulated? Where does "realistic friction" become "simulation of dysfunction" that annoys users?

3. **Pre-seeded ownership.** What should each seeded persona already "own" — open cases, assigned backlog, pending approvals, draft documents, in-progress comments? This is what makes the environment feel *inhabited* rather than blank.

4. **Handoff modeling.** How should handoffs between personas work — assignment queues, notification patterns, SLA timers, reassignment on inactivity? What prior art exists (ServiceNow ITSM workflows, Jira Service Management, Zendesk, Salesforce case routing)?

5. **Backlog shape.** Realistic backlogs are not flat. What are plausible shapes — aging distributions, priority skew, Pareto-style concentration of heavy cases? Cite operational research.

6. **External actors.** Customers, partners, vendors, auditors — which external personas should have observable behavior in the synthetic environment (submitting cases, responding late, triggering exceptions)? How is their behavior simulated — scripted schedules, agent-based simulation, LLM-driven?

7. **Simulated vs scripted behavior.** Trade-offs between a scripted scenario (reproducible, demo-friendly) and continuous agent-based simulation (organic, unpredictable). Can Jungle3 use both?

8. **Cross-reference.** How does this tie to Topic 2 (domain anchor choice affects persona set), Topic 4 (synthetic data feeds personas), Topic 5 (events drive persona activity), and Topic 11 (role separation affects regulated-feel)?

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
