# BimCraft 0.7 integration plan

Prepared October 25, 2026. Status: **planning and read-only assessment complete; implementation has not started**. Main, feature branches, original checkouts, running previews and browser projects have not been rebased, merged, reset or switched by this assessment. Roadmap publication records planning status only.

## Recommendation

Bring the pinned 0.7 release into an isolated, history-preserving candidate based on our accepted main. Validate that foundation first. Then adapt MCP-01, F28-C and F08 as separate feature candidates, reviewing overlapping implementations by capability and evidence. Adopt only accepted slices into main, with fresh validation after every merge.

“Rebase” is the project goal of moving onto current upstream. A literal rewrite of our published main is unnecessary: the last upstream pin is already an ancestor of both histories. Prefer an ordinary merge on a disposable integration branch. If a maintainer later requires a clean rebased contribution branch, produce it separately from verified pins; do not force-push or rewrite our working main/feature histories.

We cannot promise that integration will reveal no defects. We can preserve recovery paths, expose regressions before adoption and prevent known failures from being treated as acceptance.

## 1. Verified starting points

| Work | Exact pin | Current acceptance state |
| --- | --- | --- |
| Accepted fork main | `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711` | Integrated through F28-B; seven workflow types passed; local 707 baseline checks recorded |
| Previous upstream | `46275e4e09aa7a086836b98372f73422dec6d74d` | Already incorporated through PR #15 |
| Upstream 0.7 | `c778c7ca3f83eeecc3e815078417f152b2ca7a94` | Official `bimcraft-v0.7.0` release; currently also upstream main; not yet accepted into our fork |
| F28-C PR #12 | `f956fac00adf1d4d51ddc2e4253fe215a2c50acd` | Draft/unmerged; source-targeting correction accepted at this pin; documentation MCP and integration acceptance remain open |
| F08 PR #13 | `f929205133316b29a4551083792d5712d5ffcabd` | Draft/unmerged; eight workflows passed; fresh PM model tests 17/17; semantic join MCP remains blocking |
| MCP-01 PR #16 | `9224167fe3e2e856c57679065b545d834f52ade1` | New undo-fix delivery submitted; eight exact-head workflows pass; PM re-review pending; MCP01-PM-01 is not closed by this plan |

The F28-C owner also has an **unfinished local alignment merge** on `candidate/f28-c-upstream-1afe80e`, separate from published PR #12. It is based on the published F28-C head and has MERGE_HEAD `1afe80e`, staged changes and untracked evidence. The current inventory fingerprints 75 changed/untracked paths there. This is real progress that a branch-only backup would miss. Do not abort, commit, stash, retarget or overwrite it on the owner's behalf.

Feature heads and upstream may advance. At execution time, refresh the inventory and obtain a concrete owner handoff/cutoff. Do not silently replace these pins with a moving main or newer feature delivery. No owner has been interrupted, messaged or reassigned by this plan.

## 2. What the full comparison found

The three upstream commits since our previous pin change **1,166 files**, including **700 test/fixture paths**. The initial GitHub compare response returned only 300 files; this plan uses a complete Git comparison.

Comparing upstream's change set with our accepted main's differences from the same old upstream:

- 62 paths overlap; **31 are byte-identical** between accepted main and 0.7, including record-contract, several drawing/model helpers and fixture files.
- The remaining **31 overlapping paths differ**. Several material/assembly differences are localization adaptations; other important differences include multi-level walls, regeneration, redo identity and workspace integration.
- 1,104 changed upstream paths are outside that overlap. Our 402 fork-only difference paths include tests, documentation, evidence and older workspace implementation files. These counts are inventory, not conflict counts or a reason to copy every file.
- F28-C's published delta overlaps nine upstream-changed paths; F08 overlaps ten; MCP-01 overlaps five. Semantic dependency changes can cause problems even where Git merges cleanly.

0.7 incorporates our wall/material work and parts of the ribbon design, but integrates the UI through its shared workspace architecture. Relevant new pieces include `app/workspace-bimcraft.js`, `app/workspace/engine.js` and shared workspace assets under `devshell/site/`. Replacing these wholesale with our older shell could discard upstream layouts, localization and integration work.

