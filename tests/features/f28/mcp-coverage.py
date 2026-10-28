# SPDX-License-Identifier: Apache-2.0
"""Retained lifecycle/permission audit reconciled with accepted authored-type tools. No model bytes or full model snapshots are published."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import ifcopenshell
import ifcopenshell.validate

root=Path.cwd();out=root/'.cc-test/f28-c-mcp';out.mkdir(parents=True,exist_ok=True)
fixture=root/'fixtures/f04/layered-plans.ifc'
work=Path(tempfile.mkdtemp(prefix='run-',dir=out))
report={'head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'transport':'MCP stdio 2025-03-26; repository mirror, no installed/connected-client claim','checks':[],'limits':['Live transport and installed/packaged client not verified.','Broader full-application semantic MCP catch-up remains OPEN.','Precision is checked from raw authoritative values and independent saved IFC, not display formatting.']}
class Client:
 def __init__(self,allow):
  self.p=subprocess.Popen(['node','.cc-test/tools/mcp/server.mjs','--root',str(work),'--root',str(fixture.parent),'--allow',allow],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True);self.n=0
  self.call('initialize',{'protocolVersion':'2025-03-26','capabilities':{},'clientInfo':{'name':'f28-c-coverage','version':'1'}})
 def call(self,method,params):
  self.n+=1;self.p.stdin.write(json.dumps({'jsonrpc':'2.0','id':self.n,'method':method,'params':params})+'\n');self.p.stdin.flush()
  while True:
   line=self.p.stdout.readline()
   if not line:raise RuntimeError('MCP server closed before response')
   reply=json.loads(line)
   if reply.get('id')==self.n:return reply
 def tool(self,name,args,refuse=False):
  reply=self.call('tools/call',{'name':name,'arguments':args});result=reply.get('result',{});failed=bool(reply.get('error') or result.get('isError'))
  if refuse:
   assert failed,(name,'expected actionable refusal');return json.dumps(reply)
  assert not failed,reply
  return result.get('structuredContent') or json.loads(next(x['text'] for x in result['content'] if x['type']=='text'))
 def close(self):
  self.p.stdin.close();self.p.wait(timeout=15)
def check(name):report['checks'].append(name);print('PASS',name)
def binding(client,doc):
 s=client.tool('model_describe',{'doc':doc});return {'documentId':s['documentId'],'expectedRevision':s['revision']}
def entity_hash(file):
 m=ifcopenshell.open(str(file));return hashlib.sha256('\n'.join(e.to_string() for e in m).encode()).hexdigest()
client=None;read_only=None
try:
 client=Client('read,edit,save,export');catalog=client.call('tools/list',{})['result']['tools'];names=[t['name'] for t in catalog]
 assert all(n in names for n in ['ifc_new','ifc_open','ifc_save','walls_list','walls_add','model_describe','undo']);report['catalog']=catalog;check('actual inherited MCP discovery includes the registered IFC lifecycle and shared wall tools')
 custom=client.tool('ifc_open',{'path':str(fixture)})['doc'];before=client.tool('walls_list',{'doc':custom});description=client.tool('model_describe',{'doc':custom});custom_key='wall-f04-rainscreen'
 assert any(w['type']==custom_key for w in before['walls']);assert custom_key in description['types']['walls'];created=client.tool('walls_add',{'doc':custom,**binding(client,custom),'points':[[20000,20000],[23000,20000]],'type':custom_key,'height':2700.123456});assert len(created['walls'])==1;assert any(w['guid']==created['walls'][0] and w['type']==custom_key for w in client.tool('walls_list',{'doc':custom})['walls']);client.tool('undo',{'doc':custom,**binding(client,custom),'steps':1});client.tool('redo',{'doc':custom,**binding(client,custom)});before=client.tool('walls_list',{'doc':custom});check('accepted authored-type discovery/create/readback and actual owned Undo/Redo')
 a=client.tool('ifc_new',{'name':'Owner A','levels':1})['doc'];b=client.tool('ifc_new',{'name':'Owner B','levels':1})['doc']
 client.tool('walls_add',{'doc':a,**binding(client,a),'points':[[0,0],[3000,0]],'type':'ext-2x6','height':2700})
 assert len(client.tool('walls_list',{'doc':a})['walls'])==1 and not client.tool('walls_list',{'doc':b})['walls'];check('explicit document handles isolate two projects through real transport calls')
 before_path=client.tool('ifc_save',{'doc':custom,'path':str(work/'before.ifc')})['path']
 refusals={
  'unknownType':client.tool('walls_add',{'doc':custom,**binding(client,custom),'points':[[0,0],[3000,0]],'type':'wall-not-authored','height':2700},refuse=True),
  'unknownDocument':client.tool('walls_add',{'doc':'d999999','points':[[0,0],[3000,0]],'type':'ext-2x6'},refuse=True),
  'invalidHeight':client.tool('walls_add',{'doc':custom,**binding(client,custom),'points':[[0,0],[3000,0]],'type':'ext-2x6','height':0},refuse=True),
  'outsideRoot':client.tool('ifc_open',{'path':str(root/'fixtures/f05/wall-views.ifc')},refuse=True),
 }
 assert client.tool('walls_list',{'doc':custom})==before
 after_path=client.tool('ifc_save',{'doc':custom,'path':str(work/'after.ifc')})['path'];assert entity_hash(before_path)==entity_hash(after_path)
 check('unknown-type schema, invalid input, unknown document and denied-root refusals leave every IFC entity unchanged')
 read_only=Client('read');rdoc=read_only.tool('ifc_open',{'path':str(fixture)})['doc'];read_before=read_only.tool('walls_list',{'doc':rdoc});refusals['permission']=read_only.tool('walls_add',{'doc':rdoc,**binding(read_only,rdoc),'points':[[0,0],[3000,0]],'type':'ext-2x6'},refuse=True);assert read_only.tool('walls_list',{'doc':rdoc})==read_before;check('read-only MCP permission refuses an edit without changing the opened source')
 # The separate upstream smoke retains create/read/save/reopen/undo and independent schema assertions unchanged.
 report['refusals']=refusals;report['modelPayloadPublication']='No IFC files or full wall/read-back payloads retained in public evidence.'
 report['documentationRegistered']=[n for n in names if n.startswith('documentation_')];assert len(report['documentationRegistered'])==21
 paths=['app/agents.js','app/bim-agent.js','tests/tools/cli/headless/tools.mjs','tests/tools/mcp/server.mjs']
 report['moduleHashes']={p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in paths}
 loaded=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{appDir,appVersion}from'./.cc-test/tools/cli/headless/apps.mjs';process.stdout.write(JSON.stringify({dir:appDir('bimcraft'),version:appVersion('bimcraft')}))"],text=True))
 loaded_dir=Path(loaded['dir']);module_hashes={}
 for source in (root/'app').rglob('*'):
  if source.is_file():
   relative=source.relative_to(root/'app');copied=loaded_dir/relative
   assert copied.is_file() and copied.read_bytes()==source.read_bytes(),str(relative)
   module_hashes[str(relative)]=hashlib.sha256(copied.read_bytes()).hexdigest()
 report['loadedFork']={'version':loaded['version'],'modules':len(module_hashes),'manifestSHA256':hashlib.sha256(json.dumps(module_hashes,sort_keys=True).encode()).hexdigest()};report['forkModuleRootVerified']=True
 # Summarize the existing independent-file lifecycle without publishing its model read-back trace.
 smoke=json.load(open(root/'.cc-test/upstream-mcp/report.json'));assert smoke['status']=='PASS';report['inheritedLifecycle']={k:smoke[k] for k in ['status','head','catalogCount','toolNames','independent']};report['status']='PASS';report['documentationTransportEvidence']='Separate required DOC-MCP source/package/live workflow; registry discovery alone is not parity.'
except Exception as e:
 report['status']='FAIL';report['error']=repr(e);raise
finally:
 if read_only:read_only.close()
 if client:client.close()
 (out/'report.json').write_text(json.dumps(report,indent=2)+'\n');print('F28_MCP_REPORT '+json.dumps(report))
