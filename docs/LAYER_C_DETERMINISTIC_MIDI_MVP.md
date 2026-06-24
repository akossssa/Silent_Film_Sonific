# Silent Film Sonific — Layer C Deterministic MIDI Engine MVP

## Purpose

This document defines the **Deterministic MIDI Engine**, the first named MVP implementation of **Layer C — Music Engine** for the Silent Film Sonific project.

The Deterministic MIDI Engine receives abstract musical control data from Layer B and generates algorithmic/generative musical output. For the MVP, this implementation produces MIDI output using a modular internal architecture.

The MVP must include:

- Conductor
- Harmony Engine
- Rhythm Engine
- MIDI Output
- User Configuration Engine

The implementation must be style-neutral and suitable for different musical aesthetics, including ambient, rhythmic, orchestral, electronic, noise, and experimental music.

---

# 1. Architectural Context

Silent Film Sonific uses three isolated layers:

```text
Layer A — Video Analysis
↓
Layer B — Interpretation
↓
Layer C — Music Engine
```

Layer C must not read raw video-analysis data from Layer A.

Layer C consumes only the formal Layer B output dictionary:

```text
SFS_MUSICAL_CONTROL
```

Layer C must treat this dictionary as its only film-driven input interface.

User configuration is a separate Layer C input. It shapes the musical behavior of the generation algorithms but must not replace or modify the Layer B interface.

---

# 2. Core Layer C Design Principle

Layer B defines **what the film requires**.

User Configuration defines **how the Music Engine responds**.

The Conductor combines these two sources into internal musical context.

```text
Layer B Musical Control
        │
        ▼
    Conductor
        ▲
        │
User Configuration
```

Neither Layer B nor User Configuration should directly override the other. Layer B provides dynamic, film-driven control. User Configuration provides musical personality, constraints, ranges, and probabilities.

---

# 3. Deterministic MIDI Engine Architecture

The Deterministic MIDI Engine is implemented as a set of replaceable modules:

```text
Layer C — Music Engine
│
├── Conductor
├── Harmony Engine
├── Rhythm Engine
├── MIDI Output
└── User Configuration Engine
```

Suggested Max abstractions:

```text
sfs.music_engine.deterministic_midi.maxpat
sfs.music_engine.conductor.deterministic_midi.maxpat
sfs.music_engine.harmony.deterministic_midi.maxpat
sfs.music_engine.rhythm.deterministic_midi.maxpat
sfs.music_engine.midi_output.deterministic_midi.maxpat
sfs.music_engine.user_config.deterministic_midi.maxpat
sfs.music_engine.clock.deterministic_midi.maxpat
sfs.music_engine.core.deterministic_midi.js
```

The top-level abstraction should be:

```text
sfs.music_engine.deterministic_midi.maxpat
```

It should receive `SFS_MUSICAL_CONTROL` dictionaries and route internal control data to the Conductor, Harmony Engine, Rhythm Engine, MIDI Output, and User Configuration modules.

## Naming Convention

Production Layer C files must use:

```text
sfs.music_engine.<module>.<variant>.maxpat
sfs.music_engine.<module>.<variant>.js
```

The top-level implementation abstraction is `sfs.music_engine.deterministic_midi.maxpat`. Test patches mirror the production namespace under `devtools/max/` and use `.test.maxpat` or `.selftest.maxpat` suffixes.

## Normative Internal Contracts

Layer C module boundaries use these versioned JSON schemas:

```text
schemas/SFS_USER_CONFIG.schema.json
schemas/SFS_CONDUCTOR_CONTEXT.schema.json
schemas/SFS_HARMONY_CONTEXT.schema.json
schemas/SFS_NOTE_EVENT.schema.json
schemas/SFS_MIDI_EVENT.schema.json
schemas/SFS_SCALE_REGISTRY.schema.json
```

The schemas are normative. Dictionary examples in this document are illustrative and must remain valid against the corresponding schema.

Every v0.1.0 schema must enforce its exact `version` value with `const: "0.1.0"`. A dictionary with the correct `schema` name but any other `version` is invalid input for the v0.1.0 contract and must be rejected rather than interpreted as compatible.

The normative production scale registry is:

```text
data/music/SFS_SCALE_REGISTRY.deterministic_midi.v0.1.0.json
```

It is validated by `schemas/SFS_SCALE_REGISTRY.schema.json`.

The normative default Layer C configuration is:

```text
data/music/SFS_USER_CONFIG.deterministic_midi.default.v0.1.0.json
```

It must validate against `schemas/SFS_USER_CONFIG.schema.json`. Implementations must load this file rather than maintain a second hard-coded default table in JavaScript or Max patchers.

---

# 4. Input Interface: Layer B → Layer C

Layer C receives dictionaries with this schema:

```json
{
  "schema": "SFS_MUSICAL_CONTROL",
  "version": "0.1.0",
  "timestamp_ms": 123456,
  "state": {
    "name": "action",
    "confidence": 0.82,
    "changed": true,
    "previous": "tension"
  },
  "controls": {
    "energy": 0.72,
    "density": 0.64,
    "tension": 0.58,
    "brightness": 0.45,
    "activity": 0.77,
    "variation": 0.39
  },
  "events": {
    "scene_change": true,
    "accent": true,
    "reset_phrase": false
  }
}
```

## Required Input Fields

Layer C must support these fields:

```text
state.name
state.confidence
state.changed
state.previous
controls.energy
controls.density
controls.tension
controls.brightness
controls.activity
controls.variation
events.scene_change
events.accent
events.reset_phrase
```

All continuous control values must be treated as normalized values in the range:

```text
0.0–1.0
```

Layer C must validate incoming dictionaries against `schemas/SFS_MUSICAL_CONTROL.schema.json` before they become eligible for a logical tick. Out-of-range continuous controls are invalid input, not values to be clamped. An invalid Layer B dictionary must be rejected, logged with a schema diagnostic, and must not replace the current valid musical-control state.

One-shot events contained in an invalid dictionary must not be queued. This preserves the Layer B → Layer C contract and avoids silently changing film-driven control data inside Layer C.

---

# 5. Input Interface: User Configuration → Layer C

The User Configuration Engine provides user-editable parameters that shape the algorithmic/generative behavior of Layer C.

User parameters must be adjustable from the Max UI and must also be storable in presets.

The User Configuration Engine should output a dictionary with this schema. The example below is the exact normative default configuration:

```json
{
  "schema": "SFS_USER_CONFIG",
  "version": "0.1.0",
  "preset_name": "Default",
  "reproducibility": {
    "deterministic_mode": true,
    "random_seed": 12345
  },
  "musical_identity": {
    "root_pitch_class": 0,
    "scale_name": "natural_minor",
    "harmonic_risk": 0.7,
    "dissonance_bias": 0.4
  },
  "rhythm": {
    "tempo_min": 50,
    "tempo_max": 160
  },
  "generation": {
    "randomness": 0.4,
    "variation_amount": 0.5,
    "mutation_rate": 0.25
  },
  "structure": {
    "sections_enabled": true
  },
  "density": {
    "density_min": 0.05,
    "density_max": 0.9,
    "max_polyphony": 4
  },
  "midi": {
    "midi_channel": 1,
    "velocity_min": 35,
    "velocity_max": 110,
    "octave_min": 3,
    "octave_max": 6
  }
}
```

## Required User Configuration Categories

The MVP must expose user-editable parameters for:

```text
Musical identity
Rhythm
Generative behavior
Musical structure
Density
MIDI output
Reproducibility
```

## Required MVP Parameters

The MVP must support at least:

```text
preset_name
deterministic_mode
random_seed
root_pitch_class
scale_name
harmonic_risk
dissonance_bias
tempo_min
tempo_max
randomness
variation_amount
mutation_rate
sections_enabled
density_min
density_max
max_polyphony
midi_channel
velocity_min
velocity_max
octave_min
octave_max
```

## Value Rules

```text
root_pitch_class   pitch class, 0–11, where C = 0
scale_name         supported MVP scale identifier
harmonic_risk      0.0–1.0
dissonance_bias    0.0–1.0
tempo_min          BPM, 20–300
tempo_max          BPM, 20–300
randomness         0.0–1.0
variation_amount   0.0–1.0
mutation_rate      0.0–1.0
sections_enabled   boolean
density_min        0.0–1.0
density_max        0.0–1.0
max_polyphony      integer, 1–64
midi_channel       1–16
velocity_min       1–127
velocity_max       1–127
octave_min         MIDI octave number, -1–9
octave_max         MIDI octave number, -1–9
random_seed        integer, 0–2147483647
```

## Deferred User Configuration Parameters

The following controls are intentionally outside `SFS_USER_CONFIG v0.1.0` and `SFS_CONDUCTOR_CONTEXT v0.1.0`:

```text
rhythm.rhythm_complexity
rhythm.syncopation
rhythm.polyrhythm_amount
generation.repetition
generation.memory_length
```

They are deferred to a later schema version until they have defined generation semantics and measurable acceptance criteria. In v0.1.0 they must fail schema validation if present. This prevents presets from exposing controls that are accepted but musically inert.

Supported MVP `scale_name` values and their interval arrays are defined only in:

```text
data/music/SFS_SCALE_REGISTRY.deterministic_midi.v0.1.0.json
```

The registry contains exactly seven ordered identifiers: `major`, `natural_minor`, `dorian`, `phrygian`, `whole_tone`, `chromatic`, and `cluster`. Its `default_scale_name` is the fallback for missing or unknown scale identifiers.

