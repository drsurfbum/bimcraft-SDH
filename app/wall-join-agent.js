/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: semantic MCP schemas/results use stable codes and raw mm. */
import { ModelWriter } from './model-write.js';
import { ids, val } from './ifc-util.js';
import { readWalls, wallOutlines, storedShape } from './model-walls.js';
import { readLevels } from './model-levels.js';
import { readJoinRecord, JOIN_PSET } from './wall-join-records.js';
import { changeWall } from './model-ops.js';
import { BINDING, bindDocument, documentState, documentHistoryState, objectSchema } from './material-wall-agent.js';

const guid = { type: 'string', pattern: '^[0-3][0-9A-Za-z_$]{21}$' };
const writer = ed => new ModelWriter(ed.W, ed.api, ed.mid);
const fail = (code, message) => { throw Object.assign(new Error(message), { joinCode: code }); };
function uniqueWall(w, guid) {
  const counts = new Map();
  for (const id of ids(w.api, w.mid, 'IFCPRODUCT', true)) {
    const key = val(w.api.GetLine(w.mid, id, false)?.GlobalId);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  }
  if ((counts.get(guid) || 0) > 1) fail('AMBIGUOUS_ID', 'Ambiguous wall GlobalId.');
  const walls = readWalls(w), wall = walls.find(x => x.guid === guid);
  if (counts.get(guid) !== 1 || !wall) fail('WALL_NOT_FOUND', 'No authored wall with this GlobalId.');
  // Join calculation/regeneration consumes the complete participating storey, not just the target.
  // A unique target does not authorize resolving an ambiguous neighbor by first/last match.
  if (walls.some(x => x.storey === wall.storey && counts.get(x.guid) !== 1))
    fail('AMBIGUOUS_ID', 'Ambiguous participating wall GlobalId. Inspect the complete storey.');
  return wall;
}
function record(w, wall) {
  const r = readJoinRecord(w, wall.id);
  const sets = w.defs(wall.id).map(d => w.api.GetLine(w.mid, d.def, false)).filter(s => val(s?.Name) === JOIN_PSET);
  const classification = sets.length > 1 ? 'duplicate' : r.issue || (r.raw === undefined ? 'absent' : Object.hasOwn(JSON.parse(r.raw), 'version') ? 'supported' : 'legacy');
  return { classification, present: sets.length > 0, version: r.issue || r.raw === undefined ? null : JSON.parse(r.raw).version ?? 0,
    compatible: !r.issue, issue: r.issue || null, persisted: r.issue || r.raw === undefined ? null : JSON.parse(r.raw), effective: r.settings };
}
// Always calculate with the complete storey, including through hosts. Never construct neighbor IDs from proximity.
function diagnostics(w, selected) {
  const all = readWalls(w), result = [];
  for (const storey of new Set(selected.map(x => x.storey))) {
    const rows = all.filter(x => x.storey === storey).map(x => ({ ...x, key: x.guid }));
    for (const d of wallOutlines(rows).diagnostics || []) if (selected.some(x => x.guid === d.key))
      result.push({ wall: d.key, code: d.reason, units: 'mm' });
  }
  for (const wall of selected) {
    const r = record(w, wall);
    if (!r.compatible) result.push({ wall: wall.guid, code: 'record-' + r.classification, units: 'mm' });
    for (const end of ['a', 'b']) if (r.effective && (!r.effective[end].allow || r.effective[end].cap === 'square'))
      result.push({ wall: wall.guid, end, endId: wall.guid + ':' + end, code: 'independent-square-end', units: 'mm' });
  }
  return result;
}
function readback(ed, guid) {
  const w = writer(ed), wall = uniqueWall(w, guid), r = record(w, wall);
  return { ...documentState(ed), wall: guid, record: r, ends: r.effective ? Object.fromEntries(['a','b'].map(end => [end,
    { id: guid + ':' + end, ...r.effective[end], joinEligible: !wall.bulge && r.effective[end].allow && r.effective[end].cap === 'envelope' }])) : null,
    geometry: { a: wall.a, b: wall.b, base: wall.z, height: wall.height, physical: storedShape(w, wall.id) },
    diagnostics: diagnostics(w, [wall]), supportedScope: 'F08-A-straight' };
}
const physical = ed => {
  const w = writer(ed);
  return new Map(readWalls(w).map(wall => [wall.guid, JSON.stringify({ shape: storedShape(w, wall.id), record: readJoinRecord(w, wall.id) })]));
};
export function wallJoinTools(env) {
  const E = a => {
    if (typeof a.documentId !== 'string' || !a.documentId) fail('INVALID_ARGUMENT', 'An explicit documentId is required.');
    const ed = env.ed(); if (!ed) fail('DOCUMENT_NOT_FOUND', 'No IFC editor is open.');
    if (env.busy?.()) fail('BUSY', 'Document is busy.');
    bindDocument(ed, a); return ed;
  };
  return [
    { name: 'wall_joins_get', title: 'Inspect wall joins', group: 'read', description: 'Persisted/effective A/B controls, record classification, raw-mm physical profiles and full-neighborhood diagnostics. Eligibility does not certify cleaned joining. Reads never migrate.',
      inputSchema: objectSchema({ documentId: BINDING.documentId, wall: guid }, ['documentId','wall']),
      run: a => readback(E(a), a.wall) },
    { name: 'wall_join_diagnostics', title: 'Inspect join diagnostics', group: 'read', description: 'Exactly one of walls or storey GlobalId. Inspect complete participating storeys, then filter. Stable codes, raw mm; no guessed neighbors or end IDs. Never migrates records.',
      inputSchema: objectSchema({ documentId: BINDING.documentId, walls: { type: 'array', items: guid, minItems: 1, maxItems: 1000, uniqueItems: true }, storey: guid }, ['documentId']),
      run: a => {
        const ed = E(a), w = writer(ed);
        if (!!a.walls === !!a.storey) fail('INVALID_ARGUMENT', 'Give exactly one scope: walls or storey.');
        let selected;
        if (a.walls) { if (new Set(a.walls).size !== a.walls.length) fail('AMBIGUOUS_ID', 'Duplicate wall IDs.'); selected = a.walls.map(g => uniqueWall(w, g)); }
        else {
          const levels = readLevels(w).filter(l => l.guid === a.storey);
          if (levels.length !== 1) fail('AMBIGUOUS_ID', 'Missing or ambiguous storey GlobalId.');
          selected = readWalls(w).filter(x => x.storey === levels[0].id);
          selected.forEach(x => uniqueWall(w, x.guid));
        }
        return { ...documentState(ed), walls: selected.map(x => x.guid), diagnostics: diagnostics(w, selected), supportedScope: 'F08-A-straight' };
      } },
    { name: 'wall_join_end_set', title: 'Change one wall end', group: 'edit', description: 'Change allow/cap on stable analytic end a or b using changeWall, regeneration and ordinary history. Internal node/tee relations and untouched end are retained. Same values on absent/legacy records explicitly migrate in one undoable step; supported same values are a no-op.',
      inputSchema: objectSchema({ ...BINDING, wall: guid, end: { type: 'string', enum: ['a','b'] }, patch: { ...objectSchema({ allow: { type: 'boolean' }, cap: { type: 'string', enum: ['envelope','square'] } }), minProperties: 1 } }, ['documentId','expectedRevision','wall','end','patch']),
      run: async a => {
        const ed = E(a), w = writer(ed), wall = uniqueWall(w, a.wall), before = readback(ed, a.wall);
        if (!before.record.compatible) fail('UNSUPPORTED_RECORD', 'Join record is ' + before.record.classification + '.');
        if (!['a','b'].includes(a.end) || !a.patch || !Object.keys(a.patch).length || Object.keys(a.patch).some(k => !['allow','cap'].includes(k)) ||
          ('allow' in a.patch && typeof a.patch.allow !== 'boolean') || ('cap' in a.patch && !['envelope','square'].includes(a.patch.cap))) fail('INVALID_ARGUMENT', 'Invalid end patch.');
        if (wall.bulge) fail('UNSUPPORTED_GEOMETRY', 'Per-end controls require a straight wall.');
        const next = { ...before.record.effective, [a.end]: { ...before.record.effective[a.end], ...a.patch } };
        if (before.record.classification === 'supported' && JSON.stringify(next) === JSON.stringify(before.record.effective))
          return { ...before, changed: false, affectedWalls: [], geometryChangedWalls: [], completedSteps: 0 };
        const prior = physical(ed), history = ed.changes.length, operation = changeWall(a.wall, { joinSettings: next });
        let committed = false, error = null, committedAfter = null, committedProfiles = null;
        try {
          await env.apply('wall_join_end_set', current => {
            uniqueWall(writer(current), a.wall);
            const result = operation(current);
            committed = true;
            // A later file switch may close this editor's IFC. Capture confirmed domain readback
            // before yielding to UI notification; a read failure must not erase a committed step.
            try { committedAfter = readback(current, a.wall); committedProfiles = physical(current); } catch { /* report unavailable readback honestly below */ }
            return result;
          });
          if (env.ed() !== ed) error = 'The active document changed after the original edit completed.';
        } catch (e) { if (!committed) throw e; error = e.message || String(e); }
        let after, now, readable = true;
        try { after = readback(ed, a.wall); now = physical(ed); }
        catch (e) {
          readable = false; error ||= 'Original document readback is unavailable after the confirmed edit: ' + (e.message || String(e));
          after = committedAfter || { ...before, record: null, ends: null, geometry: null, diagnostics: null };
          now = committedProfiles;
        }
        after = { ...after, ...documentHistoryState(ed) };
        return { ...after, ok: !error, changed: committed, end: a.end, endId: a.wall + ':' + a.end, before: before.ends[a.end], after: after.ends?.[a.end] ?? null,
          readback: { phase: readable ? 'response' : committedAfter ? 'synchronous-commit' : 'unavailable', originalDocumentReadable: readable },
          affectedWalls: now ? [...now].filter(([guid, value]) => prior.get(guid) !== value).map(([guid]) => guid) : null,
          geometryChangedWalls: now ? [...now].filter(([guid, value]) => JSON.stringify(JSON.parse(prior.get(guid) || '{}').shape) !== JSON.stringify(JSON.parse(value).shape)).map(([guid]) => guid) : null,
          completedSteps: ed.changes.length - history, undo: { owner: 'assistant', available: readable && ed.changes.length > history, label: 'Assistant: wall_join_end_set', documentId: after.documentId, revision: after.revision },
          ...(error ? { error, isError: true, code: 'POST_COMMIT_INTERRUPTED', complete: false } : { complete: true }) };
      } },
  ];
}
