autowatch = 1;
inlets = 7;
outlets = 4;

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
var waitingForLayerC = false;
var lastVideoFeatures = null;
var lastMusicalControl = null;
var currentLayerC = null;
var totalNoteEvents = 0;
var totalMidiNoteOns = 0;
var waitToken = 0;
var running = false;
var startedAt = 0;
var reportPath = projectPath("logs/tests/layer_abc_deterministic_midi_integration.latest.json");
var logPath = projectPath("logs/tests/layer_abc_deterministic_midi_integration.jsonl");

function start() {
    if (running) {
        logEvent("info", "start_ignored", "Layer A+B+C integration self-test is already running", null);
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
    waitingForLayerC = false;
    lastVideoFeatures = null;
    lastMusicalControl = null;
    currentLayerC = null;
    totalNoteEvents = 0;
    totalMidiNoteOns = 0;
    waitToken += 1;

    outlet(1, "start", tests.length);
    logEvent("info", "start", "Layer A+B+C integration self-test started", { tests: tests.length });
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
        try {
            lastMusicalControl = readMusicalControl(String(name));
            addCheck("music_schema_" + currentStepIndex, validateMusicalControl(lastMusicalControl).length === 0, "Layer B output must satisfy SFS_MUSICAL_CONTROL");
        } catch (error) {
            failCheck("music_dictionary_read", "could not read Layer B dictionary " + name);
            waitingForMusicalControl = false;
            waitingForLayerC = false;
            schedule(runNextStep, 20);
            return;
        }

        waitingForMusicalControl = false;
        beginLayerCStep(String(name));
        return;
    }

    if (inlet === 3 && waitingForLayerC && currentResult) {
        collectConductor(String(name));
        return;
    }

    if (inlet === 4 && waitingForLayerC && currentResult) {
        collectHarmony(String(name));
        return;
    }

    if (inlet === 5 && waitingForLayerC && currentResult) {
        collectNoteEvent(String(name));
        return;
    }

    if (inlet === 6 && waitingForLayerC && currentResult) {
        collectMidiEvent(String(name));
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
            name: "static_black_to_calm_music_context",
            steps: [
                commandStep(["reset"]),
                commandStep(["source_type", "matrix"]),
                commandStep(["sample_step", 8]),
                matrixStep(makeSolid(0)),
                matrixStep(makeSolid(0), function (features, control, layerC) {
                    expectRange(features.features.brightness, 0, EPSILON, "black brightness");
                    expectRange(features.features.motion, 0, EPSILON, "black motion");
                    expectEquals(control.state.name, "calm", "black Layer B state");
                    expectRange(control.controls.energy, 0, 0.25, "black Layer B energy");
                    expectEquals(layerC.conductor.state, "calm", "Layer C effective state");
                    expectEquals(layerC.conductor.source_state, "calm", "Layer C source state");
                    expectFalse(layerC.conductor.transition, "calm no transition");
                    expectFalse(layerC.conductor.accent, "calm no accent");
                    expectEquals(layerC.harmony.schema, "SFS_HARMONY_CONTEXT", "Harmony context emitted");
                    expectTrue(layerC.harmony.pitch_pool.length > 0, "Harmony pitch pool not empty");
                })
            ]
        },
        {
            name: "hard_cut_to_chaos_accent_midi",
            steps: [
                commandStep(["reset"]),
                commandStep(["source_type", "matrix"]),
                commandStep(["cut_threshold", 0.35]),
                matrixStep(makeSolid(0)),
                matrixStep(makeSolid(255), function (features, control, layerC) {
                    expectTrue(features.features.cut, "Layer A cut detected");
                    expectRange(features.features.cut_strength, 0.95, 1, "Layer A cut strength");
                    expectEquals(control.state.name, "chaos", "Layer B cut state");
                    expectTrue(control.events.scene_change, "Layer B scene change");
                    expectTrue(control.events.accent, "Layer B accent");
                    expectTrue(control.events.reset_phrase, "Layer B reset phrase");
                    expectEquals(layerC.conductor.state, "chaos", "Layer C chaos state");
                    expectTrue(layerC.conductor.transition, "Layer C transition");
                    expectTrue(layerC.conductor.accent, "Layer C accent");
                    expectTrue(layerC.conductor.reset_phrase, "Layer C reset phrase");
                    expectEquals(layerC.conductor.event_counts.scene_change, 1, "Layer C scene event count");
                    expectEquals(layerC.conductor.event_counts.accent, 1, "Layer C accent event count");
                    expectEquals(layerC.conductor.event_counts.reset_phrase, 1, "Layer C reset event count");
                    expectTrue(hasNoteRole(layerC.notes, "accent"), "Layer C accent note emitted");
                    expectTrue(hasMidiType(layerC.midi, "note_on"), "Layer C MIDI note_on emitted");
                })
            ]
        },
        {
            name: "noise_motion_reaches_music_output",
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

    for (var i = 0; i < 8; i += 1) {
        steps.push(matrixStep(makeNoise(800 + i), i === 7 ? function (features, control, layerC) {
            expectRange(features.features.motion, 0.05, 0.60, "noise Layer A motion");
            expectRange(features.features.contrast, 0.20, 0.70, "noise Layer A contrast");
            expectTrue(control.state.name === "tension" || control.state.name === "action" || control.state.name === "chaos", "noise Layer B state active enough");
            expectRange(control.controls.energy, 0.20, 1, "noise Layer B energy");
            expectRange(control.controls.activity, 0.20, 1, "noise Layer B activity");
            expectTrue(layerC.conductor.state === "tension" || layerC.conductor.state === "action" || layerC.conductor.state === "chaos", "Layer C state follows Layer B");
            expectTrue(totalNoteEvents > 0, "Layer C emitted note events during noise run");
            expectTrue(totalMidiNoteOns > 0, "Layer C emitted MIDI note_on events during noise run");
            expectFalse(control.events.reset_phrase, "noise no Layer B phrase reset");
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
    totalNoteEvents = 0;
    totalMidiNoteOns = 0;

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
        sendCommand(step.args);
        schedule(runNextStep, step.delay_after || 20);
        return;
    }

    if (step.type === "matrix") {
        lastVideoFeatures = null;
        lastMusicalControl = null;
        currentLayerC = null;
        waitToken += 1;
        waitingForVideoFeatures = true;
        waitingForMusicalControl = true;
        waitingForLayerC = false;
        outlet(0, "jit_matrix", step.matrix.name);
        scheduleDictionaryTimeout(waitToken, step.timeout || 1200);
        return;
    }

    failCheck("unknown_step", "unknown step type " + step.type);
    schedule(runNextStep, 20);
}

function sendCommand(args) {
    sendToAnalyzer(args);

    if (args.length === 1 && args[0] === "reset") {
        outlet(2, "reset");
        outlet(3, "reset");
    }
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

function beginLayerCStep(musicalControlDictName) {
    currentLayerC = {
        conductor: null,
        harmony: null,
        notes: [],
        midi: []
    };
    waitingForLayerC = true;
    outlet(3, "dictionary", musicalControlDictName);
    outlet(3, "step");
    schedule(finishLayerCStep, 20);
}

function finishLayerCStep() {
    var step = tests[currentTestIndex].steps[currentStepIndex];

    if (!waitingForLayerC || !currentResult) {
        return;
    }

    addCheck("conductor_schema_" + currentStepIndex, currentLayerC.conductor && validateConductor(currentLayerC.conductor).length === 0, "Layer C Conductor output must satisfy SFS_CONDUCTOR_CONTEXT");
    addCheck("harmony_schema_" + currentStepIndex, currentLayerC.harmony && validateHarmony(currentLayerC.harmony).length === 0, "Layer C Harmony output must satisfy SFS_HARMONY_CONTEXT");
    validateCollectedNotes();
    validateCollectedMidi();

    if (step.expect && lastVideoFeatures && lastMusicalControl && currentLayerC.conductor && currentLayerC.harmony) {
        step.expect(lastVideoFeatures, lastMusicalControl, currentLayerC);
    }

    waitingForLayerC = false;
    schedule(runNextStep, step.delay_after || 20);
}

function collectConductor(name) {
    try {
        currentLayerC.conductor = readConductor(String(name));
    } catch (error) {
        failCheck("conductor_dictionary_read", "could not read Layer C Conductor dictionary " + name);
    }
}

function collectHarmony(name) {
    try {
        currentLayerC.harmony = readHarmony(String(name));
    } catch (error) {
        failCheck("harmony_dictionary_read", "could not read Layer C Harmony dictionary " + name);
    }
}

function collectNoteEvent(name) {
    var payload;
    try {
        payload = readNoteEvent(String(name));
        currentLayerC.notes.push(payload);
        totalNoteEvents += 1;
    } catch (error) {
        failCheck("note_dictionary_read", "could not read Layer C Note dictionary " + name);
    }
}

function collectMidiEvent(name) {
    var payload;
    try {
        payload = readMidiEvent(String(name));
        currentLayerC.midi.push(payload);
        if (payload.type === "note_on") {
            totalMidiNoteOns += 1;
        }
    } catch (error) {
        failCheck("midi_dictionary_read", "could not read Layer C MIDI dictionary " + name);
    }
}

function validateCollectedNotes() {
    for (var i = 0; i < currentLayerC.notes.length; i += 1) {
        addCheck("note_schema_" + currentStepIndex + "_" + i, validateNoteEvent(currentLayerC.notes[i]).length === 0, "Layer C Note output must satisfy SFS_NOTE_EVENT");
    }
}

function validateCollectedMidi() {
    for (var i = 0; i < currentLayerC.midi.length; i += 1) {
        addCheck("midi_schema_" + currentStepIndex + "_" + i, validateMidiEvent(currentLayerC.midi[i]).length === 0, "Layer C MIDI output must satisfy SFS_MIDI_EVENT");
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
        if (waitingForLayerC) {
            failCheck("layer_c_timeout", "Layer C did not complete step for " + tests[currentTestIndex].name);
            waitingForLayerC = false;
        }
        schedule(runNextStep, 20);
    }, delay);
}

function finish() {
    var summary = makeSummary();
    running = false;
    waitingForVideoFeatures = false;
    waitingForMusicalControl = false;
    waitingForLayerC = false;
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
    post("SFS Layer A+B+C integration self-test " + summary.status + ": " + summary.passed + " passed, " + summary.failed + " failed\n");
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
        schema: "SFS_LAYER_ABC_INTEGRATION_SELFTEST",
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

function readConductor(name) {
    var dict = new Dict(name);
    return {
        schema: stringValue(safeGet(dict, "schema")),
        version: stringValue(safeGet(dict, "version")),
        timestamp_ms: numberValue(safeGet(dict, "timestamp_ms"), 0),
        transport: {
            tick_index: numberValue(safeGet(dict, "transport::tick_index"), 0),
            logical_time_us: numberValue(safeGet(dict, "transport::logical_time_us"), 0),
            tick_duration_us: numberValue(safeGet(dict, "transport::tick_duration_us"), 0),
            beat: numberValue(safeGet(dict, "transport::beat"), 0),
            bar: numberValue(safeGet(dict, "transport::bar"), 0),
            subdivision: numberValue(safeGet(dict, "transport::subdivision"), 0),
            phrase_tick: numberValue(safeGet(dict, "transport::phrase_tick"), 0),
            state_age_ticks: numberValue(safeGet(dict, "transport::state_age_ticks"), 0),
            section_tick: numberValue(safeGet(dict, "transport::section_tick"), 0)
        },
        source_state: stringValue(safeGet(dict, "source_state")),
        state: stringValue(safeGet(dict, "state")),
        state_fallback_applied: booleanValue(safeGet(dict, "state_fallback_applied")),
        section: stringValue(safeGet(dict, "section")),
        sections_enabled: booleanValue(safeGet(dict, "sections_enabled")),
        section_progress: numberValue(safeGet(dict, "section_progress"), 0),
        tempo_bpm: numberValue(safeGet(dict, "tempo_bpm"), 0),
        energy: numberValue(safeGet(dict, "energy"), 0),
        density: numberValue(safeGet(dict, "density"), 0),
        tension: numberValue(safeGet(dict, "tension"), 0),
        brightness: numberValue(safeGet(dict, "brightness"), 0),
        activity: numberValue(safeGet(dict, "activity"), 0),
        control_variation: numberValue(safeGet(dict, "control_variation"), 0),
        variation_amount: numberValue(safeGet(dict, "variation_amount"), 0),
        effective_variation: numberValue(safeGet(dict, "effective_variation"), 0),
        transition: booleanValue(safeGet(dict, "transition")),
        accent: booleanValue(safeGet(dict, "accent")),
        reset_phrase: booleanValue(safeGet(dict, "reset_phrase")),
        event_counts: {
            scene_change: numberValue(safeGet(dict, "event_counts::scene_change"), 0),
            accent: numberValue(safeGet(dict, "event_counts::accent"), 0),
            reset_phrase: numberValue(safeGet(dict, "event_counts::reset_phrase"), 0)
        },
        root_pitch_class: numberValue(safeGet(dict, "root_pitch_class"), 0),
        scale_name: stringValue(safeGet(dict, "scale_name")),
        harmonic_risk: numberValue(safeGet(dict, "harmonic_risk"), 0),
        dissonance_bias: numberValue(safeGet(dict, "dissonance_bias"), 0),
        randomness: numberValue(safeGet(dict, "randomness"), 0),
        mutation_rate: numberValue(safeGet(dict, "mutation_rate"), 0),
        density_min: numberValue(safeGet(dict, "density_min"), 0),
        density_max: numberValue(safeGet(dict, "density_max"), 0),
        max_polyphony: numberValue(safeGet(dict, "max_polyphony"), 0),
        midi_channel: numberValue(safeGet(dict, "midi_channel"), 0),
        velocity_min: numberValue(safeGet(dict, "velocity_min"), 0),
        velocity_max: numberValue(safeGet(dict, "velocity_max"), 0),
        octave_min: numberValue(safeGet(dict, "octave_min"), 0),
        octave_max: numberValue(safeGet(dict, "octave_max"), 0),
        deterministic_mode: booleanValue(safeGet(dict, "deterministic_mode")),
        seed: numberValue(safeGet(dict, "seed"), 0)
    };
}

function readHarmony(name) {
    var dict = new Dict(name);
    return {
        schema: stringValue(safeGet(dict, "schema")),
        version: stringValue(safeGet(dict, "version")),
        timestamp_ms: numberValue(safeGet(dict, "timestamp_ms"), 0),
        tick_index: numberValue(safeGet(dict, "tick_index"), 0),
        root_pitch_class: numberValue(safeGet(dict, "root_pitch_class"), 0),
        scale_name: stringValue(safeGet(dict, "scale_name")),
        scale_intervals: arrayValue(safeGet(dict, "scale_intervals")),
        borrowed_pitch_classes: arrayValue(safeGet(dict, "borrowed_pitch_classes")),
        chord: arrayValue(safeGet(dict, "chord")),
        pitch_pool: arrayValue(safeGet(dict, "pitch_pool")),
        dissonance: numberValue(safeGet(dict, "dissonance"), 0),
        register_min: numberValue(safeGet(dict, "register_min"), 0),
        register_max: numberValue(safeGet(dict, "register_max"), 0)
    };
}

function readNoteEvent(name) {
    var dict = new Dict(name);
    return {
        schema: stringValue(safeGet(dict, "schema")),
        version: stringValue(safeGet(dict, "version")),
        timestamp_ms: numberValue(safeGet(dict, "timestamp_ms"), 0),
        tick_index: numberValue(safeGet(dict, "tick_index"), 0),
        event_index: numberValue(safeGet(dict, "event_index"), 0),
        note_id: stringValue(safeGet(dict, "note_id")),
        pitch: numberValue(safeGet(dict, "pitch"), 0),
        velocity: numberValue(safeGet(dict, "velocity"), 0),
        duration_ticks: numberValue(safeGet(dict, "duration_ticks"), 0),
        duration_ms: numberValue(safeGet(dict, "duration_ms"), 0),
        channel: numberValue(safeGet(dict, "channel"), 0),
        role: stringValue(safeGet(dict, "role"))
    };
}

function readMidiEvent(name) {
    var dict = new Dict(name);
    return {
        schema: stringValue(safeGet(dict, "schema")),
        version: stringValue(safeGet(dict, "version")),
        timestamp_ms: numberValue(safeGet(dict, "timestamp_ms"), 0),
        tick_index: numberValue(safeGet(dict, "tick_index"), 0),
        midi_event_index: numberValue(safeGet(dict, "midi_event_index"), 0),
        source_event_index: nullableNumberValue(safeGet(dict, "source_event_index")),
        input_sequence: nullableNumberValue(safeGet(dict, "input_sequence")),
        type: stringValue(safeGet(dict, "type")),
        reason: stringValue(safeGet(dict, "reason")),
        active_voice_count: numberValue(safeGet(dict, "active_voice_count"), 0),
        note_id: stringValue(safeGet(dict, "note_id")),
        replacement_note_id: stringValue(safeGet(dict, "replacement_note_id")),
        pitch: numberValue(safeGet(dict, "pitch"), 0),
        velocity: numberValue(safeGet(dict, "velocity"), 0),
        channel: numberValue(safeGet(dict, "channel"), 0),
        controller: numberValue(safeGet(dict, "controller"), 0),
        value: numberValue(safeGet(dict, "value"), 0),
        released_note_ids: arrayValue(safeGet(dict, "released_note_ids")),
        used_channels: arrayValue(safeGet(dict, "used_channels"))
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

function validateConductor(payload) {
    var errors = [];
    requireEqual(payload.schema, "SFS_CONDUCTOR_CONTEXT", "conductor.schema", errors);
    requireEqual(payload.version, "0.1.0", "conductor.version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "conductor.timestamp_ms", errors);
    requireIntegerRange(payload.transport.tick_index, 0, null, "conductor.transport.tick_index", errors);
    requireIntegerRange(payload.transport.logical_time_us, 0, null, "conductor.transport.logical_time_us", errors);
    requireIntegerRange(payload.transport.tick_duration_us, 1, null, "conductor.transport.tick_duration_us", errors);
    requireString(payload.source_state, "conductor.source_state", errors);
    requireEnum(payload.state, ["calm", "tension", "action", "chaos"], "conductor.state", errors);
    requireBoolean(payload.state_fallback_applied, "conductor.state_fallback_applied", errors);
    requireNumberRange(payload.energy, 0, 1, "conductor.energy", errors);
    requireNumberRange(payload.density, 0, 1, "conductor.density", errors);
    requireNumberRange(payload.tension, 0, 1, "conductor.tension", errors);
    requireNumberRange(payload.brightness, 0, 1, "conductor.brightness", errors);
    requireNumberRange(payload.activity, 0, 1, "conductor.activity", errors);
    requireNumberRange(payload.control_variation, 0, 1, "conductor.control_variation", errors);
    requireNumberRange(payload.effective_variation, 0, 1, "conductor.effective_variation", errors);
    requireBoolean(payload.transition, "conductor.transition", errors);
    requireBoolean(payload.accent, "conductor.accent", errors);
    requireBoolean(payload.reset_phrase, "conductor.reset_phrase", errors);
    requireIntegerRange(payload.event_counts.scene_change, 0, null, "conductor.event_counts.scene_change", errors);
    requireIntegerRange(payload.event_counts.accent, 0, null, "conductor.event_counts.accent", errors);
    requireIntegerRange(payload.event_counts.reset_phrase, 0, null, "conductor.event_counts.reset_phrase", errors);
    requireEnum(payload.scale_name, ["major", "natural_minor", "dorian", "phrygian", "whole_tone", "chromatic", "cluster"], "conductor.scale_name", errors);
    requireIntegerRange(payload.midi_channel, 1, 16, "conductor.midi_channel", errors);
    return errors;
}

function validateHarmony(payload) {
    var errors = [];
    requireEqual(payload.schema, "SFS_HARMONY_CONTEXT", "harmony.schema", errors);
    requireEqual(payload.version, "0.1.0", "harmony.version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "harmony.timestamp_ms", errors);
    requireIntegerRange(payload.tick_index, 0, null, "harmony.tick_index", errors);
    requireIntegerRange(payload.root_pitch_class, 0, 11, "harmony.root_pitch_class", errors);
    requireEnum(payload.scale_name, ["major", "natural_minor", "dorian", "phrygian", "whole_tone", "chromatic", "cluster"], "harmony.scale_name", errors);
    requireArray(payload.scale_intervals, "harmony.scale_intervals", errors);
    requireArray(payload.chord, "harmony.chord", errors);
    requireArray(payload.pitch_pool, "harmony.pitch_pool", errors);
    requireNumberRange(payload.dissonance, 0, 1, "harmony.dissonance", errors);
    requireIntegerRange(payload.register_min, 0, 127, "harmony.register_min", errors);
    requireIntegerRange(payload.register_max, 0, 127, "harmony.register_max", errors);
    return errors;
}

function validateNoteEvent(payload) {
    var errors = [];
    requireEqual(payload.schema, "SFS_NOTE_EVENT", "note.schema", errors);
    requireEqual(payload.version, "0.1.0", "note.version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "note.timestamp_ms", errors);
    requireIntegerRange(payload.tick_index, 0, null, "note.tick_index", errors);
    requireIntegerRange(payload.event_index, 0, null, "note.event_index", errors);
    requireString(payload.note_id, "note.note_id", errors);
    requireIntegerRange(payload.pitch, 0, 127, "note.pitch", errors);
    requireIntegerRange(payload.velocity, 1, 127, "note.velocity", errors);
    requireIntegerRange(payload.duration_ticks, 1, null, "note.duration_ticks", errors);
    requireIntegerRange(payload.duration_ms, 1, null, "note.duration_ms", errors);
    requireIntegerRange(payload.channel, 1, 16, "note.channel", errors);
    requireString(payload.role, "note.role", errors);
    if (payload.note_id !== "note:" + payload.event_index) {
        errors.push("note.note_id must equal note:<event_index>");
    }
    return errors;
}

function validateMidiEvent(payload) {
    var errors = [];
    requireEqual(payload.schema, "SFS_MIDI_EVENT", "midi.schema", errors);
    requireEqual(payload.version, "0.1.0", "midi.version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "midi.timestamp_ms", errors);
    requireIntegerRange(payload.tick_index, 0, null, "midi.tick_index", errors);
    requireIntegerRange(payload.midi_event_index, 0, null, "midi.midi_event_index", errors);
    requireEnum(payload.type, ["note_on", "note_off", "control_change", "voice_steal", "flush", "panic"], "midi.type", errors);
    requireString(payload.reason, "midi.reason", errors);
    requireIntegerRange(payload.active_voice_count, 0, null, "midi.active_voice_count", errors);
    if (payload.type === "note_on") {
        requireString(payload.note_id, "midi.note_id", errors);
        requireIntegerRange(payload.pitch, 0, 127, "midi.pitch", errors);
        requireIntegerRange(payload.velocity, 1, 127, "midi.velocity", errors);
        requireIntegerRange(payload.channel, 1, 16, "midi.channel", errors);
    }
    if (payload.type === "note_off") {
        requireString(payload.note_id, "midi.note_id", errors);
        requireIntegerRange(payload.pitch, 0, 127, "midi.pitch", errors);
        requireEqual(payload.velocity, 0, "midi.velocity", errors);
        requireIntegerRange(payload.channel, 1, 16, "midi.channel", errors);
    }
    if (payload.type === "control_change") {
        requireIntegerRange(payload.controller, 0, 127, "midi.controller", errors);
        requireIntegerRange(payload.value, 0, 127, "midi.value", errors);
        if (payload.controller === 120) {
            errors.push("midi.controller must not be 120");
        }
    }
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

function hasNoteRole(notes, role) {
    for (var i = 0; i < notes.length; i += 1) {
        if (notes[i].role === role) {
            return true;
        }
    }
    return false;
}

function hasMidiType(events, type) {
    for (var i = 0; i < events.length; i += 1) {
        if (events[i].type === type) {
            return true;
        }
    }
    return false;
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

function requireEnum(value, allowed, label, errors) {
    for (var i = 0; i < allowed.length; i += 1) {
        if (value === allowed[i]) {
            return;
        }
    }
    errors.push(label + " must be one of " + allowed.join(","));
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

function requireArray(value, label, errors) {
    if (!(value instanceof Array) || value.length === 0) {
        errors.push(label + " must be a non-empty array");
    }
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

function arrayValue(value) {
    if (value instanceof Array) {
        return value;
    }
    if (value === null || value === undefined || value === "") {
        return [];
    }
    return [value];
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
        post("sfs layer a+b+c integration: could not write " + filename + "\n");
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
        post("sfs layer a+b+c integration: could not write " + filename + "\n");
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
