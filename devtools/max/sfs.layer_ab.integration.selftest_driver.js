autowatch = 1;
inlets = 3;
outlets = 2;

var WIDTH = 96;
var HEIGHT = 72;
var EPSILON = 0.02;
var inputMatrices = [];
var scheduledTasks = [];
var tests = [];
var results = [];
var currentTestIndex = -1;
var currentStepIndex = -1;
var currentResult = null;
var waitingForVideoFeatures = false;
var waitingForMusicalControl = false;
var lastVideoFeatures = null;
var waitToken = 0;
var running = false;
var startedAt = 0;
var reportPath = projectPath("logs/tests/layer_ab_integration.latest.json");
var logPath = projectPath("logs/tests/layer_ab_integration.jsonl");

function start() {
    if (running) {
        logEvent("info", "start_ignored", "Layer A+B integration self-test is already running", null);
        return;
    }

    running = true;
    startedAt = new Date().getTime();
    tests = buildTests();
    results = [];
    inputMatrices = [];
    currentTestIndex = -1;
    currentStepIndex = -1;
    waitingForVideoFeatures = false;
    waitingForMusicalControl = false;
    waitToken += 1;

    outlet(1, "start", tests.length);
    logEvent("info", "start", "Layer A+B integration self-test started", { tests: tests.length });
    schedule(runNextTest, 50);
}

function dictionary(name) {
    if (inlet === 1 && waitingForVideoFeatures && currentResult) {
        try {
            lastVideoFeatures = readVideoFeatures(String(name));
            addCheck("video_schema_" + currentStepIndex, validateVideoFeatures(lastVideoFeatures).length === 0, "Layer A output must satisfy SFS_VIDEO_FEATURES");
        } catch (error) {
            failCheck("video_dictionary_read", "could not read Layer A dictionary " + name);
        }
        waitingForVideoFeatures = false;
        return;
    }

    if (inlet === 2 && waitingForMusicalControl && currentResult) {
        var payload;
        var step = tests[currentTestIndex].steps[currentStepIndex];

        try {
            payload = readMusicalControl(String(name));
            addCheck("music_schema_" + currentStepIndex, validateMusicalControl(payload).length === 0, "Layer B output must satisfy SFS_MUSICAL_CONTROL");
        } catch (error) {
            failCheck("music_dictionary_read", "could not read Layer B dictionary " + name);
            waitingForMusicalControl = false;
            schedule(runNextStep, 20);
            return;
        }

        if (step.expect) {
            step.expect(lastVideoFeatures, payload);
        }

        waitingForMusicalControl = false;
        schedule(runNextStep, step.delay_after || 20);
    }
}

function anything() {
    if (inlet === 0 && messagename === "start") {
        start();
    }
}

function buildTests() {
    return [
        {
            name: "static_black_to_calm",
            steps: [
                commandStep(["reset"]),
                commandStep(["source_type", "matrix"]),
                commandStep(["sample_step", 8]),
                matrixStep(makeSolid(0)),
                matrixStep(makeSolid(0), function (features, control) {
                    expectRange(features.features.brightness, 0, EPSILON, "black brightness");
                    expectRange(features.features.motion, 0, EPSILON, "black motion");
                    expectEquals(control.state.name, "calm", "black state");
                    expectRange(control.controls.energy, 0, 0.25, "black energy");
                    expectFalse(control.events.scene_change, "black scene change");
                    expectFalse(control.events.reset_phrase, "black reset phrase");
                })
            ]
        },
        {
            name: "hard_cut_to_chaos_event",
            steps: [
                commandStep(["reset"]),
                commandStep(["source_type", "matrix"]),
                commandStep(["cut_threshold", 0.35]),
                matrixStep(makeSolid(0)),
                matrixStep(makeSolid(255), function (features, control) {
                    expectTrue(features.features.cut, "Layer A cut detected");
                    expectRange(features.features.cut_strength, 0.95, 1, "Layer A cut strength");
                    expectEquals(control.state.name, "chaos", "cut state");
                    expectTrue(control.events.scene_change, "Layer B scene change");
                    expectTrue(control.events.accent, "Layer B accent");
                    expectTrue(control.events.reset_phrase, "Layer B reset phrase");
                    expectRange(control.controls.energy, 0.70, 1, "cut energy");
                    expectRange(control.controls.activity, 0.75, 1, "cut activity");
                })
            ]
        },
        {
            name: "noise_motion_to_active_control",
            steps: noiseMotionSteps()
        }
    ];
}

