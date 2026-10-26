# Current update — 0.7 foundation compatibility, October 26, 2026

The new isolated candidate is `bimcraft-f08-07-candidate`, branch
`candidate/f08-07-20261026`. It preserves published F08 cutoff
`f929205133316b29a4551083792d5712d5ffcabd` and merges approved foundation
`82da107dfd760199bc943249590812978c1a6082` with both parents retained.
Merge source `e470ab54f530b6f517af257bbc193010f02f42bf`; final published delivery and
exact-head CI are recorded in draft PR #13. See [the current PM re-review handoff](f08/FOUNDATION07-HANDOFF.md).
Earlier evidence below remains historical and is not an observation of the 0.7 candidate.
**Full F08 acceptance remains BLOCKED by unimplemented semantic join tools.**

---

# Current update — approved upstream integration, October 24, 2026

Original reviewed delivery: `6aad54dafb65909f6f2585c36e8c419cbbaad4ae`.
Approved updated main: `1afe80e78a42aa27ee9af5d1ac937cd38cd1b711`.
Validated merge candidate: `6c0220b46af594a8b5c02a36ad1b79dab39b5d1e`.
Draft PR #13 remains the delivery surface. The final published head and exact-head
CI are recorded in its description and delivery response.

See [upstream compatibility and conflict record](f08/UPSTREAM-ALIGNMENT.md), the
unchanged geometry envelope in [supported cases](f08/SUPPORTED-CASES.md), and the
[proposed semantic MCP contract](f08/MCP-CONTRACT.md).
**MCP join/end coverage remains GAP and blocks full feature acceptance.** No new
join tools or broad dispatcher changes were implemented. F28-C remains separate.
No readiness, merge, deployment, default-layout or shared-roadmap change.

The current candidate is isolated at `bimcraft-f08-upstream-candidate`. The original
`bimcraft-f08` checkout and its 11 pre-existing untracked duplicate files are
preserved. Backup ref: `backup/f08-reviewed-20261024` (local and remote). Port 8040
was free but listener creation is still sandbox-denied; no active preview is claimed.
The launcher is `devshell/preview-f08.command` in the isolated candidate.

The historical handoff below describes the earlier delivery and its old baseline;
it does not override the approved updated main above.

---

# F08-A — Straight-wall joins and ends

Bounded implementation delivered for draft PM review; full F08 remains partial. Exact approved base: `3e42c21e33e642d1e07bea2fc3356344f91db00e`. Owner: this F08 feature chat; isolated `bimcraft-f08`, branch `feature/f08-wall-joins`; canonical repository `drsurfbum/bimcraft-SDH`. Repository-local author was set to DrSurfBum / 80549907+drsurfbum@users.noreply.github.com before environment loss. No global Git configuration changed.

The earlier environment disconnected during the retained audit. The continuation recovered and hash-verified the published Git history and source tree; the local feature checkout now preserves that history. Port 8040 was free but its listener was denied with EPERM. No active local preview is claimed. Run `devshell/preview-f08.command` after vendor setup on a normal host and open `fixtures/f08/straight-joins.ifc`.

Geometry: one closed envelope per wall, core-face-first seams, transient through-T segments stitched into the original wall identity. Supported: L 30°–150°, true T within 1 mm of axis, four-end X; 2–4 rays, equal bases/tops within 0.005 mm, intersecting core strips, ≤2000 mm physical width, bounded seam extent and valid positive-area profiles. Generic preview rows and components involving curves retain inherited cleanup. Interior/interior crossings, collinear two-wall splices, near-face T repair, unequal heights and short/invalid seams retain safe geometry and diagnostic feedback. Full F08 remains partial.

End settings: separate `CadCraft_WallJoin` / `Settings` version-1 JSON. Per end `allow` and `cap` (`envelope` or `square`) affect physical IFC and plan/vector cleanup. Closed envelope caps are not decorative wrapping. Absent records are transient defaults; valid legacy unversioned records migrate only on explicit edit. Unsupported/corrupt/duplicate/missing records refuse synchronized edits and remain preserved.

PM seam: F28-C draft #12 remains untouched and is not the base. Narrow shared `model-ui.js` changes retain complete wall rows and call the separate established-Properties helper. Other derived outline consumers retain full metadata. No workspace files, bimcraft.js, res-ui.js or views-ui.js changed. A dedicated live-workspace join adapter is deferred. Keep both F28-C and F08 additions during integration.

Verified source and delivery evidence are described below; final delivery CI must be checked on the exact PR head. PERF-F04-01, PERF-F05-01 and TEST-F28-01 stay OPEN. No readiness change, merge, deployment, roadmap edit, default-layout switch, owner message or delegation.

