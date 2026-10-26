/* SPDX-License-Identifier: Apache-2.0 */
/**
 * workspace-bimcraft.js — BimCraft's adapter for the shell's workspace layout engine (assets/js/app-workspace.js; 0.7 WS.6; maps
 * docs/apps/app-workspace.md and docs/apps/bimcraft-workspace.md). The engine builds the blocks a layout file names; this file fills
 * them with BimCraft's own things and keeps everything only BimCraft has:
 *
 *   ribbon      Doc's ribbon (workspace/catalog.js), each tool run by Doc's commands (workspace/commands.js) or BimCraft's own
 *               buttons (workspace/engine.js); a selected wall adds the Modify | Walls context tab
 *   toolbox     every Draw tool the build has ([data-mtool]), in groups; each clicks the app's own button (Draw on, a plan first)
 *   slots       level (level + plan kind), document (the Draw bar's right side), layout (plan / split / 3D), units, and for the view
 *               bar scale, detail, view range, fit
 *   palettes    properties (view properties, the element's Properties, a new wall's defaults), browser (the Project Browser),
 *               panel (the host panel's own content: the Model palette on the left, the right panel's tabs on the right); the
 *               toolbox layout puts the browser on the right as its navigator (WS.19): a click there opens the view, as in classic
 *   fields      the picked element's main fields for the toolbox layout's info box (WS.20): the first labelled controls of its Properties
 *   views       each level's floor plan and {3D}; 'open' tabs keep a camera per plan (Doc's), 'all' tabs pick the Draw bar's level
 *   walls       Doc's wall placement and type editing (workspace/walls.js), only where the layout has a ribbon
 *
 *   createBimcraftWorkspace(host) → { adapter, api }   host = { root, modelUi, views, commands, props, current, status, statusEl }
 *   api: what bimcraft.js and Doc's commands call (refresh, opened, picked, propertiesChanged, stageChanged, state, activatePlan,
 *        activate3d, openRange, setSettings, fit, selectTool, startWall, editType, editStructure, cancelWall, active, inspect)
 */
import { catalog } from './workspace/catalog.js';
import { availability } from './workspace/availability.js';
import { ENGINE, engineRun } from './workspace/engine.js';
import { node, icon, button } from './workspace/dom.js';
import { fmtLen } from './model-units.js';
import { scalesFor } from './res-sheets.js';
import { mountWallWorkflow, INSTANCE_WALL_FIELDS } from './workspace/walls.js';
import { mountDocumentation, browserSource, isPlanView, isDocumentView, extraTools } from './workspace/documentation.js';
import { fieldsIn } from 'cc-workspace';

const GROUPS = [
  ['design', ['select', 'wall', 'door', 'window', 'column', 'floor', 'ceiling', 'roof', 'roofplane', 'stair', 'railing', 'ramp', 'family', 'countertop', 'dormer', 'foundation', 'framing']],
  ['systems', ['pipe', 'duct', 'valve', 'equip', 'electrical', 'weld']],
  ['site', ['terrain', 'pad', 'paving', 'site']],
  ['document', ['section', 'callout', 'grid', 'dline', 'dpoly', 'drect', 'dhatch']],
  ['modify', ['trim', 'corner']],
];

