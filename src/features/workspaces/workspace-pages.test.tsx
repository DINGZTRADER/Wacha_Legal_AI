import { render, screen } from "@testing-library/react";
import { HomeExperience, AdvocateExperience } from "./workspace-pages";
test("renders distinct citizen and advocate entry experiences", () => {
  const { rerender } = render(<HomeExperience />);
  expect(screen.getByRole("heading", { name: /legal help that starts by listening/i })).toBeVisible();
  expect(screen.getAllByRole("link", { name: /open/i })).toHaveLength(7);
  expect(document.querySelectorAll(".dept-card[data-tone]")).toHaveLength(7);
  expect(new Set(Array.from(document.querySelectorAll(".dept-card[data-tone]"), (card) => card.getAttribute("data-tone")).filter(Boolean)).size).toBe(7);
  rerender(<AdvocateExperience />);
  expect(screen.getByRole("heading", { name: /legal operations/i })).toBeVisible();
  expect(screen.getByText(/referral-ready intake/i)).toBeVisible();
}, 15000);

