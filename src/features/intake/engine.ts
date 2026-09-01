import type { DepartmentId } from "../departments/registry";
import {
  CaseReviewSchema,
  IntakeAnswerSchema,
  IntakeSessionSchema,
  IsoDateTimeSchema,
  IssueModuleSchema,
  type CaseReview,
  type DepartmentIntakeModule,
  type IntakeAnswer,
  type IntakeSession,
  type IssueModule,
  type Question as IntakeQuestion,
} from "./model";
import { INTAKE_MODULE_BLUEPRINTS, getIntakeModule, getIssueModule } from "./modules";

type AnswerInput = {
  questionId: string;
  value: string | boolean;
};

type LabelledAnswer = {
  questionId: string;
  label: string;
  value: string | boolean | null;
  provenance: IntakeAnswer["provenance"] | null;
};

type CaseReviewProjection = CaseReview & {
  labelledAnswers: readonly LabelledAnswer[];
  missingQuestionIds: readonly string[];
  conflicts: readonly never[];
};

export function createIntakeSession(
  input: {
    departmentId: DepartmentId;
    issueId: string;
    originalNarrative: string;
  },
  now: string,
  id: string,
): IntakeSession {
  const intakeModule: DepartmentIntakeModule = getIntakeModule(input.departmentId);
  const issue = getIssueModule(input.departmentId, input.issueId);

  if (!issue) {
    throw new Error(`Unknown intake issue: ${input.issueId}`);
  }

  return IntakeSessionSchema.parse({
    id,
    departmentId: input.departmentId,
    issueId: input.issueId,
    moduleVersion: intakeModule.version,
    originalNarrative: input.originalNarrative,
    answers: [],
    currentQuestionId: issue.questions[0].id,
    status: "in-progress",
    createdAt: now,
    updatedAt: now,
  });
}

export function answerQuestion(
  session: IntakeSession,
  issue: IssueModule,
  input: AnswerInput,
  now: string,
): IntakeSession {
  return updateAnswer(session, issue, input, now, false);
}

export function reviseAnswer(
  session: IntakeSession,
  issue: IssueModule,
  input: AnswerInput,
  now: string,
): IntakeSession {
  const parsedSession = IntakeSessionSchema.parse(session);
  if (!parsedSession.answers.some(({ questionId }) => questionId === input.questionId)) {
    throw new Error(`Cannot revise unanswered intake question: ${input.questionId}`);
  }

  return updateAnswer(parsedSession, issue, input, now, true);
}

export function getVisibleQuestions(
  issue: IssueModule,
  answers: readonly IntakeAnswer[],
): readonly IntakeQuestion[] {
  IssueModuleSchema.parse(issue);
  const parsedAnswers = IntakeAnswerSchema.array().parse(answers);
  const answersByQuestion = new Map(
    parsedAnswers.map((answer) => [answer.questionId, answer.value] as const),
  );
  const visibleQuestionIds = new Set<string>();

  return issue.questions.filter((question) => {
    if (!question.showWhen) {
      visibleQuestionIds.add(question.id);
      return true;
    }

    const isVisible =
      visibleQuestionIds.has(question.showWhen.questionId) &&
      answersByQuestion.get(question.showWhen.questionId) === question.showWhen.equals;

    if (isVisible) {
      visibleQuestionIds.add(question.id);
    }

    return isVisible;
  });
}

export function getCurrentQuestion(
  session: IntakeSession,
  issue: IssueModule,
): IntakeQuestion | null {
  const parsedSession = IntakeSessionSchema.parse(session);
  const visibleQuestions = getVisibleQuestions(issue, parsedSession.answers);
  const answeredQuestionIds = new Set(parsedSession.answers.map(({ questionId }) => questionId));

  if (
    visibleQuestions
      .filter(({ required }) => required)
      .every(({ id }) => answeredQuestionIds.has(id))
  ) {
    return null;
  }

  return visibleQuestions.find(({ id }) => !answeredQuestionIds.has(id)) ?? null;
}

export function getProgress(
  session: IntakeSession,
  issue: IssueModule,
): { answered: number; total: number; percent: number } {
  const parsedSession = IntakeSessionSchema.parse(session);
  const visibleQuestions = getVisibleQuestions(issue, parsedSession.answers);
  const visibleQuestionIds = new Set(visibleQuestions.map(({ id }) => id));
  const answered = new Set(
    parsedSession.answers
      .filter(({ questionId }) => visibleQuestionIds.has(questionId))
      .map(({ questionId }) => questionId),
  ).size;
  const total = visibleQuestions.length;

  return {
    answered,
    total,
    percent: total === 0 ? 100 : Math.round((answered / total) * 100),
  };
}

