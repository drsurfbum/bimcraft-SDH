/* SPDX-License-Identifier: Apache-2.0 */
import {t} from './i18n.js';
import {el} from './ui-util.js';
import {wallOutlines} from './model-walls.js';
import {changeWall} from './model-ops.js';
import {defaultJoinSettings} from './wall-join-records.js';
/** Narrow established-Properties adapter; no workspace layout ownership. */
export function wallJoinFields(wall,walls,{field,select,commit,one}) {
 const reason=wall.joinIssue?t('contract.wallJoin')+': '+t('contract.'+wall.joinIssue)+' '+t('contract.recovery'):wall.bulge?t('join.curvedControl'):null;
 if(reason){field(t('join.title'),el('span',{'role':'alert','data-join-warning':''},reason));return;}
 const settings=wall.joinSettings||defaultJoinSettings();
 for(const end of ['a','b']){
  field(t('join.'+end),select([['allow',t('join.allow')],['disallow',t('join.disallow')]],settings[end].allow?'allow':'disallow','data-mp-join-'+end,value=>{
   commit(changeWall(wall.guid,{joinSettings:{...settings,[end]:{...settings[end],allow:value==='allow'}}}),one(t('join.title')));
  }));
  field(t('join.cap.'+end),select([['envelope',t('join.envelope')],['square',t('join.square')]],settings[end].cap,'data-mp-cap-'+end,value=>{
   commit(changeWall(wall.guid,{joinSettings:{...settings,[end]:{...settings[end],cap:value}}}),one(t('join.title')));
  }));
 }
 field('',el('span',{className:'bc-sub'},t('join.note')));
 const out=wallOutlines(walls.filter(w=>w.storey===wall.storey).map(w=>({...w,key:w.guid})));
 const reasons=[...new Set((out.diagnostics||[]).filter(d=>d.key===wall.guid).map(d=>d.reason))];
 for(const reason of reasons)field(t('join.status'),el('span',{'data-join-warning':'',role:'status'},t('join.reason.'+reason)));
}
