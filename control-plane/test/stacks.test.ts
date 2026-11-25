import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { join } from 'node:path';
import { ControlPlaneStack } from '../lib/control-plane-stack';
import { synthJungleTemplate, writeJungleTemplate } from '../lib/jungle-template';

describe('Jungle template', () => {
  const raw = synthJungleTemplate();
  const t = Template.fromJSON(raw);

  test('is self-contained: no CDK asset or bootstrap references', () => {
    const text = JSON.stringify(raw);
    expect(text).not.toMatch(/cdk-hnb659fds|BootstrapVersion|AssetParameters/);
    expect(Object.keys(raw.Parameters as object).sort()).toEqual(['ApiCodeKey', 'CodeBucket', 'InstallId', 'Seed', 'SeederCodeKey', 'TeamName']);
  });
  test('has exactly the v0.1 resources', () => {
    t.resourceCountIs('AWS::DynamoDB::Table', 1);
    t.resourceCountIs('AWS::Lambda::Function', 2);
    t.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
    t.resourceCountIs('AWS::Logs::LogGroup', 1);
    t.resourceCountIs('AWS::CloudFormation::CustomResource', 1);
    t.resourceCountIs('AWS::EC2::VPC', 0);
  });
  test('nothing survives a delete', () => {
    t.hasResource('AWS::DynamoDB::Table', { DeletionPolicy: 'Delete' });
    t.hasResource('AWS::Logs::LogGroup', { DeletionPolicy: 'Delete' });
    const retained = Object.entries(raw.Resources as Record<string, { DeletionPolicy?: string }>).filter(([, r]) => r.DeletionPolicy === 'Retain');
    expect(retained).toEqual([]);
  });
  test('both Lambdas log to the one log group and carry the correlation ids', () => {
    t.allResourcesProperties('AWS::Lambda::Function', {
      LoggingConfig: { LogGroup: Match.anyValue() },
      Environment: { Variables: Match.objectLike({ INSTALL_ID: Match.anyValue(), JUNGLE_ID: Match.anyValue(), TABLE_NAME: Match.anyValue() }) },
    });
  });
  test('table is on-demand, and the seed is passed to the seeder', () => {
    t.hasResourceProperties('AWS::DynamoDB::Table', { BillingMode: 'PAY_PER_REQUEST' });
    t.hasResourceProperties('AWS::CloudFormation::CustomResource', { Seed: { Ref: 'Seed' } });
  });
});

describe('Control Plane stack', () => {
  const app = new App();
  const stack = new ControlPlaneStack(app, 'CP', { jungleTemplatePath: writeJungleTemplate(), lambdaDist: join(__dirname, '..', 'dist', 'lambda') });
  const t = Template.fromStack(stack);
  const policies = JSON.stringify(t.findResources('AWS::IAM::Policy'));

  test('vend and reap Lambdas plus the CloudFormation role', () => {
    t.resourceCountIs('AWS::Lambda::Function', 2);
    t.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: { Statement: [Match.objectLike({ Principal: { Service: 'cloudformation.amazonaws.com' } })] },
    });
    t.hasOutput('VendFunctionName', {});
    t.hasOutput('ReapFunctionName', {});
  });
  test('the Lambdas can only touch jungl3-* stacks', () => {
    expect(policies).toMatch(/stack\/jungl3-\*\/\*/);
    expect(policies).not.toMatch(/"Action":"\*"/);
    expect(policies).not.toMatch(/"cloudformation:\*"/);
  });
  test('IAM powers are limited to jungl3-* roles', () => {
    const statements = Object.values(t.findResources('AWS::IAM::Policy')).flatMap((p) => p.Properties.PolicyDocument.Statement as { Action: string | string[]; Resource: unknown }[]);
    const iamStatements = statements.filter((s) => [s.Action].flat().some((a) => a.startsWith('iam:') && a !== 'iam:PassRole'));
    expect(iamStatements).toHaveLength(1);
    expect(JSON.stringify(iamStatements[0].Resource)).toMatch(/:role\/jungl3-\*/);
  });
});
