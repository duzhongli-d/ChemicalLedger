# Release Process

This document describes the release workflow for the ChemicalLedger monorepo.

## Overview

Releases are managed through a **hybrid manual + script** approach:
- Conventional commits trigger changelog generation
- `release-prepare.js` orchestrates version bump, changelog update, git commit, and tagging
- GitHub Actions automatically creates a GitHub Release when a tag is pushed

**Goals:** GitHub Releases + proper changelog. NOT npm/pypi publishing.

---

## Versioning

Each package has independent versioning following [Semantic Versioning 2.0.0](https://semver.org/):

| Package | Current Version | Tag Pattern |
|---------|----------------|-------------|
| `web` | 0.1.0 | `web/v0.1.0` |
| `api` | 0.0.1 | `api/v0.0.1` |
| `shared` | 0.0.1 | `shared/v0.0.1` |

Tags follow the format: `{package}/v{version}`

---

## Conventional Commits

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types → Changelog Categories

| Commit Type | Changelog Category | Meaning |
|-------------|-------------------|---------|
| `feat` | **Added** | New feature |
| `fix` | **Fixed** | Bug fix |
| `refactor` | **Changed** | Code change without behavior change |
| `perf` | **Changed** | Performance improvement |
| `docs` | **Changed** | Documentation only |
| `test` | **Changed** | Adding or updating tests |
| `build` | **Changed** | Build system or CI |
| `ci` | **Changed** | CI configuration |
| `chore` | **Changed** | Maintenance tasks |
| `revert` | **Changed** | Reverting a commit |
| `deprecate` | **Deprecated** | Deprecating a feature |

### Breaking Changes

Add `!` after the type/scope to indicate a breaking change:
```
feat(auth)!: change token format

BREAKING CHANGE: tokens are now JWT instead of opaque
```

### Examples

```
feat(research): add NotebookLM integration
fix(ledgers): correct expiry date calculation
refactor(admin): unify button styles
docs: update README for research feature
```

---

## Local Release Process

### Prerequisites

- Node.js 18+ installed
- Git repository with clean working tree (or committed changes)
- Conventional commits since the last release tag

### Steps

**1. Check what would be released:**

```bash
node scripts/release-check.js web
# or for all packages:
node scripts/release-check.js
```

This prints a summary of commits since the last tag, grouped by changelog category.

**2. Prepare a release:**

```bash
node scripts/release-prepare.js 0.2.0 web
```

Arguments:
- `0.2.0` — new version (semver: major.minor.patch)
- `web` — package name (web, api, or shared)

The script will:
1. Check commits since last tag
2. Bump version in `package.json` or `pyproject.toml`
3. Generate changelog section in `CHANGELOG.md`
4. Stage the version file and changelog
5. Create a commit: `release(web): bump to 0.2.0`
6. Create a tag: `web/v0.2.0`

**3. Push and trigger release:**

```bash
git push && git push web/v0.2.0
```

The GitHub Actions `release.yml` workflow will trigger, creating a GitHub Release.

### Dry Run

Add `--dry-run` to preview without making changes:

```bash
node scripts/release-prepare.js 0.2.0 web --dry-run
```

---

## GitHub Actions Workflow

`.github/workflows/release.yml` triggers on tag pushes matching `**/v*.*.*`.

### Tag Parsing

The workflow extracts package name and version from the tag:
- `web/v0.2.0` → package=`web`, version=`0.2.0`
- `api/v0.0.2` → package=`api`, version=`0.0.2`

### Outputs

The workflow creates a GitHub Release with:
- **Title:** `{package} v{version}`
- **Body:** Content from `CHANGELOG.md` between `[Unreleased]` and the next version section
- **Draft:** No (published immediately)
- **Prerelease:** No (non-prerelease only)

### Manual Trigger

You can also trigger manually via GitHub Actions UI:
1. Go to Actions → Release workflow
2. Click "Run workflow"
3. Enter `package` and `version` inputs

---

## Post-Release Checklist

1. **Verify GitHub Release** — Check the release on GitHub has correct title, tag, and changelog body
2. **Verify CHANGELOG.md** — The `[Unreleased]` section should be cleared for the new version
3. **Test the released code** — Run E2E tests against the tagged commit if needed
4. **Announce** — Update relevant stakeholders about the new release

---

## Changelog Format

The `CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/) format:

```md
# Changelog

## [Unreleased]

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security

## [0.2.0] - 2026-05-13

### Added
- feature description

## [0.1.0] - 2026-01-01

### Added
- initial release
```

---

## Version Bump Guidelines

| Change Type | Bump Type | Example |
|-------------|-----------|---------|
| New feature | **minor** | 0.1.0 → 0.2.0 |
| Bug fix | **patch** | 0.1.0 → 0.1.1 |
| Breaking change | **major** | 0.1.0 → 1.0.0 |
| New feature with breaking API | **major** | 0.1.0 → 1.0.0 |

---

## Tips

- **Use scope** in commits to help categorize: `feat(research): ...` vs `feat(admin): ...`
- **Write descriptive messages** — these become changelog entries
- **Keep commits atomic** — one feature/fix per commit for cleaner changelog
- **Review before pushing** — `git log --oneline` to see what will be included