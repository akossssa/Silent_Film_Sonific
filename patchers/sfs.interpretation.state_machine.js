autowatch = 1;
inlets = 1;
outlets = 2;

var INPUT_SCHEMA = "SFS_VIDEO_FEATURES";
var OUTPUT_SCHEMA = "SFS_MUSICAL_CONTROL";
var VERSION = "0.1.0";
var dictName = "sfs_musical_control";
var outputDict = null;
var machine = null;

function reset() {
    machine.reset();
    debug("info", "reset", "interpretation state reset");
}

function smoothing_alpha(value) {
    machine.smoothingAlpha = clamp(Number(value), 0.01, 1.0);
    debug("info", "smoothing_alpha", String(machine.smoothingAlpha));
}

function state_inertia(value) {
    machine.stateInertia = clamp(Number(value), 0.0, 0.5);
    debug("info", "state_inertia", String(machine.stateInertia));
}

function dictionary(name) {
    interpretDictionary(String(name));
}

function bang() {
    outlet(0, "dictionary", dictName);
}

function anything() {
    var args = arrayfromargs(arguments);
    if ((messagename === "sfs.video.features" || messagename === "dict") && args.length > 0) {
        interpretDictionary(String(args[0]));
        return;
    }

    debug("warn", "ignored_message", String(messagename));
    post("sfs.interpretation.state_machine: ignored message '" + messagename + "'\n");
}

function interpretDictionary(name) {
    var input;
    var result;

    try {
        input = readVideoFeaturesDict(name);
    } catch (error) {
        debug("error", "dictionary_read_failed", "could not read dictionary " + name);
        return;
    }

    result = machine.interpret(input);

    if (!result.valid) {
        debug("error", "invalid_input", result.errors.join("; "));
        post("sfs.interpretation.state_machine: invalid input: " + result.errors.join("; ") + "\n");
        return;
    }

    writeOutputDictionary(result.payload);
    outlet(0, "dictionary", dictName);
    debug("info", "state", result.payload.state.name + " energy " + result.payload.controls.energy);
}

function StateMachine() {
    this.smoothingAlpha = 0.75;
    this.stateInertia = 0.1;
    this.reset();
}

StateMachine.prototype.reset = function () {
    this.currentState = "calm";
    this.previousRaw = null;
    this.smoothedControls = null;
    this.cutMemory = 0.0;
    this.hasOutput = false;
};

StateMachine.prototype.interpret = function (input) {
    var errors = validateVideoFeaturesPayload(input);
    var raw;
    var controls;
    var stateInfo;
    var previousState;
    var changed;
    var payload;

    if (errors.length > 0) {
        return {
            valid: false,
            errors: errors
        };
    }

    raw = deriveSignals(input, this.previousRaw, this.cutMemory);
    this.cutMemory = Math.max(raw.cut_strength, this.cutMemory * 0.65);
    raw.cut_memory = this.cutMemory;
    controls = deriveControls(raw);
    this.smoothedControls = smoothControls(this.smoothedControls, controls, this.smoothingAlpha);
    stateInfo = chooseState(this.currentState, raw, this.smoothedControls, this.stateInertia);
    previousState = this.currentState;
    changed = this.hasOutput && stateInfo.name !== previousState;

    if (!this.hasOutput && stateInfo.name !== this.currentState) {
        changed = true;
    }

    this.currentState = stateInfo.name;
    this.previousRaw = raw;
    this.hasOutput = true;

    payload = {
        schema: OUTPUT_SCHEMA,
        version: VERSION,
        timestamp_ms: integerValue(input.timestamp_ms, 0),
        state: {
            name: this.currentState,
            confidence: round4(stateInfo.confidence),
            changed: !!changed,
            previous: changed ? previousState : null
        },
        controls: roundControls(this.smoothedControls),
        events: {
            scene_change: raw.cut,
            accent: raw.accent,
            reset_phrase: raw.reset_phrase
        }
    };

    return {
        valid: true,
        errors: [],
        payload: payload,
        raw: raw,
        controls: controls
    };
};

