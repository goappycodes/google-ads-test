"use client";

import React from "react";
import { BRIEF } from "../data";
import { Card, InlineNote, Button, Field, TextInput } from "../ui";
import { useSim } from "../context";
import { SUBMISSION_EMAIL } from "../report";
import type { Navigate } from "../flow";

export default function Guide({ onNavigate }: { onNavigate: Navigate }) {
  const { state, patch } = useSim();
  return <div className="gads-exam-handout">
    <h1 className="gads-page-title">Google Search Ads — 90-minute practical</h1>
    <InlineNote variant="warn"><strong>No ad may guarantee a rank or result, or make a student feel bad about their result.</strong></InlineNote>
    <p className="gads-page-sub">This page is your complete exam handout. Read it before starting, and return to Exam guide whenever you need it.</p>
    <div className="gads-exam-facts"><span>90 minutes</span><span>One Search campaign</span><span>Individual setup and explanation</span><span>HTML report by email</span></div>

    <Card title="What you have to do">
      <p>You are the marketing manager of ALLEN Career Institute’s Siliguri centre. Research, build and defend one Google Search campaign to fill its one-year JEE batch for students who have finished Class 12 and are taking a drop year to try again. Use at least two ad groups, each for a different kind of searcher.</p>
      <p>ALLEN is a Kota-based institute that prepares students for engineering and medical entrance exams. This task concerns JEE, the engineering entrance exam for IITs, NITs and other engineering colleges: JEE Main comes first, followed by JEE Advanced for the IITs.</p>
      <p>Complete the practical in this simulator. You do not need a real Google Ads account. Your final submission must show your setup, research, and reasons for your decisions.</p>
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
      <p>Your director has made this claim. Your explanation must agree or disagree using a number from your own Planner research and a fact from this scenario. Do not accept the claim without examining the data.</p>
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

    <Card title="Explain your decisions">
      <p>On Review, use <strong>Campaign rationale</strong> to explain your research, targeting, bidding, keywords, ads, assets and budget choices. Write in your own words; do not just repeat the settings.</p>
      <p>Every reason must cite a relevant fact from this brief or a number from your Planner research. Any number you mention must match the research in your report. Explicitly address the director’s national-targeting claim. Include your budget working.</p>
      <p>Be prepared to explain your setup in a spot check during the next class. Completing fields alone does not demonstrate that the campaign fits the brief.</p>
    </Card>

    <Card title="Rules for this practical">
      <ul><li>Use only the supplied scenario facts or claims you can verify on allen.in. Do not invent prices, ranks, results or promises.</li><li>No ad may guarantee a rank or result, or make a student feel bad about their result.</li><li>Use consistent research figures and explainable decisions. Work you cannot explain may be rejected during a spot check.</li><li>Type your own answers. Copy, cut, paste, text drag-and-drop and printing are disabled in the simulator. Do not photograph or share exam content.</li><li>The brief is watermarked and hides when the page loses focus. Select <strong>Resume exam</strong> to reveal it again.</li><li>Do not publish a campaign and do not add payment details. Nothing in this simulator serves ads or spends money.</li></ul>
    </Card>

    <Card title="Use the 90 minutes well">
      <div className="gads-exam-timeline"><div><strong>15 min</strong><span>Read the brief and research keywords</span></div><div><strong>15 min</strong><span>Campaign settings</span></div><div><strong>35 min</strong><span>Keywords, ads and assets</span></div><div><strong>10 min</strong><span>Conversions and budget</span></div><div><strong>15 min</strong><span>Reasons, review and submission</span></div></div>
      <p className="gads-help">This is a suggested pace. Leave time to review your setup and send your final report.</p>
    </Card>

    <Card title="What to submit and how">
      <ol><li>Open <strong>Review</strong>. Resolve every build check and validation message. Confirm your name and campaign rationale.</li><li>Select <strong>Generate HTML report</strong>. The file includes your campaign settings, targeting, keywords, ads, assets, budget, conversion actions, Planner research and rationale.</li><li>Keep the generated filename: <strong>Name_MidSem.html</strong>. Open the downloaded HTML file in a browser and check that it records your final setup.</li><li>Select <strong>Email submission</strong> or use your own email app. Address the message to <strong>{SUBMISSION_EMAIL}</strong> and use <strong>Name_MidSem</strong> as the subject.</li><li><strong>Attach the downloaded HTML file yourself.</strong> The email link fills the recipient and message; it cannot attach the file or send the email for you. If the download or email client fails, tell the examiner before the finish.</li><li>Send the email before the announced finish, and check your Sent folder. A JSON backup, an email draft, or an older report is not a completed submission. No separate screenshot handout or document is required.</li></ol>
      <InlineNote><span><strong>Final check:</strong> one complete Search campaign, saved conversion action, your reasons, correct identity, and the final HTML attached to the email.</span></InlineNote>
    </Card>
    <div className="gads-brief-actions"><Button onClick={() => onNavigate("planner")}>Start with Keyword Planner</Button><Button variant="outline" onClick={() => onNavigate("build")}>Open campaign builder</Button></div>
  </div>;
}
