import { test, expect } from "@playwright/test";

test.describe("Ledger Dashboard Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate before each test — login via UI
    await page.goto("/zh-CN/login");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "admin");
    await page.getByRole("button", { name: /登录/i }).click();
    await expect(page).toHaveURL("/zh-CN/");
  });

  test("should display ledger list with stats", async ({ page }) => {
    await page.goto("/zh-CN/");

    // Stats cards are visible
    await expect(page.getByText("Total Ledgers")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("should filter ledgers by status", async ({ page }) => {
    await page.goto("/zh-CN/");

    // Status filter is the first select (before category filter)
    const statusFilter = page.locator("select").first();
    await statusFilter.selectOption("active");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("should navigate to create ledger page", async ({ page }) => {
    await page.goto("/zh-CN/");

    await page.getByRole("link", { name: /New Ledger/i }).click();
    await expect(page).toHaveURL("/zh-CN/ledger/create");
    await expect(page.getByRole("heading", { name: /Manual Create/i })).toBeVisible();
  });
});
