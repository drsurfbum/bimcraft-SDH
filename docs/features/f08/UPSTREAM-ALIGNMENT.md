# F08-A upstream compatibility and conflict record

Draft PR: https://github.com/drsurfbum/bimcraft-SDH/pull/13.
Original reviewed delivery: `6aad54dafb65909f6f2585c36e8c419cbbaad4ae`.
Approved updated main: `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711`.
Merge candidate: `6c0220b46af594a8b5c02a36ad1b79dab39b5d1e`, with exactly those two
ordered parents. The final evidence commit is a descendant, not a rebase/squash.
Backup: `backup/f08-reviewed-20261024` in the local repository and canonical remote.

Original checkout `bimcraft-f08` stays at the reviewed delivery, with all 11
pre-existing untracked duplicate files untouched. Candidate checkout:
`/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f08-upstream-candidate`.
The feature ref is advanced remotely only after candidate validation; the original
worktree is not switched or reset. No force push, other-owner checkout mutation,
preview termination or browser reload was used. Port 8040 was free; starting a
listener returned EPERM. No active preview link is claimed. The isolated launcher
can be run on the host after vendor setup.

## Conflict resolution and compatibility

Only textual conflict: `tests/features/f28/walls-browser.mjs`. Both sides had fixed
independent-fixture storage leakage. Retain upstream's context factory and its
explicit fresh contexts for original/template/unsupported fixtures. All previous
assertions remain; autosave/recovery is not disabled. TEST-F28-01 stays open because
its broader separate local/recovery completion criteria are not certified here.

`app/model-ui.js` and English keys merged automatically. Compared with approved main,
F08 still has only complete-row forwarding at two outline consumers and the narrow
established-Properties helper import/call (5 added / 3 removed lines). No F28-C
workspace/documentation adapter was imported. Compared with reviewed F08, the
wall/model operations, join algorithm, record reader and plan clipping module have
no changes. Upstream family/MEP/model/unit work comes solely from approved main.

The helper reads labels from `t()` and uses raw `a/b`, boolean `allow` and
`envelope/square` values. Add the F08 keys to `es-MX` and `id`; retain English and
pseudo-locale behavior. The complete browser test now proves the six global display
units and three real server catalogs preserve raw geometry and records, with a
localized end edit and Undo per catalog. No new metadata version or migration.
Existing cavity, membrane, opening, reference, section and schedule semantics stay
within their prior bounds. Curved joins, interior-X splitting, unequal-height joins,
finish wrapping, snapping and general Join Geometry are not expanded.

PM overlap with F28-C: preserve the narrow `model-ui.js` complete-row/helper seam and
additive `join.*` / `contract.wallJoin` translations when integrating that feature.
No message was sent to its owner; no F28-C source or branch was merged. Its dedicated
live-workspace join adapter remains deferred.

## Validation evidence

Candidate local: 705 baseline checks across 14 stages; F08 17/17; F28/F03 14/14; seven
legacy test files 7/7. Optional sibling/readers/npm availability notices are retained
in logs, not counted as passes. An initial baseline setup failed for absent vendored
files, then passed after copying the already pinned local vendor cache. The first
legacy invocation attempted package installation and was interrupted; the complete
offline legacy run passed with explicit optional package notices.

Candidate F08 HTTP/browser: **35/35**, zero application exceptions or unexpected
console messages. Includes actual per-end controls, shared imperial finish edit,
core anchors, hosted opening/dimension identities, Undo/Redo, actual downloaded IFC
reopen, separate original, real CSV/vector exports, 18 locale/unit read-only cases,
three translated control checks and three localized edit/Undo checks. It uses fresh
contexts for independent files. PHP catalog checks are required, not skipped.

Independent Shapely/IfcOpenShell/vector checks: 28 angle/core/orientation cases;
zero supported fixture overlap; ideal-envelope symmetric difference
`6.313891375338436e-9 mm²`; 0.001 mm² union and 0.00001 mm² overlap bounds unchanged.
Seed, edited and browser-downloaded IFCs each have 16 walls and zero schema/EXPRESS
findings. Actual detail: 65 vector fill polygons, maximum boundary error
`0.000002311514 mm`, no raster XObjects. Whole plan: 1292 vector vertices, zero outside
the page. Actual schedule CSV: 11 layer rows. Existing assertions were retained.

Candidate CI covers Tests, F04/F05/F06, F28-A/B, F08 and upstream compatibility.
The final evidence commit must pass all applicable workflows again after publication.
Exact run IDs/results are retained as text reports and in PR metadata. All IFC/CSV/PDF
bytes are validated locally or ephemerally; new model/export payloads and full model
snapshot JSON are excluded from artifact retention and base64 log embedding. Already
reviewed tracked fixtures are reused by their existing Git blob identities; no new
IFC/CSV/PDF payload is committed or uploaded.

The existing actual MCP stdio smoke also passed locally: 31 tools discovered, one
saved/reopened wall, zero after Undo, zero independent schema findings. This is
inherited behavior only. Definition audit finds no join tool registration.
[MCP-CONTRACT.md](MCP-CONTRACT.md) provides proposed tools/schemas, document/session
and wall/end IDs, structured errors/results, shared operations, permissions and an
actual-transport plan. It is a blocking **GAP**, not implemented parity. No dispatcher,
MCP definition or transport module was modified.

Measurements use approved updated main as the before baseline and identical fixture
bytes, with warm/no-op and forced regeneration boundaries recorded separately.
Mac samples are separate from CI/Linux; no performance speedup or responsiveness
claim. PERF-F04-01, PERF-F05-01, TEST-F28-01 and MCP catch-up remain OPEN.

Full F08 remains partial. PR stays draft; no mark-ready, merge, deployment, roadmap
change or default-layout switch. Full feature acceptance remains blocked on actual
semantic MCP access unless the user explicitly decides to defer it.
