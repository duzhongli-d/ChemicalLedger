# 设计方案：台账列表增加"是否开封"筛选

**日期：** 2026-04-30

## 1. 需求概述

在 `/admin/ledgers` 页面增加"是否开封"状态筛选，帮助管理员快速过滤已开封/未开封的试剂记录。

## 2. UI 设计

### 布局
采用**标签式选择器**（tab-style），横向排列在表头上方，过滤器区域右侧：

```
[搜索框] [状态▼] [品类▼/二级▼]        [全部 | 已开封 | 未开封]
```

- 使用横向 button group 样式，选中态有背景色/下划线区分
- 三个选项：`全部` / `已开封` / `未开封`
- 默认值：`全部`（页面加载时不过滤）

### 状态映射
| 筛选值 | 过滤条件 |
|--------|----------|
| 全部 | 不过滤 |
| 已开封 | `is_opened === true` |
| 未开封 | `is_opened === false` |

## 3. 前端实现

### 状态管理
```typescript
const [openedFilter, setOpenedFilter] = useState<"all" | "opened" | "unopened">("all");
```

### 筛选逻辑
在现有的 `filteredLedgers` useMemo 中增加：

```typescript
if (openedFilter === "opened") {
  filtered = filtered.filter((l) => l.is_opened === true);
} else if (openedFilter === "unopened") {
  filtered = filtered.filter((l) => l.is_opened === false);
}
```

### UI 组件
使用 Tailwind 的 button group 样式：

```tsx
<div className="flex items-center gap-1">
  {(["all", "opened", "unopened"] as const).map((opt) => (
    <button
      key={opt}
      onClick={() => setOpenedFilter(opt)}
      className={clsx(
        "px-3 py-1 text-sm rounded-md transition-colors",
        openedFilter === opt
          ? "bg-blue-100 text-blue-700 font-medium"
          : "text-slate-600 hover:bg-slate-100"
      )}
    >
      {opt === "all" ? "全部" : opt === "opened" ? "已开封" : "未开封"}
    </button>
  ))}
</div>
```

## 4. 后端（预留）

当前前端已通过 `page_size: 100` 获取完整列表，筛选在本地进行。如后续数据量大，可在 `GET /admin/ledgers/` 增加 `is_opened` 查询参数。

## 5. 验证方式

1. 切换到"未开封"，列表只显示 `is_opened=false` 的记录，"开封"按钮均可见
2. 切换到"已开封"，列表只显示 `is_opened=true` 的记录，"开封"按钮均不显示
3. 切换到"全部"，恢复原始列表
4. 与其他筛选器（状态、品类）叠加使用正常
