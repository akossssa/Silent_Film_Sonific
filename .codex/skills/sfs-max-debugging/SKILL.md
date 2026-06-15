---
name: sfs-max-debugging
description: Max/MSP/Jitter debugging workflow for Silent Film Sonific using console exports, JSONL logs, snapshots, and devtools patches. Use when Max reports errors, patches fail to load, self-tests hang or fail, or Codex needs observable evidence from Max.
---

# SFS Max Debugging

## Overview

Use this skill to debug Max behavior from files Codex can inspect instead of relying on screenshots or manual console reading.

## Evidence First

Inspect files before guessing:

- `logs/max/sfs-max-console.txt`
- `logs/max/sfs-debug.jsonl`
- `logs/snapshots/`
- `logs/tests/layer_a_selftest.latest.json`
- `logs/tests/layer_a_selftest.jsonl`

Generated logs are ignored; do not commit them.

## Console Capture

Use:

```text
devtools/max/sfs.debug.console_capture.maxpat
```

It writes the Max Console to:

```text
logs/max/sfs-max-console.txt
```

Known external noise:

- bach startup banner
- `error locating jitter-passes folder`

Treat `No such object`, missing JavaScript, invalid Max attributes, dictionary timeouts, or `js:` errors as project issues until explained.

## Devtools Path Alias

Moved devtools patches depend on:

```text
D:/tmp/sfs_project
```

If it is missing, run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\setup_dev_paths.ps1
```

If access is denied, the command may need elevated PowerShell.

## Debugging Loop

1. Reproduce or run the failing Max patch.
2. Export console/log evidence.
3. Inspect logs with `rg`, `Get-Content`, or `ConvertFrom-Json`.
4. Fix the smallest responsible patch, JavaScript, or doc.
5. Run `tools\validate_project.ps1`.
6. Rerun the Max patch or self-test when behavior changed.
