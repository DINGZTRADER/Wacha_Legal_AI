export const DEPARTMENTS = [
 {id:"land-tenancy",title:"Land & Tenancy",description:"Property, renting, ownership and land transactions.",keywords:["landlord","tenant","rent","land","title","plot","house","locked"]},
 {id:"debt-small-claims",title:"Debt & Small Claims",description:"Loans, unpaid money, demands and small claims.",keywords:["debt","loan","owe","unpaid","money","demand"]},
 {id:"employment",title:"Employment",description:"Work contracts, discipline, dismissal and benefits.",keywords:["employer","employee","dismissed","salary","job","work","redundancy"]},
 {id:"family-succession",title:"Family & Succession",description:"Wills, estates, probate and family arrangements.",keywords:["will","estate","probate","inheritance","beneficiary","family"]},
 {id:"affidavits",title:"Affidavits & Declarations",description:"Sworn statements, exhibits and execution guidance.",keywords:["affidavit","declaration","sworn","deponent","commissioner"]},
 {id:"business-commercial",title:"Business & Commercial",description:"Companies, founders, suppliers and commercial contracts.",keywords:["business","company","supplier","nda","partnership","shareholder","contract"]},
 {id:"vehicles-assets",title:"Vehicles & Asset Sales",description:"Vehicle and equipment sale safeguards and transfers.",keywords:["vehicle","car","motorcycle","logbook","asset","equipment"]}
] as const;
export type DepartmentId = typeof DEPARTMENTS[number]["id"];
export function getDepartment(id:string){return DEPARTMENTS.find(d=>d.id===id);}
