"use client";

import React from "react";
import { useSim } from "../context";
import { Icon } from "../icons";
import { Button } from "../ui";
import type { Navigate } from "../flow";
import { BID_FOCUS_OPTIONS } from "../data";

export default function Campaigns({ onNavigate }: { onNavigate: Navigate }) {
  const { state, reset } = useSim();
  const c = state.campaign;
  const hasDraft = !!c.objective || !!c.name || c.adGroups.some(g => g.keywords.length > 0 || g.ad.headlines.some(h => h.trim()));
  const create = () => {
    if (hasDraft && !confirm("Start a new campaign? This replaces your current practice draft. Download a backup first to keep it.")) return;
    reset();
  };
  return <div>
    <div className="gads-breadcrumb">Campaigns / Campaigns</div>
    <h1 className="gads-page-title">Campaigns</h1>
    <p className="gads-page-sub">All campaigns · Practice account</p>
    <div className="gads-campaign-toolbar"><Button icon="add" onClick={create}>New campaign</Button><span><Icon name="campaign" size={16} /> Search campaigns</span></div>
    <div className="gads-card gads-campaign-table">
      <h3>Draft campaigns {hasDraft ? "(1)" : "(0)"}</h3>
      {hasDraft ? <div className="gads-table-scroll"><table className="gads-table"><thead><tr><th>Campaign</th><th>Status</th><th>Campaign type</th><th>Budget</th><th>Bid strategy</th><th /></tr></thead><tbody><tr>
        <td><button className="gads-krow-link" onClick={() => onNavigate("build")}>{c.name || "Untitled campaign"}</button></td>
        <td><span className="gads-badge">Draft</span></td><td>Search</td><td>{Number(c.budgetDaily) > 0 ? `₹${c.budgetDaily}/day` : "—"}</td><td>{BID_FOCUS_OPTIONS.find(b => b.id === c.bidFocus)?.label}</td>
        <td><button className="gads-krow-link" onClick={() => onNavigate("build")}>Resume</button></td>
      </tr></tbody></table></div> : <div className="gads-campaign-empty"><Icon name="campaign" size={36} /><h2>Create your first campaign</h2><p>Start with a campaign objective, then set up your Search campaign.</p><Button onClick={create}>New campaign</Button></div>}
    </div>
    <div className="gads-inline-note"><Icon name="info" size={18} /><span>Simulation account · Campaigns remain drafts. No ads are served, and there are no charges. Open the 90-minute practical panel for the exam checklist.</span></div>
  </div>;
}
