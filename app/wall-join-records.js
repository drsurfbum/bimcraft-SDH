/* SPDX-License-Identifier: Apache-2.0 */
import {ids,val} from './ifc-util.js';
import {parseRecord,readRecordPset,recordError,checkRecordVersion} from './record-contract.js';
export const JOIN_PSET='CadCraft_WallJoin';
export const defaultJoinSettings=()=>({version:1,a:{allow:true,cap:'envelope'},b:{allow:true,cap:'envelope'}});
export function validateJoinSettings(input) {
 checkRecordVersion(input,'wallJoin');
 if(Object.keys(input).some(k=>!['version','a','b'].includes(k)))throw recordError('wallJoin','corrupt');
 for(const end of ['a','b']){
  const e=input[end];
  if(!e||typeof e!=='object'||Array.isArray(e)||Object.keys(e).some(k=>!['allow','cap','node','tee'].includes(k))||typeof e.allow!=='boolean'||!['envelope','square'].includes(e.cap))throw recordError('wallJoin','corrupt');
  if(e.tee!==undefined&&(typeof e.tee!=='string'||!/^[0-3][0-9A-Za-z_$]{21}$/.test(e.tee)))throw recordError('wallJoin','corrupt');
  if(e.node!==undefined){
   const members=typeof e.node==='string'&&e.node.startsWith('join:')?e.node.slice(5).split('|'):[];
   if(typeof e.node!=='string'||e.node.length>200||members.length<2||members.length>4||new Set(members).size!==members.length||members.some(m=>!/^[0-3][0-9A-Za-z_$]{21}:[ab]$/.test(m)))throw recordError('wallJoin','corrupt');
  }
 }
 return {version:1,a:{...input.a},b:{...input.b}};
}
export function readJoinRecord(w,id) {
 try {
  const ps=readRecordPset(w,id,JOIN_PSET,'wallJoin');
  if(ps===null)return {settings:defaultJoinSettings()};
  const raw=ps.Settings,settings=validateJoinSettings(parseRecord(raw,'wallJoin'));
  const guid=val(w.api.GetLine(w.mid,id,false)?.GlobalId);
  for(const end of ['a','b'])if(settings[end].tee===guid)throw recordError('wallJoin','corrupt');
  for(const end of ['a','b'])if(settings[end].node&&!settings[end].node.slice(5).split('|').includes(guid+':'+end))throw recordError('wallJoin','corrupt');
  return {settings,raw};
 }catch(e){return {settings:null,issue:e.recordIssue||'corrupt',message:recordError('wallJoin',e.recordIssue||'corrupt').message};}
}
export function assertWallJoinsEditable(w) {
 for(const id of [...ids(w.api,w.mid,'IFCWALL'),...ids(w.api,w.mid,'IFCWALLSTANDARDCASE')]){
  const r=readJoinRecord(w,id);if(r.issue)throw recordError('wallJoin',r.issue);
 }
}
export function writeJoinSettings(w,id,input){
 const previous=readJoinRecord(w,id);if(previous.issue)throw recordError('wallJoin',previous.issue);
 const settings=validateJoinSettings(input);
 const guid=val(w.api.GetLine(w.mid,id,false)?.GlobalId);
 for(const end of ['a','b'])if(settings[end].node&&!settings[end].node.slice(5).split('|').includes(guid+':'+end))throw recordError('wallJoin','corrupt');
 w.upsertPset(id,JOIN_PSET,[['Settings','IFCTEXT',JSON.stringify(settings)]]);
}
