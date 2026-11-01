# BimCraft 0.8 isolated integration candidate

Local review candidate, November 1, 2026. No shared-main adoption, push, PR, deployment or history rewrite is authorized or performed.

## Ownership and pins

Owner: this Codex integration task, for Austin. Independent clone at `/Users/austinhartt/Documents/Codex/2026-11-01/task/bimcraft-08-candidate`; branch `integration/upstream-0.8-20261101`. Base: `75af81b49a3f472de734b0229f64e2140bbcbb10`. Upstream: `getcadcraft/bimcraft` annotated tag `bimcraft-v0.8.0` (tag object `b993ed70c1c07a29516c43d531323fb381173a97`), peeled commit `51c1b44012b98685f43f3ca99a463c240cf0d7ef`. Both remote refs were checked before the merge. The initial local merge is `e7592eb6607062f1ecbecd78930b419695f6f041`; a follow-up compatibility commit completes the candidate. Its final SHA is in the task's `integration-receipt.json` and final response.

The original project-area AGENTS.md and Revit standard were read. No BimCraft `.agents/skills` package or filesystem Codex memory was found; the inspected local memory database had no tables. Existing checkouts were inventoried before mutation, including the dirty dev/integration checkouts, F28-C work and unfinished F28-C alignment merge. None was edited. No existing BimCraft HTTP preview was listening. The running CadCraft desktop app and unrelated local services were preserved. Port 8070 was checked free for this candidate's review preview; tests use separate, recorded local ports and disposable profiles.

F09 is already in main. F28-C draft head `aa75a6f9261e6f2d79e4fe805a287d35cf272d28` was not imported. Independent main and exact-0.8 controls are sibling clones owned by this task.

## Actual conflicts and resolutions

Twelve paths conflicted, rather than the earlier overlap estimate of 26:

| Path | Resolution |
| --- | --- |
| `app/agents.js` | Retain fork bindings, exact authored schemas, all semantic tools, busy/ownership checks and receipt-based Undo/Redo; add upstream model/analysis/query tools. Browser-only Problems registration is guarded. Generic edits notify the app's actual change renderer so Studio observes their finished step. |
| `app/drafting.js` | Keep upstream writer-level and batch APIs with stable per-operation identity reservations across replay. |
| `app/lang/{en,es-MX,id}.json` | Three-way merge by translation key. No conflicting semantic values; preserve fork additions and upstream additions. |
| `app/model-ui.js` | Keep both fork extension-dispatch facade and upstream problem-key lookup. Expose actual busy state to the journal hook. |
| `devshell/index.html` | Keep upstream generated page and overlay accepted English translations in its embedded catalog. |
| `devshell/site/assets/js/app-input-ui.js` | Keep F09 sequence cancellation and reset behavior together with upstream owned pass-through keys and while-busy handling. |
| `tests/tools/bimcraft-test/draw06-test.mjs` | Retain strict exact catalog equality, updating expected names to the pinned union: 31 read and 63 read/edit model tools. Operation/refusal assertions unchanged. |
| `tests/tools/cli/headless/tools.mjs` | Keep checked fork document bindings, Redo and explicit unavailable-sibling diagnostics; retain upstream additions. |
| `tests/tools/mcp/pack.mjs` | Preserve private standalone fork closure; include the new server-side module dependencies. Optional shared Studio/account/skill-pack services remain unavailable where absent. |
| `tests/tools/mcp/package.json` | Preserve private fork identity and accepted transport contract version (`0.7.0-mcp01.1`); this is not an npm release or the application version. |

The initial merge command exited with `stash failed` without changing the clean clone; retry with automatic stashing disabled produced these conflicts. No owner work was stashed or reset.

## Compatibility changes beyond text conflicts

- Studio journal probes/runs now bind to actual editor identity and observed stack entries/labels, not just depth. Project changes, replaced entries and ownership changes invalidate old tokens. Busy state refuses journal execution. Exact equal-depth native project switching and subsequent valid Undo are tested.
- Coalesced model changes replace the affected stack entry while retaining one Undo step. This advances existing revision bindings and makes pending history guards observe the edit.
- Both single and batch wall dimensions preserve GlobalIds through Redo. The upstream refactor had moved allocation into the replay body.
- Copy preserves/remaps explicit F08 end records and hosted openings, consumes stable replay identity slots, and refuses an external saved join relation rather than silently dropping it. Invalid/duplicate move vectors refuse before mutation.
- The optional shared account, skill-pack and Studio-device modules are not included in the upstream standalone snapshot. The dev server explicitly identifies standalone mode and avoids requesting those absent services; ordinary local device UI can still load. No substitute account or automation service is fabricated.
- Live texture reads exclude temporarily closed IFC handles during an actual model rebuild, then resume from the replacement model. This fixes the unexpected console errors exposed by F06.
- Upstream rollback-preview model tools now execute on a separate IFC copy. The current document identity/revision is checked before and after; no live Undo, Redo, UI commit or persistence callback runs. A document switch or intervening edit refuses the result. The live host, source stdio and isolated package all exercise this implementation. Tools without an explicit supported preview continue to refuse honestly.

## Revit behavior comparison and bounded adoption

