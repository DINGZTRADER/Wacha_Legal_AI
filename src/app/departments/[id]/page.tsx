import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getDepartment } from "@/features/departments/registry";
import { LandInquiryBuilder } from "@/features/documents/land-inquiry-builder";
import { GenericDocumentBuilder } from "@/features/documents/generic-document-builder";
import { LAND_TENANCY_ISSUES } from "@/features/departments/land-tenancy-issues";

const DEPARTMENT_DOC_CONFIGS: Record<
  string,
  { documentName: string; defaultSubjectPlaceholder: string }
> = {
  "debt-small-claims": {
    documentName: "Debt Recovery & Demand Summary",
    defaultSubjectPlaceholder: "e.g. UGX 5,000,000 unpaid loan balance",
  },
  employment: {
    documentName: "Employment Dispute & Claim Summary",
    defaultSubjectPlaceholder: "e.g. Unfair termination / Unpaid severance pay",
  },
  "family-succession": {
    documentName: "Family & Estate Succession Inventory",
    defaultSubjectPlaceholder: "e.g. Letters of Administration / Estate distribution",
  },
  affidavits: {
    documentName: "Statutory Declaration / Affidavit Summary",
    defaultSubjectPlaceholder: "e.g. Verification of Name / Ownership of Property",
  },
  "business-commercial": {
    documentName: "Commercial Agreement & Service Terms",
    defaultSubjectPlaceholder: "e.g. UGX 12,000,000 Supply Contract",
  },
  "vehicles-assets": {
    documentName: "Vehicle & Asset Sale Agreement Summary",
    defaultSubjectPlaceholder: "e.g. Motor Vehicle Sale (Reg No. UBF 123X)",
  },
};


export default async function DepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = getDepartment(id);
  if (!d) notFound();

  const docConfig = DEPARTMENT_DOC_CONFIGS[id];

  return (
    <AppShell audience="citizen">
      <section className="detail">
        <Link href="/">Back to all departments</Link>
        <p className="eyebrow">Guided legal pathway</p>
        <h1>{d.title}</h1>
        <p className="lead">{d.description}</p>
        <div className="notice">
          <strong>Before you continue</strong>
          <p>
            Wacha will confirm the parties, important dates, documents you have, urgency, and risks. Information is not a substitute for advice from an enrolled advocate.
          </p>
        </div>

        {id === "land-tenancy" && (
          <>
            <div className="notice">
              <strong>Choose what is closest to your situation</strong>
              <p>You do not need to know the legal words. Pick one starting point and Wacha will ask simple follow-up questions.</p>
            </div>
            <div className="issue-grid">
              {LAND_TENANCY_ISSUES.map((issue, index) => (
                <Link className="issue-card" key={issue.id} href={issue.href}>
                  <span className="number">{String(index + 1).padStart(2, "0")}</span>
                  <h2>{issue.title}</h2>
                  <p>{issue.description}</p>
                  <span className="issue-action">Start with this →</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: "2rem" }}>
          <h2>Interactive Document Generator</h2>
          {id === "land-tenancy" ? (
            <LandInquiryBuilder />
          ) : docConfig ? (
            <GenericDocumentBuilder
              departmentTitle={d.title}
              documentName={docConfig.documentName}
              defaultSubjectPlaceholder={docConfig.defaultSubjectPlaceholder}
            />
          ) : (
            <Link className="button" href="/matters/new">
              Start a guided matter
            </Link>
          )}
        </div>
      </section>
    </AppShell>
  );
}

