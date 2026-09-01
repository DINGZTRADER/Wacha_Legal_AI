import { describe, expect, test } from "vitest";
import { DEPARTMENTS } from "../departments/registry";
import { DepartmentIntakeModuleSchema } from "./model";

const ALLOWED_PROVENANCE = new Set([
  "USER_STATEMENT",
  "USER_ALLEGATION",
  "THIRD_PARTY_STATEMENT",
]);
const CORE_QUESTION_IDS = [
  "role",
  "what-happened",
  "timing",
  "other-party",
  "steps-taken",
  "desired-outcome",
] as const;

describe("intake module registry", () => {
  test("defines versioned issues and valid questions for every department", async () => {
    const { INTAKE_MODULES } = await import("./modules");

    expect(Object.keys(INTAKE_MODULES).sort()).toEqual(
      DEPARTMENTS.map((department) => department.id).sort(),
    );

    for (const department of DEPARTMENTS) {
      const intakeModule = INTAKE_MODULES[department.id];

      expect(DepartmentIntakeModuleSchema.safeParse(intakeModule).success).toBe(true);
      expect(intakeModule.version).toBe("2026-09-01");

      const issueIds = intakeModule.issues.map((issue) => issue.id);
      expect(new Set(issueIds).size).toBe(issueIds.length);
      expect(issueIds.length).toBeGreaterThanOrEqual(4);

      for (let index = 0; index < intakeModule.issues.length; index += 1) {
        const issue = intakeModule.issues[index];
        const questionIds = issue.questions.map((question) => question.id);

        expect(issue.questions.length).toBeGreaterThanOrEqual(4);
        expect(issue.questions.length).toBeLessThanOrEqual(7);
        expect(issue.questions[0]?.showWhen).toBeUndefined();
        expect(new Set(questionIds).size).toBe(questionIds.length);
        expect(questionIds).toEqual(expect.arrayContaining([...CORE_QUESTION_IDS]));
        expect(
          questionIds.some((questionId) => !CORE_QUESTION_IDS.includes(questionId as never)),
        ).toBe(true);

        for (let questionIndex = 0; questionIndex < issue.questions.length; questionIndex += 1) {
          const question = issue.questions[questionIndex];
          expect(question.prompt.length).toBeLessThanOrEqual(100);
          expect(ALLOWED_PROVENANCE.has(question.answerProvenance)).toBe(true);
        }
      }
    }
  });

  test("returns undefined for an unknown issue id", async () => {
    const { getIssueModule } = await import("./modules");

    expect(getIssueModule("land-tenancy", "not-a-real-issue")).toBeUndefined();
  });
});
