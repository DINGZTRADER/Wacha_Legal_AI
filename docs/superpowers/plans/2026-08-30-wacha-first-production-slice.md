# Wacha First Production Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a deployable, accessible Wacha application with two workspaces, a safe adaptive Concierge, seven department routes, matter capture, and an initial document workflow.

**Architecture:** A feature-oriented Next.js application keeps rules and domain types independent from UI. Typed server/provider boundaries are production-shaped while local adapters keep tests credential-free.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Zod, Vitest, Testing Library, Playwright, ESLint.

**Spec:** `docs/superpowers/specs/2026-08-30-wacha-legal-ai-platform-design.md`

## Global Constraints

- Uganda-only, English-first, and translation-ready.
- Never claim unverified legal, filing, witnessing, commissioning, or advocate status.
- Deterministic safety rules override AI routing.
- No production credentials are required to build or test.
- Provider boundaries are typed and replaceable.
- Journeys are keyboard-accessible and responsive.

---

### Task 1: Foundation and design system

**Files:** Create `package.json`, Next/TypeScript/lint configs, `src/app/{layout,page,globals.css}`, `src/components/layout/app-shell.tsx`; test `app-shell.test.tsx`.

**Interfaces:** `AppShellProps { children: ReactNode; audience: "citizen" | "advocate" }`.

- [ ] Write a failing test that renders `<AppShell audience="citizen">Dashboard</AppShell>` and expects a banner, main content, skip link, and legal-information disclosure.
- [ ] Run `npm test -- src/components/layout/app-shell.test.tsx`; expect missing-module failure.
- [ ] Scaffold strict Next.js, Tailwind, Vitest, Testing Library, accessible tokens, shared Button, responsive shell, audience switcher, and footer.
- [ ] Run `npm run lint && npm run typecheck && npm test`; expect PASS.
- [ ] Commit with `git commit -m "feat: establish application foundation"`.

### Task 2: Departments and deterministic routing

**Files:** Create `src/features/departments/{types,registry}.ts`, `src/features/concierge/routing.ts`; test `routing.test.ts`.

**Interfaces:** `routeNarrative(input: string): { departmentId: DepartmentId | null; confidence: number; reasons: string[]; needsClarification: boolean }`.

- [ ] Test that landlord text routes to `land-tenancy`, dismissal to `employment`, and vague text requires clarification.
- [ ] Run `npm test -- src/features/concierge/routing.test.ts`; expect missing-function failure.
- [ ] Register seven departments with audience copy, actions, and keyword groups; implement normalized scored routing with an explicit threshold and reasons.
- [ ] Run the focused test; expect all departments, ties, and vague input to PASS.
- [ ] Commit with `git commit -m "feat: add department routing"`.

### Task 3: Safety engine and adaptive Concierge

**Files:** Create `src/features/concierge/{types,safety,workflow}.ts`, `concierge-panel.tsx`; test `safety.test.ts` and `workflow.test.ts`.

**Interfaces:** `assessSafety(facts: IntakeFacts): SafetyAssessment`; `advanceConversation(state, answer): ConciergeState`. Safety levels are `standard | recommended-review | mandatory-review | emergency`.

- [ ] Test emergency violence language, criminal exposure, imminent deadlines, contested estates, ordinary contract questions, contradiction detection, and resumable state.
- [ ] Run focused tests; expect missing-module failures.
- [ ] Implement pure rule evaluation, typed questions, answer validation, fact confirmation, routing explanation, browser persistence adapter, and accessible one-question-at-a-time UI.
- [ ] Run focused tests plus typecheck; expect PASS.
- [ ] Commit with `git commit -m "feat: add safe adaptive concierge"`.

### Task 4: Workspaces, matters, and initial document

**Files:** Create `src/app/{citizen,advocate,departments/[id],matters/new}/page.tsx`; create `src/features/matters/{schema,store}.ts`, `src/features/documents/{land-inquiry,render}.ts`; tests beside each feature.

**Interfaces:** `MatterDraftSchema`; `MatterRepository.save(draft): Promise<Matter>`; `renderLandInquiry(facts): DocumentPreview`.

- [ ] Test separate workspace navigation, valid/invalid matter drafts, immutable saved snapshots, required land facts, unresolved-issue warnings, version/date metadata, and forbidden status claims.
- [ ] Run focused tests; expect failure.
- [ ] Implement responsive dashboards, department pages, Zod matter schema, local repository adapter, and a reviewed land due-diligence inquiry/checklist assembled only from deterministic sections.
- [ ] Run tests, lint, and typecheck; expect PASS.
- [ ] Commit with `git commit -m "feat: add matters and first document workflow"`.

### Task 5: Provider contracts and production-safe configuration

**Files:** Create `src/lib/config/env.ts`, `src/providers/{ai,payments,notifications,storage}/{types,local}.ts`, `.env.example`; add provider contract tests.

**Interfaces:** `AiProvider.classify`, `PaymentProvider.createCheckout`, `NotificationProvider.send`, and `StorageProvider.putPrivate`, each with typed success/failure results and idempotency keys where applicable.

- [ ] Write contract tests for deterministic local adapters, invalid configuration, duplicate payment keys, and redacted errors.
- [ ] Run provider tests; expect failure.
- [ ] Implement Zod environment validation and credential-free adapters that never simulate a completed real payment or legal review.
- [ ] Run tests and typecheck; expect PASS.
- [ ] Commit with `git commit -m "feat: add provider boundaries"`.

### Task 6: End-to-end verification and delivery documentation

**Files:** Create `e2e/concierge.spec.ts`, `e2e/workspaces.spec.ts`, `playwright.config.ts`, `README.md`, `.github/workflows/ci.yml`.

**Interfaces:** Verifies the public user journeys produced by Tasks 1-5.

- [ ] Write Playwright tests for citizen routing, emergency escalation, saved matter/document preview, advocate entry, mobile viewport, and keyboard navigation.
- [ ] Run `npm run test:e2e`; confirm failures identify missing integration.
- [ ] Wire pages to feature modules, add accessible errors/loading/empty states, document setup and provider activation, and create CI for lint, types, unit tests, build, and E2E.
- [ ] Run `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e`; expect all PASS.
- [ ] Inspect `git diff --check`, scan for unsupported legal claims and secrets, then commit with `git commit -m "test: verify production slice"`.

