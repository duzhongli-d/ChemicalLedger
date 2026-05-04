# Preflight Checks

Run pre-flight validation on files before making changes. Catches the issues that cause debugging sessions later: hardcoded themes, duplicate imports, CRLF encoding, duplicate menu entries.

## When to Use

**ALWAYS run before making frontend changes.** Also run when working on files that were recently edited by others (different OS, different session, etc.).

## Pre-Flight Checklist

Run these checks on any file you'll be editing, especially layout files, components, and navigation:

### 1. Hardcoded Theme Classes
```
Grep for: className="dark" OR className="light" in the file
```

**Why it matters:** Hardcoded theme classes in layout.tsx or page components conflict with the `data-theme` attribute system. This breaks dark mode for users even when the theme toggle is clicked.

**If found:** Remove the hardcoded class entirely — let `data-theme` on the root element control everything.

### 2. Duplicate Component Imports
```
Grep for: import.*LanguageToggle (or the component you're adding)
```

**Why it matters:** Duplicate imports cause runtime errors and are easy to accidentally introduce when editing files from different sessions.

**If found:** Consolidate to a single import line.

### 3. CRLF Line Endings (Windows)
```
Bash: file <filepath>
```

Look for "CRLF" in the output. CRLF line endings can cause mysterious git diffs and, in some cases, runtime issues.

**If found:** Convert to LF before committing, or configure git to handle CRLF properly.

### 4. Duplicate Chinese Menu Entries
```
Grep for: 联系我们|关于我们|联系我们|关于我们|产品|服务 in the same file
```

**Why it matters:** Duplicate nav items are a common bug when editing navigation across multiple sessions. Chinese labels are the easiest to catch because they're visually distinct.

**If found:** Remove the duplicate entry.

## Decision Flow

```
Run pre-flight checks
    ├── Issues found → REPORT ALL ISSUES before proceeding
    └── No issues → Safe to make edits

After edits → Run /verify skill to check the result in browser
```

## Report Format

After running checks, report:

```
## Pre-Flight Report: [filename]
- [ ] Hardcoded theme classes: CLEAN / FOUND [locations]
- [ ] Duplicate imports: CLEAN / FOUND [imports]
- [ ] CRLF line endings: CLEAN / FOUND
- [ ] Duplicate Chinese nav entries: CLEAN / FOUND

RESULT: PROCEED / STOP AND FIX
```

If STOP AND FIX — list the exact issues with file:line locations so they can be fixed before any new code is written.

## Example
```
// Before editing InstrumentGallery.tsx:

Grep("InstrumentGallery.tsx", 'className="dark"')     // → No results
Grep("InstrumentGallery.tsx", 'import.*LanguageToggle')  // → 1 result (ok)
Bash("file InstrumentGallery.tsx")                  // → ASCII text (ok)
Grep("InstrumentGallery.tsx", "联系我们")              // → No results (no duplicates)

RESULT: PROCEED — no issues found
```

## Files That Need Extra Attention

These files have historically caused issues in this project — always run pre-flight on them before editing:
- `apps/web/src/app/layout.tsx` — theme configuration lives here
- `apps/web/src/components/header/` — navigation items, language toggle
- `apps/web/src/components/about/` — tab components with Chinese labels
- Any `page.tsx` in the app directory

## What This Does NOT Do

Pre-flight checks are not browser verification. They don't replace `/verify` — they complement it. Run pre-flight before editing, run `/verify` after editing.