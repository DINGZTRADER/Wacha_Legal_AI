import { DEPARTMENTS, type DepartmentId } from "../departments/registry";
export type RoutingResult={departmentId:DepartmentId|null;confidence:number;reasons:string[];needsClarification:boolean};
export function routeNarrative(input:string):RoutingResult{
 const value=input.toLowerCase();
 const ranked=DEPARTMENTS.map(d=>({d,hits:d.keywords.filter(k=>value.includes(k))})).sort((a,b)=>b.hits.length-a.hits.length);
 const best=ranked[0];
 if(!best||best.hits.length===0||value.trim().split(/\s+/).length<3)return {departmentId:null,confidence:0,reasons:[],needsClarification:true};
 return {departmentId:best.d.id,confidence:Math.min(.95,.55+best.hits.length*.12),reasons:best.hits.map(h=>`You mentioned ${h}.`),needsClarification:false};
}
