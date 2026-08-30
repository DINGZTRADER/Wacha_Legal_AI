# Uganda Legal Library, Amendment Alerts, and Documents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a reviewed Ugandan succession/rental legal source register, daily update discovery, amendment impact controls, private user announcements, and equivalent downloadable DOCX/PDF case documents.

**Architecture:** Source adapters emit normalized discoveries into a versioned legal-content repository. Deterministic review and impact services decide what may publish and suspend dependent templates when law changes; a canonical document model renders both DOCX and PDF from an immutable confirmed-case snapshot. PostgreSQL is the production store, in-memory adapters keep local tests credential-free, and external source access is isolated behind typed interfaces and fixtures.

**Tech Stack:** Next.js 16.3.3, React 19.2.8, TypeScript 5.9, Zod 4, PostgreSQL with `pg` 8.23.0, Cheerio 1.2.0, Fast XML Parser 5.10.1, `docx` 9.7.1, `pdf-lib` 1.17.1, Vitest, Playwright, and secured Vercel Cron.

**Spec:** `docs/superpowers/specs/2026-08-30-uganda-legal-library-alerts-documents-design.md`

## Global Constraints

- Never claim complete Ugandan-law coverage without a dated coverage register proving the exact source set.
- Never treat a bill as an Act or an assented but uncommenced provision as commenced.
- Automated extraction and AI create proposals only; qualified review publishes legal effect, relationships, summaries, and operative templates.
- Preserve every source digest, legal version, review decision, template version, generated document, and correction event.
- A material source change suspends dependent templates until reviewer disposition.
- Locked-device notifications and download names contain no case subject, person, property, allegation, or legal topic.
- Device-only cases do not upload private facts merely to calculate amendment relevance.
- DOCX and PDF derive from the same immutable canonical model and must contain equivalent facts, warnings, citations, and version metadata.
- Every output remains labelled `Draft` until recorded review or execution evidence supports a stronger status.
- Source terms, processor contracts, database credentials, cron secrets, and reviewed legal content are production prerequisites; tests use fixtures and local adapters.
- Tasks 1–7 require the guided-case domain model from `docs/superpowers/plans/2026-08-30-guided-succession-rent-journey.md`; do not wire case relevance or downloads until that plan's confirmed-fact, privacy, lock, and local-storage contracts exist.
- The first public release remains blocked until named legal-content owners and qualified reviewers approve the initial succession/rental source manifest; implementation must not manufacture that approval.

## File structure

- `src/features/legal-library/model.ts` — schemas for sources, versions, amendments, reviews, impacts, and announcements.
- `src/features/legal-library/repository.ts` — legal-library repository interface.
- `src/features/legal-library/memory-repository.ts` — deterministic test/local implementation.
- `src/features/legal-library/postgres-repository.ts` — parameterized PostgreSQL implementation.
- `db/migrations/0001_legal_library.sql` — legal-content, review, impact, and ingestion tables.
- `src/features/legal-library/sources/types.ts` — adapter and normalized discovery contracts.
- `src/features/legal-library/sources/laws-africa.ts` — Laws.Africa/ULII Akoma Ntoso adapter.
- `src/features/legal-library/sources/official-listings.ts` — Parliament/Gazette HTML listing adapter.
- `src/features/legal-library/sources/fixtures/*` — licensed/minimal test fixtures containing no invented legal effect.
- `src/features/legal-library/ingestion.ts` — digesting, deduplication, cursor, and exception handling.
- `src/features/legal-library/review.ts` — state transitions and reviewer audit.
- `src/features/legal-library/impact.ts` — dependency matching and template suspension.
- `src/features/legal-library/monitor.ts` — idempotent multi-adapter monitoring run.
- `src/app/api/legal-updates/check/route.ts` — secured cron endpoint.
- `src/app/legal-updates/page.tsx` — public reviewed-update feed and coverage entry.
- `src/features/legal-library/components/coverage-register.tsx` — exact coverage and gaps.
- `src/features/legal-library/components/legal-update-feed.tsx` — reviewed announcements only.
- `src/features/legal-library/case-relevance.ts` — local topic/version relevance matcher.
- `src/features/documents/model.ts` — canonical document blocks and immutable generation record.
- `src/features/documents/templates/case-pack.ts` — eight reviewed case-pack template functions.
- `src/features/documents/render-docx.ts` — DOCX renderer.
- `src/features/documents/render-pdf.ts` — PDF renderer.
- `src/features/documents/service.ts` — validation, versioning, digests, and download response.
- `src/app/api/documents/generate/route.ts` — explicit-consent document generation endpoint.
- `src/features/guided-case/components/case-workspace.tsx` — download and legal-impact controls.
- `e2e/legal-updates-documents.spec.ts` — coverage, alerts, suspended template, and downloads.
- `vercel.json` — daily secured monitor schedule.
- `.env.example` — `DATABASE_URL`, `CRON_SECRET`, `LAWS_AFRICA_API_TOKEN`, legal-review role-token maps, and legal-index signing/verification key names only.

---

### Task 1: Dependencies and versioned legal-content model

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/features/legal-library/model.ts`
- Create: `src/features/legal-library/model.test.ts`

**Interfaces:**
- Produces: `SourcePublication`, `LegalVersion`, `AmendmentInstruction`, `ContentReview`, `TemplateImpact`, `LegalAnnouncement`, and their Zod schemas.

- [ ] **Step 1: Install pinned runtime and type dependencies**

Run:

```powershell
npm.cmd install pg@8.23.0 cheerio@1.2.0 fast-xml-parser@5.10.1 docx@9.7.1 pdf-lib@1.17.1
npm.cmd install --save-dev @types/pg@8.23.1
```

Expected: lockfile contains the exact versions above. Do not upgrade Fast XML Parser to a newly published version during this plan without a separate compatibility/security review.

- [ ] **Step 2: Write the failing lifecycle model test**

```ts
import { LegalVersionSchema } from "./model";

