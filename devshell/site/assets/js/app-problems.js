/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-problems.js — the shell's Problems UI (0.7.1 → 0.8; spec docs/0.8-PROBLEMS-SPEC.md, map docs/apps/shell-modules.md § Problems):
 * the ⚠ button with its count in the app bar, the Problems panel (grouped by severity, source or object; filter; click = zoom + select;
 * fixes; accept with a reason; the check report and CSV), ⚠ markers drawn over the app's 2D or 3D view through a small adapter, and
 * window.ccProblems for the apps, their add-ons and engines. The store is the DOM-free core ./problems.js.
 *
 * Loaded by app-shell.inc only for a build whose manifest says "problems": true (AppBuilds::problems; dev builds — frozen releases have
 * no key, so they never change). Reads #cc-problems { app, appName }. The button stays hidden until a source registers.
 *
 *   window.ccProblems = {
 *     store,                                   the core store (problems.js createStore): list, counts, accept, report …
 *     source(def) → handle                     store.source: an app check, an add-on, an engine, an importer
 *     adapter({ select(p), focus(p), saveAccepted(list), who(), file(), packs(), t(key, vars) })   what the app does for the panel
 *     markers({ stage, anchor(p) → [x, y, z?] | null, toScreen(pt) → { x, y, behind? } | null, onView(fn) → off })
 *                                              ⚠ on the drawing: the shell draws them over `stage`, the app only places them
 *     open({ about? }) · close() · toggle() · show(id) · report() → report data · csv() → text
 *   }
 * Apps that load before this module wait for it: `window.ccProblems ? go() : addEventListener('cc-problems-ready', go, { once: true })`.
 * Keys: Ctrl+Shift+M (⌘⇧M) opens the panel and focuses the list (captured before the apps); an app whose input registry has the command
 * `view.problems` (rebindable in Settings › Menus, keys and mouse) takes the key over once a style gives it another; in the list ↑ ↓ Home End move,
 * Enter shows, Esc closes and gives focus back. Phones (≤ 760 px): the panel is a sheet from the bottom.
 * A panel like the others (owner 2026-10-27: "follow the panel theme", "a detachable panel like others"): the shell's grip bar (name and
 * summary, the "…" menu, ×), the layout's panel colours and the panel text size, compact buttons; the menu docks it right or left, floats it
 * (drag the grip to float it and move it, its corner resizes it) or moves it to a window of its own. Remembered per app (prefs.dock,
 * prefs.float {x, y, w, h}); a window can only open from a click, so after a reload a window panel comes back docked right.
 * window.ccProblems.dock(mode) → 'right' | 'left' | 'float' | 'window' (tests).
 */
import { createStore, messageText, toCsv, valueText, aboutKey, needsReason, problemTools } from './problems.js';
import { reportPdf } from './problems-pdf.js';   // the check report as a PDF (0.8 P.7)
import { popout } from './app-workspace-popout.js';   // "Move to a new window", as a workspace block does (owner 2026-10-27)

const T = (k, v) => (window.ccShellT ? window.ccShellT(k, v) : k);
const cfg = (() => { try { return JSON.parse(document.getElementById('cc-problems')?.textContent || 'null'); } catch (e) { return null; } })();

