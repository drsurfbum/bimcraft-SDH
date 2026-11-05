# BIMCraft Rust roadmap

November 4, 2026 · Primary development foundation: BIMCraft Rust · New BIMCraft Web development frozen for preserved handoff.

This is a development plan, not feature implementation or adoption of newer upstream code. Release v0.10.0 `f47a6c94281555728d6a61229355f037d1a464b3` is the installed comparison build. Source was audited at `dde24e240b7ca39fb040057c452175e3f3a0bf45`. Newer main `f418d8505939925a4fb30b848d8f944e614b6ec5` was observed six commits ahead; it is not runtime accepted. Web accepted main remains `75af81b49a3f472de734b0229f64e2140bbcbb10`.

## Working method

- Record Revit reference versions and distinguish documentation, native observation and inference.
- Define activation, selection, context, Properties/type distinction, grips, numeric input, snapping, hosts/layers, Esc, Undo/Redo, save/reopen and output as applicable.
- Present material semantic ambiguity or intentional departures before committing dependent behavior.
- Manual and semantic operations share authoritative model validation/history; verify actual client transport and independently inspect saved outputs.
- Preserve fixture masters and owner checkouts. No giant parallel feature rollout. One active implementation slice and small upstream-compatible contributions.
- An upstream PR, source feature, smoke test and accepted product workflow are different evidence levels.

## First bounded work queue

R00-A establishes the baseline. R02-A compares the house imports. R01-A is the proposed first small user-facing change. R03-A establishes integrity acceptance; R02-B/C follow measured failures and that integrity foundation. These are proposed slices, not simultaneously dispatched branches. Discovery can proceed while a single implementation slice is active.

### R00-A — Pin the baseline and preserve comparison builds

Dependencies: none.

Acceptance: Exact commits, fixture hashes, hardware/build configuration and source/runtime evidence ledger; one active implementation slice, owner and isolated checkout recorded.

### R02-A — Compare house imports and explain every omission

Dependencies: R00-A.

Acceptance: Both original exports, release/candidate results, source-product identities and reasons for omissions; compare missing roof geometry and materials without changing masters. Record memory/time and original-file refusal.

### R01-A — Prototype native Mac trackpad navigation

Dependencies: R00-A.

Acceptance: Review proposed mapping before committing dependent semantics. Verify pan/zoom/orbit, selection, panel scroll, cancellation, context click and momentum on the actual Mac.

### R03-A — Prove model/history ownership and agent parity

Dependencies: R00-A.

Acceptance: Manual/core/real MCP edits agree; stale/dirty/wrong-document interleaving cannot modify or Undo unrelated work; independent saved-file checks, rollback and receipts.

### R02-B — Fix the smallest verified import failure

Dependencies: R02-A.

Acceptance: Choose the defect from measured comparison, provide a synthetic reproducer and upstream-compatible correction, then rerun affected house and unsupported controls.

### R02-C — Large-file import and persistence lifecycle

Dependencies: R02-A, R03-A.

Acceptance: Document an explicit resource policy instead of merely deleting MAX_FILE. Exercise below/at/above thresholds, original files, native save/open, autosave/recovery and links, peak memory, UI responsiveness, cancellation and failure rollback. Exact 256 MiB is currently refused.

## Roadmap tracks

### R00 — Baseline and upstream workflow

**First queue · planned · no implementation owner assigned.**

Keep one reliable Rust baseline and small contributions that can return upstream.

Current evidence: Installed v0.10.0 is the comparison build. No SDH Rust feature branch or newer-main adoption is established by this audit.

Next: Pin baseline, inventory existing commands and upstream overlap, register fixtures and designate one active implementation slice.

Acceptance: Every run records codebase, exact commit, fixture hash and configuration. Vanilla, candidate and accepted builds remain distinct. Review upstream changes before each slice; never import an open PR as an accepted capability.

Dependencies: none. Web goals: F01.

### R01 — Mac interaction

