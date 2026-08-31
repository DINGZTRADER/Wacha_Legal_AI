# Wacha Legal AI Client Intake and Risk-Flag Package Design

**Status:** Approved design  
**Date:** 2026-09-01  
**Scope:** All seven Wacha Legal AI departments  
**Primary output:** User-reviewable downloadable PDF

## 1. Purpose

Wacha Legal AI will guide an average Ugandan through a legal problem without requiring them to compose a formal case summary. The user explains the situation once by voice or text. Wacha then asks one short, relevant question at a time, organises the answers, identifies information requiring attention, cites potentially relevant Ugandan law, and prepares a reviewable case package and draft document where appropriate.

The package is an intake and handover aid. It is not a legal ruling, proof that an allegation is true, proof that a document is authentic, or a substitute for an enrolled advocate.

## 2. Product decisions

- Support all seven existing departments through one shared package model with department-specific questions, legal sources, risk rules, and draft templates.
- Store cases and evidence on the user's device by default.
- Require explicit, granular consent before remote AI processing or sharing.
- Show risk flags to users in calm, plain language.
- Generate PDF only in the first release.
- Include uploaded documents as annexed PDF pages, subject to supported-format and safety checks.
- Mark every generated package and document as Draft and requiring user or advocate review.
- Use private filenames that contain no personal name, allegation, or case category.

## 3. User journey

1. The user selects a department and a common issue.
2. The user explains the situation once by voice or text.
3. Wacha asks one short, context-sensitive question at a time.
4. The user may upload supporting documents or photographs.
5. Wacha separates user statements, allegations, third-party statements, document-derived statements, missing information, and AI suggestions.
6. Wacha displays potentially relevant Ugandan legal sources and plain-language risk flags.
7. The user reviews and corrects the completed case summary.
8. Wacha prepares an appropriate draft document where the collected facts support one.
9. The user downloads one Draft PDF containing the intake package, any draft document, the evidence inventory, and eligible uploaded-document annexes.
10. Nothing is shared externally unless the user gives specific consent and confirms the final share action.

The flow must save progress after every answer, support back-and-correct actions, and avoid asking the user to repeat information already supplied.

## 4. Shared case model

Each case package must use a common schema across departments:

- Case reference, department, issue type, creation time, update time, package version, and privacy state.
- Original narrative or voice transcription.
- Structured answers with question identifier, answer, creation time, update history, and provenance.
- People and organisations with user-stated roles.
- Event timeline with exact, approximate, disputed, or unknown date precision.
- Desired outcome and steps already taken.
- Missing information and conflicts.
- Risk flags and their triggers.
- Legal sources and legal-library version.
- Evidence inventory and annex eligibility.
- Generated draft documents.
- Consent receipts and sharing history.

Every material statement must carry one provenance label:

- `USER_STATEMENT`: directly stated by the user.
- `USER_ALLEGATION`: a claim about another person or organisation that has not been independently established.
- `THIRD_PARTY_STATEMENT`: information attributed to someone else.
- `DOCUMENT_STATEMENT`: text or information extracted from user-provided evidence.
- `SYSTEM_INFERENCE`: a reversible AI-generated interpretation.
- `VERIFIED_SOURCE`: a proposition supported by a reviewed legal or official source.

The application must never silently turn an allegation, document statement, or system inference into an established fact.

## 5. Department modules

The shared engine will load a versioned module for each department. A module defines:

- Common issue choices.
- Question graph and skip logic.
- Required and optional information.
- Emergency and urgency triggers.
- Relevant source topics and citation requirements.
- Appropriate draft-document types.
- Department-specific PDF sections.

Modules must exist for the current seven departments: Land and Tenancy, Debt Claims, Employment, Family and Succession, Affidavits, Business, and Vehicles. Coverage may vary by issue, but the interface must disclose when a question path, legal source, or draft type is not yet supported.

## 6. Risk flags

Risk flags are guidance, not legal conclusions. Users see three levels:

- **Attention:** important missing information, inconsistency, or recommended follow-up.
- **Urgent:** a time-sensitive or escalating issue that should be reviewed promptly.
- **Emergency:** an immediate safety concern or situation requiring emergency services or urgent professional assistance.

Every flag must display:

- A short plain-language title.
- Why the flag appeared.
- The user answer or evidence metadata that triggered it.
- A safe recommended next step.
- Whether legal-source or advocate verification is still required.

Flags must not automatically declare that a crime occurred, a deadline was missed, a legal violation is proven, a remedy is available, or a document is fake. Where immediate danger is indicated, Wacha may show safety guidance without preventing the user from saving or downloading the case.

## 7. Legal sources and amendment status

Potentially relevant Ugandan law must be presented separately from case facts. Each citation should include, where available:

- Act or instrument title.
- Section or provision.
- Source publisher and source URL.
- Retrieval or review date.
- Effective or amendment status.
- Legal-library version used by the package.

Wacha must not claim comprehensive coverage of all Ugandan laws until that coverage has been independently audited. If a source is missing, unavailable, conflicting, or possibly outdated, Wacha must preserve the case, suppress unsupported conclusions, and explain what needs verification.

## 8. Evidence handling

The evidence inventory records:

- Neutral display name.
- Original filename retained only inside the protected case.
- User-selected document type and description.
- Upload or capture time.
- Claimed source and relevant date, if supplied.
- File size, media type, page count where available, and cryptographic integrity fingerprint.
- Processing status, warnings, duplicate relationship, and annex eligibility.