if (cfg && cfg.app && !window.ccProblems) {
  const slug = String(cfg.app);
  // owner 2026-10-27: the themed, detachable panel is for lab (dev) builds; a released build keeps the panel it shipped with
  const V2 = cfg.panel >= 2;
  const PREF_KEY = 'cc-problems:' + slug;
  const prefs = (() => { try { return { group: 'severity', markers: true, accepted: false, sev: ['error', 'warning', 'note'], ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; } catch (e) { return { group: 'severity', markers: true, accepted: false, sev: ['error', 'warning', 'note'] }; } })();
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* private window: kept for this page */ } };

  const store = createStore({ app: slug });
  let adapter = {};
  let mk = null;          // the markers adapter
  let aboutFilter = '';   // 'kind:id' from a marker with several problems
  let words = '';
  let acceptingId = '';
  let lastFocus = null;

  const h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v === null || v === undefined) continue;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  };
  const tMsg = (k, v) => (adapter.t ? adapter.t(k, v) : T(k, v));
  const words$ = (p) => messageText(p, tMsg);
  const fmtVal = (v) => valueText(v);
  const ICON = { error: 'bi-x-octagon-fill', warning: 'bi-exclamation-triangle-fill', note: 'bi-info-circle-fill' };
  // owner 2026-10-26: a failed regulation rule is a warning labelled "⚠ Warning: failed regulation" (row and report)
  const sevLabel = (sev, kind) => (kind === 'regulation' && sev === 'warning' ? T('shell.problems.regfail') : T('shell.problems.sev1.' + sev));
  const NAME_KEY = 'cc-problems-name';   // the name typed when signed out (owner 2026-10-26), a convenience only

  // ---- the app-bar button ----
  const btn = document.querySelector('[data-problems-open]') || h('button', { type: 'button', class: 'app-bar-btn app-bar-problems', 'data-problems-open': true, 'aria-expanded': 'false', 'aria-controls': 'ccp-panel', hidden: true,
    title: T('shell.problems.button.title', { key: navigator.platform?.startsWith('Mac') ? '⌘⇧M' : 'Ctrl+Shift+M' }) },
  h('i', { class: 'bi bi-exclamation-triangle', 'aria-hidden': 'true' }), h('span', { class: 'app-bar-btn-label', text: T('shell.problems.button') }),
  h('span', { class: 'app-bar-problems-n', 'data-problems-count': true }));
  btn.querySelector('.app-bar-btn-label').textContent = T('shell.problems.button');
  btn.title = T('shell.problems.button.title', { key: navigator.platform?.startsWith('Mac') ? '⌘⇧M' : 'Ctrl+Shift+M' });
  const bar = document.querySelector('.app-bar');
  if (bar) bar.insertBefore(btn, bar.querySelector('.app-bar-settings, [data-settings-open]') || bar.querySelector('.app-bar-fs') || null);

  // ---- the panel ----
  const live = h('p', { class: 'visually-hidden', 'aria-live': 'polite', 'data-problems-live': true });
  const search = h('input', { type: 'search', class: 'ccp-search', placeholder: T('shell.problems.filter'), 'aria-label': T('shell.problems.filter'), 'data-problems-filter': true });
  const sevBtns = ['error', 'warning', 'note'].map((s) => h('button', { type: 'button', class: 'ccp-sev ccp-sev-' + s, 'data-problems-sev': s, 'aria-pressed': prefs.sev.includes(s) ? 'true' : 'false' },
    h('i', { class: 'bi ' + ICON[s], 'aria-hidden': 'true' }), h('span', { 'data-n': true }), h('span', { class: 'visually-hidden', text: T('shell.problems.sev.' + s) })));
  const groupSel = h('select', { class: 'select-cc ccp-group', 'aria-label': T('shell.problems.group'), 'data-problems-group': true },
    ...['severity', 'source', 'object'].map((g) => h('option', { value: g, text: T('shell.problems.group.' + g) })));
  groupSel.value = prefs.group;
  const accChk = h('input', { type: 'checkbox', id: 'ccp-acc', 'data-problems-accepted': true });
  accChk.checked = !!prefs.accepted;
  const mkChk = h('input', { type: 'checkbox', id: 'ccp-mk', 'data-problems-markers': true });
  mkChk.checked = prefs.markers !== false;
  const mkLabel = h('label', { class: 'ccp-check', for: 'ccp-mk', hidden: true }, mkChk, ' ', T('shell.problems.markers'));
  const list = h('div', { class: 'ccp-list', 'data-problems-list': true, role: 'list', 'aria-label': T('shell.problems.title') });
  const aboutBar = h('p', { class: 'ccp-about', hidden: true });
  // the "…" menu of a panel's grip (assets/js/app-panels.js openMenu: .shell-panel-menu), here: where the panel sits
  const dockBtn = h('button', { type: 'button', class: 'shell-grip-menu ccp-dock', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': T('shell.problems.dock.menu'), title: T('shell.problems.dock.menu'), 'data-problems-dock': true },
    h('i', { class: 'bi bi-three-dots', 'aria-hidden': 'true' }));
  const panel = h('section', { class: V2 ? 'ccp ccp-v2' : 'ccp', id: 'ccp-panel', role: 'region', 'aria-labelledby': 'ccp-h', 'data-problems-panel': true, hidden: true },
    !V2 ? h('div', { class: 'ccp-head' },
      h('h2', { id: 'ccp-h', class: 'ccp-title' }, h('i', { class: 'bi bi-exclamation-triangle', 'aria-hidden': 'true' }), ' ', T('shell.problems.title')),
      h('span', { class: 'ccp-sum', 'data-problems-sum': true }),
      h('button', { type: 'button', class: 'ccp-x', 'aria-label': T('shell.problems.close'), 'data-problems-close': true, onclick: () => close() }, h('i', { class: 'bi bi-x-lg', 'aria-hidden': 'true' })))
    : h('div', { class: 'shell-grip ccp-grip', 'data-problems-grip': true },
      h('div', { class: 'shell-grip-handle ccp-handle', 'data-problems-handle': true, title: T('shell.problems.drag') },
        h('i', { class: 'bi bi-exclamation-triangle', 'aria-hidden': 'true' }),
        h('h2', { id: 'ccp-h', class: 'shell-grip-name ccp-title' }, T('shell.problems.title')),
        h('span', { class: 'ccp-sum', 'data-problems-sum': true })),
      dockBtn,
      h('button', { type: 'button', class: 'shell-grip-btn shell-grip-close ccp-x', 'aria-label': T('shell.problems.close'), title: T('shell.problems.close'), 'data-problems-close': true, onclick: () => close() }, h('i', { class: 'bi bi-x-lg', 'aria-hidden': 'true' }))),
    h('div', { class: 'ccp-tools' }, search, h('div', { class: 'ccp-sevs', role: 'group', 'aria-label': T('shell.problems.sev') }, sevBtns), groupSel),
    h('div', { class: 'ccp-tools' }, h('label', { class: 'ccp-check', for: 'ccp-acc' }, accChk, ' ', T('shell.problems.accepted.show')), mkLabel,
      h('span', { class: 'ccp-spacer' }),
      h('button', { type: 'button', class: 'ccp-link', 'data-problems-report': true, onclick: () => downloadReport() }, h('i', { class: 'bi bi-file-earmark-text', 'aria-hidden': 'true' }), ' ', T('shell.problems.report')),
      h('button', { type: 'button', class: 'ccp-link', 'data-problems-pdf': true, onclick: () => downloadPdf() }, h('i', { class: 'bi bi-filetype-pdf', 'aria-hidden': 'true' }), ' ', T('shell.problems.pdf')),
      h('button', { type: 'button', class: 'ccp-link', 'data-problems-csv': true, onclick: () => downloadCsv() }, h('i', { class: 'bi bi-filetype-csv', 'aria-hidden': 'true' }), ' ', T('shell.problems.csv'))),
    aboutBar, list, live);
  document.body.append(panel);

  // ---- render ----
  let raf = 0;
  const later = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); };
  function paint() {
    const c = store.counts();
    const open = c.error + c.warning;
    const n = btn.querySelector('[data-problems-count]');
    n.textContent = open ? String(open) : c.note ? String(c.note) : '';
    btn.dataset.worst = c.worst;
    btn.setAttribute('aria-label', T('shell.problems.button') + ': ' + T('shell.problems.sum', { errors: c.error, warnings: c.warning, notes: c.note }));
    btn.hidden = !store.sources().length;
    for (const b of sevBtns) b.querySelector('[data-n]').textContent = String(c[b.dataset.problemsSev]);
    panel.querySelector('[data-problems-sum]').textContent = T('shell.problems.sum', { errors: c.error, warnings: c.warning, notes: c.note }) + (c.accepted ? '; ' + T('shell.problems.accepted.n', { n: c.accepted }) : '');
    mkLabel.hidden = !mk;
    drawMarkers();
    if (panel.hidden) return;
    renderList();
  }
  function current() {
    return store.list({ severity: prefs.sev, text: words, accepted: prefs.accepted ? 'show' : 'hide', about: aboutFilter || undefined, t: tMsg });
  }
  function renderList() {
    const keep = document.activeElement && list.contains(document.activeElement) ? document.activeElement.closest('[data-problem]')?.dataset.problem : null;
    aboutBar.hidden = !aboutFilter;
    if (aboutFilter) aboutBar.replaceChildren(T('shell.problems.about.only'), ' ', h('button', { type: 'button', class: 'ccp-link', onclick: () => { aboutFilter = ''; paint(); } }, T('shell.problems.about.all')));
    const L = current();
    if (!L.length) { list.replaceChildren(h('p', { class: 'ccp-none', text: T(store.counts().total ? 'shell.problems.none.filtered' : 'shell.problems.none') })); return; }
    const groups = store.groups(L, prefs.group);
    list.replaceChildren(...groups.map((g) => h('div', { class: 'ccp-grp', role: 'presentation' },
      h('h3', { class: 'ccp-grp-h' }, prefs.group === 'severity' ? T('shell.problems.sev.' + g.key) : g.label || T('shell.problems.group.none'), ' ', h('span', { class: 'ccp-grp-n', text: '(' + g.items.length + ')' })),
      ...g.items.map(row))));
    const back = keep && list.querySelector('[data-problem="' + CSS.escape(keep) + '"] .ccp-main');
    if (back) back.focus();
  }
  function row(p) {
    const meta = [];
    if (p.source.pack) meta.push([p.source.pack.name || p.source.pack.id, p.source.pack.edition, p.source.pack.clause].filter(Boolean).join(', '));
    else meta.push(T('shell.problems.kind.' + p.source.kind) + ': ' + (store.sources().find((s) => p.id.startsWith(s.id + ':'))?.label || p.source.name));
    if (p.req || p.found) meta.push(T('shell.problems.reqfound', { req: p.req ? fmtVal(p.req) : '–', found: p.found ? fmtVal(p.found) : '–' }));
    const about = p.about.map((r) => r.label || r.id).join(', ');
    const li = h('div', { class: 'ccp-row ccp-' + p.severity + (p.accepted ? ' is-accepted' : ''), role: 'listitem', 'data-problem': p.id, 'data-sev': p.severity },
      h('button', { type: 'button', class: 'ccp-main', 'data-problem-show': true, onclick: () => show(p.id) },
        h('i', { class: 'bi ' + ICON[p.severity] + ' ccp-ico', 'aria-hidden': 'true' }),
        p.source.kind === 'regulation' && p.severity === 'warning' ? h('span', { class: 'ccp-reg', 'data-problem-regfail': true, text: sevLabel(p.severity, 'regulation') })
          : h('span', { class: 'visually-hidden', text: T('shell.problems.sev1.' + p.severity) + ': ' }),
        h('span', { class: 'ccp-msg', text: words$(p) }),
        about ? h('span', { class: 'ccp-obj', text: about }) : null,
        h('span', { class: 'ccp-meta', text: meta.join('; ') })));
    if (p.accepted) li.append(h('p', { class: 'ccp-acc', text: T('shell.problems.accepted.by', { by: p.accepted.by || T('shell.problems.someone'), date: p.accepted.date, reason: p.accepted.reason || '–' }) }));
    else if (p.acceptedBefore) li.append(h('p', { class: 'ccp-acc is-changed', text: T('shell.problems.accepted.changed', { by: p.acceptedBefore.by || T('shell.problems.someone'), date: p.acceptedBefore.date }) }));
    const acts = h('div', { class: 'ccp-acts' });
    for (const f of p.fixes || []) acts.append(h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-problem-fix': f.id, onclick: () => runFix(p, f) }, f.msg ? tMsg(f.msg.key, f.msg.vars) : f.text));
    if (p.accepted) acts.append(h('button', { type: 'button', class: 'ccp-link', 'data-problem-unaccept': true, onclick: () => { store.unaccept(p.id); persist(); } }, T('shell.problems.unaccept')));
    else if (p.acceptable) acts.append(h('button', { type: 'button', class: 'ccp-link', 'data-problem-accept': true, 'aria-expanded': acceptingId === p.id ? 'true' : 'false', onclick: () => { acceptingId = acceptingId === p.id ? '' : p.id; renderList(); list.querySelector('[data-problem="' + CSS.escape(p.id) + '"] textarea')?.focus(); } }, T('shell.problems.accept')));
    if (acts.childNodes.length) li.append(acts);
    if (acceptingId === p.id && !p.accepted) li.append(acceptForm(p));
    return li;
  }
  /**
   * Accept (owner 2026-10-26): warnings and notes with an optional reason; errors and failed regulations need one, and the form offers a
   * one-click "Override / none given" that records exactly that. Signed out, the person types a name (remembered in this browser).
   */
  function acceptForm(p) {
    const need = needsReason(p), signedIn = !!who();
    const ta = h('textarea', { class: 'ccp-reason', rows: '2', maxlength: '500', 'aria-label': T(need ? 'shell.problems.accept.reason' : 'shell.problems.accept.reason.opt'), placeholder: need ? '' : T('shell.problems.accept.reason.opt'), 'data-problem-reason': true, ...(need ? { 'aria-required': 'true' } : {}) });
    let saved = ''; try { saved = localStorage.getItem(NAME_KEY) || ''; } catch (e) { /* none */ }
    const name = signedIn ? null : h('input', { type: 'text', class: 'ccp-search', maxlength: '80', value: saved, 'aria-label': T('shell.problems.accept.name'), placeholder: T('shell.problems.accept.name'), autocomplete: 'name', 'data-problem-name': true, 'aria-required': 'true' });
    const err = h('p', { class: 'ccp-err', hidden: true });
    const hint = need ? T(p.source.kind === 'regulation' ? 'shell.problems.accept.hint.regs' : 'shell.problems.accept.hint.error') : T('shell.problems.accept.hint');
    const go = (reason) => {
      const by = signedIn ? who() : name.value.trim();
      if (!by) { err.textContent = T('shell.problems.accept.needname'); err.hidden = false; name.focus(); return; }
      if (need && !reason) { err.textContent = T('shell.problems.accept.need'); err.hidden = false; ta.focus(); return; }
      if (!signedIn) { try { localStorage.setItem(NAME_KEY, by); } catch (e) { /* kept for this page */ } }
      if (store.accept(p.id, { by, reason })) { acceptingId = ''; persist(); say(T(adapter.saveAccepted ? 'shell.problems.accepted.done' : 'shell.problems.accepted.done.session')); }
    };
    const f = h('form', { class: 'ccp-accept', 'data-problem-accept-form': true },
      h('p', { class: 'ccp-hint', text: hint + (adapter.saveAccepted ? '' : ' ' + T('shell.problems.accept.hint.session')) }), name, ta, err,
      h('div', { class: 'ccp-acts' }, h('button', { type: 'submit', class: V2 ? 'btn-line btn-sm-cc ccp-primary' : 'btn-plot btn-sm-cc', 'data-problem-accept-ok': true }, T('shell.problems.accept.ok')),
        need ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-problem-override': true, onclick: () => go(T('shell.problems.accept.override')) }, T('shell.problems.accept.override')) : null,
        h('button', { type: 'button', class: 'ccp-link', onclick: () => { acceptingId = ''; renderList(); } }, T('shell.problems.cancel'))));
    f.addEventListener('submit', (e) => { e.preventDefault(); go(ta.value.trim()); });
    return f;
  }
  const who = () => { try { return String(adapter.who?.() || JSON.parse(document.getElementById('cc-account')?.textContent || '{}').name || ''); } catch (e) { return ''; } };
  const persist = () => { try { adapter.saveAccepted?.(store.accepted({ prune: true })); } catch (e) { say(String(e?.message || e)); } later(); };
  const say = (m) => { live.textContent = ''; setTimeout(() => { live.textContent = m; }, 30); };
  async function runFix(p, f) {
    let done = false;
    try { done = await store.fix(p.id, f.id); } catch (e) { done = false; }
    say(done ? T('shell.problems.fix.done') : T('shell.problems.fix.failed'));
  }
  function show(id) {
    const p = store.get(id);
    if (!p) return;
    try { adapter.select?.(p); adapter.focus?.(p); } catch (e) { /* the app says why in its own status line */ }
    for (const r of list.querySelectorAll('.ccp-row.is-shown')) r.classList.remove('is-shown');
    list.querySelector('[data-problem="' + CSS.escape(id) + '"]')?.classList.add('is-shown');
  }

  // ---- where the panel sits: docked right or left, floating, or a window of its own ----
  const DOCKS = ['right', 'left', 'float', 'window'];
  let dock = V2 && DOCKS.includes(prefs.dock) && prefs.dock !== 'window' ? prefs.dock : 'right';   // a window needs a click: back docked right
  const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const topEdge = () => {
    let y = 0;
    for (const el of document.querySelectorAll('.app-bar, .ws-top, .ws-titlebar')) { const r = el.getBoundingClientRect(); if (r.height && r.top < 4) y = Math.max(y, r.bottom); }
    return y;
  };
  const fit = (f) => {
    const vw = innerWidth, vh = innerHeight, r = remPx();
    const w = Math.max(16 * r, Math.min(f.w || 30 * r, vw - 8)), hgt = Math.max(10 * r, Math.min(f.h || vh * 0.7, vh - 8));
    return { x: Math.max(4, Math.min(f.x ?? vw - w - 16, vw - w - 4)), y: Math.max(4, Math.min(f.y ?? topEdge() + 8, vh - 3 * r)), w, h: hgt };
  };
  function place() {
    if (!V2) return;
    panel.dataset.dock = dock;
    panel.style.removeProperty('left'); panel.style.removeProperty('top'); panel.style.removeProperty('width'); panel.style.removeProperty('height');
    if (dock === 'window' || matchMedia('(max-width: 760px)').matches) return;   // a phone keeps its sheet from the bottom
    if (dock === 'float') {
      const f = fit(prefs.float || {});
      Object.assign(panel.style, { left: f.x + 'px', top: f.y + 'px', width: f.w + 'px', height: f.h + 'px' });
    } else panel.style.setProperty('--ccp-top', (topEdge() + 4) + 'px');
  }
  let win = null;
  function setDock(mode) {
    if (!V2 || !DOCKS.includes(mode)) return dock;
    if (mode === 'window') {
      if (!win) win = popout({ name: 'problems-' + slug, title: () => T('shell.problems.title') + ' · ' + (cfg.appName || slug), nodes: [panel], cls: 'ccp-window', size: () => ({ w: Math.max(380, panel.offsetWidth || 480), h: Math.max(480, panel.offsetHeight || 640) }),
        onChange: (on) => { if (!on && dock === 'window') { dock = prefs.dock = 'right'; savePrefs(); place(); } } });
      if (panel.hidden) open({ focus: false });
      if (!win.open()) { say(T('shell.problems.dock.blocked')); return dock; }
      dock = 'window'; prefs.dock = 'window'; savePrefs(); place();
      return dock;
    }
    if (win && win.isOpen()) { dock = mode; win.back(); }
    dock = mode; prefs.dock = mode; savePrefs(); place();
    return dock;
  }
  // the "…" menu
  let dmenu = null;
  const dclose = () => { if (!dmenu) return; dmenu.ul.remove(); dockBtn.setAttribute('aria-expanded', 'false'); dmenu.d.removeEventListener('pointerdown', dmenu.away, true); dmenu = null; };
  dockBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dmenu) { dclose(); return; }
    const d = dockBtn.ownerDocument;
    const items = dock === 'window' ? [['window', 'bi-box-arrow-in-down-left', T('shell.problems.dock.back')]]
      : [['right', 'bi-layout-sidebar-reverse', T('shell.problems.dock.right')], ['left', 'bi-layout-sidebar', T('shell.problems.dock.left')], ['float', 'bi-window-stack', T('shell.problems.dock.float')], ['window', 'bi-window-plus', T('shell.problems.dock.window')]];
    const ul = d.createElement('ul'); ul.className = 'shell-panel-menu'; ul.setAttribute('role', 'menu'); ul.setAttribute('aria-label', T('shell.problems.dock.menu'));
    for (const [mode, ic, text] of items) {
      const li = d.createElement('li'); li.setAttribute('role', 'none');
      const b = d.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitemradio'); b.setAttribute('aria-checked', String(mode === dock && dock !== 'window')); b.tabIndex = -1; b.dataset.problemsDockTo = mode;
      const i = d.createElement('i'); i.className = 'bi ' + ic; i.setAttribute('aria-hidden', 'true'); b.append(i, ' ' + text);
      b.addEventListener('click', (ev) => { ev.stopPropagation(); dclose(); if (dock === 'window' && mode === 'window') { win?.back(); } else setDock(mode); });
      li.append(b); ul.append(li);
    }
    d.body.append(ul);
    const rb = dockBtn.getBoundingClientRect(), mr = ul.getBoundingClientRect(), vw = d.defaultView.innerWidth;
    ul.style.left = Math.max(4, Math.min(rb.right - mr.width, vw - mr.width - 4)) + 'px'; ul.style.top = (rb.bottom + 2) + 'px';
    const its = [...ul.querySelectorAll('[role^="menuitem"]')];
    ul.addEventListener('keydown', (ev) => {
      const i = its.indexOf(d.activeElement);
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); dclose(); dockBtn.focus(); }
      else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); its[(i + (ev.key === 'ArrowDown' ? 1 : -1) + its.length) % its.length]?.focus(); }
    });
    const away = (ev) => { if (!ul.contains(ev.target) && !dockBtn.contains(ev.target)) dclose(); };
    d.addEventListener('pointerdown', away, true);
    dmenu = { ul, d, away }; dockBtn.setAttribute('aria-expanded', 'true'); its[0]?.focus();
  });
  // drag the grip: a docked panel comes loose and floats; a floating one moves
  const handle = panel.querySelector('[data-problems-handle]');
  handle?.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || dock === 'window' || matchMedia('(max-width: 760px)').matches) return;
    const r0 = panel.getBoundingClientRect(), dx = e.clientX - r0.left, dy = e.clientY - r0.top;
    let moved = false;
    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 4) return;
      if (!moved) { moved = true; if (dock !== 'float') { prefs.float = { x: r0.left, y: r0.top, w: r0.width, h: r0.height }; dock = 'float'; place(); } }
      const f = fit({ ...prefs.float, x: ev.clientX - dx, y: ev.clientY - dy });
      panel.style.left = f.x + 'px'; panel.style.top = f.y + 'px';
      prefs.float = { ...prefs.float, x: f.x, y: f.y };
    };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); if (moved) { prefs.dock = 'float'; savePrefs(); } };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  });
  // the corner resizes a floating panel (CSS resize); keep its size
  new ResizeObserver(() => {
    if (dock !== 'float' || panel.hidden) return;
    const r = panel.getBoundingClientRect();
    if (prefs.float && Math.abs((prefs.float.w || 0) - r.width) < 1 && Math.abs((prefs.float.h || 0) - r.height) < 1) return;
    prefs.float = { ...(prefs.float || {}), w: r.width, h: r.height }; savePrefs();
  }).observe(panel);
  addEventListener('resize', () => { if (!panel.hidden) place(); });

  // ---- open / close, keys ----
  function open(o = {}) {
    if (o.about !== undefined) aboutFilter = o.about;
    if (panel.hidden) lastFocus = document.activeElement;
    panel.hidden = false; btn.setAttribute('aria-expanded', 'true');
    place();
    paint();
    if (o.focus !== false) (list.querySelector('.ccp-main') || search).focus();
    if (o.id) { list.querySelector('[data-problem="' + CSS.escape(o.id) + '"]')?.scrollIntoView({ block: 'nearest' }); show(o.id); }
  }
  function close() {
    if (panel.hidden) return;
    if (dock === 'window' && win?.isOpen()) win.back();   // closing a window panel puts it back (docked right next time)
    panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); acceptingId = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); else btn.focus();
  }
  btn.addEventListener('click', () => (panel.hidden ? open() : close()));
  // an app's input registry with `view.problems` (owner 2026-10-26: rebindable): once a style gives it other keys, Ctrl+Shift+M is the style's
  const rebound = () => { const ci = window.ccInput; return !!(ci && ci.commands?.some?.((c) => c.id === 'view.problems') && !ci.keysOf('view.problems').some((k) => /(shift\+|⇧)m$/i.test(String(k).replace(/\s+/g, '')))); };
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && (e.key === 'M' || e.key === 'm' || e.code === 'KeyM') && store.sources().length && !rebound()) {
      e.preventDefault(); e.stopPropagation();
      if (panel.hidden) open(); else (list.querySelector('.ccp-main') || search).focus();
    }
  }, true);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (acceptingId) { acceptingId = ''; renderList(); } else close(); return; }
    if (!e.target.classList?.contains('ccp-main')) return;
    const rows = [...list.querySelectorAll('.ccp-main')], i = rows.indexOf(e.target);
    const go = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? rows.length - 1 : null;
    if (go === null) return;
    e.preventDefault();
    rows[Math.max(0, Math.min(rows.length - 1, go))]?.focus();
  });
  search.addEventListener('input', () => { words = search.value; renderList(); });
  for (const b of sevBtns) b.addEventListener('click', () => {
    const s = b.dataset.problemsSev, on = prefs.sev.includes(s);
    prefs.sev = on ? prefs.sev.filter((x) => x !== s) : [...prefs.sev, s];
    b.setAttribute('aria-pressed', on ? 'false' : 'true'); savePrefs(); renderList();
  });
  groupSel.addEventListener('change', () => { prefs.group = groupSel.value; savePrefs(); renderList(); });
  accChk.addEventListener('change', () => { prefs.accepted = accChk.checked; savePrefs(); renderList(); });
  mkChk.addEventListener('change', () => { prefs.markers = mkChk.checked; savePrefs(); drawMarkers(); });

  // ---- ⚠ on the drawing ----
  let layer = null, offView = null, mraf = 0;
  function setMarkers(m) {
    offView?.(); offView = null; layer?.remove(); layer = null; mk = null;
    if (!m || !m.stage || typeof m.toScreen !== 'function' || typeof m.anchor !== 'function') { later(); return; }
    mk = m;
    layer = h('div', { class: 'ccp-marks', 'data-problems-marks': true });
    if (getComputedStyle(m.stage).position === 'static') m.stage.style.position = 'relative';
    m.stage.append(layer);
    offView = typeof m.onView === 'function' ? m.onView(() => drawMarkers()) : null;
    later();
  }
  function drawMarkers() {
    if (!layer || mraf) return;
    mraf = requestAnimationFrame(() => {
      mraf = 0;
      if (!layer) return;
      if (prefs.markers === false) { layer.replaceChildren(); return; }
      const R = layer.getBoundingClientRect(), MAX = 300, cells = new Map();
      for (const p of store.list({ severity: prefs.sev, accepted: 'hide' })) {   // worst first, so the first in a cell is its worst
        let pt = null;
        try { pt = p.where?.at && p.where.space !== 'sheet' ? p.where.at : mk.anchor(p); } catch (e) { pt = null; }
        if (!pt) continue;
        const s = mk.toScreen(pt);
        if (!s || s.behind || !Number.isFinite(s.x) || s.x < -8 || s.y < -8 || s.x > R.width + 8 || s.y > R.height + 8) continue;
        const key = Math.round(s.x / 22) + ',' + Math.round(s.y / 22);   // close together = one marker with a count
        const c = cells.get(key);
        if (c) c.items.push(p); else if (cells.size < MAX) cells.set(key, { x: s.x, y: s.y, items: [p] });
      }
      layer.replaceChildren(...[...cells.values()].map((c) => {
        const p = c.items[0], n = c.items.length;
        const b = h('button', { type: 'button', class: 'ccp-mark ccp-mark-' + p.severity, 'data-problem-mark': p.id, style: `left:${c.x}px;top:${c.y}px`,
          title: words$(p) + (n > 1 ? ' (+' + (n - 1) + ')' : ''), 'aria-label': n > 1 ? T('shell.problems.mark.n', { n, first: words$(p) }) : words$(p) },
        h('i', { class: 'bi ' + ICON[p.severity], 'aria-hidden': 'true' }), n > 1 ? h('span', { class: 'ccp-mark-n', text: String(n) }) : null);
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          const same = c.items.every((q) => aboutKey(q.about[0]) === aboutKey(p.about[0]));
          if (n === 1) open({ id: p.id, about: '', focus: false });
          else open({ about: same && p.about[0] ? aboutKey(p.about[0]) : '', focus: true });
          if (n === 1) list.querySelector('[data-problem="' + CSS.escape(p.id) + '"] .ccp-main')?.focus();
        });
        return b;
      }));
    });
  }

  // ---- the check report (REG.1d) and CSV ----
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stem = () => String(adapter.file?.() || cfg.appName || slug).replace(/\.[a-z0-9]{1,8}$/i, '').replace(/[\\/:*?"<>|]+/g, ' ').trim() || slug;
  function report() {
    let packs = [];
    try { packs = adapter.packs?.() || []; } catch (e) { packs = []; }
    return store.report({ title: stem(), file: adapter.file?.() || '', packs, t: tMsg });
  }
  const csvHead = () => ['severity', 'status', 'problem', 'about', 'source', 'check', 'pack', 'clause', 'required', 'found', 'by', 'reason', 'date', 'id'].map((k) => T('shell.problems.col.' + k));
  function csv() {
    const r = report();
    r.rows = r.rows.map((x) => ({ ...x, severity: sevLabel(x.severity, x.sourceKind), status: T('shell.problems.status.' + x.status), sourceKind: T('shell.problems.kind.' + x.sourceKind) }));
    // a regulation involved: the approved line, then its footnote as the very last line (owner 2026-10-26)
    return toCsv(r, csvHead(), { notes: [...setLines(r), ...(r.notLegalAdvice ? [T('shell.problems.report.legal'), T('shell.problems.report.norep')] : [])] });
  }
  // 0.7.1 71.25: what the model was checked against (an IDS): its title, version, author, date, then each specification's result
  const setHead = (c) => T('shell.problems.report.set.' + c.kind, { title: c.title || c.file || '' });
  const setMeta = (c) => [c.version && T('shell.problems.report.set.version', { v: c.version }), c.author && T('shell.problems.report.set.author', { who: c.author }), c.date, c.file && c.file !== c.title && c.file, c.schema].filter(Boolean).join(', ');
  const specLine = (s) => T('shell.problems.report.set.spec', { name: s.name, result: T('shell.problems.report.set.' + s.status), applicable: s.applicable, passed: s.passed, failed: s.failed });
  const setLines = (r) => (r.checkSets || []).flatMap((c) => [setHead(c) + (setMeta(c) ? ' (' + setMeta(c) + ')' : '') + ': ' + T('shell.problems.report.set.sum', { pass: c.counts.pass, fail: c.counts.fail }), ...c.specs.map(specLine)]);
  function reportHtml(r) {
    const head = csvHead();
    const rows = r.rows.map((x) => '<tr class="s-' + esc(x.severity) + '"><td>' + esc(sevLabel(x.severity, x.sourceKind)) + '</td><td>' + esc(T('shell.problems.status.' + x.status)) + '</td><td>' + esc(x.message) + '</td><td>' + esc(x.about) + '</td><td>'
      + esc(T('shell.problems.kind.' + x.sourceKind)) + '<br>' + esc(x.check) + '</td><td>' + esc(x.pack) + (x.clause ? '<br>' + esc(x.clause) : '') + (x.from && x.from !== x.pack ? '<br><small>' + esc(x.from) + '</small>' : '') + '</td><td>'
      + esc(fmtVal(x.required)) + '</td><td>' + esc(fmtVal(x.found)) + '</td><td>' + (x.acceptedBy || x.reason ? esc([x.acceptedBy, x.acceptedOn].filter(Boolean).join(', ')) + '<br>' + esc(x.reason) : '') + '</td></tr>').join('\n');
    const packs = r.packs.length ? '<h2>' + esc(T('shell.problems.report.packs')) + '</h2><ul>' + r.packs.map((p) => '<li>' + esc([p.name || p.id, p.edition, p.version && '(' + p.version + ')', p.jurisdiction, p.review && T('shell.problems.report.review', { state: p.review })].filter(Boolean).join(', ')) + '</li>').join('') + '</ul>' : '';
    const sets = (r.checkSets || []).map((c) => '<section data-report-set="' + esc(c.kind) + '"><h2>' + esc(setHead(c)) + '</h2>' + (setMeta(c) ? '<p class="meta">' + esc(setMeta(c)) + '</p>' : '')
      + '<p>' + esc(T('shell.problems.report.set.sum', { pass: c.counts.pass, fail: c.counts.fail })) + '</p><table><thead><tr>' + ['spec', 'result', 'applicable', 'passed', 'failed'].map((k) => '<th>' + esc(T('shell.problems.report.set.col.' + k)) + '</th>').join('') + '</tr></thead><tbody>'
      + c.specs.map((s) => '<tr class="s-' + (s.status === 'pass' ? 'pass' : 'error') + '"><td>' + esc(s.name) + '</td><td>' + esc(T('shell.problems.report.set.' + s.status)) + '</td><td>' + s.applicable + '</td><td>' + s.passed + '</td><td>' + s.failed + '</td></tr>').join('') + '</tbody></table></section>').join('');
    return '<!doctype html><html lang="' + esc(document.documentElement.lang || 'en') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + esc(T('shell.problems.report.title') + ': ' + r.title) + '</title>'
      + '<style>body{font:15px/1.45 system-ui,sans-serif;color:#111;background:#fff;margin:2rem}h1{font-size:1.5rem;margin:0 0 .25rem}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #999;padding:.3rem .45rem;text-align:left;vertical-align:top}th{background:#eee}.legal{border-left:4px solid #8A6200;padding:.4rem .75rem;margin:1rem 0}.s-error td:first-child{color:#B3122E;font-weight:700}.meta{color:#444}.foot{margin-top:1.5rem;font-size:12px;color:#444}</style></head><body>'
      + '<h1>' + esc(T('shell.problems.report.title')) + ': ' + esc(r.title) + '</h1><p class="meta">' + esc(T('shell.problems.report.made', { date: r.made.slice(0, 16).replace('T', ' '), app: cfg.appName || slug })) + '. ' + esc(T('shell.problems.sum', { errors: r.counts.error, warnings: r.counts.warning, notes: r.counts.note })) + (r.counts.accepted ? '; ' + esc(T('shell.problems.accepted.n', { n: r.counts.accepted })) : '') + '</p>'
      + (r.notLegalAdvice ? '<p class="legal">' + esc(T('shell.problems.report.legal')) + '</p>' : '') + packs + sets + (sets ? '<h2>' + esc(T('shell.problems.title')) + '</h2>' : '')
      + '<table><thead><tr>' + [head[0], head[1], head[2], head[3], head[4], head[6], head[8], head[9], head[10]].map((x) => '<th>' + esc(x) + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table>'
      + (r.notLegalAdvice ? '<p class="foot" data-report-footnote>' + esc(T('shell.problems.report.norep')) + '</p>' : '') + '</body></html>';
  }
  const save = (text, name, type) => {
    const a = h('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const downloadReport = () => save(reportHtml(report()), stem() + ' - ' + T('shell.problems.report.file') + '.html', 'text/html');
  /** The check report as a PDF (0.8 P.7; problems-pdf.js). Add-ons and the regulation part (REG.1d) add sections through ccProblems.reportSection(fn). */
  const pdfSections = new Set();
  function pdfBytes() {
    const r = report();
    const cnt = r.counts;
    const L = {
      title: T('shell.problems.report.title'), made: T('shell.problems.report.made', { date: r.made.slice(0, 16).replace('T', ' '), app: cfg.appName || slug }),
      counts: T('shell.problems.sum', { errors: cnt.error, warnings: cnt.warning, notes: cnt.note }) + (cnt.accepted ? '; ' + T('shell.problems.accepted.n', { n: cnt.accepted }) : ''),
      legal: T('shell.problems.report.legal'), norep: T('shell.problems.report.norep'), packs: T('shell.problems.report.packs'),
      packLine: (p) => [p.name || p.id, p.edition, p.version && '(' + p.version + ')', p.jurisdiction, p.review && T('shell.problems.report.review', { state: p.review })].filter(Boolean).join(', '),
      setLines: setLines(r), none: T('shell.problems.report.none'), page: (n, total) => T('shell.problems.report.page', { n, total }),
      sev: (x) => sevLabel(x.severity, x.sourceKind), status: (x) => T('shell.problems.status.' + x.status),
      required: (x) => valueText(x.required), found: (x) => valueText(x.found),
      accepted: (x) => [T('shell.problems.col.by') + ': ' + x.acceptedBy, x.acceptedOn, x.reason].filter(Boolean).join(' · '),
      col: { about: T('shell.problems.col.about'), source: T('shell.problems.col.source'), clause: T('shell.problems.col.clause'), required: T('shell.problems.col.required'), found: T('shell.problems.col.found') },
    };
    const sections = [];
    for (const fn of pdfSections) { try { const s = fn(r); if (s && s.heading) sections.push(s); } catch (e) { /* a section that fails leaves itself out */ } }
    return reportPdf(r, L, { sections });
  }
  const downloadPdf = () => save(pdfBytes(), stem() + ' - ' + T('shell.problems.report.file') + '.pdf', 'application/pdf');
  const downloadCsv = () => save('﻿' + csv(), stem() + ' - ' + T('shell.problems.report.file') + '.csv', 'text/csv');

  store.on((e) => { if (e.type === 'change' && !panel.hidden) { const c = store.counts(); say(T('shell.problems.sum', { errors: c.error, warnings: c.warning, notes: c.note })); } later(); });

  window.ccProblems = {
    store,
    source: (def) => store.source(def),
    adapter(a) { adapter = a && typeof a === 'object' ? a : {}; later(); },
    markers: (m) => setMarkers(m),
    redraw: () => drawMarkers(),
    open, close, toggle: () => (panel.hidden ? open() : close()), show,
    dock: (mode) => (mode === undefined ? dock : setDock(mode)),
    report: () => report(), csv: () => csv(), reportHtml: () => reportHtml(report()), reportPdf: () => pdfBytes(),
    /** An add-on's or REG.1d's own section in the PDF report: fn(report) → { heading, lines: [string | { text, bold }] } | null. → off() */
    reportSection(fn) { pdfSections.add(fn); return () => pdfSections.delete(fn); },
    /** The assistants' tools (spec § 8) for an app's host.control: every dev/agents.js with Problems calls `ccProblems.registerTools(C)` (0.8 P.5).
     *  opts.skip = tool names the app keeps its own version of (DetailCraft's older problems_list keeps its rows), opts.step = the app's undo hook. */
    tools: (opts = {}) => problemTools({ store, show, report: () => report(), csv: () => csv(), t: tMsg, step: opts.step }),
    registerTools(control, opts = {}) {
      const skip = new Set(opts.skip || []);
      const offs = [];
      for (const def of window.ccProblems.tools(opts)) if (!skip.has(def.name)) offs.push(control.tool(def));
      return () => offs.forEach((f) => f && f());
    },
  };
  window.ccPalette?.register?.([{ id: 'cc-problems-open', label: T('shell.problems.palette'), group: T('shell.problems.title'), keywords: 'warnings errors check regulations', key: 'Ctrl+Shift+M', run: () => open() }]);
  document.dispatchEvent(new CustomEvent('cc-problems-ready'));
  later();
}
