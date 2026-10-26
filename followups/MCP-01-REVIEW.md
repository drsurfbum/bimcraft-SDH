# MCP-01 PR #16 — PM re-review, October 26, 2026

**Verdict: ready to merge for the bounded materials, assemblies and wall-instance MCP slice. No blocking findings remain in this review. MCP01-PM-01 is CLOSED at reviewed delivery `35e3fb5a86949a66a7eab138f7bb5bf13a52fd2c`.** This is a merge recommendation; PR remains draft/unmerged and main remains `82da107dfd760199bc943249590812978c1a6082`. No user-only test is required to establish closure of the automated defect.

Application source: `e84023e53c98352a07603ccfb36a3e09fac8e8c8`; final compatibility/test source: `31f7e9167f16f084bc1311a17271921a3c674bc4`; delivery adds documentation/evidence. Both the accepted foundation and reviewed feature/fix history are preserved. F28-C and F08 are excluded. The isolated PM checkout matches the exact delivery; owner candidate remains clean and unchanged.

## MCP01-PM-01 — CLOSED

PM freshly reproduced the original faulty `64000d39e6a194e83053a84c90c95d349125ef6c` control with the saved original reproduction and two real IFC editors: requested A, actual Undo targets A then B; both histories changed. That confirms the control still detects the original defect.

The corrected `liveHistory` adapter pins the original editor/session, snapshots complete history stacks and ownership labels, checks after awaited boundaries, and passes before/after receipts through existing application commands around the actual synchronous mutation. It updates the expected revision/history after each confirmed own transition and reports honest partial progress if interrupted. Review found no separate history engine or silent rollback claim.

Fresh PM real HTTP/browser execution passed the native project-switch case: normal two-step Undo and subsequent Redo work; after exactly one Undo in A, the normal active-model radio selects B; the request stops as `document_changed`, reports one completed step and `complete:false`; B's serialized bytes and both history stacks are identical. Redo on A subsequently works. Two additional isolated-browser repeats each pass all three checks with zero application exceptions. The boundary tested is settled UI before the pending request continues; switching inside a transient IFC-handle unload remains a separately documented platform/runtime limitation, not certified by these results.

## Fresh PM execution on the exact delivery

| Check | Result |
| --- | --- |
| MCP contract/history/compatibility | 42 passed; zero failed/skipped |
| Retained foundation/F28 tests | 38 passed; zero failed/skipped |
| Actual source stdio workflow | 14 checks passed, including protected alias and 8 malformed persisted-record fixtures |
| Isolated packaged consumer | Four packaging checks plus the complete 14-check stdio workflow passed |
| Actual HTTP to live browser | 19 checks passed; zero application exceptions |
| Extra native history repeats | Two runs, six checks passed |
| Independent saved IFC/alias validation | Three primary outputs and each transport's persisted alias fixture pass IfcOpenShell 0.9.0 + EXPRESS rules; zero schema findings |

Each primary output independently contains 23 walls, four authored types, 15 materials and two preserved dimensions. The reader checks unique GlobalIds, exact properties, placement/Body geometry, actual door/window products, cavity/ventilation/zero-membrane layers, unused definitions and unchanged dimension references/points. The actual browser download is reopened and stale tokens refuse edits. The separately opened original is retained unchanged. No raw model payloads were published.

PM inspected runtime changes in semantic adapters, registration/request guards, application history callbacks, headless wrappers and package closure. New semantic operations reuse authoritative model operations; default-material edits do not resize recipe layers. Generic upstream edit routes share document/revision/busy/library checks and cannot bypass protected property ownership through a valid shared alias. Bad batch/document/revision/record/permission/root/overwrite cases refuse without unintended changes. The packaged fork uses exact required module bytes, retains notices, and fails startup when a required semantic module is removed. Catalog union retains prior names/groups/arguments; only catalog-specific legacy expectations were updated to the expanded exact union, with operation assertions retained.

## Final-head CI independently verified

All ten workflow types succeed on `35e3fb5a86949a66a7eab138f7bb5bf13a52fd2c`, including the separately dispatched performance run. PM checked the actual MCP job steps/logs, which confirm 42 mandatory tests, 31 retained DF.25 assertions, real source/package/live execution, alias-specific protected-owner refusal, independent saved-file validation and repeated native switches. Final Tests reports the reader-enabled 709-check baseline with four separate optional availability notices; no additional fresh PM full-baseline run is claimed here.

| Workflow | Exact-head evidence |
| --- | --- |
| MCP-01 acceptance | [40365335133](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40365335133) |
| Tests | [40365335404](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40365335404) |
| Foundation controls | [40365335347](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40365335347) |
| Upstream compatibility | [40365335173](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40365335173) |
| F04 / F05 / F06 | [F04](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40365335080), [F05](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40365335081), [F06](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40365335264) |
| F28-A / F28-B | [A](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40365335305), [B](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40365335119) |
| F03 performance collection | [40365328013](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40365328013) |

Historical unsuccessful attempts remain preserved. The stronger alias proof checks resolved protected ownership rather than accepting an unresolved-property error. No disabled project switching, weakened geometry tolerance, suppressed browser errors or production delay was found in the final observer refinement.

## User testing and remaining scope

There is **no required manual test blocking this merge recommendation**. After an authorized merge and validation of the exact merged main, the user-specific step is choosing/configuring the intended assistant client and approving its narrow project folders/tool groups. No persistent client, credentials or global settings were configured by PM. The [connection guide](https://github.com/drsurfbum/bimcraft-SDH/blob/35e3fb5a86949a66a7eab138f7bb5bf13a52fd2c/docs/features/MCP-01-CONNECTION.md) is an example, not evidence of installed configuration.

Recommended optional smoke check after connection: use a disposable copy; inspect materials/assemblies, duplicate a type, edit one layer and place/assign a wall; Undo/Redo; save to a new filename and reopen. Confirm unused materials, cavity/zero membrane and existing dimensions remain. Native OS picker/download behavior and the actual chosen client are the remaining human-environment checks; automated test-client success does not prove the user's client is connected.

PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01 and broader semantic MCP catch-up remain OPEN. F28-C documentation/reference/export and F08 join/end parity are separate acceptance gates; tool counts do not establish full app coverage. Wider MEP schema/severity, absent siblings, local full offline assets, transient unload/platform behavior and representative-house performance remain disclosed limits. Foundation UP07-PM-01/02 stay CLOSED. F28-C/F08 stay draft, separate and unmerged, and must reconcile/revalidate after any MCP-01 adoption.

Next: user may authorize ready/merge of this exact PR head, then PM validates the exact new main commit before downstream integration. No readiness change, merge, deployment, package publication or owner message occurred during this review. Temporary local servers and isolated test browsers were closed; existing previews/browser projects remain untouched.

[PR #16](https://github.com/drsurfbum/bimcraft-SDH/pull/16) · [Owner delivery handoff](https://github.com/drsurfbum/bimcraft-SDH/blob/35e3fb5a86949a66a7eab138f7bb5bf13a52fd2c/docs/features/mcp01-up07/DELIVERY.md) · [Historical original PM finding](https://github.com/drsurfbum/bimcraft-SDH/blob/5af38c04c0617f278bea2d2703039c26af7045a7/followups/MCP-01-REVIEW.md)
