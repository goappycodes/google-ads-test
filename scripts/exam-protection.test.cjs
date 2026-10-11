const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { isCaptureShortcut, blockExamShortcut, blockClipboard, blockTextDrop } = require("../components/ads-simulator/examRestrictions.ts");
const { missingRationaleRows, campaignIssues } = require("../components/ads-simulator/validation.ts");
const { defaultState } = require("../components/ads-simulator/store.ts");

test("capture detection covers PrintScreen, Windows snipping, macOS capture and browser screenshot keys", () => {
  for (const event of [{ key: "PrintScreen" }, { key: "s", metaKey: true, shiftKey: true }, { key: "$", code: "Digit4", metaKey: true, shiftKey: true }, { key: "3", metaKey: true, shiftKey: true }, { key: "s", ctrlKey: true, shiftKey: true }]) assert.equal(isCaptureShortcut(event), true);
  for (const event of [{ key: "s" }, { key: "s", ctrlKey: true }, { key: "4", shiftKey: true }, { key: "ArrowDown" }]) assert.equal(isCaptureShortcut(event), false);
});

test("clipboard and save shortcuts are blocked while typing and selection remain available", () => {
  let blocked = false;
  const event = { preventDefault: () => { blocked = true; }, stopPropagation: () => {} };
  for (const key of ["c", "v", "x", "p", "s", "u"]) { blocked = false; blockExamShortcut({ ...event, key, ctrlKey: true }); assert.equal(blocked, true); }
  for (const key of ["a", "ArrowLeft", "Backspace"]) { blocked = false; blockExamShortcut({ ...event, key, ctrlKey: key === "a" }); assert.equal(blocked, false); }
  blocked = false; blockClipboard(event); assert.equal(blocked, true);
  blocked = false; blockTextDrop({ ...event, dataTransfer: { types: ["text/plain"] } }); assert.equal(blocked, true);
  blocked = false; blockTextDrop({ ...event, dataTransfer: { types: ["Files"] } }); assert.equal(blocked, false);
});

test("report explanations must cover every exam row, rather than one generic statement", () => {
  assert.equal(missingRationaleRows("Because it fits the brief.").length, 10);
  const complete = Array.from({ length: 10 }, (_, i) => `B${i}: My decision follows a cited fact from the brief.`).join("\n");
  assert.deepEqual(missingRationaleRows(complete), []);
  assert.deepEqual(missingRationaleRows(complete.replace("B7:", "Asset reason:")), ["B7"]);
  const state = defaultState();
  assert.ok(campaignIssues(state).some(issue => issue.field === "rationale"));
  state.rationale = complete;
  assert.equal(campaignIssues(state).some(issue => issue.field === "rationale"), false);
});


test("student identification and submission work without a roll number", () => {
  const { reportFilename, submissionMailto } = require("../components/ads-simulator/report.ts");
  const { restoreBackup } = require("../components/ads-simulator/store.ts");
  const state = defaultState();
  state.student = { name: "Sita Sharma" };
  assert.equal(restoreBackup(state).student.name, "Sita Sharma");
  assert.equal(reportFilename(state), "Sita_Sharma_MidSem.html");
  const email = submissionMailto(state);
  assert.ok(email.startsWith("mailto:madhu@nexisschool.com?subject=Sita%20Sharma_MidSem"));
  assert.equal(decodeURIComponent(email).includes("Roll number"), false);
  assert.equal(campaignIssues(state).some(issue => issue.field === "rollNumber"), false);
});
