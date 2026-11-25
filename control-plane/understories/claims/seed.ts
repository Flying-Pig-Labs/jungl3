import { createHmac } from 'node:crypto';
import { Claim, ClaimStatus } from './workflow';

/**
 * Deterministic seed data (ADR 0010 §2): every attribute of an entity comes from
 * HMAC-SHA256(install_seed, entity_id). No clock, no global RNG, so two vends with
 * the same seed produce byte-identical claims. All people and losses are invented.
 */
const CLAIMANTS = ['Avery Stone', 'Jordan Reyes', 'Casey Lin', 'Morgan Patel', 'Riley Okafor', 'Quinn Alvarez', 'Devon Harper', 'Sage Whitfield'];
const LOSSES = ['Rear-end collision at an intersection', 'Hail damage to roof and hood', 'Windshield cracked by road debris', 'Parked car sideswiped overnight', 'Theft of catalytic converter', 'Fender damage in a parking garage', 'Deer strike on a county road', 'Flooded interior after a storm'];
const ADJUSTERS = ['Sam Calloway', 'Pat Nguyen', 'Lee Brandt'];
const STATUSES: ClaimStatus[] = ['submitted', 'submitted', 'assigned', 'assigned', 'approved', 'denied'];
const BASE_MS = Date.UTC(2026, 0, 5, 14, 0, 0);
const DAY_MS = 86_400_000;

export const SEED_COUNT = 12;

export function seedClaims(seed: string, count: number = SEED_COUNT): Claim[] {
  return Array.from({ length: count }, (_, i) => {
    const claim_id = `CLM-${String(i + 1).padStart(4, '0')}`;
    const h = createHmac('sha256', seed).update(claim_id).digest();
    const status = STATUSES[h[2] % STATUSES.length];
    const created = BASE_MS + (h.readUInt16BE(6) % 60) * DAY_MS + (h[8] % 480) * 60_000;
    const updated = status === 'submitted' ? created : created + (1 + (h[9] % 5)) * DAY_MS;
    return {
      claim_id,
      status,
      claimant: CLAIMANTS[h[0] % CLAIMANTS.length],
      description: LOSSES[h[1] % LOSSES.length],
      amount_cents: 25_000 + (h.readUInt32BE(10) % 1_975_000),
      ...(status === 'submitted' ? {} : { adjuster: ADJUSTERS[h[3] % ADJUSTERS.length] }),
      created_at: new Date(created).toISOString(),
      updated_at: new Date(updated).toISOString(),
    };
  });
}
