autowatch = 1;
inlets = 1;
outlets = 2;

var SCHEMA = "SFS_VIDEO_FEATURES";
var VERSION = "0.1.0";
var dictName = "sfs_video_features";
var outputDict = new Dict(dictName);

var sourceType = "matrix";
var sourceName = null;
var sourceFps = null;
var frameIndex = 0;
var startMs = new Date().getTime();

var sampleStep = 8;
var cutThreshold = 0.35;
var previousSamples = null;
var previousWidth = 0;
var previousHeight = 0;
var previousStep = sampleStep;

function reset() {
    previousSamples = null;
    previousWidth = 0;
    previousHeight = 0;
    previousStep = sampleStep;
    frameIndex = 0;
    startMs = new Date().getTime();
    debug("info", "reset", "analysis state reset");
}

function source_type(value) {
    sourceType = String(value || "unknown");
    debug("info", "source_type", sourceType);
}

function source_name() {
    var args = arrayfromargs(arguments);
    sourceName = args.length ? args.join(" ") : null;
    debug("info", "source_name", sourceName || "null");
}

function source() {
    var args = arrayfromargs(arguments);
    if (args.length > 0) {
        sourceType = String(args[0]);
    }
    if (args.length > 1) {
        sourceName = args.slice(1).join(" ");
    }
    debug("info", "source", sourceType + " " + (sourceName || "null"));
}

function fps(value) {
    var parsed = Number(value);
    sourceFps = isFinite(parsed) && parsed > 0 ? parsed : null;
    debug("info", "fps", sourceFps === null ? "null" : String(sourceFps));
}

function frame(value) {
    var parsed = parseInt(value, 10);
    frameIndex = isFinite(parsed) && parsed >= 0 ? parsed : frameIndex;
    debug("info", "frame", String(frameIndex));
}

function sample_step(value) {
    var parsed = parseInt(value, 10);
    sampleStep = isFinite(parsed) && parsed > 0 ? parsed : sampleStep;
    debug("info", "sample_step", String(sampleStep));
}

function cut_threshold(value) {
    cutThreshold = clamp(Number(value));
    debug("info", "cut_threshold", String(cutThreshold));
}

function bang() {
    outlet(0, "dictionary", dictName);
}

function jit_matrix(matrixName) {
    analyzeMatrix(String(matrixName));
}

function anything() {
    post("sfs.video_analysis.basic_motion: ignored message '" + messagename + "'\n");
    debug("warn", "ignored_message", String(messagename));
}

function analyzeMatrix(matrixName) {
    var matrix;

    try {
        matrix = new JitterMatrix(matrixName);
    } catch (error) {
        post("sfs.video_analysis.basic_motion: could not read matrix " + matrixName + "\n");
        debug("error", "matrix_read_failed", matrixName);
        return;
    }

    var dim = matrix.dim;
    var width = dim[0] || 0;
    var height = dim.length > 1 ? dim[1] : 1;

    if (width <= 0 || height <= 0) {
        debug("warn", "empty_matrix", matrixName);
        return;
    }

    var divisor = matrix.type === "char" ? 255.0 : 1.0;
    var samples = [];
    var zones = {
        left: makeZone(),
        center: makeZone(),
        right: makeZone()
    };

    var sum = 0.0;
    var sumSq = 0.0;
    var motionSum = 0.0;
    var motionCount = 0;
    var count = 0;
    var canCompare = previousSamples &&
        previousWidth === width &&
        previousHeight === height &&
        previousStep === sampleStep;

    for (var y = 0; y < height; y += sampleStep) {
        for (var x = 0; x < width; x += sampleStep) {
            var cell = matrix.getcell(x, y);
            var luma = cellToLuma(cell, divisor);
            var zoneName = x < width / 3 ? "left" : (x < (width * 2) / 3 ? "center" : "right");
            var zone = zones[zoneName];

            samples[count] = luma;
            sum += luma;
            sumSq += luma * luma;
            zone.sum += luma;
            zone.sumSq += luma * luma;
            zone.count += 1;

            if (canCompare && count < previousSamples.length) {
                var diff = Math.abs(luma - previousSamples[count]);
                motionSum += diff;
                motionCount += 1;
                zone.motionSum += diff;
                zone.motionCount += 1;
            }

            count += 1;
        }
    }

    var brightness = count > 0 ? sum / count : 0.0;
    var variance = count > 0 ? Math.max(0.0, (sumSq / count) - (brightness * brightness)) : 0.0;
    var contrast = clamp(Math.sqrt(variance) * 2.0);
    var motion = motionCount > 0 ? motionSum / motionCount : 0.0;
    var cutStrength = motionCount > 0 ? clamp((motion - cutThreshold) / Math.max(0.0001, 1.0 - cutThreshold)) : 0.0;
    var cut = cutStrength > 0.0;

    writeDictionary(width, height, brightness, contrast, motion, cut, cutStrength, zones);

    previousSamples = samples;
    previousWidth = width;
    previousHeight = height;
    previousStep = sampleStep;
    frameIndex += 1;

    outlet(0, "dictionary", dictName);
}

