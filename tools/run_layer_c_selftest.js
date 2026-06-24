#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  MusicEngineCore,
  MidiLifecycle,
  XorShift32,
  nextUint32,
  deriveModuleSeed,
  normalizeUserConfig,
  validateScaleRegistry,
  validateUserConfig,
  validateConductorContext,
  validateHarmonyContext,
  validateNoteEvent,
  validateMidiEvent,
  calculateDissonance,
  canonicalize
} = require("../patchers/sfs.music_engine.core.basic.js");

const root = path.resolve(__dirname, "..");
const fixturePath = path.join(root, "devtools", "testdata", "layer_c", "music_engine_mvp_sequences.json");
const defaultConfigPath = path.join(root, "data", "music", "SFS_USER_CONFIG.default.v0.1.0.json");
const scaleRegistryPath = path.join(root, "data", "music", "SFS_SCALE_REGISTRY.v0.1.0.json");
const reportPath = path.join(root, "logs", "tests", "layer_c_selftest.latest.json");
const logPath = path.join(root, "logs", "tests", "layer_c_selftest.jsonl");

function main() {
  const started = Date.now();
  const fixture = readJson(fixturePath);
  const defaultConfig = readJson(defaultConfigPath);
  const scaleRegistry = readJson(scaleRegistryPath);
  const results = [];

  results.push(testPrngVectors());
  results.push(testProductionData(defaultConfig, scaleRegistry));
  results.push(testConfigNormalization(defaultConfig, scaleRegistry));
  results.push(testConfigRejection(fixture, defaultConfig, scaleRegistry));
  results.push(testConductorContracts(fixture));
  results.push(testClockAndDeterminism(fixture));
  results.push(testHarmonyContracts());
  results.push(testMusicalResponse(fixture, defaultConfig));
  results.push(testMidiLifecycle());

  const passed = results.filter((result) => result.status === "pass").length;
  const failed = results.length - passed;
  const summary = {
    schema: "SFS_LAYER_C_SELFTEST",
    version: "0.1.0",
    status: failed === 0 ? "pass" : "fail",
    passed,
    failed,
    duration_ms: Date.now() - started,
    fixture: relativePath(fixturePath),
    results
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`);
  fs.appendFileSync(logPath, `${JSON.stringify({
    time: new Date().toISOString(),
    event: "finish",
    status: summary.status,
    passed: summary.passed,
    failed: summary.failed
  })}\n`);

  console.log(`SFS Layer C self-test ${summary.status}: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    for (const result of results) {
      if (result.status !== "pass") {
        const failures = result.checks.filter((check) => !check.pass).map((check) => check.detail);
        console.log(`${result.name}: ${failures.join("; ")}`);
      }
    }
    process.exit(1);
  }
}

function testPrngVectors() {
  const result = makeResult("LC-D07 PRNG compatibility");
  const directExpected = [270369, 67634689, 2647435461, 307599695, 2398689233];
  const zeroExpected = [1085196063, 2447379481, 2618286376, 1701901981, 265159372];
  const moduleExpected = {
    conductor: {
      seed: 2946234711,
      values: [3332329711, 3168170862, 634047571, 4099070995, 1439536283]
    },
    harmony: {
      seed: 4284791764,
      values: [1809839291, 1012080127, 2725679913, 1919086368, 3747210371]
    },
    rhythm: {
      seed: 1567598114,
      values: [2631789591, 180128696, 3803385341, 3801178907, 280946722]
    }
  };

  addCheck(result, "direct_state", arraysEqual(drawFromState(1, 5), directExpected), `direct state vector mismatch: ${drawFromState(1, 5).join(",")}`);
  addCheck(result, "zero_replacement", arraysEqual(drawPrng(new XorShift32(0), 5), zeroExpected), `zero replacement vector mismatch: ${drawPrng(new XorShift32(0), 5).join(",")}`);

  for (const streamName of Object.keys(moduleExpected)) {
    const actualSeed = deriveModuleSeed(12345, streamName);
    const prng = new XorShift32(actualSeed);
    const actualValues = drawPrng(prng, 5);
    addCheck(result, `${streamName}_seed`, actualSeed === moduleExpected[streamName].seed, `${streamName} seed expected ${moduleExpected[streamName].seed}, got ${actualSeed}`);
    addCheck(result, `${streamName}_values`, arraysEqual(actualValues, moduleExpected[streamName].values), `${streamName} values mismatch: ${actualValues.join(",")}`);
  }

  finalizeResult(result);
  return result;
}

