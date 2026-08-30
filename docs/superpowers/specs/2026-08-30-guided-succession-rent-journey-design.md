# Guided Succession and Rent Journey Design

## Status

Approved product direction for the first complete Wacha Legal AI citizen journey. This design extends the platform design without replacing its safety, tenancy, audit, or legal-review requirements.

## Goal

Let an average Ugandan explain a succession or inherited rental-property problem once, then guide them to a useful outcome through short, relevant questions. Wacha organises the facts, identifies missing information, protects evidence, explains the next step in plain language, and prepares an actionable case pack without requiring the user to write a second summary.

The first reference journey covers a deceased parent's rental property where a sibling collects rent, may be under-declaring collections, and no administrator may have been appointed.

## Product principles

- Ask one question at a time.
- Use plain English, large choices, and an always-available `I don't know` answer.
- Let the user type or use supported voice input for the initial explanation.
- Ask only questions that can change the route, risk level, document, or next action.
- Reuse confirmed facts throughout the case; never ask the user to retell the story.
- Keep legal reasoning and branching behind the interface.
- Clearly separate confirmed facts, the user's allegations, another person's statements, AI inferences, and missing evidence.
- Never present suspected under-declaration as proven fraud.
- Preserve user control over storage, sharing, export, and deletion.
- Explain why a sensitive or unexpected question is being asked.

## Entry experience

The concierge opens with one invitation: `Tell Wacha what happened, in your own words.` The user may type or dictate. The interface does not ask for a formal summary.

Wacha extracts a proposed fact set and replies with a short acknowledgement such as: `I understand that both parents have died, there is a rental house in Bukoto, and your brother has been collecting rent. I will ask a few short questions so we can work out the safest next step.`

The user then sees one question per screen, progress expressed as a simple phase rather than an unreliable percentage, and a collapsible `What Wacha understands` panel. Back and edit controls are always available. Changing an earlier answer recalculates dependent questions and flags any generated output that is now stale.

## Adaptive question phases

### 1. Immediate safety and preservation

Ask whether anyone is in immediate danger or whether there are threats, intimidation, unlawful entry, property damage, seized documents, harassment of tenants, attempted sale or transfer, or an immediate risk that money or estate property will disappear.

Immediate danger routes to emergency guidance. Non-emergency security or community-resolution concerns may route to the Community Liaison Officer at the nearest police station. Wacha prepares a factual incident brief, but does not imply that police decide inheritance ownership or civil entitlement.

### 2. Deaths, will, and core records

Identify who died, dates of death, relationship to the user, whether a will is known, whether death certificates or death notifications exist, and which deceased person owned or controlled the property. Unknown answers remain open tasks rather than blocking progress.

### 3. Authority to administer the estate

Ask whether probate or letters of administration exist, who holds them, whether the Administrator General has opened a file or held a family meeting, and whether any Certificate of No Objection is known. Where authority is uncertain, Wacha avoids treating any sibling as the lawful administrator.

### 4. Family and beneficiaries

Record spouses, children, dependants, other relevant beneficiaries, minors, older people, persons with disabilities, and anyone needing immediate support. This phase does not decide final shares; it identifies people who must not be omitted and risks requiring human review.

### 5. Property and rental activity

Record the property's location and known ownership documents, number of rental units, occupied periods, known tenants, agreed monthly rent, collector, collection method, expenses claimed, amounts distributed, and the period in dispute.

The user is not required to calculate totals. Wacha builds a month-by-month rent ledger and marks every value as confirmed, reported, estimated, or missing.

### 6. Under-declaration and accounting discrepancy

When collected rent may exceed the amount declared, ask for the figures each person states, the relevant dates, and the basis for each figure. Compare declared amounts only against actual evidence such as tenancy agreements, tenant confirmations, receipts, bank or mobile-money records, occupancy information, expense receipts, and prior distributions.

The product calls the result an `unresolved rent-accounting discrepancy` until sufficient evidence and appropriate review support a stronger conclusion.

