"use client";

import React, { useMemo, useState } from "react";
import {
  plannerIdeas,
  TREND_MONTHS,
  trendValues,
  type PlannerKeyword,
} from "../data";
import { Icon } from "../icons";
import { Sparkline, Button } from "../ui";
import { useSim } from "../context";

type Geo = "siliguri" | "india";

function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

// Deterministic plausible numbers for a typed seed that isn't in our dataset,
// so the planner never comes up empty on a student's own idea.
function TrendChart({ values }: { values: number[] }) {
  const w = 460;
  const h = 180;
  const pad = 28;
  const max = Math.max(...values, 1);
  const bw = (w - pad * 2) / values.length;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="12-month search trend">
      <line x1={pad} y1={h - pad} x2={w - pad / 2} y2={h - pad} stroke="#dadce0" />
      {values.map((v, i) => {
        const bh = ((v / max) * (h - pad * 2));
        const x = pad + i * bw + bw * 0.18;
        const y = h - pad - bh;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={bw * 0.64}
              height={Math.max(bh, 1)}
              rx={2}
              fill="#1a73e8"
            />
            <text
              x={x + bw * 0.32}
              y={h - pad + 14}
              textAnchor="middle"
              fontSize="9"
              fill="#5f6368"
            >
              {TREND_MONTHS[i]}
            </text>
          </g>
        );
      })}
      <text x={pad} y={16} fontSize="10" fill="#5f6368">
        Peak {fmt(max)}/mo
      </text>
    </svg>
  );
}

export default function KeywordPlanner() {
  const { state, patch } = useSim();
  const seedsText = state.planner?.seedsText || "";
  const geo: Geo = state.planner?.geo || "siliguri";
  const setSeedsText = (value: string) => patch({ planner: { ...state.planner, seedsText: value, geo } });
  const setGeo = (value: Geo) => patch({ planner: { ...state.planner, seedsText, geo: value } });
  const [open, setOpen] = useState<PlannerKeyword | null>(null);

  const rows = useMemo(() => plannerIdeas(seedsText, geo), [seedsText, geo]);

  const totalIndia = rows.reduce((s, r) => s + r.india, 0);
  const totalSiliguri = rows.reduce((s, r) => s + r.siliguri, 0);

  return (
    <div>
      <h1 className="gads-page-title">Keyword Planner</h1>
      <p className="gads-page-sub">
        Tools / Planning / Keyword Planner · Discover new keywords
      </p>
      <div className="gads-inline-note"><Icon name="info" size={18} /><span>Training data · Search volumes, bids and trends here are simulated. Use these figures only for this practice exercise.</span></div>

      <div className="gads-card">
        <div className="gads-planner-controls">
          <div className="grow">
            <label className="gads-label">
              Enter products or services closely related to your business
            </label>
            <input
              className="gads-input"
              aria-label="Products or services"
              value={seedsText}
              onChange={(e) => setSeedsText(e.target.value)}
            />
            <div className="gads-help">
              Separate ideas with commas. Leave blank to see the full idea list.
              Site to search: <strong>allen.in</strong>
            </div>
          </div>
          <div>
            <label className="gads-label">Location</label>
            <div className="gads-geo-toggle">
              <button
                className={geo === "siliguri" ? "on" : ""}
                onClick={() => setGeo("siliguri")}
              >
                Siliguri
              </button>
              <button
                className={geo === "india" ? "on" : ""}
                onClick={() => setGeo("india")}
              >
                All of India
              </button>
            </div>
          </div>
        </div>

        <div className="gads-inline-note">
          <span>
            Showing <strong>{rows.length}</strong> keyword ideas for{" "}
            <strong>{geo === "siliguri" ? "Siliguri" : "all of India"}</strong>.
            Combined avg. monthly searches:{" "}
            <strong>{fmt(geo === "siliguri" ? totalSiliguri : totalIndia)}</strong>.
            Switch the location toggle to compare — this is the number your B2
            caption needs.
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="gads-table">
            <thead>
              <tr>
                <th>Keyword (by relevance)</th>
                <th className="num">
                  Avg. monthly searches
                  <br />
                  <span className="gads-muted">
                    ({geo === "siliguri" ? "Siliguri" : "India"})
                  </span>
                </th>
                <th>12-month trend</th>
                <th>Competition</th>
                <th className="num">Top of page bid (low)</th>
                <th className="num">Top of page bid (high)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.text}>
                  <td>
                    <button className="gads-krow-link" onClick={() => { setOpen(r); patch({ planner: { seedsText, geo, trendKeyword: r.text } }); }}>
                      {r.text}
                    </button>
                  </td>
                  <td className="num">{fmt(r[geo])}</td>
                  <td>
                    <Sparkline data={trendValues(r, geo)} />
                  </td>
                  <td>
                    <span className={`gads-comp ${r.competition}`}>
                      <span className="dot" />
                      {r.competition}
                    </span>
                  </td>
                  <td className="num">₹{r.bidLow.toFixed(2)}</td>
                  <td className="num">₹{r.bidHigh.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div
          className="gads-drawer-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          <div className="gads-drawer" role="dialog" aria-label={`${open.text} trend`}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <h3>{open.text}</h3>
                <div className="gads-muted" style={{ fontSize: 13 }}>
                  12-month search trend
                </div>
              </div>
              <button
                className="gads-icon-btn"
                aria-label="Close"
                onClick={() => setOpen(null)}
              >
                <Icon name="close" />
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="gads-geo-toggle" style={{ marginBottom: 12 }}>
                <button
                  className={geo === "siliguri" ? "on" : ""}
                  onClick={() => setGeo("siliguri")}
                >
                  Siliguri
                </button>
                <button
                  className={geo === "india" ? "on" : ""}
                  onClick={() => setGeo("india")}
                >
                  All of India
                </button>
              </div>
              <TrendChart values={trendValues(open, geo)} />
            </div>

            <div className="gads-stat-row">
              <div className="gads-stat">
                <div className="k">Avg. monthly searches — Siliguri</div>
                <div className="v">{fmt(open.siliguri)}</div>
              </div>
              <div className="gads-stat">
                <div className="k">Avg. monthly searches — India</div>
                <div className="v">{fmt(open.india)}</div>
              </div>
              <div className="gads-stat">
                <div className="k">Top of page bid range</div>
                <div className="v">
                  ₹{open.bidLow.toFixed(0)}–₹{open.bidHigh.toFixed(0)}
                </div>
              </div>
              <div className="gads-stat">
                <div className="k">Competition (indexed)</div>
                <div className="v">
                  {open.competition}{" "}
                  <span className="gads-muted" style={{ fontSize: 14 }}>
                    ({open.compIndex})
                  </span>
                </div>
              </div>
            </div>

            <div className="gads-inline-note">
              <span>
                Siliguri is roughly{" "}
                <strong>
                  {open.india > 0
                    ? ((open.siliguri / open.india) * 100).toFixed(1)
                    : "0"}
                  %
                </strong>{" "}
                of this keyword&rsquo;s national demand. This selected trend is included in your HTML report for B0.
              </span>
            </div>

            <div style={{ textAlign: "right", marginTop: 8 }}>
              <Button variant="text" onClick={() => setOpen(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
