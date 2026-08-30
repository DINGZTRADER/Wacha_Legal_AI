# Guided Succession and Rent Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the summary-only concierge with a resumable, one-question-at-a-time succession and rental-property journey that produces a safe case pack, preserves evidence concerns, and optionally stores an encrypted case only on the user's device.

**Architecture:** A pure TypeScript state machine owns questions, branching, provenance, risk flags, rent calculations, and case-pack projections. React client components render that state and use a repository interface; the device implementation encrypts case data with Web Crypto and stores envelopes in IndexedDB. Document inspection is conservative and deterministic: it records neutral screening concerns, never declares forgery, and prevents disputed fields from becoming confirmed facts.

**Tech Stack:** Next.js 16.3.3 App Router, React 19.2.8, TypeScript 5.9, Zod 4, native Web Crypto, native IndexedDB, Vitest 3/jsdom, Testing Library, Playwright 1.55.

**Spec:** `docs/superpowers/specs/2026-08-30-guided-succession-rent-journey-design.md`

## Global Constraints

- Ask one primary question at a time; every question provides `I don't know`, back, edit, and reason controls.
- Reuse confirmed facts and never ask the user to write a second summary.
- Deterministic code owns mandatory questions, routing, calculations, and escalation; AI returns schema-validated proposals only.
- Separate confirmed facts, allegations, third-party statements, AI proposals, and missing information.
- Never label a rent discrepancy as fraud or a document as fake solely from automated screening.
- Original evidence bytes are immutable; derived text, thumbnails, and analysis are separate records.
- Device-only cases never silently sync and never persist a server-side case record.
- Remote AI processing requires separate, explicit disclosure even when storage is device-only.
- Sensitive case facts must not appear in URLs, analytics, logs, page titles, or notification text.
- English launches first; account sync, Luganda, production voice transcription, payments, messaging, and electronic filing remain outside this plan.
- Existing branding and seven department routes must remain functional.

## File structure

- `src/features/guided-case/model.ts` — domain schemas, discriminated unions, provenance, and immutable case state.
- `src/features/guided-case/fixture.ts` — the reference succession/rent starting state used by tests.
- `src/features/guided-case/journey.ts` — versioned question nodes, visibility rules, answer reducer, routing, and stale-output rules.
- `src/features/guided-case/journey.test.ts` — deterministic branch and contradiction coverage.
- `src/features/guided-case/rent-ledger.ts` — monthly ledger and discrepancy calculation.
- `src/features/guided-case/rent-ledger.test.ts` — accounting fixtures and status coverage.
- `src/features/guided-case/case-pack.ts` — fact table, referrals, briefs, action plan, and pack projection.
- `src/features/guided-case/case-pack.test.ts` — output safety and referral tests.
- `src/features/guided-case/evidence.ts` — upload validation, hashing, evidence records, document screening, and audit resolution.
- `src/features/guided-case/evidence.test.ts` — active-content rejection, immutability, and neutral flagging tests.
- `src/features/guided-case/ai-boundary.ts` — typed, schema-validated narrative extraction boundary and deterministic fallback.
- `src/features/guided-case/ai-boundary.test.ts` — invalid/low-confidence provider output coverage.
- `src/features/guided-case/storage/crypto.ts` — PBKDF2/AES-GCM envelope creation and opening.
- `src/features/guided-case/storage/crypto.test.ts` — round-trip, wrong-secret, and tamper tests.
- `src/features/guided-case/storage/repository.ts` — persistence contract and public metadata types.
- `src/features/guided-case/storage/indexeddb.ts` — IndexedDB case/evidence implementation and schema migration.
- `src/features/guided-case/storage/indexeddb.test.ts` — reload, quota/error, deletion, export/import, and migration tests.
- `src/features/guided-case/testing.ts` — deterministic in-memory case repository shared only by component tests.
- `src/features/guided-case/components/guided-intake.tsx` — narrative entry and one-question journey UI.
- `src/features/guided-case/components/guided-intake.test.tsx` — accessible interaction and route recalculation tests.
- `src/features/guided-case/components/storage-choice.tsx` — session-only/device-only choice and shared-device disclosure.
- `src/features/guided-case/components/storage-choice.test.tsx` — explicit-consent and failed-save tests.
- `src/features/guided-case/components/privacy-indicator.tsx` — truthful storage/AI status and privacy-dashboard entry.
- `src/features/guided-case/components/privacy-indicator.test.tsx` — storage-mode, disclosure, and forbidden-claim tests.
- `src/features/guided-case/components/ai-consent.tsx` — remote-processing preview, redaction choice, and privacy receipt.
- `src/features/guided-case/components/ai-consent.test.tsx` — default-off, minimum-disclosure, cancellation, and receipt tests.
- `src/features/guided-case/components/case-workspace.tsx` — confirmed facts, ledger, evidence flags, documents, timeline, and next actions.
- `src/features/guided-case/components/case-workspace.test.tsx` — output, stale-state, and follow-up tests.
- `src/features/guided-case/components/resume-device-case.tsx` — device-case unlock and resume entry.
- `src/features/guided-case/components/resume-device-case.test.tsx` — unlock, wrong-secret, and privacy tests.
- `src/features/guided-case/components/device-case-list.tsx` — privacy-safe list of resumable local cases.
- `src/features/guided-case/components/device-case-list.test.tsx` — generic-label and resume-link tests.
- `src/features/concierge/concierge-panel.tsx` — thin branded wrapper around the new intake.
- `src/app/matters/new/page.tsx` — full-page guided journey entry.
- `src/app/matters/[id]/page.tsx` — device-case unlock and resume entry.
- `src/app/globals.css` — mobile-first journey, status, workspace, and print styles.
- `e2e/guided-succession.spec.ts` — reference journey, reload/resume, evidence flag, and deletion flows.
- `package.json` / `package-lock.json` — add `fake-indexeddb` for deterministic IndexedDB tests.

---

### Task 1: Immutable guided-case domain model

**Files:**
- Create: `src/features/guided-case/model.ts`
- Create: `src/features/guided-case/fixture.ts`
- Create: `src/features/guided-case/model.test.ts`

**Interfaces:**
- Consumes: `DepartmentId` from `src/features/departments/registry.ts`.
- Produces: `GuidedCase`, `Answer`, `Fact`, `Statement`, `PrivacyReceipt`, `RiskFlag`, `EvidenceItem`, `DocumentVerification`, `TimelineEvent`, `createGuidedCase(story, now, id)`.

- [ ] **Step 1: Write the failing domain invariants test**

```ts
import { createGuidedCase, GuidedCaseSchema } from "./model";

test("creates a versioned case without converting the story into a confirmed fact", () => {
  const value = createGuidedCase(
    "Both parents died and my brother collects rent from the Bukoto house.",
    "2026-08-30T10:00:00.000Z",
    "case-1",
  );

  expect(value.id).toBe("case-1");
  expect(value.schemaVersion).toBe(1);
  expect(value.originalStory.kind).toBe("user-allegation");
  expect(value.facts).toEqual([]);
  expect(GuidedCaseSchema.parse(value)).toEqual(value);
});
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run: `npm.cmd test -- src/features/guided-case/model.test.ts`

Expected: FAIL because `./model` does not exist.

- [ ] **Step 3: Implement the schemas and constructor**

```ts
import { z } from "zod";

export const ProvenanceSchema = z.object({
  kind: z.enum(["user-allegation", "third-party-statement", "confirmed", "ai-proposal", "missing"]),
  sourceLabel: z.string().min(1),
  recordedAt: z.string().datetime(),
});

export const FactSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  provenance: ProvenanceSchema,
  confirmedAt: z.string().datetime().nullable(),
});

export const AnswerSchema = z.object({
  questionId: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]),
  answeredAt: z.string().datetime(),
});

export const StatementSchema = z.object({
  id: z.string().min(1),
  speakerLabel: z.string().min(1),
  exactText: z.string().min(1),
  channel: z.enum(["whatsapp", "sms", "letter", "email", "other", "unknown"]),
  statedAt: z.string().datetime().nullable(),
  recordedAt: z.string().datetime(),
  evidenceId: z.string().nullable(),
});

export const PrivacyReceiptSchema = z.object({
  id: z.string().min(1),
  purpose: z.string().min(1),
  categories: z.array(z.string().min(1)).min(1),
  processorLabel: z.string().min(1),
  retentionStatement: z.string().min(1),
  decision: z.literal("approved"),
  processedAt: z.string().datetime(),
});

export const RiskFlagSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["immediate-safety", "property-preservation", "vulnerable-beneficiary", "authority-uncertain", "accounting-discrepancy", "document-authenticity"]),
  status: z.enum(["open", "resolved"]),
  reason: z.string().min(1),
  raisedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullable(),
});

export const EvidenceItemSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1),
  mediaType: z.string().min(1),
  byteLength: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  sourceLabel: z.string().min(1),
  acquiredAt: z.string().datetime().nullable(),
  uploadedAt: z.string().datetime(),
  originalBlobId: z.string().min(1),
});

export const DocumentVerificationSchema = z.object({
  evidenceId: z.string().min(1),
  status: z.enum(["unverified", "screening-concern", "verification-required", "source-confirmed", "reviewer-rejected"]),
  reasons: z.array(z.string()),
  checkedAt: z.string().datetime(),
  resolvedBy: z.string().nullable(),
});

export const TimelineEventSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["answer", "evidence-added", "flag-raised", "flag-resolved", "letter-delivered", "meeting-held", "response-received"]),
  summary: z.string().min(1),
  occurredAt: z.string().datetime(),
});

