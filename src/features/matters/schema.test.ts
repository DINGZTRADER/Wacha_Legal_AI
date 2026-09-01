import { expect, test } from "vitest";
import { MatterDraftSchema } from "./schema";

test("parses a structured employment case snapshot", () => {
  expect(
    MatterDraftSchema.safeParse({
      departmentId: "employment",
      issueId: "dismissal",
      moduleVersion: "2026-09-01",
      originalNarrative: "I was dismissed after five years of work.",
      answers: [
        {
          questionId: "role",
          value: "employee",
          provenance: "USER_STATEMENT",
          answeredAt: "2026-09-01T08:00:00.000Z",
        },
      ],
      currentQuestionId: null,
      status: "review-ready",
    }).success,
  ).toBe(true);
});

test("rejects an invalid department or a short narrative", () => {
  expect(
    MatterDraftSchema.safeParse({
      departmentId: "not-a-department",
      issueId: "dismissal",
      moduleVersion: "2026-09-01",
      originalNarrative: "I was dismissed after five years of work.",
      answers: [],
      currentQuestionId: null,
      status: "in-progress",
    }).success,
  ).toBe(false);

  expect(
    MatterDraftSchema.safeParse({
      departmentId: "employment",
      issueId: "dismissal",
      moduleVersion: "2026-09-01",
      originalNarrative: "Too short",
      answers: [],
      currentQuestionId: null,
      status: "in-progress",
    }).success,
  ).toBe(false);
});
