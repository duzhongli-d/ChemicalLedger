import { test, expect } from "@playwright/test";

test.describe("Admin Categories", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/zh/login");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "Admin123!");
    await page.getByRole("button", { name: /登录/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForURL(/\/zh\/admin\/categories|\/zh\/$/);
    await page.goto("/zh/admin/categories");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("table")).toBeVisible({ timeout: 10000 });
  });

  test("shows category table", async ({ page }) => {
    await expect(page.getByRole("table")).toBeVisible();
    // Table headers
    await expect(page.getByText("一级品类")).toBeVisible();
    await expect(page.getByText("二级品类")).toBeVisible();
    await expect(page.getByText("预警天数")).toBeVisible();
    await expect(page.getByText("未开封月数")).toBeVisible();
    await expect(page.getByText("已开封月数")).toBeVisible();
  });

  test("has editable shelf life fields", async ({ page }) => {
    // Find first edit button
    const editBtn = page.getByRole("button", { name: "编辑" }).first();
    await editBtn.click();
    // Should show number inputs for shelf life fields in edit mode
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
    // Should show save and cancel buttons
    await expect(page.getByRole("button", { name: "保存" })).toBeVisible();
    await expect(page.getByRole("button", { name: "取消" })).toBeVisible();
  });

  test("can cancel edit", async ({ page }) => {
    const editBtn = page.getByRole("button", { name: "编辑" }).first();
    await editBtn.click();
    // Verify edit mode is active (input fields visible)
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
    // Cancel should return to view mode
    await page.getByRole("button", { name: "取消" }).click();
    // Input fields should be gone
    await expect(page.locator('input[type="number"]').first()).not.toBeVisible();
  });
});
