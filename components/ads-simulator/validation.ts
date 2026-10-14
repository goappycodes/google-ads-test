import type { ConversionAction, SimState } from "./types";
import type { BuildSection } from "./flow";

export function validLandingPage(value: string): boolean {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && (url.hostname === "allen.in" || url.hostname.endsWith(".allen.in")); } catch { return false; }
}

export interface ValidationIssue { field: string; message: string; step: number; section?: BuildSection }
export const validMoney = (value: string) => /^\d+(\.\d{1,2})?$/.test(value.trim()) && Number.isFinite(Number(value)) && Number(value) > 0;
export const validPhone = (value: string) => /^[+\d\s()-]+$/.test(value) && value.replace(/\D/g, "").length >= 10 && value.replace(/\D/g, "").length <= 15;

export function campaignIssues(state: SimState): ValidationIssue[] {
  const c = state.campaign;
  const errors: ValidationIssue[] = [];
  const add = (field: string, message: string, step: number, section?: BuildSection) => errors.push({ field, message, step, section });
  if (!["sales", "leads", "traffic", "none"].includes(c.objective)) add("objective", "Choose a campaign objective.", 0);
  if (c.type !== "search") add("type", "Select Search for this practical.", 0);
  if (!c.conversionGoals.length) add("conversionGoals", "Select at least one conversion goal.", 0);
  if (!c.name.trim()) add("name", "Enter a campaign name.", 1);
  if (!["conversions", "conversion_value", "clicks", "impression_share"].includes(c.bidFocus)) add("bidFocus", "Choose a bid focus.", 1);
  if (c.name.length > 128) add("name", "Use 128 characters or fewer.", 1);
  if (["conversions", "conversion_value"].includes(c.bidFocus) && c.targetCpaEnabled && !validMoney(c.targetCpa)) add("targetCpa", "Enter a target cost greater than 0, with at most 2 decimal places.", 1);
  if (c.bidFocus === "clicks" && c.maxCpcLimitEnabled && !validMoney(c.maxCpcLimit)) add("maxCpcLimit", "Enter a CPC limit greater than 0, with at most 2 decimal places.", 1);
  const radii = c.radiusTargets || [];
  if (!c.locations.length && !radii.some(r => r.mode === "include")) add("locations", "Include at least one location or radius.", 2);
  if (!c.languages.length) add("languages", "Select at least one language.", 2);
  if (c.locations.some(l => c.excludedLocations.some(x => x.trim().toLowerCase() === l.trim().toLowerCase()))) add("locations", "A location cannot be both included and excluded.", 2);
  c.adSchedule.forEach(row => {
    if (!/^\d{2}:\d{2}$/.test(row.start) || !/^\d{2}:\d{2}$/.test(row.end) || row.start >= row.end) add(`schedule.${row.id}`, "Choose an end time after the start time. Split overnight schedules into separate rows.", 2);
  });
  if (c.startDate && c.endDate && c.endDate < c.startDate) add("endDate", "End date must be on or after the start date.", 2);
  if (radii.some(r => !r.center.trim() || !Number.isFinite(Number(r.distance)) || Number(r.distance) * (r.unit === "mi" ? 1.609344 : 1) < 1 || !["km", "mi"].includes(r.unit))) add("locations", "Every radius needs a centre and a distance covering at least 1 km.", 2);
  if (c.adGroups.length < 2) add("adGroups", "Create at least 2 ad groups for this practical.", 3, "keywords");
  const names = new Set<string>();
  c.adGroups.forEach(g => {
    const key = g.name.trim().toLowerCase();
    if (!key || g.name.length > 128) add(`group.${g.id}.name`, "Enter an ad group name of 1–128 characters.", 3, "keywords");
    else if (names.has(key)) add(`group.${g.id}.name`, "Use a different name for each ad group.", 3, "keywords");
    names.add(key);
    if (!g.keywords.length) add(`group.${g.id}.keywords`, "Add at least one keyword to this ad group.", 3, "keywords");
    if (g.keywords.some(k => k.text.length > 80 || !k.text.trim())) add(`group.${g.id}.keywords`, "Keywords must contain 1–80 characters.", 3, "keywords");
    const a = g.ad;
    if (!validLandingPage(a.finalUrl)) add(`ad.${g.id}.url`, "Enter a valid http or https URL on allen.in.", 3, "ads");
    if (a.headlines.filter(h => h.trim()).length < 5) add(`ad.${g.id}.headlines`, "Write at least 5 headlines for this ad.", 3, "ads");
    if (a.descriptions.filter(d => d.trim()).length < 2) add(`ad.${g.id}.descriptions`, "Write at least 2 descriptions for this ad.", 3, "ads");
    a.headlines.forEach((h, i) => { if (h.length > 30) add(`ad.${g.id}.headline.${i}`, "Use 30 characters or fewer.", 3, "ads"); });
    a.descriptions.forEach((d, i) => { if (d.length > 90) add(`ad.${g.id}.description.${i}`, "Use 90 characters or fewer.", 3, "ads"); });
    if (a.path1.length > 15 || a.path2.length > 15) add(`ad.${g.id}.paths`, "Each display path can contain at most 15 characters.", 3, "ads");
  });
  if (c.negativeKeywords.length < 5) add("negativeKeywords", "Add at least 5 negative keywords for this practical.", 3, "keywords");
  if (c.negativeKeywords.some(k => !k.text.trim() || k.text.length > 80)) add("negativeKeywords", "Negative keywords must contain 1–80 characters.", 3, "keywords");
  if (!c.call.enabled) add("call", "Enable a call asset for this practical.", 3, "assets");
  else if (!validPhone(c.call.number)) add("callNumber", "Enter a phone number with 10–15 digits.", 3, "assets");
  if (c.image.enabled && !c.image.dataUrl) add("image", "Upload an image or turn off the optional image asset.", 3, "assets");
  if (!validMoney(c.budgetDaily)) add("budgetDaily", "Enter a daily budget greater than 0, with at most 2 decimal places.", 4);
  if (!state.student?.name.trim() || state.student.name.length > 100) add("studentName", "Enter your name (1–100 characters).", 5);
  if (!state.rationale?.trim()) add("rationale", "Explain your campaign decisions in your own words.", 5);
  if (state.conversionDraft) add("reportReady", "Save or cancel the unfinished conversion action before generating your report.", 5);
  return errors;
}

export function conversionErrors(a: ConversionAction): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!a.name.trim() || a.name.length > 100) errors.conversionName = "Enter a conversion name of 1–100 characters.";
  if (!a.category) errors.conversionCategory = "Select a conversion category.";
  if (a.valueMode === "same" && !validMoney(a.value)) errors.conversionValue = "Enter a value greater than 0, with at most 2 decimal places.";
  if (!["one", "every"].includes(a.count)) errors.conversionCount = "Choose One or Every.";
  return errors;
}
