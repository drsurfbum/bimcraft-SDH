# F28-C final source evidence

Approved base: `3e42c21e33e642d1e07bea2fc3356344f91db00e`.
Frozen source: `eb389b64c21dc2ab245fc9c94866a997f8757996`.
Delivery: published evidence commit containing this file; exact SHA and CI results on that SHA are in [draft PR #12](https://github.com/drsurfbum/bimcraft-SDH/pull/12). Application and behavioral-test trees are frozen at the source above. Full [handoff](../../docs/features/f28/F28-C-HANDOFF.md) and [action checklist](../../docs/features/f28/F28-C-COMMANDS.md).

## Results and environment

[Browser report](browser.json): **39/39**, zero application exceptions; Chromium 141.0.7390.37, Playwright 1.56.1, Node 22.23.3, Linux / AMD EPYC 7763; headless SwiftShader. Real annotation and shared-type changes, actual exports/reopen, source/continuation links, isolated original, missing/unsupported sources, protected templates, fallback/links, visible selected drawing and ribbon focus are covered. A separate clean context performs actual dirty-project autosave recovery through the normal modal. The only console error is the real absent library service's HTTP 404; native OS file picker coverage is explicitly excluded.

Local offline baseline: **678 passed, 0 failed**, 13 stages. F02/F04/F05/F06: **21/13/18/23**. F03 **4/4**, focused F28 **13/13**, legacy **3/3 files**. Optional readers, library repository, CivilCraft/CadCraft/TakeoffCraft sibling comparisons are skips, not passes. The earlier no-Poppler 194/195 residential minimum failure remains in the before log; a real bundled Poppler supplies the final passing count. Main CI also executes installed-reader independent IFC/PDF checks.

| Frozen-source workflow | Run |
| --- | --- |
| F04 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40058662322) |
| F05 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40058662292) |
| F06 browser acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40058662290) |
| F28 live workspace acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40058662298) |
| F28-B wall workspace acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40058662305) |
| F28-C documentation workspace acceptance | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40058662320) |
| Tests | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40058662321) |

Delivery-head CI is a fresh run on the final published commit, linked in PR #12. Source results are not substituted for that check.

[Independent actual-file report](independent.json): zero schema findings; 2 walls / 9 types / 2 persistent dimensions / annotation and callout / 3 sheets; 53 assembly layer CSV rows and 15 legend rows; eight vector PDFs, no raster XObjects. Actual IFCs are generated, downloaded, reopened and independently read inside CI, then excluded from uploads.

[Actual CSV, vector PDFs and full review artifact](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40058662320/artifacts/12546263840) (no IFC files). ZIP digest `sha256:d87924cd2753974f11ec618f2c29bb22455667db7cd077bd25c869be5a0afdbc`; current expiry **2027-01-22T03:31:36Z**. [Artifact metadata](source-artifact.json). Permanent reports and inspected screenshots/export renders are committed here.

## Visual review and raw measurements

[Screenshots](screenshots/) include prior F28-B, plan, selected wall, section/elevation, schedule, both saved sheets, narrow window and missing source. [Export renders](exports/) come from actual downloaded section, composed sheet, schedule page 2 and legend PDFs. All four export PNGs are byte-identical to the already inspected earlier renders and were checked again for final source attribution. No image editing. Dense existing plan dimensions remain crowded on this small fixture; this is not a representative-house claim.

[Performance boundaries and tables](PERFORMANCE.md), [raw local samples](performance-node-delivery.json), browser raw samples in `browser.json`, and same-runner Node raw samples in the artifact. GPU completion and interaction latency are not measured. PERF-F04-01 and PERF-F05-01 stay OPEN.

TEST-F28-01 stays OPEN: full local execution is still required. This session could not bind even the free preferred port (`listen EPERM`); no product recovery behavior was disabled. The launcher is supplied; no local browser run or active preview is claimed.

## History and publication boundary

`browser-attempt-1` through `browser-attempt-4` and their Actions runs retain real failures. Attempt 1 exposed transient closed-model reads and selection loss; attempt 2 reached native picker automation; attempts 3/4 exposed recovery harness waiting/lifetime mistakes. The passing source uses clean independent contexts and awaited read-only storage/lock polling, preserving normal autosave and every refusal assertion. The B PM's original recovery failure remains in the review/integration record. No test is relabeled green.

Automatic approval rejected publishing the synthetic IFC fixture because model publication was not specifically authorized. The fixture is now generated in ignored scratch from the existing F05 fixture. No IFC bytes are committed or uploaded, and no alternative upload was attempted. Reports, PNGs, actual CSV and PDF evidence remain published. See `.github/workflows/f28-c-browser.yml` for the explicit artifact allowlist.
