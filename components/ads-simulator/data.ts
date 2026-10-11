// Static reference data for the simulator: the mock Keyword Planner dataset,
import type { IconName } from "./icons";
// option lists for the campaign wizard, and the brief facts shown in the Guide.
//
// The Keyword Planner numbers are invented but plausible, and are deliberately
// shaped so the pedagogy of the exam works: nationally "allen" is enormous, but
// in Siliguri the real demand is tiny — which is the whole point of the B2
// "was the director's 'across India' instruction right?" caption.

export type Competition = "Low" | "Medium" | "High";

// Twelve-month seasonality profiles (index 0 = 12 months ago ... 11 = latest).
// "Today" in the brief is the first week of April, so the trailing window runs
// May (prev year) -> April (current). JEE search demand peaks around results
// (May–Jul) and admissions, and dips Oct–Dec.
export const TREND_MONTHS = [
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
];

const SEASON: Record<string, number[]> = {
  // Dropper / repeater intent: spikes hard right after results.
  dropper: [1.9, 2.1, 1.7, 1.0, 0.7, 0.5, 0.5, 0.6, 0.9, 1.1, 1.3, 1.7],
  // Brand searches: steadier, mild results-season lift.
  brand: [1.25, 1.3, 1.15, 0.95, 0.85, 0.8, 0.85, 0.9, 1.0, 1.05, 1.1, 1.2],
  // General coaching / admissions: broad Apr–Jul season.
  admissions: [1.5, 1.6, 1.5, 1.1, 0.8, 0.6, 0.6, 0.7, 0.9, 1.1, 1.3, 1.6],
  // Results / login / utility: single sharp results spike.
  results: [2.6, 2.2, 1.2, 0.7, 0.5, 0.4, 0.4, 0.5, 0.7, 0.9, 1.3, 2.4],
};

export interface PlannerKeyword {
  text: string;
  india: number; // avg monthly searches, all of India
  siliguri: number; // avg monthly searches, Siliguri area
  competition: Competition;
  compIndex: number; // 0-100 like Google's "Competition (indexed value)"
  bidLow: number; // top-of-page bid, low range (₹)
  bidHigh: number; // top-of-page bid, high range (₹)
  season: keyof typeof SEASON;
  note?: string; // internal hint (not shown in the table)
}

