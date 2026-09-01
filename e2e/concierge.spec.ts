import { expect, test } from "@playwright/test";

const DEPARTMENT_COUNTS = [
  { id: "land-tenancy", title: "Land & Tenancy", count: 5 },
  { id: "debt-small-claims", title: "Debt & Small Claims", count: 4 },
  { id: "employment", title: "Employment", count: 5 },
  { id: "family-succession", title: "Family & Succession", count: 5 },
  { id: "affidavits", title: "Affidavits & Declarations", count: 4 },
  { id: "business-commercial", title: "Business & Commercial", count: 5 },
  { id: "vehicles-assets", title: "Vehicles & Asset Sales", count: 5 },
] as const;

test("routes a Land & Tenancy concierge story into guided intake without putting the narrative in the URL", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /legal help that starts by listening/i })).toBeVisible();
  await expect(page.locator(".dept-card")).toHaveCount(7);

  const story = "My landlord locked me out although I paid rent";
  await page.getByLabel(/describe your situation in your own words/i).fill(story);
  await page.getByRole("button", { name: /analyze & direct me/i }).click();
  await expect(page.getByRole("status")).toContainText("Land & Tenancy");
  await page.getByRole("link", { name: /choose a land & tenancy issue/i }).click();

  await expect(page).toHaveURL(/\/matters\/new\?department=land-tenancy$/);
  expect(decodeURIComponent(page.url())).not.toContain(story);
  await expect(page.getByText(/it will stay attached to the guided intake/i)).toBeVisible();
  await expect(page.locator(".issue-card")).toHaveCount(5);

  await page.getByRole("link", { name: /rent, tenancy, or eviction/i }).click();
  await expect(page).toHaveURL(/department=land-tenancy&issue=rent-tenancy-eviction/);
  expect(decodeURIComponent(page.url())).not.toContain(story);
  await expect(page.getByRole("heading", { name: /rent, tenancy, or eviction/i })).toBeVisible();
  await expect(page.getByText(story)).toBeVisible();
  await expect(page.getByText("Question 1 of 7")).toBeVisible();
});

test("shows emergency escalation", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/describe your situation in your own words/i).fill("I am in danger and being beaten right now");
  await page.getByRole("button", { name: /analyze & direct me/i }).click();
  await expect(page.getByRole("status")).toContainText("999 or 112");
});

test("opens the Employment department chooser and starts a guided intake from a valid issue route", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/describe your situation in your own words/i).fill(
    "My employer dismissed me without notice and refused to pay my salary.",
  );
  await page.getByRole("button", { name: /analyze & direct me/i }).click();

  await page.getByRole("link", { name: /choose a employment issue/i }).click();
  await expect(page).toHaveURL(/\/matters\/new\?department=employment$/);
  await expect(page.getByRole("heading", { name: /choose the issue that fits best/i })).toBeVisible();
  await expect(page.locator(".issue-card")).toHaveCount(5);

  await page.getByRole("link", { name: /dismissal or forced resignation/i }).click();
  await expect(page).toHaveURL(/department=employment&issue=dismissal/);
  await expect(page.getByRole("heading", { name: /dismissal or forced resignation/i })).toBeVisible();
  await expect(page.getByText("Question 1 of 7")).toBeVisible();
});

test("shows the shared issue counts on all seven department pages", async ({ page }) => {
  for (const department of DEPARTMENT_COUNTS) {
    await page.goto(`/departments/${department.id}`);
    await expect(page.getByRole("heading", { name: new RegExp(department.title, "i") })).toBeVisible();
    await expect(page.locator(".issue-card")).toHaveCount(department.count);
    await expect(page.getByRole("heading", { name: /existing document tools/i })).toBeVisible();
  }
});

test("uses the department-only route as missing-issue recovery", async ({ page }) => {
  await page.goto("/matters/new?department=family-succession");
  await expect(page.getByRole("heading", { name: /choose the issue that fits best/i })).toBeVisible();
  await expect(page.locator(".issue-card")).toHaveCount(5);
  await page.getByRole("link", { name: /managing a deceased person's estate/i }).click();
  await expect(page).toHaveURL(/department=family-succession&issue=estate-administration/);
  await expect(page.getByRole("heading", { name: /managing a deceased person's estate/i })).toBeVisible();
});

test("shows recovery guidance for an invalid issue route", async ({ page }) => {
  await page.goto("/matters/new?department=land-tenancy&issue=not-a-real-issue");
  await expect(page.getByRole("heading", { name: /we could not match that issue/i })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Please choose one of the valid Land & Tenancy issue routes.");
  await page.getByRole("link", { name: /choose a valid land & tenancy issue/i }).click();
  await expect(page).toHaveURL("/matters/new?department=land-tenancy");
  await expect(page.locator(".issue-card")).toHaveCount(5);
});
