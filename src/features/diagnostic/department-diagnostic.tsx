"use client";

import { useState } from "react";
import Link from "next/link";
import {
  recommendDepartment,
  type DiagnosticAnswers,
  type DepartmentRecommendation,
} from "./recommendation";

type StepId = keyof DiagnosticAnswers;

type DiagnosticOption = {
  value: string;
  label: string;
  description: string;
};

type DiagnosticStep = {
  id: StepId;
  title: string;
  prompt: string;
  options: DiagnosticOption[];
};

const STEPS: DiagnosticStep[] = [
  {
    id: "whatHappened",
    title: "What happened?",
    prompt: "Choose the description that is closest to your situation.",
    options: [
      { value: "land", label: "A land, home, rent, or boundary problem", description: "Ownership, tenancy, eviction, family land, or a land transaction." },
      { value: "money", label: "Someone owes me money", description: "A loan, unpaid invoice, rent arrears, or money claim." },
      { value: "employment", label: "A work or salary problem", description: "Dismissal, discipline, unpaid salary, or workplace treatment." },
      { value: "family", label: "A family member died or there is an inheritance issue", description: "A will, estate, beneficiary, or family property question." },
      { value: "affidavit", label: "I need a sworn statement or declaration", description: "An affidavit, statutory declaration, or lost-document statement." },
      { value: "business", label: "A business or contract problem", description: "A supplier, partnership, company, service, or commercial agreement." },
      { value: "vehicle", label: "A vehicle or equipment sale problem", description: "A car, motorcycle, logbook, equipment, or asset transfer." },
      { value: "unsure", label: "I am not sure", description: "We will use the other answers to suggest a starting point." },
    ],
  },
  {
    id: "whoInvolved",
    title: "Who is involved?",
    prompt: "Choose the person or group most closely connected to the issue.",
    options: [
      { value: "landlord", label: "Landlord, tenant, family member, or co-owner", description: "Someone connected to land, a home, or rent." },
      { value: "employer", label: "Employer, manager, or worker", description: "Someone connected to your job or workplace." },
      { value: "borrower", label: "Borrower, customer, or client", description: "Someone who owes money or has not paid." },
      { value: "family", label: "Relative, beneficiary, or estate representative", description: "Family members or people handling an estate." },
      { value: "business", label: "Business partner, supplier, or company", description: "A commercial party or organisation." },
      { value: "buyer-seller", label: "Buyer or seller", description: "Someone involved in an asset or vehicle transaction." },
      { value: "authority", label: "Police, court, government office, or regulator", description: "A public office or official process." },
      { value: "unsure", label: "I am not sure", description: "It is okay if more than one person is involved." },
    ],
  },
  {
    id: "outcome",
    title: "What outcome do you want?",
    prompt: "Choose what would help you most right now.",
    options: [
      { value: "understand-rights", label: "Understand my rights and options", description: "Get clear information before deciding what to do." },
      { value: "prepare-document", label: "Prepare a document", description: "Create a structured draft or checklist to review." },
      { value: "recover-money", label: "Recover money or make a demand", description: "Organise a payment request or claim." },
      { value: "challenge-decision", label: "Challenge a decision", description: "Understand a dismissal, notice, refusal, or other decision." },
      { value: "protect-rights", label: "Protect my home, land, or property", description: "Prevent loss, eviction, interference, or an unsafe transaction." },
      { value: "settle-family", label: "Settle a family or inheritance matter", description: "Organise estate information and possible next steps." },
      { value: "unsure", label: "I am not sure yet", description: "Start with the facts and decide after the questions." },
    ],
  },
  {
    id: "urgency",
    title: "Is there an urgent safety or deadline issue?",
    prompt: "Choose the option that best describes today.",
    options: [
      { value: "safety", label: "Someone may be in danger", description: "Violence, threats, arrest, or immediate loss of safety." },
      { value: "deadline", label: "A deadline is close or a notice has been served", description: "A court, eviction, payment, transfer, or response date may pass soon." },
      { value: "not-urgent", label: "No urgent issue that I know of", description: "I have time to gather information and documents." },
      { value: "unsure", label: "I am not sure", description: "We will still show the safety warning and next steps." },
    ],
  },
];

function getSelectedValue(answers: Partial<DiagnosticAnswers>, step: DiagnosticStep): string | undefined {
  return answers[step.id] as string | undefined;
}

