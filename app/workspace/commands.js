/* SPDX-License-Identifier: Apache-2.0 */
import { t as defaultT } from '../i18n.js';
/** A deliberately small adapter. Every caller gets the same live enablement and action. No DOM-button forwarding. */
export function createCommands({ state, actions, explain = () => {}, t = defaultT }) {
  const plan = v => ['plan','rcp','callout'].includes(v?.kind);
  const documentReason = s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : '';
  const annotationReason = s => documentReason(s) || (!plan(s.view) ? 'Open a floor plan, RCP or callout for existing annotations. Section/elevation notes retain their bounded automatic implementation.' : '');
  const settingsReason = s => documentReason(s) || (!plan(s.view) && !['section','elevation'].includes(s.view?.kind) ? 'This drawing has no detail or scale setting.' : s.view.kind === 'callout' ? 'Callout detail follows its parent. Use View settings for its existing scale/crop editor.' : s.settings?.issue || (s.settings?.template ? t('ws.why.template', { name: s.settings.template }) : ''));
  const wallReason = s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : s.view?.kind !== 'plan' ? 'Activate a floor plan before placing a wall.' : !s.levels.length ? 'This IFC has no supported storey.' : s.wall?.placementError || '';
  const typeReason = s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : s.wall?.placing ? s.wall.placementError || '' : !s.wall?.supported ? 'Select supported authored walls, or start Wall placement. Imported, missing and unsupported records cannot use this editor.' : !s.wall.sameType ? 'Select walls of one type to edit that type. Use the instance type selector to assign a common type.' : '';
  const definitions = {
    wall: { categories: ['floor-plan'], reason: wallReason },
    assembly: { categories: ['authored-wall-type'], reason: typeReason },
    structure: { categories: ['authored-wall-type'], reason: typeReason },
    cancel: { categories: ['placement'], reason: s => s.wall?.placing || (s.tool && s.tool !== 'select') ? '' : 'No placement is active.' },
    finish: { categories: ['placement'], reason: s => s.wall?.placing || (s.tool && s.tool !== 'select') ? '' : 'No placement is active.' },
    rcp: { categories: ['view'], reason: s => documentReason(s) || (!s.levels.length ? 'This IFC has no supported storey.' : '') },
    section: { categories: ['annotation'], reason: annotationReason },
    dimension: { categories: ['annotation'], reason: annotationReason },
    detailline: { categories: ['annotation'], reason: annotationReason },
    filledregion: { categories: ['annotation'], reason: annotationReason },
    callout: { categories: ['annotation'], reason: annotationReason },
    elevation: { categories: ['documentation'], reason: documentReason },
    assemblyschedule: { categories: ['documentation'], reason: documentReason },
    legend: { categories: ['documentation'], reason: documentReason },
    schedule: { categories: ['documentation'], reason: documentReason },
    sheet: { categories: ['documentation'], reason: documentReason },
    editsheet: { categories: ['documentation'], reason: s => documentReason(s) || (s.view?.kind !== 'sheet' ? 'Open a saved sheet from Project Browser first.' : '') },
    placeview: { categories: ['documentation'], reason: s => documentReason(s) || (s.view?.kind !== 'sheet' ? 'Open or create a sheet first. Edit sheet places its real view and continuation sources.' : '') },
    viewsettings: { categories: ['view'], reason: s => documentReason(s) || (!plan(s.view) && !['section','elevation','sheet'].includes(s.view?.kind) ? 'Open a plan, RCP, callout, section, elevation or sheet first.' : '') },
    visibility: { categories: ['view'], reason: s => annotationReason(s) || (s.view.kind === 'callout' ? 'Edit category visibility on the parent plan.' : '') },
    templates: { categories: ['view'], reason: documentReason },
    materials: { categories: ['project'], reason: documentReason },
    drawingset: { categories: ['documentation'], reason: documentReason },
    csv: { categories: ['documentation'], reason: s => documentReason(s) || (s.view?.kind !== 'schedule' ? 'Open a real schedule or material legend first.' : '') },
    pdf: { categories: ['documentation'], reason: s => documentReason(s) || (!s.view || s.view.kind === '3d' ? 'Open a supported plan or documentation drawing for vector PDF. Other exports remain in Established layout.' : '') },
    tools: { categories: ['application'], reason: () => '' },
    open: { categories: ['document'], reason: s => s.busy ? t('ws.why.busy') : '' },
    save: { categories: ['document'], reason: s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : !s.dirty ? t('ws.why.nochanges') : '' },
    undo: { categories: ['document'], reason: s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : !s.canUndo ? t('ws.why.noundo') : '' },
    redo: { categories: ['document'], reason: s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : !s.canRedo ? t('ws.why.noredo') : '' },
    select: { categories: ['element'], reason: s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : !s.view ? t('ws.why.nodrawing') : !plan(s.view) && s.view.kind !== '3d' ? 'Model picking is available in plan/RCP/callout and 3D. Use Edit sheet for documentation placements.' : '' },
    clear: { categories: ['element'], reason: s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : !s.selection.length ? t('ws.why.noselection') : '' },
    three: { categories: ['view'], reason: s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : '' },
    plan: { categories: ['view'], reason: s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : !s.levels.length ? 'This IFC has no supported storey plans.' : '' },
    range: { categories: ['floor-plan'], reason: s => documentReason(s) || (!['plan','rcp'].includes(s.view?.kind) ? 'Activate a floor plan or RCP first. 3D and documentation drawings have no independent View Range.' : '') },
    detail: { categories: ['view'], reason: settingsReason },
    scale: { categories: ['view'], reason: settingsReason },
    fit: { categories: ['view'], reason: s => !s.document ? t('ws.why.open') : s.busy ? t('ws.why.busy') : !s.view ? t('ws.why.nodrawing') : s.view.kind === 'schedule' ? 'Schedules use table scroll bars. Vector PDF includes every continuation page.' : '' },
  };
  function describe(id, target) {
    const d = definitions[id];
    if (!d || typeof actions[id] !== 'function') return { id, categories: [], enabled: false, reason: t('ws.why.notbuilt') };
    const s = state();
    // Properties may display an unopened browser source. Only that source's active editor/view may act.
    const reason = target && (target.document !== s.document || target.id !== s.view?.id)
      ? t('workspace.activateSource') : d.reason(s);
    return { id, categories: d.categories, enabled: !reason, reason };
  }
  function execute(id, value, target) {
    const d = describe(id, target);
    if (!d.enabled) { explain(d.reason); return false; }
    return actions[id](value);
  }
  return { describe, execute, ids: Object.keys(definitions) };
}

