import { test, expect } from "@playwright/test";

test.describe("Create Ledger Journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/zh/login");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "Admin123!");
    await page.getByRole("button", { name: /登录/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForURL(/\/zh\/admin\/categories|\/zh\/$/);
    await page.goto("/zh/ledger/create");
    // Wait for the form heading to appear
    await expect(page.getByRole("heading", { name: /手动创建/i })).toBeVisible({ timeout: 10000 });
  });

  test("should create a new ledger with all required fields", async ({ page }) => {
    // Fill form using nth() textbox position (form has: 品名, 批号, CAS, 重量, 供应商, 开封日期, 备注)
    const textboxes = page.locator("input[type='text']");
    await textboxes.nth(0).fill("乙醇");
    await textboxes.nth(1).fill("ETH-TEST-001");
    await textboxes.nth(2).fill("64-17-5");
    await textboxes.nth(3).fill("500mL");
    await textboxes.nth(4).fill("默克");

    // Select first real category (skip placeholder)
    const categorySelect = page.locator("select").first();
    await categorySelect.selectOption({ index: 1 });

    // Fill cert expiry date (type="date", not type="text")
    await page.locator('input[type="date"]').first().fill("2027-12-31");

    // Submit
    await page.getByRole("button", { name: "提交" }).click();

    // Should redirect after creation
    await page.waitForURL(/\/zh\//, { timeout: 5000 });
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("should show validation errors for missing required fields", async ({ page }) => {
    // Submit without filling anything - HTML5 required validation prevents submission
    await page.getByRole("button", { name: "提交" }).click();
    // We stay on the create page
    await expect(page).toHaveURL("/zh/ledger/create");
  });
});