If the sibling made a written statement, the user may paste or upload it. Wacha retains the original item, captures sender, date, channel, and source, extracts proposed figures, and asks the user to confirm the extraction. The statement is indexed as an exhibit and is never silently rewritten.

### 7. Desired outcome

Ask what the user wants now using concrete choices: understand the position, obtain a full rent account, preserve the property, hold a family meeting, reach a safe family resolution, complain to the Administrator General, prepare for an advocate, or address a security concern. Wacha may recommend a safer prerequisite while preserving the user's stated goal.

## Decision and referral rules

The question engine is deterministic and versioned. AI may extract facts and explain a route, but may not choose mandatory questions, suppress escalation, determine legal entitlement, or label conduct criminal.

- Safety concerns activate the preservation branch before ordinary document generation.
- Community Liaison Officer referral is limited to safety, security, crime-prevention, intimidation, public-order, or suitable community problem-solving concerns. It is not a substitute for estate administration.
- No known probate or letters of administration plus estate control or rent collection activates possible-intermeddling review and Administrator General or advocate guidance.
- An appointed administrator who does not provide a complete account activates accounting, mismanagement, and legal-review guidance.
- Minors, vulnerable beneficiaries, contested authority, disputed wills, threatened transfers, material unexplained losses, suspected forgery, violence, or criminal exposure require human review.
- A local leader or LC1 may assist with local facts, identity, mobilisation, or a suitable family process, but is not represented as determining title or succession rights.
- Family resolution is offered only where safe and does not prevent preservation or urgent escalation.

## Outputs

After fact confirmation, Wacha produces a case workspace containing:

1. A plain-language case summary generated from confirmed facts.
2. A fact table separating confirmed facts, allegations, third-party statements, missing facts, and AI suggestions.
3. A month-by-month rent ledger and discrepancy table.
4. An evidence checklist and exhibit index.
5. A draft request for a complete rent account and supporting documents.
6. A Community Liaison Officer incident brief when that branch is triggered.
7. An Administrator General complaint or referral brief when that branch is triggered.
8. An advocate handover brief and review checklist for probate, letters of administration, preservation orders, or court action.
9. A sequenced action plan showing `first`, `next`, and `later` tasks.

Every output displays its fact-confirmation time, unresolved issues, review status, and whether later answers have made it stale. Drafts are not described as filed, approved, commissioned, witnessed, or guaranteed to achieve an outcome.

## Continuing journey

Document generation is not the end of the journey. The workspace lets the user record that a letter was delivered, a meeting occurred, an official reference number was received, the sibling responded, new rent was collected, or a deadline was set. Each event may create a small set of relevant follow-up questions and update the next action.

The user should be able to hand over the concise brief and exhibits without explaining the entire matter again. Wacha records outcomes but does not send messages, contact tenants, lodge complaints, or submit documents without a separate, explicit user action and confirmation.

## Local data storage

Saving is an explicit user choice. Before persistent storage begins, Wacha offers `Keep this case on this device` and, when account storage is available, `Save securely to my Wacha account`. A user may also continue without persistent saving for the current session.

### Device-only mode

- Store structured case data and supported attachments in browser-managed IndexedDB rather than ordinary localStorage.
- Encrypt the case payload with authenticated encryption using Web Crypto. The unlock secret is not stored with the encrypted case.
- Request persistent browser storage where supported and show storage usage and browser limitations honestly.
- Clearly warn users on shared phones or computers that other people with access to the unlocked browser profile may be able to access the case.
- Never imply that device-only storage is a backup. Offer an encrypted `.wacha-case` export and a separate readable case-pack export.
- Allow the user to lock the case, rename it, export it, and permanently delete the selected local case.
- Keep attachments byte-for-byte unchanged; extracted text, thumbnails, or AI notes are separate derived records.
- Do not silently sync device-only cases to an account or server.

Local storage and AI processing are separate choices. If a feature needs remote AI processing, Wacha explains that the minimum relevant content will be transmitted for processing even when the case is stored only on the device. Device-only mode must not create a persistent server-side case record or retain uploaded evidence as application storage. Operational logs must exclude case content and sensitive document text.