Layer C implementations must load this registry. They must not maintain a second hard-coded scale-to-interval table in JavaScript or Max patchers.

## Pitch and Octave Semantics

`root_pitch_class` represents pitch class only:

```text
C=0, C#/Db=1, D=2, D#/Eb=3, E=4, F=5,
F#/Gb=6, G=7, G#/Ab=8, A=9, A#/Bb=10, B=11
```

Octaves use the MIDI convention `C-1 = MIDI 0` and `C4 = MIDI 60`. The configured octave range defines an inclusive register:

```text
register_min = clamp(12 * (octave_min + 1), 0, 127)
register_max = clamp(12 * (octave_max + 2) - 1, 0, 127)
```

The Harmony Engine combines `root_pitch_class`, `scale_name`, and this register. It must discard generated pitches outside MIDI `0–127`.

## Configuration Normalization

The User Configuration Engine must normalize input before publishing `SFS_USER_CONFIG`. Downstream modules must consume only the normalized dictionary.

The canonical fallback value for every field is the corresponding value in:

```text
data/music/SFS_USER_CONFIG.deterministic_midi.default.v0.1.0.json
```

The default file must itself pass schema and cross-field invariant validation before Layer C starts. A missing or invalid default file is a startup error; implementations must not silently substitute code-local defaults.

Normalization order is deterministic:

1. Replace missing values, wrong types, non-finite numbers, and empty names with the corresponding canonical default values; use the scale registry's `default_scale_name` for unknown scale identifiers.
2. Round finite numeric values for integer parameters to the nearest integer, with exact half values rounded away from zero:

```text
round_integer(x) = floor(x + 0.5) when x >= 0
round_integer(x) = ceil(x - 0.5) when x < 0
```

3. Clamp every scalar to its schema range.
4. Sort each minimum/maximum pair so the lower value is stored in the `_min` field and the higher value in the `_max` field.
5. Validate the normalized dictionary against `schemas/SFS_USER_CONFIG.schema.json` before publishing it.

The sorted pairs are:

```text
tempo_min / tempo_max
density_min / density_max
velocity_min / velocity_max
octave_min / octave_max
```

The schemas expose these cross-field rules through `x-sfs-invariants`. JSON Schema validates individual fields; the User Configuration validator is responsible for enforcing and testing the relational invariants.

---

# 6. Algorithmic and Generative Music Principle

Layer C must use an algorithmic/generative approach.

Layer B data should not directly map to individual notes in a one-to-one way.

Bad approach:

```text
energy → MIDI pitch
motion → note velocity
```

Preferred approach:

```text
energy → event probability / phrase intensity
density → number of active rhythmic events
tension → harmonic dissonance level
brightness → register and voicing range
effective_variation → probability of mutation
state → musical behavior mode
```

Layer C should behave like a musical system reacting to film dynamics, not like a simple parameter mapper.

User Configuration should define the boundaries and character of this behavior:

```text
Layer B energy = how intense the current film moment is
User tempo_min / tempo_max = the tempo range in which that intensity is expressed
```

---

# 7. User Configuration Engine

## Purpose

The User Configuration Engine manages all user-editable generation parameters, presets, and deterministic/random behavior settings.

It must centralize configuration so that user parameters are not scattered across the Conductor, Harmony Engine, Rhythm Engine, and MIDI Output modules.

## Responsibilities

The User Configuration Engine must:

- Expose user-editable parameters in the Max UI.
- Output a valid `SFS_USER_CONFIG` dictionary.
- Load and publish the canonical default configuration when no preset is loaded.
- Support saving and loading presets.
- Support deterministic generation through a user-defined random seed.
- Support random seed generation.
- Validate and clamp parameter values.
- Make configuration available to the Conductor and other Layer C modules.

## Presets

Presets should be stored as Max dictionaries or JSON-compatible data.

Required preset actions:

```text
save preset
load preset
export preset
import preset
reset to defaults
randomize seed
```

`reset to defaults` reloads the canonical default file and publishes its exact normalized content. It does not generate a new random seed.

Example preset:

```json
{
  "schema": "SFS_USER_CONFIG",
  "version": "0.1.0",
  "preset_name": "Dark Expressionist",
  "reproducibility": {
    "deterministic_mode": true,
    "random_seed": 12345
  },
  "musical_identity": {
    "root_pitch_class": 2,
    "scale_name": "natural_minor",
    "harmonic_risk": 0.8,
    "dissonance_bias": 0.5
  },
  "rhythm": {
    "tempo_min": 45,
    "tempo_max": 140
  },
  "generation": {
    "randomness": 0.4,
    "variation_amount": 0.65,
    "mutation_rate": 0.3
  },
  "structure": {
    "sections_enabled": true
  },
  "density": {
    "density_min": 0.05,
    "density_max": 0.75,
    "max_polyphony": 3
  },
  "midi": {
    "midi_channel": 1,
    "velocity_min": 25,
    "velocity_max": 105,
    "octave_min": 2,
    "octave_max": 6
  }
}
```

---

# 8. Conductor

## Purpose

The Conductor is the central decision-making module of Layer C.

It receives the `SFS_MUSICAL_CONTROL` dictionary and the `SFS_USER_CONFIG` dictionary, then converts them into internal musical instructions for the Harmony Engine and Rhythm Engine.

## Responsibilities

The Conductor must:

- Parse and validate the Layer B dictionary.
- Parse and validate the User Configuration dictionary.
- Track current state and previous state.
- Track time spent in the current state.
- Smooth continuous control values.
- Combine Layer B controls with user-defined ranges and biases.
- Buffer asynchronous inputs with deterministic sequence numbers.
- Generate internal musical context.
- Advance generation only from explicit logical ticks.
- Trigger transitions on scene changes.
- Manage deterministic/generative behavior.

## Suggested Internal Output

The Conductor should output an internal dictionary such as:

```json
{
  "schema": "SFS_CONDUCTOR_CONTEXT",
  "version": "0.1.0",
  "timestamp_ms": 123456,
  "transport": {
    "tick_index": 128,
    "logical_time_us": 123456000,
    "tick_duration_us": 113636,
    "beat": 1,
    "bar": 9,
    "subdivision": 4,
    "phrase_tick": 32,
    "state_age_ticks": 128,
    "section_tick": 64
  },
  "source_state": "action",
  "state": "action",
  "state_fallback_applied": false,
  "section": "develop",
  "sections_enabled": true,
  "section_progress": 0.503937,
  "tempo_bpm": 132,
  "energy": 0.72,
  "density": 0.64,
  "tension": 0.58,
  "brightness": 0.45,
  "activity": 0.77,
  "control_variation": 0.39,
  "variation_amount": 0.5,
  "effective_variation": 0.195,
  "transition": true,
  "accent": true,
  "reset_phrase": false,
  "event_counts": {
    "scene_change": 1,
    "accent": 1,
    "reset_phrase": 0
  },
  "root_pitch_class": 0,
  "scale_name": "natural_minor",
  "harmonic_risk": 0.7,
  "dissonance_bias": 0.4,
  "randomness": 0.4,
  "mutation_rate": 0.25,
  "density_min": 0.05,
  "density_max": 0.9,
  "max_polyphony": 4,
  "midi_channel": 1,
  "velocity_min": 35,
  "velocity_max": 110,
  "octave_min": 3,
  "octave_max": 6,
  "deterministic_mode": true,
  "seed": 12345
}
```

## Variation Semantics

Variation has three distinct values:

```text
control_variation   = Layer B controls.variation
variation_amount    = User Configuration generation.variation_amount
effective_variation = clamp(control_variation * variation_amount, 0, 1)
```

`control_variation` expresses how much variation the film currently requests. `variation_amount` expresses how strongly the selected musical profile permits that request to affect generation. Harmony and Rhythm must use `effective_variation`; they must not read the two source values independently for variation decisions.

## State Handling

Supported MVP states:

```text
calm
tension
action
chaos
```

`SFS_MUSICAL_CONTROL.state.name` may contain a custom Layer B state. The Deterministic MIDI Engine MVP resolves it into a supported behavior profile using this exact rule:

```text
source_state = selected SFS_MUSICAL_CONTROL.state.name

if source_state is exactly one of calm, tension, action, chaos:
    state = source_state
    state_fallback_applied = false
else:
    state = calm
    state_fallback_applied = true
```

Comparison is case-sensitive and does not trim, rename, or infer aliases. `source_state` preserves the valid non-empty Layer B value for diagnostics and future custom-profile support. `state` is the effective MVP behavior profile consumed by tempo, section, Harmony, and Rhythm logic.

Fallback is deterministic and must not consume PRNG values. Continuous controls and one-shot events from the selected dictionary remain active; only the unsupported state label is replaced for behavior selection. A fallback occurrence must produce a diagnostic when a new unsupported `source_state` is adopted, but not repeatedly while that source value is held.

Transitions and `state_age_ticks` compare effective `state` values. Therefore `action -> mystery` resolves to `action -> calm` and is a transition, while `mystery -> suspense` resolves to `calm -> calm` and is not a transition. Full reset initializes `source_state = calm`, `state = calm`, and `state_fallback_applied = false`.

## Musical Sections

The Conductor evolves long states through a deterministic section state machine. For the MVP, the logical clock is 4/4 and `transport.subdivision` is the number of ticks per beat.

The fixed section lengths are:

| Section | Bars | Ticks at 4 ticks/beat |
|---|---:|---:|
| `intro` | 4 | 64 |
| `develop` | 8 | 128 |
| `peak` | 4 | 64 |
| `release` | 4 | 64 |

