/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { buildMirror } from '../../../devshell/test.mjs';
buildMirror();
const out=path.resolve('.cc-test/f09-package');fs.mkdirSync(out,{recursive:true});
execFileSync(process.execPath,['.cc-test/tools/mcp/pack.mjs','--bimcraft-only','--out',path.join(out,'build'),'--tgz'],{stdio:'pipe',env:{...process.env,npm_config_cache:path.join(out,'npm-cache')}});
const consumer=fs.mkdtempSync(path.join(os.tmpdir(),'f09-package-'));
execFileSync('tar',['-xf',path.join(out,'drsurfbum-bimcraft-mcp-0.7.0-mcp01.1.tgz'),'-C',consumer]);
for(const file of ['wall-targets.js','wall-target-agent.js','agents.js','wall-dimensions.js','material-wall-agent.js','wall-join-agent.js','agent-history.js'])
  assert.deepEqual(fs.readFileSync(path.join(consumer,'package/cli/apps/bimcraft',file)),fs.readFileSync(path.join('app',file)));
const env={...process.env,F09_MCP_SERVER:path.join(consumer,'package/mcp/server.mjs'),F09_MCP_OUT:path.join(out,'consumer')};delete env.NODE_PATH;delete env.CADCRAFT_APPS;
execFileSync(process.execPath,['tests/features/f09/semantic.mjs'],{stdio:'inherit',env});
console.log('PASS packaged fork bytes and actual isolated semantic workflow');
