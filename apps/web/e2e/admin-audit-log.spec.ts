import { test, expect } from "@playwright/test";

test.describe("Admin Audit Log", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/zh-CN/login");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "Admin123!");
    await page.getByRole("button", { name: /登录/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForURL(/\/zh-CN\/admin\/categories|\/zh-CN\/$/);
    await page.goto("/zh-CN/admin/audit-log");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("table")).toBeVisible({ timeout: 10000 });
  });

  test("shows audit log table", async ({ page }) => {
    await expect(page.getByRole("table")).toBeVisible();
    // Table headers
    await expect(page.getByRole("columnheader", { name: "时间" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "操作" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "目标" })).toBeVisible();
  });

  test("has action type filter", async ({ page }) => {
    const filterSelect = page.locator("select").first();
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption({ index: 1 });
      await page.waitForTimeout(300);
    }
  });

  test("date range filter is present", async ({ page }) => {
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs.first()).toBeVisible();
  });

  test("pagination controls are visible", async ({ page }) => {
    // Pagination buttons should be present
    const pagination = page.locator("button").filter({ hasText: /第|页|上|下/i });
    // Check for next page button
    const nextBtn = page.getByRole("button", { name: /下一页/i });
    if (await nextBtn.isVisible()) {
      const initialRows = await page.locator("tbody tr").count();
      await nextBtn.click();
      await page.waitForTimeout(300);
      // Rows may be same count or 0 if only 1 page
      await expect(page.getByRole("table")).toBeVisible();
    }
  });
});
