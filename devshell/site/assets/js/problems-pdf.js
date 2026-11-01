/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problems-pdf.js — the check report as a PDF (0.8 P.7; spec docs/0.8-PROBLEMS-SPEC.md § 7). DOM-free and import-free, no library:
 * bin/test-problems.mjs runs it in Node. app-problems.js calls it with the report data (store.report) and the shell's words.
 *
 *   reportPdf(report, L, { sections }) → Uint8Array (a PDF 1.4, A4 portrait, Helvetica, uncompressed)
 *     report    store.report() data: title, file, made, counts, packs, notLegalAdvice, checkSets, rows
 *     L         the words, already translated: { app, title, made, counts, packs, packLine(p), legal, norep, sev(row), status(row), col: { … }, page(n, total),
 *               required(row), found(row), accepted(row), setLines[] }
 *     sections  [{ heading, lines: [string | { text, bold }] }] extra sections after the packs and before the problems: the regulation
 *               part of REG.1d is handed in here (regs-08 fills it; this file only lays it out)
 *   Limits: the standard Helvetica fonts only carry Windows-1252, so a character outside it prints as "?" (no embedded font here; the HTML
 *   report and the CSV carry every language). Lines are wrapped by Helvetica's own widths, a problem is never split across two pages when
 *   it fits on one, and every page has the file name and "Page n of N" in its foot.
 *
 *   pdfText(s) → the string as Windows-1252 bytes' characters ("?" for the rest) · wrapWords(text, size, width, bold) → [lines]
 */
const W = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];   // Helvetica, 32..126
const WB = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584];   // Helvetica-Bold
const CP1252 = { '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f };

/** One character as its Windows-1252 code, or 63 ("?"). Latin-1 letters keep their own code; tabs and line breaks are spaces. */
const code = (ch) => {
  const c = ch.codePointAt(0);
  if (c === 9 || c === 10 || c === 13 || c === 0xa0) return 32;
  if (c >= 32 && c <= 126) return c;
  if (c >= 0xa1 && c <= 0xff) return c;
  return CP1252[ch] || 63;
};
export function pdfText(s) { let o = ''; for (const ch of String(s ?? '')) o += String.fromCharCode(code(ch)); return o; }
const widthOf = (s, size, bold) => { const t = bold ? WB : W; let w = 0; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); w += c >= 32 && c <= 126 ? t[c - 32] : 556; } return (w * size) / 1000; };

/** Wraps text into lines no wider than `width` points (a word wider than the line is cut). */
export function wrapWords(text, size, width, bold = false) {
  const out = [];
  for (const para of String(text ?? '').split(/\s*\n\s*/).map(pdfText)) {
    let line = '';
    for (let word of para.split(/ +/)) {
      if (!word) continue;
      while (widthOf(word, size, bold) > width) {   // too long for a line of its own: cut where it fits
        let n = word.length - 1;
        while (n > 1 && widthOf(word.slice(0, n), size, bold) > width) n--;
        if (line) { out.push(line); line = ''; }
        out.push(word.slice(0, n)); word = word.slice(n);
      }
      const next = line ? line + ' ' + word : word;
      if (line && widthOf(next, size, bold) > width) { out.push(line); line = word; } else line = next;
    }
    out.push(line);
  }
  return out;
}

const PAGE = { w: 595.28, h: 841.89, mx: 42, top: 52, bottom: 52 };
const esc = (s) => s.replace(/[\\()]/g, (c) => '\\' + c);
const COLORS = { error: [0.70, 0.09, 0.18], warning: [0.62, 0.33, 0.0], note: [0.30, 0.34, 0.40], ink: [0.09, 0.12, 0.17], soft: [0.35, 0.39, 0.45] };

