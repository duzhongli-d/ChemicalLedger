# Verify Changes with Browser

Launch Playwright browser, navigate to changed page, verify across mobile/theme/locale environments, take screenshots, confirm UI matches expected result, report discrepancies.

## When to Use

**ALWAYS run after making frontend changes** — before committing. This catches visual bugs that code review misses: hardcoded colors that break in dark mode, layout breaks at mobile widths, Chinese text overflow, and interactive elements that don't respond.

**Prerequisite:** Run `/preflight` before making changes. This skill verifies *after* edits.

## Workflow

### Phase 1 — Dev Server & Browser Setup
1. **Confirm dev server is running** — Port 3000 for web app (check .env.local)
2. **Launch browser** — `browser_navigate` to the changed page
3. **Capture snapshot** — `browser_snapshot` to verify page structure

### Phase 2 — Desktop Verification
4. **Take screenshot** — `browser_take_screenshot` — full desktop view
5. **Check console errors** — `browser_console_messages(level="error")` — should be empty
6. **Verify changed element** — Confirm the edited UI is visible and positioned correctly

### Phase 3 — Multi-Environment Checks (REQUIRED for any UI change)

**Mobile viewport:**
```
browser_resize(375, 812)
browser_take_screenshot()
```
Check: menus render, toggles work, no horizontal overflow, Chinese text doesn't break layouts.

**Light/Dark theme toggle:**
- If theme was changed: switch themes via UI toggle, take screenshot of each state
- If theme wasn't changed: still verify existing theme works correctly
Check: all components respond to theme change, no hardcoded colors override `data-theme`

**Language switcher (EN ↔ 中文):**
- Navigate to EN locale version
- Take screenshot
- Switch to 中文 locale
- Take screenshot
- Check for 500 errors after navigation
Check: all visible text updates correctly, no layout break with Chinese text length

### Phase 4 — Final Report
7. **Report findings** — Use this format:

```
## Verify Report: [page name]

Desktop:
- [ ] Page loads correctly
- [ ] Changed element visible
- [ ] No console errors

Mobile (375px):
- [ ] Menu renders correctly
- [ ] Interactive elements work
- [ ] No overflow

Theme:
- [ ] Light mode works
- [ ] Dark mode works

Locale:
- [ ] EN version correct
- [ ] 中文 version correct
- [ ] No 500 errors

RESULT: PASS / ISSUES FOUND
```

## Verification Checklist

- [ ] Page loads without crash
- [ ] Changed UI element is visible on desktop
- [ ] No console errors
- [ ] Interactive elements respond to clicks/hover
- [ ] Mobile viewport (375px): menus, toggles, no overflow
- [ ] Light/dark theme toggle: all components update correctly
- [ ] Language switcher: EN ↔ 中文 both work, no 500 errors

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Page blank | Wrong port or server down | Check .env.local port, restart dev server |
| 401 Unauthorized | Missing auth token | Add `credentials: 'include'` to fetch |
| CORS error | Backend CORS misconfigured | Check backend allow_origins |
| Mobile menu broken | CSS overflow or hidden element | Check flexbox overflow, padding on hamburger |
| Theme toggle broken | Hardcoded `className="dark"` | Remove hardcoded class, use `data-theme` only |
| Language toggle not switching | usePathname strips locale prefix | Use `locale()` from next-intl instead |
| Chinese text breaks layout | Fixed-width containers | Use `min-width` or `whitespace: nowrap` carefully |
| 500 error after locale switch | Missing translation key | Check messages/zh.json has all keys |

## Example Full Session

```
// After editing InstrumentGallery.tsx and CoreStrengths.tsx

1. browser_navigate("http://localhost:3000/")
2. browser_snapshot()  // Verify page loads
3. browser_take_screenshot()  // Desktop

4. browser_resize(375, 812)  // Mobile
5. browser_take_screenshot()  // Mobile view

6. browser_resize(1920, 1080)  // Back to desktop
7. [Toggle theme via UI click]
8. browser_take_screenshot()  // Dark mode

9. browser_navigate("http://localhost:3000/en")
10. browser_take_screenshot()  // English
11. browser_navigate("http://localhost:3000/zh")
12. browser_take_screenshot()  // Chinese

13. browser_console_messages(level="error")  // Should be empty

Report: All checks pass
```
