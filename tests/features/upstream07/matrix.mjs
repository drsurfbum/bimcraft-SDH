/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { applyContractTransitions, sourceProof, pins } from '../upstream08/contract-transitions.mjs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { compareAssertions, residentialDifferences, assertionName, residentialNameRules, opsTimingRule, executedAssertions } from './assertion-comparison.mjs';
const arg = k => process.argv[process.argv.indexOf(k) + 1];
const controls = [['release', path.resolve(arg('--release'))], ['candidate', process.argv.includes('--candidate') ? path.resolve(arg('--candidate')) : process.cwd()]];
// Prove these narrow transitions came from the two exact upstream releases.
for(const proof of sourceProof)for(const side of ['before','after'])assert.equal(execFileSync('git',['rev-parse',pins[side]+':'+proof.file],{encoding:'utf8'}).trim(),proof[side]);
const out = path.resolve('.cc-test/upstream07'); fs.mkdirSync(out, { recursive: true });
const supported = ['mlwall','copylevel','famsolid','fammore','su878','variants','bundle-open','mep07','mass07','agent','new','rotated','fixes2'];
const external = ['plans','draw06','families','mep','ops'];
// Run each residential section as well as --res: an unavailable sibling must not
// prevent comparison of later RC.6 names. Every candidate residential section is required.
const residential = ['rc1','rc2','rc3','rc4','rc5','rc6','rc8','rc9','rc10'];
const modes = [...supported, ...external].map(flag => ({ flag, args: ['--' + flag], required: supported.includes(flag) }));
modes.push({ flag: 'res', args: ['--res'], required: true, residential: true });
for (const part of residential) modes.push({ flag: 'res-' + part, args: ['--res','--only',part], required: true, residential: true });
const results = [];
for (const [control, cwd] of controls) for (const mode of modes) {
  const { flag } = mode;
  const r = spawnSync(process.execPath, ['.cc-test/bin/test-bimcraft.mjs', ...mode.args], { cwd, encoding: 'utf8', maxBuffer: 32 << 20 });
  const log = (r.stdout || '') + (r.stderr || '');
  fs.writeFileSync(path.join(out, control + '-' + flag + '.log'), log);
  const executed = executedAssertions(log), measuredCases = executed.map(row => row.name);
  const cases = measuredCases.map(name => assertionName(flag, name));
  const notices = log.split(/\r?\n/).filter(l => /^\s*(?:SKIP |-- |\(skipped:)/i.test(l));
  const summary = log.match(/(\d+) passed, (\d+) failed/);
  results.push({ control, flag, required: mode.required && (control === 'candidate' || !mode.residential), exitCode: r.status, cases, measuredCases, notices, passed: executed.filter(row => row.passed).length, failed: executed.filter(row => !row.passed).length, reportedSummary: summary ? {passed:+summary[1],failed:+summary[2]} : null });
  console.log(`${control} --${flag}: exit ${r.status}; ${cases.length} named assertions`);
}
for (const row of results.filter(r => r.control === 'candidate')) {
  const source = results.find(r => r.control === 'release' && r.flag === row.flag);
  row.classification = row.exitCode === 0 ? 'PASS' : source.exitCode === 0 ? 'CANDIDATE_REGRESSION' : 'CONTROL_FAILURE';
  const transition = applyContractTransitions(source.cases, row.flag);
  row.upstreamContractTransitions = transition.applied;
  row.caseComparison = compareAssertions(transition.expected, row.cases, row.flag.startsWith('res') ? residentialDifferences : []);
  if (row.caseComparison.status === 'FAIL') console.error('MISSING ASSERTIONS ' + row.flag + ': ' + row.caseComparison.missing.join(' | '));
}
fs.writeFileSync(path.join(out, 'matrix.json'), JSON.stringify({ node: process.version, upstreamContractSourceProof: { pins, sourceProof }, residentialNameRules: residentialNameRules.map(({pattern,name,reason})=>({pattern:pattern.source,name,reason})), opsTimingRule: {pattern:opsTimingRule.pattern.source,reason:opsTimingRule.reason}, results }, null, 2));
// External/control failures stay recorded, never counted as passes. Required standalone failures block this job.
process.exitCode = results.some(r => r.required && (r.exitCode !== 0 || r.failed !== 0 || !r.cases.length)) || results.some(r => r.classification === 'CANDIDATE_REGRESSION' || r.caseComparison?.status === 'FAIL') ? 1 : 0;
