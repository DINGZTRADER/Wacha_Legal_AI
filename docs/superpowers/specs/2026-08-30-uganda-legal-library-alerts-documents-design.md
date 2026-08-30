# Uganda Legal Library, Amendment Alerts, and Downloadable Documents Design

## Status

Approved product direction recorded as a separate workstream from the first guided succession and rent journey. The first journey uses a reviewed subset of this system; national corpus expansion proceeds without blocking the usable citizen workflow.

## Goal

Give Wacha versioned, source-linked Ugandan legislation; detect new Acts, amendments, statutory instruments, commencement events, repeals, and gazette publications; notify affected users without exposing case details; and generate editable DOCX plus fixed PDF documents from confirmed facts and reviewed templates.

Wacha must never claim that it contains every Ugandan law unless a coverage register proves that claim for a defined date and source set.

## Source hierarchy

The legal library records source type and authority separately from convenience copies.

1. Uganda Gazette and authorised Government Printer publications are the primary publication evidence for Acts, statutory instruments, legal notices, commencement, and official supplements.
2. Parliament of Uganda supplies assented Acts, bills, dates, and parliamentary publications, but a bill is never treated as enacted law.
3. ULII supplies structured, source-linked legislation, consolidations, amendment histories, uncommenced provisions, and gazette access through the Uganda Judiciary's law-reporting service.
4. Ministry, regulator, court, and agency publications supplement the corpus only for instruments within their authority and retain their original source link.

Each source adapter records its retrieval method, permitted use, licence or reuse terms where applicable, last successful check, and known limitations. A copied document never loses its authoritative source citation.

## Coverage register

The public-facing coverage register answers `What law does Wacha currently know?` It includes title, legislation type, citation, source URL, publication date, assent date when applicable, commencement status, effective date, latest consolidated date, amendment history, last checked time, content availability, review status, and known gaps.

Coverage statuses are `discovered`, `source-confirmed`, `structured`, `legal-review-required`, `active`, `superseded`, `repealed`, `uncommenced`, and `withdrawn`. A document can have more than one legal lifecycle property, but only one publishing workflow status. The interface explains the difference between enactment, commencement, amendment, consolidation, and repeal in plain language.

The product reports exact coverage numbers and dates rather than `all laws`. Missing text, inaccessible gazettes, unresolved amendment relationships, and conflicting source metadata appear in an internal exception queue and, where relevant, the public coverage note.

## Ingestion and monitoring

Source adapters run on a scheduled daily check, with a manual recheck available to authorised legal-content staff. The system may check more frequently where a reliable official feed permits it, but it does not promise instant publication.

For every discovered item, ingestion stores:

- canonical source URL and source organisation;
- retrieval time and content digest;
- original file bytes where permitted;
- title, citation, instrument type, dates, and identifiers;
- raw extracted text as a derived artefact;
- parser version and extraction warnings;
- relationships proposed by structured parsing; and
- difference from the last known source version.

Network failures, changed page structure, duplicate publications, corrected gazettes, and conflicting dates create reviewable events. Failed checks never mark the corpus current. Repeated discovery of identical content is deduplicated by canonical identifier and digest.

## Legal version and relationship model

Every law is temporal. The model preserves the text and status applicable at a particular date rather than overwriting one `current` record.

Core records include source publication, legal work, expression/version, provision, commencement event, amendment instruction, repeal event, consolidation, citation alias, related instrument, content review, template impact, announcement, and ingestion run.

Relationships record which Act or instrument amends another, the affected provisions, the operation performed, the effective or commencement date, and the evidence source. Automated parsing creates proposals only. A qualified reviewer confirms material relationships before they change citizen guidance or document templates.

Historical cases and generated documents remain linked to the exact legal versions used at generation time. Later amendments do not rewrite an old document; they create an impact notice and a new document version if the user chooses to update it.

## Verification workflow

The publishing sequence is:

1. `Discovered` — the monitor found a new or changed source.
2. `Source confirmed` — source identity, digest, citation, and dates were validated.
3. `Structured` — provisions and amendment relationships were parsed.
4. `Legal review` — a designated reviewer confirms commencement, relationships, summary, and affected product content.
5. `Published` — the version can support user explanations, alerts, and reviewed templates.

Wacha may show a neutral `Source update under review` notice for a material official publication, but it does not announce legal effect, change user advice, or reactivate a template until review is complete.

All review decisions are auditable. Emergency withdrawal immediately disables affected summaries, rules, and templates while retaining their history and explaining that review is required.

## Impact engine

Every questionnaire rule, explanation, citation, clause, template, and eligibility decision declares the legal provisions and versions it depends on. Publishing a confirmed legal change computes the affected product records.

Impact statuses are `unaffected`, `review-required`, `suspended`, `updated`, and `republished`. Material changes automatically suspend affected downloadable documents until a reviewer confirms an updated template or explicitly records why no change is required. The engine must not use generative AI alone to approve operative legal clauses.

Saved cases receive an impact event only when their confirmed facts, chosen pathway, generated document, or cited rule depends on the changed law. The event does not automatically change the user's facts or legal conclusion.

## Amendment and new-Act announcements

The in-app `New Ugandan Laws` feed shows verified publications using title, citation, publication date, commencement status, plain-language summary, affected topics, authoritative source link, legal-review date, and any uncommenced or uncertain effect.

