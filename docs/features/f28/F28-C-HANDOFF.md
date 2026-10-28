# F28-C — real documentation workspace

**PM changes update:** F28C-PM-01 is addressed by the subsequent [Properties source ownership fix](F28-C-PM-01.md). Use that addendum and PR #12 for the current exact source/delivery heads and validation. The original delivery evidence below remains historical.

Draft delivery for PM review; established layout remains default and explicit fallback. No merge, deployment, roadmap change, default switch or cross-chat message.

## Revisions and preview

- Approved integrated base: **`3e42c21e33e642d1e07bea2fc3356344f91db00e`** (PR #11). Parents: `0ccb30d735554b012cf21e02252ded4612fd2f54`, `138df9f6bf593bfc677d3d468426a03beb727e59`.
- Frozen application/test source: **`eb389b64c21dc2ab245fc9c94866a997f8757996`**, tree `3965c29deb2012569f1b205ba8692589de2e1d85`.
- Delivery is the published evidence commit containing this handoff. Its exact SHA and the CI runs on that SHA are recorded in [draft PR #12](https://github.com/drsurfbum/bimcraft-SDH/pull/12). App and behavioral-test files are unchanged from the frozen source; only documentation, generated action inventory and evidence follow it.
- Complete-history bundle, exact approved tree/parents, missing-object traversal and ancestry verified. No newer base substituted. [Revision evidence](../../../evidence/f28-c/revisions.json), [review-source hashes](../../../evidence/f28-c/reference-hashes.json).
- Isolated checkout: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f28-c`; branch `feature/f28-c-documentation`. Repository-local author: DrSurfBum / `80549907+drsurfbum@users.noreply.github.com`. Other checkouts, previews and unsaved browser work preserved.

Run `devshell/preview-f28-c.command` in this checkout, then open [live workspace](http://127.0.0.1:8039/?workspace=live&space=paper). Port 8039 was free, but this session refused listener startup with **`listen EPERM`**; no active local preview is claimed. The executable launcher is supplied. Open the root URL without `workspace=live` for the default established layout. The live title bar's **Established layout** button restores the retained controls; **Live workspace** returns without closing the IFC.

## Supported workflows and ownership

The approved ribbon grouping, contextual controls, Properties above Project Browser, drawing tabs, workspace, bottom controls and status bar remain. F28-A/B authoritative commands, wall editing and fallback remain intact. No IFC schema, geometry engine, persistent recipe/view store or parallel export implementation was introduced.

- Real plan, RCP, callout, section, cardinal elevation, schedule and saved-sheet sources open through Project Browser and drawing tabs. Browser selection shows Properties; Enter/double-click opens the source; element selection remains distinct. References use source IDs and current editor ownership, including projects with identical display names. Closing a drawing retains the project and edits.
- Original canvas instances and per-source cameras remain across supported plan/RCP/3D navigation and palette resize. Section/elevation/sheet drawings use the existing vector paper composer. Ctrl/Command-wheel zoom and Fit affect that paper viewport; they do not change the IFC. Model picking belongs to plan/RCP/callout and 3D; placements use **Edit sheet**.
- Existing section-line, detail-line, filled-region, callout and persistent wall-reference dimension tools use native options, numeric entry, unit parsing, journals and selected-annotation Properties. No driving dimensions or new constraint/geometry scope.
- Actual effective view settings, templates, View Range, detail and scale remain synchronized. Template-controlled and unsupported records refuse writes through the existing editor. Section/elevation edits use their existing projected-view records; callout detail follows its parent.
- Real F06 assembly schedules and material legend retain actual type/material IDs, unused definitions, exterior-to-interior order, core flags, ventilated cavities and zero membranes. Displays explicitly use nominal mm; these are documentation, not takeoff. Native CSV and existing vector PDF writers are used.
- Native New Sheet / Edit Sheet provides source placement, drag/scale/remove and save/delete. Real source/continuation references survive IFC save/reopen. Custom sheets require explicit continuation placements and keep the existing continuation warning. Schedule PDF exports all existing continuation pages. Missing/deleted sources retain references and diagnostics. Shared type edits update drawings and tables; Undo/Redo restores them.
- **Existing tools** provides named established-layout routes for retained library/materials, links/federation, files/folders/import/export, modeling, Properties, color, issues, analysis, points, assets, daylight, Help/Settings and shared panels. Detached panels/windows are not taken over. See the [command/action checklist](F28-C-COMMANDS.md) and reproducible source inventory (41 files, 2,182 occurrences, 944 distinct hooks). Hook presence is not an enablement or test claim.

Supported view settings, annotations, types/materials and sheet source references are persisted in the existing IFC records. Open drawing tabs, browser selection and paper viewport zoom/scroll are intentionally transient. No document is bound by display name.

## Validation and actual downloads

[Evidence index](../../../evidence/f28-c/README.md) records exact environments, runs, reports and artifact retention. Failed intermediate attempts remain preserved; no assertions or gates were lowered.

| Check | Result / evidence |
| --- | --- |
| Focused F28 | 13/13; [local log](../../../evidence/f28-c/focused.log). Source-ID/editor isolation, command guards, supported integration and original-project isolation. |
| F03 harness | 4/4; [log](../../../evidence/f28-c/f03.log). |
| Offline baseline | 678 passed, zero failed, all 13 stages; F02/F04/F05/F06 21/13/18/23. [Final log](../../../evidence/f28-c/baseline-final.log). Optional reader/sibling-service skips stay separate. |
| Legacy local runner | 3/3 files; optional dependencies skipped, [log](../../../evidence/f28-c/legacy.log). |
| Main CI | PASS on frozen source: baseline, F03, installed independent readers, F04/F05/F06 export checks and legacy tests. All seven source workflows pass; exact delivery-head runs are linked in PR/evidence. |
| Existing browsers | F04/F05/F06 and F28-A/F28-B run unchanged in scope. B independent fixtures now have fresh storage contexts; original refusal assertions remain. |
| F28-C browser | **39/39**, zero application exceptions. Real source navigation, annotation edit, schedule/legend, source + continuation sheet placement, F28-B shared type edit, Undo/Redo, actual downloads/reopen, duplicate-name original isolation, missing/unsupported sources, templates, camera/picking/field preservation, fallback and links; separate legitimate autosave recovery. [Report](../../../evidence/f28-c/browser.json). |
| Actual downloaded IFC | IfcOpenShell/EXPRESS: **0 schema findings**; 2 walls, 9 types, 2 persistent dimensions, annotation, callout and 3 sheets. Stable payloads/references and independently reopened original checked. |
| Actual CSV / PDFs | 53 assembly-layer rows, 15 legend rows. Eight PDFs: plan/section/edited section/elevation/continuation sheet/drawing sheet each one page; assemblies five pages; legend two pages. All vector, no raster XObjects. Section cavity 25.4 mm, four membrane line paths, maximum checked layer error below `7e-13` mm. [Independent report](../../../evidence/f28-c/independent.json). |

The initial local baseline without Poppler retained the inherited residential 194/195 minimum-count failure. With real bundled Poppler available the final aggregate passes; historical logs remain. Installed-reader CI has additional coverage, not retroactively counted as local checks. Shared PHP/free mount selectors and retained extension roots remain; the browser evidence runs the PHP-free devshell. A PHP-served manual session could not be run here.

## Inspected captures and export pages

Unedited captures from the frozen-source CI run: [before F28-B](../../../evidence/f28-c/screenshots/before-f28-b.png), [real plan](../../../evidence/f28-c/screenshots/plan.png), [selected wall](../../../evidence/f28-c/screenshots/selected-wall.png), [section](../../../evidence/f28-c/screenshots/section.png), [schedule](../../../evidence/f28-c/screenshots/schedule.png), [composed sheet](../../../evidence/f28-c/screenshots/drawing-sheet.png), [900 × 700 window](../../../evidence/f28-c/screenshots/narrow.png), [missing source](../../../evidence/f28-c/screenshots/missing-source.png).

Actual downloaded PDFs rendered by Poppler: [edited section](../../../evidence/f28-c/exports/export-edited-section.png), [composed drawing sheet](../../../evidence/f28-c/exports/export-drawing-sheet.png), [schedule continuation page](../../../evidence/f28-c/exports/export-assemblies.png), [material legend](../../../evidence/f28-c/exports/export-legend.png). Normal/narrow controls, paper extents, wall layers, continuation rows and labels were visually inspected. The small fixture includes inherited crowded plan dimension labels; it is not a representative-house usability claim.

## Performance, limits and F28-D

**PERF-F04-01 and PERF-F05-01 remain OPEN.** [Raw same-machine Node comparison](../../../evidence/f28-c/performance-node-delivery.json) uses Apple M5 Pro / macOS arm64 / Node 26.9.0, the same F04/F05 fixtures, five warmups and 30 samples. Separate geometry/projection, composition, SVG and PDF phases are retained. Browser raw samples compare base/source on one Linux runner at Fine / 900 × 600 / identical camera and fixture; full drawing-set generation is separate from draw CPU submission. GPU completion and interaction latency are not measured. No optimization or representative-house responsiveness claim; do not pool hardware environments.

**TEST-F28-01 remains OPEN.** CI demonstrates isolated independent fixtures, unsupported-record refusals and real dirty-project recovery through the normal autosave modal. Product autosave remains enabled. Full local execution is still required by the follow-up criteria and was blocked by listener permissions. Historical B PM failure and all C development attempts remain available.

F04/F05 remain bounded straight-wall documentation; curves/junctions/roofs, new constraints, driving dimensions and attachment/profile behavior do not enter this slice. F06 keeps nominal-mm and explicit custom-sheet continuation semantics. Existing WinAnsi PDF text limitations remain. General wall-instance Copy/Cut/Duplicate, Mirror/Align, curved live placement, 31 unmapped tools and nine uncertain mappings remain unavailable. F09/F24 stay audits.

Library access was exercised and honestly returned **404** from the absent external service. Linked IFC add/reload/unload and source retention were exercised through the existing HTML-input host path. Native OS picker automation, every external library/feed, detached windows, full PHP-served/platform behavior and all legacy actions were not exhaustively tested.

F28-D/PM work: complete local recovery regression, configured library/native-picker and PHP/platform checks; translation/theme/focus/docking polish; review inherited crowded drawing labels; broader retained-action usability coverage; profile the two open performance issues. Any default-layout switch remains a separate PM-approved decision.

Automatic approval review rejected publishing the synthetic IFC fixture because publishing model contents was not specifically authorized. Tests now generate it locally from the existing F05 fixture through existing operations. Actual IFC downloads are validated inside CI and excluded from uploads; reports, CSV/PDF and screenshots are published. No alternate upload of the rejected IFC payload was attempted.
