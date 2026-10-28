# F28-C migrated actions and existing-tool checklist

The reviewed 116-entry inventory remains in `COMMANDS.md` / `catalog.js`; its 31 unmapped and nine uncertain entries remain unavailable. F09/F24 remain audits, not delivery promises. This checklist also covers established actions omitted from the drawing reference.

| Area | Live entry / established route | Boundary |
| --- | --- | --- |
| Open, Save IFC, Undo/Redo, select/clear, plan/3D | Existing shared adapter, quick access and shortcuts | Original authoritative operations and validation. |
| Straight Wall / Edit Type / Structure | Architecture and contextual wall ribbon; real Properties | F28-B preserved. Instance clipboard, Mirror/Align and curved live placement stay unavailable. |
| Floor plan / RCP / callout | Project Browser select for Properties, Enter/double-click to open; source-key drawing tabs | Canvas retained, separate transient cameras; template and RCP rules retained. |
| Section line | View → Section; native numeric entry; selected annotation Properties | Existing two-point line and look/depth/name, no new constraints. |
| Sections / cardinal elevations | Project Browser → Enter/double-click; View settings; bottom detail/scale | Existing bounded F05 source and vector composition. Unsupported cuts retain diagnostics/envelope fallback. |
| Detail line / Filled region / wall-reference dimensions | Annotate; native options and numeric entry; supported annotation Properties | Existing plan/RCP/callout view ownership; projected views have only their existing automatic notes. Text/leader expansion remains unavailable. |
| Sheets and source placement | View → New Sheet, Place View; saved sheet tab → Edit sheet | Native sheet dialog, drag/scale/remove/save/delete; real source IDs and explicit F06 continuation references. |
| Assembly schedules / project material legend | View and Project Browser; native schedule controls | Nominal mm, unused definitions, stable IDs/order/core/cavity/membrane metadata; no quantity takeoff. |
| CSV / vector PDF | Native schedule CSV, File menu and bottom PDF | Existing writers. Schedule PDF includes every existing continuation; custom sheets require explicit placements. |
| Drawing set | View → Drawing set or File | Existing automatic set and PDF; no new pagination or placement engine. |
| View templates / visibility/crop/underlay | View → Templates / Visibility, View range; Project Browser editors | Existing native dialogs and transactions; controlled fields remain protected. |
| Project materials | Manage → Materials | Existing authoritative material dialog; no library redesign. |
| Library, item placement/swap/update/attribution | Existing tools → Library → Established layout | Requires configured service; file library controls and genuine service errors retained. |
| Linked models / federation / compare | Existing tools → Links / Files → Established layout | Existing add/load/reload/unload/transforms/host selection. No detached panel takeover. |
| File/folder/new/recent/import/bundle/other exports | File → Existing tools → Files → Established layout | Existing host adapters and file semantics. |
| Recovery | Existing shell startup/recovery workflow; Existing tools explains route | Normal autosave/recovery remains active; independent fixtures use clean storage, legitimate recovery tested separately. |
| Other model creation, roof/site/MEP/families, existing Modify | Existing tools → Modeling and Modify → Established layout | Existing category-specific restrictions retained. Module presence does not authorize an unavailable ribbon tool. |
| Properties beyond migrated scope | Existing tools → Properties → Established layout | Native controls retained and restored. |
| Color/paint, issues, assets, field points, analysis/daylight, scan/trace, links | Existing tools → named panel / Modeling → Established layout | Current supported extent only; external dependencies and uncertain ribbon mappings remain honest. |
| Find, model tree, checks/clashes, measure, hide/isolate, quantity totals, takeoff and 4D | Existing tools → Established layout → existing Files/Model/Properties and viewer controls | Existing extension and category limits remain. F06 assembly documentation does not become quantity takeoff. |
| Walkthrough, section plane, saved camera views, render/VR, DWG/cloud/equipment views | Existing tools → Established layout → existing viewer and file controls | Retained original renderers and host routes; no new live drawing mapping or detached-window takeover. |
| Help/Settings, units, keyboard help, add-ons, docking/pop-outs, live collaboration | Existing tools → Help, Settings and panels → Established layout | Shared app bar and panel manager; no panel/window stealing. Default-layout switch and full usability/translation coverage belong to F28-D. |

[F28-C-ACTION-INDEX.json](F28-C-ACTION-INDEX.json) is a conservative source-level inventory across both startup markup, settings, delegated application actions and mounted UI extensions. It includes related field/container hooks as well as action selectors; selector existence is not an implementation or verification claim. Each occurrence records its source/line and literal values where present. All have an explicit established route; bounded live exceptions are listed above. The index is broader than the mockup inventory and is not a replacement for state-dependent availability.

The final index covers **41 sources, 2,182 occurrences and 944 distinct hooks**. Rebuild it with `python3 tests/features/f28/action-index.py`. Shared shell Help, Settings and autosave are included. Reading this index does not claim that every retained external service or platform route was exercised.

F28C-PM-01: source-specific view Properties controls use the source ID and editor actually displayed by the palette. They remain unavailable, with an accessible explanation, until that source is active. Browser selection alone never activates a drawing. Ribbon, File and bottom controls retain their active-drawing target. See [fix details and regression coverage](F28-C-PM-01.md).
