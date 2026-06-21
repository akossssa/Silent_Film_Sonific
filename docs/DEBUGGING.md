# Debugging Workflow

Silent Film Sonific patches should leave file-based evidence that can be inspected without screenshots.

## Log Locations

Runtime logs:

```text
logs/max/sfs-debug.jsonl
```

Full Max Console export:

```text
logs/max/sfs-max-console.txt
```

Latest dictionary snapshots:

```text
logs/snapshots/sfs_video_features.latest.json
logs/snapshots/sfs_musical_control.latest.json
```

Test logs, when a test harness needs them:

```text
logs/tests/
```

## Logger

Use this logger JS inside devtools Max patches:

```text
js sfs.debug.logger.js <component_name>
```

This form works inside patches stored in `devtools/max`, where the logger JS lives. Production abstractions should expose diagnostics on an outlet; devtools harnesses can attach the logger when file logging is needed.

Accepted messages:

```text
log info event_name message text
log warn event_name message text
log error event_name message text
dictionary sfs_video_features
log_dictionaries 1
min_level warn
snapshot_interval_ms 1000
path D:/absolute/path/to/log.jsonl
snapshot_dir D:/absolute/path/to/snapshots
```

The logger appends JSON Lines to `logs/max/sfs-debug.jsonl`. It writes dictionary snapshots as JSON files.
Use `min_level warn` to suppress routine per-frame info diagnostics. Use `snapshot_interval_ms` to rate-limit dictionary snapshots; `0` preserves the unrestricted default.

## High Movie Memory Use

On Windows, VIDDLL caches decoded movie frames. A large global `Default Cache Size` preference can make a playing `jit.movie` process use more than 1 GB without indicating a Layer A or Layer B leak. Set an explicit `cache_size` on `jit.movie`; the manual Layer A+B patch uses `cache_size 0.02` (approximately 20 MB). Send `dispose` after playback to release the movie and its decoder cache.

## Max Console Capture

Max's `console` object can write the current Max Console contents to a text file.

Use:

```text
devtools/max/sfs.debug.console_capture.maxpat
```

Workflow:

1. Reproduce the error in Max.
2. Open `devtools/max/sfs.debug.console_capture.maxpat`, or click its write button if it is already open.
3. Inspect:

```text
logs/max/sfs-max-console.txt
```

The patch also writes automatically on load. The Max message quotes the absolute project path because this project directory contains spaces. Use its `clear` button only when you intentionally want to clear the Max Console before a fresh reproduction.

## Layer Diagnostics

Project abstractions should expose diagnostics from a secondary outlet:

```text
outlet 1: primary schema data
outlet 2: diagnostics/status
```

For Layer A, the primary outlet remains:

```text
dictionary sfs_video_features
```

The diagnostics outlet reports internal warnings/errors as `log <level> <event> <message>` messages. Devtools patches can connect that outlet to `js sfs.debug.logger.js ...` when file logging is needed.

## How To Report A Max Issue

1. Open the failing patch in Max.
2. Reproduce the issue.
3. Leave Max open or close it normally.
4. Ask Codex to inspect:

```text
logs/max/sfs-debug.jsonl
logs/snapshots/
```

These files are created by devtools logger patches. If they do not exist, export the Max Console instead.

If the error happens before our abstractions load, Max may only print it to the Max Console. In that case, paste the exact console line.
For most of those cases, use `devtools/max/sfs.debug.console_capture.maxpat` to export the console instead.

## Scripted Checks

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tools/validate_project.ps1
```

The validator checks:

- `.maxpat` and schema JSON parse successfully
- `js ...` object files exist
- local `sfs.*` abstractions exist
- JavaScript syntax passes when Node.js is available
- required observability folders exist
