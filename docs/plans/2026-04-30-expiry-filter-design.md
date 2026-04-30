# 设计方案：增加有效期查询筛选

**日期：** 2026-04-30

## 1. 需求概述

在 `/admin/ledgers` 页面增加"有效期"快捷筛选，帮助管理员快速查看临期或已过期的试剂。

## 2. UI 设计

### 布局
在过滤器区域右侧，与"是否开封" tab 组并列：

```
[搜索框] [状态▼] [品类▼/二级▼]   [全部/已开封/未开封]   [全部/10天/20天/已过期]
```

两个 tab 组各司其职：
- **开封状态**（全部/已开封/未开封）— 操作视角
- **有效期**（全部/10天/20天/已过期）— 临期视角

### 筛选值映射
| 筛选值 | 条件 |
|--------|------|
| 全部 | 不过滤 |
| 10天 | `daysLeft >= 0 && daysLeft <= 10` |
| 20天 | `daysLeft >= 0 && daysLeft <= 20` |
| 已过期 | `daysLeft < 0` |

其中 `daysLeft = Math.ceil((effective_expiry_date - today) / 86400000)`

## 3. 前端实现

### 状态管理
```typescript
const [expiryFilter, setExpiryFilter] = useState<"all" | "10d" | "20d" | "expired">("all");
```

### 筛选逻辑
在 `filteredLedgers` useMemo 中增加：

```typescript
if (expiryFilter === "10d") {
  filtered = filtered.filter((l) => {
    const days = Math.ceil((new Date(l.effective_expiry_date).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 10;
  });
} else if (expiryFilter === "20d") {
  filtered = filtered.filter((l) => {
    const days = Math.ceil((new Date(l.effective_expiry_date).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 20;
  });
} else if (expiryFilter === "expired") {
  filtered = filtered.filter((l) => {
    const days = Math.ceil((new Date(l.effective_expiry_date).getTime() - Date.now()) / 86400000);
    return days < 0;
  });
}
```

### UI 组件
使用与"开封"tab 相同的 button group 样式：

```tsx
<div className="flex items-center gap-1">
  {(["all", "10d", "20d", "expired"] as const).map((opt) => (
    <button
      key={opt}
      onClick={() => {
        setExpiryFilter(opt);
        setCurrentPage(1);
      }}
      className={clsx(
        "px-3 py-1 text-sm rounded-md transition-colors",
        expiryFilter === opt
          ? "bg-amber-100 text-amber-700 font-medium"
          : "text-slate-600 hover:bg-slate-100"
      )}
    >
      {opt === "all" ? "全部" : opt === "10d" ? "10天" : opt === "20d" ? "20天" : "已过期"}
    </button>
  ))}
</div>
```

注意：已过期选中态使用 `amber` 色系（与页面现有的过期日期红色呼应），与开封tab的蓝色区分。

## 4. 验证方式

1. 切换到"10天"，列表只显示 10 天内到期的记录（不含过期）
2. 切换到"20天"，列表只显示 20 天内到期的记录（不含过期）
3. 切换到"已过期"，列表只显示已过期记录
4. 切换到"全部"，恢复原始列表
5. 与其他筛选器（状态、品类、开封状态）叠加使用正常