function testProductionData(defaultConfig, scaleRegistry) {
  const result = makeResult("LC-C07 LC-C10 production data");
  const registryErrors = validateScaleRegistry(scaleRegistry);
  const configErrors = validateUserConfig(defaultConfig);
  const normalized = normalizeUserConfig(defaultConfig, defaultConfig, scaleRegistry);

  addCheck(result, "scale_registry_valid", registryErrors.length === 0, `scale registry errors: ${registryErrors.join("; ")}`);
  addCheck(result, "default_config_valid", configErrors.length === 0, `default config errors: ${configErrors.join("; ")}`);
  addCheck(result, "default_normalizes_byte_equivalent", jsonStable(normalized.payload) === jsonStable(defaultConfig), "default config should normalize to byte-equivalent canonical JSON");
  addCheck(result, "scale_order_exact", arraysEqual(scaleRegistry.scale_order, ["major", "natural_minor", "dorian", "phrygian", "whole_tone", "chromatic", "cluster"]), "scale order must match v0.1.0 contract");

  finalizeResult(result);
  return result;
}

function testConfigNormalization(defaultConfig, scaleRegistry) {
  const result = makeResult("LC-C02 LC-C03 configuration normalization");
  const dirty = clone(defaultConfig);
  dirty.preset_name = "";
  dirty.reproducibility.deterministic_mode = "true";
  dirty.reproducibility.random_seed = 12.5;
  dirty.musical_identity.root_pitch_class = 11.5;
  dirty.musical_identity.scale_name = "unknown_scale";
  dirty.musical_identity.harmonic_risk = 2;
  dirty.musical_identity.dissonance_bias = -1;
  dirty.rhythm.tempo_min = 160;
  dirty.rhythm.tempo_max = 50;
  dirty.generation.randomness = -0.25;
  dirty.generation.variation_amount = 2;
  dirty.generation.mutation_rate = 0.5;
  dirty.structure.sections_enabled = "false";
  dirty.density.density_min = 0.8;
  dirty.density.density_max = 0.1;
  dirty.density.max_polyphony = 2.5;
  dirty.midi.midi_channel = 16.5;
  dirty.midi.velocity_min = 120;
  dirty.midi.velocity_max = 20;
  dirty.midi.octave_min = 7;
  dirty.midi.octave_max = 2;

  const normalized = normalizeUserConfig(dirty, defaultConfig, scaleRegistry).payload;
  const errors = validateUserConfig(normalized);

  addCheck(result, "schema_valid", errors.length === 0, `normalized config errors: ${errors.join("; ")}`);
  addCheck(result, "empty_name_defaulted", normalized.preset_name === defaultConfig.preset_name, `preset_name expected default, got ${normalized.preset_name}`);
  addCheck(result, "wrong_boolean_defaulted", normalized.reproducibility.deterministic_mode === defaultConfig.reproducibility.deterministic_mode, "wrong-type deterministic_mode should use default");
  addCheck(result, "half_integer_rounded", normalized.reproducibility.random_seed === 13 && normalized.density.max_polyphony === 3 && normalized.midi.midi_channel === 16, "integer half values should round away from zero then clamp");
  addCheck(result, "unknown_scale_fallback", normalized.musical_identity.scale_name === scaleRegistry.default_scale_name, `unknown scale expected ${scaleRegistry.default_scale_name}`);
  addCheck(result, "scalars_clamped", normalized.musical_identity.harmonic_risk === 1 && normalized.musical_identity.dissonance_bias === 0 && normalized.generation.randomness === 0 && normalized.generation.variation_amount === 1, "scalar values should clamp to schema ranges");
  addCheck(result, "ranges_sorted", normalized.rhythm.tempo_min === 50 && normalized.rhythm.tempo_max === 160 && normalized.density.density_min === 0.1 && normalized.density.density_max === 0.8 && normalized.midi.velocity_min === 20 && normalized.midi.velocity_max === 120 && normalized.midi.octave_min === 2 && normalized.midi.octave_max === 7, "min/max pairs should be sorted");

  finalizeResult(result);
  return result;
}