If storage is unavailable, full, evicted, or corrupted, Wacha preserves the active session where possible, explains the problem plainly, and directs the user to export a backup. Failed saves must never be shown as successful.

## Privacy and evidence integrity

- Sensitive previews are concealed by default in recent-case lists.
- The app avoids exposing case details in URLs, analytics, error reports, page titles, or notification text.
- Original evidence is immutable within the case. Corrections create a new note or version rather than altering the source.
- Evidence records include source, acquisition date when known, upload time, media type, and a content digest.
- AI-extracted facts require user confirmation before entering a final document.
- Users can view what will be shared before any handover or export.
- Deleting a device-only case removes its case records and derived local data, then confirms what was deleted and notes any exported copies the app cannot remove.

## Accessibility and low-data operation

The journey is mobile-first, keyboard accessible, screen-reader labelled, and usable at high zoom. Questions use short sentences and familiar terms, with explanations on demand. Large tap targets, text alternatives, and non-colour status cues are required.

Core deterministic questioning, editing, local saving, and viewing already generated materials should tolerate an interrupted connection. Remote AI, source updates, and online referrals must fail gracefully without losing confirmed answers. The content model is translation-ready; English launches first, with Luganda and read-aloud support added only after reviewed translations and usability testing.

## Technical model

Use a versioned state machine for the journey. Each node declares its question, accepted answer shape, visibility condition, explanation, validation, fact mutations, risk flags, and next-node rules. Domain state is independent from React component state so it can be tested without a browser.

Core records include case, person, deceased person, authority record, property, tenancy, rent period, transaction, expense, statement, evidence item, allegation, confirmed fact, risk flag, referral, document, action, and timeline event. Each record carries provenance and confirmation status.

The AI boundary accepts a minimal typed context and returns schema-validated proposals for narrative extraction, follow-up suggestions, or plain-language text. Deterministic code validates all proposals and owns routing. Invalid, unavailable, or low-confidence AI output falls back to the questionnaire without losing progress.

Local persistence uses a versioned repository interface so IndexedDB and later account-backed storage implement the same domain contract. Migrations are transactional and tested against previous schema fixtures. Generated documents reference immutable case snapshots rather than mutable live state.

## Acceptance criteria

- A user explains the reference situation once and reaches the case pack without writing another summary.
- Only one primary question is displayed at a time, with `I don't know`, back, edit, and reason controls.
- Changing an earlier answer recalculates the route and marks affected outputs stale.
- Safety, Community Liaison Officer, Administrator General, vulnerable-beneficiary, and advocate-review branches activate only from defined facts.
- A sibling's written rent statement remains unchanged, is indexed as evidence, and has user-confirmed extracted figures.
- The rent ledger distinguishes known, reported, estimated, and missing values and never labels a discrepancy as fraud automatically.
- The final pack contains the summary, fact table, rent ledger, evidence index, accounting-request draft, applicable referrals, and next-action plan.
- Device-only cases survive reload, remain separate from server account data, can be locked, exported, restored, and deleted, and never report an unsuccessful save as successful.
- Shared-device, AI-processing, export, and deletion explanations are understandable in usability testing.
- No sensitive case facts appear in URLs, client analytics, content logs, or error messages.
- Unit tests cover every deterministic branch, contradictory answers, storage migrations, encryption failures, quota failures, stale outputs, and evidence immutability.
- Integration tests cover the full reference journey, resume-after-reload, encrypted export/import, deletion, AI failure fallback, and each required referral route.
- Accessibility checks and representative mobile browser tests pass before release.

## First implementation boundary

The first implementation delivers the guided reference journey, device-only storage, case workspace, rent ledger, evidence metadata, accounting-request draft, conditional referral briefs, action plan, and safe AI boundary using test adapters where credentials or reviewed content are unavailable.

It does not automatically contact relatives or tenants, submit a police or Administrator General complaint, file in court, determine beneficiary shares, accept payment, or claim advocate review. Account sync, Luganda, production voice transcription, external messaging, and official electronic filing remain later increments unless separately approved.
