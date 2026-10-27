# SPDX-License-Identifier: Apache-2.0
"""Actual MCP stdio lifecycle plus independent saved IFC validation. Synthetic files stay local/ephemeral."""
import json,os
import subprocess
from pathlib import Path
import ifcopenshell
import ifcopenshell.validate
root=Path.cwd();out=root/'.cc-test/upstream-mcp';out.mkdir(exist_ok=True)
process=subprocess.Popen(['node',os.environ.get('MCP_SERVER','.cc-test/tools/mcp/server.mjs'),'--root',str(out),'--allow','read,edit,save,export'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
calls=[]
def call(method,params):
 number=len(calls)+1
 process.stdin.write(json.dumps({'jsonrpc':'2.0','id':number,'method':method,'params':params})+'\n');process.stdin.flush()
 while True:
  line=process.stdout.readline()
  if not line:raise RuntimeError('MCP server closed before replying: '+process.stderr.read())
  response=json.loads(line)
  if response.get('id')==number:break
 calls.append({'method':method,'params':params,'response':response});assert not response.get('error'),response
 return response['result']
def tool(name,args):
 result=call('tools/call',{'name':name,'arguments':args});assert not result.get('isError'),result
 return result.get('structuredContent') or json.loads(next(block['text'] for block in result['content'] if block['type']=='text'))
try:
 call('initialize',{'protocolVersion':'2025-03-26','capabilities':{},'clientInfo':{'name':'isolated-rebase-ci','version':'1'}})
 tools=call('tools/list',{})['tools'];names=[t['name'] for t in tools]
 assert all(name in names for name in ['ifc_new','walls_add','walls_list','ifc_save','ifc_open','undo'])
 doc=tool('ifc_new',{'name':'Synthetic rebase MCP fixture','levels':1})['doc']
 tool('walls_add',{'doc':doc,'points':[[0,0],[3000,0]],'height':2700,'type':'ext-2x6'})
 walls=tool('walls_list',{'doc':doc})['walls'];assert len(walls)==1
 negative=[]
 def refuse(name,args):
  result=call('tools/call',{'name':name,'arguments':args});assert result.get('isError'),result;negative.append(name)
 refuse('element_set',{'doc':doc,'guid':walls[0]['guid'],'set':'CadCraft_Wall','property':'Height','value':9999})
 assert tool('walls_list',{'doc':doc})['walls']==walls
 refuse('walls_add',{'doc':'d999999','points':[[0,0],[3000,0]],'height':2700,'type':'ext-2x6'})
 refuse('ifc_save',{'doc':doc,'path':str(out.parent/'outside-root.ifc'),'overwrite':True});assert not (out.parent/'outside-root.ifc').exists()
 existing=out/'existing.ifc';existing.write_text('Disposable overwrite-refusal sentinel')
 refuse('ifc_save',{'doc':doc,'path':str(existing)});assert existing.read_text()=='Disposable overwrite-refusal sentinel'
 saved=tool('ifc_save',{'doc':doc,'path':str(out/'created.ifc'),'overwrite':True})
 reopened=tool('ifc_open',{'path':saved['path']})['doc'];assert tool('walls_list',{'doc':reopened})['walls']==walls
 tool('undo',{'doc':doc,'steps':1});assert not tool('walls_list',{'doc':doc})['walls']
 undone=tool('ifc_save',{'doc':doc,'path':str(out/'undone.ifc'),'overwrite':True});again=tool('ifc_open',{'path':undone['path']})['doc'];assert not tool('walls_list',{'doc':again})['walls']
 independent=[]
 for file,count in [(out/'created.ifc',1),(out/'undone.ifc',0)]:
  logger=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(str(file),logger,express_rules=True);assert not logger.statements,logger.statements
  model=ifcopenshell.open(str(file));assert len(model.by_type('IfcWall'))==count
  independent.append({'file':file.name,'walls':count,'schemaFindings':0})
 # A second, ephemeral read-only process must expose a compatible catalog and refuse mutation/save.
 readonly=subprocess.Popen(['node',os.environ.get('MCP_SERVER','.cc-test/tools/mcp/server.mjs'),'--root',str(out),'--allow','read'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 def ro(method,params,number):
  readonly.stdin.write(json.dumps({'jsonrpc':'2.0','id':number,'method':method,'params':params})+'\n');readonly.stdin.flush()
  while True:
   response=json.loads(readonly.stdout.readline())
   if response.get('id')==number:return response['result']
 try:
  ro('initialize',{'protocolVersion':'2025-03-26','capabilities':{},'clientInfo':{'name':'readonly-control','version':'1'}},1)
  catalog=ro('tools/list',{},2)['tools'];assert catalog==[t for t in tools if t['description'].endswith('(Permission: read.)')]
  assert 'walls_list' in [t['name'] for t in catalog] and 'walls_add' not in [t['name'] for t in catalog]
  rdoc=ro('tools/call',{'name':'ifc_open','arguments':{'path':saved['path']}},3);assert not rdoc.get('isError'),rdoc
  rdoc=(rdoc.get('structuredContent') or json.loads(next(b['text'] for b in rdoc['content'] if b['type']=='text')))['doc']
  for number,(name,args) in enumerate([('walls_add',{'doc':rdoc,'points':[[0,0],[3000,0]],'height':2700,'type':'ext-2x6'}),('ifc_save',{'doc':rdoc,'path':str(out/'forbidden.ifc'),'overwrite':True})],4):
   denied=ro('tools/call',{'name':name,'arguments':args},number);assert denied.get('isError'),denied
  assert not (out/'forbidden.ifc').exists()
 finally:
  readonly.stdin.close();readonly.wait(timeout=10)
 report={'status':'PASS','head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'catalogCount':len(names),'toolNames':names,'independent':independent,'negativeRefusals':negative,'readOnlyPermissionRefusals':['walls_add','ifc_save'],'readOnlyCatalogCompatible':True,'calls':calls,'publication':'No raw IFC artifact upload. This basic lifecycle does not establish audited MCP parity.'}
 (out/'report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'status':'PASS','catalogCount':len(names),'independent':independent}))
 (out/'summary.json').write_text(json.dumps({k:v for k,v in report.items() if k!='calls'},indent=2)+'\n')
finally:
 process.stdin.close();process.wait(timeout=10)
