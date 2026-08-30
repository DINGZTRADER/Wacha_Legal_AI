import { routeNarrative } from "./routing";
test("routes specific narratives and clarifies vague ones", () => {
 expect(routeNarrative("My landlord locked me out").departmentId).toBe("land-tenancy");
 expect(routeNarrative("My employer dismissed me without a hearing").departmentId).toBe("employment");
 expect(routeNarrative("I need help").needsClarification).toBe(true);
});
