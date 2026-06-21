#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  StateMachine,
  validateMusicalControlPayload
} = require("../patchers/sfs.interpretation.state_machine.js");

const root = path.resolve(__dirname, "..");
const fixturePath = path.join(root, "devtools", "testdata", "layer_b", "interpretation_mvp_sequences.json");
const reportPath = path.join(root, "logs", "tests", "layer_b_selftest.latest.json");
const logPath = path.join(root, "logs", "tests", "layer_b_selftest.jsonl");

function main() {
  const started = Date.now();
  const fixtures = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  const results = [];

  for (const testCase of fixtures.cases) {
    results.push(runPositiveCase(testCase));
  }

  for (const testCase of fixtures.negative_cases || []) {
    results.push(runNegativeCase(testCase));
  }

  const passed = results.filter((result) => result.status === "pass").length;
  const failed = results.length - passed;
  const summary = {
    schema: "SFS_LAYER_B_SELFTEST",
    version: "0.1.0",
    status: failed === 0 ? "pass" : "fail",
    passed,
    failed,
    duration_ms: Date.now() - started,
    fixture: path.relative(root, fixturePath).replace(/\\/g, "/"),
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

  console.log(`SFS Layer B self-test ${summary.status}: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    for (const result of results) {
      if (result.status !== "pass") {
        console.log(`${result.name}: ${result.checks.filter((check) => !check.pass).map((check) => check.detail).join("; ")}`);
      }
    }
    process.exit(1);
  }
}

function runPositiveCase(testCase) {
  const machine = new StateMachine();
  const outputs = [];
  const result = makeResult(testCase.id);

  for (let index = 0; index < testCase.inputs.length; index += 1) {
    const interpretation = machine.interpret(testCase.inputs[index]);

    addCheck(result, `input_${index}_accepted`, interpretation.valid, `input ${index} should be valid: ${interpretation.errors.join("; ")}`);

    if (!interpretation.valid) {
      continue;
    }

    const outputErrors = validateMusicalControlPayload(interpretation.payload);
    addCheck(result, `output_${index}_schema`, outputErrors.length === 0, `output ${index} schema errors: ${outputErrors.join("; ")}`);
    outputs.push(interpretation.payload);
  }

  if (outputs.length > 0) {
    assertExpected(testCase, outputs, result);
  } else {
    addCheck(result, "outputs_present", false, "case produced no outputs");
  }

  finalizeResult(result);
  return result;
}

function runNegativeCase(testCase) {
  const machine = new StateMachine();
  const result = makeResult(testCase.id);
  const interpretation = machine.interpret(testCase.input);

  addCheck(result, "input_rejected", !interpretation.valid, "invalid input should be rejected");
  addCheck(result, "no_trusted_output", !interpretation.valid || !interpretation.payload, "trusted output should not be produced");

  finalizeResult(result);
  return result;
}

function assertExpected(testCase, outputs, result) {
  const expected = testCase.expected || {};
  const finalOutput = outputs[outputs.length - 1];

  if (expected.final_state) {
    addCheck(result, "final_state", finalOutput.state.name === expected.final_state, `expected final state ${expected.final_state}, got ${finalOutput.state.name}`);
  }

  if (expected.final_state_allowed) {
    addCheck(result, "final_state_allowed", expected.final_state_allowed.indexOf(finalOutput.state.name) >= 0, `expected final state in ${expected.final_state_allowed.join(",")}, got ${finalOutput.state.name}`);
  }

  if (expected.final_controls) {
    for (const name of Object.keys(expected.final_controls)) {
      const range = expected.final_controls[name];
      const value = finalOutput.controls[name];
      addCheck(result, `final_controls_${name}`, value >= range.min && value <= range.max, `${name} expected ${range.min}..${range.max}, got ${value}`);
    }
  }

  if (expected.sequence) {
    assertSequence(expected.sequence, outputs, result);
  }

  if (expected.event_frames) {
    for (const eventFrame of expected.event_frames) {
      const output = outputs[eventFrame.input_index];
      addCheck(result, `event_frame_${eventFrame.input_index}_present`, !!output, `missing output for event frame ${eventFrame.input_index}`);
      if (output) {
        for (const key of ["scene_change", "accent", "reset_phrase"]) {
          if (Object.prototype.hasOwnProperty.call(eventFrame, key)) {
            addCheck(result, `event_frame_${eventFrame.input_index}_${key}`, output.events[key] === eventFrame[key], `event frame ${eventFrame.input_index} ${key} expected ${eventFrame[key]}, got ${output.events[key]}`);
          }
        }
      }
    }
  }
}

function assertSequence(expected, outputs, result) {
  const counts = {
    state_changes: outputs.filter((output) => output.state.changed).length,
    scene_change: outputs.filter((output) => output.events.scene_change).length,
    accent: outputs.filter((output) => output.events.accent).length,
    reset_phrase: outputs.filter((output) => output.events.reset_phrase).length
  };

  assertCount(expected, result, "state_changes", counts.state_changes);
  assertCount(expected, result, "scene_change", counts.scene_change);
  assertCount(expected, result, "accent", counts.accent);
  assertCount(expected, result, "reset_phrase", counts.reset_phrase);
}

function assertCount(expected, result, name, value) {
  if (Object.prototype.hasOwnProperty.call(expected, name)) {
    addCheck(result, name, value === expected[name], `${name} expected ${expected[name]}, got ${value}`);
  }
  if (Object.prototype.hasOwnProperty.call(expected, `${name}_min`)) {
    addCheck(result, `${name}_min`, value >= expected[`${name}_min`], `${name} expected >= ${expected[`${name}_min`]}, got ${value}`);
  }
  if (Object.prototype.hasOwnProperty.call(expected, `${name}_max`)) {
    addCheck(result, `${name}_max`, value <= expected[`${name}_max`], `${name} expected <= ${expected[`${name}_max`]}, got ${value}`);
  }
  if (Object.prototype.hasOwnProperty.call(expected, `${name}_count`)) {
    addCheck(result, `${name}_count`, value === expected[`${name}_count`], `${name} count expected ${expected[`${name}_count`]}, got ${value}`);
  }
  if (Object.prototype.hasOwnProperty.call(expected, `${name}_count_min`)) {
    addCheck(result, `${name}_count_min`, value >= expected[`${name}_count_min`], `${name} count expected >= ${expected[`${name}_count_min`]}, got ${value}`);
  }
  if (Object.prototype.hasOwnProperty.call(expected, `${name}_count_max`)) {
    addCheck(result, `${name}_count_max`, value <= expected[`${name}_count_max`], `${name} count expected <= ${expected[`${name}_count_max`]}, got ${value}`);
  }
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
