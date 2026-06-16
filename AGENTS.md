# AGENTS.md

## Project

Silent Film Sonific is a Max/MSP/Jitter project for sonifying silent film through a layered analysis and control architecture.

## Current State

Layer A is complete as an MVP. It outputs `SFS_VIDEO_FEATURES v0.1.0`: motion, brightness, contrast, cut detection, and optional left/center/right regional values.

Layer B implementation is not built yet. Its initial test foundation lives in `docs/LAYER_B_TESTING.md`, `schemas/SFS_MUSICAL_CONTROL.schema.json`, and `devtools/testdata/layer_b/interpretation_mvp_sequences.json`.

## Repo Layout

- `patchers/`: production Max abstractions and production JavaScript only.
- `devtools/max/`: manual tests, automated self-tests, console capture, logging, and validators.
- `docs/`: requirements, debugging workflow, and Layer A testing instructions.
- `devtools/testdata/`: tracked deterministic fixture data for test harnesses.
- `schemas/`: JSON schemas for project data contracts.
- `tools/`: PowerShell setup and validation scripts.
- `logs/`: generated runtime evidence; keep `.gitkeep` files, do not commit generated logs.

## Required Workflow

- Before changing behavior, read the baseline docs: `docs/REQUIREMENTS.md` and `docs/DESIGN_DECISIONS.md`.
- For Max/runtime debugging, also read `docs/DEBUGGING.md`.
- For Layer A work, also read `docs/LAYER_A_TESTING.md`.
- For Layer B work, also read `docs/LAYER_B_TESTING.md` and `docs/RESEARCH.md`.
- For research or architecture work, also read `docs/RESEARCH.md` and `docs/CODEX_RESEARCH_WORKFLOW.md`.
- Keep `patchers/` production-only. Do not move test or debug patches back there.
- Use `tools\setup_dev_paths.ps1` if `D:\tmp\sfs_project` is missing before opening moved devtools Max patches.
- Run `powershell -ExecutionPolicy Bypass -File tools\validate_project.ps1` after layout, Max patch, JavaScript, schema, or documentation changes.
- When Max behavior matters, prefer file evidence from `logs/max/sfs-max-console.txt`, `logs/max/sfs-debug.jsonl`, and `logs/tests/layer_a_selftest.latest.json`.
- Do not commit generated runtime logs, reports, or snapshots.

## Local Skills

Use these project-local Codex skills when they match the task:

- `$sfs-project-workflow`: repo layout, validation, cleanup, documentation, and Git workflow.
- `$sfs-max-debugging`: Max Console capture, JSONL logs, patch load errors, and runtime debugging.
- `$sfs-layer-a-testing`: Layer A validation, self-test interpretation, and `SFS_VIDEO_FEATURES` checks.
- `$sfs-research`: research workflow for video-to-music systems, Max/Jitter techniques, adaptive music, sonification, and architecture decisions.
- `$sfs-layer-b-design`: Layer B semantic interpretation, musical control state logic, smoothing, hysteresis, and schema-compliant output.
