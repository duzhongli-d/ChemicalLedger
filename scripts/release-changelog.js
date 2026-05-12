#!/usr/bin/env node
/**
 * release-changelog.js
 *
 * Generates a changelog section in Keep a Changelog format from commits since last tag,
 * prepends to CHANGELOG.md under [Unreleased].
 *
 * Usage: node scripts/release-changelog.js [package] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TYPE_MAP = {
  feat: 'Added',
  fix: 'Fixed',
  refactor: 'Changed',
  perf: 'Changed',
  docs: 'Changed',
  test: 'Changed',
  build: 'Changed',
  ci: 'Changed',
  chore: 'Changed',
  revert: 'Changed',
};

const COMMIT_REGEX = /^(\w+)(\([^)]+\))?(!)?:\s*(.+)$/;

function getLastTag(packageName) {
  try {
    const pattern = packageName ? `${packageName}/v*` : 'v*';
    return execSync(`git describe --tags --abbrev=0 --match="${pattern}"`, {
      encoding: 'utf-8',
      cwd: path.resolve(__dirname, '..'),
    }).trim();
  } catch {
    return null;
  }
}

function getCommitsSince(tag, packagePath) {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  try {
    const log = execSync(
      `git log ${range} --oneline --format="%H %s"${packagePath ? ` -- ${packagePath}` : ''}`,
      { encoding: 'utf-8', cwd: path.resolve(__dirname, '..') }
    ).trim();
    return log.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function parseCommit(line) {
  const spaceIdx = line.indexOf(' ');
  if (spaceIdx === -1) return null;
  const message = line.slice(spaceIdx + 1);
  const match = message.match(COMMIT_REGEX);
  if (!match) return null;
  const [, type, scope,, msg] = match;
  return {
    type,
    scope: scope ? scope.slice(1, -1) : null,
    message: msg.trim(),
    category: TYPE_MAP[type] || 'Changed',
  };
}

function groupByCategory(commits) {
  const groups = { Added: [], Changed: [], Fixed: [], Security: [], Removed: [], Deprecated: [] };
  for (const line of commits) {
    const c = parseCommit(line);
    if (!c) continue;
    if (groups[c.category]) {
      groups[c.category].push(`- ${c.type}${c.scope ? `(${c.scope})` : ''}: ${c.message}`);
    }
  }
  return groups;
}

function formatSection(category, items) {
  if (items.length === 0) return '';
  return `### ${category}\n${items.join('\n')}`;
}

function buildUnreleasedSection(groups) {
  const lines = ['## [Unreleased]\n'];
  const order = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
  for (const cat of order) {
    const section = formatSection(cat, groups[cat] || []);
    if (section) lines.push(section + '\n');
  }
  return lines.join('\n');
}

function buildVersionSection(version, groups) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [`## [${version}] - ${today}\n`];
  const order = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
  for (const cat of order) {
    const section = formatSection(cat, groups[cat] || []);
    if (section) lines.push(section + '\n');
  }
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const packageFilter = args.find(a => !a.startsWith('--') && a !== 'web' && a !== 'api');
  // Last non-flag arg is the version (passed during release-prepare)
  const versionArg = args.find((a, i) => !a.startsWith('--') && i > 0 && a !== packageFilter);

  const packages = packageFilter
    ? [{ name: packageFilter, path: `apps/${packageFilter}` }]
    : [{ name: 'web', path: 'apps/web' }, { name: 'api', path: 'apps/api' }];

  const changelogPath = path.resolve(__dirname, '..', 'CHANGELOG.md');
  const changelog = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf-8') : '';

  // Remove existing [Unreleased] section
  const unreleasedStart = changelog.indexOf('## [Unreleased]');
  const cleanChangelog = unreleasedStart !== -1 ? changelog.slice(0, unreleasedStart).trim() : changelog;

  const allGroups = { Added: [], Changed: [], Fixed: [], Security: [], Removed: [], Deprecated: [] };

  for (const pkg of packages) {
    const lastTag = getLastTag(pkg.name);
    const commits = getCommitsSince(lastTag, pkg.path);
    const groups = groupByCategory(commits);
    for (const [cat, items] of Object.entries(groups)) {
      allGroups[cat].push(...items.map(i => `  ${i}`));
    }
    console.log(`${pkg.name}: ${commits.length} commits since ${lastTag || 'beginning'}`);
  }

  let newChangelog;
  if (versionArg) {
    // During release: move [Unreleased] to versioned section, leave empty [Unreleased]
    const versionSection = buildVersionSection(versionArg, allGroups);
    const unreleasedSection = buildUnreleasedSection({ Added: [], Changed: [], Fixed: [], Security: [], Removed: [], Deprecated: [] });
    newChangelog = `${cleanChangelog.trim()}\n\n${versionSection}\n${unreleasedSection}`;
  } else {
    // During check: show all commits under [Unreleased]
    const unreleased = buildUnreleasedSection(allGroups);
    newChangelog = `${cleanChangelog.trim()}\n\n${unreleased}\n`;
  }

  if (dryRun) {
    console.log('\n--- DRY RUN: Would write to CHANGELOG.md ---');
    console.log(newChangelog);
    console.log('------------------------------------------');
  } else {
    fs.writeFileSync(changelogPath, newChangelog);
    console.log(`\nUpdated CHANGELOG.md`);
  }
}

main();