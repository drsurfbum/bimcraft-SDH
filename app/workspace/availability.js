/* SPDX-License-Identifier: Apache-2.0 */
import { ENGINE, engineWhy } from './engine.js';
import { reviewAvailability } from './availability-review.js';
/**
 * Can ribbon tool `id` run now, and if not, why (in words for the person). Doc's own commands (commands.js) answer for
 * themselves; a tool BimCraft has (engine.js) asks the app's own button; anything else is not built yet.
 * ctx = { root, t } (the app root and its text function).
 */
export function availability(id, commands, state, context) {
  if (!context) return reviewAvailability(id, commands, state);
  const { root, t } = context;
  if (id === 'copy' && state.selection?.length && state.wall?.supported) return { enabled: false, reason: t('ws.why.wallcopy') };
  if (commands.ids.includes(id)) return commands.describe(id);
  const spec = ENGINE[id];
  if (spec) { const why = engineWhy(root, spec, state, t); return { enabled: !why, reason: why }; }
  return { enabled: false, reason: t('ws.why.notbuilt') };
}
