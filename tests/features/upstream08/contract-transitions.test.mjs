/* SPDX-License-Identifier: Apache-2.0 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {transitions,applyContractTransitions,pins,sourceProof} from './contract-transitions.mjs';
import {compareAssertions} from '../upstream07/assertion-comparison.mjs';
import {checkManifest} from '../../../app/addons.js';
import {BIMCRAFT_API_VERSION} from '../../../app/addons/bimcraft-api.js';
import {parseTjiTable,pickTji,setActiveTji} from '../../../app/tji-table.js';
import {frameFloor} from '../../../app/res-framing.js';
test('reviewed contract source blobs match both immutable upstream releases',()=>{
 for(const proof of sourceProof)for(const side of ['before','after'])assert.equal(execFileSync('git',['rev-parse',pins[side]+':'+proof.file],{encoding:'utf8'}).trim(),proof[side]);
});
test('every replacement assertion and its multiplicity is required; unrelated missing assertions still fail',()=>{
 for(const change of transitions){const {expected,applied}=applyContractTransitions([change.before,change.before,'retained'],change.modes[0]);assert.equal(applied.length,2);assert.equal(compareAssertions(expected,[...change.after,...change.after,'retained']).status,'PASS');
  for(let i=0;i<expected.length;i++)assert.equal(compareAssertions(expected,expected.filter((_,j)=>i!==j)).status,'FAIL');
  assert.deepEqual(applyContractTransitions([change.before],'unrelated').expected,[change.before]);
 }
});
test('API1.4 accepts every retained1.x level through1.4 and refuses later levels',()=>{
 assert.equal(BIMCRAFT_API_VERSION,'1.4');const m={id:'zz.test',name:'Test',version:'1.0.0',apps:['bimcraft'],license:'Apache-2.0',entry:'main.js'};
 for(const api of ['1.0','1.1','1.2','1.3','1.4'])assert.equal(checkManifest({...m,api},{app:'bimcraft',apiVersion:BIMCRAFT_API_VERSION}).ok,true);
 for(const api of ['1.5','1.99','2.0'])assert.equal(checkManifest({...m,api},{app:'bimcraft',apiVersion:BIMCRAFT_API_VERSION}).ok,false);
});
test('loaded example TJI table retains smallest-fitting-depth, span bounds and explicit missing-table refusal',()=>{
 const parsed=parseTjiTable(fs.readFileSync(new URL('../../tools/bimcraft-test/fixtures/tji-example.json',import.meta.url),'utf8'));assert.equal(parsed.ok,true);assert.equal(parsed.table.example,true);
 for(const [feet,inches] of [[10,9.5],[14,11.875],[16,14]]){const r=pickTji(parsed.table,{span:feet*304.8,spacing:406.4,caseId:'EX-40-10-L480'});assert.equal(r.ok,true);assert.equal(r.depth,inches*25.4);}
 assert.equal(pickTji(parsed.table,{span:30*304.8,spacing:609.6,caseId:'EX-40-10-L480'}).key,'tji.err.beyond');
 setActiveTji(null);const p=[[0,0],[6000,0],[6000,4000],[0,4000]],opts={spacing:406.4,floorMode:'tji',floorDir:'y'};const refused=frameFloor(p,opts);assert.equal(refused.error,'tji.err.none');assert.equal(refused.pieces.length,0);
 const made=frameFloor(p,{...opts,tji:{table:parsed.table,caseId:'EX-40-10-L480'}});assert.ok(!made.error);assert.deepEqual(made.dir,[0,1]);assert.ok(made.pieces.some(x=>x.tji&&x.size.startsWith('EX-')));
});
