# F08-A semantic MCP contract — F08-owned follow-on

Status: **GAP / BLOCKING full feature acceptance**. At the approved 0.7 foundation
`82da107dfd760199bc943249590812978c1a6082`, the original MCP-01 PR #16 intake cutoff was
`9224167fe3e2e856c57679065b545d834f52ade1`; its shared binding/history adapter was not
accepted. A fresh check found draft/unmerged head `e84023e53c98352a07603ccfb36a3e09fac8e8c8`;
main remains the approved foundation and no newer MCP branch was imported. This candidate therefore does not touch shared registration/history seams,
import that branch or create another dispatcher. Reconcile these proposed schemas
against the then-approved adapter and obtain a concrete PM cutoff before implementation.
 This update does not implement,
register, transport-test or connect these tools. Existing MCP behavior is preserved.
The actual upstream `walls_add` transport smoke proves only inherited creation; it
cannot inspect or change the per-end controls. PM may review compatibility work,
but must not accept semantic parity until the F08-owned follow-on supplies the evidence below on an accepted shared MCP adapter.

## Surface and ownership

Extend `modelTools(env)` in `app/agents.js`, sharing definitions between the live
installer and the existing headless wrapper in `tests/tools/cli/headless/tools.mjs`.
F08 owns join registration/transport work after the shared adapter is accepted. This does not expand MCP-01 materials/walls scope. No dispatcher replacement, DOM automation,
new permissions or alternate geometry implementation is proposed here. Existing
`app/bim-agent.js` finding/visibility tools remain unchanged.

| Proposed tool | Group | Live / headless | Capability | Current status |
| --- | --- | --- | --- | --- |
| `wall_joins_get` | read | both | Read effective and persisted A/B settings and compatibility state | proposed; absent/unregistered/untested |
| `wall_join_end_set` | edit | both | Atomically change allow and/or cap on exactly one named end | proposed; absent/unregistered/untested |
| `wall_join_diagnostics` | read | both | Current supported-scope diagnostic codes for named walls/storey | proposed; absent/unregistered/untested |
| Existing wall creation | edit | both | May inherit join geometry | inherited only; no end-control parity |
| Established Properties placement | presentation | live | Exposes the two domain end operations | browser-tested; dedicated live-workspace adapter deferred |

All tools require explicit document binding. Headless `doc` is the existing session
handle returned by `ifc_open` / `ifc_new`, e.g. `d1`. Live calls must name the source
and session document ID from the active transport's document catalog, not infer the
selected object or active plan. The accepted shared-adapter handoff must finalize the adapter's concrete live ID
field without weakening this rule. A reopened file gets a new document instance ID;
a wall GlobalId alone never authorizes a different document. Duplicate GlobalIds
within a document are ambiguous and refused. Names, STEP IDs and screen selection
are not identity substitutes.

`wall` is an authored IfcWall GlobalId (22-character IFC identifier). `end` is the
literal `a` or `b`. The stable end ID is `wall + ':' + end`: it follows that analytic
axis parameter, not the wall's exterior side, displayed start label or coordinates.
Finish/width edits and exterior orientation do not rename it. The tools do not
reverse axes, split walls or generate replacement identities. Internal saved `node`
and `tee` relations are returned read-only; callers cannot set them through this tool.

## Arguments and structured results

Schemas use `additionalProperties:false`, no implicit document or wall defaults.
JSON numbers must be finite; booleans and enums are strict, never coerced from text.
All model lengths/points/diagnostic offsets are raw millimetres; display locale and
unit preferences do not change arguments, persisted records or diagnostic codes.
Descriptions may be localized; machine-readable codes are stable.

`wall_joins_get({doc, wall})` requires read permission. It returns:

```json
{
  "ok": true,
  "document": {"id": "d1", "sessionId": "session-token", "revision": 12},
  "wall": "0F08W000000000000000000",
  "record": {"present": true, "version": 1, "compatible": true, "issue": null},
  "ends": {
    "a": {"id": "0F08W000000000000000000:a", "allow": true, "cap": "envelope", "joinEligible": true},
    "b": {"id": "0F08W000000000000000000:b", "allow": true, "cap": "square", "joinEligible": false}
  },
  "scope": "F08-A-straight",
  "diagnostics": []
}
```

