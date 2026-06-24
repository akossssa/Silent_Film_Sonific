autowatch = 1;
inlets = 1;
outlets = 6;

var VERSION = "0.1.0";
var USER_CONFIG_SCHEMA = "SFS_USER_CONFIG";
var MUSICAL_CONTROL_SCHEMA = "SFS_MUSICAL_CONTROL";
var CONDUCTOR_SCHEMA = "SFS_CONDUCTOR_CONTEXT";
var HARMONY_SCHEMA = "SFS_HARMONY_CONTEXT";
var NOTE_EVENT_SCHEMA = "SFS_NOTE_EVENT";
var MIDI_EVENT_SCHEMA = "SFS_MIDI_EVENT";
var SCALE_REGISTRY_SCHEMA = "SFS_SCALE_REGISTRY";
var DEFAULT_CONFIG_PATH = "data/music/SFS_USER_CONFIG.deterministic_midi.default.v0.1.0.json";
var SCALE_REGISTRY_PATH = "data/music/SFS_SCALE_REGISTRY.deterministic_midi.v0.1.0.json";
var ZERO_SEED_REPLACEMENT = 0x6D2B79F5;
var UINT32_SIZE = 4294967296;
var MVP_STATES = ["calm", "tension", "action", "chaos"];
var SCALE_NAMES = ["major", "natural_minor", "dorian", "phrygian", "whole_tone", "chromatic", "cluster"];
var DEFERRED_CONFIG_FIELDS = [
    "rhythm.rhythm_complexity",
    "rhythm.syncopation",
    "rhythm.polyrhythm_amount",
    "generation.repetition",
    "generation.memory_length"
];

var conductorDictName = "sfs_conductor_context";
var harmonyDictName = "sfs_harmony_context";
var noteEventDictName = "sfs_note_event";
var midiEventDictName = "sfs_midi_event";
var userConfigDictName = "sfs_user_config";
var conductorDict = null;
var harmonyDict = null;
var noteEventDict = null;
var midiEventDict = null;
var userConfigDict = null;
var core = null;

function bang() {
    step();
}

function step(count) {
    var steps = integerValue(count, 1);
    var result;
    var i;

    steps = clampInteger(steps, 1, 1024);
    for (i = 0; i < steps; i += 1) {
        result = core.step();
        emitStepResult(result);
    }
}

function reset() {
    var result = core.fullReset();
    emitDiagnostics(result.diagnostics);
}

function start() {
    core.start();
    emitDiagnostic("info", "start", "Layer C transport started");
}

function stop() {
    emitMidiResult(core.stop("stop", null));
    emitDiagnostic("info", "stop", "Layer C transport stopped");
}

function panic() {
    emitMidiResult(core.panic("user_panic", null));
}

function dictionary(name) {
    musical_control(name);
}

function musical_control(name, targetTick) {
    var payload;
    var result;

    try {
        payload = readMusicalControlDict(String(name));
    } catch (error) {
        emitDiagnostic("error", "dictionary_read_failed", "could not read musical-control dictionary " + name);
        return;
    }

    result = core.enqueueMusicalControl(payload, optionalInteger(targetTick));
    emitDiagnostics(result.diagnostics);
}

function config(name, targetTick) {
    var payload;
    var result;

    try {
        payload = readUserConfigDict(String(name));
    } catch (error) {
        emitDiagnostic("error", "dictionary_read_failed", "could not read user-config dictionary " + name);
        return;
    }

    result = core.enqueueConfig(payload, optionalInteger(targetTick));
    emitDiagnostics(result.diagnostics);
}

function param(path, value) {
    var configPayload = clone(core.currentConfig);
    setPath(configPayload, String(path), parseParameterValue(value));
    emitDiagnostics(core.enqueueConfig(configPayload, core.nextTargetTick()).diagnostics);
}

function reset_to_defaults() {
    emitDiagnostics(core.enqueueConfig(core.defaultConfig, core.nextTargetTick()).diagnostics);
    publish_config();
}

function publish_config() {
    writeUserConfig(core.currentConfig);
    outlet(5, "dictionary", userConfigDictName);
}

function anything() {
    var args = arrayfromargs(arguments);
    if (messagename === "sfs.music.control" && args.length > 0) {
        musical_control(args[0], args.length > 1 ? args[1] : null);
        return;
    }
    if (messagename === "config" && args.length > 0) {
        config(args[0], args.length > 1 ? args[1] : null);
        return;
    }
    if (messagename === "step") {
        step(args.length > 0 ? args[0] : 1);
        return;
    }
    if (messagename === "reset") {
        reset();
        return;
    }
    if (messagename === "start") {
        start();
        return;
    }
    if (messagename === "stop") {
        stop();
        return;
    }
    if (messagename === "panic") {
        panic();
        return;
    }
    if (messagename === "publish_config") {
        publish_config();
        return;
    }
    emitDiagnostic("warn", "ignored_message", String(messagename));
}

function MusicEngineCore(options) {
    options = options || {};
    this.scaleRegistry = options.scaleRegistry || loadJson(SCALE_REGISTRY_PATH);
    this.defaultConfigRaw = options.defaultConfig || loadJson(DEFAULT_CONFIG_PATH);
    this.diagnostics = [];
    this.pending = [];
    this.inputSequence = 0;
    this.stepping = false;
    this.running = true;

    assertNoErrors(validateScaleRegistry(this.scaleRegistry), "invalid scale registry");
    this.defaultConfig = normalizeUserConfig(this.defaultConfigRaw, this.defaultConfigRaw, this.scaleRegistry).payload;
    assertNoErrors(validateUserConfig(this.defaultConfig), "invalid default user configuration");

    this.fullReset(this.defaultConfig);
}

MusicEngineCore.prototype.fullReset = function (config) {
    var normalized;
    var diagnostics = [];

    if (config) {
        normalized = normalizeUserConfig(config, this.defaultConfigRaw, this.scaleRegistry);
        diagnostics = diagnostics.concat(normalized.diagnostics);
        if (normalized.valid) {
            this.currentConfig = normalized.payload;
        }
    }

    if (!this.currentConfig) {
        this.currentConfig = clone(this.defaultConfig);
    }

    this.tickIndex = 0;
    this.logicalTimeUs = 0;
    this.stateAgeTicks = 0;
    this.phraseTick = 0;
    this.noteEventIndex = 0;
    this.currentControl = defaultMusicalControl();
    this.currentControlSequence = null;
    this.currentConfigSequence = null;
    this.activeState = "calm";
    this.activeSourceState = "calm";
    this.stateFallbackApplied = false;
    this.lastUnsupportedSourceState = null;
    this.smoothedTempo = null;
    this.lastTempo = this.currentConfig.rhythm.tempo_min;
    this.pending = [];
    this.prng = {
        conductor: new XorShift32(deriveModuleSeed(this.currentConfig.reproducibility.random_seed, "conductor")),
        harmony: new XorShift32(deriveModuleSeed(this.currentConfig.reproducibility.random_seed, "harmony")),
        rhythm: new XorShift32(deriveModuleSeed(this.currentConfig.reproducibility.random_seed, "rhythm"))
    };
    this.harmonyMemory = {};
    this.midi = new MidiLifecycle();
    this.running = true;
    diagnostics.push(makeDiagnostic("info", "full_reset", "Layer C core reset"));
    return { diagnostics: diagnostics };
};

MusicEngineCore.prototype.start = function () {
    this.running = true;
};

MusicEngineCore.prototype.stop = function (reason, inputSequence) {
    this.running = false;
    return this.midi.panic(this.tickIndex, floorInteger(this.logicalTimeUs / 1000), reason || "stop", inputSequence);
};

MusicEngineCore.prototype.panic = function (reason, inputSequence) {
    return this.midi.panic(this.tickIndex, floorInteger(this.logicalTimeUs / 1000), reason || "user_panic", inputSequence);
};

MusicEngineCore.prototype.nextTargetTick = function () {
    return this.stepping ? this.tickIndex + 1 : this.tickIndex;
};

MusicEngineCore.prototype.enqueueConfig = function (payload, targetTick) {
    var diagnostics = [];
    var normalized;
    var sequence = this.inputSequence;

    this.inputSequence += 1;
    targetTick = targetTick === null || targetTick === undefined ? this.nextTargetTick() : integerValue(targetTick, this.nextTargetTick());

    if (!payload || payload.schema !== USER_CONFIG_SCHEMA || payload.version !== VERSION) {
        diagnostics.push(makeDiagnostic("error", "schema_error", "SFS_USER_CONFIG requires schema SFS_USER_CONFIG and version 0.1.0", sequence, targetTick));
        return { accepted: false, diagnostics: diagnostics };
    }

    if (hasDeferredConfigField(payload)) {
        diagnostics.push(makeDiagnostic("error", "schema_error", "SFS_USER_CONFIG v0.1.0 rejects deferred fields", sequence, targetTick));
        return { accepted: false, diagnostics: diagnostics };
    }

    normalized = normalizeUserConfig(payload, this.defaultConfigRaw, this.scaleRegistry);
    diagnostics = diagnostics.concat(addEnvelopeToDiagnostics(normalized.diagnostics, sequence, targetTick));

    if (!normalized.valid) {
        diagnostics.push(makeDiagnostic("error", "schema_error", "normalized SFS_USER_CONFIG failed validation", sequence, targetTick));
        return { accepted: false, diagnostics: diagnostics };
    }

    this.pending.push({
        input_sequence: sequence,
        target_tick: Math.max(0, targetTick),
        kind: "config",
        payload: normalized.payload
    });

    diagnostics.push(makeDiagnostic("info", "config_queued", "configuration queued", sequence, targetTick));
    return { accepted: true, input_sequence: sequence, target_tick: targetTick, diagnostics: diagnostics };
};

MusicEngineCore.prototype.enqueueMusicalControl = function (payload, targetTick) {
    var diagnostics = [];
    var errors;
    var sequence = this.inputSequence;

    this.inputSequence += 1;
    targetTick = targetTick === null || targetTick === undefined ? this.nextTargetTick() : integerValue(targetTick, this.nextTargetTick());
    errors = validateMusicalControl(payload);

    if (errors.length > 0) {
        diagnostics.push(makeDiagnostic("error", "schema_error", "invalid SFS_MUSICAL_CONTROL: " + errors.join("; "), sequence, targetTick));
        return { accepted: false, diagnostics: diagnostics };
    }

    this.pending.push({
        input_sequence: sequence,
        target_tick: Math.max(0, targetTick),
        kind: "musical_control",
        payload: clone(payload)
    });

    diagnostics.push(makeDiagnostic("info", "musical_control_queued", "musical control queued", sequence, targetTick));
    return { accepted: true, input_sequence: sequence, target_tick: targetTick, diagnostics: diagnostics };
};

