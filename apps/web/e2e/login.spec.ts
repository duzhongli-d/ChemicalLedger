import { test, expect } from "@playwright/test";

test.describe("Login Page UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/zh/login");
    await page.waitForLoadState("networkidle");
  });

  test("should display split layout with decorative panel on desktop", async ({ page }) => {
    // Desktop: left panel should be visible with the split layout classes
    const leftPanel = page.locator("div.hidden.lg\\:flex.lg\\:w-2\\/5");
    await expect(leftPanel).toBeVisible();

    // Form panel should be visible
    const formPanel = page.locator("form");
    await expect(formPanel).toBeVisible();
  });

  test("should toggle between email and username login modes", async ({ page }) => {
    // Default is username mode - text input should be visible
    const usernameInput = page.locator('input[type="text"]');
    await expect(usernameInput).toBeVisible();

    // Email input should not be visible in username mode
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).not.toBeVisible();

    // Click on email toggle button
    await page.getByRole("button", { name: "邮箱" }).click();

    // Now email input should be visible
    await expect(emailInput).toBeVisible();

    // Username input should be hidden
    await expect(usernameInput).not.toBeVisible();

    // Click back to username mode
    await page.getByRole("button", { name: "用户名" }).click();

    // Username input should be visible again
    await expect(usernameInput).toBeVisible();

    // Email input should be hidden
    await expect(emailInput).not.toBeVisible();
  });

  test("should show validation error for empty fields", async ({ page }) => {
    // Submit without filling any fields - browser validation should prevent submission
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // The form should still be on login page (no navigation)
    await expect(page).toHaveURL(/\/zh\/login/);
  });

  test("should have working register link", async ({ page }) => {
    // Register link should be visible in the form's main content area (not header nav)
    const registerLink = page.getByRole("main").getByRole("link", { name: "注册" });
    await expect(registerLink).toBeVisible();

    // Click register link - should navigate to register page
    await registerLink.click();
    await expect(page).toHaveURL(/\/zh\/register/);
  });

  test("should show error on invalid credentials", async ({ page }) => {
    // Fill in username and password with wrong credentials
    await page.locator('input[type="text"]').fill("wronguser");
    await page.locator('input[type="password"]').fill("wrongpassword");

    // Click submit button
    await page.locator('button[type="submit"]').click();

    // Error message should appear - matches axios 401 error or backend detail
    const errorMessage = page.getByText(/Invalid credentials|登录失败|status code 401/i);
    await expect(errorMessage).toBeVisible();

    // Should still be on login page
    await expect(page).toHaveURL(/\/zh\/login/);
  });
});
