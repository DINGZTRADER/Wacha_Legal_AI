"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DEPARTMENTS, type DepartmentId } from "@/features/departments/registry";
import { MatterDraftSchema } from "@/features/matters/schema";
import { LocalMatterRepository, type Matter } from "@/features/matters/store";

const repo = new LocalMatterRepository();
const LEGACY_SUMMARY_ISSUE_ID = "legacy-summary";
const LEGACY_SUMMARY_MODULE_VERSION = "legacy-summary-v1";

export default function NewMatter() {
  const [departmentId, setDepartmentId] = useState<DepartmentId>("land-tenancy");
  const [summary, setSummary] = useState(() => {
    try {
      if (typeof window !== "undefined" && "localStorage" in window && window.localStorage) {
        return window.localStorage.getItem("wacha_concierge_narrative") || "";
      }
    } catch {
      // Ignore storage error
    }
    return "";
  });
  const [error, setError] = useState<string | null>(null);
  const [savedMatter, setSavedMatter] = useState<Matter | null>(null);
  const [isSaving, setIsSaving] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    // Temporary compatibility bridge until Task 5 replaces this summary form
    // with the guided intake. The narrative is the user's statement; no
    // structured answers are inferred from it.
    const validation = MatterDraftSchema.safeParse({
      departmentId,
      issueId: LEGACY_SUMMARY_ISSUE_ID,
      moduleVersion: LEGACY_SUMMARY_MODULE_VERSION,
      originalNarrative: summary,
      answers: [],
      currentQuestionId: null,
      status: "review-ready",
    });
    if (!validation.success) {
      setError(validation.error.issues.map((i) => i.message).join(". "));
      setIsSaving(false);
      return;
    }

    try {
      const matter = await repo.save(validation.data);
      setSavedMatter(matter);
    } catch {
      setError("Failed to save matter. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell audience="citizen">
      <section className="detail">
        <p className="eyebrow">New matter</p>
        <h1>Save what happened.</h1>
        <p className="lead">
          Save your intake securely to create an immutable matter snapshot for reference or advocate referral.
        </p>

        {summary && (
          <div className="notice" style={{ marginBottom: "1rem" }}>
            <small><strong>Note:</strong> We auto-filled your summary from what you told the Wacha Concierge. You can edit it below if needed.</small>
          </div>
        )}


        {savedMatter ? (
          <div className="result standard" role="status">
            <strong>Matter Created Successfully!</strong>
            <p><strong>ID:</strong> {savedMatter.id}</p>
            <p><strong>Department:</strong> {savedMatter.departmentId}</p>
            <p><strong>Original narrative:</strong> {savedMatter.originalNarrative}</p>
            <p><strong>Created:</strong> {new Date(savedMatter.createdAt).toLocaleString()}</p>
            <button
              onClick={() => {
                setSavedMatter(null);
                setSummary("");
              }}
              className="button-text"
            >
              Create another matter
            </button>
          </div>
        ) : (
          <form className="matter-form" onSubmit={handleSubmit}>
            {error && <div className="result emergency" role="alert"><p>{error}</p></div>}
            <label>
              Department
              <select
                name="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Summary
              <textarea
                name="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                minLength={10}
                maxLength={2000}
                required
                placeholder="Describe the key facts, parties involved, and important dates."
              />
            </label>
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Validate & Save Matter"}
            </button>
          </form>
        )}
      </section>
    </AppShell>
  );
}
