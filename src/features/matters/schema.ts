import { z } from "zod";
import { CaseReviewSchema, DepartmentIdSchema } from "../intake/model";

export const MatterDraftSchema = CaseReviewSchema.extend({
  departmentId: DepartmentIdSchema,
  issueId: z.string().min(1),
  moduleVersion: z.string().min(1),
  originalNarrative: z.string().trim().min(10).max(5000),
}).strict();

export type MatterDraft = z.infer<typeof MatterDraftSchema>;
