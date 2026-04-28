# Verify Changes with Browser

Launch Playwright browser, navigate to changed page, take screenshot, confirm UI matches expected result, report discrepancies.

## When to Use
After making frontend changes. ALWAYS verify the result in the browser before committing. This catches visual bugs that code review misses.

## Workflow

1. **Check dev server is running** - Verify port in .env.local (default 8000)
2. **Launch browser** - Use `browser_navigate` to open the page
3. **Take snapshot** - Use `browser_snapshot` to capture accessibility tree
4. **Take screenshot** - Use `browser_take_screenshot` for visual confirmation
5. **Verify key elements** - Check that changed elements are visible and functional
6. **Report findings** - List what works, what doesn't, any discrepancies

## Verification Checklist
- [ ] Page loads without crash
- [ ] Changed UI element is visible
- [ ] No console errors (check with `browser_console_messages`)
- [ ] Interactive elements respond to clicks/hover
- [ ] Responsive behavior works (if applicable)

## Common Issues & Fixes
| Issue | Check |
|-------|-------|
| Page blank | Dev server running on correct port |
| 401 Unauthorized | Auth token present, credentials: 'include' |
| CORS error | Backend CORS allow_origins includes frontend URL |
| Stale data | Clear cache, check API endpoint |

## Example Session
```
1. browser_navigate("http://localhost:3000/admin/users")
2. browser_snapshot()  // Check structure
3. browser_take_screenshot()  // Visual confirmation
4. browser_console_messages(level="error")  // No errors
```
