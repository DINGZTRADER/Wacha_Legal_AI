"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { routeNarrative } from "./routing";
import { assessSafety } from "./safety";
import { DEPARTMENTS, getDepartment } from "../departments/registry";

const STORAGE_KEY = "wacha_concierge_narrative";

export function ConciergePanel() {
  const [submitted, setSubmitted] = useState(() => {
    try {
      if (typeof window !== "undefined" && "localStorage" in window && window.localStorage) {
        return window.localStorage.getItem(STORAGE_KEY) || "";
      }
    } catch {
      // Ignore storage error
    }
    return "";
  });

  const [input, setInput] = useState(submitted);
  const [clarification, setClarification] = useState("");

  const fullText = useMemo(() => {
    return clarification ? `${submitted}. Clarification: ${clarification}` : submitted;
  }, [submitted, clarification]);

  const result = useMemo(() => (fullText ? routeNarrative(fullText) : null), [fullText]);
  const safety = useMemo(() => (fullText ? assessSafety(fullText) : null), [fullText]);
  const department = result?.departmentId ? getDepartment(result.departmentId) : null;

  const handleSubmit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitted(trimmed);
    setClarification("");
    try {
      if (typeof window !== "undefined" && "localStorage" in window && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, trimmed);
      }
    } catch {
      // Ignore storage error
    }
  };

  const handleReset = () => {
    setInput("");
    setSubmitted("");
    setClarification("");
    try {
      if (typeof window !== "undefined" && "localStorage" in window && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage error
    }
  };

  return (
    <section className="concierge-card" aria-labelledby="concierge-title" style={{ transition: "all 0.3s ease" }}>
      <div className="concierge-head" style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <span className="status-dot" style={{ background: "#10b981", width: "12px", height: "12px", borderRadius: "50%", display: "inline-block" }} />
        <div>
          <p className="eyebrow" style={{ margin: 0, fontSize: "0.75rem", color: "#2563eb", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            🤖 Intelligent Wacha AI Concierge
          </p>
          <h2 id="concierge-title" style={{ margin: 0, fontSize: "1.5rem" }}>
            How can I guide your legal issue today?
          </h2>
        </div>
      </div>

      <p className="muted" style={{ fontSize: "0.92rem", color: "#6b7280", marginBottom: "1.25rem" }}>
        Describe your situation, or select a quick topic below. Wacha will analyze safety risks, direct you to the exact department, and prepare your document summaries automatically.
      </p>

      {/* Quick Topic Starter Chips */}
      {!submitted && (
        <div style={{ marginBottom: "1.25rem" }}>
          <small style={{ fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "0.5rem" }}>
            Popular paths:
          </small>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {[
              { label: "🏠 Landlord / Rent Dispute", text: "My landlord locked me out of my rental property even though I paid my monthly rent on time." },
              { label: "💼 Unpaid Salary / Dismissal", text: "My employer dismissed me without notice and refused to pay my final month salary and severance." },
              { label: "💰 Money Owed / Debt", text: "A client owes me UGX 4,500,000 for delivered goods and is refusing to answer my payment calls." },
              { label: "🚗 Vehicle Sale / Agreement", text: "I am buying a used car and need a legally sound sale agreement and logbook transfer checklist." },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInput(chip.text);
                  handleSubmit(chip.text);
                }}
                style={{
                  fontSize: "0.8rem",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "20px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!submitted ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(input);
          }}
        >
          <label htmlFor="story" style={{ fontWeight: "600", display: "block", marginBottom: "0.5rem" }}>
            Describe your situation in your own words
          </label>
          <textarea
            id="story"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            minLength={10}
            required
            rows={4}
            placeholder="e.g. I sold equipment to a company in Jinja, but they failed to pay the agreed installment on August 15..."
            style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
          />
          <div className="form-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
            <small style={{ color: "#6b7280" }}>Your story is securely processed under Ugandan privacy laws.</small>
            <button type="submit" style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", background: "#2563eb", color: "#fff", border: 0, fontWeight: "600", cursor: "pointer" }}>
              Analyze & Direct Me →
            </button>
          </div>
        </form>
      ) : (
        <div className="concierge-active-state" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="user-story-summary" style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "0.9rem", color: "#334155" }}>Your Reported Intake Summary:</strong>
              <button type="button" onClick={handleReset} style={{ background: "none", border: 0, color: "#ef4444", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                ✏️ Start Fresh
              </button>
            </div>
            <p style={{ margin: "0.5rem 0 0 0", color: "#1e293b", fontSize: "0.95rem" }}>&quot;{submitted}&quot;</p>
            {clarification && (
              <p className="clarification-note" style={{ margin: "0.5rem 0 0 0", color: "#2563eb", fontSize: "0.88rem" }}>
                <strong>Added Clarification:</strong> &quot;{clarification}&quot;
              </p>
            )}
          </div>

          {/* Intelligently Guided Direction Box */}
          {safety && (
            <div
              className={`result ${safety.level}`}
              role="status"
              style={{
                padding: "1.25rem",
                borderRadius: "10px",
                borderLeft: "6px solid",
                borderColor: safety.level === "emergency" ? "#dc2626" : safety.level === "mandatory-review" ? "#d97706" : "#2563eb",
                background: safety.level === "emergency" ? "#fef2f2" : safety.level === "mandatory-review" ? "#fffbeb" : "#eff6ff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.25rem" }}>
                  {safety.level === "emergency" ? "🚨" : department ? department.icon : "💡"}
                </span>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                  {safety.level === "emergency"
                    ? "Urgent Safety Assistance Required"
                    : department
                    ? `Recommended Pathway: ${department.title}`
                    : "Additional Details Needed"}
                </h3>
              </div>

              <p style={{ margin: "0 0 0.75rem 0", color: "#374151" }}>{safety.message}</p>

              {result?.reasons && result.reasons.length > 0 && (
                <div style={{ fontSize: "0.88rem", color: "#4b5563", marginBottom: "1rem" }}>
                  <strong>Analysis:</strong>
                  <ul style={{ margin: "0.25rem 0 0 1.25rem", padding: 0 }}>
                    {result.reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Direct Next Action Buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem" }}>
                {department && (
                  <Link
                    href={`/departments/${department.id}`}
                    style={{
                      padding: "0.65rem 1.25rem",
                      borderRadius: "6px",
                      background: "#2563eb",
                      color: "#ffffff",
                      textDecoration: "none",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    Open {department.title} Tools & Generator →
                  </Link>
                )}

                <Link
                  href="/matters/new"
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: "6px",
                    background: "#1e293b",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  Save as Immutable Legal Matter 📁
                </Link>

                <Link
                  href="/advocate"
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: "6px",
                    background: "#059669",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  Request Enrolled Advocate Review ⚖️
                </Link>
              </div>
            </div>
          )}

          {result?.needsClarification && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const val = (form.elements.namedItem("more") as HTMLInputElement)?.value;
                if (val) setClarification(val);
              }}
              style={{ background: "#f1f5f9", padding: "1rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            >
              <label htmlFor="more" style={{ fontWeight: "600", display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                To refine your direction, can you add one detail (e.g. location, dates, or counterparty)?
              </label>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  id="more"
                  name="more"
                  required
                  placeholder="e.g. Occurred in Kampala last week"
                  style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #94a3b8" }}
                />
                <button type="submit" style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#475569", color: "#fff", border: 0, fontWeight: "600" }}>
                  Update Concierge
                </button>
              </div>
            </form>
          )}

          {/* Quick Jump Grid to All Departments */}
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
            <small style={{ fontWeight: "600", color: "#64748b", display: "block", marginBottom: "0.5rem" }}>
              Or explore another department directly:
            </small>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.5rem" }}>
              {DEPARTMENTS.map((dept) => (
                <Link
                  key={dept.id}
                  href={`/departments/${dept.id}`}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    textDecoration: "none",
                    color: "#334155",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span>{dept.icon}</span>
                  <span>{dept.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
