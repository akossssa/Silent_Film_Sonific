autowatch = 1;
inlets = 1;
outlets = 2;

var autoStep = 1;
var stepCount = 1;

function dictionary(name) {
    forward(String(name));
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

    if ((messagename === "dict" || messagename === "sfs.music.control") && args.length > 0) {
        forward(String(args[0]));
        return;
    }

    outlet(1, "log", "warn", "ignored_message", "ignored " + String(messagename));
}

function forward(name) {
    outlet(0, "dictionary", name);
    if (autoStep) {
        outlet(0, "step", stepCount);
    }
    outlet(1, "log", "info", "layer_c_step", "queued " + name + " and stepped " + stepCount);
}