**First queue · planned · no implementation owner assigned.**

Make daily navigation and editing comfortable on a Mac trackpad.

Current evidence: Release source maps scroll to zoom, pinch to zoom, middle drag to pan and primary drag/Shift-middle to orbit. Native Mac acceptance is incomplete.

Next: Prototype a trackpad profile while preserving selection, Properties, numeric entry, cancellation and accessible command access.

Acceptance: Proposed, not committed: two-finger pan, pinch zoom, modifier plus two-finger orbit. Test momentum, panel scrolling, context click, selection versus navigation, Retina scaling, gesture cancellation and OS-reserved gestures. Austin reviews intentional departures before dependent semantics are committed.

Dependencies: R00. Web goals: F09, F28.

### R02 — Revit and IFC import reliability

**First queue · planned · no implementation owner assigned.**

Open real residential exports with clear accounting for what survives.

Current evidence: Installed release rejects both original house exports at a 256 MiB guard. A compacted IFC4 copy opens with documented omissions. Newer source has roof changes; their effect on this house is untested.

Next: Compare original IFC4 and IFC2X3 exports across pinned release and candidate; identify missing products by source identity; address large-file lifecycle and specific geometry/category failures.

Acceptance: Preserve originals. Produce imported/transformed/skipped counts and identities, material/type/placement checks, geometry comparison and explicit unsupported cases. Large-file acceptance covers peak memory, cancellation, failure rollback, native save/reopen/autosave/recovery and linked files. Retain geometry-complexity bounds; no blanket removal of caps.

Dependencies: R00. Web goals: new Rust-specific requirement.

### R03 — Model integrity and agent operations

**First queue · planned · no implementation owner assigned.**

Make manual and automated edits equally trustworthy.

Current evidence: Shared Session::execute, CLI and MCP exist. Release synthetic checks passed move/Undo/Redo, failed-operation rollback, hosted copy and native reopen. Document ownership and interleaving are not fully accepted.

Next: Transfer precision/reference/history contracts; inventory actual MCP exposure and prove one reproducible local batch job.

Acceptance: UI and semantic tools use the same operations. Verify stable identities, raw units, dirty/stale refusal, document binding, permission/revision checks, atomic failure, no-op receipts, owned Undo and preservation of human edits. Read-only calls do not mutate. Separate implemented, registered, transport-tested, packaged and connected evidence. Compare actual saved outputs independently.

Dependencies: R00. Web goals: F02, F30.

### R04 — Compound walls and joins

**Next · planned · no implementation owner assigned.**

Produce predictable cores, finishes, corners and end conditions.

Current evidence: Automatic miters/node joins and six location references exist. Zero-thickness membrane layers are supported. Independent priority, explicit core boundaries, configurable per-end joins and wrapping parity are not established.

Next: Start with documented/native reference cases and one layered 90-degree L corner; extend join choices, permissions, seams and free-end/insert wrapping as distinct slices.

Acceptance: Compare core-butt/finish continuity, same/different materials, explicit butt/miter/order where eligible, physical permission versus view cleanup and untouched-end preservation after history. Verify plan/section/export/save/reopen and manual/MCP equivalence. Unsupported curves/heights fail or fall back explicitly.

Dependencies: R00, R03. Web goals: F08.

### R05 — Editing, hosting and building elements

**Next · planned · no implementation owner assigned.**

Keep walls, openings, levels and residential elements coordinated as plans change.

Current evidence: Many Modify commands, hosts, levels and building elements already exist. Limited move/copy tests passed; complete lifecycle acceptance has not.

Next: Audit existing commands before extending them; prove wall movement/copy with host rules, then opening lifecycle and level cascades.

Acceptance: Test move/copy/rotate/mirror/align/offset/split, operation-specific snapping, grips/numeric input/Esc, type versus instance, flip, height/thickness changes, rehost/replace/delete, references, Undo and reopen. Inventory foundations/slabs/beams/stairs/railings/rooms individually; no implied engineering sizing or compliance.

