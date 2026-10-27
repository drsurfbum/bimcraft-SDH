/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: semantic MCP schemas/results, never display strings. */
import { readLevels } from './model-levels.js';
import { ModelWriter } from './model-write.js';
import { requireWalls, bindDocument, BINDING, objectSchema } from './material-wall-agent.js';
import { WALL_REFERENCES } from './wall-dimensions.js';
import { wallTarget } from './wall-targets.js';

export function wallTargetTools(env) {
  return [{ name: 'wall_reference_resolve', title: 'Resolve an analytic wall reference', group: 'read',
    description: 'Resolve an explicit authored straight-wall reference/station in level-local raw mm. Analytic, not a joined physical outline. Read-only; never creates constraints or dimensions. Use the captured documentId/revision for subsequent edits. Curves/imported/ambiguous/corrupt hosts are refused.',
    inputSchema: objectSchema({ ...BINDING,
      wall: { type: 'string', pattern: '^[0-3][0-9A-Za-z_$]{21}$' },
      reference: { type: 'string', enum: WALL_REFERENCES }, station: { type: 'number', minimum: 0, maximum: 1 } },
    ['documentId', 'expectedRevision', 'wall', 'reference', 'station']),
    run(a) {
      const ed = env.ed();
      if (!ed) throw new Error('No IFC editor is open.');
      if (env.busy?.()) throw new Error('Document is busy.');
      const state = bindDocument(ed, a), w = new ModelWriter(ed.W, ed.api, ed.mid);
      const walls = requireWalls(w, [a.wall]), target = wallTarget(walls, a);
      if (!target) throw new Error('Unsupported analytic reference: requires one authored straight wall and a valid station.');
      const level = readLevels(w).find(l => l.id === walls[0].storey);
      if (!level) throw new Error('Missing wall level.');
      return { ...state, ...target, level: level.guid, levelId: level.id, frame: 'storey-plan' };
    } }];
}
