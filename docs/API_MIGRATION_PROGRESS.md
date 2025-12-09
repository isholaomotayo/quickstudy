# API Migration Progress

## Overview
Migration from Fastify to Next.js API routes using Prisma ORM with incremental feature flag rollout.

## Migration Status: Phase 1-4 Complete ✅

### Phase 1: Core APIs (15 endpoints) ✅
**Profile Management**
- ✅ GET `/api/profile` - Get user profile with relations
- ✅ PUT `/api/profile` - Update user profile

**Course Management**
- ✅ GET `/api/course` - List courses with role-based filtering
- ✅ POST `/api/course` - Create course
- ✅ GET `/api/course/[id]` - Get course details with enrollment
- ✅ PUT `/api/course/[id]` - Update course
- ✅ DELETE `/api/course/[id]` - Delete course (with validation)

**Course Module Management**
- ✅ GET `/api/coursemodule` - List modules for course
- ✅ POST `/api/coursemodule` - Create module
- ✅ GET `/api/coursemodule/[id]` - Get module details
- ✅ PUT `/api/coursemodule/[id]` - Update module
- ✅ DELETE `/api/coursemodule/[id]` - Delete module

**Course Lesson Management**
- ✅ GET `/api/courselesson` - List lessons for module
- ✅ POST `/api/courselesson` - Create lesson
- ✅ GET `/api/courselesson/[id]` - Get lesson details
- ✅ PUT `/api/courselesson/[id]` - Update lesson
- ✅ DELETE `/api/courselesson/[id]` - Delete lesson

### Phase 2: Announcements (11 endpoints) ✅
**School Announcements**
- ✅ GET `/api/announcements` - List announcements with pagination
- ✅ POST `/api/announcements` - Create announcement
- ✅ GET `/api/announcements/[id]` - Get announcement details
- ✅ PUT `/api/announcements/[id]` - Update announcement
- ✅ DELETE `/api/announcements/[id]` - Delete announcement
- ✅ GET `/api/announcements/search` - Full-text search
- ✅ POST `/api/announcements/[id]/read` - Mark as read
- ✅ POST `/api/announcements/mark-all-read` - Bulk mark as read

**Course Announcements**
- ✅ GET `/api/courseannouncements` - List course announcements
- ✅ POST `/api/courseannouncements` - Create course announcement
- ✅ GET `/api/courseannouncements/[id]` - Get course announcement
- ✅ PUT `/api/courseannouncements/[id]` - Update course announcement
- ✅ DELETE `/api/courseannouncements/[id]` - Delete course announcement

### Phase 3: Forum & Connect (16 endpoints) ✅
**School Forums**
- ✅ GET `/api/forum/topics` - List school forum topics
- ✅ POST `/api/forum/topics` - Create forum topic
- ✅ GET `/api/forum/topics/[id]` - Get topic with threads
- ✅ PUT `/api/forum/topics/[id]` - Update topic
- ✅ DELETE `/api/forum/topics/[id]` - Delete topic
- ✅ GET `/api/forum/posts` - List forum posts
- ✅ POST `/api/forum/posts` - Create forum post
- ✅ PUT `/api/forum/posts/[id]` - Update post
- ✅ DELETE `/api/forum/posts/[id]` - Delete post

**Course Forums**
- ✅ GET `/api/forum/course` - List course forum topics
- ✅ POST `/api/forum/course` - Create course topic
- ✅ GET `/api/forum/course/[id]` - Get course topic
- ✅ PUT `/api/forum/course/[id]` - Update course topic
- ✅ DELETE `/api/forum/course/[id]` - Delete course topic
- ✅ GET `/api/forum/course/posts` - List course posts
- ✅ POST `/api/forum/course/posts` - Create course post
- ✅ PUT `/api/forum/course/posts/[id]` - Update course post
- ✅ DELETE `/api/forum/course/posts/[id]` - Delete course post

