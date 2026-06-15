---
name: sfs-layer-a-testing
description: Layer A testing workflow for Silent Film Sonific video analysis. Use when verifying `SFS_VIDEO_FEATURES`, changing `sfs.video_analysis.basic_motion`, editing Layer A devtools patches, or interpreting Layer A self-test/manual test results.
---

# SFS Layer A Testing

## Overview

Use this skill to verify the Layer A video-analysis module and interpret its automated and manual test evidence.

## Scope

Layer A outputs raw measurable video features only:

- motion
- brightness
- contrast
- cut and cut_strength
- optional left, center, and right zone values

It must not output musical states, emotions, or interpretation decisions.

## Setup

Ensure the devtools path alias exists:

```powershell
powershell -ExecutionPolicy Bypass -File tools\setup_dev_paths.ps1
```

## Static Validation

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\validate_project.ps1
```

## Automated Max Self-Test

Open:

```text
devtools/max/sfs.video_analysis.basic_motion.selftest.runner.maxpat
```

Read:

```text
logs/tests/layer_a_selftest.latest.json
logs/tests/layer_a_selftest.jsonl
```

Pass criteria:

- `status` is `pass`
- `passed` is `7`
- `failed` is `0`

The suite covers static black/white, hard cut, deterministic noise, regional gradient, metadata/sample_step, and a 60-frame longer run.

## Manual Test Patch

Open:

```text
devtools/max/sfs.video_analysis.basic_motion.test.maxpat
```

Use it for movie input, noise, static black/white, and cut behavior. The validator should print:

```text
valid 1
```

## Failure Triage

- `dictionary_timeout`: analyzer did not return `dictionary sfs_video_features`.
- `No such object` or `js: can't find file`: check paths and `D:\tmp\sfs_project`.
- Invalid `jit.*` attributes: fix the Max object text.
- Stale report timestamp: reopen a fresh runner patch or close Max and rerun.