export const GuidedCaseSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  phase: z.enum(["safety", "records", "authority", "beneficiaries", "property", "accounting", "outcome", "confirmation", "workspace"]),
  originalStory: z.object({ text: z.string().trim().min(10).max(4000), kind: z.literal("user-allegation") }),
  storageMode: z.enum(["session-only", "device-only", "account"]),
  remoteAiEnabled: z.boolean(),
  lastOpenedAt: z.string().datetime(),
  answers: z.record(z.string(), AnswerSchema),
  facts: z.array(FactSchema),
  statements: z.array(StatementSchema),
  risks: z.array(RiskFlagSchema),
  evidence: z.array(EvidenceItemSchema),
  verifications: z.array(DocumentVerificationSchema),
  timeline: z.array(TimelineEventSchema),
  privacyReceipts: z.array(PrivacyReceiptSchema),
  generatedFromRevision: z.number().int().nonnegative().nullable(),
  revision: z.number().int().nonnegative(),
});

export type GuidedCase = z.infer<typeof GuidedCaseSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type Fact = z.infer<typeof FactSchema>;
export type Statement = z.infer<typeof StatementSchema>;
export type PrivacyReceipt = z.infer<typeof PrivacyReceiptSchema>;
export type RiskFlag = z.infer<typeof RiskFlagSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type DocumentVerification = z.infer<typeof DocumentVerificationSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export function createGuidedCase(story: string, now: string, id = crypto.randomUUID()): GuidedCase {
  return GuidedCaseSchema.parse({
    schemaVersion: 1,
    id,
    createdAt: now,
    updatedAt: now,
    phase: "safety",
    originalStory: { text: story, kind: "user-allegation" },
    storageMode: "session-only",
    remoteAiEnabled: false,
    lastOpenedAt: now,
    answers: {},
    facts: [],
    statements: [],
    risks: [],
    evidence: [],
    verifications: [],
    timeline: [],
    privacyReceipts: [],
    generatedFromRevision: null,
    revision: 0,
  });
}
```

Create `fixture.ts` without embedding legal conclusions:

```ts
import { createGuidedCase } from "./model";

export const REFERENCE_STORY = "Both parents died and my brother collects rent from the Bukoto house.";
export const REFERENCE_NOW = "2026-08-30T10:00:00.000Z";
export function createReferenceCase() {
  return createGuidedCase(REFERENCE_STORY, REFERENCE_NOW, "case-1");
}
```

- [ ] **Step 4: Run the model test**

Run: `npm.cmd test -- src/features/guided-case/model.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the domain model**

```bash
git add src/features/guided-case/model.ts src/features/guided-case/fixture.ts src/features/guided-case/model.test.ts
git commit -m "feat: add guided case domain model"
```

### Task 2: Deterministic one-question journey engine

**Files:**
- Create: `src/features/guided-case/journey.ts`
- Create: `src/features/guided-case/journey.test.ts`

**Interfaces:**
- Consumes: `GuidedCase`, `Answer`, and `RiskFlag` from Task 1.
- Produces: `QuestionNode`, `JourneyView`, `getJourneyView(caseState)`, `answerQuestion(caseState, questionId, value, now)`, and `goBack(caseState)`.

- [ ] **Step 1: Write failing branch tests**

```ts
import { createReferenceCase } from "./fixture";
import { answerQuestion, getJourneyView } from "./journey";

test("shows one safety question and routes threats to the police liaison branch", () => {
  let state = createReferenceCase();
  expect(getJourneyView(state).question.id).toBe("safety-now");
  state = answerQuestion(state, "safety-now", ["threats"], "2026-08-30T10:01:00.000Z");
  expect(getJourneyView(state).question.id).toBe("community-liaison-help");
  expect(state.risks.map((risk) => risk.kind)).toContain("immediate-safety");
});

test("asks about authority before relying on a sibling's rent collection", () => {
  let state = createReferenceCase();
  state = answerQuestion(state, "safety-now", ["none"], "2026-08-30T10:01:00.000Z");
  state = answerQuestion(state, "will-known", "unknown", "2026-08-30T10:02:00.000Z");
  state = answerQuestion(state, "death-records", "unknown", "2026-08-30T10:03:00.000Z");
  expect(getJourneyView(state).question.id).toBe("estate-authority");
});

test("editing an earlier answer removes dependent answers and stales outputs", () => {
  const initial = { ...createReferenceCase(), generatedFromRevision: 2, revision: 2 };
  const changed = answerQuestion(initial, "safety-now", ["attempted-sale"], "2026-08-30T10:04:00.000Z");
  expect(changed.generatedFromRevision).toBeNull();
  expect(changed.revision).toBe(3);
});
```

- [ ] **Step 2: Run the journey tests and verify failure**

Run: `npm.cmd test -- src/features/guided-case/journey.test.ts`

Expected: FAIL because `journey.ts` does not exist.

- [ ] **Step 3: Implement versioned nodes and pure reducer**

Define these question IDs in order: `safety-now`, `community-liaison-help`, `will-known`, `death-records`, `estate-authority`, `administrator-identity`, `beneficiaries`, `vulnerable-people`, `property-location`, `property-documents`, `rental-units`, `rent-collector`, `rent-period`, `written-rent-statement`, `written-statement-channel`, `written-statement-text`, `declared-rent`, `supporting-records`, and `desired-outcome`.

```ts
import type { GuidedCase } from "./model";

export type AnswerValue = string | number | boolean | string[] | null;
export type QuestionNode = {
  id: string;
  phase: GuidedCase["phase"];
  prompt: string;
  reason: string;
  kind: "single" | "multi" | "text" | "number" | "date";
  options?: ReadonlyArray<{ value: string; label: string }>;
  visible: (state: GuidedCase) => boolean;
  invalidates: readonly string[];
};
export type JourneyView = { question: QuestionNode; position: number; answered: number; canGoBack: boolean };

const hasChoice = (state: GuidedCase, id: string, value: string) => {
  const answer = state.answers[id]?.value;
  return Array.isArray(answer) && answer.includes(value);
};

const firstNodes: readonly QuestionNode[] = [
  {
    id: "safety-now",
    phase: "safety",
    prompt: "Is anything unsafe or at risk right now?",
    reason: "This helps Wacha put urgent protection before ordinary paperwork.",
    kind: "multi",
    options: [
      { value: "none", label: "Nothing urgent" },
      { value: "threats", label: "Threats or intimidation" },
      { value: "property-damage", label: "Property damage or unlawful entry" },
      { value: "documents-seized", label: "Documents taken or hidden" },
      { value: "attempted-sale", label: "Possible sale or transfer" },
      { value: "money-disappearing", label: "Rent or estate money may disappear" },
    ],
    visible: () => true,
    invalidates: ["community-liaison-help"],
  },
  {
    id: "community-liaison-help",
    phase: "safety",
    prompt: "Would you like Wacha to prepare a factual brief for the Community Liaison Officer?",
    reason: "Police community liaison may help with safety and community problem-solving, but does not decide inheritance ownership.",
    kind: "single",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "Not now" },
      { value: "unknown", label: "I don't know" },
    ],
    visible: (state) => ["threats", "property-damage", "documents-seized"].some((value) => hasChoice(state, "safety-now", value)),
    invalidates: [],
  },
  {
    id: "will-known",
    phase: "records",
    prompt: "Do you know whether either parent left a will?",
    reason: "A known will changes which authority documents should be checked.",
    kind: "single",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unknown", label: "I don't know" },
    ],
    visible: () => true,
    invalidates: [],
  },
];
```

Append these exact nodes to `JOURNEY_NODES`:

