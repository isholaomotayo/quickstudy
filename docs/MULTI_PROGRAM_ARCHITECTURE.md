# Multi-Program Student Architecture (Final Scope)

## Overview

This document outlines the architecture for allowing a single user to enroll in multiple academic programs simultaneously (e.g., Computer Science + Business Administration). Each program enrollment creates a separate student profile with completely isolated academic records while sharing the same user account.

## Key Requirements Confirmed

1. **Multiple Simultaneous Enrollments**: Users can be enrolled in completely different programs at the same time
2. **Simple Context Switching**: Users can switch between program contexts, but no unified dashboard - keep it simple
3. **Complete Data Isolation**: Courses, payments, results, and progress are completely separated per program
4. **Identical Application Flow**: Additional program applications use the same flow but with prefilled user data
5. **Admin View**: Admins see the same user across different programs (not a current priority)

## Feature Scope Definition

### In Scope ✅
- Allow users to apply for multiple programs simultaneously
- Create separate student profiles for each program enrollment
- Complete isolation of academic data (courses, payments, results, progress)
- Simple program switching mechanism in user profile
- Reuse existing `/applicant` workflow for additional applications
- Prefill application forms with existing user data
- Current program context indicator

### Out of Scope ❌
- Unified dashboard showing all programs together
- Cross-program course sharing or credit transfers
- Complex admin management interface for multi-program students
- Program comparison or recommendation features
- Bulk operations across multiple programs

## Current Architecture Analysis

### Current Application Flow
1. **User Registration**: User creates account with role "APPLICANT"
2. **Application Process**: User goes through `/applicant` steps:
   - **Step 1**: Select program (`programme_id`)  
   - **Step 2**: Personal details
   - **Step 3**: Academic history
3. **Student Record Creation**: Single `student` record created linked to `user_id`
4. **Admission**: Admin approves and user role changes to "STUDENT"

### Current Data Structure
- **One-to-One Relationship**: Each `user` currently has one `student` record via `user_id` foreign key
- **Program Binding**: Student record tied to single `programme_id`  
- **Cascading Dependencies**: All data (payments, courses, progress, results) tied to single `student_id`

### Key Tables Affected
1. **student** - Core student profile (one per program)
2. **course_progress** - Learning progress per course
3. **payment2** - Financial transactions  
4. **student_course** - Course registrations
5. **student_result** - Academic results
6. **student_gpa** - Grade point averages
7. **student_test** - Test submissions

## Revised Architecture (Simplified)

### 1. Multi-Student Records Per User

**Core Concept**: Allow multiple `student` records per `user`, each representing enrollment in a different program.

#### Schema Changes Required

```sql
-- NO new tables needed! The existing schema already supports this.
-- Simply remove the unique constraint on student.user_id (if it exists)

-- Add fields to student table for multi-program support
ALTER TABLE student ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE student ADD COLUMN application_type VARCHAR(50) DEFAULT 'NEW';

-- Add index for efficient queries  
CREATE INDEX idx_student_user_active ON student(user_id, is_active);
CREATE INDEX idx_student_user_programme ON student(user_id, programme_id);
```

### 2. Application Workflow (Enhanced)

#### Current User Journey Enhanced
1. **First Application**: Works exactly as current system
2. **Additional Program Application**: 
   - User navigates to profile → "Apply for Additional Program"
   - Reuses existing `/applicant` flow but with `application_type = 'ADDITIONAL'`
   - Creates new `student` record with same `user_id` but different `programme_id`
3. **Profile Switching**: User can switch between active student profiles

### 3. Context Management Strategy

#### Active Student Profile Tracking
```typescript
// User session context
interface StudentContext {
  userId: bigint;
  activeStudentId: bigint;  // Currently selected student profile
  allStudentProfiles: StudentProfile[];
  switchProfile: (studentId: bigint) => void;
}

// Get active student for user
const getActiveStudentId = (userId: bigint) => {
  // Check session/cookie for last active student
  // Default to first student if none set
  return getStudentProfiles(userId).find(s => s.is_active) || getStudentProfiles(userId)[0];
};
```

#### Application Operations Context
```typescript
// All operations use active student context
const getCurrentStudentData = (userId: bigint) => {
  const activeStudentId = getActiveStudentId(userId);
  return { studentId: activeStudentId, ...studentData };
};
```

### 4. User Experience Design (Simplified)

#### Profile Management Interface
```
Profile Settings
├── My Programs
│   ├── [Active] Computer Science (BSc) - Currently Viewing
│   │   └── Actions: View Transcript | Continue Studies
│   ├── Business Administration (MBA) - Enrolled
│   │   └── Actions: Switch to this Program | View Transcript  
│   └── [Button] Apply for Additional Program
└── Program Applications
    ├── [Pending] Data Science Application - Under Review
    └── [View All] Application History
```

#### Key UX Principles
- **No Unified Dashboard**: Each program operates independently
- **Simple Context Switching**: Clear "Switch Program" functionality
- **Current Program Indicator**: Always show which program is active
- **Complete Isolation**: Each program has separate academic records

