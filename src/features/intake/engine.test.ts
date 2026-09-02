import type { CaseReview, IssueModule } from "./model";
import {
  answerQuestion,
  buildCaseReview,
  createIntakeSession,
  getCurrentQuestion,
  getProgress,
  getVisibleQuestions,
  reviseAnswer,
} from "./engine";
import { getIssueModule } from "./modules";

const CREATED_AT = "2026-09-01T08:00:00.000Z";
const ANSWERED_AT = "2026-09-01T08:01:00.000Z";
const REVISED_AT = "2026-09-01T08:02:00.000Z";

const branchIssue = {
  id: "dismissal",
  title: "Conditional issue",
  questions: [
    {
      id: "role",
      prompt: "Did you receive notice?",
      kind: "yes-no",
      required: true,
      answerProvenance: "USER_STATEMENT",
    },
    {
      id: "dismissal-reason",
      prompt: "What did the notice say?",
      kind: "short-text",
      required: true,
      showWhen: { questionId: "role", equals: true },
      answerProvenance: "THIRD_PARTY_STATEMENT",
    },
    {
      id: "desired-outcome",
      prompt: "What outcome do you want?",
      kind: "short-text",
      required: true,
      answerProvenance: "USER_STATEMENT",
    },
  ],
} as IssueModule;

