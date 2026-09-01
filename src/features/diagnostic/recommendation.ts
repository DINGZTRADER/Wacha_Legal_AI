import { DEPARTMENTS, type DepartmentId } from "../departments/registry";

export type WhatHappened =
  | "land"
  | "money"
  | "employment"
  | "family"
  | "affidavit"
  | "business"
  | "vehicle"
  | "unsure";
export type WhoInvolved =
  | "landlord"
  | "employer"
  | "borrower"
  | "family"
  | "business"
  | "buyer-seller"
  | "authority"
  | "unsure";
export type DesiredOutcome =
  | "understand-rights"
  | "prepare-document"
  | "recover-money"
  | "challenge-decision"
  | "protect-rights"
  | "settle-family"
  | "unsure";
export type Urgency = "safety" | "deadline" | "not-urgent" | "unsure";

export type DiagnosticAnswers = {
  whatHappened: WhatHappened;
  whoInvolved: WhoInvolved;
  outcome: DesiredOutcome;
  urgency: Urgency;
};

export type DepartmentRecommendation = {
  departmentId: DepartmentId;
  departmentTitle: string;
  explanation: string;
  documents: string[];
  nextSteps: string[];
  urgencyWarnings: string[];
};

type Guidance = Omit<DepartmentRecommendation, "departmentId" | "departmentTitle" | "urgencyWarnings">;

const GUIDANCE: Record<DepartmentId, Guidance> = {
  "land-tenancy": {
    explanation: "This path covers land ownership, family land, boundaries, renting, eviction, and land transactions.",
    documents: ["National ID or other identification", "Land or tenancy agreements", "Receipts, title details, maps, or letters", "Relevant messages, photos, or witness details"],
    nextSteps: ["Confirm the land or tenancy relationship", "Organise the dates and documents you have", "Use the guided intake to identify the safest next step"],
  },
  "debt-small-claims": {
    explanation: "This path covers unpaid loans, goods, services, rent arrears, and other money claims.",
    documents: ["Identification and contact details", "Invoices, agreements, receipts, or loan records", "Payment requests and messages", "A simple calculation of the amount claimed"],
    nextSteps: ["Confirm the amount and why it is owed", "Gather proof of the agreement and payment requests", "Consider a written demand and advocate review before filing"],
  },
  employment: {
    explanation: "This path covers work, salary, dismissal, discipline, workplace treatment, and employment benefits.",
    documents: ["Employment contract or appointment letter", "Payslips, salary records, or benefit statements", "Disciplinary or dismissal letters", "Relevant workplace messages and dates"],
    nextSteps: ["Set out your role, dates, and what the employer did", "Keep every written notice and response", "Check any deadline before sending a formal claim"],
  },
  "family-succession": {
    explanation: "This path covers inheritance, estates, wills, beneficiaries, and family property arrangements.",
    documents: ["Identification for the people involved", "Death certificates where available", "Will, land, bank, or property records", "Family meeting notes or letters"],
    nextSteps: ["List the deceased person, family members, and assets", "Separate confirmed documents from family accounts", "Seek professional guidance before distributing estate property"],
  },
  affidavits: {
    explanation: "This path covers sworn statements, statutory declarations, lost documents, and supporting exhibits.",
    documents: ["Identification", "The facts you need to swear or declare", "Supporting records or exhibits", "The name of the office or person requesting the statement"],
    nextSteps: ["Write the facts in date order", "Label each supporting document", "Confirm the correct commissioner or receiving office"],
  },
  "business-commercial": {
    explanation: "This path covers companies, suppliers, partnerships, services, and commercial agreements.",
    documents: ["Identification and business registration details", "Contracts, quotations, invoices, or purchase orders", "Company or partnership records", "Relevant messages and payment records"],
    nextSteps: ["Identify each party and the agreement", "Record the obligations, dates, and disputed points", "Choose whether you need a document, demand, or review"],
  },
  "vehicles-assets": {
    explanation: "This path covers vehicle, motorcycle, equipment, and other asset sales or transfers.",
    documents: ["Identification for buyer and seller", "Logbook, ownership, or registration details", "Sale agreement and payment proof", "Inspection, valuation, or transfer records"],
    nextSteps: ["Confirm ownership and the asset details", "Check the documents before paying or signing", "Keep a signed copy and complete the transfer steps"],
  },
};

const WHAT_HAPPENED_DEPARTMENTS: Record<Exclude<WhatHappened, "unsure">, DepartmentId> = {
  land: "land-tenancy",
  money: "debt-small-claims",
  employment: "employment",
  family: "family-succession",
  affidavit: "affidavits",
  business: "business-commercial",
  vehicle: "vehicles-assets",
};

function chooseDepartment(answers: DiagnosticAnswers): DepartmentId {
  if (answers.whatHappened !== "unsure") {
    return WHAT_HAPPENED_DEPARTMENTS[answers.whatHappened];
  }

  if (answers.outcome === "recover-money" || answers.whoInvolved === "borrower") return "debt-small-claims";
  if (answers.outcome === "challenge-decision" || answers.whoInvolved === "employer") return "employment";
  if (answers.outcome === "settle-family" || answers.whoInvolved === "family") return "family-succession";
  if (answers.outcome === "protect-rights" || answers.whoInvolved === "landlord") return "land-tenancy";
  if (answers.outcome === "prepare-document" && answers.whoInvolved === "business") return "business-commercial";

  return "affidavits";
}

function buildUrgencyWarnings(urgency: Urgency): string[] {
  const warnings = [
    "If there is violence, an eviction threat, an arrest, or an imminent deadline, seek immediate help from the police, a trusted local service, or an enrolled advocate.",
  ];

  if (urgency === "safety") {
    warnings.unshift("Your answer suggests an immediate safety concern. Put physical safety first and do not wait for a document draft.");
  }
  if (urgency === "deadline") {
    warnings.unshift("A deadline may affect your rights. Confirm the date and seek urgent professional help before it passes.");
  }

  return warnings;
}

export function recommendDepartment(answers: DiagnosticAnswers): DepartmentRecommendation {
  const departmentId = chooseDepartment(answers);
  const department = DEPARTMENTS.find(({ id }) => id === departmentId);

  if (!department) {
    throw new Error(`Unknown diagnostic department: ${departmentId}`);
  }

  return {
    departmentId,
    departmentTitle: department.title,
    ...GUIDANCE[departmentId],
    urgencyWarnings: buildUrgencyWarnings(answers.urgency),
  };
}