0.7 also adds agent operations such as element/property editing, deletion, movement, wall/opening changes, and live USD/render actions. These do **not** by themselves establish material/assembly parity or F08 join-end control access. MCP-01 adds a different set of semantic operations and document/history protections. Both sets need reconciliation.

## 3. Preservation and recovery gate — before any code integration

Already completed for planning:

- Recorded heads, local branch refs and working-file status across **17 existing checkouts**; recorded canonical remote heads.
- Recorded private hashes of changed/untracked files to expose accidental alterations. Hashes are an inventory, not a backup of unfinished work.
- Copied the five pinned histories into an isolated bare object store and passed a connectivity check.
- Created and verified a complete local **committed-planning-pins.bundle**, covering accepted main, 0.7 and all three published feature pins. It is about 34 MB and is not uploaded publicly.

Required again at the actual execution cutoff:

1. Refresh committed pins and create dated backup refs/bundles without moving original branches. Cover every existing local/remote branch and unpublished commit across all 17 checkouts, including documentation and older backup branches, not just the five planning pins. Verify each bundle by restoring it into a fresh temporary repository and checking ancestry/trees.
2. Separately snapshot staged and unstaged binary-safe patches, non-ignored untracked files, index/merge metadata and needed ignored assets. For the active F28-C merge, preserve the complete recoverable state, not just HEAD. Verify archive bytes/hashes and a restoration rehearsal without touching the owner checkout. Wait for a consistent owner handoff if files are changing; do not kill work to obtain one.
3. Preserve test source pins, package/asset manifests, existing previews, browser recovery state and current Git identity. Test in fresh browser profiles/storage and unused ports. Do not clear shared localStorage/IndexedDB or restart existing previews.
4. Use copies of project files. Retain untouched originals and checksums. New 0.7 capabilities can introduce records that an older app cannot edit; do not assume downgrading code reverses saved-file changes.

**Local F08 history-read problem:** fetching the candidate's full local history failed with a bad-tree-object error. Reading the published delivery from canonical GitHub succeeded, and the isolated pinned histories passed connectivity validation. There is no demonstrated loss of the published delivery. Do not repair/delete objects or reset the original in place. Before execution, restore a clean candidate from the verified canonical history/bundle and compare its tracked tree and any local-only work. Stop using the suspect copy as an archival source until verified. Recovery is separate from feature acceptance.

Gate passes only when committed **and unfinished** work has a tested recovery route. An inventory or successful clone alone is insufficient.

## 4. How to choose the best parallel implementation

Build a capability ledger with: old accepted behavior, upstream behavior, unpublished feature behavior, chosen authoritative operation, retained tests, known gaps, evidence and reviewer decision. The default preference is to reuse supported upstream architecture where it meets our requirements, then port missing improvements narrowly. Neither “ours” nor “newer” automatically wins.

| Area | Proposed direction, subject to proof | Required evidence before choosing |
| --- | --- | --- |
| Materials, recipes and persistent dimensions | Reuse upstream's adopted implementation and translations; retain our stronger precision/migration checks and material/instance semantics | Stable IDs, layer/core ordering, cavity width/ventilation, zero membranes, unchanged defaults vs instance widths, reversible migrations, corrupt-record refusal and raw mm read-back |
| Workspace shell | Evaluate the official ribbon/project-browser engine as the foundation; adapt F28-C's missing documentation capabilities and target guards to it | Side-by-side workflow inventory, reachable existing tools, camera/tab/source ownership, resize/focus, disabled-tool explanations, explicit View range label and classic fallback |
| F28-C documentation | Preserve its verified source-ID/editor guards and real views/annotations/schedules/sheets/exports, even if the hosting UI changes | Original wrong-source/duplicate-name regressions, continuation placement, shared-type updates, actual save/reopen and CSV/vector PDF contents |
| MCP | Combine upstream's useful operations with MCP-01's typed material/wall operations and reviewed history guards through one shared dispatcher/domain layer | Tool/schema union, actual live/headless calls, explicit source binding, permissions, invalid/stale input refusal, correct Undo/Redo and packaged-module identity |
| Multi-level walls and F08 | Preserve 0.7's multi-level wall behavior; introduce bounded F08 joins only after geometry comparison and MCP access exist | Cross-storey cut visibility/regeneration, base/top offsets, selected L/T/endpoint-X cases, openings, dimensions, supported caps and explicit unsupported conditions |
| Drawings and performance | Preserve correctness first; retain validated upstream improvements such as dimension lookup and redo identity | Same-fixture independent geometry/vector checks, representative workloads and same-machine performance records |
| Test/build infrastructure | Keep upstream app/asset architecture and our acceptance gates together | Complete pinned host/import-map/vendor/module closure, licenses/notices, offline startup and no silent mandatory-test skips |