function testConfigRejection(fixture, defaultConfig, scaleRegistry) {
  const result = makeResult("LC-C09 LC-C12 LC-C15 config/input rejection");
  const engine = new MusicEngineCore();
  const deferred = clone(defaultConfig);
  deferred.rhythm.polyrhythm_amount = 0.5;
  const invalidVersion = clone(defaultConfig);
  invalidVersion.version = "0.1.1";
  const deferredOutcome = engine.enqueueConfig(deferred, 0);
  const invalidVersionOutcome = engine.enqueueConfig(invalidVersion, 0);

  addCheck(result, "deferred_rejected", deferredOutcome.accepted === false && hasEvent(deferredOutcome.diagnostics, "schema_error"), "deferred config field should be rejected");
  addCheck(result, "invalid_version_rejected", invalidVersionOutcome.accepted === false && hasEvent(invalidVersionOutcome.diagnostics, "schema_error"), "invalid config version should be rejected");

  const calm = control(fixture, "calm");
  addCheck(result, "valid_control_accepted", engine.enqueueMusicalControl(calm, 0).accepted === true, "valid musical control should be accepted");
  const first = engine.step();
  const invalidControl = clone(calm);
  invalidControl.controls.energy = 1.2;
  invalidControl.events.scene_change = true;
  invalidControl.events.accent = true;
  invalidControl.events.reset_phrase = true;
  const rejected = engine.enqueueMusicalControl(invalidControl, 1);
  const second = engine.step();

  addCheck(result, "invalid_layer_b_rejected", rejected.accepted === false && hasEvent(rejected.diagnostics, "schema_error"), "invalid Layer B dictionary should be rejected");
  addCheck(result, "invalid_events_not_queued", second.conductor.event_counts.scene_change === 0 && second.conductor.event_counts.accent === 0 && second.conductor.event_counts.reset_phrase === 0, "events from rejected Layer B input must not queue");
  addCheck(result, "state_preserved_after_invalid", second.conductor.state === first.conductor.state && second.conductor.energy === first.conductor.energy, "invalid Layer B input must not replace current valid state");

  const action = control(fixture, "action");
  addCheck(result, "next_valid_accepted", engine.enqueueMusicalControl(action, 2).accepted === true, "next valid Layer B dictionary should be accepted");
  const third = engine.step();
  addCheck(result, "next_valid_applied", third.conductor.state === "action", `next valid state expected action, got ${third.conductor.state}`);

  finalizeResult(result);
  return result;
}

function testConductorContracts(fixture) {
  const result = makeResult("LC-C04 LC-C08 conductor contracts");
  const engine = new MusicEngineCore();
  const config = clone(engine.defaultConfig);
  config.musical_identity.root_pitch_class = 5;
  config.musical_identity.scale_name = "dorian";
  config.musical_identity.harmonic_risk = 0.25;
  config.musical_identity.dissonance_bias = 0.75;
  config.rhythm.tempo_min = 100;
  config.rhythm.tempo_max = 100;
  config.generation.randomness = 0.1;
  config.generation.variation_amount = 0.6;
  config.generation.mutation_rate = 0.3;
  config.structure.sections_enabled = false;
  config.density.density_min = 0.2;
  config.density.density_max = 0.7;
  config.density.max_polyphony = 2;
  config.midi.midi_channel = 3;
  config.midi.velocity_min = 20;
  config.midi.velocity_max = 90;
  config.midi.octave_min = 2;
  config.midi.octave_max = 5;

  engine.enqueueConfig(config, 0);
  engine.enqueueMusicalControl(control(fixture, "action"), 0);
  const step = engine.step();
  const c = step.conductor;
  const conductorErrors = validateConductorContext(c);

  addCheck(result, "conductor_valid", conductorErrors.length === 0, `conductor errors: ${conductorErrors.join("; ")}`);
  addCheck(result, "config_propagated", c.root_pitch_class === 5 && c.scale_name === "dorian" && c.harmonic_risk === 0.25 && c.dissonance_bias === 0.75 && c.randomness === 0.1 && c.variation_amount === 0.6 && c.mutation_rate === 0.3 && c.density_min === 0.2 && c.density_max === 0.7 && c.max_polyphony === 2 && c.midi_channel === 3 && c.velocity_min === 20 && c.velocity_max === 90 && c.octave_min === 2 && c.octave_max === 5, "first tick should propagate normalized config fields");
  addCheck(result, "sections_disabled", c.section === "disabled" && c.section_progress === 0 && c.transport.section_tick === 0, "sections disabled should report disabled section fields");

  const unknownEngine = new MusicEngineCore();
  unknownEngine.enqueueMusicalControl(control(fixture, "mystery"), 0);
  const unknown = unknownEngine.step().conductor;
  addCheck(result, "unknown_state_fallback", unknown.source_state === "mystery" && unknown.state === "calm" && unknown.state_fallback_applied === true, "unknown source state should fall back to calm with diagnostic fields");

  finalizeResult(result);
  return result;
}

