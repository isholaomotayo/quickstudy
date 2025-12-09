# Feature Development Prompt

## Variables to Configure

```
FEATURE_NAME: forum and discussion board
FEATURE_DESCRIPTION: forum and discussion board for students to discuss and ask questions. there will be three type sof forum and discussion boards institution wide forum,course forum and time based course forum which would have a start and end date and time.forums will have comments and replies. we want this interface to be as familiar as possible so think to build this out like a social media paltform. For course forum and discussions we want to have it in course module viewer and the course page. we want to have a forum page for the institution wide forum and a forum page for each course. the forum page for each course would have the forum and time bound discussions in thesame view seperated by tabs . we need to build htis out so all forum and discussion type use thesame component and the scope (school, class {timed discussions or open ended }) determine what is loaded in the component.
LEGACY_PATH: /pages/forum, /pages/discussion-topic?course_id=36, /pages/course-forum?course_id=36
 ,NEW_PATH: /app/connect
API_ENDPOINTS: check admin route for api endpoints
UI_COMPONENTS: we want to build out all components and integrate with backend apis need for this feature. build out first version wiht UI only then we will add backend apis. which need to be redone to cater to new features and structure but understand the current structure and how to integrate with new features.
SPECIAL_REQUIREMENTS: check admin route for special requirements
```

---

We are building newer versions of our legacy pages from `/pages/student/` to `/app/` directory. Always use `pnpm` and start the app with `pnpm dev` to have access to terminal output. Ensure you apply Next.js best practices for errors, loading, prefetching, and server components while working on this. There are rich UI components available for reuse while building new pages.

## Current Task

**Feature**: {FEATURE_NAME}  
**Description**: {FEATURE_DESCRIPTION}  
**Legacy Path**: `/pages/student/{LEGACY_PATH}`  
**New Path**: `/app/{NEW_PATH}`  
**API Endpoints**: {API_ENDPOINTS}  
**UI Components**: {UI_COMPONENTS}  
**Special Requirements**: {SPECIAL_REQUIREMENTS}

## Technical Requirements

### Next.js Best Practices (Mandatory)

- **Error Handling**: Implement proper error boundaries and error.tsx files
- **Loading States**: Add loading.tsx files and Suspense boundaries
- **Prefetching**: Optimize navigation with proper prefetching strategies
- **Server Components**: Maximize use of server components for data fetching
- **Client Components**: Minimize client-side JavaScript, use 'use client' only when necessary
- **Streaming**: Implement progressive loading where applicable

### Development Approach

1. **Analyze Legacy Implementation**: Review existing functionality and user flows
2. **API Integration**: Use the same backend APIs (FastAPI-based, well-documented)
3. **UI Development**: Reuse existing rich UI components and maintain color schemes
4. **Feature Parity**: Ensure current functionality is maintained
5. **Enhancement**: Make suggestions for improving the feature when complete

### Code Quality Standards

- Full TypeScript with proper interfaces/types
- Graceful error handling with user-friendly messages
- Performance optimization (bundle size and runtime)
- WCAG 2.1 AA accessibility compliance
- Proper SEO metadata and structured data

### Project Structure

```
/app/{NEW_PATH}/
├── page.tsx          (main page component)
├── loading.tsx       (loading UI)
├── error.tsx         (error UI)
├── layout.tsx        (if needed)
└── components/       (feature-specific components)
```

## Deliverables

1. **Functional Implementation** with feature parity
2. **Enhanced UX/UI** with creative improvements
3. **Performance Optimizations**
4. **Enhancement Suggestions** for future iterations
5. **Clean, maintainable code** structure

Create a new rich UI, be creative, use existing color schemes, ensure current functionality is maintained, and make suggestions for enhancing the feature when done.
