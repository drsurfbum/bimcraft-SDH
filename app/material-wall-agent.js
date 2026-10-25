/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: semantic MCP schemas/results, never human display-unit strings. */
// MCP-01 adapters. Geometry, persistence, validation and journals belong to the domain modules.
import { ModelWriter } from './model-write.js';
import { ids, val } from './ifc-util.js';
import { readMaterials, saveMaterial, FILLS, VENTILATION } from './project-materials.js';
import { readAssemblyRecords, assertAssembliesEditable, validateAssembly, LAYER_FUNCTIONS } from './wall-assemblies.js';
import { wallTypes, wallType, typeThickness, typeName, readWalls, locationLine } from './model-walls.js';
import { readLevels } from './model-levels.js';
import { readOpenings } from './model-openings.js';
import { op, saveWallAssembly, changeWalls } from './model-ops.js';
import { readRecordPset } from './record-contract.js';
import { WALL_LOCATION_LINES, placementReference } from './wall-placement.js';

export const MCP01_VERSION = '1.0.0';
export const objectSchema = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
const text = { type: 'string', minLength: 1, maxLength: 100 };
const guid = { type: 'string', minLength: 1, maxLength: 64 };
export const BINDING = { documentId: { type: 'string', minLength: 1, maxLength: 100 }, expectedRevision: { type: 'integer', minimum: 0 } };
const writeRequired = ['documentId', 'expectedRevision'];
const states = new WeakMap(), locked = new WeakSet();
let serial = 0;
const writer = ed => new ModelWriter(ed.W, ed.api, ed.mid);
export function documentHistoryState(ed) {
  let state = states.get(ed);
  if (!state) {
    state = { documentId: 'bim-' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + '-' + ++serial), revision: 0 };
    states.set(ed, state);
  }
  if (state.changes !== ed.changes || state.undone !== ed.undone || state.last !== ed.changes.at(-1) || state.redo !== ed.undone.at(-1) || state.count !== ed.changes.length) {
    if (state.changes) state.revision++;
    Object.assign(state, { changes: ed.changes, undone: ed.undone, last: ed.changes.at(-1), redo: ed.undone.at(-1), count: ed.changes.length });
  }
  return { documentId: state.documentId, revision: state.revision };
}
export function documentState(ed) {
  const state = documentHistoryState(ed);
  const w = writer(ed), project = ids(w.api, w.mid, 'IFCPROJECT')[0];
  return { ...state, projectId: project ? w.guidOf(project) : null, units: 'mm', mcp01Version: MCP01_VERSION };
}
export function bindDocument(ed, args = {}) {
  const state = documentState(ed);
  if (args.documentId !== undefined && args.documentId !== state.documentId) throw new Error('Wrong or stale documentId. Inspect this document again.');
  if (args.expectedRevision !== undefined && args.expectedRevision !== state.revision) throw new Error('Stale expectedRevision. Inspect the document again.');
  return state;
}
export function assertLibrary(w) {
  assertAssembliesEditable(w);
  const materials = readMaterials(w);
  for (const record of readAssemblyRecords(w)) for (const layer of record.layers) {
    if (layer.kind === 'material' && !materials.some(m => m.id === layer.materialId)) throw new Error('Assembly references a missing material: ' + layer.materialId);
  }
  for (const wall of readWalls(w)) { const issue = wallIssue(w, wall); if (issue) throw new Error('Corrupt or unsupported wall ' + wall.guid + ': ' + issue); }
  return materials;
}
function wallIssue(w, wall) {
  try {
    const ps = readRecordPset(w, wall.id, 'CadCraft_Wall', 'wall');
    if (!ps) return 'Missing wall record';
    if (ps.Justification !== undefined && ![...WALL_LOCATION_LINES, 'left', 'right'].includes(ps.Justification)) return 'Invalid location line';
    if (ps.ExteriorSide !== undefined && !['left','right'].includes(ps.ExteriorSide)) return 'Invalid exterior side';
    for (const k of ['Length','Thickness','Height','BaseOffset','TopOffset','Bulge']) if (ps[k] !== undefined && (!Number.isFinite(Number(ps[k])) || ps[k] === '' || ps[k] === null)) return 'Invalid ' + k;
    if (wall.referenceIssue || !wall.assembly || ![wall.len,wall.t,wall.height,...wall.a,...wall.b].every(Number.isFinite) || wall.len < 1 || wall.t <= 0 || wall.height <= 1) return 'Invalid wall geometry or type reference';
    if (wall.topLevel && !readLevels(w).some(l => l.guid === wall.topLevel)) return 'Missing top level';
    if (!Number.isFinite(locationLine(wall).a[0])) return 'Invalid core reference';
    return null;
  } catch (e) { return e.message; }
}
function storedType(w, key) {
  for (const id of ids(w.api, w.mid, 'IFCWALLTYPE')) {
    const line = w.api.GetLine(w.mid, id, false);
    for (const h of line.HasPropertySets || []) {
      const ps = w.api.GetLine(w.mid, h.value, false);
      if (val(ps?.Name) !== 'CadCraft_WallType') continue;
      const prop = (ps.HasProperties || []).map(h => w.api.GetLine(w.mid, h.value, false)).find(p => val(p?.Name) === 'Key');
      if (val(prop?.NominalValue) === key) return { id, guid: val(line.GlobalId) };
    }
  }
  return null;
}
export function requireType(w, key) {
  assertLibrary(w);
  const type = wallType(key, w);
  if (!type) throw new Error('Missing or unsupported wall type: ' + key + '. Inspect assemblies_list; no fallback was used.');
  return type;
}
export function requireWalls(w, guids) {
  if (new Set(guids).size !== guids.length) throw new Error('Duplicate wall IDs. Nothing changed.');
  const walls = readWalls(w);
  return guids.map(g => {
    const matches = walls.filter(w => w.guid === g);
    if (matches.length !== 1) throw new Error('Missing, foreign or ambiguous wall ID: ' + g);
    const wall = matches[0];
    const issue = wallIssue(w, wall); if (issue) throw new Error('Corrupt or unsupported wall: ' + issue);
    if (wall.referenceIssue || !wall.assembly) throw new Error('Unsupported or corrupt wall record: ' + g);
    placementReference(wall.justification, wall.assembly, wall.extSide);
    return wall;
  });
}
export function validateTop(w, changes, walls = []) {
  if (changes.height !== undefined && changes.topLevel !== undefined) throw new Error('Give height or topLevel, not both.');
  const levels = readLevels(w);
  if (changes.topLevel !== undefined && changes.topLevel !== '' && !levels.some(l => l.guid === changes.topLevel)) throw new Error('Missing or foreign topLevel GlobalId.');
  for (const wall of walls) {
    const base = levels.find(l => l.id === wall.storey);
    const topGuid = changes.height !== undefined ? '' : changes.topLevel ?? wall.topLevel;
    const top = levels.find(l => l.guid === topGuid);
    if (topGuid && (!top || top.elevation + (changes.topOffset ?? wall.topOffset) - (base.elevation + (changes.baseOffset ?? wall.baseOffset)) <= 1)) throw new Error('Top level and offsets must give a positive supported wall height.');
    if (!topGuid && changes.topOffset !== undefined && changes.topOffset !== 0) throw new Error('topOffset requires a wall constrained to topLevel.');
  }
}
export const WALL_SETTINGS = {
  type: { type: 'string', minLength: 1, maxLength: 100, description: 'Dynamic key from assemblies_list or model_describe; no built-in fallback.' },
  locationLine: { type: 'string', enum: WALL_LOCATION_LINES }, exteriorSide: { type: 'string', enum: ['left', 'right'] },
  height: { type: 'number', minimum: 100, maximum: 100000 }, topLevel: { ...guid, description: 'Exact storey GlobalId. Mutually exclusive with height.' },
  baseOffset: { type: 'number', minimum: -100000, maximum: 100000 }, topOffset: { type: 'number', minimum: -100000, maximum: 100000 },
};
const materialFields = {
  name: text, category: { type: 'string', maxLength: 100 }, defaultThickness: { type: 'number', minimum: 0, maximum: 2000, description: 'mm. A library default; never resizes existing recipe layers.' },
  color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' }, fill: { type: 'string', enum: FILLS }, fillColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' }, notes: { type: 'string', maxLength: 2000 },
};
const layer = objectSchema({ mat: text, t: { type: 'number', minimum: 0, maximum: 2000, description: 'Explicit mm; zero only for material membranes.' },
  function: { type: 'string', enum: LAYER_FUNCTIONS }, core: { type: 'boolean' }, kind: { type: 'string', enum: ['material', 'cavity'] },
  materialId: { type: ['string', 'null'], maxLength: 809 }, ventilation: { type: 'string', enum: VENTILATION },
}, ['mat', 't', 'function', 'core', 'kind', 'materialId']);
const recipeFields = { name: text, exterior: { type: 'boolean' }, layers: { type: 'array', items: layer, minItems: 1, maxItems: 32, description: 'Ordered exterior to interior. One contiguous physical core.' } };
const key = { type: 'string', pattern: '^wall-[a-zA-Z0-9_-]{1,80}$' };
function recipe(w, input) {
  for (const layer of input.layers || []) {
    if (layer.kind === 'material' && (typeof layer.materialId !== 'string' || !layer.materialId)) throw new Error('Material layers require an explicit material ID; legacy fallback is read-only.');
    if (layer.kind === 'cavity' && layer.materialId !== null) throw new Error('Cavities must have materialId null.');
    if (layer.kind === 'material' && layer.ventilation !== undefined) throw new Error('Ventilation applies only to cavities.');
  }
  const r = validateAssembly(input), materials = assertLibrary(w);
  for (const l of r.layers) if (l.kind === 'material' && !materials.some(m => m.id === l.materialId)) throw new Error('Missing material ID: ' + l.materialId);
  return r;
}
function typeRow(w, type) {
  const records = readAssemblyRecords(w), record = records.find(r => r.key === type.key) || storedType(w, type.key);
  return { key: type.key, guid: record?.guid ?? null, id: record?.id ?? null, builtIn: !type.custom, version: 1,
    name: type.name ?? null, displayName: typeName(type), exterior: type.exterior, thickness: typeThickness(type), layers: type.layers,
    usedBy: readWalls(w).filter(x => x.typeKey === type.key).map(x => x.guid) };
}
export function exactWalls(ed, levelId = null) {
  const w = writer(ed), walls = readWalls(w), openings = readOpenings(w, null, walls), levels = readLevels(w);
  return walls.filter(x => levelId === null || x.storey === levelId).map(x => ({ id: x.id, guid: x.guid, levelId: levels.find(l => l.id === x.storey)?.guid ?? null,
    a: x.a, b: x.b, type: x.typeKey, typeGuid: storedType(w, x.typeKey)?.guid ?? null, thickness: x.t, height: x.height, length: x.len, bulge: x.bulge,
    baseOffset: x.baseOffset, topLevel: x.topLevel, topOffset: x.topOffset, locationLine: x.justification, exteriorSide: x.extSide,
    reference: wallIssue(w, x) ? null : locationLine(x), diagnostic: wallIssue(w, x),
    openings: openings.filter(o => o.wall === x.id).map(o => ({ id: o.id, guid: o.guid, kind: o.kind, type: o.typeKey, offset: o.offset, width: o.width, height: o.height, sill: o.sill })) }));
}
export function materialWallTools(env) {
  const E = a => {
    const ed = env.ed(); if (!ed) throw new Error('No IFC model is open in BimCraft.');
    if (locked.has(ed) || env.busy?.()) throw new Error('Document is busy. Finish the current operation and retry.');
    bindDocument(ed, a); return ed;
  };
  const mutate = async (a, label, make) => {
    const ed = E(a); assertLibrary(writer(ed));
    const run = make(writer(ed));
    locked.add(ed);
    let first = true;
    try {
      await env.apply(label, current => {
        if (current !== ed) throw new Error('Document changed before commit. Nothing changed.');
        if (first) { bindDocument(current, a); first = false; }
        return run(current);
      });
      return { ...documentState(ed), walls: exactWalls(ed), materials: readMaterials(writer(ed)), assemblies: wallTypes(writer(ed)).map(t => typeRow(writer(ed), t)) };
    } finally { locked.delete(ed); }
  };
  const editTool = (name, description, properties, required, make) => ({ name, title: name, group: 'edit', description: description + ' One atomic Assistant undo step. Values are mm. Requires the inspected documentId and revision.',
    inputSchema: objectSchema({ ...BINDING, ...properties }, [...writeRequired, ...required]), run: a => mutate(a, name, w => make(w, a)) });
  const findRecipe = (w, a) => {
    const record = readAssemblyRecords(w).find(r => r.key === a.key && r.guid === a.typeGuid);
    if (!record || record.issue) throw new Error('Missing, foreign, stale or unsupported assembly identity.');
    return record;
  };
  return [
    { name: 'materials_list', title: 'Inspect project materials', group: 'read', description: 'Stable material IDs, exact defaults in mm, version diagnostics. Reads never migrate or write records.',
      inputSchema: objectSchema({ documentId: BINDING.documentId }), run: a => {
        const ed = E(a); try { return { ...documentState(ed), supportedVersions: [1], materials: readMaterials(writer(ed)), diagnostics: [] }; }
        catch (e) { return { ...documentState(ed), supportedVersions: [1], materials: [], diagnostics: [{ record: 'materials', issue: e.recordIssue || 'corrupt', message: e.message }] }; }
      } },
    { name: 'assemblies_list', title: 'Inspect wall assemblies', group: 'read', description: 'Built-in and authored wall keys, stored type GlobalIds, exact exterior-to-interior recipes and core flags in mm. Invalid records are diagnostics, never selectable fallbacks.',
      inputSchema: objectSchema({ documentId: BINDING.documentId }), run: a => {
        const ed = E(a), w = writer(ed), diagnostics = readAssemblyRecords(w).filter(r => r.issue).map(({ key, guid, issue, message }) => ({ key, guid, issue, message }));
        try { assertLibrary(w); } catch (e) { diagnostics.push({ issue: e.recordIssue || 'corrupt', message: e.message }); }
        return { ...documentState(ed), supportedVersions: [1], assemblies: wallTypes(w).map(type => typeRow(w, type)), diagnostics, editable: !diagnostics.length };
      } },
    editTool('material_create', 'Create a project material; retain unused definitions.', { id: { type: 'string', pattern: '^material-[a-zA-Z0-9_-]{1,800}$' }, ...materialFields }, ['id', 'name', 'defaultThickness', 'color', 'fill', 'fillColor'], (w, a) => {
      if (readMaterials(w).some(m => m.id === a.id)) throw new Error('Material ID already exists. Use material_edit.');
      const input = Object.fromEntries(['id', ...Object.keys(materialFields)].filter(k => a[k] !== undefined).map(k => [k, a[k]]));
      return op(w => { saveMaterial(w, input); return {}; });
    }),
    editTool('material_edit', 'Edit an explicitly identified project material; defaults do not change instance layer widths.', { id: { type: 'string', pattern: '^material-[a-zA-Z0-9_-]{1,800}$' }, changes: objectSchema(materialFields) }, ['id', 'changes'], (w, a) => {
      const old = readMaterials(w).find(m => m.id === a.id); if (!old) throw new Error('Missing or foreign material ID.');
      if (!Object.keys(a.changes).length) throw new Error('Give material changes.');
      return op(w => { saveMaterial(w, { ...old, ...a.changes }); return {}; });
    }),
    editTool('assembly_create', 'Create an unused authored assembly. Layers have explicit material IDs and mm widths.', { key, ...recipeFields }, ['key', 'name', 'exterior', 'layers'], (w, a) => {
      if (wallType(a.key, w)) throw new Error('Assembly key already exists.');
      return saveWallAssembly(recipe(w, a));
    }),
    editTool('assembly_edit', 'Edit an authored assembly in place; ALL instances of that type follow, preserving their location anchors.', { key, typeGuid: guid, changes: objectSchema(recipeFields) }, ['key', 'typeGuid', 'changes'], (w, a) => {
      const old = findRecipe(w, a); if (!Object.keys(a.changes).length) throw new Error('Give assembly changes.');
      return saveWallAssembly(recipe(w, { ...old, ...a.changes }));
    }),
    editTool('assembly_duplicate', 'Copy a discovered built-in or authored assembly to a new key and GlobalId. No instance is assigned implicitly.', { sourceKey: text, sourceGuid: guid, key, name: text }, ['sourceKey', 'key', 'name'], (w, a) => {
      const source = requireType(w, a.sourceKey);
      if (source.custom && a.sourceGuid !== source.guid) throw new Error('Missing or stale sourceGuid.');
      if (!source.custom && a.sourceGuid !== undefined) throw new Error('Built-in templates have no sourceGuid.');
      if (wallType(a.key, w)) throw new Error('Duplicate target key already exists.');
      return saveWallAssembly(recipe(w, { ...source, key: a.key, name: a.name }));
    }),
    editTool('walls_edit', 'Change only walls identified by GlobalId, including authored type assignment, six location lines, exterior side and existing height/top settings. No join/end or reference-dimension editing.',
      { walls: { type: 'array', items: guid, minItems: 1, maxItems: 1000 }, changes: objectSchema(WALL_SETTINGS) }, ['walls', 'changes'], (w, a) => {
        const walls = requireWalls(w, a.walls), c = a.changes;
        if (!Object.keys(c).length) throw new Error('Give wall changes.');
        const type = c.type ? requireType(w, c.type) : null;
        validateTop(w, c, walls);
        for (const wall of walls) placementReference(c.locationLine ?? wall.justification, type || wall.assembly, c.exteriorSide ?? wall.extSide);
        const { type: typeKey, locationLine: justification, exteriorSide: extSide, ...rest } = c;
        return changeWalls(a.walls, { ...rest, ...(typeKey ? { typeKey } : {}), ...(justification ? { justification } : {}), ...(extSide ? { extSide } : {}) });
      }),
  ];
}
