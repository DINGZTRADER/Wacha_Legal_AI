"use client";

import { useState, type JSX } from "react";
import Link from "next/link";
import type { DepartmentId } from "../departments/registry";
import { LocalMatterRepository } from "@/features/matters/store";
import {
  answerQuestion,
  buildCaseReview,
  createIntakeSession,
  getCurrentQuestion,
  getProgress,
  getVisibleQuestions,
  reviseAnswer,
} from "./engine";
import type { IntakeSession, IssueModule, Question } from "./model";
import { getIssueModule } from "./modules";

const repo = new LocalMatterRepository();
const ANSWER_TEXT_LIMIT = 5000;
const EMPTY_NARRATIVE_COPY =
  "We'll build the details together through the guided questions.";
const SESSION_SAVE_COPY =
  "Saved for this session. Private device storage arrives in the next release stage.";
const INTAKE_TIME_COPY = "About 3 minutes remaining";

type GuidedIntakeProps = {
  departmentId: DepartmentId;
  issueId: string;
  originalNarrative: string;
};

function createSession(props: GuidedIntakeProps): IntakeSession {
  return createIntakeSession(
    { ...props, originalNarrative: props.originalNarrative.trim() || EMPTY_NARRATIVE_COPY },
    new Date().toISOString(),
    crypto.randomUUID(),
  );
}

function getDraftValue(
  questionKind: Question["kind"],
  value: string | boolean | null | undefined,
): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (questionKind === "yes-no") {
    return value ? "yes" : "no";
  }

  return String(value);
}

function isDraftValid(question: Question, draftValue: string): boolean {
  const trimmedValue = draftValue.trim();

  if (!question.required && trimmedValue.length === 0) {
    return true;
  }

  if (question.kind === "yes-no") {
    return draftValue === "yes" || draftValue === "no";
  }

  if (question.kind === "single-choice") {
    return question.options.some((option) => option.value === draftValue);
  }

  if (question.kind === "date") {
    return /^\d{4}-\d{2}-\d{2}$/.test(draftValue);
  }

  return trimmedValue.length > 0 && trimmedValue.length <= ANSWER_TEXT_LIMIT;
}

function parseDraftValue(question: Question, draftValue: string): string | boolean {
  if (question.kind === "yes-no") {
    return draftValue === "yes";
  }

  return draftValue.trim();
}

