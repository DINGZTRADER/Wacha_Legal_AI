import { createLocalProviders } from "./local";
test("local providers are deterministic and never imply real completion", async () => {
 const p=createLocalProviders();
 const payment=await p.payments.createCheckout({amountUgx:25000,idempotencyKey:"order-1"});
 expect(payment.status).toBe("requires-provider");
 expect((await p.ai.classify("rent dispute")).provider).toBe("local");
});
