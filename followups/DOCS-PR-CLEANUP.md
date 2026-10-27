# Documentation PR cleanup — October 27, 2026

**PR #10 and PR #14 are merged. PR #3 is closed as superseded, with its useful integration record preserved. F28-C #12 is the only open PR and remains draft/separate.** Current main is `60dbd3abff0d1d98ce1a85375de7b6087709c8ee`; the application implementation is unchanged from validated F08-A baseline `0329eece15fedbfeb14025683d7fe9da78263ef2`.

| PR | Review decision | Result |
| --- | --- | --- |
| [#10](https://github.com/drsurfbum/bimcraft-SDH/pull/10) | Still needed: active instructions used the old GitHub owner and lacked the approved identity guidance | Marked ready and merged at `a1c177a3a3cfe232b9f8df905915e188a8b0b428`; historical identity/provenance retained, no global Git change |
| [#14](https://github.com/drsurfbum/bimcraft-SDH/pull/14) | Still needed: enforce meaningful, transport-tested MCP coverage in feature acceptance and PM/feature templates | Reconciled normally with main, updated dated guidance and adopted at `60dbd3abff0d1d98ce1a85375de7b6087709c8ee`; source `16958e8bebc3d5d5e350354b5247ecf2993a4104` |
| [#3](https://github.com/drsurfbum/bimcraft-SDH/pull/3) | Its F01-era current-status update was superseded; its unique integration evidence was still useful | Closed unmerged after #14 preserved the full historical record with a dated banner and replaced stale current-state guidance |

The preserved [October 21 record](https://github.com/drsurfbum/bimcraft-SDH/blob/60dbd3abff0d1d98ce1a85375de7b6087709c8ee/docs/INTEGRATION-2026-10-21.md) is historical; its old feature states, preview PIDs and next steps are not current instructions. [PROJECT-STATUS.md](https://github.com/drsurfbum/bimcraft-SDH/blob/60dbd3abff0d1d98ce1a85375de7b6087709c8ee/docs/PROJECT-STATUS.md) now anchors current guidance. The original October 24 audit/catalog are retained; the audit banner distinguishes their old gaps from subsequently adopted MCP-01/F08 capabilities. Original catalog bytes were not regenerated or rewritten.

[AGENTIC-CORE.md](https://github.com/drsurfbum/bimcraft-SDH/blob/60dbd3abff0d1d98ce1a85375de7b6087709c8ee/docs/AGENTIC-CORE.md) requires meaningful semantic operations, actual registration/discovery/transport calls, precise structured results, document/revision and permission guards, package identity and independent output validation. It incorporates accepted request-owned commit/Undo receipts after human interleaving. This adopts an acceptance contract, not new runtime tools or full-application MCP parity. Persistent client setup remains separate.

## Verification

- Exactly **nine documentation files** differ from the validated application baseline. App, devshell, tests, fixtures, workflows and package objects are identical; source-provenance pins/validator are untouched. No F28-C implementation is imported.
- **17 relative Markdown links** resolve; fences, JSON and whitespace checks pass. Historical catalog bytes and the complete original PR #3 integration record are preserved.
- The user authorized review/needed merges/supersession closures. Both merged drafts were marked ready first; all publication was normal additive history/fast-forward, with no rebase/reset/force push or feature-branch removal.
- Five automatic main-push CI workflows are being checked on exact documentation merge `60dbd3a`; final results are pending. No fresh eleven-workflow/performance run is claimed for this documentation-only commit. The unchanged application baseline retains its actual eleven passing workflow types, 729 installed-reader checks/zero failures/four availability notices, 120 focused checks and 900 browser observations. The measured performance findings remain open.

F28-C stays with its existing owner at published head `8790456de23fca0a1f8e2c22a9c68134aa742bb4`. Its future candidate must reconcile against then-approved main (now `60dbd3a`, same application as `0329eec`), preserve accepted MCP/F08 guards and pass all applicable current-main plus C-specific validation. The old pre-F08 eleven-workflow C plan is not a fixed ceiling. No C readiness, merge, code change or message to its owner occurred.

PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01, broader semantic MCP catch-up, CI runtime headroom and inherited narrow-window usability remain OPEN. Closed F08-PM-01/02, MCP01-PM-01 and UP07-PM-01/02 retain their verified closures. Full F05/F08/F28 remain partial beyond their accepted slices. Historical INT-01–04 tracking is preserved; no additional limitation is closed here.

Existing feature branches/checkouts, original duplicate/untracked files, unfinished C alignment, running previews and browser projects were preserved. Unexpected duplicate-suffix files observed in the new local review checkout were left untracked and unmodified; only explicit documentation paths were staged. Git-object comparison verifies the published documentation-only diff. No global Git, credentials, permissions, persistent client, package publication or application deployment was changed. GitHub Pages publication updates only the roadmap/status prose.
