import { request } from 'node:https';
import { envContext, log } from './log';
import { seedClaims } from './seed';
import { ConflictError } from './router';
import { DynamoClaimStore } from './store';

interface CfnEvent {
  RequestType: 'Create' | 'Update' | 'Delete';
  ResponseURL: string;
  StackId: string;
  RequestId: string;
  LogicalResourceId: string;
  PhysicalResourceId?: string;
  ResourceProperties: { Seed: string };
}

/**
 * CloudFormation custom resource: writes the seed claims on Create/Update.
 * v0.1 seeds 12 rows inline. ADR 0010's async Step Functions handoff is the v1 shape
 * and becomes necessary once seeding can outlast one Lambda invocation.
 * Whatever happens, it must answer CloudFormation, or the stack hangs for an hour.
 */
export async function handler(event: CfnEvent): Promise<void> {
  const ctx = envContext(event.RequestId);
  let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
  let reason = 'ok';
  try {
    if (event.RequestType !== 'Delete') {
      const store = new DynamoClaimStore(process.env.TABLE_NAME ?? '');
      let written = 0;
      for (const claim of seedClaims(event.ResourceProperties.Seed)) {
        try {
          await store.put(claim, null);
          written++;
        } catch (e) {
          if (!(e instanceof ConflictError)) throw e; // already seeded: a retry, not an error
        }
      }
      log(ctx, 'info', 'seeded', { written });
    }
  } catch (e) {
    status = 'FAILED';
    reason = String(e).slice(0, 300);
    log(ctx, 'error', 'seeding failed', { error: reason });
  }
  await respond(event, status, reason);
}

function respond(event: CfnEvent, status: string, reason: string): Promise<void> {
  const body = JSON.stringify({
    Status: status,
    Reason: reason,
    PhysicalResourceId: event.PhysicalResourceId ?? `seed-${event.LogicalResourceId}`,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
  });
  return new Promise((resolve, reject) => {
    const req = request(event.ResponseURL, { method: 'PUT', headers: { 'content-type': '', 'content-length': Buffer.byteLength(body) } }, (res) => {
      res.resume();
      res.on('end', resolve);
    });
    req.on('error', reject);
    req.end(body);
  });
}
