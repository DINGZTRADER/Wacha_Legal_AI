"use client";
import { useMemo, useState } from "react";
import { renderLandInquiry, type LandFacts } from "./land-inquiry";

export function LandInquiryBuilder() {
  const [facts, setFacts] = useState<LandFacts>({
    location: "Kampala, Nakawa Block 214",
    tenure: "Mailo Land",
    owner: "John Doe",
    titleReference: "Plot 1042, Folio 12",
  });

  const preview = useMemo(() => renderLandInquiry(facts), [facts]);

  const handleChange = (field: keyof LandFacts, value: string) => {
    setFacts((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="document-builder-grid" style={{ display: "grid", gap: "2rem", marginTop: "2rem" }}>
      <div className="builder-form-card" style={{ padding: "1.5rem", background: "var(--card-bg, #f9fafb)", borderRadius: "8px", border: "1px solid var(--border-color, #e5e7eb)" }}>
        <h3>1. Confirm Property Facts</h3>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
          Enter known facts. Unresolved details will be automatically flagged for verification.
        </p>

        <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: "500" }}>
            Property Location
            <input
              type="text"
              value={facts.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="e.g. Wakiso, Busiro Block 15"
              required
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: "500" }}>
            Land Tenure Type
            <select
              value={facts.tenure}
              onChange={(e) => handleChange("tenure", e.target.value)}
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="Mailo Land">Mailo Land</option>
              <option value="Freehold">Freehold</option>
              <option value="Leasehold">Leasehold</option>
              <option value="Customary Land">Customary Land</option>
              <option value="Unsure / Under Verification">Unsure / Under Verification</option>
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: "500" }}>
            Stated Owner / Seller
            <input
              type="text"
              value={facts.owner}
              onChange={(e) => handleChange("owner", e.target.value)}
              placeholder="e.g. Jane Namubiru"
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontWeight: "500" }}>
            Official Title Reference (Plot / Folio / Block)
            <input
              type="text"
              value={facts.titleReference}
              onChange={(e) => handleChange("titleReference", e.target.value)}
              placeholder="e.g. Block 204 Plot 12"
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>
        </form>
      </div>

      <div className="document-preview-card" style={{ padding: "1.5rem", background: "#fff", borderRadius: "8px", border: "1px solid var(--border-color, #e5e7eb)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <span className="eyebrow" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>
              Reviewed Document Preview (v{preview.version})
            </span>
            <h3 style={{ margin: 0 }}>{preview.title}</h3>
          </div>
          <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
            Law date: {preview.lawReviewedOn}
          </span>
        </div>

        {preview.unresolvedIssues.length > 0 && (
          <div className="result mandatory-review" style={{ padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem" }}>
            <strong>Attention: Unresolved Facts Flagged</strong>
            <ul style={{ margin: "0.5rem 0 0 1.25rem", padding: 0 }}>
              {preview.unresolvedIssues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.9rem", background: "#f3f4f6", padding: "1rem", borderRadius: "4px", border: "1px solid #e5e7eb", marginBottom: "1rem" }}>
          {preview.body}
        </div>

        <div style={{ fontSize: "0.85rem", color: "#4b5563", background: "#eff6ff", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem" }}>
          <strong>Advocate Review Status:</strong> {preview.reviewRequirement.toUpperCase()}
          <p style={{ margin: "0.25rem 0 0 0" }}>
            This inquiry document can be saved to your matter or transferred to a verified advocate for formal title search and review.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => {
              const printWindow = window.open("", "_blank");
              if (printWindow) {
                printWindow.document.write(`
                  <html>
                    <head><title>${preview.title}</title></head>
                    <body style="font-family: Arial, sans-serif; padding: 2rem; line-height: 1.6;">
                      <h2>${preview.title} (v${preview.version})</h2>
                      <p><em>Law date: ${preview.lawReviewedOn}</em></p>
                      <hr/>
                      <pre style="font-family: monospace; white-space: pre-wrap;">${preview.body}</pre>
                    </body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
              }
            }}
            style={{ padding: "0.6rem 1rem", borderRadius: "6px", background: "var(--brand, #2677bd)", color: "#fff", border: 0, fontWeight: "600", cursor: "pointer" }}
          >
            📄 Download / Print PDF
          </button>

          <button
            type="button"
            onClick={() => {
              const blob = new Blob([preview.body], { type: "text/plain;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `land-due-diligence-inquiry.txt`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            style={{ padding: "0.6rem 1rem", borderRadius: "6px", background: "#374151", color: "#fff", border: 0, fontWeight: "600", cursor: "pointer" }}
          >
            📝 Download Document (.txt/.doc)
          </button>
        </div>
      </div>
    </div>
  );
}