test("distinguishes publishing workflow from legal lifecycle", () => {
  const value = LegalVersionSchema.parse({
    id: "version-1",
    workId: "/akn/ug/act/2026/10",
    title: "Employment (Amendment) Act, 2026",
    citation: "Act 10 of 2026",
    instrumentType: "act",
    publicationDate: "2026-06-05",
    assentDate: null,
    commencementStatus: "uncommenced",
    effectiveDate: null,
    workflowStatus: "source-confirmed",
    sourcePublicationId: "source-1",
    contentDigest: "a".repeat(64),
    supersedesVersionId: null,
    reviewedAt: null,
  });
  expect(value.workflowStatus).toBe("source-confirmed");
  expect(value.commencementStatus).toBe("uncommenced");
});
```

- [ ] **Step 3: Run the model test and verify failure**

Run: `npm.cmd test -- src/features/legal-library/model.test.ts`

Expected: FAIL because `model.ts` does not exist.

- [ ] **Step 4: Implement exact legal-content schemas**

```ts
import { z } from "zod";

export const WorkflowStatusSchema = z.enum(["discovered", "source-confirmed", "structured", "legal-review-required", "active", "withdrawn"]);
export const CommencementStatusSchema = z.enum(["unknown", "uncommenced", "partly-commenced", "commenced", "repealed"]);

export const SourcePublicationSchema = z.object({
  id: z.string().min(1),
  sourceKind: z.enum(["gazette", "parliament", "ulii", "ministry", "regulator"]),
  sourceOrganisation: z.string().min(1),
  canonicalUrl: z.string().url(),
  retrievedAt: z.string().datetime(),
  contentDigest: z.string().regex(/^[a-f0-9]{64}$/),
  mediaType: z.string().min(1),
  originalObjectKey: z.string().nullable(),
  parserVersion: z.string().min(1),
  retrievalMethod: z.enum(["api", "official-listing", "manual-reviewed-import"]),
  reuseTerms: z.string().min(1),
  knownLimitations: z.array(z.string()),
  extractionWarnings: z.array(z.string()),
});

export const LegalVersionSchema = z.object({
  id: z.string().min(1),
  workId: z.string().min(1),
  title: z.string().min(1),
  citation: z.string().min(1),
  instrumentType: z.enum(["act", "statutory-instrument", "legal-notice", "gazette-supplement"]),
  publicationDate: z.string().date(),
  assentDate: z.string().date().nullable(),
  commencementStatus: CommencementStatusSchema,
  effectiveDate: z.string().date().nullable(),
  workflowStatus: WorkflowStatusSchema,
  sourcePublicationId: z.string().min(1),
  contentDigest: z.string().regex(/^[a-f0-9]{64}$/),
  supersedesVersionId: z.string().nullable(),
  reviewedAt: z.string().datetime().nullable(),
});

export const AmendmentInstructionSchema = z.object({
  id: z.string().min(1),
  amendingVersionId: z.string().min(1),
  targetWorkId: z.string().min(1),
  targetProvision: z.string().nullable(),
  operation: z.enum(["insert", "substitute", "delete", "repeal", "commence"]),
  effectiveDate: z.string().date().nullable(),
  reviewStatus: z.enum(["proposed", "confirmed", "rejected"]),
});

export const ContentReviewSchema = z.object({ id: z.string().min(1), entityType: z.enum(["version", "amendment", "announcement", "template"]), entityId: z.string().min(1), decision: z.enum(["approve", "reject", "withdraw", "no-impact"]), reviewerId: z.string().min(1), reason: z.string().min(1), decidedAt: z.string().datetime() });
export const TemplateImpactSchema = z.object({ id: z.string().min(1), legalVersionId: z.string().min(1), templateId: z.string().min(1), status: z.enum(["review-required", "suspended", "updated", "republished", "unaffected"]), reason: z.string().min(1), recordedAt: z.string().datetime() });
export const LegalAnnouncementSchema = z.object({ id: z.string().min(1), legalVersionId: z.string().min(1), title: z.string().min(1), citation: z.string().min(1), publicationDate: z.string().date(), summary: z.string().min(1), affectedTopics: z.array(z.string()), sourceUrl: z.string().url(), commencementLabel: z.string().min(1), publishedAt: z.string().datetime(), reviewedAt: z.string().datetime(), reviewId: z.string().min(1) });

