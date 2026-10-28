/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: MCP manifests use stable IDs and raw mm, not UI strings. */
// Composition adapter only. IFC geometry, view cuts, marks, tables, layout and PDF
// serialization are the same authoritative modules used by the native application.
import { IfcModel } from './ifc-model.js';
import { IfcEditor } from './ifc-edit.js';
import { ModelWriter } from './model-write.js';
import { docWriter, docFail, assertDocumentation, documentationSources, documentationSource, documentationSettings, documentationTables, tablePages } from './documentation-data.js';
import { BINDING, documentState, bindDocument } from './material-wall-agent.js';
import { readLevels } from './model-levels.js';
import { readWalls, wallOutlines, wallsThrough } from './model-walls.js';
import { readOpenings, openingSymbol } from './model-openings.js';
import { wallPlanGraphics, wallPlanEdges } from './wall-plan-graphics.js';
import { readMaterials } from './project-materials.js';
import { readWallDimensions, resolveDimension } from './wall-dimensions.js';
import { readDrafting, draftingItem } from './drafting.js';
import { readSheets, readCallouts, calloutRoot, underlaySegments, ceilingGrid } from './views-model.js';
import { readProjectedView, projectedBox } from './projected-views.js';
import { readSectionLines, sectionDir, composeSheet, buildSet, setPdf, PAPERS } from './res-sheets.js';
import { planPdf } from './model-pdf.js';
import { scheduleCsv } from './model-schedule.js';
import { viewerToPlan, planCut, chainLoops, wallPieces } from './model-plan.js';
import { modelTriangles, projectView, elevationDirs } from './res-views.js';
import { sectionModel, straightElevationWidth } from './wall-section-graphics.js';
import { appendCalloutMarks, appendSectionMarks } from './documentation-marks.js';
import { viewNotes, openingFacts } from './comforts-views.js';
import { wallGeom } from './model-arcs.js';
import { readGrids, toPlan, gridsInView } from './model-grids.js';
import { mul4, inv4 } from './ifc-util.js';
import { loopsOf, snapshotModel } from './model-ops.js';
import { loopAt, labelPoint } from './model-rooms.js';
import { CEILING_PATTERNS } from './model-slabs.js';
import { fmtLen, fmtArea } from './model-units.js';

