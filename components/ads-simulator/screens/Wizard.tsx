"use client";

import React, { useState } from "react";
import { useSim } from "../context";
import { uid, emptyAdGroup } from "../store";
import { fileToResizedDataUrl } from "../image";
import {
  OBJECTIVES,
  CAMPAIGN_TYPES,
  CONVERSION_GOAL_OPTIONS,
  BID_FOCUS_OPTIONS,
  LANGUAGE_OPTIONS,
  LOCATION_SUGGESTIONS,
  ALLEN_PAGES,
} from "../data";
import type {
  AdGroup,
  Keyword,
  MatchType,
  NegativeKeyword,
  ResponsiveSearchAd,
  ScheduleRow,
  BidFocus,
  LocationOption,
} from "../types";
import {
  Button,
  AddLink,
  Card,
  Field,
  TextInput,
  TextArea,
  Select,
  Checkbox,
  Radio,
  InlineNote,
  ValidationContext,
  FieldError,
} from "../ui";
import { Icon } from "../icons";
import { CAMPAIGN_STEPS, campaignChecks, type BuildSection, type Navigate } from "../flow";
import { campaignIssues } from "../validation";
import AdvancedLocations from "./AdvancedLocations";
import { downloadReport, submissionMailto, SUBMISSION_EMAIL } from "../report";

function formatKw(text: string, match: MatchType): string {
  if (match === "phrase") return `"${text}"`;
  if (match === "exact") return `[${text}]`;
  return text;
}

// Strips Google match-type syntax from pasted text and infers the match type.
function parseKw(raw: string): { text: string; match: MatchType } {
  const t = raw.trim();
  if (t.startsWith("[") && t.endsWith("]"))
    return { text: t.slice(1, -1).trim(), match: "exact" };
  if (t.startsWith('"') && t.endsWith('"'))
    return { text: t.slice(1, -1).trim(), match: "phrase" };
  return { text: t, match: "broad" };
}

export default function Wizard({
  step,
  setStep,
  onNavigate,
  section,
  setSection,
}: {
  step: number;
  setStep: (n: number) => void;
  onNavigate: Navigate;
  section: BuildSection;
  setSection: (section: BuildSection) => void;
}) {
  const { state } = useSim();
  const clamped = Math.min(Math.max(step, 0), CAMPAIGN_STEPS.length - 1);
  const checks = campaignChecks(state);
  const [attempted, setAttempted] = useState(false);
  const activeIssues = campaignIssues(state).filter(issue => issue.step === clamped && (clamped !== 3 || issue.section === section));
  const errors = attempted ? Object.fromEntries(activeIssues.map(issue => [issue.field, issue.message])) : {};
  const validate = () => {
    setAttempted(true);
    if (activeIssues.length) {
      requestAnimationFrame(() => document.querySelector(".gads-validation-summary")?.scrollIntoView({ block: "start" }));
      return false;
    }
    setAttempted(false);
    return true;
  };
  return (
    <ValidationContext.Provider value={errors}><div className="gads-builder">
      <div className="gads-builder-heading">
        <div><div className="gads-breadcrumb">Campaigns / New campaign</div>
          <h1 className="gads-page-title">{CAMPAIGN_STEPS[clamped]}</h1></div>
        <span className="gads-draft-label"><Icon name="campaign" size={16} /> Search campaign · Draft</span>
      </div>
      <div className="gads-construction">
        <nav className="gads-stepper" aria-label="Campaign steps">
          <div className="gads-stepper-title">New campaign</div>
          {CAMPAIGN_STEPS.map((s, i) => {
            const stepChecks = checks.filter(check => check.step === i);
            const ready = stepChecks.length > 0 && stepChecks.every(check => check.ok);
            return (
            <button
              key={s}
              className={`gads-step ${i === clamped ? "active" : ""} ${ready ? "done" : ""}`}
              aria-current={i === clamped ? "step" : undefined}
              onClick={() => setStep(i)}
            >
              <span className="gads-step-num">
                {ready ? <Icon name="check" size={16} /> : i + 1}
              </span>
              <span className="gads-step-body">
                <span className="t">{s}</span>
              </span>
              {i < CAMPAIGN_STEPS.length - 1 && <span className="gads-step-line" />}
            </button>
          );})}
          <div className="gads-stepper-foot"><Icon name="lock" size={16} /> Simulation only<br />No billing or live ads</div>
        </nav>
        <div className="gads-stepcontent">
          {attempted && activeIssues.length > 0 && <div className="gads-validation-summary" role="alert"><strong>Complete these fields before continuing</strong><ul>{Array.from(new Set(activeIssues.map(issue => issue.message))).map(message => <li key={message}>{message}</li>)}</ul></div>}
          <StepBody step={clamped} onNavigate={onNavigate} section={section} setSection={setSection} />
          <ActionBar step={clamped} setStep={setStep} section={section} setSection={setSection} validate={validate} />
        </div>
      </div>
    </div></ValidationContext.Provider>
  );
}

