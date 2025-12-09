#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Find all dynamic route files
const files = execSync(
  'find app/api -type f -name "route.ts" | grep "\\[id\\]"',
  {
    encoding: "utf-8",
    cwd: "/Users/omotayoishola/dev/quickStudy",
  }
)
  .trim()
  .split("\n");

console.log(`Found ${files.length} dynamic route files to fix\n`);

let fixedCount = 0;
let errorCount = 0;

files.forEach((file) => {
  const filePath = path.join("/Users/omotayoishola/dev/quickStudy", file);

  try {
    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;

    // Pattern 1: { params }: RouteParams -> context: RouteParams  PLUS  params.id -> const { id } = await context.params;
    const pattern1 =
      /export async function (GET|PUT|DELETE|PATCH|POST)\([^,]+,\s*\{\s*params\s*\}:\s*RouteParams\)\s*\{/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, (match, method) => {
        return `export async function ${method}(request: NextRequest, context: RouteParams) {`;
      });

      // Replace params.id with await pattern
      content = content.replace(
        /const\s+(\w+)\s*=\s*(?:parseInt|Number)\(params\.id\)/g,
        "const { id } = await context.params;\n    const $1 = parseInt(id)"
      );

      // Also fix standalone params.id references
      content = content.replace(/\bparams\.id\b/g, "(await context.params).id");

      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    } else {
      console.log(`⏭️  Skipped (no changes needed): ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Fixed: ${fixedCount}`);
console.log(`   Skipped: ${files.length - fixedCount - errorCount}`);
console.log(`   Errors: ${errorCount}`);
