autowatch = 1;
inlets = 1;
outlets = 18;

function dictionary(name) {
    emitDictionary(String(name));
}

function list() {
    var args = arrayfromargs(arguments);
    outlet(17, "set", "raw " + args.join(" "));
}

function anything() {
    var args = arrayfromargs(arguments);

    if ((messagename === "dict" || messagename === "dictionary") && args.length > 0) {
        emitDictionary(String(args[0]));
        return;
    }

    if (messagename === "log") {
        outlet(17, "set", args.join(" "));
    }
}

function emitDictionary(name) {
    var dict;
    var schema;

    try {
        dict = new Dict(name);
    } catch (error) {
        post("sfs.music_engine.deterministic_midi.monitor: cannot open dictionary " + name + "\n");
        return;
    }

    schema = stringValue(safeGet(dict, "schema"), "unknown");
    if (schema === "SFS_CONDUCTOR_CONTEXT") {
        emitConductor(dict);
    } else if (schema === "SFS_HARMONY_CONTEXT") {
        emitHarmony(dict);
    } else if (schema === "SFS_NOTE_EVENT") {
        emitNote(dict);
    } else if (schema === "SFS_MIDI_EVENT") {
        emitMidi(dict);
    } else if (schema === "SFS_USER_CONFIG") {
        outlet(17, "set", "config " + name);
    } else {
        outlet(17, "set", "unknown dictionary " + name);
    }
}

function emitConductor(dict) {
    var tick = integerValue(safeGet(dict, "transport::tick_index"), 0);
    var state = stringValue(safeGet(dict, "state"), "unknown");
    var tempo = numberValue(safeGet(dict, "tempo_bpm"), 0);
    var energy = numberValue(safeGet(dict, "energy"), 0);
    var density = numberValue(safeGet(dict, "density"), 0);
    var tension = numberValue(safeGet(dict, "tension"), 0);

    outlet(9, booleanValue(safeGet(dict, "reset_phrase")) ? 1 : 0);
    outlet(8, booleanValue(safeGet(dict, "accent")) ? 1 : 0);
    outlet(7, booleanValue(safeGet(dict, "transition")) ? 1 : 0);
    outlet(6, tension);
    outlet(5, density);
    outlet(4, energy);
    outlet(3, tempo);
    outlet(2, "set", state);
    outlet(1, tick);
    outlet(0, "set", "tick " + tick + " " + state + " tempo=" + formatNumber(tempo) + " density=" + formatNumber(density));
}

function emitHarmony(dict) {
    var root = integerValue(safeGet(dict, "root_pitch_class"), 0);
    var scale = stringValue(safeGet(dict, "scale_name"), "unknown");
    var chord = arrayValue(safeGet(dict, "chord"));
    var dissonance = numberValue(safeGet(dict, "dissonance"), 0);

    outlet(12, dissonance);
    outlet(11, root);
    outlet(10, "set", "root=" + root + " scale=" + scale + " chord=" + chord.join(",") + " dissonance=" + formatNumber(dissonance));
}

function emitNote(dict) {
    var pitch = integerValue(safeGet(dict, "pitch"), 0);
    var velocity = integerValue(safeGet(dict, "velocity"), 0);
    var duration = integerValue(safeGet(dict, "duration_ticks"), 0);
    var role = stringValue(safeGet(dict, "role"), "note");

    outlet(15, velocity);
    outlet(14, pitch);
    outlet(13, "set", role + " pitch=" + pitch + " vel=" + velocity + " dur=" + duration);
}

function emitMidi(dict) {
    var type = stringValue(safeGet(dict, "type"), "midi");
    var reason = stringValue(safeGet(dict, "reason"), "");
    var pitch = safeGet(dict, "pitch");
    var channel = safeGet(dict, "channel");
    var text = type;

    if (pitch !== null && pitch !== undefined) {
        text += " pitch=" + integerValue(pitch, 0);
    }
    if (channel !== null && channel !== undefined) {
        text += " ch=" + integerValue(channel, 1);
    }
    if (reason !== "") {
        text += " " + reason;
    }

    outlet(16, "set", text);
}

function safeGet(dict, key) {
    try {
        return dict.get(key);
    } catch (error) {
        return null;
    }
}

function arrayValue(value) {
    if (value instanceof Array) {
        return value;
    }
    if (value === null || value === undefined || value === "") {
        return [];
    }
    return String(value).split(/[ ,]+/);
}

function booleanValue(value) {
    return value === true || value === 1 || value === "1" || value === "true";
}

function integerValue(value, fallback) {
    var parsed = Math.floor(Number(value));
    return isFinite(parsed) ? parsed : fallback;
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

function formatNumber(value) {
    return (Math.round(Number(value) * 1000) / 1000).toFixed(3);
}
