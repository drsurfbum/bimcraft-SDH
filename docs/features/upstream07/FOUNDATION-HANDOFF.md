# Pinned 0.7 foundation candidate

Draft PR: https://github.com/drsurfbum/bimcraft-SDH/pull/17. Main adoption, readiness, deployment and the shared roadmap remain PM decisions. Gate A recovery is verified. Gate B is a review candidate; the exact delivery checks and remaining limits must be read together.

| Input | Exact commit |
|---|---|
| Accepted main | `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711` |
| Previous incorporated upstream | `46275e4e09aa7a086836b98372f73422dec6d74d` |
| `bimcraft-v0.7.0` | `c778c7ca3f83eeecc3e815078417f152b2ca7a94` |
| Published history-preserving merge | `ca9b98be103492c9dab75fd20b0f1526bd87496d` |
| Domain, shell and packaging corrections | `df116b04f3b1f488658a52f036081d1328f31acb` |
| Shared dispatch correction | `3382b5607eb5ea7131810b7b5907d87755cb0270` |
| Timing controls and evidence restrictions | `ac76e6be2a9765170b19e60df3afbd8ab2fe2879` |
| Deterministic refusal and lifecycle controls | `5e04faccdab49b8f126626c5e96161a5cbd585c3` |
| Late-created browser restoration; expanded lifecycle/closure checks | `2932da2e0045142916f55f043f831e4439457893` |
| Workflow syntax correction | `f1bc0a3a2c4185e8884402b21cbd17a5e7aef162` |
| Reviewed implementation: shared-property alias refusal | `5347d26cf39a230142eafe6398b141fbdde30eac` |

The merge has the exact accepted-main and upstream commits as its ordered parents. Original commits remain in history. F28-C #12 (`f956fac00adf1d4d51ddc2e4253fe215a2c50acd`), F08 #13 (`f929205133316b29a4551083792d5712d5ffcabd`) and MCP-01 #16 (`9224167fe3e2e856c57679065b545d834f52ade1`) are excluded. A refreshed inventory found no advancement of those heads. Unpublished F28-C merge work remains separately preserved.

## PM corrections — addressed, awaiting verification