`joinEligible` means the end permits joining; it is not a guarantee that compatible
neighbors exist. Include a separate `joined`/neighbor result only if computed from
the authoritative calculation. Square cap or allow=false excludes joining; all
physical bodies remain closed. This is not decorative finish wrapping.

For an absent record return `present:false`, `version:null`, supported transient
legacy defaults and `compatible:true`; do not write. Valid unversioned records read
as legacy v0. A corrupt/duplicate/unsupported record returns `compatible:false`,
`issue` and no invented effective settings; retain the original IFC bytes. The
record reader supplies the classification; the transport does not migrate it.

`wall_join_end_set({doc, wall, end, patch, expectedRevision})` requires edit permission.
`patch` is a nonempty object containing `allow?:boolean` and/or
`cap?:"envelope"|"square"`; no other keys. `expectedRevision` is a nonnegative integer
from the same document/session read. The accepted shared-adapter handoff must supply/document the revision source
and compare it before mutation; the current feature does not add one. Refuse stale,
closed, foreign, busy, read-only and unsupported targets before starting a journal.
Do not silently retarget to another source. No length-unit string inputs occur here.

Implementation seam:

1. Resolve the explicit document and uniquely owned authored wall; check permission,
   busy state and revision, then use `readWalls` / `readJoinRecord`.
2. Validate end and patch; merge with the supported existing settings, preserving
   untouched end fields and internal `node`/`tee` membership. Refuse unsupported
   metadata rather than overwriting it. A request cannot bypass a curved/unsupported
   control refusal.
3. Call `env.apply(label, changeWall(wallGuid, {joinSettings: next}))`. This invokes
   the existing atomic operation, F02 guards, retained-topology capture, neighbor
   regeneration, hosted-opening updates, dimension sync and journal. No direct
   pset writes or duplicate regeneration implementation in the tool handler.
4. Read back the settings, geometry diagnostics and new revision from that same
   document. Return the actual changed wall/neighborhood IDs and this assistant
   operation's undo ownership token. One successful edit is one undo step; an error
   is zero steps. An unchanged patch must have a defined no-op result and no journal.

```json
{
  "ok": true,
  "document": {"id": "d1", "sessionId": "session-token", "revision": 13},
  "wall": "0F08W000000000000000000",
  "end": "a",
  "endId": "0F08W000000000000000000:a",
  "changed": true,
  "before": {"allow": true, "cap": "envelope"},
  "after": {"allow": false, "cap": "envelope"},
  "recordVersion": 1,
  "affectedWalls": ["0F08W000000000000000000"],
  "undo": {"owner": "assistant", "operationId": "operation-token"},
  "diagnostics": []
}
```

`affectedWalls` must include neighbors whose bodies changed; do not infer it from
selection. `before/after` may include read-only internal relations to prove they
were retained. Successful disallow/square edits may intentionally leave independent
square walls overlapping; diagnostics must distinguish this from claimed supported
cleanup. Returning diagnostics does not make an invalid edit successful.

`wall_join_diagnostics({doc, walls?, storey?})` requires read permission. Exactly one
scope selector is supplied: a bounded unique list of authored wall GlobalIds (limit
1000) or a storey GlobalId. Resolve the full participating neighborhood in that
storey, pass complete `readWalls` rows (`key:guid`) to `wallOutlines`, then filter
results for the requested walls. Never calculate a T using only the selected stem.
Return `{ok, document, scope, diagnostics:[{wall,end?,endId?,code,message,units:"mm",
relatedWalls, limits}], supportedScope:"F08-A-straight"}`. Only include an end when
it is known; do not guess it from proximity. Stable codes come from the existing
`wallOutlines().diagnostics` reasons, including `height-mismatch`,
`interior-crossing`, `near-face-tee`, `curved-legacy`, `missing-tee-host` and
`tee-outside-span`. Keep 1 mm discovery separate from 0.005 mm F02 measurements.
Diagnostic reads must not capture topology, migrate metadata or dirty a document.

