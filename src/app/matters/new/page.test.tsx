import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import NewMatter from "./page";

let currentParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => currentParams,
}));

test("shows a recovery message when no department is supplied", () => {
  currentParams = new URLSearchParams();
  render(<NewMatter />);

  expect(screen.getByRole("heading", { name: /choose a department to continue/i })).toBeVisible();
  expect(screen.getByRole("link", { name: /return to the home page/i })).toHaveAttribute("href", "/");
});

test("renders the shared issue chooser for a department route", () => {
  currentParams = new URLSearchParams("department=land-tenancy");
  render(<NewMatter />);

  expect(screen.getByRole("heading", { name: /choose the issue that fits best/i })).toBeVisible();
  expect(screen.getAllByRole("link")).toHaveLength(6);
  expect(screen.getByRole("link", { name: /rent, tenancy, or eviction/i })).toHaveAttribute(
    "href",
    "/matters/new?department=land-tenancy&issue=rent-tenancy-eviction",
  );
});
