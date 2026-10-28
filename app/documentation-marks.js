/* SPDX-License-Identifier: Apache-2.0 */
// Existing native annotation composition, shared by the live scene and semantic vector export.
import { sectionDir } from './res-sheets.js';
export function appendCalloutMarks(scene,{callouts,key,rootOf,scale=50,sheetRef=()=>null}) {
 const r=5*scale;
 for(const c of callouts){
  if(c.parent!==key||!rootOf(c.id))continue;
  const [x0,y0,x1,y1]=c.crop,at=[x1+r*1.6,y1+r*1.6],k=Math.SQRT1_2;
  scene.symbols.push({key:null,callout:c.id,lines:[[x0,y0,x1,y0],[x1,y0,x1,y1],[x1,y1,x0,y1],[x0,y1,x0,y0],[x1,y1,at[0]-r*k,at[1]-r*k]],arcs:[{c:at,r,a0:0,a1:Math.PI*2}]});
  const ref=sheetRef(c.id);scene.rooms.push({key:null,callout:c.id,at,label:ref?[c.name,ref]:[c.name]});
 }
}
export function appendSectionMarks(scene,{sections,level,keyBase=0,bandOf=()=>null}) {
 for(const sl of sections){
  if(sl.storey!==level)continue;
  const {dir,u}=sectionDir(sl),ext=600;
  const a=[sl.a[0]-u[0]*ext,sl.a[1]-u[1]*ext],b=[sl.b[0]+u[0]*ext,sl.b[1]+u[1]*ext],arrows=[];
  for(const e of [a,b]){const tip=[e[0]+dir[0]*500,e[1]+dir[1]*500];arrows.push([e[0],e[1],tip[0],tip[1]],[tip[0],tip[1],tip[0]-dir[0]*160+u[0]*120,tip[1]-dir[1]*160+u[1]*120],[tip[0],tip[1],tip[0]-dir[0]*160-u[0]*120,tip[1]-dir[1]*160-u[1]*120]);}
  scene.symbols.push({key:keyBase+sl.id,lines:[[...a,...b],...arrows],dashed:[],poly:bandOf([a,b],150)});
  for(const e of [a,b]){const c=[e[0]-dir[0]*350,e[1]-dir[1]*350];scene.rooms.push({key:keyBase+sl.id,poly:[[c[0]-250,c[1]-250],[c[0]+250,c[1]-250],[c[0]+250,c[1]+250],[c[0]-250,c[1]+250]],at:c,label:[sl.name]});}
 }
}