`state_age_ticks` counts logical ticks since the effective Conductor `state` last changed. It is set to `0` on full engine reset and on an effective-state change. The context for that first tick reports age `0`; the counter increments after the context is emitted.

When sections are enabled:

1. `intro` runs once for `state_age_ticks` `0–63`.
2. After intro, `develop → peak → release` repeats while the same state remains active.

The exact calculation is:

```text
ticks_per_bar = 4 * transport.subdivision
intro_ticks = 4 * ticks_per_bar
develop_ticks = 8 * ticks_per_bar
peak_ticks = 4 * ticks_per_bar
release_ticks = 4 * ticks_per_bar

if state_age_ticks < intro_ticks:
    section = intro
    section_tick = state_age_ticks
    section_duration = intro_ticks
else:
    cycle_length = develop_ticks + peak_ticks + release_ticks
    cycle_tick = (state_age_ticks - intro_ticks) modulo cycle_length

    if cycle_tick < develop_ticks:
        section = develop
        section_tick = cycle_tick
        section_duration = develop_ticks
    else if cycle_tick < develop_ticks + peak_ticks:
        section = peak
        section_tick = cycle_tick - develop_ticks
        section_duration = peak_ticks
    else:
        section = release
        section_tick = cycle_tick - develop_ticks - peak_ticks
        section_duration = release_ticks

section_progress = section_tick / (section_duration - 1)
```

`section_progress` is clamped to `0.0–1.0`. Section changes do not reset `phrase_tick`, event indexes, or PRNG streams.

A Layer B `scene_change`, `reset_phrase`, or source-state change that resolves to the same effective state does not reset `state_age_ticks`. Only a full engine reset or an effective-state change restarts the section timeline.

## Disabling Sections

User Configuration controls the state machine through `structure.sections_enabled`.

When disabled:

```text
section = disabled
section_tick = 0
section_progress = 0.0
```

`state_age_ticks` continues incrementing while sections are disabled. Re-enabling sections computes the section immediately from the existing state age; it does not restart intro or consume randomness. Harmony and Rhythm must ignore section-driven behavior while `section = disabled`.

This allows section structure to be bypassed without changing Layer B state, logical transport, phrase position, or deterministic PRNG sequences.

## Tempo Strategy

The MVP may use a global generated tempo.

User Configuration defines the total available tempo range:

```text
tempo_min
tempo_max
```

The effective Conductor `state`, Layer B `energy`, and Layer B `activity` determine where the current tempo falls inside that user-defined range.

Suggested state weighting:

```text
calm    → lower part of user tempo range
tension → lower/middle part of user tempo range
action  → middle/upper part of user tempo range
chaos   → upper part of user tempo range
```

Tempo must be smoothed to avoid abrupt unstable changes, except when `scene_change` or `reset_phrase` explicitly requests a transition.

## Logical Clock

Musical decisions must use a logical clock rather than elapsed wall-clock time. The clock advances through an explicit `step` operation and produces a monotonically increasing `tick_index` together with beat, bar, subdivision, and `phrase_tick` information. `phrase_tick` increments once per logical tick and returns to zero on full reset or an assigned `reset_phrase` event.

The MVP clock uses 4/4 time. `transport.subdivision` is ticks per beat and defaults to `4`.

### Tick Position

For each `tick_index`:

```text
ticks_per_beat = subdivision
ticks_per_bar = 4 * ticks_per_beat
beat = floor(tick_index / ticks_per_beat) modulo 4 + 1
bar = floor(tick_index / ticks_per_bar) + 1
```

Tick `0` is beat `1`, bar `1`.

### Fixed-Point Logical Time

Layer C maintains `logical_time_us` as a non-negative integer. A full engine reset sets it to `0`. Start and stop do not reset it, and stopped transport does not advance it.

The current smoothed tempo is quantized and converted to a tick duration as follows:

```text
tempo_for_timing = floor(tempo_bpm * 1000000 + 0.5) / 1000000
tick_duration_us = floor(
    60000000 / (tempo_for_timing * subdivision) + 0.5
)
timestamp_ms = floor(logical_time_us / 1000)
```

All values are positive, so `floor(value + 0.5)` is the required round-to-nearest operation. Implementations must not accumulate rounded milliseconds.

At each `step`:

1. The tick begins with the current `logical_time_us`.
2. Apply inputs and calculate the final smoothed `tempo_bpm` for this tick.
3. Calculate `tick_duration_us` using the formula above.
4. Emit Conductor, Harmony, note, and MIDI events using `timestamp_ms` for the current tick.
5. After all tick output is complete, set `logical_time_us = logical_time_us + tick_duration_us`.
6. Increment `tick_index`.

`SFS_CONDUCTOR_CONTEXT.transport` publishes both `logical_time_us` and `tick_duration_us`. Harmony context copies the Conductor `timestamp_ms` and `tick_index` exactly. Note events generated on that tick copy the same values.

In real-time mode, a Max transport or `metro` invokes the same `step` operation used by the generation core. In tests and offline rendering, the test runner invokes `step` directly without waiting for real time.

```text
real-time scheduler -> step -> deterministic generation core -> output adapter
test runner         -> step -> deterministic generation core -> event trace
```

Scheduler jitter may change the physical dispatch time of an output event, but it must not be used as an input to note selection, rhythm generation, harmony mutation, or any other musical decision.

## Input Ingress

Asynchronous inputs must not mutate musical state directly. The ingress layer wraps every received message in an internal envelope before validation:

```text
input_sequence  monotonically increasing integer
target_tick     logical tick that may consume the input
kind            config, musical_control, event, or command
payload         original message or dictionary
```

`input_sequence` is assigned in receive order and is never reused before full process restart. Source timestamps remain diagnostic metadata and do not decide ordering.

In live mode, configuration and musical-control messages target the next logical tick that has not started. Deterministic fixtures provide `target_tick` explicitly.

Ingress behavior is:

- Invalid configuration or musical-control dictionaries, including out-of-range Layer B controls, are logged and do not replace the current valid state.
- One-shot events from an invalid musical-control dictionary are ignored because the dictionary did not enter the tick transaction.
- The valid configuration with the highest `input_sequence` for a tick wins.
- The valid state and continuous-control dictionary with the highest `input_sequence` for a tick wins.
- One-shot events are extracted from every valid musical-control dictionary before latest-value selection and queued as individual occurrences.
- Resolve the selected `state.name` into `source_state`, effective `state`, and `state_fallback_applied` before transition comparison.
- A state transition is derived by comparing the resolved effective `state` with the Conductor's active effective state; the sample-held Layer B `state.changed` flag must not retrigger a transition on later ticks.
- Multiple occurrences of the same event type are preserved and processed exactly once.
- Inputs received while `step` is executing target the following tick and cannot enter the current transaction.

If a live message crosses a tick boundary between runs, it represents a different input schedule and is not expected to produce the same trace.

## Atomic Tick Transaction

At the start of `step`, the core atomically snapshots all eligible envelopes. The transaction then executes in this fixed order:

1. Apply the highest-sequence normalized User Configuration.
2. Apply the highest-sequence Layer B source state and continuous controls, then resolve its effective state.
3. Apply a state transition only when the resolved effective state differs from the active effective state.
4. Process all `reset_phrase` occurrences in `input_sequence` order.
5. Process all `scene_change` occurrences in `input_sequence` order.
6. Process all `accent` occurrences in `input_sequence` order.
7. Calculate `SFS_CONDUCTOR_CONTEXT`.
8. Calculate `SFS_HARMONY_CONTEXT`.
9. Generate `SFS_NOTE_EVENT` dictionaries.
10. Dispatch output lifecycle messages and transaction diagnostics.

Event-type priority overrides arrival order between different event types. Therefore, simultaneous `reset_phrase`, `scene_change`, and `accent` inputs reset the old phrase first, apply the scene transition second, and accent the new material last.

The Conductor event booleans summarize the transaction:

```text
reset_phrase = event_counts.reset_phrase > 0
accent       = event_counts.accent > 0
transition   = effective_state_changed OR event_counts.scene_change > 0
```

`event_counts` records every occurrence processed on that tick. Transaction diagnostics must additionally record each event type, `input_sequence`, `target_tick`, and processing order.

## Module Tick Synchronization

The deterministic generation core is the sole owner of `tick_index`, `logical_time_us`, and tick advancement. Conductor, Harmony, Rhythm, and MIDI Output must not own independent `metro`, transport, `Task`, delay, or wall-clock callbacks that advance musical state or make generation decisions.

One `step` call executes one non-reentrant tick transaction in this exact phase order:

```text
1. ingress snapshot and state/config/event resolution
2. Conductor: emit exactly one SFS_CONDUCTOR_CONTEXT
3. Harmony: consume that Conductor context and emit exactly one SFS_HARMONY_CONTEXT
4. Rhythm: consume that Conductor/Harmony pair and emit zero or more SFS_NOTE_EVENT values
5. MIDI Output: release notes due at this tick, apply transaction lifecycle commands such as a reset-phrase flush, then consume this tick's note events
6. diagnostics and tick-complete marker
7. advance logical_time_us and tick_index
```

Every phase completes synchronously before the next phase starts. A second `step` received while a transaction is active is queued for the next tick; it must not recurse into or interleave with the current transaction.

All data generated by phases 2-5 carry the active transaction's identity:

```text
conductor.transport.tick_index
harmony.tick_index
note_event.tick_index
midi_event.tick_index
```

The Conductor timestamp is authoritative for the transaction. Harmony and note events copy it exactly. MIDI events generated while processing the tick use that tick's logical timestamp; scheduled note-off events use the later tick on which release occurs. No module may increment, reinterpret, or independently derive a tick index.

