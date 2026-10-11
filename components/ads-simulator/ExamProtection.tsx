"use client";

import React, { useEffect, useState } from "react";
import { isCaptureShortcut } from "./examRestrictions";

export function useExamPrivacy(protectBrief: boolean, active: boolean) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setHidden(false);
    if (!active) return;
    const blur = () => { if (protectBrief) setHidden(true); };
    const visibility = () => { if (protectBrief && document.hidden) setHidden(true); };
    const capture = (event: KeyboardEvent) => {
      if (!isCaptureShortcut(event)) return;
      event.preventDefault();
      event.stopPropagation();
      setHidden(true);
    };
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("keydown", capture, true);
    return () => {
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("keydown", capture, true);
    };
  }, [protectBrief, active]);
  return { hidden, resume: () => setHidden(false) };
}

export function ExamWatermark({ name, accountId }: { name?: string; accountId: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);
  const identity = name?.trim() || `Practice ${accountId}`;
  return <div className="gads-exam-watermark" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <span key={i}>NEXIS EXAM<br />{identity}<br />{time} IST</span>)}</div>;
}

export function ExamPrivacyShield({ onResume }: { onResume: () => void }) {
  return <div className="gads-privacy-shield" role="dialog" aria-modal="true" aria-labelledby="exam-privacy-title">
    <div><h2 id="exam-privacy-title">Exam content hidden</h2><p>Return to the exam window and select Resume exam to continue.</p><button className="gads-btn" autoFocus onClick={onResume}>Resume exam</button></div>
  </div>;
}