Record each decision as **reuse**, **port missing behavior**, **combine narrowly**, or **defer with an explicit limitation**. Retire a duplicate implementation only after its capabilities are accounted for and the chosen replacement passes. Preserve the original source in history/recovery refs.

There should be one authoritative modeling implementation and one command/agent routing strategy, not parallel competing geometry, recipe or history engines. UI may have multiple layouts using those shared operations. A UI button wrapper is not a permanent MCP API.

## 5. Execution order and checkpoints

### Gate A — preservation and capability decisions

Complete section 3, resolve the F08 recovery prerequisite, capture F28-C's unfinished state and review the ledger. Classify the 31 divergent shared paths by semantic area. Do not bulk choose Git's ours/theirs on application files, language catalogs, manifests or workflows.

Deliverable: verified backups, exact pins, overlap map, proposed ownership and per-capability choices. No main change.

### Gate B — 0.7 foundation candidate only

Create a new isolated integration branch from accepted main and merge the pinned 0.7 commit into it. Do not import F28-C, F08 or MCP-01 into this first foundation candidate. Resolve overlapping accepted behavior deliberately, preserving original author/history information.

Preserve upstream's multi-level walls, language catalogs, shared workspace assets and newer APIs while retaining all accepted F01–F06/F28-A/B behavior and declared scope limits. Ensure the standalone development shell and browser build load the real new shared workspace dependency: an older generated page/import map cannot stand in for the 0.7 host.

Run the foundation acceptance matrix below. Classify any upstream-only failure against an unmodified 0.7 control and an old-main control; do not relabel it as a passing check. Required workflow failures block adoption unless a concrete scoped decision is explicitly approved.

Deliverable: draft foundation PR, reviewed resolution log and green exact-head evidence. Main remains unchanged until separately authorized adoption.

### Gate C — MCP-01 first feature candidate

Re-review submitted fix `9224167` against MCP01-PM-01. Do not assume green CI or this planning exercise closes the finding. Then port the accepted fix/tool slice onto the validated 0.7 foundation in a separate candidate.

Reconcile the five shared upstream paths, especially registration, application history callbacks, headless wrapping and package closure. Retain useful upstream tools as well as our custom-type/recipe access. Preserve upstream redo GUID stability together with our editor/session/history guards. No static built-in enum may silently reject authored types where they are supported.

Explicitly test whether generic upstream property/element tools can bypass protected material/assembly/wall record contracts; route edits through authoritative operations or refuse protected writes as appropriate. New entry points must not silently defeat the existing migration/refusal rules. Keep capability-specific permissions and allowed roots intact.

Deliverable: separate reviewed MCP candidate, real transport/package evidence and clear remaining gaps. Persistent user-client setup follows acceptance; do not change global client settings or credentials during integration.

### Gate D — F28-C workspace/documentation candidate

Use the owner's eventual committed handoff **and** preserved local alignment work. Assess whether 0.7's shared ribbon shell can host the required C behavior. Port missing source/documentation adapters and guards rather than restoring a second obsolete shell wholesale.

