import { CloudFormationClient, CreateStackCommand } from '@aws-sdk/client-cloudformation';
import { jungleId, jungleStackName, parseEventSettings } from '../../contracts/event-settings.v0';

const cfn = new CloudFormationClient({});
const need = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`missing environment variable ${name}`);
  return v;
};

export interface VendInput { event_id: string; team: string; ends_at: string; seed: string }

/** Starts one team's Jungle. Returns as soon as CloudFormation accepts the stack; the caller waits for it. */
export async function handler(input: VendInput, context: { awsRequestId: string }) {
  const s = parseEventSettings({ event_id: input.event_id, teams: [input.team], ends_at: input.ends_at, seed: input.seed });
  const team = s.teams[0];
  const stackName = jungleStackName(s.event_id, team);
  const logCtx = { install_id: s.event_id, jungle_id: jungleId(s.event_id, team), trace_id: context.awsRequestId };
  const out = await cfn.send(new CreateStackCommand({
    StackName: stackName,
    TemplateURL: need('TEMPLATE_URL'),
    RoleARN: need('CFN_ROLE_ARN'),
    Capabilities: ['CAPABILITY_IAM'],
    OnFailure: 'DELETE',
    TimeoutInMinutes: 10,
    Parameters: [
      { ParameterKey: 'InstallId', ParameterValue: s.event_id },
      { ParameterKey: 'TeamName', ParameterValue: team },
      { ParameterKey: 'Seed', ParameterValue: s.seed },
      { ParameterKey: 'CodeBucket', ParameterValue: need('CODE_BUCKET') },
      { ParameterKey: 'ApiCodeKey', ParameterValue: need('API_CODE_KEY') },
      { ParameterKey: 'SeederCodeKey', ParameterValue: need('SEEDER_CODE_KEY') },
    ],
    Tags: [
      { Key: 'jungl3:event_id', Value: s.event_id },
      { Key: 'jungl3:team', Value: team },
      { Key: 'jungl3:ends_at', Value: s.ends_at },
    ],
  }));
  console.log(JSON.stringify({ ts: new Date().toISOString(), level: 'info', msg: 'vend started', ...logCtx, stack_name: stackName }));
  return { stack_name: stackName, stack_id: out.StackId };
}
