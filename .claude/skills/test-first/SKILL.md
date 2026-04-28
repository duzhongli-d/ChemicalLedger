# Test-First Development

Generate Playwright E2E tests BEFORE implementing features, then implement iteratively until all tests pass.

## When to Use
When building new features, especially complex user flows. This ensures the feature works end-to-end from the user's perspective.

## Workflow

### Phase 1: Write Tests First (Red)
1. **Analyze requirements** - Understand what the feature should do
2. **Write failing tests** - Cover happy path, edge cases, error states
3. **Run tests** - Confirm they fail (for the right reasons)

### Phase 2: Implement (Green)
1. **Implement minimal code** - Just enough to make tests pass
2. **Run tests** - Confirm they pass
3. **Refactor** - Improve code while keeping tests green

### Phase 3: Verify
1. **Run full test suite** - Ensure no regressions
2. **Browser verification** - Take screenshot to confirm UI
3. **Commit** - With test files included

## Test Structure
```typescript
// e2e/feature-name.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('happy path - completes successfully', async ({ page }) => {
    // Arrange - navigate to starting state
    await page.goto('/feature');

    // Act - perform the action
    await page.getByRole('button', { name: 'Submit' }).click();

    // Assert - verify expected outcome
    await expect(page.getByText('Success')).toBeVisible();
  });

  test('error state - shows validation message', async ({ page }) => {
    // Test edge case
  });

  test('edge case - handles empty input', async ({ page }) => {
    // Test another edge case
  });
});
```

## Test Categories to Cover
1. **Happy path** - Main user flow completes successfully
2. **Validation errors** - Invalid input shows correct error
3. **Authorization** - Users can/cannot access what they should
4. **Edge cases** - Empty data, max length, special characters
5. **Error states** - Network failure, server error handling

## Running Tests
```bash
npx playwright test e2e/feature-name.spec.ts
```

## Integration with /verify
After tests pass, use the `/verify` skill to do browser verification before committing.
