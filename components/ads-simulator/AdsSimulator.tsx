"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ads-simulator.css";
import { SimContext } from "./context";
import {
  loadState,
  saveState,
  defaultState,
  isUnlocked,
  setUnlocked,
  UNLOCK_CODE,
  restoreBackup,
} from "./store";
import type { SimState, Campaign } from "./types";
import { Icon, AdsMark } from "./icons";
import Wizard from "./screens/Wizard";
import KeywordPlanner from "./screens/KeywordPlanner";
import Conversions from "./screens/Conversions";
import Guide from "./screens/Guide";
import ExamPanel from "./ExamPanel";
import Campaigns from "./screens/Campaigns";
import { downloadCampaign, type BuildSection } from "./flow";
import { examRestrictions } from "./examRestrictions";

type Screen = "campaigns" | "build" | "planner" | "conversions" | "guide";

export default function AdsSimulator() {
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlockedState] = useState(false);
  const [state, setState] = useState<SimState>(defaultState);
  const [screen, setScreen] = useState<Screen>("build");
  const [step, setStep] = useState(0);
  const [section, setSection] = useState<BuildSection>("keywords");
  const [saved, setSaved] = useState(true);

  // Hydrate from localStorage after mount to avoid SSR mismatch.
  useEffect(() => {
    const s = loadState();
    setState(s);
    setScreen("guide");
    setStep(s.lastStep || 0);
    setSection(s.buildSection || "keywords");
    setUnlockedState(isUnlocked());
    setMounted(true);
  }, []);

  // Wait for the hydrated render. A ref flips during the first effect pass,
  // which would save defaults before hydration and erase drafts in Strict Mode.
  useEffect(() => {
    if (mounted) setSaved(saveState(state));
  }, [state, mounted]);

  const patch = useCallback(
    (partial: Partial<SimState>) => setState((s) => ({ ...s, ...partial })),
    []
  );
  const patchCampaign = useCallback(
    (partial: Partial<Campaign>) =>
      setState((s) => ({ ...s, campaign: { ...s.campaign, ...partial } })),
    []
  );
  const reset = useCallback(() => {
    const fresh = defaultState();
    setState({ ...fresh, lastScreen: "build" });
    setScreen("build");
    setStep(0);
    setSection("keywords");
  }, []);

  const navigate = useCallback((sc: string, st?: number, part?: BuildSection) => {
    setScreen(sc as Screen);
    if (typeof st === "number") setStep(st);
    if (part) setSection(part);
    setState((s) => ({ ...s, lastScreen: sc, lastStep: typeof st === "number" ? st : s.lastStep, buildSection: part || s.buildSection }));
    // scroll the main pane to top on navigation
    requestAnimationFrame(() => {
      const el = document.querySelector(".gads-main");
      if (el) el.scrollTop = 0;
    });
  }, []);

  const goStep = useCallback((n: number) => {
    setStep(n);
    setState((s) => ({ ...s, lastStep: n }));
    requestAnimationFrame(() => {
      const el = document.querySelector(".gads-main");
      if (el) el.scrollTop = 0;
    });
  }, []);

  const goSection = useCallback((part: BuildSection) => {
    setSection(part);
    setState(s => ({ ...s, buildSection: part }));
    document.querySelector(".gads-main")?.scrollTo({ top: 0 });
  }, []);

  if (!mounted) {
    return <div className="gads-loading">Loading simulator…</div>;
  }

  if (!unlocked) {
    return (
      <PasswordGate
        onUnlock={() => {
          setUnlocked(true);
          setUnlockedState(true);
        }}
      />
    );
  }

  return (
    <SimContext.Provider value={{ state, setState, patch, patchCampaign, reset }}>
      <div className="gads" {...examRestrictions}>
        <TopBar
          state={state}
          onNavigate={navigate}
          onLock={() => {
            setUnlocked(false);
            setUnlockedState(false);
          }}
          onReset={reset}
          onImport={(s) => {
            setState({ ...s, lastScreen: "build", lastStep: 0, buildSection: "keywords" });
            setScreen("build");
            setStep(0);
            setSection("keywords");
          }}
        />
        <ExamPanel onNavigate={navigate} />
        {!saved && <div className="gads-storage-warning" role="alert">Browser storage is unavailable or full. Your draft is only in memory. Download a backup before leaving this page.</div>}
        <div className="gads-body">
          <SideNav screen={screen} onNavigate={navigate} />
          <main className="gads-main">
            <div className="gads-main-inner">
              {screen === "campaigns" && <Campaigns onNavigate={navigate} />}
              {screen === "build" && (
                <Wizard step={step} setStep={goStep} onNavigate={navigate} section={section} setSection={goSection} />
              )}
              {screen === "planner" && <KeywordPlanner />}
              {screen === "conversions" && <Conversions />}
              {screen === "guide" && <Guide onNavigate={navigate} />}
            </div>
          </main>
        </div>
      </div>
    </SimContext.Provider>
  );
}

