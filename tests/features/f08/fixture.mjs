/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {model as open,exterior,interior,scene} from '../f04/fixture.mjs';
import {newBuilding,stackLevels} from '../../../app/new-model.js';
import {readLevels} from '../../../app/model-levels.js';
import {readWalls,wallOutlines,storedShape,locationLine} from '../../../app/model-walls.js';
import {readAssemblies} from '../../../app/wall-assemblies.js';
import {readMaterials} from '../../../app/project-materials.js';
import {drawWalls,saveWallAssembly,placeOpening,changeWall} from '../../../app/model-ops.js';
import {saveWallDimension,readWallDimensions,resolveDimension} from '../../../app/wall-dimensions.js';
import {readOpenings} from '../../../app/model-openings.js';
import {setPlanView} from '../../../app/views-model.js';
import {wallPlanGraphics} from '../../../app/wall-plan-graphics.js';
export const fixture=new URL('../../../fixtures/f08/straight-joins.ifc',import.meta.url);
export const model=(bytes=fs.readFileSync(fixture))=>open(bytes);
export const A={...exterior,key:'wall-f08-exterior',name:'F08 ventilated exterior'};
export const B={...interior,key:'wall-f08-interior',name:'F08 service partition'};
export const names=['L equal','L dissimilar','Acute 30','Obtuse 150','T dissimilar','X four arms','L reverse exterior'];
export async function generate(){
 const m=await open(new TextEncoder().encode(newBuilding({name:'F08-A straight joins',levels:stackLevels(1,3300,()=> 'F08 Ground'),now:new Date('2026-10-23T12:00:00Z')})));
 m.change(saveWallAssembly(A));m.change(saveWallAssembly(B));const lv=readLevels(m.w())[0];
 let count=0;
 const draw=(a,b,typeKey=A.key,justification='coreCenter',extSide='left')=>m.change(drawWalls({storey:lv.guid,height:3000,typeKey,segs:[{a,b,justification,extSide,guid:'0F08W'+String(count++).padStart(17,'0')}]}));
 for(let i=0;i<7;i++){
  const x=(i%3)*10500,y=Math.floor(i/3)*10000,p=[x+1000,y+1000],angle=i===2?30:i===3?150:90;
  const just=['center','exterior','interior','coreExterior','coreInterior','coreCenter','coreCenter'][i],side=i===6?'right':'left';
  if(i===4){draw([p[0]-3000,p[1]],[p[0]+3000,p[1]],A.key,just,side);draw(p,[p[0],p[1]+4000],B.key,just,side);}
  else if(i===5)for(const [j,d]of [0,90,180,270].entries())draw(p,[p[0]+4000*Math.cos(d*Math.PI/180),p[1]+4000*Math.sin(d*Math.PI/180)],j%2?B.key:A.key,just,side);
  else{draw(p,[p[0]+4000,p[1]],A.key,just,side);draw(p,[p[0]+4000*Math.cos(angle*Math.PI/180),p[1]+4000*Math.sin(angle*Math.PI/180)],i===0?A.key:B.key,just,side);}
 }
 const walls=readWalls(m.w()),wall=walls.find(w=>w.justification==='coreCenter'&&w.extSide==='right');
 m.change(placeOpening({wall:wall.guid,typeKey:'win-fixed',offset:500,width:600,sill:900,height:1200}));
 for(const [i,refs]of [['coreExterior','coreInterior'],['exterior','interior']].entries())m.change(saveWallDimension({level:lv.guid,view:'plan:'+lv.guid,axis:'y',offset:1000+i*500,refs:refs.map(reference=>({wall:wall.guid,reference,station:.8}))}));
 m.change(setPlanView(lv.guid,{detail:'fine',scale:200}));
 const seed=await open(m.ed.save());return seed.w().api.file(seed.w().mid).save({timeStamp:'2026-10-23T12:00:00'});
}
export function inspect(m){
 const w=m.w(),walls=readWalls(w),outlines=wallOutlines(walls.map(x=>({...x,key:x.guid})));
 return {walls,types:readAssemblies(w),materials:readMaterials(w),dims:readWallDimensions(w).map(d=>({...d,resolved:resolveDimension(d,walls)})),openings:readOpenings(w),
 anchors:walls.map(w=>[w.guid,locationLine(w)]),outlines:[...outlines],diagnostics:outlines.diagnostics||[],
 shapes:walls.map(wall=>({guid:wall.guid,...storedShape(w,wall.id)})),scene:scene(m,wallPlanGraphics)};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){fs.mkdirSync(new URL('../../../fixtures/f08/',import.meta.url),{recursive:true});fs.writeFileSync(fixture,await generate());console.log(fileURLToPath(fixture));}
