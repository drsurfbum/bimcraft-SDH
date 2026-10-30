# F08-B — Layered wall joins and familiar join controls

**Status: planned next F08 slice; Revit behavior discovery required.** User feedback recorded October 28, 2026 while testing the Join Lab. No implementation or owner dispatch is started by this planning entry. F08-A remains integrated and accepted for its bounded scope; full F08 remains partial.

## Desired result

At a supported wall intersection, control how structural cores meet and how finish/substrate layers continue around or terminate at the junction. The user's Revit screenshot shows the desired core-butt/finish-continuity outcome. Provide discoverable, contextual access to butt/miter configuration, which wall continues, and allow/disallow automatic joining, with a clear preview and cancel path.

The source screenshot is retained privately. Its exact wall assemblies, join state and control identity are not fully recoverable from the image alone. Confirm them during the native Revit walkthrough instead of assuming all behavior comes from one indicator.

## Revit reference distinctions

1. **Join configuration and order:** Revit offers Butt, Miter and Square Off, with next/previous configurations for eligible individual butt/square-off joins. Supported configurations depend on the junction. In particular, a wall ending in another wall's interior has restrictions; do not promise every option at every T. [Autodesk 2027 configuration reference](https://help.autodesk.com/cloudhelp/2027/ENU/Revit-ArchDesign/files/GUID-19EAF7A9-331F-4271-94CC-43B76B13011E.htm).
2. **Layer continuity:** core membership, priority and material identity influence which layers connect, pass through or retain a seam. Current Revit supports explicit priority independently from the layer function; capture the source version and settings. [Autodesk 2027 layer function and priority](https://help.autodesk.com/cloudhelp/2027/ENU/Revit-Model/files/GUID-1CCD1005-CBDA-4338-8D60-489095D4BB25.htm), [2026 priority change](https://help.autodesk.com/cloudhelp/2026/ENU/Revit-WhatsNew/files/GUID-50F25D06-C5CD-42B9-A766-CAABD3F2FA91.htm).
3. **Automatic join permission versus display cleanup:** disallowing a wall end from joining and displaying the ends of an otherwise joined configuration are distinct settings. Preserve that distinction in both data and UI. [Autodesk 2027 cleanup/permission reference](https://help.autodesk.com/cloudhelp/2027/ENU/Revit-ArchDesign/files/GUID-130A65BC-8C57-4C31-8C07-F96041771539.htm).
4. **Local controls:** Revit exposes wall-end allow/disallow controls in the canvas and join configuration through the selected-join/contextual workflow. Investigate the user's desired interaction before finalizing the BimCraft handle/menu arrangement. [In-canvas join control](https://help.autodesk.com/cloudhelp/2025/ENU/Revit-WhatsNew/files/GUID-0489005A-5724-4933-8894-5FCABA00A0EB.htm), [2026 contextual ribbon relocation](https://help.autodesk.com/cloudhelp/2026/ENU/Revit-WhatsNew/files/GUID-C029A36A-4F54-4B95-9B04-3280FCC4F15C.htm).
5. **Wrapping at free ends/inserts:** these are separate compound-wall settings involving eligible layers and wall/insert closure rules. Do not equate corner layer cleanup with all end-cap and door/window wrapping. Retain openings/free-end wrapping as an independently bounded follow-up. [Autodesk 2025 wrapping reference](https://help.autodesk.com/cloudhelp/2025/ENU/Revit-Model/files/GUID-69B6DC75-56A9-4F35-BE24-80048360E2BB.htm).

## Current BimCraft boundary

The reviewed application already has deterministic bounded straight L/T/selected endpoint-X cleanup, preserved core/reference anchors, protected join records, and per-end allow plus envelope/square-cap settings. Existing MCP tools are `wall_joins_get`, `wall_join_end_set` and `wall_join_diagnostics`.

Its v1 join record accepts `allow`, `cap`, node and T-host identities, not arbitrary butt/miter/order or wrapping fields. Its square end cap must not be advertised as equivalent to Revit's complete joined Square Off behavior. Audit recipe/priority representation and actual physical/layer geometry before choosing the extension. Additional semantics need reversible versioning/migration and safe preservation/refusal of unsupported/corrupt records.

## Proposed bounded proof, after discovery

Start with two straight, vertical walls at a 90-degree L: equal and unequal widths/types, reversed drawing directions/exterior sides, same and different materials. Capture the user's preferred core-butt/finish-continuity example; compare butt configurations/order, miter and auto-join disabled where valid. Inventory Square Off and display-cleanup behavior; agree their inclusion before committing scope. Reuse existing supported T/X cases as retained controls; expand their new mode coverage only with explicit rules and proof.

For each eligible configuration show exactly which wall/layers continue, which terminate, and how the core and finishes meet. Test an exterior-to-interior junction separately from an exterior corner. Treat membranes and cavities according to their stored semantics; no zero-thickness solids or invented cavity materials. Keep curved, unequal-height, multi-floor and other unresolved junctions honestly bounded.

## Acceptance principles

- Contextual join selection/preview/control with explicit cancel and accurate availability; retain selection, document/revision and busy-state guards.
- Stable core/location-line and persistent dimension references. Orientation/type/hosted opening identities survive supported edits, Undo/Redo and save/reopen.
- Consistent authoritative geometry and layer boundaries in IFC Body/Axis, plan/detail, sections and vector exports; display cleanup must have an explicitly documented relationship to physical geometry.
- No unintended gaps, double solids or ambiguous material ownership in supported cases; independent actual-output checks at the existing fixture precision contract, with serialization bounds distinguished from topology tolerances.
- Deterministic results across input ordering/regeneration and unrelated changes; atomic refusals and non-destructive fallback for unsupported cases.
- Meaningful registered MCP operations for reading/editing the new semantics with real live/source/package workflows, permissions, document/revision guards, protected raw/aliased records and honest owned-commit/Undo receipts. Extend authoritative operations rather than add a separate implementation.

## Ownership and test plan

F08 owns join/domain/layer semantics. Coordinate controls with F09's input/context framework and F28's shared workspace adapter; do not edit or import their unpublished owner work. F02 owns precision/reference/migration contracts; retain F04/F05/F06 drawing/export behavior. F29 can reuse supported results later and does not imply framing junctions are solved by this slice.

Use Test Lab v1 Join Lab stations 08–15 for current comparisons and keep that master unchanged. Capture the Revit example and desired join-mode outcomes as new fixtures in a versioned extension. The comparison matrix should record the exact assemblies/core boundaries/materials/priorities, join type/order, permission/cleanup settings, before/after controls and eligible/disabled options. Add end/opening wrapping as separate cases when that scope is agreed.

Existing performance, test-isolation, MEP, narrow-window and broader MCP follow-ups stay open. No feature merge, deployment, baseline change or full-F08 completion is implied.

## October 30 audit reconciliation

The completed 25-row Revit comparison is reconciled in the [project-state report](https://drsurfbum.github.io/bimcraft-SDH/state/2026-10-30/). Native Revit execution remains unverified. F09-A is now adopted at main75af; C remains separate at aa75 with five conflicts and eventual fourteen-workflow combined acceptance.

Add F08-B0 as the explicit synthetic native-evidence step. The first solver slice remains an equal-height 90-degree L with agreed material/priority/core ownership, eligible modes and actual output/MCP equivalence. Keep the fifteen proposed evidence-fixture groups from the audit; do not infer Square Off, display cleanup or insert wrapping from a square cap.

Repair the newly verified AUD-DEF-01 / [F09-B history form issue](F09-B-JOIN-HISTORY-REPAIR.md) before expanding joins. The current-main native replay confirms that an opposite-end cap edit can overwrite a disallowed end after Undo/Redo. This new repair does not reopen accepted F08-PM-01/02 semantic findings.
