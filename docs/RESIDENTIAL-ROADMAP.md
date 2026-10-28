# Residential BIM development roadmap

Planning baseline: 2026-10-21. **Current progress and approved application evidence: [PROJECT-STATUS.md](PROJECT-STATUS.md); published PM roadmap: https://drsurfbum.github.io/bimcraft-SDH/. The feature cards and original prototype observations below retain their planning context; use the current status ledger for adoption decisions.** This is the proposed product roadmap for the user's fork, not an assertion of complete Revit, Fusion 360 or Rhino compatibility. Update statuses as work lands; do not infer completion from the existence of a module.

## Product outcome

A lightweight, responsive residential BIM application with precise model geometry, dependable Properties and assembly editing, associative dimensions, strong construction-document and detailing tools, flexible roofs, and a more direct parametric component-authoring experience.

The primary user designs houses and prepares residential construction documents. Optimize that complete workflow before pursuing broad commercial BIM parity. F28 uses the user-approved Revit-familiar layout as its structural baseline, adapted to actual BimCraft capabilities; unavailable commands have honest disabled explanations and roadmap mappings.

### Product rules

- Preserve analytic geometry and stable model references; round only displayed values. A fast viewport is not evidence of precise geometry.
- Keep material definitions, assembly layers, element types and element instances distinct. A material default is not a live thickness constraint on every assembly using it.
- Treat Properties as a primary editing surface. Make type-wide effects clear before committing them.
- Keep cavities and zero-thickness membranes in assembly data. A cavity contributes width; a zero-thickness membrane does not. Neither should accidentally become a solid-material quantity.
- Model edits must update dependent views, openings and dimensions, or explicitly show an unresolved state. Never leave a plausible stale measurement.
- Work locally, preserve portable IFC output, and avoid a mandatory service for everyday modeling.
- Reuse the existing code where it meets the need. Isolate expensive computation before choosing another language.

## Original prototype starting point (historical)

Repository: https://github.com/drsurfbum/bimcraft-SDH

