/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — project journal protocol. */
import { makeUndoReporter } from './undo-report.js';

/** Studio can undo only the exact observed editor/stack. Depth alone aliases project switches. */
export function mountUndoHook({ changes, document = changes, undoOne, busy = () => false, win = typeof window !== 'undefined' ? window : null }) {
  const depth = () => changes().length;
  const post = (type, data) => { try { win?.dispatchEvent(new CustomEvent('cc-undo-report', { detail: { type, data } })); } catch {} };
  const capture = () => changes().map(entry => ({ entry, label: entry.label, kind: entry.kind }));
  const matches = (entries, expected) => entries.length === expected.length && expected.every((x, i) => entries[i] === x.entry && entries[i].label === x.label && entries[i].kind === x.kind);
  let owner = document(), saved = capture(), running = false;
  const remember = () => { owner = document(); saved = capture(); };
  const current = () => document() === owner && matches(changes(), saved);
  const labelOf = () => changes().at(-1)?.label || '';
  const rep = makeUndoReporter({ depth, post, label: labelOf, undoOne: () => {
    if (!current() || busy()) return;
    running = true;
    try { undoOne(); } finally { running = false; remember(); }
  } });
  const invalidate = () => { rep.invalidate(); remember(); };
  const onMessage = rep.onMessage;
  rep.onMessage = (type, data) => {
    if (!current()) invalidate();
    if (busy() && type === 'undo.run') return { ok: false, why: 'busy' };
    return onMessage(type, data);
  };
  const hook = {
    rep,
    settle() {
      const entries = changes();
      if (document() !== owner) { invalidate(); return; }
      if (!running && entries.length === saved.length + 1 && matches(entries.slice(0, -1), saved)) rep.stepDone(labelOf());
      else if (!running && !current()) rep.invalidate();
      remember();
    },
    undone() {
      if (!running) {
        if (document() === owner && matches(changes(), saved.slice(0, -1))) rep.undone();
        else rep.invalidate();
      }
      remember();
    },
    redone() {
      if (document() === owner && changes().length === saved.length + 1 && matches(changes().slice(0, -1), saved)) rep.redone();
      else rep.invalidate();
      remember();
    },
  };
  if (win) win.ccUndoReporter = rep;
  return hook;
}
