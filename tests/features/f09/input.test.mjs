/* SPDX-License-Identifier: Apache-2.0 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { KeyMatcher, conflicts, readState, resolve, eventCombo } from '../../../devshell/site/assets/js/app-input.js';
import * as reg from '../../../app/input-bimcraft.js';
import { shortcutCommand } from '../../../app/workspace/commands.js';
const event = (key, extras = {}) => ({ key, target: { closest: () => null }, ...extras });
test('ribbon prefixes wait; each familiar sequence executes exactly one correct semantic command', () => {
  const matcher = new KeyMatcher(reg.STYLES.ribbon, reg.COMMANDS);
  for (const [keys, id] of Object.entries({ WA:'model.wall', WN:'model.window', DR:'model.door', DI:'model.dimension', DL:'model.detail-line', MV:'model.move', CO:'model.copy', CC:'model.copy', RO:'model.rotate', AL:'model.align', TR:'model.trim', PP:'app.properties', KS:'app.shortcuts', VG:'view.graphics', VV:'view.graphics' })) {
    assert.deepEqual(matcher.press(keys[0]), { wait: keys[0] });
    assert.deepEqual(matcher.press(keys[1]), { run: id });
    assert.deepEqual(matcher.buf, []);
  }
  assert.deepEqual(conflicts(reg.STYLES.ribbon, reg.COMMANDS), []);
  assert.deepEqual(matcher.press('Ctrl+C'), { native: 'edit.copy' });
  assert.deepEqual(matcher.press('S'), { wait: 'S' });
  assert.deepEqual(matcher.press('C'), { run: 'view.section' }); // SC is intentionally not stolen for a snap override.
});
test('all existing profiles/IDs and custom saved DI binding remain intact; only builtin ribbon meaning changes', () => {
  assert.deepEqual(reg.STYLE_ORDER, ['cadcraft','home','ribbon','drafting','viewer']);
  assert.deepEqual(reg.STYLES.cadcraft.keys['model.wall'], ['W']);
  const custom = { ...reg.STYLES.ribbon, id:'my-1', base:'ribbon', name:'My keys', keys:{'view.dims':['D I'], 'model.wall':['Q Q']} };
  const restored = readState(JSON.stringify({style:'my-1',custom:[custom]}), reg);
  assert.equal(restored.style, 'my-1');
  assert.deepEqual(resolve(restored.custom[0], reg.STYLES).keys, custom.keys);
  assert.ok(reg.COMMANDS.some(c => c.id === 'view.dims'));
  const matcher = new KeyMatcher(reg.STYLES.ribbon, reg.COMMANDS);
  matcher.press('W'); matcher.reset(); assert.deepEqual(matcher.press('A'), {wait:'A'}); matcher.reset();
  matcher.press('W'); assert.deepEqual(matcher.press('D'), { wait:'D' });
  assert.deepEqual(matcher.press('I'), {run:'model.dimension'});
});
test('workspace native routing never consumes text Undo, composition, repeat or OS modifiers', () => {
  for (const extras of [{target:{closest:()=>true}}, {isComposing:true}, {repeat:true}, {altKey:true}, {defaultPrevented:true}])
    assert.equal(shortcutCommand(event('z',{ctrlKey:true,...extras}), {live:true}), null);
  assert.equal(shortcutCommand(event('z',{metaKey:true})), 'undo');
  assert.equal(shortcutCommand(event('w'),{live:true}), 'wall');
  assert.equal(eventCombo(event('Dead')), null);
  // Physical-key behavior is inherited, including translated keyboards; no new layout-dependent engine.
  assert.equal(eventCombo(event('z',{code:'KeyW'})), 'W');
});
