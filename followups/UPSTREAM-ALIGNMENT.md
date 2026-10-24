# Upstream alignment — integrated and validated, October 24, 2026

[PR #15](https://github.com/drsurfbum/bimcraft-SDH/pull/15) was marked ready and merged into main at `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711` under explicit user authorization. All seven workflows pass on the exact merge commit. F28-C #12 and F08 #13 remain draft, unmerged and separate.

## Exact integrated-main CI

| Workflow | Result |
| --- | --- |
| F04 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40133346840) |
| F05 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40132749998) |
| F06 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40132749990) |
| F28 live workspace acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40132772053) |
| F28-B wall workspace acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40132773761) |
| Tests | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40132749992) |
| Upstream rebase compatibility | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40132775679) |

The Tests workflow covers standalone and installed-reader baselines, seven legacy/upstream test files, the F03 harness and independent F01/F02/F04/F05/F06 acceptance. Browser workflows retain actual downloaded IFC/CSV/vector-PDF independent checks. Upstream compatibility passes 19 browser checks across six units, real reloads, live/established fallback and PHP es-MX/id/en-XA pages. Actual MCP discovery/edit/read/save/reopen/undo is independently checked: one wall before undo, zero afterward, zero schema findings.

A fresh isolated local checkout of the exact merge also passes **707 baseline checks**, **14 focused F28/F03 tests**, **7/7 legacy test files**, **15 F04 browser checks** and the same actual MCP persisted-file lifecycle. Three fresh browser-downloaded F04 vector PDFs pass independent geometry readback; the rendered sheet was inspected. Optional sibling availability notices remain recorded; full domain MCP parity is not claimed.

## Preserved history and scope

Main contains original approved main `3e42c21e33e642d1e07bea2fc3356344f91db00e`, upstream target `46275e4e09aa7a086836b98372f73422dec6d74d`, clean rebase `52988710919747bfde70ec3e44ba576f6d13df58` and adoption head `8e48d64ef16fc3628f112cfd17adb2031be498c8` as ancestors. No existing history was rewritten or force-pushed. Both integration branches and all feature branches remain available.

The main file tree is exactly the validated candidate tree `93258f6217a6025c5e6e30a552461e8cbb9e3de1`; application tree `6e272cbeebe3c7c1ff6c16695b6d557308be793d`. Both separate feature delivery heads were fetched and verified not to be ancestors. All 13 original checkouts retain their original head, branch references and working-file status. Previews and unsaved browser work were preserved. The established layout remains default and fallback.

## Open follow-ups and limits

**PERF-F04-01, PERF-F05-01, TEST-F28-01 and semantic MCP catch-up remain OPEN.** Passing integration checks does not close those items or establish representative-house performance. F28-C documentation and F08 join/end controls still need their own integration review and MCP coverage; neither feature was rebased, retargeted or merged here. Full F28 and broader F05 remain partial. No credentials, global Git settings or account permissions changed.

This adopts the fork baseline only. A later upstream contribution still needs deliberate code/test/fixture packaging, preserving fork-only planning/evidence separately and respecting maintainer build/CI documents. No upstream PR or hosted application deployment was performed. Full platform/theme/native-picker/library-service coverage and inherited English workspace-label limits remain as previously documented.
