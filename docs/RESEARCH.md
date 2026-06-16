# Research Notes: Semantic Video-to-Music Systems

This document summarizes research context for **Silent Film Sonific** and explains how related work should inform the project architecture without disrupting the existing Max/MSP workflow.

## 1. Project Positioning

Silent Film Sonific is a modular real-time video-to-music and sonification framework for silent film accompaniment.

The project should not be treated as a simple direct sonification patch where low-level visual measurements are immediately mapped to sound parameters. Instead, the project uses an explicit intermediate representation:

```text
Layer A — Video Analysis
    ↓
Layer B — Semantic / Musical Interpretation
    ↓
Layer C — Sound Generation / Control
```

This architecture makes the system more reusable, testable, and extensible than direct mappings such as:

```text
brightness -> pitch
motion -> volume
```

Direct mappings may still be useful for prototypes, tests, or experiments, but they should not become the core project architecture.

## 2. Main Research Conclusion

Recent video-to-music and adaptive soundtrack systems increasingly emphasize two kinds of alignment:

1. **Semantic alignment** — the generated music should match the apparent mood, action, density, tension, or scene type.
2. **Temporal / rhythmic alignment** — musical timing should respond to cuts, movement rhythm, visual intensity, scene transitions, or action timing.

This strongly supports the Silent Film Sonific design choice to keep Layer B explicit.

Layer B is not just a technical routing layer. It is the project’s main interpretation layer. It translates measured visual features into musical state, events, and control intentions.

## 3. Related System Families

### 3.1 Traditional Video Sonification

Traditional video sonification systems often extract low-level visual features and map them directly to sound.

Common mappings include:

```text
brightness -> pitch / filter cutoff
motion amount -> loudness / density
object position -> pan / pitch
color -> timbre
scene change -> trigger
```

This approach is useful for demonstrations and experimental audiovisual instruments, but it is limited for silent film accompaniment because it does not naturally represent higher-level musical ideas such as suspense, chase, calmness, density, or dramatic transition.

**Relevance to Silent Film Sonific:**

Traditional sonification is useful for Layer A feature extraction and low-level tests, but should not define the final architecture.

### 3.2 Max/MSP and Jitter-Based Audiovisual Systems

Max/MSP and Jitter are well suited for real-time audiovisual work. Jitter can process video streams, matrices, textures, live camera input, and movie playback. Max can route extracted features into sound engines, MIDI, OSC, plugins, external synths, or Node for Max scripts.

Relevant Max/MSP technologies include:

- `jit.movie` for video playback.
- `jit.grab` for live camera input.
- `jit.matrix` for CPU-side video/matrix processing.
- `jit.gl.texture` for GPU texture workflows.
- `cv.jit` for computer vision tools such as tracking, segmentation, frame differencing, optical flow, and shape analysis.
- `dict` for structured messages.
- `node.script` / Node for Max for validation, logging, external logic, and development tooling.

**Relevance to Silent Film Sonific:**

Max/MSP should remain the real-time orchestration environment. However, the system should expose analysis and interpretation through explicit dictionaries rather than hidden patch-cord-only logic.

### 3.3 Adaptive Game Audio Systems

Adaptive game audio systems such as FMOD and Wwise are important conceptual references. They usually do not map pixels directly to sound. Instead, they receive game-state parameters and use them to control adaptive music systems.

A simplified adaptive game audio model is:

```text
Game State
    ↓
Music Parameters
    ↓
Adaptive Score / Sound Engine
```

Silent Film Sonific has a similar structure:

```text
Film / Video State
    ↓
Semantic / Musical State
    ↓
Generative or Adaptive Sound Engine
```

**Relevance to Silent Film Sonific:**

Layer B should be treated similarly to a game-audio state system. It should produce stable musical-control states, not raw visual measurements.

### 3.4 Recent AI Video-to-Music Systems

Recent AI video-to-music systems often use machine learning models to understand visual content and generate background music. These systems usually emphasize semantic understanding and temporal alignment.

Important ideas from this area:

