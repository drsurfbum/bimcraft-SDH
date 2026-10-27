# F09-A review / recovery handoff — October 27, 2026

State: **implemented draft, validation incomplete; not ready for PM acceptance or merge**.

## Pins and ownership

- Approved base: `60dbd3abff0d1d98ce1a85375de7b6087709c8ee`.
- Application baseline within it: `0329eece15fedbfeb14025683d7fe9da78263ef2`.
- Branch: `feature/f09-interaction-foundation`.
- Draft PR: https://github.com/drsurfbum/bimcraft-SDH/pull/18
- Local checkout: `bimcraft-f09` under the BimCraft Test project.
- Local implementation commit: `b80ca88428b99173fa21d540e406df180e9987f5`.
- Initial published implementation: `858ab67959b2ef850af5c7e4a21b41e1c8edfde6`, tree `c8d0d25032611bf07fd4cf2bae8121a31a3af1e6`, verified byte-identical to that local implementation.
- Subsequent published implementation/test corrections: `f8240a4258f1a9b8ef45919f1f1b7471dff57804`, `d0c04657e8a42e46ef6e404b830368ffd41792f9`, `bb58500787c580bb48309c87e383d5da190e45bf`, and current implementation cutoff `01f73dc3718f4be66edab74e11e265f00a88bf9f`.
- This handoff is an evidence-only increment after that cutoff. Inspect the PR head and run/check its exact workflows again; earlier success is not final-head success.
- Proposed preview port: 8061. TCP listen was denied with EPERM, and later the execution environment disconnected. **No running preview is claimed.**
- The original local branch remains at b80ca88; later changes were published through the connected GitHub service. Git fetch failed DNS and the environment disconnected again. **Reconcile local and published history safely before editing or previewing; do not assume the checkout contains the published corrections.** Preserve a local recovery ref and verify its clean state first. Do not reset unrelated branches or any C checkout.

No F28-C implementation was imported. The approved main pin was retained; no merge, deployment, default-layout switch or persistent-client setup occurred. Initial read-only preservation recorded 27 checkouts in the private local `evidence/f09/preservation-start.json`; it is excluded from publication. A final inventory could not be repeated after the environment disconnected.

## Implemented scope

See [INTERACTIONS.md](INTERACTIONS.md) for the interaction matrices, audit, boundaries and unresolved choices.

Confirmed by the owner in this chat:

1. Right-click preserves selection and offers explicit Select this wall.
2. An active operation gets a menu with explicit Cancel.
3. The demonstration uses explicit reference choice; no universal core/finish priority or new cycling key.

Implemented:

- Existing input engine/profile reuse; correct builtin ribbon DI meaning; distinct unavailable model Copy versus clipboard Copy; WA/DR/WN and other supported mappings, shortcut discovery and explanations.
- Prefix cancellation/timeout/focus handling, composition/text protection, native field Undo and guarded workspace routing.
- Plan context menus with captured editor/revision/source/view/selection/tool context, stale-context refusal, pointer-pan separation and keyboard navigation.
- Explicit analytic finish/core/center references through the existing snap engine and F02 resolver; visible candidates and temporary snap-off. No joined-outline substitution, fabricated curve core faces or persistent attachment.
- Existing wall placement and straight-wall grips, exact coordinates, drag cancellation and existing history operations.
- Registered `wall_reference_resolve`: required documentId/revision, wall GlobalId, six reference names and station; returns exact mm coordinates, analytic segment, stable level GlobalId, storey-plan frame and nonpersistent classification. It reuses document bindings and protected/ambiguous-record validation.

Substantial missing Modify tools remain later slices. Space, Tab and SC retain their existing meanings. Documentation workspace activation stays with C. Existing follow-ups and PM closures remain open/closed as previously accepted.

## Evidence actually obtained

Local checks were on b80ca88's implementation tree:

- 709 baseline passes, zero failures, with explicit optional web-ifc/Poppler/sibling availability notices.
- Seven initial F09 tests; 64 inherited precision/material/F08/F28 checks; 46 additional F03/MCP-01 checks. These suites overlap and must not be summed as unique coverage.
- Real source stdio and isolated packaged MCP initialization/discovery/calls, target resolution, refusals, existing wall_change, Undo/Redo and save/reopen.
- IfcOpenShell independently inspected the saved affected wall axis, five hosted IDs and two dimension curves/witnesses, retaining the 0.005 mm bound.
- Pure candidate discovery p95 approximately 0.09–0.28 ms on unchanged F03 12/36/96-wall fixtures; this is not browser/GPU latency or performance-target closure.

