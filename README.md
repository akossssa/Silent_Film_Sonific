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

## Useful Files

* `docs/REQUIREMENTS.md` - project requirements and schemas
* `docs/RESEARCH.md` - related work and research positioning for video-to-music, Max/Jitter sonification, and adaptive music systems
* `docs/DESIGN_DECISIONS.md` - project-level architectural decisions and constraints
* `docs/CODEX_RESEARCH_WORKFLOW.md` - rules for research-driven Codex work without disrupting implementation workflow
* `docs/LAYER_A_TESTING.md` - manual and automated Layer A testing
* `docs/LAYER_B_TESTING.md` - Layer B test approach, fixture cases, and pass criteria
* `docs/DEBUGGING.md` - logging and Max Console capture workflow
* `AGENTS.md` - project instructions for Codex and other coding agents
* `.codex/skills/` - project-local Codex skills for workflow, Max debugging, Layer A testing, Layer B design, and research workflow
* `schemas/SFS_MUSICAL_CONTROL.schema.json` - Layer B to Layer C dictionary contract
* `devtools/testdata/layer_b/interpretation_mvp_sequences.json` - Layer B MVP fixture sequences
* `patchers/sfs.video_analysis.basic_motion.maxpat` - Layer A abstraction
* `patchers/sfs.interpretation.state_machine.maxpat` - Layer B state-machine abstraction
* `devtools/max/sfs.video_analysis.basic_motion.test.maxpat` - manual test patch
* `devtools/max/sfs.video_analysis.basic_motion.selftest.maxpat` - automated self-test patch
* `devtools/max/sfs.interpretation.state_machine.selftest.maxpat` - automated Layer B Max self-test patch
* `tools/run_layer_b_selftest.js` - Node fixture runner for Layer B
* `tools/validate_project.ps1` - project structure and static validation
* `tools/setup_dev_paths.ps1` - creates the local `D:\tmp\sfs_project` alias used by moved Max devtools patches
