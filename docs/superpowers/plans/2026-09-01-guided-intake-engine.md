# Guided Intake Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the summary-first matter form with a simple, one-question-at-a-time guided intake covering common issues in all seven Wacha departments.

**Architecture:** A versioned department-module registry supplies issue choices and question graphs to a pure intake engine. A React wizard renders the engine state, keeps the original narrative separate from structured answers, and produces a user-reviewable case summary without inventing facts. Stage 1 uses in-memory state only; durable local storage, locking, consent, evidence, legal citations, risk flags, drafts, and PDFs are delivered by the later approved stages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Zod 4, Vitest 3, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-01-client-intake-risk-package-design.md`

## Global Constraints

- Support the seven existing department identifiers in `src/features/departments/registry.ts`.
- Ask one short question at a time and never require the user to write a second summary.
- Preserve the original narrative separately from structured answers.
- Never invent missing facts, dates, people, evidence, law, deadlines, fees, or advocate review.
- Label user assertions about another party as allegations in the review output.
- Expose missing required answers and conflicts instead of silently resolving them.
- Keep all Stage 1 state in the browser process; do not add remote calls or persistence in this plan.
- Do not add legal citations, risk scoring, evidence uploads, generated documents, or PDF output in Stage 1.
- Use neutral, plain English suitable for an average Ugandan user.
- Node.js must remain `>=20.19.0`; add no production dependency.

---

## File structure

- Create `src/features/intake/model.ts`: Zod schemas and TypeScript contracts for issues, questions, answers, provenance, sessions, and review data.
- Create `src/features/intake/modules.ts`: versioned issue choices and question graphs for all seven departments.
- Create `src/features/intake/engine.ts`: pure functions for session creation, answer updates, routing, progress, and review projection.
- Create `src/features/intake/guided-intake.tsx`: accessible client-side wizard and review screen.
- Create `src/features/intake/model.test.ts`: schema and cross-module contract tests.
- Create `src/features/intake/engine.test.ts`: question-routing, correction, and no-invention tests.
- Create `src/features/intake/guided-intake.test.tsx`: component interaction and accessibility tests.
- Create `src/features/intake/modules.test.ts`: all-seven-department coverage and issue-copy tests.
- Modify `src/app/departments/[id]/page.tsx`: show common issue choices for every department and remove the document generator as the primary action.
- Modify `src/app/matters/new/page.tsx`: read validated query parameters and render `GuidedIntake` instead of a summary textarea.
- Modify `src/features/concierge/concierge-panel.tsx`: send the original narrative and recommended department into the guided route.
- Modify `src/features/matters/schema.ts`: replace the summary-only draft with the structured Stage 1 case snapshot.
- Modify `src/features/matters/store.ts`: accept and return the structured immutable snapshot.
- Modify `src/features/matters/schema.test.ts`: validate structured snapshots and reject unsupported provenance or departments.
- Modify `src/app/globals.css`: add responsive issue-choice, wizard, progress, and review styles.
- Modify `e2e/concierge.spec.ts`: exercise department selection, guided questions, correction, and review.

### Task 1: Define the intake contracts

**Files:**
- Create: `src/features/intake/model.ts`
- Create: `src/features/intake/model.test.ts`
- Modify: `src/features/matters/schema.ts`
- Modify: `src/features/matters/schema.test.ts`
- Modify: `src/features/matters/store.ts`

**Interfaces:**
- Produces: `ProvenanceSchema`, `QuestionSchema`, `IssueModuleSchema`, `DepartmentIntakeModuleSchema`, `IntakeAnswerSchema`, `IntakeSessionSchema`, `CaseReviewSchema`.
- Produces: `IntakeSession`, `IntakeAnswer`, `DepartmentIntakeModule`, `CaseReview`, `MatterDraft`, and `Matter` types.
- `MatterDraft` is the validated `CaseReview` plus `departmentId`, `issueId`, `originalNarrative`, and `moduleVersion`.

- [ ] **Step 1: Write failing model tests**

```ts
import { IntakeSessionSchema, QuestionSchema } from "./model";

