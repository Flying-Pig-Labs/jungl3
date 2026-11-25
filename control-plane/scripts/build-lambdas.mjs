// Bundles each Lambda into dist/lambda/<name>/index.js. The AWS SDK ships in the Node 22 runtime, so it stays external.
import { build } from 'esbuild';
import { rmSync } from 'node:fs';

const entries = {
  'claims-api': 'understories/claims/api.ts',
  'claims-seeder': 'understories/claims/seeder.ts',
  vend: 'lambda/vend.ts',
  reap: 'lambda/reap.ts',
};
rmSync('dist/lambda', { recursive: true, force: true });
await Promise.all(Object.entries(entries).map(([name, entry]) => build({
  entryPoints: [entry],
  outfile: `dist/lambda/${name}/index.js`,
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  external: ['@aws-sdk/*'],
  logLevel: 'warning',
})));
