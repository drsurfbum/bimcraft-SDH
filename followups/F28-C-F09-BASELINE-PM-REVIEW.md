# F28-C review against adopted F09 main — October 28, 2026

**Decision: not ready to merge against the new baseline. PR #12 remains draft/unmerged.** Meaningful documentation MCP coverage is now implemented and independently exercised; the remaining adoption gate is published reconciliation and validation with F09, plus a reproducible browser-export harness.

## Exact inputs and isolation

- Approved main after PR #18: `75af81b49a3f472de734b0229f64e2140bbcbb10`.
- Reviewed C delivery: `aa75a6f9261e6f2d79e4fe805a287d35cf272d28`.
- [PR #12](https://github.com/drsurfbum/bimcraft-SDH/pull/12).
- Fresh detached PM checkout; no production files, feature-owner checkouts, branches, original unfinished merges or previews changed.
- All thirteen published C-head workflow types pass. This is C-only evidence: that head does not include adopted F09. The new main has twelve applicable types; the eventual combination must retain those and both C-specific workflows (fourteen types).

## Blocking integration gates

**F28C-INT-01 — reconcile and publish the new-main combination.** A fresh `git merge-tree --write-tree` simulation finds five conflicts: `.gitignore`, `app/agents.js`, `app/lang/en.json`, `app/model-ui.js`, and `tests/tools/bimcraft-test/draw06-test.mjs`. No combined runnable candidate was constructed or certified in this review. Preserve all accepted MCP-01/F08/F09 tools, protected records, assertion names, schemas and native behavior; reconcile catalogs by capability, not by choosing one side. Retain all 21 documentation tools plus accepted tools, including `wall_reference_resolve`.

**F28C-INT-02 — deliberately join input and documentation activation.** Static inspection of the automatic merge retains F09's intentional pre-C denial of workspace `model.dimension` and `model.detail-line` in `app/input-bimcraft.js`. The merged `ccInputHooks.command('model.dimension')` also returns `f09.documentation` whenever the workspace is active. C implements real documentation actions, so leaving those guards unchanged would keep DI/DL unavailable through those routes. This is a static integration finding, not a runtime reproduction on a conflict-resolved combination and not a defect claimed in either accepted A or published C alone. Wire the same authoritative actions/availability in both layouts, retain dirty-input/selection/tool guards, and test DI/DL, keyboard and pointer context menus, command palette, cancellation, Undo/Redo and real save/reopen on the published combined head. Test enabled and unavailable contexts explicitly.

**F28C-TEST-01 — make the live export check reproducible without hiding failures.** On macOS Chromium 151 the unmodified live harness timed out waiting for the first CSV after ten PDF downloads; a second unchanged-assertion run with fresh output directories failed at the same boundary. A diagnostic logging run passed all exports, and a harness-only run pacing each export by 1.1 seconds also passed all original assertions. Actual outputs from both successful runs independently validate. This supports a timing/environment-sensitive harness issue but does not establish the browser's precise root cause or a product defect. Retain both failures, investigate/request pacing explicitly in test code if appropriate, and rerun the final pinned Linux workflow and a reproducible local live run. Do not replace native downloads with direct file creation or remove CSV checks. A first pre-start attempt used the wrong Playwright environment name; that PM setup error is separately retained and is not a feature failure.

## Fresh verification at C aa75a6f

- 82 focused model/semantic tests pass with no failures or skips.
- Actual source stdio: 11 groups / 120 requests. Isolated packaged transport: 11 / 120, with byte-identity/package closure and required-module refusal checks.
- All 21 documentation tools expose shared schemas and real operations for sources, views/templates/callouts, annotations, persistent dimensions, schedules/legends, sheets and explicit exports. Atomic preflight, ownership, stale/read-only refusal, no-op history and real Undo/Redo are exercised.
- Actual authenticated live HTTP: 16 groups / 141 requests, zero page exceptions, in each successful diagnostic and paced run. Includes dirty Properties refusal, identical-ID foreign editors, native Undo/person/source/project interleavings, confirmed own commits and actual owned history checks. Both successful runs retain all original assertions; neither replaces the two original timeout results.
- 50 native documentation browser checks pass. Its comparison control was changed only from the historical baseline to main75af; C and main are served separately, not represented as a combined build. Covers source-ID targeting/duplicate names, actual editing/history/reopen, schedule/legend/sheet behavior, recovery and layout preservation. Actual native IFC/CSV/vector exports independently validate.
- Source/package/diagnostic-live outputs independently inspected with IfcOpenShell/EXPRESS and vector readers: zero schema findings/duplicate GlobalIds; two walls and three persistent dimensions per saved IFC; complete assembly CSV (62 records, 53 layer records) and 15 legend rows; ten PDFs /26 pages per transport, zero raster images and bounded visible vector paths after the declared crop. The paced live outputs pass the same reader checks. These are repeated transport evidence, not summed unique feature tests.
- Section and sheet exports were rendered and visually inspected; readable, uncropped supported fixture output. Fixture accuracy is not universal CAD accuracy or proof of all residential cases.

## Scope and follow-ups

The previous missing semantic documentation MCP gate is supplied in this candidate; do not keep describing it as unimplemented. Published new-main reconciliation and combined transport/native/output/CI acceptance remain unfulfilled. No new claim of full Revit parity is made; retain the versioned behavior comparison and bounded existing F28 scope. Established layout remains default/fallback.

PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01, broader semantic catch-up, CI runtime headroom and inherited narrow-window usability stay OPEN. F28C-PM-01 and accepted F08/MCP/foundation closures retain their prior disposition. No required user-only defect test is identified: the integration owner can resolve these gates. Optional user review follows publication of a combined candidate. This review does not authorize marking C ready, merging it or deploying the app.
