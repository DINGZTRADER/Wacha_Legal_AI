import { expect, test } from "vitest";
import { IntakeSessionSchema, QuestionSchema } from "./model";

test("accepts a short single-choice intake question", () => {
  expect(
    QuestionSchema.safeParse({
      id: "role",
      prompt: "Are you the landlord or the tenant?",
      kind: "single-choice",
      required: true,
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
