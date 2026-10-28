/* SPDX-License-Identifier: Apache-2.0 */
// Validate exports of the actual saved acceptance files, using existing writers only.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { model, scene } from '../f04/fixture.mjs';
import { readWalls, wallOutlines } from '../../../app/model-walls.js';
import { readWallDimensions, resolveDimension } from '../../../app/wall-dimensions.js';
import { wallPlanGraphics } from '../../../app/wall-plan-graphics.js';
import { planPdf } from '../../../app/model-pdf.js';
import { assemblySchedules } from '../../../app/assembly-schedule.js';
import { scheduleCsv } from '../../../app/model-schedule.js';
const pairs=[['.cc-test/f09/targeted.ifc','.cc-test/f09/expected-private.json'],
 ...['.cc-test/f09-source','.cc-test/f09-package/consumer'].map(p=>[p+'/saved.ifc',p+'/expected-private.json']),
 ...['established','workspace','live'].map(n=>['.cc-test/f09-browser/'+n+'-saved.ifc','.cc-test/f09-browser/'+n+'-expected-private.json'])];
for(const [file,expectedFile] of pairs){
 assert.ok(fs.existsSync(file),file);const expected=JSON.parse(fs.readFileSync(expectedFile)),m=await model(fs.readFileSync(file));
 const before=m.ed.changes.length,walls=readWalls(m.w()),wall=walls.find(w=>w.guid===expected.wall);
 assert.ok(wall&&!wall.bulge);const physical=wallOutlines(walls.filter(w=>w.storey===wall.storey).map(w=>({...w,key:w.guid}))).get(wall.guid);
 const sc=scene(m,wallPlanGraphics,'fine',100),pdf=planPdf(sc,{paper:'a3',units:'mm',scale:100,title:'F09 saved output check'});
 fs.writeFileSync(file+'.plan.pdf',pdf.bytes);fs.writeFileSync(file+'.assemblies.csv',scheduleCsv(assemblySchedules(m.w()).assemblies));
 fs.writeFileSync(file+'.output-private.json',JSON.stringify({physical,height:wall.height,scale:pdf.scale.ratio,dimensions:readWallDimensions(m.w()).map(d=>({guid:d.guid,...resolveDimension(d,walls)}))}));
 assert.equal(m.ed.changes.length,before,'export discovery is read-only');m.ed.api.CloseModel(m.ed.mid);
 console.log('PASS existing plan/CSV writers on actual saved output '+file);
}
