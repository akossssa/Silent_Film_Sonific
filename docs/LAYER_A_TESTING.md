# Layer A Testing

Layer A is considered correct when it satisfies both the interface contract and the expected behavior of the basic visual features.

## Files

- `patchers/sfs.video_analysis.basic_motion.maxpat` is the Layer A abstraction.
- `patchers/sfs.video_analysis.basic_motion.js` computes the MVP features.
- `devtools/max/sfs.video_analysis.basic_motion.test.maxpat` is the manual Max test harness.
- `devtools/max/sfs.validate_video_features.js` validates the dictionary contract inside Max.
- `devtools/max/sfs.debug.logger.js` writes diagnostics and latest dictionary snapshots when attached by a devtools patch.
- `schemas/SFS_VIDEO_FEATURES.schema.json` documents the JSON-compatible schema.

## Devtools Path Alias

The moved devtools test patches use `D:/tmp/sfs_project` as a no-spaces alias to the project root because Max does not reliably resolve relative JS paths from moved folders. If that alias is missing, run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\setup_dev_paths.ps1
```

If Windows reports access denied while creating the junction, rerun the command from an elevated PowerShell.

## Contract Tests

Open `devtools/max/sfs.video_analysis.basic_motion.test.maxpat`.

The output from the production Layer A analysis object is connected to `js sfs.validate_video_features.js`.

Passing output looks like:

```text
valid 1
```

The devtools test/debug patches can write:

```text
logs/max/sfs-debug.jsonl
logs/max/sfs-max-console.txt
logs/snapshots/sfs_video_features.latest.json
```

The validator checks:

- `schema` is `SFS_VIDEO_FEATURES`
- `version` exists
- `timestamp_ms` is a non-negative integer
- `source.type`, `source.name`, `source.frame`, and `source.fps` exist with allowed types
- `features.motion`, `features.brightness`, `features.contrast`, and `features.cut_strength` are in `0.0-1.0`
- `features.cut` is boolean

The test patch attempts to write `logs/max/sfs-max-console.txt` automatically after load. If that file does not appear, open `devtools/max/sfs.debug.console_capture.maxpat` and click its write button. If the Max Console output is unclear, inspect the console export and the latest snapshot file first. The snapshot contains the most recent `SFS_VIDEO_FEATURES` dictionary written by the devtools logger.

## Behavioral Smoke Tests

Use one source at a time in the test patch. The main test patch intentionally avoids loading a camera object on open, because `jit.grab` can print hardware or driver errors on machines without an available camera.

## Automated Self-Test

Open:

```text
devtools/max/sfs.video_analysis.basic_motion.selftest.maxpat
```

For repeat automated launches from Codex or PowerShell while the main self-test patch is already open in Max, open:

```text
devtools/max/sfs.video_analysis.basic_motion.selftest.runner.maxpat
```

The patch starts automatically on load and writes:

```text
logs/tests/layer_a_selftest.latest.json
logs/tests/layer_a_selftest.jsonl
```

The self-test runs generated matrices through the production Layer A analysis JS used by the abstraction. It covers:

- static black
- static white
- hard cut from black to white
- deterministic noise motion
- regional gradient brightness
- metadata and `sample_step`
- 60-frame longer run

### Static Black

1. Click `reset`.
2. Click `setall 0, bang` twice.

Expected after the second frame:

- `features.brightness` near `0.0`
- `features.contrast` near `0.0`
- `features.motion` near `0.0`
- `features.cut` false

### Static White

1. Click `reset`.
2. Click `setall 255, bang` twice.

Expected after the second frame:

- `features.brightness` near `1.0`
- `features.contrast` near `0.0`
- `features.motion` near `0.0`
- `features.cut` false

### Hard Cut

1. Click `reset`.
2. Click `setall 0, bang`.
3. Click `setall 255, bang`.

Expected on the white frame:

- `features.motion` high
- `features.cut_strength` high
- `features.cut` true

### Random Motion

1. Turn on the noise `qmetro`.
2. Let `jit.noise` drive the analyzer.
3. Click `source_type matrix`.

Expected:

- `features.motion` changes continuously
- `features.contrast` is usually high
- dictionary validation remains `valid 1`

### Movie Input

1. Click `read` and choose a video file.
2. Click `source_type movie`.
3. Click `fps 30` or send the known source frame rate.
4. Turn on the `qmetro`.
5. Click `start`.

Expected:

- `timestamp_ms` increases
- `source.frame` increases
- feature values remain in `0.0-1.0`
- scene changes should produce a higher `cut_strength`

## Performance Check

The analyzer samples the image instead of scanning every pixel. Default sampling is:

```text
sample_step 8
```

For high-resolution video, increase it:

```text
sample_step 12
sample_step 16
```

Layer A passes the MVP performance check if playback and UI remain responsive while outputting dictionaries at the selected analysis rate.
