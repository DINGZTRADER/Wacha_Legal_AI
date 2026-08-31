export const LAND_TENANCY_ISSUES = [
  { id: "inheritance-family-land", title: "Inheritance and family land", description: "A parent has died, or family members disagree about land, ownership, or rent.", question: "Tell me what happened after the owner died or the family arrangement changed.", href: "/matters/new?department=land-tenancy&issue=inheritance-family-land" },
  { id: "land-grabbing-boundaries", title: "Land grabbing or boundaries", description: "Someone is occupying, fencing, selling, or claiming land you believe belongs to you.", question: "What changed on the land, and who is claiming or using it now?", href: "/matters/new?department=land-tenancy&issue=land-grabbing-boundaries" },
  { id: "rent-tenancy-eviction", title: "Rent, tenancy, or eviction", description: "A rent payment, tenancy agreement, eviction, lockout, or landlord–tenant problem.", question: "What happened between you and the landlord or tenant?", href: "/matters/new?department=land-tenancy&issue=rent-tenancy-eviction" },
  { id: "buying-land-checks", title: "Buying land and checking documents", description: "You want to check ownership, title, boundaries, consent, or risks before paying for land.", question: "What land are you considering, and which documents have you been shown?", href: "/matters/new?department=land-tenancy&issue=buying-land-checks" },
  { id: "land-sale-transfer-title", title: "Land sale, transfer, or title", description: "A sale, transfer, title change, family consent, or registration is delayed or disputed.", question: "What transfer or title step has happened, and what is still unresolved?", href: "/matters/new?department=land-tenancy&issue=land-sale-transfer-title" },
] as const;

export type LandTenancyIssueId = typeof LAND_TENANCY_ISSUES[number]["id"];

export function getLandTenancyIssue(id: string | null | undefined) {
  return LAND_TENANCY_ISSUES.find((issue) => issue.id === id);
}