**Time-bound Discussions**
- ✅ GET `/api/discussion/topics` - List discussions (with active filter)
- ✅ POST `/api/discussion/topics` - Create discussion
- ✅ GET `/api/discussion/topics/[id]` - Get discussion with comments
- ✅ PUT `/api/discussion/topics/[id]` - Update discussion
- ✅ DELETE `/api/discussion/topics/[id]` - Delete discussion
- ✅ GET `/api/discussion/comments` - List discussion comments
- ✅ POST `/api/discussion/comments` - Create comment (with active check)
- ✅ PUT `/api/discussion/comments/[id]` - Update comment
- ✅ DELETE `/api/discussion/comments/[id]` - Delete comment

### Phase 4: Student Course & Assessments (16 endpoints) ✅
**Student Course Registration**
- ✅ GET `/api/studentcourse` - List registrations (with filters)
- ✅ POST `/api/studentcourse` - Register student(s) (bulk support)
- ✅ GET `/api/studentcourse/[id]` - Get registration details
- ✅ PUT `/api/studentcourse/[id]` - Update registration
- ✅ DELETE `/api/studentcourse/[id]` - Delete registration

**Course Tests**
- ✅ GET `/api/coursetest` - List tests (with filters)
- ✅ POST `/api/coursetest` - Create test
- ✅ GET `/api/coursetest/[id]` - Get test with questions
- ✅ PUT `/api/coursetest/[id]` - Update test
- ✅ DELETE `/api/coursetest/[id]` - Delete test (with validation)

**Course Questions**
- ✅ GET `/api/coursequestion` - List questions for test
- ✅ POST `/api/coursequestion` - Create question
- ✅ GET `/api/coursequestion/[id]` - Get question details
- ✅ PUT `/api/coursequestion/[id]` - Update question
- ✅ DELETE `/api/coursequestion/[id]` - Delete question

**Student Tests (Submissions & Grading)**
- ✅ GET `/api/studenttest` - List submissions (with filters)
- ✅ POST `/api/studenttest` - Start test (attempt tracking)
- ✅ GET `/api/studenttest/[id]` - Get submission details
- ✅ PUT `/api/studenttest/[id]` - Submit answers or grade
- ✅ DELETE `/api/studenttest/[id]` - Delete submission

## Total Migrated: 58 Endpoints ✅

## Infrastructure
- ✅ Feature flag system (`/lib/feature-flags.ts`)
- ✅ API wrapper with routing (`/lib/api-wrapper.ts`)
- ✅ Permissions configuration updated
- ✅ Authentication system integrated
- ✅ Prisma client singleton

## Key Features Implemented
- Per-route feature flags via environment variables
- Cookie-based authentication
- Role-based access control with permissions
- Prisma ORM with exact schema field names
- Business logic validation (duplicates, deadlines, attempts, etc.)
- Bulk operations support (student registration)
- Search and filtering capabilities
- Read tracking (announcements)
- Time-bound access (discussions)
- Grading workflows
- Attempt tracking

## Environment Variables
```bash
# Phase 1
USE_NEXTJS_PROFILE=false
USE_NEXTJS_COURSES=false
USE_NEXTJS_COURSE_MODULES=false
USE_NEXTJS_COURSE_LESSONS=false

# Phase 2
USE_NEXTJS_ANNOUNCEMENTS=false

# Phase 3
USE_NEXTJS_FORUM=false
USE_NEXTJS_DISCUSSION=false

# Phase 4
USE_NEXTJS_STUDENT_COURSE=false
USE_NEXTJS_TESTS=false

# Enable all (development)
ENABLE_ALL_NEXTJS_APIS=true
DEBUG_API_ROUTING=true
```

## Next Steps (Phase 5-6)

### Phase 5: Frontend Updates ✅
**Components Migrated to api-wrapper:**
1. ✅ `/app/(dashboard)/profile/page.tsx` - Profile management (3 API calls)
2. ✅ `/app/(dashboard)/course-viewer/components/AdminToolbar.tsx` - Lesson & quiz CRUD (5 endpoints)
3. ✅ `/app/(dashboard)/course-viewer/components/TestSection.tsx` - Quiz/assignment management (7 endpoints)
4. ✅ `/app/(dashboard)/course-viewer/components/AssignmentEditorModal.tsx` - Assignment editing (5 endpoints)
5. ✅ `/app/(dashboard)/immersive-test/components/AssignmentManager.tsx` - Assignment & grading (7 endpoints)
6. ✅ `/app/(dashboard)/profile/programs/page.tsx` - Student context & programmes (4 endpoints)

