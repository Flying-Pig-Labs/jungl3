# control-plane/

The in-account Control Plane for Jungl3 v0.1 (plan: [`docs/reviews/2026-04-24-v0.1-plan.md`](../docs/reviews/2026-04-24-v0.1-plan.md)). It vends one Jungle per team and reaps it again. A Jungle here is the tiny claims Understory: one `Claim` table, one API Lambda that also serves the page, and 12 seeded claims.

**Status: built and unit-tested; never deployed.** The first vend/reap run against a real account is still to do, and so are budget locks, the `ends_at` schedule and per-team permission boundaries.

## Layout

| Path | What it is |
| --- | --- |
| `bin/control-plane.ts` | CDK app. One stack: `Jungl3ControlPlane`. |
| `bin/jungl3.ts` | Operator CLI: `vend` and `reap`. |
| `lib/control-plane-stack.ts` | Vend Lambda, reap Lambda, and the role CloudFormation assumes to build a Jungle. |
| `lib/jungle-stack.ts` | One team's Jungle. Synthesized to a plain parameterized template (`lib/jungle-template.ts`) that the vend Lambda launches. |
| `lambda/` | Vend and reap handlers. |
| `understories/claims/` | The claims Understory: workflow, seed data, router, page, DynamoDB store, seeder. Budget: 400 lines. |
| `test/` | Jest tests, including the ones for `../contracts/`. |

## How a vend works

1. `cdk deploy` uploads the Jungle template and the two Understory bundles to the CDK asset bucket.
2. `jungl3 vend settings.json` calls the vend Lambda once per team. It validates the settings and starts a CloudFormation stack named `jungl3-<event_id>-<team>`, tagged `jungl3:event_id`, `jungl3:team`, `jungl3:ends_at`.
3. The stack's seeder (a custom resource) writes 12 claims derived from `HMAC-SHA256(seed, claim_id)`, so the same seed always gives the same claims.
4. The CLI waits and prints each team's URL.

`jungl3 reap settings.json` deletes each stack, waits, then asks the reap Lambda to verify that the stack is gone and nothing tagged for that team is left.

## Commands

```bash
npm install
npm run typecheck
npm test            # bundles the Lambdas, then runs jest
npm run synth

# Needs AWS credentials and an explicit go-ahead (repo CLAUDE.md §5):
npx cdk bootstrap
npx cdk deploy
npm run jungl3 -- vend settings.example.json
npm run jungl3 -- reap settings.example.json
```

## Known limits in v0.1

- The claims API is public; the unguessable-ish URL is the only boundary. Acceptable only for short-lived dev installs (plan §7).
- The seeder writes inline. [ADR 0010](../docs/decisions/0010-seeder-and-reaper-patterns.md)'s async Step Functions handoff is the v1 shape.
- `ends_at` is recorded as a tag and not yet enforced.
- Each Jungle has its own log group, `/jungl3/<event_id>/<team>`, instead of one per install.
