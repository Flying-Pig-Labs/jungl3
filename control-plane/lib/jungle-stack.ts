import { CfnOutput, CfnParameter, CustomResource, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { CfnStage, HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { CfnSchedule } from 'aws-cdk-lib/aws-scheduler';
import { Construct } from 'constructs';

/**
 * One team's Jungle: the tiny claims Understory. Synthesized once into a plain,
 * parameterized CloudFormation template that the vend Lambda launches per team,
 * so it must not reference CDK assets or the bootstrap stack.
 * Everything is RemovalPolicy.DESTROY: a reaped Jungle leaves nothing behind.
 * No VPC, no ALB (ADR 0010 §5).
 *
 * Guardrails built into every Jungle:
 * - every IAM role carries the Control Plane's permissions boundary;
 * - the API and the table have hard rate caps, so a runaway client cannot run up a bill;
 * - a one-time schedule calls the reaper at ReapAt.
 */
export const LIMITS = { apiRatePerSecond: 20, apiBurst: 40, tableReadUnits: 100, tableWriteUnits: 50 } as const;

export class JungleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const p = (name: string, description: string) => new CfnParameter(this, name, { type: 'String', description }).valueAsString;
    const installId = p('InstallId', 'Event id; the install-level correlation id on every log line.');
    const team = p('TeamName', 'Team that owns this Jungle.');
    const seed = p('Seed', 'Seed for deterministic claim data.');
    const codeBucket = s3.Bucket.fromBucketName(this, 'CodeBucketRef', p('CodeBucket', 'Bucket holding the Lambda bundles.'));
    const apiKey = p('ApiCodeKey', 'S3 key of the claims API bundle.');
    const seederKey = p('SeederCodeKey', 'S3 key of the seeder bundle.');
    const boundaryArn = p('PermissionsBoundaryArn', 'Managed policy every role in this Jungle is bounded by.');
    const reapAt = p('ReapAt', 'UTC time, yyyy-mm-ddThh:mm:ss, when the reaper deletes this Jungle.');
    const reapFunctionArn = p('ReapFunctionArn', 'The Control Plane reap Lambda.');
    const schedulerRoleArn = p('SchedulerRoleArn', 'Role EventBridge Scheduler assumes to call the reap Lambda.');
    const jungleId = `${installId}-${team}`;
    iam.PermissionsBoundary.of(this).apply(iam.ManagedPolicy.fromManagedPolicyArn(this, 'Boundary', boundaryArn));

    const table = new dynamodb.Table(this, 'Claims', {
      partitionKey: { name: 'claim_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      maxReadRequestUnits: LIMITS.tableReadUnits,
      maxWriteRequestUnits: LIMITS.tableWriteUnits,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const logGroup = new logs.LogGroup(this, 'Logs', {
      logGroupName: `/jungl3/${installId}/${team}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const fn = (id: string, key: string, timeout: number) => new lambda.Function(this, id, {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromBucket(codeBucket, key),
      memorySize: 256,
      timeout: Duration.seconds(timeout),
      logGroup,
      environment: { TABLE_NAME: table.tableName, INSTALL_ID: installId, JUNGLE_ID: jungleId, SEED: seed },
    });

    const api = fn('Api', apiKey, 10);
    table.grantReadWriteData(api);
    const http = new HttpApi(this, 'Http', { defaultIntegration: new HttpLambdaIntegration('ApiIntegration', api) });

    (http.defaultStage?.node.defaultChild as CfnStage).defaultRouteSettings = {
      throttlingRateLimit: LIMITS.apiRatePerSecond,
      throttlingBurstLimit: LIMITS.apiBurst,
    };

    const seeder = fn('Seeder', seederKey, 60);
    table.grantWriteData(seeder);
    const seeded = new CustomResource(this, 'SeedData', {
      serviceToken: seeder.functionArn,
      serviceTimeout: Duration.minutes(2),
      properties: { Seed: seed },
    });
    seeded.node.addDependency(table, logGroup);

    new CfnSchedule(this, 'ReapSchedule', {
      name: `jungl3-${jungleId}-reap`,
      description: 'Deletes this Jungle after the event ends.',
      scheduleExpression: `at(${reapAt})`,
      scheduleExpressionTimezone: 'UTC',
      flexibleTimeWindow: { mode: 'OFF' },
      target: {
        arn: reapFunctionArn,
        roleArn: schedulerRoleArn,
        input: this.toJsonString({ event_id: installId, team, mode: 'delete' }),
      },
    });

    new CfnOutput(this, 'ApiFunctionName', { value: api.functionName, description: 'Invoke with {"surge":{...}} to add a burst of claims.' });
    new CfnOutput(this, 'Url', { value: http.apiEndpoint, description: 'Open this to see the claims app.' });
    new CfnOutput(this, 'LogGroupName', { value: logGroup.logGroupName });
  }
}
