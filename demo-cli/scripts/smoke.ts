#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/**
 * CI smoke test: runs `jungl3-demo --fast` end-to-end, fails if it doesn't
 * exit cleanly within the time budget. Intentionally does not parse output —
 * a terminal UI's bytes are not a stable test surface. Exit code is the
 * contract.
 */

const here = dirname(fileURLToPath(import.meta.url));
const binPath = resolve(here, '..', 'bin', 'jungl3-demo.js');

const TIMEOUT_MS = 10_000;

const child = spawn('node', [binPath, '--fast'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

let outBytes = 0;
let errBytes = 0;
child.stdout.on('data', (chunk) => {
  outBytes += chunk.length;
});
child.stderr.on('data', (chunk) => {
  errBytes += chunk.length;
});

const killTimer = setTimeout(() => {
  process.stderr.write(`smoke: timed out after ${TIMEOUT_MS}ms\n`);
  child.kill('SIGKILL');
  process.exit(1);
}, TIMEOUT_MS);

child.on('exit', (code, signal) => {
  clearTimeout(killTimer);
  if (signal) {
    process.stderr.write(`smoke: process killed by signal ${signal}\n`);
    process.exit(1);
  }
  if (code !== 0) {
    process.stderr.write(`smoke: exit code ${code} (stdout=${outBytes}B stderr=${errBytes}B)\n`);
    process.exit(code ?? 1);
  }
  if (outBytes === 0) {
    process.stderr.write('smoke: demo produced no stdout\n');
    process.exit(1);
  }
  process.stdout.write(`smoke: ok (stdout=${outBytes}B)\n`);
  process.exit(0);
});
