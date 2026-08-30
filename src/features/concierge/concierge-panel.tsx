"use client";
import { useMemo, useState } from "react";
import { routeNarrative } from "./routing";
import { assessSafety } from "./safety";
import { getDepartment } from "../departments/registry";

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
    <section className="concierge-card" aria-labelledby="concierge-title">
      <div className="concierge-head">
        <span className="status-dot" />
        <div>
          <p className="eyebrow">Wacha Concierge</p>
          <h2 id="concierge-title">Tell me what happened.</h2>
        </div>
      </div>
      <p className="muted">
        I will ask relevant questions, identify a likely pathway, and tell you when an advocate should step in.
      </p>

      {!submitted ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(input);
          }}
        >
          <label htmlFor="story">Describe your issue in your own words</label>
          <textarea
            id="story"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            minLength={10}
            required
            placeholder="For example: My landlord locked me out even though I paid rent..."
          />
          <div className="form-row">
            <small>Do not include passwords or payment PINs.</small>
            <button type="submit">Find my next step</button>
          </div>
        </form>
      ) : (
        <div className="concierge-active-state">
          <div className="user-story-summary">
            <strong>Your reported situation:</strong>
            <p>&quot;{submitted}&quot;</p>
            {clarification && <p className="clarification-note"><strong>Added detail:</strong> &quot;{clarification}&quot;</p>}
            <button type="button" onClick={handleReset} className="button-text">Start over</button>
          </div>

          {result?.needsClarification && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const val = (form.elements.namedItem("more") as HTMLInputElement)?.value;
                if (val) setClarification(val);
              }}
              className="clarification-form"
            >
              <label htmlFor="more">Can you provide one more detail (e.g. location, dates, or parties involved)?</label>
              <input id="more" name="more" required placeholder="e.g. Occurred in Kampala last week" />
              <button type="submit">Update intake</button>
            </form>
          )}

          {safety && (
            <div className={`result ${safety.level}`} role="status">
              <strong>
                {safety.level === "emergency"
                  ? "Get urgent help now"
                  : department
                  ? department.title
                  : "I need one more detail"}
              </strong>
              <p>{safety.message}</p>
              {department && (
                <>
                  <p>{result?.reasons.join(" ")}</p>
                  <a href={`/departments/${department.id}`}>Continue to {department.title}</a>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
