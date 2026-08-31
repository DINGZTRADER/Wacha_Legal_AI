import { expect, test } from "@playwright/test";

test("routes a tenancy story and exposes all departments", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /legal help that starts by listening/i })).toBeVisible();
  await expect(page.locator(".dept-card")).toHaveCount(7);
  await page.getByLabel(/describe your issue/i).fill("My landlord locked me out although I paid rent");
  await page.getByRole("button", { name: /find my next step/i }).click();
  await expect(page.getByRole("status")).toContainText("Land & Tenancy");
});

test("shows emergency escalation", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/describe your issue/i).fill("I am in danger and being beaten right now");
  await page.getByRole("button", { name: /find my next step/i }).click();
  await expect(page.getByRole("status")).toContainText("999 or 112");
});

test("creates and saves a new legal matter", async ({ page }) => {
  await page.goto("/matters/new");
  await expect(page.getByRole("heading", { name: /save what happened/i })).toBeVisible();
  await page.getByLabel(/summary/i).fill("Tenant eviction issue with missing receipt in Kampala.");
  await page.getByRole("button", { name: /validate & save matter/i }).click();
  await expect(page.getByRole("status")).toContainText("Matter Created Successfully!");
  await expect(page.getByRole("status")).toContainText("land-tenancy");
});

test("interacts with land inquiry document generator", async ({ page }) => {
  await page.goto("/departments/land-tenancy");
  await expect(page.getByRole("heading", { name: /land & tenancy/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /interactive document generator/i })).toBeVisible();
  await expect(page.getByText(/property inquiry checklist/i)).toBeVisible();
});
