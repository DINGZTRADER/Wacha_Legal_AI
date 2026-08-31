import { describe, expect, test } from "vitest";
import { LAND_TENANCY_ISSUES } from "./land-tenancy-issues";

describe("Land & Tenancy issue choices", () => {
  test("offers five plain-language Ugandan starting points", () => {
    expect(LAND_TENANCY_ISSUES).toHaveLength(5);
    expect(LAND_TENANCY_ISSUES.map((issue) => issue.id)).toEqual([
      "inheritance-family-land",
      "land-grabbing-boundaries",
      "rent-tenancy-eviction",
      "buying-land-checks",
      "land-sale-transfer-title",
    ]);
  });

  test("each issue has a guided next-step label", () => {
    expect(LAND_TENANCY_ISSUES.every((issue) => issue.title && issue.description && issue.href)).toBe(true);
  });
});
