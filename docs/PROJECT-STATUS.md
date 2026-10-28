# Current project snapshot — October 27, 2026

Read this before using the original planning roadmap or a copied feature prompt. This is a dated snapshot, not a moving Git reference. Resolve and pin the actual approved `origin/main` commit before starting feature work. Preserve every existing branch, checkout, unfinished merge, preview and feature owner.

## Baseline and evidence

- Repository: https://github.com/drsurfbum/bimcraft-SDH
- Published roadmap: https://drsurfbum.github.io/bimcraft-SDH/
- Reviewed application baseline: `0329eece15fedbfeb14025683d7fe9da78263ef2` (F08-A merge, PR #13).
- Application tree at that baseline: `09941b2bc75b40d00c94d4bd76a66da58867b435`. Subsequent PR #10 and this PR #14 cleanup change documentation only; they do not replace that application implementation or import F28-C.
- Validation at the application baseline: 729 installed-reader baseline checks, zero failures, four separate availability notices; 120 focused checks; all eleven exact-main workflow types pass. Real source/package/live MCP and independent saved-file/export checks pass. F03 collected 900 browser observations in thirty groups of thirty samples, with zero source errors. Its 27 separately unverified model-domain groups and headless/shared-runner limits remain explicit.
- [F08 adopted baseline and verification](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/F08-INTEGRATED.md); [MCP-01 adoption](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/MCP-01-INTEGRATED.md); [0.7 foundation adoption](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/UPSTREAM-0.7-INTEGRATED.md).

A new documentation-only main commit is a new Git pin, even when the application tree is unchanged. Record both the actual selected base and the evidence's exact application cutoff. Do not claim the eleven application-baseline workflows ran on a later documentation commit without checking its own runs.

## Feature status

| Scope | Current accepted state |
| --- | --- |
| Original wall/material/dimension prototype, F01 | Integrated; historical [October 21 integration record](INTEGRATION-2026-10-21.md) retained. Do not restart F01. |
| F02 | Precision/reference/migration contract integrated. |
| F03 | Performance harness and bounded evidence integrated; collection success is not performance-target closure. |
| F04 | Layered plans/vector output integrated; PERF-F04-01 stays open. |
| F05 | Straight-wall section/elevation slice integrated; broader scope and PERF-F05-01 stay open. |
| F06 | Assembly schedules and material legends integrated. |
| F08-A | Bounded straight L/T/selected endpoint-X joins, per-end controls and three semantic join tools integrated via PR #13. Full F08 remains partial. |
| F28-A/B | Workspace and wall/type/layer operations integrated; established layout remains default/fallback. Full F28 remains partial. |
| F28-C, PR #12 | Draft and separate at reviewed published head `8790456de23fca0a1f8e2c22a9c68134aa742bb4` as of this check. Bounded desktop UI review passed, but documentation/reference/export MCP and published current-main reconciliation/CI remain gates. Recheck its live head before review. |
| F07, F09 and F10–F26 | Planned; respect individual prerequisites. F09 owns nuanced core/face snapping and interaction discovery; right-click context examples and detailed scope remain to be agreed. |
| F27 | Capture-to-parametric BIM discovery retained, deferred and not a current implementation requirement. |

F28 uses a Revit-familiar structural layout: grouped ribbon, Properties/Project Browser, view tabs and bottom view controls. Unavailable commands stay disabled with honest explanations and verified roadmap mappings. Do not replace this agreed direction with a new unrelated menu design.

## Agent access and next integration

[AGENTIC-CORE.md](AGENTIC-CORE.md) governs new or changed domain capabilities. MCP-01 (PR #16, merge `21ff2842e1925f148e9b75c404476b59333f7475`) adopted material/assembly/custom-type/wall-instance operations and guarded history. F08-A additionally adopted `wall_joins_get`, `wall_join_end_set` and `wall_join_diagnostics`. These have actual source/package/live evidence; full application MCP parity is not claimed, and persistent user-client setup is a separate unconfigured environment step.

F28-C stays with its existing owner. Its next integration must retain accepted MCP-01 and F08 tools, protected records, history/receipt guards and existing fixture isolation. Reconcile normally against the then-approved main in an isolated candidate and run all applicable current-main plus C-specific workflows. The older C plan's eleven-workflow count predates F08 adoption; it is not a fixed ceiling. Do not reset or abort either original C checkout or its unfinished alignment merge. No readiness/merge/deployment or cross-chat communication is authorized by this snapshot.

## Follow-ups retained

PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01, broader semantic MCP catch-up, CI runtime headroom and inherited narrow-window usability remain OPEN. F08-PM-01/02, MCP01-PM-01 and UP07-PM-01/02 retain their verified closures. No additional follow-up is closed by documentation cleanup.

The original INT-01–04 records are preserved as historical tracking context; do not mistake their October 21 status statements for a fresh current review or infer a new closure here. Current feature-specific handoffs and subsequent acceptance evidence take precedence. Curves, continuous interior-X splitting, unequal-height carving, finish wrapping, general Join Geometry and the dedicated workspace join adapter remain outside the adopted F08-A slice.

GitHub identity and repository-local author guidance: [GITHUB-IDENTITY.md](GITHUB-IDENTITY.md). Historical authors, evidence, provenance pins and approved baseline commits are retained. No global Git, credentials or account permissions are changed.
