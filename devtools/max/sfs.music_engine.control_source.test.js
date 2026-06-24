autowatch = 1;
inlets = 1;
outlets = 2;

var dictName = "sfs_music_engine_control_source_test";
var outputDict = null;

function calm() {
    emitControl("calm", 0.35, 0.35, 0.2, 0.45, 0.3, 0.2, false, false, false);
}

function tension() {
    emitControl("tension", 0.5, 0.5, 0.7, 0.4, 0.5, 0.45, false, false, false);
}

function action() {
    emitControl("action", 0.72, 0.64, 0.58, 0.55, 0.77, 0.39, false, false, false);
}

function chaos() {
    emitControl("chaos", 0.9, 0.85, 0.9, 0.65, 0.9, 0.8, false, false, false);
}

function mystery() {
    emitControl("mystery", 0.35, 0.35, 0.2, 0.45, 0.3, 0.2, false, false, false);
}

function scene_change() {
    emitControl("action", 0.72, 0.64, 0.58, 0.55, 0.77, 0.39, true, false, false);
}

function accent() {
    emitControl("action", 0.72, 0.64, 0.58, 0.55, 0.77, 0.39, false, true, false);
}

function reset_phrase() {
    emitControl("action", 0.72, 0.64, 0.58, 0.55, 0.77, 0.39, false, false, true);
}

function events() {
    emitControl("action", 0.72, 0.64, 0.58, 0.55, 0.77, 0.39, true, true, true);
}

function anything() {
    if (messagename === "calm") {
        calm();
    } else if (messagename === "tension") {
        tension();
    } else if (messagename === "action") {
        action();
    } else if (messagename === "chaos") {
        chaos();
    } else if (messagename === "mystery") {
        mystery();
    } else if (messagename === "scene_change") {
        scene_change();
    } else if (messagename === "accent") {
        accent();
    } else if (messagename === "reset_phrase") {
        reset_phrase();
    } else if (messagename === "events") {
        events();
    } else {
        outlet(1, "log", "warn", "ignored_message", String(messagename));
    }
}

function emitControl(stateName, energy, density, tensionValue, brightness, activity, variation, sceneChange, accentEvent, resetPhrase) {
    var payload = {
        schema: "SFS_MUSICAL_CONTROL",
        version: "0.1.0",
        timestamp_ms: 0,
        state: {
            name: stateName,
            confidence: 1,
            changed: stateName !== "calm",
            previous: stateName === "calm" ? null : "calm"
        },
        controls: {
            energy: energy,
            density: density,
            tension: tensionValue,
            brightness: brightness,
            activity: activity,
            variation: variation
        },
        events: {
            scene_change: !!sceneChange,
            accent: !!accentEvent,
            reset_phrase: !!resetPhrase
        }
    };

    if (!outputDict) {
        outputDict = new Dict(dictName);
    }
    replaceDictionaryFromJson(outputDict, payload);
    outlet(0, "dictionary", dictName);
    outlet(1, "log", "info", "control", stateName);
}

function replaceDictionaryFromJson(dict, payload) {
    var json = JSON.stringify(payload);
    dict.clear();
    if (typeof dict.parse === "function") {
        dict.parse(json);
        return;
    }
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
