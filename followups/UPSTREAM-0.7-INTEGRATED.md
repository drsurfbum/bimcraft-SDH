# 0.7 foundation — adopted and validated, October 26, 2026

**PR #17 is merged into main and integrated-build validation passes.** New approved baseline: `82da107dfd760199bc943249590812978c1a6082`. This is the working main foundation for subsequent feature compatibility candidates, not a separate unused rebase branch.

## Exact adoption

- [Merged PR #17](https://github.com/drsurfbum/bimcraft-SDH/pull/17), using a normal merge with expected feature head pinned.
- [Integrated main commit](https://github.com/drsurfbum/bimcraft-SDH/commit/82da107dfd760199bc943249590812978c1a6082).
- Ordered parents: old accepted main `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711` and reviewed delivery `90782a41b00c90bcc93c435e693360d3c3353ef9`.
- Integrated tree `e16a500bc168fae9f54e416b534f01ba7e66ced4` is byte-identical to the reviewed delivery; upstream pin `c778c7ca3f83eeecc3e815078417f152b2ca7a94` is retained in ancestry.
- Integration branch remains at the reviewed delivery. No feature branch was deleted, reset, rebased, force-pushed or merged by this adoption. Existing original checkouts/previews and browser work remain preserved. Local validation used a new isolated detached checkout.

## Validation on exact merged main

Fresh local validation: **709 baseline checks passed, zero failed**, with **four separate optional availability notices**; **38 focused foundation/F28 checks passed**, zero failed/skipped. Independent IfcOpenShell 0.9.0 + EXPRESS validation of **38 actual saved IFC files** reports **zero schema/EXPRESS findings and zero duplicate GlobalIds**, including replay/reopen assembly states and the restored 33-kind electrical workflow. Local direct stages used the pinned vendor cache and installed test readers/Poppler; this is not a claim of a fresh local full offline asset audit or native file-picker pass.

All nine workflow types passed on the exact merged main commit. Four were main-push runs; five without main-push coverage were explicitly dispatched on main and their head SHAs verified. Tests CI independently confirms **709 reader-enabled baseline passes, zero failures and four separate availability notices**. Browser, actual IFC/CSV/vector-PDF, unit/language, history/source ownership, strict release/candidate assertion comparison, source/packaged MCP, package closure and performance collection were retained. A completed performance collection does not close threshold/representative-house concerns.

| Integrated-main workflow | Result |
| --- | --- |
| 0.7 foundation controls | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40337546575) |
| F03 performance evidence | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40337551352) |
| F04 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40337455835) |
| F05 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40337455902) |
| F06 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40337455980) |
| F28 live workspace acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40337534262) |
| F28-B wall workspace acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40337538164) |
| Tests | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40337455803) |
| Upstream rebase compatibility | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40337542364) |

UP07-PM-01 and UP07-PM-02 remain **CLOSED** at this baseline. The independent 38-file clean claim excludes the separate inherited MEP equipment limitation; that issue is not concealed as passing.

## Separate feature preparation

The three published feature heads are preserved and unmerged. PM performed tree-only merge simulations without modifying any feature branch or worktree. Text conflicts indicate work required, not a complete compatibility assessment.

| Feature | Reviewed/published cutoff | Preflight | Next gate |
| --- | --- | --- | --- |
| MCP-01, draft #16 | `9224167fe3e2e856c57679065b545d834f52ade1` | 5 conflict paths | Re-review wrong-project history fix, then reconcile semantic materials/walls with upstream tools/history/package routing |
| F28-C, draft #12 | `f956fac00adf1d4d51ddc2e4253fe215a2c50acd` | 7 conflict paths | Preserve unfinished alignment work; adapt documentation/source guards to the shared workspace; resolve documentation MCP gate |
| F08, draft #13 | `f929205133316b29a4551083792d5712d5ffcabd` | 8 conflict paths | Reconcile straight-wall joins/multi-level models/redo, then prove separately owned join/end MCP tools |

MCP-01 conflicts: `app/agents.js`, `app/bimcraft.js`, headless `tools.mjs`, MCP `pack.mjs` and `package.json`. F28-C conflicts: application callbacks, English catalog, wall-assembly UI, workspace availability/commands/walls and B browser contexts. F08 conflicts: F04/F05/F06 workflow files, three locale catalogs, `model-ops.js` and `model-slabs.js`.

Recommended adoption order remains **MCP-01 → validated main → F28-C → validated main → F08 → validated main**. Independent preparation may use this fixed foundation, but a later candidate must reconcile/revalidate against the then-approved main before adoption. Do not merge three old feature branches together to resolve seams. F28-C's unfinished local alignment merge and F08's original duplicate files remain private preserved work, not cleanup targets.

PM prepared three separate owner prompts, with exact pins, conflict/capability decisions, preservation instructions, scope boundaries and final-head validation gates. A 31.6 MB local bundle of the new foundation was restored into a fresh bare repository and passed head/connectivity verification, supplying a network-independent starting point. Preliminary MCP-01 preparation freshly passed its 32 contract/history tests at published 9224167 in an isolated copy; this is old-feature-source evidence, not 0.7 compatibility or PM closure of its finding. No owner was messaged, interrupted or reassigned. No new feature chat or automatic feature merge was started. Feature readiness/merge still requires its own PM review and user authorization.

## Remaining follow-ups

- **MCP01-PM-01 OPEN:** submitted history correction awaits PM verification on the feature/integrated candidate; foundation basic agent checks do not close it.
- **UP07-MEP-01 OPEN:** pump equipment on both pinned upstream and candidate has the same inherited EXPRESS property-set/type attachment finding. Wider optional MEP equipment/tag/IFC2X3 and severity-reporting diagnostics remain unaudited/unaccepted as general schema conformance.
- **PERF-F04-01 / PERF-F05-01 OPEN:** keep responsiveness/generation and representative-workload limits; no universal latency or speedup claim.
- **TEST-F28-01 OPEN:** no silent closure from these passing integrated checks; separate feature isolation acceptance remains tracked.
- Broader semantic MCP catch-up remains OPEN, especially documentation/reference/export and F08 join/end parity. Generic element/property tools and registered names alone are insufficient.
- Absent CivilCraft/PartCraft/CadCraft siblings, native OS pickers/platform coverage and local complete offline asset checks remain explicit limitations. Established layout/default and fallback are preserved.

The four authorized superseded artifacts and affected historical log were already deleted and verified absent. Run records and failure conclusions remain preserved; no repeat cleanup or raw model publication occurred.

Next: use the MCP-01 owner prompt first. If a regression emerges, stop further feature adoption, preserve diagnostics and prepare a reviewed forward fix or revert; do not reset/force-push main or assume code rollback reverses saved-file migrations. No deployment or persistent user-client/credential change was performed.

[Completed PM fix re-review](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/UPSTREAM-0.7-REVIEW.md) · [Original integration plan](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/UPSTREAM-0.7-PLAN.md)
