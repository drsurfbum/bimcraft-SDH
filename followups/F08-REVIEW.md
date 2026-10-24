# F08-A updated-baseline intake — October 24, 2026

[Draft PR #13](https://github.com/drsurfbum/bimcraft-SDH/pull/13) remains unmerged. Current delivery: `f929205133316b29a4551083792d5712d5ffcabd`. Approved integrated main: `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711`.

## Verified compatibility evidence

GitHub confirms all eight workflows pass on the exact final delivery. Tests logs confirm **705 standalone / 724 installed-reader passes**, zero failures, with 21/4 availability notices respectively; these notices are not passes. Legacy test files: 7/7. F08 CI reports **35 browser checks**, no application exceptions, and **28 independent geometry cases**. Independent actual IFC/vector/CSV acceptance succeeded, including zero schema findings and maximum vector geometry error 0.000002312 mm.

PM independently reran the 17 F08 model tests on the exact updated checkout: **17 passed, zero failed/skipped**. PM inspected the merge ancestry: merge 6c0220b has ordered parents original F08 6aad54d and approved main 1afe80e; final delivery descends from it. Backup/f08-reviewed-20261024 retains original delivery. Compared with the prior reviewed F08, the join/model implementation is unchanged. The F28-B fixture-context conflict retains upstream isolation. F28-C was not imported.

This is compatibility intake and a focused model check, not a completed full code/browser/export PM review. PM has not repeated the new local browser or export inspection. Actual CI steps and reports retain their own exact build/environment.

## Acceptance remains open

Semantic MCP operations `wall_joins_get`, `wall_join_end_set` and `wall_join_diagnostics` are proposals only: no implementation, registration or transport evidence. Existing MCP wall creation is insufficient. Full feature acceptance remains blocked; no scope exception is granted.

The feature contract labels this work “MCP-01.” **PM scope clarification:** the already issued MCP-01 brief is bounded to materials, assemblies and supported wall-instance editing. Join/end tools form a separate subsequent slice; the F08 contract does not expand MCP-01 ownership or authorize unmerged F08 code in that branch. Its schemas, revision model and transport choices remain proposals for review. No agent was messaged or reassigned.

Minor evidence cleanup: the browser harness/report still hardcodes original base 3e42c21. Correct or clearly relabel it before final acceptance. The actual merge ancestry and performance comparison use approved main 1afe80e; this stale label does not negate the verified head or successful tests.

Supported scope remains straight L/T and selected endpoint-X core-priority joins with per-end allow/disallow/square-envelope controls. Curved joins, continuous interior-X, unequal heights, near-face repair, opening finish wrapping and a dedicated live-workspace adapter remain outside this slice.

PERF-F04-01, PERF-F05-01, TEST-F28-01 and semantic MCP catch-up remain **OPEN**. Established layout remains default/fallback. Main remains 1afe80e. No local preview is running: port 8040 is reported free but listener startup was sandbox-blocked. No readiness transition, merge, deployment or model-payload publication was performed by PM.

[Tests](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40135556313) · [F08 browser/independent output](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40135556325) · [Upstream compatibility](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40135556343) · [Feature MCP proposal](https://github.com/drsurfbum/bimcraft-SDH/blob/f929205133316b29a4551083792d5712d5ffcabd/docs/features/f08/MCP-CONTRACT.md)