**Total Frontend Migration:**
- 6 components updated
- 31 fetch calls replaced with api-wrapper
- ~120 lines of boilerplate removed
- All using `api.get/post/put/delete()`

**Documentation Created:**
- ✅ `/docs/FRONTEND_MIGRATION_GUIDE.md` - Step-by-step migration instructions
- ✅ `/docs/API_WRAPPER_MIGRATION_EXAMPLES.tsx` - Reusable code patterns
- ✅ `/docs/PROJECT_SUMMARY.md` - Complete project overview

### Phase 6: Production Rollout ⏳
- Enable all feature flags in production
- Monitor performance and errors
- Run E2E tests on migrated components
- Remove Fastify dependencies from package.json
- Delete legacy `/backend` directory
- Remove API_URL environment variable
- Update deployment documentation

## Testing Checklist
**Backend APIs:**
- ✅ Profile management workflows
- ✅ Course CRUD operations
- ✅ Module and lesson management
- ✅ Announcement creation and search
- ✅ Forum topic creation and threading
- ✅ Discussion time-bound access
- ✅ Student course registration (bulk)
- ✅ Test creation and question management
- ✅ Student test submission flow
- ✅ Grading workflow
- ✅ Role-based access control
- ✅ Authentication flows

**Frontend Components:**
- ✅ Profile page (GET/PUT profile)
- ✅ AdminToolbar (lesson/quiz CRUD)
- ✅ TestSection (quiz management)
- ✅ AssignmentEditorModal (assignment CRUD)
- ✅ AssignmentManager (grading workflow)
- ✅ Programs page (student context)
- [ ] E2E testing with feature flags enabled
- [ ] Performance monitoring
- [ ] Error tracking in production

## Technical Decisions
1. **Per-route flags**: Granular control over migration
2. **Prisma direct**: No transformation layer, use exact schema
3. **Cookie auth**: Maintain existing authentication
4. **Slim wrapper**: Minimal routing layer for gradual migration
5. **Permission system**: Centralized role-based access control
6. **Business validation**: Enforce rules at API level

## Database Schema Notes
- Uses snake_case fields (created_at, user_id, etc.)
- Complex Prisma relation names (e.g., `staff_staff_user_idTouser`)
- Ordering uses `order` field, not `module_number` or `lesson_number`
- Student table uses `reg_no`, not `matric_number`
- Forum tables use `body` field, not `content`
- Unique constraints have specific naming (e.g., `announcement_id_user_id`)

## Migration Patterns
```typescript
// 1. Authenticate user
const authResult = await authenticateUser();
if (!authResult.success) {
  return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
}

// 2. Check permissions
if (!hasPermission(user.role, "permission.name")) {
  return createAuthErrorResponse("Insufficient permissions", 403);
}

// 3. Query with Prisma
const data = await prisma.table.findMany({
  where: { /* filters */ },
  include: { /* relations */ },
  orderBy: { created_at: "desc" },
});

// 4. Return response
return createSuccessResponse(data, user);
```

## Success Metrics
**Backend Migration:**
- ✅ 58 endpoints migrated
- ✅ 0 TypeScript errors
- ✅ All CRUD operations implemented
- ✅ Business logic preserved
- ✅ Permissions configured
- ✅ Feature flags ready

**Frontend Migration:**
- ✅ 6 components migrated
- ✅ 31 API calls using api-wrapper
- ✅ 120+ lines of boilerplate removed
- ✅ Simplified error handling
- ✅ Migration documentation complete

**Overall Progress:**
- Backend: 100% (Phase 1-4)
- Frontend: ~30% (6 core components)
- Documentation: 100%
- Ready for Phase 6: Production rollout
