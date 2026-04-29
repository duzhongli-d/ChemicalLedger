import { test, expect } from "@playwright/test";

test.describe("Admin Users", () => {
  const testUsername = `testuser_${Date.now()}`;
  const testEmail = `testuser_${Date.now()}@abachem.com`;

  test.beforeEach(async ({ page }) => {
    await page.goto("/zh-CN/login");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || "admin");
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || "Admin123!");
    await page.getByRole("button", { name: /登录/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForURL(/\/zh-CN\/admin\/categories|\/zh-CN\/$/);
    await page.goto("/zh-CN/admin/users");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "新建用户" })).toBeVisible({ timeout: 10000 });
  });

  test("shows user table", async ({ page }) => {
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText("用户名")).toBeVisible();
    await expect(page.getByText("邮箱")).toBeVisible();
    await expect(page.getByText("角色")).toBeVisible();
  });

  test("opens create user modal", async ({ page }) => {
    await page.getByRole("button", { name: "新建用户" }).click();
    await expect(page.getByRole("heading", { name: "新建用户" })).toBeVisible();
    // Form has 4 text inputs (username, email, phone, department) and 1 select
    const textboxes = page.getByRole("textbox");
    await expect(textboxes).toHaveCount(4);
  });

  test("creates a new user", async ({ page }) => {
    await page.getByRole("button", { name: "新建用户" }).click();
    // Inputs: username(0), email(1), phone(2), department(3)
    const textboxes = page.getByRole("textbox");
    await textboxes.nth(0).fill(testUsername);
    await textboxes.nth(1).fill(testEmail);
    await page.getByRole("button", { name: "确认" }).click();
    // Wait for modal to close and user to appear
    await page.waitForSelector('.fixed.inset-0.z-50', { state: 'detached', timeout: 5000 });
    await expect(page.getByText(testUsername).first()).toBeVisible({ timeout: 5000 });
  });

  test("opens edit user modal", async ({ page }) => {
    // Click edit on the second user row
    await page.getByRole("button", { name: "编辑" }).nth(1).click();
    await expect(page.getByRole("heading", { name: "编辑用户" })).toBeVisible();
    // Username field should be disabled in edit mode
    await expect(page.locator("input[disabled]")).toBeVisible();
    // Role select should be visible
    await expect(page.locator("select")).toBeVisible();
    // Cancel should close modal
    await page.getByRole("button", { name: "取消" }).click();
    await expect(page.getByRole("heading", { name: "编辑用户" })).not.toBeVisible({ timeout: 3000 });
  });

  test("deletes a user", async ({ page }) => {
    // Create a user to delete
    await page.getByRole("button", { name: "新建用户" }).click();
    const deleteUsername = `delete_${testUsername}`;
    const textboxes = page.getByRole("textbox");
    await textboxes.nth(0).fill(deleteUsername);
    await textboxes.nth(1).fill(`delete_${testEmail}`);
    await page.getByRole("button", { name: "确认" }).click();
    await page.waitForSelector('.fixed.inset-0.z-50', { state: 'detached', timeout: 5000 });

    // Find the user's delete button
    const userRow = page.locator("td").filter({ hasText: deleteUsername }).locator("..");
    await userRow.getByRole("button", { name: "删除" }).click();
    await expect(page.getByRole("heading", { name: "删除用户" })).toBeVisible();
    await page.getByRole("button", { name: "确认删除" }).click();
    await page.waitForSelector('.fixed.inset-0.z-50', { state: 'detached', timeout: 5000 });
    await expect(page.getByText(deleteUsername).first()).not.toBeVisible({ timeout: 5000 });
  });
});