Both **UP07-PM-01** and **UP07-PM-02** are addressed by source commit `1ad110a01ec1a88f9c1b9e553a03ddff5786ba6e`, a normal single-parent continuation of reviewed delivery `6ff9f38f0b80ad0128b12e04bf7b41e5c7f834ab`. PM determines closure and merge readiness. The documentation delivery is the commit containing this correction record; [PR #17](https://github.com/drsurfbum/bimcraft-SDH/pull/17) records its exact immutable SHA and final-head CI links after completion.

**UP07-PM-01.** `saveWallAssembly()` now reserves its GUID replay slot on every execution while retaining the first allocated type identity. The shared `reserveGuid()` helper also repairs audited cached allocations in columns, add/split levels, traced walls/openings/underlays/pages, drafting, drawn floors/openings, ramps, family placement, MEP runs and equipment. The ordered deterministic replay mechanism is retained. Modules using a separate non-replaying writer were distinguished from shared `op()` consumers; their cached allocations do not shift this replay sequence.

Five regressions cover fresh and duplicated recipes, both assigned to two actual F04 walls and unassigned, and editing an existing shared recipe. Each checks all IfcRoot subtypes, original identities after Undo, identical first-write identities after three Redos, wall assignments/thicknesses, and actual saves/reopens. Twelve additional audited operations use the same all-root oracle. All five assembly cases and all twelve audit cases fail on the reviewed source, then pass with this correction. The original wall-chain/opening/derived/copy-level replay test remains unchanged and passing.

**UP07-PM-02.** The exact missing upstream RC.6 block is restored, including all 33 kinds, IFC4 class/type read-back, dangling-reference checks, sub-board exclusion and `saved.devices`. The release/candidate matrix now runs full `--res` plus all nine residential sections independently, so an unavailable earlier sibling cannot hide later assertions. Missing names or occurrences fail the job. Two specifically documented source-integrity renames require their retained replacement check. Two measurement-bearing framing labels have anchored normalization rules with their original measured labels retained; this does not alter any assertion predicate or tolerance. Four comparator regressions prove that dropped electrical assertions fail even if the total stays unchanged, notices cannot replace assertions, and duplicate labels cannot hide losses.

Fresh local evidence on the corrected source tree:

| Check | Actual result |
|---|---|
| Focused foundation/F28 suite | 36 passed, 0 failed/skipped; previous 15 tests retained |
| Full direct applicable baseline, installed local readers | 704 passed, 0 failed; 7 separate availability notices |
| Published source Tests CI with installed readers/Poppler | [709 passed, 0 failed; 4 separate availability notices](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40259863890); residential stage 211 passed |
| Residential suite with installed local IFC readers, no Poppler | 208 passed, 0 failed |
| RC.6 with installed local IFC readers | 26 passed, 0 failed; the no-reader mirror executes 24 checks and records reader availability separately |
| Required standalone and residential release/candidate comparisons | No missing named assertions after the explicit justified differences; source-only sibling failures remain control failures |
| Independent actual saved IFC, IfcOpenShell 0.9.0 + EXPRESS rules | 38 files, 0 schema/EXPRESS findings and 0 duplicate GlobalIds: 25 assembly states, 11 additional audit outputs and both electrical saves |
| Independent electrical inventory | 33 distinct kinds; each saved device independently matches its expected IFC class and PredefinedType |

These are fresh results, not the historical 707 figure. CI derives its own totals from actual reader-enabled runs. The workflow preserves all existing browser, persistence, drawing/export, package, live/headless MCP, language/unit and performance checks; it adds mandatory independent validation of the new saved assembly and electrical outputs. Public artifacts contain only named metadata reports. The actual saved IFC remains local/ephemeral.

Supplemental reader-enabled MEP diagnostics are a limitation, not passing evidence. A fresh pump placement on both exact pinned upstream and the corrected source reports `IfcRelDefinesByProperties.NoRelatedTypeObject` under EXPRESS rules (one finding each); the twelve-operation identity audit still proves stable, unique equipment identities. Enabling the optional readers for the wider `mep07` matrix also reveals inherited equipment/tag/IFC2X3 diagnostics that the upstream wrapper's severity handling misses. The unchanged standalone matrix runs with equal original reader availability; mandatory assembly/electrical validation uses a separate required reader and does not silently certify wider MEP schema conformance. Broad semantic MCP/MEP schema catch-up remains outside these two fixes and requires separate review.

All nine workflow types must pass on the documentation delivery itself. The final PR handoff is the exact-head status authority. Native OS picker behavior, absent CivilCraft/PartCraft/CadCraft sibling controls, complete local offline assets/listener restrictions, and the previously open performance/agentic findings remain limitations. No new manual check is required to reproduce or verify these two automated fixes; PM re-review is required before closure or merge readiness.

## Capability decisions

The full comparison had 1,166 changed upstream files and 62 overlapping paths: 31 identical and 31 divergent. Git produced 27 actual conflict paths. [CAPABILITY-LEDGER.csv](CAPABILITY-LEDGER.csv) records all 31 divergent paths, accepted behavior, selected source, reasons, required cases and remaining risk. No bulk ours/theirs resolution was used.

| Capability | Implementation decision | Evidence and limits |
|---|---|---|
| F01/F02 persistence, precision, references and migration | Reuse upstream domain modules where the accepted implementation survives; retain stronger fork oracles and strict optional-source discovery. Refuse unsupported protected-record writes through the shared IFC editor. | Existing legacy/versioned/corrupt cases, atomic refusal, independent IFC readers, exact byte fingerprints and second-project isolation. Existing `.005 mm` fixture bounds are unchanged; no universal CAD-accuracy claim. |
| Materials, assemblies, cavities, zero membranes and dimensions | Keep authoritative material/assembly operations, contiguous core and six reference lines. No duplicate recipe engine. | F02/F06 and F28-B exercise real edits, duplicate assignment, layer reorder, core anchors, openings, dimension identities and save/reopen. |
| F04/F05/F06 drawings and exports | Retain plan, bounded section/elevation, schedule, legend, sheet and export operations. Drawing extraction uses Float64 document positions alongside Float32 GPU data, avoiding coordination-frame quantization after reopen. Normalize inverse-frame cancellation only to `1e-9 mm`. | Strict save/reopen drawing equality is retained. Independent vector geometry, layer widths, cavity blanks, membrane paths, CSV contents and page bounds. Additional Float64 arrays cost memory; performance findings remain open. |
| Multi-level walls and regeneration | Adopt 0.7 span/visibility helpers, base/top offsets and dependent regeneration. | `--mlwall`, `--copylevel`, F28 template-controlled upper-storey placement and domain suites. F08 joins are separate. |
| Redo identities | Preserve upstream GUID replay; reserve replay slots even when a cached object GUID is reused, including copy-level. | Independent IFC validation exposed duplicate GlobalIds before the correction. The corrected stress case covers wall chains, openings, floor, ceiling, roof, new level and copy-level through Undo/Redo/reopen; all IfcRoot IDs remain unique. |
| F28-A/B and shared shell | Use 0.7's shared workspace engine and translated catalog. Keep canonical command IDs and bound native controls. Keep the established default, direct launch and explicit classic fallback. Correct shared dialog delegation to dispatch once, and reattach a browser created after layout entry when classic fallback removes temporary shell content. | Classic/ribbon navigation, native picking, type editor, focus, keyboard, palette resize, camera/tab restoration and original controls. Legacy workspace files remain recovery/reference material and are unimported runtime code. No F28-C documentation adapter is included. |
| Units and languages | Adopt upstream's six unit modes and real locale catalogs; merge retained English keys and use the 0.7 PHP/generated page, import maps and host assets. | Six real controls with typed equivalent lengths and reload; raw records/IDs unchanged. PHP catalog/fallback checks include es-MX, id, en-XA and separate fr/de/ar controls. |
| Generic agent edits | Retain useful upstream element/property, movement, deletion and wall/opening operations. Inspect actual property-set membership and every protected owner of a shared property entity, rather than trusting caller labels or set IDs; protected domain records are refused atomically. | Forged labels/set IDs, shared property aliases, shared `element_set`, history and project isolation tests. This does not provide custom material/recipe, documentation or join parity. |
| Headless/package foundation | Load BimCraft mandatorily. Treat an absent unrelated CadCraft application as explicitly unavailable so a standalone server can start; partial/broken dependencies still fail. Private `--bimcraft-only` packaging follows the existing closure copier. | Actual stdio initialize/list/call, edit/save/reopen/Undo, allowed-root and overwrite refusal, read-only permission refusal and exact packaged-module hashes/notices. Registered catalog size is not a count of functional cross-app capabilities. |

The default layout and fallback are preserved without a product-default change. Native OS picker/platform behavior is outside headless browser evidence. Tests use separate origins/ports and disposable profiles; existing projects, previews and recovery storage were not reloaded or cleared.

## Historical validation before PM corrections

The numbers and workflow observations in this section describe the earlier reviewed delivery `6ff9f38f0b80ad0128b12e04bf7b41e5c7f834ab`, not fresh evidence for the corrected delivery. See the PM correction record at the top of this handoff.

## Executed validation and independent outputs

Local environment: Apple M5 Pro, macOS arm64, Node 26.9.0, Python 3.12 and IfcOpenShell 0.9.0. Browser CI uses Ubuntu, Node 22, Python 3.12, pinned Playwright/Chromium and independent IfcOpenShell/Poppler/PDF readers. Exact versions, CPU and samples are retained per run. The focused foundation/F28 suite has 15 tests, including byte-preserving refusal, shared-property aliases, drawing-frame equality and redo identity stress. Local listeners are denied (`EPERM`), so local browser execution and an active hosted preview are unavailable.

The old-main 707-check record is a historical reference. Local direct stage runs executed 683 named checks on old main and 702 on the candidate, with availability notices kept separate. The local full offline entry point is blocked by unavailable newly pinned CPython-WASI/PDF.js/OIDN assets; 116 copied libraries were hash-verified, and full vendor retrieval/verification runs in CI. The same CI candidate with installed readers executed 707 baseline checks on the second implementation commit; four optional cross-app notices remained. Changed upstream cases and reader availability explain counts; no count was forced to match 707. Correction after PM review: this historical delivery omitted the final two RC.6 assertions and saved.devices. UP07-PM-02 restores them; the historical claim that no assertion was removed was incorrect. No precision tolerance was changed.

The release/candidate matrix compares executed case names as well as counts. Required standalone modes are `mlwall` (24), `copylevel` (17), `famsolid` (33), `fammore` (202), `su878` (15), `variants` (4), `bundle-open` (4), `mep07` (176), `mass07` (31), `agent` (22), `new` (12), `rotated` (12) and `fixes2` (7). Both controls passed these modes. `ops` runs 166 assertions in CI; local socket restrictions prevent it locally. The matrix's per-case comparison remains the authority if upstream output changes.

`plans` initially could not load its pinned Node PDF.js test dependency; installing that test-only lockfile in both isolated mirrors resolves it, and both execute 41 passing assertions. `draw06` still requires missing CivilCraft LandXML code. `families` and `mep` still require absent PartCraft/CadCraft sibling source. Such unmodified-release/control failures remain recorded as CONTROL_FAILURE, never counted as passes. The standalone matrix does not certify an entire CadCraft multi-application distribution.

Independent output evidence includes:

- F01 fixture/schema acceptance and negative schema controls; legacy and unsupported-record refusal retained.
- F02: 16 independently read files; worst point `0.0020386012624830437 mm`, dimension `0.0009286677004638477 mm`, shape `0.0014559999999619322 mm`, all below the existing `.005 mm` bound.
- F04: nine walls/five openings, stable model data, cavity and zero-membrane checks across actual reopened files. Vector PDFs at 1:50, 1:5, 1:100 and 1:10 retain layer widths and zero raster images.
- F05: IFC4/IFC2X3 saved outputs with zero schema findings; bounded section/elevation vector geometry, page limits and strict drawing-frame save/reopen comparison.
- F06: actual CSV row contents and escaping, stable material identities despite duplicate labels, cavity values and zero membranes. Vector PDFs retain readable minimum font size and a 20-page large fixture's boundaries.
- Rendered inspection of plan, enlarged sheet, section/elevation sheet, schedule and material legend: readable titles/labels, visible membrane/cavity treatment and no clipped border or drawing. Local rendering used macOS PDF conversion to JPEG; numeric/vector checks use independent readers.
- Basic source and private packaged MCP each independently reopen their saved wall/undone outputs with zero schema findings. The final workflow lists publish named summaries only; raw call transcripts, synthetic IFC and drawing renders remain ephemeral/local. The previously authorized artifact/log cleanup is complete; its historical workflow records and failure conclusion are preserved. No user project model was used.

Nine workflows are required on the final delivery commit: Tests; F04; F05; F06; F28-A; F28-B; upstream compatibility; 0.7 foundation controls; F03 performance. Exact integration-branch push triggers ensure the final evidence commit is checked. The PR's final exact-head check links are the delivery evidence; intermediate failures remain historical evidence with the correction described above.

## Performance and agentic limits

Three-way model controls use identical medium fixture bytes, 30 process-cold opens, 30 warm/no-change reads/forced height regenerations after five warmups, and raw RSS/heap/array-buffer observations. Local p95 regeneration: accepted main 4.59 ms, release 4.99 ms, candidate 5.24 ms. Three-way browser controls use the same fixture, viewport/camera and 30 painter CPU samples. F03 retains separate cold/warm, no-op/forced rebuild, render and interaction evidence. These synchronous timings are not GPU completion or universal UX latency, and cross-machine timings are not compared as speedups.

PERF-F04-01, PERF-F05-01, TEST-F28-01, MCP01-PM-01 and broader semantic MCP catch-up remain OPEN. This foundation does not re-review MCP-01's submitted project-switch Undo correction. No MCP-01 adapter was imported to pass these tests. Basic live host JSON-RPC single-step assistant Undo/person-step protection and native UI Undo/Redo evidence do not close that finding. Upstream has no equivalent complete recipe/document/join API merely because a generic setter exists.

Under the agentic-core contract, the tested basic transport/tool slice is Verified only for the exact calls exercised. Ribbon arrangement and resize are Presentation only. Material/assembly recipe access, persistent-reference/view/documentation/export parity and F08 join/end controls remain Gap; PM acceptance requires their separate candidate evidence or an explicit scope decision. No new-capability parity exception is inferred from green CI.

## PM workflow and next step

The optional user-launched `devshell/preview-upstream07.command` serves only this isolated candidate on port 8067. Run `npm run fetch-vendor` if its checksum-pinned local libraries are absent. A busy port fails without stopping another preview. No deployment or persistent MCP client is configured.

1. Open a disposable copy of `fixtures/f04/layered-plans.ifc`. Enter the ribbon, open a plan, select a wall, change height and find View range. Switch plan/3D tabs, resize palettes, then use classic fallback and return.
2. Edit a shared assembly, inspect cavity/zero membrane/core references and dimensions, Undo/Redo, save/reopen, and export a plan/section plus schedule/legend sheet. Compare CSV content and vector PDF pages.
3. Open two copies with the same filename, switch the active source explicitly, and verify the expected model owns each operation. Close a tab after a legitimate unsaved edit and recover in a disposable browser profile.
4. Review the basic MCP source/package evidence separately from recipe parity and the pending MCP01-PM-01 re-review. Do not point an assistant at a sole original project for acceptance testing.

After PM reviews this foundation, the proposed next step is Gate C: re-review MCP-01 `9224167` against its original finding, then port the accepted bounded semantic tools onto this foundation in a separate candidate. F28-C and F08 remain subsequent independent integrations. This delivery closes none of their review findings.
