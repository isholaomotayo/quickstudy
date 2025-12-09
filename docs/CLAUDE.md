# Claude Code Instructions

## Database Operations

**CRITICAL RULE: Always get explicit user confirmation before performing ANY database operations that modify data.**

This includes but is not limited to:

- DELETE operations
- UPDATE operations that change existing data
- INSERT operations that add significant data
- ALTER TABLE operations
- DROP operations

### Safe Database Investigation Pattern

1. First, show the user what you found with SELECT queries
2. Explain the issue and potential solutions
3. Wait for explicit approval before making any changes
4. Provide the exact queries you plan to run
5. Only proceed after user confirmation

### Example Safe Approach:

```sql
-- Investigation query (safe to run)
SELECT COUNT(*) FROM table WHERE condition;

-- Show user the problematic data
SELECT * FROM table WHERE condition LIMIT 10;

-- Then ask: "I found X records that need to be fixed. Should I proceed with:"
-- [provide exact DELETE/UPDATE query]
-- Wait for confirmation before executing
```

## Database Configuration

The application uses Prisma with PostgreSQL. Schema is in `prisma/schema.prisma`.

### Prisma Commands:

- `npx prisma db push` - Apply schema changes directly
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma migrate dev` - Create and apply migrations (recommended for production)

### Deployment Setup:

The build process automatically generates Prisma client:

- `build` script runs `prisma generate && next build`
- `postinstall` script runs `prisma generate` (for deployment platforms like Vercel)

## Build and Deployment

- Run `pnpm build` to check for TypeScript and build errors (includes Prisma generation)
- Fix Prisma relation issues by adding missing foreign key relationships
- Clean up console.log statements (but keep console.error for debugging)
- Use `npx prisma db push` for schema changes (after data cleanup)
- dont run build till all feaures are confimed ready so as not to wate time
