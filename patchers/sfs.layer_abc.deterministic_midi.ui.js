autowatch = 1;
inlets = 1;

var mode = jsarguments.length > 1 ? String(jsarguments[1]) : "diagnostics_monitor";

if (mode === "video_monitor") {
    outlets = 7;
} else if (mode === "musical_monitor") {
    outlets = 14;
} else if (mode === "engine_monitor") {
    outlets = 18;
} else if (mode === "config_monitor") {
    outlets = 23;
} else if (mode === "step_adapter") {
    outlets = 2;
} else if (mode === "bool_param") {
    outlets = 1;
} else if (mode === "text_param") {
    outlets = 1;
} else {
    outlets = 1;
}

var autoStep = 1;
var stepCount = 1;
var paramPath = jsarguments.length > 2 ? String(jsarguments[2]) : "";

function dictionary(name) {
    if (mode === "step_adapter") {
        forwardMusicalControl(String(name));
    } else if (mode === "video_monitor") {
        emitVideo(String(name));
    } else if (mode === "musical_monitor") {
        emitMusicalControl(String(name));
    } else if (mode === "engine_monitor") {
        emitEngineDictionary(String(name));
    } else if (mode === "config_monitor") {
        emitConfig(String(name));
    }
}

function msg_int(value) {
    if (mode === "engine_monitor") {
        outlet(17, "set", "raw " + integerValue(value, 0));
    } else if (mode === "bool_param") {
        emitBooleanParam(value);
    } else if (mode === "text_param") {
        emitTextParam([String(value)]);
    }
}

function msg_float(value) {
    msg_int(value);
}

function auto_step(value) {
    autoStep = Number(value) !== 0 ? 1 : 0;
}