#### Navigation Enhancement
```typescript
// Add program switcher to main navigation
<ProgramSwitcher 
  currentProgram="Computer Science (BSc)"
  programs={userPrograms}
  onSwitch={(programId) => switchActiveProgram(programId)}
/>
```

## Implementation Strategy (Simplified)

### Phase 1: Database & Core Logic (Week 1)

#### 1.1 Schema Updates  
- [ ] Add `is_active` and `application_type` fields to student table
- [ ] Create indexes for multi-student queries
- [ ] Remove unique constraint on `student.user_id` (if exists)

#### 1.2 Core Helper Functions
- [ ] Create `getActiveStudentId(userId)` helper
- [ ] Create `getUserStudentProfiles(userId)` helper  
- [ ] Create `setActiveStudentProfile(userId, studentId)` helper
- [ ] Update existing student query helpers to use active context

### Phase 2: Application Flow Enhancement (Week 2)

#### 2.1 Enhanced Application Process
- [ ] Modify `/applicant` flow to detect additional applications (application_type = 'ADDITIONAL')
- [ ] Add "Apply for Additional Program" entry point in profile
- [ ] Prefill application with existing user data (name, contact, etc.)
- [ ] Update student creation logic to handle multiple records per user

#### 2.2 Simple Profile Management
- [ ] Create "My Programs" section in profile settings
- [ ] Build simple program context switcher
- [ ] Add current program indicator to main navigation
- [ ] Create basic application history view

### Phase 3: Context Integration (Weeks 3-4)

#### 3.1 API Updates (Systematic)
- [ ] **Authentication**: Update session to include active student
- [ ] **Payments**: Update payment APIs for student context (`payment2` table)
- [ ] **Courses**: Update course progress and enrollment APIs  
- [ ] **Results**: Update academic results and GPA calculations
- [ ] **Tests**: Update test submission and grading
- [ ] **Forum**: Update discussion context

#### 3.2 Frontend Context
- [ ] Create React context for student profile management
- [ ] Update all hooks that fetch student data
- [ ] Add program switcher to main layout
- [ ] Update dashboard to show current program info

### Phase 4: Testing & Refinement (Week 5)

#### 4.1 Testing
- [ ] Test multi-program application flow
- [ ] Test profile switching functionality  
- [ ] Test data isolation between programs
- [ ] Test existing single-program users (backward compatibility)

#### 4.2 Data Migration
- [ ] Set `is_active = true` for all existing student records
- [ ] Set `application_type = 'NEW'` for existing records
- [ ] Verify no data integrity issues
- [ ] Create rollback scripts

## Technical Considerations

### 1. Database Design
- **No Schema Breaking Changes**: Uses existing table structure
- **Efficient Queries**: New indexes support fast multi-student lookups
- **Data Integrity**: Foreign key relationships remain intact

### 2. Context Management 
- **Session Storage**: Store active student ID in user session
- **Cookie Fallback**: Use secure cookies for persistence
- **Default Behavior**: First student record becomes default if none specified

### 3. API Backward Compatibility
- **Existing APIs**: Continue to work for single-program users
- **Helper Functions**: Centralized logic for student context resolution
- **Gradual Migration**: Update APIs incrementally

### 4. Security
- **Access Control**: Users can only access their own student profiles
- **Profile Validation**: Verify student belongs to user before switching
- **Data Isolation**: Complete separation between program records

## Critical Implementation Areas

### 1. Student Context Resolution
```typescript
// Core helper that all APIs must use
export const resolveStudentContext = (userId: bigint, requestedStudentId?: bigint) => {
  const userStudents = getUserStudentProfiles(userId);
  
  if (requestedStudentId) {
    // Verify requested student belongs to user
    const student = userStudents.find(s => s.id === requestedStudentId);
    if (!student) throw new Error('Student not found or access denied');
    return student;
  }
  
  // Return active student or first student
  return userStudents.find(s => s.is_active) || userStudents[0];
};
```

### 2. APIs Requiring Updates
All APIs that use `student_id` must be updated to use resolved context:

**High Priority:**
- Authentication/Session management  
- Payment processing (`payment2` table)
- Course enrollment and progress
- Academic results and transcripts

**Medium Priority:**  
- Forum and discussion participation
- Test submissions and results
- Academic calendar and scheduling

**Low Priority:**
- Profile and settings management
- Notifications and announcements

## Success Metrics

1. **Functional Success**
   - Users can apply for multiple programs
   - Profile switching works seamlessly
   - Data isolation is maintained

2. **Performance Success**  
   - No significant performance degradation
   - Fast profile switching (< 500ms)
   - Efficient query performance

3. **User Experience Success**
   - Intuitive profile management interface
   - Clear program context indicators
   - Smooth application workflow

## Conclusion

This architecture provides a scalable solution for multi-program student management while maintaining data integrity and user experience. The phased approach ensures manageable implementation with minimal risk to existing functionality.

The key innovation is leveraging the existing schema design to support multiple student records per user, combined with a robust profile session management system to maintain context throughout the application.