export type SourcePublication = z.infer<typeof SourcePublicationSchema>;
export type LegalVersion = z.infer<typeof LegalVersionSchema>;
export type AmendmentInstruction = z.infer<typeof AmendmentInstructionSchema>;
export type ContentReview = z.infer<typeof ContentReviewSchema>;
export type TemplateImpact = z.infer<typeof TemplateImpactSchema>;
export type LegalAnnouncement = z.infer<typeof LegalAnnouncementSchema>;
```

- [ ] **Step 5: Run tests and commit**

Run: `npm.cmd test -- src/features/legal-library/model.test.ts`

Expected: PASS for valid lifecycle combinations and rejection of missing source, digest, citation, or review identifiers.

```bash
git add package.json package-lock.json src/features/legal-library/model.ts src/features/legal-library/model.test.ts
git commit -m "feat: add legal library domain model"
```

### Task 2: Repository contract and PostgreSQL migration

**Files:**
- Create: `src/features/legal-library/repository.ts`
- Create: `src/features/legal-library/memory-repository.ts`
- Create: `src/features/legal-library/memory-repository.test.ts`
- Create: `src/features/legal-library/postgres-repository.ts`
- Create: `db/migrations/0001_legal_library.sql`
- Modify: `.env.example`

**Interfaces:**
- Consumes: Task 1 schemas.
- Produces: `LegalLibraryRepository`, `MemoryLegalLibraryRepository`, and `PostgresLegalLibraryRepository`.

- [ ] **Step 1: Write failing idempotency and history tests**

```ts
test("deduplicates one source digest and preserves superseded versions", async () => {
  const repository = new MemoryLegalLibraryRepository();
  await repository.saveSource(sourceFixture, sourceFixtureBytes);
  await repository.saveSource(sourceFixture, sourceFixtureBytes);
  expect(await repository.listSources()).toHaveLength(1);
  expect(await repository.getSourceOriginal(sourceFixture.id)).toEqual(sourceFixtureBytes);
  await repository.saveVersion(firstVersionFixture);
  await repository.saveVersion({ ...secondVersionFixture, supersedesVersionId: firstVersionFixture.id });
  expect(await repository.listVersions(firstVersionFixture.workId)).toHaveLength(2);
});
```

- [ ] **Step 2: Define the repository contract**

```ts
export interface LegalLibraryRepository {
  runInTransaction<T>(operation: (repository: LegalLibraryRepository) => Promise<T>): Promise<T>;
  saveSource(value: SourcePublication, originalBytes: Uint8Array): Promise<"created" | "existing">;
  getSourceOriginal(id: string): Promise<Uint8Array | null>;
  listSources(): Promise<SourcePublication[]>;
  saveVersion(value: LegalVersion): Promise<"created" | "existing">;
  getVersion(id: string): Promise<LegalVersion | null>;
  listVersions(workId?: string): Promise<LegalVersion[]>;
  saveAmendments(values: AmendmentInstruction[]): Promise<void>;
  listAmendments(targetWorkId: string): Promise<AmendmentInstruction[]>;
  saveReview(value: ContentReview): Promise<void>;
  saveImpacts(values: TemplateImpact[]): Promise<void>;
  listImpacts(legalVersionId: string): Promise<TemplateImpact[]>;
  saveAnnouncement(value: LegalAnnouncement): Promise<"created" | "existing">;
  listAnnouncements(): Promise<LegalAnnouncement[]>;
  getCursor(adapterId: string): Promise<string | null>;
  setCursor(adapterId: string, cursor: string): Promise<void>;
}
```

- [ ] **Step 3: Implement memory storage and run tests**

Use maps keyed by IDs plus a unique `sourceKind:contentDigest` index. Return structured clones, sort announcements newest-first, and reject a superseding version whose referenced prior version is absent.

Run: `npm.cmd test -- src/features/legal-library/memory-repository.test.ts`

Expected: PASS for deduplication, history, missing superseded version, announcement uniqueness, and cursors.

- [ ] **Step 4: Create the SQL migration and PostgreSQL adapter**

```sql
BEGIN;
CREATE TABLE legal_source_publication (
  id text PRIMARY KEY,
  source_kind text NOT NULL,
  canonical_url text NOT NULL,
  content_digest char(64) NOT NULL,
  payload jsonb NOT NULL,
  original_bytes bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_kind, content_digest)
);
CREATE TABLE legal_version (
  id text PRIMARY KEY,
  work_id text NOT NULL,
  workflow_status text NOT NULL,
  content_digest char(64) NOT NULL,
  supersedes_version_id text REFERENCES legal_version(id),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (work_id, content_digest)
);
CREATE INDEX legal_version_work_idx ON legal_version(work_id, created_at DESC);
CREATE TABLE legal_amendment (id text PRIMARY KEY, target_work_id text NOT NULL, payload jsonb NOT NULL);
CREATE TABLE legal_review (id text PRIMARY KEY, entity_type text NOT NULL, entity_id text NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE legal_template_impact (id text PRIMARY KEY, legal_version_id text NOT NULL REFERENCES legal_version(id), template_id text NOT NULL, status text NOT NULL, payload jsonb NOT NULL, UNIQUE (legal_version_id, template_id));
CREATE TABLE legal_announcement (id text PRIMARY KEY, legal_version_id text NOT NULL REFERENCES legal_version(id), payload jsonb NOT NULL, published_at timestamptz NOT NULL, UNIQUE (legal_version_id));
CREATE TABLE legal_ingestion_cursor (adapter_id text PRIMARY KEY, cursor_value text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
COMMIT;
```

The PostgreSQL adapter uses one `pg.Pool`, parameterized queries only, Zod parsing on every read, and `runInTransaction` backed by one checked-out client with `BEGIN`/`COMMIT`/`ROLLBACK`. The memory adapter snapshots its maps and restores them on failure. `saveSource` recomputes the SHA-256 digest over `originalBytes`, rejects a mismatch, and stores an immutable copy; `getSourceOriginal` returns a copy. Add variable names without values to `.env.example`.

- [ ] **Step 5: Commit repository infrastructure**

```bash
git add src/features/legal-library/repository.ts src/features/legal-library/memory-repository.ts src/features/legal-library/memory-repository.test.ts src/features/legal-library/postgres-repository.ts db/migrations/0001_legal_library.sql .env.example
git commit -m "feat: add legal content repositories"
```

### Task 3: Normalized official-source adapters

**Files:**
- Create: `src/features/legal-library/sources/types.ts`
- Create: `src/features/legal-library/sources/laws-africa.ts`
- Create: `src/features/legal-library/sources/official-listings.ts`
- Create: `src/features/legal-library/sources/sources.test.ts`
- Create: `src/features/legal-library/sources/fixtures/laws-africa-page.json`
- Create: `src/features/legal-library/sources/fixtures/parliament-acts.html`
- Create: `src/features/legal-library/sources/fixtures/ulii-gazettes.html`

**Interfaces:**
- Produces: `LegalSourceAdapter`, `SourceDiscovery`, `LawsAfricaAdapter`, and `OfficialListingAdapter`.

- [ ] **Step 1: Write failing normalization tests**

```ts
test("normalizes an Act without converting an uncommenced provision to active law", async () => {
  const adapter = new LawsAfricaAdapter({ token: "test", fetch: fixtureFetch("laws-africa-page.json") });
  const page = await adapter.listSince(null);
  expect(page.items[0]).toMatchObject({ workId: "/akn/ug/act/2026/10", instrumentType: "act", commencementStatus: "uncommenced" });
});

test("Parliament listing keeps bills and Acts in separate discovery kinds", async () => {
  const adapter = new OfficialListingAdapter(parliamentConfig, fixtureFetch("parliament-acts.html"));
  const page = await adapter.listSince(null);
  expect(page.items.filter((item) => item.discoveryKind === "act")).toHaveLength(1);
  expect(page.items.filter((item) => item.discoveryKind === "bill")).toHaveLength(1);
});

function fixtureFetch(fileName: "laws-africa-page.json" | "parliament-acts.html" | "ulii-gazettes.html"): typeof fetch {
  return async () => new Response(readFixture(fileName), { status: 200, headers: { "content-type": fileName.endsWith(".json") ? "application/json" : "text/html" } });
}
```

- [ ] **Step 2: Define adapter contracts**

```ts
export type SourceDiscovery = {
  adapterId: string;
  discoveryKind: "act" | "bill" | "statutory-instrument" | "gazette";
  workId: string | null;
  title: string;
  citation: string | null;
  sourceUrl: string;
  publicationDate: string | null;
  commencementStatus: "unknown" | "uncommenced" | "partly-commenced" | "commenced";
  rawMediaType: string;
};
export interface LegalSourceAdapter {
  readonly id: string;
  listSince(cursor: string | null): Promise<{ items: SourceDiscovery[]; nextCursor: string }>;
  fetchOriginal(item: SourceDiscovery): Promise<{ bytes: Uint8Array; mediaType: string }>;
}
```

- [ ] **Step 3: Implement Laws.Africa/ULII structured ingestion**

Use `https://api.laws.africa/v3/` with bearer token from `LAWS_AFRICA_API_TOKEN`, Uganda FRBR paths only, request timeouts through `AbortSignal.timeout(15000)`, a 20 MB response cap, and an allowlist of `api.laws.africa` plus source URLs under approved ULII/media hosts. Parse JSON metadata and Akoma Ntoso XML with `processEntities: false`; reject `DOCTYPE`/`ENTITY` declarations before parsing, and never infer commencement when metadata is absent. `readFixture` is a test-only helper defined in `sources.test.ts` with `readFile(new URL(\`./fixtures/${fileName}\`, import.meta.url), "utf8")`; production adapters never read fixture paths.

- [ ] **Step 4: Implement official HTML listing ingestion**

Use Cheerio on inert response text. Config declares the allowed host, list URL, link selector, title extractor, date extractor, and whether the list contains Acts, bills, or gazettes. Resolve URLs against the configured origin and reject another host. Selectors returning zero items create an adapter error instead of a successful empty update.

- [ ] **Step 5: Run fixture tests and commit**

Run: `npm.cmd test -- src/features/legal-library/sources/sources.test.ts`

Expected: PASS for Act/bill separation, uncommenced status, URL allowlist, timeout, oversized file, empty-selector failure, and pagination cursor.

```bash
git add src/features/legal-library/sources
git commit -m "feat: add Ugandan legal source adapters"
```

### Task 4: Idempotent ingestion and coverage register

**Files:**
- Create: `src/features/legal-library/ingestion.ts`
- Create: `src/features/legal-library/ingestion.test.ts`
- Create: `src/features/legal-library/components/coverage-register.tsx`
- Create: `src/features/legal-library/components/coverage-register.test.tsx`
- Create: `src/app/legal-updates/page.tsx`

**Interfaces:**
- Consumes: adapters and repository.
- Produces: `ingestDiscovery`, `runAdapter`, `CoverageEntry`, and `<CoverageRegister entries>`.

- [ ] **Step 1: Write failing digest and failed-check tests**

```ts
test("does not advance the cursor when source retrieval fails", async () => {
  const repository = new MemoryLegalLibraryRepository();
  await expect(runAdapter(failingAdapter, repository, fixedClock)).rejects.toThrow("Source check failed");
  expect(await repository.getCursor(failingAdapter.id)).toBeNull();
});

test("reports exact reviewed coverage and known gaps", () => {
  render(<CoverageRegister entries={[activeEntry, missingTextEntry]} checkedAt="2026-08-30T15:00:00.000Z" />);
  expect(screen.getByText("1 active reviewed source")).toBeVisible();
  expect(screen.getByText("1 known gap")).toBeVisible();
  expect(screen.queryByText(/all Ugandan law/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Implement ingestion**

```ts
export async function sha256(bytes: Uint8Array) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (value) => value.toString(16).padStart(2, "0")).join("");
}