Published CI subsequently ran expanded tests, including eight F09 unit tests and duplicate-product-ID refusal. Actual source MCP custom-type placement/Undo passed. The original exact legacy catalog assertions were extended to include the new resolver, retaining exact union checks.

Successful inherited runs exist on earlier published heads (including F04/F05/F06/F08/F28-A/B, foundation controls and MCP-01). Their exact runs remain in PR checks. Do not present those as final-head acceptance. Full F03 performance and the other applicable workflows now run for this branch.

## Failures, retries and unresolved gates

Do not erase failures or weaken assertions to obtain green CI.

- Initial published MCP-01 workflow failed its old exact 23-tool catalog expectation because the new resolver was present. The exact expected union was corrected; subsequent MCP-01 CI passed.
- F09 browser run [40561238312](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40561238312) failed at Shift+F10 menu invocation after passing established-layout WA/prefix/focus/pan and native text Undo checks.
- Run [40561999841](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40561999841) retained that keyboard-menu failure after moving invocation to capture phase. It produced failure.png/report diagnostics. Its artifact is 12762167305. Those diagnostics were not extracted locally before disconnection.
- Run [40564327351](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40564327351) passed actual source target resolution/custom-type placement/Undo, then the newly exercised legacy input harness failed because the standalone mirror lacks the upstream app-bar include.
- That harness now reads the actual packaged app-bar markup when the upstream include is absent. Run [40564856575](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40564856575) still reports **app.palette missing** in its strict selector assertion. This is unresolved; do not invent a working palette or remove the assertion silently.
- The same run's browser diagnostic stopped at the new unit-switch test: `[data-model-units]` is hidden while Select is active. The test must enter a supported operation exposing that control before switching units; do not force hidden controls. The keyboard-menu fix therefore remains unverified.
- Browser evidence is now logged with F09_REPORT, screenshots and event/focus state. Browser checks run independently when setup succeeds, without converting earlier failures into passes.
- Expanded native placement/grip commit/cancel, six-unit, Undo/Redo/save/reopen and independent actual UI/source/package/live output checks are present but **not yet successfully completed**.
- Actual live HTTP execution of the new resolver is still a required gate. Existing MCP-01/F08 live evidence does not prove this new tool.
- Latest correction ideas discussed but **not committed** before disconnection: enter Wall before testing the hidden units control; protect dirty Properties text from blur caused by contextual menu opening. Reimplement and validate these from current source; no ephemeral draft should be treated as published behavior.
- The last evidence increment needs its own final-head CI checks, source/package/live MCP checks and independent output verification.

Current exact implementation checks:
https://github.com/drsurfbum/bimcraft-SDH/pull/18/checks

## Short test guide after local reconciliation

Use a separate browser context/tab and the synthetic `fixtures/f04/layered-plans.ifc`; preserve user browser projects.

1. Start `devshell/preview-f09.command` only after checking 8061 is unused. It runs the existing offline dev shell; dependencies must be checksum-verified.
2. Open the fixture, enable Draw and plan layout. Open Keyboard shortcuts and explicitly choose the BIM ribbon profile. The default remains unchanged until this choice.
3. Try WA, DR and WN; verify one start per sequence. DI starts aligned reference dimension only in the established layout. Unsupported Model Copy/Move/Rotate/Align/Graphics commands must explain their limits.
4. Type in wall Properties and use native text Undo. Verify the IFC/history is unchanged until a normal model commit.
5. Right-click an unselected wall: opening preserves selection; Select this wall changes it explicitly. Test active-tool Cancel, right-button pan and keyboard menu invocation.
6. Choose core exterior versus exterior finish in Wall target; inspect the analytic line/candidate before committing. Multiple hosts require an explicit candidate. Escape clears temporary targeting. No persistent constraint is created.
7. Exercise a supported straight-wall grip edit, cancellation, Undo/Redo and save/reopen. Check hosted IDs, orientation, named references and precise geometry.
8. Repeat supported scenarios in the integrated workspace, leaving C-specific documentation activation unavailable.

Recommended next action: restore the execution environment, reconcile this feature's local checkout with the published branch, fix the two harness/UI gates above, then finish exact-head UI/MCP/independent-output validation. Keep the PR draft and do not merge.