- Video should be interpreted before generating music.
- Music should align with both scene content and timing.
- High-level tags, captions, events, or latent states can guide music generation.
- Direct low-level mapping is usually not enough for convincing musical accompaniment.

Examples of relevant research directions include:

- Video-to-music generation using semantic video understanding.
- Music generation guided by video rhythm and scene transitions.
- Human-motion-to-music systems.
- Systems that convert visual content into intermediate tags before generating audio.

**Relevance to Silent Film Sonific:**

Silent Film Sonific should borrow the architectural idea of semantic intermediate representation, but not necessarily the full AI-generation stack. The project should remain compatible with Max/MSP, deterministic rules, generative systems, external synths, and future AI modules.

## 4. Why Layer B Must Stay Explicit

Layer B is the key architectural distinction of Silent Film Sonific.

Layer A should answer questions such as:

```text
How much motion is present?
Where is motion located?
Did a cut happen?
How bright or contrasted is the frame?
Is the scene visually dense?
Are there stable or rapidly changing regions?
```

Layer B should answer questions such as:

```text
Is the scene calm, tense, chaotic, comic, mysterious, or chase-like?
Should musical density increase or decrease?
Should tempo become more active?
Should a one-shot event be triggered?
Should the sound engine move to a new section or state?
```

Layer C should answer questions such as:

```text
Which notes, sounds, MIDI events, audio processes, or synth parameters should be produced?
```

This separation prevents the project from becoming a fragile collection of direct mappings.

## 5. Recommended Layer Interfaces

### 5.1 Layer A Output: Visual Features

Layer A should output measurable visual descriptors using the `SFS_VIDEO_FEATURES`
contract defined in `schemas/SFS_VIDEO_FEATURES.schema.json`.

Example:

```json
{
  "schema": "SFS_VIDEO_FEATURES",
  "version": "0.1.0",
  "timestamp_ms": 42680,
  "source": {
    "type": "movie",
    "name": "film.mov",
    "frame": 1024,
    "fps": 24
  },
  "features": {
    "motion": 0.74,
    "brightness": 0.41,
    "contrast": 0.70,
    "cut": false,
    "cut_strength": 0.23
  },
  "zones": {
    "left": {
      "motion": 0.22,
      "brightness": 0.38,
      "contrast": 0.51
    },
    "center": {
      "motion": 0.71,
      "brightness": 0.44,
      "contrast": 0.67
    },
    "right": {
      "motion": 0.36,
      "brightness": 0.42,
      "contrast": 0.49
    }
  }
}
```

### 5.2 Layer B Output: Musical Control

Layer B should output interpreted musical state, controls, and events using the
`SFS_MUSICAL_CONTROL` contract defined in
`schemas/SFS_MUSICAL_CONTROL.schema.json`.

Example:

```json
{
  "schema": "SFS_MUSICAL_CONTROL",
  "version": "0.1.0",
  "timestamp_ms": 42680,
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

### 5.3 Layer C Input: Sound Control

Layer C should consume musical-control dictionaries and translate them into sound.

Possible Layer C implementations:

- Max-native generative patch.
- MIDI output to external synths.
- OSC output to SuperCollider, Ableton Live, or another engine.
- Plugin control.
- Sample-based adaptive score.
- Future AI-assisted music generation module.

## 6. Max/MSP Implementation Implications

### 6.1 Prefer Structured Dictionaries

Use Max `dict` messages as the main interface between layers. Avoid relying only on undocumented patch-cord value streams.

Good:

```text
Layer A -> SFS_VIDEO_FEATURES dict -> Layer B
Layer B -> SFS_MUSICAL_CONTROL dict -> Layer C
```

Risky:

```text
jit.matrix -> unpack -> scale -> synth parameter
```

The risky version can exist inside experiments, but should not become the main public interface.

### 6.2 Use Node for Max for Development Support

Node for Max is useful for:

- schema validation;
- logging runtime dictionaries;
- exporting Max Console-like diagnostics into files;
- running fixture-based tests;
- helping Codex inspect real runtime behavior;
- implementing optional non-real-time analysis helpers.

### 6.3 Keep Diagnostics Codex-Readable

Runtime logs should be written as plain text or NDJSON files.

Recommended log path examples:

```text
logs/max-console.log
logs/sfs-events.ndjson
logs/schema-validation.log
```

Recommended NDJSON example:

```json
{"time": 1710000000.0, "layer": "A", "event": "features", "motion_amount": 0.74}
{"time": 1710000000.1, "layer": "B", "event": "state", "tension": 0.82}
```

This allows Codex to debug from actual Max runtime output.

## 7. Design Principles Derived from Research

1. **Do not collapse the three layers.**
   Layer A, Layer B, and Layer C must remain independently replaceable.

2. **Treat Layer B as semantic interpretation, not just scaling.**
   Scaling is only one part of Layer B. Layer B should also handle smoothing, thresholds, hysteresis, event detection, state transitions, and musical intent.

3. **Keep direct mappings as experiments.**
   Direct visual-to-audio mappings are useful for testing, but they should be marked as prototypes or MVP experiments.

4. **Use schemas as contracts.**
   Schemas are what make Codex-assisted development safe.

5. **Prefer observable runtime behavior.**
   Codex should be able to read logs and validate dictionaries rather than guessing what happens inside the Max UI.

6. **Support multiple music engines.**
   The project should not assume one fixed genre, synthesis method, or sound style.

7. **Support both deterministic and generative behavior.**
   The architecture should allow reproducible mappings as well as controlled randomness.

8. **Live-first, export-compatible.**
   Real-time performance should remain the primary design target, but offline rendering/export should not be blocked by the architecture.

## 8. Research Workflow for Future Codex Work

When Codex works on research-sensitive parts of the project, it should follow this process:

1. Read current project docs:
   - `AGENTS.md`
   - `docs/REQUIREMENTS.md`
   - `docs/RESEARCH.md`
   - relevant schemas
   - relevant tests

2. Identify whether the requested change affects:
   - Layer A analysis,
   - Layer B interpretation,
   - Layer C sound generation,
   - schemas,
   - diagnostics,
   - Max/MSP architecture.

3. If the topic is not covered in the docs, perform focused research.

4. Record research findings before implementing architectural changes.

5. Separate:
   - source facts,
   - project interpretation,
   - implementation decision.

6. Preserve the existing workflow unless there is a documented reason to change it.

## 9. Open Research Questions

These questions should guide future research and experiments:

1. What is the minimum useful Layer A descriptor set for silent-film accompaniment?
2. Which Layer B states are musically meaningful but still general enough to be genre-independent?
3. How should the system detect scene-level changes without requiring heavy AI models?
4. How can rhythmic synchronization be achieved from motion and cut detection in Max/MSP?
5. Which parts should remain deterministic, and which should be generative?
6. How should external sound engines receive control: MIDI, OSC, dictionaries, or plugin parameters?
7. How can the system support both live video and preloaded film without separate architectures?
8. How should the project evaluate whether the generated accompaniment is musically useful?

## 10. Current Recommendation

For the next development stage, focus on a minimal but explicit Layer B MVP.

Recommended Layer B MVP responsibilities:

- receive valid `SFS_VIDEO_FEATURES` dictionaries;
- smooth noisy feature values;
- estimate musical state values such as tension, activity, density, and stability;
- detect simple one-shot events such as cuts or sudden motion increases;
- output valid `SFS_MUSICAL_CONTROL` dictionaries;
- provide fixture-based tests;
- write Codex-readable logs.

Avoid building a complex AI interpretation layer too early. The current priority should be a transparent, testable, Max-friendly interpretation layer that can later be replaced or extended.

## 11. Suggested Sources to Track

These source categories should be tracked in future research notes:

- Max/MSP and Jitter official documentation.
- Node for Max documentation.
- `cv.jit` documentation and examples.
- Video sonification papers and projects.
- AI video-to-music generation papers.
- Adaptive music and game-audio architecture references.
- OSC/MIDI control architecture examples.
- Generative music systems in Max/MSP, SuperCollider, and Ableton Live.

When adding specific references, include:

```text
Title:
Author / Organization:
Link:
Date accessed:
Summary:
Relevance to Silent Film Sonific:
Implementation implications:
```