```ts
const yesNoUnknown = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "I don't know" },
] as const;

const remainingNodes: readonly QuestionNode[] = [
  { id: "death-records", phase: "records", prompt: "Do you have death certificates or death notifications?", reason: "These records help identify the estate files that may be needed.", kind: "single", options: yesNoUnknown, visible: () => true, invalidates: [] },
  { id: "estate-authority", phase: "authority", prompt: "Has a court granted probate or letters of administration for this estate?", reason: "Wacha must know who, if anyone, has authority to administer the estate.", kind: "single", options: yesNoUnknown, visible: () => true, invalidates: ["administrator-identity"] },
  { id: "administrator-identity", phase: "authority", prompt: "Who is named as the executor or administrator?", reason: "This identifies who should account for estate income.", kind: "text", visible: (state) => state.answers["estate-authority"]?.value === "yes", invalidates: [] },
  { id: "beneficiaries", phase: "beneficiaries", prompt: "Which close family members or dependants may need to be included?", reason: "Wacha records possible beneficiaries without deciding their final shares.", kind: "text", visible: () => true, invalidates: [] },
  { id: "vulnerable-people", phase: "beneficiaries", prompt: "Does the estate involve a child or anyone who may need extra protection?", reason: "Children and vulnerable beneficiaries may require urgent human review.", kind: "multi", options: [{ value: "none", label: "No one I know of" }, { value: "child", label: "A child under 18" }, { value: "older-person", label: "An older person" }, { value: "disability", label: "A person with a disability" }, { value: "unknown", label: "I don't know" }], visible: () => true, invalidates: [] },
  { id: "property-location", phase: "property", prompt: "Where is the rental property?", reason: "The location helps organise property records and the correct local offices.", kind: "text", visible: () => true, invalidates: [] },
  { id: "property-documents", phase: "property", prompt: "Which property documents have you seen?", reason: "Wacha keeps known documents separate from documents that still need verification.", kind: "multi", options: [{ value: "title", label: "Certificate of title" }, { value: "sale-agreement", label: "Sale agreement" }, { value: "tenancy-records", label: "Tenancy records" }, { value: "none", label: "None" }, { value: "unknown", label: "I don't know" }], visible: () => true, invalidates: [] },
  { id: "rental-units", phase: "property", prompt: "How many occupied rental units do you know about?", reason: "This helps Wacha build the rent schedule; an estimate will be marked as reported.", kind: "number", visible: () => true, invalidates: [] },
  { id: "rent-collector", phase: "accounting", prompt: "Who has been collecting the rent?", reason: "The collector's role and authority affect the next accounting questions.", kind: "text", visible: () => true, invalidates: [] },
  { id: "rent-period", phase: "accounting", prompt: "From which month should the rent account begin?", reason: "Wacha uses this to create a month-by-month schedule.", kind: "date", visible: () => true, invalidates: [] },
  { id: "written-rent-statement", phase: "accounting", prompt: "Has the collector put any rent figures in writing?", reason: "A message or document can be preserved as a statement and checked against payment records.", kind: "single", options: yesNoUnknown, visible: () => true, invalidates: ["written-statement-channel", "written-statement-text", "declared-rent"] },
  { id: "written-statement-channel", phase: "accounting", prompt: "Where was the written statement sent?", reason: "The original communication channel belongs in the evidence record.", kind: "single", options: [{ value: "whatsapp", label: "WhatsApp" }, { value: "sms", label: "SMS" }, { value: "letter", label: "Letter" }, { value: "email", label: "Email" }, { value: "other", label: "Another place" }, { value: "unknown", label: "I don't know" }], visible: (state) => state.answers["written-rent-statement"]?.value === "yes", invalidates: [] },
  { id: "written-statement-text", phase: "accounting", prompt: "Paste the collector's exact words, if you have them", reason: "Wacha preserves the original wording separately from its own explanation.", kind: "text", visible: (state) => state.answers["written-rent-statement"]?.value === "yes", invalidates: [] },
  { id: "declared-rent", phase: "accounting", prompt: "How much rent did the collector say was received each month?", reason: "This is recorded as a third-party statement until supporting records confirm it.", kind: "number", visible: (state) => state.answers["written-rent-statement"]?.value === "yes", invalidates: [] },
  { id: "supporting-records", phase: "accounting", prompt: "Which rent records can you access?", reason: "Actual records help separate a discrepancy from a misunderstanding or supported expense.", kind: "multi", options: [{ value: "tenant-confirmations", label: "Tenant confirmations" }, { value: "receipts", label: "Rent receipts" }, { value: "bank-mobile-money", label: "Bank or mobile-money records" }, { value: "expense-receipts", label: "Property expense receipts" }, { value: "none", label: "None yet" }, { value: "unknown", label: "I don't know" }], visible: () => true, invalidates: [] },
  { id: "desired-outcome", phase: "outcome", prompt: "What would you like Wacha to help you do first?", reason: "Wacha uses your goal to prepare the right next-step pack.", kind: "single", options: [{ value: "understand", label: "Understand the position" }, { value: "full-account", label: "Obtain a complete rent account" }, { value: "preserve", label: "Protect the property or rent" }, { value: "family-meeting", label: "Prepare for a family meeting" }, { value: "administrator-general", label: "Prepare for the Administrator General" }, { value: "advocate", label: "Prepare for an advocate" }], visible: () => true, invalidates: [] },
];

export const JOURNEY_NODES: readonly QuestionNode[] = [...firstNodes, ...remainingNodes];
```

Implement reducer behaviour with these exact public functions:

```ts
import { GuidedCaseSchema } from "./model";

const riskRules: ReadonlyArray<{ kind: GuidedCase["risks"][number]["kind"]; reason: string; active: (state: GuidedCase) => boolean }> = [
  { kind: "immediate-safety", reason: "The user reported a current safety or security concern.", active: (state) => ["threats", "property-damage", "documents-seized"].some((value) => hasChoice(state, "safety-now", value)) },
  { kind: "property-preservation", reason: "The user reported a risk to estate property or money.", active: (state) => ["attempted-sale", "money-disappearing"].some((value) => hasChoice(state, "safety-now", value)) },
  { kind: "authority-uncertain", reason: "No confirmed grant of probate or letters of administration is known.", active: (state) => ["no", "unknown"].includes(String(state.answers["estate-authority"]?.value)) },
  { kind: "vulnerable-beneficiary", reason: "A potentially vulnerable beneficiary was reported.", active: (state) => ["child", "older-person", "disability"].some((value) => hasChoice(state, "vulnerable-people", value)) },
  { kind: "accounting-discrepancy", reason: "The rent figures require reconciliation against supporting records.", active: (state) => state.answers["written-rent-statement"]?.value === "yes" },
];

function recalculateRisks(state: GuidedCase, now: string) {
  const retained = state.risks.filter((risk) => risk.kind === "document-authenticity");
  return [
    ...retained,
    ...riskRules.filter((rule) => rule.active(state)).map((rule) => ({ id: `risk-${rule.kind}`, kind: rule.kind, status: "open" as const, reason: rule.reason, raisedAt: now, resolvedAt: null })),
  ];
}

export function answerQuestion(state: GuidedCase, questionId: string, value: AnswerValue, now: string): GuidedCase {
  const node = JOURNEY_NODES.find((candidate) => candidate.id === questionId);
  if (!node) throw new Error(`Unknown question: ${questionId}`);
  const answers = structuredClone(state.answers);
  answers[questionId] = { questionId, value, answeredAt: now };
  node.invalidates.forEach((id) => delete answers[id]);
  const statements = state.statements.filter((statement) => statement.id !== "collector-written-statement");
  if (questionId === "written-statement-text" && typeof value === "string" && value.trim()) {
    statements.push({ id: "collector-written-statement", speakerLabel: "Rent collector", exactText: value.trim(), channel: String(answers["written-statement-channel"]?.value ?? "unknown") as "whatsapp" | "sms" | "letter" | "email" | "other" | "unknown", statedAt: null, recordedAt: now, evidenceId: null });
  } else if (questionId === "written-statement-channel" && state.statements.some((statement) => statement.id === "collector-written-statement")) {
    const previous = state.statements.find((statement) => statement.id === "collector-written-statement")!;
    statements.push({ ...previous, channel: String(value) as "whatsapp" | "sms" | "letter" | "email" | "other" | "unknown", recordedAt: now });
  } else if (questionId !== "written-statement-text") {
    statements.push(...state.statements.filter((statement) => statement.id === "collector-written-statement"));
  }
  const next = { ...structuredClone(state), answers, statements, phase: node.phase, updatedAt: now, revision: state.revision + 1, generatedFromRevision: null };
  next.risks = recalculateRisks(next, now);
  next.timeline.push({ id: crypto.randomUUID(), kind: "answer", summary: `Answered ${questionId}`, occurredAt: now });
  return GuidedCaseSchema.parse(next);
}

export function getJourneyView(state: GuidedCase): JourneyView {
  const visible = JOURNEY_NODES.filter((node) => node.visible(state));
  const question = visible.find((node) => !state.answers[node.id]) ?? { id: "confirm-facts", phase: "confirmation", prompt: "Please confirm what Wacha understands.", reason: "Confirmed facts can safely be reused in your case pack.", kind: "single", options: [{ value: "confirmed", label: "The facts are correct" }], visible: () => true, invalidates: [] };
  return { question, position: Math.min(visible.findIndex((node) => node.id === question.id) + 1, visible.length), answered: visible.filter((node) => state.answers[node.id]).length, canGoBack: Object.keys(state.answers).length > 0 };
}

export function goBack(state: GuidedCase): GuidedCase {
  const answered = JOURNEY_NODES.filter((node) => node.visible(state) && state.answers[node.id]);
  const last = answered.at(-1);
  if (!last) return state;
  const answers = structuredClone(state.answers);
  delete answers[last.id];
  const statements = last.id === "written-statement-text" ? state.statements.filter((statement) => statement.id !== "collector-written-statement") : state.statements;
  return GuidedCaseSchema.parse({ ...structuredClone(state), answers, statements, revision: state.revision + 1, generatedFromRevision: null });
}
```

- [ ] **Step 4: Run all journey tests**

Run: `npm.cmd test -- src/features/guided-case/journey.test.ts`

Expected: PASS, including safety, authority, vulnerable-person, rent-statement, under-declaration, and desired-outcome branches.

- [ ] **Step 5: Commit the journey engine**

```bash
git add src/features/guided-case/journey.ts src/features/guided-case/journey.test.ts
git commit -m "feat: add adaptive succession journey"
```

### Task 3: Narrative extraction boundary with safe fallback

**Files:**
- Create: `src/features/guided-case/ai-boundary.ts`
- Create: `src/features/guided-case/ai-boundary.test.ts`
- Modify: `src/providers/local.ts`
- Modify: `src/providers/local.test.ts`

**Interfaces:**
- Consumes: the user's original story and `Fact` provenance types.
- Produces: `NarrativeProposalSchema`, `NarrativeExtractor`, `extractNarrative(extractor, story)`, and `createLocalProviders().narrative.extract(story)`.

- [ ] **Step 1: Write failing validation and fallback tests**

```ts
import { extractNarrative } from "./ai-boundary";

test("accepts typed proposals but leaves them unconfirmed", async () => {
  const result = await extractNarrative(
    { extract: async () => ({ people: ["mother", "father", "brother"], locations: ["Bukoto"], issues: ["rent-accounting"], confidence: 0.88 }) },
    "Both parents died and my brother collects rent from the Bukoto house.",
  );
  expect(result.status).toBe("proposal");
  expect(result.facts.every((fact) => fact.provenance.kind === "ai-proposal")).toBe(true);
});

test("falls back without losing the story when provider output is invalid", async () => {
  const result = await extractNarrative({ extract: async () => ({ confidence: 9 }) }, "A sufficiently detailed original story.");
  expect(result).toEqual({ status: "questionnaire-only", facts: [] });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm.cmd test -- src/features/guided-case/ai-boundary.test.ts src/providers/local.test.ts`

Expected: FAIL because the boundary and provider member do not exist.

