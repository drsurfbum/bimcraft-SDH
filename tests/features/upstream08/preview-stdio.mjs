/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {model} from '../f04/fixture.mjs';
import {readWalls} from '../../../app/model-walls.js';
import {buildMirror} from '../../../devshell/test.mjs';
import {stdio,initialized,tool} from '../mcp01/client.mjs';
const server=process.env.UP08_MCP_SERVER;if(!server)buildMirror();
const out=path.resolve(process.env.UP08_MCP_OUT||'.cc-test/upstream08/preview-source');fs.mkdirSync(out,{recursive:true});fs.copyFileSync('fixtures/f04/layered-plans.ifc',path.join(out,'input.ifc'));
const client=stdio(path.resolve(server||'.cc-test/tools/mcp/server.mjs'),out);
try{
 await initialized(client);const opened=await tool(client,'ifc_open',{path:'input.ifc'}),doc=opened.doc;
 const m=await model(),wall=readWalls(m.w())[0].guid;m.ed.api.CloseModel(m.ed.mid);
 await tool(client,'element_set',{doc,guid:wall,attribute:'Name',value:'Retained Redo'});await tool(client,'undo',{doc,steps:1});
 const state=await tool(client,'model_describe',{doc});
 const r=await tool(client,'element_set',{doc,guid:wall,attribute:'Name',value:'Preview only',preview:true});assert.equal(r.preview,true);assert.equal(r.applied,false);
 assert.deepEqual(await tool(client,'model_describe',{doc}),state);
 await tool(client,'element_set',{doc,guid:wall,attribute:'Name',value:'Preview only',preview:true,documentId:'wrong'},true);
 await tool(client,'redo',{doc});await tool(client,'ifc_save',{doc,path:'after.ifc'});
 assert.ok(fs.readFileSync(path.join(out,'after.ifc'),'utf8').includes('Retained Redo'));assert.ok(!fs.readFileSync(path.join(out,'after.ifc'),'utf8').includes('Preview only'));
 console.log('PASS source/package stdio preview preserves document, bindings and Redo');
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'PASS',checks:3,server:path.resolve(server||'.cc-test/tools/mcp/server.mjs')},null,2));
}finally{await client.close();}
