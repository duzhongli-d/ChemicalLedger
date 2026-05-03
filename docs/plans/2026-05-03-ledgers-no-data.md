# Fix `/ledgers` Page "暂无数据" Error - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the `/ledgers` page showing "暂无数据" (no data) even when ledgers exist in the database. The backend API returns an empty array because the API proxy route isn't properly proxying requests to the FastAPI backend.

**Architecture:** Next.js 16 with App Router, `next-intl` i18n, and a FastAPI backend. The Next.js dev server acts as a proxy for API requests (port 3000 → 8000). The `/ledgers` page calls `ledgerApi.list()` which hits `GET /api/v1/ledgers/` but receives an empty response.

**Tech Stack:** Next.js 16, next-intl, FastAPI, TypeScript, React Query

---

## Context

### Problem Analysis
- **Symptom:** `/zh/ledgers` page displays "暂无数据" (no data message)
- **Root Cause:** The Next.js proxy for `/api/v1/ledgers/` returns empty array `[]`
- **Why:** There is NO API proxy route at `apps/web/src/app/api/v1/ledgers/route.ts`

### Data Flow (Broken)

```
ledgers/page.tsx (useQuery)
  └─→ ledgerApi.list()                    [axios GET /ledgers/]
       └─→ api.get("/ledgers/")           [baseURL: http://localhost:8000/api/v1]
            └─→ http://localhost:8000/api/v1/ledgers/  [FASTAPI - running on 8000]
                 └─→ db.query(Ledger).all()  ← RETURNS DATA
```

But wait - if the backend is NOT running (port 8000 connection refused), then `ledgerApi.list()` catches the error and returns `undefined`. This causes:

```tsx
const all = Array.isArray(ledgersData) ? ledgersData : [];
// ledgersData = undefined → all = []
// filteredLedgers = [] → "暂无数据"
```

### Key Files
- **Page:** `apps/web/src/app/[locale]/ledgers/page.tsx:70-73` - fetches data via `ledgerApi.list()`
- **API Client:** `apps/web/src/lib/api-client.ts:26-28` - `ledgerApi.list()` makes request to FastAPI directly
- **Backend:** `apps/api/app/api/v1/ledgers.py:15-34` - `list_ledgers()` endpoint
- **Middleware:** `apps/web/src/middleware.ts` - redirects `/ledgers` → `/zh/ledgers`

### Verification Commands
```bash
# Check if backend is running (should return {"status":"ok"})
curl http://localhost:8000/health

# Check frontend proxy (if backend down, this will also fail)
curl http://localhost:3000/api/v1/ledgers/
```

---

## Tasks

### Task 1: Verify Backend Connectivity

**Files:** None

**Step 1: Check if backend is running**

```bash
curl http://localhost:8000/health
```

Expected: `{"status":"ok"}`
If fails: Backend is not running - start it with `cd apps/api && python -m uvicorn app.main:app --reload --port 8000`

**Step 2: Verify API returns data directly**

```bash
curl http://localhost:8000/api/v1/ledgers/
```

Expected: JSON array of ledgers (may be empty `[]` if no data)
If empty: This is expected if database has no ledgers

---

### Task 2: Start Backend Server (If Not Running)

**Files:** None

**Step 1: Start the FastAPI backend**

```bash
cd /d/ofubest/ChemicalLedger/apps/api
python -m uvicorn app.main:app --reload --port 8000 &
```

**Step 2: Verify backend is running**

```bash
sleep 3
curl http://localhost:8000/health
```

Expected: `{"status":"ok"}`

**Step 3: Verify API returns data**

```bash
curl http://localhost:8000/api/v1/ledgers/
```

Expected: JSON array

---

### Task 3: Verify Frontend Dev Server is Running

**Files:** None

**Step 1: Check if dev server is running**

```bash
curl -s http://localhost:3000 | head -5
```

If fails: Start with `npm run dev` in `apps/web` directory

**Step 2: Test the ledgers page in browser**

Navigate to `http://localhost:3000/zh/ledgers`

If "暂无数据" still appears after backend is confirmed running, the issue is in the frontend data handling or API client configuration.

---

### Task 4: Debug API Client Configuration

**Files:**
- Modify: `apps/web/src/lib/api-client.ts:1-6`

**Step 1: Check axios configuration**

The `api-client.ts` uses:
```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
```

This means in development, it connects DIRECTLY to FastAPI on port 8000, NOT through Next.js.

**Step 2: If backend is running but page shows no data**

The issue may be that `ledgerApi.list()` is throwing an error that's being swallowed. Check browser console for errors.

**Step 3: Add error handling (if needed)**

If error handling is missing, the query may fail silently. Consider adding:

```typescript
list: (params?: { status?: string; category_id?: string; search?: string }) =>
  api.get("/ledgers/", { params }).catch((err) => {
    console.error("Failed to fetch ledgers:", err);
    return { data: [] };
  }),
```

---

### Task 5: Verify Data Rendering

**Files:**
- Modify: `apps/web/src/app/[locale]/ledgers/page.tsx:70-77`

**Step 1: Check query response handling**

The page uses:
```typescript
const { data: ledgersData, isLoading } = useQuery({
  queryKey: ["ledgers"],
  queryFn: () => ledgerApi.list().then((r) => r.data),
});
```

If `ledgerApi.list()` rejects, `ledgersData` will be `undefined`.

**Step 2: Add defensive handling**

Current code at line 76-77:
```typescript
const { filteredLedgers, counts } = useMemo(() => {
  const all = Array.isArray(ledgersData) ? ledgersData : [];
```

This already handles `undefined` correctly by defaulting to empty array.

**Step 3: If data exists but still shows no data**

Check if `LedgerDataTable` component is receiving the data correctly. Add console.log:
```typescript
console.log("ledgersData:", ledgersData, "paginatedLedgers:", paginatedLedgers);
```

---

### Task 6: Final Verification

**Step 1: Clear any caches**

```bash
rm -rf apps/web/.next
npm run build
npm run dev
```

**Step 2: Test full flow**

1. Navigate to `http://localhost:3000/zh/ledgers`
2. Open browser DevTools → Network tab
3. Check if `GET /api/v1/ledgers/` returns data
4. Verify page renders ledgers instead of "暂无数据"

---

## Root Cause Summary

The "暂无数据" message appears because:

1. **Backend not running** - FastAPI server on port 8000 is not accessible
2. **API request fails** - `ledgerApi.list()` throws error or returns empty
3. **Data defaults to empty** - `ledgersData = undefined` → `all = []`
4. **No ledgers to display** - Filtered list is empty → "暂无数据" shown

`★ Insight ─────────────────────────────────────`
- The frontend `ledgerApi.list()` connects directly to `http://localhost:8000/api/v1` (FastAPI), NOT through Next.js
- Next.js middleware only handles page routes (`/ledgers`), not API routes (`/api/v1/ledgers`)
- The CORS config in `main.py` allows `http://localhost:3000` as an origin, meaning CORS isn't blocking it
`─────────────────────────────────────────────────`

## Verification

1. `curl http://localhost:8000/health` → `{"status":"ok"}`
2. `curl http://localhost:8000/api/v1/ledgers/` → JSON array
3. Navigate to `http://localhost:3000/zh/ledgers` → Ledger list displayed (not "暂无数据")