export async function documentationInput(original,{units='mm'}={}) {
 const bytes=original.api.file(original.mid).save();
 const host=await IfcModel.create(original.W,null,{manifold:false});
 try{
  const model=await host.load(bytes),ed=new IfcEditor(original.W,{api:host.api,modelID:model.modelID}),w=docWriter(ed);
  const levels=readLevels(w),walls=readWalls(w),openings=readOpenings(w),materials=readMaterials(w),drafting=readDrafting(w),dimensions=readWallDimensions(w),sections=readSectionLines(w),callouts=readCallouts(w),sheets=readSheets(w),snap=snapshotModel(ed);
  const g=levels.find(l=>Math.abs(l.elevation)<1)||levels[0];if(!g)docFail('NO_LEVEL','No level for documentation.');
  const sources=documentationSources(ed),cache=new Map(),C=host.api.GetCoordinationMatrix(model.modelID),tables=documentationTables(ed);
  const levelGuids=new Set(levels.map(l=>l.guid)),rootOf=id=>calloutRoot(callouts,id,levelGuids);
  const sceneFor=(key,suppressUnderlay=false)=>{
   if(!suppressUnderlay&&cache.has(key))return cache.get(key);
   const settings=documentationSettings(ed,key),source=settings.source,r=settings.effective,lv=levels.find(l=>l.guid===source.level),kind=source.rootKind||source.kind;
   const hidden=(cls,guid)=>r.hiddenGuids.includes(guid)||r.hiddenClasses.some(c=>c.toLowerCase()===cls.toLowerCase());
   const own=walls.filter(q=>q.storey===lv.id&&!hidden('IfcWall',q.guid)),ops=openings.filter(o=>o.storey===lv.id&&!hidden(o.kind==='window'?'IfcWindow':'IfcDoor',o.guid));
   const outlines=wallOutlines(own.map(q=>({...q,key:q.guid}))),rows=wallPlanGraphics(own,outlines,openings,materials,{detail:r.detail,scale:r.scale||50,cutZ:r.cut});
   const skip=new Set([...walls,...openings,...drafting,...dimensions,...sections].map(x=>x.id));
   for(const [id,cls] of model.classOf)if(hidden(cls,w.guidOf(id)))skip.add(id);
   const M=viewerToPlan(C,w.storeyWorld(lv.id));
   const cut=planCut(model,{M,storey:lv.id,cutZ:r.cut,skip,bottom:kind==='rcp'?r.cut:r.bottom,depth:kind==='rcp'?0:r.depth,top:r.top});
   const scene={walls:rows,wallEdges:wallPlanEdges(rows),symbols:kind==='rcp'?[]:ops.map(o=>({key:o.id,guid:o.guid,...openingSymbol(o,walls.find(q=>q.id===o.wall))})),rooms:[],dims:[],cut:[...cut.cut].map(([key,segs])=>({key,segs,loops:chainLoops(segs)})),below:[...(kind==='rcp'?cut.above:cut.below)].map(([key,segs])=>({key,segs})),above:kind==='rcp'?[]:[...cut.above].map(([key,segs])=>({key,segs})),crop:r.crop,scale:r.scale,detail:r.detail,cutZ:r.cut,kind,through:[]};
   const through=wallsThrough(walls,levels,lv.id,r.cut).filter(q=>!hidden('IfcWall',q.guid));
   for(const q of through){const group=walls.filter(x=>x.storey===q.storey),poly=wallOutlines(group.map(x=>({...x,key:x.guid}))).get(q.guid)||[],from=levels.find(x=>x.id===q.storey),relative=lv.elevation+r.cut-from.elevation;scene.through.push({key:q.id,guid:q.guid,from:from.name,poly,pieces:wallPieces(q,poly,openings.filter(o=>o.wall===q.id),relative)});}
   const loops=loopsOf(ed,lv.id);
   if(kind!=='rcp'&&!hidden('IfcSpace',''))for(const sp of snap.derived.spaces.filter(s=>s.storey===lv.id)){const loop=loopAt(loops.rooms,sp.seed);if(loop)scene.rooms.push({key:sp.id,poly:loop.poly,at:labelPoint(loop.poly),label:[sp.name||sp.number,fmtArea(loop.area,units)]});}
   if(kind==='rcp')for(const ceiling of snap.derived.ceilings.filter(s=>s.storey===lv.id)){const loop=loopAt(ceiling.mode==='building'?loops.outlines:loops.rooms,ceiling.seed);if(loop){const segs=ceilingGrid(loop.poly,loop.holes||[],CEILING_PATTERNS.find(p=>p.key===ceiling.pattern)),thin=[];for(let i=0;i+3<segs.length;i+=4)thin.push(segs.slice(i,i+4));scene.symbols.push({key:ceiling.id,thin,poly:loop.poly});scene.rooms.push({key:ceiling.id,at:labelPoint(loop.poly),label:['CLG '+fmtLen(ceiling.height,units)]});}}
   scene.grids=toPlan(w,lv.id,readGrids(w)).flatMap(g=>g.axes.map(a=>({...a,bubbles:g.bubbles})));
   if(!hidden('IfcAnnotation','')){
    scene.drafting=drafting.filter(d=>d.view===key).map(d=>draftingItem(d,d.id));
    scene.dims=dimensions.filter(d=>d.view===key).map(d=>resolveDimension(d,walls)).filter(d=>d.status==='ok').map(d=>({...d,key:d.guid,text:fmtLen(d.value,units)}));
    appendSectionMarks(scene,{sections,level:lv.id});
    appendCalloutMarks(scene,{callouts,key,rootOf,scale:r.scale||50,sheetRef:id=>{for(const sheet of sheets){const i=sheet.views.findIndex(v=>v.kind==='callout'&&v.ref===id);if(i>=0)return(i+1)+' / '+sheet.number;}return null;}});
   }
   if(r.underlay&&!suppressUnderlay){const other=levels.find(l=>l.guid===r.underlay);if(other)scene.underlay={level:other.guid,segs:underlaySegments(sceneFor('plan:'+other.guid,true),mul4(inv4(w.storeyWorld(lv.id)),w.storeyWorld(other.id)))};}
   if(!suppressUnderlay)cache.set(key,scene);return scene;
  };
  const input={plans:[],rcps:[],callouts:[],sections:[],elevations:[],schedules:tablePages(tables),framing:[],interiors:[]};
  for(const s of sources.filter(s=>['plan','rcp','callout'].includes(s.kind)&&!s.missing))input[s.kind==='plan'?'plans':s.kind==='rcp'?'rcps':'callouts'].push({ref:s.ref,title:s.name,scene:sceneFor(s.id)});
  const facts=openingFacts(openings,walls,wallGeom).map(o=>({...o,z0:o.z0+(levels.find(l=>l.id===o.storey)?.elevation||0)-g.elevation,z1:o.z1+(levels.find(l=>l.id===o.storey)?.elevation||0)-g.elevation}));
  const projected=(key,storey,dir,cut=null,far=0)=>{
   const settings=readProjectedView(w,key),section=sectionModel(w,storey),axes=toPlan(w,storey,readGrids(w)).flatMap(g=>g.axes);
   if(settings.issue)docFail('UNSUPPORTED_PROJECTED_RECORD',settings.issue);
   const view={...projectView(modelTriangles(model,viewerToPlan(C,w.storeyWorld(storey))),{dir,...(cut?{cut}:{}),far,...section,materials,detail:settings.detail,scale:settings.scale||50,box:projectedBox(settings)}),scale:settings.scale,grids:gridsInView(axes,dir)};
   view.notes=viewNotes(view,{kind:cut?'section':'elevation',dir,base:levels.find(l=>l.id===storey)?.elevation||0,levels:levels.map(l=>({name:l.name,elevation:l.elevation})),fmt:n=>fmtLen(n,units),...(!cut?{openings:facts,width:straightElevationWidth(section.walls,dir)}:{})});return view;
  };
  for(const [side,dir] of Object.entries(elevationDirs))input.elevations.push({ref:side,title:side,view:projected('elevation:'+side,g.id,dir)});
  for(const s of sections){const d=sectionDir(s);input.sections.push({ref:s.guid,title:s.name,view:projected('section:'+s.guid,s.storey,d.dir,{o:d.o},s.depth)});}
  return{input,ed,sources,tables,sceneFor,close:()=>host.close()};
 }catch(e){host.close();throw e;}
}

