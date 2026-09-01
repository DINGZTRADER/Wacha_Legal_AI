import { z } from "zod";
import { CaseReviewSchema, DepartmentIdSchema, IdentifierSchema } from "../intake/model";

export const MatterDraftSchema = CaseReviewSchema.extend({
  departmentId: DepartmentIdSchema,
  issueId: IdentifierSchema,
  moduleVersion: IdentifierSchema,
  originalNarrative: z.string().trim().min(10).max(5000),
}).strict();

export type MatterDraft = z.infer<typeof MatterDraftSchema>;
