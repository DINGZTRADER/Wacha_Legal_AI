import { render, screen } from "@testing-library/react";
import { HomeExperience, AdvocateExperience } from "./workspace-pages";
test("renders distinct citizen and advocate entry experiences", () => {
 const {rerender}=render(<HomeExperience/>);
 expect(screen.getByRole("heading",{name:/legal help that starts by listening/i})).toBeVisible();
 expect(screen.getAllByRole("link",{name:/open/i})).toHaveLength(7);
 rerender(<AdvocateExperience/>);
 expect(screen.getByRole("heading",{name:/legal operations/i})).toBeVisible();
 expect(screen.getByText(/referral-ready intake/i)).toBeVisible();
});