function testClockAndDeterminism(fixture) {
  const result = makeResult("LC-D01-D06 LC-D12-D19 clock determinism");

  const replayA = runEngineTrace(fixture, { controlName: "action", ticks: 256 });
  const replayB = runEngineTrace(fixture, { controlName: "action", ticks: 256 });
  const seedTrace = runEngineTrace(fixture, { controlName: "action", ticks: 256, configPatch: { reproducibility: { random_seed: 12346 } } });

  addCheck(result, "logical_clock_count", replayA.conductors.length === 256 && replayA.conductors.every((c, index) => c.transport.tick_index === index), "run should emit contiguous conductor ticks 0-255");
  addCheck(result, "beat_bar_formula", replayA.conductors.every((c) => c.transport.beat === (Math.floor(c.transport.tick_index / 4) % 4) + 1 && c.transport.bar === Math.floor(c.transport.tick_index / 16) + 1), "beat/bar formula mismatch");
  addCheck(result, "identical_replay", jsonStable(replayA.noteTrace) === jsonStable(replayB.noteTrace), "identical replay should produce byte-equivalent note trace");
  addCheck(result, "seed_sensitivity", jsonStable(replayA.noteTrace) !== jsonStable(seedTrace.noteTrace), "changing seed should alter generated note trace");

  const eventEngine = new MusicEngineCore();
  eventEngine.enqueueMusicalControl(control(fixture, "calm"), 0);
  runSteps(eventEngine, 128);
  const eventControl = control(fixture, "action");
  eventControl.events.reset_phrase = true;
  eventControl.events.scene_change = true;
  eventControl.events.accent = true;
  eventEngine.enqueueMusicalControl(eventControl, 128);
  const eventStep = eventEngine.step();
  const nextStep = eventEngine.step();
  addCheck(result, "one_shot_tick", eventStep.conductor.reset_phrase && eventStep.conductor.accent && eventStep.conductor.transition && eventStep.conductor.event_counts.reset_phrase === 1 && eventStep.conductor.event_counts.scene_change === 1 && eventStep.conductor.event_counts.accent === 1, "one-shot events should apply once at assigned tick");
  addCheck(result, "one_shot_consumed", !nextStep.conductor.reset_phrase && !nextStep.conductor.accent && nextStep.conductor.event_counts.scene_change === 0, "one-shot events should be consumed after one tick");
  addCheck(result, "event_priority", eventStep.diagnostics.filter((d) => d.event.indexOf("event_") === 0).map((d) => d.event).join(",") === "event_reset_phrase,event_scene_change,event_accent", "simultaneous events should process reset_phrase, scene_change, accent");

  const held = new MusicEngineCore();
  const changedAction = control(fixture, "action");
  changedAction.state.changed = true;
  held.enqueueMusicalControl(changedAction, 0);
  const heldFirst = held.step();
  held.enqueueMusicalControl(changedAction, 1);
  const heldSecond = held.step();
  addCheck(result, "held_state_stability", heldFirst.conductor.transition === true && heldSecond.conductor.transition === false, "sample-held state.changed must not retrigger transition");

  const sectionTrace = runEngineTrace(fixture, { controlName: "calm", ticks: 321 });
  addCheck(result, "section_timeline", sectionAt(sectionTrace, 0) === "intro" && sectionAt(sectionTrace, 63) === "intro" && sectionAt(sectionTrace, 64) === "develop" && sectionAt(sectionTrace, 191) === "develop" && sectionAt(sectionTrace, 192) === "peak" && sectionAt(sectionTrace, 255) === "peak" && sectionAt(sectionTrace, 256) === "release" && sectionAt(sectionTrace, 319) === "release" && sectionAt(sectionTrace, 320) === "develop", "section timeline should follow intro/develop/peak/release formula");

  const timingConfig = { rhythm: { tempo_min: 120, tempo_max: 120 }, density: { density_min: 0, density_max: 0 } };
  const timingTrace = runEngineTrace(fixture, { controlName: "calm", ticks: 10000, configPatch: timingConfig });
  addCheck(result, "fixed_point_timing", timingTrace.conductors[0].transport.tick_duration_us === 125000 && timingTrace.conductors[1].timestamp_ms === 125 && timingTrace.conductors[2].timestamp_ms === 250 && timingTrace.conductors[3].timestamp_ms === 375 && timingTrace.engine.logicalTimeUs === 1250000000, "120 BPM fixed-point timing mismatch");

  const mysteryTrace = runEngineTrace(fixture, { controlName: "mystery", ticks: 256 });
  const calmTrace = runEngineTrace(fixture, { controlName: "calm", ticks: 256 });
  addCheck(result, "unknown_state_equivalence", jsonStable(mysteryTrace.harmonyTrace) === jsonStable(calmTrace.harmonyTrace) && jsonStable(mysteryTrace.noteTrace) === jsonStable(calmTrace.noteTrace), "unknown-state fallback should match calm musical traces");

  finalizeResult(result);
  return result;
}

