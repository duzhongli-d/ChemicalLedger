import { test, expect } from "@playwright/test";

test.describe("Ledger Dashboard Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate before each test — login via UI
    await page.goto("/zh-CN/login");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "Admin123!");
    await page.getByRole("button", { name: /登录/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForURL(/\/zh-CN\/admin\/categories|\/zh-CN\/$/);
    await page.goto("/zh-CN/ledgers");
    await page.waitForLoadState("networkidle");
  });

  test("should display ledger list with stats", async ({ page }) => {
    // Stats cards are visible (Chinese labels)
    await expect(page.getByText("台账总数")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("should filter ledgers by status", async ({ page }) => {
    // Status filter uses button group: 全部, 正常, 即将过期, 已归档
    const normalBtn = page.getByRole("button", { name: "正常" });
    await normalBtn.click();
    await page.waitForTimeout(300);
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("should navigate to create ledger page", async ({ page }) => {
    await page.getByRole("link", { name: /新建台账/i }).click();
    await expect(page).toHaveURL("/zh-CN/ledger/create");
    await expect(page.getByRole("heading", { name: /手动创建/i })).toBeVisible();
  });
});
