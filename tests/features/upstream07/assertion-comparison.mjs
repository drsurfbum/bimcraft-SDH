/* SPDX-License-Identifier: Apache-2.0 */
// Match multiplicities as well as names. Notices never stand in for assertions.
export function compareAssertions(release, candidate, differences = []) {
  const remaining = [...candidate], missing = [], justified = [];
  for (const name of release) {
    const at = remaining.indexOf(name);
    if (at >= 0) { remaining.splice(at, 1); continue; }
    const record = differences.find(d => d.release === name && d.reason && remaining.includes(d.candidate));
    if (record) { remaining.splice(remaining.indexOf(record.candidate), 1); justified.push(record); }
    else missing.push(name);
  }
  return {
    sameNamedAssertions: JSON.stringify(release) === JSON.stringify(candidate),
    releaseCount: release.length, candidateCount: candidate.length,
    missing, added: remaining, justified, status: missing.length ? 'FAIL' : 'PASS',
  };
}

// These two upstream labels embed read-back measurements. The predicates still
// check the measured quantities/classes; compare their names independently of
// the accepted fork's different framing quantities and entity traversal order.
export const residentialNameRules = [
  { pattern: /^the cut list: \d+ pieces, \d+ board feet, 2x6 studs ordered as 8' stock$/, name: "the cut list: {pieces} pieces, {boardFeet} board feet, 2x6 studs ordered as 8' stock", reason: 'Framing quantities differ with accepted wall assemblies; retain the assertion and original measured label, not a fixed measurement target.' },
  { pattern: /^web-ifc \(oracle\): \d+ members in four assemblies$/, name: 'web-ifc (oracle): {members} members in four assemblies', reason: 'Read-back count is checked against actual members, whose count/order varies with retained wall/framing behavior.' },
];
export const residentialAssertionName = name => residentialNameRules.find(rule => rule.pattern.test(name))?.name || name;

// ops-energy.mjs appends elapsed time to this predicate's label. Preserve every
// heat-loss measurement and threshold; only timing is excluded from identity.
export const opsTimingRule = {
  pattern: /^(heat loss per room between 0 and 200 W\/m² of floor \([\d, ]+ W\/m²\)); \d+ ms in all$/,
  reason: 'Elapsed milliseconds are telemetry, not the heat-loss predicate. Retain original measuredCases and compare all physical measurements unchanged.',
};
export function assertionName(flag, name) {
  if (flag.startsWith('res')) return residentialAssertionName(name);
  if (flag === 'ops') return name.replace(opsTimingRule.pattern, '$1; {elapsedMs} ms in all');
  return name;
}

export const residentialDifferences = [
  {
    release: "res-elec-symbols.js is what the Electrical add-on's installation symbols give (elec-sync.mjs --check)",
    candidate: 'bundled electrical integrity and available CadCraft source comparison (elec-sync.mjs --check)',
    reason: 'The standalone fork checks the immutable bundled pin and compares sibling source when present. Missing CadCraft is an explicit availability notice; a present broken sibling still fails. Renamed assertion, retained integrity check (F01 source-sync contract).',
  },
  {
    release: "tin.js and raster.js are byte-identical copies of CivilCraft's (terrain-sync.mjs --check)",
    candidate: 'bundled terrain integrity and available CivilCraft source comparison (terrain-sync.mjs --check)',
    reason: 'The standalone fork verifies immutable bundled hashes with optional CivilCraft comparison. Missing CivilCraft is reported separately; broken or changed installed sources fail (F01 source-sync contract).',
  },
];