Dependencies: R00, R03. Web goals: F09, F15, F24.

### R06 — Residential roofs

**Next · planned · no implementation owner assigned.**

Handle the mixed pitches and intersections used in real homes.

Current evidence: Roof creation, joining and wall attachment exist. A simple gable passed a release smoke test. Newer source adds relevant per-edge slopes/import and shape-editing work; house fidelity remains unproved.

Next: Use R02 findings to select a bounded correction, then prove pitch/bearing/overhangs, persistent intersections and attached-wall behavior.

Acceptance: Fixtures include different pitches/bearings, porch and shed intersections, cross-gables, dormers and unequal overhangs. Verify stable references, edits, invalid-case diagnostics, eave/rake/fascia/soffit output, quantities, Undo, reopen and agent operations.

Dependencies: R00, R02, R03. Web goals: F10, F11, F12, F13, F14.

### R07 — Families and reusable libraries

**Next · planned · no implementation owner assigned.**

Build reusable residential components that remain editable.

Current evidence: Rust has parametric forms/formulas, hosted families and material/family favorites. The family editor is substantially text based. Imported IFC geometry does not recover the original RFA authoring graph.

Next: Prove one parametric window in two sizes; define versioned material/assembly/component packages and safe updates. Graphical constrained editing follows later.

Acceptance: Width/height/frame depth and host cuts must agree in model, drawings and quantities. Preserve type/instance distinction, overrides, identities, formulas and stable topology through edits/update/reopen. Package dependency/collision/version policy explicitly. Graphical sketch/history work needs recompute and failure recovery; do not begin with an engine rewrite.

Dependencies: R00, R03, R05. Web goals: F07, F16, F17, F18, F23.

### R08 — Views and coordinated documentation

**Next · planned · no implementation owner assigned.**

Turn the model into a consistent residential drawing set.

Current evidence: Plans, sections, elevations, dimensions, callouts and sheets exist. Dimension chains/constraints go beyond the initial Web slice. Family forms have sectioning limitations distinct from wall outlines.

Next: Verify existing views and dimension workflows; build representative wall-base/window/eave details and one coordinated small-house set.

Acceptance: Check plan/RCP view ranges, layers/detail levels, joined-wall and family sections, dimension witness references/locks/chains, callout associations, title blocks/scales/numbering/index and actual SVG/PDF output. Change the model and verify all affected drawings/schedules. Record intentional differences and unsupported commands honestly.

Dependencies: R00, R03. Web goals: F04, F05, F19, F20, F22, F28.

### R09 — Schedules and quantity semantics

**Next · planned · no implementation owner assigned.**

Make schedules and takeoffs mean what a builder expects.

Current evidence: Flexible schedules, filters/grouping/calculations and CSV/XLSX exist in inspected source. Exact Web assembly-layer legend semantics are not established; room volume is not roof/ceiling-clipped equivalence.

Next: Transfer layer-order/core/cavity/membrane definitions and hand-checkable gross/net material cases.

Acceptance: Independently reconcile known areas/volumes/counts, opening deductions, finish coverage, cavity non-solid volume, zero-thickness membranes and framing member quantities. Verify unit rounding, updates, exports and read-only semantic calls; a flexible table is not proof of correct quantities.

Dependencies: R00, R03, R04. Web goals: F06, F21.

### R10 — Framing and assembly coordination

**Later · planned · no implementation owner assigned.**

Reveal framing and coordinate outlets and shower niches within real stud bays.

Current evidence: No equivalent complete automatic timber-wall/stud-bay workflow was established in Rust. Structural beams or rebar do not demonstrate this capability. Web framing proof is reference evidence.

Next: One straight timber wall, one rectangular opening, one outlet and one niche; richer assembly transitions and junctions follow later.

Acceptance: One authoritative wall drives finished/core/framing views. Deterministic members and bay identities survive supported edits; placements retain stud-side/bay intent or report conflict. Preserve overrides and kept pieces. Niche clear width/height/depth and allowances remain distinct; no silent stud deletion or treating every niche as a through opening.

