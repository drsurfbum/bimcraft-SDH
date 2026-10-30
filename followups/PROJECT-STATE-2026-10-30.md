# State of BimCraft-SDH — October 30, 2026

A dated PM reconciliation of the roadmap, actual adoption history, upstream main and the recent Revit-versus-BimCraft audit. This report updates planning and publication only. It does not merge code, alter application baselines, start feature agents or certify full Revit parity.

[Public roadmap](https://drsurfbum.github.io/bimcraft-SDH/) · [Fork](https://github.com/drsurfbum/bimcraft-SDH) · [Upstream](https://github.com/getcadcraft/bimcraft) · [Current open PR12](https://github.com/drsurfbum/bimcraft-SDH/pull/12)

## Executive assessment

The project has a substantial working residential BIM foundation: explicit wall assemblies/materials/cores, persistent wall references/dimensions, layered plans, bounded sections, assembly tables, a familiar optional workspace and real agent operations. F09-A is adopted. F28-C is implemented as a candidate, including meaningful documentation MCP, but has not joined main.

The fork is synchronized with upstream’s published main: zero upstream-only commits. A new rebase is not needed at this snapshot. The useful next work is closing common residential workflow gaps and one newly verified correctness defect, rather than accumulating another broad feature branch.

The urgent finding is AUD-DEF-01: a join-end form becomes stale after Undo/Redo and can change the other end when the user edits a cap. It was reproduced afresh on current main and confirmed in the actual downloaded IFC. Existing green CI does not cover that scenario. This is a new repair, not a claim that the entire accepted join/MCP foundation failed.

After this update the roadmap contains30 top-level cards:5 accepted/integrated,4 with adopted first slices,20 planned and1 deferred. There are zero slices currently certified ready to merge. The21-entry child-slice register includes existing C, urgent repairs, discovery and proposed extensions; it is not21 newly implemented features or a delivery schedule.

## Exact baseline and evidence boundaries

| Item | Current verified state |
| --- | --- |
| Fork main | 75af81b49a3f472de734b0229f64e2140bbcbb10 — PR18 merge; tree4ea0396d54b18c230ec4e75235e05e113c35335d, identical to reviewed F09 delivery731fa66. |
| Upstream main | c778c7ca3f83eeecc3e815078417f152b2ca7a94 — same 0.7 source already adopted through foundation PR17. |
| Ancestry comparison | upstream/main…fork/main =0 upstream-only /220 fork-only commits. Merge base is exactly upstream main. The220 are history entries including merges/evidence, not220 new features. |
| Only open fork PR | Draft PR12 at aa75a6f9261e6f2d79e4fe805a287d35cf272d28. Its app source cutoff2a0b0ba is distinct from its published evidence tip. |
| Fresh today | Remote refs and all PR states; Git ancestry for every merged upstream PR; same five C conflicts;30-card plan reconciliation; current-main native join/history reproduction and independently read saved record; protected master hash. |
| Inherited, exact unchanged main | October28 integrated acceptance:729 local reader-enabled baseline passes/0 failures/4 availability notices;72 focused tests;81 strict input checks;19 browser/live groups;6 source and6 package groups;6 independently inspected saved-output cases. All12 exact-main CI workflow types remain green when queried today. The entire suite was not rerun today. |
| Performance evidence | Exact75af F03 run collected900 browser observations /30 groups of30 samples /zero source errors. Its27 model-only timing groups are explicitly unmeasured. Runtime near27.5minutes and responsiveness budgets remain follow-ups; do not convert collection success into target closure. |
| Revit audit cutoff | Original25-row audit: main60dbd3a, runtime0329eec; F09 delivery731 and C aa75 were separate candidates then. Native Revit was not exercised. Today’s report supersedes candidate/adoption status only where verified. |
| Audit preservation | 32 top-level Git checkouts inventoried read-only:9 contain local changes and1 has an unfinished merge. None were reset, rebased, cleaned or retargeted. The new audit clone is separate. Existing previews and user browser projects were untouched. |
| Test Lab master | v1 remains SHA2567e5ddf7399b7e4790c40fc89693d5357dca9c2f7bc8c0cdfe191b15ecf069941.22 stations,50 walls,9 openings,6 assemblies,7 persistent dimensions and4 levels. All current reproduction edits are separate working copies. |

## Adoption ledger and outstanding PRs

Fork pull requests checked:18 total;16 merged,1 closed unmerged as superseded, and1 open draft. [PR18](https://github.com/drsurfbum/bimcraft-SDH/pull/18) is already merged; do not send an old resume prompt asking its owner to finish the same delivery.

| PRs | Purpose | Disposition |
| --- | --- | --- |
| 1 +2 | Original wall/material/dimension prototype plus F01 baseline | Merged; preserved in approved ancestry. |
| 4 | F02 precision/reference/migration contract | Merged. |
| 5 | F03 performance harness | Merged; measurement tooling, not a performance optimization. |
| 6 | F04 layered plan graphics/vector output | Merged; accepted scope retained; performance remains open. |
| 7 | F05 bounded layer sections/elevations | Merged; broader section coverage still partial. |
| 8 | F06 assembly schedule/material legend | Merged. |
| 9 +11 | F28-A workspace and F28-B wall workflows | Merged; default/fallback remains established layout. |
| 10 +14 | GitHub identity and current MCP/project guidance | Merged; historical in-repo snapshot is not a newer main pin. |
| 15 +17 | History-preserving upstream alignment then0.7 foundation | Merged; accepted foundation findings closed at their pins. |
| 16 | MCP-01 material/assembly/wall semantics | Merged; prior Undo finding closed at its verified pin. |
| 13 | F08-A join semantics/protection/receipts | Merged; both prior F08 PM findings closed. |
| 18 | F09-A shortcuts, guarded menus and analytic wall targeting | Merged at75af; partial feature adoption. |
| 12 | F28-C documentation workspace and21 semantic tools | Only open draft; not ready against current main. |
| 3 | Old prototype integration notes | Closed as superseded; provenance retained. |

## Upstream synchronization: what to pull

There are no missing merged upstream PRs to pull. Each of the following merge commits is an ancestor of our current main. Importing them again would duplicate history/work and require unnecessary conflict handling.

| Upstream PR | Change | Merge commit | Action |
| --- | --- | --- | --- |
| [12](https://github.com/getcadcraft/bimcraft/pull/12) | Size sanitary drains by fixture units (NBR 8160 and IPC) | 46275e4e09aa | Already included; do not cherry-pick again |
| [11](https://github.com/getcadcraft/bimcraft/pull/11) | Add starter plumbing fixtures with connectors | 8191a41d31d5 | Already included; do not cherry-pick again |
| [10](https://github.com/getcadcraft/bimcraft/pull/10) | Add Brazilian PVC pipe tables (NBR 5648, NBR 5688) | b9612f938940 | Already included; do not cherry-pick again |
| [9](https://github.com/getcadcraft/bimcraft/pull/9) | Draw pipes and ducts from family connectors | 983dff9420cc | Already included; do not cherry-pick again |
| [8](https://github.com/getcadcraft/bimcraft/pull/8) | Add pipe and duct connectors to families | 3dfd8e12f9b1 | Already included; do not cherry-pick again |
| [7](https://github.com/getcadcraft/bimcraft/pull/7) | Re-render devshell/index.html from ui.inc | 0280d8caca9e | Already included; do not cherry-pick again |
| [4](https://github.com/getcadcraft/bimcraft/pull/4) | Improve BimCraft units, view controls, framing, roofs, and symbols | 8b1654384bf9 | Already included; do not cherry-pick again |
| [2](https://github.com/getcadcraft/bimcraft/pull/2) | Add wall alignment guides, face references and basement egress preset | aa77872ad078 | Already included; do not cherry-pick again |

| Open upstream PR | Scope | Assessment |
| --- | --- | --- |
| [6 — pt-BR](https://github.com/getcadcraft/bimcraft/pull/6) | Brazilian Portuguese app and shell catalogs; translation-only proposal based on an older upstream snapshot. | Optional language candidate. Not upstream main and not required for synchronization. If selected later, reconcile new fork strings, fills/plurals, units, labels and actual PDF text before claiming support. |
| [13 — zh-TW](https://github.com/getcadcraft/bimcraft/pull/13) | Traditional Chinese/Taiwan app and shell catalogs. | Optional language candidate, still open; its PR checklist is incomplete. Do not label upstream-reviewed/accepted or silently import. Verify selected labels and exported glyphs on the eventual source. |

## Upstream maintenance decision

Keep the current fork main and feature histories. Recheck the real default branch before the next integration; watch translation proposals as review candidates, without creating a recurring monitor here. When upstream actually advances, first pin both sides, compare shared behavior and fork contracts, then prepare an isolated candidate with backups and explicit conflict decisions. Do not infer current lab deployment/source equivalence from a logged-in lab page; the lab was not inspected in this audit.

Public-main ancestry proves we contain the published0.7 history. It does not prove every upstream function remains behaviorally identical after our intentional changes. New upstream changes must be compared against our precision/assembly/reference/history/MCP acceptance, not selected solely by newest timestamp.

## Feature-by-feature status

“Integrated” below means accepted delivery scope. “Partial” means an adopted slice with meaningful work left. “Planned” does not mean the suite lacks every related tool; many inherited modules are valuable starting points. No overall Revit parity percentage is claimed.

## F01 — Integration baseline and standalone test workflow

Status: **integrated**. A repeatable starting point and checks that catch problems as the app grows.

Present: Standalone integration foundation and the original wall/material/dimension prototype are adopted.

Remaining / next: Maintain reproducible isolated startup and explicit sibling availability notices; no new F01 implementation needed.

Dependencies: none

## F02 — Precision, references and migration contract

Status: **integrated**. Protect measurements, wall details and references through edits and saving.

Present: Numeric/reference/version contracts and repeated persistence fixtures are adopted. Six wall references, stable identities and unknown-record protection are usable.

Remaining / next: Extend known schema/migration contracts for future layer priority, join modes, copy/reference policies and constraints. Fixture precision is not a universal accuracy warranty.

Dependencies: F01

## F03 — Performance baseline and profiling harness

Status: **integrated**. Measure everyday tasks so future speed improvements target real problems.

Present: Performance harness/profiling is adopted. Exact-main CI collected900 browser observations in30 groups, zero source errors.

Remaining / next: Address measured responsiveness and CI-duration follow-ups. The27 model timing groups are unmeasured in this browser-only artifact; benchmark completion is not a speed improvement.

Dependencies: F01

## F04 — Layered plan graphics and vector output

Status: **integrated**. Show framing, finishes, air gaps and membranes in plans and printed drawings.

Present: Layered plan graphics, cavities, membrane lines, detail settings and vector consistency are adopted for accepted scope. View Range exists.

Remaining / next: F04-B range/RCP edge-case evidence; coordinate new join ownership with F08-B. Fine-view responsiveness and crowded short labels stay open.

Dependencies: F01, F02

## F05 — Layer-aware wall sections and elevations

Status: **partial**. Keep vertical drawings coordinated when wall heights, assemblies and windows change.

Present: Bounded straight-wall layer sections/elevations are adopted.

Remaining / next: F05-B: perpendicular section through a wall connected to a supported join, away from the corner. Current isolation requirement excludes ordinary connected house walls. Oblique/junction/curved cuts remain later.

Dependencies: F02, F04

## F06 — Assembly schedule and material legend

Status: **integrated**. Put clear wall-layer lists and matching material keys on your drawing sheets.

Present: Model-derived fixed assembly schedule and material legend, nominal-mm layer records, CSV and vector exports are adopted.

Remaining / next: F21-A defines quantities; F22-A coordinates placement/continuations. A fixed reliable table is not a generic schedule field/filter designer.

Dependencies: F01, F02

## F07 — Reusable project libraries

Status: **planned**. Bring trusted materials and wall assemblies into another project without rebuilding them.

Present: Project materials and authored assemblies already exist; reusable cross-project package acceptance has not been delivered.

Remaining / next: Versioned material/assembly import/export, collision/dependency resolution and project isolation. Keep separate from component-family update management in F18.

Dependencies: F02, F06

## F08 — Wall join and end-condition reliability

Status: **partial**. Make supported wall intersections meet cleanly while protecting core locations and dimensions.

Present: A: deterministic bounded straight L/T/selected endpoint-X envelope cleanup, per-end permission/cap and three protected semantic join tools are adopted.

Remaining / next: B0/B: native references then layer-aware core/finish joins and eligible choices. C: free ends later; insert wrapping in F15-B. Curves/unequal-height/interior-X/multi-floor solving stay limited.

Dependencies: F02

## F09 — Properties and Modify workflow consistency

Status: **partial**. Make selection, Properties, move, copy and other common edits behave consistently.

Present: A: corrected shortcuts, guarded plan context menus, explicit temporary analytic wall/core/finish targets and wall_reference_resolve are adopted.

Remaining / next: B is an urgent actual repair, not accepted A feature expansion. C/D add authored-wall Move/Copy with host rules. E scopes snap overrides/cycling/context behavior; broader Modify tools remain disabled/unimplemented.

Dependencies: F02, F08

## F10 — Roof workflow and intersection spike

Status: **planned**. Test roof intersections and decide how best to extend the existing roof tools.

Present: Existing automatic roof and manual-plane modules are inherited; no new roof discovery acceptance is recorded.

Remaining / next: Exercise different pitches/bearings and a porch intersection before selecting extension architecture. Reuse existing roof functionality.

Dependencies: F02, F03

## F11 — Precise roof-plane editing

Status: **planned**. Control roof pitch, bearing height, direction, edges and overhangs with clear values.

Present: Existing roof plane controls are a starting point, not accepted precise-plane feature delivery.

Remaining / next: After F10: explicit bearing/pitch/height/overhang, numeric edit and stable dependent references with Undo/reopen proof.

Dependencies: F10

## F12 — Persistent roof intersections, joins and trim

Status: **planned**. Keep ridges, hips and valleys coordinated as supported roof planes change.

Present: Existing roof generation does not establish accepted persistent intersection relationships.

Remaining / next: After F11: bounded ridge/hip/valley and explicit trim/join/unjoin; verify persistence, failed relationships and actual outputs.

Dependencies: F11

## F13 — Roof/wall attachment and roof detail output

Status: **planned**. Update attached wall tops and roof sections when the roof changes.

Present: Some inherited roof/wall tools exist; roof attachment/detail acceptance is not complete.

Remaining / next: After F12/F05: supported wall-top attachment, eave/rake/fascia/soffit and coherent details/quantities. No blanket attachment guarantee.

Dependencies: F05, F12

## F14 — Expanded residential roof cases

Status: **planned**. Support tested porch, dormer, cross-gable and other common house roof cases.

Present: Broader roof cases remain proposed.

Remaining / next: Expand only after the first roof chain: cross-gable, unequal overhang, porch/dormer/shed cases using selected residential references.

Dependencies: F13

## F15 — Residential host and opening reliability

Status: **planned**. Keep openings correctly placed and cut through their host walls as the design changes.

Present: Hosted doors/windows and openings already work in tested bounded edits. Audit retained9 opening identities through a type edit and one height change.

Remaining / next: A: move/flip/thickness/rehost/replace/delete durability matrix; B: separate insert wrapping. Basic survival does not establish the entire host lifecycle.

Dependencies: F02, F08

## F16 — Parametric modeler architecture spike

Status: **planned**. Evaluate how to create and edit reusable, adjustable building components.

Present: A family editor, parameter/formula machinery and primitive operations are inherited.

Remaining / next: Architecture spike should assess and extend that system. Decide stable references and recompute before broad new modeling; no whole-engine rewrite assumed.

Dependencies: F02, F03

## F17 — One editable parametric window end to end

Status: **planned**. Place and edit a window with reliable size controls, wall cuts and drawing output.

Present: Existing door/window types and family primitives are starting points.

Remaining / next: One editable hosted residential window end to end: dimensions/frame/closure/cut, two sizes, type/instance intent, history/persistence and drawings. Full F23 is not a prerequisite.

Dependencies: F16, F02

## F18 — Component library and version updates

Status: **planned**. Manage component versions and updates without unexpectedly changing existing projects.

Present: Libraries exist in the wider suite; this fork has no accepted component-version/update workflow for the proposed scope.

Remaining / next: Version/dependency management, local edits versus updates, reviewable effects and preservation of placed-instance overrides/hosts.

Dependencies: F15, F17

## F19 — Associative dimensions beyond the prototype

Status: **planned**. Extend dependable dimensions into additional plan, section and elevation workflows.

Present: Persistent two-reference nondriving wall dimensions to six analytic references already exist in plans/RCP/callouts; seven master dimensions resolve in the audit.

Remaining / next: A: chains and witness editing. Add opening/section/elevation references in later bounded slices. Locks/equality/driving require a separate constraint decision.

Dependencies: F02, F05, F09; opening references also require F15

## F20 — Residential detailing workspace

Status: **planned**. Create wall-base, window and roof details using model views and clear drawing tools.

Present: Drafting, annotations and callouts already exist; C improves access but is not adopted.

Remaining / next: Practical model-linked and independent details, region/text/component styles and reusable house details. Avoid rebuilding existing drafting unnecessarily.

Dependencies: F05

## F21 — Material/assembly quantity semantics

Status: **planned**. Distinguish solid materials, air gaps and membranes when calculating quantities.

Present: Assembly/legend records and envelope quantities are available; comprehensive net material semantics are not accepted.

Remaining / next: A: hand-check gross/net opening/cavity/membrane quantities. Explicit framing/insulation calculation methods; do not imply material volumes from a homogeneous envelope.

Dependencies: F06, F08, F15

## F22 — Coordinated sheet set and print QA

Status: **planned**. Bring views, schedules, labels and references together into readable, correctly scaled sheets.

Present: Existing sheets/vector exports and bounded documentation are usable; a complete revised house set has not been accepted.

Remaining / next: A: a small coordinated drawing-set proof, then M3 breadth/title blocks/index/references/print QA. Include real non-ASCII label/glyph validation with F26-I18N.

Dependencies: F05, F06, F13, F17, F19, F20

## F23 — Constrained sketches and feature-history component editor

Status: **planned**. Build adjustable components through constrained sketches and an editable sequence of operations.

Present: Constrained sketch/feature-history component workflow remains proposed.

Remaining / next: Stage sketch constraints, recompute/history and selected operations after F16–F18. Preserve failed-feature recovery and stable references; avoid importing full modeler parity into the first window proof.

Dependencies: F16–F18

## F24 — Residential structure coverage audit and gap closure

Status: **planned**. Check foundations, floors, framing, stairs and rooms against a representative residential project.

Present: Levels, floors/ceilings/roofs, foundations/stairs/framing modules are inherited. The audit created73 framing parts and retained them through history/reopen.

Remaining / next: A: coverage and level-cascade inventory against the reference house; fill demonstrated gaps. Module presence and a framing proof do not certify all residential construction behavior.

Dependencies: F02, F09; complete before M3

## F25 — Targeted performance work and Rust decision

Status: **planned**. Profile real bottlenecks and test focused improvements; a full rewrite is not assumed.

Present: Measurements exist; target optimization and any Rust/WASM adoption remain proposed.

Remaining / next: Profile algorithm/caching/regeneration/worker options first, then compare a bounded acceleration spike only for an identified bottleneck. Preserve outputs; a language change is not itself a performance result.

Dependencies: F03 and at least one measured F12/F22 workload

## F26 — Packaging, recovery and release readiness

Status: **planned**. Verify setup, saving, recovery and upgrades before releasing a reviewed residential workflow.

Present: Development startup, saving and selected recovery paths are tested; reviewed end-user distribution/release readiness is incomplete.

Remaining / next: Fresh install/recovery/upgrades/platform matrix, licenses/naming/distribution and locale/export QA. Keep missing sibling, client setup and cross-platform limits explicit.

Dependencies: F22, F24; independent of whether Rust is adopted

## F27 — Capture to Parametric BIM

Status: **deferred**. Eventually turn measured room captures into reviewed drawings and editable building elements.

Present: Capture-to-editable-BIM concept is retained as a deferred future epic.

Remaining / next: No active implementation or new milestone gate. Future discovery separates uncertain measured capture, reviewed evidence drawings and precise native reconstruction.

Dependencies: Discovery first; low priority

## F28 — Revit-familiar workspace and menu redesign

Status: **partial**. Find modeling tools, view settings and project drawings where Revit users expect them, with more room for the model.

Present: A/B workspace and wall workflows are adopted; established layout remains the default/fallback.

Remaining / next: C is the only open draft PR. It supplies documentation MCP but needs new-main reconciliation, DI/DL/context integration and reliable native-download testing. D handles inherited narrow usability/accessibility.

Dependencies: Inventory current capabilities and F01–F27 scope; user review of mockup before application implementation.

## F29 — 3D wall assemblies and framing coordination

Status: **planned**. Sketch walls in 3D, reveal their framing and fit outlets and shower niches around modeled studs and clear bays.

Present: Planned assembly/framing coordination; existing73-part framing proof is a reusable starting point.

Remaining / next: A: one straight timber wall/opening/outlet/niche with deterministic supported bays, conflict reporting and real agent parity. Richer assemblies/overrides/junctions and field verification remain later.

Dependencies: F02/F03 and existing assemblies; agreed F09 input contracts; focused framing/host audit coordinated with F08, F15 and F24. Discovery before implementation.

## F30 — Headless BimCraft execution and batch automation

Status: **planned**. Automate repeatable model edits, checks and exports using the same model engine as the visual app and agent tools.

Present: Existing headless IfcSession/CLI and packaged MCP already reuse application operations. A complete supported batch-job product is not yet accepted.

Remaining / next: A: capability/parity inventory. B: one deterministic Test Lab recipe through direct core and MCP, saved outputs/receipts and measured time/memory. Single geometry/history authority; live UI activation remains live-only.

Dependencies: Inventory current headless/CLI/MCP capabilities; F02/F03 and accepted operations. F28-C adoption for its additional documentation/export scope.

## Revit comparison: findings reconciled with current main

The recent audit contains25 task comparisons, not a count of all Revit features. It used versioned Autodesk documentation, BimCraft source/domain tests, selected native BimCraft browser actions and the user screenshot. Native Revit observations remain absent. The original audit passed108 focused tests,12 Test Lab domain checks and10 source/10 package groups of361 calls each. These are original audit evidence at60db, not fresh full-suite results at75af.

Two historical entries need an explicit status correction: I-03’s F09 candidate is now adopted; C-01’s candidate still exists and supplies semantic coverage, but needs current-main integration. Its audit-era11-main-workflow recommendation is superseded by12 on main and14 on the future C combination. Other findings retain their original evidence limits; only AUD-DEF-01 was freshly reproduced here.

| Audit ID / task | Finding class | Current disposition / roadmap |
| --- | --- | --- |
| AUD-DEF-01 — Join-end edit after Undo/Redo can silently alter the opposite end | Reproducible defect in supported behavior | Freshly reproduced on main75af with native browser controls and actual saved IFC independently read by IfcOpenShell. OPEN P0 F09-B; no application fix made. |
| J-01 — Deterministic straight L/T/endpoint-X geometry | Verified match within supported scope | F08-A accepted; F08-B extension; Retain accepted scope |
| J-02 — Core-butt and finish/substrate continuity with material seams | Partial / behavior mismatch / discoverability | F08-B; F02 schema; F04/F05 output; P1 — first F08-B proof |
| J-03 — Butt/Miter/Square Off and which wall continues | Missing operation | F08-B owns domain; F09/F28 provide shared control framework; P1 — F08-B |
| J-04 — Allow/disallow joining versus display-only cleanup | Partial / behavior mismatch / discoverability | F08-B and F04 display contract; P1 — clarify during F08-B |
| J-05 — Discoverable wall-end control and selected-join workflow | Partial / behavior mismatch / discoverability | F08-B + F09/F28 coordination; P1 — with F08-B |
| J-06 — Corner cleanup versus wrapping at free ends and inserts | Missing operation | F08 follow-up + F15 openings; F17 family closure; P2 — separately bounded |
| J-07 — Unsupported curves, unequal heights and complex intersections | Partial / behavior mismatch / discoverability | F08 later slices; F02 tolerance; P2 — retain clear limits |
| W-01 — Wall type, material, core and instance separation | Verified match within supported scope | F02/F06 accepted; F07 libraries and F21 quantities remain distinct; Retain accepted slice |
| W-02 — Location lines and exterior orientation | Partial / behavior mismatch / discoverability | F02 + F09, retained by F08-B; P1 — protect during F08-B |
| I-01 — Selection, Properties, wall grips, numeric entry and cancellation | Partial / behavior mismatch / discoverability | F09; F28 shared adapter; P1 — existing F09 ownership |
| I-02 — Wall Move/Copy/Rotate/Mirror/Align/Offset/Split | Missing operation | F09 Modify; F15 host rules; F02 identity; P1 — narrow Move/Copy first |
| I-03 — Keyboard/context shortcuts and reference snapping candidate | Planned feature / unadopted candidate | Historical candidate status superseded: F09-A is now adopted via PR18 at75af, with integrated validation. Its bounded interaction differences remain explicit. |
| H-01 — Door/window host edits and cut consequences | Partial / behavior mismatch / discoverability | F15 + F09; F17 for parametric-window proof; P1 dependency for Modify; P2 broader host audit |
| V-01 — Plan/RCP detail and view range | Partial / behavior mismatch / discoverability | F04 + view ownership; F28-C access; P2 — maintain and extend bounded views |
| D-01 — Persistent wall dimensions versus chains and driving constraints | Partial / behavior mismatch / discoverability | F19 + F02/F09; F15 for openings; P1 — chain dimensions after input foundation |
| V-02 — Sections through an otherwise ordinary joined wall | Partial / behavior mismatch / discoverability | F05 follow-up; F08 geometry coordination; P1 — high residential documentation impact |
| S-01 — Assembly schedule/material legend versus flexible schedules/quantities | Partial / behavior mismatch / discoverability | F06 retained; F21 quantities; F22 output; P2 — F21 semantics before generalized totals |
| S-02 — Sheets, callouts, annotations and vector output | Partial / behavior mismatch / discoverability | F20/F22; F28-C controls; P2 — coordinated residential set |
| C-01 — F28-C documentation controls and semantic workflow | Planned feature / unadopted candidate | Still draft aa75; documentation MCP is supplied. Current five-conflict/input/combined-validation gates are in the PM review. Eventual combined CI requires14 types, not the audit’s older11-main count. |
| L-01 — Levels and multi-level wall behavior | Partial / behavior mismatch / discoverability | F02/F24 + F08 for junctions; P2 — representative expansion |
| R-01 — Existing floors and roofs versus persistent roof relationships | Partial / behavior mismatch / discoverability | F10 spike; F11–14; F24 floors; P2 — F10 discovery before F11–14 |
| F-01 — Existing framing versus planned assembly coordination | Partial / behavior mismatch / discoverability | Existing res-framing; F24 inventory; F29 planned/unassigned; Retain capability; F29 discovery |
| A-01 — Authoritative manual/MCP operations and transport evidence | Verified match within supported scope | MCP-01/F08 accepted; broader coverage remains open; Retain adopted contract |
| E-01 — Exact native Revit result behind the user screenshot | Evidence / access gap / unresolved preference | F08-B discovery; user/PM evidence intake; Before dependent F08-B semantics |

## Urgent verified repair: AUD-DEF-01 / proposed F09-B

Impact: a supported user edit can change a different wall-end setting and save it. PriorityP0; audit severityS1 (unintended saved model change). This is not a crash or a generic visual preference. Root cause/refresh ordering still belongs to the implementation owner; this audit does not supply a production fix.

Fresh reproduction uses current main75af in a clean1440×1000 Chromium151.0.7922.34 context, established layout, original Test Lab working copy and native selection/Properties/Undo/Redo/Save controls. The browser reported zero page exceptions. Native model edits were not replaced by direct mutation hooks.

- Select Lab08 wall2, GUID0BCLAB0000000000000279, in02 Join lab. Set Start A to Disallow.
- Undo, then Redo, without reselecting. The authoritative model has a.allow=false, but visible Start A shows Allow.
- Change End B cap to Square. The stale form writes a.allow=true as well as requested b.cap=square.
- Save as IFC. An independent IfcOpenShell0.9.0 read finds CadCraft_WallJoin Settings with a.allow=true and b.cap=square. This confirms the unintended value reached the actual saved file.
- Reselecting the wall refreshes the form and is a temporary workaround. It does not close the finding. Avoid this exact edit sequence in important working files until fixed.

## Repair acceptance and ownership

The existing F09 lifecycle/Properties owner should investigate with F08 domain coverage and F28 adapter coordination; this report does not reassign an owner or dispatch a message. Refresh after all history paths and preserve unedited fields from the current authoritative wall, with stale/document/revision and dirty-input handling. Verify the inverse ends, Allow/cap variants, reselect/layout transitions, native and semantic interleavings, one owned history operation, save/reopen and affected output. Both layouts are required before closure; today’s fresh reproduction proves the established layout only.

Keep F08-PM-01/02, MCP01-PM-01 and foundation closures at their verified pins. Add the new failure as a distinct regression case; passing old suites does not mean this newly identified scenario passed. Original accepted geometry and transport tests remain useful retained controls.

## F28-C: implemented candidate, unfinished integration

[PR12](https://github.com/drsurfbum/bimcraft-SDH/pull/12) remains draft at aa75a6f. Its21 documentation tools and13 published candidate workflow types are real. The prior PM review freshly passed82 focused tests,50 native documentation browser checks, source/package11 groups each and successful16-group live checks, plus actual independent outputs. That evidence must not be relabeled as a main/C combined run or as missing semantic implementation.

[Current PM findings](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/F28-C-F09-BASELINE-PM-REVIEW.md) remain applicable because neither main nor C head changed. A new merge-tree check again finds conflicts in .gitignore, app/agents.js, app/lang/en.json, app/model-ui.js and tests/tools/bimcraft-test/draw06-test.mjs.

- Resolve catalogs by union of actual supported capabilities: retain accepted materials/walls/joins/analytic resolver and C documentation tools, schemas, raw/aliased record protection and assertion names.
- Reconcile F09’s intentional pre-C workspace DI/DL guard with C’s real annotation/dimension commands. Static automatic-merge inspection shows these routes would stay unavailable if combined without deliberate integration; this is not a runtime test of a resolved combination.
- Retain native CSV/PDF downloads in live testing. Two unpaced runs stalled at the eleventh download; a separate no-BimCraft browser control received10/12 rapid downloads versus12/12 paced, and paced C passed all assertions. Stabilize the harness; do not call this corrupt IFC/CSV generation or bypass the native path.
- Publish the combined candidate and retain all14 applicable workflow types:12 current-main plus C UI and C semantic workflows. Require affected source/package/live, C/B/F09 input/history and independent actual outputs, with the new AUD-DEF-01 regression once repaired.
- Established layout stays default/fallback. Existing narrow-window loss of drawing area remains separate F28-D work. C adoption does not add chain dimensions, arbitrary schedules or generalized sections automatically.

## New and clarified roadmap slices

The following21 entries are bounded proposals/repairs under existing feature headings, except the new F30 headless discovery epic. They are not assignments, approved solver semantics, calendar promises or work already started. Native Revit ambiguities must be resolved before dependent implementation.

| Slice | Priority / state | Bounded purpose | Dependencies |
| --- | --- | --- | --- |
| F09-B | P0; OPEN defect; reproduced on current main | Repair join Properties after history — Repair AUD-DEF-01: refresh actual end values after history and preserve the untouched end during a partial edit. No new join configuration. | Current main75af; F08/F02 retained controls; coordinate F28 adapter |
| F28-C | P1; Existing draft; blocked for adoption | Reconcile documentation candidate with current main — Existing PR12, not a new implementation epic. Reconcile five conflicts, preserve accepted tools and wire DI/DL/context actions to real documentation availability. Stabilize actual live downloads. | Current accepted main; F09-B coordination; existing C owner |
| F08-B0 | P1; Discovery required | Capture the intended native Revit join behavior — One synthetic equal/mixed L, controlled T and opening. Record Revit version, type/core/material/function/independent priority, orientation, join mode/order, permission, cleanup and control tooltip. | User/native Revit evidence; versioned Autodesk references |
| F08-B | P1; Planned after discovery | Layered 90-degree L corners and explicit join choices — Two straight vertical equal-height walls; equal/mixed assemblies, both directions/orientations. Core butt/finish continuity, material seams and eligible agreed Butt/order/Miter. | F09-B; F08-B0; F02 schema; coordinate F04/F05/F28 |
| F05-B | P1; Proposed; not started | Sections through joined straight walls — Perpendicular cut through a supported wall away from an existing supported junction. Do not solve a cut through the corner itself. | F05-A/F08-A; shared layer contract with F08-B |
| F15-A | P1; Proposed; not started | Focused door/window host durability — One door and one window across supported host move/thickness/height/flip, then bounded replacement/rehost/deletion decisions. | F02/F08; coordinate F09-C/D |
| F09-C | P1; Proposed; not started | Move one authored wall predictably — One straight wall with supported hosted door/window, numeric displacement and noncommitting preview. | F09-B; focused F15-A host contract; F02/F08 |
| F09-D | P1; Proposed; not started | Copy one authored wall with explicit host rules — Follow Move with one-wall Copy; preview/cancel and clear include/exclude-host behavior. No blanket implementation of all Modify commands. | F09-C/F15-A; identity/reference copy decision |
| F19-A | P1; Proposed; not started | Chained plan dimensions and witness editing — Chains of supported straight-wall analytic references in plan/callout; nondriving. Add/edit/remove/rebind witnesses with clear unresolved states. | F02/F09 input; coordinate C adapter; opening references follow F15 |
| F09-E | P2; Discovery required | Operation-specific snapping and contextual input — Agree temporary snap overrides, candidate cycling and core/finish priority during a small set of real operations; extend the contextual menu inventory from user examples. | F09-A/B; native interaction examples; coordinate F19 |
| F08-C | P2; Proposed; not started | Free-end compound-wall wrapping — Separate one straight free-end wrapping rule from corner join cleanup and independent cap choice. | F08-B layer representation; native wrapping evidence |
| F15-B | P2; Proposed; not started | Door/window insert wrapping — One rectangular hosted insert with explicit wall layer eligibility and supported closure references. | F15-A; F08 wrapping contract; F17 closure proof |
| F04-B | P2; Proposed; not started | Plan/RCP range edge-case acceptance — Explicitly exercise raised, spanning and low walls; below/through/above openings; independent plan/RCP values and templates. Expand only gaps the evidence establishes. | F04/F02; coordinate C source ownership |
| F28-D | P2; Proposed; not started | Narrow-window layout and command accessibility — Repair inherited drawing-area loss with both palettes expanded; legible short labels, keyboard/touch explanations and discoverable controls. | F28-C/input framework; preserve model behavior |
| F21-A | P2; Proposed; not started | Hand-checkable material quantities — Separate gross/net wall envelope, openings, solid-layer volume, cavity width and zero-membrane coverage before generalized totals. | F06/F08/F15; coordinate F29 later |
| F22-A | P1 later; Proposed; not started | One coordinated small-house drawing set — Use existing plans, section, callout, dimensions, schedules/legend and sheet tools on a bounded reference house. Keep roof/window completeness in M2/M3 phases. | F05-B/F19-A; F06; F28-C; coordinated F20 |
| F24-A | P2; Proposed; not started | Residential coverage and level-cascade audit — Inventory current floors/ceilings, levels, foundations, stairs and framing against the house; verify level-height propagation. Reuse roof discovery F10. | F02/F09; roof F10; retained Test Lab |
| F29-A | P2; Discovery required | Framing coordination discovery and first proof — Reuse existing framing (audit produced73 parts). One straight timber wall, rectangular opening, derived bays, one outlet and niche; 3D sketch/reveal only within agreed input scope. | F24 framing inventory; F09 input; F15 hosts; F08/F02 |
| F30-A | P2; Proposed discovery; no owner assigned | Headless capability and parity inventory — Audit current IfcSession, CLI and packaged MCP execution; distinguish domain operations from live-only source activation. No second model/history engine. | Current accepted core/MCP contracts; C adoption only for its documentation features |
| F30-B | P2; Proposed after discovery | One reproducible browser-free Test Lab job — Open a working copy, run an explicit recipe of supported edits/checks and write new IFC plus structured report and supported exports to disk. Compare direct core and MCP execution. | F30-A; accepted operations; F28-C for proposed documentation export breadth |
| F26-I18N | P2; Proposed; not started | Locale, export-text and platform acceptance — Retain existing catalogs and fork labels; test units/plurals/fills, meaningful PDF glyphs and basic Mac/Windows startup/save behavior. Watch upstream translation PRs after their own review. | F22 output; existing F28 language coverage; selected release platforms/languages |

## Slice acceptance and open decisions

## F09-B — Repair join Properties after history

Acceptance: Pristine Lab08: Disallow A → Undo → Redo → Square B leaves A disallowed in visible form, authoritative record and actual saved/reopened IFC. Repeat inverse ends/caps and both layouts; include native/semantic interleaving, one owned step, stale/dirty refusal and no human-work Undo.

Open decision: None beyond the stated boundary

## F28-C — Reconcile documentation candidate with current main

Acceptance: Published combined head retains all fourteen applicable workflow types, source/package/live catalogs and refusal/history tests; C/B/F09 native checks and independent actual outputs. Add the new history repair regression when its baseline lands.

Open decision: None beyond the stated boundary

## F08-B0 — Capture the intended native Revit join behavior

Acceptance: Labeled golden observations distinguish core/finish meeting, Butt/Miter/order, automatic permission, view cleanup and free-end/insert wrapping. Mark unavailable modes. Agree first-slice behavior before schema/solver commitments.

Open decision: Exact screenshot control/recipes; Square Off and display-cleanup inclusion; independent-priority migration defaults

## F08-B — Layered 90-degree L corners and explicit join choices

Acceptance: No gaps/double ownership; stable references/hosts; cavities keep width and membranes stay zero; deterministic regeneration, preview/cancel, Undo/reopen; independent IFC/plan/section/vector output and manual/source/package/live semantic parity. Retain T/X negative controls.

Open decision: Physical/layer representation and migration; do not infer Square Off or wrapping from a square cap

## F05-B — Sections through joined straight walls

Acceptance: Equal/mixed L plus house wall with opening: layers, cavity/membranes and voids remain correct after type/height/opening edit, Undo and reopen; inspect actual vector PDF. Oblique/junction cuts still refuse honestly.

Open decision: None beyond the stated boundary

## F15-A — Focused door/window host durability

Acceptance: Exact wall/opening/void identities and extents; valid dimensions or explicit unresolved references; atomic refusal, native/MCP parity and independent saved-file readback. Define copy behavior before Copy.

Open decision: Explicit policy for hosted elements and persistent references when copying/replacing a wall

## F09-C — Move one authored wall predictably

Acceptance: Move preserves wall/host IDs and agreed references; dependent joins/openings/dimensions update or refuse visibly; Escape cancels; one owned Undo; real save/reopen and registered semantic transport.

Open decision: None beyond the stated boundary

## F09-D — Copy one authored wall with explicit host rules

Acceptance: New unique wall/selected-copy IDs, original unchanged; no accidental source-dimension rebinding; supported joins/hosts and per-instance values preserved; one operation/history receipt and actual saved-output parity.

Open decision: Which hosted elements and annotations copy; how copied references bind

## F19-A — Chained plan dimensions and witness editing

Acceptance: Type/geometry changes, Undo/Redo and reopen preserve supported references and equal displayed/vector values. Keep locks/equality/driving visibly unavailable until a constraint strategy is approved.

Open decision: None beyond the stated boundary

## F09-E — Operation-specific snapping and contextual input

Acceptance: Visible candidate identity/ambiguity and temporary-versus-persistent intent; preserve native text/Tab/focus, numeric entry, cancel and analytic-reference contracts. Match agreed Revit workflows rather than blindly enabling every shortcut.

Open decision: Tab/Space and two-letter shortcut conflicts; exact context-dependent menu contents

## F08-C — Free-end compound-wall wrapping

Acceptance: Explicit eligible layers/material extents, cavity/membrane behavior and coherent saved plan/section/IFC outputs, with Undo and MCP parity.

Open decision: First free-end modes and representation; no insert wrapping implied

## F15-B — Door/window insert wrapping

Acceptance: Preserve opening/host/void IDs and extents, correct layer returns across type/sill/size changes and actual exported sections; unsupported families refuse clearly.

Open decision: Which insert/family closure rules are supported first

## F04-B — Plan/RCP range edge-case acceptance

Acceptance: Same view-owned range/detail/scale values produce coherent screen/vector results across levels, edits, history and reopen; unavailable Revit view-region/underlay cases remain declared.

Open decision: None beyond the stated boundary

## F28-D — Narrow-window layout and command accessibility

Acceptance: Agreed narrow desktop viewport preserves a usable canvas, independent palette scrolling, focus/selection and command availability in both layouts. Inspect real screenshots; retain established default/fallback.

Open decision: None beyond the stated boundary

## F21-A — Hand-checkable material quantities

Acceptance: Small fixtures reconcile every quantity to declared methods; cavities contribute no solid material volume; membranes may have coverage but zero nominal volume; framing is not silently a homogeneous solid.

Open decision: None beyond the stated boundary

## F22-A — One coordinated small-house drawing set

Acceptance: Revise a wall/window and verify every affected placed view, title/scale/reference/continuation and inspected vector output. Clear incomplete-view reporting, no clipping or stale dimensions.

Open decision: None beyond the stated boundary

## F24-A — Residential coverage and level-cascade audit

Acceptance: Supported/partial/missing matrix and selected level edit preserve upper levels, constrained/fixed walls, hosts, dimensions and drawings or explain limits. Existing modules are starting points, not automatic acceptance.

Open decision: None beyond the stated boundary

## F29-A — Framing coordination discovery and first proof

Acceptance: Deterministic supported framing/clear-bay extents; no silent member cutting; explicit conflicts and assumptions; supported identities/overrides, Undo/reopen and authoritative semantic parity.

Open decision: Bays/clearances and override policy; generated design does not establish field accuracy or engineered sizing

## F30-A — Headless capability and parity inventory

Acceptance: Capability matrix marks source implementation, direct-call usability, registration, package closure, permissions/history, export/file output and actual test evidence separately. Choose one local job interface and measure where overhead occurs.

Open decision: None beyond the stated boundary

## F30-B — One reproducible browser-free Test Lab job

Acceptance: Same resulting semantic model/identities/precision and actual output checks; deterministic job/revision/error/history receipts; explicit failure/resume/overwrite policy; measured time/memory on same fixtures. GUI activation remains live-only; no service deployment required.

Open decision: Job atomicity and retry/resume/idempotency boundaries; choose SDK/CLI shape before implementation

## F26-I18N — Locale, export-text and platform acceptance

Acceptance: Actual user-visible strings and exported text work in chosen languages; missing keys/glyphs fail or report limits honestly. Browser/PHP/catalog/platform boundaries are recorded; no full Unicode/platform certification from one passing language test.

Open decision: None beyond the stated boundary

## F08-B: prevent a convincing but wrong join implementation

The accepted solver cleans supported wall envelopes; clipped plan bands and a square free cap are not proof of Revit-style layer topology. The audit found no independent layer-priority storage/material-driven junction topology in the accepted representation. The desired core-butt/finish-continuity corner therefore needs a deliberate model contract, not just a new menu.

Revit2027 documents eligible Butt/Miter/Square Off configurations and join-order previews, with restrictions for a wall meeting another wall’s interior. Revit2026 separated priority from layer function. These are documentation facts, not a native reproduction of the supplied screenshot. [Join configurations](https://help.autodesk.com/cloudhelp/2027/ENU/Revit-ArchDesign/files/GUID-19EAF7A9-331F-4271-94CC-43B76B13011E.htm); [independent priority](https://help.autodesk.com/cloudhelp/2026/ENU/Revit-WhatsNew/files/GUID-50F25D06-C5CD-42B9-A766-CAABD3F2FA91.htm).

- First implementation boundary after discovery: two straight vertical equal-height walls at a90-degree L, equal and mixed widths/recipes, reversed directions/exterior sides, controlled same/different material identity, explicit core boundaries, cavity and zero membrane.
- Specify layer ownership, physical body versus graphic seams and migration defaults before coding. Preserve supported hosts, analytic anchors and persistent references. Existing v1 allow/cap/node/tee records must not silently acquire guessed semantics.
- Show eligible configured choices with clear selected end/junction, preview, cancel and shared manual/MCP operations. Square Off and per-view cleanup require an inclusion decision; existing square cap is a different current setting.
- Keep physical join mode/order, automatic permission and view-only cleanup separate. Free-end wrapping and door/window insert closure are later bounded cases, not implied by a clean corner.
- Retain T/endpoint-X and acute/obtuse accepted controls while refusing unsupported new modes. Curves, unequal-height/multi-floor and complex interior-X solving are not absorbed into the first L proof.
- The original proposal supplies15 fixture groups covering materials/priorities, orientation/order, core/cavity/membranes, permission/cleanup, cancel, hosts/references, old topology, corruption/version handling and real outputs/transports. Keep Test Lab v1 unchanged; add new fixtures/versioned references.

## Headless direction: proposed F30, shared engine

There is already genuine browser-free infrastructure: IfcSession opens/queries IFC, instantiates the application IfcEditor, applies ordinary domain operations, manages owned history and saves model bytes. Source and isolated-package MCP acceptance run through this path. C additionally supplies headless documentation reads/edits/composition/exports in its candidate; transient drawing activation explicitly remains LIVE_ONLY.

The proposed product architecture is one authoritative model/validation/history core, reached by the visual app, a local SDK/CLI job path and MCP. MCP is the agent interface; headless is an execution mode. They can be used together. The goal is a supported repeatable local job path, not a second implementation of geometry or history.

| Potential benefit | What must be proved |
| --- | --- |
| Browser-free batches | Run many prescribed edits/checks without a mounted viewport or per-output browser download limits; preserve the same authoritative operations. |
| Agent efficiency | Use sensible higher-level job boundaries to reduce agent round trips/context use while preserving inspectable per-operation results, failure and history ownership. |
| Export jobs | Write supported outputs directly to explicit files with real output checks; browser-only activation/pickers remain honest unsupported UI actions. |
| Performance | Compare same fixtures/runtime/hardware and correctness. Removing rendering/transport may help particular workloads; model parsing/geometry/regeneration costs remain. No speedup number is established by this audit. |
| Reproducibility | Pin source/package identity, explicit units/input recipe and outputs. Define no-op, error, interruption, retry/resume and file overwrite policies before committing semantics. |
| Parity | Track implemented, callable, registered, packaged, transport-tested and user-connected separately. A CLI command or tool count alone is not whole-application parity. |

## First headless proof and exclusions

F30-A should inventory current capabilities and identify the smallest gap. F30-B then runs one working-copy Test Lab recipe: inspect, perform a supported assembly/wall/join edit, validate references and state, save a new IFC, generate a structured report and available supported exports. Compare direct core and MCP results using the same fixtures and independent output checks. Define whole-job versus per-operation atomicity and supported recovery rather than guessing. Start locally; no cloud deployment, external service, credential installation, geometry rewrite or mandatory release dependency is authorized here.

## Recommended sequence and milestone reality

| Order | Work | Reason / boundary |
| --- | --- | --- |
| 1 | F09-B urgent repair | A real saved-model consequence takes precedence over expanding joins. Retain all accepted controls and prove both layouts. |
| 2 | F28-C reconcile/publish/re-review | Complete the existing documentation branch against the accepted baseline and new repair when available; no merge authorized by this audit. |
| Parallel discovery | F08-B0 native golden examples; F30-A inventory; existing F10/F16 spikes if separately assigned | Read/evidence work can proceed without conflicting edits or premature schema/solver choices. |
| 3 | F08-B, F05-B, focused F15-A and F09-C/D | Close common wall-corner/section/editing pain with explicit dependency/ownership contracts. These are coordinated slices, not concurrent edits to the same renderer/domain files. |
| 4 | F19-A and F22-A | Bring everyday dimension strings and a coordinated revised small-house set together. Preserve partial-scope limits rather than marking an entire feature complete. |
| Later | F07 libraries, roof F10–F14, window/modeler F16–F18, F20/F21/F24/F26 and F29 | Reuse inherited tools and work from demonstrated residential gaps. Full F23 modeler breadth and optional F25 acceleration are not prerequisites for a bounded window proof. |
| Deferred | F27 capture-to-BIM | Keep low priority and off the immediate release critical path. |

- M0 shared foundation is adopted; keep regression/measurement contracts alive.
- M1 dependable wall documentation is in progress: joined-wall sections, explicit layered joins, safe editing/host consequences and agent coverage remain.
- M2 prototype-complete proof still requires the roof and parametric-window chain plus coordinated output; those acceptance cases are not yet delivered.
- M3 reviewed residential working release remains unproven. Existing application breadth does not substitute for one revised reference-house drawing set, release/recovery and platform checks.
- M4 targeted expansion remains evidence-led. F30 is proposed local execution discovery, not automatically a new M0–M3 release gate.

## Open follow-ups and retained closures

| Tracking | Status | What closes it |
| --- | --- | --- |
| AUD-DEF-01 / F09-B | OPEN P0; fresh actual-main reproduction | Correct current-state form/partial edits plus inverse ends, both layouts, history/interleave and saved-output regressions. |
| F28C-INT-01/02; F28C-TEST-01 | OPEN adoption gates | Published current-main combination, real documentation input availability and reproducible native export acceptance. |
| PERF-F04-01 | OPEN | Representative visible-browser Fine pan/zoom/edit testing and targeted profiling/improvement; CPU-paint time alone does not close frame/gesture behavior. |
| PERF-F05-01 | OPEN | Profile complete drawing-set generation on representative houses, retain raw environment-specific samples and preserve geometry/reference/output contracts. |
| TEST-F28-01 | OPEN | Keep the original test-isolation gap separate from recent successful isolated contexts. Require the owner’s exact reproduction and repeatable isolation acceptance before closure. |
| UP07-MEP-01 | OPEN inherited | Independent MEP schema/semantic assessment within declared systems; prior assembly/electrical repair is not a guarantee for the whole inherited MEP suite. |
| Broader semantic MCP catch-up | OPEN | Per-operation matrix, authoritative implementation, actual source/package/live proof and explicit live-only boundaries. C supplying documentation does not establish all-application parity. |
| CI runtime headroom | OPEN | Preserve full observation counts while making the near30-minute job reliable; do not lower checks to obtain green collection. |
| Narrow-window/accessibility/short-label limits | OPEN; F28-D coordinated | Usable drawing area, focus/touch/keyboard and legible actual labels at agreed viewports in both layouts. |
| In-repository status snapshot drift | Documented maintenance debt | docs/PROJECT-STATUS.md retains an older dated pin. Use this checked PM report/public roadmap for current state; refresh the next controlled documentation delivery without rewriting historical evidence or treating a stale resume prompt as the baseline. |
| Prior closed findings | Remain CLOSED at verified pins | F08-PM-01/02, MCP01-PM-01, UP07-PM-01/02 and F28C-PM-01. Do not reopen from new scope alone; AUD-DEF-01 is distinct. |

## User decisions and evidence still needed

The audit and roadmap update can finish without another installation or private project upload. Before implementing the next layered-join semantics, collect one short native Revit walkthrough in a blank synthetic project. Record exact year/build, every relevant layer’s material/function/priority/thickness/core boundary and wrapping flag, instance location/orientation, then tooltip/context/ribbon behavior for the screenshot control. Capture eligible Butt/order/Miter/Square Off, Allow/Disallow and display cleanup separately, with plan/section/3D before/after. Include a controlled T and an insert only as comparison specimens.

PM/user scope decisions: include Square Off and view-only cleanup in the first L slice or stage them; choose independent-priority legacy defaults; approve physical/layer representation; define Copy’s host/reference policy; agree future Tab/Space/snap behavior; choose the first headless job boundary and retry policy. These are intentionally pending decisions, not already approved implementation semantics. Existing right-click screenshots/examples are still useful for the operation-specific menu inventory.

## What changed in this audit

Updated the local/public roadmap and priority/slice planning; added proposed F30 discovery and21 traceable child entries; reconciled all30 feature cards with present capability versus unaccepted work; retained F27 deferral and existing owners. Wrote this state report and machine-readable current-state, upstream and Revit reconciliation evidence. Published sanitized text/planning only; raw IFCs, screenshots, local paths, user image and model exports remain private.

No feature branch or main was merged, no rebase/reset/force push was performed, no running preview or user browser project was replaced, no global Git identity/permissions/client connection was changed, and no feature agent was started/stopped/messaged. The audit-owned ephemeral browser/server was closed after reproduction. Historical reports remain preserved rather than rewritten as if they used the new baseline.

## Sources and reproducibility

- [Fork main75af](https://github.com/drsurfbum/bimcraft-SDH/commit/75af81b49a3f472de734b0229f64e2140bbcbb10) and [upstream mainc778](https://github.com/getcadcraft/bimcraft/commit/c778c7ca3f83eeecc3e815078417f152b2ca7a94): verified remote refs and Git ancestry.
- [F09 integrated acceptance](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/F09-INTEGRATED.md): exact-main functional/reader/CI evidence; full suite inherited from October28.
- [F28-C PM review](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/followups/F28-C-F09-BASELINE-PM-REVIEW.md) and [candidate handoff](https://github.com/drsurfbum/bimcraft-SDH/blob/aa75a6f9261e6f2d79e4fe805a287d35cf272d28/docs/features/f28/compatibility07/DOC-MCP-01.md).
- [Slice register](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/features/SLICE-REGISTER.json), [F08-B plan](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/features/F08-B-WALL-JOIN-CONTROL.md), [Revit behavior standard](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/features/REVIT-BEHAVIOR-STANDARD.md), [F29 plan](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/features/F29-WALL-ASSEMBLY-FRAMING.md), [F30 plan](https://github.com/drsurfbum/bimcraft-SDH/blob/gh-pages/features/F30-HEADLESS-EXECUTION.md).
- Private PM evidence retains the original25-row Revit HTML/JSON audit and exact manifest hashes, new remote/PR/ancestry inventory, child register, current-main native reproduction log/JSON/screenshot and actual saved IFC with separate IfcOpenShell record read. The original audit’s native Revit, independent full-schema and full-suite limits remain explicit.
- No persistent BimCraft client or native Revit connector was available/configured for this audit. Use supported existing authoring/transport tools for implementation; lack of a client connection is distinct from tested server capability.

