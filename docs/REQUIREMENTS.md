# Silent Film Sonific — Requirements

## 1. Overview

Silent Film Sonific is a modular Max/MSP system for generating and controlling music based on the visual dynamics of silent films or live video streams.

The system analyzes video in real time, interprets visual events as abstract musical control data, and drives one or more music-generation engines.

The architecture is intentionally modular. Each subsystem must be replaceable without requiring changes to the other subsystems.

The system should support both live performance and offline soundtrack generation.

---

## 2. Core Design Principles

### 2.1 Modular Architecture

The system consists of three independent layers:

1. Layer A — Video Analysis
2. Layer B — Interpretation
3. Layer C — Music Engine

Each layer must expose a clearly defined input and output interface.

Layers must communicate only through structured messages.

No layer may directly access the internal implementation of another layer.

Implementations of a layer must be interchangeable.

Example replacements:

- Basic Motion Analysis → Optical Flow Analysis
- Rule-Based Interpretation → AI Interpretation
- MIDI Generator → Audio Synthesizer

These replacements must be possible without modifying the surrounding layers.

---

### 2.2 Style Neutrality

The system must not impose any musical style.

It must be usable for:

- Ambient music
- Rhythmic music
- Orchestral music
- Electronic music
- Noise music
- Experimental music

The system should provide abstract musical control signals rather than genre-specific behavior.

---

### 2.3 Real-Time First

The primary use case is real-time operation.

Offline rendering and soundtrack generation are secondary but supported use cases.

---

### 2.4 Research Positioning

Silent Film Sonific is positioned between:

* traditional video sonification systems;
* adaptive music and game-audio architectures;
* recent semantic video-to-music generation research.

The project does not aim to be a monolithic AI music generator. Instead, it uses
an explicit intermediate representation:

```text
video features -> semantic / musical interpretation -> music engine control
```

This keeps the Max/MSP implementation modular, testable, and suitable for
real-time performance.

Low-level visual features may influence music, but the main architecture should
preserve the Layer A -> Layer B -> Layer C separation described in this document.

---

## 3. System Architecture

```text
Input Source
↓
Layer A — Video Analysis
↓
Layer B — Interpretation
↓
Layer C — Music Engine
↓
Audio / MIDI / OSC / Render Output
```

Suggested Max abstraction naming:

```text
sfs.video_analysis.*
sfs.interpretation.*
sfs.music_engine.*
```

Example implementations:

```text
sfs.video_analysis.basic_motion.maxpat
sfs.video_analysis.optical_flow.maxpat
sfs.interpretation.state_machine.maxpat
sfs.music_engine.generative_midi.maxpat
sfs.music_engine.audio_synth.maxpat
```

---

## 4. Layer A — Video Analysis

### 4.1 Purpose

Layer A extracts measurable visual features from video.

This layer must not make musical, emotional, or semantic decisions.

---

### 4.2 Inputs

Supported inputs:

- Preloaded video files
- Live camera feeds
- External video streams
- Jitter matrices
- Jitter textures

---

### 4.3 Outputs

Layer A must output a structured dictionary using the `SFS_VIDEO_FEATURES` schema.

Minimum required features:

- Motion intensity
- Average brightness
- Contrast
- Scene cut detection

Optional features:

- Motion direction
- Motion speed
- Regional motion analysis
- Object tracking
- Face detection
- Optical flow
- AI-based feature extraction

---

## 5. Layer B — Interpretation

### 5.1 Purpose

Layer B converts raw visual features into abstract musical control information.

This layer represents the semantic bridge between visual analysis and music generation.

---

### 5.2 Inputs

Layer B receives the `SFS_VIDEO_FEATURES` dictionary from Layer A.

---

### 5.3 Outputs

Layer B must output a structured dictionary using the `SFS_MUSICAL_CONTROL` schema.

The layer should expose:

- Musical state
- Energy
- Density
- Brightness
- Tension
- Activity
- Variation
- Transition events

Example states:

- calm
- tension
- action
- chaos

Implementations may define additional custom states.

---

### 5.4 Supported Interpretation Strategies

Possible implementations include:

- Rule-based systems
- State machines
- Probabilistic systems
- Markov models
- Machine learning models
- Hybrid approaches

---

## 6. Layer C — Music Engine

### 6.1 Purpose

