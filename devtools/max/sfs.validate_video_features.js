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
    if ((messagename === "sfs.video.features" || messagename === "dict") && args.length > 0) {
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

    requireEqual(dict, "schema", "SFS_VIDEO_FEATURES", errors);
    requireString(dict, "version", errors);
    requireIntegerRange(dict, "timestamp_ms", 0, null, errors);
    requireEnum(dict, "source::type", ["movie", "camera", "stream", "matrix", "texture", "unknown"], errors);
    requireOptionalString(dict, "source::name", errors);
    requireOptionalIntegerRange(dict, "source::frame", 0, null, errors);
    requireOptionalNumberRange(dict, "source::fps", 0.000001, null, errors);
    requireNumberRange(dict, "features::motion", 0, 1, errors);
    requireNumberRange(dict, "features::brightness", 0, 1, errors);
    requireNumberRange(dict, "features::contrast", 0, 1, errors);
    requireBoolean(dict, "features::cut", errors);
    requireNumberRange(dict, "features::cut_strength", 0, 1, errors);

    emit(errors, name);

    if (errors.length === 0) {
        outlet(1, "dictionary", name);
    }
}

function emit(errors, name) {
    if (errors.length === 0) {
        outlet(0, "valid", 1);
        if (verboseOutput) {
            post("SFS_VIDEO_FEATURES valid: " + name + "\n");
        }
    } else {
        outlet(0, "valid", 0, errors.join("; "));
        if (verboseOutput) {
            post("SFS_VIDEO_FEATURES invalid: " + errors.join("; ") + "\n");
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

function requireEnum(dict, key, allowed, errors) {
    var value = read(dict, key);
    for (var i = 0; i < allowed.length; i += 1) {
        if (value === allowed[i]) {
            return;
        }
    }
    errors.push(key + " must be one of " + allowed.join(","));
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

function requireOptionalNumberRange(dict, key, min, max, errors) {
    var raw = read(dict, key);
    if (raw === null || raw === undefined) {
        return;
    }
    var value = Number(raw);
    if (!isFinite(value)) {
        errors.push(key + " must be a number or null");
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

function requireOptionalIntegerRange(dict, key, min, max, errors) {
    var raw = read(dict, key);
    if (raw === null || raw === undefined) {
        return;
    }
    var value = Number(raw);
    if (!isFinite(value) || Math.floor(value) !== value) {
        errors.push(key + " must be an integer or null");
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
