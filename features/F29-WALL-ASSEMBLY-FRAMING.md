# F29 3D wall assemblies and framing coordination

**State: planned epic, discovery required.** Added October 28, 2026 from the user-supplied wall assembly and framing design brief. No implementation, owner, schedule, preview or feature merge is authorized by this roadmap entry. The original DOCX is retained privately and unchanged; this is the public planning interpretation, not a claim of delivered behavior. Existing F28-C and F09 work keeps its ownership and scope.

## User outcome

Sketch a complete wall in 3D, reveal its construction and use modeled studs and clear bays to position outlets and shower niches. Editing the wall or its opening should update associated framing and hosted objects predictably, or identify a conflict requiring review. Finished, core and framing views refer to the same logical wall; there is no separate presentation model to maintain.

The smallest proposed proof is **one straight vertical timber wall, one rectangular door or window opening, generated framing, one outlet and one niche**. Prove drawing, reveal/navigation, editing, Undo/Redo and save/reopen on that scene before broadening the supported construction system. This proof is still several coordinated implementation steps, not a request to give one chat the entire epic.

## Proposed delivery sequence

| Stage | Scope and exit condition |
| --- | --- |
| F29 discovery | Audit existing framing, wall/assembly/opening/host operations and accepted input/MCP contracts. Agree supported contexts, identities/persistence, owner boundaries, envelope assumptions, fixture, reference machine and measured performance targets. Produce the bounded implementation brief before assigning code work. |
| F29 bounded wall proof | One timber wall and rectangular opening; configurable representative member layout and usable bays; direct 3D sketch preview; one outlet and one niche with explicit placement intent and conflict feedback. Manual/agent equivalence, transaction safety and saved round trips demonstrated. |
| F29 hardening | Deliberately expand supported joins, manual overrides/locks, assembly transitions, regeneration conflict resolution, scoped review invalidation and realistic project performance. Complete review/field-record workflows and supported construction variants only with their own evidence. |
| Broader assemblies | Foundations, floors/joists, stairs and roofs remain separately scoped future work. Animated/exploded reveals and presentation transitions come after basic visibility/model integrity. These are not implied proof commitments. |

A proposed implementation order within the bounded proof is host-derived members and bays, then 3D authoring through shared input contracts, then outlet/niche coordination and a complete edit/Undo/reopen demonstration. Discovery may refine that order. No new release date or M0–M3 blocking gate is assigned here.

## First proof behavior

- Choose the assembly, level/reference plane, base elevation, height and alignment/location reference. Click start/end points in 3D; show full-height thickness, exterior direction and live length. Reuse typed dimensions and agreed F09 targeting. Finish/continue/undo-last-point/cancel have explicit behavior; cancel removes only uncommitted preview.
- Keep layers, core, orientation and openings on one logical wall. Use explicit framing assumptions: member sizes, spacing, origin, plate configuration and supported opening rules. An unchanged input produces the same layout; members and clear bays are inspectable, with dimensions accounting for actual member thickness.
- Associate an outlet with an explicit elevation/horizontal reference and optional stud-side relationship. Show box and declared clearance envelopes. Distinguish attachment beside a stud from geometric intersection with a stud, plate, header or blocking; attribute editable clearance assumptions to a product/project source.
- Fit a niche by clear width, height and depth, including rough-opening, lining and build-up allowances. Identify intersected members and require an explicit framing-change decision. Never silently remove/cut a stud or represent a partial-depth recess as an ordinary through-opening without an agreed model contract.
- Preserve semantic placement intent such as beside a stud, centered in a bay or a distance from the wall end. If an opening moves or a bay disappears/splits, preserve valid intent or show a resolvable conflict. Do not silently recycle an old bay ID for a different meaning.
- Reveal finished/core/framing representations and support inspection/orbit/walkthrough of the same scene. Visibility changes do not delete layers, remove members from the assembly definition or create an independent display copy.
- Unsupported geometry/construction must be visibly excluded or refused safely. An unsupported framing result cannot be displayed as current valid framing after a host edit. The authoritative wall and saved records remain intact.

## Reuse and ownership

