export type PaymentRequest={amountUgx:number;idempotencyKey:string};
export function createLocalProviders(){
 const keys=new Set<string>();
 return {
  ai:{async classify(input:string){return {provider:"local" as const,label:input.toLowerCase().includes("rent")?"land-tenancy":"needs-clarification"};}},
  payments:{async createCheckout(request:PaymentRequest){keys.add(request.idempotencyKey);return {status:"requires-provider" as const,idempotencyKey:request.idempotencyKey,message:"Connect an approved payment provider to accept money."};}},
  notifications:{async send(){return {status:"logged-locally" as const};}},
  storage:{async putPrivate(name:string){return {status:"local-only" as const,key:`local/${name}`};}}
 };
}
