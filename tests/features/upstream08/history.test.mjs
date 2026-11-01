/* SPDX-License-Identifier: Apache-2.0 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mountUndoHook } from '../../../app/undo-hook.js';
function setup() {
 let active={changes:[]}, busy=false; const A=active, B={changes:[]}, calls=[];
 const hook=mountUndoHook({document:()=>active,changes:()=>active.changes,busy:()=>busy,undoOne:()=>{calls.push(active);active.changes.pop();hook.undone();},win:null});
 const edit=(label='Person')=>{active.changes.push({label});hook.settle();return hook.rep.onMessage('undo.probe');};
 return {A,B,hook,calls,edit,switchTo:x=>{active=x;},busy:x=>{busy=x;}};
}
test('Studio refuses stale step on equal-depth project switch before and after settle',()=>{
 for(const settled of [false,true]){const s=setup(),step=s.edit().step;s.B.changes.push({label:'Person B'});s.switchTo(s.B);if(settled)s.hook.settle();assert.equal(s.hook.rep.onMessage('undo.probe').step,'');assert.equal(s.hook.rep.onMessage('undo.run',{step}).ok,false);assert.equal(s.B.changes.length,1);assert.equal(s.A.changes.length,1);assert.equal(s.calls.length,0);}
});
test('Studio rejects replacement and in-place ownership changes at equal depth',()=>{
 for(const replace of [true,false]){const s=setup(),step=s.edit().step;if(replace)s.A.changes[0]={label:'Other'};else s.A.changes[0].label='Other';assert.equal(s.hook.rep.onMessage('undo.run',{step}).ok,false);assert.equal(s.calls.length,0);}
});
test('Studio preserves ordinary explicit Undo and refuses while application busy',()=>{
 const s=setup(),step=s.edit().step;s.busy(true);assert.equal(s.hook.rep.onMessage('undo.run',{step}).why,'busy');s.busy(false);assert.equal(s.hook.rep.onMessage('undo.run',{step}).ok,true);assert.equal(s.calls.length,1);assert.equal(s.A.changes.length,0);
});
test('switch then new edit cannot reuse the original project step token',()=>{
 const s=setup(),old=s.edit().step;s.B.changes.push({label:'B'});s.switchTo(s.B);s.hook.settle();const next=s.edit().step;assert.notEqual(old,next);assert.equal(s.hook.rep.onMessage('undo.run',{step:old}).ok,false);assert.equal(s.hook.rep.onMessage('undo.run',{step:next}).ok,true);assert.equal(s.B.changes.length,1);
});
