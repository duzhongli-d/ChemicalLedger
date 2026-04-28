# Autonomous Fix Propagation

When a bug is fixed in one file, scan the entire codebase for the same bug pattern and fix all occurrences.

## When to Use
After fixing any bug that has a recognizable pattern (silent failures, missing error handling, duplicate code, etc.)

## Workflow

1. **Identify the bug pattern** - After fixing a bug, analyze WHY it happened
2. **Define the anti-pattern** - Write a clear description of the buggy pattern
3. **Scan codebase** - Search for all files with the same pattern
4. **Document findings** - List every affected file and location
5. **Apply fixes** - Fix each occurrence with the same solution
6. **Verify all** - Run tests or browser verification on each fixed location
7. **Commit each fix** - Separate commits with descriptive messages per file

## Example Anti-Patterns to Hunt

### Silent Failure Pattern (catch without action)
```
// BAD - error caught but not handled
.catch(() => {})

// GOOD - error caught and logged/handled
.catch((err) => console.error('Action failed:', err));
```

### Missing credentials: 'include'
```
// BAD - fetch without credentials
fetch('/api/data')

// GOOD - fetch with credentials
fetch('/api/data', { credentials: 'include' })
```

### Memory leak (missing cleanup)
```
// BAD - no cleanup
useEffect(() => { subscribe() })

// GOOD - cleanup function
useEffect(() => { subscribe(); return () => unsubscribe() })
```

## Reporting Format
When propagating fixes, report:
- Pattern identified
- Files found with the pattern
- Fix applied to each
- Verification status per file
