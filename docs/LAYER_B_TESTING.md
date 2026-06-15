# Layer B Testing

Layer B is considered correct when it converts valid `SFS_VIDEO_FEATURES` dictionaries into valid `SFS_MUSICAL_CONTROL` dictionaries, manages musical state transitions predictably, and keeps event outputs one-shot.

Layer B must not generate sound and must not expose raw video features directly to Layer C.

## Files

- `schemas/SFS_MUSICAL_CONTROL.schema.json` documents the Layer B output contract.
- `devtools/testdata/layer_b/interpretation_mvp_sequences.json` contains deterministic input sequences and expected assertions.
- Future production implementation target: `patchers/sfs.interpretation.state_machine.maxpat`.
- Future production JavaScript target, if needed: `patchers/sfs.interpretation.state_machine.js`.
- Future devtools targets: `devtools/max/sfs.interpretation.state_machine.test.maxpat` and `devtools/max/sfs.interpretation.state_machine.selftest.maxpat`.

## Test Approach

### 1. Contract Tests

Every valid Layer B output must satisfy `SFS_MUSICAL_CONTROL`:

- `schema` is `SFS_MUSICAL_CONTROL`
- `version` exists
- `timestamp_ms` is a non-negative integer
- `state.name` is a non-empty string
- `state.confidence` is in `0.0-1.0`
- `state.changed` is boolean
- `state.previous` is string or null
- all control values are in `0.0-1.0`
- all event values are boolean

Layer B MVP should use the four required states:

- `calm`
- `tension`
- `action`
- `chaos`

Custom states may be added later, but the MVP tests should prove these four states are reachable.

### 2. Fixture Sequence Tests

Use `devtools/testdata/layer_b/interpretation_mvp_sequences.json` as the canonical test data for the first implementation.

Each case provides:

- a sequence of valid `SFS_VIDEO_FEATURES` dictionaries
- expected final state or allowed final states
- expected output-control ranges
- expected event counts
- special event-frame assertions when a cut is present

Expected controls are ranges, not exact values. Smoothing, thresholds, and mapping curves are implementation details as long as behavior stays within the musical contract.

### 3. Temporal Behavior Tests

Layer B must be tested as a stateful stream processor, not only as isolated dictionary conversion.

Required temporal checks:

- smoothing prevents large control jumps when input changes slightly
- hysteresis prevents rapid state flapping around thresholds
- `state.changed` is true only on state-transition frames
- `state.previous` reports the actual previous state on transitions
- `events.scene_change` is true only for cut frames
- `events.accent` is one-shot for strong visual accents
- `events.reset_phrase` is one-shot for strong scene changes

### 4. Boundary Tests

Negative fixture cases should verify that invalid Layer A input is rejected, clamped with an explicit warning, or marked invalid by the test harness. A trusted `SFS_MUSICAL_CONTROL` dictionary must not be silently produced from malformed input.

Boundary conditions to cover:

- missing required Layer A features
- out-of-range Layer A values
- absent optional `zones`
- null `source.name`, `source.frame`, or `source.fps`
- repeated timestamps
- sudden cut followed by calm frames

### 5. Integration Tests

Layer B integration should be tested with the Layer A output dictionary, but Layer B tests should not depend on a specific Layer A implementation.

Correct boundary:

```text
SFS_VIDEO_FEATURES -> Layer B -> SFS_MUSICAL_CONTROL
```

Incorrect boundary:

```text
Layer B reads video matrices, jit textures, movie state, MIDI, audio, or Layer C internals
```

## Fixture Cases

| Case | Purpose | Main Expected Result |
|---|---|---|
| `calm_static_dark` | Low activity dark image | `calm`, low controls |
| `calm_static_bright` | Bright static image | `calm`, high musical brightness |
| `tension_build` | Rising contrast with moderate motion | `tension`, no scene-change event |
| `action_sustained_motion` | Sustained high motion | `action`, high energy/density/activity |
| `chaos_cut_burst` | Hard cut with high motion and contrast | `chaos`, one scene-change/accent/reset event |
| `zone_variation_asymmetry` | Uneven regional motion | high variation, no scene-change event |
| `no_zones_valid` | Optional zones absent | valid output |
| `hysteresis_threshold_noise` | Values near state boundary | limited state changes |

## Initial Pass Criteria

Layer B test preparation is ready when:

- the output schema exists and parses as JSON
- fixture data exists and parses as JSON
- fixture cases cover all MVP states
- fixture cases cover smoothing, hysteresis, event one-shots, optional zones, and invalid input
- project validation passes

Layer B implementation is ready when a self-test runner can process the fixture file and write:

```text
logs/tests/layer_b_selftest.latest.json
logs/tests/layer_b_selftest.jsonl
```

Passing self-test output should report:

```text
status pass
failed 0
```
