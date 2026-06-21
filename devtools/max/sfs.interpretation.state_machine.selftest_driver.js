autowatch = 1;
inlets = 2;
outlets = 2;

var inputDictName = "sfs_layer_b_selftest_input";
var inputDict = new Dict(inputDictName);
var fixturePath = projectPath("devtools/testdata/layer_b/interpretation_mvp_sequences.json");
var reportPath = projectPath("logs/tests/layer_b_selftest.latest.json");
var logPath = projectPath("logs/tests/layer_b_selftest.jsonl");
var cases = [];
var caseIndex = -1;
var inputIndex = -1;
var currentCase = null;
var currentResult = null;
var outputs = [];
var results = [];
var running = false;
var waitingForDictionary = false;
var expectingNoOutput = false;
var waitToken = 0;
var scheduledTasks = [];
var startedAt = 0;

function start() {
    var fixture;

    if (running) {
        logEvent("info", "start_ignored", "Layer B self-test is already running", null);
        return;
    }

    try {
        fixture = JSON.parse(readText(fixturePath));
    } catch (error) {
        post("SFS Layer B self-test could not read fixture: " + error + "\n");
        return;
    }

    cases = [];
    appendCases(fixture.cases || [], "positive");
    appendCases(fixture.negative_cases || [], "negative");

    running = true;
    startedAt = new Date().getTime();
    results = [];
    caseIndex = -1;
    inputIndex = -1;
    waitToken += 1;
    waitingForDictionary = false;
    expectingNoOutput = false;

    outlet(1, "start", cases.length);
    logEvent("info", "start", "Layer B self-test started", { cases: cases.length });
    schedule(runNextCase, 50);
}

function dictionary(name) {
    var payload;
    var errors;

    if (inlet !== 1 || !waitingForDictionary || !currentResult) {
        return;
    }

    if (expectingNoOutput) {
        failCheck("unexpected_output", "invalid input produced trusted output " + name);
        waitingForDictionary = false;
        schedule(finishCurrentCase, 20);
        return;
    }

    try {
        payload = readMusicalControl(String(name));
    } catch (error) {
        failCheck("dictionary_read", "could not read output dictionary " + name);
        waitingForDictionary = false;
        schedule(runNextInput, 20);
        return;
    }

    errors = validateMusicalControl(payload);
    addCheck("output_" + inputIndex + "_schema", errors.length === 0, "output " + inputIndex + " schema errors: " + errors.join("; "));
    outputs.push(payload);
    waitingForDictionary = false;
    schedule(runNextInput, 20);
}

function anything() {
    if (inlet === 0 && messagename === "start") {
        start();
    }
}

function appendCases(items, type) {
    for (var i = 0; i < items.length; i += 1) {
        cases.push({
            type: type,
            data: items[i]
        });
    }
}

function runNextCase() {
    caseIndex += 1;

    if (caseIndex >= cases.length) {
        finish();
        return;
    }

    currentCase = cases[caseIndex];
    currentResult = {
        name: currentCase.data.id,
        status: "pass",
        checks: [],
        started_ms: new Date().getTime() - startedAt
    };
    outputs = [];
    inputIndex = -1;
    waitingForDictionary = false;
    expectingNoOutput = false;

    outlet(0, "reset");
    outlet(1, "test_start", currentResult.name);
    logEvent("info", "test_start", currentResult.name, null);

    if (currentCase.type === "negative") {
        schedule(runNegativeCase, 20);
    } else {
        schedule(runNextInput, 20);
    }
}

function runNextInput() {
    inputIndex += 1;

    if (inputIndex >= currentCase.data.inputs.length) {
        assertExpected(currentCase.data, outputs);
        finishCurrentCase();
        return;
    }

    writeInputDictionary(currentCase.data.inputs[inputIndex]);
    waitToken += 1;
    waitingForDictionary = true;
    expectingNoOutput = false;
    outlet(0, "dictionary", inputDictName);
    scheduleDictionaryTimeout(waitToken, 1000);
}

function runNegativeCase() {
    writeInputDictionary(currentCase.data.input);
    waitToken += 1;
    waitingForDictionary = true;
    expectingNoOutput = true;
    outlet(0, "dictionary", inputDictName);
    schedule(function () {
        if (!waitingForDictionary || !expectingNoOutput) {
            return;
        }
        addCheck("input_rejected", true, "invalid input was rejected");
        addCheck("no_trusted_output", true, "trusted output was not produced");
        waitingForDictionary = false;
        finishCurrentCase();
    }, 200);
}

