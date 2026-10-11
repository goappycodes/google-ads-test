import type { SimState } from "./types";
import { campaignIssues, conversionErrors } from "./validation";
export { validLandingPage } from "./validation";

export const CAMPAIGN_STEPS = [
  "Campaign objective",
  "Bidding",
  "Campaign settings",
  "Keywords and ads",
  "Budget",
  "Review",
] as const;

export type BuildSection = "keywords" | "ads" | "assets";
export type Navigate = (screen: string, step?: number, section?: BuildSection) => void;

export function campaignChecks(state: SimState) {
  const c = state.campaign;
  const issues = campaignIssues(state);
  return [
    { label: "Objective, Search campaign and conversion goals", ok: !issues.some(i => i.step === 0), step: 0 },
    { label: "Campaign name and bid strategy", ok: !issues.some(i => i.step === 1), step: 1 },
    { label: "Locations and languages", ok: !issues.some(i => i.step === 2), step: 2 },
    { label: "At least 3 named ad groups, each with keywords", ok: !issues.some(i => i.field === "adGroups" || i.field.startsWith("group.")), step: 3, section: "keywords" as BuildSection },
    { label: "At least 10 negative keywords", ok: !issues.some(i => i.field === "negativeKeywords"), step: 3, section: "keywords" as BuildSection },
    { label: "One ad per group: 8 headlines, 3 descriptions and an allen.in URL", ok: c.adGroups.length > 0 && !issues.some(i => i.section === "ads"), step: 3, section: "ads" as BuildSection },
    { label: "2 sitelinks with valid URLs, 2 callouts and a call asset", ok: !issues.some(i => i.section === "assets"), step: 3, section: "assets" as BuildSection },
    { label: "Average daily budget", ok: !issues.some(i => i.step === 4), step: 4 },
    { label: "Named conversion action with category and counting setting", ok: state.conversions.length > 0 && state.conversions.every(a => Object.keys(conversionErrors(a)).length === 0), step: -1 },
  ];
}

export function downloadCampaign(state: SimState) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "ads-simulator-backup.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
