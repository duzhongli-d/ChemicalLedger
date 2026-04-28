# Commit & Push

Git add all changes, commit with descriptive message, and push to remote.

## When to Use
After completing any fix or implementation. ALWAYS commit and push changes before moving to a new task. This prevents lost work from interrupted sessions.

## Workflow

1. **Check git status** - Review what files changed
2. **Draft commit message** - Describe the change in imperative mood:
   - `feat: add X` for new features
   - `fix: resolve X` for bug fixes
   - `refactor: improve X` for code improvements
   - `docs: update X` for documentation
3. **Ask user for confirmation** if no message provided
4. **Execute**: `git add <files>` then `git commit -m "<message>"` then `git push`

## Rules
- Only commit intentional changes (not .pyc, __pycache__, node_modules)
- Use `git add <specific-files>` instead of `git add .` to avoid committing sensitive files
- If commit fails due to pre-commit hook, fix issues and recommit (do NOT use --no-verify)

## Example
```
git add apps/web/src/components/Button.tsx
git commit -m "fix: resolve button click handler not firing on first render"
git push
```