Errors return `isError:true` and structured `{ok:false,code,message,document?,wall?,
end?,retryable,changed:false}`. Required codes: `PERMISSION_DENIED`,
`DOCUMENT_NOT_FOUND`, `DOCUMENT_MISMATCH`, `REVISION_CONFLICT`, `BUSY`,
`WALL_NOT_FOUND`, `AMBIGUOUS_ID`, `INVALID_ARGUMENT`, `UNSUPPORTED_RECORD`,
`UNSUPPORTED_GEOMETRY`, `MODEL_OPERATION_FAILED`. Do not suppress domain errors into
apparently successful tool text. No partial IFC/neighbor/dimension updates on failure.
Save/export use existing separate permission groups and allowed roots. End editing
does not grant save, export, overwrite or broader filesystem access.

## Actual-transport acceptance plan (F08 follow-on)

Run the supported stdio MCP server on the exact packaged/fork modules under allowed
temporary roots. Independently verify its loaded module hashes/build identifier;
source tests alone do not establish the packaged/connected catalog. Initialize the
real JSON-RPC transport, call `tools/list`, validate all three schemas (including
headless doc wrapping), then invoke `tools/call`. Also test the live control bridge
on the same build with explicit source binding. Record planned / implemented /
registered / transport-tested / connected independently for both surfaces.

1. Open the bounded synthetic F08 fixture, read both ends and diagnostics; assert
   nonmutating bytes/revision, stable IDs, raw values and the 28-case supported
   geometry matrix. Include a custom core, ventilated cavity, zero membrane,
   persistent core dimension and existing near-join opening.
2. For each end, change allow false/true and cap square/envelope through transport.
   Read back each result and affected neighborhood, compare actual body/plan
   boundaries, then Undo and Redo through the supported transport with operation
   ownership. Assert full semantic restoration, not just a settings flag. Existing
   transport currently exposes Undo; missing Redo must remain a gap until the accepted shared history adapter
   implements/registers/tests it. A direct editor call is not transport evidence.
   Interrupt a pending edit at the shared adapter boundary: assert atomic rollback,
   no foreign history consumption and deterministic retry/readback. Interleave an
   unrelated user operation; assistant Undo must refuse ownership loss without
   undoing that operation. Repeat interrupted Undo/Redo and save/reopen, using the
   accepted shared history semantics rather than a feature-local journal.
3. Save with explicit save permission inside the allowed root; reopen the actual
   saved file as a new document. Read both end settings and diagnostics again;
   independently validate IFC profiles, IDs/layers/openings/dimensions and actual
   vector/CSV output. Export access is a separate permission and may remain an
   identified gap; no DOM-click workaround. Keep raw model/export files local or
   ephemeral unless separately authorized to publish.
4. Open an unchanged original in another document, including an intentionally
   duplicated wall GlobalId across files. Send the old document instance/revision,
   closed handles, wrong-session IDs and a wall owned only by the other document;
   assert refusals before edits and byte-identical unrelated documents. Never fall
   back to active source, selected wall, name or STEP ID.
5. Invalid cases: missing wall/end, end C, empty patch, string booleans, bad cap,
   node/tee injection, unknown keys, null/fractional revisions, nonfinite JSON
   parser values, duplicate IDs, corrupt/unknown versions/duplicate psets, curved
   adjacency and read-only/busy documents. Assert zero journal entries, unchanged
   settings, neighbors, raw body profiles, hosted openings and resolved dimensions.
6. Launch with read only; reads succeed and edits fail. Launch without save/export;
   those operations fail while an authorized in-memory edit remains valid. Test
   forbidden roots, overwrite denial and absent packaged feature modules. Missing
   registration must fail the parity gate rather than silently skip.
7. Repeat across six display units and real language catalogs. Machine schemas,
   booleans/cap enums, mm coordinates, record versions and diagnostic codes stay
   identical. Keep legitimate autosave/recovery behavior and independent fixture
   storage isolated.

Retain sanitized request/response traces, exact build/commit/module hashes, catalog
schemas, permission configuration, counts/refusals and independent geometry reports.
Do not publish raw IFC/CSV/PDF or full model snapshots. Full new-control acceptance
remains blocked until this actual transport evidence exists or the user explicitly
authorizes deferral. PERF-F04-01, PERF-F05-01, TEST-F28-01 and MCP catch-up stay OPEN.
