# contracts/

Shared types used by more than one Jungl3 domain. Pure TypeScript, no dependencies.

| File | What it is |
| --- | --- |
| `integration-contract.v0.ts` | The first shape of the [Integration Contract](../docs/glossary.md#integration-contract): one field, `prototype_id`. Grows with use. |
| `event-settings.v0.ts` | The settings an organizer passes to vend Jungles for an event, and the parser that rejects bad ones. |

Tests live in `../control-plane/test/contracts.test.ts` until a second consumer justifies a test runner here.
