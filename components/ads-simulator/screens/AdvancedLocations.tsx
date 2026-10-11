"use client";

import React, { useState } from "react";
import { useSim } from "../context";
import { LOCATION_SUGGESTIONS } from "../data";
import { uid } from "../store";
import type { Campaign } from "../types";
import { Button, Field, TextInput, Select } from "../ui";
import { Icon } from "../icons";

export default function AdvancedLocations({ onClose }: { onClose: () => void }) {
  const { state, patchCampaign } = useSim();
  const [locations, setLocations] = useState([...state.campaign.locations]);
  const [excluded, setExcluded] = useState([...state.campaign.excludedLocations]);
  const [radii, setRadii] = useState<NonNullable<Campaign["radiusTargets"]>>([...(state.campaign.radiusTargets || [])]);
  const [tab, setTab] = useState<"search" | "radius">("search");
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState("");
  const [distance, setDistance] = useState("");
  const [unit, setUnit] = useState<"km" | "mi">("km");
  const [error, setError] = useState("");
  const results = query.trim() ? LOCATION_SUGGESTIONS.filter(l => l.toLowerCase().includes(query.trim().toLowerCase())) : [];
  if (query.trim() && !results.some(l => l.toLowerCase() === query.trim().toLowerCase())) results.push(query.trim());
  const choose = (place: string, mode: "include" | "exclude") => {
    const same = (l: string) => l.toLowerCase() === place.toLowerCase();
    if (mode === "include") { setLocations(prev => [...prev.filter(l => !same(l)), place]); setExcluded(prev => prev.filter(l => !same(l))); }
    else { setExcluded(prev => [...prev.filter(l => !same(l)), place]); setLocations(prev => prev.filter(l => !same(l))); }
  };
  const addRadius = (mode: "include" | "exclude") => {
    if (!center.trim() || !/^\d+(\.\d+)?$/.test(distance) || !Number.isFinite(Number(distance)) || Number(distance) * (unit === "mi" ? 1.609344 : 1) < 1) {
      setError("Enter a centre and a radius covering at least 1 km."); return;
    }
    const next = { id: uid(), center: center.trim(), distance, unit, mode };
    setRadii(prev => [...prev.filter(r => !(r.center.toLowerCase() === next.center.toLowerCase() && Number(r.distance) === Number(distance) && r.unit === unit)), next]);
    setError("");
  };
  const save = () => { patchCampaign({ locations, excludedLocations: excluded, radiusTargets: radii }); onClose(); };
  return <div className="gads-location-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="gads-location-dialog" role="dialog" aria-modal="true" aria-label="Advanced location search" onKeyDown={e => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, [tabindex="0"]'));
        const first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }}>
      <header><h2>Advanced search</h2><button className="gads-icon-btn" aria-label="Close advanced search" autoFocus onClick={onClose}><Icon name="close" /></button></header>
      <div className="gads-location-workspace"><div className="gads-location-controls">
        <div className="gads-build-tabs"><button className={tab === "search" ? "active" : ""} aria-pressed={tab === "search"} onClick={() => setTab("search")}>Location search</button><button className={tab === "radius" ? "active" : ""} aria-pressed={tab === "radius"} onClick={() => setTab("radius")}>Radius</button></div>
        {tab === "search" ? <>
          <Field label="Search for a location"><TextInput value={query} onChange={setQuery} /></Field>
          <div className="gads-location-results">{results.map(place => <div key={place}><span>{place}</span><button onClick={() => choose(place, "include")}>Include</button><button onClick={() => choose(place, "exclude")}>Exclude</button></div>)}</div>
        </> : <>
          <Field label="Radius centre"><TextInput value={center} onChange={setCenter} list="radius-centres" /></Field>
          <datalist id="radius-centres">{LOCATION_SUGGESTIONS.map(l => <option key={l} value={l} />)}</datalist>
          <div className="gads-row"><Field label="Distance"><TextInput value={distance} onChange={setDistance} inputMode="decimal" aria-invalid={!!error} /></Field><Field label="Units"><Select value={unit} onChange={v => setUnit(v as "km" | "mi")} options={[{ value: "km", label: "Kilometres" }, { value: "mi", label: "Miles" }]} /></Field></div>
          {error && <div className="gads-field-error" role="alert">{error}</div>}
          <div className="gads-row"><Button variant="outline" onClick={() => addRadius("include")}>Include radius</Button><Button variant="text" onClick={() => addRadius("exclude")}>Exclude radius</Button></div>
          <p className="gads-help">Minimum radius: 1 km. Radius exclusions are a simulation option.</p>
        </>}
        <h3>Included locations ({locations.length + radii.filter(r => r.mode === "include").length})</h3>
        {locations.map(place => <div className="gads-location-selected" key={place}><Icon name="location" size={16} /><span>{place}</span><button className="gads-icon-btn" aria-label={`Remove included ${place}`} onClick={() => setLocations(prev => prev.filter(l => l !== place))}><Icon name="close" size={16} /></button></div>)}
        <h3>Excluded locations ({excluded.length + radii.filter(r => r.mode === "exclude").length})</h3>
        {excluded.map(place => <div className="gads-location-selected excluded" key={place}><Icon name="location" size={16} /><span>{place}</span><button className="gads-icon-btn" aria-label={`Remove excluded ${place}`} onClick={() => setExcluded(prev => prev.filter(l => l !== place))}><Icon name="close" size={16} /></button></div>)}
        {radii.map(r => <div className={`gads-location-selected ${r.mode === "exclude" ? "excluded" : ""}`} key={r.id}><span>{r.mode === "include" ? "Include" : "Exclude"} · {r.distance} {r.unit} around {r.center}</span><button className="gads-icon-btn" aria-label={`Remove ${r.mode} radius around ${r.center}`} onClick={() => setRadii(prev => prev.filter(x => x.id !== r.id))}><Icon name="close" size={16} /></button></div>)}
      </div><div className="gads-location-preview">
        <svg viewBox="0 0 480 360" role="img" aria-label="Schematic location area preview"><rect width="480" height="360" fill="#edf0eb" /><path d="M0 65L480 220M120 0L290 360M0 300L480 110M360 0L200 360" stroke="#fff" strokeWidth="18" /><path d="M0 190Q190 115 220 220T480 290" stroke="#c4e2f4" strokeWidth="24" fill="none" /><circle cx="240" cy="180" r="105" fill="#1a73e81c" stroke="#1a73e8" strokeWidth="2" /><circle cx="240" cy="180" r="7" fill="#1a73e8" /></svg>
        <strong>{tab === "radius" ? center || "Radius centre" : "Location area"}</strong><p>Area preview · Simulation<br />This schematic does not show geographic boundaries.</p>
      </div></div>
      <footer><Button variant="text" onClick={onClose}>Cancel</Button><Button onClick={save}>Save locations</Button></footer>
    </section>
  </div>;
}
