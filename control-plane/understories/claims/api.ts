import { envContext, log } from './log';
import { ConflictError, route } from './router';
import { surgeClaims } from './scenario';
import { DynamoClaimStore } from './store';

const store = new DynamoClaimStore(process.env.TABLE_NAME ?? '');

interface HttpEvent {
  rawPath: string;
  body?: string;
  isBase64Encoded?: boolean;
  headers?: Record<string, string>;
  requestContext: { requestId: string; http: { method: string } };
}

interface SurgeEvent { surge: { wave: string; count: number } }

/** Direct invoke by the organizer: adds a burst of claims. Idempotent per wave. */
async function surge(e: SurgeEvent, traceId: string) {
  const ctx = envContext(traceId);
  const seed = process.env.SEED;
  if (!seed) throw new Error('missing environment variable SEED');
  let written = 0;
  for (const claim of surgeClaims(seed, e.surge.wave, e.surge.count, new Date().toISOString())) {
    try {
      await store.put(claim, null);
      written++;
    } catch (err) {
      if (!(err instanceof ConflictError)) throw err;
    }
  }
  log(ctx, 'info', 'surge', { wave: e.surge.wave, requested: e.surge.count, written });
  return { wave: e.surge.wave, requested: e.surge.count, written };
}

/** Entry point: API Gateway HTTP API (payload v2) requests, plus the organizer's direct surge invoke. */
export async function handler(event: HttpEvent | SurgeEvent, context: { awsRequestId: string }) {
  if ('surge' in event) return surge(event, context.awsRequestId);
  const ctx = envContext(event.headers?.['x-amzn-trace-id'] ?? event.requestContext.requestId);
  const method = event.requestContext.http.method;
  const body = event.body && event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  try {
    const res = await route(store, ctx.jungle_id, { method, path: event.rawPath, body });
    log(ctx, 'info', 'request', { method, path: event.rawPath, status: res.status });
    return { statusCode: res.status, headers: { 'content-type': res.contentType, 'cache-control': 'no-store' }, body: res.body };
  } catch (e) {
    log(ctx, 'error', 'request failed', { method, path: event.rawPath, error: String(e) });
    return { statusCode: 500, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'internal error', trace_id: ctx.trace_id }) };
  }
}