export function documentationExportTool(env,E){
 return{name:'documentation_export',title:'Export documentation',group:'export',description:'Export explicit document-owned CSV, vector plan/RCP/callout PDF, section/elevation, schedule/legend continuations, a persisted sheet or the existing automatic drawing set. Uses native writers. Path exports retain allowed-root/overwrite rules; live may download, headless requires path. No IFC mutation.',
  inputSchema:{type:'object',additionalProperties:false,properties:{...BINDING,source:{type:'string',minLength:1,maxLength:160},format:{type:'string',enum:['csv','pdf']},path:{type:'string',minLength:1,maxLength:4096},overwrite:{type:'boolean'},paper:{type:'string',enum:[...Object.keys(PAPERS),'a4']},units:{type:'string',enum:['mm','cm','m','in','ftdec','ftin']}},required:['documentId','expectedRevision','source','format']},
  run:async a=>{
   const ed=E(a),state=documentState(ed);assertDocumentation(docWriter(ed));
   const source=a.source==='drawing-set'?{id:'drawing-set',kind:'drawing-set',ref:'drawing-set',name:'Drawing set'}:documentationSource(ed,a.source);
   if(!env.exportDocumentation)docFail('EXPORT_UNAVAILABLE','This host has no authorized output writer.');
   if(a.path&&!a.path.toLowerCase().endsWith('.'+a.format))docFail('OUTPUT_EXTENSION','Output path must end in .'+a.format);
   const context=env.documentationContext?.(),owner=env.documentationOwner?env.documentationOwner():ed.api.file(ed.mid),verify=()=>{if(env.ed()!==ed||!ed.api.IsModelOpen(ed.mid)||(env.documentationOwner?env.documentationOwner():ed.api.file(ed.mid))!==owner)docFail('document_changed','Original document changed/closed before export.');if(env.busy?.())docFail('busy','Document is busy.');if(env.documentationContext&&env.documentationContext()!==context)docFail('source_changed','Active drawing changed before output.');bindDocument(ed,{documentId:state.documentId,expectedRevision:state.revision});};
   let bytes,mime,pages=0,ratio=null,missingGlyphs=null,diagnostics=[],render=null;
   try{
    if(a.format==='csv'){
     if(source.kind!=='schedule'||source.continuation)docFail('CSV_TABLE_REQUIRED','Choose a complete schedule/legend, not a continuation or other drawing.');
     const table=documentationTables(ed)[source.ref];if(!table)docFail('TABLE_MISSING','No such table.');bytes=new TextEncoder().encode(scheduleCsv(table));mime='text/csv';
    }else{
     render=await documentationInput(ed,{units:a.units||'mm'});verify();const {input}=render,opts={paper:a.paper||'a3',units:a.units||'mm',project:state.projectId||'',date:''};let sheets=[];
     if(['plan','rcp','callout'].includes(source.kind)){
      if(!['letter','a4','tabloid','a3'].includes(opts.paper))docFail('UNSUPPORTED_PLAN_PAPER','The native plan writer supports letter, a4, tabloid and a3.');
      const scene=render.sceneFor(source.id),result=planPdf(scene,{...opts,title:source.name,scale:scene.scale||null});bytes=result.bytes;ratio=result.scale.ratio;missingGlyphs=result.missing;pages=1;diagnostics=scene.walls.filter(w=>w.graphicWarning).map(w=>({source:source.id,wall:w.guid,code:'GRAPHIC_FALLBACK'}));
     }else{
      if(!PAPERS[opts.paper])docFail('UNSUPPORTED_PAPER','The native sheet writer does not support this paper.');
      if(source.kind==='drawing-set')sheets=buildSet(input,opts);
      else if(source.kind==='sheet'){
       const spec=readSheets(docWriter(render.ed)).find(s=>s.id===source.ref);if(a.paper&&a.paper!==spec.paper)docFail('PERSISTED_SHEET_PAPER','Edit the sheet paper before exporting it.');opts.paper=spec.paper;sheets=[composeSheet(spec,input,opts)];
      }else if(source.kind==='schedule'){
       const all=input.schedules,selected=source.continuation?all.filter(p=>p.ref===source.ref):['assemblies','materialLegend'].includes(source.ref)?all.filter(p=>p.ref.startsWith(source.ref==='assemblies'?'f06-assemblies:':'f06-materials:')):all.filter(p=>p.ref===source.ref);
       // The authoritative fixed-width F06 layout is on A3, as in native C exports.
       if(a.paper&&a.paper!=='a3')docFail('FIXED_TABLE_PAPER','Native schedule/legend pages use a3.');opts.paper='a3';
       sheets=selected.map(p=>composeSheet({number:'',title:p.title,views:[{kind:'schedule',ref:p.ref,x:210,y:162.5,ratio:0}]},{schedules:[p]},opts));
      }else sheets=[composeSheet({number:'',title:source.name,views:[{kind:source.kind,ref:source.ref,x:PAPERS[opts.paper][0]/2,y:PAPERS[opts.paper][1]/2+10,ratio:0}]},input,opts)];
      if(!sheets.length)docFail('EMPTY_DOCUMENT','No supported source pages.');
      for(const sheet of sheets)for(const index of sheet.missing||[])diagnostics.push({source:source.id,code:'MISSING_PLACEMENT_SOURCE',placement:index});
      for(const row of [...input.sections,...input.elevations])for(const warning of row.view.warnings||[])diagnostics.push({source:row.ref,code:warning.reason});
      // Authored scales and placements are not silently refitted. Refuse an
      // output whose visible vector geometry falls outside its actual paper.
      const [pw,ph]=PAPERS[opts.paper];
      for(const sheet of sheets){let clip=null;const stack=[];const inside=([x,y])=>x>=-.05&&y>=-.05&&x<=pw+.05&&y<=ph+.05;
       for(const item of sheet.items){
        if(item.t==='clip'){const [x0,y0,x1,y1]=item.rect;if(!inside([x0,y0])||!inside([x1,y1]))docFail('OUTPUT_OUTSIDE_PAGE','A crop exceeds the paper. Edit scale/placement or choose larger paper.');stack.push(clip);clip=item.rect;}
        else if(item.t==='unclip')clip=stack.pop();
        else if(!clip){const points=item.t==='line'?item.pts:item.t==='fill'?item.polys.flat():[];if(points.some(p=>!inside(p)))docFail('OUTPUT_OUTSIDE_PAGE','Authored scale/placement exceeds the paper. Edit the source scale/placement or choose larger paper.');}
       }
      }
      bytes=setPdf(sheets,{...opts,title:source.name});pages=sheets.length;
     }
     mime='application/pdf';
    }
    verify();const output=await env.exportDocumentation(a,{bytes,mime,extension:a.format,source});
    let interrupted=null;try{verify();}catch(e){interrupted=e;}
    return{...state,source:source.id,format:a.format,bytes:bytes.length,pages,scale:ratio,missingGlyphs,diagnostics,...output,changed:false,exported:true,completedOutputs:1,complete:!interrupted,readback:{phase:'captured-export-input',current:!interrupted},
     ...(interrupted?{isError:true,code:'POST_EXPORT_INTERRUPTED',error:interrupted.message,stopped:{code:interrupted.documentationCode||'document_changed'}}:{}),
     limitations:['Existing WinAnsi PDF text limitations remain.','Drawing-set is the native automatic set; persisted custom sheets are exported explicitly.','No general geometry repair, new takeoff or full application MCP parity.']};
   }finally{render?.close();}
  }};
}
