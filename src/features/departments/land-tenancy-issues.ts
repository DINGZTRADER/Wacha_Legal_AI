import { INTAKE_MODULE_BLUEPRINTS, getIntakeModule } from "../intake/modules";

export type LandTenancyIssueId =
  (typeof INTAKE_MODULE_BLUEPRINTS)["land-tenancy"]["issues"][number]["id"];

type LandTenancyIssue = {
  id: LandTenancyIssueId;
  title: string;
  description: string;
  question: string;
  href: string;
};

const LAND_TENANCY_COMPATIBILITY_COPY = {
  "inheritance-family-land": {
    description:
      "A parent has died, or family members disagree about land, ownership, or rent.",
    question: "Tell me what happened after the owner died or the family arrangement changed.",
  },
  "land-grabbing-boundaries": {
    description:
      "Someone is occupying, fencing, selling, or claiming land you believe belongs to you.",
    question: "What changed on the land, and who is claiming or using it now?",
  },
  "rent-tenancy-eviction": {
    description:
      "A rent payment, tenancy agreement, eviction, lockout, or landlord–tenant problem.",
    question: "What happened between you and the landlord or tenant?",
  },
  "buying-land-checks": {
    description:
      "You want to check ownership, title, boundaries, consent, or risks before paying for land.",
    question: "What land are you considering, and which documents have you been shown?",
  },
  "land-sale-transfer-title": {
    description:
      "A sale, transfer, title change, family consent, or registration is delayed or disputed.",
    question: "What transfer or title step has happened, and what is still unresolved?",
  },
} satisfies Record<LandTenancyIssueId, { description: string; question: string }>;

export const LAND_TENANCY_ISSUES: readonly LandTenancyIssue[] = getIntakeModule(
  "land-tenancy",
).issues.map((issue) => {
  const id = issue.id as LandTenancyIssueId;
  const compatibilityCopy = LAND_TENANCY_COMPATIBILITY_COPY[id];

  return {
    id,
    title: issue.title,
    description: compatibilityCopy.description,
    question: compatibilityCopy.question,
    href: `/matters/new?department=land-tenancy&issue=${id}`,
  };
});

export function getLandTenancyIssue(id: string | null | undefined) {
  return LAND_TENANCY_ISSUES.find((issue) => issue.id === id);
}