Source inspection already finds framing generation, IFC member/beam assemblies, host synchronization, kept-piece records and reveal controls in the accepted code. In particular, `app/res-framing.js` exposes wall framing, framed-host operations and synchronization, while `app/help/framing.md` describes Show framing/See through and kept pieces. This is an implementation inventory lead, not fresh functional acceptance of every case or evidence that stable bay/outlet/niche contracts already exist. Discovery starts by verifying and extending these paths, not replacing them.

| Related feature/system | Boundary for F29 |
| --- | --- |
| Existing framing and F24 structure audit | Audit/reuse current wall members, host association, synchronization, kept-piece behavior and actual IFC output. Feed the focused findings into F24 instead of starting a competing whole-house framing audit. |
| F02 precision/references/migration | Reuse units, stable named references, version diagnostics, unsupported-record preservation and transaction/round-trip rules. Decide persisted versus derived member/bay identities and safe migration before adding records. |
| F08 joins | Reuse authoritative wall/opening geometry. A supported wall-body L/T/X join does not automatically certify a framed-member junction or a usable bay; initial framing may exclude these contexts. |
| F09 input | F09 owns keyboard, contextual actions, shared snapping and targeting. Agree extension points and 3D work-plane/coordinate contracts; do not fork its input engine or edit its working checkout. F09-A is currently draft/incomplete, not an accepted dependency. |
| F15 hosting/openings | Audit the accepted door/window host relationships needed by the proof; define outlet/niche envelopes and associations explicitly. The full broad F15 epic is not an automatic prerequisite to discovery. |
| F04/F05/F06 and F28 | Keep drawing/view/Properties and shared command behavior coherent. Coordinate future UI wiring with the existing owners, including separate F28-C. Basic construction visibility is not a second modeling implementation. |
| F07 libraries | Reuse material/assembly identities and future package conflict/version rules. Do not introduce a separate construction-material library. |
| F21 quantities | Gross/net/material/member quantity semantics remain with F21. Do not turn the proof into automatic quantities/fabrication work or remove existing quantity tools. |
| F03 and agentic core | Measure preview, regeneration and navigation on an agreed fixture/machine. Reuse authoritative operations for UI and MCP; prove real transports and independent outputs. |

F02/F03 and existing wall/assembly operations are foundational inputs. F09 interaction contracts and the focused framing/host audit must be agreed before dependent implementation. Discovery can proceed as planning without waiting for completion of every related epic; coding/integration order is a separate PM decision against the then-approved main.

## Model contracts to settle in discovery

**Host and identities.** The wall is authoritative; framing is derived from assembly, geometry, openings and explicit rules. Preserve member/bay IDs where their meaning remains valid. Define disappearance, splitting, replacement, orphan resolution and file-version behavior. Audit how current framing recognizes stud layers and custom assemblies; do not infer construction solely from an arbitrary material name or silently substitute another core.

**Overrides and assembly changes.** Store manual stud moves, added blocking and locks as explicit intent. Compatible overrides survive regeneration; incompatible ones are identified before they can be discarded. Unsupported override editing can be deferred, but existing kept/reviewed work must not be erased. Hardening adds supported timber/masonry transitions with a preview of invalidated relationships. A masonry assembly cannot retain hidden timber framing unless explicitly modeled that way. The first proof need not provide a procedural solver for every core type.

**Confidence and review.** Generated design, reviewed design and field verified are proposed scoped states. Record subject/scope, reviewer, date and relevant revision; invalidate affected reviews after relevant edits. Basic proof output is labelled generated design. Field-verified status requires an explicit record and is never inferred from a successful geometry check. One reviewed outlet/niche does not validate a whole wall/project.

**Transactions and persistence.** Manual and agent commands use the same validators and operations. Meaningful edits coherently restore host, members, placements, overrides and conflict/review state under Undo/Redo and save/reopen. Preview/read operations do not author IFC. Keep current document/revision and history-ownership guards; report confirmed progress honestly after interruption and never roll back a person's interleaved edits automatically.

