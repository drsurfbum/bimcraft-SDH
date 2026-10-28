# F28C-PM-01 fix verification — October 24, 2026

Approved integrated base: `3e42c21e33e642d1e07bea2fc3356344f91db00e`.
Reviewed delivery: `e46113bbbdd66b19f07d92d49af6eac907d1f84c`.
Ownership fix: `50733822c91a159f7e9f68cdf553922102b894df`.
Frozen source including the selector correction and final regressions: **`b8388bd36fe69e54d483a688d1cb3fee4e94f1c9`**, tree `b1ea8840996e268d6e0f834ba2a8d39999bc6b1e`.
Frozen app tree: `7a0b97496284c6c0c442b20e263b3c756bbf6a27`.
Delivery is the published evidence commit containing this file; its exact SHA and CI runs on that SHA are recorded in [draft PR #12](https://github.com/drsurfbum/bimcraft-SDH/pull/12). Evidence packaging leaves application and behavioral tests unchanged from the frozen source. No merge/readiness/default/roadmap transition.

[Implementation and regression details](../../../docs/features/f28/F28-C-PM-01.md). [Original PM record hashes](pm-review-sources.json) identify the untouched review/reproduction files outside this checkout. The original reviewed delivery and its passing evidence remain intact.

## Regression results

**F28 focused: 14/14. F03: 4/4. Final local baseline: 678 passed, zero failed, 13 stages. Legacy runner: 3/3 files.** Optional independent readers and sibling-service checks remain disclosed skips. Local baseline metadata records frozen source `b8388bd` with pending documentation (`dirty: true`). Earlier logs retain the setup collision in the shared mirror and the passing pre-selector baseline.

The new source-ownership unit regression is **RED on exact reviewed `e46113b`**, one expected failure, and GREEN after the fix. [Red log](reviewed-unit-red.log), [focused](focused.log), [baseline](baseline.log), [baseline metadata](baseline-summary.json), [F03](f03.log), [legacy](legacy.log).

**Final C browser: 47/47, zero application exceptions.** All original 39 checks remain, plus eight checks for source targeting/selector synchronization. [Full report and raw timings](browser.json). Real native sheet changes prove only the intended ID changes, even with identical sheet number/title. Inactive Properties sheet/CSV actions open an explanation and execute nothing; pointer, keyboard and touch routes are exercised. Toolbar sheet editing and File CSV retain the active target. After intended-source activation, Properties edits/exports succeed. Both actual CSV downloads match complete authoritative output, not just a filename. Guard tests also refuse another editor with the same source ID and stale setting targets.

The first browser attempt remains **FAIL** at a helper assertion that conflated ARIA and native disabled state; its 28 preceding checks are not relabeled green. [Attempt 1](browser-attempt-1.json). The next run passed 46 checks; screenshot inspection caught the first-open schedule selector label issue. [Attempt 2](browser-attempt-2.json). The final source sets the selector after native options are created and explicitly asserts its value. No forced clicks, removed refusal assertions, recovery suppression or successful-looking mocks.

Independent final main-flow downloads still pass: **zero IFC schema findings; 2 walls, 9 types, 2 persistent dimensions, drafting annotation/callout and 3 sheets; 53 assembly-layer CSV rows and 15 legend rows; eight vector-only PDFs**. [Independent report](independent.json). The ownership fixture has its own isolated context and does not leak sheets or recovery state into the main fixture.

## Frozen-source CI

| Workflow | Result |
| --- | --- |
| F04 browser acceptance | [success](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40097131857) |
| F05 browser acceptance | [success](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40097131901) |
| F06 browser acceptance | [success](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40097131863) |
| F28 live workspace acceptance | [success](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40097131890) |
| F28-B wall workspace acceptance | [success](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40097131791) |
| F28-C documentation workspace acceptance | [success](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40097131799) |
| Tests | [success](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40097131908) |

[Actual source CSVs/PDFs, screenshots, reports and raw CI measurements](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40097131799/artifacts/12561780295) — no IFC payload. Digest `sha256:0ec73a3e951711a04c59f21099fe622972dd4092d593141957e9a83903b8fe1c`; retention currently expires 2027-01-22T13:12:22Z. Final delivery-head CI is separately linked in PR #12, rather than substituting these source runs.

## Inspected UI and limits

- [Active C-101, Properties C-102: editing unavailable](screenshots/properties-source-sheet-inactive.png).
- [Active assembly schedule, Properties legend: CSV unavailable](screenshots/properties-source-csv-inactive.png).
- [Activated legend: correct native selector and enabled Properties CSV](screenshots/properties-source-csv-active.png).

These are unedited captures from the final source. The native schedule selector now agrees with its active source. The sheet guard capture is byte-identical to the previously inspected guard image. Original normal/narrow, renderer/picking, wall editing, save/reopen, missing/unsupported sources and real recovery assertions remain in the full passing C run; A/B and F04/F05/F06 browsers also run.

Local listener startup remains denied (`EPERM`, unused port 8051); [record](local-browser-limit.json). Existing 8039 serves this owner checkout and was preserved, with no reload or takeover of the user's browser. It will serve the changed files on a later user-initiated load. No new local browser pass is claimed. PM's local B/C 42/39 and genuine recovery results on reviewed `e46113b` remain historical passing evidence. **TEST-F28-01 stays OPEN pending integrated-build confirmation and explicit tracking update**, per PM. No shared tracking file was changed.

**PERF-F04-01 / PERF-F05-01 stay OPEN.** Same-environment raw browser samples and CI Node samples remain in the report/artifact; CPU submission, generation and serialization are distinct from GPU completion or interaction latency. No performance improvement or representative-house claim. All original unavailable-service, native-picker/PHP/platform and F28-D limits remain. Console warnings/errors are retained separately from application exceptions.

No synthetic IFC bytes are committed or uploaded. Fixtures/downloads are generated and independently read locally or inside CI. Reports, actual CSV/PDF and screenshots are published through the existing explicit allowlist.
