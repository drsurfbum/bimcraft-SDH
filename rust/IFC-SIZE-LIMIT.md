# BIMCraft Rust: the 256 MiB limit

Checked November 4, 2026 (America/Chicago). Release `f47a6c94281555728d6a61229355f037d1a464b3` and source audit `dde24e240b7ca39fb040057c452175e3f3a0bf45`.

The application defines `const MAX_FILE: u64 = 256 << 20;` and refuses files **at or above 268,435,456 bytes** before parsing. That is 256 MiB, approximately 268 MB decimal. It is an application policy, not an IFC format or Rust language limit.

The [project rules](https://github.com/IPedrax/BIMCraft/blob/f47a6c94281555728d6a61229355f037d1a464b3/CLAUDE.md) explicitly require bounds on hostile input/file sizes. The [open path](https://github.com/IPedrax/BIMCraft/blob/f47a6c94281555728d6a61229355f037d1a464b3/crates/core/src/commands.rs#L2471) checks metadata and reads the complete IFC into a byte buffer before import. A conservative resource/robustness guard is therefore a supported interpretation. No explanation for choosing exactly 256 MiB was found. Parsed geometry, indices and render data may consume more memory than the file on disk; this audit did not measure a multiplier or a safe maximum for the Mac.

Both original house exports exceed the cap: IFC4 is 311,382,884 bytes, and IFC2X3 is 609,135,208 bytes. The compact IFC4 trial is 268,216,722 bytes, below the limit. Its successful opening does not prove complete geometry fidelity. The cap is separate from per-component triangle bounds and unsupported product/roof geometry.

## Persistence consequence

In both inspected versions, open/recovery and autosave enforce MAX_FILE, while ordinary native save has no matching size check before writing. A sufficiently large native project can therefore be saved yet refused on reopening; this is a source-derived risk, not an oversized-file runtime reproduction performed here. Our trial native model is already about 244 MiB, so modest growth makes this relevant.

## Proposed R02-C acceptance

- Measure import/parse/render peak memory and time for the original exports and synthetic stress cases.
- Define a bounded resource policy or explicit large-file path; do not merely remove all guards.
- Verify below/at/above thresholds, failure rollback, progress/cancellation and responsiveness.
- Test native save/reopen, autosave/recovery and links under the same policy.
- Keep geometry-complexity limits and unsupported-object diagnostics distinct from file size.
- Review [upstream issue #264](https://github.com/IPedrax/BIMCraft/issues/264) before implementing or reporting a duplicate. No comment or model upload was sent.

Source: [release constant](https://github.com/IPedrax/BIMCraft/blob/f47a6c94281555728d6a61229355f037d1a464b3/crates/core/src/commands.rs#L2417), [audited-main constant](https://github.com/IPedrax/BIMCraft/blob/dde24e240b7ca39fb040057c452175e3f3a0bf45/crates/core/src/commands.rs#L2612). No limit has been changed by this roadmap publication.