export async function runAdapter(adapter: LegalSourceAdapter, repository: LegalLibraryRepository, now: () => string) {
  return repository.runInTransaction(async (transaction) => {
    const cursor = await transaction.getCursor(adapter.id);
    const page = await adapter.listSince(cursor);
    const results: Array<{ url: string; status: "created" | "existing" }> = [];
    for (const item of page.items) {
      const original = await adapter.fetchOriginal(item);
      const digest = await sha256(original.bytes);
      const source = SourcePublicationSchema.parse({ id: crypto.randomUUID(), sourceKind: item.discoveryKind === "gazette" ? "gazette" : item.adapterId.includes("parliament") ? "parliament" : "ulii", sourceOrganisation: item.adapterId, canonicalUrl: item.sourceUrl, retrievedAt: now(), contentDigest: digest, mediaType: original.mediaType, originalObjectKey: null, parserVersion: "1.0.0", retrievalMethod: item.adapterId.includes("laws-africa") ? "api" : "official-listing", reuseTerms: "Recorded from adapter configuration; review before publication", knownLimitations: [], extractionWarnings: [] });
      results.push({ url: item.sourceUrl, status: await transaction.saveSource(source, original.bytes) });
    }
    await transaction.setCursor(adapter.id, page.nextCursor);
    return results;
  });
}
```

The adapter configuration supplies the reviewed source-specific reuse-terms record used in production; the literal test value above is fixture-only and must be rejected by the production configuration schema. Discovered bills remain source publications but never become `LegalVersion` records.

- [ ] **Step 3: Build the coverage UI and route**

Show title, citation, source organisation/link, publication date, commencement label, consolidated/review date, workflow status, last checked time, and known gaps. The route displays reviewed announcements first and coverage beneath; it never renders raw unreviewed summaries to citizens.

- [ ] **Step 4: Run tests and commit**

Run: `npm.cmd test -- src/features/legal-library/ingestion.test.ts src/features/legal-library/components/coverage-register.test.tsx`

Expected: PASS for digest dedupe, failed cursor, bill exclusion, gaps, inaccessible source, and no complete-coverage claim.

```bash
git add src/features/legal-library/ingestion.ts src/features/legal-library/ingestion.test.ts src/features/legal-library/components/coverage-register.tsx src/features/legal-library/components/coverage-register.test.tsx src/app/legal-updates/page.tsx
git commit -m "feat: add legal source coverage register"
```

### Task 5: Review workflow, amendment impact, and template suspension

**Files:**
- Create: `src/features/legal-library/review.ts`
- Create: `src/features/legal-library/review.test.ts`
- Create: `src/features/legal-library/impact.ts`
- Create: `src/features/legal-library/impact.test.ts`
- Create: `src/features/documents/template-registry.ts`
- Create: `src/app/api/legal-admin/reviews/route.ts`
- Create: `src/app/api/legal-admin/reviews/route.test.ts`
- Create: `src/app/api/legal-admin/publish/route.ts`
- Create: `src/app/api/legal-admin/publish/route.test.ts`

**Interfaces:**
- Produces: `reviewVersion`, `publishVersion`, `confirmAmendment`, `calculateTemplateImpacts`, `TemplateRegistry`, and `assertTemplateAvailable`.

- [ ] **Step 1: Write failing publication-gate tests**

```ts
test("cannot activate a version without review and authoritative source", async () => {
  await expect(reviewVersion(unreviewedVersion, { decision: "approve", reviewerId: "", reason: "checked", decidedAt: NOW })).rejects.toThrow("Reviewer identity is required");
});