// Seeded so "idea" rows and the required keywords are all here. Students type
// seeds and we return any row whose text contains a seed token (see planner).
export const KEYWORD_DB: PlannerKeyword[] = [
  // --- Core intent: droppers / repeaters / one-year ---
  { text: "jee dropper batch", india: 2400, siliguri: 20, competition: "High", compIndex: 88, bidLow: 14, bidHigh: 48, season: "dropper" },
  { text: "jee repeater course", india: 1600, siliguri: 10, competition: "High", compIndex: 84, bidLow: 12, bidHigh: 40, season: "dropper" },
  { text: "jee dropper batch 2026", india: 1300, siliguri: 10, competition: "High", compIndex: 86, bidLow: 13, bidHigh: 44, season: "dropper" },
  { text: "drop year for jee", india: 2900, siliguri: 30, competition: "Medium", compIndex: 61, bidLow: 8, bidHigh: 30, season: "dropper" },
  { text: "best coaching for jee droppers", india: 880, siliguri: 10, competition: "High", compIndex: 90, bidLow: 18, bidHigh: 60, season: "dropper" },
  { text: "one year jee course", india: 480, siliguri: 10, competition: "Medium", compIndex: 58, bidLow: 11, bidHigh: 38, season: "dropper" },
  { text: "jee coaching after 12th", india: 1000, siliguri: 10, competition: "High", compIndex: 82, bidLow: 15, bidHigh: 52, season: "admissions" },
  { text: "coaching for iit after 12th", india: 720, siliguri: 10, competition: "High", compIndex: 83, bidLow: 16, bidHigh: 50, season: "admissions" },

  // --- Brand ---
  { text: "allen", india: 550000, siliguri: 1900, competition: "High", compIndex: 74, bidLow: 6, bidHigh: 22, season: "brand" },
  { text: "allen kota", india: 165000, siliguri: 390, competition: "High", compIndex: 70, bidLow: 5, bidHigh: 18, season: "brand" },
  { text: "allen career institute", india: 90500, siliguri: 320, competition: "High", compIndex: 68, bidLow: 5, bidHigh: 17, season: "brand" },
  { text: "allen siliguri", india: 320, siliguri: 210, competition: "Medium", compIndex: 44, bidLow: 4, bidHigh: 14, season: "brand" },
  { text: "allen online", india: 22000, siliguri: 90, competition: "High", compIndex: 72, bidLow: 5, bidHigh: 16, season: "brand" },
  { text: "allen fees", india: 9900, siliguri: 70, competition: "Medium", compIndex: 48, bidLow: 3, bidHigh: 11, season: "brand" },

  // --- General JEE / coaching ---
  { text: "jee main coaching", india: 8100, siliguri: 70, competition: "High", compIndex: 85, bidLow: 10, bidHigh: 36, season: "admissions" },
  { text: "jee advanced coaching", india: 4400, siliguri: 40, competition: "High", compIndex: 84, bidLow: 10, bidHigh: 34, season: "admissions" },
  { text: "iit coaching", india: 18100, siliguri: 140, competition: "High", compIndex: 86, bidLow: 9, bidHigh: 32, season: "admissions" },
  { text: "jee coaching near me", india: 6600, siliguri: 90, competition: "High", compIndex: 80, bidLow: 12, bidHigh: 40, season: "admissions" },
  { text: "best jee coaching", india: 5400, siliguri: 50, competition: "High", compIndex: 87, bidLow: 13, bidHigh: 42, season: "admissions" },

  // --- Local (Siliguri / North Bengal) ---
  { text: "jee coaching in siliguri", india: 170, siliguri: 140, competition: "Medium", compIndex: 46, bidLow: 9, bidHigh: 28, season: "admissions" },
  { text: "coaching in siliguri", india: 480, siliguri: 320, competition: "Medium", compIndex: 42, bidLow: 6, bidHigh: 20, season: "admissions" },
  { text: "iit coaching in siliguri", india: 90, siliguri: 70, competition: "Medium", compIndex: 44, bidLow: 8, bidHigh: 26, season: "admissions" },
  { text: "best coaching in siliguri", india: 210, siliguri: 170, competition: "Medium", compIndex: 45, bidLow: 7, bidHigh: 24, season: "admissions" },

  // --- Low-intent / off-target (great negative-keyword candidates) ---
  { text: "allen result", india: 40500, siliguri: 170, competition: "Low", compIndex: 8, bidLow: 1, bidHigh: 5, season: "results", note: "result-seekers, not buyers" },
  { text: "allen login", india: 60500, siliguri: 260, competition: "Low", compIndex: 5, bidLow: 1, bidHigh: 4, season: "results", note: "existing students" },
  { text: "allen scholarship", india: 14800, siliguri: 110, competition: "Low", compIndex: 22, bidLow: 2, bidHigh: 7, season: "admissions", note: "ASAT / free-seekers" },
  { text: "allen neet", india: 33100, siliguri: 170, competition: "High", compIndex: 66, bidLow: 6, bidHigh: 20, season: "brand", note: "medical, not JEE" },
  { text: "neet dropper batch", india: 9900, siliguri: 40, competition: "High", compIndex: 82, bidLow: 12, bidHigh: 42, season: "dropper", note: "medical, not JEE" },
  { text: "free jee coaching", india: 2900, siliguri: 30, competition: "Low", compIndex: 18, bidLow: 2, bidHigh: 9, season: "admissions", note: "free intent" },
  { text: "jee coaching jobs", india: 390, siliguri: 10, competition: "Low", compIndex: 12, bidLow: 1, bidHigh: 6, season: "admissions", note: "jobs, not students" },
  { text: "allen dlp", india: 5400, siliguri: 20, competition: "Medium", compIndex: 40, bidLow: 3, bidHigh: 10, season: "brand", note: "distance material" },
  { text: "class 11 jee coaching", india: 1900, siliguri: 20, competition: "High", compIndex: 80, bidLow: 11, bidHigh: 38, season: "admissions", note: "wrong class" },

  // --- Competitors (observe or exclude) ---
  { text: "physics wallah", india: 246000, siliguri: 1300, competition: "High", compIndex: 64, bidLow: 4, bidHigh: 14, season: "brand", note: "competitor" },
  { text: "aakash", india: 135000, siliguri: 720, competition: "High", compIndex: 67, bidLow: 5, bidHigh: 17, season: "brand", note: "competitor" },
  { text: "fiitjee", india: 110000, siliguri: 480, competition: "High", compIndex: 65, bidLow: 5, bidHigh: 16, season: "brand", note: "competitor" },
];