function step_count(value) {
    var parsed = Math.floor(Number(value));
    stepCount = isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function anything() {
    var args = arrayfromargs(arguments);

    if (mode === "step_adapter") {
        if ((messagename === "dict" || messagename === "sfs.music.control") && args.length > 0) {
            forwardMusicalControl(String(args[0]));
            return;
        }
        outlet(1, "log", "warn", "ignored_message", "ignored " + String(messagename));
        return;
    }

    if (mode === "bool_param") {
        emitBooleanParam(args.length > 0 ? args[0] : messagename);
        return;
    }

    if (mode === "text_param") {
        emitTextParam([String(messagename)].concat(args));
        return;
    }

    if ((messagename === "dict" || messagename === "dictionary") && args.length > 0) {
        dictionary(args[0]);
        return;
    }

    if (messagename === "log") {
        emitDiagnostic(args);
        return;
    }

    if (mode === "engine_monitor") {
        outlet(17, "set", String(messagename) + (args.length ? " " + args.join(" ") : ""));
    } else if (mode === "config_monitor") {
        outlet(22, "set", String(messagename) + (args.length ? " " + args.join(" ") : ""));
    } else if (mode === "diagnostics_monitor") {
        outlet(0, "set", String(messagename) + (args.length ? " " + args.join(" ") : ""));
    }
}

function emitBooleanParam(value) {
    var isOn = value === true || value === 1 || value === "1" || value === "true";
    if (paramPath.length > 0) {
        outlet(0, "param", paramPath, isOn ? "true" : "false");
    }
}

function emitTextParam(parts) {
    var text = parts.join(" ").replace(/^text\\s+/, "").replace(/^set\\s+/, "");
    if (paramPath.length > 0 && text.length > 0) {
        outlet(0, "param", paramPath, text);
    }
}

function forwardMusicalControl(name) {
    outlet(0, "dictionary", name);
    if (autoStep) {
        outlet(0, "step", stepCount);
    }
    outlet(1, "log", "info", "layer_c_step", "queued " + name + " and stepped " + stepCount);
}

function emitVideo(name) {
    var dict = openDict(name, "video_monitor");
    var sourceType;
    var sourceName;
    var frame;
    var fps;

    if (!dict) {
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

function emitMusicalControl(name) {
    var dict = openDict(name, "musical_monitor");
    var stateName;
    var previous;

    if (!dict) {
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
    outlet(0, "set", "state " + stateName +
        " energy=" + formatNumber(numberValue(safeGet(dict, "controls::energy"), 0)) +
        " tension=" + formatNumber(numberValue(safeGet(dict, "controls::tension"), 0)) +
        " activity=" + formatNumber(numberValue(safeGet(dict, "controls::activity"), 0)));
}

function emitEngineDictionary(name) {
    var dict = openDict(name, "engine_monitor");
    var schema;

    if (!dict) {
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
    } else {
        outlet(17, "set", "dictionary " + schema + " " + name);
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

function emitConfig(name) {
    var dict = openDict(name, "config_monitor");
    var scale;

    if (!dict) {
        return;
    }
    if (stringValue(safeGet(dict, "schema"), "") !== "SFS_USER_CONFIG") {
        outlet(22, "set", "dictionary " + stringValue(safeGet(dict, "schema"), "unknown") + " " + name);
        return;
    }

    scale = stringValue(safeGet(dict, "musical_identity::scale_name"), "natural_minor");

    outlet(21, "set", integerValue(safeGet(dict, "midi::octave_max"), 6));
    outlet(20, "set", integerValue(safeGet(dict, "midi::octave_min"), 3));
    outlet(19, "set", integerValue(safeGet(dict, "midi::velocity_max"), 110));
    outlet(18, "set", integerValue(safeGet(dict, "midi::velocity_min"), 35));
    outlet(17, "set", integerValue(safeGet(dict, "midi::midi_channel"), 1));
    outlet(16, "set", integerValue(safeGet(dict, "density::max_polyphony"), 4));
    outlet(15, "set", numberValue(safeGet(dict, "density::density_max"), 0.9));
    outlet(14, "set", numberValue(safeGet(dict, "density::density_min"), 0.05));
    outlet(13, "set", booleanValue(safeGet(dict, "structure::sections_enabled")) ? 1 : 0);
    outlet(12, "set", numberValue(safeGet(dict, "generation::mutation_rate"), 0.25));
    outlet(11, "set", numberValue(safeGet(dict, "generation::variation_amount"), 0.5));
    outlet(10, "set", numberValue(safeGet(dict, "generation::randomness"), 0.4));
    outlet(9, "set", numberValue(safeGet(dict, "rhythm::tempo_max"), 160));
    outlet(8, "set", numberValue(safeGet(dict, "rhythm::tempo_min"), 50));
    outlet(7, "set", numberValue(safeGet(dict, "musical_identity::dissonance_bias"), 0.4));
    outlet(6, "set", numberValue(safeGet(dict, "musical_identity::harmonic_risk"), 0.7));
    outlet(5, "setsymbol", scale);
    outlet(4, "set", integerValue(safeGet(dict, "musical_identity::root_pitch_class"), 0));
    outlet(3, "set", integerValue(safeGet(dict, "reproducibility::random_seed"), 12345));
    outlet(2, "set", booleanValue(safeGet(dict, "reproducibility::deterministic_mode")) ? 1 : 0);
    outlet(1, "set", stringValue(safeGet(dict, "preset_name"), "Default"));
    outlet(0, "set", "config " + stringValue(safeGet(dict, "preset_name"), "Default") +
        " seed=" + integerValue(safeGet(dict, "reproducibility::random_seed"), 12345) +
        " scale=" + scale +
        " tempo=" + formatNumber(numberValue(safeGet(dict, "rhythm::tempo_min"), 50)) +
        "-" + formatNumber(numberValue(safeGet(dict, "rhythm::tempo_max"), 160)));
}

function emitDiagnostic(args) {
    var level = args.length > 0 ? String(args[0]) : "info";
    var event = args.length > 1 ? String(args[1]) : "diagnostic";
    var message = args.length > 2 ? args.slice(2).join(" ") : "";
    var text = level + " " + event + (message.length ? " " + message : "");

    if (mode === "config_monitor") {
        outlet(22, "set", text);
    } else {
        outlet(0, "set", text);
    }
}

function openDict(name, label) {
    try {
        return new Dict(name);
    } catch (error) {
        post("sfs.layer_abc.deterministic_midi.ui " + label + ": cannot open dictionary " + name + "\n");
        return null;
    }
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

function formatNumber(value) {
    return (Math.round(Number(value) * 1000) / 1000).toFixed(3);
}
