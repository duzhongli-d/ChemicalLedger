import { test, expect } from '@playwright/test';

/**
 * Studio Generate Function E2E Tests
 *
 * NOTE: These tests require:
 * 1. Dev server running at http://localhost:3000
 * 2. User authenticated (E2E_USERNAME and E2E_PASSWORD env vars or defaults: admin/Admin123!)
 * 3. A notebook named "Verify Fix 2026" exists in the database
 *
 * Run with: npx playwright test e2e/studio-generate.spec.ts
 */

test.describe('Studio Generate Function', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via API/login page
    await page.goto('/zh/login');
    // Wait for page to be ready - use domcontentloaded instead of networkidle
    // to avoid waiting on long-polling requests
    await page.waitForLoadState('domcontentloaded');

    // Wait for login form to be visible
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });

    // Fill credentials
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || 'admin');
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || 'Admin123!');

    // Submit login
    await page.locator('button[type="submit"]').click();

    // Wait for redirect after login
    await page.waitForURL(/\/zh\/(admin|ledgers)$/, { timeout: 15000 });

    // Navigate to research page
    await page.goto('/zh/research');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should generate learning guide when notebook selected and topic entered', async ({ page }) => {
    // 1. Select "Verify Fix 2026" notebook
    // Wait for the select to be populated with options
    await expect(page.locator('select option')).toHaveCount(3, { timeout: 10000 });
    await page.locator('select').selectOption('5f726613-dc3d-44e6-bbd7-0918a473d3fe');

    // 2. Wait for StudioPanel to show the notebook is selected
    await expect(page.getByText('深度研究工作室')).toBeVisible();

    // 3. Enter topic
    await page.locator('input[placeholder="输入主题..."]').fill('化学实验安全指南');

    // 4. Click generate button
    await page.locator('button:has-text("✨ 生成")').click();

    // 5. Verify content appears
    await expect(page.getByText('Learning Guide: 化学实验安全指南')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Introduction')).toBeVisible();
    await expect(page.getByText('Key Concepts')).toBeVisible();
    await expect(page.getByText('Summary')).toBeVisible();
  });

  test('should show disabled generate button when no topic entered', async ({ page }) => {
    // 1. Select notebook
    await expect(page.locator('select option')).toHaveCount(3, { timeout: 10000 });
    await page.locator('select').selectOption('5f726613-dc3d-44e6-bbd7-0918a473d3fe');

    // 2. Verify generate button shows disabled state
    await expect(page.getByText('✨ 输入主题后启用')).toBeVisible();
  });

  test('should show placeholder text when notebook not selected', async ({ page }) => {
    // Verify placeholder appears
    await expect(page.getByText('请先选择一个学术空间').first()).toBeVisible();
  });
});