Official documentation reviewed: Revit 2026 [Align Elements](https://help.autodesk.com/cloudhelp/2026/ENU/Revit-Model/files/GUID-9C867721-1970-4ECC-90F1-3C112B9EC2E6.htm) and Revit LT 2026 [Move Elements](https://help.autodesk.com/cloudhelp/2026/ENU/RevitLT-Model/files/GUID-399D3557-93A0-42B7-AF77-E28931823335.htm). These are documentation evidence; native Revit was not exercised.

| Workflow | Candidate result | Boundary |
| --- | --- | --- |
| Explicit finish/core/axis targeting | Accepted F09 analytic references, selection, numeric input, cancellation, bindings and persistence retained | Does not claim physical joined-face targeting or persistent alignment constraints |
| Existing wall edit / grip | Accepted carrying of joined ends, host handling and Undo/Redo retained | Bounded accepted straight-wall paths |
| New upstream Move | Retains upstream independent translation (`carryJoined:false`) and preserves accepted carrying wall-change/grip paths; UI states that unselected joined walls stay | No preservation blocker. A future unified Move/Disjoin policy is a product enhancement, not an unresolved compatibility fix |
| New upstream Align/Distribute | Uses actual physical wall outlines, including curved and offset-reference walls, for outer bounds; retains F09 authored settings | The symmetric centreline bounds bug is fixed. A reference-driven alignment lock is a separate feature decision; no existing F09 command was removed or reinterpreted |
| New Copy | Authoring settings/hosts and explicit join records retained; incomplete saved relation scope refuses atomically | Broader selection/host treatment and command exposure need review |
| History | Human-owned MCP Undo, confirmed receipts and native interleaving protection retained; Studio protocol hardened | Actual Studio host application's project journal was not driven; its app-side protocol was exercised in Chromium |
| Simulation / regulations | Upstream estimate/design-aid descriptions retained | No code-approval, EnergyPlus engine execution/certification or engineering acceptance claimed |

## Verification and limits

Detailed current evidence and exact counts are summarized in the task's `integration-receipt.json`. Full logs are adjacent to this clone; generated test reports and IFC/PDF/CSV artifacts remain in ignored `.cc-test`. Existing tests are retained; no tolerance, refusal, error gate or failing workload was weakened. Tests that regenerate the same `.cc-test` mirror must run sequentially. Early parallel invocations collided; their failed logs remain, and sequential retries are identified separately.

Verified here: retained baseline stages; all fork unit/contract/history suites; new history/copy/revision/catalog regressions; source and isolated packaged stdio; F08/F09 and MCP-01 live HTTP; actual native human editing, project switching, save/reopen and layout flows; independent IFC EXPRESS, exact geometry/host relations, CSV recipes and vector PDF checks; 41 selected upstream modes compared with exact release; F03 12/36/96-wall model workloads with five warmups and thirty samples.

The missing Problems UI was a recoverable standalone packaging omission: the 0.8 manifest already enables it. The official shared `app-problems.js`, `problems.js`, `problems-pdf.js` and stylesheet are now bundled, with exact source URLs, Apache-2.0 notices and retrieved-content SHA256 values in `shared-problems-provenance.json`. This is an explicitly recorded supplemental shared-shell snapshot, not falsely attributed to the pinned release git tree. The local integration reuses one real static app-bar button and includes the assets in the browser-edition packer and PHP/fallback rendering. Existing 103 English Problems translations were already present. The workspace uses its native Cmd/Ctrl+Shift+M command; the established layout also has the app-bar button.

Follow-up results: the original strict input suite passes **81 assertions**; the unchanged Modify suite passes; the unchanged hazard suite passes **71 assertions** using the installed CadCraft Studio DetailCraft **0.7** writer copied read-only into the ignored test mirror (content manifest retained). That is a successful test against this local writer version, not a claim that DetailCraft 0.8 was tested. Selected upstream modes are now **40 passing / 1 dependency-blocked**. The unchanged `r52 --only b,c` sections pass **39 assertions**. The complete `r52` mode still cannot execute its Poppler image/page checks because neither `pdfimages` nor `pdfinfo` is installed; searches covered Homebrew, local bins and installed application bundles. No system packages or credentials were added. Additional installed-pypdf checks pass for the actual r52 two-page output's exact 2×2 RGB pixels, a separately generated attached JSON/image PDF, and the Problems report's finding/acceptance reason. These supplementary checks do **not** turn the original Poppler gate into a pass.

The restored Problems UI passes actual source registration, all six assistant-tool registrations, native acceptance, saved IFC records, human Undo/Redo and PDF download. Previews preserve actual IFC bytes, revision and human Redo, and refuse stale bindings/project switches; source, packaged and live transports pass. Browser screenshots were inspected. Failed early harness attempts and the npm-cache attempt remain in the logs; a task-local npm cache resolved packaging without touching the user's cache. PHP-rendered/browser-edition execution is not verified because PHP is absent; the served fallback and its real module requests are verified.

Browser/GPU or representative-house performance is not inferred from CPU samples. Existing PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01 and broader MCP follow-ups remain open. Cloud CI, OS-specific/native Studio acceptance, all unselected upstream modes, full vendor audit and the separate F28-C reconciliation are not certified by this local run.

Ready for local review, not adoption. Remaining verification is the Poppler gate, native Studio host and platform/CI acceptance. The installed native Studio is 0.7.0 (Info.plist) and lacks the 0.8 journal reporter/probe code; the required native 0.8 host is unavailable locally. Its existing running session was left untouched. The Move policy and reference-driven Align lock are optional product enhancements; they do not block preserving current supported behavior, and detached model previews are implemented. Publication/adoption still requires explicit authorization. No F28-C owner branch should be repaired or rebased as part of this foundation.
