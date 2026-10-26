# F08-A supported-case matrix

All supported joins require full authored wall/type rows, straight constant width, finite coordinates, positive length ≥1 mm, physical width ≤2000 mm, 2–4 rays per node, matching base/top within 0.005 mm, intersecting core strips, seam extent ≤4 maximum wall widths and a valid closed profile. A short wall that inverts is refused even if its nominal length exceeds 1 mm. Node detection is 1 mm, independent of F02's 0.005 mm measurement regression bound and the existing 0.001 mm shape gate.

| Case | Status | Exact boundary / feedback |
| --- | --- | --- |
| Equal/dissimilar L | Supported | Smaller ray angle 30°–150° inclusive; equal/dissimilar cores, asymmetric finishes, either exterior orientation. |
| Near-coincident L endpoints | Supported | Complete-link endpoint cluster diameter ≤1 mm; original axes are not snapped to an arbitrary first row. |
| Through T | Supported | Stem endpoint within 1 mm of host axis and >1 mm from each host end; other angular/core/size limits apply. Host remains one wall. |
| Three ends (T) | Supported | Same node/height/core envelope; no duplicate same-direction rays. |
| Selected X | Supported | Four endpoints at one node; all adjacent distinct directions ≥30°, common core intersection. |
| Two continuous interior X | Deferred | Safe square envelopes with actionable interior-crossing diagnostic. No automatic host identity split. |
| Near-face T | Deferred | >1 mm off host axis; move to axis or separate/disallow. No arbitrary face snapping. |
| Unequal bases/tops | Deferred | Component square fallback; match base/top or separate walls. No partial-height carving. |
| Acute <30°, obtuse >150°, collinear splice | Deferred | Square fallback with angle/collinear diagnostic. Opposite halves of a through T are the bounded exception. |
| Multiple competing nodes, >4 rays, disjoint cores, self-inversion | Unsupported | Safe component fallback; diagnostic suggests moving/separating ends or restoring assembly. |
| Per-end allow / square cap | Supported straight scope | IFC and plan/vector cleanup; no finish wrap. Disallowed overlapping walls intentionally retain independently square bodies. |
| Curves / mixed curved component | Inherited regression only | Existing analytic bulges/envelopes retained; core priority and end controls at curved junctions deferred. |
| Sections/elevations | Existing F05 scope retained | Perpendicular isolated-wall layer cuts; junction/end/oblique/curve cuts remain diagnosed envelope fallback. |
| Schedule/material semantics | Existing F06 scope retained | Stable recipes and IDs, nominal widths, cavities/ventilation, zero membranes; no takeoff claim. |

Follow-ups: bound curved-straight L with tangent/height/core identity rules first, then curved-curved cases; separately design opening finish wrapping; review continuous-X split identities, partial-height joins and a dedicated workspace adapter. Full F08 stays partial.

New node discovery remains 1 mm. Existing explicitly saved node relations survive finish offsets within the four-width seam bound; this is retained topology, not a larger snap tolerance or imported-wall repair. Controls persist the membership when an existing join is edited.


## Upstream compatibility update — October 24

The supported physical envelope and tolerances above are unchanged. Model operations,
record readers and straight join geometry are byte-identical to reviewed delivery
`6aad54d`; the integration retains upstream's global six-unit display handling.
The real F08 browser sequence now checks `ftin`, `in`, `ftdec`, `mm`, `cm`, `m` in
`es-MX`, `id` and `en-XA`. Translated labels use the server's language-pack catalog;
allow/cap enum values and raw geometry/records remain unchanged. Each locale also
performs a real end edit and Undo. The dedicated live-workspace adapter is still
deferred. Semantic MCP access remains missing and blocks full acceptance; see
[MCP-CONTRACT.md](MCP-CONTRACT.md). No additional join case is claimed.


## 0.7 foundation candidate — October 26

The bounded join cases and all tolerances above are retained. Multi-level walls
are eligible only where joined components have the same world base/top within
0.005 mm. Upper-floor through silhouettes and slab/room loops now receive complete
join metadata. Changing level elevations regenerates physical depth and cleanup.
Copy Level retains each explicit end control and remaps saved node/T members to
new wall GlobalIds; external-level membership is refused atomically rather than
guessed. Unsupported records still block synchronized changes without mutation.

This is compatibility work, not additional curved/height/interior-X support.
The 28-case independent matrix still uses the stricter 0.00001 mm² overlap and
0.001 mm² union bounds; saved fixture comparisons retain 0.005 mm.
Historical October 24 byte-identity statements describe that delivery only; the
0.7 operation wrapper includes integrated replay/protection and the copy seam.
