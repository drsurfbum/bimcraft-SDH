# F09-A PM re-review — October 28, 2026

**Decision: the bounded F09-A slice is ready to merge. No blocking finding remains in this review.** PR #18 remains draft/unmerged; readiness transition and adoption have not been performed. Full F09 remains incomplete beyond this slice.

- Approved main: `60dbd3abff0d1d98ce1a85375de7b6087709c8ee`.
- Implementation/test cutoff: `3020661fad4f279a9caf82817f6901da4fe2cafc`.
- Reviewed delivery: `731fa6604418b20eaea7253a8e331ba5b4049450`.
- [PR and exact-head CI receipts](https://github.com/drsurfbum/bimcraft-SDH/pull/18).
- [Delivery handoff](https://github.com/drsurfbum/bimcraft-SDH/blob/731fa6604418b20eaea7253a8e331ba5b4049450/docs/features/f09/REVIEW-HANDOFF.md).

## Independently checked

GitHub lists all twelve distinct workflow types successful on the exact delivery: Tests, compatibility, foundation, MCP-01, F03, F04/F05/F06, F08, F28-A/B and F09. CI's installed-reader baseline is reported as 729/0 with four availability notices; it is not represented as a fresh full local baseline run.

A separate detached PM checkout at the exact delivery was used; feature owner files were not edited. Code review covered domain/registry and package routing, analytic targets, native menu/input/drag guards and changed test/workflow assertions. Fresh local execution passed:

- 72 focused F09/F28/F08/precision/material tests, zero failures/skips.
- Strict standalone input: 81 passed, zero failed.
- 19 browser/live groups in both layouts on macOS Chromium 151.0.7922.34, zero page exceptions. The only harness adaptation was 8061 → 8062 to avoid the separate review preview listener; no checks were removed.
- Six source stdio semantic groups and six isolated package groups, including real initialization, discovery, calls, exact schema/bindings, read-only refusals, placement/change/history and save/reopen. Packaged fork source bytes are checked.
- Real live HTTP is included in the 19 browser groups; groups are overlapping evidence and are not summed as unique tests.
- Independent IfcOpenShell 0.9.0/EXPRESS inspection of six actual saved IFC outputs: zero findings/duplicate GlobalIds, affected physical profile/axis/height within 0.005 mm fixture bounds, 11 recipe-matched CSV layer rows and two expected dimension lines in each vector PDF. The unit and native established/workspace/live outputs each retain five real hosted relationships and two dimension curves/witnesses. Source/package target unhosted walls, and do not claim hosted moves.

Workspace and established screenshots were visually inspected. Reports/logs and screenshots are retained privately under `reviews/F09-PM-2026-10-28/`; actual model/export/package outputs remain private in the isolated review checkout. PDF vector geometry was inspected programmatically; this review does not claim fresh rendered-PDF visual inspection or universal CAD accuracy.

## Previous gates

The real mounted palette opens/searches/starts the authoritative Wall command in both layouts without modifying model history; strict mounted-owner assertions remain. Units tests now use visible native controls and cover all six choices. Both menu keys, pointer-pan discrimination, selection preservation, stale-context/project refusal, focus restoration and native dirty Properties paths execute. Placement/grip cancel/commit, Undo/Redo, actual save/reopen, analytic candidate ambiguity and transport/output gates all pass freshly. The October 28 readiness triage at 1158096 is historical, superseded for these gates by this delivery review.

## Scope and follow-ups

Supported scope is shortcut corrections, guarded plan context menus, temporary explicit analytic straight-wall/core/finish targets and registered read-only `wall_reference_resolve`. Existing snaps remain the default; targets are analytic/nonpersistent and not certification of joined physical faces or saved constraints. Broad Move/Copy/Rotate/Mirror/Align/Offset/Split, richer menus/overrides/cycling and C documentation activation remain separate work.

F28-C is not imported or accepted here. PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01, broader semantic MCP coverage, CI runtime headroom and inherited narrow-window usability remain open. Accepted F08/MCP/foundation/source-targeting closures remain closed with their controls retained. F03 measurement collection success is not performance-budget closure.

## Preview and user testing

The original restricted listener attempt reproduced EPERM. An authorized listener starts successfully in the detached PM checkout, serving the exact reviewed code at port 8061. No previous listener was replaced. Automated acceptance ran separately on 8062 with its own browser context and synthetic fixture. No persistent client/credential or user browser model was changed.

No user-only defect test is required for merge. Optional product review: open a synthetic fixture, choose BIM ribbon keys, try WA and Ctrl/Cmd+K; right-click selected/unselected walls and try Shift+F10; compare core versus finish targets; move a straight-wall grip, Undo/Redo and save/reopen. Hardware/other-browser/IME behavior is not universally certified.

Next action is explicit user authorization to mark PR #18 ready and merge, followed by exact-main integrated validation and roadmap update. This PM review itself does not change main, deploy the app or change the default layout.
