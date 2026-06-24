---
name: sfs-project-workflow
description: Silent Film Sonific project workflow for repo layout, production/devtools separation, validation, cleanup, documentation, and Git hygiene. Use when changing project files, moving Max assets, updating docs, adding schemas/tools, or preparing commits in this repository.
---

# SFS Project Workflow

## Overview

Use this skill to keep Silent Film Sonific changes aligned with the repository layout and validation workflow.

## Core Rules

- Keep `patchers/` production-only: production Max abstractions and production JavaScript.
- Keep testing, debugging, validation, and console-capture Max assets in `devtools/max/`.
- Keep generated runtime files out of Git; only `.gitkeep` files under `logs/` should be tracked.
- Keep versioned production registries and static runtime data under `data/`.
- Do not move generated logs, reports, or snapshots into docs or source folders.
- Update documentation when layout, workflow, schemas, or test commands change.

## Layout

- `patchers/`: production Max patchers and JavaScript.
- `data/`: versioned production registries and static runtime data.
- `devtools/max/`: test harnesses, self-tests, console capture, logger, and validators.
- `docs/`: requirements and workflows.
- `schemas/`: schema contracts.
- `tools/`: PowerShell automation.
- `logs/`: ignored runtime evidence.

## Validation

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\validate_project.ps1
```

Also run `node --check` on changed JavaScript files when relevant.

## Git

Before commit:

- Run `git status --short --ignored`.
- Confirm only intended files are staged.
- Do not stage ignored generated logs.

After meaningful changes, commit and push to `origin/main` unless the user says not to.
