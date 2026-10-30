# F30 — Headless BimCraft execution and batch automation

Status: proposed discovery epic, added October 30, 2026 from the user's headless discussion and project-state audit. No owner, schedule, implementation, service deployment or new release gate is assigned.

## Product value and existing starting point

Run prescribed model edits, checks and exports without opening a browser. The existing `IfcSession`, application `IfcEditor`, shared model operations and source/packaged MCP tests already provide genuine browser-free execution. F28-C supplies additional documentation operations in its unmerged candidate; transient drawing activation is explicitly live-only. This feature completes and packages useful existing capability rather than building a second geometry/history engine.

Use one authoritative core through three entry points: the visual application, a direct local SDK/CLI job interface and MCP for agents. MCP can expose headless execution. Batch jobs may reduce viewport, download and agent-round-trip overhead; actual parsing/geometry/regeneration costs remain and speed gains must be measured.

## F30-A — Capability and interface discovery

Inventory model operations, reads, exports and limitations in current main. Track implementation, direct-call accessibility, schema/registration, package closure, actual source/package/live tests and optional client connection separately. Identify which actions are inherently live UI operations. Compare current CLI/SDK shapes before choosing a job interface.

Deliver a small capability matrix, explicit unsupported boundaries, same-fixture time/memory observations and a bounded proof plan. No new job atomicity, retry or transaction semantics are assumed from existing per-operation tools.

## F30-B — One deterministic local job

Open a working copy of Test Lab v1, inspect it, perform a supported assembly/wall/join recipe, validate references and state, and save a new IFC plus a structured result report and supported exports. Compare direct-core and MCP execution on the same source/package and fixtures. Use accepted operations only; additional C documentation export breadth depends on its separate adoption.

Acceptance:

- Same semantic model, supported identities, precision and actual independently checked outputs; no duplicate geometry implementation.
- Explicit units, document/revision binding, no-op and confirmed owned-commit receipts; respect human history when applicable.
- Agreed whole-job versus per-operation atomicity, interruption/failure, retry/resume/idempotency and file-output/overwrite policy before implementation.
- Real package closure, missing-module refusal and repeatable local execution without a mounted viewport.
- Compare time and memory under recorded equal conditions; no promised speedup or universal full-application parity.

## Scope boundaries

Start locally. Hosting, cloud queues, account/client configuration, a replacement geometry kernel and a whole-application rewrite are not part of this discovery. GUI selection/activation and native pickers remain honestly live-only where appropriate. Revit remains the product behavior reference for underlying model operations; browser-free execution is an additional access mode to the same semantics.

Detailed current plan: [project state](https://drsurfbum.github.io/bimcraft-SDH/state/2026-10-30/) and [slice register](SLICE-REGISTER.json). Preserve existing feature ownership, branches, pending C work, open performance/test/MEP follow-ups and the unchanged Test Lab master.
