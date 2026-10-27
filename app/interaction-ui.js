/* SPDX-License-Identifier: Apache-2.0 */
import { el } from './ui-util.js';
import { WALL_REFERENCES } from './wall-dimensions.js';
import { targetCandidateId } from './wall-targets.js';
import { snapPoint } from './model-tools.js';
import { captureInteraction, sameInteraction } from './interaction-context.js';

/** F09 owns only plan interaction. Commands still belong to the input registry/domain adapters. */
export function mountInteractions(A) {
  const t = k => A.t('f09.' + k), label = ref => A.t('dimension.ref.' + ref.toLowerCase());
  let session = [], mode = 'existing', candidate = null, menu = null, owner = null, lastPointer = null, picked = '', choicesKey = '';
  const canvas = A.root.querySelector('[data-plan-canvas]');
  const select = el('select', { 'data-f09-target': '', 'aria-label': t('target') },
    ...['existing', 'off', ...WALL_REFERENCES].map(v => el('option', { value: v }, WALL_REFERENCES.includes(v) ? label(v) : t(v))));
  const choices = el('select', { 'data-f09-candidates': '', 'aria-label': t('candidates'), hidden: true });
  choices.addEventListener('change', () => { picked = choices.value; if (lastPointer) { A.previewInteraction(lastPointer); } });
  const feedback = el('span', { 'data-f09-feedback': '', role: 'status', 'aria-live': 'polite' });
  const controls = el('div', { 'data-f09-controls': '', className: 'bc-f09-controls' },
    el('label', {}, t('target') + ' ', select),
    el('button', { type: 'button', 'data-f09-properties': '', onClick: properties }, t('properties')),
    el('button', { type: 'button', 'data-f09-shortcuts': '', onClick: help }, t('shortcuts')), choices, feedback);
  canvas.parentElement.append(controls);
  const style = el('style', {}, '.bc-f09-controls{position:absolute;bottom:2.6rem;left:.5rem;z-index:5;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;max-width:calc(100% - 1rem);padding:.4rem .6rem;background:var(--sheet,#fff);color:var(--ink,#222);border:1px solid var(--line,#aaa);border-radius:.3rem;font:12px system-ui}.bc-f09-controls select{max-width:15rem}.bc-f09-menu{position:fixed;z-index:10050;background:var(--sheet,#fff);color:var(--ink,#222);box-shadow:0 4px 20px #0004;border:1px solid var(--line,#aaa);padding:.3rem;max-width:min(25rem,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto}.bc-f09-menu button{display:block;text-align:left;width:100%;padding:.45rem}.bc-f09-menu [aria-disabled="true"]{opacity:.65}.bc-f09-menu small{display:block}.bc-f09-help{max-width:45rem;max-height:80vh;overflow:auto}.bc-f09-help table{border-collapse:collapse;width:100%}.bc-f09-help td,.bc-f09-help th{padding:.4rem;border-bottom:1px solid #8885;text-align:left}');
  A.root.append(style);
  function sync() {
    const next = [A.ed(), A.S.level, A.S.kind, A.S.callout];
    if (next.some((value, i) => value !== session[i])) { reset(); session = next; }
  }
  function reset() { window.ccInput?.resetSequence(); picked = ''; choicesKey = ''; choices.hidden = true; mode = 'existing'; select.value = mode; candidate = null; feedback.textContent = ''; dismiss(false); }
  function properties() {
    A.renderProps();
    const field = A.root.querySelector('[data-mp-height]');
    if (field && field.getClientRects().length) { field.scrollIntoView({ block: 'nearest' }); field.focus(); }
    else A.host.status(t('selectwall'), true);
  }
  function help() {
    const input = window.ccInput, p = input?.current();
    const dlg = el('dialog', { className: 'bc-dialog bc-f09-help', 'aria-label': t('shortcuts') },
      el('h2', {}, t('shortcuts')), el('p', {}, t('keyhelp')), el('p', {}, t('snaphelp')));
    const table = el('table', {}, el('thead', {}, el('tr', {}, ...['keys', 'command', 'availability'].map(k => el('th', { scope: 'col' }, t(k))))));
    const body = el('tbody');
    for (const c of input?.commands || []) {
      const keys = input.keysOf(c.id); if (!keys.length) continue;
      body.append(el('tr', {}, el('td', {}, keys.join(' / ')), el('td', {}, A.t(c.label)), el('td', {}, input.why(c.id) || t('available'))));
    }
    table.append(body); dlg.append(table);
    if (p?.id !== 'ribbon') dlg.append(el('button', { type: 'button', 'data-f09-use-ribbon': '', onClick: () => { input.setStyle('ribbon'); dlg.close(); } }, t('useRibbon')));
    dlg.append(el('button', { type: 'button', onClick: () => dlg.close() }, t('close')));
    dlg.addEventListener('close', () => { dlg.remove(); canvas.focus(); });
    A.root.append(dlg); dlg.showModal();
  }
  select.addEventListener('change', () => { mode = select.value; picked = ''; choicesKey = ''; choices.hidden = true; candidate = null; feedback.textContent = mode === 'existing' ? '' : t('temporary'); A.drawOverlay(); });
  function dismiss(restore = true) {
    if (!menu) return;
    const focus = owner; menu.remove(); menu = null; owner = null;
    if (restore && focus?.isConnected) focus.focus({ preventScroll: true });
  }
  function open(p, e) {
    sync();
    if (!A.S.on || !A.ed() || A.S.busy || A.S.reloading || A.S.queue.length) return;
    dismiss(false); window.ccInput?.resetSequence();
    candidate = null; // context opening must not commit a pointer preview
    const token = captureInteraction(A), selection = token.selection;
    const key = e.key ? null : A.pv()?.hit(e.clientX, e.clientY);
    const wall = A.S.data?.walls.find(w => A.kb() + w.id === key);
    owner = document.activeElement === document.body ? canvas : document.activeElement;
    menu = el('div', { role: 'menu', 'aria-label': t('context'), className: 'bc-f09-menu', 'data-f09-menu': '' });
    const add = (text, command, local, reason = '') => {
      const why = reason || (command ? window.ccInput?.why(command) || (!window.ccInput ? t('notready') : '') : '');
      const button = el('button', { type: 'button', role: 'menuitem', 'aria-disabled': String(!!why), title: why }, text);
      if (why) button.append(el('small', {}, why));
      button.addEventListener('click', () => {
        if (!sameInteraction(A, token)) { dismiss(false); A.host.status(t('stale'), true); return; }
        const currentReason = command ? window.ccInput?.why(command) : why;
        if (currentReason) { A.host.status(currentReason, true); return; }
        dismiss();
        if (local) local(); else window.ccInput?.run(command, () => { const valid = sameInteraction(A, token); if (!valid) A.host.status(t('stale'), true); return valid; });
      }); menu.append(button);
    };
    if (A.S.tool !== 'select' || A.S.drag || A.S.chain) {
      add(t('cancel'), null, () => A.cancelInteraction());
      add(t('shortcuts'), 'app.shortcuts');
    } else if (wall && !selection.includes(key)) {
      add(t('selectpointed'), null, () => A.host.select([key]));
    } else if (selection.length) {
      add(t('properties'), 'app.properties', null, A.wallsPicked().length === 1 && selection.length === 1 ? '' : t('onewall'));
      add(t('clear'), 'edit.select-none');
    } else {
      add(t('wall'), 'model.wall');
      add(t('fit'), 'view.planfit');
      add(t('shortcuts'), 'app.shortcuts');
    }
    A.root.append(menu);
    const r = canvas.getBoundingClientRect(), x = e.key ? r.left + r.width / 2 : e.clientX, y = e.key ? r.top + r.height / 2 : e.clientY;
    const box = menu.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(x, innerWidth - box.width - 8)) + 'px';
    menu.style.top = Math.max(8, Math.min(y, innerHeight - box.height - 8)) + 'px';
    menu.querySelector('button')?.focus();
  }
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', t('drawing'));
  canvas.addEventListener('pointermove', e => { lastPointer = A.pv()?.toPlan(e.clientX, e.clientY); });
  canvas.addEventListener('keydown', e => {
    if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); e.stopPropagation(); open(lastPointer, e); }
  });
  window.addEventListener('keydown', e => {
    if (e.isComposing) return;
    if ((e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) && e.target === canvas) { e.preventDefault(); e.stopImmediatePropagation(); open(lastPointer, e); return; }
    if (e.key === 'Escape') {
      if (menu) { reset(); e.preventDefault(); e.stopImmediatePropagation(); canvas.focus(); A.drawOverlay(); return; }
      if (A.S.drag) { reset(); A.cancelInteraction(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      if (mode !== 'existing') { reset(); A.drawOverlay(); }
    }
    if (!menu) return;
    if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); e.stopImmediatePropagation(); dismiss(); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopImmediatePropagation(); document.activeElement?.click(); return; }
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']; if (!keys.includes(e.key)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const items = [...menu.querySelectorAll('button')], i = items.indexOf(document.activeElement);
    items[e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
  }, true);
  document.addEventListener('pointerdown', e => { if (menu && !menu.contains(e.target)) dismiss(false); }, true);
  window.addEventListener('blur', () => { reset(); A.cancelInteraction(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { reset(); A.cancelInteraction(); } });
  return {
    open, reset, sync, active: () => mode !== 'existing',
    snap(p, walls) {
      sync();
      candidate = null;
      if (mode === 'existing') return null;
      if (mode === 'off') { feedback.textContent = t('off'); return snapPoint(p, {}, { enabled: false }); }
      if (A.S.busy || A.S.reloading || A.S.queue.length) return { p: [...p], kind: 'free', ambiguous: true };
      const result = snapPoint(p, { walls }, { tol: A.pv().pxToMm(12), reference: mode, candidateId: picked });
      const candidates = result.candidates, id = targetCandidateId;
      const key = candidates.map(id).join('|');
      if (key !== choicesKey) {
        choicesKey = key;
        if (!candidates.some(c => id(c) === picked)) picked = '';
        choices.replaceChildren(el('option', { value: '' }, t('choosecandidate')),
          ...candidates.map(c => el('option', { value: id(c) }, label(mode) + ' · ' + c.reference.wall.slice(-6) + ' · ' + t(c.kind))));
        choices.value = picked;
      }
      choices.hidden = candidates.length < 2;
      candidate = result.reference ? result : null;
      if (result.ambiguous) {
        feedback.textContent = t('choosecandidate');
        return { p: [...p], kind: 'free', ambiguous: true };
      }
      feedback.textContent = candidate ? label(mode) + ' · ' + t('analytic') + (candidates.length > 1 ? ' · ' + t('nearby') : '') : t('nocandidate');
      return result;
    },
    overlay(o) {
      sync();
      if (!candidate) return;
      o.lines.push([...candidate.segment[0], ...candidate.segment[1]]);
      o.hud = { p: candidate.p, text: label(candidate.reference.reference) + ' · ' + t('analytic') };
    },
  };
}
