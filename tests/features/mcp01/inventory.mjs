/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const value=k=>process.argv[process.argv.indexOf(k)+1];
const root=path.resolve(process.argv.includes('--root')?value('--root'):'.');
const load=f=>import(pathToFileURL(path.join(root,f)));
const {buildMirror}=await load('devshell/test.mjs');buildMirror();
const {installAgents}=await load('app/agents.js'),{bimTools}=await load('app/bim-agent.js');
const live=[];installAgents({extend:()=>({ed:()=>null,S:{},host:{}})},{control:{tool:t=>live.push(t)},render:async()=>({})});live.push(...bimTools({}));
const {headlessTools,createEnv}=await load('.cc-test/tools/cli/headless/tools.mjs');const headless=headlessTools(createEnv());
const catalog=tools=>{assert.equal(new Set(tools.map(t=>t.name)).size,tools.length,'duplicate registration');return tools.map(({name,group,inputSchema})=>({name,group,inputSchema:inputSchema||{type:'object',properties:{},required:[],additionalProperties:false}})).sort((a,b)=>a.name.localeCompare(b.name));};
const report={head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),live:catalog(live),headless:catalog(headless)};
const out=value('--out');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({head:report.head,live:live.length,headless:headless.length}));
