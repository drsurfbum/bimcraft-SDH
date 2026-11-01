/* SPDX-License-Identifier: Apache-2.0 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from '../f08/fixture.mjs';
import {modelTools} from '../../../app/agents.js';
import {readWalls} from '../../../app/model-walls.js';
import {changeWall} from '../../../app/model-ops.js';
import {documentHistoryState,documentState} from '../../../app/material-wall-agent.js';
const bytes=e=>e.api.file(e.mid).save({timeStamp:'2026-11-01T00:00:00'});
test('detached IFC previews preserve bytes, revision, person Undo and Redo on success and failure',async()=>{
 const m=await model(),wall=readWalls(m.w())[0];m.ed.modelChange(changeWall(wall.guid,{height:3200}),{label:'Person height'});m.ed.undo();
 const before=bytes(m.ed),state=documentHistoryState(m.ed),undo=[...m.ed.changes],redo=[...m.ed.undone];let liveCalls=0;
 const tools=modelTools({ed:()=>m.ed,apply:()=>{liveCalls++;throw Error('live mutation');},refresh:()=>{liveCalls++;}});
 const set=tools.find(x=>x.name==='element_set');const result=await set.preview({guid:wall.guid,attribute:'Name',value:'Preview only'});assert.equal(result.undo,null);
 await assert.rejects(set.preview({guid:'missing',attribute:'Name',value:'X'}));
 await assert.rejects(set.preview({guid:wall.guid,attribute:'Name',value:'X',documentId:'wrong'}));
 assert.equal(liveCalls,0);assert.deepEqual(bytes(m.ed),before);assert.deepEqual(documentHistoryState(m.ed),state);assert.deepEqual(m.ed.changes,undo);assert.deepEqual(m.ed.undone,redo);m.ed.redo();assert.equal(readWalls(m.w())[0].height,3200);
});
test('pending detached preview refuses a project switch or revision change without rolling back either model',async()=>{
 for(const change of ['switch','revision']){
  const a=await model(),b=await model(),wall=readWalls(a.w())[0];let active=a.ed;
  const tool=modelTools({ed:()=>active}).find(x=>x.name==='element_set'),beforeB=bytes(b.ed);
  const pending=tool.preview({guid:wall.guid,attribute:'Name',value:'preview'});
  if(change==='switch')active=b.ed;else a.ed.modelChange(changeWall(wall.guid,{height:3333}),{label:'Person interleaving'});
  const beforeA=bytes(a.ed);await assert.rejects(pending,/Document changed|revision/i);assert.deepEqual(bytes(a.ed),beforeA);assert.deepEqual(bytes(b.ed),beforeB);
 }
});