MusicEngineCore.prototype.step = function () {
    var diagnostics = [];
    var eligible;
    var selected;
    var eventCounts;
    var resolved;
    var stateChanged;
    var tempoBpm;
    var tickDurationUs;
    var timestampMs;
    var conductor;
    var harmony;
    var notes;
    var midiResult;

    if (this.stepping) {
        diagnostics.push(makeDiagnostic("warn", "step_reentrant", "reentrant step ignored for active tick"));
        return emptyStepResult(diagnostics);
    }

    if (!this.running) {
        diagnostics.push(makeDiagnostic("info", "step_stopped", "transport is stopped"));
        return emptyStepResult(diagnostics);
    }

    this.stepping = true;
    eligible = this.snapshotEligibleInputs();
    selected = selectTickInputs(eligible);
    eventCounts = countEvents(eligible);
    diagnostics = diagnostics.concat(makeEventDiagnostics(eligible, this.tickIndex));

    if (selected.config) {
        this.currentConfig = selected.config.payload;
        this.currentConfigSequence = selected.config.input_sequence;
    }

    if (selected.musicalControl) {
        this.currentControl = selected.musicalControl.payload;
        this.currentControlSequence = selected.musicalControl.input_sequence;
    }

    resolved = resolveState(this.currentControl.state.name);
    if (resolved.fallback_applied && this.lastUnsupportedSourceState !== resolved.source_state) {
        diagnostics.push(makeDiagnostic("warn", "unsupported_state_fallback", "unsupported source state " + resolved.source_state + " resolved to calm", this.currentControlSequence, this.tickIndex));
        this.lastUnsupportedSourceState = resolved.source_state;
    } else if (!resolved.fallback_applied) {
        this.lastUnsupportedSourceState = null;
    }

    stateChanged = resolved.state !== this.activeState;
    if (stateChanged) {
        this.activeState = resolved.state;
        this.stateAgeTicks = 0;
    }
    this.activeSourceState = resolved.source_state;
    this.stateFallbackApplied = resolved.fallback_applied;

    if (eventCounts.reset_phrase > 0) {
        this.phraseTick = 0;
    }

    tempoBpm = this.calculateTempo(resolved.state, eventCounts, stateChanged);
    tickDurationUs = tempoToTickDurationUs(tempoBpm, 4);
    timestampMs = floorInteger(this.logicalTimeUs / 1000);
    conductor = this.makeConductorContext(timestampMs, tickDurationUs, tempoBpm, eventCounts, stateChanged || eventCounts.scene_change > 0);
    harmony = generateHarmony(conductor, this.scaleRegistry, this.prng.harmony, this.harmonyMemory);
    notes = generateNotes(conductor, harmony, this.prng.rhythm, this);
    midiResult = this.midi.processTick(conductor, notes, eventCounts.reset_phrase > 0);

    diagnostics = diagnostics.concat(validateGenerated(conductor, harmony, notes, midiResult.events));
    diagnostics.push(makeDiagnostic("info", "tick_complete", "Layer C tick complete", null, this.tickIndex));

    this.logicalTimeUs += tickDurationUs;
    this.tickIndex += 1;
    this.stateAgeTicks += 1;
    this.phraseTick += 1;
    this.stepping = false;

    return {
        conductor: conductor,
        harmony: harmony,
        notes: notes,
        midi_events: midiResult.events,
        raw_midi: midiResult.raw,
        diagnostics: diagnostics
    };
};

MusicEngineCore.prototype.snapshotEligibleInputs = function () {
    var eligible = [];
    var pending = [];
    var i;

    for (i = 0; i < this.pending.length; i += 1) {
        if (this.pending[i].target_tick <= this.tickIndex) {
            eligible.push(this.pending[i]);
        } else {
            pending.push(this.pending[i]);
        }
    }

    this.pending = pending;
    eligible.sort(compareInputSequence);
    return eligible;
};

MusicEngineCore.prototype.calculateTempo = function (state, eventCounts, stateChanged) {
    var config = this.currentConfig;
    var controls = this.currentControl.controls;
    var range = config.rhythm.tempo_max - config.rhythm.tempo_min;
    var stateBase = {
        calm: 0.14,
        tension: 0.38,
        action: 0.70,
        chaos: 0.92
    }[state] || 0.14;
    var targetLevel = clamp((stateBase * 0.55) + (controls.energy * 0.30) + (controls.activity * 0.15), 0, 1);
    var targetTempo = round6(config.rhythm.tempo_min + (range * targetLevel));
    var shouldJump = this.smoothedTempo === null || stateChanged || eventCounts.scene_change > 0 || eventCounts.reset_phrase > 0 || range === 0;

    if (shouldJump) {
        this.smoothedTempo = targetTempo;
    } else {
        this.smoothedTempo = round6((this.smoothedTempo * 0.85) + (targetTempo * 0.15));
    }

    this.smoothedTempo = clamp(this.smoothedTempo, config.rhythm.tempo_min, config.rhythm.tempo_max);
    return this.smoothedTempo;
};

MusicEngineCore.prototype.makeConductorContext = function (timestampMs, tickDurationUs, tempoBpm, eventCounts, transition) {
    var config = this.currentConfig;
    var controls = this.currentControl.controls;
    var section = calculateSection(this.stateAgeTicks, 4, config.structure.sections_enabled);

    return {
        schema: CONDUCTOR_SCHEMA,
        version: VERSION,
        timestamp_ms: timestampMs,
        transport: {
            tick_index: this.tickIndex,
            logical_time_us: this.logicalTimeUs,
            tick_duration_us: tickDurationUs,
            beat: (floorInteger(this.tickIndex / 4) % 4) + 1,
            bar: floorInteger(this.tickIndex / 16) + 1,
            subdivision: 4,
            phrase_tick: this.phraseTick,
            state_age_ticks: this.stateAgeTicks,
            section_tick: section.section_tick
        },
        source_state: this.activeSourceState,
        state: this.activeState,
        state_fallback_applied: this.stateFallbackApplied,
        section: section.section,
        sections_enabled: config.structure.sections_enabled,
        section_progress: section.section_progress,
        tempo_bpm: tempoBpm,
        energy: round6(controls.energy),
        density: round6(controls.density),
        tension: round6(controls.tension),
        brightness: round6(controls.brightness),
        activity: round6(controls.activity),
        control_variation: round6(controls.variation),
        variation_amount: round6(config.generation.variation_amount),
        effective_variation: round6(clamp(controls.variation * config.generation.variation_amount, 0, 1)),
        transition: !!transition,
        accent: eventCounts.accent > 0,
        reset_phrase: eventCounts.reset_phrase > 0,
        event_counts: {
            scene_change: eventCounts.scene_change,
            accent: eventCounts.accent,
            reset_phrase: eventCounts.reset_phrase
        },
        root_pitch_class: config.musical_identity.root_pitch_class,
        scale_name: config.musical_identity.scale_name,
        harmonic_risk: round6(config.musical_identity.harmonic_risk),
        dissonance_bias: round6(config.musical_identity.dissonance_bias),
        randomness: round6(config.generation.randomness),
        mutation_rate: round6(config.generation.mutation_rate),
        density_min: round6(config.density.density_min),
        density_max: round6(config.density.density_max),
        max_polyphony: config.density.max_polyphony,
        midi_channel: config.midi.midi_channel,
        velocity_min: config.midi.velocity_min,
        velocity_max: config.midi.velocity_max,
        octave_min: config.midi.octave_min,
        octave_max: config.midi.octave_max,
        deterministic_mode: config.reproducibility.deterministic_mode,
        seed: config.reproducibility.random_seed,
        config_sequence: this.currentConfigSequence,
        control_sequence: this.currentControlSequence
    };
};

function MidiLifecycle() {
    this.reset();
}

MidiLifecycle.prototype.reset = function () {
    this.active = {};
    this.acceptedEventIndexes = {};
    this.midiEventIndex = 0;
    this.usedChannels = {};
};

MidiLifecycle.prototype.processTick = function (context, noteEvents, flushRequested) {
    var output = { events: [], raw: [], diagnostics: [] };
    var tick = context.transport.tick_index;
    var timestampMs = context.timestamp_ms;

    this.releaseDue(tick, timestampMs, output);

    if (flushRequested) {
        this.flush(tick, timestampMs, "reset_phrase", null, output);
    }

    noteEvents.sort(compareNoteEventIndex);
    for (var i = 0; i < noteEvents.length; i += 1) {
        this.acceptNote(context, noteEvents[i], output);
    }

    return output;
};

MidiLifecycle.prototype.acceptNote = function (context, noteEvent, output) {
    var errors = validateNoteEvent(noteEvent);
    var samePitch;
    var oldest;

    if (noteEvent.tick_index !== context.transport.tick_index) {
        errors.push("note tick must match active transaction");
    }
    if (noteEvent.note_id !== "note:" + noteEvent.event_index) {
        errors.push("note_id must equal note:<event_index>");
    }
    if (this.acceptedEventIndexes[noteEvent.event_index]) {
        errors.push("event_index already accepted");
    }
    if (this.active[noteEvent.note_id]) {
        errors.push("note_id already active");
    }
    if (errors.length > 0) {
        output.diagnostics.push(makeDiagnostic("error", "note_event_rejected", errors.join("; "), null, context.transport.tick_index));
        return;
    }

    samePitch = this.findSamePitch(noteEvent.pitch, noteEvent.channel);
    for (var i = 0; i < samePitch.length; i += 1) {
        this.releaseVoice(samePitch[i], context.transport.tick_index, context.timestamp_ms, "retrigger", output);
    }

    if (this.activeVoiceCount() >= context.max_polyphony) {
        oldest = this.oldestVoice();
        if (oldest) {
            this.emitLifecycle({
                timestamp_ms: context.timestamp_ms,
                tick_index: context.transport.tick_index,
                source_event_index: noteEvent.event_index,
                input_sequence: context.control_sequence,
                type: "voice_steal",
                reason: "voice_steal",
                active_voice_count: this.activeVoiceCount(),
                note_id: oldest.note_id,
                replacement_note_id: noteEvent.note_id,
                pitch: oldest.pitch,
                channel: oldest.channel
            }, output);
            this.releaseVoice(oldest, context.transport.tick_index, context.timestamp_ms, "voice_steal", output);
        }
    }

    this.active[noteEvent.note_id] = {
        note_id: noteEvent.note_id,
        pitch: noteEvent.pitch,
        channel: noteEvent.channel,
        note_on_event_index: noteEvent.event_index,
        scheduled_off_tick: noteEvent.tick_index + noteEvent.duration_ticks
    };
    this.acceptedEventIndexes[noteEvent.event_index] = true;
    this.usedChannels[noteEvent.channel] = true;
    this.emitLifecycle({
        timestamp_ms: context.timestamp_ms,
        tick_index: context.transport.tick_index,
        source_event_index: noteEvent.event_index,
        input_sequence: context.control_sequence,
        type: "note_on",
        reason: "generated",
        active_voice_count: this.activeVoiceCount(),
        note_id: noteEvent.note_id,
        pitch: noteEvent.pitch,
        velocity: noteEvent.velocity,
        channel: noteEvent.channel
    }, output);
};