Harmony must reject a Conductor context whose tick does not equal the active transaction. Rhythm must reject a missing or mismatched Conductor/Harmony pair. MIDI Output must reject a note event whose tick does not equal the active transaction. A rejection emits one diagnostic and must not mutate module memory, consume PRNG state, create a voice, or emit downstream musical output.

Immediate safety commands remain outside the musical pipeline: they may emit MIDI lifecycle events at the current transport position, but they do not invoke Conductor, Harmony, or Rhythm and do not advance logical time. Replaceable module tests must use the same phase and tick rules as the top-level engine.

## Immediate Commands and Reset Barrier

Safety commands do not wait for a musical tick:

- `panic`, `stop`, and global disable act immediately through the output adapter.
- `start` resumes generation at the next logical tick.
- Full engine reset acts as an ordering barrier identified by its `input_sequence`.

When a full-reset barrier is received:

1. Apply the latest valid normalized configuration received before the barrier.
2. Invoke output panic.
3. Reset transport, event indexes, PRNG streams, phrase memory, and module state using that configuration.
4. Discard queued musical-control updates and events whose `input_sequence` is less than or equal to the barrier.
5. Preserve later inputs for the next logical tick.

Configuration received after the barrier applies on the next tick and does not retroactively change the reset seed. Deterministic fixtures must record command envelopes as well as musical inputs.

---

# 9. Harmony Engine

## Purpose

The Harmony Engine generates pitch material for the Rhythm Engine and MIDI Output.

It must not generate rhythm directly. It should provide harmonic context, pitch pools, chords, and possible note choices.

## Inputs

The Harmony Engine receives `SFS_CONDUCTOR_CONTEXT`.

## Outputs

Suggested output dictionary:

```json
{
  "schema": "SFS_HARMONY_CONTEXT",
  "version": "0.1.0",
  "timestamp_ms": 123456,
  "tick_index": 128,
  "root_pitch_class": 0,
  "scale_name": "natural_minor",
  "scale_intervals": [0, 2, 3, 5, 7, 8, 10],
  "borrowed_pitch_classes": [],
  "chord": [60, 63, 67],
  "pitch_pool": [48, 50, 51, 53, 55, 56, 58, 60, 62, 63, 65, 67, 68, 70, 72],
  "dissonance": 0.155833,
  "register_min": 48,
  "register_max": 72
}
```

## Harmonic Behavior

`tension`, `harmonic_risk`, and `dissonance_bias` control harmonic dissonance without allowing film state to choose a musical style.

Suggested abstract behavior:

```text
low tension     → stable scale tones and open voicings
medium tension  → suspensions and denser voicings
high tension    → dissonant intervals; borrowed tones only when permitted
high variation  → faster deterministic mutation of the current vocabulary
```

`brightness`, `octave_min`, and `octave_max` should influence register:

```text
low brightness  → lower part of configured register
high brightness → higher part of configured register
```

`effective_variation` and `mutation_rate` should influence how often harmonic material changes.

`root_pitch_class` and `scale_name` constrain the default harmonic identity. `scale_intervals` in `SFS_HARMONY_CONTEXT` is the resolved pitch-class interval set for the selected scale.

## Dissonance Calculation

`SFS_HARMONY_CONTEXT.dissonance` is a deterministic measurement of the emitted `chord`. It is not copied from Layer B `controls.tension`.

Layer B `tension`, User Configuration `harmonic_risk`, and User Configuration `dissonance_bias` influence how the Harmony Engine selects chord material. After the chord is selected, `dissonance` must be calculated from the emitted `SFS_HARMONY_CONTEXT` fields using this exact contract:

```text
base_pitch_classes = sorted unique {
    (root_pitch_class + interval) modulo 12
    for each interval in scale_intervals
}

chord_pitch_classes = sorted unique {
    pitch modulo 12
    for each pitch in chord
}

borrowed_chord_pitch_classes = sorted unique {
    pitch_class in chord_pitch_classes
    where pitch_class is not in base_pitch_classes
}
```

For every unordered pair in `chord_pitch_classes`, calculate interval class:

```text
distance = abs(pc_a - pc_b) modulo 12
interval_class = min(distance, 12 - distance)
```

Use this fixed interval-class weight table:

| Interval class | Interval family | Weight |
|---:|---|---:|
| 0 | unison / octave | 0.00 |
| 1 | minor 2 / major 7 | 1.00 |
| 2 | major 2 / minor 7 | 0.65 |
| 3 | minor 3 / major 6 | 0.25 |
| 4 | major 3 / minor 6 | 0.20 |
| 5 | fourth / fifth | 0.10 |
| 6 | tritone | 0.90 |

The final value is:

```text
interval_dissonance =
    average pair weight
    or 0 when chord_pitch_classes has fewer than 2 values

borrowed_ratio =
    borrowed_chord_pitch_classes.length / chord_pitch_classes.length
    or 0 when chord_pitch_classes is empty

round6(x) = floor(x * 1000000 + 0.5) / 1000000

SFS_HARMONY_CONTEXT.dissonance =
    round6(clamp(0.85 * interval_dissonance + 0.15 * borrowed_ratio, 0, 1))
```

`borrowed_pitch_classes` still discloses every out-of-scale pitch class present in `chord` or `pitch_pool`. The `borrowed_ratio` part of `dissonance` uses only out-of-scale pitch classes present in `chord`, because `dissonance` measures the sounding harmonic object rather than every candidate in the pitch pool.

## Style-Neutrality Boundary

Layer C is style-neutral because the generation core responds to abstract controls while User Configuration and presets own stylistic vocabulary.

The core must obey these rules:

- `scale_name` is selected only by normalized `SFS_USER_CONFIG` or an explicit user preset change.
- `state.name`, section, tension, brightness, energy, density, and activity must not replace or rename the selected scale.
- State and section may affect abstract intensity, update cadence, voicing, register, and borrowing probability.
- Genre-specific chord progressions, rhythmic pattern libraries, orchestrations, and state-to-scale maps must live in replaceable presets or future style modules, not in the core Conductor, Harmony, or Rhythm algorithms.
- With `harmonic_risk = 0`, all chord, pitch-pool, and generated-note pitch classes must belong to the configured base scale.

The base pitch-class set is:

```text
base_pitch_classes = {
    (root_pitch_class + interval) modulo 12
    for each interval in scale_intervals
}
```

The probability of permitting an out-of-scale pitch during a harmonic mutation is:

```text
borrow_probability = clamp(tension * harmonic_risk, 0, 1)
```

`dissonance_bias` ranks permitted candidates by interval dissonance; it does not bypass `harmonic_risk` and does not select another named scale.

`SFS_HARMONY_CONTEXT.borrowed_pitch_classes` contains the sorted unique pitch classes currently present in `chord` or `pitch_pool` that are outside `base_pitch_classes`. It is empty when no borrowed tones are present. Every disclosed borrowed pitch class must occur in the current chord or pitch pool, and every out-of-scale pitch class in those fields must be disclosed.

## MVP Pitch Strategy

For the MVP, User Configuration selects one identifier from `SFS_SCALE_REGISTRY`. The Harmony Engine resolves that identifier using the registry's `intervals` array and copies it exactly into `SFS_HARMONY_CONTEXT.scale_intervals`.

The selected identity remains stable until User Configuration changes. Tension and state may change voicing or request disclosed borrowed tones according to `harmonic_risk`, but they never switch to another named pitch system implicitly.

---

# 10. Rhythm Engine

## Purpose

The Rhythm Engine generates note events using the Conductor context and Harmony context.

It should use probabilistic and algorithmic methods rather than fixed patterns only.

## Inputs

The Rhythm Engine receives:

```text
SFS_CONDUCTOR_CONTEXT
SFS_HARMONY_CONTEXT
```

## Outputs

The Rhythm Engine outputs note-event dictionaries or Max messages that can be sent to MIDI Output.

Suggested note-event dictionary:

```json
{
  "schema": "SFS_NOTE_EVENT",
  "version": "0.1.0",
  "timestamp_ms": 123456,
  "tick_index": 128,
  "event_index": 42,
  "note_id": "note:42",
  "pitch": 60,
  "velocity": 84,
  "duration_ticks": 2,
  "duration_ms": 227,
  "channel": 1,
  "role": "pulse"
}
```

## Note Event Identity and Ordering

`event_index` is the authoritative ordering key for `SFS_NOTE_EVENT`.

The deterministic generation core owns the note-event counter:

```text
event_index starts at 0 after full reset
event_index increments by 1 for every accepted SFS_NOTE_EVENT
event_index is never reused within a run
```

The canonical note identifier is:

```text
note_id = "note:" + event_index
```

For example, a note event with `event_index = 42` must use `note_id = "note:42"`. Role names such as `pulse`, `bass`, `harmony`, and `accent` remain in the `role` field and must not be embedded in `note_id`.

When multiple note events are generated for the same `tick_index`, the Rhythm Engine and MIDI Output must process them in ascending `event_index` order. Duplicate `event_index`, duplicate `note_id`, or a `note_id` that does not equal `"note:" + event_index` is invalid. The later invalid event must be rejected, one diagnostic must be emitted, and no downstream MIDI lifecycle or raw MIDI output may be produced from it.

After full reset, a generated note-event trace with non-contiguous `event_index` values is a deterministic-test failure. Standalone module tests that inject invalid note events must verify that invalid input does not mutate module state or consume PRNG values.

## Rhythmic Behavior