test("publisher must be recorded and separate from the legal reviewer", () => {
  const reviewed = reviewVersion(sourceConfirmedVersion, approvedReview);
  expect(() => publishVersion(reviewed.version, reviewed.review, approvedReview.reviewerId, NOW)).toThrow("Publisher must be different from reviewer");
  expect(publishVersion(reviewed.version, reviewed.review, "publisher-2", NOW).workflowStatus).toBe("active");
});

test("material amendment suspends every dependent template", () => {
  const impacts = calculateTemplateImpacts(confirmedAmendment, [{ templateId: "rent-accounting-request", dependencies: [{ workId: confirmedAmendment.targetWorkId, provisions: ["section-273"] }] }], NOW);
  expect(impacts).toEqual([expect.objectContaining({ templateId: "rent-accounting-request", status: "suspended" })]);
  expect(() => assertTemplateAvailable("rent-accounting-request", impacts)).toThrow("Template requires legal review");
});
```

- [ ] **Step 2: Implement explicit state transitions**

`reviewVersion` accepts only `source-confirmed`, `structured`, or `legal-review-required`; approval requires reviewer ID, reason, authoritative URL, citation, and commencement decision, then returns the reviewed version plus immutable review record without activating it. Rejection returns `withdrawn`. `publishVersion` alone returns `active`; it requires a non-empty publisher ID different from the reviewer ID and records publication time and publisher in the audit event. `confirmAmendment` cannot confirm a missing target work or an amendment with no source evidence.

- [ ] **Step 3: Add separate authenticated reviewer and publisher operations**

Expose no staff page and no public review capability. The two POST routes accept schema-validated IDs and decisions only, set `Cache-Control: no-store`, redact bodies from logs, and resolve the caller identity/role from a random bearer token in `LEGAL_REVIEWER_TOKENS_JSON` or `LEGAL_PUBLISHER_TOKENS_JSON`; caller-supplied reviewer or publisher IDs are rejected. Compare token hashes in constant time, reject absent/short tokens, enforce distinct people, and keep token values out of responses and audit records. Reviewer and publisher token maps are separate environment secrets; `.env.example` contains names and JSON shape only. Tests inject token resolvers rather than mutating production environment state. Production exposure is additionally restricted to the approved staff network at the platform firewall before activation.

- [ ] **Step 4: Implement dependency impact**

```ts
export type TemplateDependency = { workId: string; provisions: string[] };
export type RegisteredTemplate = { templateId: string; version: string; status: "active" | "suspended"; dependencies: TemplateDependency[] };

export function calculateTemplateImpacts(amendment: AmendmentInstruction, templates: readonly RegisteredTemplate[], now: string): TemplateImpact[] {
  if (amendment.reviewStatus !== "confirmed") return [];
  return templates.filter((template) => template.dependencies.some((dependency) => dependency.workId === amendment.targetWorkId && (amendment.targetProvision === null || dependency.provisions.includes(amendment.targetProvision)))).map((template) => ({ id: `${amendment.id}:${template.templateId}`, legalVersionId: amendment.amendingVersionId, templateId: template.templateId, status: "suspended", reason: `Confirmed amendment ${amendment.id} may affect a declared dependency.`, recordedAt: now }));
}
```

- [ ] **Step 5: Run tests and commit**

Run: `npm.cmd test -- src/features/legal-library/review.test.ts src/features/legal-library/impact.test.ts src/app/api/legal-admin/reviews/route.test.ts src/app/api/legal-admin/publish/route.test.ts`

Expected: PASS for reviewer identity, reviewer/publisher separation, source evidence, invalid transitions, missing target, provision matching, suspension, no-impact review, and republishing.

```bash
git add src/features/legal-library/review.ts src/features/legal-library/review.test.ts src/features/legal-library/impact.ts src/features/legal-library/impact.test.ts src/features/documents/template-registry.ts src/app/api/legal-admin/reviews src/app/api/legal-admin/publish .env.example
git commit -m "feat: gate legal updates and document templates"
```

### Task 6: Scheduled monitoring and secured cron endpoint

**Files:**
- Create: `src/features/legal-library/monitor.ts`
- Create: `src/features/legal-library/monitor.test.ts`
- Create: `src/app/api/legal-updates/check/route.ts`
- Create: `src/app/api/legal-updates/check/route.test.ts`
- Modify: `vercel.json`

**Interfaces:**
- Produces: `runLegalMonitor(adapters, repository, clock)` and authenticated `GET /api/legal-updates/check`.

- [ ] **Step 1: Write failing authorization and idempotency tests**

```ts
test("rejects a cron call without the configured bearer secret", async () => {
  const response = await GET(new Request("http://local/api/legal-updates/check"));
  expect(response.status).toBe(401);
});