Preserve the user's familiar layout goals and existing route to tools; keep the established default/fallback unless a separate product decision changes it. Demonstrate equivalent workflows in a side-by-side preview before retiring duplicate UI. Documentation MCP gaps still require their own implementation/evidence or explicit user scope decision before full feature acceptance.

Deliverable: separate draft candidate and command/capability migration checklist. A compatible UI alone does not authorize its merge.

### Gate E — F08 geometry and semantic join candidate

Use clean verified F08 history. Reconcile model operations, slab/plan clipping, multi-level walls and UI helper seams with the chosen foundation. Preserve the supported straight-wall slice and explicit unsupported categories; do not add curves, interior-X splitting or finish wrapping to make integration appear complete.

Implement and validate the separately scoped join/end MCP operations before full F08 acceptance. The proposed F08 contract does not automatically expand MCP-01's bounded materials/walls assignment. Correct the stale browser-report baseline label. Run all supported geometry cases, then exercise joins through real MCP, Undo/Redo and actual save/reopen/export.

Deliverable: separate draft candidate with join capability coverage and geometry evidence. F08 remains unmerged while that gate is open.

### Gate F — combined rehearsal, then incremental adoption

Build a disposable cumulative rehearsal from the accepted candidates to reveal shared seams. Re-run cross-feature scenarios. A successful combined rehearsal does not authorize blocked features or replace individual acceptance.

Proposed adoption order: **0.7 foundation → validated main → accepted MCP-01 → validated main → accepted F28-C → validated main → accepted F08 → validated main**. Later feature work can remain separate while the foundation is adopted. If C/F08 remain blocked, leave them out rather than delay or contaminate the accepted baseline.

For every authorized merge, retain branches, pin the expected PR head, use a history-preserving merge, and validate the exact new main commit in a fresh isolated checkout. Manually trigger feature workflows lacking main-push triggers. Update the roadmap only after actual validation, distinguishing partial scope and outstanding gates.

## 6. Acceptance matrix

| Gate | Required check and pass meaning |
| --- | --- |
| Source/build | Correct pins and ancestry; complete vendor/host/import-map/package closure; existing licenses/notices preserved; real offline startup; required modules fail clearly rather than disappear from catalogs |
| Existing foundation | Full supported upstream tests plus retained F01/F02/F03/F04/F05/F06/F28-A/B suites; compare named cases as well as counts. 707 is the old accepted baseline, not a number to force a changed suite to match |
| Persistence/precision | Repeated persistence fixtures across supported units, translated origins and legacy/versioned records; reads do not migrate; unsupported records remain diagnosable/preserved; failed edits roll back. Retain the existing 0.005 mm fixture bounds without a universal CAD accuracy claim |
| Geometry | Independent IFC/schema findings zero for required outputs; layer/core/cavity/membrane/opening/dimension identities preserved; multi-storey visibility and regeneration correct; F08's 28-case supported matrix retains its declared overlap/union tolerances |
| Documentation | Actual downloaded/reopened IFC, full CSV contents and independent vector-PDF geometry/page boundaries; inspect rendered plans, sections, schedules, legends and composed sheets; no silently dropped continuation rows/pages |
| UI/state | Classic and selected ribbon layouts; real drawing/source activation vs browser selection; duplicate names; wrong editor; busy state; focus/keyboard/pointer behavior; resize/camera/tab restoration; genuine autosave recovery and fresh independent fixture storage |
| Units/languages | Six display modes with unchanged raw mm/IDs/enums; real PHP catalogs and fallback; pseudo-locale plus newly available catalogs; translated human strings must not redefine machine schemas or model records |
| Agentic access | Real initialize/list/call on exact live/headless/packed fork; custom type/recipe workflow; original-project isolation; wrong/stale/closed/session IDs, permissions/roots/overwrite, malformed records and busy/concurrent calls refuse without unintended changes |
| History regression | Reproduce the original MCP01-PM-01 failure on the historical control, prove the selected fix stops after a project switch, replacement bytes/history unchanged, honest partial progress, normal multi-step Undo/Redo and person-step protection retained |
| Performance | Compare old main, unmodified 0.7 and candidate on identical fixtures/hardware/browser. Record cold/warm/no-op/forced rebuild, p50/p95 and relevant memory. Agree material regression thresholds before judging the combined candidate. Existing PERF-F04-01/PERF-F05-01 remain open; no cross-machine speedup claim |
| Exact-head CI | Final application and evidence commits both tested as appropriate; all applicable required workflows pass on the final delivery. Do not remove assertions, suppress application errors or count optional availability notices as passes |

