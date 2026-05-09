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

    // Switch to username mode if needed (page starts in email mode)
    const usernameButton = page.locator('button:has-text("用户名")');
    if (await usernameButton.isVisible()) {
      await usernameButton.click();
    }

    // Fill credentials
    await page.locator('input[type="text"]').fill(process.env.E2E_USERNAME || 'admin');
    await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD || 'Admin123!');

    // Submit login
    await page.locator('button[type="submit"]').click();

    // Wait for redirect after login (admin or ledgers page)
    await page.waitForURL(/\/zh\/admin/, { timeout: 20000 });

    // Navigate to research page
    await page.goto('/zh/research');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should generate learning guide when notebook selected and topic entered', async ({ page }) => {
    // 1. Select "Verify Fix 2026" notebook
    await expect(page.locator('select option')).toHaveCount(3, { timeout: 10000 });
    await page.locator('select').selectOption('5f726613-dc3d-44e6-bbd7-0918a473d3fe');

    // 2. Wait for StudioPanel to show the notebook is selected
    await expect(page.getByText('深度研究工作室')).toBeVisible();

    // 3. Enter topic
    await page.locator('input[placeholder="输入主题..."]').fill('化学实验安全指南');

    // 4. Click generate button (button contains emoji + "生成" text)
    const generateBtn = page.locator('button:has-text("✨")').filter({ hasText: '生成' });
    await expect(generateBtn).toBeEnabled();
    await generateBtn.click();

    // 5. Verify loading indicator appears (button shows "正在生成中...")
    await expect(page.getByText('正在生成中...').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show disabled generate button when no topic entered', async ({ page }) => {
    // 1. Select notebook
    await expect(page.locator('select option')).toHaveCount(3, { timeout: 10000 });
    await page.locator('select').selectOption('5f726613-dc3d-44e6-bbd7-0918a473d3fe');

    // 2. Wait for StudioPanel to load
    await expect(page.getByText('深度研究工作室')).toBeVisible();

    // 3. Verify generate button shows disabled state (button is disabled when no topic)
    const generateBtn = page.locator('button:has-text("✨")');
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toBeDisabled();
  });

  test('should show placeholder text when notebook not selected', async ({ page }) => {
    // Verify placeholder appears
    await expect(page.getByText('请先选择一个学术空间').first()).toBeVisible();
  });

  test('should switch to PPT tab and show correct prompt after notebook selected', async ({ page }) => {
    // 1. Select "Verify Fix 2026" notebook
    await expect(page.locator('select option')).toHaveCount(3, { timeout: 10000 });
    await page.locator('select').selectOption('5f726613-dc3d-44e6-bbd7-0918a473d3fe');

    // 2. Wait for StudioPanel to be visible
    await expect(page.getByText('深度研究工作室')).toBeVisible();

    // 3. Verify the old prompt "请先选择一个学术空间" is NOT visible
    await expect(page.getByText('请先选择一个学术空间')).not.toBeVisible();

    // 4. Verify input is visible (topic placeholder)
    await expect(page.locator('input[placeholder="输入主题..."]')).toBeVisible();

    // 5. Click PPT大纲 tab
    await page.getByRole('button', { name: '📊PPT大纲' }).click();

    // 6. Verify prompt shows based on source count
    // Verify Fix 2026 has 4 sources, so message should be "基于 X 个来源，输入主题开始生成"
    await expect(page.getByText(/基于.*个来源，输入主题开始生成/)).toBeVisible();
  });

  test('should generate PPT when topic entered and generate clicked', async ({ page }) => {
    // 1. Select notebook
    await expect(page.locator('select option')).toHaveCount(3, { timeout: 10000 });
    await page.locator('select').selectOption('5f726613-dc3d-44e6-bbd7-0918a473d3fe');

    // 2. Wait for StudioPanel
    await expect(page.getByText('深度研究工作室')).toBeVisible();

    // 3. Switch to PPT tab
    await page.getByRole('button', { name: '📊PPT大纲' }).click();

    // 4. Enter topic
    await page.locator('input[placeholder="输入主题..."]').fill('化学实验安全指南');

    // 5. Click generate button (button contains emoji + "生成" text)
    const generateBtn = page.locator('button:has-text("✨")').filter({ hasText: '生成' });
    await expect(generateBtn).toBeEnabled();
    await generateBtn.click();

    // 6. Verify loading indicator appears
    await expect(page.getByText('正在生成中...').first()).toBeVisible({ timeout: 5000 });
  });
});
