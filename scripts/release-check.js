#!/usr/bin/env node
/**
 * release-check.js
 *
 * Reads commits since last tag, parses conventional commits,
 * categorizes by type (Added/Changed/Fixed/etc.), prints summary to console.
 *
 * Usage: node scripts/release-check.js [package]
 *   package  - Optional: "web", "api", or "shared". If omitted, checks all packages.
 */

const { execSync } = require('child_process');
const path = require('path');

// Conventional commit types → Keep a Changelog categories
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
  deprek: 'Deprecated',   // typo in spec, but handle it
  deprecate: 'Deprecated',
};

// Regex to parse conventional commits: type(scope)!?: message
const COMMIT_REGEX = /^(\w+)(\([^)]+\))?(!)?:\s*(.+)$/;

function getLastTag(packageName) {
  try {
    const pattern = packageName ? `${packageName}/v*` : 'v*';
    const tag = execSync(`git describe --tags --abbrev=0 --match="${pattern}"`, {
      encoding: 'utf-8',
      cwd: path.resolve(__dirname, '..'),
    }).trim();
    return tag;
  } catch {
    return null;
  }
}

function getCommitsSince(tag, packagePath) {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  const cwd = path.resolve(__dirname, '..');

  try {
    const log = execSync(
      `git log ${range} --oneline --format="%H %s"${packagePath ? ` -- ${packagePath}` : ''}`,
      { encoding: 'utf-8', cwd }
    );
    return log.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function parseCommit(line) {
  // Format: "hash commit message"
  const spaceIdx = line.indexOf(' ');
  if (spaceIdx === -1) return null;
  const message = line.slice(spaceIdx + 1);
  const match = message.match(COMMIT_REGEX);
  if (!match) return null;

  const [, type, scope, breaking, msg] = match;
  return {
    type,
    scope: scope ? scope.slice(1, -1) : null, // remove parens
    breaking: !!breaking || message.includes('!'),
    message: msg.trim(),
    category: TYPE_MAP[type] || 'Changed',
  };
}

function analyzeCommits(commits) {
  const categories = {};
  for (const line of commits) {
    const commit = parseCommit(line);
    if (!commit) continue;
    const { category, type, scope, message } = commit;
    if (!categories[category]) categories[category] = [];
    categories[category].push({ type, scope, message });
  }
  return categories;
}

function printReport(packageName, categories, commitCount) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Package: ${packageName || 'monorepo'}`);
  console.log(`${'='.repeat(60)}`);

  if (commitCount === 0) {
    console.log('  No commits found since last tag (or no tags exist).');
    console.log('  Run this script after making commits to see what would be released.');
    return;
  }

  console.log(`  Total commits: ${commitCount}`);

  const categoryLabels = {
    Added: '✨ Added',
    Changed: '🔄 Changed',
    Deprecated: '⚠️  Deprecated',
    Removed: '🗑️  Removed',
    Fixed: '🐛 Fixed',
    Security: '🔒 Security',
  };

  const labelOrder = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];

  for (const cat of labelOrder) {
    const items = categories[cat];
    if (!items || items.length === 0) continue;
    console.log(`\n  ${categoryLabels[cat]}:`);
    for (const item of items) {
      const scope = item.scope ? `(${item.scope})` : '';
      const breaking = item.type === 'fix' && item.message.toLowerCase().includes('breaking')
        ? ' ⚠️ BREAKING' : '';
      console.log(`    - ${item.type}${scope}: ${item.message}${breaking}`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const packageFilter = args[0] || null;

  const packages = packageFilter
    ? [{ name: packageFilter, path: `apps/${packageFilter}` }]
    : [
        { name: 'web', path: 'apps/web' },
        { name: 'api', path: 'apps/api' },
      ];

  let totalCommits = 0;

  for (const pkg of packages) {
    const lastTag = getLastTag(pkg.name);
    const commits = getCommitsSince(lastTag, pkg.path);
    const categories = analyzeCommits(commits);
    printReport(pkg.name, categories, commits.length);
    totalCommits += commits.length;
  }

  console.log(`\n${'='.repeat(60)}`);
  if (totalCommits === 0) {
    console.log('No unreleased commits found. Create a release with:');
    console.log('  node scripts/release-prepare.js <version> <package>');
  } else {
    console.log(`Total unreleased commits across packages: ${totalCommits}`);
    console.log('\nTo create a release, run:');
    console.log('  node scripts/release-prepare.js <version> <package>');
    console.log('\nExample: node scripts/release-prepare.js 0.2.0 web');
  }
}

main();