export function trendValues(kw: PlannerKeyword, geo: "india" | "siliguri"): number[] {
  const base = geo === "india" ? kw.india : kw.siliguri;
  const profile = SEASON[kw.season];
  const avg = profile.reduce((a, b) => a + b, 0) / profile.length;
  return profile.map((m) => Math.round((base * m) / avg));
}

// --- Wizard option lists --------------------------------------------------

export const OBJECTIVES: { id: string; label: string; desc: string; icon: IconName; disabled?: boolean }[] = [
  { id: "sales", label: "Sales", desc: "Drive sales online, in app, by phone, or in store", icon: "sell" },
  { id: "leads", label: "Leads", desc: "Get leads and other conversions by encouraging customers to take action", icon: "group" },
  { id: "traffic", label: "Website traffic", desc: "Get the right people to visit your website", icon: "public" },
  { id: "app", label: "App promotion", desc: "Get more installs and engagement for your app", icon: "play", disabled: true },
  { id: "awareness", label: "YouTube reach, views and engagements", desc: "Drive awareness and consideration of your product or brand. Previously known as 'Awareness and consideration'", icon: "campaign", disabled: true },
  { id: "local", label: "Local shop visits and promotions", desc: "Drive visits to local shops, including restaurants and dealerships.", icon: "location", disabled: true },
  { id: "none", label: "Create a campaign without guidance", desc: "You'll choose a campaign next", icon: "settings" },
];

export const CAMPAIGN_TYPES: { id: string; label: string; desc: string; icon: IconName; enabled: boolean }[] = [
  { id: "search", label: "Search", desc: "Get in front of high-intent customers at the right time on Google Search", icon: "search", enabled: true },
  { id: "pmax", label: "Performance Max", desc: "Reach audiences across all of Google with a single campaign", icon: "bolt", enabled: false },
  { id: "display", label: "Display", desc: "Reach customers across 3 million sites and apps with engaging creative", icon: "image", enabled: false },
  { id: "shopping", label: "Shopping", desc: "Promote your products with retail-centric campaigns", icon: "cart", enabled: false },
  { id: "video", label: "Video", desc: "Reach viewers on YouTube and get conversions", icon: "play", enabled: false },
  { id: "demandgen", label: "Demand Gen", desc: "Run ads on YouTube, Discover and Gmail", icon: "spark", enabled: false },
];

export const CONVERSION_GOAL_OPTIONS = [
  "Submit lead form",
  "Contact",
  "Book appointment",
  "Sign-up",
  "Request quote",
  "Phone call leads",
  "Purchases",
  "Page views",
];

export const BID_FOCUS_OPTIONS: { id: string; label: string }[] = [
  { id: "conversions", label: "Conversions" },
  { id: "conversion_value", label: "Conversion value" },
  { id: "clicks", label: "Clicks" },
  { id: "impression_share", label: "Impression share" },
];

export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Bengali",
  "Assamese",
  "Nepali",
  "All languages",
];

export const LOCATION_SUGGESTIONS = [
  "Siliguri, West Bengal, India",
  "Jalpaiguri, West Bengal, India",
  "Darjeeling, West Bengal, India",
  "Cooch Behar, West Bengal, India",
  "Alipurduar, West Bengal, India",
  "Kalimpong, West Bengal, India",
  "Sikkim, India",
  "Kishanganj, Bihar, India",
  "India",
  "West Bengal, India",
];

export const CONVERSION_CATEGORIES = [
  "Submit lead form",
  "Phone call lead",
  "Request quote",
  "Book appointment",
  "Sign-up",
  "Contact",
  "Purchase",
  "Page view",
  "Other",
];

// Suggested landing pages on allen.in (students pick the best per ad group).
export const ALLEN_PAGES = [
  "https://allen.in/",
  "https://allen.in/jee",
  "https://allen.in/jee/dropper",
  "https://allen.in/jee/online-coaching",
  "https://allen.in/centers/siliguri",
  "https://allen.in/scholarship-asat",
];