The broad `--draw06` CivilCraft dependency remains explicitly unavailable unless execution establishes otherwise. Required supported workflows must execute; optional sibling/platform/GPU coverage must be named rather than silently skipped or claimed universal. Compare new 0.7 functionality against its own control: old fixtures alone cannot establish coverage of all new release features.

## 7. Human review and rollback

Agents can perform the automated, browser, package and independent-file checks. User review is most valuable for choosing the familiar workspace and confirming a short real workflow: (1) create/edit a layered wall and find View range, (2) move from plan to section/schedule/sheet and export, (3) switch projects during an agent workflow without changing the wrong project. Native picker/platform checks remain separate when automation cannot exercise them. Work on copies, never a sole project original.

Before main adoption, provide the concrete candidate preview, capability decisions, test results and explicit limits. A changed default layout, unresolved new-capability MCP exception or materially changed user behavior needs a concrete product decision; do not infer approval from a green build.

Before adoption, rollback means discard the disposable candidate and keep using accepted main. After an authorized merge, stop further adoption if a regression appears, preserve diagnostics and prepare a reviewed revert or forward fix. Do not reset/force-push main. Code rollback does not undo project-file migrations: recover untouched file copies and validate any backwards-open claim separately.

## 8. Ownership and deliverables

PM owns pinned baseline selection, preservation verification, capability decisions, acceptance gates, proposed ordering and roadmap accuracy. Existing feature owners retain their domains. Implementation should proceed through one foundation integrator and separately owned feature adapters; concurrent edits to shared registration/history/workspace/model seams require a recorded handoff. No cross-chat messaging is authorized by this plan alone.

Required execution records: preservation/restore verification; file and capability ledger; conflict/decision log; per-layer exact commits; per-environment test/CI reports; independent output evidence; remaining-risk list; preview/test instructions; rollback package; and updated PM handoffs. Public evidence excludes model payloads, full model snapshots, local dirty-file inventories and recovery bundles.

Any later upstream submission is a separate task: follow upstream CONTRIBUTING, localization and permissive-dependency requirements; agree large contribution scope with the maintainer through an authorized channel; package app/tests/fixtures deliberately while retaining fork-only planning/evidence and maintainer-owned CI/build documents separately. This plan does not open an upstream issue/PR or publish a package.

## Current decision

**The plan is ready for execution review. No rebase, code merge, feature retarget, main adoption, application deployment or persistent MCP client setup has started.** The committed pins have a verified local recovery bundle; unfinished-work backup and the local F08 history-recovery prerequisite remain explicit Gate A tasks. All existing performance, test-isolation and semantic MCP follow-ups stay open. MCP01-PM-01 remains open pending re-review of its submitted fix.

Sources: [0.7 release](https://github.com/getcadcraft/bimcraft/releases/tag/bimcraft-v0.7.0), [pinned upstream source](https://github.com/getcadcraft/bimcraft/tree/c778c7ca3f83eeecc3e815078417f152b2ca7a94), [upstream contribution guidance](https://github.com/getcadcraft/bimcraft/blob/c778c7ca3f83eeecc3e815078417f152b2ca7a94/CONTRIBUTING.md), current draft PRs [#12](https://github.com/drsurfbum/bimcraft-SDH/pull/12), [#13](https://github.com/drsurfbum/bimcraft-SDH/pull/13), [#16](https://github.com/drsurfbum/bimcraft-SDH/pull/16), complete local overlap/preservation assessment. These are source/CI observations, not proof of a tested 0.7 combined build.
