# Phase 6: Production Rollout Guide

## Overview

This guide covers the final phase of the API migration: enabling feature flags in production and monitoring the rollout.

## Prerequisites

- ✅ All 58 backend endpoints tested
- ✅ Frontend components migrated and tested
- ✅ Database migrations applied
- ✅ Monitoring/logging configured

## Rollout Strategy

### Step 1: Enable Development Testing

```bash
# In .env.local or .env.development
ENABLE_ALL_NEXTJS_APIS=true
DEBUG_API_ROUTING=true
```

Test all migrated components:

- Profile management
- Course/module/lesson CRUD
- Announcement creation
- Forum & discussion workflows
- Assessment & grading workflows

### Step 2: Gradual Production Rollout

**Week 1: Phase 1 (Core APIs)**

```bash
# Enable in production
USE_NEXTJS_PROFILE=true
USE_NEXTJS_COURSES=true
USE_NEXTJS_COURSE_MODULES=true
USE_NEXTJS_COURSE_LESSONS=true
```

Monitor:

- Response times (should be similar or faster)
- Error rates (should remain low)
- Database connection pool usage
- User-reported issues

**Week 2: Phase 2 (Announcements)**

```bash
USE_NEXTJS_ANNOUNCEMENTS=true
```

Monitor announcement workflows:

- Creation/updates
- Search functionality
- Read tracking
- Permission checks

**Week 3: Phase 3 (Forums)**

```bash
USE_NEXTJS_FORUM=true
USE_NEXTJS_DISCUSSION=true
```

Monitor forum activity:

- Topic creation
- Post threading
- Time-bound discussions
- Access controls

**Week 4: Phase 4 (Assessments)**

```bash
USE_NEXTJS_STUDENT_COURSE=true
USE_NEXTJS_ASSESSMENTS=true
USE_NEXTJS_TESTS=true
```

Monitor assessment workflows:

- Student registration (including bulk)
- Test creation
- Submission process
- Grading workflow

### Step 3: Full Rollout

After 4 weeks of successful monitoring:

```bash
# Enable all features
ENABLE_ALL_NEXTJS_APIS=true
```

Or set all individual flags to `true`.

### Step 4: Fastify Removal

**After 2 weeks of full rollout with no issues:**

1. **Remove Fastify from package.json:**

```bash
npm uninstall fastify @fastify/cors @fastify/cookie
```

2. **Delete backend directory:**

```bash
# Backup first!
mv backend backend.backup
# After verification period:
rm -rf backend.backup
```

3. **Remove API_URL environment variable:**

```bash
# Delete from .env.production
# Remove from deployment configs
```

4. **Update build scripts:**

```json
// package.json - remove Fastify-related scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

5. **Clean up feature flags:**

```typescript
// After full migration, simplify lib/api-wrapper.ts
// Remove routing logic, just use Next.js directly
```

## Monitoring Checklist

### Performance Metrics

- [ ] API response times (p50, p95, p99)
- [ ] Database query performance
- [ ] Error rates by endpoint
- [ ] CPU/memory usage
- [ ] Request throughput

### Functional Testing

- [ ] User authentication flows
- [ ] Course enrollment
- [ ] Assignment submission
- [ ] Grading workflow
- [ ] Forum interactions
- [ ] Announcement notifications
- [ ] Profile updates

### Database Health

- [ ] Connection pool utilization
- [ ] Query execution times
- [ ] Lock contention
- [ ] Transaction rollback rates

## Rollback Plan

If critical issues arise during rollout:

1. **Disable specific phase:**

```bash
# Rollback Phase 4
USE_NEXTJS_STUDENT_COURSE=false
USE_NEXTJS_ASSESSMENTS=false
USE_NEXTJS_TESTS=false
```

2. **Full rollback:**

```bash
ENABLE_ALL_NEXTJS_APIS=false
# Set all individual flags to false
```

3. **Investigate issues:**

- Check logs in Next.js API routes
- Review Prisma query logs
- Check authentication flows
- Verify permission checks

4. **Fix and re-enable:**

- Deploy fixes
- Test in development
- Re-enable flags gradually

## Success Criteria

**Before declaring Phase 6 complete:**

- [ ] All feature flags enabled for 2+ weeks
- [ ] Error rates < 0.1%
- [ ] Response times within SLA
- [ ] Zero critical user-reported bugs
- [ ] Database performance stable
- [ ] Fastify dependencies removed
- [ ] Legacy code deleted
- [ ] Documentation updated

## Post-Migration Optimization

Once migration is complete:

1. **Remove feature flag code:**

```typescript
// Simplify api-wrapper.ts to direct Next.js calls
// Remove routing logic
// Keep authentication wrapper
```

2. **Optimize Prisma queries:**

- Review N+1 query patterns
- Add database indexes where needed
- Implement query result caching

3. **Update documentation:**

- Remove Fastify references
- Update API documentation
- Update deployment guides

## Support Resources

**Logs locations:**

- Next.js API logs: Check deployment platform (Vercel/custom)
- Prisma query logs: Set `log: ['query', 'error']` in Prisma client
- Application logs: Check your logging service

**Common issues:**

- Authentication failures: Check cookie configuration
- Permission errors: Verify permissions-config.ts
- Prisma errors: Verify schema field names
- Timeout issues: Check database connection pool

**Contact:**

- Development team for code issues
- DevOps for infrastructure
- Database admin for query optimization

## Timeline Summary

- Week 0: Enable development testing
- Week 1: Phase 1 rollout
- Week 2: Phase 2 rollout
- Week 3: Phase 3 rollout
- Week 4: Phase 4 rollout
- Week 5-6: Full production monitoring
- Week 7: Fastify removal
- Week 8: Cleanup and optimization

**Total estimated time: 8 weeks for safe rollout**