- [ ] **Step 3: Implement schema validation and minimum-context adapter**

```ts
import { z } from "zod";
import type { Fact } from "./model";

export const NarrativeProposalSchema = z.object({
  people: z.array(z.string().trim().min(1)).max(20),
  locations: z.array(z.string().trim().min(1)).max(10),
  issues: z.array(z.enum(["succession", "rent-accounting", "safety", "property-preservation", "unknown"])).max(10),
  confidence: z.number().min(0).max(1),
});

export interface NarrativeExtractor { extract(story: string): Promise<unknown> }

export async function extractNarrative(extractor: NarrativeExtractor, story: string) {
  try {
    const parsed = NarrativeProposalSchema.parse(await extractor.extract(story));
    if (parsed.confidence < 0.65) return { status: "questionnaire-only" as const, facts: [] as Fact[] };
    const now = new Date().toISOString();
    const values = [...parsed.people.map((value) => ["person", value] as const), ...parsed.locations.map((value) => ["location", value] as const), ...parsed.issues.map((value) => ["issue", value] as const)];
    return {
      status: "proposal" as const,
      facts: values.map(([key, value], index): Fact => ({ id: `ai-${index}`, key, value, provenance: { kind: "ai-proposal", sourceLabel: "Narrative extraction", recordedAt: now }, confirmedAt: null })),
    };
  } catch {
    return { status: "questionnaire-only" as const, facts: [] as Fact[] };
  }
}
```

Extend the local provider with a deterministic reference-story extractor that returns only the schema fields above. It must not emit legal conclusions or confirmed facts.

- [ ] **Step 4: Run boundary and provider tests**

Run: `npm.cmd test -- src/features/guided-case/ai-boundary.test.ts src/providers/local.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the AI boundary**

```bash
git add src/features/guided-case/ai-boundary.ts src/features/guided-case/ai-boundary.test.ts src/providers/local.ts src/providers/local.test.ts
git commit -m "feat: add safe narrative extraction boundary"
```

### Task 4: Rent ledger and case-pack projection

**Files:**
- Create: `src/features/guided-case/rent-ledger.ts`
- Create: `src/features/guided-case/rent-ledger.test.ts`
- Create: `src/features/guided-case/case-pack.ts`
- Create: `src/features/guided-case/case-pack.test.ts`

**Interfaces:**
- Consumes: confirmed and reported values from `GuidedCase`.
- Produces: `RentEntry`, `RentLedger`, `buildRentLedger(entries)`, `CasePack`, and `buildCasePack(caseState, entries, now)`.

- [ ] **Step 1: Write failing accounting and wording tests**

```ts
import { buildRentLedger } from "./rent-ledger";

test("calculates an unresolved discrepancy without calling it fraud", () => {
  const ledger = buildRentLedger([
    { month: "2026-05", expectedUgx: 2_000_000, collectedUgx: 2_000_000, declaredUgx: 1_200_000, supportedExpensesUgx: 200_000, status: "reported" },
  ]);
  expect(ledger.totals.unexplainedUgx).toBe(600_000);
  expect(ledger.label).toBe("Unresolved rent-accounting discrepancy");
  expect(JSON.stringify(ledger).toLowerCase()).not.toContain("fraud");
});
```

```ts
import { createReferenceCase } from "./fixture";
import { buildCasePack } from "./case-pack";

test("creates only referrals activated by case facts", () => {
  const pack = buildCasePack(createReferenceCase(), [], "2026-08-30T11:00:00.000Z");
  expect(pack.referrals).toEqual([]);
  expect(pack.sections.map((section) => section.id)).toEqual(["summary", "facts", "rent-ledger", "evidence", "accounting-request", "actions"]);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm.cmd test -- src/features/guided-case/rent-ledger.test.ts src/features/guided-case/case-pack.test.ts`

Expected: FAIL because both modules are missing.

- [ ] **Step 3: Implement exact accounting arithmetic**

```ts
export type ValueStatus = "confirmed" | "reported" | "estimated" | "missing";
export type RentEntry = {
  month: string;
  expectedUgx: number | null;
  collectedUgx: number | null;
  declaredUgx: number | null;
  supportedExpensesUgx: number | null;
  status: ValueStatus;
};

export function buildRentLedger(entries: readonly RentEntry[]) {
  const amount = (value: number | null) => value ?? 0;
  const totals = entries.reduce(
    (sum, row) => ({
      expectedUgx: sum.expectedUgx + amount(row.expectedUgx),
      collectedUgx: sum.collectedUgx + amount(row.collectedUgx),
      declaredUgx: sum.declaredUgx + amount(row.declaredUgx),
      supportedExpensesUgx: sum.supportedExpensesUgx + amount(row.supportedExpensesUgx),
    }),
    { expectedUgx: 0, collectedUgx: 0, declaredUgx: 0, supportedExpensesUgx: 0 },
  );
  return {
    entries: entries.map((row) => ({ ...row })),
    totals: { ...totals, unexplainedUgx: Math.max(0, totals.collectedUgx - totals.declaredUgx - totals.supportedExpensesUgx) },
    label: "Unresolved rent-accounting discrepancy" as const,
  };
}
```

Implement the pack with explicit referral predicates and neutral accounting copy:

```ts
import type { GuidedCase } from "./model";
import { buildRentLedger, type RentEntry } from "./rent-ledger";

export type CasePackSection = { id: string; title: string; lines: string[] };
export type CasePackReferral = { id: "community-liaison" | "administrator-general" | "advocate-review"; title: string; reason: string };
export type CasePackAction = { stage: "first" | "next" | "later"; label: string; completed: boolean };
export type CasePack = {
  caseId: string;
  createdAt: string;
  generatedFromRevision: number;
  sections: CasePackSection[];
  referrals: CasePackReferral[];
  actions: CasePackAction[];
  ledger: ReturnType<typeof buildRentLedger>;
  accountingRequest: { title: string; requests: string[]; closing: string };
};

const hasRisk = (state: GuidedCase, kind: GuidedCase["risks"][number]["kind"]) => state.risks.some((risk) => risk.kind === kind && risk.status === "open");
const answerIs = (state: GuidedCase, id: string, value: string) => state.answers[id]?.value === value;

export function buildCasePack(state: GuidedCase, entries: readonly RentEntry[], now: string): CasePack {
  const ledger = buildRentLedger(entries);
  const referrals: CasePackReferral[] = [];
  if (answerIs(state, "community-liaison-help", "yes")) referrals.push({ id: "community-liaison", title: "Community Liaison Officer brief", reason: "A safety or suitable community problem-solving concern was reported." });
  if (hasRisk(state, "authority-uncertain") || answerIs(state, "desired-outcome", "administrator-general")) referrals.push({ id: "administrator-general", title: "Administrator General brief", reason: "Estate authority or administration requires clarification." });
  if (["vulnerable-beneficiary", "document-authenticity"].some((kind) => hasRisk(state, kind as GuidedCase["risks"][number]["kind"])) || answerIs(state, "desired-outcome", "advocate")) referrals.push({ id: "advocate-review", title: "Advocate review", reason: "The case contains a risk requiring human legal review." });

  const factLines = state.facts.map((fact) => `${fact.key}: ${String(fact.value)} — ${fact.provenance.kind}`);
  const evidenceLines = state.evidence.map((item) => {
    const verification = state.verifications.find((value) => value.evidenceId === item.id);
    return `${item.fileName}: ${verification?.status ?? "unverified"}`;
  });
  state.statements.forEach((statement, index) => evidenceLines.push(`Exhibit S${index + 1} — exact ${statement.channel} statement from ${statement.speakerLabel}: ${statement.exactText}`));
  const actions: CasePackAction[] = [
    { stage: "first", label: hasRisk(state, "immediate-safety") || hasRisk(state, "property-preservation") ? "Address the open safety or preservation concern." : "Confirm the people, authority, property, and rent facts.", completed: false },
    { stage: "next", label: "Gather the available rent records and send the accounting request when ready.", completed: false },
    { stage: "later", label: referrals.length ? `Take the prepared brief to: ${referrals.map((referral) => referral.title).join(", ")}.` : "Record the response and let Wacha update the next step.", completed: false },
  ];
  const sections: CasePackSection[] = [
    { id: "summary", title: "Case summary", lines: [`The user reported: ${state.originalStory.text}`] },
    { id: "facts", title: "Facts and statements", lines: factLines.length ? factLines : ["No facts have been confirmed yet."] },
    { id: "rent-ledger", title: "Rent account", lines: [ledger.label, `Unexplained amount: UGX ${ledger.totals.unexplainedUgx.toLocaleString("en-UG")}`] },
    { id: "evidence", title: "Evidence and document checks", lines: evidenceLines.length ? evidenceLines : ["No evidence has been added yet."] },
    { id: "accounting-request", title: "Draft rent-accounting request", lines: ["Request a complete account supported by available records for the period stated in this case."] },
    { id: "actions", title: "Your next steps", lines: actions.map((action) => `${action.stage}: ${action.label}`) },
  ];
  referrals.forEach((referral) => sections.push({ id: `referral-${referral.id}`, title: referral.title, lines: [referral.reason] }));
  return {
    caseId: state.id,
    createdAt: now,
    generatedFromRevision: state.revision,
    sections,
    referrals,
    actions,
    ledger,
    accountingRequest: {
      title: "Request for a complete account of estate rent",
      requests: ["Monthly tenant and occupancy schedule", "Rent charged and received", "Receipts and bank or mobile-money records", "Supported property expenses", "Amounts distributed to beneficiaries"],
      closing: "Please provide the account and supporting records so that the figures can be reconciled. This request does not assume wrongdoing.",
    },
  };
}
```

- [ ] **Step 4: Run ledger and pack tests**

Run: `npm.cmd test -- src/features/guided-case/rent-ledger.test.ts src/features/guided-case/case-pack.test.ts`

Expected: PASS for complete, partial, missing, over-declared, negative-input rejection, and referral fixtures.

- [ ] **Step 5: Commit accounting and pack projection**

```bash
git add src/features/guided-case/rent-ledger.ts src/features/guided-case/rent-ledger.test.ts src/features/guided-case/case-pack.ts src/features/guided-case/case-pack.test.ts
git commit -m "feat: build rent ledger and case pack"
```

### Task 5: Evidence integrity and suspicious-document screening

**Files:**
- Create: `src/features/guided-case/evidence.ts`
- Create: `src/features/guided-case/evidence.test.ts`

**Interfaces:**
- Consumes: `EvidenceItem`, `DocumentVerification`, `RiskFlag`, and immutable `GuidedCase`.
- Produces: `inspectUpload(file, sourceLabel, now)`, `screenDocument(input, now)`, `attachEvidence(caseState, inspection)`, and `resolveDocumentConcern(caseState, evidenceId, resolution, reviewer, now)`.

- [ ] **Step 1: Write failing upload and neutral-screening tests**

```ts
import { inspectUpload, screenDocument } from "./evidence";

test("rejects executable content disguised as a PDF", async () => {
  const file = new File([new Uint8Array([0x4d, 0x5a, 0x90, 0x00])], "letter.pdf", { type: "application/pdf" });
  await expect(inspectUpload(file, "User upload", "2026-08-30T12:00:00.000Z")).rejects.toThrow("File content does not match PDF");
});

test("flags inconsistent document details without declaring the document fake", () => {
  const result = screenDocument({ evidenceId: "e-1", statedDate: "2026-06-01", datesFound: ["2025-06-01"], duplicateDigests: [], referenceNumbers: ["AG-12", "AG-21"] }, "2026-08-30T12:01:00.000Z");
  expect(result.status).toBe("screening-concern");
  expect(result.reasons).toContain("The document contains conflicting reference numbers.");
  expect(JSON.stringify(result).toLowerCase()).not.toContain("fake");
  expect(JSON.stringify(result).toLowerCase()).not.toContain("forgery");
});
```

- [ ] **Step 2: Run evidence tests and verify failure**

Run: `npm.cmd test -- src/features/guided-case/evidence.test.ts`

Expected: FAIL because `evidence.ts` does not exist.

- [ ] **Step 3: Implement file validation, digesting, and audit resolution**

```ts
const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
const signatures = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46, 0x2d],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/jpeg": [0xff, 0xd8, 0xff],
} as const;

