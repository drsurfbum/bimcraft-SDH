> Latest PM verification: delivery `b3e768e` closes F08-PM-02. F08-PM-01 stays CLOSED. The bounded F08-A slice is ready for an authorized merge on approved main `21ff284`; PR #13 stays draft/unmerged. All eleven exact-head workflow types pass; 81 + 39 focused tests and native interleaving checks pass. Full F08 remains partial. [Correction review](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/F08-PM02-REVIEW.md). Earlier findings below are historical.

# F08 PR #13 — PM semantic re-review, October 26, 2026

**Verdict: not ready for merge yet. F08-PM-01 is CLOSED at delivery `78800041c6960d4081b5bcdacae3ca6a432ff591`. The three join tools are implemented, registered and exercised through real live/source/package transports. One new P2 receipt correctness finding, F08-PM-02, remains OPEN.** PR #13 stays draft/unmerged; main remains `21ff2842e1925f148e9b75c404476b59333f7475`.

Implementation/test cutoff `9f9be939212be29fa2d3851fe2f44ac4eaff61a2` has the same application/tests/workflow/package files as final evidence delivery `7880004`. The normal merge retains reviewed F08 `82e680f` and accepted main `21ff284`; no unmerged F28-C candidate is imported. This is an F08 delivery regardless of the referring chat's title.

## F08-PM-01 — CLOSED

The central `IfcEditor.setProperty` guard now includes `CadCraft_WallJoin` and retains resolved-set and shared-property-owner protection. Fresh focused execution checks direct, forged-display and actually resolved shared aliases, with the specific protected-record refusal, identical model/shape/reference state and both history stacks intact. The same direct/alias refusal is freshly exercised over real source stdio, isolated packaged stdio and HTTP to a fresh live browser. Genuine Redo state survives refusals and ordinary Redo/Undo still succeeds. This closes the prior generic-write/settings-versus-Body defect; it is not an unresolved-property false positive.

Typed `wall_joins_get`, `wall_join_end_set` and `wall_join_diagnostics` are present in actual catalogs and strict schemas. They use accepted document/revision binding, authoritative `changeWall`, full-storey neighborhood calculation, ordinary journals, no-op/migration rules, and explicit unsupported/duplicate diagnostics. Participating-neighbor ambiguity is refused, not resolved by first match. Native project switching and whole-project closure retain captured original-commit readback and do not edit the replacement project.

## F08-PM-02 — P2: interleaved person actions are misreported as agent progress / Undo availability

Location: `app/wall-join-agent.js:129` (with response assembly at lines 123–130).

The response computes `completedSteps` as `ed.changes.length - history` after awaited UI work and advertises assistant Undo whenever that net count is positive. That is the whole history's net growth, not this request's confirmed mutations or its actual next Undo ownership.

PM first reproduced both cases against real editor/domain operations, then repeated them through **real HTTP MCP and ordinary native UI controls** at the settled post-commit boundary. The private observer uses the same native-control timing pattern as the accepted project-switch tests; no dispatcher or mutation is mocked.

| Interleaving after one confirmed agent join mutation | Actual state | Incorrect receipt |
| --- | --- | --- |
| Native Undo button | The person undoes the one agent step; join allow is restored; agent step is in Redo | `changed:true`, `completedSteps:0`, `complete:true`; captured commit readback still shows the prior disallow |
| Native wall-height input changed to 2900 mm | Two history entries: `Assistant: wall_join_end_set`, then person-owned `Wall`; only one belongs to this agent request | `completedSteps:2`, `undo.owner:'assistant'`, `undo.available:true`, despite the next step belonging to the person |

For the second case PM immediately requested ordinary MCP Undo: the accepted history guard correctly refuses as `person_owned`, with history unchanged. **No person-owned edit was undone and no new physical-model corruption was demonstrated.** The remaining defect is the tool's false progress/availability receipt and missing interleaving coverage, not a failure of the retained Undo guard.

Fix criteria:

- Count the request's confirmed own commits independently of later history length changes. This single-end edit has one confirmed mutation even if a person later edits or undoes it; an actual no-op has zero.
- Derive Undo availability from the actual expected owned history entry/transition, not a positive aggregate delta. Do not advertise ordinary assistant Undo over a person step or an already-undone/closed/replaced original mutation.
- Detect and describe interleaving according to the accepted ownership contract. Preserve captured commit-time data as explicitly captured data; do not imply it necessarily describes current state after another action. If reporting interruption, retain honest committed progress; do not claim rollback or perform an automatic undo/retry.
- Add both native UI interleavings and corresponding focused tests, including the current `person_owned` refusal and unchanged human state. Retain existing project-switch, whole-project close, rebind, no-op, alias, source/package and replay checks.
- Keep ordinary person editing and Undo usable; do not remove UI actions, disable switching or add production delays to hide the race.

Evidence: `native-interleaved-receipts.json`, `unit-interleaved-receipts.json`, `pm-receipt-browser.mjs` and `pm-receipt-interleave.mjs` beside this report. The native proof was repeated with the person-Undo protection check. Temporary browsers and test servers were closed; no existing user project/browser was used.

## Fresh PM verification on exact delivery

| Check | Result |
| --- | --- |
| Combined F08/MCP focused suite | 79 passed, zero failed/skipped |
| Retained foundation/F28 focused suite | 39 passed, zero failed/skipped |
| Actual source stdio | 10 groups / 361 calls passed; actual schemas include all three tools |
| Isolated packaged consumer | 10 groups / 361 calls passed; nine required application modules byte-match source; missing module refuses startup |
| Real HTTP/live browser | 11 groups / 335 calls passed; no application exceptions; native source-switch and whole-project closure assertions pass |
| Independent semantic saved IFC | Three actual outputs: zero schema/EXPRESS findings; 18 wall profiles each, two unchanged dimension records, hosted openings/types retained |
| Final-head CI | All eleven distinct workflow types verified successful on `7880004` |
| Final F03 artifact | 900 measured observations; 30 groups with n=30; zero source errors; collection is not performance-target closure |
| Added PM interleaving tests | Reproduce F08-PM-02 despite the existing suites passing |

The live suite uses a private test-only copy with port 8068 substituted for hard-coded 8040; assertions and production source are unchanged. The additional native receipt proof uses separate port 8069 and its own output directory/profile. Source/package mirror operations were sequenced to avoid the previously documented mirror race. Full private request/response/model payloads remain local; only sanitized review prose is published.

Independent semantic-save overlap is approximately `0.0000535154 mm²`, within the unchanged saved-IFC serialization bound `0.05 mm²`; that is separate from the stricter unrounded 28-case matrix bounds. All geometry/identity/cavity/membrane/dimension limits remain the documented bounded scope. Exact-head CI retains the 39-check PHP/browser workflow and original IFC/CSV/vector-PDF acceptance. No fresh local full PHP/browser pass or universal production/GPU accuracy is claimed.

Main and the owner candidate were read without changing them. The owner checkout was clean at `7880004`; the PR is draft/unmerged. Existing branches, original duplicate files, unfinished F28-C alignment work and user browser projects were not modified. PM did not start, stop or reuse the preview on 8040. Existing PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01, broader semantic MCP catch-up and CI runtime-headroom concerns remain OPEN. MCP01-PM-01 and UP07-PM-01/02 remain CLOSED. Full F08 remains partial beyond this straight-wall slice.

No required human-only test replaces the receipt fix. Next: return F08-PM-02 to the owner, publish the focused correction plus native regressions and exact final-head CI, then request PM re-review. No readiness transition, merge, deployment, client configuration, default-layout change or owner message occurred.

[PR #13](https://github.com/drsurfbum/bimcraft-SDH/pull/13) · [Delivery handoff](https://github.com/drsurfbum/bimcraft-SDH/blob/78800041c6960d4081b5bcdacae3ca6a432ff591/docs/features/f08/SEMANTIC-HANDOFF.md) · [Previous PM finding](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/F08-0.7-PM-REVIEW.md)
