import { ClaimStore, ConflictError, route } from '../understories/claims/router';
import { SCENARIO, surgeClaims } from '../understories/claims/scenario';
import { SEED_COUNT, seedClaims } from '../understories/claims/seed';
import { Claim, ClaimStatus, WorkflowError, transition } from '../understories/claims/workflow';

const NOW = '2026-11-25T12:00:00.000Z';
const base: Claim = { claim_id: 'CLM-1', status: 'submitted', claimant: 'A', description: 'd', amount_cents: 100, line_of_business: 'auto', suspected_fraud: false, acknowledge_by: NOW, created_at: NOW, updated_at: NOW };

describe('workflow', () => {
  test('submitted -> assigned -> approved', () => {
    const assigned = transition(base, { action: 'assign', adjuster: 'Pat' }, NOW);
    expect(assigned).toMatchObject({ status: 'assigned', adjuster: 'Pat' });
    expect(transition(assigned, { action: 'approve' }, NOW).status).toBe('approved');
    expect(transition(assigned, { action: 'deny' }, NOW).status).toBe('denied');
  });
  test.each<[ClaimStatus, 'approve' | 'deny']>([['submitted', 'approve'], ['submitted', 'deny'], ['approved', 'deny'], ['denied', 'approve']])(
    'a %s claim cannot %s', (status, action) => {
      expect(() => transition({ ...base, status }, { action }, NOW)).toThrow(WorkflowError);
    });
  test.each<ClaimStatus>(['assigned', 'approved', 'denied'])('a %s claim cannot be assigned again', (status) => {
    expect(() => transition({ ...base, status }, { action: 'assign', adjuster: 'Pat' }, NOW)).toThrow(WorkflowError);
  });
});

describe('seed', () => {
  test('same seed gives byte-identical claims', () => {
    expect(JSON.stringify(seedClaims('s1'))).toBe(JSON.stringify(seedClaims('s1')));
  });
  test('a different seed gives different claims', () => {
    expect(JSON.stringify(seedClaims('s1'))).not.toBe(JSON.stringify(seedClaims('s2')));
  });
  test('12 claims, valid shape, adjuster exactly when past submitted', () => {
    const claims = seedClaims('s1');
    expect(claims).toHaveLength(SEED_COUNT);
    expect(new Set(claims.map((c) => c.claim_id)).size).toBe(SEED_COUNT);
    for (const c of claims) {
      expect(c.amount_cents).toBeGreaterThan(0);
      expect(Boolean(c.adjuster)).toBe(c.status !== 'submitted');
      expect(Date.parse(c.updated_at)).toBeGreaterThanOrEqual(Date.parse(c.created_at));
    }
  });
});

class MemoryStore implements ClaimStore {
  items = new Map<string, Claim>();
  async list() { return [...this.items.values()]; }
  async get(id: string) { return this.items.get(id); }
  async put(claim: Claim, expect: ClaimStatus | null) {
    const current = this.items.get(claim.claim_id);
    if (expect === null ? current !== undefined : current?.status !== expect) throw new ConflictError();
    this.items.set(claim.claim_id, claim);
  }
}

