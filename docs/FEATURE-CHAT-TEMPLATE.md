# Feature-development chat template

The PM fills in the bracketed values before the user starts a feature chat. Each brief should be independently understandable, but refer to the repository roadmap for wider scope.

---

Implement **[feature ID — title]** in my residential BIM fork.

## Starting point

- Repository: https://github.com/drsurfbum/bimcraft-SDH
- Current GitHub identity and future-commit settings: `docs/GITHUB-IDENTITY.md`.
- Approved base branch and exact commit: [branch, SHA; confirm it includes prerequisites]
- Feature branch: [unique branch name]
- Isolated checkout/worktree: [absolute path, or create a separate checkout for this feature]
- Development server port: [unique port; do not take over an existing preview]
- Prerequisites and their integrated commits: [IDs and SHAs]
- Read: `docs/RESIDENTIAL-ROADMAP.md`, `docs/WALL-PRECISION.md`, applicable repository instructions and [feature-specific design notes].

Verify these paths and Git state first. Do not reset user changes, work in another chat's checkout, or assume a default branch includes an unmerged prototype. Inspect the existing implementation before replacing a capability. If the base does not contain a prerequisite, identify that concrete blocker before dependent edits.

## User workflow and scope

[Describe the operation in user language, including a before/after example.]

Included:
- [Specific slice 1]
- [Specific slice 2]

Excluded:
- [Adjacent work reserved for another feature]

Primary code ownership: [modules/areas]. Shared files/contracts needing coordination: [list]. You may make necessary supporting changes, but report scope expansion before turning this into a different feature.

## Acceptance criteria

1. [Observable modeling/UI behavior and concrete fixture.]
2. [Dependency update behavior: hosts, references, views, schedules.]
3. [Save/reopen and undo/redo behavior.]
4. [Invalid/missing/degenerate input behavior.]
5. [Export/precision/performance evidence relevant to this feature.]
6. [Agent workflow: registered MCP operations, supported arguments and real transport-level evidence.]

## Agent access is part of the feature

Read `docs/AGENTIC-CORE.md`. Map every new/changed domain capability to shared authoritative operations and registered MCP tools. Record live/headless support, typed arguments/results, stable IDs, units, permissions and gaps. Presentation-only changes may be marked not applicable with a reason; a workspace command or internal function is not automatically an MCP tool.

Prove discovery and execution through the actual transport on the delivery build, including supported custom types, raw precision values, source/document isolation, refusals and applicable Undo/Redo/save/reopen/exports. Add semantic regression checks for registry/schema/package drift. Do not silently defer missing agent coverage or claim an upstream package includes fork changes. New-capability exceptions need an explicit user scope decision; keep inherited gaps recorded separately.

Preserve material and model identities, explicit core anchors, existing associative dimensions, cavity widths, zero-thickness membrane records, and project isolation. Do not implement an imaginary physical thickness or silently rewrite an unsupported file version. Material-library edits must not resize existing assemblies. Use the current IFC2X3/IFC4 behavior as the compatibility baseline and document any deliberate extension.

## Validation

Run checks appropriate to the change. Existing focused commands:

```sh
npm run test:precision
npm run test:materials
node --input-type=module -e "import('./devshell/test.mjs').then(m=>m.buildMirror())"
node .cc-test/bin/test-bimcraft.mjs --model
node .cc-test/bin/test-bimcraft.mjs --comforts
node .cc-test/bin/test-bimcraft.mjs --views2
```

Do not claim all checks ran if some were skipped. The standalone checkout's broader residential suite previously stopped on a missing TakeoffCraft dependency; external IFC validators were unavailable. Inspect whether F01 has resolved either limitation. Add meaningful regression tests for new data/geometry behavior. Verify UI work in a separate test tab and inspect exported drawings when printing is affected. Preserve the user's open model and preview. Measure performance when the change affects a profiled hot path.

Typical startup, after inspecting the checkout's current instructions:

```sh
npm run fetch-vendor
npm start -- --port [assigned-port] --host 127.0.0.1 --offline
```

## Delivery

Complete this bounded feature, create or update a draft PR against [integration branch], and provide:

- Summary of the user-visible behavior and how to try it.
- Branch, checkout, commit and PR URL.
- Acceptance checklist with passed, failed or unverified status and evidence.
- Tests run, browser/export observations and any measurements.
- Changes to data formats, compatibility or shared contracts.
- MCP capability mapping, exact tested transport/build, agent workflow evidence and any missing/partial coverage.
- Known limitations, integration concerns and follow-up work kept outside this PR.

Do not merge, deploy, start unrelated features, or send instructions to other chats unless I authorize that separately. Give me a concise handoff I can paste into the PM chat. Update feature-specific documentation; let the PM reconcile the shared roadmap status after integration.

---

## Completion handoff format

```text
Feature: [ID/title]
State: [implemented / blocked / ready for review]
Branch / checkout / base / head:
PR:
Acceptance: [criterion → result/evidence]
Validation:
Compatibility and shared contracts:
MCP tools / transport / agent workflow evidence / gaps:
Known limits:
Recommended next action:
```
