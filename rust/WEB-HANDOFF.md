# BIMCraft Web handoff inventory

Direction recorded November 4, 2026: Austin is stopping new BIMCraft Web development and focusing future work on BIMCraft Rust. Preserve accepted code, unfinished candidates and evidence for the existing Web team. This document does not represent maintainer acceptance or a completed transfer.

Accepted Web main: [`75af81b49a3f472de734b0229f64e2140bbcbb10`](https://github.com/drsurfbum/bimcraft-SDH/commit/75af81b49a3f472de734b0229f64e2140bbcbb10). Remote checked `2026-11-05T02:02:36.521Z`. Sixteen merged PRs, two open drafts and one superseded closed PR were verified. No branch was merged, closed or reset for this handoff.

## Open candidates

- [PR #12 — F28-C](https://github.com/drsurfbum/bimcraft-SDH/pull/12), head `aa75a6f9261e6f2d79e4fe805a287d35cf272d28`: 21 semantic documentation tools supplied but unadopted. Existing current-main review records five conflicts, DI/DL/context/catalog reconciliation and a native rapid-download harness issue. Preserve those gates; no fresh combined runtime acceptance is claimed.
- [PR #19 — upstream 0.8 integration](https://github.com/drsurfbum/bimcraft-SDH/pull/19), head `59f31aa702fb6e4c31c58b2c8e0f015e887b1591`: separate draft, not accepted main. Targets upstream `51c1b44012b98685f43f3ca99a463c240cf0d7ef`. Candidate validation belongs to that PR; this audit did not rerun it. Native Studio 0.8 / browser-edition packaging and full representative-house/GPU acceptance are not established by this handoff.

## Accepted work and provenance

| PR | Work | Published feature head |
|---|---|---|
| [#1](https://github.com/drsurfbum/bimcraft-SDH/pull/1) | Residential wall prototype and verified standalone integration baseline | `994e4168609316d17ada992bb0dbef473f52ed18` |
| [#2](https://github.com/drsurfbum/bimcraft-SDH/pull/2) | F01: explicit standalone baseline, residential fixture and integration evidence | `6c77bceaa24d244a659b619221725bf8aee07844` |
| [#4](https://github.com/drsurfbum/bimcraft-SDH/pull/4) | F02: Preserve precision, reference identity and unsupported records | `e50de2d6516dd5c6ca649b83173c506a3e00ff1f` |
| [#5](https://github.com/drsurfbum/bimcraft-SDH/pull/5) | F03: performance baseline and profiling harness | `a036d0bdcb6e004ca2ec5dfc399a2d47acb0f377` |
| [#6](https://github.com/drsurfbum/bimcraft-SDH/pull/6) | F04: Layered plan graphics and consistent vector output | `7a12a083356eb8aae6a16bd473db4f59cc8a8091` |
| [#7](https://github.com/drsurfbum/bimcraft-SDH/pull/7) | F05: layer-aware straight-wall sections and elevations | `d281e25f6ec27a6b3c716bac39ac4b53fe18e293` |
| [#8](https://github.com/drsurfbum/bimcraft-SDH/pull/8) | F06: Assembly schedules and project material legends | `1d21d5d7d8cbd6ee1374a5b4f258dc813009a3a6` |
| [#9](https://github.com/drsurfbum/bimcraft-SDH/pull/9) | F28-A: opt-in live IFC workspace and core commands | `36691442b521c0a6ada366210bf6c065b02367f6` |
| [#10](https://github.com/drsurfbum/bimcraft-SDH/pull/10) | Update current project instructions for renamed GitHub account | `5430f586783b251caa1feaae13020224afb764e6` |
| [#11](https://github.com/drsurfbum/bimcraft-SDH/pull/11) | F28-B: Wall placement and type editing in the live workspace | `138df9f6bf593bfc677d3d468426a03beb727e59` |
| [#13](https://github.com/drsurfbum/bimcraft-SDH/pull/13) | F08-A: semantic join MCP and protected records on approved 0.7 main | `b3e768e9c2e45ce47e62f35f4befc687dcca2cdf` |
| [#14](https://github.com/drsurfbum/bimcraft-SDH/pull/14) | Adopt verified MCP acceptance and reconcile current project guidance | `16958e8bebc3d5d5e350354b5247ecf2993a4104` |
| [#15](https://github.com/drsurfbum/bimcraft-SDH/pull/15) | Align main with upstream using a validated, history-preserving adoption branch | `8e48d64ef16fc3628f112cfd17adb2031be498c8` |
| [#16](https://github.com/drsurfbum/bimcraft-SDH/pull/16) | MCP-01: materials and wall parity on integrated 0.7 | `35e3fb5a86949a66a7eab138f7bb5bf13a52fd2c` |
| [#17](https://github.com/drsurfbum/bimcraft-SDH/pull/17) | 0.7 foundation candidate: preserve accepted contracts on pinned upstream | `90782a41b00c90bcc93c435e693360d3c3353ef9` |
| [#18](https://github.com/drsurfbum/bimcraft-SDH/pull/18) | F09-A: guarded shortcuts, plan context menus and analytic wall targeting | `731fa6604418b20eaea7253a8e331ba5b4049450` |

## Remaining findings

- AUD-DEF-01 / F09-B: current-main native reproduction and saved IFC show stale join Properties after Undo/Redo can overwrite the opposite end. Known Web defect; not a confirmed Rust defect.
- PERF-F04-01, PERF-F05-01, TEST-F28-01, UP07-MEP-01, broader semantic coverage, narrow-window/accessibility and CI runtime follow-ups remain open.
- Earlier closed F08/MCP/upstream findings retain their exact reviewed pins. The project-direction change does not reopen or erase them.
- October 28 accepted-main evidence remains inherited: 729 baseline passes, 72 focused checks, 81 strict-input checks, 19 browser/live groups, source/package MCP checks and independently inspected outputs. This publication reruns neither that baseline nor candidate acceptance.

## Package contents and boundaries

The repository and PR histories are the canonical code delivery. The archived Web roadmap, prior state report, F-series briefs, Revit audit and agentic contracts describe requirements and evidence. The new crosswalk preserves all 30 feature goals and 21 child slices. JavaScript implementations are not mechanically ported to Rust; reuse specifications and suitable fixtures, with source attribution/license compatibility checked before copying code.

The private preservation inventory records 32 pre-existing top-level checkouts, nine with changes and one unfinished merge. Those checkouts, previews and original models remain untouched; the inventory is not a new full backup. Never treat an older owner checkout as newer than its canonical published PR head.

Keep real-house exports, screenshots, local paths and client geometry private. Use synthetic reproduction fixtures for public contributions unless Austin separately authorizes sharing a real model. No maintainer messages or model uploads have been sent.

Links: [Web archive](https://drsurfbum.github.io/bimcraft-SDH/web/), [prior detailed state](https://drsurfbum.github.io/bimcraft-SDH/state/2026-10-30/), [Rust audit](https://drsurfbum.github.io/bimcraft-SDH/rust/audit.html).
