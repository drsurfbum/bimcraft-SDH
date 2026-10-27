/* SPDX-License-Identifier: Apache-2.0 */
// Repeat the unchanged live isolation assertions on an explicit source control or candidate.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {historyBrowser} from './history-browser.mjs';
const root=path.resolve(process.env.MCP01_HISTORY_ROOT||'.'),out=path.resolve(process.env.MCP01_HISTORY_OUT||'.cc-test/mcp01-history-controls');
const {start}=await import(pathToFileURL(path.join(root,'devshell/serve.mjs')));
const {chromium}=await import(pathToFileURL(path.resolve(process.env.MCP01_PLAYWRIGHT||'.cc-test/mcp01-deps/node_modules/playwright/index.mjs')));
const report={head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),runs:[],errors:[]};
fs.mkdirSync(out,{recursive:true});let server,browser;
try {
 server=await start({port:8046,host:'127.0.0.1',offline:true});browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 for(let i=0;i<Number(process.env.MCP01_HISTORY_REPEATS||2);i++) {
  const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}}),dir=path.join(out,'run-'+(i+1));fs.mkdirSync(dir,{recursive:true});
  const checks=[];try {const result=await historyBrowser(context,dir,label=>{checks.push(label);console.log('PASS',label);});report.runs.push({checks,result});}finally{await context.close();}
 }
 report.status='PASS';
} catch(e) {report.status='FAIL';report.errors.push(e.stack||e.message);throw e;}
finally {fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();await new Promise(r=>{if(server){server.close(r);server.closeAllConnections?.();}else r();});}
console.log(JSON.stringify({status:report.status,head:report.head,runs:report.runs.length,checks:report.runs.reduce((n,r)=>n+r.checks.length,0)}));
