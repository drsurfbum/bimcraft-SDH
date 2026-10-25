/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — tool names, descriptions and results are read by the assistant program, not shown to the person (AGENTS-SPEC §5). */
/**
 * agents.js — BimCraft for AI assistants and scripts: the Draw edits (0.6 DF.25, session `bim-draw`; docs/AGENTS-SPEC.md §5.2,
 * §6.3). The apps contain no AI: this gives the person's own assistant tools on the open model; Settings › BimCraft ›
 * Assistants decides which groups. Beside bim-agent.js (0.4 X.7: elements_find, elements_isolate, element_properties), which
 * keeps finding and showing elements; bimcraft.js configures the control channel. One source for both paths: the live window
 * (installAgents) and the headless core (tools/cli/headless/ifc.mjs).
 *
 *   modelTools(env) → [tool definitions] (DOM-free; the headless core and bin/test-bimcraft.mjs --draw06 run them)
 *     env = { ed() (an IfcEditor), apply(label, op) → Promise<op result> (one undo step "Assistant: <label>") }
 *   installAgents(modelUi, app) → registers modelTools + the window's own tools on host.control (bimcraft.js calls it once)
 *     app = { control, model(), selection() → keys, select(keys), save() → Promise<bool>, undo() → Promise, busy() → null | what }
 *   describeModel(ed) · levelRef(ed, nameOrGuid)
 * Units: millimetres; points [x, y] in the level's plan (as the Draw tools: x east, y north on an unturned level).
 *
 * Tools:
 *   model_describe  read    levels (name, guid, elevation, height), walls by type, doors, windows, rooms with areas, floors,
 *                           ramps, grids, columns, the site; the wall / door / window types the edit tools take
 *   walls_list      read    the walls drawn with BimCraft's tools on a level: guid, ends, type, thickness, height, length
 *   walls_add       edit    walls along points on a level (closed: back to the first); joined, rooms follow; one undo step
 *   opening_add     edit    a door or window in a wall (by its guid), at an offset along it or in its middle; one undo step
 *   floor_add       edit    a floor or slab of any outline on a level; one undo step
 *   levels_add      edit    levels at heights above the lowest; one undo step
 *   grid_add        edit    grid lines by count and spacing (1, 2, 3 … and A, B, C …); one undo step
 *   (live only) app_info, selection_get (read) · selection_set, undo (edit) · model_save (save)
 */
import { getHost } from './host.js';
import { snapshotModel, drawWalls, placeOpening, loopsOf } from './model-ops.js';
import { WALL_TYPES, readWalls, wallTypes } from './model-walls.js';
import { DOOR_TYPES, WINDOW_TYPES } from './model-openings.js';
import { placeDrawnFloor, readDrawnFloors, polyProblem } from './model-floors.js';
import { addLevels, readSite } from './model-site.js';
import { gridLayout, placeGrid, readGrids } from './model-grids.js';
import { readColumns } from './model-columns.js';
import { readRamps } from './model-ramps.js';
import { ModelWriter } from './model-write.js';
import { val } from './ifc-util.js';
import { t } from './i18n.js';
import { materialWallTools, documentState, bindDocument, exactWalls, BINDING, WALL_SETTINGS, requireType, validateTop } from './material-wall-agent.js';
import { placementPath, placementReference } from './wall-placement.js';
import { liveHistory } from './agent-history.js';
export { BINDING, bindDocument, documentState } from './material-wall-agent.js';

const LIMIT = 1000;
const r1 = (v) => (Number.isFinite(v) ? Math.round(v * 10) / 10 : null);
const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
const XY = { type: 'array', items: { type: 'number', minimum: -1e7, maximum: 1e7 }, minItems: 2, maxItems: 2 };
const LEVEL = { type: 'string', maxLength: 255, description: 'A level by its name or GlobalId (default: the level at elevation 0, else the lowest).' };
const writer = (ed) => new ModelWriter(ed.W, ed.api, ed.mid);
const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - a[1] * b[0]; } return Math.abs(s / 2); };
/** A refusal from a model op ({ key }) as a plain sentence. */
const said = (e) => (e?.key ? t(e.key) : String(e?.message || e));