function branchSession() {
  return {
    id: "case-branch",
    departmentId: "employment" as const,
    issueId: branchIssue.id,
    moduleVersion: "test-v1",
    originalNarrative: "I received a notice from my employer.",
    answers: [],
    currentQuestionId: "role",
    status: "in-progress" as const,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
}

test("creates a deterministic session and asks one unanswered question at a time", () => {
  const issue = getIssueModule("employment", "dismissal")!;
  const session = createIntakeSession(
    {
      departmentId: "employment",
      issueId: "dismissal",
      originalNarrative: "My employer dismissed me after five years.",
    },
    CREATED_AT,
    "case-1",
  );

  expect(session).toMatchObject({
    id: "case-1",
    moduleVersion: "2026-09-01",
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    currentQuestionId: "urgent-triage",
  });

  const triaged = answerQuestion(
    session,
    issue,
    { questionId: "urgent-triage", value: "not-urgent" },
    ANSWERED_AT,
  );
  const updated = answerQuestion(
    triaged,
    issue,
    { questionId: "role", value: "employee" },
    ANSWERED_AT,
  );

  expect(getCurrentQuestion(updated, issue)?.id).toBe("what-happened");
  expect(updated.updatedAt).toBe(ANSWERED_AT);
});

test("routes conditional questions only when their branch answer matches", () => {
  const noNotice = answerQuestion(
    branchSession(),
    branchIssue,
    { questionId: "role", value: false },
    ANSWERED_AT,
  );
  const yesNotice = answerQuestion(
    branchSession(),
    branchIssue,
    { questionId: "role", value: true },
    ANSWERED_AT,
  );

  expect(getVisibleQuestions(branchIssue, noNotice.answers).map(({ id }) => id)).toEqual([
    "role",
    "desired-outcome",
  ]);
  expect(getVisibleQuestions(branchIssue, yesNotice.answers).map(({ id }) => id)).toEqual([
    "role",
    "dismissal-reason",
    "desired-outcome",
  ]);
});

test("resolves child-before-parent visibility declaratively and guards cycles", () => {
  const childBeforeParent = {
    ...branchIssue,
    questions: [
      branchIssue.questions[1],
      branchIssue.questions[0],
      branchIssue.questions[2],
    ],
  } as IssueModule;
  const answers = [
    {
      questionId: "role",
      value: true,
      provenance: "USER_STATEMENT" as const,
      answeredAt: ANSWERED_AT,
    },
    {
      questionId: "dismissal-reason",
      value: "Leave within seven days.",
      provenance: "THIRD_PARTY_STATEMENT" as const,
      answeredAt: REVISED_AT,
    },
  ];
  const session = { ...branchSession(), answers };

  expect(getVisibleQuestions(childBeforeParent, answers).map(({ id }) => id)).toEqual([
    "dismissal-reason",
    "role",
    "desired-outcome",
  ]);
  expect(getProgress(session, childBeforeParent)).toEqual({ answered: 2, total: 3, percent: 67 });

  const corrected = reviseAnswer(
    session,
    childBeforeParent,
    { questionId: "role", value: false },
    "2026-09-01T08:05:00.000Z",
  );
  expect(corrected.answers.map(({ questionId }) => questionId)).toEqual(["role"]);
  expect(getProgress(corrected, childBeforeParent)).toEqual({ answered: 1, total: 2, percent: 50 });

  const cyclicIssue = {
    id: "cycle",
    title: "Cycle",
    questions: [
      {
        id: "a",
        prompt: "A?",
        kind: "yes-no",
        required: true,
        answerProvenance: "USER_STATEMENT",
        showWhen: { questionId: "b", equals: true },
      },
      {
        id: "b",
        prompt: "B?",
        kind: "yes-no",
        required: true,
        answerProvenance: "USER_STATEMENT",
        showWhen: { questionId: "a", equals: true },
      },
    ],
  } as IssueModule;
  expect(getVisibleQuestions(cyclicIssue, [])).toEqual([]);
});

test("removes hidden descendant answers after a branch correction", () => {
  const withNotice = answerQuestion(
    branchSession(),
    branchIssue,
    { questionId: "role", value: true },
    ANSWERED_AT,
  );
  const withDetails = answerQuestion(
    withNotice,
    branchIssue,
    { questionId: "dismissal-reason", value: "Leave within seven days." },
    REVISED_AT,
  );
  const corrected = reviseAnswer(
    withDetails,
    branchIssue,
    { questionId: "role", value: false },
    "2026-09-01T08:03:00.000Z",
  );

  expect(corrected.answers.map(({ questionId }) => questionId)).toEqual(["role"]);
  expect(corrected.answers[0].revisedAt).toBe("2026-09-01T08:03:00.000Z");
});

test("copies provenance from question definitions and timestamps revisions", () => {
  const withNotice = answerQuestion(
    branchSession(),
    branchIssue,
    { questionId: "role", value: true },
    ANSWERED_AT,
  );
  const withDetails = answerQuestion(
    withNotice,
    branchIssue,
    { questionId: "dismissal-reason", value: "Leave within seven days." },
    REVISED_AT,
  );
  const revised = reviseAnswer(
    withDetails,
    branchIssue,
    { questionId: "dismissal-reason", value: "Leave within fourteen days." },
    "2026-09-01T08:04:00.000Z",
  );

  expect(revised.answers[1]).toEqual({
    questionId: "dismissal-reason",
    value: "Leave within fourteen days.",
    provenance: "THIRD_PARTY_STATEMENT",
    answeredAt: REVISED_AT,
    revisedAt: "2026-09-01T08:04:00.000Z",
  });
});

test("copies provenance from the supplied issue instead of global module state", () => {
  const divergentIssue = {
    ...branchIssue,
    questions: branchIssue.questions.map((question) =>
      question.id === "role"
        ? { ...question, answerProvenance: "USER_ALLEGATION" as const }
        : question,
    ),
  } as IssueModule;
  const answered = answerQuestion(
    branchSession(),
    divergentIssue,
    { questionId: "role", value: false },
    ANSWERED_AT,
  );

  expect(answered.answers[0].provenance).toBe("USER_ALLEGATION");
});

test("calculates visible progress and becomes review-ready after required answers", () => {
  const first = answerQuestion(
    branchSession(),
    branchIssue,
    { questionId: "role", value: false },
    ANSWERED_AT,
  );

  expect(getProgress(first, branchIssue)).toEqual({ answered: 1, total: 2, percent: 50 });
  expect(first.status).toBe("in-progress");

  const completed = answerQuestion(
    first,
    branchIssue,
    { questionId: "desired-outcome", value: "Return to work." },
    REVISED_AT,
  );

  expect(getProgress(completed, branchIssue)).toEqual({ answered: 2, total: 2, percent: 100 });
  expect(completed.status).toBe("review-ready");
  expect(completed.currentQuestionId).toBeNull();
});

test("rejects unknown and currently invisible question IDs", () => {
  expect(() =>
    answerQuestion(
      branchSession(),
      branchIssue,
      { questionId: "unknown", value: "No value" },
      ANSWERED_AT,
    ),
  ).toThrow("Unknown intake question: unknown");

  expect(() =>
    answerQuestion(
      branchSession(),
      branchIssue,
      { questionId: "dismissal-reason", value: "No notice is visible." },
      ANSWERED_AT,
    ),
  ).toThrow("Intake question is not currently visible: dismissal-reason");
});

test("projects ordered labelled answers, explicit missing fields, and no invented text", () => {
  const session = answerQuestion(
    branchSession(),
    branchIssue,
    { questionId: "role", value: false },
    ANSWERED_AT,
  );
  const review = buildCaseReview(session, branchIssue);
  const publicReview: CaseReview = review;

  expect(review.originalNarrative).toBe("I received a notice from my employer.");
  expect(review.labelledAnswers).toEqual([
    {
      questionId: "role",
      label: "Did you receive notice?",
      value: false,
      provenance: "USER_STATEMENT",
    },
    {
      questionId: "desired-outcome",
      label: "What outcome do you want?",
      value: null,
      provenance: null,
    },
  ]);
  expect(review.missingQuestionIds).toEqual(["desired-outcome"]);
  expect(review.conflicts).toEqual([]);
  expect(publicReview).toBe(review);
  expect(JSON.stringify(review)).not.toContain("yesterday");
  expect(JSON.stringify(review)).not.toContain("notice was unlawful");
});
