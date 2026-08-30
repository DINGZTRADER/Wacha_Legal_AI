"use client";
import { useMemo, useState } from "react";

export type GenericDocFacts = {
  partyA: string;
  partyB: string;
  amountOrSubject: string;
  effectiveDate: string;
  keyTerms: string;
};

export function GenericDocumentBuilder({
  departmentTitle,
  documentName,
  defaultSubjectPlaceholder,
}: {
  departmentTitle: string;
  documentName: string;
  defaultSubjectPlaceholder: string;
}) {
  const [facts, setFacts] = useState<GenericDocFacts>({
    partyA: "",
    partyB: "",
    amountOrSubject: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    keyTerms: "",
  });

  const unresolvedIssues = useMemo(() => {
    const issues: string[] = [];
    if (!facts.partyA.trim()) issues.push("First party / Claimant name is missing.");
    if (!facts.partyB.trim()) issues.push("Second party / Respondent name is missing.");
    if (!facts.amountOrSubject.trim()) issues.push("Key subject matter or monetary amount is missing.");
    if (!facts.keyTerms.trim()) issues.push("Key terms or description of events is missing.");
    return issues;
  }, [facts]);

  const documentBody = useMemo(() => {
    return `WACHA LEGAL INFORMATION SUMMARY: ${documentName.toUpperCase()}
Department: ${departmentTitle}
Date Generated: ${facts.effectiveDate || "Unspecified"}

PARTIES INVOLVED:
- Party / Claimant: ${facts.partyA || "[Not Provided]"}
- Counterparty / Respondent: ${facts.partyB || "[Not Provided]"}

SUBJECT MATTER / VALUE:
- Details: ${facts.amountOrSubject || "[Not Provided]"}

SUMMARY OF TERMS & FACTS:
${facts.keyTerms || "[No additional terms entered]"}

STATEMENT OF LEGAL STANDING & NEXT STEPS:
1. Verify identity and supporting documentation (contracts, receipts, communications).
2. Seek advocate review to draft formal legal instruments, statutory notices, or court pleadings if legal action is intended.

DISCLAIMER:
This document summary is generated for legal information purposes under Ugandan law guidelines. It does not constitute legal representation, formal filing, or advocate attestation.`;
  }, [documentName, departmentTitle, facts]);

  const handleChange = (field: keyof GenericDocFacts, value: string) => {
    setFacts((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="document-builder-grid" style={{ display: "grid", gap: "2rem", marginTop: "2rem" }}>
      <div
        className="builder-form-card"
        style={{
          padding: "1.5rem",
          background: "var(--card-bg, #f9fafb)",
          borderRadius: "8px",
          border: "1px solid var(--border-color, #e5e7eb)",
        }}
      >
        <h3>1. Draft {documentName}</h3>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
          Enter key facts to build a structured legal summary for {departmentTitle}.
        </p>

        <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: "500" }}>
            Your Name / First Party
            <input
              type="text"
              value={facts.partyA}
              onChange={(e) => handleChange("partyA", e.target.value)}
              placeholder="e.g. John Mukasa"
              required
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: "500" }}>
            Other Party / Respondent
            <input
              type="text"
              value={facts.partyB}
              onChange={(e) => handleChange("partyB", e.target.value)}
              placeholder="e.g. Kampala Logistics Ltd / Jane Akello"
              required
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: "500" }}>
            Subject / Amount involved
            <input
              type="text"
              value={facts.amountOrSubject}
              onChange={(e) => handleChange("amountOrSubject", e.target.value)}
              placeholder={defaultSubjectPlaceholder}
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: "500" }}>
            Effective Date / Event Date
            <input
              type="date"
              value={facts.effectiveDate}
              onChange={(e) => handleChange("effectiveDate", e.target.value)}
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: "500" }}>
            Summary of Facts & Agreed Terms
            <textarea
              value={facts.keyTerms}
              onChange={(e) => handleChange("keyTerms", e.target.value)}
              rows={4}
              placeholder="Describe what happened, agreed payment schedules, employment terms, or estate details..."
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>
        </form>
      </div>

      <div
        className="document-preview-card"
        style={{
          padding: "1.5rem",
          background: "#fff",
          borderRadius: "8px",
          border: "1px solid var(--border-color, #e5e7eb)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <span
              className="eyebrow"
              style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}
            >
              Reviewed Document Preview (v1.0.0)
            </span>
            <h3 style={{ margin: 0 }}>{documentName}</h3>
          </div>
          <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
            Law date: 2026-08-30
          </span>
        </div>

        {unresolvedIssues.length > 0 && (
          <div className="result mandatory-review" style={{ padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem" }}>
            <strong>Attention: Unresolved Facts Flagged</strong>
            <ul style={{ margin: "0.5rem 0 0 1.25rem", padding: 0 }}>
              {unresolvedIssues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            fontSize: "0.9rem",
            background: "#f3f4f6",
            padding: "1rem",
            borderRadius: "4px",
            border: "1px solid #e5e7eb",
            marginBottom: "1rem",
          }}
        >
          {documentBody}
        </div>

        <div style={{ fontSize: "0.85rem", color: "#4b5563", background: "#eff6ff", padding: "0.75rem", borderRadius: "6px" }}>
          <strong>Advocate Review Status:</strong> RECOMMENDED
          <p style={{ margin: "0.25rem 0 0 0" }}>
            Save this summary to your matter draft or forward it to an enrolled advocate for formal legal review.
          </p>
        </div>
      </div>
    </div>
  );
}
