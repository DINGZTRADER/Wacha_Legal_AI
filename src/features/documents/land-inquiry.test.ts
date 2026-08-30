import { renderLandInquiry } from "./land-inquiry";
test("renders versioned preview with warnings and no status overclaim", () => {
 const result=renderLandInquiry({owner:"Peter Wacha",location:"Wakiso",tenure:"Mailo",titleReference:""});
 expect(result.version).toBe("1.0.0");
 expect(result.unresolvedIssues).toContain("Official title reference is missing.");
 expect(result.body).not.toMatch(/court-grade|legally binding/i);
});