// --- Brief facts (for the Guide / reference panel) ------------------------

export const BRIEF = {
  centre: "ALLEN Siliguri, Tradium Complex, Checkpost, Sevoke Road",
  course: '"Leader" course for Class 12 pass students, 1 year, classroom or online',
  feeClassroom: "₹1,46,610 + taxes",
  feeOnline: "₹90,677 + tax",
  hostel: "None. Paying-guest rooms nearby",
  today: "First week of April. JEE Main final results in ~2 weeks; JEE Advanced in ~8 weeks",
  batch: "Starts soon after JEE Advanced results",
  budget: "₹50,000 per month",
  website: "allen.in",
  source: "Centre and fee details from a public listing (Collegedunia).",
};

// Maps each exam row to where it's done in the simulator (shown in the Guide).
export const EXAM_ROWS = [
  { id: "B0", title: "Keyword Planner", marks: 6, where: "Tools → Keyword Planner", must: '8 keywords incl. "allen" and "jee dropper batch"; monthly searches + top-of-page bid for Siliguri then all India; 12-month trend for one keyword' },
  { id: "B1", title: "Campaign settings", marks: 3, where: "Build campaign → Objective, Type, Bidding", must: "Objective, networks, bid strategy" },
  { id: "B2", title: "Location targeting", marks: 6, where: "Campaigns → Campaign settings → Locations", must: 'Places chosen + Location options setting; caption on whether "across India" was right, with a number from B0' },
  { id: "B3", title: "Language and schedule", marks: 4, where: "Campaigns → Campaign settings", must: "Languages, days and hours" },
  { id: "B4", title: "Ad groups and keywords", marks: 8, where: "Campaigns → Keywords and ads → Keywords", must: "≥3 ad groups, each for a different searcher, with match types" },
  { id: "B5", title: "Negative keywords", marks: 5, where: "Campaigns → Keywords and ads → Keywords → Negative keywords", must: "≥10, specific to this brief" },
  { id: "B6", title: "Ads", marks: 6, where: "Campaigns → Keywords and ads → Ads", must: "One ad per ad group: 8+ headlines, 3+ descriptions, final URL on allen.in" },
  { id: "B7", title: "Assets", marks: 2, where: "Campaigns → Keywords and ads → Assets", must: "Call, 2 sitelinks, 2 callouts; an image if available" },
  { id: "B8", title: "Budget", marks: 2, where: "Campaigns → Budget", must: "Daily budget from ₹50,000/month, with your working" },
  { id: "B9", title: "Conversion action", marks: 3, where: "Goals → Conversions", must: "Name, category and counting setting" },
];

function synthPlannerKeyword(text: string): PlannerKeyword {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  const india = 100 + (h % 1500);
  const siliguri = Math.max(10, Math.round(india * (0.01 + ((h >> 5) % 6) / 100)));
  const comp: Competition = ["Low", "Medium", "High"][h % 3] as Competition;
  const bidLow = 3 + (h % 10);
  return {
    text,
    india,
    siliguri,
    competition: comp,
    compIndex: 20 + (h % 70),
    bidLow,
    bidHigh: bidLow + 6 + (h % 20),
    season: "admissions",
  };
}


export function plannerIdeas(seedsText: string, geo: "siliguri" | "india"): PlannerKeyword[] {
    const seeds = seedsText
      .split(/[,\n]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    let result: PlannerKeyword[];
    if (!seeds.length) {
      result = KEYWORD_DB.slice();
    } else {
      const matched = KEYWORD_DB.filter((k) =>
        seeds.some((s) => k.text.includes(s) || s.includes(k.text))
      );
      const seen = new Set(matched.map((m) => m.text));
      // any seed with no DB hit gets a synthesised row
      const synthRows = seeds
        .filter((s) => !KEYWORD_DB.some((k) => k.text.includes(s) || s.includes(k.text)))
        .map((s) => synthPlannerKeyword(s))
        .filter((r) => !seen.has(r.text));
      result = [...matched, ...synthRows];
      if (!result.length) result = KEYWORD_DB.slice();
    }
    return result.sort((a, b) => b[geo] - a[geo]);
}
