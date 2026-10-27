/* SPDX-License-Identifier: Apache-2.0 */
// Reviewed visual configuration and scope evidence: F28-draft-2026-10-23.
// Availability is evaluated only by availability.js and commands.js. No delivery dates.
export const reviewCatalog = {
  "tools": {
    "select": {
      "key": "select",
      "name": "Modify",
      "status": "implemented",
      "feature": null,
      "scope": "Select and inspect model elements.",
      "evidence": "app/model-ui.js; app/ui.inc [data-mtool=\"select\"]",
      "icon": "pointer"
    },
    "open": {
      "key": "open",
      "name": "Open",
      "status": "implemented",
      "feature": null,
      "scope": "Open an existing IFC through the application reader.",
      "evidence": "devshell/index.html [data-pick-file] and app/bimcraft.js",
      "icon": "folder"
    },
    "save": {
      "key": "save",
      "name": "Save as IFC",
      "status": "implemented",
      "feature": null,
      "scope": "Save the actual edited IFC through Save as / download; the original is untouched.",
      "evidence": "devshell/index.html [data-save]",
      "icon": "save"
    },
    "undo": {
      "key": "undo",
      "name": "Undo",
      "status": "implemented",
      "feature": null,
      "scope": "Undo existing editor transactions.",
      "evidence": "app/ifc-edit.js; devshell/index.html [data-undo]",
      "icon": "undo"
    },
    "redo": {
      "key": "redo",
      "name": "Redo",
      "status": "implemented",
      "feature": null,
      "scope": "Redo existing editor transactions.",
      "evidence": "app/ifc-edit.js; app/ui.inc [data-act=\"redo\"]",
      "icon": "redo"
    },
    "pdf": {
      "key": "pdf",
      "name": "Export PDF",
      "status": "implemented",
      "feature": null,
      "scope": "Existing plan and sheet vector PDF export. Not wired in F28-A.",
      "evidence": "app/model-pdf.js; app/res-sheets.js; F04-HANDOFF.md",
      "icon": "sheet"
    },
    "wall": {
      "key": "wall",
      "name": "Wall",
      "status": "partial",
      "feature": "F02",
      "scope": "Authored basic walls and six location-line modes. Curtain walls are separate and unavailable.",
      "evidence": "app/ui.inc [data-mtool]; app/model-ui.js",
      "icon": "wall"
    },
    "door": {
      "key": "door",
      "name": "Door",
      "status": "partial",
      "feature": "F15",
      "scope": "Existing hosted door placement. Broader host/type reliability is future F15.",
      "evidence": "app/ui.inc [data-mtool]; app/model-ui.js",
      "icon": "door"
    },
    "window": {
      "key": "window",
      "name": "Window",
      "status": "partial",
      "feature": "F17",
      "scope": "Existing hosted window placement. F17 end-to-end parametric window is future work.",
      "evidence": "app/ui.inc [data-mtool]; app/model-ui.js",
      "icon": "window"
    },
    "floor": {
      "key": "floor",
      "name": "Floor",
      "status": "implemented",
      "feature": null,
      "scope": "Existing slab / polygon floor workflow; residential coverage audit is future F24.",
      "evidence": "app/ui.inc [data-mtool]; app/model-ui.js",
      "icon": "floor"
    },
    "ceiling": {
      "key": "ceiling",
      "name": "Ceiling",
      "status": "implemented",
      "feature": null,
      "scope": "Existing ceiling creation and reflected ceiling plan.",
      "evidence": "app/ui.inc [data-mtool]; app/model-ui.js",
      "icon": "floor"
    },
    "roof": {
      "key": "roof",
      "name": "Roof",
      "status": "partial",
      "feature": "F10",
      "scope": "Existing automatic roofs and manual planes. Persistent multi-plane joins are future F12.",
      "evidence": "app/ui.inc [data-mtool]; app/model-ui.js",
      "icon": "roof"
    },
    "column": {
      "key": "column",
      "name": "Column",
      "status": "implemented",
      "feature": null,
      "scope": "Existing column placement; structural coverage audit is future F24.",
      "evidence": "app/ui.inc [data-mtool]; app/model-ui.js",
      "icon": "column"
    },
    "component": {
      "key": "component",
      "name": "Component",
      "status": "partial",
      "feature": "F18",
      "scope": "Place existing library/family items. Reviewed version-update behavior is future F18.",
      "evidence": "app/family-ui.js; app/library-view.js",
      "icon": "component"
    },
    "stair": {
      "key": "stair",
      "name": "Stair",
      "status": "implemented",
      "feature": null,
      "scope": "Straight, L, U, winders and spiral exist. F24 is a future coverage audit.",
      "evidence": "app/res-stair.js; app/res-ui.js",
      "icon": "stair"
    },
    "ramp": {
      "key": "ramp",
      "name": "Ramp",
      "status": "implemented",
      "feature": null,
      "scope": "Existing drawn ramp tool.",
      "evidence": "app/model-floors-ui.js; app/model-ramps.js",
      "icon": "ramp"
    },
    "railing": {
      "key": "railing",
      "name": "Railing",
      "status": "implemented",
      "feature": null,
      "scope": "Existing path-based guard/handrail.",
      "evidence": "app/res-railing.js; app/res-ui.js",
      "icon": "railing"
    },
    "foundation": {
      "key": "foundation",
      "name": "Foundation",
      "status": "implemented",
      "feature": null,
      "scope": "Slab, stem-wall, crawlspace and basement tools exist.",
      "evidence": "app/res-foundation.js; app/res-ui.js",
      "icon": "floor"
    },
    "framing": {
      "key": "framing",
      "name": "Framing",
      "status": "implemented",
      "feature": null,
      "scope": "Existing wall/floor/roof framing tools.",
      "evidence": "app/res-framing.js; app/res-ui.js",
      "icon": "grid"
    },
    "grid": {
      "key": "grid",
      "name": "Grid",
      "status": "implemented",
      "feature": null,
      "scope": "Existing grid drawing.",
      "evidence": "app/model-grids-ui.js",
      "icon": "grid"
    },
    "level": {
      "key": "level",
      "name": "Level",
      "status": "implemented",
      "feature": null,
      "scope": "Existing level management; not Revit datum parity.",
      "evidence": "app/model-levels.js; app/model-ui.js",
      "icon": "level"
    },
    "room": {
      "key": "room",
      "name": "Room",
      "status": "partial",
      "feature": "F24",
      "scope": "Existing room detection from closed wall loops. Manual Revit Room placement is not established.",
      "evidence": "app/model-rooms.js; app/model-ui.js",
      "icon": "room"
    },
    "curtain": {
      "key": "curtain",
      "name": "Curtain System",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "window"
    },
    "curtaingrid": {
      "key": "curtaingrid",
      "name": "Curtain Grid",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "grid"
    },
    "mullion": {
      "key": "mullion",
      "name": "Mullion",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "column"
    },
    "modeltext": {
      "key": "modeltext",
      "name": "Model Text",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "text"
    },
    "modelgroup": {
      "key": "modelgroup",
      "name": "Model Group",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "component"
    },
    "roomseparator": {
      "key": "roomseparator",
      "name": "Room Separator",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "area": {
      "key": "area",
      "name": "Area",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "room"
    },
    "areaboundary": {
      "key": "areaboundary",
      "name": "Area Boundary",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "tagarea": {
      "key": "tagarea",
      "name": "Tag Area",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "tag"
    },
    "byface": {
      "key": "byface",
      "name": "By Face",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "wall"
    },
    "shaft": {
      "key": "shaft",
      "name": "Shaft",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "floor"
    },
    "wallopening": {
      "key": "wallopening",
      "name": "Wall Opening",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "vertical": {
      "key": "vertical",
      "name": "Vertical Opening",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "workplane": {
      "key": "workplane",
      "name": "Set Work Plane",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "grid"
    },
    "showplane": {
      "key": "showplane",
      "name": "Show Work Plane",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "referenceplane": {
      "key": "referenceplane",
      "name": "Reference Plane",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "level"
    },
    "viewer": {
      "key": "viewer",
      "name": "Work Plane Viewer",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "steel": {
      "key": "steel",
      "name": "Steel Connections",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "column"
    },
    "precast": {
      "key": "precast",
      "name": "Precast Assembly",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "component"
    },
    "fabrication": {
      "key": "fabrication",
      "name": "Fabrication Parts",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "sync": {
      "key": "sync",
      "name": "Synchronize",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "worksets": {
      "key": "worksets",
      "name": "Worksets",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "designoptions": {
      "key": "designoptions",
      "name": "Design Options",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "phases": {
      "key": "phases",
      "name": "Phases",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "addin": {
      "key": "addin",
      "name": "External Tools",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "dynamo": {
      "key": "dynamo",
      "name": "Dynamo",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "insulation": {
      "key": "insulation",
      "name": "Insulation",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "generic"
    },
    "revision": {
      "key": "revision",
      "name": "Revision Cloud",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit scope match in the inspected F01\u2013F27 cards.",
      "icon": "cloud"
    },
    "tagroom": {
      "key": "tagroom",
      "name": "Tag Room",
      "status": "uncertain",
      "feature": "F22",
      "scope": "Existing view notes/room labels exist. A standalone associative Tag Room command has not been verified; F22 audits tags/notes but does not promise this exact tool.",
      "evidence": "app/comforts-views.js; roadmap F22 description",
      "icon": "tag"
    },
    "modelline": {
      "key": "modelline",
      "name": "Model Line",
      "status": "uncertain",
      "feature": "F20",
      "scope": "2D drafting lines exist, but persistent 3D Model Line behavior is not verified. F20 covers detail lines, not necessarily this command.",
      "evidence": "app/drafting.js; roadmap F20 description",
      "icon": "line"
    },
    "dormer": {
      "key": "dormer",
      "name": "Dormer",
      "status": "partial",
      "feature": "F14",
      "scope": "Existing bounded dormer tool. Expanded tested residential roof cases remain future F14.",
      "evidence": "app/res-dormer.js; app/comforts-ui.js",
      "icon": "roof"
    },
    "attach": {
      "key": "attach",
      "name": "Attach Top/Base",
      "status": "planned",
      "feature": "F13",
      "scope": "Roof underside attachment and automatic wall-top updates are future scope.",
      "evidence": "roadmap F13 description",
      "icon": "attach"
    },
    "roofjoin": {
      "key": "roofjoin",
      "name": "Join/Unjoin Roof",
      "status": "planned",
      "feature": "F12",
      "scope": "Persistent ridge/hip/valley relationships are future scope. Existing roofs do not establish this workflow.",
      "evidence": "roadmap F12 description",
      "icon": "join"
    },
    "joingeometry": {
      "key": "joingeometry",
      "name": "Join Geometry",
      "status": "uncertain",
      "feature": "F08",
      "scope": "Existing straight wall L/corner cleanup is bounded. Generic solid Join Geometry has no verified mapping; F08 concerns wall joins only.",
      "evidence": "app/model-trim-ui.js; roadmap F08 description",
      "icon": "join"
    },
    "endjoin": {
      "key": "endjoin",
      "name": "Wall Joins",
      "status": "planned",
      "feature": "F08",
      "scope": "Explicit end caps/disallow-join controls and expanded intersection reliability remain future scope.",
      "evidence": "roadmap F08 description",
      "icon": "join"
    },
    "sweep": {
      "key": "sweep",
      "name": "Wall Sweep",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No wall-sweep scope in F01\u2013F27.",
      "icon": "wall"
    },
    "editprofile": {
      "key": "editprofile",
      "name": "Edit Profile",
      "status": "uncertain",
      "feature": "F09",
      "scope": "Free-form wall-profile editing is not verified. F09 audits common Modify actions, but does not explicitly promise this action.",
      "evidence": "roadmap F09 description; app/model-walls.js",
      "icon": "line"
    },
    "assembly": {
      "key": "assembly",
      "name": "Edit Type",
      "status": "partial",
      "feature": "F02",
      "scope": "Edit project wall assembly: layer order, explicit core, material, cavity and zero-width membrane. Revit-wide type parameter parity is not claimed.",
      "evidence": "app/wall-assemblies-ui.js; app/wall-assemblies.js; F02-CONTRACT.md",
      "icon": "layers"
    },
    "materials": {
      "key": "materials",
      "name": "Materials",
      "status": "implemented",
      "feature": null,
      "scope": "Project material definitions, styles and defaults. Default thickness changes do not resize authored wall layers.",
      "evidence": "app/project-materials-ui.js; app/project-materials.js; F04-HANDOFF.md",
      "icon": "materials"
    },
    "packages": {
      "key": "packages",
      "name": "Import / Export Library",
      "status": "planned",
      "feature": "F07",
      "scope": "Versioned material-and-assembly package transfer and conflict resolution are future scope.",
      "evidence": "roadmap F07 description",
      "icon": "folder"
    },
    "loadfamily": {
      "key": "loadfamily",
      "name": "Load Family",
      "status": "partial",
      "feature": "F18",
      "scope": "Existing local family/library loading; reviewed package/version semantics are future F18. Native .rfa parametric editing is not claimed.",
      "evidence": "app/family-ui.js; app/rvt-reader.js; app/library-view.js",
      "icon": "component"
    },
    "familyeditor": {
      "key": "familyeditor",
      "name": "Family Editor",
      "status": "partial",
      "feature": "F16",
      "scope": "Existing editor and primitives. F16 is an architecture spike; constrained feature history is future F23.",
      "evidence": "app/family-editor.js; app/family-ui.js; roadmap F16/F23",
      "icon": "component"
    },
    "sketch": {
      "key": "sketch",
      "name": "Constrained Sketch",
      "status": "planned",
      "feature": "F23",
      "scope": "Sketch constraints, feature history and failed-feature recovery are future scope.",
      "evidence": "roadmap F23 description",
      "icon": "line"
    },
    "dimension": {
      "key": "dimension",
      "name": "Aligned Dimension",
      "status": "partial",
      "feature": "F02",
      "scope": "Existing bounded wall-reference dimensions in plan; chained/witness-line and broader view references remain future F19.",
      "evidence": "app/wall-dimensions-ui.js; F02-CONTRACT.md; roadmap F19",
      "icon": "dimension"
    },
    "chain": {
      "key": "chain",
      "name": "Chained Dimension",
      "status": "planned",
      "feature": "F19",
      "scope": "Chained plan dimensions and practical witness-line editing are future scope.",
      "evidence": "roadmap F19 description",
      "icon": "dimension"
    },
    "text": {
      "key": "text",
      "name": "Text",
      "status": "partial",
      "feature": "F20",
      "scope": "Existing view-specific notes. Broader text/leader detailing workflow is future F20.",
      "evidence": "app/comforts-views.js; app/drafting-ui.js; roadmap F20",
      "icon": "text"
    },
    "detailline": {
      "key": "detailline",
      "name": "Detail Line",
      "status": "implemented",
      "feature": null,
      "scope": "Existing view-specific 2D drafting lines.",
      "evidence": "app/drafting-ui.js; app/drafting.js",
      "icon": "line"
    },
    "filledregion": {
      "key": "filledregion",
      "name": "Filled Region",
      "status": "implemented",
      "feature": null,
      "scope": "Existing view-specific hatch/filled region.",
      "evidence": "app/drafting-ui.js [dhatch]; app/drafting.js",
      "icon": "hatch"
    },
    "masking": {
      "key": "masking",
      "name": "Masking Region",
      "status": "planned",
      "feature": "F20",
      "scope": "Dedicated masking regions are future detailing scope.",
      "evidence": "roadmap F20 description",
      "icon": "floor"
    },
    "detailcomponent": {
      "key": "detailcomponent",
      "name": "Detail Component",
      "status": "planned",
      "feature": "F20",
      "scope": "Reusable detail components are future detailing scope.",
      "evidence": "roadmap F20 description",
      "icon": "component"
    },
    "tag": {
      "key": "tag",
      "name": "Tag by Category",
      "status": "uncertain",
      "feature": "F22",
      "scope": "Existing projected notes exist; exact standalone category-tag semantics need verification. F22 audits tags/notes, not full Revit tagging parity.",
      "evidence": "app/comforts-views.js; roadmap F22 description",
      "icon": "tag"
    },
    "plan": {
      "key": "plan",
      "name": "Floor Plan",
      "status": "implemented",
      "feature": null,
      "scope": "Level floor plans, view range, crop, underlay and scale exist.",
      "evidence": "app/views-ui.js; app/views-model.js",
      "icon": "plan"
    },
    "rcp": {
      "key": "rcp",
      "name": "Reflected Ceiling Plan",
      "status": "implemented",
      "feature": null,
      "scope": "Existing level reflected ceiling plans with independent range and detail.",
      "evidence": "app/views-ui.js; app/views-model.js",
      "icon": "plan"
    },
    "three": {
      "key": "three",
      "name": "3D View",
      "status": "implemented",
      "feature": null,
      "scope": "Existing model viewer and saved views.",
      "evidence": "app/viewer3d.js; app/views-ui-bim.js",
      "icon": "cube"
    },
    "section": {
      "key": "section",
      "name": "Section",
      "status": "partial",
      "feature": "F05",
      "scope": "Existing projected sections. Layer-aware F05 support is bounded to transverse cuts through authored straight walls, supported openings and axis-aligned views; curved/oblique/end/junction cuts remain outside acceptance.",
      "evidence": "app/wall-section-graphics.js; docs/features/F05-HANDOFF.md",
      "icon": "section"
    },
    "elevation": {
      "key": "elevation",
      "name": "Elevation",
      "status": "partial",
      "feature": "F05",
      "scope": "Existing projected elevations and bounded F05 straight-wall output. No general complex-wall or roof-detail certification.",
      "evidence": "app/res-views.js; app/wall-section-graphics.js; F05-HANDOFF.md",
      "icon": "elevation"
    },
    "callout": {
      "key": "callout",
      "name": "Callout",
      "status": "partial",
      "feature": "F20",
      "scope": "Existing cropped parent-view callouts and sheet placement. Broader detail components/overlays are future F20.",
      "evidence": "app/views-ui.js; app/views-model.js; app/drafting-ui.js",
      "icon": "callout"
    },
    "range": {
      "key": "range",
      "name": "View Range",
      "status": "implemented",
      "feature": null,
      "scope": "Existing cut/top/bottom/depth controls for floor plans; RCP has its own supported range. Visible shortcut is preserved in this design.",
      "evidence": "app/views-ui.js rangeFields/openRange; preview commit 917a90b",
      "icon": "range"
    },
    "detail": {
      "key": "detail",
      "name": "Detail Level",
      "status": "implemented",
      "feature": "F04",
      "scope": "Coarse/Medium/Fine wall plan graphics. Fine adds project cut patterns within the accepted geometry scope.",
      "evidence": "app/wall-plan-graphics.js; app/views-ui.js; F04-HANDOFF.md",
      "icon": "hatch"
    },
    "visibility": {
      "key": "visibility",
      "name": "Visibility/Graphics",
      "status": "partial",
      "feature": null,
      "scope": "Existing category visibility and hidden elements per view. Full Revit graphics override parity is not claimed.",
      "evidence": "app/views-ui.js CATEGORIES/rangeFields",
      "icon": "eye"
    },
    "templates": {
      "key": "templates",
      "name": "View Templates",
      "status": "implemented",
      "feature": null,
      "scope": "Existing named floor-plan settings templates; RCP support differs.",
      "evidence": "app/views-ui.js openTemplate; app/views-model.js",
      "icon": "plan"
    },
    "sheet": {
      "key": "sheet",
      "name": "Sheet",
      "status": "implemented",
      "feature": null,
      "scope": "Existing custom sheet editor: number, title, paper, view placement and PDF. F22 extends coordination and reusable title blocks.",
      "evidence": "app/views-ui.js openSheet/saveSheet; app/views-model.js; app/res-sheets.js",
      "icon": "sheet"
    },
    "placeview": {
      "key": "placeview",
      "name": "Place View",
      "status": "implemented",
      "feature": null,
      "scope": "Existing add-and-drag views on custom sheets, with per-view scale. Not wired in F28-A.",
      "evidence": "app/views-ui.js openSheet/add/drag; app/res-sheets.js composeSheet",
      "icon": "place"
    },
    "schedule": {
      "key": "schedule",
      "name": "Schedules",
      "status": "partial",
      "feature": "F21",
      "scope": "Existing element/door/window/lumber schedules plus integrated F06 assembly schedules and material legends. Material quantity semantics remain future F21.",
      "evidence": "app/model-schedule.js; integrated main@9667b3c app/assembly-schedule.js; roadmap F21",
      "icon": "schedule"
    },
    "assemblyschedule": {
      "key": "assemblyschedule",
      "name": "Assembly Schedule",
      "status": "implemented",
      "feature": "F06",
      "scope": "Integrated F06: all authored wall types, including unused types; exterior-to-interior layers, stable material IDs, cores, cavities and zero membranes. Nominal display uses mm. Imported types without assembly metadata are outside scope. Custom sheets require explicit continuation-page placement. This is documentation, not quantities.",
      "evidence": "Integrated main@9667b3c: app/assembly-schedule.js; app/assembly-schedule-layout.js; app/model-ui.js; reviews/F06-integration-2026-10-22/README.md. Running 8028 preview remains pre-F06.",
      "icon": "schedule"
    },
    "legend": {
      "key": "legend",
      "name": "Material Legend",
      "status": "implemented",
      "feature": "F06",
      "scope": "Integrated F06: project material legend includes unused definitions, resolves names by stable ID, preserves duplicate names with separate IDs, blank cavity symbols and zero-width membrane lines. Custom-sheet continuation placement is manual; no quantity-takeoff claim.",
      "evidence": "Integrated main@9667b3c: app/assembly-schedule.js; app/assembly-schedule-layout.js; app/res-sheets.js; reviews/F06-integration-2026-10-22/README.md. Running 8028 preview remains pre-F06.",
      "icon": "materials"
    },
    "titleblock": {
      "key": "titleblock",
      "name": "Reusable Title Block",
      "status": "planned",
      "feature": "F22",
      "scope": "Reusable title blocks and drawing-set coordination remain future scope. Basic fixed-title-block sheets already exist.",
      "evidence": "roadmap F22 description; app/res-sheets.js",
      "icon": "sheet"
    },
    "tile": {
      "key": "tile",
      "name": "Tile Views",
      "status": "uncertain",
      "feature": null,
      "scope": "Existing split plan/3D view is not arbitrary tiled Revit windows. Exact Tile Views behavior and roadmap mapping need review.",
      "evidence": "app/ui.inc [data-model-mode]; no explicit roadmap promise.",
      "icon": "window"
    },
    "link": {
      "key": "link",
      "name": "Link IFC",
      "status": "implemented",
      "feature": null,
      "scope": "Existing linked-model workflow.",
      "evidence": "app/links-ui.js; app/model-links.js; app/ui.inc [data-link-add]",
      "icon": "link"
    },
    "cad": {
      "key": "cad",
      "name": "Import CAD",
      "status": "implemented",
      "feature": null,
      "scope": "Existing DXF/DWG drawing import and trace workflows; not every proprietary version or object.",
      "evidence": "app/dwg-view.js; app/model-trace-ui.js; app/dxf-model.js",
      "icon": "sheet"
    },
    "image": {
      "key": "image",
      "name": "Image",
      "status": "uncertain",
      "feature": null,
      "scope": "Raster/map assets exist, but exact Insert Image placement in a model view is not verified. No explicit roadmap mapping.",
      "evidence": "app/raster.js; app/maplayers.js",
      "icon": "image"
    },
    "terrain": {
      "key": "terrain",
      "name": "Toposolid",
      "status": "partial",
      "feature": null,
      "scope": "BimCraft terrain/TIN, pads and paving exist. Revit Toposolid editing parity is not claimed.",
      "evidence": "app/res-terrain.js; app/res-ui.js",
      "icon": "terrain"
    },
    "massing": {
      "key": "massing",
      "name": "In-Place Mass",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit massing workflow in F01\u2013F27.",
      "icon": "cube"
    },
    "electrical": {
      "key": "electrical",
      "name": "Electrical Devices",
      "status": "implemented",
      "feature": null,
      "scope": "Existing outlets, switches, lights and device/circuit schedules.",
      "evidence": "app/res-elec.js; app/res-ui.js",
      "icon": "electrical"
    },
    "pipe": {
      "key": "pipe",
      "name": "Pipe",
      "status": "implemented",
      "feature": null,
      "scope": "Existing bounded pipe placement; not full MEP design certification.",
      "evidence": "app/mep-ui.js; app/mep-model.js",
      "icon": "line"
    },
    "duct": {
      "key": "duct",
      "name": "Duct",
      "status": "implemented",
      "feature": null,
      "scope": "Existing bounded duct placement; not full MEP design certification.",
      "evidence": "app/mep-ui.js; app/mep-model.js",
      "icon": "wall"
    },
    "analysis": {
      "key": "analysis",
      "name": "Structural Analysis",
      "status": "uncertain",
      "feature": null,
      "scope": "Analysis module exists, but supported solver and Revit-equivalent workflow were not verified for this mockup. Do not infer availability from the module name.",
      "evidence": "app/analysis-bim.js; no verified feature match.",
      "icon": "grid"
    },
    "daylight": {
      "key": "daylight",
      "name": "Daylight Analysis",
      "status": "uncertain",
      "feature": null,
      "scope": "Daylight module exists; exact analysis command and supported scope remain unverified. No explicit roadmap match.",
      "evidence": "app/daylight-bim.js; no verified feature match.",
      "icon": "sun"
    },
    "clash": {
      "key": "clash",
      "name": "Interference Check",
      "status": "partial",
      "feature": null,
      "scope": "Existing clash detection UI; no guarantee of Revit rule/filter parity.",
      "evidence": "app/clash.js; app/bimcraft.js",
      "icon": "join"
    },
    "checks": {
      "key": "checks",
      "name": "Model Checks",
      "status": "implemented",
      "feature": null,
      "scope": "Existing IFC checks panel; not automated permit/code certification.",
      "evidence": "app/ifc-checks.js; app/bimcraft.js",
      "icon": "check"
    },
    "units": {
      "key": "units",
      "name": "Project Units",
      "status": "implemented",
      "feature": null,
      "scope": "Existing units and formatted numeric entry.",
      "evidence": "app/model-units.js; app/model-ui.js",
      "icon": "dimension"
    },
    "takeoff": {
      "key": "takeoff",
      "name": "Takeoff",
      "status": "partial",
      "feature": "F21",
      "scope": "Existing model quantities and TakeoffCraft handoff. Solid/cavity/membrane material quantity semantics remain future F21.",
      "evidence": "app/res-takeoff.js; roadmap F21 description",
      "icon": "schedule"
    },
    "materialqty": {
      "key": "materialqty",
      "name": "Material Takeoff",
      "status": "planned",
      "feature": "F21",
      "scope": "Audited gross/net material areas and volumes with cavities and membranes are future scope.",
      "evidence": "roadmap F21 description",
      "icon": "schedule"
    },
    "move": {
      "key": "move",
      "name": "Move",
      "status": "partial",
      "feature": "F09",
      "scope": "Existing placed-item translation and plan edit paths; not every category/host preservation certified.",
      "evidence": "app/comforts-ui.js; app/model-move.js; app/model-ui.js",
      "icon": "move"
    },
    "copy": {
      "key": "copy",
      "name": "Copy",
      "status": "partial",
      "feature": "F09",
      "scope": "Existing clipboard/model copy; cross-category consistency audit remains F09.",
      "evidence": "app/clipboard.js; app/ui.inc [data-act=\"copy\"]",
      "icon": "copy"
    },
    "rotate": {
      "key": "rotate",
      "name": "Rotate",
      "status": "partial",
      "feature": "F09",
      "scope": "Existing library item rotation and numeric properties; universal wall transform reliability is not certified.",
      "evidence": "app/comforts-ui.js; app/model-move.js",
      "icon": "rotate"
    },
    "trim": {
      "key": "trim",
      "name": "Trim/Extend",
      "status": "partial",
      "feature": "F09",
      "scope": "Existing trim/extend and straight corner operations; expanded wall conditions remain F08/F09.",
      "evidence": "app/model-trim-ui.js; app/model-trim.js",
      "icon": "trim"
    },
    "mirror": {
      "key": "mirror",
      "name": "Mirror",
      "status": "planned",
      "feature": "F09",
      "scope": "F09 explicitly audits this operation; a usable production action was not verified. This is an audit mapping, not a delivery promise.",
      "evidence": "roadmap F09 description; inspected app/ui.inc/model modules",
      "icon": "mirror"
    },
    "align": {
      "key": "align",
      "name": "Align",
      "status": "planned",
      "feature": "F09",
      "scope": "F09 explicitly audits this operation; a usable production action was not verified. This is an audit mapping, not a delivery promise.",
      "evidence": "roadmap F09 description; inspected app/ui.inc/model modules",
      "icon": "align"
    },
    "offset": {
      "key": "offset",
      "name": "Offset",
      "status": "planned",
      "feature": "F09",
      "scope": "F09 explicitly audits this operation; a usable production action was not verified. This is an audit mapping, not a delivery promise.",
      "evidence": "roadmap F09 description; inspected app/ui.inc/model modules",
      "icon": "offset"
    },
    "split": {
      "key": "split",
      "name": "Split Element",
      "status": "planned",
      "feature": "F09",
      "scope": "F09 explicitly audits this operation; a usable production action was not verified. This is an audit mapping, not a delivery promise.",
      "evidence": "roadmap F09 description; inspected app/ui.inc/model modules",
      "icon": "split"
    },
    "delete": {
      "key": "delete",
      "name": "Delete",
      "status": "implemented",
      "feature": null,
      "scope": "Existing selected-element deletion. Not wired in F28-A.",
      "evidence": "app/model-ui.js; app/ui.inc [data-act=\"delete\"]",
      "icon": "delete"
    },
    "pin": {
      "key": "pin",
      "name": "Pin",
      "status": "unmapped",
      "feature": null,
      "scope": "Not currently on the roadmap \u2014 decision needed.",
      "evidence": "No explicit element pin/unpin scope in F01\u2013F27.",
      "icon": "pin"
    },
    "paint": {
      "key": "paint",
      "name": "Paint",
      "status": "partial",
      "feature": null,
      "scope": "Existing object color/material-style UI; per-face Revit Paint parity is not claimed.",
      "evidence": "app/paint-ui-bim.js; app/paint-bim.js",
      "icon": "materials"
    }
  },
  "features": {
    "F01": {
      "id": "F01",
      "title": "Integration baseline and standalone test workflow"
    },
    "F02": {
      "id": "F02",
      "title": "Precision, references and migration contract"
    },
    "F03": {
      "id": "F03",
      "title": "Performance baseline and profiling harness"
    },
    "F04": {
      "id": "F04",
      "title": "Layered plan graphics and vector output"
    },
    "F05": {
      "id": "F05",
      "title": "Layer-aware wall sections and elevations"
    },
    "F06": {
      "id": "F06",
      "title": "Assembly schedule and material legend"
    },
    "F07": {
      "id": "F07",
      "title": "Reusable project libraries"
    },
    "F08": {
      "id": "F08",
      "title": "Wall join and end-condition reliability"
    },
    "F09": {
      "id": "F09",
      "title": "Properties and Modify workflow consistency"
    },
    "F10": {
      "id": "F10",
      "title": "Roof workflow and intersection spike"
    },
    "F11": {
      "id": "F11",
      "title": "Precise roof-plane editing"
    },
    "F12": {
      "id": "F12",
      "title": "Persistent roof intersections, joins and trim"
    },
    "F13": {
      "id": "F13",
      "title": "Roof/wall attachment and roof detail output"
    },
    "F14": {
      "id": "F14",
      "title": "Expanded residential roof cases"
    },
    "F15": {
      "id": "F15",
      "title": "Residential host and opening reliability"
    },
    "F16": {
      "id": "F16",
      "title": "Parametric modeler architecture spike"
    },
    "F17": {
      "id": "F17",
      "title": "One editable parametric window end to end"
    },
    "F18": {
      "id": "F18",
      "title": "Component library and version updates"
    },
    "F19": {
      "id": "F19",
      "title": "Associative dimensions beyond the prototype"
    },
    "F20": {
      "id": "F20",
      "title": "Residential detailing workspace"
    },
    "F21": {
      "id": "F21",
      "title": "Material/assembly quantity semantics"
    },
    "F22": {
      "id": "F22",
      "title": "Coordinated sheet set and print QA"
    },
    "F23": {
      "id": "F23",
      "title": "Constrained sketches and feature-history component editor"
    },
    "F24": {
      "id": "F24",
      "title": "Residential structure coverage audit and gap closure"
    },
    "F25": {
      "id": "F25",
      "title": "Targeted performance work and Rust decision"
    },
    "F26": {
      "id": "F26",
      "title": "Packaging, recovery and release readiness"
    },
    "F27": {
      "id": "F27",
      "title": "Capture to Parametric BIM"
    },
    "F28": {
      "id": "F28",
      "title": "Revit-familiar workspace and menu redesign"
    }
  },
  "ribbon": {
    "Architecture": [
      [
        "Select",
        [
          "select"
        ],
        []
      ],
      [
        "Build",
        [
          "wall",
          "door",
          "window",
          "component",
          "column"
        ],
        [
          [
            "roof",
            "ceiling",
            "floor"
          ],
          [
            "curtain",
            "curtaingrid",
            "mullion"
          ]
        ]
      ],
      [
        "Circulation",
        [],
        [
          [
            "railing",
            "ramp",
            "stair"
          ]
        ]
      ],
      [
        "Model",
        [],
        [
          [
            "modeltext",
            "modelline",
            "modelgroup"
          ]
        ]
      ],
      [
        "Room & Area",
        [],
        [
          [
            "room",
            "roomseparator",
            "tagroom"
          ],
          [
            "area",
            "areaboundary",
            "tagarea"
          ]
        ]
      ],
      [
        "Opening",
        [
          "byface",
          "shaft"
        ],
        [
          [
            "wallopening",
            "vertical",
            "dormer"
          ]
        ]
      ],
      [
        "Datum",
        [],
        [
          [
            "level",
            "grid"
          ]
        ]
      ],
      [
        "Work Plane",
        [
          "workplane"
        ],
        [
          [
            "showplane",
            "referenceplane",
            "viewer"
          ]
        ]
      ]
    ],
    "Structure": [
      [
        "Select",
        [
          "select"
        ],
        []
      ],
      [
        "Structure",
        [
          "column",
          "framing",
          "foundation"
        ],
        []
      ],
      [
        "Circulation",
        [
          "stair",
          "ramp"
        ],
        []
      ],
      [
        "Datum",
        [
          "level",
          "grid"
        ],
        []
      ],
      [
        "Model",
        [
          "component"
        ],
        []
      ],
      [
        "Work Plane",
        [
          "workplane"
        ],
        []
      ]
    ],
    "Steel": [
      [
        "Select",
        [
          "select"
        ],
        []
      ],
      [
        "Connection",
        [
          "steel"
        ],
        []
      ],
      [
        "Fabrication",
        [
          "fabrication"
        ],
        []
      ],
      [
        "Modify",
        [
          "joingeometry"
        ],
        []
      ]
    ],
    "Precast": [
      [
        "Select",
        [
          "select"
        ],
        []
      ],
      [
        "Precast",
        [
          "precast"
        ],
        []
      ],
      [
        "Reinforcement",
        [
          "fabrication"
        ],
        []
      ]
    ],
    "Systems": [
      [
        "Select",
        [
          "select"
        ],
        []
      ],
      [
        "HVAC",
        [
          "duct"
        ],
        []
      ],
      [
        "Plumbing & Piping",
        [
          "pipe"
        ],
        []
      ],
      [
        "Electrical",
        [
          "electrical"
        ],
        []
      ],
      [
        "Fabrication",
        [
          "fabrication"
        ],
        []
      ]
    ],
    "Insert": [
      [
        "Link",
        [
          "link"
        ],
        []
      ],
      [
        "Import",
        [
          "cad",
          "image"
        ],
        []
      ],
      [
        "Load from Library",
        [
          "loadfamily"
        ],
        []
      ],
      [
        "Project Libraries",
        [
          "packages"
        ],
        []
      ]
    ],
    "Annotate": [
      [
        "Select",
        [
          "select"
        ],
        []
      ],
      [
        "Dimension",
        [
          "dimension"
        ],
        [
          [
            "chain"
          ]
        ]
      ],
      [
        "Detail",
        [
          "detailline",
          "filledregion"
        ],
        [
          [
            "masking",
            "detailcomponent",
            "insulation"
          ]
        ]
      ],
      [
        "Text",
        [
          "text"
        ],
        []
      ],
      [
        "Tag",
        [
          "tag",
          "tagroom"
        ],
        []
      ],
      [
        "Revision",
        [
          "revision"
        ],
        []
      ]
    ],
    "Analyze": [
      [
        "Structural",
        [
          "analysis"
        ],
        []
      ],
      [
        "Energy",
        [
          "daylight"
        ],
        []
      ],
      [
        "Coordination",
        [
          "clash",
          "checks"
        ],
        []
      ]
    ],
    "Massing & Site": [
      [
        "Conceptual Mass",
        [
          "massing"
        ],
        []
      ],
      [
        "Model Site",
        [
          "terrain"
        ],
        []
      ],
      [
        "Model by Face",
        [
          "byface"
        ],
        []
      ]
    ],
    "Collaborate": [
      [
        "Collaborate",
        [
          "sync"
        ],
        []
      ],
      [
        "Manage Collaboration",
        [
          "worksets"
        ],
        []
      ],
      [
        "Coordinate",
        [
          "clash",
          "link"
        ],
        []
      ]
    ],
    "View": [
      [
        "Graphics",
        [
          "visibility",
          "templates"
        ],
        [
          [
            "detail"
          ]
        ]
      ],
      [
        "Create",
        [
          "three",
          "section",
          "callout",
          "elevation"
        ],
        [
          [
            "plan",
            "rcp",
            "schedule"
          ]
        ]
      ],
      [
        "Sheet Composition",
        [
          "sheet",
          "placeview"
        ],
        [
          [
            "legend",
            "assemblyschedule",
            "titleblock"
          ]
        ]
      ],
      [
        "Windows",
        [
          "tile"
        ],
        []
      ]
    ],
    "Manage": [
      [
        "Settings",
        [
          "materials",
          "units"
        ],
        []
      ],
      [
        "Project Resources",
        [
          "assembly",
          "packages"
        ],
        []
      ],
      [
        "Project Settings",
        [
          "phases",
          "designoptions"
        ],
        []
      ],
      [
        "Inquiry",
        [
          "checks"
        ],
        []
      ]
    ],
    "Add-Ins": [
      [
        "External",
        [
          "addin",
          "dynamo"
        ],
        []
      ]
    ],
    "Quantification": [
      [
        "Quantities",
        [
          "takeoff",
          "materialqty"
        ],
        []
      ],
      [
        "Schedules",
        [
          "schedule",
          "assemblyschedule",
          "legend"
        ],
        []
      ]
    ],
    "Modify": [
      [
        "Select",
        [
          "select"
        ],
        []
      ],
      [
        "Clipboard",
        [
          "copy"
        ],
        []
      ],
      [
        "Modify",
        [
          "move",
          "rotate",
          "trim"
        ],
        [
          [
            "mirror",
            "align",
            "offset"
          ],
          [
            "split",
            "delete",
            "pin"
          ]
        ]
      ],
      [
        "Geometry",
        [
          "joingeometry"
        ],
        []
      ]
    ],
    "Modify | Walls": [
      [
        "Select",
        [
          "select"
        ],
        []
      ],
      [
        "Properties",
        [
          "assembly"
        ],
        []
      ],
      [
        "Clipboard",
        [
          "copy"
        ],
        []
      ],
      [
        "Modify",
        [
          "move",
          "rotate",
          "trim"
        ],
        [
          [
            "mirror",
            "align",
            "offset"
          ],
          [
            "split",
            "delete",
            "pin"
          ]
        ]
      ],
      [
        "Geometry",
        [
          "joingeometry",
          "endjoin"
        ],
        []
      ],
      [
        "Modify Wall",
        [
          "attach",
          "editprofile"
        ],
        [
          [
            "sweep"
          ]
        ]
      ]
    ]
  }
};