export function DepartmentDiagnostic() {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<DiagnosticAnswers>>({});
  const [recommendation, setRecommendation] = useState<DepartmentRecommendation | null>(null);

  const step = STEPS[stepIndex];
  const selectedValue = getSelectedValue(answers, step);

  function reset() {
    setStepIndex(0);
    setAnswers({});
    setRecommendation(null);
  }

  function choose(value: string) {
    setAnswers((current) => ({ ...current, [step.id]: value }));
  }

  function continueToNextStep() {
    if (!selectedValue) return;

    if (stepIndex === STEPS.length - 1) {
      setRecommendation(recommendDepartment({ ...answers, [step.id]: selectedValue } as DiagnosticAnswers));
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function goBack() {
    if (recommendation) {
      setRecommendation(null);
      return;
    }
    setStepIndex((current) => Math.max(0, current - 1));
  }

  return (
    <section className="diagnostic" id="diagnostic" aria-labelledby="diagnostic-title">
      {!isOpen ? (
        <div className="diagnostic-entry">
          <div>
            <strong id="diagnostic-title">Not sure where to start?</strong>
            <p>Answer four short questions and Wacha will suggest the best department.</p>
          </div>
          <button type="button" onClick={() => setIsOpen(true)}>
            Find my path →
          </button>
        </div>
      ) : (
        <div className="diagnostic-panel">
          <div className="diagnostic-panel-head">
            <div>
              <p className="eyebrow">A few simple questions</p>
              <h2 id="diagnostic-title">Which path fits me?</h2>
            </div>
            <button type="button" className="diagnostic-close" onClick={() => { setIsOpen(false); reset(); }}>
              Close
            </button>
          </div>

          <div className="diagnostic-emergency" role="note">
            <strong>Safety first.</strong> If there is violence, an eviction threat, an arrest, or an imminent deadline, seek immediate help from the police, a trusted local service, or an enrolled advocate.
          </div>

          {recommendation ? (
            <DiagnosticResult recommendation={recommendation} onStartOver={reset} />
          ) : (
            <>
              <div className="diagnostic-progress" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
                <span>Step {stepIndex + 1} of {STEPS.length}</span>
                <span>{Math.round(((stepIndex + 1) / STEPS.length) * 100)}%</span>
              </div>
              <div className="diagnostic-question">
                <h3>{step.title}</h3>
                <p>{step.prompt}</p>
                <div className="diagnostic-options" role="group" aria-label={step.title}>
                  {step.options.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={selectedValue === option.value ? "diagnostic-option selected" : "diagnostic-option"}
                      aria-pressed={selectedValue === option.value}
                      onClick={() => choose(option.value)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="diagnostic-actions">
                <button type="button" className="button secondary" onClick={goBack} disabled={stepIndex === 0}>Back</button>
                <button type="button" className="button" onClick={continueToNextStep} disabled={!selectedValue}>
                  {stepIndex === STEPS.length - 1 ? "Show my recommended path" : "Continue"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function DiagnosticResult({ recommendation, onStartOver }: { recommendation: DepartmentRecommendation; onStartOver: () => void }) {
  return (
    <div className="diagnostic-result" role="status" aria-live="polite">
      <p className="eyebrow">Your suggested starting point</p>
      <h3>{recommendation.departmentTitle}</h3>
      <p>{recommendation.explanation}</p>
      <div className="diagnostic-result-grid">
        <div>
          <h4>Prepare these documents</h4>
          <ul>{recommendation.documents.map((document) => <li key={document}>{document}</li>)}</ul>
        </div>
        <div>
          <h4>Expected next steps</h4>
          <ul>{recommendation.nextSteps.map((step) => <li key={step}>{step}</li>)}</ul>
        </div>
        <div>
          <h4>Urgency warnings</h4>
          <ul>{recommendation.urgencyWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        </div>
      </div>
      <div className="diagnostic-actions">
        <button type="button" className="button secondary" onClick={onStartOver}>Start over</button>
        <Link className="button" href={`/matters/new?department=${recommendation.departmentId}`}>
          Start guided intake →
        </Link>
      </div>
      <small className="diagnostic-privacy">Your answers are used to suggest a starting path. Review the facts carefully and seek professional advice before acting.</small>
    </div>
  );
}
