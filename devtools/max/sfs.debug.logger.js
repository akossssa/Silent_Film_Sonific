autowatch = 1;
inlets = 1;
outlets = 1;

var component = jsarguments.length > 1 ? String(jsarguments[1]) : "unknown";
var logPath = projectPath("logs/max/sfs-debug.jsonl");
var snapshotDir = projectPath("logs/snapshots");
var logDictionaries = 0;
var minLogLevel = "info";
var snapshotIntervalMs = 0;
var lastSnapshotMs = {};

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

function min_level(value) {
    var candidate = String(value || "info").toLowerCase();

    if (levelRank(candidate) >= 0) {
        minLogLevel = candidate;
    }
}

function snapshot_interval_ms(value) {
    var parsed = Math.floor(Number(value));
    snapshotIntervalMs = isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function log() {
    var args = arrayfromargs(arguments);
    var level = args.length > 0 ? String(args[0]) : "info";
    var event = args.length > 1 ? String(args[1]) : "message";
    var message = args.length > 2 ? args.slice(2).join(" ") : "";

    if (!shouldLog(level)) {
        return;
    }

    writeLog(level, event, message, null);
}

function dictionary(name) {
    snapshotDictionary(String(name));
}

function bang() {
    if (shouldLog("info")) {
        writeLog("info", "bang", "logger received bang", null);
    }
}

function anything() {
    var args = arrayfromargs(arguments);
    if (shouldLog("info")) {
        writeLog("info", String(messagename), args.join(" "), null);
    }
}

function snapshotDictionary(name) {
    var dict;
    var schema = null;
    var snapshotPath;
    var nowMs;
    var sceneCut;

    try {
        dict = new Dict(name);
        schema = safeGet(dict, "schema");
    } catch (error) {
        writeLog("error", "dictionary_open_failed", "could not open dictionary " + name, null);
        return;
    }

    nowMs = new Date().getTime();
    sceneCut = isSceneCut(dict, schema);

    if (snapshotIntervalMs > 0 && !sceneCut && lastSnapshotMs[name] !== undefined &&
            nowMs - lastSnapshotMs[name] < snapshotIntervalMs) {
        return;
    }

    lastSnapshotMs[name] = nowMs;

    snapshotPath = snapshotDir + "/" + snapshotFileName(name, schema);

    try {
        dict.export_json(snapshotPath);
        outlet(0, "snapshot", snapshotPath);
    } catch (error) {
        writeLog("error", "snapshot_write_failed", "could not write snapshot " + snapshotPath, null);
        return;
    }

    if (logDictionaries || sceneCut) {
        writeLog("info", "dictionary_snapshot", "dictionary snapshot written", {
            dict: name,
            schema: schema,
            snapshot: snapshotPath
        });
    }
}

function shouldLog(level) {
    var incomingRank = levelRank(String(level || "info").toLowerCase());
    var minimumRank = levelRank(minLogLevel);

    if (incomingRank < 0) {
        incomingRank = levelRank("info");
    }
    if (minimumRank < 0) {
        minimumRank = levelRank("info");
    }

    return incomingRank >= minimumRank;
}

function levelRank(level) {
    if (level === "debug") {
        return 10;
    }
    if (level === "info") {
        return 20;
    }
    if (level === "warn") {
        return 30;
    }
    if (level === "error") {
        return 40;
    }
    return -1;
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

function snapshotFileName(name, schema) {
    if (schema === "SFS_VIDEO_FEATURES") {
        return "sfs_video_features.latest.json";
    }
    if (schema === "SFS_MUSICAL_CONTROL") {
        return "sfs_musical_control.latest.json";
    }
    return sanitize(name) + ".latest.json";
}

function isSceneCut(dict, schema) {
    if (schema !== "SFS_VIDEO_FEATURES") {
        return false;
    }

    return safeGet(dict, "features::cut") === true || safeGet(dict, "features::cut") === 1;
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

function sanitize(value) {
    return String(value || "unnamed").replace(/[^A-Za-z0-9_.-]/g, "_");
}
