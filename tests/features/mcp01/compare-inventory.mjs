/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir=process.argv[2]||'.cc-test/mcp01-compat';
const read=name=>JSON.parse(fs.readFileSync(`${dir}/inventory-${name}.json`));
const foundation=read('foundation'),feature=read('feature'),candidate=read('candidate'),surfaces={};
for(const surface of ['live','headless']) {
 const current=new Map(candidate[surface].map(t=>[t.name,t]));assert.equal(current.size,candidate[surface].length);
 for(const prior of [foundation,feature])for(const tool of prior[surface]) {
  const now=current.get(tool.name);assert.ok(now,`${surface} lost ${tool.name}`);assert.equal(now.group,tool.group);
  for(const name of Object.keys(tool.inputSchema.properties||{}))assert.ok(now.inputSchema.properties[name],`${surface} lost ${tool.name}.${name}`);
  assert.deepEqual(now.inputSchema.required||[],tool.inputSchema.required||[],`${surface} required arguments changed: ${tool.name}`);
 }
 for(const name of ['wall_change','walls_add'])assert.equal(current.get(name).inputSchema.properties.type.enum,undefined);
 for(const name of ['element_set','wall_change','opening_change','elements_move','elements_delete','material_edit','assembly_edit','walls_edit'])for(const key of ['documentId','expectedRevision'])assert.ok(current.get(name).inputSchema.properties[key]);
 surfaces[surface]={foundation:foundation[surface].length,feature:feature[surface].length,candidate:current.size,missing:[],names:[...current.keys()]};
}
const report={status:'PASS',foundation:foundation.head,feature:feature.head,candidate:candidate.head,surfaces,decisions:['dynamic authored wall_change/walls_add type selection','optional checked binding added to retained generic model edits','shared protected-record/domain refusal and edit exclusion','live-only USD/render retained; absent unrelated headless siblings explicitly unavailable']};
fs.writeFileSync(`${dir}/capability-union.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
