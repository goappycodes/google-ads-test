const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { isCaptureShortcut, blockExamShortcut, blockClipboard, blockTextDrop } = require("../components/ads-simulator/examRestrictions.ts");
const { campaignIssues } = require("../components/ads-simulator/validation.ts");
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

test("campaign rationale accepts plain explanations without assessment labels", () => {
  const state = defaultState();
  for (const value of [undefined, "", "   "]) {
    state.rationale = value;
    assert.ok(campaignIssues(state).some(issue => issue.field === "rationale"));
  }
  state.rationale = "I chose local targeting to match the centre and used Planner demand to select my keywords.";
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


test("two populated ad groups satisfy the reduced group requirement", () => {
  const { emptyAdGroup } = require("../components/ads-simulator/store.ts");
  const { campaignChecks } = require("../components/ads-simulator/flow.ts");
  const state = defaultState();
  assert.ok(campaignIssues(state).some(issue => issue.field === "adGroups"));
  state.campaign.adGroups = [emptyAdGroup("Brand"), emptyAdGroup("Local")];
  for (const group of state.campaign.adGroups) group.keywords = [{ id: group.id, text: group.name, match: "phrase" }];
  assert.equal(campaignIssues(state).some(issue => issue.field === "adGroups"), false);
  assert.equal(campaignChecks(state).find(check => check.label.startsWith("At least 2")).ok, true);
});

test("older drafts lose retired fields without losing the remaining campaign", () => {
  const { restoreBackup, STATE_VERSION } = require("../components/ads-simulator/store.ts");
  const legacy = defaultState();
  legacy.version = 1;
  legacy.campaign.name = "Existing student draft";
  legacy.campaign.sitelinks = [{ text: "Previous link" }];
  legacy.campaign.callouts = [{ text: "Previous phrase" }];
  legacy.twistNotes = "Previous notes";
  const restored = restoreBackup(legacy);
  assert.equal(restored.version, STATE_VERSION);
  assert.equal(restored.campaign.name, "Existing student draft");
  assert.equal("sitelinks" in restored.campaign, false);
  assert.equal("callouts" in restored.campaign, false);
  assert.equal("twistNotes" in restored, false);
});

test("a two-group campaign generates a report without retired exam sections", () => {
  const { emptyAdGroup } = require("../components/ads-simulator/store.ts");
  const { buildReport } = require("../components/ads-simulator/report.ts");
  const state = defaultState();
  state.student = { name: "Exam Student" };
  state.rationale = "I chose local targeting to match the centre, and researched keyword demand before creating ads.";
  const c = state.campaign;
  Object.assign(c, { name: "Local Search Campaign", objective: "leads", conversionGoals: ["Submit lead form"], locations: ["Siliguri"], budgetDaily: "1644.74" });
  c.adGroups = ["Brand", "Local"].map(name => ({ ...emptyAdGroup(name), keywords: [{ id: name, text: name.toLowerCase(), match: "phrase" }], ad: { finalUrl: "https://allen.in/jee", path1: "", path2: "", businessName: "ALLEN", headlines: Array.from({ length: 5 }, (_, i) => `Course headline ${i + 1}`), descriptions: ["One-year course for Class 12 pass students.", "Contact the Siliguri centre for course information."] } }));
  c.negativeKeywords = Array.from({ length: 10 }, (_, i) => ({ id: String(i), text: `negative ${i + 1}`, match: "broad" }));
  c.call = { enabled: true, country: "India (+91)", number: "9300000000" };
  state.conversions = [{ id: "conversion", name: "Enquiry form", source: "Website", category: "Submit lead form", valueMode: "none", value: "", count: "one", windowDays: "30", includeInConversions: true }];
  const html = buildReport(state);
  assert.ok(html.includes("Local Search Campaign"));
  assert.ok(html.includes("Campaign rationale"));
  assert.doesNotMatch(html, /midway|twist|sitelink|callout|\bB\d\b/i);
});