MidiLifecycle.prototype.releaseDue = function (tick, timestampMs, output) {
    var due = [];
    var key;

    for (key in this.active) {
        if (this.active.hasOwnProperty(key) && this.active[key].scheduled_off_tick <= tick) {
            due.push(this.active[key]);
        }
    }
    due.sort(compareVoiceAge);
    for (var i = 0; i < due.length; i += 1) {
        this.releaseVoice(due[i], tick, timestampMs, "duration_elapsed", output);
    }
};

MidiLifecycle.prototype.releaseVoice = function (voice, tick, timestampMs, reason, output) {
    if (!voice || !this.active[voice.note_id]) {
        return;
    }
    delete this.active[voice.note_id];
    this.emitLifecycle({
        timestamp_ms: timestampMs,
        tick_index: tick,
        source_event_index: voice.note_on_event_index,
        input_sequence: null,
        type: "note_off",
        reason: reason,
        active_voice_count: this.activeVoiceCount(),
        note_id: voice.note_id,
        pitch: voice.pitch,
        velocity: 0,
        channel: voice.channel
    }, output);
};

MidiLifecycle.prototype.flush = function (tick, timestampMs, reason, inputSequence, output) {
    var voices = this.sortedVoices();
    var released = [];

    for (var i = 0; i < voices.length; i += 1) {
        released.push(voices[i].note_id);
        this.releaseVoice(voices[i], tick, timestampMs, reason, output);
    }

    this.emitLifecycle({
        timestamp_ms: timestampMs,
        tick_index: tick,
        source_event_index: null,
        input_sequence: inputSequence,
        type: "flush",
        reason: reason,
        active_voice_count: this.activeVoiceCount(),
        released_note_ids: released
    }, output);

    return released;
};

MidiLifecycle.prototype.panic = function (tick, timestampMs, reason, inputSequence) {
    var output = { events: [], raw: [], diagnostics: [] };
    var released = this.flush(tick, timestampMs, reason || "user_panic", inputSequence, output);
    var channels = sortedIntegerKeys(this.usedChannels);
    var i;

    for (i = 0; i < channels.length; i += 1) {
        this.emitLifecycle({
            timestamp_ms: timestampMs,
            tick_index: tick,
            source_event_index: null,
            input_sequence: inputSequence,
            type: "control_change",
            reason: reason || "user_panic",
            active_voice_count: this.activeVoiceCount(),
            channel: channels[i],
            controller: 123,
            value: 0
        }, output);
    }

    this.emitLifecycle({
        timestamp_ms: timestampMs,
        tick_index: tick,
        source_event_index: null,
        input_sequence: inputSequence,
        type: "panic",
        reason: reason || "user_panic",
        active_voice_count: this.activeVoiceCount(),
        released_note_ids: released,
        used_channels: channels
    }, output);
    return output;
};

MidiLifecycle.prototype.emitLifecycle = function (event, output) {
    event.schema = MIDI_EVENT_SCHEMA;
    event.version = VERSION;
    event.midi_event_index = this.midiEventIndex;
    this.midiEventIndex += 1;
    output.events.push(event);

    if (event.type === "note_on") {
        output.raw.push(0x90 + event.channel - 1, event.pitch, event.velocity);
    } else if (event.type === "note_off") {
        output.raw.push(0x80 + event.channel - 1, event.pitch, 0);
    } else if (event.type === "control_change") {
        output.raw.push(0xB0 + event.channel - 1, event.controller, event.value);
    }
};

MidiLifecycle.prototype.findSamePitch = function (pitch, channel) {
    var voices = [];
    var key;

    for (key in this.active) {
        if (this.active.hasOwnProperty(key) && this.active[key].pitch === pitch && this.active[key].channel === channel) {
            voices.push(this.active[key]);
        }
    }
    voices.sort(compareVoiceAge);
    return voices;
};

MidiLifecycle.prototype.oldestVoice = function () {
    var voices = this.sortedVoices();
    return voices.length > 0 ? voices[0] : null;
};

MidiLifecycle.prototype.sortedVoices = function () {
    var voices = [];
    var key;

    for (key in this.active) {
        if (this.active.hasOwnProperty(key)) {
            voices.push(this.active[key]);
        }
    }
    voices.sort(compareVoiceAge);
    return voices;
};

MidiLifecycle.prototype.activeVoiceCount = function () {
    var count = 0;
    var key;
    for (key in this.active) {
        if (this.active.hasOwnProperty(key)) {
            count += 1;
        }
    }
    return count;
};

function generateHarmony(context, scaleRegistry, rng, memory) {
    var scale = scaleRegistry.scales[context.scale_name] || scaleRegistry.scales[scaleRegistry.default_scale_name];
    var intervals = clone(scale.intervals);
    var registerMin = clampInteger(12 * (context.octave_min + 1), 0, 127);
    var registerMax = clampInteger((12 * (context.octave_max + 2)) - 1, 0, 127);
    var basePool = makePitchPool(context.root_pitch_class, intervals, registerMin, registerMax);
    var borrowedPool = [];
    var allowBorrow = context.harmonic_risk > 0 && context.tension > 0;
    var borrowProbability = clamp(context.tension * context.harmonic_risk, 0, 1);
    var borrowedPitchClasses = [];
    var chord;
    var pool;
    var centerPitch = registerMin + ((registerMax - registerMin) * context.brightness);
    var anchor = nearestPitchWithPc(basePool, context.root_pitch_class, centerPitch);
    var shouldBorrow = false;

    if (allowBorrow) {
        shouldBorrow = borrowProbability >= 0.5 || rng.nextFloat() < borrowProbability * context.dissonance_bias;
    }

    if (shouldBorrow) {
        borrowedPool = borrowedPitches(context.root_pitch_class, intervals, registerMin, registerMax, context.tension, context.dissonance_bias);
    }

    pool = uniqueSorted(basePool.concat(borrowedPool));
    if (pool.length === 0) {
        pool = [clampInteger(anchor, 0, 127)];
    }

    chord = chooseChord(context, intervals, basePool, borrowedPool, anchor);
    borrowedPitchClasses = findBorrowedPitchClasses(context.root_pitch_class, intervals, chord.concat(pool));

    return {
        schema: HARMONY_SCHEMA,
        version: VERSION,
        timestamp_ms: context.timestamp_ms,
        tick_index: context.transport.tick_index,
        root_pitch_class: context.root_pitch_class,
        scale_name: context.scale_name,
        scale_intervals: intervals,
        borrowed_pitch_classes: borrowedPitchClasses,
        chord: chord,
        pitch_pool: pool,
        dissonance: calculateDissonance(context.root_pitch_class, intervals, chord),
        register_min: registerMin,
        register_max: registerMax
    };
}

function chooseChord(context, intervals, basePool, borrowedPool, anchor) {
    var chord = [];
    var thirdInterval = intervals.indexOf(3) >= 0 ? 3 : 4;
    var fifthInterval = intervals.indexOf(7) >= 0 ? 7 : intervals[Math.min(3, intervals.length - 1)];
    var root = nearestPitchWithPc(basePool, mod12(context.root_pitch_class), anchor);

    if (context.tension >= 0.68 && borrowedPool.length > 0) {
        chord.push(root);
        chord.push(nearestPitchWithPc(borrowedPool, mod12(context.root_pitch_class + 1), root + 1));
        chord.push(nearestPitchWithPc(borrowedPool, mod12(context.root_pitch_class + 6), root + 6));
        if (context.tension >= 0.88 && context.max_polyphony > 3) {
            chord.push(nearestPitchWithPc(basePool, mod12(context.root_pitch_class + fifthInterval), root + 7));
        }
    } else if (context.tension >= 0.45) {
        chord.push(root);
        chord.push(nearestPitchWithPc(basePool, mod12(context.root_pitch_class + 2), root + 2));
        chord.push(nearestPitchWithPc(basePool, mod12(context.root_pitch_class + fifthInterval), root + 7));
    } else {
        chord.push(root);
        chord.push(nearestPitchWithPc(basePool, mod12(context.root_pitch_class + thirdInterval), root + thirdInterval));
        chord.push(nearestPitchWithPc(basePool, mod12(context.root_pitch_class + fifthInterval), root + fifthInterval));
    }

    return uniqueSorted(chord);
}

function generateNotes(context, harmony, rng, engine) {
    var notes = [];
    var density = context.density_min + (context.density * (context.density_max - context.density_min));
    var stateFactor = { calm: 0.70, tension: 0.90, action: 1.25, chaos: 1.55 }[context.state] || 0.70;
    var stateBasePeriod = { calm: 8, tension: 6, action: 4, chaos: 2 }[context.state] || 8;
    var period = Math.max(1, roundInteger(stateBasePeriod - (density * (stateBasePeriod - 1))));
    var phraseTick = context.transport.phrase_tick;
    var deterministicHit = (phraseTick % period) === 0;
    var extraProbability = clamp((context.randomness * 0.35) + (context.effective_variation * 0.35) + (context.mutation_rate * 0.30), 0, 1);
    var randomHit = rng.nextFloat() < clamp(density * stateFactor * extraProbability, 0, 0.95);
    var voices = 1;
    var isAccent = context.accent || (context.transition && context.event_counts.scene_change > 0);
    var i;

    if (isAccent) {
        appendNote(notes, context, harmony, engine, rng, "accent", 0, true);
    }

    if (deterministicHit || randomHit) {
        if (density * stateFactor > 0.78 && context.max_polyphony >= 2) {
            voices = 2;
        }
        if (density * stateFactor > 1.08 && context.max_polyphony >= 3) {
            voices = 3;
        }
        for (i = 0; i < voices; i += 1) {
            appendNote(notes, context, harmony, engine, rng, i === 0 ? primaryRole(context) : "harmony", i, false);
        }
    }

    return notes;
}