function noiseMotionSteps() {
    var steps = [
        commandStep(["reset"]),
        commandStep(["source_type", "matrix"]),
        commandStep(["sample_step", 12])
    ];

    for (var i = 0; i < 6; i += 1) {
        steps.push(matrixStep(makeNoise(500 + i), i === 5 ? function (features, control) {
            expectRange(features.features.motion, 0.05, 0.60, "noise Layer A motion");
            expectRange(features.features.contrast, 0.20, 0.70, "noise Layer A contrast");
            expectTrue(control.state.name === "tension" || control.state.name === "action" || control.state.name === "chaos", "noise state active enough");
            expectRange(control.controls.energy, 0.20, 1, "noise energy");
            expectRange(control.controls.activity, 0.20, 1, "noise activity");
            expectFalse(control.events.reset_phrase, "noise no phrase reset");
        } : null));
    }

    return steps;
}

function commandStep(args) {
    return { type: "command", args: args };
}

function matrixStep(matrix, expect) {
    return { type: "matrix", matrix: matrix, expect: expect };
}

function runNextTest() {
    currentTestIndex += 1;

    if (currentTestIndex >= tests.length) {
        finish();
        return;
    }

    currentStepIndex = -1;
    currentResult = {
        name: tests[currentTestIndex].name,
        status: "pass",
        checks: [],
        started_ms: new Date().getTime() - startedAt
    };

    outlet(1, "test_start", currentResult.name);
    logEvent("info", "test_start", currentResult.name, null);
    schedule(runNextStep, 20);
}

function runNextStep() {
    currentStepIndex += 1;

    if (currentStepIndex >= tests[currentTestIndex].steps.length) {
        currentResult.finished_ms = new Date().getTime() - startedAt;
        finalizeResult(currentResult);
        results.push(currentResult);
        outlet(1, "test_done", currentResult.name, currentResult.status);
        logEvent(currentResult.status === "pass" ? "info" : "error", "test_done", currentResult.name, { status: currentResult.status });
        currentResult = null;
        schedule(runNextTest, 30);
        return;
    }

    var step = tests[currentTestIndex].steps[currentStepIndex];

    if (step.type === "command") {
        sendToAnalyzer(step.args);
        schedule(runNextStep, step.delay_after || 20);
        return;
    }

    if (step.type === "matrix") {
        lastVideoFeatures = null;
        waitToken += 1;
        waitingForVideoFeatures = true;
        waitingForMusicalControl = true;
        outlet(0, "jit_matrix", step.matrix.name);
        scheduleDictionaryTimeout(waitToken, step.timeout || 1000);
        return;
    }

    failCheck("unknown_step", "unknown step type " + step.type);
    schedule(runNextStep, 20);
}

function sendToAnalyzer(args) {
    if (args.length === 1) {
        outlet(0, args[0]);
    } else if (args.length === 2) {
        outlet(0, args[0], args[1]);
    } else if (args.length === 3) {
        outlet(0, args[0], args[1], args[2]);
    } else {
        failCheck("send_command", "unsupported command argument count " + args.length);
    }
}

function scheduleDictionaryTimeout(token, delay) {
    schedule(function () {
        if (!running || token !== waitToken || currentTestIndex < 0 || currentTestIndex >= tests.length) {
            return;
        }
        if (waitingForVideoFeatures) {
            failCheck("video_dictionary_timeout", "Layer A did not return dictionary for " + tests[currentTestIndex].name);
            waitingForVideoFeatures = false;
        }
        if (waitingForMusicalControl) {
            failCheck("music_dictionary_timeout", "Layer B did not return dictionary for " + tests[currentTestIndex].name);
            waitingForMusicalControl = false;
        }
        schedule(runNextStep, 20);
    }, delay);
}