Dependencies: R03, R04, R05. Web goals: F29.

### R11 — Performance, recovery and delivery

**Throughout · planned · no implementation owner assigned.**

Keep the real house responsive and upgrades dependable.

Current evidence: Native desktop packaging exists. Synthetic smoke evidence is not a house-scale performance baseline. Existing Web performance collection remains evidence, not native acceptance.

Next: Measure Mac CPU/GPU/memory/import/edit/view/export performance; fix measured bottlenecks. Add large-project recovery, migration, locale and packaging acceptance.

Acceptance: Use repeatable real-house and synthetic fixtures with hardware/configuration and percentile reporting. Prior 100 ms selection / 33 ms preview / 500 ms committed-edit p95 goals are proposed, not achieved. Verify upgrades, old/new format handling, autosave/recovery, offline use, localized text and export fonts. No Web-to-Rust/WASM rewrite spike remains.

Dependencies: R00, R03. Web goals: F03, F25, F26.

### R12 — Capture to parametric BIM

**Deferred · deferred · no implementation owner assigned.**

Reconstruct editable models from measured reference evidence.

Current evidence: Retained goal; no complete capture-to-authoritative-BIM workflow accepted.

Next: Keep deferred until the residential foundation is trustworthy.

Acceptance: Separate uncertain scan/reference evidence from confirmed dimensions. Require measurement confirmation and semantic, editable reconstruction with coordinated drawings; capture uncertainty must not weaken model precision.

Dependencies: R03, R07, R08. Web goals: F27.

## Feature crosswalk

