import { envContext, log } from './log';
import { route } from './router';
import { DynamoClaimStore } from './store';

const store = new DynamoClaimStore(process.env.TABLE_NAME ?? '');

interface HttpEvent {
  rawPath: string;
  body?: string;
  isBase64Encoded?: boolean;
  headers?: Record<string, string>;
  requestContext: { requestId: string; http: { method: string } };
}

/** API Gateway HTTP API (payload v2) entry point for the claims Understory. */
export async function handler(event: HttpEvent) {
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
