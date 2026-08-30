# Wacha Legal AI

Uganda-focused legal guidance and workflow software for citizens, SMEs, and advocates.

## Included in this production slice

- Adaptive Wacha Concierge with deterministic routing and safety escalation.
- Seven consistent legal department entry points.
- Separate Citizen/SME and Advocate experiences.
- Validated matter domain and immutable repository boundary.
- Versioned land due-diligence checklist with unresolved-issue warnings.
- Credential-free adapters for AI, payment, notification, and storage providers.
- Unit, component, and browser journey tests.

The application provides legal information. It does not claim that generated output is filed, witnessed, commissioned, advocate-approved, or guaranteed to achieve a legal result.

## Local development

Use Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Tests and builds do not need production secrets. Copy `.env.example` only when connecting reviewed providers.

## Production activation

Before public launch, connect PostgreSQL and private storage, implement secure authentication and tenant policies, select approved Ugandan payment and messaging providers, load advocate-reviewed legal sources/templates, complete Uganda data-protection review, verify advocate identities, and run restoration and incident-response drills.

Architecture and implementation decisions are documented under `docs/superpowers`.

