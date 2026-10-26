/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import { model } from '../f05/fixture.mjs';
import { readLevels } from '../../../app/model-levels.js';
import { readWalls } from '../../../app/model-walls.js';
import { readAssemblies } from '../../../app/wall-assemblies.js';
import { changeWall, saveWallAssembly, op } from '../../../app/model-ops.js';
import { saveWallDimension } from '../../../app/wall-dimensions.js';
import { setPlanView } from '../../../app/views-model.js';
export const fixture = new URL('../../../.cc-test/f28-c-fixture/documentation.ifc', import.meta.url);
export async function generate() {
  const m = await model(), lv = readLevels(m.w())[0], walls = readWalls(m.w()), type = readAssemblies(m.w()).find(t => t.key === walls[0].typeKey);
  m.change(changeWall(walls[1].guid, { typeKey: type.key }));
  for (let i = 0; i < 7; i++) m.change(saveWallAssembly({ ...type, key: 'wall-f28c-unused-' + i, name: 'Unused assembly ' + i + ' — continuous long finish sheathing ventilation and membrane descriptions' }));
  for (let i = 0; i < 2; i++) m.change(saveWallDimension({ level: lv.guid, view: 'plan:' + lv.guid, refs: [0,1].map(station => ({wall:walls[i].guid, reference:'coreExterior', station})), axis:'aligned', offset:600 }));
  m.change(setPlanView(lv.guid, { detail:'fine', scale:50 }));
  m.change(setPlanView(lv.guid, { detail:'medium', scale:100, cut:2300, top:3300 }, 'rcp'));
  // Complete original authored file, with no new persisted format or external assets.
  const text = new TextDecoder().decode(m.ed.save()), guids = [...new Set([...text.matchAll(/#[0-9]+=IFC[A-Z0-9]+\('([0-3][0-9A-Za-z_$]{21})'/g)].map(m=>m[1]))];
  let stable = text; for (const [i,g] of guids.entries()) stable = stable.split(g).join('0F28C' + String(i).padStart(17,'0'));
  const re = await model(new TextEncoder().encode(stable)); return re.w().api.file(re.w().mid).save({timeStamp:'2026-10-24T00:00:00'});
}
fs.mkdirSync(new URL('./', fixture), {recursive:true});
if (!fs.existsSync(fixture) || process.argv[1]?.endsWith('/documentation-fixture.mjs')) fs.writeFileSync(fixture, await generate());
