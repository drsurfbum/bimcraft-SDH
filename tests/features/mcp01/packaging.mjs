/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {buildMirror} from '../../../devshell/test.mjs';
const out=path.resolve('.cc-test/mcp01-package');fs.mkdirSync(out,{recursive:true});buildMirror();
execFileSync(process.execPath,['.cc-test/tools/mcp/pack.mjs','--out',path.join(out,'build'),'--tgz'],{stdio:'pipe',env:{...process.env,npm_config_cache:path.join(out,'npm-cache')}});
const tgz=path.join(out,'drsurfbum-bimcraft-mcp-0.4.0-mcp01.1.tgz'),consumer=fs.mkdtempSync(path.join(os.tmpdir(),'mcp01-consumer-'));
execFileSync('tar',['-xzf',tgz,'-C',consumer]);const packed=path.join(consumer,'package'),server=path.join(packed,'mcp/server.mjs');
const env={...process.env,MCP01_SERVER:server,MCP01_OUT:path.join(out,'consumer')};delete env.CADCRAFT_APPS;delete env.NODE_PATH;
execFileSync(process.execPath,['tests/features/mcp01/headless.mjs'],{env,stdio:'inherit'});
const manifest=JSON.parse(fs.readFileSync(path.join(packed,'package.json')));assert.equal(manifest.name,'@drsurfbum/bimcraft-mcp');assert.equal(manifest.version,'0.4.0-mcp01.1');
const files=[];
for(const name of ['agents.js','agent-history.js','material-wall-agent.js','model-ops.js','model-walls.js','wall-assemblies.js','project-materials.js','ifc-edit.js']) {
 const source=fs.readFileSync(path.join('app',name)),shipped=fs.readFileSync(path.join(packed,'cli/apps/bimcraft',name));assert.deepEqual(shipped,source);
 files.push({file:name,sha256:crypto.createHash('sha256').update(shipped).digest('hex')});
}
// Removal is confined to an extracted temporary consumer. Missing mandatory module must kill startup, never shrink tools/list.
const missing=path.join(packed,'cli/apps/bimcraft/material-wall-agent.js');fs.renameSync(missing,missing+'.missing');
const failed=spawnSync(process.execPath,[server,'--version'],{env,encoding:'utf8'});assert.notEqual(failed.status,0);assert.match(failed.stderr,/material-wall-agent|ERR_MODULE_NOT_FOUND/);fs.renameSync(missing+'.missing',missing);
const report={status:'PASS',head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),package:manifest.name,version:manifest.version,isolatedConsumer:consumer,sha256:crypto.createHash('sha256').update(fs.readFileSync(tgz)).digest('hex'),files,checks:['npm pack and isolated extraction outside repository','complete semantic MCP workflow on extracted fork with CADCRAFT_APPS/NODE_PATH removed','fork version and required module bytes match','missing required module fails startup; no silent catalog skip'],skips:[]};
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS',package:manifest.name,version:manifest.version,checks:report.checks.length}));
