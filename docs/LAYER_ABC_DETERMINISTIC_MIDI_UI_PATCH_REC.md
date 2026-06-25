# Layer ABC Deterministic MIDI UI Patch REC

## Purpose

This document records the requirements and recommended design for a user-facing
Max patch that combines:

- Layer A: `sfs.video_analysis.basic_motion.maxpat`
- Layer B: `sfs.interpretation.state_machine.maxpat`
- Layer C: `sfs.music_engine.deterministic_midi.maxpat`

The patch should provide a clear performance UI, expose the required
`SFS_USER_CONFIG v0.1.0` controls, and publish the five primary Layer C outputs
through Max `[send]` objects so future patches can consume them with `[receive]`.

Recommended production patch:

```text
patchers/sfs.layer_abc.deterministic_midi.ui.maxpat
```

Recommended shorter performance alias:

```text
patchers/sfs.performance.deterministic_midi.maxpat
```

The alias is the patch users should open for performance. It mirrors the full
Layer A/B/C UI directly rather than using a `bpatcher`, because a wrapper patch
can render as empty boxes in some Max sessions.

This patch is a host UI and routing patch. It must not replace or collapse the
existing layer abstractions.

## Architectural Boundary

The patch must preserve the project data flow:

```text
video source
-> Layer A SFS_VIDEO_FEATURES
-> Layer B SFS_MUSICAL_CONTROL
-> Layer C Deterministic MIDI Engine
-> public sends / optional MIDI device routing
```

Layer C must receive `SFS_MUSICAL_CONTROL` dictionaries from Layer B. The
combined patch must not route Layer A video features, Jitter matrices, or video
source state directly into Layer C musical decisions.

The patch may contain UI, scheduling, source selection, monitoring, dictionary
routing, and output side effects. Musical generation behavior must remain inside
`sfs.music_engine.deterministic_midi.maxpat` and its production modules.

## Required UI Blocks

The first implementation should divide the presentation UI into these logical
blocks.

| Block | Purpose | Required controls / monitors |
|---|---|---|
| Source and Preview | Select and view the input image stream. | Movie read/open, movie start/stop, camera open/close if available, source selector, preview display, source status. |
| Layer A Analysis | Configure and monitor video feature extraction. | Analysis enable, analysis rate, motion, brightness, contrast, cut, cut strength, Layer A dictionary status. |
| Layer B Interpretation | Configure and monitor musical interpretation. | State, confidence, energy, density, tension, activity, variation, scene-change/accent/reset indicators, Layer B dictionary status. |
| Layer C User Config | Edit the normalized `SFS_USER_CONFIG` values. | Controls listed in "Required User Configuration UI". |
| Transport and MIDI | Control Layer C runtime and optional device output. | Start, stop, reset generation, reset to defaults, MIDI panic, optional `midiout`, raw MIDI monitor. |
| Layer C Outputs | Show and publish the five public Layer C outputs. | Five visible send labels, last-output indicators, dictionary monitors for context/event outputs. |
| Diagnostics | Surface contract and runtime status. | Last diagnostic/config message from Layer C outlet 6, validation status, Max Console/log reminder. |

The UI should be useful as a first screen, not just a wiring test. Use Max
comments, panels, tabs, and compact monitors to make the blocks scan clearly.

## Required User Configuration UI

On load, the patch must load the canonical default configuration from:

```text
data/music/SFS_USER_CONFIG.deterministic_midi.default.v0.1.0.json
```

The UI must display the normalized values and publish a schema-valid
`SFS_USER_CONFIG v0.1.0` update to Layer C when the user changes configuration.
`reset_to_defaults` must reload the canonical default file and publish its
normalized content. The patch must not maintain a second hard-coded default
configuration table.

The initial UI must cover every required MVP schema field:

| Field | Suggested Max UI |
|---|---|
| `preset_name` | text edit |
| `reproducibility.deterministic_mode` | toggle |
| `reproducibility.random_seed` | integer number box plus randomize-seed button |
| `musical_identity.root_pitch_class` | integer number box or menu `0-11` |
| `musical_identity.scale_name` | menu: `major`, `natural_minor`, `dorian`, `phrygian`, `whole_tone`, `chromatic`, `cluster` |
| `musical_identity.harmonic_risk` | float number box or slider `0.0-1.0` |
| `musical_identity.dissonance_bias` | float number box or slider `0.0-1.0` |
| `rhythm.tempo_min` | number box `20-300` |
| `rhythm.tempo_max` | number box `20-300` |
| `generation.randomness` | float number box or slider `0.0-1.0` |
| `generation.variation_amount` | float number box or slider `0.0-1.0` |
| `generation.mutation_rate` | float number box or slider `0.0-1.0` |
| `structure.sections_enabled` | toggle |
| `density.density_min` | float number box or slider `0.0-1.0` |
| `density.density_max` | float number box or slider `0.0-1.0` |
| `density.max_polyphony` | integer number box `1-64` |
| `midi.midi_channel` | integer number box or menu `1-16` |
| `midi.velocity_min` | integer number box `1-127` |
| `midi.velocity_max` | integer number box `1-127` |
| `midi.octave_min` | integer number box `-1-9` |
| `midi.octave_max` | integer number box `-1-9` |

