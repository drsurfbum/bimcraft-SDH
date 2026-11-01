/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problems.js — the shared Problems core (0.7.1 → 0.8, owner 2026-10-26: "a /!\ warning message system … to help the designer fix
 * things that are technically wrong"; spec docs/0.8-PROBLEMS-SPEC.md, map docs/apps/shell-modules.md § Problems). DOM-free and
 * import-free: bin/test-problems.mjs runs it in Node. The shell's UI (app-problems.js) makes ONE store per page and hands it to the
 * apps as window.ccProblems; apps, add-ons and engines only ever hand it plain data.
 *
 *   createStore({ app, now, timers, debounceMs, budgetMs }) → store
 *     store.source(def) → handle          def = { id, kind: check|regulation|engine|import, label?, run?(ctx), fix?(problem, fix),
 *                                                 incremental?, debounceMs?, budgetMs? }
 *       handle.set(list, { scope? })     → diff { added, removed, changed } (ids). scope = object keys ('kind:id'): only this source's
 *                                          problems about those objects are replaced (an incremental re-check), the rest stay
 *       handle.invalidate(keys?)         the model changed: run() again after the debounce (keys = what changed; none = everything)
 *       handle.recheck() → Promise<diff> run now;  handle.clear();  handle.dispose()
 *     store.list(filter) · get(id) · counts() · groups(list, by) · sources() · stats()
 *     store.accept(id, { by, reason, date? }) · unaccept(id) · accepted({ prune }) · loadAccepted(list)   (the file's accepted list)
 *     store.fix(id, fixId) → Promise<bool>   the source's fix handler makes the change (one undo step in the app)
 *     store.report({ title, file, packs, t, now }) → report data (REG.1d: sources, clauses, the not-legal-advice flag; checkSets = what
 *                                          sources with def.summary() checked against, e.g. an IDS with its per-specification counts)
 *     store.on(fn) → off                 fn({ type: 'change' | 'accepted' | 'sources', diff? })
 *   cleanProblem(raw, source) · problemId(...) · fingerprint(p) · aboutKey(ref) · cleanAccepted(list) · messageText(p, t) · needsReason(p)
 *   toCsv(report, head, { notes })
 * Accepting (owner 2026-10-26): a warning or a note accepts with or without a reason; an error or a failed regulation needs one (the panel
 * offers a one-click "Override / none given", recorded as that reason). store.accept refuses one that needs a reason and has none.
 *
 * problem = {
 *   id        stable: '<source>:<code>:<about keys>' unless the source gives its own (it must not change between runs or languages)
 *   code      what kind of problem ('conn.warn.e1', 'stair.riser.max', 'corridor.standin'); the same code = the same kind everywhere
 *   severity  'error' (cannot be built / is refused) | 'warning' (technically wrong, may be accepted) | 'note' (worth a look)
 *   msg       { key, vars } — the message in the app's or the shell's language file; text = the same already in words (fallback, and
 *             for sources whose words the page catalog lacks: add-ons)
 *   about     [{ kind, id, label? }] — the object(s) it is about (ids the app understands; an IFC element by GlobalId)
 *   where     { space: '3d' | '2d' | 'sheet', at?: [x, y, z?], sheet? } — optional; the app's adapter can work it out from `about`
 *   source    { kind, name (the check), pack?: { id, edition, version, clause, jurisdiction, from } } (regulations: where the rule came from)
 *   req       { op: '<=' | '>=' | 'between' | '=', value | [min, max], unit } · found { value, unit } — numbers in the unit given
 *   fixes     [{ id, text, msg?, action, args? }] — each one undo step; the source's fix(problem, fix) does it
 *   acceptable  false = it cannot be accepted (the source says so); default true for every severity (owner 2026-10-26: errors too)
 *   created, changed   when the store first saw it, when its numbers last changed (ms; for re-check and the report)
 *   accepted  { by, reason, date } when accepted and nothing changed since · acceptedBefore = the same when it changed after it
 * }
 */

export const SEVERITIES = ['error', 'warning', 'note'];
export const SOURCE_KINDS = ['check', 'regulation', 'engine', 'import'];
export const OPS = ['<=', '>=', 'between', '='];
export const REPORT_FORMAT = 'cadcraft-problems-report';
export const LIMITS = { id: 240, code: 80, key: 120, text: 1000, vars: 24, varText: 300, about: 50, label: 160, fixes: 6,
  reason: 500, by: 80, perSource: 5000, accepted: 5000, clause: 60, packId: 60 };

const CTRL = new RegExp('[\\u0000-\\u001f\\u007f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069]', 'g');
const str = (v, max) => (typeof v === 'string' || typeof v === 'number' ? String(v).replace(CTRL, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const RANK = { error: 0, warning: 1, note: 2 };

/** 'member:m3' — an object reference as one string (the about keys, the incremental scope). */
export function aboutKey(ref) { return ref ? str(ref.kind, 40) + ':' + str(ref.id, 120) : ''; }

/** The stable id a problem gets when its source gives none: source, code and the objects it is about (sorted). */
export function problemId({ source, code, about = [], part = '' }) {
  let keys = about.map(aboutKey).filter(Boolean).sort().join(',');
  if (keys.length > 120) keys = about.length + 'x' + fnv(keys);   // many objects (a model check's group): short, still stable
  return (source + ':' + code + ':' + keys + (part ? '#' + part : '')).slice(0, LIMITS.id);
}
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

function cleanVars(v) {
  const out = {};
  if (!v || typeof v !== 'object' || Array.isArray(v)) return out;
  for (const [k, x] of Object.entries(v).slice(0, LIMITS.vars)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]{0,30}$/.test(k)) continue;
    if (num(x)) out[k] = x; else if (typeof x === 'string') out[k] = str(x, LIMITS.varText);
  }
  return out;
}
function cleanMsg(m) {
  if (!m || typeof m !== 'object' || typeof m.key !== 'string' || !/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(m.key) || m.key.length > LIMITS.key) return null;
  return { key: m.key, vars: cleanVars(m.vars) };
}
function cleanValue(v) {
  if (num(v)) return v;
  if (Array.isArray(v) && v.length === 2 && v.every((x) => x === null || num(x))) return [v[0], v[1]];
  return null;
}
function cleanReq(r) {
  if (!r || typeof r !== 'object' || !OPS.includes(r.op)) return null;
  const value = cleanValue(r.value);
  if (value === null) return null;
  return { op: r.op, value, unit: str(r.unit, 20) };
}
function cleanFound(f) {
  if (!f || typeof f !== 'object') return null;
  if (f.value === null) return { value: null, unit: str(f.unit, 20) };
  return num(f.value) ? { value: f.value, unit: str(f.unit, 20) } : null;
}
function cleanAbout(list) {
  const out = [], seen = new Set();
  for (const r of (Array.isArray(list) ? list : list ? [list] : []).slice(0, LIMITS.about)) {
    if (!r || typeof r !== 'object') continue;
    const kind = str(r.kind, 40), id = str(r.id, 120);
    if (!kind || !id || seen.has(kind + ':' + id)) continue;
    seen.add(kind + ':' + id);
    const x = { kind, id };
    const label = str(r.label, LIMITS.label);
    if (label) x.label = label;
    out.push(x);
  }
  return out;
}
function cleanWhere(w) {
  if (!w || typeof w !== 'object') return null;
  const space = ['3d', '2d', 'sheet'].includes(w.space) ? w.space : null;
  const at = Array.isArray(w.at) && (w.at.length === 2 || w.at.length === 3) && w.at.every(num) ? [...w.at] : null;
  const sheet = str(w.sheet, 120);
  if (!space && !at && !sheet) return null;
  return { ...(space ? { space } : {}), ...(at ? { at } : {}), ...(sheet ? { sheet } : {}) };
}
function cleanPackRef(p) {
  if (!p || typeof p !== 'object') return null;
  const id = str(p.id, LIMITS.packId);
  if (!id) return null;
  const out = { id };
  for (const k of ['edition', 'version', 'clause', 'jurisdiction', 'name', 'from', 'review']) { const v = str(p[k], k === 'name' ? LIMITS.label : LIMITS.clause); if (v) out[k] = v; }
  return out;
}
function cleanFixes(list) {
  const out = [], seen = new Set();
  for (const f of (Array.isArray(list) ? list : []).slice(0, LIMITS.fixes)) {
    if (!f || typeof f !== 'object') continue;
    const id = str(f.id, 60), action = str(f.action, 60);
    if (!id || !action || seen.has(id)) continue;
    seen.add(id);
    const x = { id, action, text: str(f.text, LIMITS.label) };
    const msg = cleanMsg(f.msg);
    if (msg) x.msg = msg;
    if (f.args !== undefined) { try { const a = JSON.parse(JSON.stringify(f.args)); if (JSON.stringify(a).length <= 2000) x.args = a; } catch (e) { /* not data: dropped */ } }
    if (!x.text && !x.msg) continue;
    out.push(x);
  }
  return out;
}

/**
 * Untrusted problem (from an app check, an add-on, an engine, an import) → the clean problem, or null. `source` = the registered
 * source { id, kind } it came through: the source kind and name are the registry's, never the problem's own say.
 */
export function cleanProblem(raw, source) {
  if (!raw || typeof raw !== 'object' || !source) return null;
  const code = str(raw.code, LIMITS.code);
  const msg = cleanMsg(raw.msg);
  const text = str(raw.text, LIMITS.text);
  if (!code || (!msg && !text)) return null;
  const about = cleanAbout(raw.about);
  const severity = SEVERITIES.includes(raw.severity) ? raw.severity : 'warning';
  const srcIn = raw.source && typeof raw.source === 'object' ? raw.source : {};
  const src = { kind: source.kind, name: str(srcIn.name, 80) || source.id };
  const pack = source.kind === 'regulation' ? cleanPackRef(srcIn.pack) : null;
  if (pack) src.pack = pack;
  const ownId = str(raw.id, LIMITS.id);
  const p = {
    id: ownId ? (ownId.startsWith(source.id + ':') ? ownId : (source.id + ':' + ownId).slice(0, LIMITS.id)) : problemId({ source: source.id, code, about, part: str(raw.part, 60) }),
    code, severity, about, source: src,
    acceptable: raw.acceptable !== false,
  };
  if (msg) p.msg = msg;
  if (text) p.text = text;
  const where = cleanWhere(raw.where);
  if (where) p.where = where;
  const req = cleanReq(raw.req), found = cleanFound(raw.found);
  if (req) p.req = req;
  if (found) p.found = found;
  const fixes = cleanFixes(raw.fixes);
  if (fixes.length) p.fixes = fixes;
  return p;
}

/**
 * A source's summary of the rule set it checked against (0.7.1 71.25: an IDS) → { kind, title, version, author, date, file, schema,
 * counts: { specs, pass, fail }, specs: [{ name, status: 'pass' | 'fail', applicable, passed, failed }] } or null. Untrusted: bounded.
 */
export function cleanCheckSet(x) {
  if (!x || typeof x !== 'object') return null;
  const kind = str(x.kind, 20);
  if (!/^[a-z][a-z0-9-]{0,19}$/.test(kind)) return null;
  const n = (v) => (num(v) && v >= 0 ? Math.floor(v) : 0);
  const specs = (Array.isArray(x.specs) ? x.specs : []).slice(0, 1000).map((s) => (s && typeof s === 'object' ? {
    name: str(s.name, LIMITS.label), status: s.status === 'pass' ? 'pass' : 'fail', applicable: n(s.applicable), passed: n(s.passed), failed: n(s.failed),
  } : null)).filter(Boolean);
  const out = { kind, title: str(x.title, 200), version: str(x.version, 60), author: str(x.author, 120), date: str(x.date, 40), file: str(x.file, 200), schema: str(x.schema, 20), specs };
  out.counts = { specs: specs.length, pass: specs.filter((s) => s.status === 'pass').length, fail: specs.filter((s) => s.status === 'fail').length };
  return out;
}

/** Does accepting it need a reason? Errors and failed regulations do (owner 2026-10-26); warnings and notes don't. */
export function needsReason(p) { return !!p && (p.severity === 'error' || p.source?.kind === 'regulation'); }

/** What makes a problem "the same" for an acceptance: its severity and its numbers (not its words, which follow the language). */
export function fingerprint(p) {
  const s = [p.severity, p.req ? p.req.op + JSON.stringify(p.req.value) + p.req.unit : '', p.found ? JSON.stringify(p.found.value) + p.found.unit : '',
    p.msg ? JSON.stringify(Object.entries(p.msg.vars).filter(([, v]) => num(v)).sort()) : ''].join('|');
  return fnv(s);   // FNV-1a, 32 bits: short, stable, no crypto needed (it only says "changed since")
}

/** The accepted list read from a file (untrusted) → [{ id, by, reason, date, fp }]: known fields, bounded, one per id. */
export function cleanAccepted(list) {
  const out = [], seen = new Set();
  for (const r of (Array.isArray(list) ? list : []).slice(0, LIMITS.accepted)) {
    if (!r || typeof r !== 'object') continue;
    const id = str(r.id, LIMITS.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const date = typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/.test(r.date) ? r.date.slice(0, 30) : '';
    out.push({ id, by: str(r.by, LIMITS.by), reason: str(r.reason, LIMITS.reason), date, fp: str(r.fp, 16) });
  }
  return out;
}

/** The problem in words: its own text when it has some, else msg through t(key, vars) (the shell's ccShellT reads the page's catalog). */
export function messageText(p, t) {
  if (p.text) return p.text;
  if (p.msg && typeof t === 'function') { const s = t(p.msg.key, p.msg.vars); if (s && s !== p.msg.key) return s; }
  return p.msg ? p.msg.key : p.code;
}

const byOrder = (a, b) => RANK[a.severity] - RANK[b.severity] || (a.source.name < b.source.name ? -1 : a.source.name > b.source.name ? 1 : 0)
  || (aboutKey(a.about[0]) < aboutKey(b.about[0]) ? -1 : aboutKey(a.about[0]) > aboutKey(b.about[0]) ? 1 : 0) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export function createStore({ app = '', now = () => Date.now(), timers = null, debounceMs = 250, budgetMs = 30 } = {}) {
  const T = timers || { set: (f, ms) => setTimeout(f, ms), clear: (h) => clearTimeout(h) };
  const sources = new Map();       // id → { def, problems: Map(id → problem), timer, dirty: Set | null | undefined, running, again, lastMs, runs, wait }
  let accepted = new Map();        // id → { id, by, reason, date, fp }
  const listeners = new Set();
  const emit = (ev) => { for (const fn of [...listeners]) { try { fn(ev); } catch (e) { /* one listener never stops the others */ } } };

  function decorate(p) {
    const a = accepted.get(p.id);
    const out = { ...p };
    delete out.accepted; delete out.acceptedBefore;
    if (a) { if (!a.fp || a.fp === fingerprint(p)) out.accepted = { by: a.by, reason: a.reason, date: a.date }; else out.acceptedBefore = { by: a.by, reason: a.reason, date: a.date }; }
    return out;
  }
  const all = () => { const out = []; for (const s of sources.values()) for (const p of s.problems.values()) out.push(p); return out; };

  function apply(s, list, scope) {
    const t0 = now(), next = new Map(), diff = { added: [], removed: [], changed: [] };
    const inScope = scope ? (p) => p.about.some((r) => scope.has(aboutKey(r))) : () => true;
    if (scope) for (const p of s.problems.values()) if (!inScope(p)) next.set(p.id, p);
    let n = 0;
    for (const raw of Array.isArray(list) ? list : []) {
      if (n >= LIMITS.perSource) break;
      const p = cleanProblem(raw, s.def);
      if (!p || next.has(p.id)) continue;
      n++;
      const old = s.problems.get(p.id);
      const fp = fingerprint(p);
      p.created = old ? old.created : t0;
      p.changed = old && old.fp === fp ? old.changed : t0;
      p.fp = fp;
      next.set(p.id, p);
      if (!old) diff.added.push(p.id); else if (old.fp !== fp || old.severity !== p.severity || messageText(old) !== messageText(p)) diff.changed.push(p.id);
    }
    for (const id of s.problems.keys()) if (!next.has(id)) diff.removed.push(id);
    s.problems = next;
    s.ran = true;
    if (diff.added.length || diff.removed.length || diff.changed.length) emit({ type: 'change', source: s.def.id, diff });
    return diff;
  }

  async function runSource(s) {
    if (!s.def.run) return { added: [], removed: [], changed: [] };
    if (s.running) { s.again = true; return s.running; }
    const dirty = s.dirty === undefined ? null : s.dirty;   // null = everything
    s.dirty = undefined;
    const budget = s.def.budgetMs ?? budgetMs;
    const t0 = now();
    s.running = (async () => {
      let res;
      try { res = await s.def.run({ dirty: dirty ? new Set(dirty) : null, deadline: t0 + budget, app }); } catch (e) { res = null; s.error = String(e && e.message || e).slice(0, 200); }
      const list = Array.isArray(res) ? res : res && Array.isArray(res.problems) ? res.problems : null;
      const scope = s.def.incremental && dirty && res && res.partial !== false ? dirty : null;
      const diff = list ? apply(s, list, scope) : { added: [], removed: [], changed: [] };
      s.lastMs = now() - t0; s.runs++;
      // the budget: a check that took longer than it may waits longer before the next run (big models stay fast while editing)
      s.wait = s.lastMs > budget ? Math.min(4000, Math.max(s.def.debounceMs ?? debounceMs, s.lastMs * 4)) : (s.def.debounceMs ?? debounceMs);
      return diff;
    })();
    try { return await s.running; } finally {
      s.running = null;
      if (s.again) { s.again = false; schedule(s); }
    }
  }
  function schedule(s) {
    if (s.timer) T.clear(s.timer);
    s.timer = T.set(() => { s.timer = null; runSource(s); }, s.wait ?? (s.def.debounceMs ?? debounceMs));
  }

  const store = {
    app,
    /** Registers a source of problems (an app's checks, an add-on, an engine, an importer). Registering the same id again replaces it. */
    source(def) {
      if (!def || typeof def !== 'object') throw new Error('problems: a source needs an id and a kind');   // i18n-ignore: for developers
      const id = str(def.id, 60);
      if (!/^[a-z][a-z0-9.-]{1,59}$/.test(id)) throw new Error('problems: bad source id ' + id);   // i18n-ignore: for developers
      if (!SOURCE_KINDS.includes(def.kind)) throw new Error('problems: bad source kind ' + def.kind);   // i18n-ignore: for developers
      const old = sources.get(id);
      if (old?.timer) T.clear(old.timer);
      const s = { def: { ...def, id, label: str(def.label, LIMITS.label) || id }, problems: old ? old.problems : new Map(), timer: null, dirty: undefined, running: null, again: false, lastMs: 0, runs: 0, wait: null, ran: false };
      sources.set(id, s);
      emit({ type: 'sources' });
      const handle = {
        id,
        set: (list, { scope } = {}) => apply(s, list, scope ? new Set(scope) : null),
        clear: () => apply(s, [], null),
        invalidate(keys) {
          if (sources.get(id) !== s) return;
          if (keys && s.dirty !== null) { s.dirty = s.dirty || new Set(); for (const k of keys) s.dirty.add(k); } else s.dirty = null;
          if (s.running) { s.again = true; return; }
          schedule(s);
        },
        recheck: () => { if (s.timer) { T.clear(s.timer); s.timer = null; } if (s.dirty === undefined) s.dirty = null; return runSource(s); },
        dispose() {
          if (sources.get(id) !== s) return;
          if (s.timer) T.clear(s.timer);
          const gone = [...s.problems.keys()];
          sources.delete(id);
          emit({ type: 'sources' });
          if (gone.length) emit({ type: 'change', source: id, diff: { added: [], removed: gone, changed: [] } });
        },
      };
      return handle;
    },
    sources: () => [...sources.values()].map((s) => ({ id: s.def.id, kind: s.def.kind, label: s.def.label, count: s.problems.size, lastMs: s.lastMs, runs: s.runs, error: s.error || '' })),
    stats: () => Object.fromEntries([...sources.values()].map((s) => [s.def.id, { lastMs: s.lastMs, runs: s.runs, wait: s.wait }])),
    get: (id) => { for (const s of sources.values()) { const p = s.problems.get(id); if (p) return decorate(p); } return null; },
    /**
     * filter = { severity?: [..] | 'error', source?: id, kind?: source kind, about?: 'kind:id', text?: words (every word must be in the
     * message, the object's label, the code or the clause; t renders messages), accepted?: 'hide' (default) | 'only' | 'show', t? }
     */
    list(filter = {}) {
      const sev = filter.severity ? new Set([].concat(filter.severity)) : null;
      const words = typeof filter.text === 'string' ? filter.text.toLowerCase().split(/\s+/).filter(Boolean) : [];
      const acc = filter.accepted || 'hide';
      const out = [];
      for (const s of sources.values()) {
        if (filter.source && s.def.id !== filter.source) continue;
        if (filter.kind && s.def.kind !== filter.kind) continue;
        for (const p0 of s.problems.values()) {
          if (sev && !sev.has(p0.severity)) continue;
          if (filter.about && !p0.about.some((r) => aboutKey(r) === filter.about)) continue;
          const p = decorate(p0);
          if (acc === 'hide' && p.accepted) continue;
          if (acc === 'only' && !p.accepted) continue;
          if (words.length) {
            const hay = [messageText(p, filter.t), p.code, ...p.about.map((r) => r.label || r.id), p.source.pack?.clause || '', p.source.name].join(' ').toLowerCase();
            if (!words.every((w) => hay.includes(w))) continue;
          }
          out.push(p);
        }
      }
      return out.sort(byOrder);
    },
    /** { error, warning, note } open (not accepted), accepted, total, worst ('error' | 'warning' | 'note' | '') */
    counts() {
      const c = { error: 0, warning: 0, note: 0, accepted: 0, total: 0, worst: '' };
      for (const p0 of all()) {
        c.total++;
        const p = decorate(p0);
        if (p.accepted) { c.accepted++; continue; }
        c[p.severity]++;
      }
      c.worst = c.error ? 'error' : c.warning ? 'warning' : c.note ? 'note' : '';
      return c;
    },
    /** Groups a list: by 'severity' (error, warning, note), 'source' (the check, or the pack for regulations) or 'object' (the first object). */
    groups(list, by = 'severity') {
      const key = by === 'source' ? (p) => (p.source.pack ? 'pack:' + p.source.pack.id : 'src:' + p.source.name)
        : by === 'object' ? (p) => (p.about[0] ? aboutKey(p.about[0]) : '') : (p) => p.severity;
      const map = new Map();
      for (const p of list) { const k = key(p); if (!map.has(k)) map.set(k, { key: k, items: [] }); map.get(k).items.push(p); }
      const out = [...map.values()];
      if (by === 'severity') out.sort((a, b) => RANK[a.key] - RANK[b.key]);
      else out.sort((a, b) => (RANK[a.items[0].severity] - RANK[b.items[0].severity]) || (a.key < b.key ? -1 : 1));
      for (const g of out) {
        const p = g.items[0];
        g.label = by === 'source' ? (p.source.pack ? p.source.pack.name || p.source.pack.id : p.source.name) : by === 'object' ? (p.about[0]?.label || p.about[0]?.id || '') : p.severity;
      }
      return out;
    },

    // ---- accepted: "I know, it is meant to be like that" — saved in the file by the app ----
    accept(id, { by = '', reason = '', date = '' } = {}) {
      const p = store.get(id);
      if (!p || !p.acceptable) return false;
      if (needsReason(p) && !str(reason, LIMITS.reason)) return false;
      const d = /^\d{4}-\d{2}-\d{2}/.test(date) ? date : new Date(now()).toISOString().slice(0, 10);
      accepted.set(p.id, { id: p.id, by: str(by, LIMITS.by), reason: str(reason, LIMITS.reason), date: d, fp: fingerprint(p) });
      emit({ type: 'accepted' });
      return true;
    },
    unaccept(id) { const had = accepted.delete(id); if (had) emit({ type: 'accepted' }); return had; },
    /** The list to save in the file. prune: drop acceptances whose problem is gone, for sources that have run since the file opened. */
    accepted({ prune = false } = {}) {
      let list = [...accepted.values()];
      if (prune) {
        const live = new Set(all().map((p) => p.id));
        list = list.filter((a) => { const src = [...sources.values()].find((s) => a.id.startsWith(s.def.id + ':')); return live.has(a.id) || !src || !src.ran; });
      }
      return list.map((a) => ({ ...a }));
    },
    /** The file's accepted list (open, undo, redo): replaces the one in memory. Says 'accepted' only when something changed. */
    loadAccepted(list) {
      const next = new Map(cleanAccepted(list).map((a) => [a.id, a]));
      const same = next.size === accepted.size && [...next].every(([k, a]) => { const b = accepted.get(k); return b && b.fp === a.fp && b.reason === a.reason && b.by === a.by && b.date === a.date; });
      accepted = next;
      if (!same) emit({ type: 'accepted' });
    },

    /** Runs one of a problem's fixes through its source (the app makes the change as one undo step). */
    async fix(id, fixId) {
      for (const s of sources.values()) {
        const p = s.problems.get(id);
        if (!p) continue;
        const f = (p.fixes || []).find((x) => x.id === fixId);
        if (!f || typeof s.def.fix !== 'function') return false;
        return !!(await s.def.fix(decorate(p), f));
      }
      return false;
    },

    /**
     * The check report (REG.1d): every problem with where it came from, open and accepted, and the regulation packs it was checked
     * against. t renders messages; packs = [{ id, name, edition, version, jurisdiction, review, chain }] the app pinned.
     * notLegalAdvice is true whenever a regulation was involved: the report must then carry the shell's line saying so.
     */
    report({ title = '', file = '', packs = [], t = null, made = null } = {}) {
      const rows = store.list({ accepted: 'show', t }).map((p) => ({
        id: p.id, code: p.code, severity: p.severity,
        status: p.accepted ? 'accepted' : p.acceptedBefore ? 'changed' : 'open',
        message: messageText(p, t),
        about: p.about.map((r) => r.label || r.kind + ' ' + r.id).join(', '),
        sourceKind: p.source.kind, check: p.source.name,
        pack: p.source.pack ? [p.source.pack.name || p.source.pack.id, p.source.pack.edition].filter(Boolean).join(' ') : '',
        clause: p.source.pack?.clause || '', from: p.source.pack?.from || '',
        required: p.req ? p.req : null, found: p.found ? p.found : null,
        acceptedBy: (p.accepted || p.acceptedBefore)?.by || '', reason: (p.accepted || p.acceptedBefore)?.reason || '', acceptedOn: (p.accepted || p.acceptedBefore)?.date || '',
      }));
      const cleanPacks = (Array.isArray(packs) ? packs : []).map((x) => cleanPackRef(x)).filter(Boolean);
      // 0.7.1 71.25: a source that checked against a set of rules (an IDS) says what it was and how each part went: def.summary()
      const checkSets = [];
      for (const s of sources.values()) {
        if (typeof s.def.summary !== 'function') continue;
        let x = null;
        try { x = s.def.summary(); } catch (e) { x = null; }
        const c = cleanCheckSet(x);
        if (c) checkSets.push({ ...c, source: s.def.id });
      }
      return {
        format: REPORT_FORMAT, version: 1, app, title: str(title, 200), file: str(file, 200),
        made: made || new Date(now()).toISOString(), counts: store.counts(), packs: cleanPacks,
        notLegalAdvice: cleanPacks.length > 0 || rows.some((r) => r.sourceKind === 'regulation'),
        checkSets,
        rows,
      };
    },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
  return store;
}

/** A requirement or a found value in words: "≤ 196.85 mm", "863.6–965.2 mm". fmt(value, unit) writes one number. */
export function valueText(v, fmt = (x, u) => String(Math.round(x * 100) / 100) + (u && u !== 'pct' ? ' ' + u : u === 'pct' ? ' %' : '')) {
  if (!v) return '';
  if (v.op) {
    if (v.op === 'between') return fmt(v.value[0], v.unit).replace(/\s*\S+$/, '') + '–' + fmt(v.value[1], v.unit);
    return v.op.replace('<=', '≤').replace('>=', '≥') + ' ' + fmt(v.value, v.unit);
  }
  return v.value === null ? '–' : fmt(v.value, v.unit);
}

/** The report as CSV (RFC 4180; a cell starting with = + - @ gets a leading ' so a spreadsheet never runs it). head = column names;
 *  notes = lines after a blank row (the not-legal-advice line and its footnote "No representation." when a regulation is involved). */
export function toCsv(report, head = ['Severity', 'Status', 'Problem', 'About', 'Source', 'Check', 'Pack', 'Clause', 'Required', 'Found', 'Accepted by', 'Reason', 'Accepted on', 'Id'], { notes = [] } = {}) {
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [head.map(cell).join(',')];
  for (const r of report.rows) lines.push([r.severity, r.status, r.message, r.about, r.sourceKind, r.check, r.pack, r.clause, valueText(r.required), valueText(r.found), r.acceptedBy, r.reason, r.acceptedOn, r.id].map(cell).join(','));
  if (notes.length) { lines.push(''); for (const n of notes) lines.push(cell(n)); }
  return lines.join('\r\n') + '\r\n';
}

/**
 * The assistants' Problems tools (0.8 P.5, spec § 8): the same six in every app that has Problems. Defined once here, DOM-free
 * (bin/test-problems.mjs drives them); app-problems.js hands them to the app's host.control (window.ccProblems.registerTools(control)).
 *
 *   problemTools({ store, show(id), report(), csv(), t, step?(label, fn) }) → [{ name, group, title, description, inputSchema, run(args, ctx) }]
 *     problems_list      read   { severity?, source?, kind?, about? ('kind:id'), text?, accepted? 'hide' | 'show' | 'only' } → { counts, total, problems }
 *                               (≤ 200 rows; words in the page language; rows: id, code, severity, message, about, source, req, found,
 *                               fixes [{ id, text }], accepted?). `hard` = severity error, for assistants that read DetailCraft's older rows.
 *     problems_show      read   { id } selects and frames the objects, as a click on the row
 *     problems_fix       edit   { id, fix } runs one of the problem's fixes — the source makes it as the app's one undo step
 *     problems_accept    edit   { id, reason } (a reason is required here, even for a note); by = "Assistant (<client name>)"
 *     problems_unaccept  edit   { id }
 *     problems_report    read   {} → { report, csv } (the check report's data and its CSV text)
 */
export function problemTools({ store, show, report, csv, t = null, step = null } = {}) {
  const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const ID = { type: 'string', minLength: 1, maxLength: LIMITS.id };
  const row = (p) => ({
    id: p.id, code: p.code, severity: p.severity, hard: p.severity === 'error', message: messageText(p, t),
    about: p.about.map((r) => ({ kind: r.kind, id: r.id, ...(r.label ? { label: r.label } : {}) })),
    source: { kind: p.source.kind, name: p.source.name, ...(p.source.pack ? { pack: p.source.pack } : {}) },
    ...(p.req ? { required: p.req } : {}), ...(p.found ? { found: p.found } : {}),
    fixes: (p.fixes || []).map((f) => ({ id: f.id, text: f.text || (f.msg && t ? t(f.msg.key, f.msg.vars) : '') })),
    ...(p.accepted ? { accepted: p.accepted } : {}), ...(p.acceptedBefore ? { acceptedBefore: p.acceptedBefore } : {}),
  });
  const find = (id) => { const p = store.get(id); if (!p) throw new Error('No problem with the id ' + JSON.stringify(id) + '. Call problems_list for the current ones.'); return p; };
  const by = (ctx) => 'Assistant (' + (str(ctx && ctx.client && ctx.client.name, 60) || 'assistant') + ')';
  const run = (label, fn) => (typeof step === 'function' ? step(label, fn) : fn());
  return [
    { name: 'problems_list', group: 'read', title: 'List problems', untrusted: true,
      description: 'The Problems the open document has: what is technically wrong, where, required vs found, and the fixes on offer. Filter by severity (error, warning, note), source id, source kind (check, regulation, engine, import), an object (kind:id) or words; accepted problems are left out unless accepted is show or only.',
      inputSchema: obj({ severity: { type: 'array', items: { type: 'string', enum: SEVERITIES }, maxItems: 3, description: 'Only these severities: error, warning, note.' }, source: { type: 'string', maxLength: 80, description: 'Only problems from this source id.' }, kind: { type: 'string', enum: SOURCE_KINDS, description: 'Only problems from this kind of source.' },
        about: { type: 'string', maxLength: 200, description: 'Only problems about this object, as kind:id.' }, text: { type: 'string', maxLength: 200, description: 'Only problems whose message has these words.' }, accepted: { type: 'string', enum: ['hide', 'show', 'only'], description: 'Accepted problems: hide (default), show with the rest, or only those.' } }),
      run: (a = {}) => {
        const list = store.list({ ...a, t });
        return { counts: store.counts(), total: list.length, problems: list.slice(0, 200).map(row) };
      } },
    { name: 'problems_show', group: 'read', title: 'Show a problem',
      description: 'Selects and frames the objects a problem is about in the app, as a click on its row does. Changes nothing in the document.',
      inputSchema: obj({ id: { ...ID, description: 'The problem\'s id from problems_list.' } }, ['id']),
      run: (a) => { const p = find(a.id); show(p.id); return { shown: p.id }; } },
    { name: 'problems_fix', group: 'edit', title: 'Fix a problem',
      description: 'Runs one of a problem\'s fixes (its id is in problems_list). The app makes the change as one undo step. Returns whether it was done; the problem goes when the model no longer has it.',
      inputSchema: obj({ id: { ...ID, description: 'The problem\'s id from problems_list.' }, fix: { type: 'string', minLength: 1, maxLength: 60, description: 'One of the problem\'s fix ids, as problems_list gives them.' } }, ['id', 'fix']),
      preview: (a) => { const p = find(a.id), f = (p.fixes || []).find((x) => x.id === a.fix); if (!f) throw new Error('That problem has no fix "' + a.fix + '". Its fixes: ' + ((p.fixes || []).map((x) => x.id).join(', ') || 'none') + '.'); return { id: a.id, fix: a.fix, text: f.text || (f.msg && t ? t(f.msg.key, f.msg.vars) : ''), changed: 'The app\'s fix runs as one undo step; which objects change is the fix\'s own.' }; },
      run: async (a) => {
        const p = find(a.id), f = (p.fixes || []).find((x) => x.id === a.fix);
        if (!f) throw new Error('That problem has no fix "' + a.fix + '". Its fixes: ' + ((p.fixes || []).map((x) => x.id).join(', ') || 'none') + '.');
        const done = await run('fix ' + p.code, () => store.fix(a.id, a.fix));
        return { fixed: !!done, id: a.id, fix: a.fix };
      } },
    { name: 'problems_accept', group: 'edit', title: 'Accept a problem',
      description: 'Accepts a problem with a reason (required), so it stops counting while its numbers stay the same. It is recorded as accepted by "Assistant (<name>)" with the date. Anyone can undo it in the panel.',
      inputSchema: obj({ id: { ...ID, description: 'The problem\'s id from problems_list.' }, reason: { type: 'string', minLength: 1, maxLength: LIMITS.reason, description: 'Why it is accepted; kept with the acceptance and shown in the report.' } }, ['id', 'reason']),
      preview: (a, ctx) => { find(a.id); if (!str(a.reason, LIMITS.reason)) throw new Error('A reason is required.'); return { id: a.id, by: by(ctx), reason: str(a.reason, LIMITS.reason), accepted: true }; },
      run: (a, ctx) => {
        find(a.id);
        if (!str(a.reason, LIMITS.reason)) throw new Error('A reason is required.');
        return { accepted: !!run('accept', () => store.accept(a.id, { by: by(ctx), reason: a.reason })), id: a.id };
      } },
    { name: 'problems_unaccept', group: 'edit', title: 'Undo an acceptance',
      description: 'Opens an accepted problem again, so it counts in the totals and the report until it is fixed or accepted anew.', inputSchema: obj({ id: { ...ID, description: 'The accepted problem\'s id from problems_list (accepted: only).' } }, ['id']),
      preview: (a) => { const p = find(a.id); return { id: a.id, accepted: !!p.accepted, reopens: !!p.accepted }; },
      run: (a) => ({ reopened: !!run('unaccept', () => store.unaccept(a.id)), id: a.id }) },
    { name: 'problems_report', group: 'read', title: 'The check report', untrusted: true,
      description: 'The check report: every problem (open, accepted, changed since accepted) with its source, pack and clause, required vs found and who accepted it, plus the same rows as CSV text.',
      inputSchema: obj({}),
      run: () => ({ report: report(), csv: csv() }) },
  ];
}