function finish() {
    var summary = makeSummary();
    running = false;
    waitingForVideoFeatures = false;
    waitingForMusicalControl = false;
    waitToken += 1;
    writeText(reportPath, stringifyJson(summary));
    appendLine(logPath, stringifyJson({
        time: timestamp(),
        event: "finish",
        status: summary.status,
        passed: summary.passed,
        failed: summary.failed
    }));

    outlet(1, "finish", summary.status, summary.passed, summary.failed);
    post("SFS Layer A+B integration self-test " + summary.status + ": " + summary.passed + " passed, " + summary.failed + " failed\n");
}

function makeSummary() {
    var failed = 0;
    var passed = 0;

    for (var i = 0; i < results.length; i += 1) {
        if (results[i].status === "pass") {
            passed += 1;
        } else {
            failed += 1;
        }
    }

    return {
        schema: "SFS_LAYER_AB_INTEGRATION_SELFTEST",
        version: "0.1.0",
        status: failed === 0 ? "pass" : "fail",
        passed: passed,
        failed: failed,
        duration_ms: new Date().getTime() - startedAt,
        results: results
    };
}

function readVideoFeatures(name) {
    var dict = new Dict(name);
    return {
        schema: stringValue(safeGet(dict, "schema")),
        version: stringValue(safeGet(dict, "version")),
        timestamp_ms: numberValue(safeGet(dict, "timestamp_ms"), 0),
        source: {
            type: stringValue(safeGet(dict, "source::type")),
            name: nullableStringValue(safeGet(dict, "source::name")),
            frame: numberValue(safeGet(dict, "source::frame"), 0),
            fps: nullableNumberValue(safeGet(dict, "source::fps"))
        },
        features: {
            motion: numberValue(safeGet(dict, "features::motion"), 0),
            brightness: numberValue(safeGet(dict, "features::brightness"), 0),
            contrast: numberValue(safeGet(dict, "features::contrast"), 0),
            cut: booleanValue(safeGet(dict, "features::cut")),
            cut_strength: numberValue(safeGet(dict, "features::cut_strength"), 0)
        }
    };
}

function readMusicalControl(name) {
    var dict = new Dict(name);
    return {
        schema: stringValue(safeGet(dict, "schema")),
        version: stringValue(safeGet(dict, "version")),
        timestamp_ms: numberValue(safeGet(dict, "timestamp_ms"), 0),
        state: {
            name: stringValue(safeGet(dict, "state::name")),
            confidence: numberValue(safeGet(dict, "state::confidence"), 0),
            changed: booleanValue(safeGet(dict, "state::changed")),
            previous: nullableStringValue(safeGet(dict, "state::previous"))
        },
        controls: {
            energy: numberValue(safeGet(dict, "controls::energy"), 0),
            density: numberValue(safeGet(dict, "controls::density"), 0),
            tension: numberValue(safeGet(dict, "controls::tension"), 0),
            brightness: numberValue(safeGet(dict, "controls::brightness"), 0),
            activity: numberValue(safeGet(dict, "controls::activity"), 0),
            variation: numberValue(safeGet(dict, "controls::variation"), 0)
        },
        events: {
            scene_change: booleanValue(safeGet(dict, "events::scene_change")),
            accent: booleanValue(safeGet(dict, "events::accent")),
            reset_phrase: booleanValue(safeGet(dict, "events::reset_phrase"))
        }
    };
}

