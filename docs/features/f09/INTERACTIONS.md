# F09-A interaction inventory and decisions

Owner: this F09 development chat, updated October 28, 2026. Active isolated candidate `bimcraft-f09-resume-20261028`; original `bimcraft-f09` remains clean at `b80ca88428b99173fa21d540e406df180e9987f5`; branch `feature/f09-interaction-foundation`; approved base `60dbd3abff0d1d98ce1a85375de7b6087709c8ee`; application baseline `0329eece15fedbfeb14025683d7fe9da78263ef2`. Port 8061 is reserved for the proposed isolated preview, but this session denies TCP listen (`EPERM`), so a running preview is not claimed. Main was verified through the connected GitHub service at the approved pin. No F28-C code was imported.

## Confirmed choices

The owner answered three discovery questions in this chat:

- Right-click preserves the selection; an unselected wall offers **Select this wall** explicitly.
- An active operation stays active when the menu opens; **Cancel active operation** is explicit.
- The first snap demo uses an explicit reference choice for each operation. Core/finish precedence and cycling keys remain undecided.

The supplied chart is `reviews/INTERACTIONS-2026-10-24/user-shortcut-reference.jpg` in the parent project; it was visually inspected. Its meanings, rather than every command it lists, guide the bounded implementation. Additional screenshots/examples remain welcome but are not needed for the confirmed corrections.

## Keyboard matrix

| Interaction | Existing approved-main behavior | F09-A | Conflict / limitation |
| --- | --- | --- | --- |
| WA / DR / WN | Ribbon profile already has sequences; workspace also accepts immediate W | Reuse the shell KeyMatcher; guarded workspace commands handle the final command | No profile switch on startup; established CadCraft W/D/N stay |
| DI | Ribbon toggles automatic-dimension visibility | Builtin ribbon invokes the existing reference-dimension tool with aligned axis | Workspace DI is unavailable with an F28-C explanation; old custom-profile DI bindings remain user-owned |
| DL | Drafting detail line exists | Bind existing dline in the established layout | Workspace activation stays deferred to C |
| MV | Wall grips and library-item moves exist; no general authored-wall Move tool | Explain existing grips, keep command unavailable | Later F09 slice for an explicit Move operation |
| CO / CC | Clipboard copy exists; authored-wall copy is refused | Distinct model.copy ID, unavailable with an explanation | Ctrl/Cmd+C remains clipboard Copy |
| RO / AL | Library-item turn and specific geometry operations exist | Do not imply authored-wall Rotate/Align exists | Unavailable; later slices |
| TR | Existing authored-wall trim/extend tool | Bind existing trim tool and its authoritative actions | No new Join Geometry / corner semantics |
| VG / VV | Individual view controls exist | Explain that unified Visibility/Graphics is unavailable | Do not relabel another control as VG |
| Ctrl/Cmd+K | Registry ID exists but the standalone shell has no mounted launcher | One launcher in the app bar or active workspace header; search dialog over `ccInput.paletteItems()`, current availability and guarded `run` | No new registry; static harness declares the exact mounted owner and runtime proves the control/action |
| PP / KS | Existing Properties and input settings/palette | Focus selected-wall Properties; accessible shortcut table with actual availability and explicit profile choice | PP supports a single authored wall in this slice |
| Space | Space+drag pans | Preserve | Flip/90-degree operation rules unresolved |
| Tab | Focus and some existing placement behavior | Preserve | No new candidate-cycling key |
| SC | Ribbon section-plane command | Preserve | No snap override steals SC |
| Numeric/unit entry | Existing model parser and Properties inputs | Keep all six display units and parser; preserve native field Undo | Native units are visible in the established CadCraft toolbar and integrated Properties footer; the standalone input ribbon does not add a units command |

Sequence contract: inherited 1500 ms timeout, visible existing status feedback; Escape cancels a pending prefix; focus changes, blur, visibility changes and composition start reset the buffer. Repeated keydowns do not start extra commands. The existing physical-key normalization is retained, including translated keyboards; no alternate input engine is added. Dialogs, all editable content (including empty/plaintext-only contenteditable), native field context menus, composition and browser/OS pass-through keys retain ownership. The shared engine is scoped to the app/body and its input/workspace controls. Customization/conflict explanations remain in the existing input settings; KS lists current bindings and reasons.

