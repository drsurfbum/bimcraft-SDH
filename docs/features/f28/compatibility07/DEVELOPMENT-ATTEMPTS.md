# Compatibility attempts retained

These are historical attempts, not final-head evidence. No failure was relabeled as passing and no required assertions were removed.

- `db4592885bff801db2d72b279f7e7076a6050806`: [C failed](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40349194650) after five checks, with an unexpected RCP settings dialog after a model-space pointer action. Add genuine canvas hit tests and use visible model-space bounds/native Fit; do not force clicks or synthesize successful callouts.
- Same source: [B failed](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40349194530) after ten checks because a temporary empty source list during IFC replay discarded every drawing tab. Retain editor-owned source descriptors while the same model is busy; never reuse another editor's descriptors.
- Same source: [foundation lifecycle failed](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40349194677), reporting null `walls` reads and no saved download in the real recovery workflow. Do not extract schedules before model data exists; keep the real save/recovery/error assertions.
- F04/F05/F06/A/upstream compatibility passed on that source. Those earlier passes do not establish final-delivery acceptance. The actual source/packaged MCP lifecycle, loaded-package closure and capability audit also completed there, with documentation parity explicitly still missing.
- Follow-up source `56d0c16320b4dbdb1d018f822a9ffbb883f7bb33` tightens unbound Properties refusal and adapts test controls. Source `4d49ea378da19b7474713ac73acab4a9192ba73c` corrects source-cache/readiness lifecycle and horizontal tab scrolling. Superseded/incomplete CI remains in Actions; final-head results must be evaluated separately.

Recovery archives, full raw model payloads and expected snapshots remain private. Named reports/screenshots only are publishable under this candidate's workflows.

- `4d49ea3`: C reached 24 successful checks including annotations, callouts, real sheet/continuation placement, shared-type refresh, Undo/Redo and actual vector downloads, then stopped on the obsolete `.ws-vsplit` test selector. The shared host's genuine `.shell-split-left` keyboard resize control replaces it.
- `1165c6d`: C reached 34 checks, including actual saved IFC/reopen and negative/positive sheet/duplicate-label/CSV guards, then its File-button selector also matched a hidden layout-import input. Narrow the selector to the genuine File button without changing any behavioral assertion. Independent actual IFC/CSV/eight vector-PDF/page-bound validation passed despite that later browser stop. B's full browser suite passed on this source.

- `a8cba1d`: C passed 36 checks including complete File/Properties CSV comparisons, then the new source-switch test attempted the genuine source radio while its Model palette tab was hidden. The corrected test opens Model, switches the native radio, verifies an actual editor-owner change and returns to Project Browser; no forced/hidden click or synthetic source switch. Foundation controls passed on this source.