function finishCurrentCase() {
    currentResult.finished_ms = new Date().getTime() - startedAt;
    finalizeResult(currentResult);
    results.push(currentResult);
    outlet(1, "test_done", currentResult.name, currentResult.status);
    logEvent(currentResult.status === "pass" ? "info" : "error", "test_done", currentResult.name, { status: currentResult.status });
    currentResult = null;
    currentCase = null;
    schedule(runNextCase, 30);
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
    post("SFS Layer B self-test " + summary.status + ": " + summary.passed + " passed, " + summary.failed + " failed\n");
}

function assertExpected(testCase, caseOutputs) {
    var expected = testCase.expected || {};
    var finalOutput;

    if (caseOutputs.length === 0) {
        failCheck("outputs_present", "case produced no outputs");
        return;
    }

    finalOutput = caseOutputs[caseOutputs.length - 1];

    if (expected.final_state) {
        addCheck("final_state", finalOutput.state.name === expected.final_state, "expected final state " + expected.final_state + ", got " + finalOutput.state.name);
    }

    if (expected.final_state_allowed) {
        addCheck("final_state_allowed", contains(expected.final_state_allowed, finalOutput.state.name), "expected final state in " + expected.final_state_allowed.join(",") + ", got " + finalOutput.state.name);
    }

    if (expected.final_controls) {
        assertControlRanges(expected.final_controls, finalOutput.controls);
    }

    if (expected.sequence) {
        assertSequence(expected.sequence, caseOutputs);
    }

    if (expected.event_frames) {
        assertEventFrames(expected.event_frames, caseOutputs);
    }
}

function assertControlRanges(expectedControls, controls) {
    var key;
    var range;
    var value;

    for (key in expectedControls) {
        if (expectedControls.hasOwnProperty(key)) {
            range = expectedControls[key];
            value = controls[key];
            addCheck("final_controls_" + key, value >= range.min && value <= range.max, key + " expected " + range.min + ".." + range.max + ", got " + value);
        }
    }
}

function assertSequence(expected, caseOutputs) {
    var counts = {
        state_changes: 0,
        scene_change: 0,
        accent: 0,
        reset_phrase: 0
    };

    for (var i = 0; i < caseOutputs.length; i += 1) {
        if (caseOutputs[i].state.changed) {
            counts.state_changes += 1;
        }
        if (caseOutputs[i].events.scene_change) {
            counts.scene_change += 1;
        }
        if (caseOutputs[i].events.accent) {
            counts.accent += 1;
        }
        if (caseOutputs[i].events.reset_phrase) {
            counts.reset_phrase += 1;
        }
    }

    assertCount(expected, "state_changes", counts.state_changes);
    assertCount(expected, "scene_change", counts.scene_change);
    assertCount(expected, "accent", counts.accent);
    assertCount(expected, "reset_phrase", counts.reset_phrase);
}

function assertEventFrames(eventFrames, caseOutputs) {
    var frame;
    var output;
    var keys = ["scene_change", "accent", "reset_phrase"];
    var key;

    for (var i = 0; i < eventFrames.length; i += 1) {
        frame = eventFrames[i];
        output = caseOutputs[frame.input_index];
        addCheck("event_frame_" + frame.input_index + "_present", !!output, "missing output for event frame " + frame.input_index);
        if (!output) {
            continue;
        }
        for (var k = 0; k < keys.length; k += 1) {
            key = keys[k];
            if (frame.hasOwnProperty(key)) {
                addCheck("event_frame_" + frame.input_index + "_" + key, output.events[key] === frame[key], "event frame " + frame.input_index + " " + key + " expected " + frame[key] + ", got " + output.events[key]);
            }
        }
    }
}

function assertCount(expected, name, value) {
    if (expected.hasOwnProperty(name)) {
        addCheck(name, value === expected[name], name + " expected " + expected[name] + ", got " + value);
    }
    if (expected.hasOwnProperty(name + "_min")) {
        addCheck(name + "_min", value >= expected[name + "_min"], name + " expected >= " + expected[name + "_min"] + ", got " + value);
    }
    if (expected.hasOwnProperty(name + "_max")) {
        addCheck(name + "_max", value <= expected[name + "_max"], name + " expected <= " + expected[name + "_max"] + ", got " + value);
    }
    if (expected.hasOwnProperty(name + "_count")) {
        addCheck(name + "_count", value === expected[name + "_count"], name + " count expected " + expected[name + "_count"] + ", got " + value);
    }
    if (expected.hasOwnProperty(name + "_count_min")) {
        addCheck(name + "_count_min", value >= expected[name + "_count_min"], name + " count expected >= " + expected[name + "_count_min"] + ", got " + value);
    }
    if (expected.hasOwnProperty(name + "_count_max")) {
        addCheck(name + "_count_max", value <= expected[name + "_count_max"], name + " count expected <= " + expected[name + "_count_max"] + ", got " + value);
    }
}