`density` should control how many events are generated, constrained by `density_min`, `density_max`, and `max_polyphony`.

```text
low density  → sparse notes
mid density  → pulses, ostinatos, simple patterns
high density → active rhythmic streams
chaos        → dense irregular events
```

`energy` should influence velocity, rhythmic activity, and phrase intensity, constrained by `velocity_min` and `velocity_max`.

`activity` should influence event frequency and subdivision.

`effective_variation`, `randomness`, and `mutation_rate` should influence rhythmic mutation and probability of unexpected events.

Deferred controls `rhythm_complexity`, `syncopation`, `repetition`, `memory_length`, and `polyrhythm_amount` must not appear in `SFS_USER_CONFIG v0.1.0` or `SFS_CONDUCTOR_CONTEXT v0.1.0`; accepting inert controls would make presets misleading and deterministic-response tests incomplete. A future implementation may add them through a new schema version together with defined generation semantics and measurable acceptance criteria.

`accent` events should produce stronger MIDI events or rhythmic emphasis.

`reset_phrase` should restart rhythmic pattern generation.

`scene_change` should allow a transition, break, accent, or new phrase.

## MVP Rhythm Strategy

The MVP should support at least three generative rhythm modes:

```text
sparse
pulse
active
```

Optional fourth mode:

```text
chaotic
```

Suggested mapping:

```text
calm    → sparse
tension → sparse or pulse
action  → pulse or active
chaos   → active or chaotic
```

---

# 11. MIDI Output

## Purpose

MIDI Output converts internal note events into actual MIDI messages.

## Responsibilities

The MIDI Output module must:

- Receive note events.
- Convert each accepted note event into one MIDI note-on and one corresponding note-off.
- Track every active note until it is released.
- Enforce configured maximum polyphony.
- Support selectable MIDI channel.
- Expose raw MIDI 1.0 bytes through an outlet for host routing.
- Expose normalized lifecycle dictionaries through a separate internal outlet.
- Apply MIDI configuration from `SFS_USER_CONFIG` or `SFS_CONDUCTOR_CONTEXT`.
- Provide explicit flush and panic operations.

## MIDI Routing Ownership

Layer C owns MIDI generation, channel assignment, note lifecycle, and raw MIDI message output. It does not own MIDI destination discovery, device names, port selection, or hardware connection state.

The MIDI Output abstraction exposes:

```text
outlet 1: normalized SFS_MIDI_EVENT dictionaries
outlet 2: raw MIDI 1.0 bytes as individual Max integer messages
```

A containing Max patch may route outlet 2 directly to `midiout`, through an adapter for a plugin or network protocol, to a recorder or monitor, or to nothing. That routing is host/session state and is not part of `SFS_USER_CONFIG`, presets, deterministic traces, or Deterministic MIDI Engine MVP acceptance.

## Raw MIDI Outlet Contract

Outlet 2 uses the Max-compatible MIDI 1.0 byte-stream convention. Each byte is emitted as a separate Max integer message in wire order. The outlet does not emit a three-byte Max list or a Max-specific `midievent` wrapper.

The MVP emits these complete channel-voice messages:

| Semantic Event | Byte 1: Status | Byte 2 | Byte 3 |
|---|---:|---:|---:|
| Note on | `0x90 + channel - 1` | pitch `0-127` | velocity `1-127` |
| Note off | `0x80 + channel - 1` | pitch `0-127` | `0` |
| Control change | `0xB0 + channel - 1` | controller `0-127`, except CC 120 | value `0-127` |

Every message must include its status byte. Running status is forbidden so that a capture can be decoded without hidden prior state and replayed deterministically. Raw bytes therefore use the range `0-255`, while pitch, velocity, controller, and value data bytes remain in `0-127`.

MIDI CC 120 (`All Sound Off`) is outside the MVP. `SFS_MIDI_EVENT v0.1.0` must reject controller `120` and must reject the legacy `cc120_sent` field.

For every note-on, note-off, or control-change message, the corresponding `SFS_MIDI_EVENT` dictionary must leave outlet 1 before the first raw status byte leaves outlet 2. Summary lifecycle events such as `voice_steal`, `flush`, and `panic` do not directly add raw bytes; their ordered note-off and control-change lifecycle events produce the required raw messages.

System Exclusive, system common, system real-time, MIDI Time Code, MIDI Machine Control, running status, and MIDI 2.0 Universal MIDI Packet output are outside the MVP contract. A future implementation may expose them through a separately versioned interface.

## Required MIDI Fields

```text
note_id      unique note owner identifier
pitch        MIDI note number, 0–127
velocity     MIDI velocity, 1–127
duration_ticks positive integer logical ticks
duration_ms    positive integer nominal duration
channel      MIDI channel, 1–16
```

`note_id` must equal `"note:" + event_index` for every generated `SFS_NOTE_EVENT`. It is deterministic, globally unique within a run, and unique among active voices.

Pitch, velocity, and channel may be clamped to their valid MIDI ranges. Events with a missing `note_id`, a mismatched `note_id`, duplicate `event_index`, duplicate active `note_id`, non-finite values, or a non-positive duration must be rejected and reported through diagnostics rather than partially emitted.

## Voice Ownership and Note-Off Scheduling

The MIDI Output module must maintain an active-voice registry containing at least:

```text
note_id
pitch
channel
note_on_event_index
scheduled_off_tick
```

When a note event is accepted:

1. Emit its note-on.
2. Register the active voice under `note_id`.
3. Set `scheduled_off_tick = tick_index + duration_ticks`.
4. On release, emit exactly one note-off and remove the voice from the registry.

At the beginning of each tick's MIDI lifecycle phase, release every voice whose `scheduled_off_tick <= current tick_index` before processing lifecycle commands, voice stealing, retriggering, or new note-ons. Release order is ascending original note-on `event_index`. Because `note_id` is derived from `event_index`, no additional tie-breaker is valid in normal operation.

`duration_ms` is a deterministic nominal value calculated when the note is generated:

```text
duration_ms = max(
    1,
    floor((duration_ticks * tick_duration_us) / 1000 + 0.5)
)
```

MIDI lifecycle scheduling uses `duration_ticks`, not `duration_ms`. Therefore later tempo changes affect physical note length naturally through future logical ticks without changing note ownership or deterministic release order.

Late scheduler execution may delay physical MIDI delivery, but it must not create duplicate note-offs or alter ownership.

For the MVP, overlapping notes with the same pitch and channel use deterministic retrigger behavior. Existing matching voices are released before the new note-on is emitted. This prevents an older scheduled note-off from terminating a newer note of the same pitch.

## Polyphony and Voice Stealing

The number of active voices must never exceed `max_polyphony`.

When a new note is accepted at the polyphony limit, the adapter must release the oldest active voice before emitting the new note-on. Age is determined by the lowest `note_on_event_index`. This voice-stealing policy must be identical in real-time and test operation.

## Same-Tick MIDI Lifecycle Ordering

Within one MIDI lifecycle phase, the MIDI Output module processes one `tick_index` in this exact order:

1. Scheduled note-offs due at this tick, ordered by original `event_index`.
2. Lifecycle commands and flushes for this tick.
3. New `SFS_NOTE_EVENT` values for this tick, ordered by ascending `event_index`.

For each new note event in that ordered sequence:

1. Reject it if `note_id` does not equal `"note:" + event_index`, if its `event_index` was already accepted in the current run, or if its `note_id` is already active.
2. Release existing active voices with the same pitch and channel in ascending original `event_index`; each release emits a `note_off` with reason `retrigger`.
3. If accepting the new note would exceed `max_polyphony`, emit one `voice_steal` lifecycle event for the active voice with the lowest original `event_index`, then emit that voice's `note_off` with reason `voice_steal`.
4. Emit the new note's `note_on` with reason `generated`.
5. Register the new active voice and scheduled note-off.

The ordering is deterministic even when several note events share the same `tick_index`. Host scheduling delay must not change this order.

## Flush and Panic Behavior

A normal `flush` must cancel pending note-off operations, emit note-offs for all tracked active voices, and clear the active-voice registry.

A MIDI `panic` must:

- perform a normal flush;
- emit MIDI CC 123 (`All Notes Off`) on every channel used by the adapter;
- leave the active-voice count at zero even if the raw MIDI outlet is unconnected.

Panic must run before:

- full engine reset;
- stop or global disable;
- MIDI channel change;
- patch shutdown.

The Layer B `reset_phrase` event performs a normal flush at its assigned logical tick before the new phrase starts. It does not send CC panic messages unless explicitly requested by the user.

## Internal Test Output

The MIDI Output module must expose normalized `SFS_MIDI_EVENT` dictionaries through its lifecycle outlet before emitting corresponding raw MIDI messages. Tests must run with no MIDI destination configured.

## MIDI Lifecycle Output Contract

The normative contract is:

```text
schemas/SFS_MIDI_EVENT.schema.json
```

Every lifecycle dictionary contains:

```text
timestamp_ms        logical event time
tick_index          current logical transport tick
midi_event_index    monotonic lifecycle event index
source_event_index  originating SFS_NOTE_EVENT index, or null
input_sequence      originating command/input sequence, or null
type                lifecycle event type
reason              deterministic cause
active_voice_count  active voices after this event's state mutation
```

Supported event types are:

| Type | Required Type-Specific Data |
|---|---|
| `note_on` | `note_id`, pitch, velocity, channel |
| `note_off` | `note_id`, pitch, release velocity fixed at `0`, channel |
| `control_change` | channel, controller, value |
| `voice_steal` | stolen `note_id`, `replacement_note_id`, stolen pitch and channel |
| `flush` | ordered `released_note_ids` |
| `panic` | ordered `released_note_ids`, sorted `used_channels` |