function testHarmonyContracts() {
  const result = makeResult("LC-C13 LC-A07 harmony contracts");
  const example = calculateDissonance(0, [0, 2, 3, 5, 7, 8, 10], [60, 63, 67]);
  addCheck(result, "documented_dissonance", example === 0.155833, `documented dissonance expected 0.155833, got ${example}`);

  const high = runEngineTrace(null, {
    control: makeControl("tension", { tension: 0.9, density: 0.7, brightness: 0.5, energy: 0.7, activity: 0.7, variation: 0.4 }),
    ticks: 64,
    configPatch: {
      musical_identity: { harmonic_risk: 1, dissonance_bias: 1 }
    }
  });
  const borrowed = high.harmonies.some((h) => h.borrowed_pitch_classes.length > 0);
  const disclosuresMatch = high.harmonies.every((h) => {
    const disclosed = h.borrowed_pitch_classes.join(",");
    const recomputed = borrowedPitchClassesFromHarmony(h).join(",");
    return disclosed === recomputed;
  });

  const zeroRisk = runEngineTrace(null, {
    control: makeControl("tension", { tension: 0.9, density: 0.7, brightness: 0.5, energy: 0.7, activity: 0.7, variation: 0.4 }),
    ticks: 64,
    configPatch: {
      musical_identity: { harmonic_risk: 0, dissonance_bias: 1 }
    }
  });
  const noBorrowAtZero = zeroRisk.harmonies.every((h) => h.borrowed_pitch_classes.length === 0 && allPitchesInScale(h.chord.concat(h.pitch_pool), h.root_pitch_class, h.scale_intervals));

  addCheck(result, "borrowed_disclosed", borrowed && disclosuresMatch, "borrowed pitch classes should be disclosed exactly when present");
  addCheck(result, "zero_risk_in_scale", noBorrowAtZero, "harmonic_risk=0 should keep chord and pitch pool in scale");

  finalizeResult(result);
  return result;
}

