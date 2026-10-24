---
title: Edit a family
summary: Change a family's parameters, formulas and solids, show parts by a Yes / No parameter, cut and join solids, give it connectors for pipes and ducts, and see the result drawn from the IFC it will save.
section: tasks
order: 38
keywords: family editor, edit family, parameter, parameters, formula, formulas, visibility, yes no, solid, solids, box, extrusion, extrude, revolve, sweep, profile, arc, boolean, booleans, cut, join, difference, union, handle, handles, work plane, sketch, new family, connector, connectors, port, ports, pipe connector, duct connector, drain, water supply
---

## Open the editor

Open a family (the project browser's **Families**, or {{ui:Build}} › {{ui:Families…}}) and click {{ui:Edit the family}}. To start from nothing, click {{ui:New family}}: give it a name, say what it is (a door, a window, furniture, a fixture or something else) and, for a door or window, which starter its plan symbol and hand come from. The editor opens on a family with a few parameters and one solid.

Editing a starter family keeps your changes in this model only. Other models keep the starter as it is.

Nothing in the model changes until you click {{ui:Save the family}}. The editor has its own undo and redo (the arrow buttons beside the name, or {{key:Mod+Z}} and {{key:Mod+Y}}); saving is one step in the model's undo.

## Parameters

The {{ui:Parameters}} tab lists the family's parameters: a name, a kind (length, angle, number, or Yes / No) and a default.

- A **formula** makes a parameter follow others, for example `Width / 30` or `if(Width > 1200, 2, 1)`. Lengths in formulas are millimeters, or write a unit: `3'`, `6in`, `50cm`.
- Renaming a parameter renames it in every formula and field that uses it. A parameter still in use cannot be removed.
- A door or window family also gets two names from its wall: `WallThickness` and `Face` (1 or −1, the side the door swings to).

## Solids

The {{ui:Solids}} tab lists the solids. Add a box, an extrusion, a revolve or a sweep:

| Solid | What you set |
|---|---|
| Box | its two corners: x0 to x1, y0 to y1, z0 to z1 |
| Extrusion | a profile on a work plane (plan, front or side), where the plane is, and a depth |
| Revolve | a profile, an axis on the plane, and an angle up to 360° |
| Sweep | a path of points and a radius (a rod or a rail) |

Every number can be a typed number or an expression of the parameters. Each solid has a color and **Shown when**: leave it empty to show it always, or name a Yes / No parameter (or write a comparison such as `Shelves >= 3`) to show it only then. That is a visibility parameter.

### Draw a profile

An extrusion's or a revolve's profile is drawn on its work plane under the preview:

- Click on the paper to add a point after the picked one.
- Drag a point to move it. Points snap to the grid; hold {{key:Shift}} to place them freely.
- Click a small square on a segment to add a point there. {{key:Shift}}+click it to make that segment an arc (click again for the other way, then straight).
- Double-click a point to remove it.

Hollow points are set by parameters: change them in the table, not by dragging.

## Booleans

The {{ui:Booleans}} tab cuts the second solid out of the first, or joins them. A Boolean's result can be cut or joined again. A solid used in a Boolean is drawn only as part of it.

When the second solid is hidden by its Yes / No parameter, the first is kept as it is; when the first is hidden, the result is hidden.

## Connectors

Families placed on a floor (furniture, fixtures and others) have a {{ui:Connectors}} tab: the points where a pipe or a duct joins the element, as on a basin's tap and drain. Click {{ui:Add a connector}} and set:

- **Kind**: pipe or duct, and its **System** (cold water, sanitary drain, supply air…).
- **x**, **y** and **z**: where it is, in the family's own axes. Like a solid's numbers, each can be a number or a formula of the parameters, so the connector moves with the size.
- **Way out**: the direction a pipe or duct leaves it, along one of the family's axes (a drain under a basin goes **Down**).
- **Size (mm)**: the pipe's nominal size (DN) or the round duct's diameter.
- **Flow**: **In** for a connector that is fed (a tap), **Out** for one that drains.

The preview draws each connector as a ring with an arrow the way out. Doors and windows have no connectors.

For a plumbing fixture, choose which one it is under **Plumbing fixture** (water closet, lavatory, kitchen sink, shower, laundry tub). The starter fixtures already say so.

Every element placed from the family gets its connectors as ports in the IFC file, and they are made again when the element changes size or the family is saved. Programs that read IFC systems see where each pipe or duct belongs.

## The preview and its handles

The preview is the family written as IFC, by the same code that saves it into the model, and drawn back. What you see is what other programs get. Under it, **Size shown** sets the parameter values the preview uses.

**Handles** are dots on the preview: **The size** shows a handle for Width, Depth and Height; **The solid picked** shows one on each face of the solid you picked. Drag a handle:

- on a face set by a parameter, the size shown changes (the family's formulas are kept);
- on a face set by a typed number, the number changes.

## Saving

{{ui:Save the family}} checks the family, then draws every size of it again and makes every element of it again, as one step you can undo. If a size cannot be drawn with the change (for example a solid would have no width at that size), nothing is saved and the editor says which size.

:::note
The geometry is saved as IFC's own solids: extrusions, revolves, swept disks, and Boolean results. Nothing is turned into a list of triangles, so files stay small and other programs can read the shapes as shapes. Profiles with arcs are saved with arcs in IFC4; IFC2X3 has no arc segments in a profile, so there the arcs are saved as short straight pieces.
:::

See also [Families and their sizes](topic:families).