export function isTextEntry(target) {
  return !!target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"]), dialog, [data-help-panel], [data-app-settings]');
}
export function shortcutCommand(event, state = {}) {
  if (event.defaultPrevented || event.altKey || isTextEntry(event.target)) return null;
  const key = event.key.toLowerCase(), mod = event.ctrlKey || event.metaKey;
  if (mod) {
    if (key === 'o' && !event.shiftKey) return 'open';
    if (key === 's' && !event.shiftKey) return 'save';
    if (key === 'z') return event.shiftKey ? 'redo' : 'undo';
    if (key === 'y') return 'redo';
  } else if (key === 'escape') return state.live && (state.wall?.placing || (state.tool && state.tool !== 'select')) ? 'cancel' : 'clear';
  else if (state.live && key === 'enter' && (state.wall?.placing || (state.tool && state.tool !== 'select'))) return 'finish';
  else if (state.live && key === 'w' && !event.shiftKey) return 'wall';
  else if (state.live && key === 'v' && !event.shiftKey) return 'select';
  else if (key === 'f' && !event.shiftKey) return 'fit';
  return null;
}

/** Tabs belong to one editor session. Closing a drawing never closes its document. */
export function createDrawingTabs() {
  let document = null, active = null;
  const tabs = new Map();
  return {
    reset(owner) { if (owner === document) return false; document = owner; tabs.clear(); active = null; return true; },
    open(view) { tabs.set(view.id, { ...tabs.get(view.id), ...view }); active = view.id; },
    close(id) { tabs.delete(id); if (active === id) active = [...tabs.keys()].at(-1) || null; return tabs.get(active) || null; },
    get active() { return tabs.get(active) || null; },
    get all() { return [...tabs.values()]; },
  };
}