Development checkout on the current computer: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-dev`.

The original checkout `/Users/austinhartt/Documents/GitHub/bimcraft` is separate and was not the implementation workspace. Do not assume changes in one are in the other.

Historical prototype branch: `feature/wall-assemblies-dimensions`, feature baseline `bb2b8d2`. PR #2 integrated into that branch at `994e4168609316d17ada992bb0dbef473f52ed18`, then PR #1 merged into main at `1c35f47d69af2214b4747f541703224d0a4a4742`. See the [historical integration record](INTEGRATION-2026-10-21.md) and [current snapshot](PROJECT-STATUS.md). These old prototype pins are not the next feature baseline; do not reset existing checkouts to them.

Implemented and tested as a prototype:

- Custom wall types, contiguous explicit cores, type editing/duplication, wall Properties and core location lines.
- Persistent dimensions to finish faces, core faces, wall centerlines and core centerlines; edit/rebind, unresolved-host behavior, undo/redo and IFC round trips.
- Project material library with stable IDs, thickness defaults, colors/fills, notes and direct material creation from the assembly picker.
- Explicit cavity width/ventilation; zero-thickness membranes retained in assembly records.
- Assembly orientation labels, matching numbered swatches and dimensioned layer/core/total preview.
- Material selection applies its default thickness to the selected layer. Subsequent library edits do not resize existing assemblies.

Verification at the feature baseline: 8 material tests, 7 wall-precision tests; existing model/comforts/views2 suites reported 122/103/104 passes. Browser workflows were exercised. These are historical results: rerun relevant checks on the implementation being delivered. Optional external IFC schema validators were unavailable. The broad residential suite has a missing cross-application TakeoffCraft dependency in this standalone checkout.

Prototype limits at that historical date (subsequent bounded F04/F05/F06/F08 work is recorded in the current snapshot):

- Material fills currently appear in the assembly editor, not as authored per-layer plan/section graphics.
- Wall geometry remains an envelope. Existing wall quantities are envelope quantities, not solid-material takeoffs.
- Persistent references are for supported BimCraft-authored walls in plan/RCP/callout views; section/elevation association and generalized component-face references are not complete.
- Complex core-priority joins, wrapping, variable layers and arbitrary imported-wall editing are not covered by the prototype.
- IFC2X3 omits zero-thickness membranes from its physical material-layer set but retains them in the recipe/library; other readers need that metadata to recover them. IFC4 can carry the zero-width layers.
- Model-derived schedules for assemblies/membranes, reusable cross-project libraries, and the proposed advanced roof/component workflows are not delivered by this prototype.

See [WALL-PRECISION.md](WALL-PRECISION.md) for exact current behavior and run instructions.

### Existing systems to inspect before building

| Area | Starting code | What is already present, subject to feature-specific verification |
|---|---|---|
| Wall data and Properties | `app/model-walls.js`, `app/model-ops.js`, `app/model-ui.js` | Wall instances/types, model operations, joins and UI |
| Materials and assemblies | `app/project-materials*.js`, `app/wall-assemblies*.js`, `app/assembly-preview.js` | Prototype library, editor and preview |
| References/dimensions | `app/wall-dimensions*.js`, `app/dimension-geometry.js` | Persistent named wall references and plan dimensions |
| Floors and roofs | `app/model-slabs.js`, `app/model-roof.js`, `app/res-roofplane.js`, `app/res-roof.js` | Derived slabs/roofs and manual polygons with pitch and base height |
| Components | `app/family-model.js`, `app/family-editor.js`, `app/family-ops.js`, `app/family-ifc.js`, `app/model-openings.js` | Parameters/formulas, box/extrude/revolve/sweep, booleans, hosted door/window families |
| Drawing views | `app/model-planview.js`, `app/res-views.js`, `app/views-model.js`, `app/comforts-views.js` | Plan/view models, projected views, notes/tags |
| Details and sheets | `app/drafting*.js`, `app/res-sheets.js`, `app/model-schedule.js` | View-owned drafting/hatches, sheet composition, vector PDF and schedules |

## Milestones and release gates

| Milestone | Outcome | Required feature cards | Demonstration that closes it |
|---|---|---|---|
| M0: Shared foundation | A reproducible baseline, precision contract and measured performance | F01–F03 | Another feature chat can open a fixture, run checks and report comparable results without modifying a shared working branch. |
| M1: Trustworthy wall documentation | Assemblies appear correctly in drawings and schedules, and edits behave predictably | F04–F09 | A small house plan and wall section show the same layers, cavity and membrane records; edits preserve references and printed scale. |
| M2: Original prototype complete | Parametric hosted window, flexible roof intersection and a coordinated sheet | F10–F13, F16–F17 plus M1 | Two custom wall types; one editable parametric window cutting a wall; two roof planes with different pitches/bearings; plan, wall section, roof detail and sheet. |
| M3: Residential working release | Finish a representative residential drawing set without ad hoc workarounds for the selected scope | F14–F15, F18–F22, F24, F26 | Complete the reference house, save/reopen, revise its wall/window/roof, and produce a reviewed, consistent drawing set. |
| M4: Targeted expansion | Better component authoring and optional accelerated geometry | F23 and F25 as justified | Measured improvements with equivalent precision and file compatibility; no rewrite required merely to close a milestone. |

Milestones are acceptance gates, not calendar promises. F10 and F16 are early discovery spikes: run them after M0 while the documentation track advances, then revise their dependent cards using evidence. M2's window proof can use the existing family system; a complete Fusion-like modeler is not a prerequisite.

## Feature cards

Status at planning baseline: all cards below are **proposed**, except the separately listed completed prototype. Sizes are relative: S = narrow change, M = several modules, L = split into implementation slices after discovery, Spike = time-boxed investigation with a decision. They are not estimates of chat turns or delivery dates.

### Foundation

**F01 — Integration baseline and standalone test workflow** · S · Depends: none

Inspect PR #1 and the current remotes/branch. Record the baseline commit and startup commands, create or identify a small residential fixture, and isolate the missing TakeoffCraft test dependency so standalone checks report an explicit skip or run a focused equivalent. Do not fabricate passing external checks or merge the PR without user authorization. Done: clean startup and documented reproducible test commands on a fresh development checkout; no accidental use of upstream-only main.

**F02 — Precision, references and migration contract** · M · Depends: F01

Document length/angle units, geometry tolerances, display rounding, local/project coordinates, supported file versions and named-reference behavior. Add fixtures for imperial/metric units, translated coordinates, tiny offsets, curves and repeated edit/save/reopen. Define safe handling for unknown schema versions and broken hosts. Done: tests prove supported operations meet the agreed tolerance and fail visibly outside it. Use the existing 0.005 mm regression threshold as a starting test bound, not as a claim of universal CAD-kernel accuracy.

**F03 — Performance baseline and profiling harness** · M · Depends: F01

Measure cold/warm open, selection, pan/zoom, wall/type edits, roof regeneration, save and PDF generation on small/medium/large residential fixtures. Record hardware, browser/runtime, fixture sizes, p50/p95 and memory. Proposed starting UX targets for a typical house: selection/Properties feedback within 100 ms, interactive preview frames within 33 ms, and common committed edits within 500 ms at p95. Validate or revise these targets using measured baseline data. Done: reproducible timings identify the dominant cost and separate geometry work from UI/IFC parsing/serialization.

### Wall modeling and documentation

**F04 — Layered plan graphics and vector output** · M · Depends: F01, F02

Render authored wall layers with project fills/colors, unfilled cavities, and membrane boundary lines. Offer useful coarse/medium/fine detail behavior. Start with straight unjoined walls; then cover curves, junction clipping and opening cuts before declaring the card complete. Screen and vector PDF/sheets must share the same layer boundaries. Done: a material-style edit changes graphics without changing geometry; walls with openings and corners remain legible and exports retain scale. Excludes per-layer 3D solids.

**F05 — Layer-aware wall sections and elevations** · L · Depends: F02, F04

Extend existing projected views to show cut layers, cavities, membranes, openings, levels and graphic depth consistently. Keep model-derived geometry distinct from view-specific detail overlays. Done: one wall section and one elevation update after wall height, assembly and window changes, and print correctly. Break into section cut geometry, graphic presentation and update/export slices if needed.

**F06 — Assembly schedule and material legend** · M · Depends: F01, F02

Schedule type name, exterior-to-interior layer order, material, function, core status, nominal thickness, cavity ventilation and membrane designation. Include every zero-thickness layer without implying physical width or solid volume. Place a schedule/legend on a sheet and export CSV where existing infrastructure supports it. Done: edit/reorder a layer and the schedule updates; totals match the model and names resolve by stable IDs. Quantity takeoff is F21, not this card.

**F07 — Reusable project libraries** · M · Depends: F02, F06

Import/export a versioned material-and-assembly package for use in another project. Include referenced materials, optional source/manufacturer notes and conflict resolution for same IDs/different content. Define copy versus update explicitly. Done: transfer a custom assembly including cavity/membranes to an empty project; no missing materials, silent replacement or resize of existing walls. Keep generic starter values separate from verified product specifications.

**F08 — Wall join and end-condition reliability** · L · Depends: F02

Extend current straight L joins to selected T/X, acute/obtuse, dissimilar-core and curved conditions. Define core-priority cleanup and explicit end caps/disallow-join controls. Separate finish wrapping at openings as its own implementation slice. Done: fixtures show no slivers or gaps for supported cases; finish changes preserve core anchors and attached dimensions. Unsupported conditions remain explicit. Coordinate integration with F04/F05 rather than editing their renderers concurrently.

**F09 — Properties and Modify workflow consistency** · M · Depends: F02, F08

Audit existing select, move, copy, rotate, mirror, align, offset, trim/extend, split and wall-flip behavior. Fix the highest-impact residential gaps; do not rebuild working tools. Standardize multi-selection, mixed values, instance/type distinction, numeric entry, snapping and predictable undo. Add a selected-wall exterior-side indicator in plan if existing orientation feedback is inadequate. Done: a documented edit sequence preserves hosted elements, material orientation, references and type-vs-instance intent. Split missing operations into individual follow-up cards.

### Roofs

**F10 — Roof workflow and intersection spike** · Spike · Depends: F02, F03

Exercise existing automatic roofs and manual planes before choosing an extension strategy. Use two intersecting planes at different pitches and bearing heights, then an offset porch and dormer case. Compare analytic intersection/trim against existing code; capture failure cases and define supported geometry. Done: a design note, reproducible fixtures and the smallest implementation plan for F11–F13. No general-purpose Rhino replacement or new kernel selection by assumption.

**F11 — Precise roof-plane editing** · M · Depends: F10

Extend plane Properties and direct manipulation: explicit bearing line/height, pitch (rise/run and angle), slope direction, polygon edges, overhang and thickness. Done: edit either plane's pitch/bearing independently with accurate numeric feedback, consistent roof geometry and one undo operation; invalid/degenerate inputs are rejected.

**F12 — Persistent roof intersections, joins and trim** · L · Depends: F11

Create ridge/hip/valley intersections with persistent relationships and an explicit join/unjoin or trim workflow. Begin with the two-plane acceptance case, then selected multiple-plane conditions. Done: differing-pitch/bearing planes meet without gaps or overlaps in supported cases; later edits recompute the seam and survive undo/reopen. Keep stable plane/edge identities for future annotation. Unsupported ambiguous joins must not silently choose a result.

**F13 — Roof/wall attachment and roof detail output** · L · Depends: F05, F12

Attach appropriate wall tops to roof undersides, support selected eave/rake/fascia/soffit conditions, and expose useful cut geometry to details. Done: moving a bearing or changing pitch updates attached walls and the roof section; a roof detail and sheet show consistent dimensions. Dormers and complex compound intersections may require additional cards after the first working case.

**F14 — Expanded residential roof cases** · L · Depends: F13

Add verified cross-gable, unequal overhang, porch, dormer and shed-to-main-roof cases from the user's projects. Prioritize explicit plane/edge editing, snapping and intersections before unconstrained freeform surfaces. Done: each accepted case has an editable fixture and a regression test; changes propagate without requiring deletion/recreation.

### Parametric components

**F15 — Residential host and opening reliability** · M · Depends: F02, F08

Audit existing doors/windows and improve host placement, rough openings, sill/head controls, flip/hand/orientation and type changes. Define host deletion/replacement and changed wall-thickness behavior. Done: doors/windows stay correctly placed and cut the intended wall across supported wall edits and round trips. No dangling opening voids or duplicated cuts.

**F16 — Parametric modeler architecture spike** · Spike · Depends: F02, F03

Assess the existing family editor, parameter/formula engine and extrude/revolve/sweep/boolean operations. Compare extending the in-app editor, an embedded module and a separate local application sharing a component format. Evaluate constrained sketching, feature history, dependency graphs, stable topology references, host-cut contracts, browser/native costs and recovery. Done: a short decision record and experimental component transfer; recommend a default, but record assumptions and user tradeoffs. Do not commit to full CAD-kernel replacement or external proprietary-format compatibility.

**F17 — One editable parametric window end to end** · M · Depends: F16, F02

Build a residential window with editable width, height, frame depth and a host-cut definition; leverage existing primitives where sufficient. Expose user-facing parameters in Properties and distinguish type/instance changes. Done: place two sizes, edit parameters, verify wall cuts and plan/section/schedule output, then undo/reopen without losing parameters. Includes a focused host acceptance check; broader host reliability remains F15.

**F18 — Component library and version updates** · M · Depends: F15, F17

Package reusable doors/windows and a small set of residential components with names, previews, defaults and versions. Define local edit versus library update behavior. Done: updates have a reviewable effect on placed instances and preserve per-instance overrides/hosts; missing or incompatible versions are explicit. Avoid silently changing every project when a shared definition changes.

### Construction documents and detailing

**F19 — Associative dimensions beyond the prototype** · L · Depends: F02, F05, F09; opening references also require F15

Start with chained plan dimensions and practical witness-line editing. Then add supported section/elevation, opening and roof references in separate slices. Allow selection cycling among finish/core/center references with visible feedback. Done: deleting/replacing a referenced object produces explicit unresolved status; editing geometry updates values on screen and sheets. Driving geometry by changing dimension text is deferred until a constraint strategy is approved.

**F20 — Residential detailing workspace** · L · Depends: F05

Extend existing drafting into usable model-linked callouts and independent drafting details. Prioritize detail lines, filled/masking regions, text/leaders, reusable detail components and lineweight/pattern styles. Define model-derived versus manually drafted geometry clearly. Done: produce and revise a wall base, window opening and roof eave detail with correct paper-scaled text and vector output. No full general CAD application requirement.

**F21 — Material/assembly quantity semantics** · M · Depends: F06, F08, F15

Define gross/net wall-envelope areas and volumes separately from material coverage/volume. Handle cavities, zero-thickness membrane coverage, openings and shared boundaries explicitly. Do not treat a framing/insulation assembly layer as a homogeneous solid quantity without a declared calculation method. Done: hand-checkable fixtures reconcile totals; cavities carry no solid material volume, membranes have optional coverage area but zero nominal volume, and reports state their measurement method.

**F22 — Coordinated sheet set and print QA** · L · Depends: F05, F06, F13, F17, F19, F20

Extend existing sheets/PDF with reusable title blocks, placed view titles/scales, detail/section references, numbering and a useful drawing index. Audit existing tags/notes and schedule placement. Done: one coordinated residential set exports at correct scale, with readable lineweights, linked view references and no clipped annotations; a subsequent model revision updates every affected placed view. This is drawing-set readiness for human review, not automated permit/code certification.

**F23 — Constrained sketches and feature-history component editor** · L · Depends: F16–F18

Deliver the chosen modeler architecture incrementally: sketch constraints and dimensions; then feature history/recompute; then selected extrude/revolve/cut/sweep editing and reusable parameters. Stable references and failed-feature recovery are first-class acceptance criteria. Done: a user builds and edits the F17 window through the new workflow without manually repairing dependent faces after a parameter change. Split into several feature chats; full Fusion 360 parity is outside this card.

### Residential coverage, performance and release

**F24 — Residential structure coverage audit and gap closure** · L · Depends: F02, F09; complete before M3

Audit existing foundations, slabs/floors, beams/posts, framing, stairs/railings, levels and rooms against the reference house. Produce a supported/partial/missing matrix with demonstrations, then create narrowly scoped child cards for blocking gaps. Prioritize modeling/documentation of core structure, not structural design calculations. Done: the chosen house's foundation, floors, vertical circulation and primary structural objects can be modeled and documented at the agreed detail level; unneeded commercial systems do not enter the critical path.

**F25 — Targeted performance work and Rust decision** · Spike then M/L · Depends: F03 and at least one measured F12/F22 workload

Profile the real bottleneck. First evaluate algorithmic improvements, caching, incremental regeneration and workers in the current stack. Compare a narrow Rust/WASM prototype only for an identified expensive operation; consider native Rust separately if desktop integration warrants it. Measure conversion/copy overhead, cold start, memory, responsiveness and numerical equivalence on the same fixtures/hardware. Done: a decision record says stay with JavaScript, adopt a bounded Rust module, or gather more evidence. Require a meaningful end-to-end improvement to justify build/debug/interoperability costs. Whole-application rewriting is not the default deliverable.

**F26 — Packaging, recovery and release readiness** · M · Depends: F22, F24; independent of whether Rust is adopted

Verify offline installation/startup, save/recovery, migrations, distribution and upgrade behavior on the chosen initial platform. Capture a reference drawing set and release checklist. Before distribution, review the repository's existing LICENSE/NOTICE/THIRD_PARTY/TRADEMARKS documentation and track fork naming/assets as release work. Done: install/open/revise/export/recover is demonstrated on a fresh setup, limitations are documented and the user has reviewed the residential set. Choose other platforms later from actual need.

## Original dispatch sequence (historical planning)

This sequence explains the original dependencies. F01–F04/F06 and the recorded partial slices are already adopted; follow [current priorities](PROJECT-STATUS.md) instead of dispatching them again. Later roadmap additions are F27 (deferred capture-to-parametric BIM discovery) and F28 (partially integrated Revit-familiar workspace).

1. **F01**: establish and record the integration baseline. A new chat starting from upstream main would otherwise miss the prototype.
2. **F02 + F03 as separate features**: precision/reference contract and performance baseline; coordinate fixture ownership.
3. **F04**: layered plan graphics is the next visible product improvement. Follow it with F05 and F06.
4. **F10 and F16 spikes**: investigate roofs and component modeling early, in isolated branches, while documentation progresses. Their outputs refine implementation scope rather than delaying all other work.
5. **F08/F09 and the roof/window cards**: integrate in dependency order, then assemble the M2 demonstration.

F06 can proceed alongside F04 once baseline contracts are settled, but they must not both change the material schema independently. F11–F13 own roof relationships; F16–F18 own component contracts. Shared model operations, view/render code and schema changes require coordination even when nominal feature titles differ.

## Definition of done for every feature

- Demonstrated acceptance criteria, with a representative saved fixture where useful.
- No silent data loss; same stable IDs/references across supported edits, save/reopen and undo/redo.
- Negative/degenerate cases handled visibly. Tests cover behavior and regressions, not merely implementation structure.
- Appropriate unit/integration checks plus browser verification for UI changes; inspect actual exported drawings for output changes.
- Precision/performance impact reported with evidence relevant to the change. No unsupported claims of parity or speed.
- Registered, transport-tested agent coverage for new/changed domain operations under [AGENTIC-CORE.md](AGENTIC-CORE.md), with live/headless/package state and gaps explicit.
- One reviewable feature branch/PR, concise handoff, documented limitations and updated roadmap status after integration.
- User-facing workflow and labels explain design choices without exposing implementation internals.

## Deferred unless the user changes priorities

Full commercial MEP/analysis, enterprise cloud collaboration, fabrication systems, advanced worksharing/phasing/design options, general freeform/NURBS modeling, broad proprietary-file compatibility, structural/code-compliance automation, photoreal rendering upgrades and a full Rust rewrite. Existing capabilities may remain; they are not priority expansion targets.

## Planning decisions still open

The PM should collect these as they become blockers, rather than stopping the whole project for a questionnaire: representative residential projects and deliverable standards; target hardware/project size; initial delivery platform; required stair/foundation/framing cases; preferred roof editing gestures; component editor integration choice; material-library ownership/import policy; and release name. Until clarified, use the local browser development workflow, imperial-friendly entry with millimetre internal geometry, and the existing IFC/project model.

## Status ledger

Keep this small and factual. Detailed scope lives in the feature cards; implementation discussion stays with the feature chat/PR.

| Item | State | Evidence / next action |
|---|---|---|
| Prototype, F01–F04 and F06 | Integrated for their accepted scope | Historical prototype record and current adopted evidence in [PROJECT-STATUS.md](PROJECT-STATUS.md) |
| F05 | Partial: straight-wall section/elevation slice integrated | Broader scope and PERF-F05-01 stay open |
| F08 | Partial: bounded straight-wall join slice and semantic tools integrated | PR #13, application baseline `0329eec`; F08-PM-01/02 closed, broader geometry deferred |
| F28 | Partial: A/B integrated; C separate draft | PR #12 needs its own MCP/current-main reconciliation and review gates; established layout default/fallback |
| MCP-01 | Adopted | PR #16, merge `21ff284`; broader MCP parity remains catch-up work |
| F07, F09, F10–F26 | Planned | Follow prerequisites and current user priorities; no implicit dispatch |
| F27 | Deferred | Capture-to-parametric BIM discovery retained for future planning |

Snapshot date: October 27, 2026. Reverify remote main/PR heads before dispatch. Detailed acceptance and open follow-ups remain in the current snapshot and feature handoffs.

Allowed states: proposed, ready, in progress, blocked (with concrete blocker), review, integrated, validated. A feature may be implemented without yet being integrated or validated in the reference project.
