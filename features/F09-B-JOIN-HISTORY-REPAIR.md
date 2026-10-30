# F09-B — Repair stale join Properties after history

Status: OPEN P0 repair, AUD-DEF-01. Reproduced October 30, 2026 on approved main `75af81b49a3f472de734b0229f64e2140bbcbb10`. No fix or implementation-agent dispatch is included in this planning update.

## Verified problem

In the established layout on a pristine Test Lab working copy, select Lab08 wall2, set Start A to Disallow, Undo, then Redo without reselecting. The actual record has A disallowed but the editable control shows Allow. Changing End B cap to Square also changes A back to Allow. The native downloaded IFC independently read with IfcOpenShell 0.9.0 confirms both the requested B cap and the unintended A permission.

The earlier Revit audit reproduced this on main60db; a fresh native browser replay on main75af confirms it remains. The existing green twelve-workflow baseline does not cover this sequence. This is a separate supported-workflow repair, not a new join configuration or a reopening of old semantic receipt findings.

Temporary workaround: reselect the wall to refresh its Properties before another join-end edit after history. This does not close the finding.

## Ownership and acceptance

Coordinate the existing F09 Properties/history lifecycle owner with F08 domain coverage and F28 adapters. No ownership is reassigned by this document.

- Both visible values and edits must use current authoritative state after every history path.
- Changing one end preserves the other end's current permission, cap and supported records.
- Test Disallow A → Undo → Redo → Square B, inverse ends and cap/permission variants, reselection and layout transitions.
- Verify both layouts, stale/dirty/document/revision handling and native/semantic interleavings. One edit produces one accurate owned history operation; never undo a person's unrelated work.
- Confirm actual save/reopen and relevant geometry/reference output; retain F08/MCP/precision/host regression controls.

The original defect is currently confirmed in the established layout; both-layout acceptance is required before repair closure. Root cause/refresh ordering needs owner investigation. Preserve accepted pins and all performance/test/MEP/narrow-layout follow-ups.
