# Agentic core and MCP capability parity

User direction, October 24, 2026: agentic use is a core product requirement. Agents must be able to perform supported application work through discoverable, tested tools. A feature working in the interface does not establish agent access.

## Feature acceptance rule

Every new or changed domain capability must identify its agent operations and prove registration and execution through the supported MCP transport. Reuse authoritative model operations, validation, journals, view records and export writers. Do not maintain a second modeling implementation or use DOM-click sequences as the permanent agent API.

Parity means meaningful operations, not one tool per button. Ribbon arrangement and palette resizing can be presentation-only. Creating/editing a wall type, resolving a reference, changing a view, composing a sheet and exporting a document require agent coverage.

Before PM acceptance, each capability must be classified:

- **Verified:** tool name/schema, registered surface, exact tested build and end-to-end evidence supplied.
- **Presentation only:** no new domain operation; name the existing agent operation where relevant.
- **Gap:** missing, partial or untested coverage is recorded. Do not mark parity complete. New-capability exceptions require an explicit user scope decision; inherited gaps remain visible catch-up work, not retroactive passing checks.

## Shared operation contract

- Typed, documented arguments and structured results identify document/session, stable source/element/type/material IDs, units and supported categories. A tool name is not proof that UI-supported inputs work.
- Return raw numerical values needed for precision checks; human display rounding must not be the only machine-readable representation. Preserve F02 migration, tolerance, reference and unsupported-record contracts.
- Bind operations to the intended source/document. Do not silently substitute the currently selected element or active drawing. Refuse stale/foreign IDs and conflicting or busy state before changes.
- Use existing atomic transactions and Undo ownership. Reads do not mutate; preflight refusals and failed atomic domain mutations leave no partial changes. If a confirmed commit is followed by a person edit, Undo, project switch, closure or notification failure, report the request’s own confirmed progress honestly; distinguish captured commit-time data from current state and stop further work. Do not infer progress from net history growth, advertise Undo over a person-owned step, silently retry or undo the person’s work. Verify supported Undo/Redo and save/reopen behavior.
- Preserve read/edit/save/export permissions, allowed file roots and actionable errors. No silent permission expansion, file overwrite or bypass of an editing refusal.
- Document live versus headless support. Share the domain implementation; purely live state can be live-only with a discoverable explanation elsewhere.
- Verify the actual loaded/packaged fork modules and version. Source code, built package, MCP registration and a connected agent session are different states. An upstream package is not assumed to contain fork changes.

## Required delivery evidence

1. Capability-to-tool mapping with live/headless availability and remaining gaps.
2. Actual MCP initialization, discovery and calls on the exact delivery build. Internal-function/browser tests supplement this evidence, not replace it.
3. A successful agent workflow with real supported inputs, including custom types/materials where relevant, read-back and applicable Undo/Redo/save/reopen/export checks.
4. Invalid/unsupported input, denied permission and wrong-document/source tests proving no unintended changes.
5. Independent validation of affected IFC/CSV/vector PDF output. Local/CI validation does not authorize publishing model payloads.

Add regression checks for missing registration, schema drift and live/headless/package divergence. Test semantic results, not merely tool-name counts. Keep unavailable external-service checks explicit.

The handoff lists tool names, arguments, permissions, structured output, transport/build and test evidence. PM reviews the real catalog and an agent-driven workflow alongside UI evidence. Track planned, implemented, registered, transport-tested and connected separately.

This is a standing PM requirement reflected in the feature and PM templates. It does not claim legacy gaps are fixed, authorize feature merges, change a feature’s approved base or configure client credentials/permissions. Explicit user instructions and existing authorization govern the work; a gap does not create a new approval requirement for unrelated already-authorized steps.

## Catch-up work

The [October 24 audit](features/agentic-core/2026-10-24-AUDIT.md) is historical evidence at `3e42c21`, not the current catalog. MCP-01 material/assembly/custom-type/wall-instance coverage and F08 join/end tools are now adopted; their exact evidence and remaining limits are in [PROJECT-STATUS.md](PROJECT-STATUS.md). References/view settings and documentation/export parity remain catch-up work, including the separately owned F28-C slice. Assess actual operation deltas and keep inherited gaps visible. Preserve the old audit/catalog unchanged apart from a dated supersession notice; do not present its old gaps as current or regenerate evidence retroactively.

This is cross-cutting product work, not optional final polish. Extend the existing shared dispatcher rather than replace it.
