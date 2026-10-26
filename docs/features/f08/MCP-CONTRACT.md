# F08-A semantic MCP contract

Implemented on approved main `21ff2842e1925f148e9b75c404476b59333f7475`, which
includes accepted MCP-01. MCP01-PM-01 remains CLOSED. This document replaces the
previous proposed adapter and missing-Redo assumptions. Final-head transport and CI
evidence belongs to [SEMANTIC-HANDOFF.md](SEMANTIC-HANDOFF.md); implementation alone
does not establish a connected user client or authorize adoption.

## Shared API and identity

`wallJoinTools(env)` is part of `modelTools(env)` in `app/agents.js`. The accepted
live installer, headless wrapper, dispatcher, permissions, package import closure,
editor and history remain authoritative. Geometry is exclusively `changeWall`,
regeneration and existing readers; no second model, journal or dispatcher exists.

| Tool | Permission | Live / source stdio / packaged | Required arguments |
| --- | --- | --- | --- |
| `wall_joins_get` | read | all | `documentId`, `wall` |
| `wall_join_diagnostics` | read | all | `documentId`, exactly one of `walls` / `storey` |
| `wall_join_end_set` | edit | all | `documentId`, `expectedRevision`, `wall`, `end`, `patch` |

Obtain `documentId` and `revision` from `model_describe` on the intended editor.
`projectId` is IFC identity, **not** authorization: two editors with the same
project/wall IDs and names have different document instance tokens. Headless calls
also require the existing `doc` handle from `ifc_open` / `ifc_new`; it does not
replace `documentId`. Reopen produces a new token. Closed handles, foreign tokens,
stale revisions, busy and read-only edits refuse before mutation. Shared guards
recheck the original editor/revision immediately before the first commit; replay
uses the existing operation without reusing an obsolete request binding. The
headless closure also rechecks that its handle still owns the same session.

Wall and storey selectors are explicit 22-character IFC GlobalIds. Duplicate wall
GlobalIds are ambiguous, including a collision with another product. Selection,
names and STEP IDs never supply an implicit wall. Ends are literal `a` / `b`, with
stable `endId = wall + ':' + end`, tied to the analytic axis. Axes are not reversed,
split or replaced by these tools. Internal `node` and `tee` relations are read-only.

Schemas reject unknown top-level and nested fields; booleans/enums are strict.
`patch` must contain `allow:boolean` and/or `cap:'envelope'|'square'`, with at least
one field. Revision is a nonnegative integer. Diagnostic scope is one unique list
of 1–1000 wall IDs or one exact storey ID. Schema assertions execute on actual
source and packaged catalogs, with identical live/shared definitions apart from
the existing headless `doc` field.

## Reads and diagnostics

`wall_joins_get` returns shared document state, `wall`, `record`, `ends`, raw-mm
`geometry` (axis, world base, height and actual stored physical profile),
`diagnostics` and `supportedScope:'F08-A-straight'`.

| Record classification | Persisted data | Effective settings | Edit behavior |
| --- | --- | --- | --- |
| absent | `present:false`, `version:null`, `persisted:null` | transient legacy defaults | explicit edit migrates undoably |
| legacy | present, unversioned payload, version 0 | authoritative validated v1 interpretation | explicit edit migrates undoably |
| supported | present v1 payload | authoritative validated settings | changed values edit; same values no-op |
| corrupt | invalid payload/fields | null | refuse |
| duplicate | multiple join property sets | null | refuse |
| unsupported | explicit unsupported version | null | refuse |

Reads never migrate, capture topology, journal or dirty the editor. Invalid records
have no invented settings. The reader's `issue` is retained; duplicate property
names within a single set classify as corrupt. A valid empty diagnostic list is
not a success certificate for a joined end.

Each effective end exposes its stable identity, allow/cap, any saved node/T
relations and `joinEligible`. Eligibility only describes the straight end's local
policy; it does not prove a compatible neighbor exists or cleanup succeeded. No
`joined:true` or invented neighbor list is returned. The authoritative operation
may capture previously absent topology as part of explicit legacy migration.
Existing relations and the other end's controls are retained.

