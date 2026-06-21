autowatch = 1;
inlets = 1;
outlets = 2;

var verboseOutput = 1;

function verbose(value) {
    verboseOutput = Number(value) !== 0;
}

function dictionary(name) {
    validate(String(name));
}

function anything() {
    var args = arrayfromargs(arguments);
    if ((messagename === "sfs.music.control" || messagename === "dict") && args.length > 0) {
        validate(String(args[0]));
    }
}

function validate(name) {
    var dict;
    var errors = [];

    try {
        dict = new Dict(name);
    } catch (error) {
        errors.push("cannot open dictionary " + name);
        emit(errors, name);
        return;
    }

    requireEqual(dict, "schema", "SFS_MUSICAL_CONTROL", errors);
    requireString(dict, "version", errors);
    requireIntegerRange(dict, "timestamp_ms", 0, null, errors);
    requireString(dict, "state::name", errors);
    requireNumberRange(dict, "state::confidence", 0, 1, errors);
    requireBoolean(dict, "state::changed", errors);
    requireOptionalString(dict, "state::previous", errors);
    requireNumberRange(dict, "controls::energy", 0, 1, errors);
    requireNumberRange(dict, "controls::density", 0, 1, errors);
    requireNumberRange(dict, "controls::tension", 0, 1, errors);
    requireNumberRange(dict, "controls::brightness", 0, 1, errors);
    requireNumberRange(dict, "controls::activity", 0, 1, errors);
    requireNumberRange(dict, "controls::variation", 0, 1, errors);
    requireBoolean(dict, "events::scene_change", errors);
    requireBoolean(dict, "events::accent", errors);
    requireBoolean(dict, "events::reset_phrase", errors);

    emit(errors, name);

    if (errors.length === 0) {
        outlet(1, "dictionary", name);
    }
}

function emit(errors, name) {
    if (errors.length === 0) {
        outlet(0, "valid", 1);
        if (verboseOutput) {
            post("SFS_MUSICAL_CONTROL valid: " + name + "\n");
        }
    } else {
        outlet(0, "valid", 0, errors.join("; "));
        if (verboseOutput) {
            post("SFS_MUSICAL_CONTROL invalid: " + errors.join("; ") + "\n");
        }
    }
}

function requireEqual(dict, key, expected, errors) {
    var value = read(dict, key);
    if (value !== expected) {
        errors.push(key + " must be " + expected);
    }
}

function requireString(dict, key, errors) {
    var value = read(dict, key);
    if (typeof value !== "string" || value.length === 0) {
        errors.push(key + " must be a string");
    }
}

function requireOptionalString(dict, key, errors) {
    var value = read(dict, key);
    if (value === null || value === undefined) {
        return;
    }
    if (typeof value !== "string") {
        errors.push(key + " must be string or null");
    }
}

function requireNumberRange(dict, key, min, max, errors) {
    var value = Number(read(dict, key));
    if (!isFinite(value)) {
        errors.push(key + " must be a number");
        return;
    }
    if (min !== null && value < min) {
        errors.push(key + " must be >= " + min);
    }
    if (max !== null && value > max) {
        errors.push(key + " must be <= " + max);
    }
}

function requireIntegerRange(dict, key, min, max, errors) {
    var value = Number(read(dict, key));
    if (!isFinite(value) || Math.floor(value) !== value) {
        errors.push(key + " must be an integer");
        return;
    }
    if (min !== null && value < min) {
        errors.push(key + " must be >= " + min);
    }
    if (max !== null && value > max) {
        errors.push(key + " must be <= " + max);
    }
}

function requireBoolean(dict, key, errors) {
    var value = read(dict, key);
    if (typeof value === "boolean") {
        return;
    }
    if (value === 0 || value === 1) {
        return;
    }
    errors.push(key + " must be boolean");
}

function read(dict, key) {
    try {
        return dict.get(key);
    } catch (error) {
        return undefined;
    }
}
