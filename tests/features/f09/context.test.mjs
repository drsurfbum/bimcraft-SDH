/* SPDX-License-Identifier: Apache-2.0 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { captureInteraction, sameInteraction } from '../../../app/interaction-context.js';
test('menu capture is read-only and rejects selection/editor/source/view/history/tool changes', () => {
  let editor = { changes:[], undone:[] }, selection=[7], keyBase=0;
  const A={ed:()=>editor,kb:()=>keyBase,selectedKeys:()=>selection,S:{on:true,level:1,kind:'plan',callout:null,tool:'select',drag:null,busy:false,reloading:false,queue:[]}};
  const token=captureInteraction(A); assert.ok(sameInteraction(A,token));
  assert.equal(editor.changes.length,0); assert.equal(editor.undone.length,0);
  for (const [key,value] of [['level',2],['kind','rcp'],['callout','other'],['tool','wall'],['busy',true],['reloading',true],['queue',[1]],['on',false],['drag',{}]]) {
    const old=A.S[key];A.S[key]=value;assert.equal(sameInteraction(A,token),false,key);A.S[key]=old;
  }
  selection=[8];assert.equal(sameInteraction(A,token),false);selection=[7];
  keyBase=1000;assert.equal(sameInteraction(A,token),false);keyBase=0;
  const original=editor;editor={changes:[],undone:[]};assert.equal(sameInteraction(A,token),false);editor=original;
  editor.changes.push({label:'Person'});assert.equal(sameInteraction(A,token),false);
  editor.changes.pop(); assert.equal(sameInteraction(A,token),false,'Undo does not revive a captured menu');
});