Diagnostic calculations receive **all authored rows in every participating
storey**, including continuous T hosts, before filtering requested walls. Stable
codes come from `wallOutlines().diagnostics.reason`, including `height-mismatch`,
`interior-crossing`, `near-face-tee`, `curved-legacy`, `unresolved-core`,
`missing-tee-host`, `tee-outside-span` and the other bounded-geometry refusal codes.
Invalid records additionally expose `record-corrupt`, `record-duplicate` or
`record-unsupported`; square/disallowed controls expose
`independent-square-end` with a known end identity. Geometry diagnostics do not
invent end IDs, related walls or numeric limits that the authoritative reader does
not provide. Codes, mm values and cap enums do not depend on display language or
units. The 1 mm discovery threshold remains distinct from 0.005 mm measurement.
Safe component fallback and intentional independent-square overlap are not claimed
as successfully cleaned joining.

## Mutation, no-ops and progress

The edit resolves the explicit wall, reads its supported record, merges exactly
one end's allow/cap while preserving the other end and internal relations, then
passes the full settings to `changeWall` through accepted `env.apply`. Domain
validation, topology capture, neighboring physical regeneration, hosted openings,
dimensions and the existing atomic journal remain authoritative.

A supported record with the same allow/cap values returns `changed:false`, no
history step and empty affected lists. An absent or unversioned record with the
same effective values is an **explicit migration**, not a no-op: it writes v1,
may capture topology, and remains undoable. Read calls never perform this work.

Successful results include the readback, `before` / `after` end values, `endId`,
`changed`, `completedSteps`, `complete` and an assistant `undo` receipt with the
original editor's documentId/revision and actual history label. This is the
accepted ordinary editor history, not a feature-local ownership token/journal.
`affectedWalls` compares authoritative persisted join records and stored profiles
before/after across the document. `geometryChangedWalls` identifies actual
physical-profile changes separately. Neither comes from screen selection.

Preflight/schema/permission and atomic domain failures leave bytes, both history
stacks, neighbors, openings and dimensions unchanged. Dispatcher refusals follow
accepted MCP-01 `isError:true` plus error text; the old speculative universal error
code contract is withdrawn. Domain diagnostics remain stable machine codes.

A confirmed synchronous mutation followed by a failed awaited notification or a
native project switch returns `isError:true`, `code:'POST_COMMIT_INTERRUPTED'`,
`changed:true`, `complete:false`, completed progress and readback from the original
editor. It never claims rollback or `changed:false` after a confirmed mutation.
The original editor retains its normal undo step; no foreign history is consumed.
Ordinary MCP Undo/Redo, person ownership, awaited rebuild guards and interrupted
history receipts use accepted MCP-01 behavior unchanged.

Save/export permissions, allowed roots, overwrite policy and live downloads remain
separate. Read/edit permission does not grant save/export access. Tests use private
roots and fresh browser contexts; they do not configure a persistent user client
or publish a package. Full model/export snapshots and package/recovery archives
remain local or ephemeral; only sanitized reports, catalogs and screenshots ship.

## Scope and acceptance evidence

Bounded straight L/T and selected endpoint X, matching world base/top, core-priority
cleanup and per-end allow/cap only. Curves, continuous interior-X splitting,
unequal-height carving, finish wrapping, F09 snapping, general Join Geometry and a
dedicated workspace join UI adapter remain deferred. Full F08 remains partial.

Required acceptance runs actual initialization, discovery and calls via live HTTP,
source stdio and an extracted fork consumer; verifies module byte identity and
missing-module startup refusal; exercises both joined ends, all allow/cap
combinations, T/node retention, 24 ordinary Undo/Redo cycles per surface, invalid
inputs, aliases, stale/foreign/closed documents, duplicate IDs, unsupported records,
permissions, native project switching, save/reopen and independent physical IFC
validation. Existing MCP-01 native history/alias, F08 browser/export/multi-level/
Copy Level tests, strict comparison and 28-case matrix remain required.

F08-PM-01 stays OPEN pending PM verification of the final published delivery.
PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01, broader semantic MCP catch-up and
CI runtime headroom stay OPEN. MCP01-PM-01 and UP07-PM-01/02 remain CLOSED.
