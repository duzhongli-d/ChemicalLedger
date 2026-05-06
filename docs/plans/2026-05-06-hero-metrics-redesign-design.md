# 首页 Hero 区域指标重设计

## 背景

HeroSection 底部目前有3个硬编码统计（年检测样本量12,580+、方法开发数量156、合规审计通过率99.8%），不来自数据库。需要替换为4个从 `annual_summaries` 表按 `category` + `year` 取 `batch_count` 的真实数据指标：**中控检测**、**商务全检**、**对照品标定**、**研发全检**。

数据来源为前一年数据（如2026年取2025年）。

## 数据流

```
HeroSection (前端)
  → GET /api/v1/public/annual-summaries/by-category?categories=中控检测,商务全检,对照品标定,研发全检&year=2025
  → annual_summaries 表 (category + year → batch_count)
```

## 后端改动

### 新增公开接口

**端点**: `GET /api/v1/public/annual-summaries/by-category`

**参数**:
- `categories`: 逗号分隔的 category 名称列表（必填）
- `year`: 整数，默认为上一自然年

**Response**:
```json
{
  "year": 2025,
  "data": [
    {"category": "中控检测", "batch_count": 1234},
    {"category": "商务全检", "batch_count": 567},
    {"category": "对照品标定", "batch_count": 89},
    {"category": "研发全检", "batch_count": 234}
  ]
}
```

**无需认证**（公开接口）

**文件**:
- `apps/api/app/api/v1/endpoints/public_annual_summaries.py` — 新增路由
- `apps/api/app/api/v1/schemas/annual_summary.py` — 新增 Schema

## 前端改动

**文件**: `apps/web/src/components/home/HeroSection.tsx`

1. 移除底部3个硬编码统计（lines 124-135）
2. 新增 `metricsData` state 存储4个指标
3. `useEffect` 调用新接口，year 传前一年
4. 显示4个指标卡片：**中控检测**、**商务全检**、**对照品标定**、**研发全检**
5. 加载态骨架屏 / 错误态 / 无数据态处理

**i18n 新增** (`zh.json` / `en.json`):
- `hero.metrics.zhongkong`: "中控检测" / "In-Process Control Testing"
- `hero.metrics.business_full`: "商务全检" / "Business Full Inspection"
- `hero.metrics.reference_standard`: "对照品标定" / "Reference Standard Calibration"
- `hero.metrics.rd_full`: "研发全检" / "R&D Full Testing"
- `hero.metrics.unit`: "批" / "batches"

## 验证

1. 启动后端服务，调用 `GET /public/annual-summaries/by-category?categories=中控检测,商务全检,对照品标定,研发全检&year=2025` 确认返回数据
2. 启动前端 `npm run dev`，访问首页确认4个指标正确显示
3. 确认2026年时 year=2025，2027年时 year=2026 的逻辑正确
4. 确认i18n中英文切换正常
