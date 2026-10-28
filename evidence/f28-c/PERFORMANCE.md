# F28-C performance evidence

PERF-F04-01 and PERF-F05-01 remain OPEN. These small-fixture measurements do not establish representative-house responsiveness or a performance improvement.

Frozen source: `eb389b64c21dc2ab245fc9c94866a997f8757996`. Approved base: `3e42c21e33e642d1e07bea2fc3356344f91db00e`.

## Local Node boundaries

Apple M5 Pro, macOS arm64, Node 26.9.0. Same F04 plan and F05 section fixtures; input preparation excluded; five warmups then 30 raw samples. Source app files were committed; pending evidence/docs produce the truthful `dirty: true` marker. No timing gates.

| Workload | Base p50 / p95 ms | Source p50 / p95 ms |
| --- | --- | --- |
| f04FineScene | 4.646 / 7.058 | 4.672 / 5.292 |
| f04PlanPdf | 16.372 / 17.153 | 16.905 / 18.113 |
| f05FineSection | 3.279 / 4.514 | 3.572 / 4.590 |
| f05Composition | 0.047 / 0.070 | 0.053 / 0.088 |
| f05Svg | 0.139 / 0.163 | 0.148 / 0.341 |
| f05Pdf | 0.766 / 0.956 | 0.796 / 0.965 |

[Raw local samples and fixture hashes](performance-node-delivery.json). Earlier local runs are retained under their own source heads; do not combine them.

## Browser boundaries

`browser.json` retains raw base/source samples on the same runner, fixture, prepared document, 900 × 600 plan canvas, Fine detail and camera `[3000, 900, 0.08]`. Synchronous `PlanView.draw` is CPU submission, not GPU completion. Full existing `sheetInput` generation is measured separately from SVG/PDF serialization. The C artifact also contains the same-runner Node comparison and its raw samples. Do not combine macOS and CI environments or call these interaction-latency measurements.

### Frozen-source browser samples

| Workload | Base p50 / p95 ms | Source p50 / p95 ms |
| --- | --- | --- |
| planDrawCPU | 0.700 / 1.000 | 0.600 / 0.900 |
| drawingSetGeneration | 197.400 / 216.000 | 188.100 / 193.400 |
| sheetSvg | 5.700 / 7.300 | 2.200 / 4.200 |
| vectorPdf | 20.300 / 28.100 | 12.300 / 17.500 |

These source-run observations include ordinary timing variation and compare only the stated synchronous boundaries. Both follow-ups remain open.

The inherited Node helper loads baseline i18n in a fresh module without messages. Its generated-by footer is `res.sh.madewith`; the current fixture has English `Drawn with BimCraft`. [Diagnostic](performance-footer-diagnostic.json) confirms identical SVG geometry/content after normalizing only that footer. This accounts for the recorded output-hash/byte-length difference and slightly different serialization text. Browser comparisons load English in both revisions. No output-equality or speedup claim is made from the raw Node bytes.
