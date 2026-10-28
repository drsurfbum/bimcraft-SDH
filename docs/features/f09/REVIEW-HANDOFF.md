# F09-A PM re-review handoff — October 28, 2026

PR #18 remains **draft**. This is a corrected bounded implementation and evidence handoff, not a readiness transition, PM acceptance, merge or deployment. The original [October 27 handoff](https://github.com/drsurfbum/bimcraft-SDH/blob/1158096198e80aed4b206db7704c13c64162c3a7/docs/features/f09/REVIEW-HANDOFF.md) and its failures remain historical evidence.

## Pins and preservation

- Approved main: `60dbd3abff0d1d98ce1a85375de7b6087709c8ee`; runtime baseline: `0329eece15fedbfeb14025683d7fe9da78263ef2`. Remote main was reverified at the approved pin; no reconciliation with C was selected.
- Public branch: `feature/f09-interaction-foundation`; draft [PR #18](https://github.com/drsurfbum/bimcraft-SDH/pull/18).
- Active local branch: `candidate/f09-resume-20261028`, checkout `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f09-resume-20261028`.
- Recovery started from published `1158096198e80aed4b206db7704c13c64162c3a7`. Original checkout `bimcraft-f09` remains clean at `b80ca88428b99173fa21d540e406df180e9987f5`. Its sibling relationship to public `858ab67959b2ef850af5c7e4a21b41e1c8edfde6` and identical tree `c8d0d25032611bf07fd4cf2bae8121a31a3af1e6` were preserved.
- Corrected implementation/test cutoff: `3020661fad4f279a9caf82817f6901da4fe2cafc`. All resume commits descend normally from the published delivery; no reset, rebase, force push or discarded recovery work.
- This handoff and the two summary JSON files form a later **evidence-only** commit. Its exact delivery SHA and completed final-head workflow links are reported in the PR body after checking that commit. Evidence at the implementation cutoff is not silently relabeled as delivery-head evidence.
- Shell GitHub DNS remains denied. Public updates used the connected GitHub service, with exact tree/commit hashes verified and imported into this candidate. Its `origin` remains the preserved local recovery checkout; do not assume `origin` is the public PR remote.
- Repository-local author: DrSurfBum / `80549907+drsurfbum@users.noreply.github.com`. Original checkouts, previews, browser projects, unfinished merges and duplicates were not reused or cleaned.

No F28-C branch was imported or owner checkout edited. F29 remains planning only. Established layout remains default/fallback. No shared roadmap, persistent MCP client, credentials, package publication or model-payload publication changed.

## Corrections to PM gates

| Gate | Correction and executed proof at the implementation cutoff |
| --- | --- |
| Strict input `app.palette` | Approved main declares the stable command but standalone markup has no launcher. Added a real mounted launcher/search dialog using `ccInput.paletteItems()` and authoritative current availability/run. Exact mounted owner declared; strict selector assertion retained: **81/0**. Runtime opens/searches/executes Wall without history in both layouts; Ctrl/Cmd+K also opens it. One launcher moves between the established app bar and workspace header. |
| Hidden units control | Wall placement exposes workspace units; the established native global units live in the CadCraft toolbar rather than the input ribbon. The test explicitly uses that native profile, asserts visible/enabled, exercises **all six** units without geometry changes, then restores the chosen ribbon profile. Reopen uses the visible ribbon Draw command, not its hidden source button. |
| Keyboard/pointer menus | Both Context Menu key and Shift+F10, arrows, Escape/focus restoration, native field menus, right-button pan, selection preservation and stale selection/document guards execute in both layouts. Added the native selected-wall query bridge; no synthetic availability. Composing and OS-modified menu keys keep ownership. |
| Dirty Properties | Drawing right-click prevents focus blur and refuses its menu with an actionable finish/cancel explanation while a field is dirty. Draft/history remain unchanged. Native Escape cancels; Enter makes one existing model commit; native model Undo restores it. Native field text Undo leaves model history alone. |
| Placement/grip lifecycle | Core exterior, finish exterior and wall axis are visibly distinguished before exact pending placement. Numeric placement commits, Undo/Redo, grip cancel/commit, host/orientation/type/reference identity and actual save/reopen pass in both layouts. Native nearby distinct hosts refuse ambiguous placement until an explicit candidate is chosen. |
| MCP and outputs | Actual source stdio, isolated packaged stdio and live HTTP execute `wall_reference_resolve` and existing placement/change/history operations. Independent reader checks actual saved unit/source/package/established/workspace/live files, physical profiles, EXPRESS schema, CSV layers and vector dimension lines. |

The API bridges expose the existing extension `ask` dispatcher and selected authored-wall query. The palette relocation hook only moves presentation. No second keyboard engine, command registry, geometry resolver or history was introduced. See [INTERACTIONS.md](INTERACTIONS.md) for the shortcut/context/snap/Modify matrices and unresolved product choices.

## Acceptance evidence

Implementation run [40730249765](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40730249765) passed every F09 step. [Sanitized reports and both layout screenshots](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40730249765/artifacts/12834802276) are retained. Reports were retrieved; screenshots are available for PM visual review, not claimed as independently inspected in this restricted local runtime.

[RESUME-IMPLEMENTATION.json](evidence/RESUME-IMPLEMENTATION.json) contains execution-derived results:

- F09 unit tests **8 passed / 0 failed**; inherited model/precision group **64/0**; strict input **81/0**. These overlap other suites and must not be summed as unique coverage.
- Browser/live report: **19 reported groups**, both layouts, zero browser errors. This includes actual menu keys, dirty text paths, explicit core/finish/axis placement, existing aligned-dimension reference picks/cancel in established layout, native grip commit/cancel, Undo/Redo, save/reopen, ambiguous candidates and native project switching.
- Source and package each execute six reported semantic groups: exact six-reference reads; actual schema/missing bindings/foreign/stale/curve/non-wall refusals; custom-type placement/Undo; wall change/Undo/Redo; separate-document/save/reopen; read-only permission/refused mutation. Every required argument is omitted in a real refusal call. Live HTTP executes the common semantic workflow and saves its real browser model.
- Independent output reader: **six saved IFCs**, zero EXPRESS findings each, exact affected wall axes/physical profiles at the unchanged **0.005 mm** bound, **11 CSV layer rows** matching authoritative recipes per file, vector-only plan PDF and **two dimension lines per PDF**. Native established/workspace/live saves and the unit lifecycle each verify **five actual opening-to-host relationships** and two dimension curves/witnesses. Source/package workflows deliberately edit an unhosted wall; their targeted independent reports do not certify a hosted move.
- Candidate discovery uses unchanged F03 **12/36/96-wall** fixtures, five warmups and thirty samples per mode. Implementation CI explicit p95: **1.182 / 0.468 / 3.267 ms**; existing snaps: **0.106 / 0.123 / 0.605 ms**. Raw samples and environment metadata remain in the artifact. Pure CPU discovery is not browser/GPU latency or closure of a performance target. Final-head measurements may differ and are identified separately in the final receipt.

The final delivery must repeat all twelve applicable workflow types: Tests, upstream compatibility, foundation controls, MCP-01, F03, F04, F05, F06, F08, F28-A, F28-B and F09. Its PR receipt supplies completed run links and actual counts. Foundation package closure/identity and accepted native person-edit/Undo/project-switch/receipt controls are required final checks; historical success does not substitute for their final-head execution. Optional availability notices, canceled runs and duplicate triggers are not passes.

## Agent capability matrix

| Capability | Tool / transport | Boundary |
| --- | --- | --- |
| Resolve analytic target | `wall_reference_resolve`, read permission; source/package stdio and live HTTP | Required documentId, expectedRevision, wall GlobalId, reference enum, station [0,1]. Raw-mm `p`/segment, stable level GlobalId, storey-plan frame, analytic/nonpersistent classification. No IFC/history writes. |
| Exact placement | Existing `walls_add` | Custom authored type, explicit target coordinates, atomic history and Undo. UI uses existing drawWalls path. |
| Straight-wall change | Existing `wall_change`, `undo`, `redo` | Existing domain guards, joins, host/reference behavior and person-owned history remain authoritative. No new receipt/history implementation. |
| Keyboard/menu/palette | Presentation only | Same commands/availability and source/editor guards; no tool per button. |
| Transient target selector | Presentation state; deterministic target resolution above | No persistent constraints/settings/associative dimensions created by ordinary snapping. |
| Dimension/detail/trim and broader Modify | Inherited bounded UI and explicit semantic gaps | No claim of new dimension/export API or full app parity; C-specific documentation activation stays with C. |

MCP-01 and F08 catalogs, protected/alias guards, permissions, transactions and request-confirmed history semantics remain required. Their retained workflows exercise native human interleavings on the final delivery. The read-only resolver introduces no modifying receipt to infer from net history growth.

## Failures and retries retained

[RESUME-RETRIES.json](evidence/RESUME-RETRIES.json) records all queried resume PR-triggered run metadata, including failures and concurrency cancellations. Earlier PM triage and failures at `1158096` remain linked in the historical handoff.

| F09 run | Observed failure | Correction |
| --- | --- | --- |
| [40725298020](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40725298020) | Palette availability called a missing facade method | Forward existing model extension dispatcher |
| [40726135404](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40726135404) | Units still hidden in established input ribbon | Use visible native toolbar/profile and retain six-unit assertions |
| [40726644151](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40726644151) | Selected-wall menu query missing from extension API | Expose existing pickedWalls query |
| [40727276282](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40727276282) | Intended background click hit overlaid toolbar | Require unobscured empty canvas point; keyboard keys themselves had completed |
| [40728189960](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40728189960) | Demo clicked after Escape returned to Select | Restart native Wall per reference case after Undo/rebuild |
| [40728797297](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40728797297) | Screenshot preparation clicked hidden Draw source control | Click visible ribbon command after reopening |
| [40729400003](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40729400003) | Workspace hides the app-bar launcher | Move the same launcher through existing layout lifecycle |

Local repeated source/package calls also correctly refused an existing saved.ifc; those failure logs and prior output directories remain local. Fresh outputs were used for retries. Local output-script development initially refused missing UI outputs and corrected its PDF pen-width classification; no coordinate bound/assertion was removed. No failing benchmark/workload was shortened.

## Preview, test guide and remaining scope

Port **8061** was checked without replacing any preview. TCP bind returned **EPERM**; shell DNS also prevents local GitHub/artifact downloads. Execution access itself works, so this is not the old generic disconnection claim. Automated native demonstrations and live HTTP ran in isolated CI Chromium. A user-navigable local preview is the remaining environment limitation, not a claimed success.

On an ordinary permitted local terminal, verify 8061 remains unused, then run `devshell/preview-f09.command` from this candidate. If the port becomes occupied, use `node devshell/serve.mjs --port <unused-port> --host 127.0.0.1 --offline` and record that port. The current session cannot grant its denied listener permission or replace an existing preview.

Use a separate browser profile and synthetic `fixtures/f04/layered-plans.ifc`; leave person-owned browser projects untouched:

1. Open the fixture and Draw/plan. Use Keyboard shortcuts to explicitly choose BIM ribbon; WA starts Wall once. Ctrl/Cmd+K searches actual commands. Unsupported model Copy remains unavailable; clipboard Copy stays separate.
2. Select one wall. Type a height draft and right-click the drawing: draft/history stay intact and the explanation asks to finish/cancel. Escape cancels, Enter commits normally, native model Undo restores it. Text-field Undo stays native.
3. Right-click another wall: selection stays until Select this wall. Try Context Menu key and Shift+F10 from the drawing; Escape restores focus. Active-tool menu offers explicit Cancel. A right-button pan opens no menu.
4. Choose Core face: exterior, Finish face: exterior or Wall centerline explicitly; inspect the analytic line and feedback before commitment. Nearby hosts require the candidate chooser. Snap off and Escape are transient; no constraint is saved.
5. Place with a numeric expression, then exercise a straight-wall midpoint grip. Cancel, commit, Undo/Redo and save/reopen. In established layout, DI starts existing aligned reference dimension; its picks/cancel are separate from ordinary placement snaps.
6. Repeat supported scenarios in `?workspace=live`; C-specific dimension/document activation stays honestly unavailable.

Later F09 slices remain authored-wall Move/Copy host treatment, Rotate/Mirror/Align/Offset/Split, richer context menus, agreed operation-specific Space/Tab/snap overrides/cycling, and joined physical targeting distinct from analytic references. No universal core-first/finish-first priority, new tolerance or persistent attachment rule was selected. Native CI uses Linux Chromium; macOS browser/IME hardware behavior is not separately certified by that run.

Shared C integration touchpoints: additive ccInputHooks/inputCommand routes; guarded engineRun; shared input sequence/native delegation; PlanView context-pan routing; model UI snap/menu lifecycle and ask/selection/palette bridges; existing dimension extension entry. Preserve these while C adds its owned documentation adapter. No C implementation was copied.

PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01, broader MCP catch-up, CI runtime headroom and narrow-window follow-ups remain OPEN. F08-PM-01/02, MCP01-PM-01 and UP07-PM-01/02 retain accepted closures and their regressions. PM retains acceptance authority; this PR remains draft.
