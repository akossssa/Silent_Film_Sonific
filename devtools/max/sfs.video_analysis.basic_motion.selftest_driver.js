autowatch = 1;
inlets = 2;
outlets = 2;

var WIDTH = 96;
var HEIGHT = 72;
var EPSILON = 0.02;

var tests = [];
var currentTestIndex = -1;
var currentStepIndex = -1;
var waitingForDictionary = false;
var currentResult = null;
var results = [];
var matrices = [];
var scheduledTasks = [];
var startedAt = 0;
var running = false;
var waitToken = 0;
var reportPath = projectPath("logs/tests/layer_a_selftest.latest.json");
var logPath = projectPath("logs/tests/layer_a_selftest.jsonl");

function start() {
    if (running) {
        logEvent("info", "start_ignored", "Layer A self-test is already running", null);
        return;
    }

    running = true;
    startedAt = new Date().getTime();
    results = [];
    matrices = [];
    scheduledTasks = [];
    waitToken += 1;
    currentTestIndex = -1;
    currentStepIndex = -1;
    waitingForDictionary = false;
    tests = buildTests();

    logEvent("info", "start", "Layer A self-test started", { tests: tests.length });
    outlet(1, "start", tests.length);
    schedule(runNextTest, 50);
}

function dictionary(name) {
    if (inlet !== 1 || !waitingForDictionary || !currentResult) {
        return;
    }

    var payload;

    try {
        payload = readVideoFeatures(String(name));
    } catch (error) {
        failCheck("dictionary_read", "could not read dictionary " + name);
        waitingForDictionary = false;
        schedule(runNextStep, 20);
        return;
    }

    currentResult.last_payload = payload;
    waitingForDictionary = false;

    var step = tests[currentTestIndex].steps[currentStepIndex];
    if (step.expect) {
        step.expect(payload);
    }

    schedule(runNextStep, step.delay_after || 20);
}

function anything() {
    if (inlet === 0 && messagename === "start") {
        start();
    }
}

function buildTests() {
    return [
        {
            name: "static_black",
            steps: [
                commandStep(["reset"]),
                commandStep(["source_type", "matrix"]),
                commandStep(["sample_step", 8]),
                matrixStep(makeSolid(0)),
                matrixStep(makeSolid(0), function (payload) {
                    expectEquals(payload.schema, "SFS_VIDEO_FEATURES", "schema");
                    expectRange(payload.features.brightness, 0, EPSILON, "black brightness");
                    expectRange(payload.features.contrast, 0, EPSILON, "black contrast");
                    expectRange(payload.features.motion, 0, EPSILON, "black motion");
                    expectFalse(payload.features.cut, "black cut");
                })
            ]
        },
        {
            name: "static_white",
            steps: [
                commandStep(["reset"]),
                commandStep(["source_type", "matrix"]),
                matrixStep(makeSolid(255)),
                matrixStep(makeSolid(255), function (payload) {
                    expectRange(payload.features.brightness, 1 - EPSILON, 1, "white brightness");
                    expectRange(payload.features.contrast, 0, EPSILON, "white contrast");
                    expectRange(payload.features.motion, 0, EPSILON, "white motion");
                    expectFalse(payload.features.cut, "white cut");
                })
            ]
        },
        {
            name: "hard_cut_black_to_white",
            steps: [
                commandStep(["reset"]),
                commandStep(["source_type", "matrix"]),
                commandStep(["cut_threshold", 0.35]),
                matrixStep(makeSolid(0)),
                matrixStep(makeSolid(255), function (payload) {
                    expectRange(payload.features.brightness, 1 - EPSILON, 1, "cut brightness");
                    expectRange(payload.features.motion, 0.95, 1, "cut motion");
                    expectTrue(payload.features.cut, "cut detected");
                    expectRange(payload.features.cut_strength, 0.95, 1, "cut strength");
                })
            ]
        },
        {
            name: "noise_motion",
            steps: [
                commandStep(["reset"]),
                commandStep(["source_type", "matrix"]),
                matrixStep(makeNoise(101)),
                matrixStep(makeNoise(202), function (payload) {
                    expectRange(payload.features.brightness, 0.35, 0.65, "noise brightness");
                    expectRange(payload.features.contrast, 0.20, 0.70, "noise contrast");
                    expectRange(payload.features.motion, 0.05, 0.60, "noise motion");
                })
            ]
        },
        {
            name: "regional_gradient",
            steps: [
                commandStep(["reset"]),
                commandStep(["source_type", "matrix"]),
                matrixStep(makeGradient()),
                matrixStep(makeGradient(), function (payload) {
                    expectRange(payload.features.brightness, 0.40, 0.60, "gradient brightness");
                    expectRange(payload.features.contrast, 0.20, 0.80, "gradient contrast");
                    expectTrue(payload.zones.left.brightness < payload.zones.center.brightness, "left darker than center");
                    expectTrue(payload.zones.center.brightness < payload.zones.right.brightness, "center darker than right");
                    expectRange(payload.features.motion, 0, EPSILON, "gradient static motion");
                })
            ]
        },
        {
            name: "metadata_and_sample_step",
            steps: [
                commandStep(["reset"]),
                commandStep(["source_type", "movie"]),
                commandStep(["fps", 24]),
                commandStep(["sample_step", 16]),
                matrixStep(makeSolid(128)),
                matrixStep(makeSolid(128), function (payload) {
                    expectEquals(payload.source.type, "movie", "source type");
                    expectRange(payload.source.fps, 24, 24, "source fps");
                    expectRange(payload.features.brightness, 0.48, 0.52, "gray brightness");
                    expectRange(payload.features.motion, 0, EPSILON, "gray static motion");
                })
            ]
        },
        {
            name: "long_run_noise_60_frames",
            steps: longRunSteps()
        }
    ];
}

