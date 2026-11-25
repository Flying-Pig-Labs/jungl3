#!/usr/bin/env node
/**
 * Operator CLI for the v0.1 Control Plane.
 *   jungl3 vend <settings.json>     vend one Jungle per team, wait, print each URL
 *   jungl3 reap <settings.json>     delete every team's Jungle, wait, verify nothing is left
 *   jungl3 surge <settings.json> <wave> <count>   add the same burst of new claims to every team's Jungle
 * Uses the AWS credentials and region already in the environment.
 */
import { CloudFormationClient, DescribeStacksCommand, waitUntilStackCreateComplete, waitUntilStackDeleteComplete } from '@aws-sdk/client-cloudformation';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { readFileSync } from 'node:fs';
import { EventSettingsV0, jungleStackName, parseEventSettings } from '../../contracts/event-settings.v0';

const CONTROL_PLANE_STACK = 'Jungl3ControlPlane';
const cfn = new CloudFormationClient({});
const lambda = new LambdaClient({});

async function outputs(stackName: string): Promise<Record<string, string>> {
  const r = await cfn.send(new DescribeStacksCommand({ StackName: stackName }));
  return Object.fromEntries((r.Stacks?.[0]?.Outputs ?? []).map((o) => [o.OutputKey ?? '', o.OutputValue ?? '']));
}

async function invoke<T>(functionName: string, payload: object): Promise<T> {
  const r = await lambda.send(new InvokeCommand({ FunctionName: functionName, Payload: Buffer.from(JSON.stringify(payload)) }));
  const body = JSON.parse(Buffer.from(r.Payload ?? []).toString('utf8') || 'null');
  if (r.FunctionError) throw new Error(body?.errorMessage ?? r.FunctionError);
  return body as T;
}

const secs = (start: number) => `${((Date.now() - start) / 1000).toFixed(0)}s`;

async function vend(s: EventSettingsV0, vendFn: string): Promise<boolean> {
  const results = await Promise.all(s.teams.map(async (team) => {
    const start = Date.now();
    const stack = jungleStackName(s.event_id, team);
    try {
      await invoke(vendFn, { event_id: s.event_id, team, ends_at: s.ends_at, seed: s.seed });
      await waitUntilStackCreateComplete({ client: cfn, maxWaitTime: 900 }, { StackName: stack });
      console.log(`vended  ${team}  ${secs(start)}  ${(await outputs(stack)).Url}`);
      return true;
    } catch (e) {
      console.error(`FAILED  ${team}  ${secs(start)}  ${(e as Error).message}`);
      return false;
    }
  }));
  return results.every(Boolean);
}

async function reap(s: EventSettingsV0, reapFn: string): Promise<boolean> {
  const results = await Promise.all(s.teams.map(async (team) => {
    const start = Date.now();
    const stack = jungleStackName(s.event_id, team);
    try {
      await invoke(reapFn, { event_id: s.event_id, team, mode: 'delete' });
      await waitUntilStackDeleteComplete({ client: cfn, maxWaitTime: 900 }, { StackName: stack });
      const v = await invoke<{ clean: boolean; stack_status: string; leftovers: string[] }>(reapFn, { event_id: s.event_id, team, mode: 'verify' });
      if (v.clean) console.log(`reaped  ${team}  ${secs(start)}  nothing left`);
      else console.error(`DIRTY   ${team}  ${secs(start)}  stack=${v.stack_status} leftovers=${JSON.stringify(v.leftovers)}`);
      return v.clean;
    } catch (e) {
      console.error(`FAILED  ${team}  ${secs(start)}  ${(e as Error).message}`);
      return false;
    }
  }));
  return results.every(Boolean);
}

async function surge(s: EventSettingsV0, wave: string, count: number): Promise<boolean> {
  const results = await Promise.all(s.teams.map(async (team) => {
    try {
      const fnName = (await outputs(jungleStackName(s.event_id, team))).ApiFunctionName;
      const r = await invoke<{ written: number }>(fnName, { surge: { wave, count } });
      console.log(`surged  ${team}  wave=${wave}  ${r.written} new claims`);
      return true;
    } catch (e) {
      console.error(`FAILED  ${team}  ${(e as Error).message}`);
      return false;
    }
  }));
  return results.every(Boolean);
}

async function main(): Promise<void> {
  const [command, file, wave, count] = process.argv.slice(2);
  if (!['vend', 'reap', 'surge'].includes(command) || !file || (command === 'surge' && (!wave || !count))) {
    console.error('usage: jungl3 vend <settings.json> | jungl3 reap <settings.json> | jungl3 surge <settings.json> <wave> <count>');
    process.exit(2);
  }
  // A reap must still work after ends_at has passed, so only vend checks that it is in the future.
  const s = parseEventSettings(JSON.parse(readFileSync(file, 'utf8')), command === 'reap' ? new Date(0) : new Date());
  if (command === 'surge') process.exit((await surge(s, wave, Number(count))) ? 0 : 1);
  const cp = await outputs(CONTROL_PLANE_STACK);
  const ok = command === 'vend' ? await vend(s, cp.VendFunctionName) : await reap(s, cp.ReapFunctionName);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