The UI may send parameter updates through the existing Layer C command surface:

```text
param <path> <value>
config <dictName>
publish_config
reset_to_defaults
```

Min/max pairs must be allowed to normalize through Layer C rather than forcing
the UI to reject a temporary reversed edit. The UI should still show the
normalized value after Layer C accepts the update.

Deferred fields such as `rhythm_complexity`, `syncopation`, `polyrhythm_amount`,
`repetition`, and `memory_length` must not appear in this v0.1.0 UI.

Preset save, preset load, preset export, and preset import UI are also outside
this first combined-patch version. This version should include default loading,
reset to defaults, and live parameter editing only.

## Public Layer C Sends

The patch must create exactly five public output `[send]` objects for the five
primary Layer C outputs requested for downstream patches.

| Layer C outlet | Message contract | Required send object |
|---:|---|---|
| 1 | `SFS_CONDUCTOR_CONTEXT` dictionary | `[send sfs.layer_c.deterministic_midi.conductor_context]` |
| 2 | `SFS_HARMONY_CONTEXT` dictionary | `[send sfs.layer_c.deterministic_midi.harmony_context]` |
| 3 | `SFS_NOTE_EVENT` dictionaries | `[send sfs.layer_c.deterministic_midi.note_event]` |
| 4 | `SFS_MIDI_EVENT` dictionaries | `[send sfs.layer_c.deterministic_midi.midi_event]` |
| 5 | raw MIDI bytes | `[send sfs.layer_c.deterministic_midi.raw_midi]` |

Dictionary messages must be forwarded unchanged as Max dictionary messages.
Raw MIDI bytes must be forwarded unchanged as individual integer messages in
wire order. The raw MIDI send must not emit a three-byte list, `midievent`
wrapper, or omit status bytes.

The current Layer C abstraction also has a sixth diagnostics/config outlet. The
combined UI patch may display or log that outlet locally, but it is not one of
the five public Layer C sends in this record.

## Optional MIDI Device Routing

The patch may route Layer C raw MIDI bytes to a visible `midiout` object for
local playback. This routing is optional host/session state and must not replace
the required raw MIDI `[send]`.

The MIDI destination name, hardware port, and device discovery state are outside
`SFS_USER_CONFIG v0.1.0`.

## Scheduling and Message Ordering

The patch should use the same ordering principle as the current ABC manual and
integration patches:

1. Layer A produces `SFS_VIDEO_FEATURES`.
2. Layer B consumes the latest valid Layer A dictionary and emits
   `SFS_MUSICAL_CONTROL`.
3. Layer C receives the latest valid Layer B dictionary before the next logical
   `step`.
4. Layer C emits conductor, harmony, note-event, MIDI-event, and raw-MIDI output
   in its documented order.

If a helper is needed to order Layer B control updates and Layer C steps, prefer
reusing or promoting the existing deterministic MIDI step-adapter behavior rather
than adding timing-dependent musical logic in the UI patch.

## Acceptance Criteria

The patch is ready when all of these are true:

- It loads in Max with no missing objects, missing files, or JavaScript errors.
- It loads the default user config from
  `data/music/SFS_USER_CONFIG.deterministic_midi.default.v0.1.0.json` on patch
  load.
- Every required user-config UI control can update Layer C and produces the
  expected normalized `SFS_USER_CONFIG` value.
- Movie input can drive Layer A, Layer B, and Layer C together.
- Camera input works when a camera is available, or the UI clearly reports that
  camera input is unavailable.
- The five required `[send]` objects exist and receive messages directly from
  Layer C outlets 1-5.
- Temporary `[receive]` objects can subscribe to the five send names and observe
  the expected dictionaries and raw MIDI integer bytes during manual
  verification.
- Optional `midiout` playback does not change the public sends.
- Existing validation and self-tests still pass.

Recommended verification commands:

```powershell
node tools\run_layer_b_selftest.js
node tools\run_layer_c_deterministic_midi_selftest.js
powershell -ExecutionPolicy Bypass -File tools\validate_project.ps1
```

For Max runtime verification, use the Max Console capture workflow documented in
`docs/DEBUGGING.md` and inspect generated evidence under `logs/` without
committing generated logs.

## Non-Goals

- Do not create a new Layer C implementation.
- Do not change `SFS_USER_CONFIG v0.1.0` or add deferred fields to the UI.
- Do not add direct Layer A to Layer C mapping.
- Do not require a physical MIDI device for the patch to be valid.
- Do not include preset save/load/import/export UI in this first version.
- Do not create a dedicated receiver-test patch for this version.
- Do not commit generated logs, snapshots, or runtime reports.

## Resolved Decisions

- Create the shorter alias `patchers/sfs.performance.deterministic_midi.maxpat`.
- Do not include preset save/load/import/export UI in this version.
- Do not create a dedicated receiver-test patch in this version.
