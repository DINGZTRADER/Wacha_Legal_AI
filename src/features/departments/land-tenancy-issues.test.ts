import { describe, expect, test } from "vitest";
import { LAND_TENANCY_ISSUES } from "./land-tenancy-issues";

describe("Land & Tenancy issue choices", () => {
  test("offers five plain-language Ugandan starting points", () => {
    expect(LAND_TENANCY_ISSUES).toHaveLength(5);
    expect(
      LAND_TENANCY_ISSUES.map((issue) => ({ id: issue.id, title: issue.title })),
    ).toEqual([
      {
        id: "inheritance-family-land",
        title: "Inheritance and family land",
      },
      {
        id: "land-grabbing-boundaries",
        title: "Land grabbing or boundaries",
      },
      {
        id: "rent-tenancy-eviction",
        title: "Rent, tenancy, or eviction",
      },
      {
        id: "buying-land-checks",
        title: "Buying land and checking documents",
      },
      {
        id: "land-sale-transfer-title",
        title: "Land sale, transfer, or title",
      },
    ]);
  });

  test("each issue has a guided next-step label", () => {
    expect(LAND_TENANCY_ISSUES.every((issue) => issue.title && issue.description && issue.href)).toBe(true);
  });
});
