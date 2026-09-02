import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import type { IssueModule } from "./model";
import { INTAKE_MODULES } from "./modules";
import { LocalMatterRepository } from "../matters/store";
import { GuidedIntake } from "./guided-intake";

const NARRATIVE = "My employer dismissed me after five years of work.";
const DATE_OPTIONAL_ISSUE: IssueModule = {
  id: "date-optional-test",
  title: "Date and optional detail test",
  questions: [
    {
      id: "urgent-triage",
      prompt: "Urgent safety/deadline check: threatened, locked out, arrested, harmed, or given a deadline?",
      kind: "single-choice",
      required: true,
      answerProvenance: "USER_STATEMENT",
      options: [
        { value: "urgent", label: "Yes — notice, lockout, threat, or removal" },
        { value: "not-urgent", label: "No — no urgent safety or deadline issue" },
        { value: "not-sure", label: "Not sure" },
      ],
    },
    {
      id: "event-date",
      prompt: "When did the event happen?",
      kind: "date",
      required: true,
      answerProvenance: "USER_STATEMENT",
    },
    {
      id: "optional-detail",
      prompt: "Is there any optional detail?",
      kind: "short-text",
      required: false,
      answerProvenance: "USER_STATEMENT",
    },
  ],
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  const issueIndex = INTAKE_MODULES.employment.issues.findIndex(
    ({ id }) => id === DATE_OPTIONAL_ISSUE.id,
  );
  if (issueIndex >= 0) {
    INTAKE_MODULES.employment.issues.splice(issueIndex, 1);
  }
});

async function completeDismissalIntake() {
  const user = userEvent.setup();

  render(
    <GuidedIntake
      departmentId="employment"
      issueId="dismissal"
      originalNarrative={NARRATIVE}
    />,
  );

  await user.click(screen.getByRole("radio", { name: /no.*urgent safety or deadline issue/i }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: "Employee or former employee" }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.type(screen.getByRole("textbox", { name: "Your answer" }), "I was dismissed.");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.type(screen.getByRole("textbox", { name: "Your answer" }), "31 August 2026");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.type(screen.getByRole("textbox", { name: "Your answer" }), "The managing director");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.type(screen.getByRole("textbox", { name: "Your answer" }), "I requested reasons.");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: "Understand my position" }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.type(screen.getByRole("textbox", { name: "Your answer" }), "No reason was given.");
  await user.click(screen.getByRole("button", { name: "Continue" }));

  return user;
}

test("renders one labelled question, advances, and preserves an answer when going Back", async () => {
  const user = userEvent.setup();
  render(
    <GuidedIntake
      departmentId="employment"
      issueId="dismissal"
      originalNarrative={NARRATIVE}
    />,
  );

  expect(screen.getByRole("heading", { name: "Dismissal or forced resignation" })).toBeVisible();
  expect(screen.getAllByText(NARRATIVE)).toHaveLength(1);
  expect(screen.getByRole("group", { name: /urgent safety.*deadline check/i })).toBeVisible();
  expect(screen.getByText("Step 1 of 8")).toBeVisible();
  expect(screen.getByText(/13% complete/)).toBeVisible();
  expect(screen.getByText(/about 3 minutes remaining/i)).toBeVisible();

  await user.click(screen.getByRole("radio", { name: /no.*urgent safety or deadline issue/i }));
  await user.click(screen.getByRole("button", { name: "Continue" }));

  expect(screen.getByRole("group", { name: "What is your role in this work matter?" })).toBeVisible();
  expect(screen.getByText("Step 2 of 8")).toBeVisible();
  expect(screen.getByText(/25% complete/)).toBeVisible();

  const employee = screen.getByRole("radio", { name: "Employee or former employee" });
  expect(employee).toHaveAccessibleName("Employee or former employee");
  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();

  await user.click(employee);
  await user.click(screen.getByRole("button", { name: "Continue" }));

  expect(
    screen.getByRole("group", { name: "What happened with the dismissal or resignation?" }),
  ).toBeVisible();
  expect(screen.getByText("Step 3 of 8")).toBeVisible();
  expect(screen.getByText(/38% complete/)).toBeVisible();

  await user.click(screen.getByRole("button", { name: "Back" }));

  expect(screen.getByRole("group", { name: "What is your role in this work matter?" })).toBeVisible();
  expect(screen.getByRole("radio", { name: "Employee or former employee" })).toBeChecked();
});

