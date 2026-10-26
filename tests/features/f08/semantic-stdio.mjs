/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {buildMirror} from '../../../devshell/test.mjs';
import {stdio,initialized,tool} from '../mcp01/client.mjs';
import {semanticFixtures} from './semantic-fixtures.mjs';
import {semanticWorkflow,REQUIRED} from './semantic-workflow.mjs';
import {model} from './fixture.mjs';
import {modelTools} from '../../../app/agents.js';
const out=path.resolve(process.env.F08_MCP_OUT||'.cc-test/f08-semantic-stdio');fs.mkdirSync(out,{recursive:true});buildMirror();
const info=await semanticFixtures(out),server=path.resolve(process.env.F08_MCP_SERVER||'.cc-test/tools/mcp/server.mjs'),client=stdio(server,out),checks=[],trace=[];
const check=s=>{checks.push(s);console.log('PASS',s);};
const invoke=async(name,args={},fails=false)=>{const r=await tool(client,name,args,fails);trace.push({name,args,result:r});return r;};
const normalized=file=>fs.readFileSync(file,'utf8').replace(/FILE_NAME\([^;]+;/,'HEADER_TIMESTAMP');
try{
 await initialized(client);const catalog=(await client.request('tools/list')).result.tools;
 for(const name of REQUIRED){const actual=catalog.find(t=>t.name===name),source=modelTools({ed:()=>null}).find(t=>t.name===name);assert.ok(actual,name);const {doc,...properties}=actual.inputSchema.properties;assert.ok(doc);assert.deepEqual({...actual.inputSchema,properties,required:actual.inputSchema.required.filter(k=>k!=='doc')},source.inputSchema);}
 fs.writeFileSync(path.join(out,'catalog.json'),JSON.stringify(catalog,null,2));check('actual source/package stdio discovery contains all three strict schemas');
 const doc=(await invoke('ifc_open',{path:info.file})).doc,other=(await invoke('ifc_open',{path:info.file})).doc;
 const foreign=await invoke('model_describe',{doc:other});
 const call=(name,args={},fails=false)=>invoke(name,{doc,...args},fails);
 const result=await semanticWorkflow(call,info,check,{protectedSnapshot:async()=>{const file=path.join(out,'protected-state.ifc');await call('ifc_save',{path:file,overwrite:true});return normalized(file);}});
 await invoke('wall_join_end_set',{doc:other,documentId:result.state.documentId,expectedRevision:foreign.revision,wall:info.a,end:'a',patch:{allow:false}},true);
 assert.deepEqual(await invoke('model_describe',{doc:other}),foreign);
 for(const [handle,name]of [[doc,'saved'],[other,'unrelated']])await invoke('ifc_save',{doc:handle,path:path.join(out,name+'.ifc'),overwrite:true});
 assert.equal(normalized(path.join(out,'unrelated.ifc')),normalized(info.file));
 const reopened=(await invoke('ifc_open',{path:path.join(out,'saved.ifc')})).doc,newState=await invoke('model_describe',{doc:reopened});assert.notEqual(newState.documentId,result.state.documentId);
 for(const r of result.readbacks){const actual=await invoke('wall_joins_get',{doc:reopened,documentId:newState.documentId,wall:r.wall});assert.deepEqual(actual.geometry,r.geometry);assert.deepEqual(actual.record,r.record);}
 await invoke('wall_join_end_set',{doc:reopened,documentId:result.state.documentId,expectedRevision:result.state.revision,wall:info.a,end:'a',patch:{allow:false}},true);
 check('actual saved IFC semantic/profile reopen; identical-project separate editor unchanged; old instance token rejected');
 for(const n of info.negatives){
  const handle=(await invoke('ifc_open',{path:n.file})).doc,state=await invoke('model_describe',{doc:handle});
  const read=await invoke('wall_joins_get',{doc:handle,documentId:state.documentId,wall:n.wall},n.kind==='duplicate-id');
  if(n.kind==='legacy'){
   assert.equal(read.record.classification,'legacy');
   await invoke('wall_join_end_set',{doc:handle,documentId:state.documentId,expectedRevision:state.revision,wall:n.wall,end:'a',patch:{allow:true}});
   await invoke('undo',{doc:handle,steps:1});
  }else{
   if(!['duplicate-id','curve'].includes(n.kind)){assert.equal(read.record.classification,n.kind);assert.equal(read.record.effective,null);}
   await invoke('wall_join_end_set',{doc:handle,documentId:state.documentId,expectedRevision:state.revision,wall:n.wall,end:'a',patch:{allow:false}},true);
  }
  const after=path.join(out,'negative-'+n.kind+'-saved.ifc');await invoke('ifc_save',{doc:handle,path:after,overwrite:true});assert.equal(normalized(after),normalized(n.file));
  await invoke('doc_close',{doc:handle});await invoke('wall_joins_get',{doc:handle,documentId:state.documentId,wall:n.wall},true);
 }
 check('six malformed/unsupported/duplicate/legacy/curve fixtures, closed documents; no partial IFC writes and undoable explicit migration');
 const occupied=path.join(out,'preexisting.ifc');fs.copyFileSync(info.file,occupied);await invoke('ifc_save',{doc,path:occupied},true);
 await invoke('ifc_save',{doc,path:path.resolve(out,'..','forbidden.ifc'),overwrite:true},true);check('existing overwrite and allowed-root save boundaries retained');
 const readonly=stdio(server,out,'read');try{
  await initialized(readonly);const h=(await tool(readonly,'ifc_open',{path:info.file})).doc,s=await tool(readonly,'model_describe',{doc:h});
  await tool(readonly,'wall_joins_get',{doc:h,documentId:s.documentId,wall:info.a});
  await tool(readonly,'wall_join_end_set',{doc:h,documentId:s.documentId,expectedRevision:s.revision,wall:info.a,end:'a',patch:{allow:false}},true);
  await tool(readonly,'ifc_save',{doc:h,path:path.join(out,'denied.ifc')},true);
  await tool(readonly,'usd_export',{doc:h,path:path.join(out,'denied.usda')},true);
 }finally{await readonly.close();}check('read-only process permits inspection and refuses edits/save/export');
 const expected={...result,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()};fs.writeFileSync(path.join(out,'expected.json'),JSON.stringify(expected));
 fs.writeFileSync(path.join(out,'trace-private.json'),JSON.stringify(trace));
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'PASS',head:expected.head,transport:process.env.F08_MCP_SERVER?'isolated packaged stdio':'source stdio',catalogCount:catalog.length,checks,requestCount:trace.length},null,2));
 console.log(JSON.stringify({status:'PASS',checks:checks.length,requests:trace.length}));
}catch(e){fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:e.stack,checks},null,2));throw e;}finally{await client.close();}
