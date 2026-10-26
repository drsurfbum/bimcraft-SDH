# PR #17 — PM fix re-review, October 26, 2026

**Verdict: ready for the bounded 0.7 foundation adoption. Both PM findings CLOSED.** This is a review recommendation, not authorization to mark ready or merge. PR #17 remains draft and unmerged; main remains `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711`.

Reviewed delivery: `90782a41b00c90bcc93c435e693360d3c3353ef9`. Source: `ff395f4b21c92e623aa73b41636b0cb6cb94178d`. The source and delivery continue the previously reviewed candidate through normal additive commits. Pinned upstream remains `c778c7ca3f83eeecc3e815078417f152b2ca7a94`. [Previous PM findings](https://github.com/drsurfbum/bimcraft-SDH/blob/18a9f51afed92c7375dcd80bf8583c795eb34c9b/followups/UPSTREAM-0.7-REVIEW.md) remain historical evidence.

## UP07-PM-01 — CLOSED at reviewed delivery

`saveWallAssembly()` now consumes its GUID replay slot every time while retaining the first allocated identity. The shared `reserveGuid()` helper applies the same correction to the other audited operations using the replay wrapper. Deterministic replay remains in place.

Fresh PM execution in a detached disposable checkout passed all **38 focused tests**, with zero failures or skips. The five assembly regressions cover fresh/duplicated recipes, actual-wall assignment, shared-type editing, three Undo/Redo cycles and reopen; checks enumerate all IfcRoot subtypes. Twelve additional operation cases audit the same identity invariant; prior replay and protection tests remain.

Fresh independent IfcOpenShell 0.9.0 validation, including EXPRESS rules, passed **38 actual saved files with zero schema/EXPRESS findings and zero duplicate GlobalIds**: 25 assembly states, 11 other audit outputs and two electrical saves. The mandatory reader also verifies assembly identity stability and assigned walls. Equipment's separate inherited schema limitation is explicitly excluded from that 38-file claim and tracked below; its identity replay regression does pass.

## UP07-PM-02 — CLOSED at reviewed delivery

The exact removed upstream RC.6 block is restored, including all 33 kinds, IFC classes/types, dangling-reference checks, sub-board schedule exclusion and `saved.devices`.

Fresh PM RC.6 execution passed **24 checks**, zero failures, with optional reader availability reported separately. A separate mandatory independent-reader execution then validated both electrical outputs and all 33 expected device classes/PredefinedTypes. These are distinct stages, not a claim that the 24-check invocation included optional readers.

Code review confirms full residential and nine section controls are included in the release/candidate comparison. Missing names and occurrences now fail the job. Specific source-integrity renames require justified replacement assertions; anchored normalization handles only documented measurement-bearing labels or the ops elapsed-time suffix. Comparator tests reject dropped electrical checks, duplicate-label losses, empty success text and failed outcomes. Assertion predicates/tolerances remain unchanged. The handoff corrects the prior inaccurate coverage claim and derives new totals from actual execution.

## Final-delivery CI verified

All nine workflow types succeeded on `90782a41b00c90bcc93c435e693360d3c3353ef9`. Eight pull-request runs were verified through GitHub; the separately triggered F03 push run's exact head and success were also verified. Foundation job steps confirm required independent validation and enforced release/candidate comparison actually executed.

| Workflow | Final-head evidence |
| --- | --- |
| Tests | [40262773035](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40262773035) |
| F04 browser | [40262773020](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40262773020) |
| F05 browser | [40262773148](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40262773148) |
| F06 browser | [40262773022](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40262773022) |
| F28-A browser | [40262773047](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40262773047) |
| F28-B browser | [40262773009](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40262773009) |
| Upstream compatibility | [40262773005](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40262773005) |
| Foundation controls | [40262773183](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40262773183) |
| F03 performance evidence | [40262765156](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40262765156) |

PM checked the Tests job log: the reader-enabled stage totals **709 passed, zero failed, four separate availability notices** (residential stage: 211). Foundation logs also confirm 38 focused passes and mandatory independent saved-file validation. Earlier failed delivery attempts are retained historical evidence, not final-head failures.

No additional fresh PM full-baseline/browser run is claimed; exact-head CI provides that wider evidence. PM independently reran the focused fixes, electrical workflow and saved-file validation. No new user testing is required to verify these two fixes. Native OS file-picker behavior remains a separate platform smoke check, not covered by headless browser evidence.

## UP07-MEP-01 — inherited MEP schema diagnostics — OPEN follow-up

Fresh PM pump placement against exact pinned upstream and corrected candidate independently reports the same one EXPRESS rule finding: `IfcRelDefinesByProperties.NoRelatedTypeObject`. This verifies inheritance for that equipment case. It is separate from the corrected identity replay issue and is not included in the 38 clean-file claim.

The owner also reports wider optional-reader MEP equipment/tag/IFC2X3 diagnostics and upstream severity-counting limitations. Those broader diagnostics have not received a complete independent PM audit. Track both schema correctness and reader-severity handling before certifying broader MEP output or agent coverage. This review accepts the bounded foundation with that documented upstream limitation; it does not certify general MEP schema conformance or add semantic MCP acceptance.

PERF-F04-01, PERF-F05-01, TEST-F28-01, MCP01-PM-01 and broader semantic MCP catch-up remain OPEN. Missing CivilCraft/PartCraft/CadCraft sibling controls, local offline asset/listener restrictions and native picker coverage remain explicit limitations. F28-C #12, F08 #13 and MCP-01 #16 remain separate and unmerged. Established layout remains the default/fallback.

## Preservation, cleanup and next step

The four authorized superseded artifacts and affected log were deleted and verified absent on October 25. No repeat cleanup was performed; workflow run records and the historical failure conclusion remain preserved. Review code/tests ran in a disposable detached checkout; owner tracked files and current head were left unchanged. No raw model payloads were published.

Next: user may authorize marking PR #17 ready and merging it into main. Then validate the exact integrated main commit, keep all follow-ups open, and update adoption status. Gate C remains a separate MCP-01 fix re-review and foundation compatibility slice; F28-C and F08 are later independent integrations. No adoption, readiness change, deployment, persistent MCP setup or cross-chat message occurred during this review.

[PR #17](https://github.com/drsurfbum/bimcraft-SDH/pull/17) · [Updated source handoff](https://github.com/drsurfbum/bimcraft-SDH/blob/90782a41b00c90bcc93c435e693360d3c3353ef9/docs/features/upstream07/FOUNDATION-HANDOFF.md)
