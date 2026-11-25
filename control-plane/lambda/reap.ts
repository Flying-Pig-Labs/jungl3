import { CloudFormationClient, DeleteStackCommand, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { GetResourcesCommand, ResourceGroupsTaggingAPIClient } from '@aws-sdk/client-resource-groups-tagging-api';
import { jungleId, jungleStackName } from '../../contracts/event-settings.v0';

const cfn = new CloudFormationClient({});
const tagging = new ResourceGroupsTaggingAPIClient({});
const NAME = /^[a-z][a-z0-9-]{0,30}$/;

export interface ReapInput { event_id: string; team: string; mode: 'delete' | 'verify' }

/**
 * mode "delete": starts deleting one team's Jungle and returns at once.
 * mode "verify": after the delete finishes, reports whether the stack is gone and
 * lists anything still tagged for that team. An empty `leftovers` means a clean reap.
 */
export async function handler(input: ReapInput, context: { awsRequestId: string }) {
  if (!NAME.test(input.event_id ?? '') || !NAME.test(input.team ?? '')) throw new Error('event_id and team are required');
  const stackName = jungleStackName(input.event_id, input.team);
  const logCtx = { install_id: input.event_id, jungle_id: jungleId(input.event_id, input.team), trace_id: context.awsRequestId };
  const say = (msg: string, fields: object = {}) => console.log(JSON.stringify({ ts: new Date().toISOString(), level: 'info', msg, ...logCtx, ...fields }));

  if (input.mode === 'delete') {
    const roleArn = process.env.CFN_ROLE_ARN;
    if (!roleArn) throw new Error('missing environment variable CFN_ROLE_ARN');
    await cfn.send(new DeleteStackCommand({ StackName: stackName, RoleARN: roleArn }));
    say('reap started', { stack_name: stackName });
    return { stack_name: stackName, started: true };
  }
  if (input.mode !== 'verify') throw new Error('mode must be delete or verify');

  const stackStatus = await status(stackName);
  const leftovers: string[] = [];
  let token: string | undefined;
  do {
    const page = await tagging.send(new GetResourcesCommand({
      PaginationToken: token,
      TagFilters: [{ Key: 'jungl3:event_id', Values: [input.event_id] }, { Key: 'jungl3:team', Values: [input.team] }],
    }));
    leftovers.push(...(page.ResourceTagMappingList ?? []).map((r) => r.ResourceARN ?? '?'));
    token = page.PaginationToken || undefined;
  } while (token);
  const clean = stackStatus === 'GONE' && leftovers.length === 0;
  say('reap verified', { stack_status: stackStatus, leftovers: leftovers.length, clean });
  return { stack_name: stackName, stack_status: stackStatus, leftovers, clean };
}

async function status(stackName: string): Promise<string> {
  try {
    const r = await cfn.send(new DescribeStacksCommand({ StackName: stackName }));
    return r.Stacks?.[0]?.StackStatus ?? 'GONE';
  } catch (e) {
    if (/does not exist/.test(String((e as Error).message))) return 'GONE';
    throw e;
  }
}