function debug(level, event, message) {
    outlet(1, "log", level, event, message || "");
}

function writeDictionary(width, height, brightness, contrast, motion, cut, cutStrength, zones) {
    var payload = {
        schema: SCHEMA,
        version: VERSION,
        timestamp_ms: Math.max(0, new Date().getTime() - startMs),
        source: {
            type: sourceType,
            name: sourceName,
            frame: frameIndex,
            fps: sourceFps,
            width: width,
            height: height
        },
        features: {
            motion: round4(motion),
            brightness: round4(brightness),
            contrast: round4(contrast),
            cut: !!cut,
            cut_strength: round4(cutStrength)
        },
        zones: {
            left: zonePayload(zones.left),
            center: zonePayload(zones.center),
            right: zonePayload(zones.right)
        }
    };

    replaceDictionaryFromJson(payload);
}

function zonePayload(zone) {
    var brightness = zone.count > 0 ? zone.sum / zone.count : 0.0;
    var variance = zone.count > 0 ? Math.max(0.0, (zone.sumSq / zone.count) - (brightness * brightness)) : 0.0;
    var contrast = clamp(Math.sqrt(variance) * 2.0);
    var motion = zone.motionCount > 0 ? zone.motionSum / zone.motionCount : 0.0;

    return {
        motion: round4(motion),
        brightness: round4(brightness),
        contrast: round4(contrast)
    };
}

function replaceDictionaryFromJson(payload) {
    var json = stringifyJson(payload);

    outputDict.clear();

    if (typeof outputDict.parse === "function") {
        outputDict.parse(json);
        return;
    }

    debug("warn", "dict_parse_unavailable", "falling back to Dict.replace writes");
    outputDict.set("schema", payload.schema);
    outputDict.set("version", payload.version);
    outputDict.set("timestamp_ms", payload.timestamp_ms);
    outputDict.replace("source::type", payload.source.type);
    outputDict.replace("source::name", payload.source.name);
    outputDict.replace("source::frame", payload.source.frame);
    outputDict.replace("source::fps", payload.source.fps);
    outputDict.replace("source::width", payload.source.width);
    outputDict.replace("source::height", payload.source.height);
    outputDict.replace("features::motion", payload.features.motion);
    outputDict.replace("features::brightness", payload.features.brightness);
    outputDict.replace("features::contrast", payload.features.contrast);
    outputDict.replace("features::cut", payload.features.cut);
    outputDict.replace("features::cut_strength", payload.features.cut_strength);
    outputDict.replace("zones::left::motion", payload.zones.left.motion);
    outputDict.replace("zones::left::brightness", payload.zones.left.brightness);
    outputDict.replace("zones::left::contrast", payload.zones.left.contrast);
    outputDict.replace("zones::center::motion", payload.zones.center.motion);
    outputDict.replace("zones::center::brightness", payload.zones.center.brightness);
    outputDict.replace("zones::center::contrast", payload.zones.center.contrast);
    outputDict.replace("zones::right::motion", payload.zones.right.motion);
    outputDict.replace("zones::right::brightness", payload.zones.right.brightness);
    outputDict.replace("zones::right::contrast", payload.zones.right.contrast);
}

function makeZone() {
    return {
        sum: 0.0,
        sumSq: 0.0,
        count: 0,
        motionSum: 0.0,
        motionCount: 0
    };
}

function cellToLuma(cell, divisor) {
    var values = cell instanceof Array ? cell : [cell];
    var luma;

    if (values.length >= 4) {
        luma = (0.2126 * Number(values[1])) + (0.7152 * Number(values[2])) + (0.0722 * Number(values[3]));
    } else if (values.length >= 3) {
        luma = (0.2126 * Number(values[0])) + (0.7152 * Number(values[1])) + (0.0722 * Number(values[2]));
    } else {
        luma = Number(values[0]);
    }

    if (!isFinite(luma)) {
        return 0.0;
    }

    if (divisor === 1.0 && luma > 1.0) {
        luma = luma / 255.0;
    } else {
        luma = luma / divisor;
    }

    return clamp(luma);
}

function clamp(value) {
    var parsed = Number(value);
    if (!isFinite(parsed)) {
        return 0.0;
    }
    if (parsed < 0.0) {
        return 0.0;
    }
    if (parsed > 1.0) {
        return 1.0;
    }
    return parsed;
}

function round4(value) {
    return Math.round(clamp(value) * 10000.0) / 10000.0;
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