Layer C generates music or controls external musical systems.

The Music Engine must not depend on a specific Interpretation implementation.

---

### 6.2 Inputs

Layer C receives the `SFS_MUSICAL_CONTROL` dictionary from Layer B.

Layer C must not read raw video-analysis data directly.

Correct data flow:

```text
motion → interpretation → energy → music engine
```

Incorrect data flow:

```text
motion → music engine
```

---

### 6.3 Outputs

Supported outputs:

- Audio
- MIDI
- OSC
- Plugin automation
- External synthesizer control
- Recorded audio files

---

### 6.4 Supported Music Engine Types

Examples:

- MIDI generators
- Generative sequencers
- Sample players
- Granular synthesizers
- Modular synthesis systems
- Hybrid systems

---

### 6.5 Musical Control Parameters

The Music Engine should respond to abstract controls such as:

- Energy
- Density
- Tension
- Brightness
- Activity
- Variation
- Transition

The Music Engine should not rely on video-analysis data directly.

---

## 7. Interface Contract

Inter-layer communication must be independent of implementation details.

Preferred formats:

- Max dictionaries
- OSC-style messages
- JSON-compatible structures

Messages should be timestamp-capable to support synchronization and offline rendering.

---

## 8. Schema: Layer A → Layer B

### 8.1 Dictionary Name

```text
SFS_VIDEO_FEATURES
```

Suggested Max dictionary name:

```text
dict sfs_video_features
```

Suggested message name:

```text
sfs.video.features
```

---

### 8.2 Purpose

This dictionary carries raw visual-analysis data from Layer A to Layer B.

Layer A must only output measurable visual features.

Layer A must not output musical states, emotions, or performance decisions.

---

### 8.3 Example Dictionary

```json
{
  "schema": "SFS_VIDEO_FEATURES",
  "version": "0.1.0",
  "timestamp_ms": 123456,
  "source": {
    "type": "movie",
    "name": "film.mov",
    "frame": 1024,
    "fps": 24
  },
  "features": {
    "motion": 0.63,
    "brightness": 0.41,
    "contrast": 0.55,
    "cut": false,
    "cut_strength": 0.0
  },
  "zones": {
    "left": {
      "motion": 0.22,
      "brightness": 0.38
    },
    "center": {
      "motion": 0.71,
      "brightness": 0.44
    },
    "right": {
      "motion": 0.36,
      "brightness": 0.42
    }
  }
}
```

---

### 8.4 Required Fields

| Field | Type | Range / Values | Required | Description |
|---|---|---:|---|---|
| `schema` | string | `SFS_VIDEO_FEATURES` | yes | Schema identifier |
| `version` | string | semantic version | yes | Schema version |
| `timestamp_ms` | integer | `>= 0` | yes | Timestamp in milliseconds |
| `source.type` | string | `movie`, `camera`, `stream`, `matrix`, `texture`, `unknown` | yes | Input source type |
| `source.name` | string / null | any | yes | File name, device name, or null |
| `source.frame` | integer / null | `>= 0` | yes | Current frame number, or null for live input |
| `source.fps` | number / null | `> 0` | yes | Source FPS, or null if unknown |
| `features.motion` | number | `0.0–1.0` | yes | Global motion intensity |
| `features.brightness` | number | `0.0–1.0` | yes | Average brightness |
| `features.contrast` | number | `0.0–1.0` | yes | Global contrast |
| `features.cut` | boolean | `true / false` | yes | Scene cut detected |
| `features.cut_strength` | number | `0.0–1.0` | yes | Strength of detected cut |
| `zones` | object | optional zone objects | no | Regional analysis data |

---

### 8.5 Optional Zone Fields

The `zones` object may contain any named screen region.

Recommended default regions:

```text
left
center
right
top
middle
bottom
```

Each zone may contain:

| Field | Type | Range | Description |
|---|---|---:|---|
| `motion` | number | `0.0–1.0` | Regional motion intensity |
| `brightness` | number | `0.0–1.0` | Regional brightness |
| `contrast` | number | `0.0–1.0` | Regional contrast |

---

### 8.6 Update Rate

Layer A should output this dictionary at video frame rate or reduced analysis rate.

Recommended rates:

