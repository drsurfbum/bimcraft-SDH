# F08 PR #13 — PM receipt correction review, October 26, 2026

**Verdict: ready for an authorized merge of the bounded F08-A slice at delivery `b3e768e9c2e45ce47e62f35f4befc687dcca2cdf`. F08-PM-02 is CLOSED. F08-PM-01 remains CLOSED.** No new merge-blocking finding was identified. PR #13 remains draft/unmerged; approved main remains `21ff2842e1925f148e9b75c404476b59333f7475`. This review does not mark the PR ready or authorize adoption.

The correction/test cutoff is `0b91ab1e064987e5bddfe08268e4e19980ea2e5a`. Its application, tests, devshell, workflows and package configuration are identical to the evidence-only final delivery. Both new commits descend from the previously PM-reviewed `7880004`; the accepted main and original F08 history are retained. F28-C remains separate.

## F08-PM-02 — CLOSED at b3e768e

The receipt counts the request's confirmed synchronous commit independently of subsequent stack length. It checks the exact owned result/history entry, unchanged prefix labels/kinds and expected Redo state before advertising Undo. Replay does not overwrite the original captured readback. A no-op still reports zero steps.

PM freshly replayed both actual native UI interleavings over real HTTP MCP in a disposable browser, then repeated the original PM reproducer with the native Undo control and height input:

| Person action after the confirmed agent mutation | Verified current state | Corrected receipt |
| --- | --- | --- |
| Native Undo | Agent step is in Redo; join allow restored | One confirmed own step; interrupted/history_changed; captured readback noncurrent; Undo unavailable and owner null |
| Native wall-height edit to 2900 mm | Agent join then person-owned Wall entry; actual height 2900 | One confirmed own step, not two; interrupted/history_changed; captured 3000 mm commit data noncurrent; Undo unavailable and owner null |

Ordinary MCP Undo refuses as `history_empty` after the person's Undo, and `person_owned` after the height edit. The native suite verifies normalized IFC bytes and both history fingerprints unchanged by these refusals. Native replay restores the original physical profiles. No automatic rollback/retry, blocked person controls, production timing delay or mocked dispatcher/mutation was introduced. Existing native project switching, full-project closure, readback/rebind, alias protection, unsupported records and source/package checks remain passing.

One extra PM harness attempt watched only an enabled quick-access Undo button and missed the interleaving window: the tool correctly returned an ordinary one-step success, causing the harness's expected-interruption assertion to fail. That failed log is retained privately. The repeat used the existing native Undo control at the same settled commit boundary and proved both actual interleavings. The full native suite independently passed both cases; no failed attempt is represented as a product pass.

## Fresh PM execution on the exact delivery

| Check | Verified result |
| --- | --- |
| F08/MCP focused suites | 81 passed, zero failures/skips |
| Foundation/F28 focused suites | 39 passed, zero failures/skips |
| Source stdio | 10 groups / 361 actual calls passed |
| Isolated packaged stdio | 10 groups / 361 actual calls passed; nine required module hashes match source; missing module refuses startup |
| Live HTTP/browser | 13 groups / 353 actual calls passed; zero application exceptions; five platform warnings retained verbatim |
| Additional PM native reproducer | Both actual person actions fired; one own commit, noncurrent captured data and unavailable Undo; person-owned MCP Undo refusal retains history |
| Independent semantic saved IFC | Three actual source/package/live outputs: zero schema/EXPRESS findings; 18 profiles and two unchanged dimension records each, hosted openings/types retained |
| Final-head GitHub CI | All eleven distinct workflow types pass on b3e768e |
| Downloaded final F08 CI artifact | Retained 39 PHP/browser checks, both corrected native receipts, independent saved-file/complete CSV/vector PDF and 28-case geometry evidence verified |
| Downloaded final F03 artifact | 900 browser observations; 30 size/workload groups at n=30, warmups 5; zero source errors |

Source/package mirror builds were sequential. Fresh browser contexts and temporary ports 8068/8069 were used; original 8040 and user browser projects were untouched. Independent saved profiles retain the 0.005 mm bound. Measured overlap about 0.0000535154 mm² remains within the unchanged saved serialization bound of 0.05 mm², distinct from the stricter unrounded 28-case matrix. The live independent report's inherited null head field is retained; it is paired with the transport report pinned to b3e768e and the actual saved file. Mac warnings and local PHP availability limits are not recast as a fresh full local PHP/browser pass.

The F03 aggregate retains 27 separately unverified model-domain groups; the browser artifact does not certify them. Shared-runner/headless collection is not native-GPU equivalence, universal CAD accuracy or performance-target closure. No workload, tolerance, fixture/golden or required gate was reduced.

## Adoption and remaining scope

No required human-only defect test remains before adopting this reviewed slice. An optional visual demo can be useful but does not replace the automated checks above. Full F08 remains partial: curves, continuous interior-X splitting, unequal-height carving, finish wrapping, F09 snapping, general Join Geometry and the dedicated workspace join adapter stay deferred.

Preserve the agreed separate adoption order. If F28-C or another change reaches main first, reconcile F08 against that newly approved main and validate the combined exact head before merging; this approval is pinned to b3e768e on current main 21ff284, not an untested later combination.

PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01, broader semantic MCP catch-up and CI runtime headroom remain OPEN. F08-PM-01, F08-PM-02, MCP01-PM-01 and UP07-PM-01/02 are CLOSED for their verified pins. F28-C's documentation MCP/integration gates and inherited narrow-window usability follow-up are not closed by this F08 review.

Original branches/checkouts, eleven duplicate/untracked F08 files, unfinished F28-C alignment work and running user previews were not changed. No readiness transition, merge, deployment, persistent client configuration, package publication, default-layout change or cross-chat message occurred. Only sanitized review prose/roadmap status is published; raw model/export files and full private traces remain local.

[PR #13](https://github.com/drsurfbum/bimcraft-SDH/pull/13) · [Pinned delivery handoff](https://github.com/drsurfbum/bimcraft-SDH/blob/b3e768e9c2e45ce47e62f35f4befc687dcca2cdf/docs/features/f08/SEMANTIC-HANDOFF.md) · [Final F08 CI](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40422947161) · [Final F03 CI](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40422941805) · [Prior PM review and original finding](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/F08-SEMANTIC-PM-REVIEW.md)
