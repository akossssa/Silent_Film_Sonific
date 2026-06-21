autowatch = 1;
inlets = 1;
outlets = 7;

function dictionary(name) {
    emit(String(name));
}

function anything() {
    var args = arrayfromargs(arguments);

    if ((messagename === "dict" || messagename === "sfs.video.features") && args.length > 0) {
        emit(String(args[0]));
    }
}

function emit(name) {
    var dict;
    var sourceType;
    var sourceName;
    var frame;
    var fps;

    try {
        dict = new Dict(name);
    } catch (error) {
        post("sfs.video_features.monitor: cannot open dictionary " + name + "\n");
        return;
    }

    sourceType = stringValue(safeGet(dict, "source::type"), "unknown");
    sourceName = nullableStringValue(safeGet(dict, "source::name"));
    frame = nullableIntegerValue(safeGet(dict, "source::frame"));
    fps = nullableNumberValue(safeGet(dict, "source::fps"));

    outlet(6, frame === null ? 0 : frame);
    outlet(5, numberValue(safeGet(dict, "features::cut_strength"), 0));
    outlet(4, booleanValue(safeGet(dict, "features::cut")) ? 1 : 0);
    outlet(3, numberValue(safeGet(dict, "features::contrast"), 0));
    outlet(2, numberValue(safeGet(dict, "features::brightness"), 0));
    outlet(1, numberValue(safeGet(dict, "features::motion"), 0));
    outlet(0, "set", sourceSummary(sourceType, sourceName, frame, fps));
}

function sourceSummary(type, name, frame, fps) {
    var parts = [type || "unknown"];

    if (name) {
        parts.push(name);
    }
    if (frame !== null) {
        parts.push("frame=" + frame);
    }
    if (fps !== null) {
        parts.push("fps=" + fps);
    }

    return parts.join(" ");
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