## Context-menu matrix

| Context | Menu | Selection / availability |
| --- | --- | --- |
| Empty plan, no selection | Wall, Fit drawing, Keyboard shortcuts | Existing registry/guarded actions |
| One selected authored wall | Properties, Clear selection | Existing Properties and clear actions |
| Multiple selected elements | Properties disabled with a reason, Clear selection | Preserve all selected IDs; no implicit bulk edit |
| Unselected authored wall under pointer | Select this wall | No selection change merely from opening |
| Active placement/Modify or grip | Cancel active operation, Keyboard shortcuts | No implicit finish or model edit |
| Plan background with an existing selection | Selected-element menu | Pointer does not replace selection |
| 3D, imported/background underlays, sheets, browser/source tree | Existing native/owned behavior | Not intercepted by F09 |
| Text/Properties field | Native menu | Never intercepted |
| Drawing right-click while Properties text is dirty | Actionable finish-or-cancel explanation; drawing menu stays closed | Prevent pointer focus blur; no accidental change/history. Enter commits through the existing field handler; Escape cancels the draft |

PlanView distinguishes click from the existing pan threshold and profiles. Platforms that emit contextmenu on button-down defer menu opening until release; a pan drag suppresses it. No new pan threshold is introduced. Unmodified Shift+F10 / Context Menu key on the focusable plan invokes the menu; composing events and Ctrl/Alt/Meta variants retain their native ownership; arrows/Home/End navigate, Enter/Space activate, Escape/Tab dismiss with focus restoration. Menus are clamped and scroll within the viewport; disabled entries retain visible and accessible reasons.

Every menu captures editor identity, native history revision, key base/source, drawing level/kind/callout, tool/drag and selection. Execution checks them again, including busy/reloading/queue state. Opening a menu creates no IFC/history change. Stale/foreign context refuses instead of selecting or editing a new project. Input command preparation also revalidates editor ownership; the workspace engine checks its owner across async activation. These are presentation guards around existing actions, not a second transaction system.

## Snap and reference matrix

| Capability | Existing | F09-A explicit mode | Meaning / limits |
| --- | --- | --- | --- |
| Endpoints and midpoints | Center and symmetric face corners; endpoints outrank midpoint | Exact endpoints/midpoints of the selected reference | Uses F02 referencePoint, not rendered pixels |
| Finish faces | Envelope +/- half thickness | Exterior/interior by named orientation | Analytic untrimmed reference, not physical F08 joined outline |
| Core faces and center | Available in associative dimension tool, absent in ordinary placement snap | Explicit coreExterior/coreInterior/coreCenter | Requires one authored straight-wall assembly |
| Wall center | Existing centerline | Explicit center | Center differs from coreCenter in asymmetric assemblies |
| Projection | Existing nearest/angle-direction intersection | Nearest point on selected analytic reference | No new persistent relation |
| Grid / alignment / cloud | Grid points/lines, horizontal/vertical guides, scanned point hook | Unchanged in Existing snaps | Explicit wall-reference mode intentionally scopes acquisition to those references |
| Ambiguity | Rank/distance ordering | Visible candidate chooser; multiple hosts require an explicit choice | Coincident hosts retain separate IDs; no cycling key assumed |
| Temporary override / off | Shift orthogonal and existing controls | Visible reference selector / Snap off | Escape/tool change/blur/document change clears; numeric entry remains authoritative |
| Curves / imported geometry | Existing endpoint/arc handling | No fabricated core/finish targets | Explicit mode does not chord-substitute a curved wall |
| Reference dimension | Existing six modes and hovered analytic line | Existing workflow, with DI correcting the aligned entry | Persistent dimension semantics are unchanged; C-specific UI remains separate |

