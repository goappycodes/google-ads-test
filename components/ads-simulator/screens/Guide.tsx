"use client";

import React from "react";
import { BRIEF, EXAM_ROWS } from "../data";
import { Card, InlineNote, Button } from "../ui";
import type { BuildSection, Navigate } from "../flow";

export default function Guide({
  onNavigate,
}: {
  onNavigate: Navigate;
}) {
  return (
    <div>
      <h1 className="gads-page-title">Exam guide &amp; brief</h1>
      <p className="gads-page-sub">
        Read the brief, complete your setup, then generate your HTML report from Review and submit it by email.
      </p>
      <div className="gads-brief-actions"><Button onClick={() => onNavigate("build")}>Open campaign builder</Button><Button variant="outline" onClick={() => onNavigate("planner")}>Open Keyword Planner</Button></div>

      <InlineNote variant="warn">
        <span>
          <strong>Rules recap:</strong> every number in your explanations must match your Planner research. Ads may use only facts from this brief or from allen.in — no
          rank, result or guarantee claims, and nothing that makes a student feel
          bad about their result. Do not publish; no payment details.
        </span>
      </InlineNote>

      <Card title="The brief (ALLEN Siliguri — one-year JEE dropper batch)">
        <dl className="gads-brief-grid">
          <dt>Centre</dt>
          <dd>{BRIEF.centre}</dd>
          <dt>Course</dt>
          <dd>{BRIEF.course}</dd>
          <dt>Fee — classroom</dt>
          <dd>{BRIEF.feeClassroom}</dd>
          <dt>Fee — online</dt>
          <dd>{BRIEF.feeOnline}</dd>
          <dt>Hostel</dt>
          <dd>{BRIEF.hostel}</dd>
          <dt>Today</dt>
          <dd>{BRIEF.today}</dd>
          <dt>Batch starts</dt>
          <dd>{BRIEF.batch}</dd>
          <dt>Budget</dt>
          <dd>{BRIEF.budget}</dd>
          <dt>Website</dt>
          <dd>{BRIEF.website} — pick the best existing page per ad group</dd>
        </dl>
        <div className="gads-help" style={{ marginTop: 10 }}>
          {BRIEF.source} The director&rsquo;s view: &ldquo;Everyone knows ALLEN.
          Just bid on &lsquo;allen&rsquo; across India and the admissions will
          come.&rdquo; Your B2 caption must say whether that&rsquo;s right, using a
          number from your Keyword Planner.
        </div>
      </Card>

      <Card
        title="Setup checklist (B0–B9)"
        hint="Open a row to edit its settings. Your final HTML report includes the completed setup; explain your choices in the rationale field on Review."
      >
        <table className="gads-table gads-guide-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Section</th>
              <th>Required setup</th>
              <th>Where</th>
            </tr>
          </thead>
          <tbody>
            {EXAM_ROWS.map((r) => {
              const target =
                r.id === "B0"
                  ? ["planner"]
                  : r.id === "B9"
                  ? ["conversions"]
                  : (["build", stepForRow(r.id)] as [string, number]);
              return (
                <tr key={r.id}>
                  <td>
                    <strong>{r.id}</strong>
                  </td>
                  <td>{r.title}</td>
                  <td className="gads-muted">{r.must}</td>
                  <td>
                    <button
                      className="gads-krow-link"
                      onClick={() =>
                        onNavigate(target[0] as string, target[1] as number, sectionForRow(r.id))
                      }
                    >
                      Open ›
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card title="The twist (Part 2)">
        <p className="gads-muted" style={{ fontSize: 13, margin: 0 }}>
          Midway, the examiner reads a message from head office. Change your
          campaign to match it, then write three lines in the twist notes on Review: what you changed, what
          you cut, and why you cut that and not something else. Your settings all
          stay editable here — just revisit the relevant step, change it, and
          generate an updated report. It&rsquo;s assessed on fit with your own research, not on
          how many settings you touch.
        </p>
      </Card>
    </div>
  );
}

// Maps an exam row to the wizard step index it belongs to.
function stepForRow(id: string): number {
  switch (id) {
    case "B1":
      return 2; // settings includes a summary of objective, bidding and networks
    case "B2":
    case "B3":
      return 2;
    case "B4":
    case "B5":
      return 3;
    case "B6":
      return 3;
    case "B7":
      return 3;
    case "B8":
      return 4;
    default:
      return 0;
  }
}

function sectionForRow(id: string): BuildSection | undefined {
  if (id === "B4" || id === "B5") return "keywords";
  if (id === "B6") return "ads";
  if (id === "B7") return "assets";
}
