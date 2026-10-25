/* SPDX-License-Identifier: Apache-2.0 */
// A standalone integrity contract, not a claim of live upstream source equality.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { optionalDirectory } from './optional-dependency.mjs';

const files = { terrain: ['tin.js', 'raster.js'], electrical: ['res-elec-symbols.js'] };
const imports = ['delaunator', 'robust-predicates', 'geotiff'];
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const sameKeys = (actual, expected) => Array.isArray(actual) && actual.length === expected.length &&
  JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
const invalid = detail => { throw new Error(`Invalid source-sync pins: ${detail}`); };

export function terrainLanguageKeys(texts) {
  return [...new Set(texts.flatMap(text => [...text.matchAll(/['"]((?:tin|raster)\.[a-z0-9_.-]+)['"]/g)].map(match => match[1])))].sort();
}

export function validateTerrainLanguage(lang, keys, origin) {
  const text = value => typeof value === 'string' && value.trim() !== '' && value !== '[object Object]';
  if (!record(lang)) throw new Error(`Invalid terrain translation catalog: ${origin}`);
  for (const key of keys) {
    if (!Object.hasOwn(lang, key)) throw new Error(`Bundled/source terrain language key missing: ${origin}: ${key}`);
    const value = lang[key];
    if (!(text(value) || (record(value) && text(value.other) && Object.values(value).every(text)))) {
      throw new Error(`Invalid terrain translation: ${origin}: ${key}`);
    }
  }
}

function validatePins(pins, kind) {
  if (!record(pins) || pins.schema !== 1 || !Object.hasOwn(files, kind)) invalid('schema or group');
  const p = pins.provenance;
  const repositories = ['https://github.com/achartt/bimcraft-SDH', 'https://github.com/drsurfbum/bimcraft-SDH', 'https://github.com/getcadcraft/bimcraft'];
  if (!record(p) || typeof p.revision !== 'string' || !/^[a-f0-9]{40}$/.test(p.revision) || !repositories.includes(p.repository) || p.path !== 'app/') invalid('provenance');
  for (const [name, required] of Object.entries(files)) {
    const group = pins[name];
    if (!record(group) || !record(group.files) || !sameKeys(Object.keys(group.files), required)) invalid(`${name} required files`);
    if (!Object.values(group.files).every(hash => typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash))) invalid(`${name} SHA-256 hashes`);
  }
  const terrain = pins.terrain;
  if (!record(terrain.imports) || !sameKeys(Object.keys(terrain.imports), imports) ||
      !Object.values(terrain.imports).every(value => typeof value === 'string' && value.startsWith('/assets/vendor/'))) invalid('terrain required imports');
  if (!Array.isArray(terrain.languageKeys) || !terrain.languageKeys.length ||
      !terrain.languageKeys.every(key => typeof key === 'string')) invalid('terrain required language keys');
}

export function checkBundledAssets(root, kind, sourceApp) {
  const pins = JSON.parse(fs.readFileSync(new URL('./source-sync-pins.json', import.meta.url), 'utf8'));
  validatePins(pins, kind);
  const pin = pins[kind], app = path.join(root, 'public_html/assets/apps/bimcraft/dev');
  for (const [file, expected] of Object.entries(pin.files)) {
    const hash = createHash('sha256').update(fs.readFileSync(path.join(app, file))).digest('hex');
    if (hash !== expected) throw new Error(`Bundled ${file} differs from pinned revision ${pins.provenance.revision}; review source provenance before updating the pin`);
  }
  if (kind === 'terrain') {
    const requiredKeys = terrainLanguageKeys(files.terrain.map(file => fs.readFileSync(path.join(app, file), 'utf8')));
    if (!sameKeys(pin.languageKeys, requiredKeys)) invalid('terrain language keys differ from pinned source literals');
    const manifest = JSON.parse(fs.readFileSync(path.join(app, 'manifest.json'), 'utf8'));
    for (const [lib, expected] of Object.entries(pin.imports)) {
      if (manifest.imports?.[lib] !== expected) throw new Error(`Bundled manifest mapping differs for ${lib}`);
    }
    const lang = JSON.parse(fs.readFileSync(path.join(app, 'lang/en.json'), 'utf8'));
    validateTerrainLanguage(lang, requiredKeys, 'bimcraft/dev/lang/en.json');
    for (const [key, value] of Object.entries(lang)) {
      if (value === '[object Object]') throw new Error(`Bundled language key ${key} is "[object Object]"`);
    }
  }
  console.log(`${kind}: bundled integrity verified against ${pins.provenance.revision}`);
  // Inspect the app root, not an individual required file. Partial installs, unreadable
  // paths and dangling symlinks must fail; only a genuinely absent app is optional.
  const source = path.join(root, 'public_html/assets/apps', sourceApp);
  if (!optionalDirectory(root, `public_html/assets/apps/${sourceApp}`)) {
    console.log(`SKIP ${kind} live source comparison: ${sourceApp} app absent at ${source}; bundled integrity checked separately`);
    return true;
  }
  return false;
}
