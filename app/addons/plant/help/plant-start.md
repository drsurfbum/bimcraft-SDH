---
title: Plant: getting started
summary: What the Plant add-on does in BimCraft, how to switch it on, and what it leaves alone.
section: start
order: 1
keywords: plant, process, factory, pipe spec, isometric, equipment, nozzle, layout, piping, add-on
---

## What it is

Plant is an add-on for BimCraft that comes with it and is free. It adds four things for process and factory work: **pipe specs** checked against the pipe runs in the model, **isometric drawings** of pipe runs, **process equipment** with nozzles saved as an IFC file, and a **layout check** for aisles, the space beside each item and floor load.

It is off until you switch it on: {{ui:Settings}} › {{ui:General}} › {{ui:Add-ons}} › {{ui:Plant}}. Its tools are in the {{ui:Plant}} tab of the right panel, in {{ui:Properties}} (a {{ui:Pipe spec}} section when you select a pipe run) and in {{ui:Export}}.

**A drafting aid, not an engineering approval.** The specs, the equipment shapes and the limits are generic and ours: the sizes and walls come from the public tables, the equipment is drawn in the right proportions but with no maker's dimensions, the aisle and floor-load limits are yours to set. The person responsible for the plant decides what is right.

## What needs a newer BimCraft

Putting equipment into the open model (the {{ui:Place}} button in the equipment table) and the router's list of ports need BimCraft's add-on API 1.1, which this build has; in a build without it the Plant tab says so, and the equipment goes out as its own IFC file, which BimCraft opens like any other.

Not built yet: the router finds a route between two ports and shows its corners, but putting the run into the model waits for a run writer in the same API; spool numbers wait for BimCraft's own (the isometric draws balloons when the runs carry them); the layout check reads the equipment table, not equipment placed from the library.

The add-on changes the model only when you press {{ui:Place}} (one undo step); everything else reads it.
