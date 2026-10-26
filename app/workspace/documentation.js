/* SPDX-License-Identifier: Apache-2.0 */
import { node, button } from './dom.js';
import { composeSheet, sheetSvg, setPdf, PAPERS } from '../res-sheets.js';
import { documentPages } from '../assembly-schedule-layout.js';

export const isPlanView = v => ['plan', 'rcp', 'callout'].includes(v?.kind);
export const isDocumentView = v => ['section', 'elevation', 'sheet', 'schedule'].includes(v?.kind);
export const ANNOTATION_FIELDS = '[data-mp-secname], [data-mp-secflip], [data-mp-secdepth], [data-mp-dimoffset], [data-mp-dimrebind], [data-mp-drpat], [data-mp-drscale], [data-mp-drmove]';
export const extraTools = {
  viewsettings: ['View settings', 'sliders'], editsheet: ['Edit sheet / Place source', 'sheet'],
  csv: ['Download CSV', 'save'], drawingset: ['Drawing set', 'sheet'], tools: ['Existing tools', 'generic'],
};

/** Browser attributes identify authoritative records. The caller scopes every descriptor to its editor session. */
export function browserSource(button, sources) {
  const attrs = { pbPlan: 'plan', pbRcp: 'rcp', pbCallout: 'callout', pbSection: 'section', pbElev: 'elevation', pbSheet: 'sheet', pbSched: 'schedule' };
  for (const [key, kind] of Object.entries(attrs)) if (button.dataset[key]) return sources.find(v => v.kind === kind && v.ref === button.dataset[key]) || null;
  return null;
}

