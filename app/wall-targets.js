/* SPDX-License-Identifier: Apache-2.0 */
// F09: analytic references reuse F02's resolver; never infer faces from a rendered/joined outline.
import { referencePoint, WALL_REFERENCES } from './wall-dimensions.js';

export function wallTarget(walls, ref) {
  const matches = walls.filter(w => w.guid === ref?.wall);
  const wall = matches.length === 1 ? matches[0] : null;
  if (!wall || wall.bulge || !wall.assembly || wall.referenceIssue || !WALL_REFERENCES.includes(ref.reference)) return null;
  const p = referencePoint(ref, walls);
  if (!p) return null;
  return { p, reference: { wall: ref.wall, reference: ref.reference, station: ref.station },
    segment: [referencePoint({ ...ref, station: 0 }, walls), referencePoint({ ...ref, station: 1 }, walls)],
    geometry: 'analytic-wall-reference', persistent: false, units: 'mm' };
}

/** Explicit reference only. Radius is pointer acquisition in model mm, supplied by the existing view transform.
 * Ends/midpoints retain existing precedence within the chosen reference; coincident references stay distinct.
 * There is deliberately no core/finish priority and no pixel-derived coordinate in the result. */
export function wallTargetCandidates(p, walls, reference, radius) {
  if (!WALL_REFERENCES.includes(reference) || !Number.isFinite(radius) || radius <= 0 ||
      !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite)) return [];
  const out = [], counts = new Map();
  for (const w of walls) counts.set(w.guid, (counts.get(w.guid) || 0) + 1);
  for (const w of walls) {
    if (counts.get(w.guid) !== 1) continue;
    const seen = new Set();
    const first = wallTarget([w], { wall: w.guid, reference, station: 0 });
    if (!first) continue;
    const [a, b] = first.segment, dx = b[0] - a[0], dy = b[1] - a[1], len2 = dx * dx + dy * dy;
    if (!len2) continue;
    const station = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
    for (const [s, kind, rank] of [[0, 'end', 0], [1, 'end', 0], [.5, 'mid', 1], [station, 'on', 2]]) {
      if (seen.has(s)) continue;
      seen.add(s);
      const target = wallTarget([w], { wall: w.guid, reference, station: s });
      const distance = Math.hypot(target.p[0] - p[0], target.p[1] - p[1]);
      if (distance <= radius) out.push({ ...target, kind, rank, distance });
    }
  }
  return out.sort((a, b) => a.rank - b.rank || a.distance - b.distance || a.reference.wall.localeCompare(b.reference.wall));
}

// Presentation identity for a transient candidate. A nearest-point station is recomputed from authoritative geometry.
export const targetCandidateId = c => c.reference.wall + ':' + c.kind + ':' + (c.kind === 'on' ? '' : c.reference.station);
