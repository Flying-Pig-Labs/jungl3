#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { join } from 'node:path';
import { ControlPlaneStack } from '../lib/control-plane-stack';
import { writeJungleTemplate } from '../lib/jungle-template';

const app = new cdk.App();
new ControlPlaneStack(app, 'Jungl3ControlPlane', {
  description: 'Jungl3 v0.1 Control Plane: vends and reaps Jungles.',
  jungleTemplatePath: writeJungleTemplate(),
  lambdaDist: join(__dirname, '..', 'dist', 'lambda'),
});
