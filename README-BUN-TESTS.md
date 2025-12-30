# Bun Test Setup

This project uses [Bun](https://bun.sh) as the test runner for faster, more efficient testing.

## Why Bun?

- **10-100x faster** than Jest/Node.js
- **Built-in TypeScript support** - no configuration needed
- **Built-in test runner** - no additional dependencies
- **Native ESM support**
- **Better performance** for large test suites

## Installation

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Or using npm
npm install -g bun
```

## Running Tests

### Run all tests
```bash
bun test
# or
npm test
```

### Run specific test files
```bash
bun test tests/course-markdown-parser.test.ts
bun test tests/course-import-export.test.ts
```

### Run course-related tests
```bash
npm run test:course
# or
bun test tests/course-*.test.ts
```

### Watch mode
```bash
bun test --watch
# or
npm run test:watch
```

### With coverage
```bash
bun test --coverage
# or
npm run test:coverage
```

## Test Structure

Tests are located in the `tests/` directory:

- `course-markdown-parser.test.ts` - Parser and validation tests
- `course-import-export.test.ts` - API endpoint tests
- Other existing tests remain in their current format

## Writing Tests

Bun uses a Jest-compatible API, so tests look familiar:

```typescript
import { describe, it, expect, beforeEach } from "bun:test";

describe("My Feature", () => {
  beforeEach(() => {
    // Setup
  });

  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

## Configuration

Test configuration is in `bunfig.toml`:
- Test timeout: 10 seconds
- Coverage enabled by default
- Preload file: `tests/setup-bun.ts`

## Migration from Jest

The test API is compatible with Jest, so most tests can be migrated easily:

1. Change imports from `jest` to `bun:test`
2. Update test file extensions to `.ts` if using TypeScript
3. Run tests with `bun test` instead of `jest`

## Performance

Bun tests typically run 10-100x faster than Jest:
- No compilation step needed
- Native TypeScript support
- Faster file I/O
- Better parallelization

## Troubleshooting

### Bun not found
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

### TypeScript errors
Bun has built-in TypeScript support. If you see errors, check:
- `tsconfig.json` is properly configured
- File extensions are `.ts` or `.tsx`
- Imports use correct paths

### Module resolution issues
Bun uses Node.js-compatible module resolution. If you have issues:
- Check `tsconfig.json` paths
- Use relative imports when possible
- Verify `package.json` exports

