/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareAssertions, residentialDifferences, residentialAssertionName, assertionName } from './assertion-comparison.mjs';

const kinds = 'all 33 kinds placed and read back, each as its own IFC4 class and type';
const boards = 'the sub-board is a panel too: no circuit row of its own';
test('removing either RC.6 assertion blocks comparison, even with the same total or optional notices', () => {
  for (const missing of [kinds, boards]) {
    const result = compareAssertions([kinds, boards], [kinds, boards].filter(s => s !== missing).concat('unrelated extra check', 'SKIP optional reader'));
    assert.equal(result.status, 'FAIL'); assert.deepEqual(result.missing, [missing]);
  }
});
test('renames need a specific justified replacement; a notice or unused record cannot excuse a lost assertion', () => {
  const difference = residentialDifferences[0];
  assert.equal(compareAssertions([difference.release, kinds, boards], [difference.candidate, kinds, boards], residentialDifferences).status, 'PASS');
  assert.equal(compareAssertions([difference.release, kinds], [difference.candidate], residentialDifferences).status, 'FAIL');
  assert.equal(compareAssertions([difference.release], ['SKIP CadCraft absent'], residentialDifferences).status, 'FAIL');
  assert.equal(compareAssertions([difference.release], [difference.candidate], [{ ...difference, reason: '' }]).status, 'FAIL');
});
test('duplicate assertion names cannot mask lost occurrences, while extra candidate cases are retained', () => {
  assert.equal(compareAssertions(['a', 'a'], ['a']).status, 'FAIL');
  const result = compareAssertions([kinds, boards], [boards, kinds, 'independent saved devices']);
  assert.equal(result.status, 'PASS'); assert.deepEqual(result.added, ['independent saved devices']);
  assert.equal(result.sameNamedAssertions, false);
});
test('only recorded measurement-bearing residential labels normalize; device assertions cannot disappear', () => {
  assert.equal(residentialAssertionName('web-ifc (oracle): 135 members in four assemblies'), residentialAssertionName('web-ifc (oracle): 139 members in four assemblies'));
  assert.equal(residentialAssertionName(kinds), kinds);
  assert.equal(compareAssertions([kinds, boards].map(residentialAssertionName), [boards].map(residentialAssertionName)).status, 'FAIL');
});
test('ops heat-loss labels ignore elapsed time while preserving physical values, thresholds and assertion presence', () => {
  const a = 'heat loss per room between 0 and 200 W/m² of floor (35, 31, 41, 25, 34 W/m²); 431 ms in all';
  const b = a.replace('431 ms', '278 ms');
  assert.equal(assertionName('ops', a), assertionName('ops', b));
  assert.notEqual(assertionName('ops', a), assertionName('ops', b.replace('35,', '36,')));
  assert.notEqual(assertionName('ops', a), assertionName('ops', b.replace('200 W', '300 W')));
  assert.equal(compareAssertions([assertionName('ops', a)], []).status, 'FAIL');
  assert.equal(assertionName('agent', a), a);
});
