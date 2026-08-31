import { render, screen } from "@testing-library/react";
import { AppShell } from "./app-shell";

test("provides accessible citizen workspace chrome", () => {
  render(<AppShell audience="citizen"><p>Dashboard</p></AppShell>);
  expect(screen.getByRole("banner")).toBeVisible();
  expect(screen.getByRole("img", { name: /wachaai/i })).toHaveAttribute("src", "/wachaai-logo.png");
  expect(screen.getByRole("main")).toHaveTextContent("Dashboard");
  expect(screen.getByText(/legal information, not a substitute/i)).toBeVisible();
  expect(screen.getByText(/skip to main content/i)).toHaveAttribute("href", "#main");
});
