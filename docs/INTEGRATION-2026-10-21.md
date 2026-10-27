> Historical snapshot as of October 21, 2026, preserved from PR #3. Its feature states, preview PIDs and next-step instructions describe that date, not the present. For current approved work and follow-ups use [PROJECT-STATUS.md](PROJECT-STATUS.md). No historical validation is claimed as a fresh run.

# Internal residential prototype integration — 2026-10-21

Scope: integrate the reviewed wall/material/dimension prototype and F01, with validation between merges and after main integration. This is internal prototype acceptance, not a residential working-release declaration. F02/F03 remain unstarted; M0 still requires both.

## Authorization and exact commits

The user approved integration of PR #2 into PR #1's branch, validation, then integration of updated PR #1 into main and another validation. The user also explicitly confirmed marking both drafts ready as required for merging after automatic approval review initially blocked that transition. That approval issue is resolved.

| Stage | Result |
|---|---|
| Reviewed prototype | `72664187a1cc2694d1f8972fd2e1aa5b46106bc3` |
| Reviewed F01 | `6c77bceaa24d244a659b619221725bf8aee07844` |
| [PR #2](https://github.com/achartt/bimcraft-SDH/pull/2) merged into `feature/wall-assemblies-dimensions` | `994e4168609316d17ada992bb0dbef473f52ed18` |
| [PR #1](https://github.com/achartt/bimcraft-SDH/pull/1) merged into `main` | `1c35f47d69af2214b4747f541703224d0a4a4742` |

Both merges use merge commits, preserving reviewed history. Both PRs were verified closed and merged. The prototype merge and main merge have the same tree as reviewed F01 (`b9c980aae0fe953545361ace7c6a4dd96816d4d1`); neither merge introduced additional application changes. Main before integration was `5d0e2b1cb59e3f28e72fed8c5fc6004d44564832`.

## Validation

An isolated clone at `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-integration` fetched each actual merge commit. Tests ran with clean tracked Git state at each commit, before documentation changes. Node was 26.9.0. The vendor cache was copied from the previously validated clean setup and every required file was verified by the offline runner; this was not another fresh-download experiment.

| Check | Prototype merge `994e416` | Main merge `1c35f47` |
|---|---|---|
| `npm run test:baseline -- --offline` | 603 passed, 0 failed | 603 passed, 0 failed |
| Independent IFC acceptance | Six committed/generated IFC files passed; three malformed-export controls rejected as expected | Six committed/generated IFC files passed; three malformed-export controls rejected as expected |
| Offline startup/HTML smoke on temporary loopback port | HTTP 200, BimCraft page served; server stopped afterward | HTTP 200, BimCraft page served; server stopped afterward |
| Git tree equality to reviewed F01 | Exact match | Exact match |
| GitHub workflow | [39663665468](https://github.com/achartt/bimcraft-SDH/actions/runs/39663665468): success | [39664140382](https://github.com/achartt/bimcraft-SDH/actions/runs/39664140382): success |

Local pass counts comprise precision 7, materials 8, model 122, comforts 103, views2 104, residential 195, lifecycle fixture 1, source-sync contracts 44 and runner contracts 19. Optional local reader/PDF/sibling-app/library checks were explicitly skipped, not counted as passes. Dedicated independent IFC validation used the existing isolated Python 3.12 / IfcOpenShell 0.9.0 environment, separately from those skips.

Both prototype and main CI passed 607 standalone checks, six-file independent IFC acceptance plus three negative controls, 3/3 legacy test files and 625 installed-reader checks. The main push workflow's completed/success state and exact head were independently confirmed. CI runs on Node 22 with PDF tooling and independently installed readers. The missing sibling-app/library comparisons remain distinguishable from actual executed checks.

Independent acceptance covers schema/EXPRESS rules, Body geometry, actual dimension curves, material layers, stable IDs/references, and missing hosts. Each integration stage generated a new synthetic fixture trio without replacing the committed fixtures. Commands:

```sh
npm run test:baseline -- --offline
node tests/features/f01/fixture.mjs --output-dir .cc-test/integration-main-generated
/private/tmp/f01-independent-validation-20261021/venv/bin/python -I \
  tests/features/f01/independent.py fixtures/f01 .cc-test/integration-main-generated
```

For a new computer, create the independent environment using `docs/features/F01-INTEGRATION-BASELINE.md` rather than relying on the temporary Python path above. The prototype stage used `.cc-test/integration-prototype-generated`.

Prior fresh browser round-trip and selected real immutable-upstream evidence is retained in `docs/features/F01-HANDOFF.md` and `evidence/f01/independent/`. It was not repeated here and is not represented as a new PM browser test. Tree equality ties that evidence to the integrated application. Startup smoke is not UI acceptance or a packaged release build.

## Accepted follow-ups

All four remain open. The user accepted them for internal prototype integration, not as resolved behavior. Do not expand F01 or silently change geometry/material semantics to conceal them.

| Tracking ID | Known limitation | Proposed ownership / completion evidence |
|---|---|---|
| INT-01 | Missing/clipped preview icons and labels, especially PHP-free/narrow views | Bounded UI follow-up coordinated with F09. Verify the affected toolbar/menu actions have visible, usable controls in PHP-free and generated shells at representative widths; record screenshots. |
| INT-02 | Short dimension labels can disappear at whole-plan scale | Annotation/layout slice coordinated with F19 and drawing output. Define readable placement without changing measured values; verify plan and PDF/sheet scale/overlap, including short dimensions. Detail export currently provides readable values. |
| INT-03 | web-ifc cavity material/color diagnostics despite valid null-material cavities and passing geometry/identity checks | Interoperability follow-up coordinated with F26. Retain reproducible external-reader evidence and distinguish appearance from geometry. No artificial cavity material or membrane thickness solely to silence diagnostics; verify IFC2X3/IFC4 compatibility for any proposed change. |
| INT-04 | Unsupported-version error messaging needs improvement | F02 precision/reference/migration contract. Unknown material/assembly/reference records must be preserved/refused safely with visible, actionable feedback; no silent overwrite or plausible stale measurement. Add behavior tests and UI evidence. |

Other roadmap limits remain: arbitrary imported-wall editing, complex joins/wrapping, per-layer plan/section graphics, assembly schedules, advanced roof/component workflows and measured performance. Wall quantities still describe envelopes. IFC2X3 physical layer sets omit zero-width membranes while complete recipe/library records retain them; IFC4 retains zero-width layers. No fake thickness is permitted.

## Workspace and next steps

- Existing `bimcraft-dev` and `bimcraft-f01` application checkouts were not switched, reset or pulled. Their existing previews on ports 8015 (PID 8100) and 8016 (PID 33157) remained running at verification. Local checkouts do not automatically move when remote branches merge.
- Integration tests used their own `.cc-test` directory. Local evidence is under that directory and `/private/tmp/bimcraft-integration-{prototype,main}-*.log` / `*-ifc.jsonl`; CI provides remotely retained logs/artifacts.
- Known limitations and integration status are recorded by a documentation-only follow-up. It does not change the reviewed application baseline.
- F02 and F03 can use exact `main@1c35f47d69af2214b4747f541703224d0a4a4742` after their briefs are pinned and the user starts their separate chats. No implementation, delegation or cross-chat message was initiated.
