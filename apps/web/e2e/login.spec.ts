import { test, expect } from "@playwright/test";

test.describe("Login Journey", () => {
  test("should login with valid credentials and redirect to dashboard", async ({ page }) => {
    await page.goto("/zh-CN/login");

    await page.locator('input[type="text"]').fill("testuser");
    await page.locator('input[type="password"]').fill("testpassword");
    await page.getByRole("button", { name: /登录/i }).click();

    await expect(page).toHaveURL("/zh-CN/");
    await expect(page.getByText(/Total Ledgers/i)).toBeVisible();
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.goto("/zh-CN/login");

    await page.locator('input[type="text"]').fill("baduser");
    await page.locator('input[type="password"]').fill("badpassword");
    await page.getByRole("button", { name: /登录/i }).click();

    await expect(page.getByText(/登录失败/i)).toBeVisible();
    await expect(page).toHaveURL("/zh-CN/login");
  });
});