/** The level asked for: by GlobalId, then by name (any case); none = the one at 0, else the lowest. */
export function levelRef(ed, ref) {
  const L = snapshotModel(ed).levels;
  if (!L.length) throw new Error('The model has no levels (IfcBuildingStorey).');
  if (!ref) return L.find((l) => Math.abs(l.elevation) < 1) || L[0];
  const s = String(ref).trim().toLowerCase();
  const l = L.find((x) => x.guid === ref) || L.find((x) => String(x.name).toLowerCase() === s);
  if (!l) throw new Error('No level "' + ref + '". Levels: ' + L.map((x) => x.name).join(', ') + '.');
  return l;
}

/** The model laid out (model_describe's body). */
export function describeModel(ed) {
  const w = writer(ed), snap = snapshotModel(ed);
  const levels = snap.levels.map((l) => ({ name: l.name, guid: l.guid, elevation: l.elevation, height: l.height }));
  const byType = {};
  for (const x of snap.walls) byType[x.typeKey || 'other'] = (byType[x.typeKey || 'other'] || 0) + 1;
  const rooms = [];
  for (const l of snap.levels) { try { for (const r of loopsOf(ed, l.id).rooms || []) rooms.push({ level: l.name, area: r1(area(r.poly) / 1e6), areaUnit: 'm²' }); } catch (e) { /* a level the tools cannot read */ } }
  let grids = [], columns = 0, ramps = 0, floors = 0, site = null;
  try { grids = readGrids(w).flatMap((g) => g.axes.map((x) => x.tag)); } catch (e) { /* none */ }
  try { columns = readColumns(w).length; } catch (e) { /* none */ }
  try { ramps = readRamps(w).length; } catch (e) { /* none */ }
  try { floors = readDrawnFloors(w).length; } catch (e) { /* none */ }
  try { const s = readSite(w); site = s ? { outline: s.points.length >= 3, area: s.points.length >= 3 ? r1(area(s.points) / 1e6) : null } : null; } catch (e) { /* none */ }
  return {
    ...documentState(ed), units: 'mm', schema: snap.v4 ? 'IFC4' : 'IFC2X3', levels,
    walls: { count: snap.walls.length, byType },
    doors: snap.openings.filter((o) => o.kind === 'door').length, windows: snap.openings.filter((o) => o.kind === 'window').length,
    rooms, floorsByOutline: floors, ramps, grids, columns, site,
    types: { walls: wallTypes(w).map((x) => x.key), doors: DOOR_TYPES.map((x) => x.key), windows: WINDOW_TYPES.map((x) => x.key) },
  };
}

