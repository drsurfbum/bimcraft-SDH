# Open follow-ups after F28-B integration

Integrated commit: `3e42c21e33e642d1e07bea2fc3356344f91db00e` (PR #11).

## PERF-F04-01 — Fine-view responsiveness

Status: **OPEN**. Priority: medium. Owner: unassigned; PM to schedule a bounded performance slice.

The authoritative scope and completion criteria remain in repository `docs/features/F04-FOLLOWUPS.md`. Preserve separate hardware/browser/workload records and raw samples. F28-B does not certify representative-house responsiveness. Synchronous paint/CPU submission is not GPU completion or gesture latency.

## PERF-F05-01 — Synchronous drawing-set generation

Status: **OPEN**. Priority: medium. Owner: unassigned; PM to schedule profiling.

The authoritative criteria remain in repository `docs/features/F05-FOLLOWUPS.md`. Preserve physical geometry, authored references, documentation correctness and supported-scope boundaries. F28 integration does not resolve this issue.

## TEST-F28-01 — Browser fixture isolation and autosave recovery

Status: **OPEN**. Priority: medium; nonblocking for accepted F28-B scope. Owner: unassigned. Included as bounded test work in the prepared F28-C prompt; not dispatched.

On both reviewed delivery `138df9f` and integrated `3e42c21`, the PM Mac browser harness completes 39 checks, then times out opening the unsupported-record fixture: the standard `[data-autosave-dialog]` recovery modal intercepts the Project Browser double-click. These independent fixture pages share a browser context/origin. No application exception is reported. Running the remaining three refusal/exception checks in a fresh context passes. Preserve both the failed full-run report and targeted result; do not describe the original local harness as green.

Reproduce using `tests/features/f28/walls-browser.mjs` on macOS with the complete workflow and a normal autosave interval. Existing local preview port 8034 was occupied, so PM used an untracked port-only copy on 8037/8038. This change does not isolate browser storage or resolve the finding.

Completion criteria:

- Isolate independent fixtures with appropriate fresh contexts/storage, or explicitly handle the legitimate recovery choice without discarding expected project state.
- Retain and demonstrate normal recovery behavior separately. Do not disable product autosave, force clicks through dialogs, remove refusal assertions or suppress exceptions.
- Run the complete browser sequence locally and in CI, retaining exact revisions, environment and results. Verify unsupported records still refuse editing with actionable feedback.
- Keep the historical failure and document the narrow harness change. Closing this test issue does not close either performance issue.

No follow-up is implemented or closed by this integration. The established layout remains default/fallback; full F28 remains partial.

## F28-C PM review update — October 23, 2026

At reviewed delivery `e46113bbbdd66b19f07d92d49af6eac907d1f84c`, the complete local C browser suite passes 39/39 and inherited B passes 42/42. Genuine normal-interval autosave/recovery, clean independent contexts and unsupported-record refusals pass; all seven exact-head CI workflows also pass. TEST-F28-01 remains OPEN pending merged-build confirmation and a tracking update. Both performance issues remain OPEN.

PR #12 has a separate correctness finding, F28C-PM-01: when another sheet/schedule is selected in Project Browser, Properties may display it while Edit sheet / CSV targets the active drawing instead. A source-target guard and browser regressions are required before merge. The PR remains draft/unmerged; main stays at `3e42c21`.

## F28-C fix re-review — October 24, 2026

F28C-PM-01 is **CLOSED** at delivery `f956fac00adf1d4d51ddc2e4253fe215a2c50acd`. Fresh PM Mac C browser **47/47** and focused tests **14/14** pass. Source-specific Properties actions check the displayed source ID/editor; toolbar/File actions retain the active drawing. Seven exact-head workflows pass, including B 42/42 and independent IFC/CSV/vector-PDF checks. See [fix re-review](F28-C-REVIEW.md).

The October 23 correctness finding above is historical and resolved by this delivery. PR #12 remains draft/unmerged. Documentation MCP catch-up and upstream integration work remain open. TEST-F28-01 still awaits integrated confirmation; both performance issues remain OPEN. No default-layout change.

## Upstream adoption — integrated-main confirmation, October 24, 2026

Current main is 1afe80e after PR #15. All seven exact-main workflows pass, including F28-B browser and independent saved IFC/CSV/vector-PDF acceptance, six-unit/locale compatibility and basic MCP persistence. TEST-F28-01 remains **OPEN** by explicit user direction; the integrated result is new evidence, not automatic follow-up closure. Both performance issues and semantic MCP catch-up also remain **OPEN**. Historical F28-B/F28-C records above retain their original revisions. F28-C #12 and F08 #13 remain separate draft PRs and unmerged.
