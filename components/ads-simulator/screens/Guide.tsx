"use client";

import React from "react";
import { BRIEF, EXAM_ROWS } from "../data";
import { Card, InlineNote, Button, Field, TextInput } from "../ui";
import { useSim } from "../context";
import { SUBMISSION_EMAIL } from "../report";
import type { BuildSection, Navigate } from "../flow";

const REQUIREMENTS: Record<string, string> = {
  B0: 'Research at least 8 keywords, including “allen” and “jee dropper batch”. Compare average monthly searches and both top-of-page bid ranges for Siliguri and all of India. Click one keyword to inspect its 12-month trend; that selected trend is included in your report.',
  B1: 'Create one Search campaign. Choose an objective, conversion goals, networks and bid focus. Name your campaign. If you enable a target CPA or CPC limit, enter a valid positive amount. Explain the strategy you chose.',
  B2: 'Choose included locations and any exclusions, and select the Location options setting. Advanced search supports location and radius choices. Explain whether the director’s “across India” instruction fits this brief, citing a number from B0.',
  B3: 'Select your target languages and the days and hours your ads should run. If you keep all-day, every-day delivery, say why. Explain how your language and schedule choices fit the students and centre.',
  B4: 'Create at least 3 named ad groups, each for a different kind of searcher. Add relevant keywords to every group and choose appropriate broad, phrase or exact match types. Explain why you separated the groups.',
  B5: 'Add at least 10 negative keywords specific to this brief. Explain which irrelevant searches they exclude and why you would avoid paying for them.',
  B6: 'Create one responsive search ad in every ad group: at least 8 headlines and 3 descriptions, with a suitable existing final URL on allen.in. Headlines allow 30 characters each and descriptions 90; there can be up to 15 headlines and 4 descriptions. Ad claims must follow the rules below.',
  B7: 'Add a call asset using a verified ALLEN contact number from allen.in, at least 2 sitelinks with valid allen.in destinations, and at least 2 callouts. Sitelink text and callouts allow 25 characters. An image is optional; upload it if you enable the image asset.',
  B8: 'Convert the scenario’s ₹50,000 monthly budget to an average daily budget using 30.4 days per month. Use the budget calculator, set your chosen daily amount, and retain the working in the report. Explain your choice.',
  B9: 'Create and save a conversion action. Give it a name, category and counting setting (One or Every). Explain what action you are measuring and why the counting setting fits it. No real website tag or Google account connection is required.',
};

