# MCP-01 — Materials, assemblies and wall editing

Owner: this MCP-01 implementation chat. Checkout: `bimcraft-mcp-01`; branch: `feature/mcp-material-wall-parity`. Canonical repository: `drsurfbum/bimcraft-SDH`. Exact starting main: `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711` (tree `93258f6217a6025c5e6e30a552461e8cbb9e3de1`). The prior approved fork main and upstream target are verified ancestors. Repository-local identity: DrSurfBum / `80549907+drsurfbum@users.noreply.github.com`. No global identity changes.

Draft delivery only; acceptance and merge remain separate. No package publication, deployment, client credential change, default-layout change or shared-roadmap edit. Port 8046 was free before this chat's temporary test server; every browser test closes its own servers and isolated browser. Existing previews, unsaved browser projects and other checkouts were preserved.

## Implementation and ownership

`app/material-wall-agent.js` contains DOM-free semantic schemas and adapters. It uses the existing `saveMaterial`, `saveWallAssembly`, `changeWalls`, `drawWalls`, placement helpers, `ModelWriter.run` and `IfcEditor` journals. There is no new geometry engine, model store or raw metadata tool. Reads never write migration records. Required BIM module failures now stop the fork's headless startup instead of quietly omitting tools.

Shared changes are confined to `app/agents.js` registration/exact read-back/busy checks and one `app/bimcraft.js` callback connecting the existing Redo command. Headless adapters, packer, tests and a required CI job complete the slice. No changes to `model-walls.js`, workspace/documentation modules, join implementations or shared roadmap. PM should reconcile this registration/callback boundary when integrating F08 and F28-C's separately owned agent contracts. Neither feature is imported here; PR #14 remains context only.

## Capability matrix

Every row is implemented, registered and transport tested on both supported surfaces. Exact catalogs/schemas are in `evidence/mcp01/catalog-headless.json` and `catalog-live.json`.

| Capability | Tool | Permission | Live | Headless |
| --- | --- | --- | --- | --- |
| Inspect project/session, levels and dynamic type keys | `model_describe` | read | yes | yes, `doc` |
| Inspect materials, exact defaults and version diagnostics | `materials_list` | read | yes | yes, `doc` |
| Inspect built-in/authored recipes, IDs, ordered layers, cores and diagnostics | `assemblies_list` | read | yes | yes, `doc` |
| Create a project material; preserve unused definitions | `material_create` | edit | yes | yes, `doc` |
| Edit material defaults/appearance/name/notes without resizing layers | `material_edit` | edit | yes | yes, `doc` |
| Create an authored recipe | `assembly_create` | edit | yes | yes, `doc` |
| Edit an authored type and every instance using it | `assembly_edit` | edit | yes | yes, `doc` |
| Duplicate an authored or built-in template to a distinct key/GlobalId | `assembly_duplicate` | edit | yes | yes, `doc` |
| Create walls using dynamic types and existing instance settings | `walls_add` | edit | yes | yes, `doc` |
| Assign type/change instance settings by explicit wall GlobalIds | `walls_edit` | edit | yes | yes, `doc` |
| Exact wall/settings/opening/reference read-back | `walls_list` | read | yes | yes, `doc` |
| Assistant-owned history | `undo`, `redo` | edit | yes | yes, `doc` |
| Save actual IFC through existing save protections | `model_save` / `ifc_save` | save | download/dialog | allowed-root path |
| Open a saved IFC | person opens file / `ifc_open` | read | person-driven | yes, returns `doc` |

There are 24 live tools and 37 headless app-family tools in tested catalogs; counts are not parity claims for the other tools. New semantic definitions are eight: two reads and six edits. `walls_add`, `walls_list`, `model_describe` and history adapters extend existing tools. There is no deletion tool because this slice preserves unused definitions and follows the existing application editors.

## Schemas and identity

All new edit schemas require `documentId` and `expectedRevision`. Obtain them from `model_describe`, `materials_list` or `assemblies_list`. A document token identifies the **opened editor session**, including separately opened copies with identical IFC GlobalIds. It deliberately changes after reopen. `projectId` is the persistent IFC project GlobalId. `revision` is an optimistic history token, updated after changes/Undo/Redo/save; inspect again after edits. It is not a persisted model version.

