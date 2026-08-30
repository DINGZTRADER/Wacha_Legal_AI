"use client";
import { useMemo, useState } from "react";
import { routeNarrative } from "./routing";
import { assessSafety } from "./safety";
import { getDepartment } from "../departments/registry";
export function ConciergePanel(){
 const [input,setInput]=useState(""); const [submitted,setSubmitted]=useState("");
 const result=useMemo(()=>submitted?routeNarrative(submitted):null,[submitted]);
 const safety=useMemo(()=>submitted?assessSafety(submitted):null,[submitted]);
 const department=result?.departmentId?getDepartment(result.departmentId):null;
 return <section className="concierge-card" aria-labelledby="concierge-title">
  <div className="concierge-head"><span className="status-dot"/><div><p className="eyebrow">Wacha Concierge</p><h2 id="concierge-title">Tell me what happened.</h2></div></div>
  <p className="muted">I will ask relevant questions, identify a likely pathway, and tell you when an advocate should step in.</p>
  <form onSubmit={e=>{e.preventDefault();setSubmitted(input.trim())}}><label htmlFor="story">Describe your issue in your own words</label><textarea id="story" value={input} onChange={e=>setInput(e.target.value)} minLength={10} required placeholder="For example: My landlord locked me out even though I paid rent..."/><div className="form-row"><small>Do not include passwords or payment PINs.</small><button type="submit">Find my next step</button></div></form>
  {safety&&<div className={`result ${safety.level}`} role="status"><strong>{safety.level==="emergency"?"Get urgent help now":department?department.title:"I need one more detail"}</strong><p>{safety.message}</p>{department&&<><p>{result?.reasons.join(" ")}</p><a href={`/departments/${department.id}`}>Continue to {department.title}</a></>}</div>}
 </section>;
}
