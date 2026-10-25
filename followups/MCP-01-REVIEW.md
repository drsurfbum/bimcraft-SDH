# MCP-01 PM review — changes required

Reviewed delivery: `64000d39e6a194e83053a84c90c95d349125ef6c`. Base: `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711`. [Draft PR #16](https://github.com/drsurfbum/bimcraft-SDH/pull/16) remains unmerged. Main and F28-C/F08 remain separate and unchanged.

## Verified delivery evidence

All eight exact-head workflows pass. PM inspected the MCP-01 job steps and logs: 13 mandatory contract tests, real stdio workflow (11 checks), isolated fork package workflow, live HTTP/browser workflow (13 checks), and three independently validated saved IFC outputs. Each output has zero schema findings, 23 walls, four authored types, 15 materials and two preserved dimensions. The baseline reports 707 checks; the historical missing CivilCraft --draw06 dependency is not called a pass.

PM independently reran all 13 contract tests on the exact delivery: 13 passed, zero failed/skipped. Read the semantic adapter, registration/history changes, headless wrappers, packaging and connection guide. This review is not a claim that every application capability has MCP coverage or that the user has a persistent connected client.

## MCP01-PM-01 — P1 / OPEN: live Undo can change another document

Location: `app/agents.js`, lines 246–255 in the reviewed delivery. The live Undo handler validates documentId/expectedRevision only on entry, then reads the current editor and invokes the active application's Undo again for each iteration. Awaited settling/Undo creates a project-switch boundary without rechecking that the active editor is still the bound one.

PM reproduced the defect using the actual live installer/dispatcher and two independently opened real IFC editors in an isolated source archive. Each project has one Assistant-owned material edit. Request Undo(steps=2) with Project A's valid document token/revision. Simulate switching the active editor to B after the first awaited Undo. Actual targets are **A then B**; both edit histories go from one step to zero. The request reports success and B changes despite distinct document tokens.

This is a defect in the promised document-binding coverage. The pre-existing unbound Undo loop had similar behavior; the new explicit binding does not protect the complete operation. It is not a schema/IFC validation failure, so green existing CI does not cover it. The reproduction uses the real installed handler and editors with a simulated switch callback; PM has not yet reproduced the timing in a full browser.

Required fix: pin the original editor/document for the entire call. After every awaited boundary and immediately before every history mutation, revalidate editor identity, busy state and current history ownership. A project switch must stop/refuse further work without touching the replacement project. Do not naïvely compare the original expectedRevision after the operation's own successful Undo; track the expected history transition or otherwise distinguish this call's changes. Report accurately if some requested original-document steps already completed. Audit adjacent Redo behavior for the same targeting class; no unproven second defect is asserted here.

Add focused regression coverage and a real live-transport/browser case switching projects during a multi-step Undo. Assert B's model bytes and history remain unchanged, stale/wrong bindings refuse, normal same-project multi-step Undo still works, and person-owned history stays protected. Preserve existing headless, package, Undo/Redo and saved-file checks. Publish the fix/evidence and rerun all applicable CI on the final head. Keep PR draft for PM re-review; do not merge or configure a persistent client as part of this fix.

## Scope and remaining work

MCP-01 remains bounded to materials, assemblies, authored wall types and existing instance settings. F08 join tools form a separate subsequent slice; F28-C documentation, reference dimensions and other semantic gaps remain open. PERF-F04-01, PERF-F05-01, TEST-F28-01 and broader MCP catch-up remain OPEN. Established layout remains default/fallback.

The connection guide is an example for a selected client's supported settings; it is not proof of installed Codex configuration. Persistent user-client setup remains unperformed and is not the only outstanding item: MCP01-PM-01 requires a fix first. No credential, global configuration or account-permission changes were made by PM. No agent was messaged, no PR review comment was posted, and no feature branch was modified.

[Exact-head MCP CI](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40136712385) · [Handoff](https://github.com/drsurfbum/bimcraft-SDH/blob/64000d39e6a194e83053a84c90c95d349125ef6c/docs/features/MCP-01-HANDOFF.md) · [Connection guide](https://github.com/drsurfbum/bimcraft-SDH/blob/64000d39e6a194e83053a84c90c95d349125ef6c/docs/features/MCP-01-CONNECTION.md)

## Submitted fix candidate — October 25, 2026

PR #16 now publishes 9224167fe3e2e856c57679065b545d834f52ade1. The owner submitted guarded history/session callbacks and new live project-switch regression evidence; all eight workflows pass on this exact candidate. PM re-review is still required, and MCP01-PM-01 remains OPEN. The historical reproduction above refers to 64000d3; do not describe it as a reproduction against the new fix. Preserve this candidate during the [0.7 integration plan](UPSTREAM-0.7-PLAN.md). No readiness or merge transition occurred.
