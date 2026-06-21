autowatch = 1;
inlets = 1;
outlets = 14;

function dictionary(name) {
    emit(String(name));
}

function anything() {
    var args = arrayfromargs(arguments);

    if ((messagename === "dict" || messagename === "sfs.music.control") && args.length > 0) {
        emit(String(args[0]));
    }
}

function emit(name) {
    var dict;
    var stateName;
    var previous;

    try {
        dict = new Dict(name);
    } catch (error) {
        post("sfs.musical_control.monitor: cannot open dictionary " + name + "\n");
        return;
    }

    stateName = stringValue(safeGet(dict, "state::name"), "unknown");
    previous = nullableStringValue(safeGet(dict, "state::previous"));

    outlet(13, booleanValue(safeGet(dict, "events::reset_phrase")) ? 1 : 0);
    outlet(12, booleanValue(safeGet(dict, "events::accent")) ? 1 : 0);
    outlet(11, booleanValue(safeGet(dict, "events::scene_change")) ? 1 : 0);
    outlet(10, numberValue(safeGet(dict, "controls::variation"), 0));
    outlet(9, numberValue(safeGet(dict, "controls::activity"), 0));
    outlet(8, numberValue(safeGet(dict, "controls::brightness"), 0));
    outlet(7, numberValue(safeGet(dict, "controls::tension"), 0));
    outlet(6, numberValue(safeGet(dict, "controls::density"), 0));
    outlet(5, numberValue(safeGet(dict, "controls::energy"), 0));
    outlet(4, "set", previous === null ? "none" : previous);
    outlet(3, booleanValue(safeGet(dict, "state::changed")) ? 1 : 0);
    outlet(2, numberValue(safeGet(dict, "state::confidence"), 0));
    outlet(1, "set", stateName);
    outlet(0, "set", summary(dict, stateName));
}

function summary(dict, stateName) {
    return "state " + stateName +
        " energy=" + formatNumber(numberValue(safeGet(dict, "controls::energy"), 0)) +
        " tension=" + formatNumber(numberValue(safeGet(dict, "controls::tension"), 0)) +
        " activity=" + formatNumber(numberValue(safeGet(dict, "controls::activity"), 0));
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

function formatNumber(value) {
    return (Math.round(Number(value) * 1000) / 1000).toFixed(3);
}