`midi_event_index` increments for every emitted `SFS_MIDI_EVENT`. It resets to `0` after a full-reset barrier completes; panic events emitted before that reset belong to the previous run.

`timestamp_ms` and `tick_index` are logical values. Immediate safety commands use the current transport position. Host routing metadata and physical dispatch time are not part of this contract.

Example note-on:

```json
{
  "schema": "SFS_MIDI_EVENT",
  "version": "0.1.0",
  "timestamp_ms": 123456,
  "tick_index": 128,
  "midi_event_index": 42,
  "source_event_index": 42,
  "input_sequence": 77,
  "type": "note_on",
  "reason": "generated",
  "active_voice_count": 1,
  "note_id": "note:42",
  "pitch": 60,
  "velocity": 84,
  "channel": 1
}
```

Example panic summary:

```json
{
  "schema": "SFS_MIDI_EVENT",
  "version": "0.1.0",
  "timestamp_ms": 123500,
  "tick_index": 128,
  "midi_event_index": 49,
  "source_event_index": null,
  "input_sequence": 88,
  "type": "panic",
  "reason": "user_panic",
  "active_voice_count": 0,
  "released_note_ids": ["note:42"],
  "used_channels": [1]
}
```

## Deterministic Lifecycle Ordering

Lifecycle events are emitted in this order:

- Normal note: `note_on`, then one `note_off` when its duration expires.
- Same-pitch retrigger: old `note_off`, then new `note_on`.
- Voice stealing: `voice_steal`, stolen `note_off`, replacement `note_on`.
- Flush: tracked `note_off` events ordered by original note-on `event_index`, followed by one `flush` summary.
- Panic: the complete flush sequence, CC 123 `control_change` events in ascending channel order, then one `panic` summary.

The `released_note_ids` array uses the same deterministic release order. `used_channels` is sorted ascending. A lifecycle dictionary is emitted through outlet 1 before its corresponding raw MIDI message is emitted through outlet 2.

## MVP MIDI Roles

The MVP should support at least one MIDI stream.

Preferred role names:

```text
pulse
bass
harmony
accent
texture
```

The MVP may initially use only one or two roles, but the role field should exist from the beginning.

---

# 12. Deterministic and Generative Behavior

Layer C must support both deterministic and generative behavior.

## Deterministic Mode

Deterministic mode must satisfy this contract:

> After a full engine reset, identical ordered control messages assigned to identical logical ticks, combined with the same validated user configuration and master seed, must produce an identical ordered `SFS_NOTE_EVENT` trace.

The trace comparison includes all event data generated by Layer C, including `timestamp_ms`, `tick_index`, `event_index`, `note_id`, pitch, velocity, `duration_ticks`, `duration_ms`, channel, and role. For generated events, `timestamp_ms` is logical musical time derived from the tick sequence, not the wall-clock time at which Max dispatches the message.

The deterministic guarantee covers musical decisions and generated event data. It does not guarantee identical operating-system scheduling, host-routed MIDI delivery, plugin behavior, CV hardware response, or rendered audio samples.

## Generative Mode

The system may use controlled randomness to vary:

- note selection
- rhythmic placement
- velocity
- duration
- harmonic mutation
- phrase evolution

## Seed

The User Configuration Engine stores one user-facing master random seed in the schema range `0–2147483647`.

Layer C uses the fixed PRNG contract named `sfs_xorshift32_v1`. Every implementation must use the unsigned 32-bit operations defined below. It must not substitute Max `random`, JavaScript `Math.random`, or another implementation-defined generator.

### PRNG State Transition

```text
function next_uint32(state):
    x = uint32(state)
    x = uint32(x XOR (x << 13))
    x = uint32(x XOR (x >>> 17))
    x = uint32(x XOR (x << 5))
    return x

function next_float(state):
    state = next_uint32(state)
    value = state / 4294967296
    return state, value
```

`next_float` produces values in `[0.0, 1.0)`. JavaScript implementations must use `>>> 0` after each state transition to preserve unsigned 32-bit behavior.

The xorshift32 all-zero state is invalid. Whenever an initial or derived state equals `0`, it must be replaced with hexadecimal `0x6D2B79F5` (`1831565813`) before the first draw.

### Module Seed Derivation

The fixed module stream names are:

```text
conductor
harmony
rhythm
```

For each module, construct the ASCII string:

```text
<master_seed_decimal>:<module_name>
```

The decimal seed has no sign or leading zeroes, except seed zero is written as `0`. Hash this string with 32-bit FNV-1a:

```text
hash = 2166136261
for each ASCII byte:
    hash = uint32(hash XOR byte)
    hash = low_32_bits(hash * 16777619)
```

JavaScript implementations must perform multiplication as an explicit 32-bit integer multiply. If `Math.imul` is unavailable in either runtime, use this equivalent operation:

```text
function imul32(a, b):
    a_low  = a AND 0xFFFF
    a_high = (a >>> 16) AND 0xFFFF
    b_low  = b AND 0xFFFF
    b_high = (b >>> 16) AND 0xFFFF
    return uint32(
        (a_low * b_low) +
        (((a_high * b_low + a_low * b_high) AND 0xFFFF) << 16)
    )
```

This helper returns the same low 32 bits as `Math.imul(a, b)`. Ordinary JavaScript floating-point multiplication of the complete 32-bit operands must not be used for the hash.

The resulting hash is the module's initial PRNG state. Apply the zero-state replacement if necessary.

Separate module streams prevent changes in Harmony random calls from silently changing the Rhythm sequence. Each module may consume only its own stream. Within a logical tick, random decisions must be evaluated in a fixed code order documented by that module's tests.

### Deterministic and Generative Seed Behavior

When `deterministic_mode` is true, full reset always derives all module streams from the stored `random_seed`.

When `deterministic_mode` is false, the host may generate a new valid master seed before full reset, but the deterministic core must receive that concrete seed as input and record it in diagnostics. The core itself must never read wall-clock time or operating-system randomness.

The `randomize seed` UI action generates and stores a new valid master seed before reset. Merely pressing start or stop does not alter the seed or any PRNG stream.

### Reference Test Vectors

Starting xorshift32 directly from state `1` must produce:

```text
270369
67634689
2647435461
307599695
2398689233
```

For master seed `12345`, module derivation and the first five `next_uint32` results must be:

| Stream | Derived Seed | First Five Values |
|---|---:|---|
| `conductor` | `2946234711` | `3332329711, 3168170862, 634047571, 4099070995, 1439536283` |
| `harmony` | `4284791764` | `1809839291, 1012080127, 2725679913, 1919086368, 3747210371` |
| `rhythm` | `1567598114` | `2631789591, 180128696, 3803385341, 3801178907, 280946722` |

After zero-state replacement with `0x6D2B79F5`, the first five values must be:

```text
1085196063
2447379481
2618286376
1701901981
265159372
```

PRNG and seed-derivation tests must pass in both Max JavaScript and Node before deterministic musical trace tests are considered valid.

## Reset and Transport Semantics

A full engine `reset` must:

- set `tick_index` and `event_index` to zero;
- restore every module-specific random stream from the master seed;
- clear pending one-shot events at or before the reset barrier while preserving later-sequence inputs;
- clear phrase, rhythm, and harmony memory;
- restore the initial musical section and internal state;
- invoke output panic before clearing active output voices.

`stop` pauses logical tick advancement and invokes output panic. `start` resumes from the current logical tick with no previously active voices. Neither command performs a full engine reset.

The Layer B `reset_phrase` event flushes active voices and resets phrase and rhythm structure at its assigned tick, but it does not reset the master transport, event index, or pseudo-random streams.

## Recommended Implementation Boundary

The deterministic generation core should be implemented as pure state-transition logic, preferably in JavaScript that can be exercised from both Max and a Node fixture runner. Max patchers should provide scheduling, UI, routing outlets, and output side effects around that core.

No musical decision inside the deterministic core may read wall-clock time.

This design allows the same fixture suite to verify real-time and offline generation behavior.

---

# 13. MVP User Controls

The MVP patch should expose user controls through the User Configuration Engine.

Minimum UI controls:

```text
start / stop
global enable
MIDI panic
preset save
preset load
preset export
preset import
reset to defaults
MIDI channel
seed
randomize seed
deterministic mode
reset generation
sections enabled
root pitch class
scale
tempo min
tempo max
density min
density max
max polyphony
harmonic risk
dissonance bias
randomness
variation amount
mutation rate
velocity min
velocity max
octave min
octave max
```

These controls allow the user to shape Layer C independently of Layers A and B.

---

# 14. Test Mode

Layer C must be testable without video input.

The MVP should include a test input module that can generate example `SFS_MUSICAL_CONTROL` dictionaries for:

```text
calm
tension
action
chaos
scene_change
accent
reset_phrase
```

Suggested test abstraction:

```text
devtools/max/sfs.music_engine.deterministic_midi.control_source.test.maxpat
```

The MVP must load `data/music/SFS_USER_CONFIG.deterministic_midi.default.v0.1.0.json` so that the Deterministic MIDI Engine can run immediately without user setup.

This allows Codex or the developer to test Layer C independently.

---

# 15. Acceptance Criteria

The MVP is complete only when every automated criterion passes. MIDI destination routing is intentionally outside Layer C acceptance.

## Measurement Protocol

Unless a criterion specifies otherwise, automated musical tests use:

```text
deterministic_mode = true
random_seed = 12345
time signature = 4/4
subdivision = 4 ticks per beat
test length = 256 ticks = 16 bars
control update tick = 0
event test tick = 128
```

Pairwise tests must use the same reset state, seed, configuration, and control stream, changing only the parameter named by the criterion. A fixture that generates no notes when notes are required fails rather than producing an undefined metric.

Metrics are defined as follows:

- `note_count`: number of normalized internal MIDI `note_on` events in ticks `0–255`.
- `mean_pitch`: arithmetic mean MIDI pitch of those note-on events.
- `mean_dissonance`: arithmetic mean of `SFS_HARMONY_CONTEXT.dissonance` over ticks `0–255`.
- `bar_signature`: ordered tuples of tick offset within the bar, pitch class, duration, and role for every note-on in that bar.
- `unique_bar_signatures`: number of distinct canonical bar signatures in the 16-bar run.
- `active_voice_count`: voice count reported by the internal MIDI lifecycle outlet after each lifecycle event.

Canonical traces use JSON Lines with keys sorted lexicographically and floating-point values rounded to six decimal places. They include logical timestamps and exclude wall-clock timestamps, host routing metadata, and physical dispatch times.

Automated fixtures should live in:

```text
devtools/testdata/layer_c/deterministic_midi_sequences.json
```

Automated results should be written to:

```text
logs/tests/layer_c_deterministic_midi_selftest.latest.json
logs/tests/layer_c_deterministic_midi_selftest.jsonl
```

## Contract and Configuration Criteria

| ID | Test | Pass Condition |
|---|---|---|
| `LC-C01` | Schema validity | Every emitted `SFS_USER_CONFIG`, `SFS_CONDUCTOR_CONTEXT`, `SFS_HARMONY_CONTEXT`, `SFS_NOTE_EVENT`, and `SFS_MIDI_EVENT` validates against its schema; validation error count is `0`. |
| `LC-C02` | Configuration normalization | A fixture containing missing fields, wrong types, half-value integers, unknown scale, reversed ranges, and out-of-range values produces the exact normalized dictionary obtained from the canonical defaults and normalization rules, then passes schema and cross-field invariant validation. |
| `LC-C03` | Range invariants | Every emitted configuration satisfies `tempo_min <= tempo_max`, `density_min <= density_max`, `velocity_min <= velocity_max`, and `octave_min <= octave_max`. |
| `LC-C04` | Conductor propagation | On the first tick after configuration is accepted, every configuration-derived field in `SFS_CONDUCTOR_CONTEXT` equals the normalized source value. |
| `LC-C05` | Preset round trip | Save a non-default preset, reset to defaults, and reload the preset; canonical normalized configuration before save and after load must be byte-equivalent. The intermediate reset output must equal the canonical default file. |
| `LC-C06` | Runtime diagnostics | The complete automated suite produces `0` Max errors, `0` schema errors, and `0` unhandled JavaScript exceptions. |
| `LC-C07` | Scale registry | The production registry validates against `SFS_SCALE_REGISTRY`, contains exactly the seven ordered IDs, uses sorted unique intervals beginning at `0`, and matches every `scale_name` enum in Layer C schemas. |
| `LC-C08` | Unknown state normalization | On receipt of `state.name = mystery`, Conductor reports `source_state = mystery`, `state = calm`, and `state_fallback_applied = true`; all three fields validate against `SFS_CONDUCTOR_CONTEXT`. Supported state names pass through unchanged with the flag `false`. |
| `LC-C09` | Deferred polyrhythm field | A configuration containing `rhythm.polyrhythm_amount` fails `SFS_USER_CONFIG v0.1.0` validation, emits one configuration diagnostic, and does not replace the current valid configuration. No emitted `SFS_CONDUCTOR_CONTEXT v0.1.0` contains `polyrhythm_amount`. |
| `LC-C10` | Canonical defaults | The default configuration file exists, validates against `SFS_USER_CONFIG`, satisfies every cross-field invariant, and is byte-equivalent after canonical JSON serialization to both startup output and `reset to defaults` output. |
| `LC-C11` | Invalid Layer B input rejection | After one valid musical-control dictionary is accepted, an invalid dictionary with an out-of-range continuous control and true one-shot events produces exactly one schema diagnostic, does not change Conductor state or continuous controls, and queues no one-shot events from the invalid dictionary. The next valid dictionary is accepted normally. |
| `LC-C12` | Deferred inert controls | A configuration containing any of `rhythm.rhythm_complexity`, `rhythm.syncopation`, `generation.repetition`, or `generation.memory_length` fails `SFS_USER_CONFIG v0.1.0` validation, emits one configuration diagnostic, and does not replace the current valid configuration. No emitted `SFS_CONDUCTOR_CONTEXT v0.1.0` contains any of those fields. |
| `LC-C13` | Harmony dissonance contract | For every emitted `SFS_HARMONY_CONTEXT`, recomputing `dissonance` from `root_pitch_class`, `scale_intervals`, and `chord` using the documented interval-class formula produces exactly the emitted value after six-decimal rounding. The documented example with chord `[60, 63, 67]` and natural minor scale produces `0.155833`. |
| `LC-C14` | Note identity contract | Every generated `SFS_NOTE_EVENT` has contiguous `event_index` values starting at `0` after full reset, and every `note_id` equals `"note:" + event_index`. A standalone invalid-event fixture with mismatched `note_id`, duplicate `event_index`, and duplicate active `note_id` emits exactly one diagnostic per invalid event, produces no downstream MIDI lifecycle/raw MIDI output from those invalid events, and leaves module state and PRNG state unchanged. |
| `LC-C15` | Contract version enforcement | For each Layer C v0.1.0 schema, a dictionary with the correct `schema` name and `version = "0.1.0"` validates, while the same dictionary with `version = "0.1.1"`, `"1.0.0"`, or a missing `version` fails validation and emits one schema diagnostic. Invalid-version dictionaries must not replace current valid state or produce downstream output. |
| `LC-C16` | Deferred CC 120 output | Any `SFS_MIDI_EVENT v0.1.0` containing `cc120_sent` or a `control_change` with controller `120` fails validation, emits one schema diagnostic, and produces no raw MIDI bytes. MIDI CC 120 is available only through a future schema version with an explicit configuration contract. |

## Clock and Determinism Criteria

| ID | Test | Pass Condition |
|---|---|---|
| `LC-D01` | Logical clock | A 256-step run emits exactly 256 Conductor contexts with contiguous `tick_index` values `0–255`; beat and bar match the formulas, and no duplicate or skipped ticks occur. |
| `LC-D02` | Identical replay | Two full-reset runs with identical tick-assigned input, preset, and seed produce byte-equivalent canonical note-event traces. |
| `LC-D03` | Seed sensitivity | Repeating the probabilistic fixture with seed `12346` produces a different canonical trace while all emitted dictionaries remain valid. |
| `LC-D04` | Reset reproducibility | Run a fixture, perform a full reset, and rerun it; the second canonical trace must equal the first. |
| `LC-D05` | Scheduler independence | Run the same tick sequence once without delays and once with varied real-time delays between `step` calls; canonical traces must be byte-equivalent. |
| `LC-D06` | One-shot consumption | For each input event assigned to tick `128`, the corresponding Conductor event flag is true only at tick `128`; `event_counts` equals the exact number of queued occurrences and every occurrence appears once in transaction diagnostics. |
| `LC-D07` | PRNG compatibility | Max JavaScript and Node both match every `sfs_xorshift32_v1` direct-state, zero-state, module-seed, and first-five-output reference vector exactly. |
| `LC-D08` | Simultaneous event priority | A tick containing `reset_phrase`, `scene_change`, and `accent` records processing in that exact priority order, resets phrase state before transition, and generates accent material only after the transition. |
| `LC-D09` | Latest-value selection | With three valid configuration and control updates targeting one tick, the highest `input_sequence` values appear in the Conductor context, while one-shot events from all three inputs remain represented in `event_counts`. |
| `LC-D10` | Reentrant input isolation | An input injected while `step(128)` is executing has no effect on tick `128` and is applied exactly once at tick `129`. |
| `LC-D11` | Reset barrier | Inputs before a full-reset barrier are discarded except for the latest valid configuration used by reset; inputs after the barrier are preserved and applied at the next tick. |
| `LC-D12` | Held-state stability | After one effective-state change, repeated ticks without a new effective state report `transition = false` even if the latest Layer B dictionary had `state.changed = true`. |
| `LC-D13` | Section timeline | With sections enabled and one unchanged state, ticks `0–63` are `intro`, `64–191` are `develop`, `192–255` are `peak`, `256–319` are `release`, and tick `320` returns to `develop`; `section_tick` and `section_progress` match the formula on every tick. |
| `LC-D14` | Section state reset | An effective-state change at tick `200` reports `state_age_ticks = 0`, `section = intro`, `section_tick = 0`, and `section_progress = 0` on that tick. |
| `LC-D15` | Sections disabled | With `sections_enabled = false`, every context reports `section = disabled`, `section_tick = 0`, and `section_progress = 0`, while `state_age_ticks` remains contiguous. Re-enabling uses the existing state age without resetting PRNG streams. |
| `LC-D16` | Section event isolation | `scene_change` and `reset_phrase` events do not change `state_age_ticks` or the expected section timeline. |
| `LC-D17` | Fixed-point timing | At `120 BPM` and subdivision `4`, every `tick_duration_us` is `125000`; tick timestamps begin `0, 125, 250, 375` ms, and after 10000 ticks the internal logical time is exactly `1250000000` microseconds. |
| `LC-D18` | Note duration | At `132 BPM` and subdivision `4`, a two-tick note reports `tick_duration_us = 113636`, `duration_ticks = 2`, and `duration_ms = 227`; its note-off is emitted at `note_on.tick_index + 2`. |
| `LC-D19` | Unknown state equivalence | A 256-tick `mystery` fixture and an otherwise identical `calm` fixture produce byte-equivalent Harmony, note, and MIDI traces. Changing `mystery` to `suspense` while held in fallback changes `source_state` but does not set `transition`, reset `state_age_ticks`, or consume additional PRNG values. |
| `LC-D20` | Module tick lockstep | A 256-step run emits one Conductor and one Harmony context for every tick `0-255`; each Harmony context matches its Conductor tick and timestamp, every note event matches its generating pair, every MIDI event belongs to the active processing tick, and phase diagnostics show the required order with exactly one tick-complete marker per step. |
| `LC-D21` | Tick mismatch rejection | Standalone module tests inject an off-by-one Conductor/Harmony pair and an off-by-one note event. Each mismatch produces exactly one diagnostic, no downstream event, no module-state or PRNG change, and the following valid matching tick produces the same output as a control run without the invalid input. |