function deriveSignals(input, previousRaw, previousCutMemory) {
    var features = input.features || {};
    var zones = input.zones || null;
    var motion = clamp(Number(features.motion), 0, 1);
    var brightness = clamp(Number(features.brightness), 0, 1);
    var contrast = clamp(Number(features.contrast), 0, 1);
    var cutStrength = clamp(Number(features.cut_strength), 0, 1);
    var cut = booleanValue(features.cut) || cutStrength >= 0.65;
    var previousMotion = previousRaw ? previousRaw.motion : motion;
    var previousBrightness = previousRaw ? previousRaw.brightness : brightness;
    var previousContrast = previousRaw ? previousRaw.contrast : contrast;
    var motionDelta = Math.abs(motion - previousMotion);
    var brightnessDelta = Math.abs(brightness - previousBrightness);
    var contrastDelta = Math.abs(contrast - previousContrast);
    var zoneSpread = zoneMotionSpread(zones);
    var eventMemory = Math.max(cutStrength, previousCutMemory * 0.65);
    var accentStrength = Math.max(cutStrength, motionDelta, brightnessDelta * 0.75, contrastDelta * 0.75);

    return {
        motion: motion,
        brightness: brightness,
        contrast: contrast,
        cut: !!cut,
        cut_strength: cutStrength,
        cut_memory: eventMemory,
        motion_delta: motionDelta,
        brightness_delta: brightnessDelta,
        contrast_delta: contrastDelta,
        zone_motion_spread: zoneSpread,
        accent_strength: accentStrength,
        accent: accentStrength >= 0.55 || cut,
        reset_phrase: cut && cutStrength >= 0.75
    };
}

function deriveControls(raw) {
    var energy = clamp((0.8 * raw.motion) + (0.2 * raw.contrast) + (0.18 * raw.cut_strength), 0, 1);
    var density = clamp((0.75 * raw.motion) + (0.1 * raw.contrast) + (0.15 * raw.cut_strength) + (0.15 * raw.zone_motion_spread), 0, 1);
    var tension = clamp((0.7 * raw.contrast) + (0.35 * raw.cut_strength) + (0.15 * (1 - raw.brightness) * raw.contrast) + (0.1 * raw.motion), 0, 1);
    var activity = clamp((0.95 * raw.motion) + (0.1 * raw.contrast) + (0.2 * raw.motion_delta) + (0.25 * raw.cut_strength), 0, 1);
    var variation = clamp((0.6 * raw.zone_motion_spread) + (0.55 * raw.cut_memory) + (0.3 * raw.contrast * raw.motion) + (0.2 * raw.motion_delta) + (0.2 * raw.contrast) + (0.1 * raw.motion), 0, 1);

    return {
        energy: energy,
        density: density,
        tension: tension,
        brightness: raw.brightness,
        activity: activity,
        variation: variation
    };
}

function chooseState(currentState, raw, controls, inertia) {
    var candidate = "calm";
    var confidence;

    if (raw.cut || raw.cut_strength >= 0.65 || (controls.energy >= 0.78 && controls.tension >= 0.72 && controls.variation >= 0.55)) {
        candidate = "chaos";
    } else if (currentState === "chaos" && raw.cut_memory >= 0.35 && controls.energy >= 0.65 && controls.tension >= 0.65) {
        candidate = "chaos";
    } else if (controls.energy >= 0.52 && controls.activity >= 0.52) {
        candidate = "action";
    } else if (controls.tension >= 0.52 || raw.zone_motion_spread >= 0.45 || (raw.contrast >= 0.48 && raw.motion >= 0.12)) {
        candidate = "tension";
    }

    if (currentState === "tension" && candidate === "calm" && !raw.cut && (controls.tension >= 0.35 || raw.contrast >= 0.45)) {
        candidate = "tension";
    }

    if (candidate !== currentState && currentState !== "calm" && currentState !== "chaos" && !raw.cut) {
        if (stateStrength(candidate, controls, raw) + inertia < stateStrength(currentState, controls, raw)) {
            candidate = currentState;
        }
    }

    confidence = stateStrength(candidate, controls, raw);

    return {
        name: candidate,
        confidence: clamp(0.45 + (confidence * 0.55), 0, 1)
    };
}

function stateStrength(state, controls, raw) {
    if (state === "chaos") {
        return clamp(Math.max(raw.cut_strength, raw.cut_memory, (controls.energy + controls.tension + controls.variation) / 3), 0, 1);
    }
    if (state === "action") {
        return clamp((controls.energy + controls.activity) / 2, 0, 1);
    }
    if (state === "tension") {
        return clamp(Math.max(controls.tension, raw.zone_motion_spread * 0.75), 0, 1);
    }
    return clamp(1 - Math.max(controls.energy, controls.tension, controls.activity, controls.variation * 0.8), 0, 1);
}

function smoothControls(previous, next, alpha) {
    if (!previous) {
        return {
            energy: next.energy,
            density: next.density,
            tension: next.tension,
            brightness: next.brightness,
            activity: next.activity,
            variation: next.variation
        };
    }

    return {
        energy: smooth(previous.energy, next.energy, alpha),
        density: smooth(previous.density, next.density, alpha),
        tension: smooth(previous.tension, next.tension, alpha),
        brightness: smooth(previous.brightness, next.brightness, alpha),
        activity: smooth(previous.activity, next.activity, alpha),
        variation: smooth(previous.variation, next.variation, alpha)
    };
}

function smooth(previous, next, alpha) {
    return (previous * (1 - alpha)) + (next * alpha);
}

