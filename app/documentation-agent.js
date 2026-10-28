/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: MCP tool schemas and structured results, not presentation strings. */
import { BINDING, bindDocument, documentState } from './material-wall-agent.js';
import { docWriter, docFail, plain, uniqueProduct, assertDocumentation, documentationIssues, documentationSources, documentationSource, documentationSettings, documentationAnnotations, documentationTables, tablePages } from './documentation-data.js';
import { documentationMutation } from './documentation-mutation.js';
import { setPlanView, validatePlanViewChange, readTemplates, saveTemplate, deleteTemplate, readCallouts, saveCallout, deleteCallout, readSheets, saveSheet, deleteSheet } from './views-model.js';
import { setProjectedView, validateProjectedViewChange } from './projected-views.js';
import { addDrafting, changeDrafting, moveDrafting, removeDrafting, readDrafting, PATTERN_KEYS } from './drafting.js';
import { readSectionLines, placeSectionLine, changeSectionLine, removeSectionLines, PAPERS } from './res-sheets.js';
import { saveWallDimension, removeWallDimensions, WALL_REFERENCES, readWallDimensions } from './wall-dimensions.js';
import { documentationExportTool } from './documentation-export.js';

const object=(properties,required=[])=>({type:'object',properties,required,additionalProperties:false});
const text={type:'string',minLength:1,maxLength:160},guid={type:'string',pattern:'^[0-3][0-9A-Za-z_$]{21}$'};
const number={type:'number',minimum:-1e7,maximum:1e7},positive={type:'number',minimum:0,maximum:1e7};
const xy={type:'array',items:number,minItems:2,maxItems:2},crop={anyOf:[{type:'null'},{type:'array',items:number,minItems:4,maxItems:4}]};
const list=s=>({type:'array',items:s,maxItems:1000});
const scale={type:'number',minimum:0,maximum:10000};
const detail={type:'string',enum:['coarse','medium','fine']};
const settings={cut:positive,top:positive,bottom:number,depth:positive,detail,scale,crop,underlay:{type:'string',maxLength:64},template:{type:'string',maxLength:60},hiddenClasses:list({type:'string',pattern:'^Ifc[A-Za-z0-9]+$'}),hiddenGuids:list(guid)};
const nonempty=properties=>({...object(properties),minProperties:1});
const same=(a,b)=>JSON.stringify(plain(a))===JSON.stringify(plain(b));
const patchSame=(current,patch)=>Object.entries(patch).every(([k,v])=>same(current?.[k],v));
const dimensionRef=object({wall:guid,reference:{type:'string',enum:WALL_REFERENCES},station:{type:'number',minimum:0,maximum:1}},['wall','reference','station']);
const placement=object({kind:{type:'string',enum:['plan','rcp','callout','section','elevation','schedule']},ref:text,x:number,y:number,ratio:scale},['kind','ref','x','y','ratio']);

