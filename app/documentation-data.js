/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: semantic results contain stable source IDs, codes and raw mm. */
import { ModelWriter } from './model-write.js';
import { ids, val } from './ifc-util.js';
import { readRecordPset } from './record-contract.js';
import { readLevels } from './model-levels.js';
import { readWalls } from './model-walls.js';
import { readPlanViews, readTemplates, readSheets, readCallouts, calloutRoot, effectiveView } from './views-model.js';
import { readProjectedView } from './projected-views.js';
import { readSectionLines, PAPERS } from './res-sheets.js';
import { readDrafting, PATTERN_KEYS } from './drafting.js';
import { readWallDimensions, resolveDimension } from './wall-dimensions.js';
import { snapshotModel, loopsOf } from './model-ops.js';
import { schedules } from './model-schedule.js';
import { assemblySchedules } from './assembly-schedule.js';
import { documentPages } from './assembly-schedule-layout.js';
import { readDevices, deviceSchedule, circuitSchedule } from './res-elec.js';
import { lumberList } from './res-framing.js';
import { fmtLen, fmtArea } from './model-units.js';
import { t } from './i18n.js';

export const docWriter = ed => new ModelWriter(ed.W, ed.api, ed.mid);
export const docFail = (code, message) => { throw Object.assign(new Error(code + ': ' + message), { documentationCode: code }); };
export const plain = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value, (_, v) => v instanceof Set || v instanceof Map ? [...v] : v));
const finite = v => typeof v === 'number' && Number.isFinite(v);
const vector = (v, n) => Array.isArray(v) && v.length === n && v.every(finite);
export function uniqueProduct(w, guid) {
  const found = ids(w.api, w.mid, 'IFCPRODUCT', true).filter(id => val(w.api.GetLine(w.mid, id, false)?.GlobalId) === guid);
  if (found.length !== 1) docFail('AMBIGUOUS_OR_MISSING_ID', 'Expected exactly one product GlobalId: ' + guid);
  return found[0];
}