export default function Guide({ onNavigate }: { onNavigate: Navigate }) {
  const { state, patch } = useSim();
  return <div className="gads-exam-handout">
    <h1 className="gads-page-title">Google Search Ads — 90-minute practical</h1>
    <p className="gads-page-sub">This page is your complete exam handout. Read it before starting, and return to Exam guide whenever you need it.</p>
    <div className="gads-exam-facts"><span>90 minutes</span><span>One Search campaign</span><span>Individual setup and explanation</span><span>HTML report by email</span></div>

    <Card title="What you have to do">
      <p>You are the marketing manager of ALLEN Career Institute’s Siliguri centre. Research, build and defend one Google Search campaign to fill its one-year JEE batch for students who have finished Class 12 and are taking a drop year to try again.</p>
      <p>ALLEN is a Kota-based institute that prepares students for engineering and medical entrance exams. This task concerns JEE, the engineering entrance exam for IITs, NITs and other engineering colleges: JEE Main comes first, followed by JEE Advanced for the IITs.</p>
      <p>Complete the practical in this simulator. You do not need a real Google Ads account. Your final submission must show your setup, research, reasons for your decisions, and your response to the midway twist.</p>
    </Card>

    <Card title="Your scenario and permitted facts">
      <InlineNote><span><strong>Scenario dates:</strong> assume it is the first week of April. The result dates and batch timing below belong to the scenario, regardless of the real date displayed by the clock.</span></InlineNote>
      <dl className="gads-brief-grid">
        <dt>Centre</dt><dd>{BRIEF.centre}</dd>
        <dt>Course and audience</dt><dd>{BRIEF.course}</dd>
        <dt>Listed classroom fee (approx.)</dt><dd>{BRIEF.feeClassroom}</dd>
        <dt>Listed online fee (approx.)</dt><dd>{BRIEF.feeOnline}</dd>
        <dt>Hostel</dt><dd>{BRIEF.hostel}</dd>
        <dt>Today in the scenario</dt><dd>{BRIEF.today}</dd>
        <dt>Batch starts</dt><dd>{BRIEF.batch}</dd>
        <dt>Monthly advertising budget</dt><dd>{BRIEF.budget}</dd>
        <dt>Website</dt><dd>{BRIEF.website} — choose the best existing page for each ad group</dd>
      </dl>
      <p className="gads-help">{BRIEF.source} These are the supplied facts. You may verify additional ad claims and landing pages on allen.in; do not invent information.</p>
      <blockquote className="gads-director-quote">“Everyone knows ALLEN. Just bid on ‘allen’ across India and the admissions will come.”</blockquote>
      <p>Your director has made this claim. Your B2 explanation must agree or disagree using a number from your own B0 Planner research and a fact from this scenario. Do not accept the claim without examining the data.</p>
    </Card>

    <Card title="Before you start">
      <div className="gads-row">
        <Field label="Student name"><TextInput value={state.student?.name || ""} maxLength={100} onChange={name => patch({ student: { name } })} /></Field>
      </div>
      <ul>
        <li>Enter your name accurately. It is saved with your draft and used in the report filename and exam watermark.</li>
        <li>The examiner announces the start and finish. You have 90 minutes in total; submit your report before the announced finish.</li>
        <li>Use Tools → Keyword Planner for research. Its search volumes, bids and trends are simulated training data, not live Google Ads figures. Use the same figures in your explanations.</li>
        <li>You may check allen.in for existing landing pages and verifiable ALLEN facts. Do not open a real advertising account, add payment details or publish a campaign.</li>
        <li>Work saves in this browser. Stay on the same device and browser; do not clear browser data. Use the toolbar’s JSON backup if you need a recoverable copy. A backup is not your final submission.</li>
      </ul>
    </Card>

    <Card title="Required setup: B0–B9" hint="Complete every row. Open takes you to its settings; you may revisit any step, including after the twist.">
      <div className="gads-table-scroll"><table className="gads-table gads-guide-table"><thead><tr><th>Ref.</th><th>Task</th><th>What you must complete</th><th>Open</th></tr></thead><tbody>
        {EXAM_ROWS.map(row => <tr key={row.id}><td><strong>{row.id}</strong></td><td>{row.title}</td><td>{REQUIREMENTS[row.id]}</td><td><button className="gads-krow-link" onClick={() => onNavigate(row.id === "B0" ? "planner" : row.id === "B9" ? "conversions" : "build", row.id === "B0" || row.id === "B9" ? undefined : stepForRow(row.id), sectionForRow(row.id))}>Open ›</button></td></tr>)}
      </tbody></table></div>
    </Card>

    <Card title="Explain your decisions">
      <p>On Review, use <strong>Campaign rationale</strong> to write one reason for each row B0–B9. Put each reason on a separate line and start it with its reference, such as <strong>B0:</strong>. Explain your own choices; do not just repeat the setting.</p>
      <p>Every reason must cite a relevant fact from this brief or a number from your Planner research. Any number you mention must match the research in your report. For B2, explicitly address the director’s national-targeting claim. Include your budget working for B8.</p>
      <p>Be prepared to explain your setup in a spot check during the next class. Completing fields alone does not demonstrate that the campaign fits the brief.</p>
    </Card>

    <Card title="The midway twist">
      <p>Midway through the practical, the examiner will read out a message from head office. The message is not provided in advance.</p>
      <ol><li>Update your campaign to match the new instruction.</li><li>In <strong>Twist notes</strong> on Review, write three lines: what you changed; what you cut; and why you cut that rather than something else.</li><li>Review all affected settings and generate your final report after the changes. If you already generated a report, replace it with a fresh one.</li></ol>
      <p>Your changes must fit the message and your own research. Changing more settings is not automatically a better response.</p>
    </Card>

    <Card title="Rules for this practical">
      <ul><li>Use only the supplied scenario facts or claims you can verify on allen.in. Do not invent prices, ranks, results or promises.</li><li>No ad may guarantee a rank or result, or make a student feel bad about their result.</li><li>Use consistent research figures and explainable decisions. Work you cannot explain may be rejected during a spot check.</li><li>Type your own answers. Copy, cut, paste, text drag-and-drop and printing are disabled in the simulator. Do not photograph or share exam content.</li><li>The brief is watermarked and hides when the page loses focus. Select <strong>Resume exam</strong> to reveal it again.</li><li>Do not publish a campaign and do not add payment details. Nothing in this simulator serves ads or spends money.</li></ul>
    </Card>

    <Card title="Use the 90 minutes well">
      <div className="gads-exam-timeline"><div><strong>15 min</strong><span>Read the brief and research keywords</span></div><div><strong>15 min</strong><span>Campaign settings</span></div><div><strong>35 min</strong><span>Keywords, ads and assets</span></div><div><strong>10 min</strong><span>Conversions and budget</span></div><div><strong>15 min</strong><span>Reasons, twist, review and submission</span></div></div>
      <p className="gads-help">This is a suggested pace. Make the twist changes when the examiner announces them, and leave time to send your final report.</p>
    </Card>

    <Card title="What to submit and how">
      <ol><li>Open <strong>Review</strong>. Resolve every build check and validation message. Confirm your name, your B0–B9 reasons, and the twist notes.</li><li>Select <strong>Generate HTML report</strong>. The file includes your campaign settings, targeting, keywords, ads, assets, budget, conversion actions, Planner research, rationale and twist notes.</li><li>Keep the generated filename: <strong>Name_MidSem.html</strong>. Open the downloaded HTML file in a browser and check that it records your final setup.</li><li>Select <strong>Email submission</strong> or use your own email app. Address the message to <strong>{SUBMISSION_EMAIL}</strong> and use <strong>Name_MidSem</strong> as the subject.</li><li><strong>Attach the downloaded HTML file yourself.</strong> The email link fills the recipient and message; it cannot attach the file or send the email for you. If the download or email client fails, tell the examiner before the finish.</li><li>Send the email before the announced finish, and check your Sent folder. A JSON backup, an email draft, or an older report is not a completed submission. No separate screenshot handout or document is required.</li></ol>
      <InlineNote><span><strong>Final check:</strong> one complete Search campaign, saved conversion action, your reasons, the twist response, correct identity, and the final HTML attached to the email.</span></InlineNote>
    </Card>
    <div className="gads-brief-actions"><Button onClick={() => onNavigate("planner")}>Start with Keyword Planner</Button><Button variant="outline" onClick={() => onNavigate("build")}>Open campaign builder</Button></div>
  </div>;
}

function stepForRow(id: string): number {
  if (["B1", "B2", "B3"].includes(id)) return 2;
  if (["B4", "B5", "B6", "B7"].includes(id)) return 3;
  if (id === "B8") return 4;
  return 0;
}
function sectionForRow(id: string): BuildSection | undefined {
  if (id === "B4" || id === "B5") return "keywords";
  if (id === "B6") return "ads";
  if (id === "B7") return "assets";
}