In a selected reference on one host, existing endpoint-before-midpoint-before-nearest ordering is retained. Multiple hosts within acquisition range require choosing a listed wall/candidate before commitment; no universal core-first/face-first preference is introduced. The chooser uses no new numerical coincidence tolerance. The cursor acquisition radius stays 12 screen pixels converted by the existing view transform. It is unrelated to geometry precision, the unchanged 0.005 mm regression bound, F08 node discovery or persistent-reference rules.

Wall placement and straight-wall endpoint/midpoint grip editing consume these exact coordinates through existing drawWalls/changeWall operations. Preview/read services never write IFC. An explicit midpoint translation anchors the exact grip rather than adding the pointer-down acquisition offset. Escape cancels a drag before release, and drag commits refuse stale captured context. Existing default snap behavior is unchanged. The established afterWallMove behavior keeps hosted openings at their world station when a wall start slides axially; F09 does not redefine it as a rigid host-relative translation.

## Wider Modify / Properties inventory

| Operation | Existing scope | F09-A disposition |
| --- | --- | --- |
| Select | Plan/3D multi-selection and modifier toggling | Preserve; menu selection explicit |
| Move | Straight-wall midpoint grips, endpoint stretch, library-item grips, semantic wall_change; generic elements_move excludes authored walls | Explicit analytic targets on straight-wall grips only |
| Copy | Clipboard/general items; authored walls refused | Honest CO/CC unavailability; later hosted-wall Copy slice |
| Rotate | Placed library-item turn/Properties | General wall Rotate deferred |
| Mirror | No verified general authored-wall tool | Deferred |
| Align | Endpoint guides and specific alignment logic | General wall Align deferred |
| Offset | Specific type/placement/property offsets | General offset-copy tool deferred |
| Trim/extend | model-trim-ui / reshapeWalls; explicit wall edge and corner tools | Reuse unchanged |
| Split | No verified general authored-wall Split tool | Deferred |
| Wall flip | Properties extSide with existing location-line/core-anchor semantics | Preserve; do not assign Space |
| Properties | Existing multi-selection/mixed values and type/instance behavior | Preserve, PP focuses one wall; no new bulk semantics |

Next slices: bounded authored-wall Move/Copy with explicit host treatment; Rotate/Mirror/Align/Offset/Split separately after discovery; agreed contextual menu expansion; operation-specific overrides/cycling; joined physical-target discovery distinct from analytic references; C integration of existing reference-dimension controls. General constraints, roofs/components and Join Geometry remain excluded.

## Agent access and ownership

New domain capability: `wall_reference_resolve` (read), requiring documentId, expectedRevision, wall GlobalId, one of six reference names and station [0,1]. It returns raw `p`, analytic endpoint `segment`, reference identity/station, mm units, level ID, revision/document binding, `persistent:false` and explicit geometry classification. It uses requireWalls/bindDocument and F02 referencePoint. Actual source stdio and isolated packaged tests execute this schema and reuse wall_change/walls_add rather than synthetic input. UI snapping settings are transient presentation state, not persistent project settings or constraints.

Presentation-only changes: keyboard/help/context-menu arrangement; route to guarded existing commands, selection, drawWalls/changeWall and existing reference dimensions. Inherited dimension/detail/trim semantic gaps stay visible; the new resolver does not claim a dimension-creation/export API or full application parity. MCP-01/F08 catalogs, permissions, protected records and agent-owned history are retained. Live HTTP and browser evidence are separate gates, never inferred from source tests.

The mounted model UI exposes its existing extension `ask` dispatcher to command presentation and its existing `pickedWalls` query to the interaction adapter. The workspace adapter also moves the same palette launcher into its visible header on entry and restores its app-bar home on exit. These bridges introduce no separate domain action.

Shared touchpoints for C: small additive hooks in input-bimcraft, bimcraft's ccInputHooks, workspace-bimcraft inputCommand, guarded engineRun, input UI sequence reset, model-ui's snap/menu lifecycle, and a single existing dimension-extension entry method. C must retain these hooks and existing source/editor guards while adding its own documentation activation; no C file was copied and no competing documentation adapter added. Established layout remains default/fallback.

All previously open performance, test-isolation, inherited MEP, runtime-headroom, narrow-window and broader MCP follow-ups remain open. Accepted PM closures and their existing regressions remain unchanged.
