import {
  DepartmentIntakeModuleSchema,
  type DepartmentIntakeModule,
  type IssueModule,
  type Question,
} from "./model";
import type { DepartmentId } from "../departments/registry";

const MODULE_VERSION = "2026-09-01" as const;

type AnswerProvenance =
  | "USER_STATEMENT"
  | "USER_ALLEGATION"
  | "THIRD_PARTY_STATEMENT";

type QuestionOption = Extract<Question, { kind: "single-choice" }>["options"][number];

type QuestionBlueprint = Question & {
  answerProvenance: AnswerProvenance;
};

type IssueBlueprint = Omit<IssueModule, "questions"> & {
  questions: readonly QuestionBlueprint[];
};

type DepartmentIntakeBlueprint = Omit<DepartmentIntakeModule, "issues" | "version"> & {
  version: typeof MODULE_VERSION;
  issues: readonly IssueBlueprint[];
};

type IssueQuestionConfig = {
  id: string;
  title: string;
  rolePrompt: string;
  roleOptions: readonly QuestionOption[];
  whatPrompt: string;
  otherPartyPrompt: string;
  specificQuestion: QuestionBlueprint;
};

const DISPUTE_OUTCOME_OPTIONS = [
  { value: "understand-position", label: "Understand my position" },
  { value: "resolve-directly", label: "Resolve it directly" },
  { value: "prepare-document", label: "Prepare a document" },
  { value: "prepare-formal-action", label: "Prepare for formal action" },
] as const satisfies readonly QuestionOption[];

const AFFIDAVIT_OUTCOME_OPTIONS = [
  { value: "draft-affidavit", label: "Draft the declaration" },
  { value: "review-facts", label: "Review the facts first" },
  { value: "organise-exhibits", label: "Organise supporting exhibits" },
  { value: "prepare-filing", label: "Prepare for filing or swearing" },
] as const satisfies readonly QuestionOption[];

const LAND_ROLE_OPTIONS = [
  { value: "owner-family", label: "Owner, family, or occupier" },
  { value: "tenant-landlord", label: "Tenant or landlord" },
  { value: "buyer-seller", label: "Buyer or seller" },
  { value: "representative", label: "Representative or helper" },
] as const satisfies readonly QuestionOption[];

const DEBT_ROLE_OPTIONS = [
  { value: "lender", label: "Lender or claimant" },
  { value: "borrower", label: "Borrower or respondent" },
  { value: "business", label: "Business representative" },
  { value: "other", label: "Another involved person" },
] as const satisfies readonly QuestionOption[];

const EMPLOYMENT_ROLE_OPTIONS = [
  { value: "employee", label: "Employee or former employee" },
  { value: "employer", label: "Employer or manager" },
  { value: "co-worker", label: "Co-worker or witness" },
  { value: "representative", label: "Representative or helper" },
] as const satisfies readonly QuestionOption[];

const FAMILY_ROLE_OPTIONS = [
  { value: "beneficiary", label: "Beneficiary or heir" },
  { value: "spouse-parent", label: "Spouse, parent, or child" },
  { value: "guardian", label: "Guardian or carer" },
  { value: "representative", label: "Representative or helper" },
] as const satisfies readonly QuestionOption[];

const AFFIDAVIT_ROLE_OPTIONS = [
  { value: "deponent", label: "Person making the declaration" },
  { value: "family", label: "Family member or supporter" },
  { value: "property-holder", label: "Property holder or owner" },
  { value: "representative", label: "Representative or helper" },
] as const satisfies readonly QuestionOption[];

const BUSINESS_ROLE_OPTIONS = [
  { value: "owner", label: "Owner or founder" },
  { value: "director-partner", label: "Director or partner" },
  { value: "supplier-customer", label: "Supplier or customer" },
  { value: "representative", label: "Representative or helper" },
] as const satisfies readonly QuestionOption[];

const VEHICLE_ROLE_OPTIONS = [
  { value: "buyer", label: "Buyer or intended buyer" },
  { value: "seller", label: "Seller or owner" },
  { value: "user", label: "Driver or asset user" },
  { value: "representative", label: "Representative or helper" },
] as const satisfies readonly QuestionOption[];

