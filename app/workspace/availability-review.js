/* SPDX-License-Identifier: Apache-2.0 */
import { reviewCatalog as catalog } from './catalog-review.js';
export function reviewAvailability(id, commands, state) {
  if (commands.ids.includes(id)) return commands.describe(id);
  const tool = catalog.tools[id];
  if (!tool) return { enabled: false, reason: 'This action has not been verified for this workspace slice.' };
  let reason;
  if (tool.status === 'unmapped') reason = 'Not currently on the roadmap — decision needed.';
  else if (tool.status === 'uncertain') reason = 'Mapping uncertain — unavailable pending review. ' + tool.scope;
  else if (id === 'copy' && state.selection.length) reason = 'Wall Copy is not supported in the authored-wall paths. General clipboard support does not enable wall Copy. Scope to be verified in F09 (audit, not a delivery promise).';
  else if (tool.status === 'planned') reason = tool.scope;
  else reason = 'Not wired in this workspace slice. Use the established layout for supported actions. ' + tool.scope;
  if (tool.feature) {
    const f = catalog.features[tool.feature];
    reason += ' ' + tool.feature + ' — ' + (f?.title || 'Mapping requires review') + '.';
    if (['F09', 'F24'].includes(tool.feature)) reason += ' Scope to be verified in ' + tool.feature + '; this is an audit, not a delivery promise.';
  }
  return { enabled: false, reason, status: tool.status, evidence: tool.evidence };
}
