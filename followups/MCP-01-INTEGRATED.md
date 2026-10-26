# MCP-01 adoption — October 26, 2026

**PR #16 is merged into main at `21ff2842e1925f148e9b75c404476b59333f7475`. Integrated validation is complete for this bounded adoption.** Local installed-reader baseline: 709 passed, zero failed, four separate availability notices. MCP focused suite: 42 passed, zero failed/skipped. All ten applicable workflow types pass on exact main. F03 attempt 1 hit the explicit 30-minute job limit after nearly twelve minutes of setup; small/medium completed and large was interrupted. PM preserved the log and timeout annotation. A single retry of only that job completed successfully on unchanged main: 900 browser observations, 30 workload/size groups with 30 samples each, and zero application errors. Its setup completed in under a minute. Collection success does not mean every provisional performance target is met, and does not close either performance finding or the CI runtime-headroom concern.

The merge was explicitly authorized by the user. PR #16 was marked ready before merge. The merge request response timed out; PM read GitHub's actual PR/main state to confirm completion rather than retrying the merge. PR is closed/merged, no longer draft. Reviewed delivery `35e3fb5a86949a66a7eab138f7bb5bf13a52fd2c` and previous main `82da107dfd760199bc943249590812978c1a6082` are the ordered parents. Integrated tree `049f394a01387eed870f9e0c7cb063ff7f93b5f1` exactly matches the reviewed delivery tree; no merge-resolution code was added. The remote feature branch remains preserved at its reviewed head.

A fresh detached checkout is at `bimcraft-mcp01-integrated-main`. Existing feature branches, original checkouts, unfinished merges, previews and user browser projects remain preserved. Read-only dependency caches were reused by symlink; no global author settings, credentials or persistent assistant client configuration were changed. No app package or model payload was published. Roadmap publication is separate from an application deployment.

Local standalone baseline: 705 passes with eight availability notices (including missing independent reader checks). PM then attached the existing independent-reader runtime to this isolated checkout and reran all baseline stages: 709 passes, zero failures, four remaining optional sibling/service availability notices. Neither unavailable checks nor skipped tests count as passes. The exact merged main also passes all 42 mandatory MCP contract/history/compatibility tests. Private baseline summaries/logs are adjacent to this handoff.

All ten applicable workflow types were explicitly dispatched against exact merged main. MCP/compatibility/foundation/F28-A dispatches and the four normally push-covered workflows are recorded separately; PM did not assume a push run occurred merely because the merge existed. The first F03 attempt and successful retry are recorded separately. Final exact-main metadata is in `workflow-runs-final.json`; F03 final result/log and downloaded raw/summary/profile evidence are adjacent. `workflow-runs-pending.json` is historical. PM verified all ten workflow types against the exact merge SHA, not the source PR SHA. `ci-verification.json` confirms CI baseline 709/0/four availability notices, all three MCP primary/alias outputs with zero schema findings, and 38 foundation files with zero schema findings or duplicate GlobalIds. The MCP workflow succeeds and covers actual source and separately packaged stdio, live HTTP/browser execution, native project-switch Undo repeats and independent saved-IFC readback.

MCP01-PM-01 remains CLOSED: the accepted fix pins the original editor/history, refuses continuation after a project switch and reports actual completed steps without touching the replacement project's history. Materials/assembly/wall-instance semantic access is adopted; full application MCP parity is not claimed. The user-specific client connection and narrow folder/tool permissions remain an optional environment smoke step; no manual test is required to re-prove the automated fix.

PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01 and broader semantic MCP catch-up remain OPEN. F28-C documentation/reference/export parity and F08 join/end tools remain separate acceptance gates. Foundation UP07-PM-01/02 remain CLOSED. F28-C #12 and F08 #13 are draft, separate and unmerged. Existing established layout stays default/fallback.

F28-C was separately PM reviewed at `8790456`. Its bounded desktop UI checks and the listed runtime tests in a disposable merge rehearsal pass. The actual combined stdio audit reproduces a stale built-in-only catalog assertion failure; fix that integration audit and missing documentation MCP coverage, then publish new-main reconciliation and all eleven applicable final-head workflows. These remain acceptance gates. Review: `reviews/F28-C-PM-2026-10-26/PM-REVIEW.md`. This task does not authorize C readiness/merge or messages to its owner.

[PR #16](https://github.com/drsurfbum/bimcraft-SDH/pull/16) · [Adopted main](https://github.com/drsurfbum/bimcraft-SDH/commit/21ff2842e1925f148e9b75c404476b59333f7475) · [Prior PM review](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/MCP-01-REVIEW.md)

## Exact merged-main CI

| Workflow | Result |
| --- | --- |
| F06 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40378387654) |
| F05 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40378383870) |
| F04 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40378380074) |
| Tests | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40378376685) |
| MCP-01 semantic materials and walls | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40377851973) |
| F03 performance evidence | [PASS — retry 2; first timeout retained](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40377847224) |
| 0.7 foundation controls | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40377842405) |
| Upstream rebase compatibility | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40377838197) |
| F28-B wall workspace acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40377833133) |
| F28 live workspace acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40377829354) |

All requested open findings remain open. F03 is browser collection only; missing model-performance groups are unmeasured, not passing. Representative-house performance, wider inherited MEP, external sibling/service and native-client/platform claims remain outside this bounded validation. Main and both separate feature PR heads were rechecked after CI completion.