| Web item | Web status | Rust decision | Destination |
|---|---|---|---|
| F01 — Integration baseline and standalone test workflow | integrated | Reuse requirements: Establish reproducible native startup and pinned comparisons. | R00 |
| F02 — Precision, references and migration contract | integrated | Verify and extend: Carry precision, references and unknown-record preservation requirements; distinguish IFC imports from native-file preservation. | R03, R02 |
| F03 — Performance baseline and profiling harness | integrated | Reuse methodology: Measure native Mac/house performance; do not transfer browser timings as native results. | R11 |
| F04 — Layered plan graphics and vector output | integrated | Verify existing coverage: Check layer graphics, cavities/membranes/detail and agreement between screen and vector output. | R08 |
| F05 — Layer-aware wall sections and elevations | partial | Verify and extend: Test joined-wall sections separately from imported/family-form sectioning; do not inherit the Web exclusion automatically. | R08 |
| F06 — Assembly schedule and material legend | integrated | Extend semantics: Flexible schedules exist; ordered layers/core/cavity/zero-membrane legend still needs proof. | R09 |
| F07 — Reusable project libraries | planned | Extend existing library: Materials/families favorites are a starting point; assembly packaging/version/dependency policy remains. | R07 |
| F08 — Wall join and end-condition reliability | partial | Substantial gap: Automatic geometry is not explicit join permissions/order/core-priority/wrapping parity. | R04 |
| F09 — Properties and Modify workflow consistency | partial | Verify existing tools: Carry editing, host/reference, history and snapping requirements; do not transplant the Web defect as a confirmed Rust bug. | R01, R05, R03 |
| F10 — Roof workflow and intersection spike | planned | Retain discovery: Start with the real-house roof omissions and existing Rust operations. | R06, R02 |
| F11 — Precise roof-plane editing | planned | Verify and extend: Prove pitch/rise-run, bearing, elevation, overhang, thickness and reference stability. | R06 |
| F12 — Persistent roof intersections, joins and trim | planned | Verify and extend: Persistent roof joining exists; test ridge/hip/valley/trim relationships and invalid cases. | R06 |
| F13 — Roof/wall attachment and roof detail output | planned | Verify and extend: Test top/base attachment and eave/rake/fascia/soffit details and quantities. | R06, R09 |
| F14 — Expanded residential roof cases | planned | Retain fixtures: Cross-gable, dormer, unequal-overhang and shed-to-main-roof cases remain. | R06 |
| F15 — Residential host and opening reliability | planned | Verify and extend: Host lifecycle and insert wrapping remain separate requirements. | R05, R04 |
| F16 — Parametric modeler architecture spike | planned | Adapt architecture study: Extend the existing Rust forms/formulas system; no new geometry engine presumed. | R07 |
| F17 — One editable parametric window end to end | planned | Retain acceptance proof: One hosted parametric window in two sizes, across editing/history/drawings/reopen. | R07 |
| F18 — Component library and version updates | planned | Extend existing library: Versioned components and safe updates preserving overrides and hosts. | R07 |
| F19 — Associative dimensions beyond the prototype | planned | Audit existing capability: Rust chains, witness references and constraints exceed the initial Web scope; evaluate rather than recreate. | R08 |
| F20 — Residential detailing workspace | planned | Retain workflows: Model-linked callouts and wall-base/window/eave detail examples. | R08 |
| F21 — Material/assembly quantity semantics | planned | Retain definitions: Gross/net, membrane/cavity, coverage and non-uniform framing semantics. | R09 |
| F22 — Coordinated sheet set and print QA | planned | Retain end-to-end acceptance: Coordinate model edits, sheets, scales, references, schedules and actual PDF output. | R08, R09 |
| F23 — Constrained sketches and feature-history component editor | planned | Later extension: Graphical constrained sketches and feature history remain beyond the largely text-based family editor. | R07 |
| F24 — Residential structure coverage audit and gap closure | planned | Audit category coverage: Verify foundations/slabs/beams/stairs/railings/levels/rooms before adding gaps. | R05 |
| F25 — Targeted performance work and Rust decision | planned | Supersede obsolete task: Retire Web-to-Rust/WASM decision; retain targeted native performance work. | R11 |
| F26 — Packaging, recovery and release readiness | planned | Verify and extend: Existing packaging does not close migration/recovery/large-file/locale acceptance. | R11, R02 |
| F27 — Capture to Parametric BIM | deferred | Keep deferred: Capture-assisted reconstruction remains deferred with uncertainty/measurement controls. | R12 |
| F28 — Revit-familiar workspace and menu redesign | partial | Transfer workflows; retire Web rewrite: Existing ribbon/properties/browser are starting points. Web layout implementation and merge reconciliation are not Rust work. | R01, R08, R03 |
| F29 — 3D wall assemblies and framing coordination | planned | Retain coordinated goal: Studs/bays/openings/outlet/niche intent and deterministic regeneration remain a major gap. | R10 |
| F30 — Headless BimCraft execution and batch automation | planned | Harden existing foundation: Use shared CLI/MCP/core; prove reproducible jobs, receipts, atomicity, permission and outputs. | R03 |

## Child slices