describe('router', () => {
  const call = (store: ClaimStore, method: string, path: string, body?: unknown) =>
    route(store, 'evt-alpha', { method, path, body: body === undefined ? undefined : JSON.stringify(body) }, () => NOW);

  test('create, assign, approve, and the change persists', async () => {
    const store = new MemoryStore();
    const created = await call(store, 'POST', '/claims', { claimant: 'Avery', description: 'Hail', amount_cents: 120000, line_of_business: 'homeowners' });
    expect(created.status).toBe(201);
    const id = JSON.parse(created.body).claim_id;
    expect((await call(store, 'PATCH', `/claims/${id}`, { action: 'approve' })).status).toBe(400);
    expect((await call(store, 'PATCH', `/claims/${id}`, { action: 'assign', adjuster: 'Pat' })).status).toBe(200);
    expect((await call(store, 'PATCH', `/claims/${id}`, { action: 'approve' })).status).toBe(200);
    expect(JSON.parse((await call(store, 'GET', `/claims/${id}`)).body).status).toBe('approved');
    expect(JSON.parse((await call(store, 'GET', '/claims')).body).claims).toHaveLength(1);
  });
  test.each([
    ['no claimant', { description: 'x', amount_cents: 1, line_of_business: 'auto' }],
    ['fractional amount', { claimant: 'a', description: 'x', amount_cents: 1.5, line_of_business: 'auto' }],
    ['negative amount', { claimant: 'a', description: 'x', amount_cents: -1, line_of_business: 'auto' }],
    ['no line of business', { claimant: 'a', description: 'x', amount_cents: 100 }],
    ['an unknown line of business', { claimant: 'a', description: 'x', amount_cents: 100, line_of_business: 'marine' }],
  ])('rejects a new claim with %s', async (_n, body) => {
    expect((await call(new MemoryStore(), 'POST', '/claims', body)).status).toBe(400);
  });
  test('rejects a body that is not JSON', async () => {
    expect((await route(new MemoryStore(), 'j', { method: 'POST', path: '/claims', body: '{' })).status).toBe(400);
  });
  test('a concurrent change is a 409, not a silent overwrite', async () => {
    const store = new MemoryStore();
    store.items.set('CLM-1', base);
    const stale: ClaimStore = { list: () => store.list(), put: (c, e) => store.put(c, e), get: async () => ({ ...base, status: 'assigned', adjuster: 'Pat' }) };
    expect((await call(stale, 'PATCH', '/claims/CLM-1', { action: 'approve' })).status).toBe(409);
    expect(store.items.get('CLM-1')?.status).toBe('submitted');
  });
  test('integration contract: /metadata returns prototype_id, /health is ok', async () => {
    expect(JSON.parse((await call(new MemoryStore(), 'GET', '/metadata')).body)).toEqual({ prototype_id: 'evt-alpha' });
    expect((await call(new MemoryStore(), 'GET', '/health')).status).toBe(200);
  });
  test('the page is served at / and unknown paths are 404', async () => {
    const page = await call(new MemoryStore(), 'GET', '/');
    expect(page.contentType).toMatch(/text\/html/);
    expect(page.body).not.toMatch(/innerHTML/);
    expect((await call(new MemoryStore(), 'GET', '/nope')).status).toBe(404);
    expect((await call(new MemoryStore(), 'DELETE', '/claims/CLM-1')).status).toBe(404);
  });
});

describe('scenario', () => {
  test('seeded claims carry the scenario fields, with the deadline 10 days after creation', () => {
    for (const c of seedClaims('s1')) {
      expect(SCENARIO.lines_of_business).toContain(c.line_of_business);
      expect(typeof c.suspected_fraud).toBe('boolean');
      expect(Date.parse(c.acknowledge_by) - Date.parse(c.created_at)).toBe(10 * 86_400_000);
    }
  });
  test('a new claim gets a deadline and is not flagged', async () => {
    const r = await route(new MemoryStore(), 'j', { method: 'POST', path: '/claims', body: JSON.stringify({ claimant: 'A', description: 'd', amount_cents: 5, line_of_business: 'auto' }) }, () => NOW);
    expect(JSON.parse(r.body)).toMatchObject({ suspected_fraud: false, acknowledge_by: '2026-12-05T12:00:00.000Z' });
  });
  test('/scenario says the rules are illustrative', async () => {
    const r = await route(new MemoryStore(), 'j', { method: 'GET', path: '/scenario' });
    expect(JSON.parse(r.body)).toMatchObject({ illustrative: true, acknowledge_within_days: 10 });
  });
  test('a surge is deterministic, all submitted, and distinct from the seed claims', () => {
    const a = surgeClaims('s1', 'storm-1', 40, NOW);
    expect(JSON.stringify(a)).toBe(JSON.stringify(surgeClaims('s1', 'storm-1', 40, NOW)));
    expect(a).toHaveLength(40);
    expect(a.every((c) => c.status === 'submitted' && c.claim_id.startsWith('SRG-storm-1-'))).toBe(true);
    expect(new Set(a.map((c) => c.claim_id)).size).toBe(40);
  });
  test('running the same surge wave twice adds nothing the second time', async () => {
    const store = new MemoryStore();
    let conflicts = 0;
    for (let run = 0; run < 2; run++) {
      for (const c of surgeClaims('s1', 'w', 5, NOW)) {
        try { await store.put(c, null); } catch (e) { if (e instanceof ConflictError) conflicts++; else throw e; }
      }
    }
    expect(store.items.size).toBe(5);
    expect(conflicts).toBe(5);
  });
  test.each([[0], [501], [1.5]])('rejects a surge of %s claims', (count) => {
    expect(() => surgeClaims('s1', 'w', count, NOW)).toThrow();
  });
  test('rejects a bad wave name', () => {
    expect(() => surgeClaims('s1', 'Wave One', 5, NOW)).toThrow();
  });
});