function testMusicalResponse(fixture, defaultConfig) {
  const result = makeResult("LC-M01-LC-M09 musical response");
  const calmHalf = runEngineTrace(fixture, { control: makeControl("calm", allControls(0.5)), ticks: 256 });
  const actionHalf = runEngineTrace(fixture, { control: makeControl("action", allControls(0.5)), ticks: 256 });
  const lowDensity = runEngineTrace(fixture, { control: makeControl("action", { density: 0.2, energy: 0.55, activity: 0.55, tension: 0.4, brightness: 0.5, variation: 0.3 }), ticks: 256 });
  const highDensity = runEngineTrace(fixture, { control: makeControl("action", { density: 0.8, energy: 0.55, activity: 0.55, tension: 0.4, brightness: 0.5, variation: 0.3 }), ticks: 256 });
  const lowTension = runEngineTrace(fixture, { control: makeControl("tension", { tension: 0.2, density: 0.6, energy: 0.55, activity: 0.55, brightness: 0.5, variation: 0.2 }), ticks: 256, configPatch: { musical_identity: { harmonic_risk: 1, dissonance_bias: 1 } } });
  const highTension = runEngineTrace(fixture, { control: makeControl("tension", { tension: 0.8, density: 0.6, energy: 0.55, activity: 0.55, brightness: 0.5, variation: 0.2 }), ticks: 256, configPatch: { musical_identity: { harmonic_risk: 1, dissonance_bias: 1 } } });
  const lowBright = runEngineTrace(fixture, { control: makeControl("action", { brightness: 0.2, density: 0.8, energy: 0.55, activity: 0.55, tension: 0.4, variation: 0.2 }), ticks: 256 });
  const highBright = runEngineTrace(fixture, { control: makeControl("action", { brightness: 0.8, density: 0.8, energy: 0.55, activity: 0.55, tension: 0.4, variation: 0.2 }), ticks: 256 });

  addCheck(result, "state_response", actionHalf.noteCount >= calmHalf.noteCount * 1.25, `action notes ${actionHalf.noteCount} should be >= calm ${calmHalf.noteCount} * 1.25`);
  addCheck(result, "density_response", lowDensity.noteCount > 0 && highDensity.noteCount >= lowDensity.noteCount * 1.5, `high density notes ${highDensity.noteCount} should be >= low ${lowDensity.noteCount} * 1.5`);
  addCheck(result, "tension_response", highTension.meanDissonance >= lowTension.meanDissonance + 0.25, `high tension dissonance ${highTension.meanDissonance} should exceed low ${lowTension.meanDissonance}`);
  addCheck(result, "brightness_response", lowBright.noteCount >= 16 && highBright.noteCount >= 16 && highBright.meanPitch >= lowBright.meanPitch + 6 && allNotesInRegister(lowBright.notes, defaultConfig) && allNotesInRegister(highBright.notes, defaultConfig), `brightness mean pitch low ${lowBright.meanPitch}, high ${highBright.meanPitch}`);

  const zeroGen = runEngineTrace(fixture, {
    control: makeControl("action", { density: 0.65, energy: 0.6, activity: 0.6, tension: 0.45, brightness: 0.5, variation: 0 }),
    ticks: 256,
    configPatch: { generation: { randomness: 0, variation_amount: 0, mutation_rate: 0 } }
  });
  const highGen = runEngineTrace(fixture, {
    control: makeControl("action", { density: 0.65, energy: 0.6, activity: 0.6, tension: 0.45, brightness: 0.5, variation: 1 }),
    ticks: 256,
    configPatch: { generation: { randomness: 1, variation_amount: 1, mutation_rate: 1 } }
  });
  addCheck(result, "generative_controls", jsonStable(zeroGen.noteTrace) !== jsonStable(highGen.noteTrace) && highGen.uniqueBarSignatures >= zeroGen.uniqueBarSignatures + 2, "generative controls should alter traces and increase bar-signature variety");

  const tempo60 = runEngineTrace(fixture, { controlName: "action", ticks: 32, configPatch: { rhythm: { tempo_min: 60, tempo_max: 60 } } });
  const tempo120 = runEngineTrace(fixture, { controlName: "action", ticks: 32, configPatch: { rhythm: { tempo_min: 120, tempo_max: 120 } } });
  const tempoRange = runEngineTrace(fixture, { controlName: "action", ticks: 32, configPatch: { rhythm: { tempo_min: 50, tempo_max: 160 } } });
  addCheck(result, "tempo_bounds", tempo60.conductors.every((c) => c.tempo_bpm === 60) && tempo120.conductors.every((c) => c.tempo_bpm === 120) && tempoRange.conductors.every((c) => c.tempo_bpm >= 50 && c.tempo_bpm <= 160), "tempo should obey user bounds");

  const eventRun = runEventFixture(fixture);
  addCheck(result, "scene_change_accent_reset", eventRun.sceneTransitionOnlyAt128 && eventRun.accentNote && eventRun.resetFlush && eventRun.phraseTickReset, "scene change, accent, and reset_phrase should produce expected tick behavior");

  finalizeResult(result);
  return result;
}

function testMidiLifecycle() {
  const result = makeResult("LC-I01-LC-I09 MIDI lifecycle");
  const raw = serialRawMidiFixture();
  const expectedRaw = [145, 60, 40, 129, 60, 0, 145, 64, 64, 129, 64, 0, 145, 67, 96, 129, 67, 0, 145, 72, 127, 129, 72, 0];
  addCheck(result, "raw_midi_contract", arraysEqual(raw.raw, expectedRaw), `raw MIDI expected ${expectedRaw.join(",")}, got ${raw.raw.join(",")}`);
  addCheck(result, "midi_schema_valid", raw.events.every((event) => validateMidiEvent(event).length === 0), "serial MIDI lifecycle events should validate");

  const stealing = voiceStealFixture();
  addCheck(result, "voice_steal", stealing.voiceStealCount === 1 && stealing.maxActive <= 2 && stealing.stolen === "note:10", `voice steal expected one stolen note:10, got count ${stealing.voiceStealCount}, stolen ${stealing.stolen}, max ${stealing.maxActive}`);

  const trace = runEngineTrace(null, { control: makeControl("action", { density: 0.8, energy: 0.7, activity: 0.7, tension: 0.4, brightness: 0.5, variation: 0.3 }), ticks: 264 });
  const finalPanic = trace.engine.panic("user_panic", null);
  trace.midiEvents.push(...finalPanic.events);
  addCheck(result, "note_pairing", noteOnsPaired(trace.midiEvents), "every note_on should have exactly one later note_off by fixture completion");
  addCheck(result, "note_identity", trace.notes.every((note, index) => note.event_index === index && note.note_id === `note:${index}`), "generated note events should be contiguous with canonical note_id values");

  finalizeResult(result);
  return result;
}

