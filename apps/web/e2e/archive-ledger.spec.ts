import { test, expect } from "@playwright/test";

test.describe("Archive Ledger Journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/zh-CN/login");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "Admin123!");
    await page.getByRole("button", { name: /登录/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForURL(/\/zh-CN\/admin\/categories|\/zh-CN\/$/);
  });

  test("should archive an active ledger", async ({ page }) => {
    // First, go to ledgers list and find an active ledger
    await page.goto("/zh-CN/ledgers");
    await page.waitForLoadState("networkidle");

    // Click the first "在用" (active) status badge to get an active ledger
    await page.getByText("正常").first().click();
    await page.waitForTimeout(300);

    // Click the first batch number link in the filtered results
    await page.locator("table tbody tr").first().locator("a").first().click();

    // Wait for navigation to ledger detail page
    await page.waitForURL(/\/zh-CN\/ledger\/.+/, { timeout: 5000 });

    // Click archive button
    const archiveBtn = page.getByRole("button", { name: "归档台账" });
    await expect(archiveBtn).toBeVisible();
    await archiveBtn.click();

    // After archiving, the status badge should change to "已归档"
    await expect(page.getByText("已归档")).toBeVisible({ timeout: 5000 });
  });
});
