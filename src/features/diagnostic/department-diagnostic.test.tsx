import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { DepartmentDiagnostic } from "./department-diagnostic";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

test("walks through four questions and links the recommendation to guided intake", async () => {
  const user = userEvent.setup();
  render(<DepartmentDiagnostic />);

  await user.click(screen.getByRole("button", { name: /find my path/i }));
  expect(screen.getByText("Step 1 of 4")).toBeVisible();

  await user.click(screen.getByRole("button", { name: /work or salary problem/i }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("button", { name: /employer, manager, or worker/i }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("button", { name: /challenge a decision/i }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("button", { name: /deadline is close/i }));
  await user.click(screen.getByRole("button", { name: /show my recommended path/i }));

  expect(screen.getByRole("heading", { name: "Employment" })).toBeVisible();
  expect(screen.getByText(/deadline may affect your rights/i)).toBeVisible();
  expect(screen.getByRole("link", { name: /start guided intake/i })).toHaveAttribute(
    "href",
    "/matters/new?department=employment",
  );
});
