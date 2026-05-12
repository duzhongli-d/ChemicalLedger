#!/usr/bin/env node
/**
 * release-prepare.js
 *
 * Orchestration script: runs check → bump → changelog → git add → git commit → git tag.
 *
 * Usage: node scripts/release-prepare.js <version> <package> [--dry-run] [--skip-tests]
 *   version - New version string, e.g. "0.2.0"
 *   package - "web", "api", or "shared"
 *
 * Example: node scripts/release-prepare.js 0.2.0 web
 */

const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { encoding: 'utf-8', cwd: rootDir, ...opts });
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node scripts/release-prepare.js <version> <package> [--dry-run] [--skip-tests]');
    console.error('  version - e.g. "0.2.0"');
    console.error('  package - "web", "api", or "shared"');
    process.exit(1);
  }

  const [version, pkg] = args;
  const dryRun = args.includes('--dry-run');
  const skipTests = args.includes('--skip-tests');

  console.log(`\n🚀 Release preparation for ${pkg}@${version}`);
  console.log('='.repeat(50));

  // Step 1: Check commits
  console.log('\n[1/6] Checking commits since last tag...');
  try {
    const checkOut = run(`node scripts/release-check.js ${pkg}`);
    console.log(checkOut);
  } catch (e) {
    console.error('Commit check failed:', e.message);
  }

  // Step 2: Bump version
  console.log('\n[2/6] Bumping version...');
  const bumpType = detectBumpType(version);
  if (bumpType) {
    if (!dryRun) run(`node scripts/release-bump.js ${pkg} ${bumpType}`);
    console.log(`  Bumped ${pkg} to ${version} (${bumpType})`);
  } else {
    console.log(`  Setting exact version to ${version}`);
    if (!dryRun) setExactVersion(pkg, version);
  }

  // Step 3: Update changelog
  console.log('\n[3/6] Updating CHANGELOG.md...');
  if (!dryRun) {
    run(`node scripts/release-changelog.js ${pkg}`);
  }

  // Step 4: Git add
  console.log('\n[4/6] Staging files...');
  if (!dryRun) {
    const files = pkg === 'web'
      ? ['apps/web/package.json', 'CHANGELOG.md']
      : pkg === 'api'
      ? ['apps/api/pyproject.toml', 'CHANGELOG.md']
      : ['packages/shared/package.json', 'CHANGELOG.md'];
    run(`git add ${files.join(' ')}`);
    console.log(`  Staged: ${files.join(', ')}`);
  }

  // Step 5: Git commit
  console.log('\n[5/6] Creating commit...');
  const tagName = `${pkg}/v${version}`;
  if (!dryRun) {
    run(`git commit -m "release(${pkg}): bump to ${version}"`);
    console.log(`  Created commit: release(${pkg}): bump to ${version}`);
  } else {
    console.log(`  [DRY RUN] Would commit: release(${pkg}): bump to ${version}`);
  }

  // Step 6: Git tag
  console.log('\n[6/6] Tagging...');
  if (!dryRun) {
    run(`git tag ${tagName}`);
    console.log(`  Created tag: ${tagName}`);
  } else {
    console.log(`  [DRY RUN] Would tag: ${tagName}`);
  }

  console.log('\n' + '='.repeat(50));
  if (dryRun) {
    console.log('✅ DRY RUN complete. Run without --dry-run to execute for real.');
  } else {
    console.log('✅ Release prepared successfully!');
    console.log(`\n  Next steps:`);
    console.log(`  1. Review the commit: git log -1 --stat`);
    console.log(`  2. Push: git push && git push ${tagName}`);
    console.log(`  3. The GitHub Actions workflow will create a release automatically.`);
  }
}

function detectBumpType(newVersion) {
  // heuristic: if newVersion is just "major", "minor", "patch"
  if (['major', 'minor', 'patch'].includes(newVersion)) return newVersion;
  return null;
}

function setExactVersion(pkg, version) {
  const fs = require('fs');
  const path = require('path');

  if (pkg === 'web') {
    const fp = path.join(rootDir, 'apps', 'web', 'package.json');
    const json = JSON.parse(fs.readFileSync(fp, 'utf-8'));
    json.version = version;
    fs.writeFileSync(fp, JSON.stringify(json, null, 2) + '\n');
  } else if (pkg === 'api') {
    const fp = path.join(rootDir, 'apps', 'api', 'pyproject.toml');
    let content = fs.readFileSync(fp, 'utf-8');
    content = content.replace(/^(version\s*=\s*)["']([^"']+)["']/m, `$1"${version}"`);
    fs.writeFileSync(fp, content);
  }
}

main();