export function buildCaseReview(
  session: IntakeSession,
  issue: IssueModule,
): CaseReviewProjection {
  const parsedSession = IntakeSessionSchema.parse(session);
  const visibleQuestions = getVisibleQuestions(issue, parsedSession.answers);
  const answersByQuestion = new Map(
    parsedSession.answers.map((answer) => [answer.questionId, answer] as const),
  );
  const orderedAnswers = visibleQuestions.flatMap((question) => {
    const answer = answersByQuestion.get(question.id);
    return answer ? [answer] : [];
  });
  const missingQuestionIds = visibleQuestions
    .filter(({ id }) => !answersByQuestion.has(id))
    .map(({ id }) => id);
  const labelledAnswers = visibleQuestions.map((question): LabelledAnswer => {
    const answer = answersByQuestion.get(question.id);
    return {
      questionId: question.id,
      label: question.prompt,
      value: answer?.value ?? null,
      provenance: answer?.provenance ?? null,
    };
  });
  const review = CaseReviewSchema.parse({
    originalNarrative: parsedSession.originalNarrative,
    answers: orderedAnswers,
    currentQuestionId: parsedSession.currentQuestionId,
    status: parsedSession.status,
  });

  return {
    ...review,
    labelledAnswers,
    missingQuestionIds,
    conflicts: [],
  };
}

function updateAnswer(
  session: IntakeSession,
  issue: IssueModule,
  input: AnswerInput,
  now: string,
  isRevision: boolean,
): IntakeSession {
  const parsedSession = IntakeSessionSchema.parse(session);
  const parsedIssue = IssueModuleSchema.parse(issue);
  IsoDateTimeSchema.parse(now);

  if (parsedSession.issueId !== parsedIssue.id) {
    throw new Error(`Intake session issue does not match: ${parsedIssue.id}`);
  }

  const question = parsedIssue.questions.find(({ id }) => id === input.questionId);
  if (!question) {
    throw new Error(`Unknown intake question: ${input.questionId}`);
  }

  if (!getVisibleQuestions(parsedIssue, parsedSession.answers).some(({ id }) => id === question.id)) {
    throw new Error(`Intake question is not currently visible: ${input.questionId}`);
  }

  validateQuestionValue(question, input.value);
  const previousAnswer = parsedSession.answers.find(
    ({ questionId }) => questionId === input.questionId,
  );
  const nextAnswer = IntakeAnswerSchema.parse({
    questionId: input.questionId,
    value: input.value,
    provenance: getQuestionProvenance(parsedSession, input.questionId),
    answeredAt: isRevision && previousAnswer ? previousAnswer.answeredAt : now,
    revisedAt: isRevision ? now : undefined,
  });
  const candidateAnswers = [
    ...parsedSession.answers.filter(({ questionId }) => questionId !== input.questionId),
    nextAnswer,
  ];
  const visibleQuestionIds = new Set(
    getVisibleQuestions(parsedIssue, candidateAnswers).map(({ id }) => id),
  );
  const answers = candidateAnswers.filter(({ questionId }) => visibleQuestionIds.has(questionId));
  const candidateSession = IntakeSessionSchema.parse({
    ...parsedSession,
    answers,
    updatedAt: now,
  });
  const currentQuestion = getCurrentQuestion(candidateSession, parsedIssue);

  return IntakeSessionSchema.parse({
    ...candidateSession,
    currentQuestionId: currentQuestion?.id ?? null,
    status: currentQuestion ? "in-progress" : "review-ready",
  });
}

function validateQuestionValue(question: IntakeQuestion, value: string | boolean): void {
  if (question.kind === "yes-no" && typeof value !== "boolean") {
    throw new Error(`Intake question requires a boolean answer: ${question.id}`);
  }

  if (question.kind !== "yes-no" && typeof value !== "string") {
    throw new Error(`Intake question requires a text answer: ${question.id}`);
  }

  if (
    question.kind === "single-choice" &&
    typeof value === "string" &&
    !question.options.some((option) => option.value === value)
  ) {
    throw new Error(`Invalid option for intake question: ${question.id}`);
  }
}

function getQuestionProvenance(
  session: IntakeSession,
  questionId: string,
): IntakeAnswer["provenance"] {
  const departmentBlueprint = INTAKE_MODULE_BLUEPRINTS[session.departmentId];
  const issueBlueprint = departmentBlueprint.issues.find(({ id }) => id === session.issueId);
  const questionBlueprint = issueBlueprint?.questions.find(({ id }) => id === questionId);

  if (!questionBlueprint) {
    throw new Error(`Missing provenance for intake question: ${questionId}`);
  }

  return questionBlueprint.answerProvenance;
}