test("second monitor run creates no duplicate discovery", async () => {
  const first = await runLegalMonitor([fixtureAdapter], repository, fixedClock);
  const second = await runLegalMonitor([fixtureAdapter], repository, fixedClock);
  expect(first.created).toBe(1);
  expect(second.created).toBe(0);
});
```

- [ ] **Step 2: Implement monitor isolation and reporting**

Run adapters serially to respect source limits. Record start/end, per-adapter counts, cursor, failure, and duration. One adapter failure leaves its cursor unchanged, records the failure, and does not prevent later adapters from running. The endpoint compares `Authorization` to `Bearer ${process.env.CRON_SECRET}` using a constant-time comparison, rejects an absent/short secret, and returns counts without source contents.

- [ ] **Step 3: Add the daily production schedule**

Merge this property into the existing `vercel.json` without removing the Python API rewrite:

```json
"crons": [{ "path": "/api/legal-updates/check", "schedule": "15 2 * * *" }]
```

This requests one run daily at 02:15 UTC; documentation must say scheduler timing is not guaranteed and failures are not automatically retried. Monitoring alerts must report a missed/failed run.

- [ ] **Step 4: Run tests and commit**

Run: `npm.cmd test -- src/features/legal-library/monitor.test.ts src/app/api/legal-updates/check/route.test.ts`

Expected: PASS for missing secret, wrong secret, duplicate run, partial adapter failure, cursor preservation, and response redaction.

```bash
git add src/features/legal-library/monitor.ts src/features/legal-library/monitor.test.ts src/app/api/legal-updates/check vercel.json
git commit -m "feat: schedule legal update monitoring"
```

### Task 7: Reviewed announcements and privacy-safe case relevance

**Files:**
- Create: `src/features/legal-library/announcements.ts`
- Create: `src/features/legal-library/announcements.test.ts`
- Create: `src/features/legal-library/case-relevance.ts`
- Create: `src/features/legal-library/case-relevance.test.ts`
- Create: `src/features/legal-library/signed-index.ts`
- Create: `src/features/legal-library/signed-index.test.ts`
- Create: `src/app/api/legal-updates/index/route.ts`
- Create: `src/app/api/legal-updates/index/route.test.ts`
- Create: `src/features/legal-library/components/legal-update-feed.tsx`
- Create: `src/features/legal-library/components/legal-update-feed.test.tsx`
- Modify: `src/features/guided-case/components/case-workspace.tsx`

**Interfaces:**
- Produces: `publishAnnouncement`, `createSignedUpdateIndex`, `verifySignedUpdateIndex`, `matchLocalCase`, and `<LegalUpdateFeed announcements>`.

- [ ] **Step 1: Write failing announcement tests**

```ts
test("publishes once only after legal review", async () => {
  await expect(publishAnnouncement(activeVersion, null, repository, NOW)).rejects.toThrow("Reviewed announcement required");
  const first = await publishAnnouncement(activeVersion, approvedAnnouncementReview, repository, NOW);
  const second = await publishAnnouncement(activeVersion, approvedAnnouncementReview, repository, NOW);
  expect(first).toBe("created");
  expect(second).toBe("existing");
});

test("locked notification contains no topic or case fact", () => {
  expect(buildLockedNotification()).toEqual({ title: "Wacha legal update", body: "Ugandan law connected to one of your saved cases has changed. Unlock Wacha to review it." });
});
```

- [ ] **Step 2: Implement publication and local matching**

Announcements require an active legal version and approved announcement review. The server route emits canonical JSON `{ issuedAt, expiresAt, entries: [{ legalVersionId, affectedTopics, templateIds }] }` plus a detached Ed25519 signature created with `LEGAL_INDEX_SIGNING_PRIVATE_KEY`; it never returns the private key. The client pins `NEXT_PUBLIC_LEGAL_INDEX_VERIFY_KEY`, rejects an invalid/expired signature before matching, and retains the last valid unexpired index during a network failure. `matchLocalCase` consumes only that verified index and local case metadata `{ topics, generatedTemplateIds, citedVersionIds }`; it returns matching IDs without sending case metadata to a server.

- [ ] **Step 3: Implement the feed and case notice**

The public feed displays title, citation, source link, publication date, commencement label, reviewed plain-language summary, affected topics, and review date. The case workspace stores only matching announcement IDs and acknowledgement time in device-only mode. Locked UI and browser titles remain generic.

- [ ] **Step 4: Run tests and commit**

Run: `npm.cmd test -- src/features/legal-library/announcements.test.ts src/features/legal-library/signed-index.test.ts src/features/legal-library/case-relevance.test.ts src/features/legal-library/components/legal-update-feed.test.tsx src/app/api/legal-updates/index/route.test.ts`

Expected: PASS for review gate, deduplication, uncommenced label, signed-index rejection, local-only matching, generic lock notice, and acknowledgement.

```bash
git add src/features/legal-library/announcements.ts src/features/legal-library/announcements.test.ts src/features/legal-library/signed-index.ts src/features/legal-library/signed-index.test.ts src/features/legal-library/case-relevance.ts src/features/legal-library/case-relevance.test.ts src/features/legal-library/components/legal-update-feed.tsx src/features/legal-library/components/legal-update-feed.test.tsx src/app/api/legal-updates/index src/features/guided-case/components/case-workspace.tsx
git commit -m "feat: announce reviewed Ugandan legal updates"
```

### Task 8: Canonical case documents and all eight reviewed case-pack outputs

**Files:**
- Create: `src/features/documents/model.ts`
- Create: `src/features/documents/model.test.ts`
- Create: `src/features/documents/templates/case-pack.ts`
- Create: `src/features/documents/templates/case-pack.test.ts`
- Create: `src/features/documents/templates/rent-accounting-request.ts`
- Create: `src/features/documents/templates/rent-accounting-request.test.ts`
- Create: `src/features/documents/template-registry.ts`

**Interfaces:**
- Consumes: confirmed guided-case snapshot, rent ledger, legal versions, and template availability.
- Produces: `CanonicalDocument`, `GenerationRecord`, `buildCasePackDocuments(input)`, and `buildRentAccountingRequest(input)`.

- [ ] **Step 1: Write the failing confirmed-fact and status tests**

```ts
test("rejects unconfirmed facts and always labels the first output Draft", () => {
  expect(() => buildRentAccountingRequest({ ...validInput, recipientName: { value: "Brother", provenance: "ai-proposal" } })).toThrow("recipientName must be confirmed or a recorded third-party statement");
  expect(buildRentAccountingRequest(validInput).statusLabel).toBe("Draft");
});