function scheduleDictionaryTimeout(token, delay) {
    schedule(function () {
        if (!waitingForDictionary || token !== waitToken || expectingNoOutput) {
            return;
        }

        failCheck("dictionary_timeout", "interpreter did not return dictionary for " + currentResult.name + " input " + inputIndex);
        waitingForDictionary = false;
        schedule(runNextInput, 20);
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
        schema: "SFS_LAYER_B_SELFTEST",
        version: "0.1.0",
        status: failed === 0 ? "pass" : "fail",
        passed: passed,
        failed: failed,
        duration_ms: new Date().getTime() - startedAt,
        fixture: "devtools/testdata/layer_b/interpretation_mvp_sequences.json",
        results: results
    };
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

function writeInputDictionary(payload) {
    replaceDictionaryFromJson(inputDict, payload);
}

function replaceDictionaryFromJson(dict, payload) {
    var json = stringifyJson(payload);

    dict.clear();
    if (typeof dict.parse === "function") {
        dict.parse(json);
        return;
    }

    dict.set("schema", payload.schema);
    dict.set("version", payload.version);
    dict.set("timestamp_ms", payload.timestamp_ms);
    dict.replace("source::type", payload.source.type);
    dict.replace("source::name", payload.source.name);
    dict.replace("source::frame", payload.source.frame);
    dict.replace("source::fps", payload.source.fps);
    dict.replace("features::motion", payload.features.motion);
    dict.replace("features::brightness", payload.features.brightness);
    dict.replace("features::contrast", payload.features.contrast);
    dict.replace("features::cut", payload.features.cut);
    if (payload.features.cut_strength !== undefined) {
        dict.replace("features::cut_strength", payload.features.cut_strength);
    }
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

function validateMusicalControl(payload) {
    var errors = [];
    requireEqual(payload.schema, "SFS_MUSICAL_CONTROL", "schema", errors);
    requireString(payload.version, "version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "timestamp_ms", errors);
    requireString(payload.state.name, "state.name", errors);
    requireNumberRange(payload.state.confidence, 0, 1, "state.confidence", errors);
    requireBoolean(payload.state.changed, "state.changed", errors);
    requireOptionalString(payload.state.previous, "state.previous", errors);
    requireNumberRange(payload.controls.energy, 0, 1, "controls.energy", errors);
    requireNumberRange(payload.controls.density, 0, 1, "controls.density", errors);
    requireNumberRange(payload.controls.tension, 0, 1, "controls.tension", errors);
    requireNumberRange(payload.controls.brightness, 0, 1, "controls.brightness", errors);
    requireNumberRange(payload.controls.activity, 0, 1, "controls.activity", errors);
    requireNumberRange(payload.controls.variation, 0, 1, "controls.variation", errors);
    requireBoolean(payload.events.scene_change, "events.scene_change", errors);
    requireBoolean(payload.events.accent, "events.accent", errors);
    requireBoolean(payload.events.reset_phrase, "events.reset_phrase", errors);
    return errors;
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
    if (typeof value === "boolean") {
        return;
    }
    if (value === 0 || value === 1) {
        return;
    }
    errors.push(label + " must be boolean");
}

function contains(values, value) {
    for (var i = 0; i < values.length; i += 1) {
        if (values[i] === value) {
            return true;
        }
    }
    return false;
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

function readText(filename) {
    var file = new File(filename, "read");
    var lines = [];

    if (!file.isopen) {
        throw "could not open " + filename;
    }

    while (file.position < file.eof) {
        lines.push(file.readline());
    }

    file.close();
    return lines.join("\n");
}

function writeText(filename, text) {
    var file = new File(filename, "readwrite");
    var output = String(text);
    var previousLength = 0;

    if (!file.isopen) {
        file = new File(filename, "write");
    }

    if (!file.isopen) {
        post("sfs layer b selftest: could not write " + filename + "\n");
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
        post("sfs layer b selftest: could not write " + filename + "\n");
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
