@AGENTS.md

## Project-Specific Rules

### Theme Configuration
- Store theme settings in single source of truth (Tailwind config or CSS variables)
- Do NOT hardcode theme classes in layout.tsx or page components (e.g. `className="dark"` or `className="light"`)
- When implementing light/dark mode, update ALL components using `data-theme` attributes consistently
- Hardcoded theme classes in layout.tsx conflict with the `data-theme` system and break dark mode for users

### Chinese UI Patterns
- Navigation menus frequently contain Chinese items like '联系我们', '关于我们', 'AI台账管家', 'Deep Research 助手'
- When adding menu items, check for duplicates before committing — Chinese text detection prevents accidental duplication
- Status badges and labels use Chinese text (e.g., '已通过', '待审核', '立即开始', '了解更多')
- Test all interactive elements with both English and Chinese content — Chinese text is often longer and can break fixed-width layouts

### Edit Safety Rules
- When editing structural elements (wrappers, containers, divs), verify parent-child relationships after each edit
- Always check imports when adding new components to avoid runtime errors — missing imports are a common bug introduced during edits
- For header/navigation changes, verify all interactive elements (toggles, links, menus) render correctly
- Run `/preflight` before making changes to catch hardcoded themes, duplicate imports, CRLF issues, and duplicate Chinese nav entries

### i18n Implementation Guidelines
- Language toggle uses `usePathname` from next-intl which strips locale prefixes — use `locale()` from next-intl instead for proper locale-aware routing
- Route changes require testing locale switching in both directions (EN → 中文 and 中文 → EN)
- Verify pages load without 500 errors after i18n changes — check `messages/zh.json` has all required translation keys
- The homepage redirects `/` to `/zh` automatically via Next.js middleware — locale is always present in the URL

### High-Risk Files (always run /preflight before editing)
- `apps/web/src/app/layout.tsx` — theme configuration lives here
- `apps/web/src/components/header/` — navigation items, language toggle
- `apps/web/src/components/about/` — tab components with Chinese labels
- Any `page.tsx` in the app directory