// The old UI readers deliberately tolerate legacy files. The agent exposes/refuses corrupt
// records explicitly, rather than interpreting their default/coerced UI values as persisted data.
export function documentationIssues(w) {
  const issues = [], check = (id, set, validate) => {
    try { const ps = readRecordPset(w, id, set, 'documentation'); if (ps) validate(ps); }
    catch (e) { issues.push({ code: e.documentationCode || (e.recordIssue === 'unsupported' ? 'DOC_RECORD_UNSUPPORTED' : 'DOC_RECORD_CORRUPT'), record: set, owner: w.guidOf(id) || null }); }
  };
  const bad = message => docFail('DOC_RECORD_CORRUPT', message);
  const version = v => { if (Object.hasOwn(v, 'version') && v.version !== 1) docFail('DOC_RECORD_UNSUPPORTED', 'Unsupported documentation version.'); };
  for (const l of readLevels(w)) for (const set of ['CadCraft_PlanView', 'CadCraft_CeilingPlan']) check(l.id, set, ps => {
    for (const key of ['Cut','Top','Bottom','Depth','Scale','CropX0','CropY0','CropX1','CropY1']) if (key in ps && !finite(ps[key])) bad(key);
    if ('Detail' in ps && !['coarse','medium','fine'].includes(ps.Detail)) bad('Detail');
    if ('Scale' in ps && (ps.Scale < 0 || ps.Scale > 10000)) bad('Scale');
    const top=ps.Top>0?ps.Top:l.height,cut=ps.Cut??(set==='CadCraft_CeilingPlan'?2300:1200),bottom=ps.Bottom??0;
    if(bottom>cut||cut>top||(ps.Depth??0)<0)bad('View Range');
    if ('Version' in ps && ps.Version !== 1) docFail('DOC_RECORD_UNSUPPORTED', 'Unsupported plan record version.');
    for (const key of ['HiddenClasses','HiddenElements','Template','Underlay']) if (key in ps && typeof ps[key] !== 'string') bad(key);
  });
  const project = ids(w.api, w.mid, 'IFCPROJECT')[0];
  for (const set of ['CadCraft_CalloutViews','CadCraft_Sheets','CadCraft_ViewTemplates','CadCraft_ProjectedViews']) check(project, set, ps => {
    for (const [key, raw] of Object.entries(ps)) {
      if (raw === '') continue; // Existing domain deletion tombstone.
      let v; try { v = JSON.parse(raw); } catch { bad(key); }
      if (!v || typeof v !== 'object' || Array.isArray(v)) bad(key); version(v);
      if (set === 'CadCraft_Sheets') {
        if (!/^sheet-\d+$/.test(key) || typeof v.number !== 'string' || typeof v.title !== 'string' || !PAPERS[v.paper] || !Array.isArray(v.views)) bad(key);
        for (const p of v.views) if (!['plan','rcp','callout','section','elevation','schedule'].includes(p.kind) || typeof p.ref !== 'string' || ![p.x,p.y,p.ratio].every(finite) || p.ratio < 0) bad(key);
      } else if (set === 'CadCraft_CalloutViews') {
        if (!/^callout-\d+$/.test(key) || typeof v.name !== 'string' || !/^(plan|rcp|callout):.+$/.test(v.parent) || !vector(v.crop,4) || !finite(v.scale)) bad(key);
      } else {
        if (!['coarse','medium','fine'].includes(v.detail || 'coarse') || ('scale' in v && !finite(v.scale))) bad(key);
        if (set === 'CadCraft_ProjectedViews') { const r = readProjectedView(w,key); if (r.issue) bad(key); }
        else for (const k of ['cut','top','bottom','depth']) if (k in v && !finite(v[k])) bad(key);
      }
    }
  });
  const drafting=readDrafting(w);
  for (const id of ids(w.api, w.mid, 'IFCANNOTATION')) {
    check(id,'CadCraft_Drafting',ps=>{
      if('Version'in ps&&ps.Version!==1)docFail('DOC_RECORD_UNSUPPORTED','Unsupported drafting version.');
      if (!['lines','hatch'].includes(ps.Kind) || typeof ps.View !== 'string' || !finite(ps.PatternScale) || ps.PatternScale <= 0 || (ps.Kind === 'hatch' && !PATTERN_KEYS.includes(ps.Pattern))) bad('Drafting');
      if (!drafting.some(d=>d.id===id)) bad('Drafting geometry');
    });
    check(id,'CadCraft_SectionLine',ps=>{
      if('Version'in ps&&ps.Version!==1)docFail('DOC_RECORD_UNSUPPORTED','Unsupported section version.');
      if (typeof ps.Level !== 'string' || typeof ps.Name !== 'string' || !['left','right'].includes(ps.Look) || !['AX','AY','BX','BY','Depth'].every(k=>finite(ps[k])) || ps.Depth < 0 || Math.hypot(ps.BX-ps.AX,ps.BY-ps.AY)*w.unitMm < 100) bad('Section');
    });
  }
  return issues;
}
export function assertDocumentation(w) {
  const issue = documentationIssues(w)[0];
  if (issue) docFail(issue.code, issue.record + ' is not editable. Inspect/recover the record.');
}