function appendNote(notes, context, harmony, engine, rng, role, voiceIndex, forceAccent) {
    var index = engine.noteEventIndex;
    var pitch = selectPitch(context, harmony, rng, role, voiceIndex);
    var velocity = selectVelocity(context, rng, forceAccent);
    var durationTicks = selectDurationTicks(context, role);
    var note = {
        schema: NOTE_EVENT_SCHEMA,
        version: VERSION,
        timestamp_ms: context.timestamp_ms,
        tick_index: context.transport.tick_index,
        event_index: index,
        note_id: "note:" + index,
        pitch: pitch,
        velocity: velocity,
        duration_ticks: durationTicks,
        duration_ms: Math.max(1, floorInteger((durationTicks * context.transport.tick_duration_us) / 1000 + 0.5)),
        channel: context.midi_channel,
        role: role
    };

    engine.noteEventIndex += 1;
    notes.push(note);
}

function selectPitch(context, harmony, rng, role, voiceIndex) {
    var pool = harmony.pitch_pool;
    var chord = harmony.chord;
    var focus = clamp(context.brightness, 0, 1);
    var variationWidth = floorInteger((pool.length - 1) * clamp((context.randomness + context.effective_variation + context.mutation_rate) / 3, 0, 1) * 0.25);
    var centerIndex = clampInteger(roundInteger((pool.length - 1) * focus), 0, pool.length - 1);
    var offset = 0;
    var index;

    if (role === "bass") {
        centerIndex = clampInteger(roundInteger((pool.length - 1) * Math.min(focus, 0.25)), 0, pool.length - 1);
    } else if (role === "accent") {
        centerIndex = clampInteger(roundInteger((pool.length - 1) * Math.max(focus, 0.75)), 0, pool.length - 1);
    } else if (role === "harmony" && chord.length > 0) {
        return chord[voiceIndex % chord.length];
    }

    if (variationWidth > 0) {
        offset = roundInteger((rng.nextFloat() * 2 - 1) * variationWidth);
    }
    index = clampInteger(centerIndex + offset + voiceIndex, 0, pool.length - 1);
    return pool[index];
}

function selectVelocity(context, rng, forceAccent) {
    var min = context.velocity_min;
    var max = context.velocity_max;
    var range = max - min;
    var base = min + (range * clamp((context.energy * 0.72) + (context.activity * 0.18) + (context.tension * 0.10), 0, 1));
    var jitter = 0;

    if (context.randomness > 0) {
        jitter = roundInteger((rng.nextFloat() - 0.5) * context.randomness * 18);
    }
    if (forceAccent) {
        base += Math.max(10, range * 0.18);
    }

    return clampInteger(roundInteger(base + jitter), min, max);
}

function selectDurationTicks(context, role) {
    if (role === "accent") {
        return context.state === "chaos" ? 1 : 2;
    }
    if (context.state === "calm") {
        return 4;
    }
    if (context.state === "chaos") {
        return context.density > 0.75 ? 1 : 2;
    }
    return 2;
}

function primaryRole(context) {
    if (context.state === "calm") {
        return "texture";
    }
    if (context.state === "tension") {
        return "pulse";
    }
    if (context.state === "action") {
        return "pulse";
    }
    return "pulse";
}

function normalizeUserConfig(payload, defaults, scaleRegistry) {
    var normalized = clone(defaults);
    var diagnostics = [];
    var t;
    var d;
    var v;
    var o;
    var errors;

    if (!payload || typeof payload !== "object") {
        payload = {};
        diagnostics.push(makeDiagnostic("warn", "config_normalized", "configuration payload was not an object"));
    }

    normalized.schema = USER_CONFIG_SCHEMA;
    normalized.version = VERSION;
    normalized.preset_name = readString(payload, "preset_name", defaults.preset_name);
    normalized.reproducibility.deterministic_mode = readBoolean(payload, "reproducibility.deterministic_mode", defaults.reproducibility.deterministic_mode);
    normalized.reproducibility.random_seed = clampInteger(readInteger(payload, "reproducibility.random_seed", defaults.reproducibility.random_seed), 0, 2147483647);
    normalized.musical_identity.root_pitch_class = clampInteger(readInteger(payload, "musical_identity.root_pitch_class", defaults.musical_identity.root_pitch_class), 0, 11);
    normalized.musical_identity.scale_name = readScaleName(payload, "musical_identity.scale_name", defaults.musical_identity.scale_name, scaleRegistry);
    normalized.musical_identity.harmonic_risk = clamp(readNumber(payload, "musical_identity.harmonic_risk", defaults.musical_identity.harmonic_risk), 0, 1);
    normalized.musical_identity.dissonance_bias = clamp(readNumber(payload, "musical_identity.dissonance_bias", defaults.musical_identity.dissonance_bias), 0, 1);
    normalized.rhythm.tempo_min = clamp(readNumber(payload, "rhythm.tempo_min", defaults.rhythm.tempo_min), 20, 300);
    normalized.rhythm.tempo_max = clamp(readNumber(payload, "rhythm.tempo_max", defaults.rhythm.tempo_max), 20, 300);
    normalized.generation.randomness = clamp(readNumber(payload, "generation.randomness", defaults.generation.randomness), 0, 1);
    normalized.generation.variation_amount = clamp(readNumber(payload, "generation.variation_amount", defaults.generation.variation_amount), 0, 1);
    normalized.generation.mutation_rate = clamp(readNumber(payload, "generation.mutation_rate", defaults.generation.mutation_rate), 0, 1);
    normalized.structure.sections_enabled = readBoolean(payload, "structure.sections_enabled", defaults.structure.sections_enabled);
    normalized.density.density_min = clamp(readNumber(payload, "density.density_min", defaults.density.density_min), 0, 1);
    normalized.density.density_max = clamp(readNumber(payload, "density.density_max", defaults.density.density_max), 0, 1);
    normalized.density.max_polyphony = clampInteger(readInteger(payload, "density.max_polyphony", defaults.density.max_polyphony), 1, 64);
    normalized.midi.midi_channel = clampInteger(readInteger(payload, "midi.midi_channel", defaults.midi.midi_channel), 1, 16);
    normalized.midi.velocity_min = clampInteger(readInteger(payload, "midi.velocity_min", defaults.midi.velocity_min), 1, 127);
    normalized.midi.velocity_max = clampInteger(readInteger(payload, "midi.velocity_max", defaults.midi.velocity_max), 1, 127);
    normalized.midi.octave_min = clampInteger(readInteger(payload, "midi.octave_min", defaults.midi.octave_min), -1, 9);
    normalized.midi.octave_max = clampInteger(readInteger(payload, "midi.octave_max", defaults.midi.octave_max), -1, 9);

    t = sortPair(normalized.rhythm.tempo_min, normalized.rhythm.tempo_max);
    normalized.rhythm.tempo_min = t[0];
    normalized.rhythm.tempo_max = t[1];
    d = sortPair(normalized.density.density_min, normalized.density.density_max);
    normalized.density.density_min = d[0];
    normalized.density.density_max = d[1];
    v = sortPair(normalized.midi.velocity_min, normalized.midi.velocity_max);
    normalized.midi.velocity_min = v[0];
    normalized.midi.velocity_max = v[1];
    o = sortPair(normalized.midi.octave_min, normalized.midi.octave_max);
    normalized.midi.octave_min = o[0];
    normalized.midi.octave_max = o[1];

    errors = validateUserConfig(normalized);
    return {
        valid: errors.length === 0,
        payload: normalized,
        diagnostics: diagnostics.concat(errorsToDiagnostics(errors, "schema_error"))
    };
}

function validateScaleRegistry(payload) {
    var errors = [];
    var name;
    var intervals;

    if (!payload || typeof payload !== "object") {
        return ["scale registry must be an object"];
    }
    requireEqual(payload.schema, SCALE_REGISTRY_SCHEMA, "schema", errors);
    requireEqual(payload.version, VERSION, "version", errors);
    requireEqual(payload.interval_unit, "semitones", "interval_unit", errors);
    requireEqual(payload.octave_size, 12, "octave_size", errors);
    requireEqual(payload.default_scale_name, "natural_minor", "default_scale_name", errors);
    requireArrayExact(payload.scale_order, SCALE_NAMES, "scale_order", errors);
    if (!payload.scales || typeof payload.scales !== "object") {
        errors.push("scales must be an object");
        return errors;
    }
    for (var i = 0; i < SCALE_NAMES.length; i += 1) {
        name = SCALE_NAMES[i];
        if (!payload.scales[name]) {
            errors.push("scales." + name + " is required");
            continue;
        }
        intervals = payload.scales[name].intervals;
        requireString(payload.scales[name].display_name, "scales." + name + ".display_name", errors);
        requireString(payload.scales[name].description, "scales." + name + ".description", errors);
        validateIntervals(intervals, "scales." + name + ".intervals", errors);
    }
    return errors;
}

function validateUserConfig(payload) {
    var errors = [];

    if (!payload || typeof payload !== "object") {
        return ["SFS_USER_CONFIG must be an object"];
    }
    requireEqual(payload.schema, USER_CONFIG_SCHEMA, "schema", errors);
    requireEqual(payload.version, VERSION, "version", errors);
    requireString(payload.preset_name, "preset_name", errors);
    requireBoolean(payload.reproducibility && payload.reproducibility.deterministic_mode, "reproducibility.deterministic_mode", errors);
    requireIntegerRange(payload.reproducibility && payload.reproducibility.random_seed, 0, 2147483647, "reproducibility.random_seed", errors);
    requireIntegerRange(payload.musical_identity && payload.musical_identity.root_pitch_class, 0, 11, "musical_identity.root_pitch_class", errors);
    requireEnum(payload.musical_identity && payload.musical_identity.scale_name, SCALE_NAMES, "musical_identity.scale_name", errors);
    requireNumberRange(payload.musical_identity && payload.musical_identity.harmonic_risk, 0, 1, "musical_identity.harmonic_risk", errors);
    requireNumberRange(payload.musical_identity && payload.musical_identity.dissonance_bias, 0, 1, "musical_identity.dissonance_bias", errors);
    requireNumberRange(payload.rhythm && payload.rhythm.tempo_min, 20, 300, "rhythm.tempo_min", errors);
    requireNumberRange(payload.rhythm && payload.rhythm.tempo_max, 20, 300, "rhythm.tempo_max", errors);
    rejectProperty(payload.rhythm, "rhythm_complexity", "rhythm.rhythm_complexity", errors);
    rejectProperty(payload.rhythm, "syncopation", "rhythm.syncopation", errors);
    rejectProperty(payload.rhythm, "polyrhythm_amount", "rhythm.polyrhythm_amount", errors);
    requireNumberRange(payload.generation && payload.generation.randomness, 0, 1, "generation.randomness", errors);
    requireNumberRange(payload.generation && payload.generation.variation_amount, 0, 1, "generation.variation_amount", errors);
    rejectProperty(payload.generation, "repetition", "generation.repetition", errors);
    rejectProperty(payload.generation, "memory_length", "generation.memory_length", errors);
    requireNumberRange(payload.generation && payload.generation.mutation_rate, 0, 1, "generation.mutation_rate", errors);
    requireBoolean(payload.structure && payload.structure.sections_enabled, "structure.sections_enabled", errors);
    requireNumberRange(payload.density && payload.density.density_min, 0, 1, "density.density_min", errors);
    requireNumberRange(payload.density && payload.density.density_max, 0, 1, "density.density_max", errors);
    requireIntegerRange(payload.density && payload.density.max_polyphony, 1, 64, "density.max_polyphony", errors);
    requireIntegerRange(payload.midi && payload.midi.midi_channel, 1, 16, "midi.midi_channel", errors);
    requireIntegerRange(payload.midi && payload.midi.velocity_min, 1, 127, "midi.velocity_min", errors);
    requireIntegerRange(payload.midi && payload.midi.velocity_max, 1, 127, "midi.velocity_max", errors);
    requireIntegerRange(payload.midi && payload.midi.octave_min, -1, 9, "midi.octave_min", errors);
    requireIntegerRange(payload.midi && payload.midi.octave_max, -1, 9, "midi.octave_max", errors);
    if (payload.rhythm && payload.rhythm.tempo_min > payload.rhythm.tempo_max) {
        errors.push("rhythm.tempo_min must be <= rhythm.tempo_max");
    }
    if (payload.density && payload.density.density_min > payload.density.density_max) {
        errors.push("density.density_min must be <= density.density_max");
    }
    if (payload.midi && payload.midi.velocity_min > payload.midi.velocity_max) {
        errors.push("midi.velocity_min must be <= midi.velocity_max");
    }
    if (payload.midi && payload.midi.octave_min > payload.midi.octave_max) {
        errors.push("midi.octave_min must be <= midi.octave_max");
    }
    return errors;
}

