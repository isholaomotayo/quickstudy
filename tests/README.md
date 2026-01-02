# Test Suite

This project uses [Bun](https://bun.sh) as the primary test runner for faster, more efficient testing.

## Quick Start

```bash
# Run all tests
bun test
# or
npm test

# Run course import/export tests
npm run test:course

# Watch mode
bun test --watch

# With coverage
bun test --coverage
```

## Test Files

### Course Import/Export Tests

- **`course-markdown-parser.test.ts`** - Tests for markdown parsing and validation
  - Parser functionality
  - Validation logic
  - Question parsing (test, practice, assignment)
  - Edge cases

- **`course-import-export.test.ts`** - Tests for API endpoints
  - Import API (file upload, text input)
  - Export API (various options)
  - Error handling
  - Validation

### Other Tests

- `helpers/FetchWrapper.test.js` - Fetch wrapper tests
- `services/levelCalculationService.*.test.js` - Level calculation tests
- `integration/` - Integration tests
- `controllers/` - Controller tests

## Running Tests

### All Tests
```bash
bun test
```

### Specific Test Files
```bash
bun test tests/course-markdown-parser.test.ts
bun test tests/course-import-export.test.ts
```

### Course Tests Only
```bash
npm run test:course
# or
bun test tests/course-*.test.ts
```

### Watch Mode
```bash
bun test --watch
# or
npm run test:watch
```

### Coverage
```bash
bun test --coverage
# or
npm run test:coverage
```

## Test Structure

Tests use Bun's Jest-compatible API:

```typescript
import { describe, it, expect, beforeEach } from "bun:test";

describe("Feature Name", () => {
  beforeEach(() => {
    // Setup
  });

  it("should do something", () => {
    expect(actual).toBe(expected);
  });
});
```

## Performance

Bun tests are **10-100x faster** than Jest:
- ✅ No compilation step
- ✅ Native TypeScript support
- ✅ Faster file I/O
- ✅ Better parallelization

## Migration Notes

- All new tests should use Bun (`bun:test`)
- Existing Jest tests can coexist
- TypeScript tests use `.test.ts` extension
- JavaScript tests use `.test.js` extension

## Configuration

- **`bunfig.toml`** - Bun configuration
- **`tests/setup-bun.ts`** - Test setup file (runs before all tests)

## Troubleshooting

### Bun not installed
```bash
curl -fsSL https://bun.sh/install | bash
```

### TypeScript errors
- Ensure `tsconfig.json` is properly configured
- Use `.test.ts` extension for TypeScript tests

### Module resolution
- Check `tsconfig.json` paths
- Use relative imports when possible



