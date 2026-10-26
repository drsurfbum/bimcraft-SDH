# F08 — 0.7 compatibility candidate / PM re-review

Status: bounded geometry candidate; draft only. Full feature acceptance BLOCKED.

## Exact inputs and preservation

| Input | Commit |
| --- | --- |
| Original reviewed F08 | `6aad54dafb65909f6f2585c36e8c419cbbaad4ae` |
| Published feature cutoff | `f929205133316b29a4551083792d5712d5ffcabd` |
| Approved integrated foundation | `82da107dfd760199bc943249590812978c1a6082` |
| Reviewed foundation delivery | `90782a41b00c90bcc93c435e693360d3c3353ef9` |
| Pinned upstream 0.7 | `c778c7ca3f83eeecc3e815078417f152b2ca7a94` |

Canonical GitHub pins and foundation adoption record were checked before editing.
The foundation is restored from the verified `foundation-82da107.bundle` (SHA256
`58bb12fad9e6a426f7ae37235e5291014ddaf3c77a8b47cb7c4e519f71c338c5`).
The feature was restored from the verified canonical recovery ref, with cutoff
tree `34e620a4cd2360ba9bbe48b970891a8eb9a881a5`. Both ancestry and connectivity
were checked in a new standalone repository. No F28-C or unaccepted MCP branch
was imported. Backup ref: `backup/f08-cutoff-20261026`.

The original `bimcraft-f08` remains at its reviewed older head with all 11 duplicate
untracked files; the clean `bimcraft-f08-upstream-candidate` stays at the published
cutoff. Their preservation hashes/status are checked independently. The original
history-read issue was not repaired. New work is confined to
`bimcraft-f08-07-candidate`. Local DrSurfBum identity is retained.

## Eight conflicts and capability decisions

| Paths | Resolution |
| --- | --- |
| F04/F05/F06 browser workflows | Retain foundation gates and allowlisted report-only artifact retention. |
| en / es-MX / id catalogs | Retain every foundation key; add F08 join keys, preserving raw enums/settings. |
| model-ops.js | Retain reserveGuid replay and integrated protected-record guards; add F08 join guard. |
| model-slabs.js | Retain PLAN_CUT/multi-level wallsThrough; pass complete wall rows to joins. |

Additional seams: upper-floor `throughScene` preserves complete rows; Copy Level
copies explicit end controls after new wall identities exist and remaps node/T
relations. Cross-level retained references refuse the entire operation. All use
authoritative model operations and existing atomic history; no routing fork.
No new join case, wrapping, snapping, partial-height carving or default-layout
change. Established Properties helper remains; dedicated live-workspace adapter
is deferred. Shared UI overlap with F28-C is limited to complete-row handoff and
the established Properties call; no F28-C code was imported.

## Validation / evidence policy

Fresh local observations (dirty isolated integrated source, not the old delivery):
58 focused F08/foundation/F28 tests pass, zero skipped; 20 are F08 (17 retained +
three 0.7 regressions). Legacy offline/no-Python run passes seven test files with
optional uninstalled sibling package notices, not certified passes. Independent
IfcOpenShell/EXPRESS/Shapely validates seed, edited, multi-level and copied saved
IFC; the 28-case angle/core/orientation matrix retains its original strict bounds.
Intentional disallow/square overlaps in the copied scenario are measured and
preserved, not misreported as clean joined output.

Final source, browser/export observations and exact-head CI will be recorded in
`evidence/f08-07/` after execution. The complete offline vendor audit is locally
blocked by a missing cached CPython-WASI LICENSE; this is not hidden as a pass.
Local server binding is sandbox-denied (EPERM), so real browser and transport
runs use isolated CI. No existing preview/browser project is changed.

Generated F08 fixtures, raw IFC, full expected snapshots and matrix polygons are
local/ephemeral only. Historical raw F08 evidence is removed from the candidate
tip and retained privately; published history is not rewritten. Only allowlisted
metadata/screenshots are published. Existing required regression fixture blobs
remain unchanged from their previously reviewed versions.

## MCP gate and remaining acceptance gaps

At this foundation, MCP-01 #16 is draft/unaccepted at `9224167fe3e2e856c57679065b545d834f52ade1`.
Do not import that branch or change shared registration/history before its
then-approved integration handoff. F08 owns the follow-on implementation of
`wall_joins_get`, `wall_join_end_set`, `wall_join_diagnostics` through the accepted
shared adapter. None is implemented, registered or transport-tested here.
The [concrete contract and actual-transport plan](MCP-CONTRACT.md) covers document/
session binding, stable wall/end IDs, strict inputs/results/permissions, readback,
invalid/unsupported/stale/wrong-document atomic refusals, authoritative operations,
normal and interrupted history, live/headless/packaged transport, save/reopen and
independent saved/export validation. Existing generic wall tools are insufficient.
Inherited MCP transport checks do not prove semantic access to F08 controls.

Adoption queue: MCP-01, F28-C, then F08. This independently prepared candidate must
reconcile and revalidate against the then-approved main before adoption. Keep
PERF-F04-01, PERF-F05-01, TEST-F28-01, MCP01-PM-01, UP07-MEP-01 and broader semantic
MCP catch-up OPEN. Retain closed UP07-PM-01/02 replay/protection regressions.
Assembly/electrical checks do not certify inherited wider MEP schema/severity.

## Preview

Check port 8040 before starting. From this isolated checkout, install verified
vendors and run `devshell/preview-f08.command`, then open
`http://127.0.0.1:8040/` and the generated `fixtures/f08/straight-joins.ifc`.
No active preview is claimed while sandbox listener creation is denied.

No readiness transition, merge, deployment, persistent MCP setup, shared roadmap
edit, default switch or cross-chat message is part of this delivery.