Use persistent wall/type GlobalIds, material library IDs and type keys. Returned `id` is an IFC expressID useful for inspection, not a durable mutation identity. Stored types return both expressID and GlobalId; uninstantiated built-in templates have their stable key and null storage IDs. Material IDs remain stable across rename. Creating a duplicate never reuses the source type identity or assigns walls implicitly.

`walls_add.type` is a string validated against the current document's authoritative types, not a static enum. Existing built-in-only calls without binding remain compatible and operate on their explicit headless `doc` or targeted live window. Authored types and new instance-setting arguments require document/revision binding. New tools always require it. `undo`, `redo` and save accept optional binding for legacy compatibility; clients should supply it. All headless model tools additionally require `doc`; the live relay targets its window, and the document token detects a project switch inside that window.

| Tool | Additional arguments |
| --- | --- |
| `materials_list`, `assemblies_list` | optional `documentId` for a checked read |
| `material_create` | `id`, `name`, `defaultThickness`, `color`, `fill`, `fillColor`; optional `category`, `notes` |
| `material_edit` | `id`, `changes` containing supported material fields |
| `assembly_create` | new `key` (`wall-*`), `name`, `exterior`, `layers` |
| `assembly_edit` | existing `key`, matching `typeGuid`, `changes` (`name`, `exterior`, `layers`) |
| `assembly_duplicate` | `sourceKey`, `sourceGuid` for authored source; new `key`, `name` |
| `walls_add` | `points`, optional `closed`, `level`, `type`, instance settings below |
| `walls_edit` | unique `walls` array of GlobalIds, `changes` with instance settings below |
| `walls_list` | optional `level` (default lowest/zero level), optional `documentId` |

Layers are exterior → interior, each with `mat`, `materialId`, `kind` (`material` or `cavity`), `t`, `function`, `core`; cavity `materialId` is null and `ventilation` is `unspecified`, `unventilated` or `ventilated`. Functions: finish/substrate/structure/insulation/membrane. One contiguous core must have physical thickness. Only material membranes may have zero thickness. Layer widths are explicit, never live links to material defaults. New recipe writes require existing material IDs; legacy definitions remain readable through authoritative migration rules.

Instance settings: `type`, `locationLine`, `exteriorSide`, `height`, `topLevel`, `baseOffset`, `topOffset`. Six location lines: `center`, `exterior`, `interior`, `coreCenter`, `coreExterior`, `coreInterior`. Exterior side is `left` or `right` relative to travel. Creation points describe the requested location line; the existing placement helper finds the wall axis. `topLevel` is an exact storey GlobalId, mutually exclusive with fixed `height`; offsets and top levels must produce positive supported height. Instance edits do not expose endpoint, join, new curve or dimension behavior.

Raw values are JSON numbers in **mm**, with explicit `units: "mm"`, including levels, material defaults, layers, wall endpoints, thickness, length, height, offsets, openings and computed location-reference coordinates. The six UI modes (`ftin`, `in`, `ftdec`, `mm`, `cm`, `m`) never change raw values. `displayName` is human/localized; logical IDs and raw fields are separate. F02 tolerance checks use 0.005 mm, not display strings. This is the existing bounded F02 contract, not a universal CAD accuracy claim.

## Refusal and atomicity

Schemas reject unknown fields, invalid enums, missing bindings and out-of-range values. Runtime checks reject missing/foreign/duplicate wall IDs, stale document/revision/type identity, unknown types, invalid core/material/top references, unsupported/corrupt records and busy state before commit. A valid-first/invalid-second batch never applies partially. No silent built-in fallback. The existing writer journal also rolls back domain-operation failures.

Unsupported assembly/material versions appear as diagnostics and remain stored unchanged. Corrupt instance location/top records are diagnosed instead of trusting the legacy reader's normalized fallback. Editing a project with an unsupported library/assembly/wall record is conservatively refused. Reads do not mutate IFC, editor history or dirty state.