**MCP and inspection.** Map framing/rules, members/bays, placements, conflicts/overrides and review operations to meaningful registered APIs as implemented. Return exact units, stable IDs, supported-context diagnostics and actual changes. Test discovery/calls over live HTTP, source stdio and isolated packaging, with permissions, stale/foreign documents and independent actual IFC/output checks. Repository support, packaging and a persistent user-client connection remain distinct states.

**Performance.** Separate lightweight preview from committed regeneration, rebuild affected hosts where practical, and prevent stale async results from replacing newer revisions. Select numerical targets from measurements before expanding scope; no new FPS/latency promise is assigned by this brief.

## Proposed acceptance gates

| Gate from the source brief | Phase and evidence |
| --- | --- |
| Draw and cancel | Bounded proof: correct 3D plane/elevation, height, thickness, orientation and length; one committed host, no canceled residue; shared numeric/input behavior preserved. |
| Generate and repeat | Bounded proof: inspect members/clear bays; unchanged inputs reproduce layout and valid identities without duplicates. |
| Edit host/opening | Bounded proof: length/height and opening move/resize update affected framing and placements or produce explicit conflicts; no stale/orphaned geometry. |
| Check outlet | Bounded proof: valid stud-side placement and deliberate collisions distinguished; identify the member/envelope and stated assumption. |
| Check niche | Bounded proof: width/height/depth fit and oversized/colliding cases demonstrated; no automatic stud removal. Reframing remains explicit. |
| Preserve overrides | Proof must preserve existing supported kept adjustments or explicitly refuse an incompatible operation. Hardening completes richer moves/blocking/locks and user conflict resolution. |
| Handle joins | Proof refuses or clearly excludes unsupported framing junctions. Hardening certifies individual corner/T cases before enabling them. |
| Switch assembly | Proof safely refuses unsupported conversions without partial writes. Hardening proves supported transitions and previews lost relationships/overrides. |
| Reveal and tour | Bounded proof: finished/core/framing views share the same host/opening; visibility is nondestructive and agreed-fixture navigation remains usable. |
| Undo and reopen | Bounded proof: actual saved IFC and repeated Undo/Redo retain relationships, rules, placements and conflict states; independent geometry/identity inspection. |
| Match AI behavior | Bounded proof: equivalent manual and actual MCP operations produce equivalent semantic results and safe refusals. No AI-only bypass. |
| Invalidate review | Proof makes no automatic reviewed/field-verified claim. Hardening demonstrates scoped review records becoming stale after relevant edits. |

These are proposed gates to refine before implementation, not passing results. Use real hosted relationships in the saved test scene, not only a visually convincing render or unchanged object-ID count. Retain appropriate existing precision bounds and verify affected outputs independently. Do not count unavailable checks as passes or relax fixtures/tolerances to obtain green CI.

## Scope exclusions and decisions

Initial exclusions: engineered sizing, code/electrical compliance certification, fabrication output, automatic quantities, full MEP routing, universal construction rules, complex junctions, curves/sloped/stacked walls, complex openings and every assembly solver. Broader building systems and advanced animated/exploded reveals are later scoped work. Existing supported behavior remains available; these exclusions do not authorize its removal.

Before dispatch, decide the assembly/framing rule interface; member/bay ID and persistence/migration model; supported opening and niche representation; envelope/clearance sources; override/conflict UI; review-state scope; F09/F28/shared-file ownership; and reference fixture/machine/targets. The discovery output names an owner and integration plan only when assigned by PM. The demonstration reels described in the source brief are inspiration, not acceptance evidence or a source of proprietary code/assets.

No implementation, new chat, owner message, merge, app deployment or change to current F09/F28-C work follows automatically from adding this epic. [Return to the feature roadmap](https://drsurfbum.github.io/bimcraft-SDH/).

## October 30 evidence reconciliation

The Revit comparison audit generated 73 real framing parts on one synthetic house wall, retained through Undo/Redo and save/reopen. Existing framing is a concrete starting point. F29-A therefore inventories and extends assembly/bay/device/niche coordination; it is not the first framing implementation. This proof does not establish engineered sizing, field accuracy or all junction/override cases. Discovery and exact supported semantics remain unassigned and unimplemented.