function runEngineTrace(fixture, options) {
  options = options || {};
  const engine = new MusicEngineCore();
  const config = patchConfig(engine.defaultConfig, options.configPatch || {});
  const ticks = options.ticks || 256;
  const selectedControl = options.control ? clone(options.control) : control(fixture, options.controlName || "calm");
  const conductors = [];
  const harmonies = [];
  const notes = [];
  const midiEvents = [];
  const rawMidi = [];
  const diagnostics = [];

  engine.fullReset(config);
  engine.enqueueConfig(config, 0);
  engine.enqueueMusicalControl(selectedControl, 0);

  for (let i = 0; i < ticks; i += 1) {
    const step = engine.step();
    conductors.push(step.conductor);
    harmonies.push(step.harmony);
    notes.push(...step.notes);
    midiEvents.push(...step.midi_events);
    rawMidi.push(...step.raw_midi);
    diagnostics.push(...step.diagnostics);
  }

  const harmonyTrace = harmonies.map((harmony) => canonicalize({
    tick_index: harmony.tick_index,
    chord: harmony.chord,
    pitch_pool: harmony.pitch_pool,
    borrowed_pitch_classes: harmony.borrowed_pitch_classes,
    dissonance: harmony.dissonance,
    root_pitch_class: harmony.root_pitch_class,
    scale_name: harmony.scale_name,
    scale_intervals: harmony.scale_intervals,
    register_min: harmony.register_min,
    register_max: harmony.register_max
  }));
  const noteTrace = notes.map((note) => canonicalize(note));

  return {
    engine,
    conductors,
    harmonies,
    notes,
    midiEvents,
    rawMidi,
    diagnostics,
    noteTrace,
    harmonyTrace,
    noteCount: notes.length,
    meanPitch: mean(notes.map((note) => note.pitch)),
    meanDissonance: mean(harmonies.map((harmony) => harmony.dissonance)),
    uniqueBarSignatures: uniqueBarSignatures(notes),
    schemaErrorCount: diagnostics.filter((diagnostic) => diagnostic.event === "schema_error").length
  };
}

function runSteps(engine, count) {
  for (let i = 0; i < count; i += 1) {
    engine.step();
  }
}

function runEventFixture(fixture) {
  const engine = new MusicEngineCore();
  engine.enqueueMusicalControl(control(fixture, "action"), 0);
  runSteps(engine, 128);
  const eventControl = control(fixture, "action");
  eventControl.events.scene_change = true;
  eventControl.events.accent = true;
  eventControl.events.reset_phrase = true;
  engine.enqueueMusicalControl(eventControl, 128);
  const step128 = engine.step();
  const step129 = engine.step();
  const accentNote = step128.notes.concat(step129.notes).some((note) => note.role === "accent");
  const resetFlush = step128.midi_events.some((event) => event.type === "flush" && event.reason === "reset_phrase");

  return {
    sceneTransitionOnlyAt128: step128.conductor.transition === true && step129.conductor.transition === false,
    accentNote,
    resetFlush,
    phraseTickReset: step128.conductor.transport.phrase_tick === 0
  };
}

function serialRawMidiFixture() {
  const midi = new MidiLifecycle();
  const events = [];
  const raw = [];
  const pitches = [60, 64, 67, 72];
  const velocities = [40, 64, 96, 127];

  for (let tick = 0; tick < 8; tick += 1) {
    const notes = [];
    const index = tick / 2;
    if (tick % 2 === 0 && index < pitches.length) {
      notes.push(noteEvent(index, tick, pitches[index], velocities[index], 1, 2));
    }
    const output = midi.processTick(midiContext(tick, 2, 4), notes, false);
    events.push(...output.events);
    raw.push(...output.raw);
  }

  return { events, raw };
}

function voiceStealFixture() {
  const midi = new MidiLifecycle();
  const notes = [
    noteEvent(10, 0, 60, 80, 4, 1),
    noteEvent(11, 0, 64, 80, 4, 1),
    noteEvent(12, 0, 67, 80, 4, 1)
  ];
  const output = midi.processTick(midiContext(0, 1, 2), notes, false);
  const voiceSteals = output.events.filter((event) => event.type === "voice_steal");
  return {
    voiceStealCount: voiceSteals.length,
    stolen: voiceSteals.length ? voiceSteals[0].note_id : null,
    maxActive: Math.max(...output.events.map((event) => event.active_voice_count))
  };
}

function midiContext(tick, channel, maxPolyphony) {
  return {
    timestamp_ms: tick * 100,
    transport: {
      tick_index: tick,
      tick_duration_us: 100000
    },
    max_polyphony: maxPolyphony,
    control_sequence: null,
    midi_channel: channel
  };
}