function singleChoiceQuestion(
  id: string,
  prompt: string,
  options: readonly QuestionOption[],
  answerProvenance: AnswerProvenance,
): QuestionBlueprint {
  return {
    id,
    prompt,
    kind: "single-choice",
    required: true,
    options: [...options],
    answerProvenance,
  };
}

function textQuestion(
  id: string,
  prompt: string,
  kind: Extract<Question["kind"], "short-text" | "long-text" | "date" | "yes-no">,
  answerProvenance: AnswerProvenance,
): QuestionBlueprint {
  return {
    id,
    prompt,
    kind,
    required: true,
    answerProvenance,
  };
}

function createIssue<const Config extends IssueQuestionConfig>(
  config: Config,
  outcomeOptions: readonly QuestionOption[] = DISPUTE_OUTCOME_OPTIONS,
): IssueBlueprint & Pick<Config, "id" | "title"> {
  return {
    id: config.id,
    title: config.title,
    questions: [
      singleChoiceQuestion("role", config.rolePrompt, config.roleOptions, "USER_STATEMENT"),
      textQuestion("what-happened", config.whatPrompt, "long-text", "USER_STATEMENT"),
      textQuestion("timing", "When did this happen or start?", "short-text", "USER_STATEMENT"),
      textQuestion("other-party", config.otherPartyPrompt, "short-text", "USER_STATEMENT"),
      textQuestion(
        "steps-taken",
        "What steps have you already taken, if any?",
        "long-text",
        "USER_STATEMENT",
      ),
      singleChoiceQuestion(
        "desired-outcome",
        "What outcome do you want most right now?",
        outcomeOptions,
        "USER_STATEMENT",
      ),
      config.specificQuestion,
    ],
  };
}

function buildModule(
  departmentId: DepartmentId,
  issues: readonly IssueBlueprint[],
): DepartmentIntakeModule {
  return DepartmentIntakeModuleSchema.parse({
    departmentId,
    version: MODULE_VERSION,
    issues: issues.map(({ id, title, questions }) => ({
      id,
      title,
      questions: questions.map(({ answerProvenance, ...question }) => question),
    })),
  });
}

