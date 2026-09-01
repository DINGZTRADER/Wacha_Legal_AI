import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import NewMatter from "./page";

test("saves the existing summary form as a structured matter snapshot", async () => {
  render(<NewMatter />);

  fireEvent.change(screen.getByRole("combobox", { name: "Department" }), {
    target: { value: "employment" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Summary" }), {
    target: { value: "I was dismissed after five years of work." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Validate & Save Matter" }));

  expect(await screen.findByRole("status")).toHaveTextContent("Matter Created Successfully!");
  expect(screen.getByRole("status")).toHaveTextContent(
    "Original narrative: I was dismissed after five years of work.",
  );
});