Case-specific notices say only what is supported, for example: `A reviewed amendment may affect the rent-accounting document created for this case.` Locked-device notifications remain generic: `Ugandan law connected to one of your saved cases has changed. Unlock Wacha to review it.`

Users control notification channels and topic subscriptions. Device-only cases calculate relevance locally from a signed, non-sensitive update index where feasible; Wacha does not upload private case facts merely to decide whether to display an alert. Notifications are deduplicated, record acknowledgement, and remain accessible in the case timeline.

## Reviewed document system

Documents are generated from versioned, advocate-reviewed templates and immutable confirmed-fact snapshots. AI may help explain missing facts or propose non-operative wording, but cannot silently insert, remove, or approve an operative clause.

The initial succession and rent journey produces:

1. Case summary and confirmed-fact schedule.
2. Month-by-month rent ledger and unresolved discrepancy schedule.
3. Evidence and exhibit index.
4. Request for a complete account of estate rent and supporting records.
5. Community Liaison Officer factual incident brief when activated.
6. Administrator General complaint or referral brief when activated.
7. Advocate handover brief and review checklist.
8. Sequenced action plan.

Each document record includes document type, template ID and version, case snapshot ID, generation time, legal sources and effective dates, content-review status, unresolved facts, included exhibits, required execution steps, review requirement, and supersession history.

## DOCX and PDF downloads

Every supported document is rendered into an editable DOCX and a fixed-layout PDF from the same canonical document model. The two outputs must contain equivalent wording, facts, warnings, citations, and version metadata.

Downloads use server-side controlled renderers, embedded or approved fonts, deterministic file names without sensitive facts, and private short-lived download authorisation for cloud cases. Device-only generation processes locally where a safe renderer exists or, with explicit consent, sends the minimum confirmed document model for ephemeral rendering without persisting a server case.

Before generation, the user reviews the facts and disclosure list. The output clearly labels `Draft`, unresolved matters, and whether advocate review is optional, recommended, or required. It never claims to be filed, court-grade, legally binding merely because Wacha produced it, witnessed, commissioned, notarised, registered, attested, or advocate-approved without recorded evidence.

DOCX and PDF files receive content digests and are linked to an immutable generation record. Regeneration after a fact, template, or law change creates a new version rather than overwriting the prior file.

## Rendering and document quality assurance

Template tests cover every conditional clause and prohibited unsupported claim. Document generation validates all required facts and rejects unknown template variables. Representative fixtures cover missing facts, long names, multiple beneficiaries, large rent tables, page breaks, signatures, warnings, and exhibit indexes.

Release verification opens the DOCX, exports or renders the PDF, checks text equivalence, scans for missing variables and formula errors, and visually inspects every PDF page at representative mobile and print sizes. A successful HTTP response alone is not document verification.

## Privacy and security

Legal-source documents are public content, but saved topics, case relevance, generated documents, and notification activity may reveal sensitive personal information. The Private Case Mode requirements apply to alerts and downloads.

No case facts appear in alert URLs, notification text, analytics, content logs, or file names. Legal-library administration uses least privilege and separate reviewer/publisher roles. Source files, parsed text, templates, and published versions retain audit logs and integrity digests. A compromised or malformed source file is isolated and cannot execute active content.

## Operations and governance

Production requires named legal-content owners, reviewer qualifications, escalation routes, correction and withdrawal procedures, source licensing records, monitoring alerts, ingestion health metrics, backup and restoration tests, and a service-level target for reviewing material new law.

Wacha publishes a correction history. Users can report a possible outdated law or incorrect relationship from every citation. A report does not silently alter the corpus; it creates a review case linked to the affected version and product records.

## First delivery boundary

The first delivery does not attempt an unverified bulk claim of complete national coverage. It provides:

- a reviewed succession, estate-administration, rental-property, evidence, police-community-liaison, and data-protection source set needed by the reference journey;
- a source and coverage register for that set;
- a daily monitor for relevant ULII, Parliament, and official gazette publications;
- reviewer workflow, impact suspension, and the in-app legal-update feed;
- case-specific generic alerts;
- the eight initial case-pack outputs; and
- verified DOCX and PDF downloads.

National expansion proceeds source family by source family through the same register and review process. Case law, automated court filing, advocate attestation, payment, and a representation marketplace remain outside this delivery unless separately approved.

## Acceptance criteria

- The coverage register never says `all Ugandan law` and accurately exposes its source/date gaps.
- A newly published test amendment is discovered once, source-confirmed, reviewed, related to the correct provisions, announced once, and linked to its authoritative source.
- A bill is never announced as an Act, and an assented but uncommenced provision is labelled uncommenced.
- A changed source digest without confirmed legal effect creates review work rather than silently changing guidance.
- A material amendment suspends every dependent template until reviewer disposition.
- Historical documents retain their original legal-version links and receive a non-destructive impact notice.
- Locked-device alerts contain no case subject or legal topic.
- Device-only relevance does not require uploading private case facts.
- The reference case produces equivalent DOCX and PDF outputs from one confirmed snapshot.
- Both downloads contain template version, law-review date, citations, unresolved facts, and review requirement.
- Fact or law changes create a new document version and never overwrite the previous download.
- Malformed sources, parser failures, renderer failures, and unavailable authorities fail safely without presenting stale content as current.
- Full unit, integration, document-rendering, accessibility, privacy, and browser acceptance suites pass before release.