export function modelTools(env) {
  const E = () => { const ed = env.ed(); if (!ed) throw new Error('No IFC model is open in BimCraft.'); return ed; };
  /** One undo step; a model op's refusal comes back as its sentence (nothing changed). */
  const edit = async (label, op) => { try { return await env.apply(label, op); } catch (e) { throw new Error(said(e)); } };
  const guidsOf = (r) => [...(r?.made?.keys?.() || [])];
  return [
    ...materialWallTools(env),
    {
      name: 'model_describe', group: 'read', title: 'Describe the model',
      description: 'The open BimCraft model in millimetres: its levels (name, GlobalId, elevation, height), walls by type, doors, windows, rooms with their areas, floors drawn by outline, ramps, grid line tags, columns and the site; also the wall, door and window types walls_add and opening_add take.',
      run: () => describeModel(E()),
    },
    {
      name: 'walls_list', group: 'read', title: 'List walls',
      description: 'The walls on a level that BimCraft\'s Draw tools can change: GlobalId, start and end (mm, in the level\'s plan), type, thickness, height, length, and the doors and windows in each.',
      inputSchema: obj({ level: LEVEL, documentId: BINDING.documentId }),
      run: (a) => {
        const ed = E(); bindDocument(ed, a); const l = levelRef(ed, a.level);
        return { ...documentState(ed), level: l.name, walls: exactWalls(ed, l.id) };
      },
    },
    {
      name: 'walls_add', group: 'edit', title: 'Add walls',
      description: 'Walls along points (mm, in the level\'s plan) on a level, joined to each other and to the walls there; rooms, floors and roofs follow as with the Wall tool. closed: true runs the last wall back to the first point. Type: one of model_describe\'s wall types (default ext-2x6). Height: mm, or leave it out to run up to the level above (the level\'s height on the top level). One undo step.',
      inputSchema: obj({ ...BINDING, level: LEVEL, points: { type: 'array', items: XY, minItems: 2, maxItems: 500 }, closed: { type: 'boolean' }, ...WALL_SETTINGS }, ['points']),
      run: async (a) => {
        const ed = E(); bindDocument(ed, a);
        const w = writer(ed), l = levelRef(ed, a.level), L = snapshotModel(ed).levels, above = L[L.findIndex((x) => x.id === l.id) + 1];
        const type = requireType(w, a.type || WALL_TYPES[0].key);
        if (type.custom || ['locationLine', 'exteriorSide', 'baseOffset', 'topLevel', 'topOffset'].some(k => a[k] !== undefined)) {
          if (!a.documentId || a.expectedRevision === undefined) throw new Error('Authored types and instance settings require documentId and expectedRevision from model_describe.');
        }
        const side = a.exteriorSide || 'left', ref = placementReference(a.locationLine || 'center', type, side);
        const pts = a.closed && a.points.length >= 3 ? [...a.points, a.points[0]] : a.points;
        if (pts.some((p, i) => i && Math.hypot(p[0] - pts[i-1][0], p[1] - pts[i-1][1]) < 1)) throw new Error('Every segment must be at least 1 mm; no partial chain was added.');
        const path = placementPath(pts, type, ref.justification, side);
        const segs = path.map(s => ({ ...s, justification: ref.justification }));
        if (!segs.length) throw new Error('The points make no wall.');
        const top = a.height !== undefined ? { height: a.height } : a.topLevel ? { topLevel: a.topLevel } : above ? { topLevel: above.guid } : { height: l.height };
        validateTop(w, a);
        const settings = { ...top, baseOffset: a.baseOffset || 0, topOffset: a.topOffset || 0 };
        validateTop(w, settings, [{ storey: l.id, topLevel: '', baseOffset: 0, topOffset: 0 }]);
        let first = true;
        const run = drawWalls({ storey: l.guid, segs, typeKey: type.key, extSide: side, ...settings });
        const r = await edit('add ' + segs.length + (segs.length > 1 ? ' walls' : ' wall'), current => {
          if (current !== ed) throw new Error('Document changed before commit.');
          if (first) { bindDocument(current, a); first = false; }
          return run(current);
        });
        return { ...documentState(ed), level: l.name, walls: guidsOf(r), values: exactWalls(ed, l.id) };
      },
    },

    {
      name: 'opening_add', group: 'edit', title: 'Add a door or window',
      description: 'A door or window in a wall (its GlobalId from walls_list or walls_add): type from model_describe (default a single door / a fixed window), offset = mm from the wall\'s start to the opening\'s near edge (default: the middle), width and height in mm (default: the type\'s), sill for windows. Refused if it does not fit. One undo step.',
      inputSchema: obj({ wall: { type: 'string', minLength: 1, maxLength: 64 }, kind: { type: 'string', enum: ['door', 'window'] }, type: { type: 'string', enum: [...DOOR_TYPES, ...WINDOW_TYPES].map((x) => x.key) }, offset: { type: 'number', minimum: 0 }, width: { type: 'number', minimum: 100, maximum: 20000 }, height: { type: 'number', minimum: 100, maximum: 20000 }, sill: { type: 'number', minimum: 0, maximum: 20000 } }, ['wall', 'kind']),
      run: async (a) => {
        const ed = E();
        if (!readWalls(writer(ed)).some((x) => x.guid === a.wall)) throw new Error('No wall with GlobalId ' + a.wall + ' that the Draw tools know (see walls_list).');
        const typeKey = a.type || (a.kind === 'door' ? DOOR_TYPES[0].key : WINDOW_TYPES[0].key);
        const type = [...DOOR_TYPES, ...WINDOW_TYPES].find((x) => x.key === typeKey);
        if (type.kind !== a.kind) throw new Error(typeKey + ' is a ' + type.kind + ' type, not a ' + a.kind + '.');
        const r = await edit('add a ' + a.kind, placeOpening({ wall: a.wall, typeKey, offset: a.offset, width: a.width, height: a.height, sill: a.kind === 'window' ? a.sill : 0 }));
        return { [a.kind]: guidsOf(r)[0] || null };
      },
    },
    {
      name: 'floor_add', group: 'edit', title: 'Add a floor',
      description: 'A floor or slab of any outline (mm, in the level\'s plan; at least three corners, not crossing itself) on a level: kind concrete | wood, use floor | slab, thickness in mm (default the kind\'s), offset = its top above the level (mm). One undo step.',
      inputSchema: obj({ level: LEVEL, points: { type: 'array', items: XY, minItems: 3, maxItems: 500 }, kind: { type: 'string', enum: ['concrete', 'wood'] }, use: { type: 'string', enum: ['floor', 'slab'] }, thickness: { type: 'number', minimum: 10, maximum: 3000 }, offset: { type: 'number', minimum: -10000, maximum: 10000 } }, ['points']),
      run: async (a) => {
        const ed = E(), l = levelRef(ed, a.level);
        const pr = polyProblem(a.points);
        if (pr) throw new Error(t(pr));
        const r = await edit('add a floor', placeDrawnFloor({ storey: l.guid, points: a.points, kind: a.kind || 'concrete', use: a.use || 'floor', ...(a.thickness ? { thickness: a.thickness } : {}), offset: a.offset || 0 }));
        return { level: l.name, floor: guidsOf(r)[0] || null };
      },
    },
    {
      name: 'levels_add', group: 'edit', title: 'Add levels',
      description: 'Levels at these heights above the lowest level (mm); a height a level already has is skipped. Names follow the model\'s ("Level 3"). One undo step.',
      inputSchema: obj({ elevations: { type: 'array', items: { type: 'number', minimum: -100000, maximum: 1000000 }, minItems: 1, maxItems: 200 } }, ['elevations']),
      run: async (a) => {
        const r = await edit('add levels', addLevels({ elevations: a.elevations }));
        return { levels: snapshotModel(E()).levels.map((l) => ({ name: l.name, guid: l.guid, elevation: r1(l.elevation) })), made: guidsOf(r) };
      },
    },
    {
      name: 'grid_add', group: 'edit', title: 'Add grid lines',
      description: 'Grid lines laid out as Build › Grid does: numbered lines (u: count and spacing in mm, a number or one per bay) and lettered lines (v), from an origin (mm, in the level\'s plan), turned by angle (degrees), each running extend mm past the last crossing. Added to the model\'s grid (one per building). One undo step.',
      inputSchema: obj({ level: LEVEL, origin: XY, angle: { type: 'number', minimum: -360, maximum: 360 },
        u: obj({ count: { type: 'integer', minimum: 0, maximum: 100 }, spacing: { anyOf: [{ type: 'number', minimum: 100 }, { type: 'array', items: { type: 'number', minimum: 100 }, maxItems: 100 }] } }, ['count']),
        v: obj({ count: { type: 'integer', minimum: 0, maximum: 100 }, spacing: { anyOf: [{ type: 'number', minimum: 100 }, { type: 'array', items: { type: 'number', minimum: 100 }, maxItems: 100 }] } }, ['count']),
        extend: { type: 'number', minimum: 0, maximum: 20000 } }),
      run: async (a) => {
        const ed = E(), l = levelRef(ed, a.level);
        const axes = gridLayout({ origin: a.origin || [0, 0], angle: a.angle || 0, u: a.u || {}, v: a.v || {}, extend: a.extend ?? 1500 });
        if (!axes.length) throw new Error('Say how many lines: u.count and / or v.count.');
        await edit('add grid lines', placeGrid({ storey: l.guid, axes }));
        return { lines: readGrids(writer(ed)).flatMap((g) => g.axes.map((x) => x.tag)) };
      },
    },
  ];
}

