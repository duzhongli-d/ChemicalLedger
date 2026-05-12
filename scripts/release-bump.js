#!/usr/bin/env node
/**
 * release-bump.js
 *
 * Updates version in package.json or pyproject.toml based on semver bump type.
 *
 * Usage: node scripts/release-bump.js <package> <bump>
 *   package - "web", "api", or "shared"
 *   bump    - "major", "minor", or "patch"
 */

const fs = require('fs');
const path = require('path');

function bumpVersion(version, type) {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: ${version}`);
  }

  const [major, minor, patch] = parts;
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${type}. Use major, minor, or patch.`);
  }
}

function readJsonVersion(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  return json.version;
}

function writeJsonVersion(filePath, newVersion) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  json.version = newVersion;
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
}

function readTomlVersion(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Simple regex for version = "x.y.z" in [project] table
  const match = content.match(/^version\s*=\s*["']([^"']+)["']/m);
  if (!match) throw new Error(`No version found in ${filePath}`);
  return match[1];
}

function writeTomlVersion(filePath, newVersion) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = content.replace(
    /^(version\s*=\s*)["']([^"']+)["']/m,
    `$1"${newVersion}"`
  );
  fs.writeFileSync(filePath, result);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node scripts/release-bump.js <package> <bump>');
    console.error('  package - "web", "api", or "shared"');
    console.error('  bump    - "major", "minor", or "patch"');
    process.exit(1);
  }

  const [pkg, bump] = args;

  const rootDir = path.resolve(__dirname, '..');
  let filePath, readVersion, writeVersion;

  switch (pkg) {
    case 'web': {
      filePath = path.join(rootDir, 'apps', 'web', 'package.json');
      readVersion = readJsonVersion;
      writeVersion = writeJsonVersion;
      break;
    }
    case 'api': {
      filePath = path.join(rootDir, 'apps', 'api', 'pyproject.toml');
      readVersion = readTomlVersion;
      writeVersion = writeTomlVersion;
      break;
    }
    case 'shared': {
      filePath = path.join(rootDir, 'packages', 'shared', 'package.json');
      readVersion = readJsonVersion;
      writeVersion = writeJsonVersion;
      break;
    }
    default:
      console.error(`Unknown package: ${pkg}. Use web, api, or shared.`);
      process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const oldVersion = readVersion(filePath);
  const newVersion = bumpVersion(oldVersion, bump);

  console.log(`Bumping ${pkg} from ${oldVersion} to ${newVersion} (${bump})`);

  writeVersion(filePath, newVersion);

  console.log(`Updated ${path.basename(filePath)} successfully.`);
}

main();