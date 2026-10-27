/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCommands, shortcutCommand, createDrawingTabs } from '../../../app/workspace/commands.js';
import fs from 'node:fs';
import { init, t } from '../../../app/i18n.js';
init({ strings: JSON.parse(fs.readFileSync(new URL('../../../app/lang/en.json', import.meta.url))) });
import { availability } from '../../../app/workspace/availability.js';
const valid = () => ({ document: {}, busy: false, dirty: true, canUndo: true, canRedo: true, selection: [42], levels: [{ guid: 'storey-1' }], view: { id: 'plan:storey-1', kind: 'plan' }, settings: {} });
test('quick access, ribbon and shortcuts can share exactly one action and live enablement', () => {
  const s = valid(); let executions = 0, reason;
  const commands = createCommands({ t, state: () => s, actions: { save: () => ++executions }, explain: v => reason = v });
  assert.equal(commands.execute('save'), 1);
  s.busy = true; assert.equal(commands.execute('save'), false); assert.match(reason, /Wait/); assert.equal(executions, 1);
  s.busy = false; s.dirty = false; assert.equal(commands.describe('save').enabled, false);
  s.dirty = true; s.document = null; assert.equal(commands.execute('save'), false); assert.equal(executions, 1);
});
test('selection, view type, undo history and template restrictions have distinct reasons', () => {
  const s = valid(), actions = Object.fromEntries(['range','detail','scale','undo','redo','clear'].map(id => [id, () => {}]));
  const c = createCommands({ t, state: () => s, actions });
  assert.equal(c.describe('range').enabled, true); s.view.kind = '3d'; assert.match(c.describe('range').reason, /3D/);
  s.view.kind = 'plan'; s.settings.template = 'Plans'; assert.equal(c.describe('detail').reason, t('ws.why.template', { name: 'Plans' }));
  assert.equal(c.describe('range').enabled, true);
  s.canRedo = false; s.canUndo = false; s.selection = [];
  assert.match(c.describe('undo').reason, /nothing to undo/); assert.match(c.describe('redo').reason, /nothing to redo/); assert.match(c.describe('clear').reason, /No element/);
});
test('shortcuts respect typing, contenteditable, dialogs, modifiers and prior cancellation', () => {
  const e = { key: 'z', ctrlKey: true, target: { closest: () => null } };
  assert.equal(shortcutCommand(e), 'undo'); assert.equal(shortcutCommand({ ...e, shiftKey: true }), 'redo');
  assert.equal(shortcutCommand({ ...e, key: 's' }), 'save');
  for (const target of ['input','textarea','select','contenteditable','dialog']) assert.equal(shortcutCommand({ ...e, target: { closest: () => target } }), null);
  assert.equal(shortcutCommand({ ...e, defaultPrevented: true }), null); assert.equal(shortcutCommand({ ...e, altKey: true }), null);
  assert.equal(shortcutCommand({ ...e, key: 'c' }), null);
});
test('drawing closure and re-opening retain document ownership; a new editor resets tabs', () => {
  const t = createDrawingTabs(), doc = {}, other = {};
  assert.equal(t.reset(doc), true); t.open({ id: '3d', kind: '3d' }); t.open({ id: 'plan:g1', kind: 'plan', guid: 'g1' });
  assert.equal(t.all.length, 2); assert.equal(t.reset(doc), false); assert.equal(t.all.length, 2);
  assert.equal(t.close('plan:g1').id, '3d'); assert.equal(t.close('3d'), null); assert.equal(t.reset(doc), false);
  t.open({ id: '3d' }); assert.equal(t.reset(other), true); assert.equal(t.all.length, 0);
});
test('scope evidence never auto-enables inherited, planned, audit or uncertain commands', () => {
  const s = valid(), c = createCommands({ t, state: () => s, actions: {} });
  assert.match(availability('copy', c, s).reason, /Wall Copy is not supported/);
  assert.equal(availability('assembly', c, s).reason, t('ws.why.notbuilt'));
  assert.match(availability('attach', c, s).reason, /F13/);
  assert.match(availability('modelline', c, s).reason, /Mapping uncertain/);
  assert.equal(availability('curtain', c, s).reason, 'Not currently on the roadmap — decision needed.');
  for (const id of ['copy', 'assembly', 'attach', 'modelline', 'curtain']) assert.equal(availability(id, c, s).enabled, false);
});