function formatReviewValue(
  question: Question | undefined,
  value: string | boolean | null,
): string {
  if (value === null) {
    return "Not answered";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (question?.kind === "single-choice") {
    return question.options.find((option) => option.value === value)?.label ?? value;
  }

  return value;
}

export function GuidedIntake(props: GuidedIntakeProps): JSX.Element {
  const issue = getIssueModule(props.departmentId, props.issueId);

  if (!issue) {
    return (
      <section className="intake-shell" aria-live="polite">
        <div className="result emergency" role="alert">
          <strong>We could not load this guided intake.</strong>
          <p>Please return to the issue list and choose your matter again.</p>
        </div>
      </section>
    );
  }

  return (
    <GuidedIntakeFlow
      key={`${props.departmentId}:${props.issueId}:${props.originalNarrative}`}
      issue={issue}
      {...props}
    />
  );
}

function GuidedIntakeFlow(
  props: GuidedIntakeProps & { issue: IssueModule },
): JSX.Element {
  const { issue } = props;
  const [session, setSession] = useState<IntakeSession>(() => createSession(props));
  const [displayedQuestionId, setDisplayedQuestionId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<{ questionId: string | null; value: string }>({
    questionId: null,
    value: "",
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingCase, setIsSavingCase] = useState(false);
  const [urgentRoute, setUrgentRoute] = useState(false);

  const visibleQuestions = getVisibleQuestions(issue, session.answers);
  const currentQuestion = getCurrentQuestion(session, issue);
  const reviewReady = session.status === "review-ready";
  const activeQuestionId =
    editingQuestionId ??
    displayedQuestionId ??
    (!reviewReady ? currentQuestion?.id ?? null : null);
  const activeQuestion =
    activeQuestionId === null
      ? null
      : visibleQuestions.find((question) => question.id === activeQuestionId) ?? null;
  const activeAnswer = activeQuestion
    ? session.answers.find((answer) => answer.questionId === activeQuestion.id)
    : undefined;
  const activeQuestionIndex = activeQuestion
    ? visibleQuestions.findIndex((question) => question.id === activeQuestion.id) + 1
    : visibleQuestions.length;
  const review = buildCaseReview(session, issue);
  const progress = getProgress(session, issue);

  const activeQuestionKind = activeQuestion?.kind;
  const activeQuestionValue = activeAnswer?.value;
  const draftValue =
    activeQuestionId && activeQuestionKind
      ? draftState.questionId === activeQuestionId
        ? draftState.value
        : getDraftValue(activeQuestionKind, activeQuestionValue)
      : "";

  function setDraftValue(value: string) {
    setDraftState({ questionId: activeQuestion?.id ?? null, value });
  }

  function startEditing(questionId: string) {
    setEditingQuestionId(questionId);
    setDisplayedQuestionId(null);
    setSaveMessage(null);
    setErrorMessage(null);
  }

  function handleBack() {
    if (!activeQuestion) {
      return;
    }

    if (editingQuestionId) {
      setEditingQuestionId(null);
      setDisplayedQuestionId(null);
      setSaveMessage(null);
      setErrorMessage(null);
      return;
    }

    const previousQuestion = visibleQuestions[activeQuestionIndex - 2] ?? null;
    setDisplayedQuestionId(previousQuestion?.id ?? null);
    setSaveMessage(null);
    setErrorMessage(null);
  }

  function handleAdvance() {
    if (!activeQuestion || !session || !issue || !isDraftValid(activeQuestion, draftValue)) {
      return;
    }

    const submittedValue = parseDraftValue(activeQuestion, draftValue);
    const answerInput = { questionId: activeQuestion.id, value: submittedValue };
    const answerChanged = activeAnswer !== undefined && activeAnswer.value !== submittedValue;
    const nextSession = answerChanged
      ? reviseAnswer(
          session,
          issue,
          answerInput,
          new Date().toISOString(),
        )
      : answerQuestion(
          session,
          issue,
          answerInput,
          new Date().toISOString(),
        );
    const nextVisibleQuestions = getVisibleQuestions(issue, nextSession.answers);
    const nextIndex = nextVisibleQuestions.findIndex((question) => question.id === activeQuestion.id);
    const nextQuestion = nextVisibleQuestions[nextIndex + 1] ?? null;

    setSession(nextSession);
    setSaveMessage(null);
    setErrorMessage(null);

    if (activeQuestion.id === "urgent-triage" && submittedValue === "urgent") {
      setUrgentRoute(true);
      return;
    }

    if (editingQuestionId) {
      setEditingQuestionId(null);
      setDisplayedQuestionId(null);
      return;
    }

    setDisplayedQuestionId(
      nextSession.status === "review-ready"
        ? null
        : nextQuestion?.id ?? nextSession.currentQuestionId,
    );
  }

  async function handleSaveCase() {
    if (!session || !review) {
      return;
    }

    setIsSavingCase(true);
    setSaveMessage(null);
    setErrorMessage(null);

    try {
      await repo.save({
        departmentId: session.departmentId,
        issueId: session.issueId,
        moduleVersion: session.moduleVersion,
        originalNarrative: review.originalNarrative,
        answers: review.answers,
        labelledAnswers: review.labelledAnswers,
        missingQuestionIds: review.missingQuestionIds,
        conflicts: review.conflicts,
        currentQuestionId: review.currentQuestionId,
        status: review.status,
      });
      setSaveMessage(SESSION_SAVE_COPY);
    } catch {
      setErrorMessage("We could not save this case for the current session. Please try again.");
    } finally {
      setIsSavingCase(false);
    }
  }

  if (urgentRoute) {
    return <UrgentGuidance departmentId={props.departmentId} />;
  }

  const questionProgress = reviewReady ? visibleQuestions.length : activeQuestionIndex;
  const displayedPercent = reviewReady
    ? 100
    : Math.round((questionProgress / Math.max(progress.total, 1)) * 100);

  return (
    <section className="intake-shell">
      <header className="intake-header">
        <p className="eyebrow">Guided intake</p>
        <h1>Complete your case details</h1>
        <p className="lead">
          Answer one question at a time. Your selected issue and original narrative stay visible for reference.
        </p>
      </header>

      <section className="intake-summary" aria-label="Selected issue and original narrative">
        <p className="intake-summary-kicker">Selected issue</p>
        <h2>{issue.title}</h2>
        <p className="intake-summary-copy">
          {props.originalNarrative.trim() || EMPTY_NARRATIVE_COPY}
        </p>
        <details className="intake-about">
          <summary>About this guidance</summary>
          <p>Module version {session.moduleVersion}. Wacha organises what you tell us; it does not replace advice from an enrolled advocate.</p>
        </details>
      </section>

      <section className="intake-trust" aria-label="Privacy and next steps">
        <strong>Your information and next steps</strong>
        <p>Use only the details needed for this matter. Do not share passwords, PINs, or bank details.</p>
        <p>Answers are kept for this session. At the end, you can review what you told us, see missing facts, and decide whether to seek advocate help.</p>
        <nav aria-label="Intake guidance links">
          <a href="#privacy-guidance">Privacy guidance</a>
          <a href="#data-retention">How saving works</a>
          <a href="#delete-info">Delete this session</a>
          <a href="#urgent-help">Urgent help</a>
        </nav>
        <div className="sr-only" id="privacy-guidance">This prototype keeps intake answers in the current session only.</div>
        <div className="sr-only" id="data-retention">No account or long-term cloud storage is used by this intake prototype.</div>
        <div className="sr-only" id="delete-info">Close this tab to clear the current intake session.</div>
        <div className="sr-only" id="urgent-help">For immediate danger, contact emergency services or the police and seek an enrolled advocate.</div>
      </section>

      {errorMessage ? (
        <div className="result emergency" role="alert">
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {saveMessage ? (
        <div className="result standard" role="status">
          <p>{saveMessage}</p>
        </div>
      ) : null}

      {!reviewReady || activeQuestion ? (
        <>
          {activeQuestion ? (
            <>
              <section className="intake-progress" aria-label="Intake progress">
                <p>
                  Step {questionProgress} of {progress.total}
                </p>
                <p>{displayedPercent}% complete · {INTAKE_TIME_COPY}</p>
              </section>

              <fieldset className="intake-question">
                <legend>{activeQuestion.prompt}</legend>

                {activeQuestion.kind === "single-choice" ? (
                  <div className="intake-options">
                    {activeQuestion.options.map((option) => {
                      const inputId = `${activeQuestion.id}-${option.value}`;

                      return (
                        <label key={option.value} htmlFor={inputId} className="intake-option">
                          <input
                            id={inputId}
                            type="radio"
                            name={activeQuestion.id}
                            value={option.value}
                            checked={draftValue === option.value}
                            onChange={(event) => setDraftValue(event.target.value)}
                          />
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}

                {activeQuestion.kind === "yes-no" ? (
                  <div className="intake-options">
                    {[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ].map((option) => {
                      const inputId = `${activeQuestion.id}-${option.value}`;

                      return (
                        <label key={option.value} htmlFor={inputId} className="intake-option">
                          <input
                            id={inputId}
                            type="radio"
                            name={activeQuestion.id}
                            value={option.value}
                            checked={draftValue === option.value}
                            onChange={(event) => setDraftValue(event.target.value)}
                          />
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}

                {activeQuestion.kind === "date" ? (
                  <label htmlFor={activeQuestion.id} className="intake-input-label">
                    Date
                    <input
                      id={activeQuestion.id}
                      type="date"
                      value={draftValue}
                      onChange={(event) => setDraftValue(event.target.value)}
                    />
                  </label>
                ) : null}

                {activeQuestion.kind === "short-text" ? (
                  <label htmlFor={activeQuestion.id} className="intake-input-label">
                    Your answer
                    <input
                      id={activeQuestion.id}
                      type="text"
                      value={draftValue}
                      maxLength={ANSWER_TEXT_LIMIT}
                      onChange={(event) => setDraftValue(event.target.value)}
                    />
                  </label>
                ) : null}

                {activeQuestion.kind === "long-text" ? (
                  <label htmlFor={activeQuestion.id} className="intake-input-label">
                    Your answer
                    <textarea
                      id={activeQuestion.id}
                      value={draftValue}
                      maxLength={ANSWER_TEXT_LIMIT}
                      onChange={(event) => setDraftValue(event.target.value)}
                    />
                  </label>
                ) : null}
              </fieldset>

              <div className="intake-actions">
                {editingQuestionId ? (
                  <button type="button" className="button secondary" onClick={handleBack}>
                    Back to review
                  </button>
                ) : activeQuestionIndex === 1 ? (
                  <Link className="button secondary" href={`/departments/${props.departmentId}`}>
                    Exit intake
                  </Link>
                ) : (
                  <button type="button" className="button secondary" onClick={handleBack}>
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAdvance}
                  disabled={!isDraftValid(activeQuestion, draftValue)}
                >
                  {editingQuestionId ? "Save change" : "Continue"}
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : (
        <section className="intake-review">
          <section className="intake-progress" aria-label="Intake progress">
            <p>
              Step {visibleQuestions.length} of {visibleQuestions.length}
            </p>
            <p>100% complete</p>
          </section>

          <h2>What you told us</h2>
          <div className="review-list">
            {review.labelledAnswers.map((answer) => {
              const question = issue.questions.find(({ id }) => id === answer.questionId);

              return (
                <article key={answer.questionId} className="review-item">
                  <div className="review-copy">
                    <p className="review-label">{answer.label}</p>
                    <p className="review-value">{formatReviewValue(question, answer.value)}</p>
                    <span className="provenance-label">
                      {answer.provenance ?? "Not answered"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => startEditing(answer.questionId)}
                  >
                    Change
                  </button>
                </article>
              );
            })}
          </div>

          <div className="intake-actions">
            <button type="button" onClick={handleSaveCase} disabled={isSavingCase}>
              {isSavingCase ? "Saving..." : "Save this case on this device"}
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

function UrgentGuidance({ departmentId }: { departmentId: DepartmentId }): JSX.Element {
  return (
    <section className="intake-shell intake-urgent" id="urgent-help" aria-live="polite">
      <div className="result emergency" role="alert">
        <strong>This may need urgent help.</strong>
        <p>
          If someone is in danger, you have been locked out or physically removed, or a deadline is close, contact the police or emergency services (999 or 112) and seek an enrolled advocate as soon as possible.
        </p>
        <p>
          Keep any notice, messages, photographs, receipts, or other documents safe. Do not put yourself at risk to collect evidence.
        </p>
        <p>
          Wacha cannot make an emergency report or represent you. The Community Liaison Office at your local police station may also help explain the next safe reporting step.
        </p>
      </div>
      <div className="intake-actions">
        <Link className="button secondary" href={`/departments/${departmentId}`}>
          Return to issue choices
        </Link>
        <Link className="button" href="/advocate">
          Seek advocate help →
        </Link>
      </div>
    </section>
  );
}

export default GuidedIntake;
