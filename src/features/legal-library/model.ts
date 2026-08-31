import { z } from "zod";

export const WorkflowStatusSchema = z.enum(["discovered", "source-confirmed", "structured", "legal-review-required", "active", "withdrawn"]);
export const CommencementStatusSchema = z.enum(["unknown", "uncommenced", "partly-commenced", "commenced", "repealed"]);

export const SourcePublicationSchema = z.object({
  id: z.string().min(1), sourceKind: z.enum(["gazette", "parliament", "ulii", "ministry", "regulator"]), sourceOrganisation: z.string().min(1), canonicalUrl: z.string().url(), retrievedAt: z.string().datetime(), contentDigest: z.string().regex(/^[a-f0-9]{64}$/), mediaType: z.string().min(1), originalObjectKey: z.string().nullable(), parserVersion: z.string().min(1), retrievalMethod: z.enum(["api", "official-listing", "manual-reviewed-import"]), reuseTerms: z.string().min(1), knownLimitations: z.array(z.string()), extractionWarnings: z.array(z.string()),
});

export const LegalVersionSchema = z.object({
  id: z.string().min(1), workId: z.string().min(1), title: z.string().min(1), citation: z.string().min(1), instrumentType: z.enum(["act", "statutory-instrument", "legal-notice", "gazette-supplement"]), publicationDate: z.string().date(), assentDate: z.string().date().nullable(), commencementStatus: CommencementStatusSchema, effectiveDate: z.string().date().nullable(), workflowStatus: WorkflowStatusSchema, sourcePublicationId: z.string().min(1), contentDigest: z.string().regex(/^[a-f0-9]{64}$/), supersedesVersionId: z.string().nullable(), reviewedAt: z.string().datetime().nullable(),
});

export const AmendmentInstructionSchema = z.object({ id: z.string().min(1), amendingVersionId: z.string().min(1), targetWorkId: z.string().min(1), targetProvision: z.string().nullable(), operation: z.enum(["insert", "substitute", "delete", "repeal", "commence"]), effectiveDate: z.string().date().nullable(), reviewStatus: z.enum(["proposed", "confirmed", "rejected"]) });
export const ContentReviewSchema = z.object({ id: z.string().min(1), entityType: z.enum(["version", "amendment", "announcement", "template"]), entityId: z.string().min(1), decision: z.enum(["approve", "reject", "withdraw", "no-impact"]), reviewerId: z.string().min(1), reason: z.string().min(1), decidedAt: z.string().datetime() });
export const TemplateImpactSchema = z.object({ id: z.string().min(1), legalVersionId: z.string().min(1), templateId: z.string().min(1), status: z.enum(["review-required", "suspended", "updated", "republished", "unaffected"]), reason: z.string().min(1), recordedAt: z.string().datetime() });
export const LegalAnnouncementSchema = z.object({ id: z.string().min(1), legalVersionId: z.string().min(1), title: z.string().min(1), citation: z.string().min(1), publicationDate: z.string().date(), summary: z.string().min(1), affectedTopics: z.array(z.string()), sourceUrl: z.string().url(), commencementLabel: z.string().min(1), publishedAt: z.string().datetime(), reviewedAt: z.string().datetime(), reviewId: z.string().min(1) });

export type SourcePublication = z.infer<typeof SourcePublicationSchema>;
export type LegalVersion = z.infer<typeof LegalVersionSchema>;
export type AmendmentInstruction = z.infer<typeof AmendmentInstructionSchema>;
export type ContentReview = z.infer<typeof ContentReviewSchema>;
export type TemplateImpact = z.infer<typeof TemplateImpactSchema>;
export type LegalAnnouncement = z.infer<typeof LegalAnnouncementSchema>;
