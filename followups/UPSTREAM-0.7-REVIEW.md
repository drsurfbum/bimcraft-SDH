# PR #17 — PM review, October 25, 2026

**Verdict: changes required; not ready to merge.** PR remains draft and unmerged. Reviewed delivery `6ff9f38f0b80ad0128b12e04bf7b41e5c7f834ab` (implementation `5347d26cf39a230142eafe6398b141fbdde30eac`) against accepted main `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711` and pinned upstream 0.7 `c778c7ca3f83eeecc3e815078417f152b2ca7a94`.

## UP07-PM-01 — P1: assembly Undo/Redo creates duplicate IFC identities — OPEN

At [`app/model-ops.js:86`](https://github.com/drsurfbum/bimcraft-SDH/blob/6ff9f38f0b80ad0128b12e04bf7b41e5c7f834ab/app/model-ops.js#L86), `saveWallAssembly()` caches `typeGuid` with `||=`. On replay it skips the original GUID allocation slot in `op()`'s replay sequence. The next property-set allocation reuses the assembly type's identity. The candidate's `reserve()` adaptations cover several other operations but miss this one.

Reproduction uses the actual IFC API/editor and committed F04 layered-plans fixture: read the `wall-f04-rainscreen` recipe, save it as a new/duplicated assembly with a fresh key, Undo, then Redo. First write has no duplicate; Redo gives an IfcPropertySet and IfcWallType the same GlobalId. Independently validating the saved IFC with IfcOpenShell 0.9.0 and EXPRESS rules reports `IfcRoot.UR1` (GlobalId must be unique).

The same minimal operation was run against three exact source controls: accepted main has zero duplicates before/after replay; pinned upstream 0.7 and this candidate each produce the duplicate after Redo. This is an inherited 0.7 regression relative to the accepted application, not proof of a candidate-only implementation error. The UI invokes this operation for assembly creation/duplication, so the regression affects a supported workflow.

Required: consume the correct GUID replay slot consistently even when retaining the cached assembly identity; audit other cached identity allocations. Preserve stable identities through replay. Add regressions for new/duplicated assemblies, assigning actual walls, repeated Undo/Redo and save/reopen. Assert uniqueness across all IfcRoot types (not walls alone) and independently validate the actual saved IFC. Do not disable deterministic replay to mask it.

## UP07-PM-02 — P2: upstream electrical regression coverage removed — OPEN

The upstream-to-candidate diff in [`tests/tools/bimcraft-test/res-test.mjs`](https://github.com/drsurfbum/bimcraft-SDH/blob/6ff9f38f0b80ad0128b12e04bf7b41e5c7f834ab/tests/tools/bimcraft-test/res-test.mjs#L943) drops the final RC.6 block. It places every electrical device kind, checks readback/IFC class/type/dangling references, verifies sub-board schedule exclusion, and stores `saved.devices` for independent validation. No equivalent was found elsewhere. Browser dropdown inventory checks do not replace these assertions.

Restoring that exact block only in a disposable test mirror yielded **24 RC.6 checks passed, zero failed**, including all 33 kinds and the sub-board case. The mirror was restored afterward; owner source was not edited. The restored run did not perform optional independent saved-device validation in this fresh environment; require that in the repaired CI run.

Required: restore the two assertions and saved-device reader validation, or demonstrate equivalent retained coverage. Include residential coverage in the named-assertion comparison and enforce missing assertions as failures or explicitly reviewed differences. The current matrix omits `--res` and records, but does not enforce, `sameNamedAssertions`. Correct the handoff's statement that no assertions were removed. Derive revised totals from actual checks; do not target the old 707 count.

## Validation and limits

- Nine required workflow types passed on the exact delivery, including the separate F03 performance run. Green CI does not cover either review gap sufficiently.
- Fresh PM focused foundation/F28 tests: **15 passed**, zero failed/skipped.
- Fresh PM baseline: **684 passed**, zero failed, **23 availability notices**. This is not the reader-enabled CI result of 707/four notices; this fresh local path lacks optional readers/sibling assets and Poppler configuration.
- Added PM probe: first-write identity audit passes; post-Redo audit fails. Independent saved-file validation reports one schema finding. Three-way source controls distinguish the inherited regression.
- No fresh PM browser acceptance or complete offline asset audit is claimed. Existing exact-head CI browser/reader evidence remains recorded. Sufficient blockers were reproduced without modifying owner code.
- Recovery evidence reports 35 verified archives and all 364 refs restored. Main is unchanged. F28-C #12, F08 #13 and MCP-01 #16 stay separate; no readiness transition, merge or feature adoption occurred.
- PERF-F04-01, PERF-F05-01, TEST-F28-01, MCP01-PM-01 and broader semantic MCP catch-up remain OPEN. Missing CivilCraft/PartCraft/CadCraft sibling controls remain explicit limitations.

## Authorized cleanup — completed

Deleted only the four superseded synthetic-test artifacts and the affected historical log collection. Each was verified absent with HTTP 404. Workflow run records remain, including the affected run's failure conclusion. Final acceptance artifacts were preserved. No raw model was downloaded or published for this cleanup/review.

| Deleted item | ID / run | Verification |
| --- | --- | --- |
| f03-browser-evidence | artifact 12613359254 / run 40231079269 | 404 |
| f03-browser-evidence | artifact 12612892909 / run 40230559069 | 404 |
| f03-browser-evidence | artifact 12604488128 / run 40206612877 | 404 |
| f06-browser | artifact 12603918472 / run 40206621502 | 404 |
| Historical workflow log collection | run 40231453744 | 404; run and failure retained |

Next: owner fixes both findings on PR #17, publishes a new delivery and reruns all applicable CI, followed by PM re-review. Adoption into main still requires separate user authorization and integrated-build validation. No additional user testing is needed to confirm these two reproducible findings.

[PR #17](https://github.com/drsurfbum/bimcraft-SDH/pull/17) · [Foundation handoff](https://github.com/drsurfbum/bimcraft-SDH/blob/6ff9f38f0b80ad0128b12e04bf7b41e5c7f834ab/docs/features/upstream07/FOUNDATION-HANDOFF.md) · [Foundation CI](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40233250624) · [Tests](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40233250650)