```text
24 fps movie → 12–24 Hz analysis rate
Live camera → 10–30 Hz analysis rate
Offline rendering → source frame rate or user-defined analysis rate
```

---

## 9. Schema: Layer B → Layer C

### 9.1 Dictionary Name

```text
SFS_MUSICAL_CONTROL
```

Suggested Max dictionary name:

```text
dict sfs_musical_control
```

Suggested message name:

```text
sfs.music.control
```

---

### 9.2 Purpose

This dictionary carries interpreted musical control data from Layer B to Layer C.

Layer B converts visual features into abstract musical controls.

Layer C must use this dictionary as its main control input.

---

### 9.3 Example Dictionary

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

---

### 9.4 Required Fields

| Field | Type | Range / Values | Required | Description |
|---|---|---:|---|---|
| `schema` | string | `SFS_MUSICAL_CONTROL` | yes | Schema identifier |
| `version` | string | semantic version | yes | Schema version |
| `timestamp_ms` | integer | `>= 0` | yes | Timestamp in milliseconds |
| `state.name` | string | `calm`, `tension`, `action`, `chaos`, or custom | yes | Current musical state |
| `state.confidence` | number | `0.0–1.0` | yes | Confidence of current state |
| `state.changed` | boolean | `true / false` | yes | Whether the state changed on this update |
| `state.previous` | string / null | any | yes | Previous state name, or null |
| `controls.energy` | number | `0.0–1.0` | yes | Overall musical energy |
| `controls.density` | number | `0.0–1.0` | yes | Musical event density |
| `controls.tension` | number | `0.0–1.0` | yes | Harmonic/timbral/rhythmic tension |
| `controls.brightness` | number | `0.0–1.0` | yes | Musical brightness |
| `controls.activity` | number | `0.0–1.0` | yes | Musical activity level |
| `controls.variation` | number | `0.0–1.0` | yes | Degree of variation/randomness |
| `events.scene_change` | boolean | `true / false` | yes | Scene transition event |
| `events.accent` | boolean | `true / false` | yes | Musical accent trigger |
| `events.reset_phrase` | boolean | `true / false` | yes | Phrase reset trigger |

---

### 9.5 Update Rate

Layer B should output this dictionary at a musical control rate.

Recommended rate:

```text
5–20 Hz
```

Event fields should be sent immediately when triggered.

---

## 10. MVP Requirements

The first functional version must support the following features.

### 10.1 Video Analysis MVP

- Load and play a preloaded video file
- Accept live video input if available
- Analyze global motion intensity
- Analyze average brightness
- Analyze contrast
- Detect scene cuts
- Output `SFS_VIDEO_FEATURES`

---

### 10.2 Interpretation MVP

- Receive `SFS_VIDEO_FEATURES`
- Smooth raw input values
- Detect and manage state transitions
- Support at least four states:
  - calm
  - tension
  - action
  - chaos
- Output `SFS_MUSICAL_CONTROL`

---

### 10.3 Music Engine MVP

- Receive `SFS_MUSICAL_CONTROL`
- Generate basic audio output
- Generate MIDI output
- Support external MIDI device control
- Respond to:
  - energy
  - density
  - tension
  - brightness
  - activity
  - variation
  - scene change events

---

## 11. Future Extensions

Possible future features include:

- Optical flow analysis
- Object tracking
- Face detection
- Emotion recognition
- AI-assisted interpretation
- Multiple simultaneous music engines
- Multi-channel spatial audio
- Automatic soundtrack rendering
- VST integration
- Collaborative network performance
- Preset system
- Mapping editor
- Timeline-based automation
- Export of analysis data
- Export of musical control data

---

## 12. Non-Functional Requirements

### 12.1 Performance

The system should operate in real time on consumer hardware.

The MVP should remain responsive during video playback, analysis, and sound generation.

---

### 12.2 Extensibility

New layer implementations should require minimal integration effort.

A new implementation is valid if it can read the expected input schema and output the expected output schema.

---

### 12.3 Maintainability

Each layer should be developed and tested independently.

Each abstraction should have a clear responsibility.

Patch naming should follow the `sfs.*` convention.

---

### 12.4 Portability

The architecture should remain independent of any specific Max patch implementation.

The schemas should be reusable from Max, Node for Max, Python/OpenCV, or other external tools.

---

## 13. Project Name

```text
Silent Film Sonific
```