## Musical Response Criteria

| ID | Test | Pass Condition |
|---|---|---|
| `LC-M01` | State response | With all continuous controls fixed at `0.5`, the `action` trace differs from the `calm` trace and `action.note_count >= calm.note_count * 1.25`. All four MVP states must produce valid output. |
| `LC-M02` | Density response | Compare density `0.2` and `0.8`; both runs must emit notes and `high.note_count >= low.note_count * 1.5`. |
| `LC-M03` | Tension response | With `harmonic_risk = 1` and `dissonance_bias = 1`, compare tension `0.2` and `0.8`; `high.mean_dissonance >= low.mean_dissonance + 0.25`. |
| `LC-M04` | Brightness response | With density `0.8`, compare brightness `0.2` and `0.8`; each run must emit at least 16 notes, all pitches must remain inside the configured register, and `high.mean_pitch >= low.mean_pitch + 6` semitones. |
| `LC-M05` | Generative controls | Separate low/high tests for `randomness`, `control_variation`, `variation_amount`, and `mutation_rate` must each produce different traces. Variation tests hold the other variation source at `1`. With all four values at `1`, `unique_bar_signatures` must exceed the all-zero run by at least `2`. |
| `LC-M06` | Tempo bounds | With `tempo_min = tempo_max = 60`, every Conductor context reports `60 BPM`; with both set to `120`, every context reports `120 BPM`; a `50–160` fixture never leaves that range. |
| `LC-M07` | Scene change | A scene-change event at tick `128` sets `transition = true` only at tick `128` and produces either an accent note or an internal flush event during ticks `128–131`. |
| `LC-M08` | Accent | An accent event at tick `128` produces at least one note with role `accent` during ticks `128–129`; its velocity is at least `min(velocity_max, preceding_non_accent_mean + 10)`. |
| `LC-M09` | Phrase reset | A reset-phrase event at tick `128` produces exactly one flush, reports `phrase_tick = 0` at tick `128`, and does not reset `tick_index`, `event_index`, or managed PRNG state. |

## MIDI Lifecycle Criteria

| ID | Test | Pass Condition |
|---|---|---|
| `LC-I01` | Note pairing | Every accepted `note_on` has exactly one later `note_off` with the same `note_id`; no unmatched note-on or note-off remains at fixture completion. |
| `LC-I02` | Polyphony limit | With `max_polyphony = 2` and three simultaneous note requests, `active_voice_count` never exceeds `2`, exactly one voice-steal event occurs, and the stolen `note_id` is the oldest by `event_index`. |
| `LC-I03` | Same-pitch retrigger | Retriggering the same pitch and channel emits old note-off before new note-on; the old scheduled release emits no second note-off and cannot release the new `note_id`. |
| `LC-I04` | Lifecycle commands | For stop, global disable, full reset, channel change, and patch shutdown, `active_voice_count` becomes `0` in the same command-processing cycle. |
| `LC-I05` | Panic | Panic emits one note-off per tracked voice, one CC 123 per used channel, emits no CC 120, emits no duplicate note-offs, and finishes with `active_voice_count = 0`. |
| `LC-I06` | Raw MIDI outlet | A serial non-overlapping fixture on channel `2` with `(pitch, velocity)` values `(60,40)`, `(64,64)`, `(67,96)`, and `(72,127)` emits the exact integer-byte trace `[145,60,40,129,60,0,145,64,64,129,64,0,145,67,96,129,67,0,145,72,127,129,72,0]`. Each array element is a separate outlet message; there are no lists, wrappers, omitted status bytes, or extra bytes. No device or loopback port is required. |
| `LC-I07` | Lifecycle contract | Every lifecycle event validates as `SFS_MIDI_EVENT`; `midi_event_index` is contiguous, event ordering matches the contract, and outlet 1 lifecycle events precede corresponding outlet 2 raw MIDI messages. |
| `LC-I08` | Same-tick note ordering | A fixture injecting three valid same-tick note events with `event_index` values `10`, `11`, and `12` in shuffled arrival order emits lifecycle note-ons and raw MIDI bytes in ascending `event_index` order. A simultaneous scheduled note-off due on that tick is emitted before all three note-ons. |
| `LC-I09` | Same-tick voice stealing | With `max_polyphony = 2` and three same-tick valid note events ordered by `event_index`, exactly one voice-steal event occurs, the stolen `note_id` is the active voice with the lowest original `event_index`, and the lifecycle order is `voice_steal`, stolen `note_off`, replacement `note_on`. |

## UI and Architecture Criteria

| ID | Test | Pass Condition |
|---|---|---|
| `LC-A01` | Independent operation | The full automated suite passes using the Layer C test source with Layers A and B absent. |
| `LC-A02` | Layer isolation | Static validation finds no `SFS_VIDEO_FEATURES`, Jitter matrix, or Jitter texture dependency in production Layer C modules. |
| `LC-A03` | Module replacement boundary | User Configuration, Conductor, Harmony, Rhythm, and MIDI Output each pass a standalone contract test using only their documented dictionary/message interfaces. |
| `LC-A04` | Style neutrality | With `harmonic_risk = 0`, `major`, `natural_minor`, and `dorian` presets all produce valid non-empty traces across every MVP state; every chord, pitch-pool, and generated-note pitch class belongs to the selected scale. |
| `LC-A05` | UI propagation | Changing each required MVP UI parameter produces the expected normalized `SFS_USER_CONFIG` value on the next configuration update without modifying Layer A or Layer B state. |
| `LC-A06` | State-scale independence | With one unchanged preset, cycling through calm, tension, action, and chaos never changes `scale_name` or `scale_intervals`; only an explicit configuration update may change them. |
| `LC-A07` | Borrowed-tone disclosure | A high-tension fixture with `harmonic_risk = 1` produces at least one borrowed pitch class; the sorted `borrowed_pitch_classes` field exactly equals the out-of-scale pitch classes present in chord and pitch pool. With risk `0`, the field is always empty. |

---

# 16. Suggested Initial Implementation Order

1. Validate the default configuration, scale registry, logical tick, user configuration, Conductor, Harmony, note-event, MIDI-lifecycle, reset, and seed contracts against their schemas.
2. Create deterministic fixture streams with explicit control-to-tick assignment.
3. Implement `sfs_xorshift32_v1` and module-seed derivation, then verify all reference vectors in Max and Node.
4. Implement the pure generation-core `step` and full-reset behavior in `sfs.music_engine.core.deterministic_midi.js`.
5. Create `sfs.music_engine.user_config.deterministic_midi.maxpat` with default `SFS_USER_CONFIG` output.
6. Add preset save/load for user configuration.
7. Create `devtools/max/sfs.music_engine.deterministic_midi.control_source.test.maxpat`.
8. Create `sfs.music_engine.clock.deterministic_midi.maxpat` to call the core `step` operation.
9. Create `sfs.music_engine.conductor.deterministic_midi.maxpat`.
10. Make the Conductor combine `SFS_MUSICAL_CONTROL` and `SFS_USER_CONFIG`.
11. Create `sfs.music_engine.harmony.deterministic_midi.maxpat`.
12. Create `sfs.music_engine.rhythm.deterministic_midi.maxpat`.
13. Implement MIDI note ownership, deterministic voice stealing, flush, and panic behavior behind an internal test outlet.
14. Create `sfs.music_engine.midi_output.deterministic_midi.maxpat` around the tested lifecycle logic.
15. Create `sfs.music_engine.deterministic_midi.maxpat` to connect all Layer C modules.
16. Verify identical traces across reset-and-replay runs.
17. Test preset save/load, state changes, density response, and tension response.
18. Test MIDI lifecycle and raw MIDI outlet output separately from deterministic note-event generation.

---

# 17. Notes for Codex

- Keep all modules isolated.
- Prefer simple working Max patches over complex unfinished abstractions.
- Use clear inlet/outlet documentation inside each patch.
- Keep dictionary names and schema fields stable.
- Do not collapse Layer C into direct video-to-note mapping.
- Do not introduce dependency on Layer A internals.
- Do not hard-code a single musical style.
- Make every module testable independently.
- Keep user parameters centralized in the User Configuration Engine.
- Do not hide generation parameters inside individual engines unless they are also represented in `SFS_USER_CONFIG`.
- Treat Layer B as the film-driven control source and User Configuration as the musical behavior profile.
