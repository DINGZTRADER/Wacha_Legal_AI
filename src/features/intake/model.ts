import { z } from "zod";
import { DEPARTMENTS, type DepartmentId } from "../departments/registry";

const departmentIds = DEPARTMENTS.map((department) => department.id) as [
  DepartmentId,
  ...DepartmentId[],
];

export const DepartmentIdSchema = z.enum(departmentIds);

export const IsoDateTimeSchema = z.string().datetime();
export const IdentifierSchema = z.string().trim().min(1);

export const ProvenanceSchema = z.enum([
  "USER_STATEMENT",
  "USER_ALLEGATION",
  "THIRD_PARTY_STATEMENT",
  "DOCUMENT_STATEMENT",
  "SYSTEM_INFERENCE",
  "VERIFIED_SOURCE",
]);

const AnswerProvenanceSchema = z.enum([
  "USER_STATEMENT",
  "USER_ALLEGATION",
  "THIRD_PARTY_STATEMENT",
]);

const QuestionShowWhenSchema = z
  .object({
    questionId: IdentifierSchema,
    equals: z.union([z.string().trim().min(1), z.boolean()]),
  })
  .strict();

const QuestionOptionSchema = z
  .object({
    value: IdentifierSchema,
    label: z.string().trim().min(1),
  })
  .strict();

const BaseQuestionSchema = z
  .object({
    id: IdentifierSchema,
    prompt: z.string().trim().min(1),
    required: z.boolean(),
    answerProvenance: AnswerProvenanceSchema,
    showWhen: QuestionShowWhenSchema.optional(),
  })
  .strict();

export const QuestionSchema = z.discriminatedUnion("kind", [
  BaseQuestionSchema.extend({
    kind: z.literal("short-text"),
  }),
  BaseQuestionSchema.extend({
    kind: z.literal("long-text"),
  }),
  BaseQuestionSchema.extend({
    kind: z.literal("date"),
  }),
  BaseQuestionSchema.extend({
    kind: z.literal("yes-no"),
  }),
  BaseQuestionSchema.extend({
    kind: z.literal("single-choice"),
    options: z.array(QuestionOptionSchema).min(1),
  }),
]);

export const IssueModuleSchema = z
  .object({
    id: IdentifierSchema,
    title: z.string().trim().min(1),
    questions: z.array(QuestionSchema).min(1),
  })
  .strict();

export const DepartmentIntakeModuleSchema = z
  .object({
    departmentId: DepartmentIdSchema,
    version: IdentifierSchema,
    issues: z.array(IssueModuleSchema).min(1),
  })
  .strict();

export const IntakeAnswerSchema = z
  .object({
    questionId: IdentifierSchema,
    value: z.union([z.string().trim().min(1).max(5000), z.boolean()]),
    provenance: AnswerProvenanceSchema,
    answeredAt: IsoDateTimeSchema,
    revisedAt: IsoDateTimeSchema.optional(),
  })
  .strict();

export const IntakeSessionSchema = z
  .object({
    id: IdentifierSchema,
    departmentId: DepartmentIdSchema,
    issueId: IdentifierSchema,
    moduleVersion: IdentifierSchema,
    originalNarrative: z.string().trim().min(1).max(5000),
    answers: z.array(IntakeAnswerSchema),
    currentQuestionId: IdentifierSchema.nullable(),
    status: z.enum(["in-progress", "review-ready"]),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  })
  .strict();

export const CaseReviewSchema = z
  .object({
    originalNarrative: z.string().min(1).max(5000),
    answers: z.array(IntakeAnswerSchema),
    labelledAnswers: z
      .array(
        z
          .object({
            questionId: IdentifierSchema,
            label: z.string().trim().min(1),
            value: z.union([z.string().trim().min(1).max(5000), z.boolean()]).nullable(),
            provenance: AnswerProvenanceSchema.nullable(),
          })
          .strict(),
      )
      .default([]),
    missingQuestionIds: z.array(IdentifierSchema).default([]),
    conflicts: z.array(z.never()).default([]),
    currentQuestionId: IdentifierSchema.nullable(),
    status: z.enum(["in-progress", "review-ready"]),
  })
  .strict();

export type IntakeAnswer = z.infer<typeof IntakeAnswerSchema>;
export type IntakeSession = z.infer<typeof IntakeSessionSchema>;
export type DepartmentIntakeModule = z.infer<typeof DepartmentIntakeModuleSchema>;
export type CaseReview = z.infer<typeof CaseReviewSchema>;
export type IssueModule = z.infer<typeof IssueModuleSchema>;
export type Question = z.infer<typeof QuestionSchema>;