| Web slice | Rust treatment | Destination |
|---|---|---|
| F09-B — Repair join Properties after history | Keep Web defect in handoff. Reuse regression intent; not a confirmed Rust defect. | R03, R05 |
| F28-C — Reconcile documentation candidate with current main | Retire Web merge work from Rust scope; preserve unadopted PR #12 and transfer documentation/agent requirements. | R08, R03 |
| F08-B0 — Capture the intended native Revit join behavior | Transfer requirement; re-scope around existing Rust behavior before implementation. | R04 |
| F08-B — Layered 90-degree L corners and explicit join choices | Transfer requirement; re-scope around existing Rust behavior before implementation. | R04 |
| F05-B — Sections through joined straight walls | Transfer requirement; re-scope around existing Rust behavior before implementation. | R08 |
| F15-A — Focused door/window host durability | Transfer requirement; re-scope around existing Rust behavior before implementation. | R05 |
| F09-C — Move one authored wall predictably | Transfer requirement; re-scope around existing Rust behavior before implementation. | R05 |
| F09-D — Copy one authored wall with explicit host rules | Transfer requirement; re-scope around existing Rust behavior before implementation. | R05 |
| F19-A — Chained plan dimensions and witness editing | Transfer requirement; re-scope around existing Rust behavior before implementation. | R08 |
| F09-E — Operation-specific snapping and contextual input | Transfer requirement; re-scope around existing Rust behavior before implementation. | R05, R01 |
| F08-C — Free-end compound-wall wrapping | Transfer requirement; re-scope around existing Rust behavior before implementation. | R04 |
| F15-B — Door/window insert wrapping | Transfer requirement; re-scope around existing Rust behavior before implementation. | R04, R05 |
| F04-B — Plan/RCP range edge-case acceptance | Transfer requirement; re-scope around existing Rust behavior before implementation. | R08 |
| F28-D — Narrow-window layout and command accessibility | Transfer requirement; re-scope around existing Rust behavior before implementation. | R01 |
| F21-A — Hand-checkable material quantities | Transfer requirement; re-scope around existing Rust behavior before implementation. | R09 |
| F22-A — One coordinated small-house drawing set | Transfer requirement; re-scope around existing Rust behavior before implementation. | R08 |
| F24-A — Residential coverage and level-cascade audit | Transfer requirement; re-scope around existing Rust behavior before implementation. | R05 |
| F29-A — Framing coordination discovery and first proof | Transfer requirement; re-scope around existing Rust behavior before implementation. | R10 |
| F30-A — Headless capability and parity inventory | Transfer requirement; re-scope around existing Rust behavior before implementation. | R03 |
| F30-B — One reproducible browser-free Test Lab job | Transfer requirement; re-scope around existing Rust behavior before implementation. | R03 |
| F26-I18N — Locale, export-text and platform acceptance | Transfer requirement; re-scope around existing Rust behavior before implementation. | R11 |

## Revit behavior crosswalk

The primary reference is Revit 2027 documentation, with retained versioned 2025/2026 supporting references. No native Revit execution is claimed. Full expected behavior, prior acceptance and source URLs are retained in revit-crosswalk.json.

