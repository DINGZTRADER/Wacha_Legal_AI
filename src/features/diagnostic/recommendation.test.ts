import { describe, expect, test } from "vitest";
import { recommendDepartment } from "./recommendation";

describe("department diagnostic recommendations", () => {
  test("recommends Employment and flags a deadline from the answers", () => {
    const recommendation = recommendDepartment({
      whatHappened: "employment",
      whoInvolved: "employer",
      outcome: "challenge-decision",
      urgency: "deadline",
    });

    expect(recommendation.departmentId).toBe("employment");
    expect(recommendation.explanation).toMatch(/work, salary, dismissal/i);
    expect(recommendation.documents.length).toBeGreaterThan(0);
    expect(recommendation.nextSteps.length).toBeGreaterThan(0);
    expect(recommendation.urgencyWarnings).toEqual(
      expect.arrayContaining([expect.stringMatching(/deadline/i)]),
    );
  });

  test("recommends Land & Tenancy for a property issue and includes the emergency warning", () => {
    const recommendation = recommendDepartment({
      whatHappened: "land",
      whoInvolved: "landlord",
      outcome: "protect-rights",
      urgency: "safety",
    });

    expect(recommendation.departmentId).toBe("land-tenancy");
    expect(recommendation.urgencyWarnings).toEqual(
      expect.arrayContaining([expect.stringMatching(/violence|eviction|arrest|imminent deadline/i)]),
    );
  });
});