const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, "0")).join("");

export async function inspectUpload(file: File, sourceLabel: string, now: string) {
  if (!(file.type in signatures)) throw new Error("Unsupported evidence type");
  if (file.size === 0 || file.size > MAX_EVIDENCE_BYTES) throw new Error("Evidence must be between 1 byte and 10 MB");
  const bytes = await file.arrayBuffer();
  const expected = signatures[file.type as keyof typeof signatures];
  const actual = new Uint8Array(bytes, 0, expected.length);
  if (!expected.every((value, index) => actual[index] === value)) throw new Error(`File content does not match ${file.type === "application/pdf" ? "PDF" : "the selected image type"}`);
  return { bytes, sha256: hex(await crypto.subtle.digest("SHA-256", bytes)), sourceLabel, uploadedAt: now };
}

export type DocumentScreeningInput = {
  evidenceId: string;
  statedDate: string | null;
  datesFound: string[];
  duplicateDigests: string[];
  referenceNumbers: string[];
};
```

Use these exact deterministic rules and audit functions:

```ts
import { GuidedCaseSchema, type DocumentVerification, type EvidenceItem, type GuidedCase } from "./model";

export function screenDocument(input: DocumentScreeningInput, now: string): DocumentVerification {
  const reasons: string[] = [];
  const references = new Set(input.referenceNumbers.map((value) => value.trim()).filter(Boolean));
  if (references.size > 1) reasons.push("The document contains conflicting reference numbers.");
  if (input.statedDate && input.datesFound.length > 0 && !input.datesFound.includes(input.statedDate)) reasons.push("The stated document date does not match the dates found during screening.");
  return {
    evidenceId: input.evidenceId,
    status: reasons.length ? "screening-concern" : "unverified",
    reasons,
    checkedAt: now,
    resolvedBy: null,
  };
}

export type InspectedUpload = {
  bytes: ArrayBuffer;
  sha256: string;
  sourceLabel: string;
  uploadedAt: string;
  fileName: string;
  mediaType: string;
};

export function attachEvidence(state: GuidedCase, upload: InspectedUpload, blobId: string, evidenceId = crypto.randomUUID()): GuidedCase {
  const item: EvidenceItem = {
    id: evidenceId,
    fileName: upload.fileName,
    mediaType: upload.mediaType,
    byteLength: upload.bytes.byteLength,
    sha256: upload.sha256,
    sourceLabel: upload.sourceLabel,
    acquiredAt: null,
    uploadedAt: upload.uploadedAt,
    originalBlobId: blobId,
  };
  const next = structuredClone(state);
  next.evidence.push(item);
  next.verifications.push({ evidenceId, status: "unverified", reasons: [], checkedAt: upload.uploadedAt, resolvedBy: null });
  next.timeline.push({ id: crypto.randomUUID(), kind: "evidence-added", summary: `Added ${upload.fileName}`, occurredAt: upload.uploadedAt });
  next.updatedAt = upload.uploadedAt;
  next.revision += 1;
  next.generatedFromRevision = null;
  return GuidedCaseSchema.parse(next);
}

export function applyDocumentScreening(state: GuidedCase, result: DocumentVerification): GuidedCase {
  const next = structuredClone(state);
  next.verifications = next.verifications.filter((value) => value.evidenceId !== result.evidenceId).concat(result);
  if (result.status === "screening-concern") {
    next.risks = next.risks.filter((risk) => !(risk.kind === "document-authenticity" && risk.id === `document-${result.evidenceId}`));
    next.risks.push({ id: `document-${result.evidenceId}`, kind: "document-authenticity", status: "open", reason: result.reasons.join(" "), raisedAt: result.checkedAt, resolvedAt: null });
    next.timeline.push({ id: crypto.randomUUID(), kind: "flag-raised", summary: "A document requires verification before reliance.", occurredAt: result.checkedAt });
  }
  next.revision += 1;
  next.generatedFromRevision = null;
  return GuidedCaseSchema.parse(next);
}

export function resolveDocumentConcern(state: GuidedCase, evidenceId: string, resolution: "source-confirmed" | "reviewer-rejected", reviewer: string, now: string): GuidedCase {
  if (!reviewer.trim()) throw new Error("Record who verified the document");
  const next = structuredClone(state);
  const verification = next.verifications.find((value) => value.evidenceId === evidenceId);
  if (!verification) throw new Error("Document verification not found");
  verification.status = resolution;
  verification.checkedAt = now;
  verification.resolvedBy = reviewer.trim();
  const risk = next.risks.find((value) => value.id === `document-${evidenceId}`);
  if (risk) { risk.status = "resolved"; risk.resolvedAt = now; }
  next.timeline.push({ id: crypto.randomUUID(), kind: "flag-resolved", summary: `Document verification recorded by ${reviewer.trim()}.`, occurredAt: now });
  next.revision += 1;
  next.generatedFromRevision = null;
  return GuidedCaseSchema.parse(next);
}
```

Return `fileName: file.name` and `mediaType: file.type` from `inspectUpload`. Identical digests are shown as duplicate evidence but do not create authenticity concerns.

- [ ] **Step 4: Run evidence tests**

Run: `npm.cmd test -- src/features/guided-case/evidence.test.ts`

Expected: PASS for PDF/PNG/JPEG signatures, size limit, digest stability, immutable source bytes, neutral concerns, duplicate handling, and auditable resolution.

- [ ] **Step 5: Commit evidence safeguards**

```bash
git add src/features/guided-case/evidence.ts src/features/guided-case/evidence.test.ts
git commit -m "feat: add evidence authenticity safeguards"
```

### Task 6: Encrypted device-only repository

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/features/guided-case/storage/crypto.ts`
- Create: `src/features/guided-case/storage/crypto.test.ts`
- Create: `src/features/guided-case/storage/repository.ts`
- Create: `src/features/guided-case/storage/indexeddb.ts`
- Create: `src/features/guided-case/storage/indexeddb.test.ts`
- Create: `src/features/guided-case/testing.ts`

**Interfaces:**
- Consumes: `GuidedCaseSchema` and inspected original evidence bytes.
- Produces: `EncryptedEnvelope`, `sealJson(value, secret)`, `openJson(envelope, secret, schema)`, `CaseRepository`, and `IndexedDbCaseRepository`.

- [ ] **Step 1: Install the IndexedDB test adapter**

Run: `npm.cmd install --save-dev fake-indexeddb@6.2.5`

Expected: `package.json` and lockfile contain exact version `6.2.5`, the current npm release verified on 2026-08-30.

- [ ] **Step 2: Write failing crypto and reload tests**

```ts
import { openJson, sealJson } from "./crypto";
import { GuidedCaseSchema, createGuidedCase } from "../model";

test("round-trips a case and rejects a wrong secret or modified ciphertext", async () => {
  const value = createGuidedCase("A sufficiently detailed private succession story.", "2026-08-30T13:00:00.000Z", "case-1");
  const envelope = await sealJson(value, "correct horse battery staple");
  await expect(openJson(envelope, "correct horse battery staple", GuidedCaseSchema)).resolves.toEqual(value);
  await expect(openJson(envelope, "wrong secret", GuidedCaseSchema)).rejects.toThrow("Unable to unlock this case");
  envelope.ciphertext[0] ^= 1;
  await expect(openJson(envelope, "correct horse battery staple", GuidedCaseSchema)).rejects.toThrow("Unable to unlock this case");
});
```

