import { assessSafety } from "./safety";
test("escalates urgent risks and keeps ordinary matters standard", () => {
 expect(assessSafety("I am in danger and being beaten").level).toBe("emergency");
 expect(assessSafety("Police arrested me for fraud").level).toBe("mandatory-review");
 expect(assessSafety("I need a supplier agreement").level).toBe("standard");
});