function validateVideoFeatures(payload) {
    var errors = [];
    requireEqual(payload.schema, "SFS_VIDEO_FEATURES", "video.schema", errors);
    requireString(payload.version, "video.version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "video.timestamp_ms", errors);
    requireNumberRange(payload.features.motion, 0, 1, "video.features.motion", errors);
    requireNumberRange(payload.features.brightness, 0, 1, "video.features.brightness", errors);
    requireNumberRange(payload.features.contrast, 0, 1, "video.features.contrast", errors);
    requireBoolean(payload.features.cut, "video.features.cut", errors);
    requireNumberRange(payload.features.cut_strength, 0, 1, "video.features.cut_strength", errors);
    return errors;
}

function validateMusicalControl(payload) {
    var errors = [];
    requireEqual(payload.schema, "SFS_MUSICAL_CONTROL", "music.schema", errors);
    requireString(payload.version, "music.version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "music.timestamp_ms", errors);
    requireString(payload.state.name, "music.state.name", errors);
    requireNumberRange(payload.state.confidence, 0, 1, "music.state.confidence", errors);
    requireBoolean(payload.state.changed, "music.state.changed", errors);
    requireOptionalString(payload.state.previous, "music.state.previous", errors);
    requireNumberRange(payload.controls.energy, 0, 1, "music.controls.energy", errors);
    requireNumberRange(payload.controls.density, 0, 1, "music.controls.density", errors);
    requireNumberRange(payload.controls.tension, 0, 1, "music.controls.tension", errors);
    requireNumberRange(payload.controls.brightness, 0, 1, "music.controls.brightness", errors);
    requireNumberRange(payload.controls.activity, 0, 1, "music.controls.activity", errors);
    requireNumberRange(payload.controls.variation, 0, 1, "music.controls.variation", errors);
    requireBoolean(payload.events.scene_change, "music.events.scene_change", errors);
    requireBoolean(payload.events.accent, "music.events.accent", errors);
    requireBoolean(payload.events.reset_phrase, "music.events.reset_phrase", errors);
    return errors;
}

function makeSolid(value) {
    var matrix = new JitterMatrix(4, "char", WIDTH, HEIGHT);
    matrix.setall(255, value, value, value);
    inputMatrices.push(matrix);
    return matrix;
}

function makeNoise(seed) {
    var matrix = new JitterMatrix(4, "char", WIDTH, HEIGHT);
    var state = seed;

    for (var y = 0; y < HEIGHT; y += 1) {
        for (var x = 0; x < WIDTH; x += 1) {
            state = (state * 1664525 + 1013904223) % 4294967296;
            var value = Math.floor((state / 4294967296) * 256);
            matrix.setcell2d(x, y, 255, value, value, value);
        }
    }

    inputMatrices.push(matrix);
    return matrix;
}

function expectEquals(actual, expected, label) {
    addCheck(label, actual === expected, "expected " + expected + ", got " + actual);
}

function expectRange(value, min, max, label) {
    addCheck(label, value >= min && value <= max, "expected " + min + ".." + max + ", got " + value);
}

function expectTrue(value, label) {
    addCheck(label, !!value, "expected true, got " + value);
}

function expectFalse(value, label) {
    addCheck(label, !value, "expected false, got " + value);
}

function addCheck(label, pass, detail) {
    if (!currentResult) {
        return;
    }

    currentResult.checks.push({
        label: label,
        pass: !!pass,
        detail: detail
    });

    if (!pass) {
        currentResult.status = "fail";
        outlet(1, "check_fail", currentResult.name, label, detail);
        logEvent("error", "check_fail", currentResult.name + " " + label, { detail: detail });
    }
}

function failCheck(label, detail) {
    addCheck(label, false, detail);
}

function finalizeResult(result) {
    for (var i = 0; i < result.checks.length; i += 1) {
        if (!result.checks[i].pass) {
            result.status = "fail";
            return;
        }
    }
}

function requireEqual(value, expected, label, errors) {
    if (value !== expected) {
        errors.push(label + " must be " + expected);
    }
}

function requireString(value, label, errors) {
    if (typeof value !== "string" || value.length === 0) {
        errors.push(label + " must be a string");
    }
}

function requireOptionalString(value, label, errors) {
    if (value === null || value === undefined) {
        return;
    }
    if (typeof value !== "string") {
        errors.push(label + " must be string or null");
    }
}

function requireNumberRange(value, min, max, label, errors) {
    var parsed = Number(value);
    if (!isFinite(parsed)) {
        errors.push(label + " must be a number");
        return;
    }
    if (min !== null && parsed < min) {
        errors.push(label + " must be >= " + min);
    }
    if (max !== null && parsed > max) {
        errors.push(label + " must be <= " + max);
    }
}

function requireIntegerRange(value, min, max, label, errors) {
    var parsed = Number(value);
    if (!isFinite(parsed) || Math.floor(parsed) !== parsed) {
        errors.push(label + " must be an integer");
        return;
    }
    if (min !== null && parsed < min) {
        errors.push(label + " must be >= " + min);
    }
    if (max !== null && parsed > max) {
        errors.push(label + " must be <= " + max);
    }
}

function requireBoolean(value, label, errors) {
    if (typeof value === "boolean" || value === 0 || value === 1) {
        return;
    }
    errors.push(label + " must be boolean");
}

function safeGet(dict, key) {
    try {
        return dict.get(key);
    } catch (error) {
        return null;
    }
}

function booleanValue(value) {
    return value === true || value === 1 || value === "1" || value === "true";
}

function numberValue(value, fallback) {
    var parsed = Number(value);
    return isFinite(parsed) ? parsed : fallback;
}

function nullableNumberValue(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    var parsed = Number(value);
    return isFinite(parsed) ? parsed : null;
}

function stringValue(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value);
}

function nullableStringValue(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    return String(value);
}

function schedule(fn, delay) {
    var task = new Task(function () {
        fn();
        removeScheduledTask(task);
    }, this);
    scheduledTasks.push(task);
    task.schedule(delay);
}

function removeScheduledTask(task) {
    for (var i = scheduledTasks.length - 1; i >= 0; i -= 1) {
        if (scheduledTasks[i] === task) {
            scheduledTasks.splice(i, 1);
            return;
        }
    }
}

function writeText(filename, text) {
    var file = new File(filename, "readwrite");
    var output = String(text);
    var previousLength = 0;

    if (!file.isopen) {
        file = new File(filename, "write");
    }

    if (!file.isopen) {
        post("sfs layer a+b integration: could not write " + filename + "\n");
        return 0;
    }

    previousLength = file.eof || 0;
    if (previousLength > output.length) {
        output += "\n" + repeatString(" ", previousLength - output.length);
    }

    file.position = 0;
    file.writestring(output);
    file.close();
    return 1;
}

function appendLine(filename, line) {
    var file = new File(filename, "readwrite");

    if (!file.isopen) {
        file = new File(filename, "write");
    }

    if (!file.isopen) {
        post("sfs layer a+b integration: could not write " + filename + "\n");
        return 0;
    }

    file.position = file.eof;
    file.writeline(line);
    file.close();
    return 1;
}

function repeatString(value, count) {
    var output = "";
    for (var i = 0; i < count; i += 1) {
        output += value;
    }
    return output;
}

function logEvent(level, event, message, data) {
    appendLine(logPath, stringifyJson({
        time: timestamp(),
        level: level,
        event: event,
        message: message,
        data: data
    }));
}

function projectPath(relativePath) {
    var patcherPath = "";

    try {
        patcherPath = this.patcher.filepath || "";
    } catch (error) {
        patcherPath = "";
    }

    patcherPath = normalizePath(patcherPath);

    var projectRoot = getProjectRoot(patcherPath);
    if (projectRoot) {
        return projectRoot + "/" + relativePath;
    }

    return relativePath;
}

function normalizePath(value) {
    return String(value).replace(/\\/g, "/");
}

function getProjectRoot(path) {
    var markers = ["/patchers/", "/devtools/max/"];

    for (var i = 0; i < markers.length; i += 1) {
        var index = path.indexOf(markers[i]);
        if (index >= 0) {
            return path.substring(0, index);
        }
    }

    return "";
}

function timestamp() {
    var date = new Date();
    if (date.toISOString) {
        return date.toISOString();
    }
    return String(date.getTime());
}

function stringifyJson(value) {
    if (typeof JSON !== "undefined" && JSON.stringify) {
        return JSON.stringify(value);
    }

    if (value === null) {
        return "null";
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    if (typeof value === "string") {
        return "\"" + escapeJson(value) + "\"";
    }
    if (value instanceof Array) {
        var items = [];
        for (var i = 0; i < value.length; i += 1) {
            items.push(stringifyJson(value[i]));
        }
        return "[" + items.join(",") + "]";
    }
    if (typeof value === "object") {
        var pairs = [];
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                pairs.push(stringifyJson(key) + ":" + stringifyJson(value[key]));
            }
        }
        return "{" + pairs.join(",") + "}";
    }

    return "\"\"";
}

function escapeJson(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, "\\\"")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t");
}