```ts
import "fake-indexeddb/auto";
import { IndexedDbCaseRepository } from "./indexeddb";
import { createGuidedCase } from "../model";

test("saves, reloads, lists privately, and permanently deletes a device case", async () => {
  const first = new IndexedDbCaseRepository("wacha-test-reload");
  const value = createGuidedCase("A sufficiently detailed private succession story.", "2026-08-30T13:00:00.000Z", "case-1");
  await first.save(value, "correct horse battery staple");
  const second = new IndexedDbCaseRepository("wacha-test-reload");
  expect(await second.load("case-1", "correct horse battery staple")).toEqual(value);
  expect(await second.list()).toEqual([{ id: "case-1", label: "Private case", updatedAt: value.updatedAt }]);
  await second.delete("case-1");
  await expect(second.load("case-1", "correct horse battery staple")).rejects.toThrow("Case not found");
});
```

- [ ] **Step 3: Run storage tests and verify failure**

Run: `npm.cmd test -- src/features/guided-case/storage/crypto.test.ts src/features/guided-case/storage/indexeddb.test.ts`

Expected: FAIL because storage modules do not exist.

- [ ] **Step 4: Implement AES-GCM envelopes**

```ts
import type { z } from "zod";

export type EncryptedEnvelope = {
  version: 1;
  kdf: "PBKDF2-SHA-256";
  iterations: 310000;
  salt: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function derive(secret: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 310000 }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function sealBytes(value: Uint8Array, secret: string): Promise<EncryptedEnvelope> {
  if (secret.length < 12) throw new Error("Use at least 12 characters to lock this case");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(secret, salt);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, value));
  return { version: 1, kdf: "PBKDF2-SHA-256", iterations: 310000, salt, iv, ciphertext };
}

export async function openBytes(envelope: EncryptedEnvelope, secret: string): Promise<Uint8Array> {
  try {
    const key = await derive(secret, envelope.salt);
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: envelope.iv }, key, envelope.ciphertext));
  } catch {
    throw new Error("Unable to unlock this case");
  }
}

export function sealJson(value: unknown, secret: string): Promise<EncryptedEnvelope> {
  return sealBytes(encoder.encode(JSON.stringify(value)), secret);
}

export async function openJson<T>(envelope: EncryptedEnvelope, secret: string, schema: z.ZodType<T>): Promise<T> {
  try {
    return schema.parse(JSON.parse(decoder.decode(await openBytes(envelope, secret))));
  } catch {
    throw new Error("Unable to unlock this case");
  }
}
```

- [ ] **Step 5: Implement the repository and transactional IndexedDB adapter**

```ts
import type { GuidedCase } from "../model";

export type PrivateCaseSummary = { id: string; label: "Private case"; updatedAt: string };
export interface CaseRepository {
  save(value: GuidedCase, secret: string): Promise<void>;
  load(id: string, secret: string): Promise<GuidedCase>;
  list(): Promise<PrivateCaseSummary[]>;
  saveEvidence(caseId: string, blobId: string, bytes: Uint8Array, secret: string): Promise<void>;
  loadEvidence(caseId: string, blobId: string, secret: string): Promise<Uint8Array>;
  delete(id: string): Promise<void>;
  exportEncrypted(id: string): Promise<Blob>;
  importEncrypted(blob: Blob): Promise<PrivateCaseSummary>;
}
```

Create the shared component-test adapter with this exact API:

```ts
import type { GuidedCase } from "./model";
import type { CaseRepository, PrivateCaseSummary } from "./storage/repository";

export class MemoryCaseRepository implements CaseRepository {
  readonly saved: GuidedCase[] = [];
  private readonly cases = new Map<string, { value: GuidedCase; secret: string }>();
  private readonly evidence = new Map<string, Uint8Array>();

  constructor(private readonly options: { failSave?: boolean } = {}) {}

  seed(value: GuidedCase, secret: string) { this.cases.set(value.id, { value: structuredClone(value), secret }); }
  async save(value: GuidedCase, secret: string) {
    if (this.options.failSave) throw new Error("Could not save this case on this device");
    this.saved.push(structuredClone(value));
    this.seed(value, secret);
  }
  async load(id: string, secret: string) {
    const record = this.cases.get(id);
    if (!record) throw new Error("Case not found");
    if (record.secret !== secret) throw new Error("Unable to unlock this case");
    return structuredClone(record.value);
  }
  async list(): Promise<PrivateCaseSummary[]> { return [...this.cases.values()].map(({ value }) => ({ id: value.id, label: "Private case", updatedAt: value.updatedAt })); }
  async saveEvidence(caseId: string, blobId: string, bytes: Uint8Array) { this.evidence.set(`${caseId}:${blobId}`, bytes.slice()); }
  async loadEvidence(caseId: string, blobId: string) {
    const value = this.evidence.get(`${caseId}:${blobId}`);
    if (!value) throw new Error("Evidence not found");
    return value.slice();
  }
  async delete(id: string) {
    this.cases.delete(id);
    [...this.evidence.keys()].filter((key) => key.startsWith(`${id}:`)).forEach((key) => this.evidence.delete(key));
  }
  async exportEncrypted(id: string) {
    if (!this.cases.has(id)) throw new Error("Case not found");
    return new Blob([JSON.stringify({ id })], { type: "application/vnd.wacha.case+json" });
  }
  async importEncrypted(blob: Blob) {
    const parsed = JSON.parse(await blob.text()) as { id: string };
    if (this.cases.has(parsed.id)) throw new Error("A case with this ID already exists");
    throw new Error("Use IndexedDbCaseRepository for encrypted imports");
  }
}
```

`IndexedDbCaseRepository` opens database version 1 with `cases` and `evidence` object stores. Public case records contain only `id`, literal label `Private case`, `updatedAt`, and the encrypted envelope. Evidence records are keyed by `[caseId, blobId]` and store `sealBytes(bytes, secret)` envelopes; `loadEvidence` opens them through `openBytes`. Convert typed arrays to `ArrayBuffer` before persistence and restore them when loading. Wrap request failures as `Could not save this case on this device`, never update visible success state before transaction completion, and preserve the previous envelope when a write aborts. Export one JSON blob containing the encrypted case envelope and all encrypted evidence envelopes with media type `application/vnd.wacha.case+json`, validate its Zod schema before import, reject duplicate case IDs, and perform deletion in one transaction across both stores.

- [ ] **Step 6: Run storage tests**

Run: `npm.cmd test -- src/features/guided-case/storage/crypto.test.ts src/features/guided-case/storage/indexeddb.test.ts`

Expected: PASS for correct secret, wrong secret, tampering, reload, private listing, save failure, schema rejection, encrypted export/import, evidence deletion, and version-1 migration fixtures.

- [ ] **Step 7: Commit encrypted local persistence**

```bash
git add package.json package-lock.json src/features/guided-case/storage src/features/guided-case/testing.ts
git commit -m "feat: add encrypted device case storage"
```

### Task 7: Accessible guided-intake and storage-choice UI

**Files:**
- Create: `src/features/guided-case/components/guided-intake.tsx`
- Create: `src/features/guided-case/components/guided-intake.test.tsx`
- Create: `src/features/guided-case/components/storage-choice.tsx`
- Create: `src/features/guided-case/components/storage-choice.test.tsx`
- Create: `src/features/guided-case/components/privacy-indicator.tsx`
- Create: `src/features/guided-case/components/privacy-indicator.test.tsx`
- Create: `src/features/guided-case/components/ai-consent.tsx`
- Create: `src/features/guided-case/components/ai-consent.test.tsx`
- Modify: `src/features/concierge/concierge-panel.tsx`
- Modify: `src/app/matters/new/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: journey reducer, narrative boundary, `CaseRepository`, and `buildCasePack`.
- Produces: `<GuidedIntake repository narrativeExtractor initialCase?>`, `<StorageChoice onSessionOnly onDeviceOnly>`, `<PrivacyIndicator caseState onHide>`, and `<AiConsent disclosure onApprove onLocalOnly>`.

- [ ] **Step 1: Write failing interaction tests**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { GuidedIntake } from "./guided-intake";

test("accepts one explanation and shows one relevant question at a time", async () => {
  render(<GuidedIntake repository={new MemoryCaseRepository()} narrativeExtractor={{ extract: async () => ({ people: [], locations: ["Bukoto"], issues: ["succession", "rent-accounting"], confidence: 0.9 }) }} />);
  fireEvent.change(screen.getByLabelText("Tell Wacha what happened"), { target: { value: "Both parents died and my brother collects rent from the Bukoto house." } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(await screen.findByRole("heading", { name: "Is anything unsafe or at risk right now?" })).toBeVisible();
  expect(screen.queryByLabelText(/summary/i)).not.toBeInTheDocument();
  expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
  expect(screen.getByRole("button", { name: "I don't know" })).toBeVisible();
});

test("recalculates the route after an earlier answer is edited", async () => {
  render(<GuidedIntake repository={new MemoryCaseRepository()} narrativeExtractor={{ extract: async () => ({ people: [], locations: [], issues: ["succession"], confidence: 0.9 }) }} />);
  fireEvent.change(screen.getByLabelText("Tell Wacha what happened"), { target: { value: "Both parents died and the estate authority is unclear." } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  fireEvent.click(await screen.findByRole("checkbox", { name: "Nothing urgent" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  fireEvent.click(screen.getByRole("button", { name: "I don't know" }));
  fireEvent.click(screen.getByRole("button", { name: "Edit safety answer" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Threats or intimidation" }));
  fireEvent.click(screen.getByRole("button", { name: "Save answer" }));
  expect(screen.getByRole("heading", { name: /Community Liaison Officer/i })).toBeVisible();
});
```