function ActionBar({
  step,
  setStep,
  section,
  setSection,
  validate,
}: {
  step: number;
  setStep: (n: number) => void;
  section: BuildSection;
  setSection: (section: BuildSection) => void;
  validate: () => boolean;
}) {
  const { state } = useSim();
  const isLast = step === CAMPAIGN_STEPS.length - 1;
  const reportReady = campaignChecks(state).every(check => check.ok);
  const reportKey = JSON.stringify([state.student, state.campaign, state.conversions, state.planner, state.rationale]);
  const [generatedKey, setGeneratedKey] = useState("");
  const sections: BuildSection[] = ["keywords", "ads", "assets"];
  const next = () => { if (!validate()) return; if (step === 3 && section !== "assets") setSection(sections[sections.indexOf(section) + 1]); else setStep(step + 1); };
  const back = () => step === 3 && section !== "keywords" ? setSection(sections[sections.indexOf(section) - 1]) : setStep(step - 1);
  return (
    <div className="gads-actionbar">
      {step > 0 && (
        <Button variant="text" onClick={back}>
          Back
        </Button>
      )}
      <span className="spacer" />
      <span className="note">Your campaign stays a draft in this simulator.</span>
      {isLast ? (
        <>
          {generatedKey === reportKey && <a className="gads-btn outline" href={submissionMailto(state)}>Email submission</a>}
          <Button icon="download" disabled={!reportReady} title={!reportReady ? "Complete all build checks first" : undefined} onClick={() => { if (!validate()) return; downloadReport(state); setGeneratedKey(reportKey); }}>Generate HTML report</Button>
        </>
      ) : (
        <Button onClick={next}>{step === 4 ? "Review campaign" : "Next"}</Button>
      )}
    </div>
  );
}