test("includes template and law version metadata", () => {
  const document = buildRentAccountingRequest(validInput);
  expect(document.metadata).toMatchObject({ templateId: "rent-accounting-request", templateVersion: "1.0.0", reviewRequirement: "recommended" });
  expect(document.legalSources).toEqual([expect.objectContaining({ versionId: "succession-version-1", sourceUrl: expect.stringMatching(/^https:/) })]);
});

test("builds the complete eight-document pack and activates conditional briefs only when relevant", () => {
  const documents = buildCasePackDocuments({ ...validInput, communityLiaisonActivated: true, administratorGeneralActivated: true });
  expect(documents.map((value) => value.metadata.templateId)).toEqual([
    "case-summary",
    "rent-ledger",
    "evidence-index",
    "rent-accounting-request",
    "community-liaison-brief",
    "administrator-general-brief",
    "advocate-handover",
    "action-plan",
  ]);
});
```

- [ ] **Step 2: Define the canonical model**

```ts
export type DocumentBlock =
  | { kind: "heading"; level: 1 | 2; text: string }
  | { kind: "paragraph"; text: string; emphasis?: "normal" | "warning" }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "signature"; label: string };

export type CanonicalDocument = {
  id: string;
  caseSnapshotId: string;
  title: string;
  statusLabel: "Draft";
  blocks: DocumentBlock[];
  legalSources: Array<{ versionId: string; citation: string; effectiveDate: string | null; sourceUrl: string }>;
  unresolvedFacts: string[];
  exhibits: Array<{ exhibitId: string; label: string; contentDigest: string }>;
  requiredExecutionSteps: string[];
  metadata: { templateId: string; templateVersion: string; lawReviewedOn: string; contentReviewId: string; reviewRequirement: "optional" | "recommended" | "required"; supersedesDocumentId: string | null };
};
```

- [ ] **Step 3: Implement the eight reviewed template functions**

`buildCasePackDocuments` must produce, in stable order:

1. case summary and confirmed-fact schedule;
2. month-by-month rent ledger and unresolved discrepancy schedule;
3. evidence and exhibit index;
4. request for a complete account of estate rent and supporting records;
5. Community Liaison Officer factual incident brief, marked `Not activated` when its confirmed risk predicate is false;
6. Administrator General complaint/referral brief, marked `Not activated` when its confirmed pathway predicate is false;
7. advocate handover brief and review checklist; and
8. sequenced action plan.

The two conditional briefs remain in the complete pack so the user can see why they are or are not relevant, but only an activated brief may be downloaded alone. Every builder accepts the same immutable case snapshot and returns a fresh `CanonicalDocument`; none reads mutable UI state. The rent-accounting request contains addressee, subject, neutral background, requested accounting period, monthly ledger table, requested supporting records, response date supplied by the user, unresolved facts, non-accusatory closing, sender, and review warning. Outputs may state `unresolved rent-accounting discrepancy`; they must never insert fraud, theft, forgery, legal entitlement, court filing, advocate identity, or practising-certificate claims from inference.

- [ ] **Step 4: Run tests and commit**

Run: `npm.cmd test -- src/features/documents/model.test.ts src/features/documents/templates/case-pack.test.ts src/features/documents/templates/rent-accounting-request.test.ts`

Expected: PASS for all eight outputs, stable ordering, conditional activation, provenance, missing recipient, long names, multi-month table, exhibits, execution steps, unresolved facts, suspended templates, source metadata, supersession, and prohibited claims.

```bash
git add src/features/documents/model.ts src/features/documents/model.test.ts src/features/documents/templates src/features/documents/template-registry.ts
git commit -m "feat: add reviewed succession and rent case pack"
```

### Task 9: Equivalent DOCX and PDF rendering with private downloads

**Files:**
- Create: `src/features/documents/render-docx.ts`
- Create: `src/features/documents/render-docx.test.ts`
- Create: `src/features/documents/render-pdf.ts`
- Create: `src/features/documents/render-pdf.test.ts`
- Create: `src/features/documents/service.ts`
- Create: `src/features/documents/service.test.ts`
- Create: `src/app/api/documents/generate/route.ts`
- Create: `src/app/api/documents/generate/route.test.ts`
- Modify: `src/features/guided-case/components/case-workspace.tsx`

**Interfaces:**
- Consumes: `CanonicalDocument` and explicit disclosure consent.
- Produces: `renderDocx`, `renderPdf`, `generateDocumentPair`, and private generation response.

- [ ] **Step 1: Write failing equivalence tests**

```ts
test("renders the same canonical text and metadata to both formats", async () => {
  const pair = await generateDocumentPair(canonicalFixture, fixedClock);
  expect(pair.docx.mediaType).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  expect(pair.pdf.mediaType).toBe("application/pdf");
  expect(pair.docx.canonicalDigest).toBe(pair.pdf.canonicalDigest);
  expect(pair.docx.fileName).toBe("wacha-draft-rent-accounting-request-v1.docx");
  expect(pair.pdf.fileName).toBe("wacha-draft-rent-accounting-request-v1.pdf");
});

