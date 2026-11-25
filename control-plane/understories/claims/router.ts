import { randomUUID } from 'node:crypto';
import type { IntegrationContractV0 } from '../../../contracts/integration-contract.v0';
import { PAGE } from './page';
import { Claim, ClaimStatus, WorkflowError, parseAction, transition, validateNewClaim } from './workflow';

/** Storage the router needs. `expect` makes every write conditional: null = must not exist yet. */
export interface ClaimStore {
  list(): Promise<Claim[]>;
  get(id: string): Promise<Claim | undefined>;
  put(claim: Claim, expect: ClaimStatus | null): Promise<void>;
}
export class ConflictError extends Error {}

export interface Req { method: string; path: string; body?: string }
export interface Res { status: number; body: string; contentType: string }

const json = (status: number, body: unknown): Res => ({ status, body: JSON.stringify(body), contentType: 'application/json' });

function parseBody(body: string | undefined): unknown {
  try {
    return JSON.parse(body ?? '');
  } catch {
    throw new WorkflowError('request body must be JSON');
  }
}

export async function route(store: ClaimStore, jungleId: string, req: Req, now: () => string = () => new Date().toISOString()): Promise<Res> {
  const { method, path } = req;
  try {
    if (method === 'GET' && path === '/') return { status: 200, body: PAGE, contentType: 'text/html; charset=utf-8' };
    if (method === 'GET' && path === '/health') return json(200, { ok: true });
    if (method === 'GET' && path === '/metadata') {
      const contract: IntegrationContractV0 = { prototype_id: jungleId };
      return json(200, contract);
    }
    if (path === '/claims') {
      if (method === 'GET') {
        const claims = await store.list();
        return json(200, { claims: claims.sort((a, b) => a.claim_id.localeCompare(b.claim_id)) });
      }
      if (method === 'POST') {
        const fields = validateNewClaim(parseBody(req.body));
        const t = now();
        const claim: Claim = { claim_id: `CLM-${randomUUID().slice(0, 8).toUpperCase()}`, status: 'submitted', ...fields, created_at: t, updated_at: t };
        await store.put(claim, null);
        return json(201, claim);
      }
    }
    const m = /^\/claims\/([A-Za-z0-9-]{1,40})$/.exec(path);
    if (m && (method === 'GET' || method === 'PATCH')) {
      const claim = await store.get(m[1]);
      if (!claim) return json(404, { error: 'no such claim' });
      if (method === 'GET') return json(200, claim);
      const next = transition(claim, parseAction(parseBody(req.body)), now());
      await store.put(next, claim.status);
      return json(200, next);
    }
    return json(404, { error: 'not found' });
  } catch (e) {
    if (e instanceof WorkflowError) return json(400, { error: e.message });
    if (e instanceof ConflictError) return json(409, { error: 'the claim changed; reload and try again' });
    throw e;
  }
}
