# Course Import/Export Test Scripts

This directory contains test scripts for the course import/export functionality.

## Test Scripts

### 1. TypeScript Test Script (`test-course-import-export.ts`)

Comprehensive test suite that validates:
- Markdown parsing
- Course validation
- Question parsing (test and practice questions)
- Assignment format handling
- Invalid markdown handling
- Module/lesson ordering
- Export format generation

**Usage:**

```bash
# Using tsx (recommended)
npx tsx scripts/test-course-import-export.ts

# Using ts-node
npx ts-node scripts/test-course-import-export.ts

# Using the shell script
./scripts/test-course-import-export.sh
```

**Prerequisites:**
- Node.js installed
- TypeScript dependencies installed (`npm install` or `pnpm install`)
- Sample course markdown file at `docs/examples/sample-course.md`

### 2. Shell Script (`test-course-import-export.sh`)

Convenience wrapper that automatically detects and uses `tsx` or `ts-node`.

**Usage:**

```bash
chmod +x scripts/test-course-import-export.sh
./scripts/test-course-import-export.sh
```

### 3. HTTP API Tests (`test-course-api.http`)

REST Client format tests for API endpoints. Use with:
- VS Code REST Client extension
- IntelliJ HTTP Client
- Any HTTP client that supports `.http` files

**Usage:**

1. Install REST Client extension in VS Code
2. Open `scripts/test-course-api.http`
3. Update `@baseUrl` and `@authToken` variables
4. Click "Send Request" above each request

**Tests included:**
- Import course from file
- Import course from markdown text
- Export course (various options)

## Test Coverage

The test suite covers:

1. **Parsing Tests**
   - ✅ Parse complete course markdown
   - ✅ Extract course metadata
   - ✅ Parse modules and lessons
   - ✅ Parse tests and assignments
   - ✅ Parse practice questions
   - ✅ Handle invalid markdown

2. **Validation Tests**
   - ✅ Validate required fields
   - ✅ Validate module/lesson ordering
   - ✅ Validate question structure
   - ✅ Check for duplicate orders

3. **Format Tests**
   - ✅ Test question format parsing
   - ✅ Practice question format
   - ✅ Assignment format (vs quiz)
   - ✅ Export format generation

## Expected Output

When all tests pass, you should see:

```
============================================================
Course Import/Export Test Suite
============================================================

============================================================
Test 1: Parse Markdown File
============================================================
ℹ Reading markdown from: /path/to/sample-course.md
ℹ Markdown length: 12345 characters
✓ Markdown parsed successfully
ℹ Course: CS101 - Introduction to Computer Science
ℹ Modules: 2
ℹ Total Lessons: 3
ℹ Total Tests: 3
ℹ Total Practice Questions: 5

...

============================================================
Test Summary
============================================================
✓ Parse Markdown
✓ Validate Course
✓ Question Parsing
✓ Practice Question Parsing
✓ Assignment Format
✓ Invalid Markdown Handling
✓ Module/Lesson Ordering
✓ Export Format

------------------------------------------------------------
Total: 8 tests
Passed: 8
Failed: 0
------------------------------------------------------------

All tests passed! ✓
```

## Troubleshooting

### Error: Cannot find module
- Make sure you're running from the project root
- Run `npm install` or `pnpm install` to install dependencies

### Error: File not found
- Ensure `docs/examples/sample-course.md` exists
- Check file paths are correct

### TypeScript errors
- Ensure TypeScript is properly configured
- Check `tsconfig.json` is valid
- Try running with `tsx` instead of `ts-node`

### API test failures
- Ensure the development server is running (`npm run dev`)
- Check authentication token is valid
- Verify database connection
- Check API endpoint URLs match your setup

## Adding New Tests

To add new tests:

1. Add a new test function in `test-course-import-export.ts`
2. Follow the pattern:
   ```typescript
   async function testNewFeature() {
     logSection("Test N: New Feature");
     try {
       // Test logic
       logSuccess("Test passed");
       return { success: true };
     } catch (error) {
       logError(`Test failed: ${error.message}`);
       return { success: false };
     }
   }
   ```
3. Call the test in `runTests()` function
4. Add result to results array

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Test Course Import/Export
  run: |
    npm install
    npx tsx scripts/test-course-import-export.ts
```

