import { describe, expect, test } from "vitest";
import { LegalVersionSchema } from "./model";

describe("legal content lifecycle", () => {
  test("keeps publishing workflow separate from commencement", () => {
    const value = LegalVersionSchema.parse({ id: "version-1", workId: "/akn/ug/act/2026/10", title: "Employment (Amendment) Act, 2026", citation: "Act 10 of 2026", instrumentType: "act", publicationDate: "2026-06-05", assentDate: null, commencementStatus: "uncommenced", effectiveDate: null, workflowStatus: "source-confirmed", sourcePublicationId: "source-1", contentDigest: "a".repeat(64), supersedesVersionId: null, reviewedAt: null });
    expect(value.workflowStatus).toBe("source-confirmed");
    expect(value.commencementStatus).toBe("uncommenced");
  });

  test("rejects an invalid digest", () => {
    expect(() => LegalVersionSchema.parse({ id: "v", workId: "w", title: "Act", citation: "Act 1", instrumentType: "act", publicationDate: "2026-06-05", assentDate: null, commencementStatus: "unknown", effectiveDate: null, workflowStatus: "discovered", sourcePublicationId: "s", contentDigest: "bad", supersedesVersionId: null, reviewedAt: null })).toThrow();
  });
});