function longRunSteps() {
    var steps = [
        commandStep(["reset"]),
        commandStep(["source_type", "matrix"]),
        commandStep(["sample_step", 12])
    ];

    for (var i = 0; i < 60; i += 1) {
        steps.push(matrixStep(makeNoise(1000 + i), i === 59 ? function (payload) {
            expectTrue(payload.source.frame >= 59, "long run frame count");
            expectRange(payload.features.brightness, 0.35, 0.65, "long run brightness");
            expectRange(payload.features.motion, 0.05, 0.60, "long run motion");
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
        results.push(currentResult);
        outlet(1, "test_done", currentResult.name, currentResult.status);
        logEvent(currentResult.status === "pass" ? "info" : "error", "test_done", currentResult.name, { status: currentResult.status });
        currentResult = null;
        schedule(runNextTest, 30);
        return;
    }

    var step = tests[currentTestIndex].steps[currentStepIndex];

    if (step.type === "command") {
        logEvent("debug", "send_command", step.args.join(" "), null);
        sendToAnalyzer(step.args);
        schedule(runNextStep, step.delay_after || 20);
        return;
    }

    if (step.type === "matrix") {
        waitToken += 1;
        waitingForDictionary = true;
        logEvent("debug", "send_matrix", step.matrix.name, null);
        outlet(0, "jit_matrix", step.matrix.name);
        scheduleDictionaryTimeout(waitToken, step.timeout || 1000);
        return;
    }

    failCheck("unknown_step", "unknown step type " + step.type);
    schedule(runNextStep, 20);
}

function finish() {
    var summary = makeSummary();
    running = false;
    writeText(reportPath, stringifyJson(summary));
    appendLine(logPath, stringifyJson({
        time: timestamp(),
        event: "finish",
        status: summary.status,
        passed: summary.passed,
        failed: summary.failed
    }));

    outlet(1, "finish", summary.status, summary.passed, summary.failed);
    post("SFS Layer A self-test " + summary.status + ": " + summary.passed + " passed, " + summary.failed + " failed\n");
}

function sendToAnalyzer(args) {
    if (args.length === 1) {
        outlet(0, args[0]);
    } else if (args.length === 2) {
        outlet(0, args[0], args[1]);
    } else if (args.length === 3) {
        outlet(0, args[0], args[1], args[2]);
    } else if (args.length === 4) {
        outlet(0, args[0], args[1], args[2], args[3]);
    } else {
        failCheck("send_command", "unsupported command argument count " + args.length);
    }
}

function scheduleDictionaryTimeout(token, delay) {
    schedule(function () {
        if (!waitingForDictionary || token !== waitToken) {
            return;
        }

        failCheck("dictionary_timeout", "analyzer did not return dictionary for " + tests[currentTestIndex].name);
        waitingForDictionary = false;
        schedule(runNextStep, 20);
    }, delay);
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
        schema: "SFS_LAYER_A_SELFTEST",
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
        timestamp_ms: numberValue(safeGet(dict, "timestamp_ms")),
        source: {
            type: stringValue(safeGet(dict, "source::type")),
            name: nullableStringValue(safeGet(dict, "source::name")),
            frame: numberValue(safeGet(dict, "source::frame")),
            fps: nullableNumberValue(safeGet(dict, "source::fps")),
            width: numberValue(safeGet(dict, "source::width")),
            height: numberValue(safeGet(dict, "source::height"))
        },
        features: {
            motion: numberValue(safeGet(dict, "features::motion")),
            brightness: numberValue(safeGet(dict, "features::brightness")),
            contrast: numberValue(safeGet(dict, "features::contrast")),
            cut: booleanValue(safeGet(dict, "features::cut")),
            cut_strength: numberValue(safeGet(dict, "features::cut_strength"))
        },
        zones: {
            left: readZone(dict, "left"),
            center: readZone(dict, "center"),
            right: readZone(dict, "right")
        }
    };
}

function readZone(dict, name) {
    return {
        motion: numberValue(safeGet(dict, "zones::" + name + "::motion")),
        brightness: numberValue(safeGet(dict, "zones::" + name + "::brightness")),
        contrast: numberValue(safeGet(dict, "zones::" + name + "::contrast"))
    };
}

function makeSolid(value) {
    var matrix = new JitterMatrix(4, "char", WIDTH, HEIGHT);
    matrix.setall(255, value, value, value);
    matrices.push(matrix);
    return matrix;
}

function makeGradient() {
    var matrix = new JitterMatrix(4, "char", WIDTH, HEIGHT);

    for (var y = 0; y < HEIGHT; y += 1) {
        for (var x = 0; x < WIDTH; x += 1) {
            var value = Math.round((x / (WIDTH - 1)) * 255);
            matrix.setcell2d(x, y, 255, value, value, value);
        }
    }

    matrices.push(matrix);
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

    matrices.push(matrix);
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

function numberValue(value) {
    var parsed = Number(value);
    return isFinite(parsed) ? parsed : 0;
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

function logEvent(level, event, message, data) {
    appendLine(logPath, stringifyJson({
        time: timestamp(),
        level: level,
        event: event,
        message: message,
        data: data
    }));
}

function appendLine(filename, line) {
    var file = new File(filename, "readwrite");

    if (!file.isopen) {
        file = new File(filename, "write");
    }

    if (!file.isopen) {
        post("sfs selftest: could not write " + filename + "\n");
        return 0;
    }

    file.position = file.eof;
    file.writeline(line);
    file.close();
    return 1;
}

function writeText(filename, text) {
    var file = new File(filename, "readwrite");
    var output = String(text);
    var previousLength = 0;

    if (!file.isopen) {
        file = new File(filename, "write");
    }

    if (!file.isopen) {
        post("sfs selftest: could not write " + filename + "\n");
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

function repeatString(value, count) {
    var output = "";
    for (var i = 0; i < count; i += 1) {
        output += value;
    }
    return output;
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
