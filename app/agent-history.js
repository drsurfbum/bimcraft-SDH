/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: private live MCP history adapter and structured assistant results. */
import { bindDocument, documentHistoryState } from './material-wall-agent.js';

// Entries AND ownership labels are captured: length/top alone miss replacement or in-place relabelling.
const stack = entries => entries.map(entry => ({ entry, label: entry.label, kind: entry.kind }));
const matches = (entries, expected) => entries.length === expected.length && expected.every((x, i) => entries[i] === x.entry && entries[i].label === x.label && entries[i].kind === x.kind);
const snapshot = ed => ({ changes: stack(ed.changes), undone: stack(ed.undone), revision: documentHistoryState(ed).revision });
const stop = (code, message) => { throw Object.assign(new Error(message), { historyCode: code }); };

/** One request owns one editor. Application callbacks bracket the synchronous engine mutation with before/after;
 * the UI may then rebuild asynchronously. No history engine or document switching lives in this adapter. */
export function liveHistory({ ed, busy, settle, undo, redo }) {
  let running = false;
  return async (kind, args) => {
    if (running) throw new Error('Another assistant history request is busy.');
    const original = ed();
    if (!original) throw new Error('No IFC model.');
    if (busy()) throw new Error('Document is busy.');
    const bound = bindDocument(original, args);
    let expected = snapshot(original);
    const completed = [], requested = kind === 'undo' ? args.steps || 1 : 1;
    let unconfirmed = null;
    const check = () => {
      if (ed() !== original) stop('document_changed', 'The active document changed. Further history steps were refused.');
      if (!matches(original.changes, expected.changes) || !matches(original.undone, expected.undone) || documentHistoryState(original).revision !== expected.revision) stop('history_changed', 'History changed outside this request. Inspect it again before retrying.');
    };
    const ready = () => { check(); if (busy()) stop('busy', 'Document is busy. Further history steps were refused.'); };
    const result = stopped => ({ ...bound, ...documentHistoryState(original), [kind === 'undo' ? 'undone' : 'redone']: completed,
      requestedSteps: requested, completedSteps: completed.length, complete: !stopped && completed.length === requested,
      ...(unconfirmed ? { unconfirmedOriginalTransition: unconfirmed } : {}),
      ...(stopped ? { stopped: { code: stopped.historyCode || 'history_failed', message: stopped.message }, error: stopped.message, isError: true } : {}) });
    running = true;
    try {
      for (let i = 0; i < requested; i++) {
        ready();
        // Even a presently idle settle yields. Recheck after it, not only at request entry.
        await settle(60000, check);
        ready();
        const before = expected, top = (kind === 'undo' ? original.changes : original.undone).at(-1);
        if (!top) stop('history_empty', 'There is no further step to ' + kind + '.');
        const label = top.label || top.kind;
        const ownership = () => {
          if (!args.any && !String(top.label || top.kind).startsWith('Assistant: ')) stop('person_owned', 'The next history step belongs to the person; any: true is required.');
        };
        ownership();
        let receipt = false;
        const transition = change => kind === 'undo'
          ? change === top && matches(original.changes, before.changes.slice(0, -1)) && matches(original.undone, [...before.undone, ...stack([top])])
          : !!change && original.changes.at(-1) === change && matches(original.changes.slice(0, -1), before.changes) && matches(original.undone, before.undone.slice(0, -1));
        const hooks = {
          before(current) {
            ready(); ownership();
            if (current !== original) stop('document_changed', 'History mutation targets a different editor.');
          },
          after(current, change) {
            if (current !== original || !transition(change)) stop('history_changed', 'The expected history transition did not occur.');
            completed.push(label); expected = snapshot(original); receipt = true;
          },
        };
        ready(); ownership();
        await (kind === 'undo' ? undo : redo)(hooks);
        if (!receipt) {
          // An obsolete/test callback cannot establish ownership. Surface an observed transition separately;
          // never credit a possibly unrelated Undo during an await to this request or claim rollback.
          if (transition(kind === 'undo' ? top : original.changes.at(-1))) unconfirmed = { direction: kind, labels: [label], steps: 1 };
          stop('history_unconfirmed', 'The application did not confirm a guarded history mutation. Further work stopped.');
        }
        check();
        await settle(60000, check);
        ready();
      }
      return result();
    } catch (e) { return result(e); }
    finally { running = false; }
  };
}
