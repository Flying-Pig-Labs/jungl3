import { App, BootstraplessSynthesizer } from 'aws-cdk-lib';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JungleStack } from './jungle-stack';

/** Synthesizes the Jungle stack on its own and returns the CloudFormation template as an object. */
export function synthJungleTemplate(): Record<string, unknown> {
  const app = new App({ outdir: mkdtempSync(join(tmpdir(), 'jungle-synth-')) });
  new JungleStack(app, 'Jungle', { synthesizer: new BootstraplessSynthesizer() });
  return app.synth().getStackByName('Jungle').template as Record<string, unknown>;
}

/** Writes the template to a file so the Control Plane stack can ship it as an S3 asset. */
export function writeJungleTemplate(): string {
  const path = join(mkdtempSync(join(tmpdir(), 'jungle-template-')), 'jungle.template.json');
  writeFileSync(path, JSON.stringify(synthJungleTemplate(), null, 1));
  return path;
}
