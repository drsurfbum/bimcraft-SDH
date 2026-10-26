/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import { model, fixture, generate } from './fixture.mjs';
import { readWalls } from '../../../app/model-walls.js';
import { readLevels } from '../../../app/model-levels.js';
import { changeWall, drawWalls } from '../../../app/model-ops.js';
import { JOIN_PSET } from '../../../app/wall-join-records.js';
export async function semanticFixtures(out) {
 fs.mkdirSync(out,{recursive:true}); if(!fs.existsSync(fixture))fs.writeFileSync(fixture,await generate());
 const m=await model(),level=readLevels(m.w())[0],a=readWalls(m.w()).find(w=>w.extSide==='right');
 m.change(changeWall(a.guid,{joinSettings:a.joinSettings}));
 m.change(drawWalls({storey:level.guid,typeKey:a.typeKey,height:3000,segs:[{a:[54000,50000],b:[50000,50000],guid:'0F08M00000000000000001'},{a:[50000,50000],b:[50000,54000],guid:'0F08M00000000000000002'}]}));
 const stem=readWalls(m.w())[9];m.change(changeWall(stem.guid,{joinSettings:stem.joinSettings}));
 const b=readWalls(m.w()).find(w=>w.guid==='0F08M00000000000000001');m.change(changeWall(b.guid,{joinSettings:b.joinSettings}));
 m.w().run(w=>{const ps=w.defNamed(a.id,JOIN_PSET).line,id=w.upsertPset(a.id,'OrdinaryJoinAlias',[['Harmless','IFCLABEL','ok']]),alias=w.touch(id);alias.HasProperties.push(ps.HasProperties[0]);w.write(alias);return{};});
 const file=path.join(out,'original.ifc');fs.writeFileSync(file,m.ed.save());
 const negatives=[];
 for(const kind of ['corrupt','unsupported','duplicate','duplicate-id','legacy','curve']) {
  const n=await model(fs.readFileSync(file)),wall=readWalls(n.w()).find(w=>w.guid===a.guid);
  n.w().run(w=>{
   const ps=w.defNamed(wall.id,JOIN_PSET).line,prop=w.api.GetLine(w.mid,ps.HasProperties[0].value,false);
   if(kind==='duplicate') {const id=w.upsertPset(wall.id,'DuplicateJoin',[['Settings','IFCTEXT',JSON.stringify(wall.joinSettings)]]),set=w.touch(id);set.Name=w.T('IFCLABEL',JOIN_PSET);w.write(set);}
   else if(kind==='duplicate-id'){const other=readWalls(w).find(x=>x.guid!==wall.guid),line=w.touch(other.id);line.GlobalId=w.T('IFCGLOBALLYUNIQUEID',wall.guid);w.write(line);}
   else if(kind==='curve')w.upsertPset(wall.id,'CadCraft_Wall',[['Bulge','IFCREAL',.25]]);
   else {const q=w.touch(prop.expressID),settings={...wall.joinSettings};if(kind==='legacy')delete settings.version;else settings.version=99;q.NominalValue=w.T('IFCTEXT',kind==='corrupt'?'{broken':JSON.stringify(settings));w.write(q);}
   return{};
  });
  const f=path.join(out,kind+'.ifc');fs.writeFileSync(f,n.ed.save());negatives.push({kind,file:f,wall:wall.guid});
 }
 return {file,a:a.guid,b:b.guid,level:level.guid,tee:stem.guid,negatives};
}