function roundControls(controls) {
    return {
        energy: round4(controls.energy),
        density: round4(controls.density),
        tension: round4(controls.tension),
        brightness: round4(controls.brightness),
        activity: round4(controls.activity),
        variation: round4(controls.variation)
    };
}

function zoneMotionSpread(zones) {
    var values = [];
    var key;
    var value;
    var min = 1;
    var max = 0;

    if (!zones || typeof zones !== "object") {
        return 0;
    }

    for (key in zones) {
        if (zones.hasOwnProperty(key) && zones[key] && zones[key].motion !== undefined) {
            value = Number(zones[key].motion);
            if (isFinite(value)) {
                values.push(clamp(value, 0, 1));
            }
        }
    }

    if (values.length < 2) {
        return 0;
    }

    for (var i = 0; i < values.length; i += 1) {
        min = Math.min(min, values[i]);
        max = Math.max(max, values[i]);
    }

    return clamp(max - min, 0, 1);
}

function validateVideoFeaturesPayload(payload) {
    var errors = [];

    if (!payload || typeof payload !== "object") {
        return ["input must be an object"];
    }

    requireEqual(payload.schema, INPUT_SCHEMA, "schema", errors);
    requireString(payload.version, "version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "timestamp_ms", errors);

    if (!payload.source || typeof payload.source !== "object") {
        errors.push("source must be an object");
    } else {
        requireEnum(payload.source.type, ["movie", "camera", "stream", "matrix", "texture", "unknown"], "source.type", errors);
        requireOptionalString(payload.source.name, "source.name", errors);
        requireOptionalIntegerRange(payload.source.frame, 0, null, "source.frame", errors);
        requireOptionalNumberRange(payload.source.fps, 0.000001, null, "source.fps", errors);
    }

    if (!payload.features || typeof payload.features !== "object") {
        errors.push("features must be an object");
    } else {
        requireNumberRange(payload.features.motion, 0, 1, "features.motion", errors);
        requireNumberRange(payload.features.brightness, 0, 1, "features.brightness", errors);
        requireNumberRange(payload.features.contrast, 0, 1, "features.contrast", errors);
        requireBoolean(payload.features.cut, "features.cut", errors);
        requireNumberRange(payload.features.cut_strength, 0, 1, "features.cut_strength", errors);
    }

    validateZones(payload.zones, errors);

    return errors;
}

function validateMusicalControlPayload(payload) {
    var errors = [];

    if (!payload || typeof payload !== "object") {
        return ["output must be an object"];
    }

    requireEqual(payload.schema, OUTPUT_SCHEMA, "schema", errors);
    requireString(payload.version, "version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "timestamp_ms", errors);

    if (!payload.state || typeof payload.state !== "object") {
        errors.push("state must be an object");
    } else {
        requireString(payload.state.name, "state.name", errors);
        requireNumberRange(payload.state.confidence, 0, 1, "state.confidence", errors);
        requireBoolean(payload.state.changed, "state.changed", errors);
        requireOptionalString(payload.state.previous, "state.previous", errors);
    }

    if (!payload.controls || typeof payload.controls !== "object") {
        errors.push("controls must be an object");
    } else {
        requireNumberRange(payload.controls.energy, 0, 1, "controls.energy", errors);
        requireNumberRange(payload.controls.density, 0, 1, "controls.density", errors);
        requireNumberRange(payload.controls.tension, 0, 1, "controls.tension", errors);
        requireNumberRange(payload.controls.brightness, 0, 1, "controls.brightness", errors);
        requireNumberRange(payload.controls.activity, 0, 1, "controls.activity", errors);
        requireNumberRange(payload.controls.variation, 0, 1, "controls.variation", errors);
    }

    if (!payload.events || typeof payload.events !== "object") {
        errors.push("events must be an object");
    } else {
        requireBoolean(payload.events.scene_change, "events.scene_change", errors);
        requireBoolean(payload.events.accent, "events.accent", errors);
        requireBoolean(payload.events.reset_phrase, "events.reset_phrase", errors);
    }

    return errors;
}

function validateZones(zones, errors) {
    var key;
    var zone;

    if (zones === null || zones === undefined) {
        return;
    }

    if (typeof zones !== "object") {
        errors.push("zones must be an object when present");
        return;
    }

    for (key in zones) {
        if (zones.hasOwnProperty(key)) {
            zone = zones[key];
            if (!zone || typeof zone !== "object") {
                errors.push("zones." + key + " must be an object");
                continue;
            }
            if (zone.motion !== undefined) {
                requireNumberRange(zone.motion, 0, 1, "zones." + key + ".motion", errors);
            }
            if (zone.brightness !== undefined) {
                requireNumberRange(zone.brightness, 0, 1, "zones." + key + ".brightness", errors);
            }
            if (zone.contrast !== undefined) {
                requireNumberRange(zone.contrast, 0, 1, "zones." + key + ".contrast", errors);
            }
        }
    }
}

function readVideoFeaturesDict(name) {
    var dict = new Dict(name);
    var zones = {};
    var zoneNames = ["left", "center", "right"];
    var zone;
    var zoneName;

    for (var i = 0; i < zoneNames.length; i += 1) {
        zoneName = zoneNames[i];
        zone = readZone(dict, zoneName);
        if (zone) {
            zones[zoneName] = zone;
        }
    }

    return {
        schema: safeGet(dict, "schema"),
        version: safeGet(dict, "version"),
        timestamp_ms: integerValue(safeGet(dict, "timestamp_ms"), 0),
        source: {
            type: safeGet(dict, "source::type"),
            name: nullableStringValue(safeGet(dict, "source::name")),
            frame: nullableIntegerValue(safeGet(dict, "source::frame")),
            fps: nullableNumberValue(safeGet(dict, "source::fps"))
        },
        features: {
            motion: numberValue(safeGet(dict, "features::motion"), NaN),
            brightness: numberValue(safeGet(dict, "features::brightness"), NaN),
            contrast: numberValue(safeGet(dict, "features::contrast"), NaN),
            cut: booleanValue(safeGet(dict, "features::cut")),
            cut_strength: numberValue(safeGet(dict, "features::cut_strength"), NaN)
        },
        zones: zones
    };
}

function readZone(dict, name) {
    var motion = safeGet(dict, "zones::" + name + "::motion");
    var brightness = safeGet(dict, "zones::" + name + "::brightness");
    var contrast = safeGet(dict, "zones::" + name + "::contrast");

    if (motion === null && brightness === null && contrast === null) {
        return null;
    }

    return {
        motion: numberValue(motion, 0),
        brightness: numberValue(brightness, 0),
        contrast: numberValue(contrast, 0)
    };
}

function writeOutputDictionary(payload) {
    if (!outputDict) {
        outputDict = new Dict(dictName);
    }

    replaceDictionaryFromJson(outputDict, payload);
}

function replaceDictionaryFromJson(dict, payload) {
    var json = stringifyJson(payload);

    dict.clear();

    if (typeof dict.parse === "function") {
        dict.parse(json);
        return;
    }

    debug("warn", "dict_parse_unavailable", "falling back to Dict.replace writes");
    dict.set("schema", payload.schema);
    dict.set("version", payload.version);
    dict.set("timestamp_ms", payload.timestamp_ms);
    dict.replace("state::name", payload.state.name);
    dict.replace("state::confidence", payload.state.confidence);
    dict.replace("state::changed", payload.state.changed);
    dict.replace("state::previous", payload.state.previous);
    dict.replace("controls::energy", payload.controls.energy);
    dict.replace("controls::density", payload.controls.density);
    dict.replace("controls::tension", payload.controls.tension);
    dict.replace("controls::brightness", payload.controls.brightness);
    dict.replace("controls::activity", payload.controls.activity);
    dict.replace("controls::variation", payload.controls.variation);
    dict.replace("events::scene_change", payload.events.scene_change);
    dict.replace("events::accent", payload.events.accent);
    dict.replace("events::reset_phrase", payload.events.reset_phrase);
}

function debug(level, event, message) {
    if (typeof outlet === "function") {
        outlet(1, "log", level, event, message || "");
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

function requireOptionalNumberRange(value, min, max, label, errors) {
    if (value === null || value === undefined) {
        return;
    }
    requireNumberRange(value, min, max, label, errors);
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

function requireOptionalIntegerRange(value, min, max, label, errors) {
    if (value === null || value === undefined) {
        return;
    }
    requireIntegerRange(value, min, max, label, errors);
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

function integerValue(value, fallback) {
    var parsed = parseInt(value, 10);
    return isFinite(parsed) ? parsed : fallback;
}

function nullableNumberValue(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    var parsed = Number(value);
    return isFinite(parsed) ? parsed : null;
}

function nullableIntegerValue(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    var parsed = parseInt(value, 10);
    return isFinite(parsed) ? parsed : null;
}

function nullableStringValue(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    return String(value);
}

function clamp(value, min, max) {
    var parsed = Number(value);
    if (!isFinite(parsed)) {
        return min;
    }
    if (parsed < min) {
        return min;
    }
    if (parsed > max) {
        return max;
    }
    return parsed;
}

function round4(value) {
    return Math.round(clamp(value, 0, 1) * 10000.0) / 10000.0;
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

machine = new StateMachine();

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        StateMachine: StateMachine,
        validateVideoFeaturesPayload: validateVideoFeaturesPayload,
        validateMusicalControlPayload: validateMusicalControlPayload
    };
}
