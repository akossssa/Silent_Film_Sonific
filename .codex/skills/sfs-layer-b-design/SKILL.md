---
name: sfs-layer-b-design
description: Layer B interpretation design for Silent Film Sonific. Use when implementing semantic interpretation, musical state logic, smoothing, hysteresis, event detection, or SFS_MUSICAL_CONTROL generation.
---

# SFS Layer B Design Skill

## Purpose

Layer B is the architectural core of Silent Film Sonific.

Its responsibility is to convert low-level video features into a stable,
musically meaningful control representation.

Layer B is not a sound engine.

Layer B is not a video-analysis engine.

---

## Inputs

Layer B receives `SFS_VIDEO_FEATURES`.

The source of truth is:

```text
schemas/SFS_VIDEO_FEATURES.schema.json
```

Current MVP input features:

- motion intensity
- scene change detection
- brightness
- contrast
- cut strength
- optional regional zones

Inputs must arrive through documented schemas only.

---

## Outputs

Layer B produces `SFS_MUSICAL_CONTROL`.

The source of truth is:

```text
schemas/SFS_MUSICAL_CONTROL.schema.json
```

Current MVP output controls:

- energy
- density
- tension
- activity
- brightness
- variation

Current MVP events:

- scene_change
- accent
- reset_phrase

Current MVP states:

- calm
- tension
- action
- chaos

Outputs must be schema-compliant.

Treat additional values such as `tempo_hint`, `articulation_hint`, or custom
state names as future optional extensions. Do not use them in the MVP unless the
schema, fixtures, and tests are updated first.

---

## Responsibilities

Layer B SHOULD:

- interpret features
- smooth unstable measurements
- detect meaningful state changes
- generate musical control states
- produce reproducible results

Layer B SHOULD NOT:

- generate audio
- generate MIDI directly
- read raw video
- depend on a particular synthesizer
- depend on a particular DAW
- depend on a specific Layer C implementation

---

## Required Techniques

### Smoothing

Avoid frame-by-frame instability.

Examples:

- moving average
- exponential smoothing
- low-pass filtering

### Hysteresis

Prevent rapid state switching.

Example:

A state entered at 0.7 may not leave until 0.5.

### State Machines

Prefer explicit states over ad-hoc thresholds.

MVP states:

calm
→ tension
→ action
→ chaos

### Event Detection

Distinguish:

- continuous state
- one-shot events

Example:

Scene tension is continuous.

Sudden cut is an event.

---

## Testing Requirements

Every Layer B feature should be testable using fixtures.

Use the canonical MVP fixture file:

```text
devtools/testdata/layer_b/interpretation_mvp_sequences.json
```

Prefer fixture-based tests over manual Max patch testing.

Expected behaviour should be deterministic when deterministic mode is enabled.

---

## Architectural Guardrails

Do NOT implement:

motion → volume

brightness → pitch

object_count → note_number

directly in Layer B unless the feature is explicitly marked as an experiment.

Instead:

video features
→ interpretation
→ musical state
→ Layer C mapping

---

## Mandatory Reading

Before modifying Layer B:

- AGENTS.md
- docs/REQUIREMENTS.md
- docs/DESIGN_DECISIONS.md
- docs/RESEARCH.md
- docs/LAYER_B_TESTING.md
- schemas/*
- devtools/testdata/layer_b/interpretation_mvp_sequences.json