Import `MemoryCaseRepository` from `../testing`; Task 6 defines its exact `CaseRepository` implementation and exposes the `saved` array used by consent assertions.

- [ ] **Step 2: Write failing storage-choice tests**

```tsx
test("does not persist until the user explicitly chooses device storage", async () => {
  const repository = new MemoryCaseRepository();
  render(<StorageChoice repository={repository} caseState={createReferenceCase()} onContinue={() => undefined} />);
  fireEvent.click(screen.getByRole("button", { name: "Continue for this session" }));
  expect(repository.saved).toHaveLength(0);
});

test("shows a failed save as a failure", async () => {
  const repository = new MemoryCaseRepository({ failSave: true });
  render(<StorageChoice repository={repository} caseState={createReferenceCase()} onContinue={() => undefined} />);
  fireEvent.click(screen.getByRole("button", { name: "Keep this case on this device" }));
  fireEvent.change(screen.getByLabelText("Case passphrase"), { target: { value: "correct horse battery staple" } });
  fireEvent.click(screen.getByRole("button", { name: "Save privately" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not save this case on this device");
  expect(screen.queryByText("Saved on this device")).not.toBeInTheDocument();
});

test("keeps remote AI off until the disclosure is approved", () => {
  const approve = vi.fn();
  render(<AiConsent disclosure={{ purpose: "Organise the first explanation", categories: ["Situation description"], processorLabel: "Configured AI processor", retentionStatement: "No application case record will be retained." }} onApprove={approve} onLocalOnly={() => undefined} />);
  expect(screen.getByText("Remote AI is off")).toBeVisible();
  expect(approve).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Use AI with this information" }));
  expect(approve).toHaveBeenCalledWith(expect.objectContaining({ decision: "approved", categories: ["Situation description"] }));
});

test("shows truthful privacy status without absolute security claims", () => {
  render(<PrivacyIndicator caseState={{ ...createReferenceCase(), storageMode: "device-only", remoteAiEnabled: false }} onHide={() => undefined} />);
  expect(screen.getByText("Private on this device")).toBeVisible();
  expect(screen.getByText("Remote AI is off")).toBeVisible();
  expect(screen.queryByText(/100% secure|unhackable|bank-level/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 3: Run component tests and verify failure**

Run: `npm.cmd test -- src/features/guided-case/components/guided-intake.test.tsx src/features/guided-case/components/storage-choice.test.tsx src/features/guided-case/components/privacy-indicator.test.tsx src/features/guided-case/components/ai-consent.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 4: Implement the guided intake**

`GuidedIntake` uses a reducer around `answerQuestion`, renders a single `<fieldset>` or text input for the current node, and keeps `What Wacha understands` collapsed by default. It calls narrative extraction once after the initial story, displays extracted items as proposed, and requires confirmation before adding them as confirmed facts. It displays the node's reason on demand, supplies an explicit `I don't know` control for every answer kind, and never places story text or facts in navigation URLs.

Single-choice options are submit buttons. Multi-choice questions use checkboxes plus `Continue`. Text, number, and month questions use one labelled input plus `Continue`; their separate `I don't know` button submits `null`. The synthetic fact-confirmation node uses `The facts are correct` as its submit button.

Use the following state boundary:

```ts
type IntakeStage = "story" | "questions" | "confirm" | "storage" | "workspace";
type GuidedIntakeProps = {
  repository: CaseRepository;
  narrativeExtractor: NarrativeExtractor;
  initialCase?: GuidedCase;
};
```

`ConciergePanel` becomes a wrapper that creates the local provider and repository, then renders `GuidedIntake`. `src/app/matters/new/page.tsx` renders the same component inside `AppShell`; remove the department selector and summary textarea.

- [ ] **Step 5: Implement explicit storage choice and privacy copy**

`StorageChoice` presents exactly three actions: `Continue for this session`, `Keep this case on this device`, and a disabled `Wacha account storage is not available yet`. Device storage shows the 12-character passphrase requirement, a shared-device warning, the statement that local storage is not a backup, and a separate statement that remote AI processing may transmit the minimum relevant text. It requests `navigator.storage.persist()` only after device storage is chosen and reports the browser's returned status without claiming persistence when false.

`PrivacyIndicator` derives its label exclusively from `caseState.storageMode`: `Session only`, `Private on this device`, or `Saved to your Wacha account`. Its expanded dashboard shows remote-AI state, last-opened time, privacy receipts, exports and shares recorded in the timeline, and lock/export/delete actions. It never infers privacy from branding or configuration that has not completed successfully.

`AiConsent` displays purpose, categories, configured processor label, and retention statement before approval. `Use AI with this information` creates a content-free `PrivacyReceipt` only after the provider succeeds; `Continue without remote AI` uses the deterministic questionnaire. Cancellation and provider failure leave `remoteAiEnabled` false and create no successful-processing receipt. Name-removal edits produce a new preview and require a fresh affirmative action.

Add a five-minute inactivity timer that calls the same `onHide` path as `Hide now`. The path replaces the case view with a neutral Wacha screen, removes the passphrase and decrypted case from React state, and requires a fresh unlock. Do not place unlock secrets in session storage, local storage, URLs, logs, or analytics.

- [ ] **Step 6: Add responsive and non-colour-only styles**

Add `.journey-shell`, `.journey-progress`, `.question-card`, `.choice-grid`, `.understanding-panel`, `.storage-choice`, `.privacy-warning`, `.privacy-indicator`, `.privacy-dashboard`, `.neutral-lock-screen`, `.status-badge`, and `.case-workspace` rules. Status badges include visible text and icons in addition to colour. The `Hide now` control remains reachable without scrolling while sensitive case content is visible. At `max-width: 580px`, actions stack and every tap target has at least `44px` height. Add `@media print` rules that hide navigation, privacy/storage controls, and edit controls while preserving the deliberately selected case-pack sections.

- [ ] **Step 7: Run component and existing concierge tests**

Run: `npm.cmd test -- src/features/guided-case/components src/features/concierge src/features/workspaces/workspace-pages.test.tsx`

Expected: PASS; update the old concierge test to assert the new initial invitation and preserve emergency wording coverage through the deterministic journey tests.

- [ ] **Step 8: Commit the guided UI**

```bash
git add src/features/guided-case/components src/features/concierge/concierge-panel.tsx src/app/matters/new/page.tsx src/app/globals.css src/features/workspaces/workspace-pages.test.tsx
git commit -m "feat: replace summary form with guided intake"
```

### Task 8: Case workspace, resume, evidence flags, and follow-up

**Files:**
- Create: `src/features/guided-case/components/case-workspace.tsx`
- Create: `src/features/guided-case/components/case-workspace.test.tsx`
- Create: `src/features/guided-case/components/resume-device-case.tsx`
- Create: `src/features/guided-case/components/resume-device-case.test.tsx`
- Create: `src/features/guided-case/components/device-case-list.tsx`
- Create: `src/features/guided-case/components/device-case-list.test.tsx`
- Create: `src/app/matters/[id]/page.tsx`
- Modify: `src/features/guided-case/components/guided-intake.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `CasePack`, `CaseRepository`, evidence functions, and timeline events.
- Produces: `<CaseWorkspace caseState pack repository secret?>`, `<ResumeDeviceCase caseId repository>`, and `<DeviceCaseList repository>`.

- [ ] **Step 1: Write failing workspace safety tests**

```tsx
const NOW = "2026-08-30T14:00:00.000Z";

function caseWithDocumentConcern() {
  const state = createReferenceCase();
  state.risks.push({ id: "document-e-1", kind: "document-authenticity", status: "open", reason: "The document contains conflicting reference numbers.", raisedAt: NOW, resolvedAt: null });
  state.verifications.push({ evidenceId: "e-1", status: "verification-required", reasons: ["The document contains conflicting reference numbers."], checkedAt: NOW, resolvedBy: null });
  return GuidedCaseSchema.parse(state);
}

test("shows a document concern on return and prevents reliance on disputed fields", () => {
  const state = caseWithDocumentConcern();
  render(<CaseWorkspace caseState={state} pack={buildCasePack(state, [], NOW)} repository={new MemoryCaseRepository()} />);
  expect(screen.getByText("Document authenticity concern")).toBeVisible();
  expect(screen.getByText("Verification required before this document is relied on")).toBeVisible();
  expect(screen.getByTestId("rent-total")).not.toHaveTextContent("3,500,000");
});

test("labels generated material stale after a follow-up changes a fact", async () => {
  const state = { ...createReferenceCase(), generatedFromRevision: 0 };
  render(<CaseWorkspace caseState={state} pack={buildCasePack(state, [], NOW)} repository={new MemoryCaseRepository()} />);
  fireEvent.click(screen.getByRole("button", { name: "Record a response" }));
  fireEvent.change(screen.getByLabelText("What changed?"), { target: { value: "The sibling provided a different rent figure." } });
  fireEvent.click(screen.getByRole("button", { name: "Save update" }));
  expect(screen.getByText("Review needed: this pack was created before the latest update")).toBeVisible();
});
```

- [ ] **Step 2: Write failing unlock and deletion tests**

```tsx
test("unlocks a device case without putting the secret or facts in the URL", async () => {
  const repository = new MemoryCaseRepository();
  repository.seed(createReferenceCase(), "correct horse battery staple");
  render(<ResumeDeviceCase caseId="case-1" repository={repository} />);
  fireEvent.change(screen.getByLabelText("Case passphrase"), { target: { value: "correct horse battery staple" } });
  fireEvent.click(screen.getByRole("button", { name: "Unlock case" }));
  expect(await screen.findByRole("heading", { name: "Your case workspace" })).toBeVisible();
  expect(window.location.href).not.toContain("correct");
  expect(window.location.href).not.toContain("Bukoto");
});

