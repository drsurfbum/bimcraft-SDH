# Connect the local MCP-01 fork

This is an opt-in local client setup; no global configuration or credentials are changed by the implementation. The fork package is private and has not been published. Do not use `npx @getcadcraft/mcp` to test this feature: it can load an older upstream build.

## Build the exact local package

From `bimcraft-mcp-01`:

```sh
npm run fetch-vendor
node --input-type=module -e "import {buildMirror} from './devshell/test.mjs';buildMirror()"
node .cc-test/tools/mcp/pack.mjs --out .cc-test/mcp-package --tgz
node .cc-test/mcp-package/mcp/server.mjs --version
```

Expected package: `@drsurfbum/bimcraft-mcp`, version `0.4.0-mcp01.1`. Build output imports the fork's exact required application and IFC module closure. Missing required modules fail startup. The packer runs `npm pack`, never `npm publish`. `npm_config_cache` may point to a writable local cache if the host restricts its normal npm cache.

## Project-scoped stdio example

Manually add this to the intended project's supported MCP settings, substituting an absolute Node binary if the client cannot find `node`. Choose a narrow folder containing the files the agent should access. The following is an example, not an installed configuration:

```json
{
  "mcpServers": {
    "sdh-bim-mcp01": {
      "command": "node",
      "args": [
        "/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-mcp-01/.cc-test/mcp-package/mcp/server.mjs",
        "--root", "/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-mcp-01/fixtures",
        "--allow", "read,edit,save"
      ]
    }
  }
}
```

Without `--allow`, only read is permitted. Without `--root`, no files are reachable. Save paths must remain inside an allowed root; unrelated existing files require explicit overwrite. An opened source may be saved to itself under existing session ownership rules; prefer a new filename to preserve the original. No models are sent to an external service by this server. A client still decides what it includes in its own AI prompts.

## First calls

The server uses newline-delimited JSON-RPC on stdio. A client initializes with MCP `2025-03-26`, then calls `tools/list` and `tools/call`. Verify version `0.4.0-mcp01.1` and required tools including `materials_list`, `assemblies_list`, `assembly_duplicate`, `walls_edit`; do not infer semantic support from tool counts alone.

Tool arguments below are passed as `{"name":"…","arguments":{…}}` to `tools/call`:

```json
{"name":"ifc_open","arguments":{"path":"f04/layered-plans.ifc"}}
{"name":"model_describe","arguments":{"doc":"d1"}}
{"name":"assemblies_list","arguments":{"doc":"d1"}}
{"name":"materials_list","arguments":{"doc":"d1"}}
```

Use returned values in subsequent calls. For example:

```json
{
  "name":"assembly_duplicate",
  "arguments":{
    "doc":"d1",
    "documentId":"<returned documentId>",
    "expectedRevision":0,
    "sourceKey":"wall-f04-rainscreen",
    "sourceGuid":"<returned source type GlobalId>",
    "key":"wall-agent-copy",
    "name":"Agent-authored rainscreen"
  }
}
```

Inspect again after an edit to obtain the current revision. Recipe edits use `assembly_edit` with its matching `key`/`typeGuid` and a `changes.layers` array from discovery. Modify explicit `t` values in mm; preserve unchanged layer fields. A cavity uses `kind:"cavity"`, `materialId:null`, explicit `t` and `ventilation`. A zero membrane uses `kind:"material"`, a valid material ID, `function:"membrane"` and `t:0`.

```json
{
  "name":"walls_add",
  "arguments":{
    "doc":"d1",
    "documentId":"<returned documentId>",
    "expectedRevision":1,
    "type":"wall-agent-copy",
    "points":[[20000.000123,20000.000321],[25000.000123,20000.000321]],
    "locationLine":"coreCenter",
    "exteriorSide":"right",
    "height":2700.123456,
    "baseOffset":0.123456
  }
}
```

`walls_add` returns new wall GlobalIds in `walls`, and exact records in `values`. For assignment, call `walls_edit` with explicit `walls:["<wall GlobalId>"]` and `changes:{"type":"wall-agent-copy"}`. `material_edit` takes an existing `id` and `changes:{"defaultThickness":222.123456}`; this does not resize existing layers. `walls_list` is exact mm read-back, independent of locale or the UI unit dropdown.

```json
{"name":"walls_list","arguments":{"doc":"d1"}}
{"name":"undo","arguments":{"doc":"d1"}}
{"name":"redo","arguments":{"doc":"d1"}}
{"name":"ifc_save","arguments":{"doc":"d1","path":"agent-result.ifc"}}
{"name":"ifc_open","arguments":{"path":"agent-result.ifc"}}
```

Each edit is one Assistant-owned undo step. A reopen returns a new `doc` and document token. Discover them again; stale session tokens are refused. Full reproducible sequences are executable in `tests/features/mcp01/workflow.mjs`; the independent output checker is `independent.py`.

## Live application

Run `node devshell/serve.mjs --port 8046` after checking availability. Open a file in that exact fork build. The person enables the desired groups in Settings → Assistants and connects their existing supported Studio/window bridge. The installed tool registry is used by that bridge; no permanent DOM adapter is required. Live save invokes the normal download/native dialog, and opening/reopening remains person-driven.

`tests/features/mcp01/browser.mjs` provides a reproducible **test** connection: existing token-protected Streamable HTTP server → isolated Playwright page → real `host.control.handle` → installed adapters → actual application editor. It generates an ephemeral token, keeps it out of reports, listens on loopback, and closes on completion. It does not install a persistent relay in the user's browser or configure a user client.

User-only next step: choose the client/project, add the explicit local stdio example or connect the supported live bridge, and approve only the intended roots/groups. This delivery does not claim that step has happened. New walls may be outside an existing camera; use the application's normal Zoom to fit when needed.
