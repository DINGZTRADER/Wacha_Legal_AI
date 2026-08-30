import { MatterDraftSchema } from "./schema";
test("requires a department and meaningful summary", () => {
 expect(MatterDraftSchema.safeParse({departmentId:"employment",summary:"Dismissed without a hearing"}).success).toBe(true);
 expect(MatterDraftSchema.safeParse({departmentId:"employment",summary:"help"}).success).toBe(false);
});