| Audit row | Rust disposition | Destination |
|---|---|---|
| AUD-DEF-01 — Join-end edit after Undo/Redo can silently alter the opposite end | Regression requirement, not confirmed Rust defect: Web stale form values can overwrite the opposite end after history. Reuse the scenario without assigning that bug to Rust. | R03, R04, R05 |
| J-01 — Deterministic straight L/T/endpoint-X geometry | Existing; acceptance pending: Automatic L/T/node joins exist. Verify exact geometry, layers, history and saved outputs. | R04 |
| J-02 — Core-butt and finish/substrate continuity with material seams | Gap: Layer schema does not establish independently configurable priority and explicit core boundaries; verify material seams. | R04 |
| J-03 — Butt/Miter/Square Off and which wall continues | Gap: Automatic miter geometry does not establish explicit Butt/Miter/Square Off/order choices. | R04 |
| J-04 — Allow/disallow joining versus display-only cleanup | Gap: No equivalent explicit per-end allow/cap configuration established; separate physical joining from view cleanup. | R04 |
| J-05 — Discoverable wall-end control and selected-join workflow | Gap: Discoverable selected-end join controls and contextual behavior not established. | R04, R01 |
| J-06 — Corner cleanup versus wrapping at free ends and inserts | Gap: Corner cleanup, free-end wrapping and insert wrapping/closure planes require separate slices. | R04, R05 |
| J-07 — Unsupported curves, unequal heights and complex intersections | Partial; tests needed: Curved walls exist; complex intersections/unequal heights require explicit supported cases and refusal/fallback. | R04 |
| W-01 — Wall type, material, core and instance separation | Partial: Types/materials/layers exist; independent core/priority semantics are incomplete. Zero-thickness membranes already supported. | R04, R07 |
| W-02 — Location lines and exterior orientation | Existing; acceptance pending: All six location references exist. Verify flips/type/thickness changes preserve intended reference and host positions. | R04, R05 |
| I-01 — Selection, Properties, wall grips, numeric entry and cancellation | Existing; acceptance pending: Test selection, Properties, grips, numeric entry, cancellation, dirty forms and document revision. | R01, R05, R03 |
| I-02 — Wall Move/Copy/Rotate/Mirror/Align/Offset/Split | Existing; partial runtime proof: Move/history and hosted-copy release smoke tests pass; broader Modify/host/refusal policies remain. | R05 |
| I-03 — Keyboard/context shortcuts and reference snapping candidate | Existing; acceptance pending: Shortcuts and snaps exist. Audit operation-specific targets/context; proposed Mac navigation is an intentional adaptation. | R01, R05 |
| H-01 — Door/window host edits and cut consequences | Existing; acceptance pending: Test complete opening lifecycle; upstream issue #215 is a relevant boundary-case report, not proof for all hosts. | R05 |
| V-01 — Plan/RCP detail and view range | Existing; acceptance pending: Plan/RCP range/detail exists. Top/cut/bottom/depth and displayed output need representative cases. | R08 |
| D-01 — Persistent wall dimensions versus chains and driving constraints | Existing beyond Web slice: Chains, multiple references, locks/EQ/driving exist in source. Do not carry the Web blanket deferral into Rust. | R08 |
| V-02 — Sections through an otherwise ordinary joined wall | Different limitations: Walls share outlines with sections; test joined walls. Family forms not truly sectioned is a separate Rust limitation. | R08 |
| S-01 — Assembly schedule/material legend versus flexible schedules/quantities | Partial: Flexible schedules/calculations/exports exist; assembly-layer legend and quantity meanings are not established. | R09 |
| S-02 — Sheets, callouts, annotations and vector output | Existing; acceptance pending: Sheets/callouts/annotations/vector output exist; prove a coordinated edited house set. | R08 |
| C-01 — F28-C documentation controls and semantic workflow | Retire Web integration work: Preserve Web PR #12 for handoff; carry documentation and semantic-operation requirements, not its merge conflicts. | R08, R03 |
| L-01 — Levels and multi-level wall behavior | Version-sensitive; tests needed: Level behavior exists; top-offset work is in newer source. Verify constraints and cascading edits on chosen baseline. | R05 |
| R-01 — Existing floors and roofs versus persistent roof relationships | Partial; house failure observed: Roof/attachment tools exist. One house roof omitted in release; newer source changes must be tested before claiming a fix. | R06, R02 |
| F-01 — Existing framing versus planned assembly coordination | Gap: No complete automatic timber-wall/stud-bay/outlet/niche coordination workflow established. | R10 |
| A-01 — Authoritative manual/MCP operations and transport evidence | Strong foundation; incomplete acceptance: Shared authoritative commands and actual release CLI/MCP calls exist. Ownership/interleaving/packaged/live proofs remain separate. | R03 |
| E-01 — Exact native Revit result behind the user screenshot | Reference evidence pending: Exact native Revit screenshot recipe is unknown. Official documentation is evidence; native observation is not claimed. | R04, R08 |

## Evidence and limits

Release smoke checks: move/Undo/Redo exact-model restoration, refused operation with unchanged model, hosted wall copy, simple gable creation, imperial units, four-row wall schedule and native save/reopen. Actual MCP discovery/calls were recorded. These are bounded checks, not full feature acceptance.

Real-house trial: compacted IFC4 opened with 691 counted elements across the recorded categories, including one roof. A second roof and other objects were omitted; see audit.json. Both originals exceed the hardcoded file guard. No complete geometry-fidelity comparison or native Revit runtime observation was performed.

Read [file-size explanation](IFC-SIZE-LIMIT.md), [Web handoff](WEB-HANDOFF.md), [interactive audit](audit.html), and the structured crosswalk JSON files.