/* --------------------------------------------------------------- Top bar */
function TopBar({
  state,
  onLock,
  onReset,
  onImport,
  onNavigate,
}: {
  state: SimState;
  onLock: () => void;
  onReset: () => void;
  onImport: (s: SimState) => void;
  onNavigate: (s: string, step?: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const destinations = [
    { label: "Campaigns", screen: "campaigns" },
    { label: "Campaign objective", screen: "build", step: 0 },
    { label: "Bidding", screen: "build", step: 1 },
    { label: "Locations, languages and networks", screen: "build", step: 2 },
    { label: "Keywords and ads", screen: "build", step: 3 },
    { label: "Budget", screen: "build", step: 4 },
    { label: "Review campaign", screen: "build", step: 5 },
    { label: "Keyword Planner", screen: "planner" },
    { label: "Conversions", screen: "conversions" },
    { label: "Exam brief", screen: "guide" },
  ];

  const importJson = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onImport(restoreBackup(JSON.parse(reader.result as string)));
      } catch {
        alert("That file isn't a valid simulator backup.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="gads-topbar">
      <span className="gads-logo">
        <span className="gads-logo-mark">
          <AdsMark size={22} />
        </span>
        Google <b>Ads</b>
        <span
          className="gads-badge"
          style={{ marginLeft: 8, textTransform: "none" }}
          title="Practice sandbox — not connected to Google"
        >
          Practice
        </span>
      </span>

      <button className="gads-account" title="Practice account" aria-expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)}>
        <span>
          <span className="name">{state.accountName}</span>{" "}
          <span className="id">{state.accountId}</span>
        </span>
        <Icon name="chevron" size={16} />
      </button>
      {accountOpen && <div className="gads-account-popover"><strong>{state.accountName}</strong><div>{state.accountId} · INR</div><p>Practice account. Campaign data stays in this browser.</p></div>}

      <div className="gads-search"><Icon name="search" size={20} /><input aria-label="Search simulator pages" value={search} onChange={e => setSearch(e.target.value)} />
        {search.trim() && <div className="gads-search-results">{destinations.filter(d => d.label.toLowerCase().includes(search.toLowerCase())).map(d => <button key={d.label} onClick={() => { onNavigate(d.screen, d.step); setSearch(""); }}>{d.label}</button>)}{!destinations.some(d => d.label.toLowerCase().includes(search.toLowerCase())) && <span>No matching pages</span>}</div>}
      </div>

      <span className="gads-topbar-spacer" />

      <Clock />

      <button className="gads-icon-btn" aria-label="Download backup (JSON)" title="Download backup (JSON)" onClick={() => downloadCampaign(state)}>
        <Icon name="download" />
      </button>
      <button
        className="gads-icon-btn"
        title="Restore backup (JSON)"
        aria-label="Restore backup (JSON)"
        onClick={() => fileRef.current?.click()}
      >
        <Icon name="upload" />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={(e) => importJson(e.target.files?.[0])}
      />
      <button
        className="gads-icon-btn"
        title="Start a new, empty campaign"
        aria-label="Start a new, empty campaign"
        onClick={() => {
          if (
            confirm(
              "Clear everything and start a new empty campaign? Your current work in this browser will be lost (export a backup first if you want to keep it)."
            )
          )
            onReset();
        }}
      >
        <Icon name="reset" />
      </button>
      <button className="gads-icon-btn" aria-label="Lock simulator" title="Lock" onClick={onLock}>
        <Icon name="lock" />
      </button>
      <span className="gads-avatar" title={state.accountName}>
        A
      </span>
    </header>
  );
}

function Clock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="gads-clock" title="Simulator clock">
      {now}
    </span>
  );
}

/* --------------------------------------------------------------- Side nav */
function SideNav({
  screen,
  onNavigate,
}: {
  screen: Screen;
  onNavigate: (s: string, step?: number) => void;
}) {
  const item = (id: Screen, icon: Parameters<typeof Icon>[0]["name"], label: string) => (
    <button
      className={`gads-nav-item ${screen === id || (id === "campaigns" && screen === "build") ? "active" : ""}`}
      onClick={() => onNavigate(id)}
    >
      <span className="ic">
        <Icon name={icon} size={20} />
      </span>
      <span>{label}</span>
    </button>
  );
  return (
    <nav className="gads-nav" aria-label="Main navigation">
      <div className="gads-nav-group">
        {item("guide", "guide", "Exam guide")}
      </div>
      <div className="gads-nav-group">
        {item("campaigns", "campaign", "Campaigns")}
      </div>
      <div className="gads-nav-group">
        {item("conversions", "conversions", "Goals")}
        {item("planner", "planner", "Tools")}
      </div>
    </nav>
  );
}

/* --------------------------------------------------------------- Gate */
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toLowerCase() === UNLOCK_CODE) {
      setErr("");
      onUnlock();
    } else {
      setErr("Incorrect code. Ask your instructor for the access code.");
    }
  };
  return (
    <div className="gads-gate" {...examRestrictions}>
      <form className="gads-gate-card" onSubmit={submit}>
        <AdsMark size={40} />
        <h1>Google Ads — Practice Simulator</h1>
        <p>Enter the access code to open the campaign builder.</p>
        <input
          className="gads-input"
          type="password"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Access code"
        />
        <div className="gads-gate-err">{err}</div>
        <button className="gads-btn" type="submit" style={{ width: "100%" }}>
          Unlock
        </button>
        <div className="gads-gate-foot">
          A training sandbox for building a Google Search campaign. Nothing here
          connects to Google, spends money, or can be published. Your work saves
          only in this browser.
        </div>
      </form>
    </div>
  );
}