export function reportPdf(r, L = {}, { sections = [] } = {}) {
  const pages = [[]];
  let y = PAGE.top;
  const inner = PAGE.w - 2 * PAGE.mx;
  const page = () => pages[pages.length - 1];
  const room = () => PAGE.h - PAGE.bottom - y;
  const brk = () => { pages.push([]); y = PAGE.top; };
  const col = (c) => (c || COLORS.ink).map((v) => v.toFixed(3)).join(' ');
  /** Draws wrapped text; returns its height. */
  const text = (s, { size = 9, bold = false, color = null, indent = 0, gap = 2, measure = false } = {}) => {
    const lead = size * 1.28, lines = wrapWords(s, size, inner - indent, bold);
    const h = lines.length * lead + gap;
    if (measure) return h;
    for (const ln of lines) {
      if (room() < lead) brk();
      page().push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${col(color)} rg ${(PAGE.mx + indent).toFixed(2)} ${(PAGE.h - y - size).toFixed(2)} Td (${esc(ln)}) Tj ET`);
      y += lead;
    }
    y += gap;
    return h;
  };
  const rule = (c = COLORS.soft, wt = 0.5) => { page().push(`${col(c)} RG ${wt} w ${PAGE.mx} ${(PAGE.h - y).toFixed(2)} m ${(PAGE.w - PAGE.mx).toFixed(2)} ${(PAGE.h - y).toFixed(2)} l S`); y += 4; };
  const sp = (n) => { y += n; };

  // ---- title block
  text(L.title || r.title || 'Check report', { size: 18, bold: true, gap: 4 });
  text(r.title && r.title !== L.title ? r.title : (r.file || ''), { size: 11, color: COLORS.soft, gap: 2 });
  if (r.file && r.file !== r.title) text(String(r.file), { size: 9, color: COLORS.soft });
  if (L.made) text(L.made, { size: 9, color: COLORS.soft });
  rule(COLORS.ink, 1);
  if (L.counts) text(L.counts, { size: 10, bold: true, gap: 4 });
  if (r.notLegalAdvice && L.legal) text(L.legal, { size: 9, gap: 2 });
  if (r.notLegalAdvice && L.norep) text(L.norep, { size: 8, color: COLORS.soft, gap: 4 });
  if ((r.packs || []).length && L.packs) {
    sp(4); text(L.packs, { size: 11, bold: true });
    for (const p of r.packs) text('• ' + (L.packLine ? L.packLine(p) : p.name || p.id), { size: 9, indent: 8, gap: 1 });
  }
  for (const line of L.setLines || []) text(line, { size: 9, gap: 1 });
  for (const s of sections) {
    if (!s || !s.heading) continue;
    sp(6); if (room() < 40) brk();
    text(s.heading, { size: 11, bold: true });
    for (const ln of s.lines || []) { const o = typeof ln === 'string' ? { text: ln } : ln; text(o.text, { size: 9, bold: !!o.bold, indent: o.indent || 0, gap: 1 }); }
  }
  sp(8);

  // ---- the problems: one block each, kept whole on a page when it fits
  const C = L.col || {};
  for (const row of r.rows || []) {
    const parts = [];
    parts.push({ s: (L.sev ? L.sev(row) : row.severity) + ' · ' + (L.status ? L.status(row) : row.status), bold: true, color: COLORS[row.severity] || COLORS.ink, size: 9 });
    parts.push({ s: row.message, size: 10, bold: false });
    const meta = [];
    if (row.about) meta.push((C.about || 'About') + ': ' + row.about);
    const src = [row.check, row.pack, row.clause && (C.clause || 'Clause') + ' ' + row.clause].filter(Boolean).join(' · ');
    if (src) meta.push((C.source || 'Source') + ': ' + src + (row.from ? ' (' + row.from + ')' : ''));
    if (row.required || row.found) meta.push([(row.required && L.required ? (C.required || 'Required') + ': ' + L.required(row) : ''), (row.found && L.found ? (C.found || 'Found') + ': ' + L.found(row) : '')].filter(Boolean).join('   '));
    if (row.acceptedBy || row.reason) meta.push(L.accepted ? L.accepted(row) : [row.acceptedBy, row.acceptedOn, row.reason].filter(Boolean).join(' · '));
    for (const m of meta) parts.push({ s: m, size: 8.5, color: COLORS.soft, indent: 10 });
    const need = parts.reduce((n, p) => n + text(p.s, { size: p.size, bold: p.bold, indent: p.indent || 0, measure: true }), 0) + 6;
    if (need < PAGE.h - PAGE.top - PAGE.bottom && room() < need) brk();
    for (const p of parts) text(p.s, { size: p.size, bold: p.bold, color: p.color, indent: p.indent || 0, gap: p.indent ? 0.5 : 1.5 });
    sp(3); rule([0.82, 0.85, 0.88], 0.4);
  }
  if (!(r.rows || []).length && L.none) text(L.none, { size: 10 });

  // ---- foot of every page
  const total = pages.length;
  pages.forEach((ops, i) => {
    ops.push(`BT /F1 8 Tf ${col(COLORS.soft)} rg ${PAGE.mx} 28 Td (${esc(pdfText(String(r.file || r.title || '').slice(0, 90)))}) Tj ET`);
    const pg = pdfText(L.page ? L.page(i + 1, total) : `Page ${i + 1} of ${total}`);
    ops.push(`BT /F1 8 Tf ${col(COLORS.soft)} rg ${(PAGE.w - PAGE.mx - widthOf(pg, 8, false)).toFixed(2)} 28 Td (${esc(pg)}) Tj ET`);
  });

  // ---- the file
  const objs = [];   // 1 catalog, 2 pages, 3 F1, 4 F2, then page / content pairs
  const add = (s) => { objs.push(s); return objs.length; };
  add('<< /Type /Catalog /Pages 2 0 R >>');
  add('PAGES');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids = [];
  for (const ops of pages) {
    const body = ops.join('\n');
    const content = add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
    kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.w} ${PAGE.h}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${content} 0 R >>`));
  }
  objs[1] = `<< /Type /Pages /Kids [${kids.map((k) => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
  const info = add(`<< /Title (${esc(pdfText(r.title || L.title || 'Check report'))}) /Producer (CadCraft) >>`);
  let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const off = [];
  objs.forEach((o, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
  return bytes;
}
