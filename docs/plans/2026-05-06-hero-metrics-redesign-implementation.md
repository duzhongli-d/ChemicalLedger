# Hero Metrics Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace HeroSection's 3 hardcoded stats with 4 API-driven stats from `/public/annual-summaries/by-category`.

**Architecture:** New public API endpoint filters `annual_summaries` by `category` + `year` and returns `batch_count`. Frontend fetches this in `useEffect` and renders 4 metric cards.

**Tech Stack:** FastAPI (backend), Next.js (frontend), next-intl (i18n)

---

## Task 1: Add new Schema for by-category response

**File:** `apps/api/app/api/v1/schemas/annual_summary.py`

**Step 1: Add new Schema classes**

Append after line 14:
```python
class PublicAnnualSummaryByCategoryItem(BaseModel):
    category: str
    batch_count: Optional[int] = None


class PublicAnnualSummaryByCategoryResponse(BaseModel):
    year: int
    data: List[PublicAnnualSummaryByCategoryItem]
    message: Optional[str] = None
```

**Step 2: Run linter**

Run: `cd apps/api && ruff check app/api/v1/schemas/annual_summary.py`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/api/app/api/v1/schemas/annual_summary.py
git commit -m "feat(api): add PublicAnnualSummaryByCategoryResponse schema"
```

---

## Task 2: Add new public endpoint GET /annual-summaries/by-category

**File:** `apps/api/app/api/v1/endpoints/public_annual_summaries.py`

**Step 1: Add new endpoint after line 46**

```python
@router.get("/annual-summaries/by-category", response_model=PublicAnnualSummaryByCategoryResponse)
def get_annual_summaries_by_category(
    categories: str,  # comma-separated: "中控检测,商务全检,对照品标定,研发全检"
    year: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    Get annual summaries by category for a specific year.
    No authentication required.
    Returns batch_count per category.
    """
    if year is None:
        year = datetime.now().year - 1

    category_list = [c.strip() for c in categories.split(",")]

    summaries = (
        db.query(AnnualSummary)
        .filter(AnnualSummary.year == year)
        .filter(AnnualSummary.category.in_(category_list))
        .all()
    )

    if not summaries:
        return PublicAnnualSummaryByCategoryResponse(
            year=year,
            data=[],
            message=f"{year}年数据更新中",
        )

    data = [
        PublicAnnualSummaryByCategoryItem(
            category=s.category,
            batch_count=s.batch_count,
        )
        for s in summaries
    ]

    return PublicAnnualSummaryByCategoryResponse(year=year, data=data)
```

**Step 2: Update import**

Change line 6 from:
```python
from app.api.v1.schemas.annual_summary import PublicAnnualSummaryResponse, PublicAnnualSummaryItem
```
To:
```python
from app.api.v1.schemas.annual_summary import PublicAnnualSummaryResponse, PublicAnnualSummaryItem, PublicAnnualSummaryByCategoryResponse, PublicAnnualSummaryByCategoryItem
```

**Step 3: Run linter**

Run: `cd apps/api && ruff check app/api/v1/endpoints/public_annual_summaries.py`
Expected: No errors

**Step 4: Test the endpoint manually**

Start server: `cd apps/api && uvicorn app.main:app --reload`
Run: `curl "http://localhost:8000/api/v1/public/annual-summaries/by-category?categories=%E4%B8%AD%E6%8E%A7%E6%A3%80%E6%B5%8B,%E5%95%86%E5%8A%A1%E5%85%A8%E6%A3%80,%E5%AF%B9%E7%85%A7%E5%93%81%E6%A0%87%E5%AE%9A,%E7%A0%94%E5%8F%91%E5%85%A8%E6%A3%80&year=2025"`
Expected: JSON with year and data array

**Step 5: Commit**

```bash
git add apps/api/app/api/v1/endpoints/public_annual_summaries.py
git commit -m "feat(api): add public by-category annual summaries endpoint"
```

---

## Task 3: Add i18n keys for the 4 new metrics

**Files:**
- `apps/web/src/i18n/messages/zh.json`
- `apps/web/src/i18n/messages/en.json`

**Step 1: Add zh.json keys**

Find the `home` section (or appropriate location), add under `hero` or `metrics`:
```json
"heroMetrics": {
  "zhongkong": "中控检测",
  "businessFull": "商务全检",
  "referenceStandard": "对照品标定",
  "rdFull": "研发全检",
  "unit": "批"
}
```

**Step 2: Add en.json keys**

```json
"heroMetrics": {
  "zhongkong": "In-Process Control",
  "businessFull": "Business Full Inspection",
  "referenceStandard": "Reference Standard",
  "rdFull": "R&D Full Testing",
  "unit": "batches"
}
```

**Step 3: Commit**

```bash
git add apps/web/src/i18n/messages/zh.json apps/web/src/i18n/messages/en.json
git commit -m "feat(web): add i18n keys for hero metrics"
```

---

## Task 4: Replace HeroSection hardcoded stats with API-driven data

**File:** `apps/web/src/components/home/HeroSection.tsx`

**Step 1: Replace bottom metrics bar (lines 119-136)**

Replace the entire bottom metrics `<div>` (lines 119-136) with:
```tsx
{/* Bottom metrics bar - API driven */}
<div
  className="flex flex-wrap gap-8 pt-8 border-t border-white/20 mt-8 animate-hero-cta-reveal"
  style={{ animationDelay: '0.5s' }}
>
  {metricsData.map((metric, index) => (
    <div key={index} className="space-y-1">
      <p className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-orange-500">
        {metric.batch_count !== null && metric.batch_count !== undefined
          ? metric.batch_count.toLocaleString()
          : '—'}
      </p>
      <p className="text-sm text-white/60">{metric.label}</p>
    </div>
  ))}
</div>
```

**Step 2: Add state and useEffect near top of component (after line 11)**

Add after `const [currentIndex, setCurrentIndex] = useState(0);`:
```tsx
const [metricsData, setMetricsData] = useState<Array<{ label: string; batch_count: number | null }>>([]);
const [metricsLoading, setMetricsLoading] = useState(true);

useEffect(() => {
  const fetchMetrics = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      const categories = ['中控检测', '商务全检', '对照品标定', '研发全检'];
      const labels = [
        t("heroMetrics.zhongkong"),
        t("heroMetrics.businessFull"),
        t("heroMetrics.referenceStandard"),
        t("heroMetrics.rdFull"),
      ];

      const res = await fetch(
        `/api/v1/public/annual-summaries/by-category?categories=${encodeURIComponent(categories.join(','))}&year=${previousYear}`
      );
      const json = await res.json();

      const data = (json.data || []).map((item: { category: string; batch_count: number | null }, i: number) => ({
        label: labels[i] || item.category,
        batch_count: item.batch_count,
      }));

      setMetricsData(data);
    } catch {
      // fallback: show empty
      setMetricsData([]);
    } finally {
      setMetricsLoading(false);
    }
  };
  fetchMetrics();
}, [t]);
```

**Step 3: Add skeleton/loading state**

Wrap the metric cards with loading check:
```tsx
{!metricsLoading && metricsData.length > 0 && (
  <div
    className="flex flex-wrap gap-8 pt-8 border-t border-white/20 mt-8 animate-hero-cta-reveal"
    style={{ animationDelay: '0.5s' }}
  >
    {metricsData.map((metric, index) => (
      <div key={index} className="space-y-1">
        <p className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-orange-500">
          {metric.batch_count !== null && metric.batch_count !== undefined
            ? metric.batch_count.toLocaleString()
            : '—'}
        </p>
        <p className="text-sm text-white/60">{metric.label}</p>
      </div>
    ))}
  </div>
)}
{!metricsLoading && metricsData.length === 0 && (
  <div className="flex flex-wrap gap-8 pt-8 border-t border-white/20 mt-8 animate-hero-cta-reveal" style={{ animationDelay: '0.5s' }}>
    <p className="text-sm text-white/60">暂无数据</p>
  </div>
)}
{metricsLoading && (
  <div className="flex flex-wrap gap-8 pt-8 border-t border-white/20 mt-8 animate-hero-cta-reveal" style={{ animationDelay: '0.5s' }}>
    {[1,2,3,4].map(i => (
      <div key={i} className="space-y-1 animate-pulse">
        <div className="h-8 w-20 bg-white/10 rounded" />
        <div className="h-4 w-16 bg-white/10 rounded" />
      </div>
    ))}
  </div>
)}
```

**Step 4: Run preflight**

Run: `/preflight` on the web app

**Step 5: Commit**

```bash
git add apps/web/src/components/home/HeroSection.tsx
git commit -m "feat(web): replace hero hardcoded stats with API-driven data"
```

---

## Verification

1. **Backend**: `curl "http://localhost:8000/api/v1/public/annual-summaries/by-category?categories=%E4%B8%AD%E6%8E%A7%E6%A3%80%E6%B5%8B,%E5%95%86%E5%8A%A1%E5%85%A8%E6%A3%80,%E5%AF%B9%E7%85%A7%E5%93%81%E6%A0%87%E5%AE%9A,%E7%A0%94%E5%8F%91%E5%85%A8%E6%A3%80&year=2025"` returns correct JSON
2. **Frontend**: `npm run dev` → homepage shows 4 metric cards with real batch_count data
3. **i18n**: Toggle language and verify all 4 metric labels change correctly
4. **Edge cases**: Year with no data shows "暂无数据"; API error shows skeleton then fallback