test("shows answer provenance on review and supports correction before a session-only save", async () => {
  const user = await completeDismissalIntake();

  expect(screen.getByRole("heading", { name: "What you told us" })).toBeVisible();
  expect(screen.getByText("THIRD_PARTY_STATEMENT")).toBeVisible();

  const roleAnswer = screen
    .getByText("What is your role in this work matter?")
    .closest("article");
  expect(roleAnswer).not.toBeNull();
  await user.click(within(roleAnswer!).getByRole("button", { name: "Change" }));

  expect(
    screen.getByRole("group", { name: "What is your role in this work matter?" }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Save change" })).toBeVisible();
  await user.click(screen.getByRole("radio", { name: "Employer or manager" }));
  await user.click(screen.getByRole("button", { name: "Save change" }));

  expect(screen.getByText("Employer or manager")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Save this case on this device" }));

  expect(await screen.findByRole("status")).toHaveTextContent(
    "Saved for this session. Private device storage arrives in the next release stage.",
  );
}, 20_000);

test("visibly labels user allegations on review", async () => {
  const user = userEvent.setup();
  render(
    <GuidedIntake
      departmentId="employment"
      issueId="workplace-treatment"
      originalNarrative="My employer disciplined me after I raised a concern."
    />,
  );

  await user.click(screen.getByRole("radio", { name: /no.*urgent safety or deadline issue/i }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: "Employee or former employee" }));
  await user.click(screen.getByRole("button", { name: "Continue" }));

  for (const answer of [
    "I was disciplined after raising a concern.",
    "31 August 2026",
    "The operations manager",
    "I asked for the decision in writing.",
  ]) {
    await user.type(screen.getByRole("textbox", { name: "Your answer" }), answer);
    await user.click(screen.getByRole("button", { name: "Continue" }));
  }

  await user.click(screen.getByRole("radio", { name: "Understand my position" }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.type(
    screen.getByRole("textbox", { name: "Your answer" }),
    "The warning ignored what I had reported.",
  );
  await user.click(screen.getByRole("button", { name: "Continue" }));

  expect(screen.getByText("USER_ALLEGATION")).toBeVisible();
}, 20_000);

test("does not mark an unchanged review answer as revised", async () => {
  const saveSpy = vi.spyOn(LocalMatterRepository.prototype, "save");
  const user = await completeDismissalIntake();
  const roleAnswer = screen
    .getByText("What is your role in this work matter?")
    .closest("article");

  expect(roleAnswer).not.toBeNull();
  await user.click(within(roleAnswer!).getByRole("button", { name: "Change" }));
  expect(screen.getByRole("radio", { name: "Employee or former employee" })).toBeChecked();
  await user.click(screen.getByRole("button", { name: "Save change" }));
  await user.click(screen.getByRole("button", { name: "Save this case on this device" }));
  await screen.findByRole("status");

  const savedDraft = saveSpy.mock.calls[0]?.[0];
  const role = savedDraft?.answers.find(({ questionId }) => questionId === "role");
  expect(role).toBeDefined();
  expect(role?.revisedAt).toBeUndefined();
}, 20_000);

test("renders a native date input and shows Not answered for a missing optional answer", async () => {
  INTAKE_MODULES.employment.issues.push(DATE_OPTIONAL_ISSUE);
  const user = userEvent.setup();
  render(
    <GuidedIntake
      departmentId="employment"
      issueId={DATE_OPTIONAL_ISSUE.id}
      originalNarrative="The event date is known but the extra detail is not available."
    />,
  );

  await user.click(screen.getByRole("radio", { name: /no.*urgent safety or deadline issue/i }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  const dateInput = screen.getByLabelText("Date");
  expect(dateInput).toHaveAttribute("type", "date");
  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  await user.type(dateInput, "2026-08-31");
  await user.click(screen.getByRole("button", { name: "Continue" }));

  expect(screen.getByRole("heading", { name: "What you told us" })).toBeVisible();
  const optionalAnswer = screen.getByText("Is there any optional detail?").closest("article");
  expect(optionalAnswer).not.toBeNull();
  expect(within(optionalAnswer!).getAllByText("Not answered")).not.toHaveLength(0);
}, 20_000);

test("renders recovery guidance for an invalid issue instead of throwing", () => {
  render(
    <GuidedIntake
      departmentId="employment"
      issueId="not-a-real-issue"
      originalNarrative={NARRATIVE}
    />,
  );

  expect(screen.getByRole("alert")).toHaveTextContent("We could not load this guided intake.");
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Please return to the issue list and choose your matter again.",
  );
  expect(screen.queryByRole("group")).not.toBeInTheDocument();
});

test("shows a privacy promise and an urgent triage before the standard questions", async () => {
  const user = userEvent.setup();
  render(
    <GuidedIntake
      departmentId="land-tenancy"
      issueId="rent-tenancy-eviction"
      originalNarrative="My landlord gave me a notice to leave."
    />,
  );

  expect(screen.getByText(/do not share passwords.*bank details/i)).toBeVisible();
  expect(screen.getByRole("link", { name: /privacy guidance/i })).toHaveAttribute(
    "href",
    "#privacy-guidance",
  );
  expect(screen.getByRole("group", { name: /urgent safety.*deadline check/i })).toBeVisible();
  expect(screen.getByRole("radio", { name: /yes.*notice.*lockout/i })).toBeVisible();

  await user.click(screen.getByRole("radio", { name: /yes.*notice.*lockout/i }));
  await user.click(screen.getByRole("button", { name: /continue/i }));

  expect(screen.getByRole("alert")).toHaveTextContent(/urgent help/i);
  expect(screen.getByRole("alert")).toHaveTextContent(/enrolled advocate/i);
  expect(screen.queryByRole("group", { name: /what is your position/i })).not.toBeInTheDocument();
});

test("uses mutually exclusive land role labels and offers an exit before answering", () => {
  render(
    <GuidedIntake
      departmentId="land-tenancy"
      issueId="land-sale-transfer-title"
      originalNarrative="I need help with a land transfer."
    />,
  );

  const user = userEvent.setup();
  expect(screen.getByRole("link", { name: /exit intake/i })).toHaveAttribute(
    "href",
    "/departments/land-tenancy",
  );
  return user
    .click(screen.getByRole("radio", { name: /no.*urgent safety or deadline issue/i }))
    .then(() => user.click(screen.getByRole("button", { name: /continue/i })))
    .then(() => {
      expect(screen.getByRole("radio", { name: "Tenant or occupant" })).toBeVisible();
    });
});
