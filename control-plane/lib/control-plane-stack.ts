import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import { join } from 'node:path';

export interface ControlPlaneStackProps extends StackProps {
  /** Path to the synthesized Jungle template (see jungle-template.ts). */
  jungleTemplatePath: string;
  /** Directory with the bundled Lambdas (scripts/build-lambdas.mjs). */
  lambdaDist: string;
}

/**
 * The in-account Control Plane for v0.1: a vend Lambda, a reap Lambda, and the
 * role CloudFormation assumes to build a Jungle. The Lambdas can only start and
 * stop `jungl3-*` stacks; the power to create resources sits in the CloudFormation
 * role, scoped to `jungl3`-named resources.
 */
export class ControlPlaneStack extends Stack {
  constructor(scope: Construct, id: string, props: ControlPlaneStackProps) {
    super(scope, id, props);
    const zip = (name: string) => new Asset(this, `${name}Code`, { path: join(props.lambdaDist, name) });
    const apiCode = zip('claims-api');
    const seederCode = zip('claims-seeder');
    const template = new Asset(this, 'JungleTemplate', { path: props.jungleTemplatePath });

    const arn = (service: string, resource: string, region = this.region) => `arn:${this.partition}:${service}:${region}:${this.account}:${resource}`;
    const jungleStacks = arn('cloudformation', 'stack/jungl3-*/*');

    const cfnRole = new iam.Role(this, 'JungleCfnRole', {
      assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
      description: 'CloudFormation assumes this to create and delete one Jungle.',
    });
    cfnRole.addToPolicy(new iam.PolicyStatement({ actions: ['dynamodb:*'], resources: [arn('dynamodb', 'table/jungl3-*')] }));
    cfnRole.addToPolicy(new iam.PolicyStatement({ actions: ['lambda:*'], resources: [arn('lambda', 'function:jungl3-*')] }));
    cfnRole.addToPolicy(new iam.PolicyStatement({ actions: ['logs:*'], resources: [arn('logs', 'log-group:/jungl3/*'), arn('logs', 'log-group:/jungl3/*:*')] }));
    cfnRole.addToPolicy(new iam.PolicyStatement({ actions: ['logs:DescribeLogGroups'], resources: ['*'] }));
    cfnRole.addToPolicy(new iam.PolicyStatement({
      actions: ['apigateway:GET', 'apigateway:POST', 'apigateway:PUT', 'apigateway:PATCH', 'apigateway:DELETE', 'apigateway:TagResource', 'apigateway:UntagResource'],
      resources: [`arn:${this.partition}:apigateway:${this.region}::/apis`, `arn:${this.partition}:apigateway:${this.region}::/apis/*`, `arn:${this.partition}:apigateway:${this.region}::/tags/*`],
    }));
    cfnRole.addToPolicy(new iam.PolicyStatement({
      actions: ['iam:CreateRole', 'iam:DeleteRole', 'iam:GetRole', 'iam:PassRole', 'iam:TagRole', 'iam:UntagRole', 'iam:PutRolePolicy', 'iam:DeleteRolePolicy', 'iam:GetRolePolicy', 'iam:AttachRolePolicy', 'iam:DetachRolePolicy'],
      resources: [arn('iam', 'role/jungl3-*', '')],
    }));
    apiCode.grantRead(cfnRole);
    seederCode.grantRead(cfnRole);

    const logGroup = new logs.LogGroup(this, 'Logs', { retention: logs.RetentionDays.ONE_MONTH, removalPolicy: RemovalPolicy.DESTROY });
    const fn = (id: string, name: string, environment: Record<string, string>) => new lambda.Function(this, id, {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(join(props.lambdaDist, name)),
      memorySize: 256,
      timeout: Duration.seconds(30),
      logGroup,
      environment,
    });

    const vend = fn('Vend', 'vend', {
      TEMPLATE_URL: template.httpUrl,
      CODE_BUCKET: apiCode.s3BucketName,
      API_CODE_KEY: apiCode.s3ObjectKey,
      SEEDER_CODE_KEY: seederCode.s3ObjectKey,
      CFN_ROLE_ARN: cfnRole.roleArn,
    });
    template.grantRead(vend);
    vend.addToRolePolicy(new iam.PolicyStatement({ actions: ['cloudformation:CreateStack', 'cloudformation:DescribeStacks'], resources: [jungleStacks] }));
    vend.addToRolePolicy(new iam.PolicyStatement({ actions: ['iam:PassRole'], resources: [cfnRole.roleArn] }));

    const reap = fn('Reap', 'reap', { CFN_ROLE_ARN: cfnRole.roleArn });
    reap.addToRolePolicy(new iam.PolicyStatement({ actions: ['cloudformation:DeleteStack', 'cloudformation:DescribeStacks'], resources: [jungleStacks] }));
    reap.addToRolePolicy(new iam.PolicyStatement({ actions: ['cloudformation:ListStacks', 'tag:GetResources'], resources: ['*'] }));
    reap.addToRolePolicy(new iam.PolicyStatement({ actions: ['iam:PassRole'], resources: [cfnRole.roleArn] }));

    new CfnOutput(this, 'VendFunctionName', { value: vend.functionName });
    new CfnOutput(this, 'ReapFunctionName', { value: reap.functionName });
    new CfnOutput(this, 'LogGroupName', { value: logGroup.logGroupName });
  }
}
