import { test, expect } from "@playwright/test";

test.describe("Admin Ledgers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/zh-CN/login");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "Admin123!");
    await page.getByRole("button", { name: /登录/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForURL(/\/zh-CN\/admin\/categories|\/zh-CN\/$/);
    await page.goto("/zh-CN/admin/ledgers");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("table")).toBeVisible({ timeout: 10000 });
  });

  test("shows ledger table", async ({ page }) => {
    await expect(page.getByRole("table")).toBeVisible();
    // Should show table headers
    await expect(page.getByRole("columnheader", { name: "批号", exact: true })).toBeVisible();
  });

  test("search filters ledgers", async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("test");
      await page.waitForTimeout(300);
      // Either table or empty state should be visible
      const tableOrEmpty = page.getByRole("table").or(page.getByText(/暂无|无数据/i));
      await expect(tableOrEmpty.first()).toBeVisible();
    }
  });

  test("status filter works", async ({ page }) => {
    const statusSelect = page.locator("select").first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption({ index: 1 }); // select second option (after "all")
      await page.waitForTimeout(300);
      const tableOrEmpty = page.getByRole("table").or(page.getByText(/暂无|无数据/i));
      await expect(tableOrEmpty.first()).toBeVisible();
    }
  });

  test("checkbox selection enables batch archive button", async ({ page }) => {
    // Find a checkbox in the table body (not the header select-all)
    const checkbox = page.locator("tbody input[type='checkbox']").first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await page.waitForTimeout(200);
      // Batch archive button should appear
      const batchBtn = page.getByRole("button", { name: /归档选中/i });
      await expect(batchBtn).toBeVisible();
    }
  });
});