export function documentationTools(env){
 const E=(a,write=false)=>{
  if(!a.documentId)docFail('DOCUMENT_REQUIRED','An explicit documentId is required.');
  const ed=env.ed();if(!ed||!ed.api.IsModelOpen(ed.mid))docFail('DOCUMENT_CLOSED','No open bound IFC document.');
  if(env.busy?.())docFail('BUSY','Document is busy.');
  if(write&&env.documentationEditing?.())docFail('DIRTY_PROPERTIES','Finish or cancel the pending Properties input first.');
  bindDocument(ed,a);if(write)assertDocumentation(docWriter(ed));return ed;
 };
 const read=(name,description,properties,required,run)=>({name,title:name,group:'read',description,inputSchema:object({documentId:BINDING.documentId,...properties},['documentId',...required]),run:a=>{const ed=E(a);return{...documentState(ed),...run(ed,a)};}});
 const edit=(name,description,properties,required,prepare)=>({name,title:name,group:'edit',description,inputSchema:object({...BINDING,...properties},['documentId','expectedRevision',...required]),run:a=>{const ed=E(a,true);return documentationMutation(env,ed,name,prepare(ed,a));}});
 const task=(target,run,read,noop=false)=>({target,run,read,noop});
 const prepareView=(ed,key,patch)=>{
  const current=documentationSettings(ed,key),s=current.source,w=docWriter(ed);
  if(!Object.keys(patch).length)docFail('EMPTY_PATCH','Give at least one supported setting.');
  let run;
  if(['plan','rcp'].includes(s.kind)){
   if(current.effective.template&&!Object.hasOwn(patch,'template')&&Object.keys(patch).some(k=>['cut','top','bottom','depth','detail','scale','hiddenClasses'].includes(k)))docFail('TEMPLATE_CONTROLLED','Edit/unbind the explicit template instead.');
   validatePlanViewChange(w,s.ref,patch,s.kind);run=setPlanView(s.ref,patch,s.kind);
  }else if(['section','elevation'].includes(s.kind)){
   if(Object.keys(patch).some(k=>!['detail','scale','crop'].includes(k)))docFail('UNSUPPORTED_SETTING','Projected views support detail, scale and crop.');
   validateProjectedViewChange(w,key,patch);run=setProjectedView(key,patch);
  }else docFail('UNSUPPORTED_SETTING','Callouts inherit range/detail; use documentation_callout_save for their own crop/scale.');
  return task(key,run,e=>documentationSettings(e,key),!!current.raw&&patchSame(current.raw,patch));
 };
 const findAnnotation=(ed,guid)=>{
  const w=docWriter(ed);uniqueProduct(w,guid);
  const rows=[...readDrafting(w).map(d=>({...d,category:'drafting'})),...readSectionLines(w).map(d=>({...d,category:'section'})),...readWallDimensions(w).map(d=>({...d,category:'dimension'}))].filter(d=>d.guid===guid);
  if(rows.length!==1||rows[0].issue)docFail('ANNOTATION_UNAVAILABLE','Expected one supported annotation.');return rows[0];
 };
 const sheetRead=(ed,id)=>{
  const sheets=readSheets(docWriter(ed));if(!id)return{sheets};const sheet=sheets.find(s=>s.id===id);if(!sheet)docFail('SHEET_MISSING','No sheet with this ID.');
  return{sheet,placements:sheet.views.map((v,index)=>{const sourceId=v.kind+':'+v.ref;let missing=false;try{documentationSource(ed,sourceId);}catch{missing=true;}return{...v,index,sourceId,missing,indexRevisionScoped:true};})};
 };
 return[
  read('documentation_sources','Discover document-owned stable source IDs, diagnostics, continuation IDs and ordinary history ownership labels. Duplicate labels never select a source. UI activation is explicitly live-only.',{},[],ed=>({sources:documentationSources(ed),diagnostics:documentationIssues(docWriter(ed)),history:{changes:ed.changes.map(c=>({kind:c.kind,label:c.label,owner:String(c.label||c.kind).startsWith('Assistant: ')?'assistant':'person'})),undone:ed.undone.map(c=>({kind:c.kind,label:c.label,owner:String(c.label||c.kind).startsWith('Assistant: ')?'assistant':'person'}))},activation:{available:!!env.activateDocumentation,headlessCode:'LIVE_ONLY'},scope:'existing C documentation; no full-application parity claim'})),
  {name:'documentation_activate',title:'Activate documentation source',group:'edit',description:'Transient live drawing activation by explicit owner/source ID; no IFC mutation/history step. Headless returns LIVE_ONLY with no changes. Does not change default layout.',inputSchema:object({...BINDING,source:text},['documentId','expectedRevision','source']),run:async a=>{
   const ed=E(a),source=documentationSource(ed,a.source);if(env.documentationEditing?.())docFail('DIRTY_PROPERTIES','Finish or cancel the pending Properties input first.');if(!env.activateDocumentation)return{...documentState(ed),supported:false,code:'LIVE_ONLY',reason:'Source activation needs an existing live workspace. Domain reads/edits/composition/exports work headless.',changed:false,completedSteps:0};
   if(source.continuation)docFail('PLACEMENT_ONLY_SOURCE','Continuation pages can be inspected, placed and exported; they have no standalone live tab.');
   const state=documentState(ed);let activated=false;
   try{bindDocument(ed,a);await env.activateDocumentation(source);activated=true;if(env.ed()!==ed||!ed.api.IsModelOpen(ed.mid))docFail('document_changed','Document switched after activation.');bindDocument(ed,a);return{...documentState(ed),activated:true,source,changed:false,completedSteps:0};}
   catch(e){if(!activated)throw e;return{...state,activated:true,source,changed:false,completedSteps:0,complete:false,isError:true,code:'POST_ACTIVATION_INTERRUPTED',error:e.message};}
  }},
  read('documentation_view_get','Read persisted and effective raw-mm View Range/detail/scale/template values. Callout inheritance is explicit.',{source:text},['source'],(ed,a)=>documentationSettings(ed,a.source)),
  edit('documentation_views_set','Validated view edits, one ordinary journal per changed source. All targets preflight first; stop across awaited person/history/document changes. No-op sources create no history. Captured commit data is labeled.',{sources:{...list(text),minItems:1,maxItems:50,uniqueItems:true},patch:nonempty(settings)},['sources','patch'],(ed,a)=>{
   if(new Set(a.sources).size!==a.sources.length)docFail('DUPLICATE_SOURCE','Duplicate source IDs.');return a.sources.map(key=>prepareView(ed,key,a.patch));
  }),
  read('documentation_templates_get','Inspect existing named view templates without migration.',{},[],ed=>({templates:readTemplates(docWriter(ed)),diagnostics:documentationIssues(docWriter(ed))})),
  edit('documentation_template_save','Create/update/rename a template through the existing domain operation. Unspecified existing fields are retained.',{name:{type:'string',minLength:1,maxLength:60},oldName:{type:'string',minLength:1,maxLength:60},patch:nonempty({cut:positive,top:positive,bottom:number,depth:positive,detail,scale,hidden:settings.hiddenClasses})},['name','patch'],(ed,a)=>{
   const all=readTemplates(docWriter(ed)),old=all.find(t=>t.name===(a.oldName||a.name));if(a.oldName&&!old)docFail('TEMPLATE_MISSING','Template ID/name is unavailable.');
   const next={...old,...a.patch,name:a.name};return[task('template:'+a.name,saveTemplate(next,old?.name||null),e=>({templates:readTemplates(docWriter(e))}),!!old&&same(old,next))];
  }),
  edit('documentation_template_remove','Delete an existing template; the authoritative operation preserves settings on views that used it.',{name:{type:'string',minLength:1,maxLength:60}},['name'],(ed,a)=>{if(!readTemplates(docWriter(ed)).some(t=>t.name===a.name))docFail('TEMPLATE_MISSING','No such template.');return[task('template:'+a.name,deleteTemplate(a.name),e=>({templates:readTemplates(docWriter(e))}))];}),
  edit('documentation_callout_save','Create/edit the existing callout record with explicit parent source, crop and scale. Parent/root ownership and cycles are validated by the domain.',{id:{type:'string',pattern:'^callout-[0-9]+$'},name:{type:'string',minLength:1,maxLength:60},parent:text,crop:{type:'array',items:number,minItems:4,maxItems:4},scale},['name','parent','crop','scale'],(ed,a)=>{
   const parent=documentationSource(ed,a.parent);if(!['plan','rcp','callout'].includes(parent.kind))docFail('UNSUPPORTED_PARENT','Callout parent must be a plan/RCP/callout.');
   const old=a.id?readCallouts(docWriter(ed)).find(c=>c.id===a.id):null;if(a.id&&!old)docFail('CALLOUT_MISSING','No such callout.');const spec={...(a.id?{id:a.id}:{}),name:a.name,parent:a.parent,crop:a.crop,scale:a.scale};
   return[task(a.id?'callout:'+a.id:a.parent,saveCallout(spec),(e,r)=>({callout:readCallouts(docWriter(e)).find(c=>c.id===(r?.callout||a.id))}),!!old&&patchSame(old,{name:a.name,parent:a.parent,crop:a.crop,scale:a.scale}))];
  }),
  edit('documentation_callout_remove','Remove an explicit callout and its domain-owned descendants/drafting in one existing transaction; dangling sheet references remain diagnosable.',{id:{type:'string',pattern:'^callout-[0-9]+$'}},['id'],(ed,a)=>{documentationSource(ed,'callout:'+a.id,{allowMissing:true});return[task('callout:'+a.id,deleteCallout(a.id),e=>({callouts:readCallouts(docWriter(e)),sheets:readSheets(docWriter(e))}))];}),
  read('documentation_annotations_get','Inspect native drafting/section annotations and resolved/unresolved persistent wall references; raw coordinates stay mm.',{source:text},[],(ed,a)=>documentationAnnotations(ed,a.source||null)),
  edit('documentation_annotation_create','Create supported lines/hatch or a bounded section line with an explicit source/owner, using native domain writers.',{source:text,kind:{type:'string',enum:['lines','hatch','section']},points:{...list(xy),minItems:2,maxItems:1000},holes:list({...list(xy),minItems:3}),closed:{type:'boolean'},pattern:{type:'string',enum:PATTERN_KEYS},patternScale:{type:'number',minimum:.1,maximum:50},name:{type:'string',minLength:1,maxLength:8},look:{type:'string',enum:['left','right']},depth:positive},['source','kind','points'],(ed,a)=>{
   const s=documentationSource(ed,a.source);if(!['plan','rcp','callout'].includes(s.kind)||!s.level)docFail('UNSUPPORTED_SOURCE','Annotations require a supported plan/RCP/callout.');
   if(a.kind==='section'&&(a.points.length!==2||s.kind==='callout'))docFail('INVALID_SECTION','A section uses two endpoints on a level plan/RCP.');
   const run=a.kind==='section'?placeSectionLine({level:s.level,a:a.points[0],b:a.points[1],name:a.name,look:a.look||'left',depth:a.depth??0}):addDrafting({level:s.level,view:a.source,kind:a.kind,pts:a.points,holes:a.holes||[],closed:a.closed,pattern:a.pattern,scale:a.patternScale});
   return[task(a.source,run,(e,r)=>({annotation:findAnnotation(e,r.guid||[...(r.made||[])][0]?.[0])}))];
  }),
  edit('documentation_annotation_edit','Edit native hatch settings, move drafting, or change bounded section fields. Move and style are separate atomic operations; unsupported fields are refused.',{guid,patch:nonempty({pattern:{type:'string',enum:PATTERN_KEYS},patternScale:{type:'number',minimum:.1,maximum:50},move:xy,name:{type:'string',minLength:1,maxLength:8},look:{type:'string',enum:['left','right']},depth:positive,a:xy,b:xy})},['guid','patch'],(ed,a)=>{
   const d=findAnnotation(ed,a.guid),p=a.patch,keys=Object.keys(p);let run,noop=false;
   if(d.category==='drafting'){
    if(keys.some(k=>!['pattern','patternScale','move'].includes(k))||(p.move&&keys.length!==1))docFail('UNSUPPORTED_PATCH','Use only move, or hatch pattern/scale.');
    if(p.move){run=moveDrafting([a.guid],...p.move);noop=p.move.every(v=>v===0);}
    else{if(d.kind!=='hatch')docFail('UNSUPPORTED_PATCH','Only hatches have pattern settings.');const patch={...('pattern'in p?{pattern:p.pattern}:{}),...('patternScale'in p?{scale:p.patternScale}:{})};run=changeDrafting([a.guid],patch);noop=patchSame(d,patch);}
   }else if(d.category==='section'){
    if(keys.some(k=>!['name','look','depth','a','b'].includes(k)))docFail('UNSUPPORTED_PATCH','Unsupported section setting.');const next={...d,...p};if(Math.hypot(next.b[0]-next.a[0],next.b[1]-next.a[1])<100)docFail('INVALID_SECTION','Section must remain at least 100 mm long.');run=changeSectionLine(a.guid,p);noop=patchSame(d,p);
   }else docFail('TYPED_DIMENSION_REQUIRED','Use documentation_dimension_save for persistent references.');
   return[task(a.guid,run,e=>({annotation:findAnnotation(e,a.guid)}),noop)];
  }),
  edit('documentation_annotation_remove','Remove one explicitly identified drafting/section annotation through its native domain operation.',{guid},['guid'],(ed,a)=>{const d=findAnnotation(ed,a.guid);if(d.category==='dimension')docFail('TYPED_DIMENSION_REQUIRED','Use documentation_dimension_remove.');return[task(a.guid,d.category==='drafting'?removeDrafting([a.guid]):removeSectionLines([a.guid]),e=>documentationAnnotations(e))];}),
  read('documentation_dimensions_get','Resolve persistent semantic wall references, including missing/coincident/unsupported states without cached or invented measurements.',{source:text,guid},[],(ed,a)=>{let rows=documentationAnnotations(ed,a.source||null).dimensions;if(a.guid){uniqueProduct(docWriter(ed),a.guid);rows=rows.filter(d=>d.guid===a.guid);if(rows.length!==1)docFail('DIMENSION_MISSING','No such dimension.');}return{dimensions:rows};}),
  edit('documentation_dimension_save','Create/edit/rebind existing persistent dimensions using exactly two authoritative wall references. No driving constraints or coordinate-only dimensions.',{guid,source:text,refs:{type:'array',items:dimensionRef,minItems:2,maxItems:2},axis:{type:'string',enum:['x','y','aligned']},offset:number},['source','refs'],(ed,a)=>{
   const s=documentationSource(ed,a.source);if(!['plan','rcp','callout'].includes(s.kind))docFail('UNSUPPORTED_SOURCE','Dimensions require a plan/RCP/callout.');
   for(const r of a.refs)uniqueProduct(docWriter(ed),r.wall);if(a.guid&&findAnnotation(ed,a.guid).category!=='dimension')docFail('DIMENSION_MISSING','ID is not a persistent dimension.');
   const spec={...(a.guid?{guid:a.guid}:{}),level:s.level,view:a.source,refs:a.refs,axis:a.axis||'aligned',offset:a.offset??300};const old=a.guid?readWallDimensions(docWriter(ed)).find(d=>d.guid===a.guid):null;
   return[task(a.guid||a.source,saveWallDimension(spec),(e,r)=>({dimension:documentationAnnotations(e).dimensions.find(d=>d.guid===(r?.guid||a.guid))}),!!old&&patchSame(old,{view:spec.view,refs:spec.refs,axis:spec.axis,offset:spec.offset}))];
  }),
  edit('documentation_dimension_remove','Remove an explicitly identified persistent dimension with native history.',{guid},['guid'],(ed,a)=>{if(findAnnotation(ed,a.guid).category!=='dimension')docFail('DIMENSION_MISSING','No such dimension.');return[task(a.guid,removeWallDimensions([a.guid]),e=>({dimensions:documentationAnnotations(e).dimensions}))];}),
  read('documentation_table_prepare','Build/rebuild an existing fixed-domain schedule or legend from current authoritative records. Derived, nonmutating; not a new persistent custom schedule schema. Nominal-mm rows, raw CSV cells and continuation identities are complete.',{source:text},['source'],(ed,a)=>{
   const s=documentationSource(ed,a.source);if(s.kind!=='schedule')docFail('UNSUPPORTED_SOURCE','Choose an explicit schedule/legend source.');const tables=documentationTables(ed),pages=tablePages(tables),table=tables[s.ref]||pages.find(p=>p.ref===s.ref);if(!table)docFail('TABLE_MISSING','Missing continuation.');
   return{source:s,table:plain(table),pages:pages.filter(p=>p.ref===s.ref||p.ref.startsWith(s.ref==='materialLegend'?'f06-materials:':s.ref==='assemblies'?'f06-assemblies:':s.ref+':')).map(p=>({source:'schedule:'+p.ref,title:p.title,rows:p.rows.length})),derived:true,changed:false,configuration:{columns:'existing fixed domain columns',units:'mm',pagination:'authoritative documentPages; explicit continuation placement'}};
  }),
  read('documentation_sheets_get','Read persisted sheet IDs and placements; placement indices are explicitly revision-scoped, not invented persistent IDs. Missing source references remain visible.',{sheet:{type:'string',pattern:'^sheet-[0-9]+$'}},[],(ed,a)=>sheetRead(ed,a.sheet)),
  edit('documentation_sheet_save','Create/edit a native sheet. Explicit views replaces placements, allowing source/continuation addition, scale/move/removal. Existing dangling refs may be retained and diagnosed, never silently rebound.',{sheet:{type:'string',pattern:'^sheet-[0-9]+$'},patch:nonempty({number:{type:'string',maxLength:20},title:{type:'string',maxLength:120},paper:{type:'string',enum:Object.keys(PAPERS)},views:{type:'array',items:placement,maxItems:500}})},['patch'],(ed,a)=>{
   const old=a.sheet?sheetRead(ed,a.sheet).sheet:null,next={...(old||{number:'',title:'',paper:'a3',views:[]}),...a.patch,...(a.sheet?{id:a.sheet}:{})};
   for(const v of next.views){try{documentationSource(ed,v.kind+':'+v.ref);}catch(e){if(!old?.views.some(p=>p.kind===v.kind&&p.ref===v.ref))throw e;}}
   return[task(a.sheet||'new-sheet',saveSheet(next),(e,r)=>sheetRead(e,r?.sheet||a.sheet),!!old&&patchSame(old,a.patch))];
  }),
  edit('documentation_sheet_remove','Delete one native sheet; source records remain owned by their document.',{sheet:{type:'string',pattern:'^sheet-[0-9]+$'}},['sheet'],(ed,a)=>{sheetRead(ed,a.sheet);return[task(a.sheet,deleteSheet(a.sheet),e=>sheetRead(e))];}),
  documentationExportTool(env,E),
 ];
}
