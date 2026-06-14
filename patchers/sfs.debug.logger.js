autowatch = 1;
inlets = 1;
outlets = 1;

var component = jsarguments.length > 1 ? String(jsarguments[1]) : "unknown";
var logPath = projectPath("logs/max/sfs-debug.jsonl");
var snapshotDir = projectPath("logs/snapshots");
var logDictionaries = 0;

function loadbang() {
    writeLog("info", "logger_ready", "logger initialized", {
        log_path: logPath,
        snapshot_dir: snapshotDir
    });
}

function component_name() {
    var args = arrayfromargs(arguments);
    component = args.length ? args.join(" ") : component;
}

function path() {
    var args = arrayfromargs(arguments);
    if (args.length) {
        logPath = normalizePath(args.join(" "));
        writeLog("info", "log_path_changed", "log path changed", { log_path: logPath });
    }
}

function snapshot_dir() {
    var args = arrayfromargs(arguments);
    if (args.length) {
        snapshotDir = normalizePath(args.join(" "));
        writeLog("info", "snapshot_dir_changed", "snapshot directory changed", { snapshot_dir: snapshotDir });
    }
}

function log_dictionaries(value) {
    logDictionaries = Number(value) !== 0 ? 1 : 0;
}

function log() {
    var args = arrayfromargs(arguments);
    var level = args.length > 0 ? String(args[0]) : "info";
    var event = args.length > 1 ? String(args[1]) : "message";
    var message = args.length > 2 ? args.slice(2).join(" ") : "";
    writeLog(level, event, message, null);
}

function dictionary(name) {
    snapshotDictionary(String(name));
}

function bang() {
    writeLog("info", "bang", "logger received bang", null);
}

function anything() {
    var args = arrayfromargs(arguments);
    writeLog("info", String(messagename), args.join(" "), null);
}

function snapshotDictionary(name) {
    var dict;
    var schema = null;
    var snapshotPath;

    try {
        dict = new Dict(name);
        schema = safeGet(dict, "schema");
    } catch (error) {
        writeLog("error", "dictionary_open_failed", "could not open dictionary " + name, null);
        return;
    }

    snapshotPath = snapshotDir + "/" + snapshotFileName(name, schema);

    if (schema === "SFS_VIDEO_FEATURES") {
        if (!writeText(snapshotPath, stringifyJson(videoFeaturesPayload(dict)))) {
            writeLog("error", "snapshot_write_failed", "could not write snapshot " + snapshotPath, null);
            return;
        }
        outlet(0, "snapshot", snapshotPath);
    } else {
        try {
            dict.export_json(snapshotPath);
            outlet(0, "snapshot", snapshotPath);
        } catch (error) {
            writeLog("error", "snapshot_write_failed", "could not write snapshot " + snapshotPath, null);
            return;
        }
    }

    if (logDictionaries || isSceneCut(dict)) {
        writeLog("info", "dictionary_snapshot", "dictionary snapshot written", {
            dict: name,
            schema: schema,
            snapshot: snapshotPath
        });
    }
}

function writeLog(level, event, message, data) {
    var record = {
        time: timestamp(),
        level: String(level || "info"),
        component: component,
        event: String(event || "message"),
        message: String(message || "")
    };

    if (data) {
        record.data = data;
    }

    if (appendLine(logPath, stringifyJson(record))) {
        outlet(0, "log", record.level, record.event, record.message);
    } else {
        post("sfs.debug.logger: could not write " + logPath + "\n");
        outlet(0, "log_error", logPath);
    }
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

function appendLine(filename, line) {
    var file = new File(filename, "readwrite");

    if (!file.isopen) {
        file = new File(filename, "write");
    }

    if (!file.isopen) {
        return 0;
    }

    file.position = file.eof;
    file.writeline(line);
    file.close();
    return 1;
}

function writeText(filename, text) {
    var file = new File(filename, "readwrite");
    var previousLength = 0;
    var output = String(text);

    if (!file.isopen) {
        file = new File(filename, "write");
    }

    if (!file.isopen) {
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

function videoFeaturesPayload(dict) {
    return {
        schema: stringValue(safeGet(dict, "schema"), "SFS_VIDEO_FEATURES"),
        version: stringValue(safeGet(dict, "version"), "0.1.0"),
        timestamp_ms: integerValue(safeGet(dict, "timestamp_ms"), 0),
        source: {
            type: stringValue(safeGet(dict, "source::type"), "unknown"),
            name: nullableStringValue(safeGet(dict, "source::name")),
            frame: nullableIntegerValue(safeGet(dict, "source::frame")),
            fps: nullableNumberValue(safeGet(dict, "source::fps")),
            width: integerValue(safeGet(dict, "source::width"), 0),
            height: integerValue(safeGet(dict, "source::height"), 0)
        },
        features: {
            motion: numberValue(safeGet(dict, "features::motion"), 0),
            brightness: numberValue(safeGet(dict, "features::brightness"), 0),
            contrast: numberValue(safeGet(dict, "features::contrast"), 0),
            cut: booleanValue(safeGet(dict, "features::cut")),
            cut_strength: numberValue(safeGet(dict, "features::cut_strength"), 0)
        },
        zones: {
            left: zonePayload(dict, "left"),
            center: zonePayload(dict, "center"),
            right: zonePayload(dict, "right")
        }
    };
}

function zonePayload(dict, name) {
    return {
        motion: numberValue(safeGet(dict, "zones::" + name + "::motion"), 0),
        brightness: numberValue(safeGet(dict, "zones::" + name + "::brightness"), 0),
        contrast: numberValue(safeGet(dict, "zones::" + name + "::contrast"), 0)
    };
}

function snapshotFileName(name, schema) {
    if (schema === "SFS_VIDEO_FEATURES") {
        return "sfs_video_features.latest.json";
    }
    if (schema === "SFS_MUSICAL_CONTROL") {
        return "sfs_musical_control.latest.json";
    }
    return sanitize(name) + ".latest.json";
}

function isSceneCut(dict) {
    return safeGet(dict, "features::cut") === true || safeGet(dict, "features::cut") === 1;
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

function stringValue(value, fallback) {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }
    return String(value);
}

function nullableStringValue(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    return String(value);
}

function safeGet(dict, key) {
    try {
        return dict.get(key);
    } catch (error) {
        return null;
    }
}

function timestamp() {
    var date = new Date();
    if (date.toISOString) {
        return date.toISOString();
    }
    return String(date.getTime());
}

function projectPath(relativePath) {
    var patcherPath = "";

    try {
        patcherPath = this.patcher.filepath || "";
    } catch (error) {
        patcherPath = "";
    }

    patcherPath = normalizePath(patcherPath);

    if (patcherPath.indexOf("/patchers/") >= 0) {
        return patcherPath.substring(0, patcherPath.indexOf("/patchers/")) + "/" + relativePath;
    }

    return relativePath;
}

function normalizePath(value) {
    return String(value).replace(/\\/g, "/");
}

function sanitize(value) {
    return String(value || "unnamed").replace(/[^A-Za-z0-9_.-]/g, "_");
}
