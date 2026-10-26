# F08 bounded capability matrix

Base: accepted main `21ff2842e1925f148e9b75c404476b59333f7475`.
Application implementation: `b65ad325220cd62b96c7d58179d4a3b4eb3245c6`.
Complete code/test cutoff: `2c1cb9e8df78d633874e88418d92acddb907ee11`.
Final published evidence/CI is identified in PR #13 and SEMANTIC-HANDOFF.md.

| Capability | Authoritative operation | Live HTTP MCP | Source stdio | Isolated fork consumer | Status |
| --- | --- | --- | --- | --- | --- |
| persisted/effective A/B read | readJoinRecord/readWalls/storedShape | wall_joins_get | same + doc | same + doc | implemented, registered, transport-tested |
| typed allow/cap edit | changeWall + existing regeneration/journal | wall_join_end_set | same + doc | same + doc | implemented, registered, transport-tested |
| complete-neighborhood diagnosis | full-storey wallOutlines + record reader | wall_join_diagnostics | same + doc | same + doc | implemented, registered, transport-tested |
| ordinary/repeated Undo/Redo | accepted MCP-01 editor history | undo / redo | undo / redo + doc | same + doc | retained and transport-tested |
| native active-project interruption | accepted original-owner guards | confirmed edit receipt + native switch | explicit doc ownership/closed-handle refusals | same + module byte identity | live native switch verified; no alternate model store |
| generic protected-owner refusal | IfcEditor.setProperty central guard | element_set direct + resolved alias | same | same | specific refusal; F08-PM-01 remains OPEN for PM verification |
| save/reopen | existing model_save / ifc_save | actual download + new instance token | allowed-root save + reopen | same | verified; permission/overwrite boundaries retained |
| assembly CSV/vector PDF | existing F06/F04 writers and browser export | existing UI export path | inherited export gaps unchanged | inherited export gaps unchanged | independent complete CSV/PDF readback; no new export tool claimed |
| established Properties controls | existing end UI helper | presentation; typed domain operation exposed above | domain parity above | domain parity above | retained; default unchanged |
| dedicated workspace join adapter | deferred | GAP | not applicable | not applicable | deferred |
| curved joins/interior-X splitting/height carving/wrapping/general Join Geometry/F09 | deferred | GAP | GAP | GAP | beyond this bounded slice |

Temporary test sessions actually connected on all three surfaces. No persistent
user client was configured, no package was published and no app was deployed.
The accepted main catalog is retained as a union; F28-C is not imported. Its accepted
tools/protected-record additions must be retained if a later approved baseline
adopts it. Full F08 stays partial. Broader semantic catch-up stays OPEN.

See [MCP-CONTRACT.md](MCP-CONTRACT.md), [SUPPORTED-CASES.md](SUPPORTED-CASES.md) and
[SEMANTIC-HANDOFF.md](SEMANTIC-HANDOFF.md). Catalogs, sanitized request/result metadata,
module hashes, saved-file reader reports and screenshots are in
[evidence/f08-semantic](../../../evidence/f08-semantic).