export const INTAKE_MODULE_BLUEPRINTS = {
  "land-tenancy": {
    departmentId: "land-tenancy",
    version: MODULE_VERSION,
    issues: [
      createIssue({
        id: "inheritance-family-land",
        title: "Inheritance and family land",
        rolePrompt: "What is your role in this land matter?",
        roleOptions: LAND_ROLE_OPTIONS,
        whatPrompt: "What happened with the family land or tenancy?",
        otherPartyPrompt: "Who else is involved in the land or rent issue?",
        specificQuestion: textQuestion(
          "record-holder",
          "Whose name appears on the key land or rent records?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
      createIssue({
        id: "land-grabbing-boundaries",
        title: "Land grabbing or boundaries",
        rolePrompt: "What is your role in this land matter?",
        roleOptions: LAND_ROLE_OPTIONS,
        whatPrompt: "What changed on the land or the boundary?",
        otherPartyPrompt: "Who is claiming, using, or occupying the land?",
        specificQuestion: textQuestion(
          "boundary-change",
          "What fence, boundary, or occupation change is disputed?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
      createIssue({
        id: "rent-tenancy-eviction",
        title: "Rent, tenancy, or eviction",
        rolePrompt: "What is your role in this land matter?",
        roleOptions: LAND_ROLE_OPTIONS,
        whatPrompt: "What happened between the landlord and tenant?",
        otherPartyPrompt: "Who is the landlord, tenant, or agent involved?",
        specificQuestion: textQuestion(
          "rent-issue",
          "What rent, notice, or lockout issue is happening now?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
      createIssue({
        id: "buying-land-checks",
        title: "Buying land and checking documents",
        rolePrompt: "What is your role in this land matter?",
        roleOptions: LAND_ROLE_OPTIONS,
        whatPrompt: "What has happened in the planned land purchase so far?",
        otherPartyPrompt: "Who is selling, brokering, or introducing the land?",
        specificQuestion: textQuestion(
          "document-concern",
          "What document or consent check worries you most?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
      createIssue({
        id: "land-sale-transfer-title",
        title: "Land sale, transfer, or title",
        rolePrompt: "What is your role in this land matter?",
        roleOptions: LAND_ROLE_OPTIONS,
        whatPrompt: "What happened with the sale, transfer, or title process?",
        otherPartyPrompt: "Who is the seller, buyer, or registry contact involved?",
        specificQuestion: textQuestion(
          "transfer-step",
          "Which transfer or title step is still unresolved?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
    ],
  },
  "debt-small-claims": {
    departmentId: "debt-small-claims",
    version: MODULE_VERSION,
    issues: [
      createIssue({
        id: "unpaid-loan",
        title: "An unpaid loan",
        rolePrompt: "What is your role in this money matter?",
        roleOptions: DEBT_ROLE_OPTIONS,
        whatPrompt: "What happened with the loan or repayment?",
        otherPartyPrompt: "Who owes the money, or who says the money is owed?",
        specificQuestion: textQuestion(
          "loan-amount",
          "What amount is unpaid, and how was it meant to be repaid?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
      createIssue({
        id: "goods-services-not-paid",
        title: "Goods or services not paid for",
        rolePrompt: "What is your role in this money matter?",
        roleOptions: DEBT_ROLE_OPTIONS,
        whatPrompt: "What happened with the unpaid goods or services?",
        otherPartyPrompt: "Who ordered, received, or delivered the goods or services?",
        specificQuestion: textQuestion(
          "delivery-status",
          "What goods or services were delivered before payment stalled?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
      createIssue({
        id: "money-sent-wrong-person",
        title: "Money sent or paid by mistake",
        rolePrompt: "What is your role in this money matter?",
        roleOptions: DEBT_ROLE_OPTIONS,
        whatPrompt: "What happened when the money was sent or paid?",
        otherPartyPrompt: "Who received the money or gave the payment details?",
        specificQuestion: textQuestion(
          "payment-channel",
          "How was the money sent, and what details were used?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
      createIssue({
        id: "small-claim-demand",
        title: "A demand or small claim",
        rolePrompt: "What is your role in this money matter?",
        roleOptions: DEBT_ROLE_OPTIONS,
        whatPrompt: "What happened before the demand or small claim arose?",
        otherPartyPrompt: "Who sent the demand, or who is being claimed against?",
        specificQuestion: textQuestion(
          "claim-amount",
          "What amount or obligation is the demand or claim about?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
    ],
  },
  employment: {
    departmentId: "employment",
    version: MODULE_VERSION,
    issues: [
      createIssue({
        id: "dismissal",
        title: "Dismissal or forced resignation",
        rolePrompt: "What is your role in this work matter?",
        roleOptions: EMPLOYMENT_ROLE_OPTIONS,
        whatPrompt: "What happened with the dismissal or resignation?",
        otherPartyPrompt: "Who at work made or delivered the decision?",
        specificQuestion: textQuestion(
          "dismissal-reason",
          "What reason were you given for the dismissal or resignation?",
          "short-text",
          "THIRD_PARTY_STATEMENT",
        ),
      }),
      createIssue({
        id: "unpaid-wages",
        title: "Unpaid salary, wages, or benefits",
        rolePrompt: "What is your role in this work matter?",
        roleOptions: EMPLOYMENT_ROLE_OPTIONS,
        whatPrompt: "What happened with the unpaid salary, wages, or benefits?",
        otherPartyPrompt: "Who controls payroll or payment for this work?",
        specificQuestion: textQuestion(
          "unpaid-period",
          "Which pay period or benefit is still unpaid?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
      createIssue({
        id: "workplace-treatment",
        title: "Unfair treatment or discipline",
        rolePrompt: "What is your role in this work matter?",
        roleOptions: EMPLOYMENT_ROLE_OPTIONS,
        whatPrompt: "What happened at work that felt unfair or disciplinary?",
        otherPartyPrompt: "Who is said to have treated you unfairly at work?",
        specificQuestion: textQuestion(
          "treatment-conduct",
          "What conduct or discipline do you say was unfair?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
      createIssue({
        id: "injury-safety",
        title: "Workplace injury or unsafe conditions",
        rolePrompt: "What is your role in this work matter?",
        roleOptions: EMPLOYMENT_ROLE_OPTIONS,
        whatPrompt: "What happened in the injury or safety incident?",
        otherPartyPrompt: "Who managed the workplace or supervised the work?",
        specificQuestion: textQuestion(
          "unsafe-condition",
          "What unsafe condition or incident do you say caused the harm?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
      createIssue({
        id: "contract-terms",
        title: "Employment contract or terms",
        rolePrompt: "What is your role in this work matter?",
        roleOptions: EMPLOYMENT_ROLE_OPTIONS,
        whatPrompt: "What happened with the contract or work terms?",
        otherPartyPrompt: "Who agreed or explained the work terms to you?",
        specificQuestion: textQuestion(
          "term-in-dispute",
          "Which contract term or promise is in dispute?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
    ],
  },
  "family-succession": {
    departmentId: "family-succession",
    version: MODULE_VERSION,
    issues: [
      createIssue({
        id: "estate-administration",
        title: "Managing a deceased person's estate",
        rolePrompt: "What is your role in this family matter?",
        roleOptions: FAMILY_ROLE_OPTIONS,
        whatPrompt: "What happened after the person died or the estate changed?",
        otherPartyPrompt: "Who else is involved in managing the estate?",
        specificQuestion: textQuestion(
          "estate-step",
          "Has anyone taken out letters or started managing the estate?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
      createIssue({
        id: "inheritance-dispute",
        title: "Inheritance or beneficiary dispute",
        rolePrompt: "What is your role in this family matter?",
        roleOptions: FAMILY_ROLE_OPTIONS,
        whatPrompt: "What happened in the inheritance or beneficiary dispute?",
        otherPartyPrompt: "Who else is contesting the inheritance or shares?",
        specificQuestion: textQuestion(
          "inheritance-point",
          "What share, property, or decision do you say is being disputed?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
      createIssue({
        id: "will-question",
        title: "A will or suspected will",
        rolePrompt: "What is your role in this family matter?",
        roleOptions: FAMILY_ROLE_OPTIONS,
        whatPrompt: "What happened with the will or suspected will?",
        otherPartyPrompt: "Who is keeping, relying on, or questioning the will?",
        specificQuestion: textQuestion(
          "will-source",
          "Who told you there is, or may be, a will?",
          "short-text",
          "THIRD_PARTY_STATEMENT",
        ),
      }),
      createIssue({
        id: "family-maintenance",
        title: "Family maintenance or support",
        rolePrompt: "What is your role in this family matter?",
        roleOptions: FAMILY_ROLE_OPTIONS,
        whatPrompt: "What happened with the support or maintenance problem?",
        otherPartyPrompt: "Who should provide support, or who is affected by it?",
        specificQuestion: textQuestion(
          "support-needed",
          "What support is needed, and for whom?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
      createIssue({
        id: "guardianship-care",
        title: "Guardianship or care of a child",
        rolePrompt: "What is your role in this family matter?",
        roleOptions: FAMILY_ROLE_OPTIONS,
        whatPrompt: "What happened that led to the care or guardianship issue?",
        otherPartyPrompt: "Who else is involved in decisions about the child?",
        specificQuestion: textQuestion(
          "child-care-focus",
          "Which child or dependant needs care or decision support?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
    ],
  },
  affidavits: {
    departmentId: "affidavits",
    version: MODULE_VERSION,
    issues: [
      createIssue(
        {
          id: "name-identity",
          title: "Name or identity declaration",
          rolePrompt: "What is your role in this declaration?",
          roleOptions: AFFIDAVIT_ROLE_OPTIONS,
          whatPrompt: "What happened that makes this declaration necessary?",
          otherPartyPrompt: "Who asked for, received, or will rely on the declaration?",
          specificQuestion: textQuestion(
            "identity-detail",
            "Which name, date, or identity detail needs declaring?",
            "short-text",
            "USER_STATEMENT",
          ),
        },
        AFFIDAVIT_OUTCOME_OPTIONS,
      ),
      createIssue(
        {
          id: "lost-document",
          title: "Lost document declaration",
          rolePrompt: "What is your role in this declaration?",
          roleOptions: AFFIDAVIT_ROLE_OPTIONS,
          whatPrompt: "What happened to the lost document?",
          otherPartyPrompt: "Who issued, held, or needs the document now?",
          specificQuestion: textQuestion(
            "lost-document-type",
            "Which document was lost, and where was it last used?",
            "short-text",
            "USER_STATEMENT",
          ),
        },
        AFFIDAVIT_OUTCOME_OPTIONS,
      ),
      createIssue(
        {
          id: "relationship-facts",
          title: "Relationship or family facts",
          rolePrompt: "What is your role in this declaration?",
          roleOptions: AFFIDAVIT_ROLE_OPTIONS,
          whatPrompt: "What happened that makes the family facts important now?",
          otherPartyPrompt: "Who needs the family or relationship facts confirmed?",
          specificQuestion: textQuestion(
            "relationship-fact",
            "What relationship or family fact needs to be sworn?",
            "short-text",
            "USER_STATEMENT",
          ),
        },
        AFFIDAVIT_OUTCOME_OPTIONS,
      ),
      createIssue(
        {
          id: "property-ownership",
          title: "Property or ownership statement",
          rolePrompt: "What is your role in this declaration?",
          roleOptions: AFFIDAVIT_ROLE_OPTIONS,
          whatPrompt: "What happened that makes the ownership statement needed?",
          otherPartyPrompt: "Who is questioning, reviewing, or relying on ownership?",
          specificQuestion: textQuestion(
            "ownership-fact",
            "What property or ownership fact needs to be stated?",
            "short-text",
            "USER_STATEMENT",
          ),
        },
        AFFIDAVIT_OUTCOME_OPTIONS,
      ),
    ],
  },
  "business-commercial": {
    departmentId: "business-commercial",
    version: MODULE_VERSION,
    issues: [
      createIssue({
        id: "contract-dispute",
        title: "Business contract dispute",
        rolePrompt: "What is your role in this business matter?",
        roleOptions: BUSINESS_ROLE_OPTIONS,
        whatPrompt: "What happened under the business contract?",
        otherPartyPrompt: "Who is the other business or person in the contract?",
        specificQuestion: textQuestion(
          "contract-breach",
          "What breach or failure do you say happened under the contract?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
      createIssue({
        id: "partnership-founder",
        title: "Partnership or founder disagreement",
        rolePrompt: "What is your role in this business matter?",
        roleOptions: BUSINESS_ROLE_OPTIONS,
        whatPrompt: "What happened in the partnership or founder disagreement?",
        otherPartyPrompt: "Who else is involved in the ownership or founder dispute?",
        specificQuestion: textQuestion(
          "founder-dispute",
          "What disagreement do you say exists about roles, money, or shares?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
      createIssue({
        id: "supplier-customer",
        title: "Supplier or customer problem",
        rolePrompt: "What is your role in this business matter?",
        roleOptions: BUSINESS_ROLE_OPTIONS,
        whatPrompt: "What happened with the supplier or customer relationship?",
        otherPartyPrompt: "Who is the supplier, customer, or intermediary involved?",
        specificQuestion: textQuestion(
          "supply-problem",
          "What problem do you say happened with the supplier or customer?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
      createIssue({
        id: "company-governance",
        title: "Company ownership or management",
        rolePrompt: "What is your role in this business matter?",
        roleOptions: BUSINESS_ROLE_OPTIONS,
        whatPrompt: "What happened with company ownership or management?",
        otherPartyPrompt: "Who made or is resisting the management decision?",
        specificQuestion: textQuestion(
          "governance-dispute",
          "What ownership or management decision do you say is disputed?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
      createIssue({
        id: "business-agreement",
        title: "Preparing a business agreement",
        rolePrompt: "What is your role in this business matter?",
        roleOptions: BUSINESS_ROLE_OPTIONS,
        whatPrompt: "What happened that led you to need a business agreement?",
        otherPartyPrompt: "Who else will sign, rely on, or be bound by the agreement?",
        specificQuestion: textQuestion(
          "agreement-type",
          "What kind of business agreement do you need prepared?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
    ],
  },
  "vehicles-assets": {
    departmentId: "vehicles-assets",
    version: MODULE_VERSION,
    issues: [
      createIssue({
        id: "buying-vehicle",
        title: "Buying a vehicle or asset",
        rolePrompt: "What is your role in this vehicle or asset matter?",
        roleOptions: VEHICLE_ROLE_OPTIONS,
        whatPrompt: "What happened in the vehicle or asset purchase so far?",
        otherPartyPrompt: "Who is selling, brokering, or holding the asset?",
        specificQuestion: textQuestion(
          "seller-statement",
          "What did the seller tell you about ownership or condition?",
          "short-text",
          "THIRD_PARTY_STATEMENT",
        ),
      }),
      createIssue({
        id: "selling-vehicle",
        title: "Selling a vehicle or asset",
        rolePrompt: "What is your role in this vehicle or asset matter?",
        roleOptions: VEHICLE_ROLE_OPTIONS,
        whatPrompt: "What happened in the sale of the vehicle or asset?",
        otherPartyPrompt: "Who is buying, inspecting, or holding the asset now?",
        specificQuestion: textQuestion(
          "sale-term",
          "What asset is being sold, and what sale term is disputed?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
      createIssue({
        id: "logbook-transfer",
        title: "Logbook or ownership transfer",
        rolePrompt: "What is your role in this vehicle or asset matter?",
        roleOptions: VEHICLE_ROLE_OPTIONS,
        whatPrompt: "What happened in the ownership transfer process?",
        otherPartyPrompt: "Who has the logbook, plates, or transfer documents?",
        specificQuestion: textQuestion(
          "missing-transfer-step",
          "What transfer step or document is still missing?",
          "short-text",
          "USER_STATEMENT",
        ),
      }),
      createIssue({
        id: "payment-possession",
        title: "Payment or possession dispute",
        rolePrompt: "What is your role in this vehicle or asset matter?",
        roleOptions: VEHICLE_ROLE_OPTIONS,
        whatPrompt: "What happened with the payment or possession problem?",
        otherPartyPrompt: "Who has the asset, keys, money, or control right now?",
        specificQuestion: textQuestion(
          "payment-possession-point",
          "What payment or possession problem do you say happened?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
      createIssue({
        id: "condition-fraud-concern",
        title: "Condition or document concern",
        rolePrompt: "What is your role in this vehicle or asset matter?",
        roleOptions: VEHICLE_ROLE_OPTIONS,
        whatPrompt: "What happened with the condition or document concern?",
        otherPartyPrompt: "Who gave the condition details or ownership papers?",
        specificQuestion: textQuestion(
          "hidden-concern",
          "What condition or document concern do you say was hidden?",
          "short-text",
          "USER_ALLEGATION",
        ),
      }),
    ],
  },
} satisfies Readonly<Record<DepartmentId, DepartmentIntakeBlueprint>>;

export const INTAKE_MODULES = {
  "land-tenancy": buildModule(
    "land-tenancy",
    INTAKE_MODULE_BLUEPRINTS["land-tenancy"].issues,
  ),
  "debt-small-claims": buildModule(
    "debt-small-claims",
    INTAKE_MODULE_BLUEPRINTS["debt-small-claims"].issues,
  ),
  employment: buildModule("employment", INTAKE_MODULE_BLUEPRINTS.employment.issues),
  "family-succession": buildModule(
    "family-succession",
    INTAKE_MODULE_BLUEPRINTS["family-succession"].issues,
  ),
  affidavits: buildModule("affidavits", INTAKE_MODULE_BLUEPRINTS.affidavits.issues),
  "business-commercial": buildModule(
    "business-commercial",
    INTAKE_MODULE_BLUEPRINTS["business-commercial"].issues,
  ),
  "vehicles-assets": buildModule(
    "vehicles-assets",
    INTAKE_MODULE_BLUEPRINTS["vehicles-assets"].issues,
  ),
} satisfies Readonly<Record<DepartmentId, DepartmentIntakeModule>>;

export function getIntakeModule(departmentId: DepartmentId) {
  return INTAKE_MODULES[departmentId];
}

export function getIssueModule(departmentId: DepartmentId, issueId: string) {
  return getIntakeModule(departmentId).issues.find((issue) => issue.id === issueId);
}