function StepBody({
  step,
  onNavigate,
  section,
  setSection,
}: {
  step: number;
  onNavigate: Navigate;
  section: BuildSection;
  setSection: (section: BuildSection) => void;
}) {
  switch (step) {
    case 0:
      return <><StepObjective /><StepType /></>;
    case 1:
      return <StepBidding />;
    case 2:
      return <StepSettings />;
    case 3:
      return <>
        <div className="gads-build-tabs" aria-label="Keywords and ads sections">
          {(["keywords", "ads", "assets"] as BuildSection[]).map(s => <button key={s} className={section === s ? "active" : ""} aria-pressed={section === s} onClick={() => setSection(s)}>{s === "keywords" ? "Keywords" : s === "ads" ? "Ads" : "Assets"}</button>)}
        </div>
        {section === "keywords" && <StepAdGroups onNavigate={onNavigate} />}
        {section === "ads" && <StepAds />}
        {section === "assets" && <StepAssets />}
      </>;
    case 4:
      return <StepBudget />;
    case 5:
      return <StepReview onNavigate={onNavigate} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ Step 0 */
function StepObjective() {
  const { state, patchCampaign } = useSim();
  const c = state.campaign;
  const toggleGoal = (g: string) =>
    patchCampaign({
      conversionGoals: c.conversionGoals.includes(g)
        ? c.conversionGoals.filter((x) => x !== g)
        : [...c.conversionGoals, g],
    });
  return (
    <div>
      <h2 className="gads-section-h">What&apos;s your campaign objective?</h2>
      <div className="gads-objective-card">
      <h3>Choose your objective</h3>
      <p>Select an objective to tailor your experience to the goals and settings that will work best for your campaign</p>
      <div className="gads-objective-grid">{OBJECTIVES.map((o) => (
        <button
          type="button"
          key={o.id}
          className={`gads-optcard ${c.objective === o.id ? "selected" : ""} ${o.disabled ? "disabled" : ""}`}
          disabled={o.disabled}
          title={o.disabled ? "Outside the Search campaign practical" : undefined}
          aria-pressed={c.objective === o.id}
          onClick={() => patchCampaign({ objective: o.id })}
        >
          <span className="oc-ic">
            <Icon name={o.icon} size={24} />
          </span>
          <span style={{ flex: 1 }}>
            <span className="oc-t">{o.label}</span>
            <span className="oc-d">{o.desc}</span>
          </span>
          {c.objective === o.id && (
            <span className="oc-check">
              <Icon name="checkCircle" size={22} />
            </span>
          )}
        </button>
      ))}</div>
      <FieldError name="objective" />
      </div>

      {c.objective && (
        <Card
          title={`Use these conversion goals to improve ${OBJECTIVES.find(o => o.id === c.objective)?.label || "campaign performance"}`}
          hint="Choose the conversion goals to use for campaign optimization."
        >
          <div className="gads-chips">
            {CONVERSION_GOAL_OPTIONS.map((g) => {
              const on = c.conversionGoals.includes(g);
              return (
                <button
                  key={g}
                  className={`gads-chip ${on ? "match-exact" : ""}`}
                  onClick={() => toggleGoal(g)}
                  style={{ cursor: "pointer" }}
                >
                  {on && <Icon name="check" size={14} />}
                  {g}
                </button>
              );
            })}
          </div>
          <FieldError name="conversionGoals" />
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Step 1 */
function StepType() {
  const { state, patchCampaign } = useSim();
  const c = state.campaign;
  return (
    <div>
      <h2 className="gads-section-h">Select a campaign type</h2>
      <InlineNote>
        This simulator builds <strong>Search</strong> campaigns, as the exam
        requires. Other types are shown for context and disabled. Search is the campaign type assessed in this practical.
      </InlineNote>
      <div className="gads-opt-grid">
        {CAMPAIGN_TYPES.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`gads-optcard ${
              c.type === t.id && t.enabled ? "selected" : ""
            } ${!t.enabled ? "disabled" : ""}`}
            disabled={!t.enabled}
            aria-pressed={c.type === t.id}
            onClick={() => t.enabled && patchCampaign({ type: t.id })}
          >
            <span className="oc-ic">
              <Icon name={t.icon} size={24} />
            </span>
            <span style={{ flex: 1 }}>
              <span className="oc-t">
                {t.label}
                {!t.enabled && (
                  <span className="gads-badge" style={{ marginLeft: 8 }}>
                    Off
                  </span>
                )}
              </span>
              <span className="oc-d">{t.desc}</span>
            </span>
            {c.type === t.id && t.enabled && (
              <span className="oc-check">
                <Icon name="checkCircle" size={22} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Step 2 */
function StepBidding() {
  const { state, patchCampaign } = useSim();
  const c = state.campaign;
  const objLabel =
    OBJECTIVES.find((o) => o.id === c.objective)?.label || "— not set —";
  return (
    <div>
      <h2 className="gads-section-h">Bidding</h2>

      <div className="gads-inline-note">
        <span>
          <strong>Objective:</strong> {objLabel} &nbsp;·&nbsp;{" "}
          <strong>Campaign type:</strong> Search. Choose how your budget is spent.
        </span>
      </div>

      <Card title="Campaign name">
        <TextInput
          aria-label="Campaign name"
          validationKey="name"
          value={c.name}
          onChange={(v) => patchCampaign({ name: v })}
          maxLength={128}
        />
      </Card>

      <Card
        title="Bidding"
        hint="What do you want to focus on? Choose the outcome you want your bidding strategy to optimize for."
      >
        <Field label="What do you want to focus on?">
          <div style={{ maxWidth: 360 }}>
            <Select
              value={c.bidFocus}
              onChange={(v) => patchCampaign({ bidFocus: v as BidFocus })}
              options={BID_FOCUS_OPTIONS.map((b) => ({
                value: b.id,
                label: b.label,
              }))}
            />
          </div>
        </Field>

        {(c.bidFocus === "conversions" || c.bidFocus === "conversion_value") && (
          <div className="gads-field">
            <Checkbox
              checked={c.targetCpaEnabled}
              onChange={(v) => patchCampaign({ targetCpaEnabled: v })}
              label="Set a target cost per action (optional)"
            />
            {c.targetCpaEnabled && (
              <div style={{ maxWidth: 240, marginLeft: 30 }}>
                <TextInput
                  aria-label="Target cost per action"
                  validationKey="targetCpa"
                  value={c.targetCpa}
                  onChange={(v) => patchCampaign({ targetCpa: v })}
                  prefix="₹"
                  inputMode="decimal"
                />
              </div>
            )}
          </div>
        )}

        {(c.bidFocus === "clicks") && (
          <div className="gads-field">
            <Checkbox
              checked={c.maxCpcLimitEnabled}
              onChange={(v) => patchCampaign({ maxCpcLimitEnabled: v })}
              label="Set a maximum cost per click bid limit (recommended)"
            />
            {c.maxCpcLimitEnabled && (
              <div style={{ maxWidth: 240, marginLeft: 30 }}>
                <TextInput
                  aria-label="Maximum CPC bid limit"
                  validationKey="maxCpcLimit"
                  value={c.maxCpcLimit}
                  onChange={(v) => patchCampaign({ maxCpcLimit: v })}
                  prefix="₹"
                  inputMode="decimal"
                />
              </div>
            )}
          </div>
        )}
      </Card>


    </div>
  );
}

/* ------------------------------------------------------------------ Step 3 */
function StepSettings() {
  const { state, patchCampaign } = useSim();
  const c = state.campaign;
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const addLocation = (loc: string) => {
    const v = loc.trim();
    if (v && !c.locations.includes(v))
      patchCampaign({ locations: [...c.locations, v], excludedLocations: c.excludedLocations.filter(x => x.toLowerCase() !== v.toLowerCase()) });
  };
  const addExcluded = (loc: string) => {
    const v = loc.trim();
    if (v && !c.excludedLocations.includes(v))
      patchCampaign({ excludedLocations: [...c.excludedLocations, v], locations: c.locations.filter(x => x.toLowerCase() !== v.toLowerCase()) });
  };
  const toggleLang = (l: string) =>
    patchCampaign({
      languages: l === "All languages"
        ? (c.languages.includes(l) ? [] : [l])
        : c.languages.includes(l) ? c.languages.filter(x => x !== l) : [...c.languages.filter(x => x !== "All languages"), l],
    });

  const addSchedule = () =>
    patchCampaign({
      adSchedule: [
        ...c.adSchedule,
        { id: uid(), days: "Monday - Friday", start: "09:00", end: "21:00" },
      ],
    });
  const updSchedule = (id: string, p: Partial<ScheduleRow>) =>
    patchCampaign({
      adSchedule: c.adSchedule.map((r) => (r.id === id ? { ...r, ...p } : r)),
    });
  const delSchedule = (id: string) =>
    patchCampaign({ adSchedule: c.adSchedule.filter((r) => r.id !== id) });

  return (
    <div>
      <h2 className="gads-section-h">Campaign settings</h2>
      <div className="gads-settings-summary">
        <span><strong>Objective</strong>{OBJECTIVES.find(o => o.id === c.objective)?.label || "Not selected"}</span>
        <span><strong>Campaign type</strong>Search</span>
        <span><strong>Bid strategy</strong>{BID_FOCUS_OPTIONS.find(b => b.id === c.bidFocus)?.label}</span>
      </div>

      <Card
        title="Networks"
        hint="Where your ads can appear. For a pure Search campaign, the Display Network is usually turned off so budget stays on high-intent searches."
      >
        <Checkbox
          checked
          onChange={() => {}}
          label="Search Network"
          sub="Google Search and search sites. Always on for a Search campaign."
        />
        <Checkbox
          checked={c.networks.searchPartners}
          onChange={(v) =>
            patchCampaign({ networks: { ...c.networks, searchPartners: v } })
          }
          label="Include Google search partners"
          sub="Partner sites that show Google search results."
        />
        <Checkbox
          checked={c.networks.display}
          onChange={(v) =>
            patchCampaign({ networks: { ...c.networks, display: v } })
          }
          label="Include Google Display Network"
          sub="Usually left off for a focused search campaign."
        />
      </Card>

      <Card
        title="Locations"
        hint="Target the places your students can actually come from. The centre is in Siliguri with no hostel (PG rooms nearby)."
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Button size="sm" variant="outline" onClick={() => addLocation("India")}>
            + All of India
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addLocation("Siliguri, West Bengal, India")}
          >
            + Siliguri
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const region = [
                "Siliguri, West Bengal, India",
                "Jalpaiguri, West Bengal, India",
                "Darjeeling, West Bengal, India",
                "Cooch Behar, West Bengal, India",
                "Sikkim, India",
              ];
              patchCampaign({ locations: Array.from(new Set([...c.locations, ...region])) });
            }}
          >
            + North Bengal + Sikkim
          </Button>
        </div>

        <LocationAdder
          label="Enter a location to target"
          onAdd={addLocation}
          suggestions={LOCATION_SUGGESTIONS}
        />
        <button className="gads-krow-link" onClick={() => setAdvancedOpen(true)}>Advanced search</button>
        <FieldError name="locations" />
        {(c.radiusTargets || []).map(r => <div className={`gads-radius-summary ${r.mode}`} key={r.id}><Icon name="location" size={16} /><span>{r.mode === "include" ? "Included" : "Excluded"}: {r.distance} {r.unit} around {r.center}</span><button aria-label={`Remove radius around ${r.center}`} className="gads-icon-btn" onClick={() => patchCampaign({ radiusTargets: c.radiusTargets?.filter(x => x.id !== r.id) })}><Icon name="close" size={16} /></button></div>)}
        {advancedOpen && <AdvancedLocations onClose={() => setAdvancedOpen(false)} />}
        {c.locations.length > 0 && (
          <div className="gads-chips">
            {c.locations.map((l) => (
              <span className="gads-chip match-exact" key={l}>
                <Icon name="location" size={14} />
                {l}
                <button
                  className="x"
                  onClick={() =>
                    patchCampaign({
                      locations: c.locations.filter((x) => x !== l),
                    })
                  }
                >
                  <Icon name="close" size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <LocationAdder
            label="Add locations to exclude (optional)"
            onAdd={addExcluded}
            suggestions={LOCATION_SUGGESTIONS}
          />
          {c.excludedLocations.length > 0 && (
            <div className="gads-chips">
              {c.excludedLocations.map((l) => (
                <span className="gads-chip" key={l}>
                  {l}
                  <button
                    className="x"
                    onClick={() =>
                      patchCampaign({
                        excludedLocations: c.excludedLocations.filter(
                          (x) => x !== l
                        ),
                      })
                    }
                  >
                    <Icon name="close" size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="gads-divider" />
        <div className="gads-field">
          <label className="gads-label">Location options</label>
          {(
            [
              [
                "presence_interest",
                "Presence or interest",
                "People in, regularly in, or who've shown interest in your targeted locations (largest reach).",
              ],
              [
                "presence",
                "Presence",
                "People in or regularly in your targeted locations — recommended for a local classroom centre.",
              ],
              [
                "interest",
                "Search interest",
                "People searching for your targeted locations.",
              ],
            ] as [LocationOption, string, string][]
          ).map(([val, label, sub]) => (
            <Radio
              key={val}
              name="locopt"
              checked={c.locationOption === val}
              onChange={() => patchCampaign({ locationOption: val })}
              label={label}
              sub={sub}
            />
          ))}
        </div>
      </Card>

      <Card
        title="Languages"
        hint="Target the languages your customers speak. Included with the schedule in your report."
      >
        <FieldError name="languages" /><div className="gads-chips">
          {LANGUAGE_OPTIONS.map((l) => {
            const on = c.languages.includes(l);
            return (
              <button
                key={l}
                className={`gads-chip ${on ? "match-exact" : ""}`}
                onClick={() => toggleLang(l)}
                style={{ cursor: "pointer" }}
              >
                {on && <Icon name="check" size={14} />}
                {l}
              </button>
            );
          })}
        </div>
      </Card>

      <Card
        title="Ad schedule"
        hint="Choose the days and hours your ads run. Leave empty to run all day, every day."
        right={
          <Button size="sm" variant="outline" icon="add" onClick={addSchedule}>
            Add
          </Button>
        }
      >
        {c.adSchedule.length === 0 ? (
          <div className="gads-muted">All day · every day (no schedule set)</div>
        ) : (
          c.adSchedule.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 180 }}>
                <Select
                  value={r.days}
                  onChange={(v) => updSchedule(r.id, { days: v })}
                  options={[
                    "All days",
                    "Monday - Friday",
                    "Saturday - Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ]}
                />
              </div>
              <input
                type="time"
                aria-label={`Schedule ${r.days} start time`}
                className="gads-input sm"
                style={{ width: 120 }}
                value={r.start}
                onChange={(e) => updSchedule(r.id, { start: e.target.value })}
              />
              <span className="gads-muted">to</span>
              <input
                type="time"
                aria-label={`Schedule ${r.days} end time`}
                className="gads-input sm"
                style={{ width: 120 }}
                value={r.end}
                onChange={(e) => updSchedule(r.id, { end: e.target.value })}
              />
              <FieldError name={`schedule.${r.id}`} />
              <button
                className="gads-icon-btn"
                aria-label="Remove"
                onClick={() => delSchedule(r.id)}
              >
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))
        )}
      </Card>

      <Card title="Start and end dates (optional)">
        <div className="gads-row">
          <Field label="Start date">
            <input
              type="date"
              aria-label="Start date"
              className="gads-input"
              value={c.startDate}
              onChange={(e) => patchCampaign({ startDate: e.target.value })}
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              aria-label="End date"
              className="gads-input"
              value={c.endDate}
              onChange={(e) => patchCampaign({ endDate: e.target.value })}
            />
            <FieldError name="endDate" />
          </Field>
        </div>
      </Card>
    </div>
  );
}

function LocationAdder({
  label,
  onAdd,
  suggestions,
}: {
  label: string;
  onAdd: (v: string) => void;
  suggestions: string[];
}) {
  const [v, setV] = useState("");
  const listId = React.useId();
  return (
    <Field label={label}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="gads-input"
          list={listId}
          aria-label={label}
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd(v);
              setV("");
            }
          }}
        />
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <Button
          variant="outline"
          onClick={() => {
            onAdd(v);
            setV("");
          }}
        >
          Add
        </Button>
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ Step 4 */
function StepAdGroups({
  onNavigate,
}: {
  onNavigate: (screen: string, step?: number) => void;
}) {
  const { state, patchCampaign } = useSim();
  const c = state.campaign;

  const updAg = (id: string, p: Partial<AdGroup>) =>
    patchCampaign({
      adGroups: c.adGroups.map((g) => (g.id === id ? { ...g, ...p } : g)),
    });
  const addAg = () =>
    patchCampaign({
      adGroups: [...c.adGroups, emptyAdGroup(`Ad group ${c.adGroups.length + 1}`)],
    });
  const delAg = (id: string) =>
    patchCampaign({ adGroups: c.adGroups.filter((g) => g.id !== id) });

  const addNegatives = (items: { text: string; match: MatchType }[]) => {
    const existing = new Set(c.negativeKeywords.map((n) => n.text.toLowerCase()));
    const next: NegativeKeyword[] = items
      .filter((i) => { const key = i.text.toLowerCase(); if (!i.text || existing.has(key)) return false; existing.add(key); return true; })
      .map((i) => ({ id: uid(), text: i.text, match: i.match }));
    if (next.length)
      patchCampaign({ negativeKeywords: [...c.negativeKeywords, ...next] });
  };

  return (
    <div>
      <h2 className="gads-section-h">Ad groups &amp; keywords</h2><FieldError name="adGroups" />
      <InlineNote>
        <span>
          Make <strong>at least 2 ad groups</strong>, each for a different kind of
          searcher (e.g. brand &ldquo;allen&rdquo;, dropper intent, local
          Siliguri) with sensible match types.{" "}
          <button
            className="gads-krow-link"
            onClick={() => onNavigate("planner")}
          >
            Open Keyword Planner for ideas ›
          </button>
        </span>
      </InlineNote>

      {c.adGroups.map((g, i) => (
        <AdGroupEditor
          key={g.id}
          group={g}
          index={i}
          canDelete={c.adGroups.length > 1}
          onChange={(p) => updAg(g.id, p)}
          onDelete={() => delAg(g.id)}
        />
      ))}

      <AddLink onClick={addAg}>Add ad group</AddLink>

      <div style={{ height: 8 }} />

      <Card
        title="Negative keywords"
        hint="Searches you don't want to pay for. Add at least 5 specific to this brief — think other exams, free/scholarship seekers, jobs, wrong class, logins and results."
      >
        <KeywordAdder
          label="Negative keywords"
          onAdd={(items) => addNegatives(items)}
        /><FieldError name="negativeKeywords" />



        {c.negativeKeywords.length > 0 && (
          <>
            <div className="gads-divider" />
            <div className="gads-muted" style={{ marginBottom: 8, fontSize: 12 }}>
              {c.negativeKeywords.length} negative keyword
              {c.negativeKeywords.length === 1 ? "" : "s"}
            </div>
            <div className="gads-chips">
              {c.negativeKeywords.map((n) => (
                <span className={`gads-chip match-${n.match}`} key={n.id}>
                  {formatKw(n.text, n.match)}
                  <button
                    className="x"
                    onClick={() =>
                      patchCampaign({
                        negativeKeywords: c.negativeKeywords.filter(
                          (x) => x.id !== n.id
                        ),
                      })
                    }
                  >
                    <Icon name="close" size={14} />
                  </button>
                </span>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function AdGroupEditor({
  group,
  index,
  canDelete,
  onChange,
  onDelete,
}: {
  group: AdGroup;
  index: number;
  canDelete: boolean;
  onChange: (p: Partial<AdGroup>) => void;
  onDelete: () => void;
}) {
  const addKws = (items: { text: string; match: MatchType }[]) => {
    const existing = new Set(
      group.keywords.map((k) => `${k.text.toLowerCase()}|${k.match}`)
    );
    const next: Keyword[] = items
      .filter((i) => { const key = `${i.text.toLowerCase()}|${i.match}`; if (!i.text || existing.has(key)) return false; existing.add(key); return true; })
      .map((i) => ({ id: uid(), text: i.text, match: i.match }));
    if (next.length) onChange({ keywords: [...group.keywords, ...next] });
  };
  return (
    <Card
      title={undefined}
      right={
        canDelete ? (
          <button className="gads-icon-btn" aria-label="Delete ad group" onClick={onDelete}>
            <Icon name="trash" size={18} />
          </button>
        ) : undefined
      }
    >
      <Field label={`Ad group ${index + 1} name`} validationKey={`group.${group.id}.name`}>
        <TextInput
          value={group.name}
          onChange={(v) => onChange({ name: v })}
          maxLength={128}
        />
      </Field>
      <Field
        label="Keywords"
        help='Tip: type plainly for broad, "in quotes" for phrase, or [in brackets] for exact — or pick the match type on the left.'
      >
        <KeywordAdder
          label="Keywords"
          onAdd={addKws}
        /><FieldError name={`group.${group.id}.keywords`} />
      </Field>
      {group.keywords.length > 0 && (
        <div className="gads-chips">
          {group.keywords.map((k) => (
            <span className={`gads-chip match-${k.match}`} key={k.id}>
              {formatKw(k.text, k.match)}
              <button
                className="x"
                onClick={() =>
                  onChange({ keywords: group.keywords.filter((x) => x.id !== k.id) })
                }
              >
                <Icon name="close" size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="gads-help" style={{ marginTop: 8 }}>
        <span className="gads-chip match-broad" style={{ fontSize: 11 }}>
          broad
        </span>{" "}
        <span className="gads-chip match-phrase" style={{ fontSize: 11 }}>
          &ldquo;phrase&rdquo;
        </span>{" "}
        <span className="gads-chip match-exact" style={{ fontSize: 11 }}>
          [exact]
        </span>
      </div>
    </Card>
  );
}

function KeywordAdder({
  label,
  onAdd,
}: {
  label?: string;
  onAdd: (items: { text: string; match: MatchType }[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [match, setMatch] = useState<MatchType>("broad");
  const commit = () => {
    const parts = draft
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const items = parts.map((p) => {
      const parsed = parseKw(p);
      // explicit syntax wins; otherwise use the selected match type
      return parsed.match === "broad" && !/^[["].*[\]"]$/.test(p)
        ? { text: parsed.text, match }
        : parsed;
    });
    if (items.length) onAdd(items);
    setDraft("");
  };
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <div style={{ width: 130 }}>
        <Select
          value={match}
          onChange={(v) => setMatch(v as MatchType)}
          options={[
            { value: "broad", label: "Broad match" },
            { value: "phrase", label: "Phrase match" },
            { value: "exact", label: "Exact match" },
          ]}
        />
      </div>
      <textarea
        className="gads-textarea"
        style={{ flex: "1 1 240px" }}
        rows={4}
        aria-label={label || "Enter keywords"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
      />
      <Button variant="outline" onClick={commit}>
        Add
      </Button>
      <div className="gads-help" style={{ width: "100%" }}>Type one keyword per line. Use quotes for phrase match and brackets for exact match. Click Add or press Ctrl + Enter.</div>
    </div>
  );
}

/* ------------------------------------------------------------------ Step 5 */
function StepAds() {
  const { state, patchCampaign } = useSim();
  const c = state.campaign;
  const [activeId, setActiveId] = useState(c.adGroups[0]?.id);
  const active = c.adGroups.find((g) => g.id === activeId) || c.adGroups[0];

  if (!active) return <div className="gads-muted">Add an ad group first.</div>;

  const setAd = (p: Partial<ResponsiveSearchAd>) =>
    patchCampaign({
      adGroups: c.adGroups.map((g) =>
        g.id === active.id ? { ...g, ad: { ...g.ad, ...p } } : g
      ),
    });
  const ad = active.ad;

  const setHeadline = (i: number, v: string) => {
    const h = [...ad.headlines];
    h[i] = v;
    setAd({ headlines: h });
  };
  const setDesc = (i: number, v: string) => {
    const d = [...ad.descriptions];
    d[i] = v;
    setAd({ descriptions: d });
  };

  const filledH = ad.headlines.filter((x) => x.trim()).length;
  const filledD = ad.descriptions.filter((x) => x.trim()).length;
  const strength = Math.min(
    100,
    Math.round((filledH / 8) * 55 + (filledD / 3) * 45)
  );
  const strengthLabel =
    strength >= 85 ? "Excellent" : strength >= 60 ? "Good" : strength >= 35 ? "Average" : "Poor";

  return (
    <div>
      <h2 className="gads-section-h">Create your ads</h2>
      <InlineNote>
        <span>
          One responsive search ad per ad group: <strong>8+ headlines</strong>,{" "}
          <strong>3+ descriptions</strong>, final URL on <strong>allen.in</strong>{" "}
          Only facts from the brief or allen.in — no rank/result claims or
          guarantees.
        </span>
      </InlineNote>

      <div className="gads-chips" style={{ marginBottom: 16 }}>
        {c.adGroups.map((g) => (
          <button
            key={g.id}
            className={`gads-chip ${g.id === active.id ? "match-exact" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveId(g.id)}
          >
            {g.name || "Untitled ad group"}
          </button>
        ))}
      </div>

      <div className="gads-ad-layout">
        <div>
          <Card title={`Responsive search ad — ${active.name || "ad group"}`}>
            <Field label="Final URL" help="Choose the best existing allen.in page for this ad group.">
              <input
                className="gads-input"
                list="allen-pages"
                aria-label="Final URL"
                value={ad.finalUrl}
                onChange={(e) => setAd({ finalUrl: e.target.value })}
              />
              <FieldError name={`ad.${active.id}.url`} /><datalist id="allen-pages">
                {ALLEN_PAGES.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>

            <div className="gads-row">
              <Field label="Display path 1">
                <TextInput
                  value={ad.path1}
                  onChange={(v) => setAd({ path1: v })}
                  maxLength={15}
                />
              </Field>
              <Field label="Display path 2">
                <TextInput
                  value={ad.path2}
                  onChange={(v) => setAd({ path2: v })}
                  maxLength={15}
                />
              </Field>
            </div>

            <Field label="Business name">
              <TextInput
                value={ad.businessName}
                onChange={(v) => setAd({ businessName: v })}
                maxLength={25}
              />
            </Field>

            <div className="gads-divider" />
            <label className="gads-label">
              Headlines ({filledH}/15 · aim for 8+)
            </label>
            <FieldError name={`ad.${active.id}.headlines`} /><div className="gads-asset-rows">
              {ad.headlines.map((h, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <TextInput
                    validationKey={`ad.${active.id}.headline.${i}`}
                    value={h}
                    onChange={(v) => setHeadline(i, v)}
                    maxLength={30}
                    label={`Headline ${i + 1}`}
                  />
                  {ad.headlines.length > 3 && (
                    <button
                      className="gads-icon-btn"
                      aria-label="Remove headline"
                      onClick={() =>
                        setAd({
                          headlines: ad.headlines.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <Icon name="close" size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {ad.headlines.length < 15 && (
              <AddLink onClick={() => setAd({ headlines: [...ad.headlines, ""] })}>
                Add headline
              </AddLink>
            )}

            <div className="gads-divider" />
            <label className="gads-label">
              Descriptions ({filledD}/4 · aim for 3+)
            </label>
            <FieldError name={`ad.${active.id}.descriptions`} /><div className="gads-asset-rows">
              {ad.descriptions.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <TextArea
                    validationKey={`ad.${active.id}.description.${i}`}
                    value={d}
                    onChange={(v) => setDesc(i, v)}
                    maxLength={90}
                    label={`Description ${i + 1}`}
                    rows={2}
                  />
                  {ad.descriptions.length > 2 && (
                    <button
                      className="gads-icon-btn"
                      aria-label="Remove description"
                      onClick={() =>
                        setAd({
                          descriptions: ad.descriptions.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <Icon name="close" size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {ad.descriptions.length < 4 && (
              <AddLink
                onClick={() => setAd({ descriptions: [...ad.descriptions, ""] })}
              >
                Add description
              </AddLink>
            )}

            <div className="gads-strength">
              <span className="bar">
                <i style={{ width: `${strength}%` }} />
              </span>
              Simulated ad strength: <strong>{strengthLabel}</strong>
            </div>
          </Card>
        </div>

        <div className="gads-preview">
          <div className="gads-preview-card">
            <div className="gads-preview-head">
              <Icon name="search" size={16} /> Preview
            </div>
            <div className="gads-preview-body">
              <AdPreview ad={ad} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdPreview({ ad }: { ad: ResponsiveSearchAd }) {
  const heads = ad.headlines.filter((h) => h.trim()).slice(0, 3);
  const desc = ad.descriptions.filter((d) => d.trim()).slice(0, 2).join(" ");
  let host = "allen.in";
  try {
    if (ad.finalUrl) host = new URL(ad.finalUrl).host.replace(/^www\./, "");
  } catch {
    /* keep default */
  }
  const path = [ad.path1, ad.path2].filter(Boolean).join("/");
  return (
    <div className="gads-serp-ad">
      <div>
        <span className="tag">Sponsored</span>
      </div>
      <span className="url">
        {ad.businessName ? `${ad.businessName} · ` : ""}
        {host}
        {path && <span className="path">/{path}</span>}
      </span>
      <div className="title">
        {heads.length ? heads.join(" | ") : "Your headlines appear here"}
      </div>
      <div className="desc">
        {desc || "Your descriptions appear here. Keep to facts from the brief."}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Step 6 */
function StepAssets() {
  const { state, patchCampaign, setState } = useSim();
  const c = state.campaign;

  const onImage = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      patchCampaign({
        image: { enabled: true, name: file.name, dataUrl },
      });
    } catch {
      alert("Could not read that image. Try a smaller JPG or PNG.");
    }
  };

  return (
    <div>
      <h2 className="gads-section-h">Assets (ad extensions)</h2>
      <InlineNote>
        <span>
          Add a <strong>Call</strong> asset; an image is optional if available.
        </span>
      </InlineNote>

      <Card
        title="Call asset"
        hint="Show a phone number with your ad so students can call the Siliguri centre."
      >
        <Checkbox
          checked={c.call.enabled}
          onChange={(v) => patchCampaign({ call: { ...c.call, enabled: v } })}
          label="Show a call asset"
        /><FieldError name="call" />
        {c.call.enabled && (
          <div className="gads-row" style={{ marginTop: 8 }}>
            <Field label="Country">
              <Select
                value={c.call.country}
                onChange={(v) => patchCampaign({ call: { ...c.call, country: v } })}
                options={["India (+91)", "Other"]}
              />
            </Field>
            <Field label="Phone number">
              <TextInput
                validationKey="callNumber"
                value={c.call.number}
                onChange={(v) => patchCampaign({ call: { ...c.call, number: v } })}
              />
            </Field>
          </div>
        )}
      </Card>

      <Card
        title="Image asset"
        hint="Add an image if your account allows it. Uploads are resized and saved only in this browser."
      >
        <Checkbox
          checked={c.image.enabled}
          onChange={(v) =>
            patchCampaign({ image: { ...c.image, enabled: v } })
          }
          label="Add an image asset"
        /><FieldError name="image" />
        {c.image.enabled && (
          <div style={{ marginTop: 10 }}>
            <label className="gads-btn outline" style={{ display: "inline-flex", gap: 6 }}>
              <Icon name="upload" size={18} /> Upload image
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => onImage(e.target.files?.[0])}
              />
            </label>
            {c.image.dataUrl && (
              <div style={{ marginTop: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image.dataUrl}
                  alt={c.image.name}
                  style={{
                    maxWidth: 240,
                    borderRadius: 8,
                    border: "1px solid var(--g-line)",
                  }}
                />
                <div className="gads-muted" style={{ fontSize: 12, marginTop: 6 }}>
                  {c.image.name}{" "}
                  <button
                    className="gads-krow-link"
                    onClick={() =>
                      setState((st) => ({
                        ...st,
                        campaign: {
                          ...st.campaign,
                          image: { enabled: true, name: "", dataUrl: "" },
                        },
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ Step 7 */
function StepBudget() {
  const { state, patchCampaign } = useSim();
  const c = state.campaign;
  const monthly = Number(c.budgetMonthly) || 0;
  const calculated = monthly / 30.4;
  const daily = Number(c.budgetDaily) || 0;
  return <div>
    <h2 className="gads-section-h">Set your budget</h2>
    <p className="gads-page-sub">Choose the average amount you want to spend each day.</p>
    <Card title="Average daily budget">
      <div className="gads-budget-input"><Field label="Enter your average daily budget" help="Currency: Indian Rupee (INR)">
        <TextInput validationKey="budgetDaily" aria-label="Average daily budget" value={c.budgetDaily} prefix="₹" inputMode="decimal" onChange={v => patchCampaign({ budgetDaily: v.replace(/[^\d.]/g, "") })} />
      </Field></div>
      <p className="gads-help">For most campaigns, spending can be up to twice this amount on a day. The monthly charging limit is 30.4 times your average daily budget.</p>
      {daily > 0 && <div className="gads-budget-summary"><span>Average daily budget<strong>₹{daily.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></span><span>Monthly estimate<strong>₹{(daily * 30.4).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></span></div>}
    </Card>
    <Card title="Exam budget calculator" hint="Show the working from the monthly budget in your brief.">
      <Field label="Monthly budget"><TextInput aria-label="Monthly budget" value={c.budgetMonthly} prefix="₹" inputMode="decimal" onChange={v => patchCampaign({ budgetMonthly: v.replace(/[^\d.]/g, "") })} /></Field>
      <div className="gads-budget-working">₹{monthly.toLocaleString("en-IN")} ÷ 30.4 = <strong>₹{calculated.toFixed(2)} / day</strong></div>
      <Button variant="outline" disabled={monthly <= 0} onClick={() => patchCampaign({ budgetDaily: calculated.toFixed(2) })}>Use calculated daily budget</Button>
    </Card>
  </div>;
}

function StepReview({ onNavigate }: { onNavigate: Navigate }) {
  const { state, patch } = useSim();
  const c = state.campaign;
  const checks = campaignChecks(state);
  const missing = checks.filter(check => !check.ok);
  return <div>
    <h2 className="gads-section-h">Your campaign is ready to review</h2>
    <InlineNote variant={missing.length ? "warn" : undefined}>
      <span><strong>{missing.length ? `${missing.length} build checks need attention` : "All build checks complete"}</strong>. Complete your student details below, then generate your HTML report for submission.</span>
    </InlineNote>
    <Card title={c.name || "Untitled campaign"} hint="Search campaign · Simulation draft">
      <div className="gads-review-summary">
        <div><span>Objective</span><strong>{OBJECTIVES.find(o => o.id === c.objective)?.label || "Not selected"}</strong></div>
        <div><span>Bidding</span><strong>{BID_FOCUS_OPTIONS.find(b => b.id === c.bidFocus)?.label}</strong></div>
        <div><span>Networks</span><strong>Google Search{c.networks.searchPartners ? ", Search partners" : ""}{c.networks.display ? ", Display Network" : ""}</strong></div>
        <div><span>Included locations</span><strong>{[...c.locations, ...(c.radiusTargets || []).filter(r => r.mode === "include").map(r => `${r.distance} ${r.unit} around ${r.center}`)].join(", ") || "Not selected"}</strong></div>
        <div><span>Excluded locations</span><strong>{[...c.excludedLocations, ...(c.radiusTargets || []).filter(r => r.mode === "exclude").map(r => `${r.distance} ${r.unit} around ${r.center}`)].join(", ") || "None"}</strong></div>
        <div><span>Location options</span><strong>{c.locationOption.replaceAll("_", " + ")}</strong></div>
        <div><span>Languages &amp; schedule</span><strong>{c.languages.join(", ")} · {c.adSchedule.length ? c.adSchedule.map(r => `${r.days} ${r.start}–${r.end}`).join(", ") : "All day, every day"}</strong></div>
        <div><span>Ad groups &amp; keywords</span><strong>{c.adGroups.length} ad groups · {c.adGroups.reduce((sum, g) => sum + g.keywords.length, 0)} keywords · {c.negativeKeywords.length} negatives</strong></div>
        <div><span>Average daily budget</span><strong>{Number(c.budgetDaily) > 0 ? `₹${c.budgetDaily} / day` : "Not entered"}</strong></div>
        <div><span>Image asset (optional)</span><strong>{c.image.enabled && c.image.dataUrl ? "Added" : "Not added"}</strong></div>
      </div>
    </Card>
    <Card title="Check your campaign" hint="Completion checks help you find missing fields; they do not grade your strategy or verify your evidence.">
      {checks.map(check => <div className="gads-review-check" key={check.label}>
        <Icon name={check.ok ? "checkCircle" : "info"} size={20} />
        <span>{check.label}<small>{check.ok ? "Complete" : "Needs attention"}</small></span>
        <button className="gads-krow-link" onClick={() => onNavigate(check.step < 0 ? "conversions" : "build", check.step < 0 ? undefined : check.step, check.section)}>{check.step < 0 ? "Open" : "Edit"}</button>
      </div>)}
    </Card>
    <Card title="Student details and submission" hint={`Generate your complete HTML report and email it to ${SUBMISSION_EMAIL}.`}>
      <div className="gads-row">
        <Field label="Student name" validationKey="studentName"><TextInput value={state.student?.name || ""} maxLength={100} onChange={name => patch({ student: { name } })} /></Field>
      </div>
      <FieldError name="reportReady" />
      <Field label="Campaign rationale" validationKey="rationale"><TextArea value={state.rationale || ""} rows={6} onChange={rationale => patch({ rationale })} /></Field>
      <p className="gads-help">The HTML file contains your entire campaign setup and opens in a browser. After generating it, use Email submission to open a draft email. Attach the downloaded HTML file before sending.</p>
    </Card>
    <InlineNote><span>This practice account never publishes ads or asks for payment. You can download a JSON backup from the toolbar at any time. Generate a new report after making changes to your setup.</span></InlineNote>
  </div>;
}
