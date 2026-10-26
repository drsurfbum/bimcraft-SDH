/* SPDX-License-Identifier: Apache-2.0 */
import assert from 'node:assert/strict';
// Enumerate the IFC inheritance tree, including types, sets and relationships.
export function rootIdentities(m) {
  const w = m.w(), ids = w.api.GetLineIDsWithType(w.mid, w.W.IFCROOT, true), roots = [];
  for (let i = 0; i < ids.size(); i++) {
    const line = w.api.GetLine(w.mid, ids.get(i), false);
    roots.push(line.GlobalId.value);
  }
  assert.equal(new Set(roots).size, roots.length, 'GlobalIds must be unique across ALL IfcRoot subtypes');
  return roots.sort();
}
