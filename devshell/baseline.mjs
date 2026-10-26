#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildMirror } from './test.mjs';
import { fetchVendor } from './fetch-vendor.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const stages = [
  { name: 'precision', args: ['--test', '--test-reporter=tap', 'tests/unit/wall-precision.test.mjs'], minimum: 7, tap: true },
  { name: 'materials', args: ['--test', '--test-reporter=tap', 'tests/unit/material-library.test.mjs'], minimum: 8, tap: true },
  ...['model', 'comforts', 'views2', 'res'].map((name, i) => ({ name, args: ['.cc-test/bin/test-bimcraft.mjs', '--' + name], minimum: [122, 103, 104, 195][i] })),
  { name: 'f02-contract', args: ['--test', '--test-reporter=tap', 'tests/features/f02/contract.test.mjs'], minimum: 21, tap: true },
  { name: 'f04-graphics', args: ['--test', '--test-reporter=tap', 'tests/features/f04/graphics.test.mjs'], minimum: 13, tap: true },
  { name: 'f05-sections', args: ['--test', '--test-reporter=tap', 'tests/features/f05/sections.test.mjs'], minimum: 18, tap: true },
  { name: 'f06-schedules', args: ['--test', '--test-reporter=tap', 'tests/features/f06/schedules.test.mjs'], minimum: 23, tap: true },
  { name: 'fixture', args: ['tests/features/f01/fixture.mjs', '--verify'], minimum: 1 },
  { name: 'source-sync-contract', args: ['--test', '--test-reporter=tap', 'tests/features/f01/source-sync.test.mjs'], minimum: 44, tap: true },
  { name: 'runner-contract', args: ['--test', '--test-reporter=tap', 'tests/features/f01/runner.test.mjs'], minimum: 19, tap: true },
];

// Counts guard against accidentally running the default reader or discovering no focused tests.
export function assess(stage, result) {
  const output = (result.stdout || '') + (result.stderr || '');
  const summary = stage.tap ? output.match(/^# pass (\d+)\r?\n# fail (\d+)/m) : output.match(/^(\d+) passed, (\d+) failed\s*$/m);
  const passed = Number(summary?.[1] || 0), failed = Number(summary?.[2] || 0);
  const skipped = output.split(/\r?\n/).filter(l => /^\s*(?:SKIP |-- |\(skipped:)|^# skipped [1-9]/i.test(l));
  return { name: stage.name, status: result.status === 0 && summary && passed >= stage.minimum && failed === 0 ? 'PASS' : 'FAIL', exitCode: result.status, passed, failed, skipped, error: result.error?.message || (!summary ? 'Execution summary missing' : passed < stage.minimum ? `Expected at least ${stage.minimum} executed passes` : null) };
}
export function runStages(plan, { cwd = ROOT, reportDir = path.join(ROOT, '.cc-test/baseline') } = {}) {
  fs.mkdirSync(reportDir, { recursive: true });
  const results = [];
  for (const stage of plan) {
    console.log(`▶ ${stage.name}: node ${stage.args.join(' ')}`);
    const result = spawnSync(process.execPath, stage.args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, CC_DEVSHELL: '1', NODE_OPTIONS: [process.env.NODE_OPTIONS, '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON'].filter(Boolean).join(' ') } });
    fs.writeFileSync(path.join(reportDir, stage.name + '.log'), (result.stdout || '') + (result.stderr || ''));
    const row = assess(stage, result); results.push(row);
    if (row.status !== 'PASS') for (const line of ((result.stdout || '') + (result.stderr || '')).split(/\r?\n/)) if (/^\s*FAIL\s/.test(line)) console.error(line);
    console.log(`${row.status} ${row.name}: ${row.passed} passed, ${row.failed} failed; ${row.skipped.length} skip/availability notices${row.error ? '; ' + row.error : ''}`);
    for (const skip of row.skipped) console.log(skip);
  }
  const report = { runtime: process.version, dirty: Boolean(spawnSync('git', ['status', '--porcelain'], { cwd, encoding: 'utf8' }).stdout?.trim()), head: spawnSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).stdout?.trim(), results, exitCode: results.some(r => r.status !== 'PASS') ? 1 : 0 };
  fs.writeFileSync(path.join(reportDir, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Evidence: ${reportDir}/summary.json (optional skips are not passes)`);
  return report;
}
function verifyOfflineVendor() {
  const { libs } = JSON.parse(fs.readFileSync(path.join(ROOT, 'devshell/vendor.json')));
  for (const [name, v] of Object.entries(libs)) for (const [file, size, hash] of v.files) {
    const p = path.join(ROOT, 'devshell/vendor', name, v.version, file);
    const b = fs.readFileSync(p);
    if (b.length !== size || crypto.createHash('sha256').update(b).digest('hex') !== hash) throw new Error('Vendor checksum mismatch: ' + p);
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some(a => a !== '--offline' && a !== '--list')) throw new Error('Supported options: --offline, --list');
    if (args.includes('--list')) { console.log(stages.map(s => `${s.name}: node ${s.args.join(' ')}`).join('\n')); }
    else {
      if (args.includes('--offline')) verifyOfflineVendor();
      else { const v = await fetchVendor(); if (v.failed.length) throw new Error(v.failed.join('\n')); }
      buildMirror();
      process.exitCode = runStages(stages).exitCode;
    }
  } catch (e) { console.error(e); process.exitCode = 1; }
}