export function createBimcraftWorkspace({ root, modelUi, views, commands, props, current, status, statusEl, existing = () => {} }) {
  const stage = root.querySelector('.bc-stage');
  let engine = null, ctx = null, frame = 0, browserForClassic = null;
  const soon = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; engine?.refresh(); }); };
  const A = modelUi.extend({ refresh: soon, settled: soon, toolChanged: soon });
  const T = (k, v) => A.t(k, v);
  // Retain the accepted direct fallback through the shared layout controller.
  // Removing a one-page query override is necessary for an explicit in-page choice.
  function chooseLayout(layout) {
    const url = new URL(location.href); url.searchParams.delete('workspace');
    history.replaceState(history.state, '', url);
    window.ccShellWorkspace?.set(layout);
  }
  const launch = button(T('ws.layout.try'), { className: 'btn-line btn-sm-cc', 'data-ws-launch': '' });
  launch.addEventListener('click', () => chooseLayout('docked'));
  (document.querySelector('.app-bar') || root).append(launch);
  const fallback = button(T('ws.layout.established'), { 'data-ws-fallback': '' });
  fallback.addEventListener('click', () => chooseLayout('standard'));
  const docked = () => !!engine?.has('ribbon');   // Doc's command layer (ribbon, walls, keys) is on
  const mode = () => ctx?.block('viewtabs')?.mode || null;

  // ---- the document and the views ----
  let documentToken = null, browserView = null, propertyMode = 'view', lastView = null, viewPropsSig = '', viewPropsTarget = null, lastSettings = null;
  const cameras = new Map();
  const planView = (l) => ({ id: 'plan:' + l.guid, kind: 'plan', levelId: l.id, guid: l.guid, name: l.name, icon: 'bi-square' });
  const threeView = () => ({ id: '3d:default', kind: '3d', name: mode() === 'all' ? T('tbx.tab.3d') : T('ws.view3d'), icon: 'bi-box' });
  const levels = () => (current().editor && (current().editor === documentToken || !docked()) ? A.S.data?.levels || [] : []);
  let sourceOwner = null, sourceCache = [];
  function listViews() {
    const c = current(), editor = c.editor;
    if (!editor) { sourceOwner = null; sourceCache = []; return []; }
    if (editor !== sourceOwner) { sourceOwner = editor; sourceCache = [threeView()]; }
    // A replay closes/reopens the same editor's model. Keep that owner's descriptors while it is busy;
    // an empty transient list would make the shared host discard all open drawing tabs.
    if (c.busy || A.S.busy || A.S.reloading || editor.mid == null || !A.S.data) return sourceCache;
    sourceCache = [...views.workspaceSources().map(v => ({ ...v, icon: isPlanView(v) ? 'bi-square' : 'bi-file-earmark' })), threeView()];
    return sourceCache;
  }
  const docs = mountDocumentation({ root, A, views, stage, current, status });
  const viewOf = (id) => listViews().find((v) => v.id === id) || null;
  const drawOn = () => root.querySelector('[data-model-toggle]')?.getAttribute('aria-pressed') === 'true';
  function needDraw() { if (current().editor && !drawOn()) root.querySelector('[data-model-toggle]')?.click(); }
  function rememberCamera() {
    const v = viewOf(lastView), pv = A.pv();
    if (isPlanView(v) && pv) cameras.set(v.id, { cx: pv.cx, cy: pv.cy, scale: pv.scale, fitted: pv.fitted });
  }
  function go(id, how) {
    const v = viewOf(id); if (!v || !current().editor || snapshot().busy) return;
    if (how === 'open' || !['plan', '3d'].includes(v.kind)) {   // Doc's: a tab per opened view, each plan keeps its camera
      rememberCamera(); lastView = id; browserView = v; propertyMode = 'view';
      A.setTool('select');
      if (isDocumentView(v)) A.host.select([]);
      A.activateWorkspaceView(isPlanView(v) ? v.levelId : null, cameras.get(v.id), v.rootKind || v.kind, v.kind === 'callout' ? v.ref : null);
      docs.render(v);
      views.render();
    } else {   // a tab for every view: the Draw bar's own level and plan / 3D buttons
      if (v.kind === '3d') { needDraw(); root.querySelector('[data-model-layout="3d"]')?.click(); }
      else {
        needDraw();
        const sel = root.querySelector('[data-model-level]');
        if (sel && sel.value !== String(v.levelId)) { sel.value = String(v.levelId); sel.dispatchEvent(new Event('change', { bubbles: true })); }
        if (A.S.layout === '3d') root.querySelector('[data-model-layout="plan"]')?.click();
      }
    }
    soon();
  }
  function currentAll() {
    if (!current().editor) return null;
    if (lastView && isDocumentView(viewOf(lastView))) return lastView;
    if (!drawOn() || A.S.layout === '3d') return '3d:default';
    const l = (A.S.data?.levels || []).find((x) => x.id === A.S.level);
    return l ? 'plan:' + l.guid : '3d:default';
  }
  function snapshot() {
    const c = current(), view = engine?.view() || null;
    if (!c.busy && !A.S.busy && !A.S.reloading && c.editor?.mid != null) lastSettings = isPlanView(view) ? views.workspaceSettings(view.levelId, view.rootKind || view.kind, view.kind === 'callout' ? view.ref : null) : docs.settings(view);
    return { ...c, document: c.editor, busy: c.busy || !!A.S.busy || !!A.S.reloading || !!(c.editor && c.editor.mid == null), levels: levels(), view,
      settings: lastSettings, live: docked(), tool: A.S.tool, wall: walls.metadata() };
  }

  // ---- palettes (the ribbon layout's Properties and Project Browser) ----
  const elementProps = node('div', { className: 'ws-element-props' });
  const placementProps = node('div', { className: 'ws-placement-props', 'data-ws-placement-props': '', hidden: true });
  const viewProps = node('div', { className: 'ws-view-props' });
  const propHeading = node('span', {}, T('ws.props'));
  const unitsSlot = node('div', { className: 'ws-props-units', 'data-ws-units-slot': '' });
  const propsBody = node('div', { className: 'ws-props-body' }, viewProps, elementProps, placementProps);
  const optionsExtra = node('div', { className: 'ws-bc-options' });
  const propsHome = document.createComment('workspace: Properties home');   // i18n-ignore: a comment node
  props.before(propsHome);
  const walls = mountWallWorkflow({ root, A, commands, defaults: placementProps, unitsHost: unitsSlot, options: optionsExtra, status });
  const browserEl = () => root.querySelector('[data-pb-sec]');

  // ---- the view bar's controls ----
  function settingsSelect(key) {
    const select = node('select', { 'data-ws-setting': key, 'aria-label': key === 'detail' ? T('ws.detail.level') : T('ws.scale.view') });
    const choices = key === 'detail' ? [['coarse', T('ws.detail.coarse')], ['medium', T('ws.detail.medium')], ['fine', T('ws.detail.fine')]] : [[0, A.t('model.pv.scale.fit')], ...scalesFor(A.units()).map((x) => [x.ratio, x.label])];
    for (const [value, text] of choices) select.append(node('option', { value }, text));
    if (key === 'scale') select.dataset.wsScaleUnits = A.units();
    return select;
  }
  function syncSelect(select, value) {
    if (document.activeElement === select) return;
    if (select.dataset.wsSetting === 'scale' && select.dataset.wsScaleUnits !== A.units()) { const fresh = settingsSelect('scale'); select.replaceChildren(...fresh.options); select.dataset.wsScaleUnits = A.units(); }
    if (![...select.options].some((o) => o.value === String(value))) select.append(node('option', { value }, '1 : ' + value));
    select.value = String(value);
  }
  const detailSelect = settingsSelect('detail'), scaleSelect = settingsSelect('scale');
  // any layout's scale and detail controls (the ribbon layout's view bar, the toolbox layout's quick bar) change the open plan through Doc's commands
  root.addEventListener('change', (e) => {
    if (!engine?.layout) return;
    if (e.target.matches('[data-msched-kind]')) { const v = listViews().find(v => v.kind === 'schedule' && v.ref === e.target.value); if (v) ctx.open(v.id); return; }
    const key = e.target.dataset?.wsSetting; if (key) commands.execute(key, key === 'scale' ? Number(e.target.value) : e.target.value, viewProps.contains(e.target) ? viewPropsTarget || { document: null, id: null } : undefined);
  });
  const scaleLabel = node('label', {}, T('ws.scale') + ' ', scaleSelect), detailLabel = node('label', {}, T('ws.detail') + ' ', detailSelect);

  // ---- the toolbox ----
  const src = (key) => root.querySelector('[data-modelbar] [data-mtool="' + key + '"], [data-mtool="' + key + '"]');
  const labelOf = (b) => (b?.querySelector('span:not(.visually-hidden)')?.textContent || b?.title || '').trim();
  const known = new Set(GROUPS.flatMap(([, keys]) => keys));

  // ---- Doc's ribbon on BimCraft's tools ----
  const works = (id) => commands.ids.includes(id) || !!ENGINE[id];
  const ribbon = () => catalog.ribbon.map((r) => ({ tab: r.tab, label: T('ws.tab.' + r.tab), context: !!r.context,
    groups: r.groups.map((g) => ({ id: g.group, label: T('ws.grp.' + g.group), large: g.large, stacks: g.stacks })).concat(r.tab === 'view' ? [{ id: 'documentation', label: T('workspace.documentation'), large: ['viewsettings', 'editsheet'], stacks: [['drawingset', 'csv', 'pdf', 'tools']] }] : []) }));
  const isWall = () => snapshot().selection.length === 1 && !!props.querySelector('[data-mp-height]');

  const adapter = {
    app: 'bimcraft', root, stage, panels: { left: root.querySelector('.bc-left'), right: root.querySelector('.bc-right') }, status: statusEl,
    t: T, say: status, actions: ['open', 'save', 'undo', 'redo', 'select', 'clear', 'fit'],
    fileTools: ['pdf', 'csv', 'drawingset', 'tools'],
    hide: ['[data-modelbar]', '[data-model-splitter]'],
    fill: ':is(.bc-canvas, .bc-plan, .bc-dwg, .ws-documentation)', flow: ':is(.bc-card, .bc-empty)',   // i18n-ignore: selectors
    state() {
      const c = current(), s = snapshot();
      const other = c.mode === 'dwg' || !!root.querySelector('.bc-stage > [data-rvt]:not([hidden]), .bc-stage > [data-folder]:not([hidden])');
      const tool = A.S.tool || 'select';
      return { document: c.editor, name: other ? c.name || '' : c.name || T('ws.noifc'), dirty: s.dirty, busy: s.busy, selection: s.selection || [], other,
        tool, toolLabel: tool !== 'select' ? labelOf(src(tool)) || T('tbx.ig.tool') : '' };
    },
    endTool() { if (A.S.tool && A.S.tool !== 'select') A.setTool('select'); },
    ribbon, contextTab: () => (docked() && isWall() ? 'modify-walls' : null),
    toolbox: () => {
      const extra = [...new Set([...root.querySelectorAll('[data-modelbar] [data-mtool]')].map((b) => b.dataset.mtool))].filter((k) => !known.has(k));
      return [...GROUPS, ['more', extra]].map(([g, tools]) => ({ id: g, label: T('tbx.grp.' + g), tools }));
    },
    tool(id, block) {
      if (block === 'toolbox') { const s = src(id); return { label: labelOf(s) || id, icon: s?.querySelector('i.bi')?.className.replace(/^bi\s+/, '') || 'bi-square', built: !!s }; }
      const t = catalog.tools[id] || { icon: extraTools[id]?.[1] || (id === 'fit' ? 'eye' : 'pointer') };
      return { label: T('ws.tool.' + id), icon: icon(t.icon), built: works(id) || ['fit', 'clear'].includes(id) };
    },
    can(id, block) {
      if (block === 'toolbox') {
        const s = src(id), ifc = !!current().editor;
        if (!ifc) return { enabled: false, reason: T('tbx.why.ifc') };
        const off = !s || s.disabled || s.getAttribute('aria-disabled') === 'true';
        return { enabled: !off, reason: off ? s?.title || T('ws.why.off') : '' };
      }
      return availability(id, commands, snapshot(), { root, t: T }, block === 'properties' ? viewPropsTarget || { document: null, id: null } : undefined);
    },
    async run(id, block) {
      if (block === 'toolbox') {
        needDraw();
        if (A.S.layout === '3d') root.querySelector('[data-model-layout="plan"]')?.click();
        const s = src(id); if (!s) return;
        s.closest('details:not([open])')?.setAttribute('open', '');
        s.click();
        s.closest('details.bc-mb-more')?.removeAttribute('open');
        return;
      }
      if (commands.ids.includes(id)) return commands.execute(id, undefined, block === 'properties' ? viewPropsTarget || { document: null, id: null } : undefined);
      if (ENGINE[id]) return engineRun(root, ENGINE[id], { activatePlan: () => api.activatePlan(), showModel: () => ctx?.palette('panel'), state: snapshot });
    },
    pressed: (id, block) => block === 'toolbox' && src(id)?.getAttribute('aria-pressed') === 'true' && drawOn(),
    options(s) {
      if (s.other) return { title: T('ws.modify'), text: T('ws.opt.other') };
      const w = walls.metadata(), wallCtx = isWall(), toolOn = A.S.tool && A.S.tool !== 'select' && A.S.tool !== 'wall';
      return { title: w.placing ? T('ws.modify.wall.place') : toolOn ? T('ws.modify.tool') : wallCtx ? T('ws.modify.walls') : T('ws.modify'),
        text: s.busy ? T('ws.opt.busy') : w.placing ? T('ws.opt.wall.place') : toolOn ? '' : wallCtx ? T('ws.opt.wall') : s.document ? T('ws.opt.select') : T('ws.opt.open'),
        cls: [wallCtx ? 'ws-wall-options' : '', w.placing ? 'ws-placing' : ''].filter(Boolean).join(' ') };
    },
    optionsExtra: () => optionsExtra,
    toolOptions(block) {
      const tool = A.S.tool;
      if (!tool || tool === 'select') return null;
      // the options bar is above <main> (outside root) once the row is there: look in the whole page
      if (block === 'options') return tool === 'wall' ? null : document.querySelector('[data-modelbar] [data-mopts="' + tool + '"], [data-ws-tool-options] [data-mopts="' + tool + '"]');
      return document.querySelector('[data-mopts="' + tool + '"]');
    },
    showProperties: () => { if (ctx?.block('palettes')?.lower?.includes('properties')) ctx.palette('properties'); else root.querySelector('[data-rtab="props"]')?.click(); },
    fields: () => fieldsIn(props.querySelector('[data-model-props]') || props),
    slots: {
      level: { label: T('tbx.ig.level'), nodes: () => [root.querySelector('[data-model-level]')?.closest('label'), root.querySelector('[data-model-viewkind]')?.closest('label')].filter(Boolean) },
      document: { label: T('tbx.ig.document'), nodes: () => [root.querySelector('[data-modelbar] .bc-mb-right')].filter(Boolean) },
      layout: { label: '', nodes: () => [root.querySelector('[data-model-layout-group]')].filter(Boolean) },
      units: { label: '', nodes: () => [root.querySelector('.bc-global-units')].filter(Boolean) },
      scale: { label: T('ws.scale'), nodes: () => [scaleLabel] },
      detail: { label: T('ws.detail'), nodes: () => [detailLabel] },
      range: { label: T('ws.tool.range'), nodes: (c) => [c.tool('range', 'viewbar', true), c.tool('viewsettings', 'viewbar', true), c.tool('pdf', 'viewbar', true)] },
      fit: { label: T('ws.tool.fit'), nodes: (c) => [c.tool('fit', 'viewbar', true)] },
    },
    palettes: {
      properties: { label: T('ws.props'), title: propHeading, actions: [button(T('ws.props.view'), { 'data-ws-view-props': '' }), fallback], body: () => propsBody, foot: unitsSlot },
      browser: { label: T('ws.browser'), hint: T('ws.browser.hint'), body: () => browserEl() },
      panel: { label: T('ws.model') },   // in the right panel (the toolbox layout) the shell names it "More panels"
    },
    views: {
      list: listViews, token: () => documentToken, initial: () => '3d:default',
      current: () => (mode() === 'open' ? lastView : currentAll()),
      go: (id, how) => go(id, how),
      empty: (c) => c.tool('three', 'viewbar'),
    },
    toolbar: () => stage.querySelector(':scope > [data-toolbar]') || root.querySelector('[data-toolbar]'),
    escape() {   // Doc's keys turn Esc into "clear the selection": with his ribbon on, Esc first ends a running Draw tool, as in classic
      if (!docked() || !A.S.tool || A.S.tool === 'select' || A.S.tool === 'wall') return false;
      A.workspaceCancel(false); return true;
    },
    entered(c) {
      ctx = c;
      launch.hidden = true;
      if (c.has('palettes')) {
        elementProps.append(props);
        if (c.has('ribbon')) walls.setActive(true);   // Doc's wall placement belongs to his ribbon; the toolbox layout keeps the app's own Wall tool
        // the right panel's Properties tab is the Properties palette now: show another of its tabs
        if (root.querySelector('.bc-right [data-rtab="props"]')?.getAttribute('aria-selected') === 'true') root.querySelector('.bc-right [data-rtab]:not([data-rtab="props"]):not([hidden])')?.click();
        if (documentToken !== current().editor) opened(); else soon();
      }
      if (c.has('toolbox') && current().editor) needDraw();
    },
    leaving(c) {
      if (c.has('palettes')) {
        browserForClassic = browserEl();
        walls.setActive(false); rememberCamera(); docs.restoreHome(); propsHome.after(props); restoreBrowser();
      }
    },
    left(c) {
      // A browser created after entry may have its shared-engine home inside the temporary panel slot.
      // Reattach that same authoritative node after the shared engine removes its chrome.
      const links = root.querySelector('[data-links-sec]');
      if (browserForClassic && !browserForClassic.isConnected && links) links.before(browserForClassic);
      browserForClassic = null;
      if (c.was && root.querySelector('.bc-right [data-rtab="props"]')) root.querySelector('.bc-right [data-rtab="props"]').click(); ctx = null; launch.hidden = false; },
    resized() { current().viewer?.resize(); A.pv()?.resize(); },
    refresh(c) {
      root.classList.toggle('tbx-noifc', c.has('toolbox') && !current().editor);
      if (!c.has('palettes')) return;
      const s = snapshot();
      if (documentToken !== current().editor && !adapter.state().other) { opened(); return; }
      // A native kind/level control may change the source without going through the tab strip.
      const actual = isPlanView(s.view) && A.S.on && listViews().find(v => v.id === views.viewKey());
      if (actual && actual.id !== s.view.id && !s.busy) { ctx.open(actual.id); return; }
      docs.render(s.view);
      decorateBrowser();
      elementProps.hidden = s.wall.placing || propertyMode !== 'element' || !s.selection.length;
      viewProps.hidden = s.wall.placing || !elementProps.hidden;
      if (adapter.state().other) { elementProps.hidden = false; viewProps.hidden = true; }
      propHeading.textContent = adapter.state().other ? T('ws.props') : s.wall.placing ? T('ws.props.newwall') : viewProps.hidden ? T('ws.props.element') : T('ws.props.viewh');
      if (!viewProps.hidden) renderViewProperties();
      syncSelect(detailSelect, s.settings?.detail || 'coarse'); syncSelect(scaleSelect, s.settings?.scale || 0);
      for (const sel of [detailSelect, scaleSelect, ...viewProps.querySelectorAll('[data-ws-setting]')]) {
        const a = commands.describe(sel.dataset.wsSetting, viewProps.contains(sel) ? viewPropsTarget || { document: null, id: null } : undefined);
        sel.disabled = !a.enabled; sel.parentElement.title = a.reason; sel.parentElement.setAttribute('tabindex', a.enabled ? '-1' : '0'); sel.parentElement.dataset.wsReason = a.reason;
      }
      walls.refresh(); restrictProperties();
    },
  };

  function opened() {
    const c = current();
    documentToken = c.editor; cameras.clear(); docs.reset(); browserView = null; lastView = null; viewPropsTarget = null; viewPropsSig = ''; lastSettings = null;
    if (c.editor && ctx?.has('palettes')) { A.prepareWorkspace(); A.setTool('select'); views.render(); lastView = '3d:default'; browserView = threeView(); }
    propertyMode = 'view'; soon();
  }
  function renderViewProperties() {
    const v = browserView || engine?.view(), s = snapshot();
    const setting = isPlanView(v) ? views.workspaceSettings(v.levelId, v.rootKind || v.kind, v.kind === 'callout' ? v.ref : null) : docs.settings(v);
    const signature = JSON.stringify([v, setting, s.document?.mid, engine?.view()?.id, A.units()]);
    if (signature === viewPropsSig || viewProps.contains(document.activeElement)) return;
    viewPropsSig = signature;
    // Bind to the rendered palette, which can be retained while a field has focus.
    viewPropsTarget = s.document && v ? { document: s.document, id: v.id } : null;
    const dl = node('dl', { className: 'ws-view-dl' });
    const row = (label, value) => dl.append(node('dt', {}, label), node('dd', {}, value));
    if (!s.document) { viewProps.replaceChildren(node('p', { className: 'ws-note' }, 'Open an existing IFC. Live geometry, names and values come from that file.'), ctx.tool('open', 'properties')); return; }
    if (!v) { viewProps.replaceChildren(node('p', { className: 'ws-note' }, 'Open a drawing from Project Browser. The IFC remains open.')); return; }
    row(T('ws.vp.name'), v.name); row(T('ws.vp.type'), ({plan:T('ws.vp.plan'),rcp:T('workspace.rcp'),callout:T('workspace.callout'),section:T('workspace.section'),elevation:T('workspace.elevation'),sheet:T('workspace.sheet'),schedule:T('workspace.schedule'), '3d':T('ws.vp.3d')})[v.kind]);
    row(T('workspace.sourceid'), v.ref || v.id);
    row('Document', s.name);
    if (isPlanView(v) || ['section', 'elevation'].includes(v.kind)) {
      const isActive = engine?.view()?.id === v.id;
      const ds = settingsSelect('detail'), sc = settingsSelect('scale');
      syncSelect(ds, setting?.detail || 'coarse'); syncSelect(sc, setting?.scale || 0);
      row(T('ws.scale.view'), isActive ? sc : '1 : ' + (setting?.scale || 'Fit')); row(T('ws.detail.level'), isActive ? ds : setting?.detail || 'coarse'); row(T('ws.tool.range'), isActive ? ctx.tool('range', 'properties', true) : T('ws.vp.openit'));
      if (isPlanView(v)) {
      row(T('ws.vp.cut'), fmtLen(setting?.cut ?? 1200, A.units()));
      row('Top', setting?.top ? fmtLen(setting.top, A.units()) : T('ws.vp.top.auto'));
      row('Bottom', fmtLen(setting?.bottom ?? 0, A.units())); row(T('ws.vp.depth'), fmtLen(setting?.depth ?? 50, A.units()));
      if (setting?.template) row(T('ws.vp.template'), setting.template);
      } else { row(T('workspace.crop'), setting?.crop?.join(', ') || T('workspace.none')); if (setting?.issue) row(T('workspace.recordissue'), setting.issue); row(T('workspace.graphics'), ctx.tool('viewsettings', 'properties', true)); }
    } else { row(T('ws.tool.range'), T('workspace.notapplicable')); if (v.kind === 'sheet') row(T('workspace.placement'), ctx.tool('editsheet', 'properties', true)); if (v.kind === 'schedule') row(T('workspace.export'), ctx.tool('csv', 'properties', true)); }
    viewProps.replaceChildren(node('div', { className: 'ws-prop-identity' }, icon(catalog.tools[v.kind]?.icon || (isPlanView(v) ? 'plan' : 'cube')), node('strong', {}, v.name)), dl,
      node('p', { className: 'ws-note' }, T('workspace.retainednote')));
  }
  /** The Project Browser in the palette: a {3D} entry, the selected view marked, its summary counting it. */
  function decorateBrowser() {
    const b = browserEl(); if (!b) return;
    const group = b.querySelector('[data-pb-group="3d"]');
    if (group && !group.querySelector('[data-ws-browser-3d]')) {
      const list = group.querySelector('ul') || node('ul'); if (!list.parentNode) group.append(list);
      list.prepend(node('li', {}, button('{3D}', { className: 'bc-pb-go', 'data-ws-browser-3d': '' })));   // i18n-ignore: the default 3D view's name
    }
    if (group) { const summary = group.querySelector('summary'); if (summary) { if (!summary.hasAttribute('data-ws-original-summary')) summary.dataset.wsOriginalSummary = summary.textContent; summary.textContent = A.t('model.pb.views3d') + ' (' + (1 + group.querySelectorAll('[data-pb-3d]').length) + ')'; } }
    for (const x of b.querySelectorAll('button')) {
      const v = x.hasAttribute('data-ws-browser-3d') ? threeView() : browserSource(x, listViews());
      x.classList.toggle('ws-browser-selected', !!v && browserView?.id === v.id);
      x.setAttribute('aria-current', engine?.view()?.id === v?.id ? 'page' : 'false');
    }
  }
  function restoreBrowser() {
    const b = browserEl(); if (!b) return;
    b.querySelector('[data-ws-browser-3d]')?.closest('li')?.remove();
    for (const s of b.querySelectorAll('[data-ws-original-summary]')) { s.textContent = s.dataset.wsOriginalSummary; delete s.dataset.wsOriginalSummary; }
    for (const x of props.querySelectorAll('[data-ws-wall-label]')) { x.textContent = x.dataset.wsWallLabel; delete x.dataset.wsWallLabel; }
  }
  function restrictProperties() {
    // every property keeps its own action (ours: nothing is read-only that is editable in classic); a wall's assembly button reads
    // "Edit Type…" and opens Doc's type dialog (walls.js)
    for (const input of props.querySelectorAll('input, select, button, textarea')) {
      const wall = docked() && input.matches(INSTANCE_WALL_FIELDS) && walls.metadata().supported;
      if (wall && input.matches('[data-mp-assembly]') && !input.hasAttribute('data-ws-wall-label')) { input.dataset.wsWallLabel = input.textContent; input.textContent = T('ws.edittype'); }
      if (wall && input.matches('[data-mp-height], [data-mp-base]')) input.setAttribute('aria-label', input.matches('[data-mp-height]') ? T('ws.wall.height') : T('ws.wall.base'));
    }
    for (const dd of props.querySelectorAll('dd')) {
      const label = dd.previousElementSibling?.textContent;
      if (label) for (const i of dd.querySelectorAll('input, select')) if (!i.hasAttribute('aria-label')) i.setAttribute('aria-label', label);
    }
  }
  // the Project Browser's view entries: a click shows the view's properties, a double-click or Enter opens it (Doc's)
  const inBrowser = (e) => docked() && ctx?.has('palettes') && browserEl()?.contains(e.target);
  root.addEventListener('click', (e) => {
    if (e.target.closest?.('[data-ws-view-props]') && ctx?.has('palettes')) { if (A.S.tool === 'wall') A.setTool('select'); browserView = engine?.view(); propertyMode = 'view'; viewPropsSig = ''; soon(); return; }
    // the navigator (toolbox layout): plans open as in classic; the {3D} entry the palette adds opens the 3D view
    if (!docked() && ctx?.has('palettes') && e.target.closest?.('[data-ws-browser-3d]') && browserEl()?.contains(e.target)) { e.preventDefault(); ctx.open('3d:default'); return; }
    if (!inBrowser(e)) return;
    const b = e.target.closest('button'); if (!b) return;
    const source = b.hasAttribute('data-ws-browser-3d') ? threeView() : browserSource(b, listViews());
    if (!source) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (snapshot().busy) return;
    browserView = source; propertyMode = 'view'; viewPropsSig = ''; soon();
  }, true);
  const openFromBrowser = b => { const v = b.hasAttribute('data-ws-browser-3d') ? threeView() : browserSource(b, listViews()); if (v && !snapshot().busy) ctx.open(v.id); };
  root.addEventListener('dblclick', e => { if (!inBrowser(e)) return; const b = e.target.closest('button'); if (!b) return; if (!browserSource(b, listViews()) && !b.hasAttribute('data-ws-browser-3d')) return; e.preventDefault(); e.stopImmediatePropagation(); openFromBrowser(b); }, true);
  root.addEventListener('keydown', e => { if (e.key !== 'Enter' || !inBrowser(e)) return; const b = e.target.closest('button'); if (!b) return; if (!browserSource(b, listViews()) && !b.hasAttribute('data-ws-browser-3d')) return; e.preventDefault(); e.stopImmediatePropagation(); openFromBrowser(b); }, true);
  new MutationObserver(() => soon()).observe(props, { childList: true });

  function existingTools() {
    const routes = [
      ['files','Files and folders','Open/new projects, folder browser, federation, file information, bundle/import/export and recovery.'],
      ['library','Library','Existing library search, attribution, placement, updates and swap. Requires the configured library service; errors remain visible.'],
      ['links','Links and federation','Existing linked IFC load/reload, transforms and model management.'],
      ['model','Modeling and Modify','Established wall/curve, openings, family, site, roof, MEP and verified Modify workflows. Unsupported wall-instance clipboard actions stay refused.'],
      ['props','Properties','All established property actions for supported categories.'],
      ['color','Color and visibility','Established color rules, clipping, isolation and paint workflows.'],
      ['issues','Issues','Existing issues and viewpoints.'],
      ['analysis','Analysis','Existing frame analysis; dependency and geometry limits remain.'],
      ['points',T('fieldpts.title'),'Existing field-point and as-built tools.'],
      ['assets','Assets','Existing asset and maintenance records.'],
      ['daylight','Daylight','Existing panel only; this does not verify the uncertain ribbon mapping.'],
      ['shell','Help, Settings and panels','Shared app bar: Help, Settings, recovery, keyboard help, docking, pop-outs and add-ons. Detached panels are preserved.'],
    ];
    const dlg = node('dialog', { className: 'ws-dialog ws-existing-tools', 'aria-label': A.t('workspace.tools') }, node('h2', {}, A.t('workspace.tools')),
      node('p', {}, A.t('workspace.fallbackRoutes')), routes.map(([id,name,scope]) => node('article', {}, button(name + ' → Established layout', {'data-ws-existing':id}), node('p', {}, scope))), button('Close', {'data-ws-dismiss':''}));
    root.append(dlg); dlg.addEventListener('close', () => dlg.remove()); dlg.showModal();
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-ws-existing]'); if (!b) return;
    b.closest('dialog')?.close(); chooseLayout('standard'); existing(b.dataset.wsExisting);
  });
  window.addEventListener('bimcraft-units', soon);
  root.addEventListener('focusout', () => soon());
  const api = {
    get active() { return docked(); },
    attach(e) { engine = e; },
    refresh: soon, stageChanged: soon, opened: () => { if (engine?.has('palettes')) opened(); else soon(); }, state: snapshot,
    propertiesChanged: soon,
    picked() { if (!snapshot().busy) { propertyMode = current().selection.length ? 'element' : 'view'; if (propertyMode === 'view') browserView = engine?.view(); viewPropsSig = ''; } soon(); },
    inspect: () => { const s = snapshot(); return { active: docked(), layout: engine?.layout || null, document: s.document ? s.name : null, busy: s.busy, dirty: s.dirty, selection: s.selection, view: s.view, tabs: engine?.tabs() || [], settings: s.settings, propertyMode }; },
    selectTool: () => { A.setTool('select'); status(T('ws.select.hint')); },
    activatePlan(levelGuid) {
      const ls = levels();
      const level = ls.find((l) => l.guid === levelGuid) || ls.find((l) => l.id === A.S.level) || ls.find((l) => Math.abs(l.elevation) < 1) || ls[0];
      if (level) ctx?.open('plan:' + level.guid);
    },
    activate3d: () => ctx?.open('3d:default'),
    openRange: () => { const v = engine?.view(); if (isPlanView(v) && v.kind !== 'callout') views.openRange(v.guid, v.kind); },
    setSettings: (patch) => { const v = engine?.view(), why = isPlanView(v) ? views.setWorkspaceSettings(patch) : docs.setSettings(v, patch); if (why) status(why, true); soon(); },
    fit: () => { const v = engine?.view(); if (isPlanView(v)) A.fitPlan(); else if (isDocumentView(v)) docs.fit(); else current().viewer?.view('iso'); },
    openSource: (kind, ref) => { const v = listViews().find(v => v.kind === kind && (!ref || v.ref === ref)); if (v) ctx?.open(v.id); else status(T('workspace.missing'), true); },
    startAnnotation: tool => { A.host.select([]); A.setTool(tool); soon(); },
    newSheet: () => views.openSheet(null), editSheet: () => views.openSheet(engine?.view()?.ref),
    viewSettings: () => docs.edit(engine?.view()), exportPdf: () => docs.exportPdf(engine?.view()), exportCsv: () => A.exportSchedule(),
    drawingSet: () => A.ask('openDrawingSet'), materials: () => A.ask('openProjectMaterials'), templates: () => views.openTemplate(null),
    existingTools,
    startWall: () => walls.start(), editType: () => walls.editType(), editStructure: () => walls.editStructure(),
    cancelWall: (finish) => { A.workspaceCancel(finish); soon(); },
  };
  return { adapter, api };
}