export function documentationTables(ed) {
  const w=docWriter(ed), snap=snapshotModel(ed), loops=new Map();
  for (const l of snap.levels) if (snap.derived.spaces.some(s=>s.storey===l.id)) loops.set(l.id,loopsOf(ed,l.id));
  const format={fmtLen:n=>fmtLen(n,'mm'),fmtArea:n=>fmtArea(n,'mm'),t};
  const all={...schedules(snap,loops,format),...assemblySchedules(w)};
  const devices=readDevices(w);
  if(devices.length)Object.assign(all,{devices:deviceSchedule(devices,snap.levels,format),circuits:circuitSchedule(devices,{units:'mm',t})});
  const list=lumberList(w,{metric:true});
  all.lumber={head:[t('res.fr.sch.size'),t('res.fr.sch.length'),t('res.fr.sch.count'),t('res.fr.sch.bf')],rows:list.rows.map(r=>[r.label,fmtLen(r.stock,'mm'),String(r.count),r.bf.toFixed(1)]),total:list.rows.length?[t('model.sch.total'),'',String(list.pieces),list.bf.toFixed(1)]:null,raw:list};
  return all;
}
export function tablePages(tables) {
  return Object.entries(tables).flatMap(([key,table])=>['assemblies','materialLegend'].includes(key)?documentPages(table,key==='assemblies'?'assemblies':'materials'):[{...table,ref:key,title:table.title||key}]);
}
export function documentationSources(ed) {
  const w=docWriter(ed), levels=readLevels(w), callouts=readCallouts(w), tables=documentationTables(ed), sources=[];
  for(const l of levels)for(const kind of ['plan','rcp'])sources.push({id:kind+':'+l.guid,kind,ref:l.guid,name:l.name,level:l.guid});
  for(const c of callouts){const root=calloutRoot(callouts,c.id,new Set(levels.map(l=>l.guid)));sources.push({id:'callout:'+c.id,kind:'callout',ref:c.id,name:c.name,level:root?.level||null,rootKind:root?.kind||null,missing:!root});}
  for(const s of readSectionLines(w))sources.push({id:'section:'+s.guid,kind:'section',ref:s.guid,name:s.name,level:s.level});
  for(const side of ['north','east','south','west'])sources.push({id:'elevation:'+side,kind:'elevation',ref:side,name:side});
  for(const [key,table] of Object.entries(tables))sources.push({id:'schedule:'+key,kind:'schedule',ref:key,name:table.title||key,derived:true,configuration:'existing fixed domain columns; nominal mm'});
  for(const page of tablePages(tables))if(!sources.some(s=>s.id==='schedule:'+page.ref))sources.push({id:'schedule:'+page.ref,kind:'schedule',ref:page.ref,name:page.title,continuation:true,derived:true});
  for(const s of readSheets(w))sources.push({id:'sheet:'+s.id,kind:'sheet',ref:s.id,name:[s.number,s.title].filter(Boolean).join(' '),paper:s.paper});
  return sources;
}
export function documentationSource(ed,key,{allowMissing=false}={}) {
  const all=documentationSources(ed).filter(s=>s.id===key);
  if(all.length!==1 || (!allowMissing&&all[0].missing))docFail('SOURCE_MISSING_OR_AMBIGUOUS','Inspect the explicit source ID: '+key);
  const s=all[0],w=docWriter(ed);if(s.level)uniqueProduct(w,s.level);if(s.kind==='section')uniqueProduct(w,s.ref);return s;
}
export function documentationSettings(ed,key) {
  const w=docWriter(ed),s=documentationSource(ed,key),issues=documentationIssues(w);
  if(issues.length)docFail(issues[0].code,'Documentation settings contain an unsupported/corrupt record.');
  if(['plan','rcp','callout'].includes(s.kind)){
    const kind=s.rootKind||s.kind,l=readLevels(w).find(l=>l.guid===s.level),raw=readPlanViews(w,kind).get(l.id)||null;
    const effective=plain(effectiveView(raw,readTemplates(w),l.height,kind));
    if(s.kind==='callout'){const c=readCallouts(w).find(c=>c.id===s.ref);return{source:s,raw:c,effective:{...effective,crop:c.crop,scale:c.scale},inheritedFrom:c.parent};}
    return{source:s,raw,effective};
  }
  if(['section','elevation'].includes(s.kind)){const raw=readRecordPset(w,ids(w.api,w.mid,'IFCPROJECT')[0],'CadCraft_ProjectedViews','projected')?.[key];return{source:s,raw:raw?JSON.parse(raw):null,effective:readProjectedView(w,key)};}
  docFail('UNSUPPORTED_SOURCE','This source has no view-range settings.');
}
export function documentationAnnotations(ed,source=null) {
  const w=docWriter(ed),walls=readWalls(w),levels=readLevels(w),s=source?documentationSource(ed,source,{allowMissing:true}):null;
  const dimensions=readWallDimensions(w).filter(d=>!s||d.view===source).map(d=>({...d,resolution:resolveDimension(d,walls)}));
  const drafting=readDrafting(w).filter(d=>!s||d.view===source);
  const sections=readSectionLines(w).filter(d=>!s||levels.find(l=>l.id===d.storey)?.guid===s.level);
  return{drafting,sections,dimensions,diagnostics:documentationIssues(w)};
}
