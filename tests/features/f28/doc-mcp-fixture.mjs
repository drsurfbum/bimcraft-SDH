/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import { generate } from './documentation-fixture.mjs';
import { model } from '../f04/fixture.mjs';
import { readLevels } from '../../../app/model-levels.js';
import { readWalls } from '../../../app/model-walls.js';
import { readSectionLines } from '../../../app/res-sheets.js';
import { addDrafting } from '../../../app/drafting.js';
import { ids, val } from '../../../app/ifc-util.js';
export async function documentationFixture(out){
 fs.mkdirSync(out,{recursive:true});const m=await model(await generate()),level=readLevels(m.w())[0],plan='plan:'+level.guid,hatch='0DMCP'+String(1).padStart(17,'0');
 m.change(addDrafting({guid:hatch,level:level.guid,view:plan,kind:'hatch',pts:[[700,800],[1300,800],[1300,1300],[700,1300]],pattern:'diagonal',scale:1}));
 const section=readSectionLines(m.w())[0],aliases=[];
 for(const [i,[owner,set,property]]of [[m.w().byGuid(hatch),'CadCraft_Drafting','Pattern'],[section.id,'CadCraft_SectionLine','Depth'],[ids(m.w().api,m.w().mid,'IFCPROJECT')[0],'CadCraft_ProjectedViews','section:'+section.guid]].entries()){
  const alias='OrdinaryDocAlias'+i;
  const aliasOwner=i===2?m.w().byGuid(hatch):owner;
  m.w().run(w=>{const ps=w.defNamed(owner,set).line,prop=ps.HasProperties.find(h=>val(w.api.GetLine(w.mid,h.value,false).Name)===property);if(!prop)throw new Error('Resolved protected property missing');const id=w.upsertPset(aliasOwner,alias,[['Harmless','IFCLABEL','ok']]),line=w.touch(id);line.HasProperties.push(prop);w.write(line);return{};});
  aliases.push({owner:m.w().guidOf(aliasOwner),recordOwner:m.w().guidOf(owner),set,property,alias,directMcpSupported:i!==2});
 }
 const file=path.join(out,'original.ifc');fs.writeFileSync(file,m.w().api.file(m.w().mid).save({timeStamp:'2026-10-27T15:00:00'}));
 return{file,level:level.guid,plan,rcp:'rcp:'+level.guid,section:section.guid,hatch,walls:readWalls(m.w()).map(w=>w.guid),aliases};
}
