# MCP01-PM-01 — live history document binding correction

Status: implementation and regression evidence submitted for **PM re-review**. This handoff does not close the PM finding or authorize ready/merge. Draft PR: [#16](https://github.com/drsurfbum/bimcraft-SDH/pull/16). Approved baseline remains `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711`; reviewed delivery is `64000d39e6a194e83053a84c90c95d349125ef6c`. Work remains in `bimcraft-mcp-01`, branch `feature/mcp-material-wall-parity`, with repository-local DrSurfBum identity. No rebase, force-push, persistent client setup or other feature checkout change.

## Root cause and correction

The reviewed live Undo handler checked document/revision only at entry, then repeatedly read the active editor and called active-application Undo across awaits. A switch after the first step allowed the next iteration to undo a replacement project. Earlier passing 13-test and eight-workflow results remain historical evidence, not coverage for this defect.

`agent-history.js` now owns the live Undo/Redo request adapter. It pins the original editor/session and captures both complete history stacks, entry identities, labels/kinds and the expected revision. It checks the pinned editor and expected history after awaited boundaries (including settle polling), and immediately before each engine mutation checks document, busy state and current history ownership again. Application callbacks pass private before/after guards through the existing command/action path; the guards bracket the actual synchronous `IfcEditor.undo()`/`redo()` invocation. No separate history engine or model store was introduced.

After each confirmed own transition, the adapter captures its new expected stacks/revision. Therefore two-step Undo is supported without comparing the post-step history to the request's original expectedRevision. Unrelated edits, undo/redo, changed lower stack entries, relabelled ownership, busy/conflicting requests and project switches stop further mutations. Person steps still require explicit `any: true`.

Redo uses the same targeting/receipt checks. No independent second PM defect is claimed; its adjacent targeting and result identity are now guarded and tested. `documentHistoryState` is a narrow extraction of the existing session/revision bookkeeping so these checks do not inspect a temporarily unloaded IFC handle during UI rebuilds. Normal `documentState` read-back continues to include persistent project identity and units.

## Results and partial progress

Successful live history results retain `undone`/`redone` and include the **original** `documentId`, current original-project revision, `requestedSteps`, `completedSteps` and `complete: true`. A stop returns MCP `isError: true` with structured progress, `complete: false` and `stopped: {code,message}`. Example after switching from A to B:

```json
{
  "documentId": "<A session>",
  "undone": ["Assistant: material_edit"],
  "requestedSteps": 2,
  "completedSteps": 1,
  "complete": false,
  "stopped": {"code":"document_changed","message":"The active document changed. Further history steps were refused."},
  "isError": true
}
```

The completed A step remains completed; no rollback is claimed. B is untouched. Clients must inspect structured progress before deciding what to retry. History exhaustion or reaching a protected person step likewise reports the number actually completed instead of reporting complete success for a shortened request. Wrong/stale entry bindings refuse before mutation. Legacy **private test/application callbacks** that fail to supply a guarded mutation receipt stop as `history_unconfirmed`; an observed unconfirmed original-project transition is reported separately and is never credited as confirmed request ownership. Actual application callbacks now supply receipts. No MCP argument or user-client configuration is required for those private callbacks.

## New regression coverage

`npm run test:mcp01` now runs the original 13 contract tests plus **19 focused history regressions: 32 tests, zero required skips**. The tests use the real live installer/dispatcher and independent real IFC editors. They cover same-project multi-step Undo and subsequent Redo; switching after a step, during idle settling, during rebuild waiting and before an awaited mutation; wrong/stale bindings; unrelated edits and unrelated Undo; lower-stack replacement with unchanged count/top; busy state at multiple boundaries; person ownership and explicit `any`; history exhaustion; concurrent history requests; post-mutation failures and accurate partial progress. The original callback-shaped PM reproduction is also checked for no B mutation and explicit unconfirmed progress when it omits the new private receipt contract.

The browser acceptance adds three required checks to the existing 13 (**16 total**). It opens A and B as actual IFC documents in a separate test page, creates their edits through real token-protected HTTP MCP, then performs same-project two-step Undo/Redo. During a subsequent two-step Undo, an animation-frame observer sees A's first completed step and clicks the native active-model radio for B while the normal application rebuild is pending. It does not replace/mock the dispatcher, editor mutation or Undo callback; normal switching is enabled. The result must report one completed A step, `document_changed` and `complete:false`; B's actual serialized bytes and both history stacks must remain identical. Redo on A must work afterward. `history-regression.json` records booleans/counts/results, never B's serialized bytes.

Existing required source/headless, isolated packed consumer and live workflows are rerun, including independent IfcOpenShell validation of all three actual saved IFC outputs. The packer closure/byte checks include the new history module. The private package version remains `0.4.0-mcp01.1`; exact source/delivery commits and module hashes, not that development version alone, identify this correction. CI unconditionally executes the history tests and browser regression, and uploads their allowlisted JSON/screenshot evidence without IFC or full expected-model JSON payloads.

## Scope, evidence and remaining limits

Historical evidence at `evidence/mcp01/` is preserved. Correction-specific evidence is under `evidence/mcp01/pm01/`. Exact fix source: `e1cda96ec15bcf5e1fd0e5a2342d9bf2c31e26bc`; application tree: `1dd64b17cacb7ee0e1dfdf7124029c74a3f27ca0`. The evidence-delivery SHA and all eight exact-delivery CI links are recorded in the updated PR and final response. Local environment: macOS arm64, Node 26.9.0, available Playwright 1.62.1 / Chromium 151, IfcOpenShell 0.9.0. CI uses Linux, Node 22, pinned Playwright 1.56.1 and its Chromium, plus the same independent reader requirement.

Local regression results: **707 baseline checks, 32 contract/history tests, 10 F28 tests, four F03 tests, 7/7 legacy files and 22 existing element-agent checks passed**. Headless: 11 checks; package: four checks plus its complete semantic workflow; live: 16 checks. All three saved IFC outputs independently pass with zero schema findings (23 walls, four authored types, 15 materials and two preserved dimensions each). Relevant material/assembly/F02/reference checks are included in the baseline. Optional absent sibling/source integrations remain explicit. The historical broad `--draw06` dependency on sibling `civilcraft/dev/landxml.js` remains unavailable and is not counted as passing. This patch does not expand history support to other applications or configure the user's persistent client. It preserves the existing application rebuild mechanism and does not promise rollback of successful steps in an interrupted multi-step request.

MCP01-PM-01 awaits PM re-review. PERF-F04-01, PERF-F05-01, TEST-F28-01 and broader semantic MCP catch-up remain **OPEN**. F28-C and F08 remain separate; no workspace/documentation/join implementation or shared roadmap is changed.
