"use client";

import React, { useState } from "react";
import { useSim } from "../context";
import { uid } from "../store";
import { CONVERSION_CATEGORIES } from "../data";
import type { ConversionAction } from "../types";
import {
  Button,
  Card,
  Field,
  TextInput,
  Select,
  Radio,
  Checkbox,
  InlineNote,
  ValidationContext,
} from "../ui";
import { Icon } from "../icons";
import { conversionErrors } from "../validation";

function blankAction(): ConversionAction {
  return {
    id: uid(),
    name: "",
    source: "Website",
    category: "Submit lead form",
    valueMode: "none",
    value: "",
    count: "one",
    windowDays: "30",
    includeInConversions: true,
  };
}

export default function Conversions() {
  const { state, setState, patch } = useSim();
  const draft = state.conversionDraft || null;
  const setDraft = (value: ConversionAction | null) => patch({ conversionDraft: value });
  const [chooseSource, setChooseSource] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const errors = draft && attempted ? conversionErrors(draft) : {};

  const start = () => setChooseSource(true);
  const edit = (a: ConversionAction) => setDraft({ ...a });

  const save = () => {
    if (!draft) return;
    setAttempted(true);
    if (Object.keys(conversionErrors(draft)).length) return;
    setState((s) => {
      const exists = s.conversions.some((c) => c.id === draft.id);
      return {
        ...s,
        conversions: exists
          ? s.conversions.map((c) => (c.id === draft.id ? draft : c))
          : [...s.conversions, draft],
      };
    });
    setDraft(null);
  };

  const remove = (id: string) =>
    setState((s) => ({
      ...s,
      conversions: s.conversions.filter((c) => c.id !== id),
    }));

  return (
    <ValidationContext.Provider value={errors}><div>
      <h1 className="gads-page-title">Conversions</h1>
      <p className="gads-page-sub">
        Goals · Conversions · Summary — measure the actions worth money to you
      </p>

      {chooseSource && <Card title="Choose a data source" hint="Set up a simulated conversion action. No website scan, Google tag or account connection is needed.">
        <div className="gads-objective-grid">{(["Website", "Phone calls", "Import"] as const).map(source => <button key={source} className="gads-optcard" onClick={() => { setDraft({ ...blankAction(), source }); setChooseSource(false); }}>
          <span className="oc-ic"><Icon name={source === "Website" ? "public" : source === "Phone calls" ? "phone" : "upload"} size={24} /></span>
          <span className="oc-t">{source}</span><span className="oc-d">{source === "Website" ? "Measure actions on your website" : source === "Phone calls" ? "Measure calls from your ads" : "Import conversions from another source"}</span>
        </button>)}</div><Button variant="text" onClick={() => setChooseSource(false)}>Cancel</Button>
      </Card>}

      {!draft && !chooseSource && (
        <Card
          title="Conversion actions"
          hint="A conversion action records when someone does something valuable after clicking your ad — like submitting the admission enquiry form."
          right={
            <Button icon="add" onClick={start}>
              New conversion action
            </Button>
          }
        >
          {state.conversions.length === 0 ? (
            <div className="gads-muted" style={{ padding: "20px 0" }}>
              No conversion actions yet. Create one for B9 —
              an &ldquo;Admission enquiry&rdquo; lead form submission.
            </div>
          ) : (
            <table className="gads-table">
              <thead>
                <tr>
                  <th>Conversion action</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Count</th>
                  <th>Value</th>
                  <th>Window</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {state.conversions.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <button
                        className="gads-krow-link"
                        onClick={() => edit(c)}
                      >
                        {c.name}
                      </button>
                    </td>
                    <td>{c.category}</td>
                    <td>{c.source}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {c.count === "one" ? "One" : "Every"}
                    </td>
                    <td>
                      {c.valueMode === "none"
                        ? "Don't use a value"
                        : `₹${c.value || "0"}`}
                    </td>
                    <td>{c.windowDays} days</td>
                    <td>
                      <button
                        className="gads-icon-btn"
                        aria-label="Delete"
                        onClick={() => remove(c.id)}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {draft && (
        <Card title="New conversion action">
          <InlineNote>
            For this brief a lead campaign usually tracks an enquiry form. Pick a
            category and counting setting that matches a <em>lead</em>, then
            save it for your report (B9).
          </InlineNote>

          <Field label="Goal source">
            <Select
              value={draft.source}
              onChange={(v) => setDraft({ ...draft, source: v })}
              options={["Website", "Phone calls", "App", "Import"]}
            />
          </Field>

          <Field label="Conversion name">
            <TextInput
              validationKey="conversionName"
              aria-label="Conversion name"
              value={draft.name}
              onChange={(v) => setDraft({ ...draft, name: v })}
              maxLength={100}
            />
          </Field>

          <Field
            label="Category"
            help="Describes the type of action. Lead campaigns commonly use 'Submit lead form' or 'Contact'."
          >
            <Select
              value={draft.category}
              aria-label="Conversion category"
              onChange={(v) =>
                setDraft({ ...draft, category: v as ConversionAction["category"] })
              }
              options={CONVERSION_CATEGORIES}
            />
          </Field>

          <div className="gads-field">
            <label className="gads-label">Value</label>
            <Radio
              name="valmode"
              checked={draft.valueMode === "same"}
              onChange={() => setDraft({ ...draft, valueMode: "same" })}
              label="Use the same value for each conversion"
            />
            {draft.valueMode === "same" && (
              <div style={{ maxWidth: 240, marginLeft: 30 }}>
                <TextInput
                  validationKey="conversionValue"
                  aria-label="Conversion value"
                  value={draft.value}
                  onChange={(v) => setDraft({ ...draft, value: v })}
                  prefix="₹"
                  inputMode="decimal"
                />
              </div>
            )}
            <Radio
              name="valmode"
              checked={draft.valueMode === "different"}
              onChange={() => setDraft({ ...draft, valueMode: "different" })}
              label="Use different values for each conversion"
            />
            <Radio
              name="valmode"
              checked={draft.valueMode === "none"}
              onChange={() => setDraft({ ...draft, valueMode: "none" })}
              label="Don't use a value for this conversion action"
            />
          </div>

          <div className="gads-field">
            <label className="gads-label">Count</label>
            <Radio
              name="count"
              checked={draft.count === "one"}
              onChange={() => setDraft({ ...draft, count: "one" })}
              label="One"
              sub="Best for leads — count a single conversion per ad click (one enquiry per student)."
            />
            <Radio
              name="count"
              checked={draft.count === "every"}
              onChange={() => setDraft({ ...draft, count: "every" })}
              label="Every"
              sub="Best for sales — count every conversion after an ad click."
            />
          </div>

          <Field
            label="Click-through conversion window"
            help="How long after a click a conversion can be counted."
          >
            <div style={{ maxWidth: 220 }}>
              <Select
                value={draft.windowDays}
                onChange={(v) => setDraft({ ...draft, windowDays: v })}
                options={["7", "14", "30", "60", "90"].map((d) => ({
                  value: d,
                  label: `${d} days`,
                }))}
              />
            </div>
          </Field>

          <Checkbox
            checked={draft.includeInConversions}
            onChange={(v) => setDraft({ ...draft, includeInConversions: v })}
            label={'Include in "Conversions"'}
            sub="Lets your bid strategy optimise toward this action."
          />

          <div className="gads-divider" />
          <div style={{ display: "flex", gap: 12 }}>
            <Button onClick={save}>
              Save conversion action
            </Button>
            <Button variant="text" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div></ValidationContext.Provider>
  );
}
