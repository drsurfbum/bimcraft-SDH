# F08 semantic MCP and integrity re-review

Draft PR [#13](https://github.com/drsurfbum/bimcraft-SDH/pull/13), still draft and
unmerged. Owner: this F08 semantic/protection follow-up chat, October 26, 2026.
F08-PM-01 is **OPEN pending PM verification** of the final delivery. Full F08 is
partial beyond the bounded straight-wall slice.

## Exact lineage and preservation

| Input / delivery | Commit |
| --- | --- |
| Approved main, including upstream 0.7 + accepted MCP-01 | `21ff2842e1925f148e9b75c404476b59333f7475` |
| Preserved reviewed F08 cutoff | `82e680f389a11cc84e79f3fcca79581456e6e79c` |
| Normal two-parent merge of approved main | `45fe2b99f9c7f2d0b71819bb0d1e3aa7f5ef780f` |
| Application/tools/protection implementation | `b65ad325220cd62b96c7d58179d4a3b4eb3245c6` |
| Complete CSV and actual live schema checks | `4866e5c5c7af05c5dab7c7a7e9a0451e2cce18da` |
| Complete code/test cutoff, including approved-main measurement pin | `2c1cb9e8df78d633874e88418d92acddb907ee11` |

The final delivery is the evidence-only commit introducing this handoff. PR #13's
execution record identifies its exact 40-character SHA and all final-head run URLs;
implementation-head results are explicitly separate. No subsequent evidence-only
commit should be made without rerunning every applicable workflow again.

Checkout: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f08-07-candidate`.
Local branch remains `candidate/f08-07-final-published`; public PR branch remains
`feature/f08-wall-joins`. Reviewed cutoff has a local backup branch
`backup/f08-reviewed-82e680f` and a private complete candidate bundle. Original
`bimcraft-f08`, `bimcraft-f08-upstream-candidate` and the unrelated unfinished
F28-C alignment state were status/head/untracked-hash compared and remain unchanged;
all eleven original F08 duplicate/untracked files are intact. No reset, rebase,
force push, object repair, stash, merge abortion or user-browser interaction occurred.

Approved main merged with **no text conflicts**. Its complete tool catalog,
instance/revision guards, alias-owner protections, history/replay fixes, package
closure, translations and F28-A/B behavior are retained. F28-C is separate and
unmerged; no candidate was imported. Adoption remains separately gated; if main
advances, obtain the next approved cutoff and reconcile normally. This feature
must retain any accepted C tools/protected records during that later merge.

## Protection fix and semantic implementation

`IfcEditor.setProperty` centrally protects `CadCraft_WallJoin`, keeping every
previous protected owner and the resolved shared-property-owner scan. Direct names,
forged display references, real direct property references and correctly resolved
ordinary aliases all produce the **specific protected model record refusal**.
No generic property write regenerates joins or becomes another editing route.

Tests compare normalized IFC bytes, both history stacks, actual physical profiles,
neighboring walls, hosted openings and persistent dimension references/values.
The public editor API and genuine live/source/package `element_set` calls are
covered. Live refusals use an unchanged raw-byte hash and both full history-stack
fingerprints; source/package refusals save and compare the complete IFC while a
real Redo entry survives, followed by successful Redo/Undo.

The three tools are implemented in `wall-join-agent.js` and registered through the
accepted shared `modelTools`/live installer/headless wrapper/package closure:
`wall_joins_get`, `wall_join_end_set`, `wall_join_diagnostics`.
[The contract](MCP-CONTRACT.md) defines the actual accepted `documentId`, revision
and headless `doc` binding, strict A/B patches, permissions, classifications,
mm/code results, no-ops/migration and receipts. [The capability matrix](CAPABILITY-MATRIX.md)
distinguishes implemented/registered/transport-tested/temporarily connected from
user-client configuration, inherited gaps and deferred geometry/UI work.

Typed edits call `changeWall` and the ordinary atomic domain journal/regeneration;
there is no replacement dispatcher, geometry implementation, model store or history.
Reads do not migrate, invent effective settings for invalid records, guess neighbors
or certify joining from eligibility. Diagnostics calculate complete participating
storeys, including T hosts, before filtering. The other end's controls and existing
node/T relations survive. Supported identical controls are genuine no-ops; absent
or legacy same-value explicit edits migrate in one undoable step.

A native active-project switch during the real HTTP edit's awaited rebuild proves
honest completed progress: `POST_COMMIT_INTERRUPTED`, `changed:true`, one completed
original history step and original-document readback. Replacement IFC bytes and
both history stacks remain unchanged; ordinary Undo on the original works. Unit
checks additionally cover precommit switching and postcommit notification failure.
Headless binding rechecks that a handle still owns its session across awaits.
Accepted MCP-01 person ownership, replay and native multi-step Undo switch tests
are retained and independently repeated.

## Executed evidence and limits

All application modules are byte-identical between the application implementation
and complete code cutoff. Local semantic reports are pinned to `2c1cb9e` and are
supplemented by every required final-delivery CI workflow, whose exact links and
executed counts are in PR #13.

| Check | Executed result |
| --- | --- |
| Combined F08/MCP focused tests | **76 passed**, zero failed/skipped: retained F08 20 + new semantic 14 + retained MCP-01 42 |
| Retained foundation/F28 focused checks | **39 passed**, zero failed/skipped |
| Source stdio MCP | **10 groups / 353 actual calls**; catalog 46 in exercised permission groups; all three schemas equal shared definitions plus doc |
| Isolated packaged consumer | **10 groups / 353 calls**; catalog 46; fork name/version and nine application module hashes exact; deleting required module makes startup fail |
| Live token-protected HTTP MCP | **10 groups / 327 calls**; catalog 32 in exercised permission groups; actual schemas equal shared definitions; native switch and six negative-record/geometry fixtures |
| Each semantic surface | Both physically joined ends × all allow/cap combinations, T/node retention, **24 ordinary Undo/Redo cycles**, genuine no-ops, invalid/foreign/stale/permission refusals, actual save/reopen |
| Independent semantic saved IFC | Three actual saves × 18 walls, zero EXPRESS/schema findings; all physical profiles within **0.005 mm**, two unchanged dimension records, hosted openings/types retained |
| Existing MCP-01 regressions | Source/package/live workflows and independent saved-file checks pass; native multi-step Undo/project-switch assertions repeat twice (six checks); alias-owner behavior retained |
| Local reader-enabled baseline | **709 passed**, zero failed; 21 explicit optional-reader/sibling/Poppler availability notices. Not claimed as the fuller CI baseline |
| Retained DF.25 | **32 passed**, zero failed, including independent saved-file validation |
| Local legacy npm suite | Seven test files pass; optional environment/setup notices retained |
| Required F08 browser | Required CI still runs **39 checks**, including PHP catalogs/units; no check is removed |
| Local F08 browser | **14 functional checks pass**, zero application exceptions; 24 PHP checks unavailable; unchanged strict console gate **FAILS** on Mac Chromium 151 SwiftShader ReadPixels warnings |
| Independent original F08 saves/exports | Six actual IFC files pass EXPRESS/schema; Copy Level relation remapping/multi-level cases retained; complete CSV/PDF results below |

Catalog sizes differ because live and headless expose their established transport-
specific catalogs and permission groups. They are not expected to match by count.
Semantic definitions match; nine shipped application modules match exact source
hashes, including guard, registry, domain geometry/readers and history adapters.
Package identity remains the accepted private fork `@drsurfbum/bimcraft-mcp`,
`0.7.0-mcp01.1`; no npm publication or persistent client was configured.

Independent F08 output checks retain the **28-case** angle/core/orientation matrix:
zero supported joined overlap; ideal-union difference approximately
`6.313891375338436e-9 mm²`. Bounds remain `<0.00001 mm²` overlap and `<0.001 mm²`
union for that unrounded matrix, separate from 1 mm discovery and 0.005 mm saved
profile measurements. The retained saved-IFC serialization overlap bound is
`0.05 mm²`; actual semantic-save overlap is approximately `0.0000535154 mm²`.
No preexisting tolerance was relaxed. Intentional copied square/disallowed overlap
remains approximately `59878.9125535 mm²`, with zero source/copy difference; it is
not certified as cleaned joining.

Actual CSV: **13 rows × 17 columns = 221 cells**, including every identity,
material/name, layer order, function, core/membrane/cavity flag, blank field,
summary/total, usage and status, independently compared to the **downloaded IFC**;
11 layer rows. Actual vector plan: **1,292 checked vertices**, none outside
MediaBox, zero raster images. Detail: **65 fill polygons**, maximum error about
`0.000002312 mm`. Existing physical assertions, strict stair assertion comparison,
core anchors, Copy Level refusal/remapping, dimensions/openings, autosave/recovery
and isolated fixtures remain intact; golden models were not refreshed.

[Sanitized evidence](../../../evidence/f08-semantic) includes full actual catalogs,
request/result metadata with physical-profile hashes (payloads omitted), module
hashes, reader reports, native-switch receipts, failure/retry summaries and two
screenshots. Raw IFC/CSV/PDF, full snapshots, request payloads and recovery/package
archives stay private/local or ephemeral. Source and package schemas are exercised
through actual stdio; live calls use real HTTP → browser `host.control`, not an
internal dispatcher substitute or DOM modeling route.

The local legacy Undo byte mismatch was DATA-row ordering only: exact full STEP
entities, IDs, values and multiplicity are compared after row-order normalization.
Protection refusals still compare raw bytes unchanged. The initial schema-mirror
race, overwrite-fixture setup error, new saved/matrix-bound mix-up, Python reader
setup failures and all retries are retained in [attempts.json](../../../evidence/f08-semantic/attempts.json).
There is no broad console-warning suppression. Local Mac/Chromium 151 software-GPU
results and pinned CI Linux/Playwright results remain distinct. PHP/optional-reader
availability is not counted as passing execution.

## Final-head CI and PM re-review

Exactly eleven workflow types apply at this approved base: Tests; F03 performance;
F04, F05, F06 browsers; F28 and F28-B browsers; upstream compatibility; 0.7 foundation;
MCP-01 semantic; F08 acceptance. All are retained with their existing workloads,
samples and tolerances. F08 acceptance adds source/package/live semantic checks
and independent saved-file validation to its existing browser/export/model checks.
PR #13 records final evidence SHA, exact-head URLs, attempts and counts. A green
implementation-head run alone is not final-delivery validation.

PM should independently repeat the protected direct/forged/resolved-alias refusal,
verify ordinary and interrupted ownership on the final published build, inspect
actual catalogs/receipts/profiles and review exact final-head CI. No required
human-only test can substitute for these automated gates. This delivery does not
request a mark-ready transition, merge, adoption or deployment.

## Preview and remaining scope

Check TCP port **8040** before running `devshell/preview-f08.command` here, then
open `http://127.0.0.1:8040/` and `fixtures/f08/straight-joins.ifc`. Automated browser
sessions use fresh contexts and temporary assistant connections, closing them on
completion. The final response/PR states whether a separate local preview remains
running. Existing user browser projects/previews were not used or changed.

Scope remains straight L/T and selected endpoint X, matching world base/top,
core-priority cleanup and per-end allow/cap. Curves, continuous interior-X identity
splitting, unequal-height carving, finish wrapping, F09 snapping, general Join
Geometry and the dedicated workspace join UI adapter remain deferred. Full F08
stays partial.

**OPEN:** F08-PM-01 pending PM; PERF-F04-01; PERF-F05-01; TEST-F28-01; UP07-MEP-01;
broader semantic MCP catch-up; CI runtime headroom. **CLOSED, preserved:**
MCP01-PM-01 and UP07-PM-01/02. No shared-roadmap, default-layout or cross-chat change.
