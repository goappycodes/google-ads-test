import type { SimState } from "./types";
import { campaignChecks } from "./flow";
import { OBJECTIVES, BID_FOCUS_OPTIONS, plannerIdeas, trendValues, TREND_MONTHS } from "./data";
import { campaignIssues } from "./validation";

export const SUBMISSION_EMAIL = process.env.NEXT_PUBLIC_SUBMISSION_EMAIL || "madhu@nexisschool.com";
export const SUBMISSION_NAME = process.env.NEXT_PUBLIC_SUBMISSION_NAME || "Madhu";
const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const yes = (value: boolean) => value ? "Yes" : "No";
const rows = (items: [string, unknown][]) => `<table class="details"><tbody>${items.map(([key, value]) => `<tr><th>${escape(key)}</th><td>${escape(value || "—")}</td></tr>`).join("")}</tbody></table>`;
const table = (headers: string[], entries: unknown[][]) => `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${escape(h)}</th>`).join("")}</tr></thead><tbody>${entries.map(row => `<tr>${row.map(cell => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

export function reportFilename(state: SimState) {
  const safe = (value: string) => value.trim().replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 100);
  return `${safe(state.student?.name || "student")}_MidSem.html`;
}

export function submissionMailto(state: SimState) {
  const subject = `${state.student?.name || ""}_MidSem`;
  const body = `Dear ${SUBMISSION_NAME},\n\nPlease find my Google Search Ads practical report attached.\n\nName: ${state.student?.name || ""}\nCampaign: ${state.campaign.name}\n\nAttachment: ${reportFilename(state)}\n\nThank you.`;
  return `mailto:${SUBMISSION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildReport(state: SimState, generatedAt = new Date()): string {
  if (campaignChecks(state).some(c => !c.ok) || campaignIssues(state).some(e => e.step === 5) || !state.student) throw new Error("Complete the campaign setup and student details before generating a report.");
  const c = state.campaign;
  const objective = OBJECTIVES.find(o => o.id === c.objective)?.label;
  const focus = BID_FOCUS_OPTIONS.find(b => b.id === c.bidFocus)?.label;
  const research = plannerIdeas(state.planner?.seedsText || "", state.planner?.geo || "siliguri");
  const selectedTrend = research.find(k => k.text === state.planner?.trendKeyword);
  const image = c.image.enabled && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(c.image.dataUrl) ? `<figure><img src="${escape(c.image.dataUrl)}" alt="Campaign image asset"><figcaption>${escape(c.image.name)}</figcaption></figure>` : "<p>No image asset selected.</p>";
  const sections = [
    `<section><h2>Student and account</h2>${rows([["Name", state.student.name], ["Account", state.accountName], ["Practice account ID", state.accountId]])}</section>`,
    `<section><h2>Campaign and bidding</h2>${rows([["Campaign name", c.name], ["Campaign type", "Search"], ["Objective", objective], ["Conversion goals", c.conversionGoals.join(", ")], ["Bid focus", focus], ["Target CPA enabled", yes(["conversions", "conversion_value"].includes(c.bidFocus) && c.targetCpaEnabled)], ["Target CPA", ["conversions", "conversion_value"].includes(c.bidFocus) && c.targetCpaEnabled ? `INR ${c.targetCpa}` : "Not set"], ["Maximum CPC limit", c.bidFocus === "clicks" && c.maxCpcLimitEnabled ? `INR ${c.maxCpcLimit}` : "Not set"], ["Google Search", yes(c.networks.search)], ["Search partners", yes(c.networks.searchPartners)], ["Display Network", yes(c.networks.display)]])}</section>`,
    `<section><h2>Locations, language and schedule</h2>${rows([["Included locations", c.locations.join("; ") || "None"], ["Excluded locations", c.excludedLocations.join("; ") || "None"], ["Location option", c.locationOption === "presence" ? "Presence: people in or regularly in targeted locations" : c.locationOption === "presence_interest" ? "Presence or interest" : "Search interest"], ["Languages", c.languages.join(", ")], ["Start date", c.startDate || "Not set"], ["End date", c.endDate || "Not set"]])}${(c.radiusTargets || []).length ? `<h3>Radius targeting</h3>${table(["Mode", "Centre", "Distance", "Units"], c.radiusTargets!.map(r => [r.mode, r.center, r.distance, r.unit]))}` : ""}<h3>Ad schedule</h3>${c.adSchedule.length ? table(["Days", "Start", "End"], c.adSchedule.map(r => [r.days, r.start, r.end])) : "<p>All day, every day.</p>"}</section>`,
    `<section><h2>Ad groups, keywords and ads</h2>${c.adGroups.map((g, index) => `<article><h3>${index + 1}. ${escape(g.name)}</h3>${table(["Keyword", "Match type"], g.keywords.map(k => [k.text, k.match]))}${rows([["Final URL", g.ad.finalUrl], ["Display path 1", g.ad.path1], ["Display path 2", g.ad.path2], ["Business name", g.ad.businessName]])}<h4>Headlines</h4><ol>${g.ad.headlines.filter(h => h.trim()).map(h => `<li>${escape(h)}</li>`).join("")}</ol><h4>Descriptions</h4><ol>${g.ad.descriptions.filter(d => d.trim()).map(d => `<li>${escape(d)}</li>`).join("")}</ol></article>`).join("")}</section>`,
    `<section><h2>Negative keywords</h2>${table(["Keyword", "Match type"], c.negativeKeywords.map(k => [k.text, k.match]))}</section>`,
    `<section><h2>Assets</h2>${rows([["Call asset enabled", yes(c.call.enabled)], ["Country", c.call.country], ["Phone number", c.call.number]])}<h3>Image asset</h3>${image}</section>`,
    `<section><h2>Budget</h2>${rows([["Monthly budget", `INR ${c.budgetMonthly}`], ["Working", `${c.budgetMonthly} ÷ 30.4 = ${(Number(c.budgetMonthly) / 30.4).toFixed(2)} per day`], ["Chosen average daily budget", `INR ${c.budgetDaily}`], ["Monthly estimate", `INR ${(Number(c.budgetDaily) * 30.4).toFixed(2)}`]])}</section>`,
    `<section><h2>Conversion actions</h2>${state.conversions.map(a => `<article><h3>${escape(a.name)}</h3>${rows([["Source", a.source], ["Category", a.category], ["Value setting", a.valueMode === "same" ? `Same value: INR ${a.value}` : a.valueMode === "different" ? "Different values" : "No value"], ["Count", a.count === "one" ? "One" : "Every"], ["Click-through window", `${a.windowDays} days`], ["Included in conversions", yes(a.includeInConversions)]])}</article>`).join("")}</section>`,
    `<section><h2>Keyword Planner research</h2>${rows([["Research terms", state.planner?.seedsText || "Full idea list"], ["Selected geography", state.planner?.geo === "india" ? "All of India" : "Siliguri"], ["Data source", "Simulated training data; no live Google Ads data"]])}${table(["Keyword", "Monthly searches: Siliguri", "Monthly searches: India", "Competition", "Top-of-page bid low (INR)", "Top-of-page bid high (INR)"], research.map(k => [k.text, k.siliguri, k.india, k.competition, k.bidLow.toFixed(2), k.bidHigh.toFixed(2)]))}${selectedTrend ? `<h3>12-month trend: ${escape(selectedTrend.text)}</h3>${table(["Month", "Siliguri searches", "India searches"], TREND_MONTHS.map((month, i) => [month, trendValues(selectedTrend, "siliguri")[i], trendValues(selectedTrend, "india")[i]]))}` : "<p>No keyword trend selected.</p>"}</section>`,
    `<section><h2>Campaign rationale</h2><p style="white-space:pre-wrap">${escape(state.rationale || "Not provided")}</p></section>`,
  ];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(state.student.name)} — Google Ads Practical</title><style>
body{margin:0;background:#f1f3f4;color:#202124;font:15px/1.55 Arial,sans-serif}main{max-width:1050px;margin:40px auto;padding:0 24px}header,section{background:#fff;border:1px solid #dadce0;border-radius:8px;margin-bottom:24px;padding:28px}h1,h2,h3,h4{text-align:left;font-weight:500}h1{font-size:28px;margin:0 0 10px}h2{font-size:22px;margin:0 0 20px}h3{font-size:18px;margin:24px 0 12px}h4{font-size:15px;margin:20px 0 8px}.tag{color:#174ea6;font-size:12px;background:#e8f0fe;display:inline-block;padding:4px 10px;border-radius:20px}.meta{color:#5f6368;font-size:13px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;border-bottom:1px solid #e8eaed;padding:10px 12px;vertical-align:top;overflow-wrap:anywhere}th{font-weight:500;color:#5f6368;background:#f8f9fa}.details th{width:30%}.table-wrap{overflow-x:auto}article+article{border-top:1px solid #dadce0;margin-top:30px;padding-top:8px}img{max-width:420px;width:100%;height:auto;border-radius:8px}figure{margin:0}figcaption,footer{font-size:12px;color:#5f6368}li{margin-bottom:6px}@media(max-width:600px){main{padding:0 12px;margin:16px auto}header,section{padding:18px}.details th{width:38%}}
</style></head><body><main><header><span class="tag">NEXIS · Simulation report</span><h1>Google Search Ads Practical</h1><p class="meta">Generated ${escape(generatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "medium" }))} IST</p><p>This report records the student's complete simulated setup. No campaign was published and no money was spent.</p></header>${sections.join("")}<footer>Submission recipient: ${SUBMISSION_EMAIL} · This report contains simulated campaign settings.</footer></main></body></html>`;
}

export function downloadReport(state: SimState) {
  const html = buildReport(state);
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = reportFilename(state); link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
