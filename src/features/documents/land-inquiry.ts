export type LandFacts={owner:string;location:string;tenure:string;titleReference:string};
export type DocumentPreview={version:string;lawReviewedOn:string;title:string;body:string;unresolvedIssues:string[];reviewRequirement:"recommended"};
export function renderLandInquiry(f:LandFacts):DocumentPreview{
 const unresolved:string[]=[];
 if(!f.titleReference.trim())unresolved.push("Official title reference is missing.");
 if(!f.owner.trim())unresolved.push("Registered or claimed owner is missing.");
 return {version:"1.0.0",lawReviewedOn:"2026-08-30",title:"Land due-diligence inquiry",reviewRequirement:"recommended",unresolvedIssues:unresolved,body:`PROPERTY INQUIRY CHECKLIST

Location: ${f.location}
Tenure stated by user: ${f.tenure}
Owner stated by user: ${f.owner}
Title reference: ${f.titleReference||"Not yet confirmed"}

Verify the official search, identity, authority to transact, occupancy, boundaries, encumbrances, family or spousal interests, taxes, and execution requirements with the responsible authorities and an enrolled advocate where indicated.

This draft is legal information. It is not a title search, transfer instrument, filing, attestation, or advocate approval.`};
}
