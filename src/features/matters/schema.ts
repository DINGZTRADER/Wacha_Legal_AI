import { z } from "zod";
import { DEPARTMENTS } from "../departments/registry";
const ids=DEPARTMENTS.map(d=>d.id) as [string,...string[]];
export const MatterDraftSchema=z.object({departmentId:z.enum(ids),summary:z.string().trim().min(10).max(2000)});
export type MatterDraft=z.infer<typeof MatterDraftSchema>;
