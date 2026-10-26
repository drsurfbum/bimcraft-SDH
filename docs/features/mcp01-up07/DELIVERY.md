# MCP-01 post-0.7 delivery supplement

Draft PR #16 is submitted for PM re-review. No finding is closed and no adoption/readiness transition is performed.

| Input or source | Exact commit |
| --- | --- |
| Approved integrated foundation | `82da107dfd760199bc943249590812978c1a6082` |
| Reviewed foundation / upstream | `90782a41b00c90bcc93c435e693360d3c3353ef9` / `c778c7ca3f83eeecc3e815078417f152b2ca7a94` |
| Preserved feature/fix cutoff | `9224167fe3e2e856c57679065b545d834f52ade1` |
| Original faulty control | `64000d39e6a194e83053a84c90c95d349125ef6c` |
| Compatibility merge / final application source | `e84023e53c98352a07603ccfb36a3e09fac8e8c8` |
| Native-switch observer compatibility correction | `f70a3736d38ef2047ea85d832bad4c2abd8fae67` |
| Retained DF.25 catalog/operation source | `a370cf3c7b5c265af83c744b67bab33673e5068b` |
| Final source, including resolved-alias transport proof | `31f7e9167f16f084bc1311a17271921a3c674bc4` |

The evidence delivery is the commit containing this supplement and `evidence/mcp01/up07-candidate/alias-transport/`. Its immutable SHA and all ten exact-head CI links are recorded in PR #16 after publication. No earlier-head result substitutes for that delivery. The application tree is unchanged after the compatibility merge; subsequent commits strengthen acceptance evidence and handoffs. The merge has exactly the preserved feature cutoff and foundation as ordered parents. Both full histories and the original clean owner checkout remain preserved.

## Actual validation

- 42 mandatory contract/history/compatibility tests; 38 retained foundation/F28 tests; zero required skips.
- 31 retained DF.25 assertions. The optional in-process reader notice is separate; mandatory independent workflows use the required reader.
- 709 direct reader-enabled baseline passes, zero failures, four availability notices. The local full offline entry failed on missing pinned WASI assets; direct stages are not a full offline audit. CI retains full retrieval/verification gates.
- Real stdio: 14 workflow checks. Private isolated package: four packaging checks plus the full 14-check workflow. HTTP/browser: 19 checks plus two separate native-history repeats of three checks each.
- All three actual primary MCP saved IFC outputs independently pass: 23 walls, four authored types, 15 materials and two preserved dimensions each, zero EXPRESS/schema findings. Each surface's persisted shared-property alias fixture independently validates too. Retained 38-file replay/electrical validation is clean within its documented scope, including all 33 electrical kinds; this does not certify wider inherited MEP conformance.
- Independent F02 precision, F04 IFC/vector-PDF, F05 IFC/vector-PDF and F06 IFC/CSV/vector-PDF scripts complete locally without errors. Final CI retains them.
- The original faulty control reproduces A-then-B Undo. Corrected 9224167 passes all original 32 focused tests and two new real browser native-switch repeats. The integrated candidate preserves honest partial progress and exact replacement-project byte/both-history-stack isolation.
- The retained release/candidate matrix has zero missing named assertions. With the matching pinned PDF.js dependency and available local sockets, `plans` executes 41 passes and `ops` 166 passes on both exact controls. Missing-sibling `draw06`, `families` and `mep` remain control failures, not passes. Optional IFC-reader availability is equal in that original matrix; mandatory reader-enabled validations run separately.

Local: macOS arm64, Node 26.9.0, Playwright 1.62.1 / Chromium 151.0.7922.34, IfcOpenShell 0.9.0 and available independent PDF readers/Poppler. CI: Ubuntu, Node 22, Playwright 1.56.1 / Chromium 141, IfcOpenShell 0.9.0. Source-time reports retain their actual source SHAs; the latest alias evidence is a separate supplement, preserving earlier reports.

## Historical failures and evidence refinements

The first candidate [MCP CI failed](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40354373209) its native-switch assertion: the observer missed 0.7's idle boundary and both steps completed on A; B was untouched. The observer now checks the same final DOM notification again in its next queued microtask after the application's guard continuation clears busy. No production delay, mocked dispatcher/history mutation, disabled switching or removed isolation/no-error assertion was introduced. [Refined source MCP CI](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40360300751) passed, including repeats; this is preliminary evidence, not a final-head substitute.

Superseded evidence delivery f43f40a passed 29 DF.25 operation assertions but failed two stale pre-MCP catalog expectations. They now require exact expanded four-read/20-model-tool named unions, preserving every prior tool and operation assertion. This subsection runs mandatorily in CI despite the broad suite's earlier missing sibling.

Superseded df55e5d's focused alias fixture could pass on an unresolved-property error because it inserted a test-only set after the property's index was cached. The fixture now refreshes that index, proves resolution and requires the exact protected-owner refusal. Separate persisted aliases are reopened through real live, stdio and isolated-package transports, requiring that same refusal and unchanged bytes/history. No application guard changed. These later source changes improve proof of the existing foundation guard. Earlier source-time counts/results remain historical, not retroactively relabeled as this stronger proof.

## Reproduction and remaining acceptance

Use the MCP handoff commands, then `node tests/features/mcp01/history-controls.mjs`. Build with `--bimcraft-only`; expect private `@drsurfbum/bimcraft-mcp@0.7.0-mcp01.1`. The project-scoped connection guide is opt-in; the user's persistent client is not configured. Port 8046 is temporary and must be free. Raw IFC, expected snapshots, recovery archives and package tarballs remain local/ephemeral; only named reports/catalogs/screenshots are published.

PM must re-review MCP01-PM-01, the routing/guard/package reconciliation and final-head evidence before adoption. The finding remains OPEN. Native switching inside transient IFC unload remains outside the verified settled-UI boundary. Native OS picker/platform coverage, optional sibling integrations, inherited MEP schema/severity and representative-house performance limits remain explicit. PERF-F04-01, PERF-F05-01, TEST-F28-01, MCP01-PM-01, UP07-MEP-01 and broader semantic MCP catch-up remain OPEN; UP07-PM-01/02 retained tests remain intact. F28-C and F08 are separate and must revalidate against then-approved main after this candidate is accepted. No ready transition, merge, deploy, default-layout/roadmap edit, persistent client setup, credentials/global change or new model/package publication occurred.