/** Registers the tools on this window's host.control (bimcraft.js calls it once, with the Draw module). */
export function installAgents(modelUi, app) {
  const C = app.control || getHost({ app: 'bimcraft' }).control;
  const A = modelUi.extend({ tools: [] });
  const ed = () => A.ed();
  const busy = () => app.busy?.() || (A.S.chain?.points?.length ? 'drawing walls' : null) || (A.S.busy || A.S.reloading || A.S.queue?.length ? 'rebuilding the model' : null);
  const settle = async (ms = 60000, verify = null) => {
    const check = verify || (() => {}), t0 = Date.now(); check();
    while (A.S.busy || A.S.reloading || A.S.queue?.length) {
      if (Date.now() - t0 >= ms) { if (verify) throw new Error('Timed out waiting for the model to settle.'); break; }
      await new Promise(r => setTimeout(r, 50)); check();
    }
    check();
  };
  const history = liveHistory({ ed, busy, settle, undo: hooks => app.undo(hooks), redo: hooks => app.redo(hooks) });
  /** One undo step through the Draw module (the plan and the 3D view follow), labelled as the assistant's. */
  const apply = async (label, op) => {
    const why = busy();
    if (why) throw new Error('The person is ' + why + ': try again when they finish.');
    const original = ed();
    let res = null, err = null;
    const run = (editor) => { try { if (editor !== original) throw new Error('Document changed before commit.'); res = op(editor); return res; } catch (e) { err = e; throw e; } };
    A.commit(run, { label: 'Assistant: ' + label, verb: '' });
    if (err) throw err;
    await settle();
    return res;
  };
  const keyOf = (guid) => { const e = ed(); const id = e ? writer(e).byGuid(guid) : null; return id ? (app.model()?.keyBase || 0) + id : null; };
  const guidOf = (key) => { const e = ed(); if (!e) return null; try { return val(e.api.GetLine(e.mid, key - (app.model()?.keyBase || 0), false)?.GlobalId) || null; } catch (x) { return null; } };
  const info = () => {
    const e = ed();
    return { app: 'bimcraft', title: 'BimCraft', file: A.host.fileName?.() || null, open: !!e, unsaved: !!e?.dirty, changes: e?.changes.length || 0, draw: !!A.S.on, busy: app.busy?.() || null,
      levels: e ? snapshotModel(e).levels.length : 0, elements: app.model()?.elements ?? null };
  };
  const live = [
    { name: 'app_info', group: 'read', title: 'About this window', description: 'BimCraft\'s window: the IFC file open, unsaved changes, whether Draw is on, levels and elements, and what the person is in the middle of.', run: () => info() },
    {
      name: 'selection_get', group: 'read', title: 'What is selected',
      description: 'What the person has selected in BimCraft: GlobalId, class and name of each (up to 1000).',
      run: () => { const e = ed(); return { selected: [...(app.selection() || [])].slice(0, LIMIT).map((k) => { const g = guidOf(k), l = e && g ? e.api.GetLine(e.mid, k - (app.model()?.keyBase || 0), false) : null; return { guid: g, class: l?.constructor?.name || null, name: l ? val(l.Name) || '' : null }; }) }; },
    },
    {
      name: 'selection_set', group: 'edit', title: 'Select',
      description: 'Select elements by GlobalId to show them to the person (replace, add or remove). Changes nothing in the model.',
      inputSchema: obj({ guids: { type: 'array', items: { type: 'string', maxLength: 64 }, maxItems: 100000 }, mode: { type: 'string', enum: ['replace', 'add', 'remove'] } }, ['guids']),
      run: (a) => {
        const keys = a.guids.map(keyOf), bad = a.guids.filter((g, i) => !keys[i]);
        if (bad.length) throw new Error('Unknown: ' + bad.slice(0, 10).join(', ') + '. Nothing selected.');
        const cur = [...(app.selection() || [])];
        const next = a.mode === 'add' ? [...new Set([...cur, ...keys])] : a.mode === 'remove' ? cur.filter((k) => !keys.includes(k)) : keys;
        app.select(next);
        return { selected: next.length };
      },
    },
    {
      name: 'undo', group: 'edit', title: 'Undo',
      description: 'Undo the assistant\'s last steps (labelled "Assistant: …"); steps the person made are only undone with any: true.',
      inputSchema: obj({ steps: { type: 'integer', minimum: 1, maximum: 50 }, any: { type: 'boolean' }, ...BINDING }),
      run: a => history('undo', a),
    },
    { name: 'redo', group: 'edit', title: 'Redo', description: 'Redo an Assistant-owned model step. Person steps require any: true.', inputSchema: obj({ any: { type: 'boolean' }, ...BINDING }), run: a => history('redo', a) },
    { name: 'model_save', group: 'save', title: 'Save the model', description: 'BimCraft\'s own Save as IFC: a new file with every change (desktop: the save dialog; browser: a download). The original file is never changed.', inputSchema: obj(BINDING), run: async a => { if (busy()) throw new Error('Document is busy.'); if (!ed()) throw new Error('No IFC model.'); bindDocument(ed(), a); return { saved: await app.save(), ...info(), ...documentState(ed()) }; } },
  ];
  for (const def of [...live.slice(0, 1), ...modelTools({ ed, apply, busy }), ...live.slice(1)]) C.tool(def);
  return C;
}