## October 24 continuation

Recovered published source `2b43e92040750ec8766b130e0d54fb16a667eb5f` and verified all eight exact commit hashes and its complete source tree `e44a44554f76940db0d30800ed2016df1e38c26b`. Local checkout now preserves that history. An independent local spike is retained on `archive/f08-local-spike-20261024` and is not proposed for integration.

At recovered source: F08, Tests, F04/F05/F06 and F28-A workflows passed; F28-B failed at the known autosave dialog intercept during independent fixture opening. Narrow follow-up gives every F28-B independent page a fresh browser context, retaining real autosave and every assertion. TEST-F28-01 remains OPEN pending its separate local/CI recovery criteria. Fixture plan scale is now 1:200 so the complete synthetic matrix fits the actual A4 UI export; enlarged T detail remains 1:10.

The continuation's local baseline passes all 14 stages: 699 checks, including F08's 17 tests. F28/F03 focused checks: 14 passed. Browser/export evidence from each exact source is retained separately from delivery-head results. A fresh exact-head CI run is required after the final evidence commit.

Automatic approval review rejected a PDF upload to GitHub, citing potentially sensitive content and an unverified destination. Generated/exported PDFs stay local or ephemeral in CI; this continuation removes raw PDF retention and PDF log embedding from the F08 workflow. Independent checks still read the actual bytes. No PDF upload workaround is used.


## Validated source and review evidence

Draft PR: https://github.com/drsurfbum/bimcraft-SDH/pull/13. Application source: `2b43e92040750ec8766b130e0d54fb16a667eb5f`; browser-isolation/plan-scale source: `346745709c2f3c17366904f904e8c0e8f6f9f0d3`. Delivery is the final PR head, with its exact SHA and CI links in the delivery response. The evidence increment adds saved synthetic IFCs, text evidence, a whole-plan media-box check and a rendered whole-plan review frame; no model operation changes after these source heads.

At `3467457`: F08 browser 11/11, zero exceptions/console messages; F04/F05/F06 and F28-A/B browser workflows pass. Tests workflow validates baseline, F03 and independent F02/F04/F05/F06 exports. `evidence/f08/source-browser-report.json`, `source-independent.json` and `source-performance-linux.json` identify the exact source head; final-head workflow artifacts identify the delivery head.

Independent checks on actual saved/downloaded IFCs: 16 walls each, zero EXPRESS/schema findings; stable wall/type/reference identities, hosted opening relations, cavity ventilation and zero membranes. Vector detail: 65 fill polygons, maximum world-boundary error 0.000002312 mm, no raster XObjects; actual CSV: 11 layer rows. The 28 angle/orientation/core cases retain the 0.00001 mm² overlap and 0.001 mm² ideal-envelope bounds. Fixture ideal-union difference is 0.000000006314 mm² and positive-area overlap is zero. The inherited acute-envelope discrepancy (62095.3075 mm²) is retained and explained by the independent support-line oracle, rather than using the old result as the correctness oracle.

Actual source-downloaded IFC: `evidence/f08/browser-saved.ifc`; seed/edited files and regenerated preview fixture are also retained. The whole-plan export fits A4 at 1:200; T detail is 1:10. Local Poppler renders were visually inspected. Dense matrix dimensions remain a test fixture, not a reviewed residential drawing set. PDFs are generated and checked but are excluded from new remote publication after automatic approval rejection.

Same Linux source run, AMD EPYC 7763 / Node 22.23.3, five warmups and thirty unfiltered samples:

| Boundary | Before p50 / p95 ms | F08 p50 / p95 ms |
| --- | ---: | ---: |
| Outline only | 0.461 / 0.840 | 1.026 / 2.006 |
| Warm no-op regeneration | 1.429 / 1.840 | 1.554 / 2.347 |
| Forced IFC regeneration | 4.419 / 9.441 | 5.254 / 9.627 |

This is added correctness work with measured cost, not a speedup claim. Separate Mac raw samples are retained in `local-performance-mac.json`; no pooling across machines, GPU/gesture claim or resolution of PERF-F04-01/PERF-F05-01. TEST-F28-01 remains open: the F28-B harness isolation fix is narrow; its separate local/recovery completion criteria are not closed here.

Remaining delivery limitation: sandbox listener denial prevents an active local preview. The launcher and fixture work in CI HTTP/browser execution; start `devshell/preview-f08.command` on the host to use port 8040. Do not mark ready, merge, deploy, reconcile the shared roadmap or switch the default layout.