Uploaded evidence must be labelled **“User-provided—authenticity not independently verified.”** Automated checks may identify unreadable content, mismatched metadata, duplicate files, visible alteration indicators, or other inconsistencies, but must not call a document fake.

Files are checked for supported type, size, corruption, malware risk, duplicates, and renderability. Unsupported, unsafe, or unreadable evidence remains in the inventory with a warning but is not embedded. Original source bytes and fingerprints must not be altered by OCR, compression, or PDF assembly; derived previews and extracted text are separate records.

## 9. PDF package

The PDF uses a fixed Wacha-branded layout and contains:

1. Cover page marked **“Draft — User Review Required.”**
2. Case reference, department, issue type, creation date, package version, and privacy status.
3. User-approved plain-language case summary.
4. Event timeline.
5. People and organisations with stated roles.
6. Desired outcome and steps already taken.
7. Unanswered questions and conflicting information.
8. User-visible risk flags and recommended next steps.
9. Potentially relevant Ugandan laws and source-status warnings.
10. Evidence inventory.
11. Generated draft document where appropriate.
12. Consent record describing what the user approved for sharing.
13. Eligible uploaded evidence as labelled annexes.
14. Advocate-review checklist.

Every page includes the Draft status, neutral case reference, page number, and package version. The default filename follows `Wacha-Case-Package-YYYYMMDD.pdf` and contains no personal or case-sensitive text.

Large or unsupported annex sets must not cause silent data loss. The app should explain which items were excluded and may generate a separate evidence bundle if a single package cannot be produced safely within device limits.

## 10. Privacy and consent

Local Private Mode is the default. The interface states: **“Your case is saved on this device unless you choose to share it.”**

Required protections:

- A Hide Now control that immediately conceals case content.
- Automatic lock after inactivity using the user's PIN or supported device authentication.
- Neutral notification text without names, case types, allegations, or document titles.
- Shared-device and device-loss warnings with export, lock, and delete choices.
- Confirmed deletion of locally stored case data and evidence.
- Remote AI disabled until purpose-specific consent is provided.

Before sharing, the user reviews the recipient, purpose, selected content, intended access period, and limitations on withdrawal. Sharing choices are granular: summary only, complete package, or selected evidence. No advocate or Wacha service receives a package automatically; the final transfer requires a distinct **“Confirm and share”** action.

The app stores a content-free privacy receipt containing consent time, recipient identifier, purpose, selected package version or evidence identifiers, and withdrawal state. Withdrawal prevents future access where technically possible but cannot recall copies already downloaded by a recipient; the interface must explain this before sharing.

## 11. Draft documents and advocate boundary

Draft generation is allowed only when the selected module defines a supported document type and the minimum required information is present. Drafts must:

- Use only reviewed user answers and clearly identified placeholders.
- Avoid invented names, dates, fees, deadlines, facts, evidence, legal conclusions, or advocate credentials.
- Identify allegations as allegations where relevant.
- Carry the Draft and review-required label.
- Cite legal authority only when available from the reviewed legal library.
- State which issues require advocate confirmation.

The package is useful to a user before advocate involvement and structured for later advocate handover. Advocate review must not be represented as completed unless an identifiable enrolled advocate actually performed and recorded that review.

## 12. Failure behaviour

- Save valid progress before presenting recoverable errors.
- If voice transcription fails, retain the audio locally and offer retry or text entry without fabricating a transcript.
- If AI or legal-source services are unavailable, allow continued intake, review, local storage, and export of clearly incomplete material.
- If PDF generation fails, preserve the case and identify the failed stage without deleting uploads.
- If an annex cannot be rendered, list it with a warning rather than omitting it silently.
- If storage capacity is low, warn before accepting large evidence and offer a safe export path.
- Never expose sensitive case content in URLs, analytics events, logs, crash reports, filenames, or notifications.

## 13. Verification requirements

Every release must include:

- Unit tests for provenance, question routing, risk rules, consent states, filename privacy, and PDF section selection.
- Contract tests for all seven department modules.
- Tests ensuring missing data is never invented and allegations never become facts.
- Evidence tests for supported types, corruption, duplicates, fingerprints, warnings, annex ordering, and original-byte preservation.
- PDF tests for branding, Draft labels, citations, pagination, annex labels, and neutral filenames.
- Privacy tests for local-first defaults, locking, Hide Now, deletion, consent, withdrawal, offline behaviour, and shared-device safeguards.
- Accessibility and visual tests on mobile and desktop, including long names, Luganda text, unusual characters, large annexes, and low-memory conditions.
- A successful production build, browser journey verification, and live-deployment verification before release completion is reported.

## 14. Acceptance criteria

The feature is acceptable when a user can complete an intake in any of the seven departments, review and correct the structured case, understand visible risk flags, attach evidence, see provenance and legal-source limitations, generate a private Draft PDF with eligible annexes, and keep everything local unless they explicitly consent to sharing.

No flow may require the user to write a second summary, silently share information, treat an allegation as proven, claim a document is authentic or fake, or imply advocate review that did not occur.

## 15. Explicit exclusions

This design does not introduce an advocate marketplace, escrow payments, automatic court filing, automatic police reporting, authentication claims for uploaded documents, or comprehensive-law-coverage claims. Those capabilities require separate approval, legal review, and implementation specifications.
