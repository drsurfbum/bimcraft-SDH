> Historical foundation-only record. The October 28 approved-main continuation and current closures supersede its old adoption order and agent coverage status: [DOC-MCP-01](DOC-MCP-01.md).

# F28-C 0.7 compatibility — PM re-review handoff

This is a draft compatibility candidate, not readiness or merge authorization. [PR #12](https://github.com/drsurfbum/bimcraft-SDH/pull/12) is advanced normally after preserving its reviewed cutoff; no replacement PR or owner merge cleanup was needed. The PR description records the exact immutable source/delivery commit and final-head CI once those runs finish. **Do not infer final-head success from older attempts.**

## Pins and source identity

- Fixed foundation: `82da107dfd760199bc943249590812978c1a6082`; reviewed foundation delivery `90782a41b00c90bcc93c435e693360d3c3353ef9`; upstream `c778c7ca3f83eeecc3e815078417f152b2ca7a94`.
- Reviewed feature and F28C-PM-01 cutoff: `f956fac00adf1d4d51ddc2e4253fe215a2c50acd`, retained at `preservation/f28-c-reviewed-f956fac`.
- First compatibility merge: `db4592885bff801db2d72b279f7e7076a6050806`, ordered parents foundation then reviewed C. All later changes are additive normal commits. No MCP-01 or F08 branch was imported.
- Application tree for this review: `ba0527002920ecdc4f5b0c52f917e4e686f243d5`; test tree `9844fbc5c45893c43e258039fa2d14700bfdc129`; shared layout host blob `c2b1aff7d7e25b0acaf0c73c920fa941c8494df4`. Source and delivery can be the same commit; exact immutable SHA and matching CI heads are supplied in the PR's completed delivery record.
- Repository-local author identity remains DrSurfBum / `80549907+drsurfbum@users.noreply.github.com`; GitHub-created commit objects were independently recovered from CI metadata and hash-verified locally. No global Git/client/credential changes.

Main was rechecked at the fixed foundation during preparation. MCP-01 has independently advanced its own compatibility work; it remains excluded. Adoption order is MCP-01 → approved main → reconciled/revalidated F28-C → approved main → F08. This candidate must reconcile and revalidate against the then-approved PM cutoff before adoption.

## Preserved owner work

Both owner directories were archived with their entire `.git`, index/stages, working trees and untracked files. Every regular file was verified against the archive and rechecked unchanged after candidate preparation. Original C: 4,194 files, reviewed HEAD, untracked `.DS_Store`. Alignment: 2,878 files, branch `candidate/f28-c-upstream-1afe80e`, HEAD reviewed C, MERGE_HEAD `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711`, staged integration and untracked `evidence/f28-c/alignment/`.

Private recovery location: project `reviews/F28-C-07-2026-10-26/`; archives and manifests remain local, not public repository content. Archive SHA256 values:

- `bimcraft-f28-c-recovery.tar.gz`: `25e02e572c31166822547aa9a1b25c096f539f6a46da75e459acbc19433dbb32`.
- `bimcraft-f28-c-alignment-recovery.tar.gz`: `76609ac259bc055c719d0c70c13195496fad533f5f4e246f855eae38867e9265`.

The alignment's useful unpublished unit-cache fixes and unit/locale/transport audit controls were assessed and selectively ported. Its old shell and staged domain/workflow merge resolutions were not substituted for the 0.7 foundation. No abort, stash, commit or checkout mutation was performed in either owner directory. Existing previews and user browser projects were not reloaded, closed or cleared.

## Migration and agent gate

Read [MIGRATION.md](MIGRATION.md) for the seven conflicts and hosting/lifecycle decisions, [AGENT-CAPABILITIES.md](AGENT-CAPABILITIES.md) for implemented/registered/transport-tested/gap classification and proposed separately owned DOC-MCP-01, and [DEVELOPMENT-ATTEMPTS.md](DEVELOPMENT-ATTEMPTS.md) for failures retained in Actions.

`app/workspace-bimcraft.js` fills the real shared `cc-workspace` host. `app/workspace/engine.js` remains only the native command bridge. The legacy workspace files are not imported at runtime. Existing domain/view/drafting/sheet/schedule/export operations remain authoritative; no parallel model or export implementation was added.

Properties requires displayed source ID AND editor owner at availability and execution, including an unbound palette during project changes. Ribbon/File remains active-drawing scoped. Real source tabs/cameras, View Range/settings, native annotation inputs/hints, type refresh, continuations, CSV and vector PDF use the shared host. Model/source switching goes through the actual visible Model palette and native radio. The all-view host follows actual RCP/callout/source keys and returns from documentation to the native plan. Unresolvable callouts stay in native Missing views diagnostics and are not advertised as drawable tabs.

**Documentation/reference/export MCP parity remains an acceptance gate.** Generic tools and basic transports do not establish meaningful C coverage. The audit initializes/discovers/calls the real source stdio transport, verifies exact loaded fork hashes, checks wrong-document/invalid/custom-type/permission/allowed-root refusals and reports `AUDIT_COMPLETE_GAPS_OPEN`. Foundation controls separately retain live host JSON-RPC and source/packaged stdio lifecycle, package closure and independently read saved outputs. No persistent client setup or MCP exception is claimed. MCP01-PM-01 remains OPEN pending PM verification in its separately owned slice.

## Execution and evidence

Local direct baseline: **685 passed, zero failed, 13 stages, 24 separate availability notices**. Focused retained foundation/F28: **42 passed, zero failed/skipped**. F03 harness: **four passed**. Local listener startup is still refused (`EPERM`), so no local browser/native picker/PHP pass is claimed. Browser and reader results must be taken from the exact-head CI record in PR #12.

Required final-head workflows: Tests; F03; F04; F05; F06; F28-A; F28-B; F28-C; upstream compatibility; 0.7 foundation controls. Preserve all 47 published C checks and all 42 B checks and derive actual totals from reports. C adds native duplicate-source switching and fallback checks; alignment adds six units, real PHP catalogs and all-view source/diagnostic controls. Fresh independent contexts are retained; the dedicated recovery context uses real autosave records, normal session locks and Recover UI. No disabled autosave, forced pointer clicks, removed assertions or synthetic successful exports.

Inspect actual saved IFC with independent IfcOpenShell/EXPRESS and duplicate GlobalId checks, full CSV content, physical layer/cavity/zero-membrane checks and all eight actual vector-only PDF outputs with page bounds. A prior implementation run already independently validated two walls, nine types, two dimensions, one drafting annotation, callout/sheet references, three sheets, 53 assembly-layer CSV rows and 15 legend rows; that historical output does not replace final-head results. Current reports and inspected captures will be linked in the final PR record.

New public artifacts use allowlisted reports/screenshots only. Actual IFC/CSV/PDF payloads, full snapshots, recovery archives and package archives stay local/ephemeral. The candidate's C workflow retains named screenshots (plan, section, schedule/sheet outputs, narrow view and Properties targets) plus independent reports; no broad payload-directory upload.

## Preview and concrete acceptance gaps

Isolated candidate directory: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f28-c-07`. Run `devshell/preview-f28-c.command` after checking availability; it refuses an occupied **8059**, preserving other previews. Open `http://127.0.0.1:8059/?workspace=live&space=paper`. Root/default remains the established layout; use its explicit Live workspace entry, Settings or Established layout fallback. This session has no active candidate listener.

1. Implement/register/transport-test meaningful documentation/reference/export access on an approved post-MCP-01 main. The bounded DOC-MCP-01 proposal is in the matrix; no exception or silent closure.
2. Reconcile this exact candidate with the then-approved main after MCP-01 adoption, and repeat affected integration/browser/transport/output gates.
3. Keep PERF-F04-01, PERF-F05-01, TEST-F28-01, MCP01-PM-01, UP07-MEP-01 and broader semantic MCP catch-up OPEN. UP07-PM-01/02 are CLOSED at the foundation; their replay/electrical and strict assertion-comparison tests remain required. Assembly/electrical IFC checks do not certify wider inherited MEP schema/severity behavior.
4. Native OS pickers, missing external sibling/library services, detached windows/full cross-platform use, broader translation/theme usability and representative-house performance are not certified here. Synchronous draw/generation timings are not GPU completion, interaction latency or a speedup claim. Inherited small-fixture label crowding and WinAnsi PDF text limits remain.

No readiness transition, feature merge into main, deployment, default-layout change, shared-roadmap edit or cross-chat message.
