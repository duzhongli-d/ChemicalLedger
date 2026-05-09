# PPT大纲生成功能测试验证计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 测试 /research 页面的 "PPT大纲" 生成功能，验证选择笔记本后界面提示信息是否正确切换

**Architecture:** 通过 Playwright E2E 测试，登录后进入 research 页面，选择"Verify Fix 2026"笔记本，切换到 PPT大纲 标签，输入主题并生成内容

**Tech Stack:** Playwright, next-intl i18n, React Query mutations

---

## 前提条件

1. 开发服务器运行于 `http://localhost:3000`
2. 用户凭证: `admin` / `Admin123!` (见 `apps/web/.env.example`)
3. 存在名为 "Verify Fix 2026" 的笔记本，UUID: `5f726613-dc3d-44e6-bbd7-0918a473d3fe`

---

## 测试步骤

### Step 1: 打开 research 页面

```typescript
await page.goto('/zh/research');
await page.waitForLoadState('domcontentloaded');
```

### Step 2: 选择笔记本 "Verify Fix 2026"

```typescript
// 等待 select 填充选项
await expect(page.locator('select option')).toHaveCount(3, { timeout: 10000 });
await page.locator('select').selectOption('5f726613-dc3d-44e6-bbd7-0918a473d3fe');
```

### Step 3: 切换到 PPT大纲 标签

```typescript
// 点击 "PPT大纲" 标签按钮
await page.locator('button:has-text("📊 PPT大纲")').click();
```

### Step 4: 验证提示信息变化

选择笔记本后，检查占位符文本是否正确：

```typescript
// 笔记本已选但无内容时，应显示 "添加来源后，输入主题即可生成内容" 或 "基于 X 个来源，输入主题开始生成"
// 而不是 "请先选择一个学术空间"
await expect(page.getByText('请先选择一个学术空间')).not.toBeVisible();
await expect(page.locator('input[placeholder]')).toBeVisible();
```

### Step 5: 输入主题并生成 PPT

```typescript
// 输入主题
await page.locator('input[placeholder="输入主题..."]').fill('化学实验安全指南');

// 点击生成按钮
await page.locator('button:has-text("✨ 生成")').click();

// 等待 PPT 内容出现 (API 会返回 mock 数据如果没有 GEMINI_API_KEY)
await expect(page.getByText('Presentation:')).toBeVisible({ timeout: 15000 });
```

### Step 6: 验证 PPTView 渲染

```typescript
// 检查是否渲染了 PPT slides
await expect(page.locator('text=Slide 1')).toBeVisible({ timeout: 10000 });
```

---

## 关键文件

| 文件 | 说明 |
|------|------|
| `apps/web/e2e/studio-generate.spec.ts` | 现有 E2E 测试文件，需添加 PPT 测试用例 |
| `apps/web/src/components/research/StudioPanel.tsx` | 研究工作室面板，包含 PPT tab 逻辑 |
| `apps/web/src/components/research/PPTView.tsx` | PPT 渲染组件 |
| `apps/web/src/i18n/messages/zh.json` | 中文翻译 |

---

## 验证方法

1. 运行开发服务器: `cd apps/web && npm run dev`
2. 运行 E2E 测试:
   ```bash
   cd apps/web && npx playwright test e2e/studio-ppt.spec.ts
   ```
3. 手动验证: 打开浏览器访问 `http://localhost:3000/zh/research`，登录后选择笔记本，切换到 PPT 大纲标签，观察提示信息是否正确