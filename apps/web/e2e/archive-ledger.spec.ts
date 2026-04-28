import { test, expect } from "@playwright/test";

test.describe("Archive Ledger Journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/zh-CN/login");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "admin");
    await page.getByRole("button", { name: /登录/i }).click();
  });

  test("should archive an active ledger", async ({ page }) => {
    await page.goto("/zh-CN/");

    // Click first ledger link in the table
    const firstLedgerLink = page.locator("table tbody tr td a").first();
    await firstLedgerLink.click();

    // Check we're on a ledger detail page
    await expect(page.url()).toMatch(/\/zh-CN\/ledger\/.+/);

    // Click archive button
    const archiveBtn = page.getByRole("button", { name: /Archive/i });
    await expect(archiveBtn).toBeVisible();
    await archiveBtn.click();

    // After archiving, the status badge should change to "Archived"
    await expect(page.locator("span:text('Archived')")).toBeVisible();
  });
});