Edit/save permissions remain dispatcher-owned. Live assistant tools are off by default and follow the window's Settings → Assistants groups. Live edit calls refuse drawing/rebuild conflicts. Undo/Redo protect person-owned steps unless `any: true`; save retains the application's download/dialog behavior and headless allowed-root/overwrite checks. No tool can grant itself permissions.

## Reproducible evidence

Run from this checkout with Node >=20.19:

```sh
npm run fetch-vendor
npm run test:mcp01
node tests/features/mcp01/headless.mjs
node tests/features/mcp01/packaging.mjs
node tests/features/mcp01/browser.mjs
python -I tests/features/mcp01/independent.py .cc-test/mcp01-headless
python -I tests/features/mcp01/independent.py .cc-test/mcp01-package/consumer
python -I tests/features/mcp01/independent.py .cc-test/mcp01-browser
```

Install test-only Python requirements from `tests/features/f01/requirements-independent.txt` in a venv. Browser tests require Playwright (`.cc-test/mcp01-deps/node_modules/playwright/index.mjs`, override with `MCP01_PLAYWRIGHT`); CI pins 1.56.1 and Chromium. Local tests use the available runtime's Playwright 1.62.1 / Chromium 151 on macOS arm64, Node 26.9.0, IfcOpenShell 0.9.0. No mandatory MCP-01 test uses optional-import skip paths. The CI job runs source registration/schema tests, actual stdio, isolated packed workflow, live HTTP/browser calls, and independent validation of all three actual saved outputs.

The common workflow inspects a fixture-authored assembly, duplicates it through Undo/Redo, creates a material, edits layers while retaining cavity ventilation/membranes, preserves an unused definition, creates/assigns walls, checks type versus instance effects/core anchors/openings, changes defaults, tests twelve location-line/orientation combinations and level/fixed heights, then tries 21 invalid/stale/foreign/schema/core/material calls. Headless adds eight malformed persisted-record fixtures, denied edit/save, root/overwrite and separately opened document checks. Live adds busy/ownership/permission, six UI units, original-project isolation, actual download/reopen and stale-token checks.

Independent IfcOpenShell validation checks EXPRESS rules, unique GlobalIds, exact properties, placements, chord endpoints (including preserved existing curves), Body extrusion depths, actual door/window products, IFC material layers, cavity ventilation, zero membranes, unused definitions and unchanged dimension records/points. Each saved workflow contains 23 walls, four authored types, 15 materials and two preserved persistent dimensions, with zero schema findings. Raw IFC files, expected full-model JSON and package archives stay local/ephemeral; reports/catalogs are published, CI uploads explicitly allowlisted reports/screenshots only.

Local regression: 683 standalone checks (optional readers unavailable in that run), then **707 checks with available readers**, zero failures. F02 precision/material/reference tests are included. Additional F28/F03: 14 tests; legacy runner: 7/7 files; existing generic element-agent checks: 22; MCP-01 contract tests: 13. Availability notices for absent sibling library/CivilCraft/CadCraft/TakeoffCraft integrations remain explicit. Historical broad `--draw06` was re-investigated and still terminates on missing sibling `civilcraft/dev/landxml.js`; it is **not a passing check** and was not weakened or replaced with a misleading pass count. The focused new suite supplies required coverage without that sibling dependency.

## Remaining gaps

PERF-F04-01, PERF-F05-01 and TEST-F28-01 remain **OPEN**. Broader semantic MCP catch-up remains open for references/dimensions, view settings, annotations, schedules/legends, sheets, documentation exports and F08 joins/end controls. These tools do not imply parity for those areas. Full app-family legacy `--draw06`, platform/native picker coverage and representative-house performance remain outside this validated standalone scope.

Source implementation, registration, actual transport testing and local packaging are verified separately. A test client connected to both surfaces; **the user's persistent client is not configured or connected by this delivery**. See [connection instructions](MCP-01-CONNECTION.md). No published upstream package is assumed to contain this fork.

Exact source/final revisions and CI outcomes are recorded in the draft PR, `evidence/mcp01/validation.json`, and the final handoff response. The final evidence commit necessarily refers to its parent source revision; CI artifact reports record the exact checked-out delivery SHA.
