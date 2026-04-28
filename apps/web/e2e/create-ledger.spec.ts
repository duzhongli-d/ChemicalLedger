import { test, expect } from "@playwright/test";

test.describe("Create Ledger Journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/zh-CN/login");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "admin");
    await page.getByRole("button", { name: /登录/i }).click();
    await page.goto("/zh-CN/ledger/create");
  });

  test("should create a new ledger with all required fields", async ({ page }) => {
    await page.getByLabel(/Product Name/i).fill("Ethanol Absolute");
    await page.getByLabel(/Batch No\./i).fill("BTH20260428");
    await page.getByLabel(/CAS No\./i).fill("64-17-5");
    await page.getByLabel(/Weight\/Capacity/i).fill("500mL");
    await page.getByLabel(/Supplier/i).fill("Sigma-Aldrich");

    // Select first real category option (skip the placeholder "-- 选择品类 --")
    const categorySelect = page.locator("select").first();
    await categorySelect.selectOption({ index: 1 });

    await page.getByLabel(/Cert Expiry Date/i).fill("2027-12-31");
    await page.getByRole("button", { name: /Submit/i }).click();

    await expect(page).toHaveURL("/zh-CN/");
    await expect(page.getByText(/ethanol absolute/i)).toBeVisible();
  });

  test("should show validation errors for missing required fields", async ({ page }) => {
    await page.getByRole("button", { name: /Submit/i }).click();

    // HTML5 required validation prevents submission — we stay on the page
    await expect(page).toHaveURL("/zh-CN/ledger/create");
  });
});
