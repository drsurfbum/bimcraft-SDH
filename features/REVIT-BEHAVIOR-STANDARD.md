# Revit behavior reference standard

**Standing user direction — October 28, 2026:** For each feature, examine how Revit does it. Revit behavior is the expected product baseline, including interactions and model behavior as well as the familiar workspace layout.

## Before implementation

Record a short comparison: user task, Revit version, official reference, observed native behavior where available, current BimCraft behavior, supported target for this slice and open decisions. Separate evidence from inference. A screenshot illustrates a result; it does not establish every setting or rule that produced it.

Study activation and exit/cancel, selection and multi-selection, type versus instance edits, contextual ribbon/right-click/grips, numeric input/units, snapping/references, physical geometry/hosts/layer priorities, Undo/Redo, persistence and drawings/exports as relevant. Inspect the workflows people actually use, including the common failure/refusal paths.

Match familiar behavior within the approved slice. Raise meaningful departures or unresolved product choices before implementing dependent rules. Keep unsupported actions clearly unavailable and feature-mapped; do not silently invent alternate behavior. This policy does not automatically authorize implementing Revit's entire feature set or replace existing feature ownership/adoption gates.

## During implementation and review

Use existing authoritative model operations and shared command/input/workspace adapters. A manual action and an agent operation should reach the same domain operation, validation and history. Retain actual source, packaged and live MCP evidence for domain capabilities according to the adopted agentic-core contract.

Feature handoffs must include a compact behavior matrix: Revit reference/observation, BimCraft result, verified scope, unavailable cases and deliberate differences. Verify supported actions with representative examples, native input, cancellation, Undo/Redo, save/reopen and independent saved/exported outputs. Obtain user review for meaningful intentional differences. Do not claim full Revit parity from a matching icon or a single passing example.

## Shared test reference

BimCraft Test Lab v1 is the reusable manual baseline: 22 numbered stations, four named floors, 50 walls, nine hosted doors/windows, assemblies, joins, reference targets, persistent dimensions and drawing starters. Use its pristine master and manifest; save working edits separately. Feature-specific automated fixtures remain required where appropriate. Add future cases in a new version and retain v1.

The master and the user's reference screenshots remain local unless publication is explicitly authorized. This public policy does not publish a model or screenshot.

## Current application

- F08-B: investigate layered wall joins and familiar join controls; see [join planning](F08-B-WALL-JOIN-CONTROL.md). F08-A remains an accepted bounded implementation, with the broader feature partial.
- F09: match the agreed shortcut/context/snap behavior; unresolved richer overrides and Modify tools remain follow-up slices.
- F28: the familiar layout and contextual discovery must agree with supported domain behavior; unavailable controls remain honestly explained.
- F29 and later features: carry this behavior comparison into discovery before defining implementation acceptance.

This establishes a cross-feature standard. It does not start a new agent, change an approved baseline, merge a PR or close existing findings.
