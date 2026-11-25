/**
 * Integration Contract, v0. The machine-readable way a prototype says "I exist".
 * One field on purpose (docs/reviews/2026-04-24-v0.1-plan.md §3); it grows with use.
 */
export interface IntegrationContractV0 {
  /** Stable id of the prototype. In v0.1 this is the Jungle id: `<event_id>-<team>`. */
  prototype_id: string;
}
