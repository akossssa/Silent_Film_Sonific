# Silent Film Sonific

Max/MSP/Jitter project for sonifying silent film through a layered analysis and control architecture.

## Current Status

Layer A (`SFS_VIDEO_FEATURES v0.1.0`) is implemented and tested:

- global motion intensity
- average brightness
- contrast
- scene cut detection
- optional left/center/right regional features

Layer B test preparation is started: the `SFS_MUSICAL_CONTROL` schema, MVP fixture sequences, and testing approach are documented.

## Useful Files

- `docs/REQUIREMENTS.md` - project requirements and schemas
- `docs/LAYER_A_TESTING.md` - manual and automated Layer A testing
- `docs/LAYER_B_TESTING.md` - Layer B test approach, fixture cases, and pass criteria
- `docs/DEBUGGING.md` - logging and Max Console capture workflow
- `AGENTS.md` - project instructions for Codex and other coding agents
- `.codex/skills/` - project-local Codex skills for workflow, Max debugging, and Layer A testing
- `schemas/SFS_MUSICAL_CONTROL.schema.json` - Layer B to Layer C dictionary contract
- `devtools/testdata/layer_b/interpretation_mvp_sequences.json` - Layer B MVP fixture sequences
- `patchers/sfs.video_analysis.basic_motion.maxpat` - Layer A abstraction
- `devtools/max/sfs.video_analysis.basic_motion.test.maxpat` - manual test patch
- `devtools/max/sfs.video_analysis.basic_motion.selftest.maxpat` - automated self-test patch
- `tools/validate_project.ps1` - project structure and static validation
- `tools/setup_dev_paths.ps1` - creates the local `D:\tmp\sfs_project` alias used by moved Max devtools patches
