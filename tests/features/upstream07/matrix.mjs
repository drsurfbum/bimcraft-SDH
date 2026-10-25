/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const arg = k => process.argv[process.argv.indexOf(k) + 1];
const controls = [['release', path.resolve(arg('--release'))], ['candidate', process.cwd()]];
const out = path.resolve('.cc-test/upstream07'); fs.mkdirSync(out, { recursive: true });
const supported = ['mlwall','copylevel','famsolid','fammore','su878','variants','bundle-open','mep07','mass07','agent','new','rotated','fixes2'];
const external = ['plans','draw06','families','mep','ops'];
const results = [];
for (const [control, cwd] of controls) for (const flag of [...supported, ...external]) {
  const r = spawnSync(process.execPath, ['.cc-test/bin/test-bimcraft.mjs', '--' + flag], { cwd, encoding: 'utf8', maxBuffer: 32 << 20 });
  const log = (r.stdout || '') + (r.stderr || '');
  fs.writeFileSync(path.join(out, control + '-' + flag + '.log'), log);
  const cases = log.split(/\r?\n/).filter(l => /^\s*(?:ok|FAIL)\s/.test(l));
  const summary = log.match(/(\d+) passed, (\d+) failed/);
  results.push({ control, flag, required: supported.includes(flag), exitCode: r.status, cases, passed: summary ? +summary[1] : null, failed: summary ? +summary[2] : null });
  console.log(`${control} --${flag}: exit ${r.status}; ${cases.length} named assertions`);
}
for (const row of results.filter(r => r.control === 'candidate')) {
  const source = results.find(r => r.control === 'release' && r.flag === row.flag);
  row.classification = row.exitCode === 0 ? 'PASS' : source.exitCode === 0 ? 'CANDIDATE_REGRESSION' : 'CONTROL_FAILURE';
  row.caseComparison = { sameNamedAssertions: JSON.stringify(source.cases) === JSON.stringify(row.cases), releaseCount: source.cases.length, candidateCount: row.cases.length };
}
fs.writeFileSync(path.join(out, 'matrix.json'), JSON.stringify({ node: process.version, results }, null, 2));
// External/control failures stay recorded, never counted as passes. Required standalone failures block this job.
process.exitCode = results.some(r => r.required && r.exitCode !== 0) || results.some(r => r.classification === 'CANDIDATE_REGRESSION') ? 1 : 0;
