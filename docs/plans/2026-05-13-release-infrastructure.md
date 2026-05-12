# Release Infrastructure Setup Plan

**Date:** 2026-05-13
**Status:** In Progress

## Context

The ChemicalLedger monorepo currently has no formal release infrastructure:
- Three packages at different versions: `web=0.1.0`, `api=0.0.1`, `shared=0.0.1`
- No CHANGELOG.md, no git tags, no release workflow
- Conventional commits already in use throughout
- GitHub Actions E2E workflow exists at `.github/workflows/e2e.yml`

The goal is NOT to publish to npm/pypi — it's to create GitHub Releases and a proper changelog when code is ready to ship.

## Architecture

A hybrid manual+script approach using existing conventional commits (feat:, fix:, refactor:, etc.) without adding complex tooling like Changesets. Uses Keep a Changelog format, independent per-package versioning with `package/v0.x.x` tags, and a GitHub Actions workflow triggered on tag pushes.

**Tech Stack:** Node.js scripts, pnpm workspaces, GitHub Actions, Keep a Changelog, softprops/action-gh-release

---

## Files TO CREATE (in order)

### 1. `CHANGELOG.md` — Keep a Changelog initialization

Initialize with `[Unreleased]` section and placeholder entries for existing versions. Format follows https://keepachangelog.com/.

### 2. `scripts/release-check.js` — Commit validation

Reads commits since last tag, parses conventional commits, categorizes by type (Added/Changed/Fixed/etc.), prints summary to console.

### 3. `scripts/release-bump.js` — Version bumping

Updates version in `apps/web/package.json` or `apps/api/pyproject.toml` based on semver bump type (major/minor/patch) passed as CLI arg.

### 4. `scripts/release-changelog.js` — Changelog generation

Generates a changelog section in Keep a Changelog format from commits since last tag, prepends to CHANGELOG.md under `[Unreleased]`.

### 5. `scripts/release-prepare.js` — Orchestration script

Runs check → bump → changelog → git add → git commit → git tag in sequence. Takes `version` and `package` as args. Example: `node scripts/release-prepare.js 0.2.0 web`.

### 6. `RELEASE_PROCESS.md` — Release documentation

User-facing docs: conventional commit format, semver rules, tag naming (`web/v0.2.0`), local release process, GitHub Actions workflow, post-release checklist.

### 7. `.github/workflows/release.yml` — GitHub Actions release workflow

Triggers on tag push (pattern: `**/v*.*.*`). Parses `package/v0.x.x` tag to extract package name and version. Uses `softprops/action-gh-release@v2` to create GitHub Release. Also supports manual workflow_dispatch trigger.

### 8. Update `package.json` — Add release scripts and root version

Add scripts: `release:check`, `release:bump`, `release:changelog`, `release:prepare`. Set root version to `0.1.0`.

---

## FILES TO MODIFY

- `D:\ofubest\ChemicalLedger\package.json` — Add release scripts and root version
- No other existing source files are modified

---

## TASK BREAKDOWN

### Task 1: Initialize CHANGELOG.md
Create `CHANGELOG.md` at repo root with proper header, `[Unreleased]` section, and existing version entries for web 0.1.0, api 0.0.1, shared 0.0.1.

### Task 2: Write release-check.js
Script that parses conventional commits since last tag, categorizes them, prints report.

### Task 3: Write release-bump.js
Script that reads current version from package.json or pyproject.toml, bumps based on semver rules, writes back.

### Task 4: Write release-changelog.js
Script that generates a Keep a Changelog section from commits and prepends to CHANGELOG.md under `[Unreleased]`.

### Task 5: Write release-prepare.js
Orchestration script chaining all three scripts plus git operations.

### Task 6: Write RELEASE_PROCESS.md
Full user-facing documentation of the release process.

### Task 7: Write GitHub Actions release.yml
Workflow triggered on tag push. Parses package name and version from tag. Creates GitHub Release. Supports manual dispatch.

### Task 8: Update root package.json
Add release scripts and root version field.

### Task 9: Test locally
Run `node scripts/release-check.js` to verify it works. Optionally simulate a full dry-run.

---

## VERIFICATION

1. **Local check:** `node scripts/release-check.js` — should print commit summary for each package
2. **Workflow syntax:** Commit `.github/workflows/release.yml` and verify YAML is valid
3. **First real release:** Push tag `web/v0.1.1` to trigger workflow and create first GitHub Release
4. **Verify CHANGELOG.md** updates appear correctly after running `release-changelog.js`

---

## KEY UTILITIES REUSED

- Conventional commit parsing — regex `^(feat|fix|refactor|...)(\(.+\))?!?:(.+)$`
- Git tag extraction — `git describe --tags --abbrev=0 --match="v${pkg}-*"`
- Keep a Changelog format — categories: Added, Changed, Deprecated, Removed, Fixed, Security