test("lists a saved device case without exposing its subject", async () => {
  const repository = new MemoryCaseRepository();
  repository.seed(createReferenceCase(), "correct horse battery staple");
  render(<DeviceCaseList repository={repository} />);
  expect(await screen.findByRole("link", { name: "Open private case" })).toHaveAttribute("href", "/matters/case-1");
  expect(screen.getByText("Private case")).toBeVisible();
  expect(screen.queryByText(/Bukoto|brother|rent/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 3: Run workspace tests and verify failure**

Run: `npm.cmd test -- src/features/guided-case/components/case-workspace.test.tsx src/features/guided-case/components/resume-device-case.test.tsx src/features/guided-case/components/device-case-list.test.tsx`

Expected: FAIL because workspace components do not exist.

- [ ] **Step 4: Implement the workspace sections**

Render these labelled sections from `CasePack`: `What Wacha understands`, `Facts to confirm`, `Rent account`, `Evidence and document checks`, `Draft rent-accounting request`, conditional `Community Liaison Officer brief`, conditional `Administrator General brief`, conditional `Advocate review`, and `Your next steps`. Each fact displays its provenance. Each document displays one of the allowed verification statuses. Screening concerns show their exact reasons and resolution history without displaying accusation language.

Evidence upload calls `inspectUpload`, saves original bytes through the repository evidence store, then records metadata in the case. Screened fields cannot enter the ledger or a letter unless their verification is `source-confirmed` or the user separately confirms the underlying fact from another source.

After an upload, `Check document details` reveals neutral screening fields labelled `Date the document claims`, `Other dates found`, and `Reference numbers found`, with dates and references entered one per line. Submitting converts the lines into `DocumentScreeningInput`, calls `screenDocument`, and applies the result. `I am concerned this document may not be genuine` creates a `verification-required` result with reason `The user requested independent verification of this document.` without accusing any person.

Every export or referral opens a disclosure preview listing contact details, documents, unconfirmed allegations, child or vulnerable-person information, and unrelated family details as separately selectable categories. Optional categories start excluded. Confirming records the selected categories and destination in the timeline; cancelling sends or exports nothing.

- [ ] **Step 5: Implement follow-up events and stale-pack handling**

Provide forms for `letter-delivered`, `meeting-held`, and `response-received`. Saving adds a timeline event, increments case revision, persists when device storage is active, and marks the existing pack stale. Rebuilding the pack requires a fact-confirmation screen and sets `generatedFromRevision` to the current case revision.

- [ ] **Step 6: Implement resume, export, and deletion controls**

The dynamic page receives only `params.id`, passes it to the client resume component, and sets a generic page title. Unlock secrets remain component memory only. `DeviceCaseList` calls `repository.list()`, displays only `Private case` plus `updatedAt`, and links by opaque case ID; render it below the concierge without story previews. `Export encrypted backup` downloads the repository blob; `Print case pack` uses `window.print()`; `Delete this device case` requires the user to type `DELETE`, removes case and evidence records, clears in-memory state, and confirms that previously exported copies cannot be removed by Wacha.

- [ ] **Step 7: Run workspace tests**

Run: `npm.cmd test -- src/features/guided-case/components/case-workspace.test.tsx src/features/guided-case/components/resume-device-case.test.tsx src/features/guided-case/components/device-case-list.test.tsx`

Expected: PASS for provenance, conditional referrals, persistent document flag, excluded disputed values, stale packs, unlock failure, export, and confirmed deletion.

- [ ] **Step 8: Commit the workspace**

```bash
git add src/features/guided-case/components src/app/matters src/app/globals.css
git commit -m "feat: add resumable guided case workspace"
```

### Task 9: Full journey, accessibility, and release verification

**Files:**
- Create: `e2e/guided-succession.spec.ts`
- Modify: `e2e/concierge.spec.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: the complete user-facing journey from Tasks 1–8.
- Produces: browser-level acceptance evidence and accurate local-data documentation.

- [ ] **Step 1: Write the failing reference-journey browser test**

```ts
import { expect, test } from "@playwright/test";

test("guides a succession rent dispute without asking for another summary", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Tell Wacha what happened").fill("Both parents died and my brother collects rent from their Bukoto house but has not shared a full account.");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Is anything unsafe or at risk right now?" })).toBeVisible();
  await expect(page.getByLabel(/summary/i)).toHaveCount(0);
  await completeReferenceJourney(page);
  await expect(page.getByRole("heading", { name: "Your case workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rent account" })).toBeVisible();
  await expect(page.getByText("Unresolved rent-accounting discrepancy")).toBeVisible();
});
```

Define the browser helper with the exact accessible controls established in Task 7:

```ts
async function chooseSingle(page: import("@playwright/test").Page, heading: string | RegExp, option: string) {
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await page.getByRole("button", { name: option, exact: true }).click();
}

async function fillCurrent(page: import("@playwright/test").Page, heading: string, value: string) {
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await page.getByLabel(heading).fill(value);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

async function completeReferenceJourney(page: import("@playwright/test").Page) {
  await page.getByRole("checkbox", { name: "Nothing urgent" }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await chooseSingle(page, "Do you know whether either parent left a will?", "I don't know");
  await chooseSingle(page, "Do you have death certificates or death notifications?", "I don't know");
  await chooseSingle(page, "Has a court granted probate or letters of administration for this estate?", "No");
  await chooseSingle(page, "Which close family members or dependants may need to be included?", "I don't know");
  await page.getByRole("checkbox", { name: "No one I know of" }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await fillCurrent(page, "Where is the rental property?", "Bukoto, Kampala");
  await page.getByRole("checkbox", { name: "Tenancy records" }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await fillCurrent(page, "How many occupied rental units do you know about?", "2");
  await fillCurrent(page, "Who has been collecting the rent?", "My brother");
  await fillCurrent(page, "From which month should the rent account begin?", "2025-05");
  await chooseSingle(page, "Has the collector put any rent figures in writing?", "Yes");
  await chooseSingle(page, "Where was the written statement sent?", "WhatsApp");
  await fillCurrent(page, "Paste the collector's exact words, if you have them", "I collected UGX 1,200,000 each month from the Bukoto house.");
  await fillCurrent(page, "How much rent did the collector say was received each month?", "1200000");
  await page.getByRole("checkbox", { name: "Tenant confirmations" }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await chooseSingle(page, "What would you like Wacha to help you do first?", "Obtain a complete rent account");
  await chooseSingle(page, "Please confirm what Wacha understands.", "The facts are correct");
  await page.getByRole("button", { name: "Continue for this session" }).click();
}
```

- [ ] **Step 2: Add device resume, evidence concern, and deletion browser tests**

Use one browser context so IndexedDB survives reload. Save with a fixed test passphrase, reload, unlock, upload a small generated PDF fixture whose structured details produce conflicting references, assert the persistent neutral concern after another reload, export a backup, delete after typing `DELETE`, and assert the case can no longer be unlocked. Assert that neither the story nor passphrase ever appears in `page.url()`.

Add a low-connectivity test that loads the application, starts the journey, calls `context.setOffline(true)`, answers `safety-now` and `will-known`, and confirms both answers remain visible in `What Wacha understands`. Restore connectivity before the test ends. Add a keyboard test that reaches every control in the current question card with `Tab`, activates `I don't know` with `Enter`, and confirms focus moves to the next question heading.

Add privacy browser tests that verify remote AI is off by default, disclosure approval creates one content-free receipt after a successful provider response, cancellation creates none, `Hide now` removes the story from the DOM and clears the decrypted case, five minutes of simulated inactivity locks the case, recent-case cards and page titles reveal no case topic, and locked-device notification fixtures use only generic wording. Assert that the forbidden phrases `100% secure`, `unhackable`, and `bank-level security` do not appear anywhere in the rendered application.

- [ ] **Step 3: Run the new browser test and verify any remaining failures**

Run: `npm.cmd run test:e2e -- e2e/guided-succession.spec.ts`

Expected: The first run identifies any missing accessible names or persistence wiring; correct those specific product defects before continuing.

- [ ] **Step 4: Update project documentation**

Document the first journey, the three storage choices, the 12-character local passphrase requirement, lack of passphrase recovery, encrypted backup format, separate AI-processing disclosure, supported evidence types and 10 MB limit, neutral document-screening statuses, and commands for unit, E2E, type, lint, and build verification. State explicitly that the app does not file documents or determine authenticity.

- [ ] **Step 5: Run complete verification**

Run each command separately:

```bash
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
```

Expected:

- Vitest: all files and tests pass.
- TypeScript: exit code 0 with no diagnostics.
- ESLint: exit code 0 with no warnings or errors.
- Next.js: production build succeeds and includes `/`, `/matters/new`, and `/matters/[id]`.
- Playwright: existing department/emergency coverage and the new guided journey all pass.

- [ ] **Step 6: Inspect privacy-sensitive output**

Run:

```bash
rg -n "originalStory|passphrase|Bukoto|correct horse" .next src/app --glob "!**/*.map"
```

Expected: no story or passphrase values in generated route metadata, server-rendered HTML fixtures, source maps, or application logs; source-code identifiers such as `originalStory` are acceptable only in bundled implementation code.

- [ ] **Step 7: Commit verification and documentation**

```bash
git add e2e README.md
git commit -m "test: verify guided succession journey"
```

## Final review gate

Before any push or deployment, inspect `git status`, review the full diff from the approved design commit, run the five verification commands again from a clean process, and manually exercise the reference journey at a narrow mobile viewport. Confirm that local data remains after reload, wrong passphrases fail without data leakage, deletion removes the selected case, document concerns persist without accusation language, and the live production site has not changed. Push or deploy only after a separate user approval.
