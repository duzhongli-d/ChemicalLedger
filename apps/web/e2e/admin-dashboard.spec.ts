import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/zh/login");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "Admin123!");
    await page.getByRole("button", { name: /登录/i }).click();
    // Wait for React to complete the redirect after login
    await page.waitForLoadState("networkidle");
    await page.waitForURL(/\/zh\/admin\/categories|\/zh\/$/);
    await page.goto("/zh/admin/dashboard");
    // Wait for auth store to hydrate and admin layout to render
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("管理后台").first()).toBeVisible({ timeout: 10000 });
  });

  test("shows stats cards", async ({ page }) => {
    // Should show 4 stat cards: 台账总数, 在用台账, 即将到期, 已归档台账
    await expect(page.getByText("台账总数")).toBeVisible();
    await expect(page.getByText("在用台账")).toBeVisible();
    await expect(page.getByText("即将到期")).toBeVisible();
    await expect(page.getByText("已归档台账")).toBeVisible();
  });

  test("shows category distribution panel", async ({ page }) => {
    await expect(page.getByText("品类分布")).toBeVisible();
  });

  test("shows user creation ranking panel", async ({ page }) => {
    await expect(page.getByText("用户创建排行")).toBeVisible();
  });

  test("sidebar has all 5 nav items", async ({ page }) => {
    await expect(page.getByText("仪表板")).toBeVisible();
    await expect(page.getByText("用户管理")).toBeVisible();
    await expect(page.getByText("品类配置")).toBeVisible();
    await expect(page.getByText("台账管理")).toBeVisible();
    await expect(page.getByText("审计日志")).toBeVisible();
  });
});
