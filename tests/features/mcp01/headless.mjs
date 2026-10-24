/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { buildMirror } from '../../../devshell/test.mjs';
import { stdio, initialized, tool } from './client.mjs';
import { workflow, REQUIRED } from './workflow.mjs';
import { corruptFixtures } from './negative-fixtures.mjs';
const out=path.resolve(process.env.MCP01_OUT || '.cc-test/mcp01-headless');fs.mkdirSync(out,{recursive:true});
buildMirror();
const server=path.resolve(process.env.MCP01_SERVER || '.cc-test/tools/mcp/server.mjs');
const client=stdio(server,out),checks=[];
const check=label=>{checks.push(label);console.log('PASS',label);};
try {
 const init=await initialized(client);assert.equal(init.serverInfo.version,'0.4.0-mcp01.1');
 const catalog=(await client.request('tools/list')).result.tools;
 for(const name of REQUIRED)assert.ok(catalog.some(t=>t.name===name),'missing '+name);
 assert.equal(catalog.find(t=>t.name==='walls_add').inputSchema.properties.type.enum,undefined);
 fs.writeFileSync(path.join(out,'catalog.json'),JSON.stringify(catalog,null,2)+'\n');
 check('real stdio initialization, version and schema/registration catalog');
 const originalFile=path.join(out,'original.ifc');fs.copyFileSync('fixtures/f04/layered-plans.ifc',originalFile);const originalBytes=fs.readFileSync(originalFile);
 const doc=(await tool(client,'ifc_open',{path:originalFile})).doc;
 const other=(await tool(client,'ifc_open',{path:originalFile})).doc;
 const separate=await tool(client,'walls_list',{doc:other});
 const call=(name,args={},fails=false)=>tool(client,name,{doc,...args},fails);
 const result=await workflow(call,check);
 await tool(client,'walls_edit',{doc:other,documentId:result.documentId,expectedRevision:result.revision,walls:[separate.walls[0].guid],changes:{height:2900}},true);
 assert.deepEqual(await tool(client,'walls_list',{doc:other}),separate);assert.deepEqual(fs.readFileSync(originalFile),originalBytes);
 const saved=await tool(client,'ifc_save',{doc,path:path.join(out,'saved.ifc'),overwrite:true});
 const reopened=(await tool(client,'ifc_open',{path:saved.path})).doc;
 const normalize=xs=>xs.map(({id,...x})=>x);
 assert.deepEqual(normalize((await tool(client,'walls_list',{doc:reopened})).walls),normalize(result.walls));
 assert.deepEqual((await tool(client,'materials_list',{doc:reopened})).materials,result.materials);
 assert.deepEqual((await tool(client,'assemblies_list',{doc:reopened})).assemblies.map(({id,...t})=>t),result.assemblies.map(({id,...t})=>t));
 await tool(client,'ifc_save',{doc:other,path:path.join(out,'original-saved.ifc'),overwrite:true});
 check('actual saved IFC reopens exactly; separately opened original and source bytes unchanged');
 const state=await call('model_describe');
 const denied=stdio(server,out,'read');try {
  await initialized(denied);const d=(await tool(denied,'ifc_open',{path:originalFile})).doc;
  const before=await tool(denied,'walls_list',{doc:d});
  await tool(denied,'material_edit',{doc:d,documentId:state.documentId,expectedRevision:state.revision,id:'material-studs',changes:{defaultThickness:300}},true);
  await tool(denied,'ifc_save',{doc:d,path:path.join(out,'denied.ifc')},true);
  assert.deepEqual(await tool(denied,'walls_list',{doc:d}),before);assert.ok(!fs.existsSync(path.join(out,'denied.ifc')));
 } finally {await denied.close();}
 await tool(client,'ifc_save',{doc,path:path.join(os.tmpdir(),'mcp01-outside-roots.ifc')},true);
 const existing=path.join(out,'protected.ifc');fs.writeFileSync(existing,'Do not replace');await tool(client,'ifc_save',{doc,path:existing},true);assert.equal(fs.readFileSync(existing,'utf8'),'Do not replace');
 check('edit/save denial, allowed roots and overwrite protection refuse without changes');
 const fixtures=await corruptFixtures(out);
 for(const file of fixtures) {
  const bad=(await tool(client,'ifc_open',{path:file})).doc;
  const read=await tool(client,'assemblies_list',{doc:bad});assert.ok(read.diagnostics.length);
  const before=(await tool(client,'ifc_save',{doc:bad,path:file+'.before.ifc',overwrite:true}));
  await tool(client,'material_create',{doc:bad,documentId:read.documentId,expectedRevision:read.revision,id:'material-refused',name:'Refused',defaultThickness:3,color:'#123456',fill:'solid',fillColor:'#abcdef'},true);
  const after=await tool(client,'ifc_save',{doc:bad,path:file+'.after.ifc',overwrite:true});
  const data=p=>fs.readFileSync(p,'utf8').replace(/FILE_NAME\([^;]+;/,'HEADER_TIMESTAMP');
  assert.equal(data(before.path),data(after.path));await tool(client,'doc_close',{doc:bad});
 }
 check('unsupported/corrupt assemblies, invalid core and material-library records refuse atomically over transport');
 fs.writeFileSync(path.join(out,'expected.json'),JSON.stringify(result,null,2)+'\n');
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'PASS',head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),node:process.version,platform:os.platform(),server,version:init.serverInfo.version,checks,catalogCount:catalog.length,negativeCases:20+fixtures.length+5,skips:[]},null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',checks:checks.length,catalog:catalog.length,negativeFixtures:fixtures.length}));
} finally {await client.close();}
