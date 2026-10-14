"use client";

import React, { useState } from "react";
import { useSim } from "./context";
import { Icon } from "./icons";
import { campaignChecks, type Navigate } from "./flow";

export default function ExamPanel({ onNavigate }: { onNavigate: Navigate }) {
  const { state } = useSim();
  const [open, setOpen] = useState(false);
  const checks = campaignChecks(state);
  const done = checks.filter(c => c.ok).length;
  return <aside className={`gads-exam-panel ${open ? "open" : ""}`}>
    <button className="gads-exam-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
      <Icon name="guide" size={18} /><span>60-minute practical</span>
      <span className="gads-exam-progress">{done}/{checks.length} build checks</span>
      <Icon name={open ? "close" : "chevron"} size={18} />
    </button>
    {open && <div className="gads-exam-content">
      <p>Suggested pace: research 10 min · settings 10 min · keywords, ads &amp; assets 25 min · conversions &amp; budget 5 min · review, rationale &amp; submission 10 min.</p>
      <div className="gads-exam-checks">{checks.map(check => <button key={check.label} onClick={() => onNavigate(check.step < 0 ? "conversions" : "build", check.step < 0 ? undefined : check.step, check.section)}>
        <Icon name={check.ok ? "checkCircle" : "info"} size={16} /><span>{check.label}</span>
      </button>)}</div>
      <div className="gads-exam-footer"><button onClick={() => onNavigate("planner")}>Keyword Planner</button><button onClick={() => onNavigate("guide")}>Open exam brief</button></div>
      <p className="gads-help">These checks confirm field completion. Generate your HTML report from Review and email it to madhu@nexisschool.com. Planner figures are simulated.</p>
    </div>}
  </aside>;
}