test("accepts a short single-choice intake question", () => {
  expect(QuestionSchema.safeParse({
    id: "role",
    prompt: "Are you the landlord or the tenant?",
    kind: "single-choice",
    required: true,
    options: [
      { value: "landlord", label: "Landlord" },
      { value: "tenant", label: "Tenant" },
      { value: "other", label: "Someone else" },
    ],
  }).success).toBe(true);
});

test("rejects answers without provenance", () => {
  const result = IntakeSessionSchema.safeParse({
    id: "case-1",
    departmentId: "employment",
    issueId: "dismissal",
    moduleVersion: "2026-09-01",
    originalNarrative: "I was dismissed yesterday.",
    answers: [{ questionId: "dismissal-date", value: "2026-08-31" }],
    currentQuestionId: "dismissal-date",
    status: "in-progress",
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  });
  expect(result.success).toBe(false);
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm.cmd test -- src/features/intake/model.test.ts src/features/matters/schema.test.ts`

Expected: FAIL because `src/features/intake/model.ts` and the structured matter schema do not exist.

- [ ] **Step 3: Implement the schemas and immutable repository contract**

Create discriminated question kinds `short-text`, `long-text`, `date`, `yes-no`, and `single-choice`. Define answer values as `string | boolean`, provenance as `USER_STATEMENT | USER_ALLEGATION | THIRD_PARTY_STATEMENT`, session status as `in-progress | review-ready`, and timestamps as ISO datetime strings. Use `z.enum(DEPARTMENTS.map(...))` for department validation and `.strict()` on persisted schemas.

```ts
export const IntakeAnswerSchema = z.object({
  questionId: z.string().min(1),
  value: z.union([z.string().trim().min(1).max(2000), z.boolean()]),
  provenance: z.enum(["USER_STATEMENT", "USER_ALLEGATION", "THIRD_PARTY_STATEMENT"]),
  answeredAt: z.string().datetime(),
  revisedAt: z.string().datetime().optional(),
}).strict();

export const MatterDraftSchema = CaseReviewSchema.extend({
  departmentId: DepartmentIdSchema,
  issueId: z.string().min(1),
  moduleVersion: z.string().min(1),
  originalNarrative: z.string().trim().min(10).max(5000),
}).strict();
```

Update `LocalMatterRepository.save` to parse with `MatterDraftSchema`, clone the validated snapshot, add `id` and `createdAt`, and return `Object.freeze(...)`. Do not write to `localStorage` in Stage 1.

- [ ] **Step 4: Run the focused tests**

Run: `npm.cmd test -- src/features/intake/model.test.ts src/features/matters/schema.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the contracts**

```powershell
git add src/features/intake/model.ts src/features/intake/model.test.ts src/features/matters/schema.ts src/features/matters/schema.test.ts src/features/matters/store.ts
git commit -m "feat: define guided intake contracts"
```

### Task 2: Add versioned modules for all departments

**Files:**
- Create: `src/features/intake/modules.ts`
- Create: `src/features/intake/modules.test.ts`
- Modify: `src/features/departments/land-tenancy-issues.ts`

**Interfaces:**
- Consumes: `DepartmentIntakeModule` and `DepartmentId`.
- Produces: `INTAKE_MODULES: Readonly<Record<DepartmentId, DepartmentIntakeModule>>`.
- Produces: `getIntakeModule(departmentId: DepartmentId)` and `getIssueModule(departmentId: DepartmentId, issueId: string)`.

- [ ] **Step 1: Write failing module contract tests**

```ts
import { DEPARTMENTS } from "../departments/registry";
import { getIntakeModule, getIssueModule } from "./modules";

test.each(DEPARTMENTS)("$title has versioned common issues", ({ id }) => {
  const module = getIntakeModule(id);
  expect(module.version).toBe("2026-09-01");
  expect(module.issues.length).toBeGreaterThanOrEqual(4);
  expect(new Set(module.issues.map((issue) => issue.id)).size).toBe(module.issues.length);
  for (const issue of module.issues) {
    expect(issue.questions.length).toBeGreaterThanOrEqual(4);
    expect(issue.questions[0].prompt.length).toBeLessThanOrEqual(100);
  }
});

test("returns no issue for a tampered query parameter", () => {
  expect(getIssueModule("land-tenancy", "not-a-real-issue")).toBeUndefined();
});
```

- [ ] **Step 2: Run the module tests and verify failure**

Run: `npm.cmd test -- src/features/intake/modules.test.ts`

Expected: FAIL because the module registry does not exist.

- [ ] **Step 3: Implement exact common issue choices**

Use these issue identifiers and user-facing titles:

```ts
const ISSUE_TITLES = {
  "land-tenancy": [
    ["inheritance-family-land", "Inheritance and family land"],
    ["land-grabbing-boundaries", "Land grabbing or boundaries"],
    ["rent-tenancy-eviction", "Rent, tenancy, or eviction"],
    ["buying-land-checks", "Buying land and checking documents"],
    ["land-sale-transfer-title", "Land sale, transfer, or title"],
  ],
  "debt-small-claims": [
    ["unpaid-loan", "An unpaid loan"],
    ["goods-services-not-paid", "Goods or services not paid for"],
    ["money-sent-wrong-person", "Money sent or paid by mistake"],
    ["small-claim-demand", "A demand or small claim"],
  ],
  employment: [
    ["dismissal", "Dismissal or forced resignation"],
    ["unpaid-wages", "Unpaid salary, wages, or benefits"],
    ["workplace-treatment", "Unfair treatment or discipline"],
    ["injury-safety", "Workplace injury or unsafe conditions"],
    ["contract-terms", "Employment contract or terms"],
  ],
  "family-succession": [
    ["estate-administration", "Managing a deceased person's estate"],
    ["inheritance-dispute", "Inheritance or beneficiary dispute"],
    ["will-question", "A will or suspected will"],
    ["family-maintenance", "Family maintenance or support"],
    ["guardianship-care", "Guardianship or care of a child"],
  ],
  affidavits: [
    ["name-identity", "Name or identity declaration"],
    ["lost-document", "Lost document declaration"],
    ["relationship-facts", "Relationship or family facts"],
    ["property-ownership", "Property or ownership statement"],
  ],
  "business-commercial": [
    ["contract-dispute", "Business contract dispute"],
    ["partnership-founder", "Partnership or founder disagreement"],
    ["supplier-customer", "Supplier or customer problem"],
    ["company-governance", "Company ownership or management"],
    ["business-agreement", "Preparing a business agreement"],
  ],
  "vehicles-assets": [
    ["buying-vehicle", "Buying a vehicle or asset"],
    ["selling-vehicle", "Selling a vehicle or asset"],
    ["logbook-transfer", "Logbook or ownership transfer"],
    ["payment-possession", "Payment or possession dispute"],
    ["condition-fraud-concern", "Condition or document concern"],
  ],
} as const;
```

Every issue defines four to seven questions using short prompts. Each graph must collect: the user's role, what happened, approximate or exact timing, the other party, steps already taken, desired outcome, and one issue-specific fact. Questions about another person's conduct use `USER_ALLEGATION`; questions about what someone else told the user use `THIRD_PARTY_STATEMENT`; all others use `USER_STATEMENT`.

Branch only through declarative `showWhen: { questionId, equals }`. For example, ask for notice details only when `notice-received` is true. The first question cannot have `showWhen`, and every referenced parent question must appear earlier in the same issue graph.

Export `LAND_TENANCY_ISSUES` from the shared module data or adapt the existing file into a compatibility projection so department cards and tests have one source of truth.

- [ ] **Step 4: Run module and existing land tests**

Run: `npm.cmd test -- src/features/intake/modules.test.ts src/features/departments/land-tenancy-issues.test.ts`

Expected: PASS with seven modules and the existing five land choices unchanged.

- [ ] **Step 5: Commit department modules**

```powershell
git add src/features/intake/modules.ts src/features/intake/modules.test.ts src/features/departments/land-tenancy-issues.ts
git commit -m "feat: add intake modules for all departments"
```

### Task 3: Build the pure question engine

**Files:**
- Create: `src/features/intake/engine.ts`
- Create: `src/features/intake/engine.test.ts`

**Interfaces:**
- Consumes: `DepartmentIntakeModule`, `IssueModule`, `IntakeSession`, and `IntakeAnswer`.
- Produces: `createIntakeSession(input, now, id): IntakeSession`.
- Produces: `answerQuestion(session, issue, input, now): IntakeSession`.
- Produces: `reviseAnswer(session, issue, input, now): IntakeSession`.
- Produces: `getVisibleQuestions(issue, answers): readonly IntakeQuestion[]`.
- Produces: `getCurrentQuestion(session, issue): IntakeQuestion | null`.
- Produces: `getProgress(session, issue): { answered: number; total: number; percent: number }`.
- Produces: `buildCaseReview(session, issue): CaseReview`.

- [ ] **Step 1: Write failing engine tests**

```ts
test("asks one visible unanswered question at a time", () => {
  const session = createIntakeSession({
    departmentId: "employment",
    issueId: "dismissal",
    originalNarrative: "My employer dismissed me after five years.",
  }, "2026-09-01T08:00:00.000Z", "case-1");
  const issue = getIssueModule("employment", "dismissal")!;
  const first = getCurrentQuestion(session, issue);
  expect(first).not.toBeNull();
  const updated = answerQuestion(session, issue, {
    questionId: first!.id,
    value: "Employee",
  }, "2026-09-01T08:01:00.000Z");
  expect(getCurrentQuestion(updated, issue)?.id).not.toBe(first!.id);
});

test("review exposes unanswered fields and never invents them", () => {
  const issue = getIssueModule("employment", "dismissal")!;
  const session = createIntakeSession({
    departmentId: "employment",
    issueId: "dismissal",
    originalNarrative: "My employer dismissed me.",
  }, "2026-09-01T08:00:00.000Z", "case-2");
  const review = buildCaseReview(session, issue);
  expect(review.missingQuestionIds.length).toBeGreaterThan(0);
  expect(JSON.stringify(review)).not.toContain("yesterday");
  expect(JSON.stringify(review)).not.toContain("notice was unlawful");
});
```

- [ ] **Step 2: Run the engine tests and verify failure**

Run: `npm.cmd test -- src/features/intake/engine.test.ts`

Expected: FAIL because engine functions do not exist.

- [ ] **Step 3: Implement deterministic routing and review projection**

Use dependency-injected `now` and `id` values; do not call time or randomness inside pure functions. `answerQuestion` must validate that the question is currently visible, replace an existing answer by `questionId`, set `revisedAt` on corrections, remove descendant answers made invisible by a changed branching answer, and select the next visible unanswered question. Completion changes `status` to `review-ready` only after all visible required questions are answered.

`buildCaseReview` returns the original narrative, an ordered list of labelled answers, `missingQuestionIds`, and an empty `conflicts` array in Stage 1. It must copy answer provenance from the question definition and must not generate narrative facts that were not supplied.

- [ ] **Step 4: Run engine tests**

Run: `npm.cmd test -- src/features/intake/engine.test.ts`

Expected: PASS, including branch invalidation and answer-correction cases.

- [ ] **Step 5: Commit the question engine**

```powershell
git add src/features/intake/engine.ts src/features/intake/engine.test.ts
git commit -m "feat: add deterministic intake question engine"
```

### Task 4: Build the guided intake interface

**Files:**
- Create: `src/features/intake/guided-intake.tsx`
- Create: `src/features/intake/guided-intake.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `departmentId: DepartmentId`, `issueId: string`, `originalNarrative: string`.
- Consumes engine functions from Task 3 and `LocalMatterRepository` from Task 1.
- Produces: `GuidedIntake(props): JSX.Element`.

- [ ] **Step 1: Write failing component tests**

```tsx
async function completeRequiredQuestions(user: ReturnType<typeof userEvent.setup>) {
  while (!screen.queryByRole("button", { name: /review my answers/i })) {
    const fieldset = screen.getByRole("group");
    const radio = within(fieldset).queryAllByRole("radio")[0];
    const textbox = within(fieldset).queryByRole("textbox");
    const date = fieldset.querySelector<HTMLInputElement>('input[type="date"]');
    if (radio) await user.click(radio);
    else if (textbox) await user.type(textbox, "Information supplied by the user");
    else if (date) await user.type(date, "2026-08-31");
    await user.click(screen.getByRole("button", { name: /continue/i }));
  }
}

test("asks one question, advances, and allows correction before save", async () => {
  const user = userEvent.setup();
  render(<GuidedIntake
    departmentId="employment"
    issueId="dismissal"
    originalNarrative="My employer dismissed me after five years."
  />);
  expect(screen.getAllByRole("group")).toHaveLength(1);
  await user.click(screen.getByRole("radio", { name: /employee/i }));
  await user.click(screen.getByRole("button", { name: /continue/i }));
  expect(screen.getByText(/question 2/i)).toBeVisible();
  await completeRequiredQuestions(user);
  await user.click(screen.getByRole("button", { name: /review my answers/i }));
  expect(screen.getByRole("heading", { name: /check your information/i })).toBeVisible();
  expect(screen.getByText(/user allegation/i)).toBeVisible();
  await user.click(screen.getAllByRole("button", { name: /change/i })[0]);
  expect(screen.getByRole("button", { name: /save change/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the component tests and verify failure**

Run: `npm.cmd test -- src/features/intake/guided-intake.test.tsx`

Expected: FAIL because `GuidedIntake` does not exist.

- [ ] **Step 3: Implement the wizard and review UI**

Render the selected issue title, the original explanation in a read-only panel, progress text, exactly one `<fieldset>` per active question, Back and Continue controls, and a Review screen. Use native radio inputs for choice/yes-no questions, `input type="date"` for dates, and text inputs with the schema limits for text. Keep entered-but-not-submitted input local to the current step.

The review groups answers under “What you told us,” labels allegation and third-party provenance visibly, shows “Not answered” for missing optional items, and provides a Change button per answer. The final button reads “Save this case on this device”; in Stage 1 it calls the in-memory repository and states “Saved for this session. Private device storage arrives in the next release stage.” It must not claim durable storage.

Add responsive classes `.intake-shell`, `.intake-progress`, `.intake-question`, `.intake-actions`, `.intake-review`, and `.provenance-label`. Maintain 44px minimum control height, visible focus outlines, and a single-column layout below 720px.

- [ ] **Step 4: Run component and accessibility-focused tests**

Run: `npm.cmd test -- src/features/intake/guided-intake.test.tsx`

Expected: PASS for keyboard-labelled controls, one-question rendering, correction, provenance, and session-only save copy.

- [ ] **Step 5: Commit the guided interface**

```powershell
git add src/features/intake/guided-intake.tsx src/features/intake/guided-intake.test.tsx src/app/globals.css
git commit -m "feat: add one-question guided intake interface"
```

### Task 5: Connect department, concierge, and matter routes

**Files:**
- Modify: `src/app/departments/[id]/page.tsx`
- Modify: `src/app/matters/new/page.tsx`
- Modify: `src/features/concierge/concierge-panel.tsx`
- Modify: `e2e/concierge.spec.ts`

**Interfaces:**
- Department route creates `/matters/new?department=<id>&issue=<issue-id>` links from `INTAKE_MODULES`.
- Matter route validates `department`, `issue`, and optional `narrative` query parameters before rendering `GuidedIntake`.
- Concierge route passes only validated department identity; the original narrative is loaded from the existing `wacha_concierge_narrative` key until Stage 2 replaces persistence.

- [ ] **Step 1: Replace the summary-form E2E test with the guided journey**

```ts
async function answerCurrentQuestion(page: Page) {
  const group = page.getByRole("group");
  const radios = group.getByRole("radio");
  if (await radios.count()) {
    await radios.first().check();
    return;
  }
  const textbox = group.getByRole("textbox");
  if (await textbox.count()) {
    await textbox.fill("Information supplied by the user");
    return;
  }
  await group.locator('input[type="date"]').fill("2026-08-31");
}

test("completes a guided land and tenancy intake", async ({ page }) => {
  await page.goto("/departments/land-tenancy");
  await page.getByRole("link", { name: /rent, tenancy, or eviction/i }).click();
  await expect(page.getByRole("heading", { name: /rent, tenancy, or eviction/i })).toBeVisible();
  await expect(page.getByText(/question 1/i)).toBeVisible();
  await answerCurrentQuestion(page);
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page.getByText(/question 2/i)).toBeVisible();
});

test("offers common issue choices in every department", async ({ page }) => {
  for (const id of ["land-tenancy", "debt-small-claims", "employment", "family-succession", "affidavits", "business-commercial", "vehicles-assets"]) {
    await page.goto(`/departments/${id}`);
    await expect(page.locator(".issue-card")).toHaveCount(await page.locator(".issue-card").count());
    expect(await page.locator(".issue-card").count()).toBeGreaterThanOrEqual(4);
  }
});
```

- [ ] **Step 2: Run E2E and verify the new tests fail**

Run: `npm.cmd run test:e2e -- e2e/concierge.spec.ts`

Expected: FAIL because non-land departments do not show issue choices and `/matters/new` still shows a summary textarea.

- [ ] **Step 3: Implement route integration**

In the department page, load `getIntakeModule(id as DepartmentId)` after `getDepartment` succeeds and render its issue cards for every department. Move legacy document generators below a collapsed “Existing document tools” section so guided intake is the primary path.

Make `src/app/matters/new/page.tsx` a server wrapper that validates search params with `getDepartment` and `getIssueModule`; render a plain recovery screen linking to the correct department if parameters are missing or invalid. Pass the existing concierge narrative through a small client wrapper that reads `wacha_concierge_narrative` only when no safe `narrative` prop is supplied. Do not place the narrative in the URL.

Update concierge links to `/matters/new?department=${department.id}`. If no issue is selected, the matter route sends the user to the department issue chooser rather than guessing an issue.

- [ ] **Step 4: Run focused unit tests and E2E**

Run: `npm.cmd test -- src/features/intake src/features/departments`

Run: `npm.cmd run test:e2e -- e2e/concierge.spec.ts`

Expected: PASS. Every department shows at least four choices, valid choices open the wizard, and invalid query values show recovery guidance without crashing.

- [ ] **Step 5: Commit route integration**

```powershell
git add src/app/departments/[id]/page.tsx src/app/matters/new/page.tsx src/features/concierge/concierge-panel.tsx e2e/concierge.spec.ts
git commit -m "feat: connect guided intake across all departments"
```

### Task 6: Complete Stage 1 verification and documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-09-01-client-intake-risk-package-design.md`

**Interfaces:**
- Documents the Stage 1 boundary and verification commands; introduces no runtime interface.

- [ ] **Step 1: Add the Stage 1 verification checklist to README**

Document the local journey: choose department, choose issue, answer one question at a time, review provenance, correct an answer, and save for the current session. State explicitly that durable private storage, evidence, risk/legal analysis, drafts, and PDFs are not yet part of Stage 1.

- [ ] **Step 2: Mark Stage 1 implementation status in the design spec**

Add a dated implementation-status note that links to this plan and lists the exact Stage 1 boundary. Do not mark the overall specification complete.

- [ ] **Step 3: Run the full automated verification**

Run: `npm.cmd test`

Run: `npm.cmd run typecheck`

Run: `npm.cmd run lint`

Run: `npm.cmd run build`

Run: `npm.cmd run test:e2e`

Expected: every command exits 0. Build output must contain no TypeScript, route, hydration, or static-generation error.

- [ ] **Step 4: Perform a browser acceptance pass**

Verify at 390x844 and 1280x800 viewports:

- All seven department pages show four or more common issues.
- A land/tenancy journey and an employment journey each advance one question at a time.
- Back preserves submitted answers.
- Changing a branching answer removes now-hidden dependent answers.
- Review labels allegations and missing optional information.
- The original narrative is displayed once and never requested again.
- Keyboard focus is visible and every input has an accessible label.
- No screen claims that data is durably saved, legally verified, or advocate-reviewed.

- [ ] **Step 5: Commit Stage 1 documentation**

```powershell
git add README.md docs/superpowers/specs/2026-09-01-client-intake-risk-package-design.md
git commit -m "docs: record guided intake stage verification"
```

- [ ] **Step 6: Stop for the Stage 1 review gate**

Report the exact test, build, browser, and deployment evidence. Do not begin Stage 2 until the user reviews and approves Stage 1.