function validateMusicalControl(payload) {
    var errors = [];
    if (!payload || typeof payload !== "object") {
        return ["SFS_MUSICAL_CONTROL must be an object"];
    }
    requireEqual(payload.schema, MUSICAL_CONTROL_SCHEMA, "schema", errors);
    requireEqual(payload.version, VERSION, "version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "timestamp_ms", errors);
    requireString(payload.state && payload.state.name, "state.name", errors);
    requireNumberRange(payload.state && payload.state.confidence, 0, 1, "state.confidence", errors);
    requireBoolean(payload.state && payload.state.changed, "state.changed", errors);
    requireOptionalString(payload.state && payload.state.previous, "state.previous", errors);
    requireNumberRange(payload.controls && payload.controls.energy, 0, 1, "controls.energy", errors);
    requireNumberRange(payload.controls && payload.controls.density, 0, 1, "controls.density", errors);
    requireNumberRange(payload.controls && payload.controls.tension, 0, 1, "controls.tension", errors);
    requireNumberRange(payload.controls && payload.controls.brightness, 0, 1, "controls.brightness", errors);
    requireNumberRange(payload.controls && payload.controls.activity, 0, 1, "controls.activity", errors);
    requireNumberRange(payload.controls && payload.controls.variation, 0, 1, "controls.variation", errors);
    requireBoolean(payload.events && payload.events.scene_change, "events.scene_change", errors);
    requireBoolean(payload.events && payload.events.accent, "events.accent", errors);
    requireBoolean(payload.events && payload.events.reset_phrase, "events.reset_phrase", errors);
    return errors;
}

function validateConductorContext(payload) {
    var errors = [];
    requireEqual(payload.schema, CONDUCTOR_SCHEMA, "schema", errors);
    requireEqual(payload.version, VERSION, "version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "timestamp_ms", errors);
    requireIntegerRange(payload.transport && payload.transport.tick_index, 0, null, "transport.tick_index", errors);
    requireIntegerRange(payload.transport && payload.transport.logical_time_us, 0, null, "transport.logical_time_us", errors);
    requireIntegerRange(payload.transport && payload.transport.tick_duration_us, 1, null, "transport.tick_duration_us", errors);
    requireIntegerRange(payload.transport && payload.transport.beat, 1, 4, "transport.beat", errors);
    requireIntegerRange(payload.transport && payload.transport.bar, 1, null, "transport.bar", errors);
    requireIntegerRange(payload.transport && payload.transport.subdivision, 1, null, "transport.subdivision", errors);
    requireIntegerRange(payload.transport && payload.transport.phrase_tick, 0, null, "transport.phrase_tick", errors);
    requireIntegerRange(payload.transport && payload.transport.state_age_ticks, 0, null, "transport.state_age_ticks", errors);
    requireIntegerRange(payload.transport && payload.transport.section_tick, 0, null, "transport.section_tick", errors);
    requireString(payload.source_state, "source_state", errors);
    requireEnum(payload.state, MVP_STATES, "state", errors);
    requireBoolean(payload.state_fallback_applied, "state_fallback_applied", errors);
    requireEnum(payload.section, ["disabled", "intro", "develop", "peak", "release"], "section", errors);
    requireBoolean(payload.sections_enabled, "sections_enabled", errors);
    requireNumberRange(payload.section_progress, 0, 1, "section_progress", errors);
    requireNumberRange(payload.tempo_bpm, 20, 300, "tempo_bpm", errors);
    requireNumberRange(payload.energy, 0, 1, "energy", errors);
    requireNumberRange(payload.density, 0, 1, "density", errors);
    requireNumberRange(payload.tension, 0, 1, "tension", errors);
    requireNumberRange(payload.brightness, 0, 1, "brightness", errors);
    requireNumberRange(payload.activity, 0, 1, "activity", errors);
    requireNumberRange(payload.control_variation, 0, 1, "control_variation", errors);
    requireNumberRange(payload.variation_amount, 0, 1, "variation_amount", errors);
    requireNumberRange(payload.effective_variation, 0, 1, "effective_variation", errors);
    requireBoolean(payload.transition, "transition", errors);
    requireBoolean(payload.accent, "accent", errors);
    requireBoolean(payload.reset_phrase, "reset_phrase", errors);
    requireIntegerRange(payload.event_counts && payload.event_counts.scene_change, 0, null, "event_counts.scene_change", errors);
    requireIntegerRange(payload.event_counts && payload.event_counts.accent, 0, null, "event_counts.accent", errors);
    requireIntegerRange(payload.event_counts && payload.event_counts.reset_phrase, 0, null, "event_counts.reset_phrase", errors);
    requireIntegerRange(payload.root_pitch_class, 0, 11, "root_pitch_class", errors);
    requireEnum(payload.scale_name, SCALE_NAMES, "scale_name", errors);
    requireNumberRange(payload.harmonic_risk, 0, 1, "harmonic_risk", errors);
    requireNumberRange(payload.dissonance_bias, 0, 1, "dissonance_bias", errors);
    requireNumberRange(payload.randomness, 0, 1, "randomness", errors);
    requireNumberRange(payload.mutation_rate, 0, 1, "mutation_rate", errors);
    requireNumberRange(payload.density_min, 0, 1, "density_min", errors);
    requireNumberRange(payload.density_max, 0, 1, "density_max", errors);
    requireIntegerRange(payload.max_polyphony, 1, 64, "max_polyphony", errors);
    requireIntegerRange(payload.midi_channel, 1, 16, "midi_channel", errors);
    requireIntegerRange(payload.velocity_min, 1, 127, "velocity_min", errors);
    requireIntegerRange(payload.velocity_max, 1, 127, "velocity_max", errors);
    requireIntegerRange(payload.octave_min, -1, 9, "octave_min", errors);
    requireIntegerRange(payload.octave_max, -1, 9, "octave_max", errors);
    requireBoolean(payload.deterministic_mode, "deterministic_mode", errors);
    requireIntegerRange(payload.seed, 0, 2147483647, "seed", errors);
    if (contains(MVP_STATES, payload.source_state)) {
        if (payload.source_state !== payload.state || payload.state_fallback_applied !== false) {
            errors.push("supported source_state must pass through");
        }
    } else if (payload.state !== "calm" || payload.state_fallback_applied !== true) {
        errors.push("unsupported source_state must fall back to calm");
    }
    return errors;
}

function validateHarmonyContext(payload) {
    var errors = [];
    requireEqual(payload.schema, HARMONY_SCHEMA, "schema", errors);
    requireEqual(payload.version, VERSION, "version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "timestamp_ms", errors);
    requireIntegerRange(payload.tick_index, 0, null, "tick_index", errors);
    requireIntegerRange(payload.root_pitch_class, 0, 11, "root_pitch_class", errors);
    requireEnum(payload.scale_name, SCALE_NAMES, "scale_name", errors);
    validateIntervals(payload.scale_intervals, "scale_intervals", errors);
    validateIntegerArray(payload.borrowed_pitch_classes, 0, 11, "borrowed_pitch_classes", true, errors);
    validateIntegerArray(payload.chord, 0, 127, "chord", true, errors);
    validateIntegerArray(payload.pitch_pool, 0, 127, "pitch_pool", true, errors);
    requireNumberRange(payload.dissonance, 0, 1, "dissonance", errors);
    requireIntegerRange(payload.register_min, 0, 127, "register_min", errors);
    requireIntegerRange(payload.register_max, 0, 127, "register_max", errors);
    if (payload.register_min > payload.register_max) {
        errors.push("register_min must be <= register_max");
    }
    if (payload.dissonance !== calculateDissonance(payload.root_pitch_class, payload.scale_intervals || [], payload.chord || [])) {
        errors.push("dissonance must match chord interval calculation");
    }
    return errors;
}

function validateNoteEvent(payload) {
    var errors = [];
    requireEqual(payload.schema, NOTE_EVENT_SCHEMA, "schema", errors);
    requireEqual(payload.version, VERSION, "version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "timestamp_ms", errors);
    requireIntegerRange(payload.tick_index, 0, null, "tick_index", errors);
    requireIntegerRange(payload.event_index, 0, null, "event_index", errors);
    requireString(payload.note_id, "note_id", errors);
    requireIntegerRange(payload.pitch, 0, 127, "pitch", errors);
    requireIntegerRange(payload.velocity, 1, 127, "velocity", errors);
    requireIntegerRange(payload.duration_ticks, 1, null, "duration_ticks", errors);
    requireIntegerRange(payload.duration_ms, 1, null, "duration_ms", errors);
    requireIntegerRange(payload.channel, 1, 16, "channel", errors);
    requireString(payload.role, "role", errors);
    return errors;
}

function validateMidiEvent(payload) {
    var errors = [];
    requireEqual(payload.schema, MIDI_EVENT_SCHEMA, "schema", errors);
    requireEqual(payload.version, VERSION, "version", errors);
    requireIntegerRange(payload.timestamp_ms, 0, null, "timestamp_ms", errors);
    requireIntegerRange(payload.tick_index, 0, null, "tick_index", errors);
    requireIntegerRange(payload.midi_event_index, 0, null, "midi_event_index", errors);
    requireOptionalIntegerRange(payload.source_event_index, 0, null, "source_event_index", errors);
    requireOptionalIntegerRange(payload.input_sequence, 0, null, "input_sequence", errors);
    requireEnum(payload.type, ["note_on", "note_off", "control_change", "voice_steal", "flush", "panic"], "type", errors);
    requireEnum(payload.reason, ["generated", "duration_elapsed", "retrigger", "voice_steal", "reset_phrase", "stop", "global_disable", "full_reset", "channel_change", "patch_shutdown", "user_flush", "user_panic"], "reason", errors);
    requireIntegerRange(payload.active_voice_count, 0, null, "active_voice_count", errors);
    if (payload.controller === 120 || payload.cc120_sent !== undefined) {
        errors.push("MIDI CC 120 is outside SFS_MIDI_EVENT v0.1.0");
    }
    if (payload.type === "note_on") {
        requireString(payload.note_id, "note_id", errors);
        requireIntegerRange(payload.pitch, 0, 127, "pitch", errors);
        requireIntegerRange(payload.velocity, 1, 127, "velocity", errors);
        requireIntegerRange(payload.channel, 1, 16, "channel", errors);
    }
    if (payload.type === "note_off") {
        requireString(payload.note_id, "note_id", errors);
        requireIntegerRange(payload.pitch, 0, 127, "pitch", errors);
        requireEqual(payload.velocity, 0, "velocity", errors);
        requireIntegerRange(payload.channel, 1, 16, "channel", errors);
    }
    if (payload.type === "control_change") {
        requireIntegerRange(payload.channel, 1, 16, "channel", errors);
        requireIntegerRange(payload.controller, 0, 127, "controller", errors);
        requireIntegerRange(payload.value, 0, 127, "value", errors);
    }
    return errors;
}

function validateGenerated(conductor, harmony, notes, midiEvents) {
    var diagnostics = [];
    var errors = validateConductorContext(conductor);
    diagnostics = diagnostics.concat(errorsToDiagnostics(errors, "schema_error"));
    errors = validateHarmonyContext(harmony);
    diagnostics = diagnostics.concat(errorsToDiagnostics(errors, "schema_error"));
    for (var i = 0; i < notes.length; i += 1) {
        errors = validateNoteEvent(notes[i]);
        diagnostics = diagnostics.concat(errorsToDiagnostics(errors, "schema_error"));
    }
    for (var j = 0; j < midiEvents.length; j += 1) {
        errors = validateMidiEvent(midiEvents[j]);
        diagnostics = diagnostics.concat(errorsToDiagnostics(errors, "schema_error"));
    }
    return diagnostics;
}

function XorShift32(seed) {
    this.state = normalizeSeed(seed);
}

XorShift32.prototype.nextUint32 = function () {
    this.state = nextUint32(this.state);
    return this.state;
};

XorShift32.prototype.nextFloat = function () {
    return this.nextUint32() / UINT32_SIZE;
};

function nextUint32(state) {
    var x = normalizeSeed(state);
    x = (x ^ ((x << 13) >>> 0)) >>> 0;
    x = (x ^ (x >>> 17)) >>> 0;
    x = (x ^ ((x << 5) >>> 0)) >>> 0;
    return x >>> 0;
}

function normalizeSeed(seed) {
    var value = (Number(seed) >>> 0);
    return value === 0 ? ZERO_SEED_REPLACEMENT : value;
}

function deriveModuleSeed(masterSeed, moduleName) {
    var text = String(clampInteger(integerValue(masterSeed, 0), 0, 2147483647)) + ":" + String(moduleName);
    var hash = 2166136261 >>> 0;
    for (var i = 0; i < text.length; i += 1) {
        hash = (hash ^ (text.charCodeAt(i) & 0xFF)) >>> 0;
        hash = imul32(hash, 16777619);
    }
    return normalizeSeed(hash);
}

function imul32(a, b) {
    if (typeof Math.imul === "function") {
        return Math.imul(a, b) >>> 0;
    }
    var aLow = a & 0xFFFF;
    var aHigh = (a >>> 16) & 0xFFFF;
    var bLow = b & 0xFFFF;
    var bHigh = (b >>> 16) & 0xFFFF;
    return ((aLow * bLow) + (((aHigh * bLow + aLow * bHigh) & 0xFFFF) << 16)) >>> 0;
}

function calculateDissonance(rootPitchClass, scaleIntervals, chord) {
    var base = {};
    var chordPcs = [];
    var seenChord = {};
    var borrowedCount = 0;
    var pairTotal = 0;
    var pairCount = 0;
    var pc;
    var i;
    var j;
    var distance;
    var intervalClass;
    var weights = {
        0: 0.00,
        1: 1.00,
        2: 0.65,
        3: 0.25,
        4: 0.20,
        5: 0.10,
        6: 0.90
    };

    for (i = 0; i < scaleIntervals.length; i += 1) {
        base[mod12(rootPitchClass + scaleIntervals[i])] = true;
    }
    for (i = 0; i < chord.length; i += 1) {
        pc = mod12(chord[i]);
        if (!seenChord[pc]) {
            seenChord[pc] = true;
            chordPcs.push(pc);
        }
    }
    chordPcs.sort(compareNumber);
    for (i = 0; i < chordPcs.length; i += 1) {
        if (!base[chordPcs[i]]) {
            borrowedCount += 1;
        }
        for (j = i + 1; j < chordPcs.length; j += 1) {
            distance = Math.abs(chordPcs[i] - chordPcs[j]) % 12;
            intervalClass = Math.min(distance, 12 - distance);
            pairTotal += weights[intervalClass];
            pairCount += 1;
        }
    }
    return round6(clamp((0.85 * (pairCount > 0 ? pairTotal / pairCount : 0)) + (0.15 * (chordPcs.length > 0 ? borrowedCount / chordPcs.length : 0)), 0, 1));
}

function calculateSection(stateAgeTicks, subdivision, sectionsEnabled) {
    var ticksPerBar = 4 * subdivision;
    var introTicks = 4 * ticksPerBar;
    var developTicks = 8 * ticksPerBar;
    var peakTicks = 4 * ticksPerBar;
    var releaseTicks = 4 * ticksPerBar;
    var cycleLength = developTicks + peakTicks + releaseTicks;
    var section = "intro";
    var sectionTick = stateAgeTicks;
    var sectionDuration = introTicks;
    var cycleTick;

    if (!sectionsEnabled) {
        return { section: "disabled", section_tick: 0, section_progress: 0 };
    }
    if (stateAgeTicks >= introTicks) {
        cycleTick = (stateAgeTicks - introTicks) % cycleLength;
        if (cycleTick < developTicks) {
            section = "develop";
            sectionTick = cycleTick;
            sectionDuration = developTicks;
        } else if (cycleTick < developTicks + peakTicks) {
            section = "peak";
            sectionTick = cycleTick - developTicks;
            sectionDuration = peakTicks;
        } else {
            section = "release";
            sectionTick = cycleTick - developTicks - peakTicks;
            sectionDuration = releaseTicks;
        }
    }
    return {
        section: section,
        section_tick: sectionTick,
        section_progress: sectionDuration <= 1 ? 0 : round6(clamp(sectionTick / (sectionDuration - 1), 0, 1))
    };
}

function tempoToTickDurationUs(tempoBpm, subdivision) {
    var tempoForTiming = floorInteger(tempoBpm * 1000000 + 0.5) / 1000000;
    return floorInteger(60000000 / (tempoForTiming * subdivision) + 0.5);
}

function resolveState(sourceState) {
    if (contains(MVP_STATES, sourceState)) {
        return { source_state: sourceState, state: sourceState, fallback_applied: false };
    }
    return { source_state: String(sourceState), state: "calm", fallback_applied: true };
}

function selectTickInputs(eligible) {
    var selected = {
        config: null,
        musicalControl: null
    };
    for (var i = 0; i < eligible.length; i += 1) {
        if (eligible[i].kind === "config") {
            selected.config = eligible[i];
        } else if (eligible[i].kind === "musical_control") {
            selected.musicalControl = eligible[i];
        }
    }
    return selected;
}

function countEvents(eligible) {
    var counts = { scene_change: 0, accent: 0, reset_phrase: 0 };
    var events;

    for (var i = 0; i < eligible.length; i += 1) {
        if (eligible[i].kind !== "musical_control") {
            continue;
        }
        events = eligible[i].payload.events || {};
        if (events.scene_change) {
            counts.scene_change += 1;
        }
        if (events.accent) {
            counts.accent += 1;
        }
        if (events.reset_phrase) {
            counts.reset_phrase += 1;
        }
    }
    return counts;
}

function makeEventDiagnostics(eligible, tick) {
    var diagnostics = [];
    var order = 0;
    var priorities = ["reset_phrase", "scene_change", "accent"];
    var eventName;
    var env;

    for (var p = 0; p < priorities.length; p += 1) {
        eventName = priorities[p];
        for (var i = 0; i < eligible.length; i += 1) {
            env = eligible[i];
            if (env.kind === "musical_control" && env.payload.events[eventName]) {
                diagnostics.push(makeDiagnostic("info", "event_" + eventName, "processed " + eventName + " occurrence " + order, env.input_sequence, tick, { order: order }));
                order += 1;
            }
        }
    }
    return diagnostics;
}

function defaultMusicalControl() {
    return {
        schema: MUSICAL_CONTROL_SCHEMA,
        version: VERSION,
        timestamp_ms: 0,
        state: {
            name: "calm",
            confidence: 1,
            changed: false,
            previous: null
        },
        controls: {
            energy: 0.25,
            density: 0.20,
            tension: 0.10,
            brightness: 0.50,
            activity: 0.20,
            variation: 0
        },
        events: {
            scene_change: false,
            accent: false,
            reset_phrase: false
        }
    };
}

function makePitchPool(rootPitchClass, intervals, registerMin, registerMax) {
    var allowed = {};
    var pool = [];
    var pitch;

    for (var i = 0; i < intervals.length; i += 1) {
        allowed[mod12(rootPitchClass + intervals[i])] = true;
    }
    for (pitch = registerMin; pitch <= registerMax; pitch += 1) {
        if (allowed[mod12(pitch)]) {
            pool.push(pitch);
        }
    }
    return pool;
}

function borrowedPitches(rootPitchClass, intervals, registerMin, registerMax, tension, dissonanceBias) {
    var base = {};
    var targetPcs = [];
    var output = [];
    var pitch;
    var i;

    for (i = 0; i < intervals.length; i += 1) {
        base[mod12(rootPitchClass + intervals[i])] = true;
    }
    targetPcs.push(mod12(rootPitchClass + 1));
    if (tension >= 0.55 || dissonanceBias >= 0.5) {
        targetPcs.push(mod12(rootPitchClass + 6));
    }
    if (tension >= 0.82) {
        targetPcs.push(mod12(rootPitchClass + 11));
    }
    for (pitch = registerMin; pitch <= registerMax; pitch += 1) {
        for (i = 0; i < targetPcs.length; i += 1) {
            if (!base[targetPcs[i]] && mod12(pitch) === targetPcs[i]) {
                output.push(pitch);
            }
        }
    }
    return uniqueSorted(output);
}

function nearestPitchWithPc(pool, pitchClass, target) {
    var best = null;
    var bestDistance = null;
    var distance;

    for (var i = 0; i < pool.length; i += 1) {
        if (mod12(pool[i]) !== mod12(pitchClass)) {
            continue;
        }
        distance = Math.abs(pool[i] - target);
        if (best === null || distance < bestDistance || (distance === bestDistance && pool[i] < best)) {
            best = pool[i];
            bestDistance = distance;
        }
    }
    if (best !== null) {
        return best;
    }
    return pool.length > 0 ? pool[0] : clampInteger(roundInteger(target), 0, 127);
}

function findBorrowedPitchClasses(rootPitchClass, intervals, pitches) {
    var base = {};
    var borrowed = {};
    var out = [];
    var pc;

    for (var i = 0; i < intervals.length; i += 1) {
        base[mod12(rootPitchClass + intervals[i])] = true;
    }
    for (var j = 0; j < pitches.length; j += 1) {
        pc = mod12(pitches[j]);
        if (!base[pc]) {
            borrowed[pc] = true;
        }
    }
    for (var key in borrowed) {
        if (borrowed.hasOwnProperty(key)) {
            out.push(Number(key));
        }
    }
    out.sort(compareNumber);
    return out;
}

function emitStepResult(result) {
    if (result.conductor) {
        writeConductor(result.conductor);
        outlet(0, "dictionary", conductorDictName);
    }
    if (result.harmony) {
        writeHarmony(result.harmony);
        outlet(1, "dictionary", harmonyDictName);
    }
    for (var i = 0; i < result.notes.length; i += 1) {
        writeNoteEvent(result.notes[i]);
        outlet(2, "dictionary", noteEventDictName);
    }
    emitMidiResult({ events: result.midi_events, raw: result.raw_midi });
    emitDiagnostics(result.diagnostics);
}

function emitMidiResult(result) {
    for (var i = 0; i < result.events.length; i += 1) {
        writeMidiEvent(result.events[i]);
        outlet(3, "dictionary", midiEventDictName);
    }
    for (var j = 0; j < result.raw.length; j += 1) {
        outlet(4, result.raw[j]);
    }
}

function emitDiagnostics(diagnostics) {
    for (var i = 0; i < diagnostics.length; i += 1) {
        emitDiagnostic(diagnostics[i].level, diagnostics[i].event, diagnostics[i].message, diagnostics[i]);
    }
}

function emitDiagnostic(level, event, message, data) {
    outlet(5, "log", level || "info", event || "diagnostic", message || "", stringifyJson(data || {}));
}

function writeConductor(payload) {
    if (!conductorDict) {
        conductorDict = new Dict(conductorDictName);
    }
    replaceDictionaryFromJson(conductorDict, payload);
}

function writeHarmony(payload) {
    if (!harmonyDict) {
        harmonyDict = new Dict(harmonyDictName);
    }
    replaceDictionaryFromJson(harmonyDict, payload);
}

function writeNoteEvent(payload) {
    if (!noteEventDict) {
        noteEventDict = new Dict(noteEventDictName);
    }
    replaceDictionaryFromJson(noteEventDict, payload);
}

function writeMidiEvent(payload) {
    if (!midiEventDict) {
        midiEventDict = new Dict(midiEventDictName);
    }
    replaceDictionaryFromJson(midiEventDict, payload);
}

function writeUserConfig(payload) {
    if (!userConfigDict) {
        userConfigDict = new Dict(userConfigDictName);
    }
    replaceDictionaryFromJson(userConfigDict, payload);
}

function replaceDictionaryFromJson(dict, payload) {
    var json = stringifyJson(payload);
    dict.clear();
    if (typeof dict.parse === "function") {
        dict.parse(json);
        return;
    }
    writeObjectToDict(dict, "", payload);
}

function writeObjectToDict(dict, prefix, value) {
    var key;
    var path;

    if (value instanceof Array) {
        dict.replace(prefix, value);
        return;
    }
    if (value && typeof value === "object") {
        for (key in value) {
            if (value.hasOwnProperty(key)) {
                path = prefix ? prefix + "::" + key : key;
                writeObjectToDict(dict, path, value[key]);
            }
        }
        return;
    }
    dict.replace(prefix, value);
}

function readMusicalControlDict(name) {
    var dict = new Dict(name);
    return {
        schema: stringValue(safeGet(dict, "schema")),
        version: stringValue(safeGet(dict, "version")),
        timestamp_ms: integerValue(safeGet(dict, "timestamp_ms"), 0),
        state: {
            name: stringValue(safeGet(dict, "state::name")),
            confidence: numberValue(safeGet(dict, "state::confidence"), NaN),
            changed: booleanValue(safeGet(dict, "state::changed")),
            previous: nullableStringValue(safeGet(dict, "state::previous"))
        },
        controls: {
            energy: numberValue(safeGet(dict, "controls::energy"), NaN),
            density: numberValue(safeGet(dict, "controls::density"), NaN),
            tension: numberValue(safeGet(dict, "controls::tension"), NaN),
            brightness: numberValue(safeGet(dict, "controls::brightness"), NaN),
            activity: numberValue(safeGet(dict, "controls::activity"), NaN),
            variation: numberValue(safeGet(dict, "controls::variation"), NaN)
        },
        events: {
            scene_change: booleanValue(safeGet(dict, "events::scene_change")),
            accent: booleanValue(safeGet(dict, "events::accent")),
            reset_phrase: booleanValue(safeGet(dict, "events::reset_phrase"))
        }
    };
}

function readUserConfigDict(name) {
    var dict = new Dict(name);
    return {
        schema: stringValue(safeGet(dict, "schema")),
        version: stringValue(safeGet(dict, "version")),
        preset_name: stringValue(safeGet(dict, "preset_name")),
        reproducibility: {
            deterministic_mode: booleanValue(safeGet(dict, "reproducibility::deterministic_mode")),
            random_seed: numberValue(safeGet(dict, "reproducibility::random_seed"), NaN)
        },
        musical_identity: {
            root_pitch_class: numberValue(safeGet(dict, "musical_identity::root_pitch_class"), NaN),
            scale_name: stringValue(safeGet(dict, "musical_identity::scale_name")),
            harmonic_risk: numberValue(safeGet(dict, "musical_identity::harmonic_risk"), NaN),
            dissonance_bias: numberValue(safeGet(dict, "musical_identity::dissonance_bias"), NaN)
        },
        rhythm: {
            tempo_min: numberValue(safeGet(dict, "rhythm::tempo_min"), NaN),
            tempo_max: numberValue(safeGet(dict, "rhythm::tempo_max"), NaN),
            rhythm_complexity: safeGet(dict, "rhythm::rhythm_complexity"),
            syncopation: safeGet(dict, "rhythm::syncopation"),
            polyrhythm_amount: safeGet(dict, "rhythm::polyrhythm_amount")
        },
        generation: {
            randomness: numberValue(safeGet(dict, "generation::randomness"), NaN),
            variation_amount: numberValue(safeGet(dict, "generation::variation_amount"), NaN),
            mutation_rate: numberValue(safeGet(dict, "generation::mutation_rate"), NaN),
            repetition: safeGet(dict, "generation::repetition"),
            memory_length: safeGet(dict, "generation::memory_length")
        },
        structure: {
            sections_enabled: booleanValue(safeGet(dict, "structure::sections_enabled"))
        },
        density: {
            density_min: numberValue(safeGet(dict, "density::density_min"), NaN),
            density_max: numberValue(safeGet(dict, "density::density_max"), NaN),
            max_polyphony: numberValue(safeGet(dict, "density::max_polyphony"), NaN)
        },
        midi: {
            midi_channel: numberValue(safeGet(dict, "midi::midi_channel"), NaN),
            velocity_min: numberValue(safeGet(dict, "midi::velocity_min"), NaN),
            velocity_max: numberValue(safeGet(dict, "midi::velocity_max"), NaN),
            octave_min: numberValue(safeGet(dict, "midi::octave_min"), NaN),
            octave_max: numberValue(safeGet(dict, "midi::octave_max"), NaN)
        }
    };
}

function loadJson(relativePath) {
    return JSON.parse(readText(projectPath(relativePath)));
}

function readText(filename) {
    if (typeof require === "function" && typeof module !== "undefined" && module.exports) {
        return require("fs").readFileSync(filename, "utf8");
    }

    var file = new File(filename, "read");
    var lines = [];

    if (!file.isopen) {
        throw "could not open " + filename;
    }
    while (file.position < file.eof) {
        lines.push(file.readline());
    }
    file.close();
    return lines.join("\n");
}

function projectPath(relativePath) {
    if (typeof require === "function" && typeof __dirname !== "undefined") {
        return require("path").resolve(__dirname, "..", relativePath);
    }

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

function getProjectRoot(path) {
    var markers = ["/patchers/", "/devtools/max/"];
    var index;
    for (var i = 0; i < markers.length; i += 1) {
        index = path.indexOf(markers[i]);
        if (index >= 0) {
            return path.substring(0, index);
        }
    }
    return "";
}

function normalizePath(value) {
    return String(value).replace(/\\/g, "/");
}

function requireEqual(value, expected, label, errors) {
    if (value !== expected) {
        errors.push(label + " must be " + expected);
    }
}

function requireString(value, label, errors) {
    if (typeof value !== "string" || value.length === 0) {
        errors.push(label + " must be a non-empty string");
    }
}

function requireOptionalString(value, label, errors) {
    if (value === null || value === undefined) {
        return;
    }
    if (typeof value !== "string") {
        errors.push(label + " must be string or null");
    }
}

function requireBoolean(value, label, errors) {
    if (typeof value !== "boolean") {
        errors.push(label + " must be boolean");
    }
}

function requireEnum(value, allowed, label, errors) {
    if (!contains(allowed, value)) {
        errors.push(label + " must be one of " + allowed.join(","));
    }
}

function requireNumberRange(value, min, max, label, errors) {
    var parsed = Number(value);
    if (!isFinite(parsed) || typeof value !== "number") {
        errors.push(label + " must be a finite number");
        return;
    }
    if (min !== null && parsed < min) {
        errors.push(label + " must be >= " + min);
    }
    if (max !== null && parsed > max) {
        errors.push(label + " must be <= " + max);
    }
}

function requireIntegerRange(value, min, max, label, errors) {
    var parsed = Number(value);
    if (!isFinite(parsed) || Math.floor(parsed) !== parsed || typeof value !== "number") {
        errors.push(label + " must be an integer");
        return;
    }
    if (min !== null && parsed < min) {
        errors.push(label + " must be >= " + min);
    }
    if (max !== null && parsed > max) {
        errors.push(label + " must be <= " + max);
    }
}

function requireOptionalIntegerRange(value, min, max, label, errors) {
    if (value === null || value === undefined) {
        return;
    }
    requireIntegerRange(value, min, max, label, errors);
}

function rejectProperty(parent, key, label, errors) {
    if (parent && parent.hasOwnProperty && parent.hasOwnProperty(key) && parent[key] !== undefined && parent[key] !== null) {
        errors.push(label + " is deferred outside v0.1.0");
    }
}

function validateIntervals(values, label, errors) {
    validateIntegerArray(values, 0, 11, label, true, errors);
    if (values && values.length > 0 && values[0] !== 0) {
        errors.push(label + " must begin with 0");
    }
    for (var i = 1; values && i < values.length; i += 1) {
        if (values[i] <= values[i - 1]) {
            errors.push(label + " must be sorted ascending");
            return;
        }
    }
}

function validateIntegerArray(values, min, max, label, requireNonEmpty, errors) {
    var seen = {};
    var value;

    if (!(values instanceof Array)) {
        errors.push(label + " must be an array");
        return;
    }
    if (requireNonEmpty && values.length === 0) {
        errors.push(label + " must not be empty");
    }
    for (var i = 0; i < values.length; i += 1) {
        value = values[i];
        if (typeof value !== "number" || Math.floor(value) !== value || value < min || value > max) {
            errors.push(label + "[" + i + "] out of range");
        }
        if (seen[value]) {
            errors.push(label + " must contain unique values");
        }
        seen[value] = true;
    }
}

function requireArrayExact(value, expected, label, errors) {
    if (!(value instanceof Array) || value.length !== expected.length) {
        errors.push(label + " must contain exactly " + expected.length + " items");
        return;
    }
    for (var i = 0; i < expected.length; i += 1) {
        if (value[i] !== expected[i]) {
            errors.push(label + "[" + i + "] must be " + expected[i]);
        }
    }
}

function assertNoErrors(errors, message) {
    if (errors.length > 0) {
        throw message + ": " + errors.join("; ");
    }
}

function errorsToDiagnostics(errors, eventName) {
    var diagnostics = [];
    for (var i = 0; i < errors.length; i += 1) {
        diagnostics.push(makeDiagnostic("error", eventName, errors[i]));
    }
    return diagnostics;
}

function addEnvelopeToDiagnostics(diagnostics, inputSequence, targetTick) {
    var output = [];
    for (var i = 0; i < diagnostics.length; i += 1) {
        diagnostics[i].input_sequence = inputSequence;
        diagnostics[i].target_tick = targetTick;
        output.push(diagnostics[i]);
    }
    return output;
}

function makeDiagnostic(level, event, message, inputSequence, targetTick, data) {
    var diagnostic = {
        level: level || "info",
        event: event || "diagnostic",
        message: message || ""
    };
    if (inputSequence !== undefined && inputSequence !== null) {
        diagnostic.input_sequence = inputSequence;
    }
    if (targetTick !== undefined && targetTick !== null) {
        diagnostic.target_tick = targetTick;
    }
    if (data !== undefined && data !== null) {
        diagnostic.data = data;
    }
    return diagnostic;
}

function emptyStepResult(diagnostics) {
    return {
        conductor: null,
        harmony: null,
        notes: [],
        midi_events: [],
        raw_midi: [],
        diagnostics: diagnostics || []
    };
}

function hasDeferredConfigField(payload) {
    for (var i = 0; i < DEFERRED_CONFIG_FIELDS.length; i += 1) {
        var value = getPath(payload, DEFERRED_CONFIG_FIELDS[i]);
        if (value !== undefined && value !== null) {
            return true;
        }
    }
    return false;
}

function getPath(object, path) {
    var parts = String(path).split(".");
    var current = object;
    for (var i = 0; i < parts.length; i += 1) {
        if (!current || !current.hasOwnProperty || !current.hasOwnProperty(parts[i])) {
            return undefined;
        }
        current = current[parts[i]];
    }
    return current;
}

function setPath(object, path, value) {
    var parts = String(path).replace(/::/g, ".").split(".");
    var current = object;
    for (var i = 0; i < parts.length - 1; i += 1) {
        if (!current[parts[i]] || typeof current[parts[i]] !== "object") {
            current[parts[i]] = {};
        }
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}

function parseParameterValue(value) {
    if (value === "true") {
        return true;
    }
    if (value === "false") {
        return false;
    }
    var parsed = Number(value);
    return isFinite(parsed) && String(value) !== "" ? parsed : value;
}

function readNumber(payload, path, fallback) {
    var value = getPath(payload, path);
    return typeof value === "number" && isFinite(value) ? value : fallback;
}

function readInteger(payload, path, fallback) {
    var value = getPath(payload, path);
    return typeof value === "number" && isFinite(value) ? roundInteger(value) : fallback;
}

function readString(payload, path, fallback) {
    var value = getPath(payload, path);
    return typeof value === "string" && value.length > 0 ? value : fallback;
}

function readBoolean(payload, path, fallback) {
    var value = getPath(payload, path);
    return typeof value === "boolean" ? value : fallback;
}

function readScaleName(payload, path, fallback, scaleRegistry) {
    var value = getPath(payload, path);
    if (typeof value === "string" && scaleRegistry.scales && scaleRegistry.scales[value]) {
        return value;
    }
    return scaleRegistry.default_scale_name || fallback;
}

function sortPair(a, b) {
    return a <= b ? [a, b] : [b, a];
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

function integerValue(value, fallback) {
    var parsed = parseInt(value, 10);
    return isFinite(parsed) ? parsed : fallback;
}

function optionalInteger(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    return integerValue(value, null);
}

function stringValue(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value);
}

function nullableStringValue(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    return String(value);
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function contains(values, value) {
    for (var i = 0; i < values.length; i += 1) {
        if (values[i] === value) {
            return true;
        }
    }
    return false;
}

function clamp(value, min, max) {
    var parsed = Number(value);
    if (!isFinite(parsed)) {
        return min;
    }
    if (parsed < min) {
        return min;
    }
    if (parsed > max) {
        return max;
    }
    return parsed;
}

function clampInteger(value, min, max) {
    return clamp(roundInteger(value), min, max);
}

function roundInteger(value) {
    var parsed = Number(value);
    if (!isFinite(parsed)) {
        return 0;
    }
    return parsed >= 0 ? Math.floor(parsed + 0.5) : Math.ceil(parsed - 0.5);
}

function floorInteger(value) {
    return Math.floor(Number(value));
}

function round6(value) {
    return Math.floor(Number(value) * 1000000 + 0.5) / 1000000;
}

function mod12(value) {
    var result = Number(value) % 12;
    return result < 0 ? result + 12 : result;
}

function uniqueSorted(values) {
    var seen = {};
    var output = [];
    for (var i = 0; i < values.length; i += 1) {
        if (!seen[values[i]]) {
            seen[values[i]] = true;
            output.push(values[i]);
        }
    }
    output.sort(compareNumber);
    return output;
}

function sortedIntegerKeys(object) {
    var values = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            values.push(Number(key));
        }
    }
    values.sort(compareNumber);
    return values;
}

function compareNumber(a, b) {
    return a - b;
}

function compareInputSequence(a, b) {
    return a.input_sequence - b.input_sequence;
}

function compareNoteEventIndex(a, b) {
    return a.event_index - b.event_index;
}

function compareVoiceAge(a, b) {
    return a.note_on_event_index - b.note_on_event_index;
}

function stringifyJson(value) {
    if (typeof JSON !== "undefined" && JSON.stringify) {
        return JSON.stringify(value);
    }
    return "";
}

function canonicalize(value) {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === "number") {
        return Math.floor(value * 1000000 + 0.5) / 1000000;
    }
    if (typeof value !== "object") {
        return value;
    }
    if (value instanceof Array) {
        var items = [];
        for (var i = 0; i < value.length; i += 1) {
            items.push(canonicalize(value[i]));
        }
        return items;
    }
    var keys = [];
    var output = {};
    for (var key in value) {
        if (value.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    keys.sort();
    for (var j = 0; j < keys.length; j += 1) {
        output[keys[j]] = canonicalize(value[keys[j]]);
    }
    return output;
}

try {
    core = new MusicEngineCore();
} catch (startupError) {
    if (typeof post === "function") {
        post("sfs.music_engine.core.deterministic_midi: startup error " + startupError + "\n");
    }
    core = {
        step: function () { return emptyStepResult([makeDiagnostic("error", "startup_error", String(startupError))]); },
        fullReset: function () { return { diagnostics: [makeDiagnostic("error", "startup_error", String(startupError))] }; },
        start: function () {},
        stop: function () { return { events: [], raw: [], diagnostics: [] }; },
        panic: function () { return { events: [], raw: [], diagnostics: [] }; },
        enqueueConfig: function () { return { accepted: false, diagnostics: [makeDiagnostic("error", "startup_error", String(startupError))] }; },
        enqueueMusicalControl: function () { return { accepted: false, diagnostics: [makeDiagnostic("error", "startup_error", String(startupError))] }; },
        nextTargetTick: function () { return 0; },
        currentConfig: null,
        defaultConfig: null
    };
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        MusicEngineCore: MusicEngineCore,
        MidiLifecycle: MidiLifecycle,
        XorShift32: XorShift32,
        nextUint32: nextUint32,
        deriveModuleSeed: deriveModuleSeed,
        normalizeUserConfig: normalizeUserConfig,
        validateScaleRegistry: validateScaleRegistry,
        validateUserConfig: validateUserConfig,
        validateMusicalControl: validateMusicalControl,
        validateConductorContext: validateConductorContext,
        validateHarmonyContext: validateHarmonyContext,
        validateNoteEvent: validateNoteEvent,
        validateMidiEvent: validateMidiEvent,
        calculateDissonance: calculateDissonance,
        calculateSection: calculateSection,
        tempoToTickDurationUs: tempoToTickDurationUs,
        defaultMusicalControl: defaultMusicalControl,
        canonicalize: canonicalize
    };
}
