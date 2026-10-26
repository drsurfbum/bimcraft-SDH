/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const packed='.cc-test/packed',rows=[];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function check(src,dst) {for(const item of fs.readdirSync(dst,{withFileTypes:true})) {const a=path.join(src,item.name),b=path.join(dst,item.name);if(item.isDirectory())check(a,b);else{assert.equal(hash(b),hash(a),b);rows.push({path:b,sha256:hash(b)});}}}
check('app',packed+'/cli/apps/bimcraft');check('app/ifc',packed+'/cli/lib/ifc');
for(const f of ['LICENSE','NOTICE','THIRD_PARTY.md'])assert.equal(hash(f),hash(packed+'/'+f));
const manifest=JSON.parse(fs.readFileSync(packed+'/package.json'));assert.equal(manifest.version,'0.7.0');assert.equal(manifest.private,true);
assert.ok(rows.some(x=>x.path.endsWith('/agents.js')));assert.ok(rows.some(x=>x.path.endsWith('/ifc-edit.js')));
fs.mkdirSync('.cc-test/upstream07',{recursive:true});fs.writeFileSync('.cc-test/upstream07/package-closure.json',JSON.stringify({status:'PASS',files:rows,notices:['LICENSE','NOTICE','THIRD_PARTY.md'],version:manifest.version},null,2));console.log('PASS exact source hashes and notices for '+rows.length+' packaged files');
