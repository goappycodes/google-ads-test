// localStorage persistence + default state for the simulator.
// All reads/writes are wrapped so the page still renders in private windows or
// when storage is blocked.

import type {
  SimState,
  Campaign,
  AdGroup,
  ResponsiveSearchAd,
} from "./types";

export const STATE_VERSION = 1;
export const STORAGE_KEY = "nexis.adsSimulator.v1";
export const UNLOCK_KEY = "nexis.adsSimulator.unlocked";
export const UNLOCK_CODE = "allen2027";

export function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function emptyAd(): ResponsiveSearchAd {
  return {
    headlines: Array(8).fill(""),
    descriptions: Array(3).fill(""),
    finalUrl: "",
    path1: "",
    path2: "",
    businessName: "",
  };
}

export function emptyAdGroup(name = "Ad group 1"): AdGroup {
  return {
    id: uid(),
    name,
    keywords: [],
    ad: emptyAd(),
  };
}

function defaultCampaign(): Campaign {
  return {
    objective: "",
    type: "search",
    conversionGoals: [],
    name: "",
    bidFocus: "conversions",
    targetCpaEnabled: false,
    targetCpa: "",
    maxCpcLimitEnabled: false,
    maxCpcLimit: "",
    networks: { search: true, searchPartners: false, display: false },
    locations: [],
    excludedLocations: [],
    locationOption: "presence",
    languages: ["English"],
    adSchedule: [],
    startDate: "",
    endDate: "",
    budgetMonthly: "50000",
    budgetDaily: "",
    adGroups: [emptyAdGroup()],
    negativeKeywords: [],
    sitelinks: [],
    callouts: [],
    call: { enabled: false, country: "India (+91)", number: "" },
    image: { enabled: false, name: "", dataUrl: "" },
  };
}

export function defaultState(): SimState {
  return {
    version: STATE_VERSION,
    accountName: "ALLEN Siliguri",
    accountId: "728-193-4506",
    campaign: defaultCampaign(),
    conversions: [],
    lastScreen: "guide",
    lastStep: 0,
    wizardVersion: 2,
    buildSection: "keywords",
  };
}

export function loadState(): SimState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as SimState;
    if (!parsed || typeof parsed !== "object" || parsed.version !== STATE_VERSION) {
      return defaultState();
    }
    // Shallow-merge onto defaults so new fields added later don't crash.
    const base = defaultState();
    return upgradeNavigation({
      ...base,
      ...parsed,
      wizardVersion: parsed.wizardVersion,
      buildSection: parsed.buildSection,
      campaign: { ...base.campaign, ...parsed.campaign },
    });
  } catch {
    return defaultState();
  }
}

export function upgradeNavigation(state: SimState): SimState {
  const legacy = state.wizardVersion !== 2;
  const step = legacy ? [0, 0, 1, 2, 3, 3, 3, 4, 5][state.lastStep] ?? 0 : state.lastStep;
  return { ...state, wizardVersion: 2,
    lastStep: Number.isFinite(step) ? Math.min(Math.max(step, 0), 5) : 0,
    buildSection: state.buildSection || (legacy && state.lastStep === 5 ? "ads" : legacy && state.lastStep === 6 ? "assets" : "keywords"),
    campaign: { ...state.campaign, budgetDaily: legacy && !state.campaign.budgetDaily && Number(state.campaign.budgetMonthly) > 0 ? (Number(state.campaign.budgetMonthly) / 30.4).toFixed(2) : state.campaign.budgetDaily },
  };
}

export function restoreBackup(value: unknown): SimState {
  if (!value || typeof value !== "object") throw new Error("Invalid backup");
  const state = value as SimState;
  if (state.version !== STATE_VERSION || !state.campaign || !Array.isArray(state.campaign.adGroups) || !Array.isArray(state.conversions)) throw new Error("Invalid backup");
  const base = defaultState();
  const candidate = { ...base, ...state, campaign: { ...base.campaign, ...state.campaign } };
  // Compare required scalar fields to their defaults, then check each list's shape.
  const matches = (item: unknown, template: unknown): boolean => {
    if (Array.isArray(template)) return Array.isArray(item) && item.every(entry => matches(entry, template[0] ?? ""));
    if (template && typeof template === "object") return !!item && typeof item === "object" && Object.entries(template).every(([key, expected]) => matches((item as Record<string, unknown>)[key], expected));
    return typeof item === typeof template;
  };
  const c = candidate.campaign;
  if (state.student && !matches(state.student, { name: "" })) throw new Error("Invalid student details");
  const template = { ...base.campaign,
    adGroups: [{ ...emptyAdGroup(), keywords: [{ id: "", text: "", match: "" }] }],
    negativeKeywords: [{ id: "", text: "", match: "" }],
    sitelinks: [{ id: "", text: "", desc1: "", desc2: "", url: "" }],
    callouts: [{ id: "", text: "" }],
    adSchedule: [{ id: "", days: "", start: "", end: "" }],
  };
  const conversionTemplate = { id: "", name: "", source: "", category: "", valueMode: "", value: "", count: "", windowDays: "", includeInConversions: true };
  if (c.radiusTargets && (!matches(c.radiusTargets, [{ id: "", center: "", distance: "", unit: "", mode: "" }]) || c.radiusTargets.some(r => !["km", "mi"].includes(r.unit) || !["include", "exclude"].includes(r.mode)))) throw new Error("Invalid radius targets");
  if (!matches(c, template) || c.adGroups.length === 0 || !state.conversions.every(a => matches(a, conversionTemplate) && ["one", "every"].includes(a.count)) || (state.conversionDraft && !matches(state.conversionDraft, conversionTemplate))) throw new Error("Invalid backup");
  candidate.wizardVersion = state.wizardVersion;
  candidate.buildSection = state.buildSection;
  return upgradeNavigation(candidate);
}

export function saveState(state: SimState): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function isUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function setUnlocked(v: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (v) window.localStorage.setItem(UNLOCK_KEY, "1");
    else window.localStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* ignore */
  }
}
