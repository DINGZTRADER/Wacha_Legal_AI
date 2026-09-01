"use client";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DEPARTMENTS, getDepartment, type DepartmentId } from "@/features/departments/registry";
import { LAND_TENANCY_ISSUES } from "@/features/departments/land-tenancy-issues";
import { GuidedIntake } from "@/features/intake/guided-intake";
import { getIntakeModule, getIssueModule } from "@/features/intake/modules";

const STORAGE_KEY = "wacha_concierge_narrative";
const CONTINUATION_KEY = "wacha_concierge_continuation";

type IssueCard = {
  id: string;
  title: string;
  description: string;
  href: string;
};

function isDepartmentId(value: string | null): value is DepartmentId {
  return DEPARTMENTS.some((department) => department.id === value);
}

function readStoredNarrative(): string {
  try {
    if (typeof window !== "undefined" && "localStorage" in window && window.localStorage) {
      return window.localStorage.getItem(STORAGE_KEY) || "";
    }
  } catch {
    // Ignore storage error
  }

  return "";
}

function readConciergeContinuation(): string | null {
  try {
    return window.sessionStorage.getItem(CONTINUATION_KEY);
  } catch {
    return null;
  }
}

function buildIssueCards(departmentId: DepartmentId): IssueCard[] {
  if (departmentId === "land-tenancy") {
    return [...LAND_TENANCY_ISSUES];
  }

  return getIntakeModule(departmentId).issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: `Start the guided intake for ${issue.title.toLowerCase()} and answer one question at a time.`,
    href: `/matters/new?department=${departmentId}&issue=${issue.id}`,
  }));
}

function NewMatterContent() {
  const searchParams = useSearchParams();
  const [originalNarrative, setOriginalNarrative] = useState("");

  const rawDepartmentId = searchParams.get("department");
  const rawIssueId = searchParams.get("issue");
  const departmentId = isDepartmentId(rawDepartmentId) ? rawDepartmentId : null;
  const department = departmentId ? getDepartment(departmentId) : null;
  const issue = rawIssueId && departmentId ? getIssueModule(departmentId, rawIssueId) : null;

  const issueCards = useMemo(
    () => (departmentId ? buildIssueCards(departmentId) : []),
    [departmentId],
  );

  useEffect(() => {
    const continuation = readConciergeContinuation();
    const matchesIssue = continuation === `issue:${rawIssueId}`;
    // Hydrate client-only continuation state after the first render to avoid SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOriginalNarrative(matchesIssue ? readStoredNarrative() : "");

    if (matchesIssue) {
      try {
        window.sessionStorage.removeItem(CONTINUATION_KEY);
      } catch {
        // Ignore storage error
      }
    }
  }, [rawIssueId, rawDepartmentId]);

  return (
    <AppShell audience="citizen">
      {!department ? (
        <section className="detail">
          <p className="eyebrow">Guided intake</p>
          <h1>Choose a department to continue.</h1>
          <div className="result emergency" role="alert">
            <p>We could not confirm a valid department from this link.</p>
          </div>
          <Link className="button" href="/">
            Return to the home page
          </Link>
        </section>
      ) : !rawIssueId ? (
        <section className="detail">
          <Link href={`/departments/${department.id}`}>Back to {department.title}</Link>
          <p className="eyebrow">Guided intake</p>
          <h1>Choose the issue that fits best.</h1>
          <p className="lead">
            Select one issue in {department.title}. Wacha will ask one question at a time and keep your route structured.
          </p>

          {originalNarrative ? (
            <div className="notice">
              <strong>Your concierge summary is ready</strong>
              <p>It will stay attached to the guided intake after you choose an issue. It is not added to the URL.</p>
            </div>
          ) : null}

          <div className="issue-grid">
            {issueCards.map((item, index) => (
              <Link
                key={item.id}
                className="issue-card"
                href={item.href}
                onClick={() => {
                  try {
                    if (window.sessionStorage.getItem(CONTINUATION_KEY) === "pending") {
                      window.sessionStorage.setItem(CONTINUATION_KEY, `issue:${item.id}`);
                    }
                  } catch {
                    // Ignore storage error
                  }
                }}
              >
                <span className="number">{String(index + 1).padStart(2, "0")}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <span className="issue-action">Open guided intake →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : !issue ? (
        <section className="detail">
          <Link href={`/departments/${department.id}`}>Back to {department.title}</Link>
          <p className="eyebrow">Guided intake</p>
          <h1>We could not match that issue.</h1>
          <div className="result emergency" role="alert">
            <p>Please choose one of the valid {department.title} issue routes.</p>
          </div>
          <Link className="button" href={`/matters/new?department=${department.id}`}>
            Choose a valid {department.title} issue
          </Link>
        </section>
      ) : (
        <>
          {!originalNarrative ? (
            <section className="detail" style={{ paddingBottom: 0 }}>
              <div className="notice">
                <strong>No concierge summary was supplied</strong>
                <p>You chose this issue directly, so Wacha will collect the key facts through the guided questions.</p>
              </div>
            </section>
          ) : null}
          <GuidedIntake
            departmentId={department.id}
            issueId={issue.id}
            originalNarrative={originalNarrative}
          />
        </>
      )}
    </AppShell>
  );
}

export default function NewMatter() {
  return (
    <Suspense
      fallback={
        <AppShell audience="citizen">
          <section className="detail" aria-live="polite">
            <p className="eyebrow">Guided intake</p>
            <h1>Loading your guided pathway…</h1>
          </section>
        </AppShell>
      }
    >
      <NewMatterContent />
    </Suspense>
  );
}
