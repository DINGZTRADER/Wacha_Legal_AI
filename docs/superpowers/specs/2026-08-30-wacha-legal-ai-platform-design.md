# Wacha Legal AI Platform Design

## Goal

Build a Uganda-only freemium legal workflow SaaS for citizens, SMEs, and advocates. It provides structured triage, cited explanations, reviewed document automation, matter organisation, payments, and referrals to verified advocates. It never represents unreviewed output as legal advice, advocate work, a filed instrument, or a guaranteed outcome. English launches first; the system is translation-ready.

## Experiences

The Citizen/SME workspace supports adaptive intake, confirmed facts, source-linked options, matters, saved progress, paid documents, and referrals. The Advocate workspace supports verified firms, staff, clients, matters, templates, reviews, tasks, and referrals with tenant isolation and audit logs.

The Wacha Concierge asks one relevant question at a time, explains terms, detects missing or inconsistent facts, and routes users. Deterministic rules control required questions, deadlines, eligibility, and escalation. AI interprets narratives and explains options using approved, dated Ugandan sources. Users confirm structured facts before reuse. Responses distinguish facts from assumptions, avoid guarantees, and label advocate review optional, recommended, or mandatory.

## Departments

Every module follows: tell Wacha, clarify facts, understand options, choose an action, prepare a document, verify and pay, then complete or refer. Launch modules are land/tenancy, debt/small claims, employment, family/succession, affidavits/declarations, business/commercial, and vehicles/asset sales. Each owns its questions, rules, sources, templates, and escalation policy while sharing matters, parties, facts, evidence, risks, tasks, citations, billing, and referrals.

## Architecture

Use a modular multi-tenant Next.js/TypeScript application on Vercel, PostgreSQL for domain data, private object storage, and background jobs for rendering, notifications, reconciliation, and indexing. Typed provider interfaces isolate AI, payments, messaging, and storage.

A provider-neutral AI gateway performs structured-output validation, retrieval, redaction, safety checks, timeouts, and cost controls. Versioned legal content records sources, effective dates, templates, clauses, questionnaires, rules, advocate approvals, supersession, and emergency withdrawal. Database constraints plus application authorization enforce tenant isolation. Final documents are immutable; edits create versions.

## Safety and operations

Escalate emergencies, violence, children, criminal exposure, fraud, conflicts, imminent deadlines, land irregularities, incapacity, contested estates, and uncertain law. Documents use reviewed templates, conditional clauses, and validated facts; AI cannot silently insert operative clauses. Outputs identify template version, law date, unresolved issues, attachments, execution steps, and review requirement. Never claim court-grade, binding, filed, notarised, commissioned, witnessed, or advocate-approved status without recorded evidence.

Use secure sessions, verified email, protected recovery, optional MFA, least privilege, encryption, validated uploads, redacted logs, explicit versioned consent, and auditable privacy operations. Production requires Ugandan data-protection and legal-content review.

Payments, jobs, generation, and notifications are idempotent. Failures preserve confirmed state, avoid repeat charges or entitlements, and offer recovery or escalation. Production includes health checks, structured logs, metrics, error reporting, backups, restoration drills, and alerts.

## First production slice and acceptance

Deliver an accessible deployment-ready app; tenant-ready identity boundaries; Citizen and Advocate entry points; resumable Concierge intake with routing and safety escalation; seven department routes; matter creation; one reviewed document workflow; safe disclaimers; provider test adapters; and CI-ready tests. Live providers require credentials and reviewed content, but local testing does not.

Tests cover rules, validation, authorization, provider contracts, core journeys, accessibility, isolation, unsafe inputs, retries, duplicates, and legal-workflow fixtures. Success means users reach the right department with reasons, critical facts escalate safely, confirmed facts populate the first document, unsupported legal-status claims are absent, builds/tests pass without production credentials, and modules can be added without a monolithic rewrite.