function noteEvent(index, tick, pitch, velocity, durationTicks, channel) {
  return {
    schema: "SFS_NOTE_EVENT",
    version: "0.1.0",
    timestamp_ms: tick * 100,
    tick_index: tick,
    event_index: index,
    note_id: `note:${index}`,
    pitch,
    velocity,
    duration_ticks: durationTicks,
    duration_ms: durationTicks * 100,
    channel,
    role: "pulse"
  };
}

function noteOnsPaired(events) {
  const active = new Map();
  for (const event of events) {
    if (event.type === "note_on") {
      if (active.has(event.note_id)) {
        return false;
      }
      active.set(event.note_id, event);
    }
    if (event.type === "note_off") {
      if (!active.has(event.note_id)) {
        return false;
      }
      if (event.tick_index < active.get(event.note_id).tick_index) {
        return false;
      }
      active.delete(event.note_id);
    }
  }
  return active.size === 0;
}

function control(fixture, name) {
  return clone(fixture.controls[name]);
}

function makeControl(state, controls) {
  return {
    schema: "SFS_MUSICAL_CONTROL",
    version: "0.1.0",
    timestamp_ms: 0,
    state: {
      name: state,
      confidence: 1,
      changed: state !== "calm",
      previous: state === "calm" ? null : "calm"
    },
    controls: {
      energy: controls.energy,
      density: controls.density,
      tension: controls.tension,
      brightness: controls.brightness,
      activity: controls.activity,
      variation: controls.variation
    },
    events: {
      scene_change: false,
      accent: false,
      reset_phrase: false
    }
  };
}

function allControls(value) {
  return {
    energy: value,
    density: value,
    tension: value,
    brightness: value,
    activity: value,
    variation: value
  };
}

function patchConfig(config, patch) {
  const output = clone(config);
  merge(output, patch || {});
  return output;
}

function merge(target, patch) {
  for (const key of Object.keys(patch)) {
    if (patch[key] && typeof patch[key] === "object" && !Array.isArray(patch[key])) {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }
      merge(target[key], patch[key]);
    } else {
      target[key] = patch[key];
    }
  }
}

function borrowedPitchClassesFromHarmony(harmony) {
  const base = new Set(harmony.scale_intervals.map((interval) => (harmony.root_pitch_class + interval) % 12));
  const borrowed = new Set();
  for (const pitch of harmony.chord.concat(harmony.pitch_pool)) {
    const pc = pitch % 12;
    if (!base.has(pc)) {
      borrowed.add(pc);
    }
  }
  return Array.from(borrowed).sort((a, b) => a - b);
}

function allPitchesInScale(pitches, rootPitchClass, intervals) {
  const base = new Set(intervals.map((interval) => (rootPitchClass + interval) % 12));
  return pitches.every((pitch) => base.has(pitch % 12));
}

function allNotesInRegister(notes, config) {
  const min = Math.max(0, 12 * (config.midi.octave_min + 1));
  const max = Math.min(127, (12 * (config.midi.octave_max + 2)) - 1);
  return notes.every((note) => note.pitch >= min && note.pitch <= max);
}

function uniqueBarSignatures(notes) {
  const signatures = new Set();
  for (let bar = 0; bar < 16; bar += 1) {
    const start = bar * 16;
    const end = start + 16;
    const items = notes
      .filter((note) => note.tick_index >= start && note.tick_index < end)
      .map((note) => `${note.tick_index - start}:${note.pitch % 12}:${note.duration_ticks}:${note.role}`);
    signatures.add(items.join("|"));
  }
  return signatures.size;
}

function sectionAt(trace, tick) {
  return trace.conductors[tick].section;
}

function drawFromState(state, count) {
  const values = [];
  let current = state;
  for (let i = 0; i < count; i += 1) {
    current = nextUint32(current);
    values.push(current);
  }
  return values;
}

function drawPrng(prng, count) {
  const values = [];
  for (let i = 0; i < count; i += 1) {
    values.push(prng.nextUint32());
  }
  return values;
}

function mean(values) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hasEvent(diagnostics, eventName) {
  return diagnostics.some((diagnostic) => diagnostic.event === eventName);
}

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
}

function jsonStable(value) {
  return JSON.stringify(canonicalize(value));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf8"));
}

function relativePath(filename) {
  return path.relative(root, filename).replace(/\\/g, "/");
}

function makeResult(name) {
  return {
    name,
    status: "pass",
    checks: []
  };
}

function addCheck(result, label, pass, detail) {
  result.checks.push({
    label,
    pass: !!pass,
    detail
  });
}

function finalizeResult(result) {
  if (result.checks.some((check) => !check.pass)) {
    result.status = "fail";
  }
}

main();
