// Type definitions for the Google Ads simulator.
// Everything here is persisted to localStorage, so keep it JSON-serialisable
// (no Date objects, no functions) and bump STATE_VERSION in store.ts on any
// breaking shape change.

export type MatchType = "broad" | "phrase" | "exact";

export interface Keyword {
  id: string;
  text: string;
  match: MatchType;
}

export interface NegativeKeyword {
  id: string;
  text: string;
  match: MatchType;
}

export interface ResponsiveSearchAd {
  headlines: string[]; // up to 15
  descriptions: string[]; // up to 4
  finalUrl: string;
  path1: string;
  path2: string;
  businessName: string;
}

export interface AdGroup {
  id: string;
  name: string;
  keywords: Keyword[];
  ad: ResponsiveSearchAd;
}

export interface Sitelink {
  id: string;
  text: string;
  desc1: string;
  desc2: string;
  url: string;
}

export interface Callout {
  id: string;
  text: string;
}

export interface CallAsset {
  enabled: boolean;
  country: string;
  number: string;
}

export interface ImageAsset {
  enabled: boolean;
  name: string;
  dataUrl: string; // base64 data URL, kept small
}

export type BidFocus =
  | "conversions"
  | "conversion_value"
  | "clicks"
  | "impression_share";

export interface ScheduleRow {
  id: string;
  days: string; // e.g. "Mon - Fri", "All days", "Sat - Sun"
  start: string; // "08:00"
  end: string; // "22:00"
}

export type LocationOption =
  | "presence_interest"
  | "presence"
  | "interest";

export interface Campaign {
  radiusTargets?: { id: string; center: string; distance: string; unit: "km" | "mi"; mode: "include" | "exclude" }[];
  objective: string; // "leads" | "sales" | "traffic" | "awareness" | "none"
  type: string; // "search" (others shown but disabled)
  conversionGoals: string[];
  name: string;

  bidFocus: BidFocus;
  targetCpaEnabled: boolean;
  targetCpa: string;
  maxCpcLimitEnabled: boolean;
  maxCpcLimit: string;

  networks: {
    search: boolean;
    searchPartners: boolean;
    display: boolean;
  };

  locations: string[]; // chosen target locations (free text names)
  excludedLocations: string[];
  locationOption: LocationOption;

  languages: string[];

  adSchedule: ScheduleRow[];
  startDate: string;
  endDate: string;

  budgetMonthly: string; // "50000"
  budgetDaily: string; // computed working, editable

  adGroups: AdGroup[];
  negativeKeywords: NegativeKeyword[];

  sitelinks: Sitelink[];
  callouts: Callout[];
  call: CallAsset;
  image: ImageAsset;
}

export type ConversionCategory =
  | "Submit lead form"
  | "Phone call lead"
  | "Request quote"
  | "Book appointment"
  | "Sign-up"
  | "Contact"
  | "Purchase"
  | "Page view"
  | "Other";

export interface ConversionAction {
  id: string;
  name: string;
  source: string; // "Website" | "Phone calls" | "Import"
  category: ConversionCategory;
  valueMode: "same" | "different" | "none";
  value: string;
  count: "one" | "every";
  windowDays: string;
  includeInConversions: boolean;
}

export interface SimState {
  version: number;
  accountName: string;
  accountId: string;
  campaign: Campaign;
  conversions: ConversionAction[];
  lastScreen: string;
  lastStep: number;
  // Version the navigation separately to preserve existing campaign drafts.
  wizardVersion?: number;
  buildSection?: "keywords" | "ads" | "assets";
  planner?: { seedsText: string; geo: "siliguri" | "india"; trendKeyword?: string };
  conversionDraft?: ConversionAction | null;
  student?: { name: string };
  rationale?: string;
  twistNotes?: string;
}
