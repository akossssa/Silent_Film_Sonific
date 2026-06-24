# Silent Film Sonific

Max/MSP/Jitter project for sonifying silent film through a layered analysis and control architecture.

## Current Status

Layer A (`SFS_VIDEO_FEATURES v0.1.0`) is implemented and tested:

- global motion intensity
- average brightness
- contrast
- scene cut detection
- optional left/center/right regional features

Layer B (`SFS_MUSICAL_CONTROL v0.1.0`) has an MVP deterministic state-machine implementation:

- smoothing for raw visual controls
- hysteresis for state stability
- MVP states: calm, tension, action, chaos
- controls: energy, density, tension, brightness, activity, variation
- events: scene_change, accent, reset_phrase

Layer C has an initial MVP implementation slice. The design remains documented in `docs/LAYER_C_MUSIC_ENGINE_MVP.md`:

- MIDI-first algorithmic/generative music engine
- modules: User Configuration, Conductor, Harmony, Rhythm, MIDI Output
- internal contracts: `SFS_USER_CONFIG`, `SFS_CONDUCTOR_CONTEXT`, `SFS_HARMONY_CONTEXT`, `SFS_NOTE_EVENT`, `SFS_MIDI_EVENT`, `SFS_SCALE_REGISTRY`
- deterministic logical clock, PRNG, note ordering, MIDI lifecycle, and acceptance criteria
- production data: scale registry and canonical default user config under `data/music/`
- production core: `patchers/sfs.music_engine.core.basic.js`
- top-level Max wrapper: `patchers/sfs.music_engine.mvp.maxpat`
- Node self-test runner: `tools/run_layer_c_selftest.js`

## Useful Files

* `docs/REQUIREMENTS.md` - project requirements and schemas
* `docs/RESEARCH.md` - related work and research positioning for video-to-music, Max/Jitter sonification, and adaptive music systems
* `docs/DESIGN_DECISIONS.md` - project-level architectural decisions and constraints
* `docs/CODEX_RESEARCH_WORKFLOW.md` - rules for research-driven Codex work without disrupting implementation workflow
* `docs/LAYER_C_MUSIC_ENGINE_MVP.md` - Layer C MVP specification, internal contracts, implementation order, and acceptance criteria
* `docs/LAYER_A_TESTING.md` - manual and automated Layer A testing
* `docs/LAYER_B_TESTING.md` - Layer B test approach, fixture cases, and pass criteria
* `docs/DEBUGGING.md` - logging and Max Console capture workflow
* `AGENTS.md` - project instructions for Codex and other coding agents
* `.codex/skills/` - project-local Codex skills for workflow, Max debugging, Layer A testing, Layer B design, and research workflow
* `schemas/SFS_MUSICAL_CONTROL.schema.json` - Layer B to Layer C dictionary contract
* `schemas/SFS_USER_CONFIG.schema.json` - Layer C user-configuration contract
* `schemas/SFS_CONDUCTOR_CONTEXT.schema.json` - Layer C Conductor output contract
* `schemas/SFS_HARMONY_CONTEXT.schema.json` - Layer C Harmony output contract
* `schemas/SFS_NOTE_EVENT.schema.json` - Layer C note-event contract
* `schemas/SFS_MIDI_EVENT.schema.json` - Layer C MIDI lifecycle contract
* `data/music/SFS_SCALE_REGISTRY.v0.1.0.json` - Layer C supported scale identifiers and interval arrays
* `data/music/SFS_USER_CONFIG.default.v0.1.0.json` - canonical Layer C default configuration
* `schemas/SFS_SCALE_REGISTRY.schema.json` - scale-registry data contract
* `devtools/testdata/layer_b/interpretation_mvp_sequences.json` - Layer B MVP fixture sequences
* `devtools/testdata/layer_c/music_engine_mvp_sequences.json` - Layer C MVP fixture controls
* `patchers/sfs.video_analysis.basic_motion.maxpat` - Layer A abstraction
* `patchers/sfs.interpretation.state_machine.maxpat` - Layer B state-machine abstraction
* `patchers/sfs.music_engine.mvp.maxpat` - Layer C MVP music-engine abstraction
* `patchers/sfs.music_engine.core.basic.js` - deterministic Layer C generation core
* `devtools/max/sfs.video_analysis.basic_motion.test.maxpat` - manual test patch
* `devtools/max/sfs.video_analysis.basic_motion.selftest.maxpat` - automated self-test patch
* `devtools/max/sfs.interpretation.state_machine.selftest.maxpat` - automated Layer B Max self-test patch
* `devtools/max/sfs.music_engine.control_source.test.maxpat` - Layer C test control source for Max
* `devtools/max/sfs.layer_abc.manual_test.maxpat` - interactive movie/camera Layer A -> Layer B -> Layer C manual test patch
* `devtools/max/sfs.layer_abc.integration.selftest.maxpat` - automated Layer A -> Layer B -> Layer C Max integration test
* `tools/run_layer_b_selftest.js` - Node fixture runner for Layer B
* `tools/run_layer_c_selftest.js` - Node fixture runner for Layer C
* `tools/validate_project.ps1` - project structure and static validation
* `tools/setup_dev_paths.ps1` - creates the local `D:\tmp\sfs_project` alias used by moved Max devtools patches
