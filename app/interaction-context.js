/* SPDX-License-Identifier: Apache-2.0 */
// A presentation token, not a history or transaction system. Native editor history remains authoritative.
import { documentHistoryState } from './material-wall-agent.js';
export function captureInteraction(A) {
  const ed = A.ed();
  return { ed, revision: ed ? documentHistoryState(ed).revision : null, keyBase: A.kb(),
    level: A.S.level, kind: A.S.kind, callout: A.S.callout, tool: A.S.tool, drag: A.S.drag,
    selection: A.selectedKeys().slice().sort((a, b) => a - b) };
}
export function sameInteraction(A, token) {
  if (!token?.ed || !A.S.on || A.ed() !== token.ed || A.S.busy || A.S.reloading || A.S.queue.length) return false;
  const now = captureInteraction(A);
  return now.revision === token.revision && now.keyBase === token.keyBase && now.level === token.level &&
    now.kind === token.kind && now.callout === token.callout && now.tool === token.tool && now.drag === token.drag &&
    JSON.stringify(now.selection) === JSON.stringify(token.selection);
}