/** Presentation only: the native schedule and existing vector composer own content and export. */
export function mountDocumentation({ root, A, views, stage, current, status }) {
  const host = node('section', { className: 'ws-documentation', 'data-ws-documentation': '', hidden: true, 'aria-label': A.t('workspace.drawinglabel') });
  const note = node('p', { className: 'ws-document-note', role: 'status', 'data-ws-document-note': '' });
  const viewport = node('div', { className: 'ws-document-viewport', tabindex: 0, 'aria-label': A.t('workspace.viewportlabel') });
  const paper = node('div', { className: 'ws-document-paper', 'data-ws-document-paper': '' }); viewport.append(paper); host.append(note, viewport); stage.append(host);
  const schedule = root.querySelector('[data-msched-sec]'), home = document.createComment('F28-C schedule home'); schedule.before(home);
  let owner = null, data = null, input = null, inputUnits = null, signature = null, active = null, renderedSheet = null, opts = null;
  const positions = new Map(); let zoom = 100;
  function layout() { if (host.hidden || !opts) return; const [w,h] = PAPERS[opts.paper]; const fit = Math.min(viewport.clientWidth - 24, (viewport.clientHeight - 24) * w / h); if (fit > 0) paper.style.width = Math.round(fit * zoom / 100) + 'px'; }
  new ResizeObserver(layout).observe(viewport);
  function reset() { remember(); owner = current().editor; data = input = inputUnits = signature = active = renderedSheet = null; positions.clear(); }
  function remember() { if (active) positions.set(active.id, { left: viewport.scrollLeft, top: viewport.scrollTop, zoom }); }
  function restore() { const p = positions.get(active.id) || { left: 0, top: 0, zoom: 100 }; zoom = p.zoom; layout(); viewport.scrollLeft = p.left; viewport.scrollTop = p.top; }
  function sources() { return views.workspaceSources(); }
  function render(view) {
    if (owner !== current().editor) reset();
    if (!isDocumentView(view)) { hide(); return; }
    if (active?.id !== view.id) remember();
    host.hidden = false; stage.classList.add('ws-document-mode');
    const next = [view.id, A.S.data, current().busy, A.units(), A.ask('sheetOpts')?.paper];
    if (signature && next.every((v, i) => v === signature[i])) return;
    signature = next; active = view; renderedSheet = null;
    const source = sources().find(v => v.id === view.id);
    paper.hidden = view.kind === 'schedule';
    schedule.hidden = view.kind !== 'schedule';
    if (view.kind === 'schedule') {
      host.append(schedule); viewport.hidden = true;
      if (!source) { note.textContent = A.t('workspace.missing'); return; }
      A.workspaceSchedule(view.ref); schedule.hidden = false;
      note.textContent = A.t('workspace.nominal'); return;
    }
    viewport.hidden = false;
    if (!source) { paper.replaceChildren(); note.textContent = A.t('workspace.missing'); return; }
    try {
      if (data !== A.S.data || inputUnits !== A.units()) { data = A.S.data; inputUnits = A.units(); input = views.workspaceInput(); }
      if (!input) throw new Error(A.t('model.sh.nomodel'));
      opts = A.ask('sheetOpts') || { paper: 'tabloid', units: A.units() };
      const spec = view.kind === 'sheet' ? views.sheet(view.ref) : {
        number: '', title: source.name, paper: opts.paper,
        views: [{ kind: view.kind, ref: view.ref, x: PAPERS[opts.paper][0] / 2, y: PAPERS[opts.paper][1] / 2 + 10, ratio: 0 }],
      };
      opts = { ...opts, paper: spec.paper };
      renderedSheet = composeSheet(spec, input, opts);
      paper.innerHTML = sheetSvg(renderedSheet, opts); // Existing escaped, model-derived vector output.
      const warnings = [...new Set((input[view.kind === 'section' ? 'sections' : 'elevations'] || []).find(v => v.ref === view.ref)?.view?.warnings?.map(w => w.reason) || [])];
      note.textContent = renderedSheet.missing.length ? A.t('model.sh.missing', { n: renderedSheet.missing.length }) + ' ' + A.t('workspace.missing') : warnings.length ? warnings.join(' · ') : A.t('workspace.vector');
      restore();
    } catch (e) { paper.replaceChildren(); note.textContent = e.message; status(e.message, true); }
  }
  function hide() { remember(); host.hidden = true; stage.classList.remove('ws-document-mode'); active = null; signature = null; }
  function restoreHome() { hide(); home.after(schedule); schedule.hidden = !A.S.on; }
  function exportPdf(view) {
    if (isPlanView(view)) { A.exportPlan(); return; }
    render(view);
    let sheets = renderedSheet ? [renderedSheet] : [];
    if (view.kind === 'schedule') {
      const sc = A.schedules()[view.ref]; if (!sc) return;
      const pages = view.ref === 'assemblies' || view.ref === 'materialLegend' ? documentPages(sc, view.ref === 'assemblies' ? 'assemblies' : 'materials') : [{ ...sc, ref: view.ref, title: sc.title || view.name }];
      opts = { ...(A.ask('sheetOpts') || {}), paper: 'a3', units: A.units() };
      sheets = pages.map(p => composeSheet({ number: '', title: p.title, views: [{ kind: 'schedule', ref: p.ref, x: 210, y: 162.5, ratio: 0 }] }, { schedules: [p] }, opts));
    }
    if (!sheets.length) { status(A.t('workspace.missing'), true); return; }
    A.host.download((current().name || 'model') + ' — ' + view.name + '.pdf', setPdf(sheets, opts), 'application/pdf');
  }
  viewport.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault(); zoom = Math.max(50, Math.min(400, zoom + (e.deltaY > 0 ? -10 : 10))); layout();
  }, { passive: false });
  function fit() { zoom = 100; layout(); viewport.scrollTo(0, 0); remember(); }
  return { sources, render, hide, reset, restoreHome, exportPdf, fit, host,
    settings: v => ['section', 'elevation'].includes(v?.kind) ? views.projected(v.id) : null,
    setSettings: (v, patch) => views.workspaceProjected(v.id, patch),
    edit: v => v?.kind === 'sheet' ? views.openSheet(v.ref) : ['section', 'elevation'].includes(v?.kind) ? views.openProjected(v.id) : isPlanView(v) && v.kind !== 'callout' ? views.openRange(v.guid, v.kind) : v?.kind === 'callout' ? views.editCallout(v.ref) : null,
  };
}
