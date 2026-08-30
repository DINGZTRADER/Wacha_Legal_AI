export type SafetyLevel="standard"|"recommended-review"|"mandatory-review"|"emergency";
export type SafetyAssessment={level:SafetyLevel;reasons:string[];message:string};
const has=(s:string,words:string[])=>words.some(w=>s.includes(w));
export function assessSafety(input:string):SafetyAssessment{
 const s=input.toLowerCase();
 if(has(s,["in danger","being beaten","kill me","suicide","violence now"]))return {level:"emergency",reasons:["Immediate safety risk detected."],message:"Move to a safe place and contact Uganda Police on 999 or 112. Wacha cannot provide emergency assistance."};
 if(has(s,["arrested","police","criminal","fraud","child","tomorrow","today","court date","contested estate","forged title"]))return {level:"mandatory-review",reasons:["A serious legal risk needs review."],message:"An enrolled advocate should review this matter before documents are generated."};
 if(has(s,["deadline","caveat","dismissed","eviction"]))return {level:"recommended-review",reasons:["A deadline or significant right may be affected."],message:"Prompt advocate review is recommended."};
 return {level:"standard",reasons:[],message:"You can continue with guided legal information."};
}