test("renders every case-pack output in both formats", async () => {
  const documents = buildCasePackDocuments(referenceCasePackInput);
  const pairs = await Promise.all(documents.map((document) => generateDocumentPair(document, fixedClock)));
  expect(pairs).toHaveLength(8);
  expect(pairs.every((pair) => pair.docx.canonicalDigest === pair.pdf.canonicalDigest)).toBe(true);
});
```

- [ ] **Step 2: Implement DOCX rendering**

Map headings to `docx.HeadingLevel`, paragraphs to `Paragraph/TextRun`, tables to fixed header rows plus data rows, warnings to shaded paragraphs, and signatures to labelled blank lines. Add footer text containing `Draft`, template version, law-review date, document ID, and page numbering. Return `Packer.toBuffer(document)` as `Uint8Array`.

- [ ] **Step 3: Implement PDF rendering**

Use `pdf-lib` with embedded standard fonts, A4 pages, 54-point margins, deterministic wrapping, repeated table headers, page breaks, and footer metadata identical to DOCX. Reject an unbreakable line wider than the printable page instead of clipping it. Do not fetch fonts at generation time.

- [ ] **Step 4: Implement generation record and route**

`generateDocumentPair` hashes canonical JSON with stable key order, renders both formats, hashes each binary, and returns immutable generation metadata. The route accepts only schema-validated confirmed document input plus `{ storageMode, disclosureApproved }`; device-only remote rendering requires `disclosureApproved: true`, does not create a server case, sets `Cache-Control: no-store`, and never logs body content. Return one requested format per call to limit memory. File names contain type/version only.

- [ ] **Step 5: Run tests and commit**

Run: `npm.cmd test -- src/features/documents/render-docx.test.ts src/features/documents/render-pdf.test.ts src/features/documents/service.test.ts src/app/api/documents/generate/route.test.ts`

Expected: PASS for all eight outputs, MIME, equivalent canonical digest, binary digests, page breaks, long tables, missing variables, suspended template, denied disclosure, no-store headers, and neutral file names.

```bash
git add src/features/documents/render-docx.ts src/features/documents/render-docx.test.ts src/features/documents/render-pdf.ts src/features/documents/render-pdf.test.ts src/features/documents/service.ts src/features/documents/service.test.ts src/app/api/documents/generate src/features/guided-case/components/case-workspace.tsx
git commit -m "feat: generate private DOCX and PDF drafts"
```

### Task 10: End-to-end, document, privacy, and operational verification

**Files:**
- Create: `e2e/legal-updates-documents.spec.ts`
- Create: `data/legal-library/initial-source-manifest.json`
- Create: `data/legal-library/initial-source-manifest.schema.json`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-08-30-uganda-legal-library-alerts-documents-design.md` only if verified implementation limits require a factual clarification.

**Interfaces:**
- Consumes: Tasks 1–9.
- Produces: release evidence for coverage, monitoring, review, alerts, and downloads.

- [ ] **Step 1: Add browser acceptance tests**

Test one reviewed active Act, one uncommenced Act, one bill excluded from announcements, one known gap, one confirmed amendment that suspends the rent template, one republished template, one generic locked-device notice, one device-local relevance match, and successful DOCX/PDF downloads after fact/disclosure confirmation.

- [ ] **Step 2: Add binary and visual document QA**

For the reference fixture, download both files, assert ZIP/DOCX and PDF magic bytes, non-zero size, expected content digests, and absence of unresolved template tokens matching `{{[^}]+}}`. Open the DOCX with the available office renderer, export/render it to PDF, render every page of both PDFs to images, and inspect headings, tables, warnings, page breaks, signature lines, and footer metadata. Record the exact renderer versions in the verification output.

- [ ] **Step 3: Exercise monitor failure modes**

Run fixture checks for timeout, malformed XML, altered Parliament selectors, changed digest, duplicate source, database rollback, missing cron secret, partial adapter failure, and a missed-run alert. Verify no failed run advances its source cursor or marks coverage current.

- [ ] **Step 4: Build and approve the initial source manifest**

Using the real adapters and authoritative source pages, create a manifest covering only the succession, estate-administration, rental-property, evidence, police Community Liaison, and data-protection sources actually required by the reference journey. Every entry records canonical URL, source organisation, citation, content digest, retrieval date, reuse-terms record, commencement state, known gaps, legal-review ID, reviewer identity, publisher identity, and status. Schema validation rejects missing review/publisher separation, fixture URLs, localhost URLs, unsupported claims, and an `active` entry without retained original bytes and review evidence. A qualified reviewer and separate publisher must approve each active entry; otherwise keep it visibly `legal-review-required`. This step may block public activation but must not be bypassed or filled with invented legal conclusions.

- [ ] **Step 5: Update operational documentation**

Document source hierarchy, exact initial coverage, source terms, reviewer roles, daily schedule in UTC, Vercel no-retry behavior, manual recheck, correction/withdrawal, template suspension, database migration, backup/restore, environment variables, privacy behavior, local relevance, and document QA. State that monitoring is daily and not instant.

- [ ] **Step 6: Run the complete verification suite**

Run separately:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
```

Expected: all unit/integration tests pass; TypeScript and ESLint have no diagnostics; the production build includes `/legal-updates`, `/api/legal-updates/check`, and `/api/documents/generate`; Playwright passes; both documents open and render; no production credential is required for fixture tests.

- [ ] **Step 7: Audit prohibited claims and sensitive output**

Run:

```powershell
rg -n "all Ugandan law|court-grade|legally binding|100% secure|unhackable|bank-level|practising certificate" src README.md
rg -n "Bukoto|brother|inheritance|rent dispute" .next/server --glob "!**/*.map"
```

Expected: no unsupported status/security claims and no reference-case facts in route metadata, notifications, logs, or file names. Approved explanatory text may say the product does **not** make a prohibited claim.

- [ ] **Step 8: Commit verification work**

```bash
git add e2e/legal-updates-documents.spec.ts data/legal-library/initial-source-manifest.json data/legal-library/initial-source-manifest.schema.json README.md docs/superpowers/specs/2026-08-30-uganda-legal-library-alerts-documents-design.md
git commit -m "test: verify legal updates and document downloads"
```

## Final review gate

Before push or deployment, review the complete diff from design commit `03d4ae9`, rerun the full verification suite from a clean process, apply the migration only to an approved non-production database, and execute one fixture-only scheduled monitor run. Confirm that no source adapter uses unapproved credentials or terms, no legal content is published without review, suspended templates cannot generate, device-only case facts remain local during relevance matching, and both downloads match the confirmed snapshot. Production database migration, source credentials, cron activation, push, and deployment each require separate approval.
