import { expect, test } from "vitest";
import { CaseReviewSchema, IntakeSessionSchema, QuestionSchema } from "./model";

test("accepts a short single-choice intake question", () => {
  expect(
    QuestionSchema.safeParse({
      id: "role",
      prompt: "Are you the landlord or the tenant?",
      kind: "single-choice",
      required: true,
      answerProvenance: "USER_STATEMENT",
      options: [
        { value: "landlord", label: "Landlord" },
        { value: "tenant", label: "Tenant" },
        { value: "other", label: "Someone else" },
      ],
    }).success,
  ).toBe(true);
});

test("rejects answers without provenance", () => {
  const result = IntakeSessionSchema.safeParse({
    id: "case-1",
    departmentId: "employment",
    issueId: "dismissal",
    moduleVersion: "2026-09-01",
    originalNarrative: "I was dismissed yesterday.",
    answers: [{ questionId: "dismissal-date", value: "2026-08-31" }],
    currentQuestionId: "dismissal-date",
    status: "in-progress",
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  });
  expect(result.success).toBe(false);
});

test("rejects a whitespace-only question identifier", () => {
  expect(
    QuestionSchema.safeParse({
      id: "   ",
      prompt: "What happened?",
      kind: "long-text",
      required: true,
      answerProvenance: "USER_STATEMENT",
    }).success,
  ).toBe(false);
});

test.each(["id", "issueId", "moduleVersion"] as const)(
  "rejects a whitespace-only session %s",
  (field) => {
    expect(
      IntakeSessionSchema.safeParse({
        id: "case-1",
        departmentId: "employment",
        issueId: "dismissal",
        moduleVersion: "2026-09-01",
        originalNarrative: "I was dismissed yesterday.",
        answers: [],
        currentQuestionId: null,
        status: "in-progress",
        createdAt: "2026-09-01T08:00:00.000Z",
        updatedAt: "2026-09-01T08:00:00.000Z",
        [field]: "   ",
      }).success,
    ).toBe(false);
  },
);

test("retains public question provenance and validates explicit review projection fields", () => {
  const question = QuestionSchema.parse({
    id: "reported-reason",
    prompt: "What reason did your employer give?",
    kind: "short-text",
    required: true,
    answerProvenance: "THIRD_PARTY_STATEMENT",
  });
  const review = CaseReviewSchema.parse({
    originalNarrative: "My employer ended my employment.",
    answers: [],
    labelledAnswers: [
      {
        questionId: question.id,
        label: question.prompt,
        value: null,
        provenance: null,
      },
    ],
    missingQuestionIds: [question.id],
    conflicts: [],
    currentQuestionId: question.id,
    status: "in-progress",
  });

  expect(question.answerProvenance).toBe("THIRD_PARTY_STATEMENT");
  expect(review.missingQuestionIds).toEqual(["reported-reason"]);
});
