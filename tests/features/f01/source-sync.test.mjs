/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { GROUPS, SYMBOLS } from '../../../app/res-elec-symbols.js';
import { verifyPinProvenance } from './pin-provenance.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const recordedPins = JSON.parse(fs.readFileSync(path.join(root, 'tests/tools/bimcraft-test/source-sync-pins.json'), 'utf8'));
test('pin provenance matches the recorded immutable Git revision', () => verifyPinProvenance(root, recordedPins));
test('rehashed asset cannot claim unchanged provenance', () => {
  const pins = structuredClone(recordedPins);
  pins.terrain.files['tin.js'] = '0'.repeat(64);
  assert.throws(() => verifyPinProvenance(root, pins), /Pin provenance mismatch/);
});
test('missing provenance history fails instead of skipping', () => {
  const pins = structuredClone(recordedPins);
  pins.provenance.revision = '0'.repeat(40);
  assert.throws(() => verifyPinProvenance(root, pins), /Cannot verify pin provenance/);
});
const groups = [
  { name: 'terrain', script: 'terrain-sync.mjs', source: 'civilcraft', files: ['tin.js', 'raster.js'] },
  { name: 'electrical', script: 'elec-sync.mjs', source: 'cadcraft', files: ['res-elec-symbols.js'] },
];
function harness(group, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f01-sync-'));
  try {
    const tool = path.join(dir, 'tools/bimcraft-test');
    const apps = path.join(dir, 'public_html/assets/apps');
    const app = path.join(apps, 'bimcraft/dev');
    const source = path.join(apps, group.source);
    fs.mkdirSync(tool, { recursive: true });
    fs.mkdirSync(path.join(app, 'lang'), { recursive: true });
    for (const f of [group.script, 'source-sync-pins.mjs', 'source-sync-pins.json', 'optional-dependency.mjs']) {
      fs.copyFileSync(path.join(root, 'tests/tools/bimcraft-test', f), path.join(tool, f));
    }
    for (const f of [...group.files, 'manifest.json', 'lang/en.json']) {
      fs.copyFileSync(path.join(root, 'app', f), path.join(app, f));
    }
    const run = (check = true) => {
      const result = spawnSync(process.execPath, [path.join(tool, group.script), ...(check ? ['--check'] : [])], { encoding: 'utf8' });
      return { ...result, output: result.stdout + result.stderr };
    };
    // These controlled source fixtures exercise comparator/generator behavior only.
    // They are not independent CivilCraft/CadCraft integration evidence.
    const installSource = () => {
      const dev = path.join(source, 'dev');
      fs.mkdirSync(dev, { recursive: true });
      if (group.name === 'terrain') fs.cpSync(app, dev, { recursive: true });
      else {
        const lib = path.join(dev, 'addons/electrical/lib');
        fs.mkdirSync(lib, { recursive: true });
        fs.writeFileSync(path.join(lib, 'install.js'), `export const INSTALL_GROUPS = ${JSON.stringify(GROUPS)};
export const INSTALL = ${JSON.stringify(SYMBOLS)}.map(({ents, ...s}) => ({...s, draw: () => ents}));\n`);
      }
      return dev;
    };
    fn({ app, source, run, installSource, pinFile: path.join(tool, 'source-sync-pins.json') });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
function fail(result, reason) {
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, reason);
  assert.doesNotMatch(result.output, /SKIP .* live source comparison/);
}
for (const group of groups) {
  test(`${group.name}: absent source verifies bundled assets and explicitly skips live parity`, () => harness(group, ({ run }) => {
    const r = run();
    assert.equal(r.status, 0, r.output);
    assert.match(r.stdout, /bundled integrity verified against c778c7ca3f83eeecc3e815078417f152b2ca7a94/);
    assert.match(r.stdout, /SKIP .* live source comparison/);
  }));
  for (const state of ['partial', 'file', 'dangling']) {
    test(`${group.name}: ${state} source app fails instead of skipping`, () => harness(group, ({ source, run }) => {
      if (state === 'partial') fs.mkdirSync(source);
      if (state === 'file') fs.writeFileSync(source, 'not a directory');
      if (state === 'dangling') fs.symlinkSync(path.join(source, 'missing'), source, 'dir');
      fail(run(), state === 'file' ? /not a directory/ : /ENOENT|ERR_MODULE_NOT_FOUND|ELOOP/);
    }));
  }
  test(`${group.name}: write mode cannot substitute pins for absent source`, () => harness(group, ({ app, run }) => {
    const before = group.files.map(f => fs.readFileSync(path.join(app, f)));
    fail(run(false), /ENOENT|ERR_MODULE_NOT_FOUND/);
    assert.deepEqual(group.files.map(f => fs.readFileSync(path.join(app, f))), before);
  }));
  test(`${group.name}: present matching source executes comparator/generator`, () => harness(group, ({ run, installSource }) => {
    installSource();
    const r = run();
    assert.equal(r.status, 0, r.output);
    assert.doesNotMatch(r.stdout, /SKIP/);
    assert.match(r.stdout, group.name === 'terrain' ? /terrain copies in step/ : /matches the Electrical add-on/);
  }));
  test(`${group.name}: present differing source fails comparison`, () => harness(group, ({ run, installSource }) => {
    const dev = installSource();
    if (group.name === 'terrain') fs.appendFileSync(path.join(dev, 'tin.js'), '\n// upstream changed\n');
    else fs.appendFileSync(path.join(dev, 'addons/electrical/lib/install.js'), '\nINSTALL[0].load += 1;\n');
    fail(run(), group.name === 'terrain' ? /differs from civilcraft/ : /not what the Electrical add-on gives/);
  }));
  test(`${group.name}: malformed source errors propagate`, () => harness(group, ({ run, installSource }) => {
    const dev = installSource();
    if (group.name === 'terrain') fs.writeFileSync(path.join(dev, 'manifest.json'), '{invalid');
    else fs.appendFileSync(path.join(dev, 'addons/electrical/lib/install.js'), "\nthrow new Error('F01 source failure');\n");
    fail(run(), group.name === 'terrain' ? /SyntaxError/ : /F01 source failure/);
  }));
  for (const file of group.files) for (const state of ['changed', 'missing']) {
    test(`${group.name}: ${state} bundled ${file} fails even without source`, () => harness(group, ({ app, run }) => {
      if (state === 'changed') fs.appendFileSync(path.join(app, file), '\n// drift\n');
      else fs.unlinkSync(path.join(app, file));
      fail(run(), state === 'changed' ? /differs from pinned revision/ : /ENOENT/);
    }));
  }
}
for (const state of ['mapping', 'missing-key', 'object-string', 'invalid-json']) {
  test(`terrain: invalid bundled ${state} fails`, () => harness(groups[0], ({ app, run }) => {
    const file = path.join(app, state === 'mapping' ? 'manifest.json' : 'lang/en.json');
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (state === 'mapping') value.imports.geotiff = '/wrong.js';
    if (state === 'missing-key') delete value['tin.badfaces'];
    if (state === 'object-string') value['tin.badfaces'] = '[object Object]';
    fs.writeFileSync(file, state === 'invalid-json' ? '{invalid' : JSON.stringify(value));
    fail(run(), /mapping differs|language key missing|Invalid terrain translation|object Object|SyntaxError/);
  }));
}

for (const state of ['empty-files', 'missing-imports', 'empty-imports', 'empty-keys', 'missing-key-pin', 'null-translation', 'empty-plural']) {
  test(`terrain: incomplete pin or translation ${state} cannot disable checks`, () => harness(groups[0], ({ app, pinFile, run }) => {
    const pins = JSON.parse(fs.readFileSync(pinFile, 'utf8'));
    const langFile = path.join(app, 'lang/en.json');
    const lang = JSON.parse(fs.readFileSync(langFile, 'utf8'));
    if (state === 'empty-files') { pins.terrain.files = {}; fs.appendFileSync(path.join(app, 'tin.js'), '\n// drift\n'); }
    if (state === 'missing-imports') delete pins.terrain.imports;
    if (state === 'empty-imports') pins.terrain.imports = {};
    if (state === 'empty-keys') pins.terrain.languageKeys = [];
    if (state === 'missing-key-pin') { pins.terrain.languageKeys = pins.terrain.languageKeys.filter(k => k !== 'tin.badfaces'); delete lang['tin.badfaces']; }
    if (state === 'null-translation') lang['tin.badfaces'] = null;
    if (state === 'empty-plural') lang['tin.badfaces'] = {};
    fs.writeFileSync(pinFile, JSON.stringify(pins));
    fs.writeFileSync(langFile, JSON.stringify(lang));
    fail(run(), /Invalid source-sync pins|Invalid terrain translation/);
  }));
}

for (const state of ['electrical-file-omitted', 'terrain-file-omitted', 'bad-hash', 'bad-provenance', 'duplicate-language-key']) {
  test(`pins: ${state} is rejected`, () => harness(groups[0], ({ pinFile, run }) => {
    const pins = JSON.parse(fs.readFileSync(pinFile, 'utf8'));
    if (state === 'electrical-file-omitted') pins.electrical.files = {};
    if (state === 'terrain-file-omitted') delete pins.terrain.files['raster.js'];
    if (state === 'bad-hash') pins.terrain.files['tin.js'] = 'not-a-hash';
    if (state === 'bad-provenance') pins.provenance.revision = [pins.provenance.revision];
    if (state === 'duplicate-language-key') pins.terrain.languageKeys[0] = pins.terrain.languageKeys[1];
    fs.writeFileSync(pinFile, JSON.stringify(pins));
    fail(run(), /Invalid source-sync pins/);
  }));
}
for (const state of ['missing-key', 'invalid-plural', 'invalid-catalog']) {
  test(`terrain: present source with ${state} translation fails live check`, () => harness(groups[0], ({ run, installSource }) => {
    const dev = installSource(), file = path.join(dev, 'lang/en.json');
    const lang = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (state === 'missing-key') delete lang['tin.badfaces'];
    if (state === 'invalid-plural') lang['tin.badfaces'] = { other: 'ok', one: null };
    fs.writeFileSync(file, JSON.stringify(state === 'invalid-catalog' ? [] : lang));
    fail(run(), /language key missing|Invalid terrain translation/);
  }));
}
