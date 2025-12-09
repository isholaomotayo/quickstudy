# Course Approval Management Feature

## Overview
The Course Approval Management feature provides a comprehensive interface for managing student course registrations and approvals. This feature integrates with the new role-based access control system to ensure appropriate permissions and workflows.

## Access Control

### Who Can Access
- ✅ **SUPERADMIN** - Full access
- ✅ **SYSADMIN** - Full access  
- ✅ **ADMIN** - Institution-wide access
- ✅ **PROGRAMME_COORDINATOR** - Programme-specific access
- ✅ **HOD** - Department-specific access
- ✅ **FACILITATOR** - Course-specific access
- ✅ **ETUTOR** - Course-specific access
- ❌ **PROGRAMME_EXAM_OFFICER** - Restricted (results only, no approvals)
- ❌ **STAFF/LECTURER/STUDENT** - No access

### Permission Logic
```typescript
// Course Approval tab visibility
{hasCourseApprovalAccess() && (
  <CourseApprovalTab />
)}

// Inside component - Programme Exam Officer restriction
if (isProgrammeExamOfficer()) {
  return <AccessDeniedMessage />;
}
```

## User Workflow

### 1. Student Course Registration Process
```
Student applies for course registration
           ↓
SYSADMIN/PROGRAMME_COORDINATOR registers student
           ↓ 
Status: "PENDING" (awaiting approval)
           ↓
FACILITATOR/ETUTOR/PROGRAMME_COORDINATOR/HOD/ADMIN approves
           ↓
Status: "APPROVED" → Student gains course access
```

### 2. Approval Workflow
1. **Registration**: Authorized personnel register students for courses
2. **Pending State**: Registration awaits approval
3. **Review**: Qualified staff review registration details
4. **Decision**: Approve (with access granted) or Reject (with reason)
5. **Notification**: Student and administrators are notified

### 3. Rejection Workflow
1. **Select Registration**: Choose pending registration to reject
2. **Provide Reason**: Mandatory reason for rejection (e.g., "Prerequisites not met")
3. **Confirm Rejection**: Final confirmation
4. **Notification**: Student receives rejection notice with reason

## Features

### Dashboard Statistics
- **Total Registrations**: Overall count of all registrations
- **Awaiting Approval**: Registrations pending approval action  
- **Pending**: Newly submitted registrations
- **Approved**: Successfully approved registrations
- **Rejected**: Rejected registrations with reasons

### Filtering & Search
- **Search**: Student name, course name, or programme
- **Programme Filter**: Filter by specific programmes
- **Priority Filter**: High/Medium/Low priority registrations
- **Status Filter**: Filter by registration status

### Tabbed Views
- **Pending**: Focus on registrations needing approval
- **Approved**: View approved registrations
- **Rejected**: Review rejected registrations with reasons
- **All**: Complete overview of all registrations

### Actions Available
- **View Details**: Complete registration information
- **Approve**: Grant course access to student
- **Reject**: Deny registration with mandatory reason
- **Bulk Actions**: (Future enhancement)

## Data Scoping

### Role-Based Data Access
```typescript
// SUPERADMIN/SYSADMIN - Global access
SELECT * FROM course_registration

// ADMIN - Institution scope  
SELECT * FROM course_registration 
WHERE institution_id = user.institution_id

// PROGRAMME_COORDINATOR - Programme scope
SELECT * FROM course_registration cr
JOIN student s ON cr.student_id = s.id
WHERE s.programme_id = user.programme_id

// FACILITATOR/ETUTOR - Assigned courses only
SELECT * FROM course_registration cr
JOIN staff_course sc ON cr.course_id = sc.course_id
WHERE sc.staff_id = user.staff.id
```

## Technical Implementation

### File Structure
```
app/(simple)/ops/components/
├── CourseApprovalManagement.tsx    # Main component
└── ...

app/api/course-registration/
└── route.ts                        # API endpoints (sample)

lib/
├── roles.ts                        # Role definitions
├── roleDecorators.ts              # Access decorators  
└── ...

hooks/
├── useRoles.ts                     # Role checking hooks
└── ...
```

### Key Components

#### 1. CourseApprovalManagement Component
- **Location**: `/app/(simple)/ops/components/CourseApprovalManagement.tsx`
- **Purpose**: Main interface for course approval management
- **Features**: 
  - Role-based access control
  - Statistics dashboard
  - Filtering and search
  - Approval/rejection workflows
  - Tabbed organization

#### 2. Role Integration
- **Permission Check**: Uses `hasCourseApprovalAccess()` from `useRoles`
- **Access Restriction**: Blocks Programme Exam Officers
- **Scoped Data**: Filters data based on user role and scope

#### 3. API Integration  
- **Sample Endpoint**: `/app/api/course-registration/route.ts`
- **Demonstrates**: Role-based API protection
- **Features**: Registration, approval, rejection workflows

### Data Models

#### CourseRegistration Interface
```typescript
interface CourseRegistration {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  programme: string;
  department: string;
  semester: string;
  status: 'PENDING' | 'REGISTERED' | 'APPROVED' | 'REJECTED';
  registeredBy: string;
  registeredAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}
```

#### Statistics Interface
```typescript
interface CourseApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  awaitingApproval: number;
}
```

## UI/UX Design

### Color Coding
- **Pending**: Yellow badges and indicators
- **Approved**: Green badges and success states
- **Rejected**: Red badges and error states
- **High Priority**: Red priority badges
- **Medium Priority**: Default priority badges  
- **Low Priority**: Gray priority badges

### Interactive Elements
- **Tabs**: Quick filtering by status
- **Dropdown Actions**: Context-sensitive actions per registration
- **Modal Dialogs**: Confirmation dialogs for approvals/rejections
- **Search**: Real-time filtering
- **Refresh**: Manual data refresh capability

### Responsive Design
- **Mobile**: Stacked layout with touch-friendly actions
- **Tablet**: Condensed table view
- **Desktop**: Full-featured table with all columns

## Integration Points

### 1. Ops Dashboard Integration
```typescript
// In ops/page.tsx
{hasCourseApprovalAccess() && (
  <TabsTrigger value="course-approvals">
    Course Approvals  
  </TabsTrigger>
)}

{hasCourseApprovalAccess() && (
  <TabsContent value="course-approvals">
    <CourseApprovalManagement />
  </TabsContent>  
)}
```

### 2. Role System Integration
```typescript
// Permission checks throughout component
const { 
  hasCourseApprovalAccess,
  canApproveCourses, 
  isProgrammeExamOfficer 
} = useRoles();
```

### 3. Future API Integration
- **GET /api/course-registration**: Fetch registrations
- **POST /api/course-registration**: Register students
- **PATCH /api/course-registration/:id**: Approve/reject
- **GET /api/course-registration/stats**: Statistics

## Testing Strategy

### Unit Tests
```typescript
describe('CourseApprovalManagement', () => {
  test('blocks programme exam officers', () => {
    mockUserRole('PROGRAMME_EXAM_OFFICER');
    render(<CourseApprovalManagement />);
    expect(screen.getByText('Limited Access')).toBeInTheDocument();
  });

  test('allows facilitators to approve', () => {
    mockUserRole('FACILITATOR');
    render(<CourseApprovalManagement />);
    expect(screen.getByText('Approve')).toBeInTheDocument();
  });

  test('shows rejection dialog', () => {
    mockUserRole('ADMIN');
    render(<CourseApprovalManagement />);
    fireEvent.click(screen.getByText('Reject'));
    expect(screen.getByText('Rejection Reason')).toBeInTheDocument();
  });
});
```

### Integration Tests  
```typescript
describe('Course Approval API', () => {
  test('programme coordinator can approve registrations', async () => {
    const response = await request(app)
      .post('/api/course-registration')
      .set('Cookie', 'role=PROGRAMME_COORDINATOR')
      .send({ action: 'approve', registrationId: '123' });
    
    expect(response.status).toBe(200);
  });

  test('programme exam officer cannot approve', async () => {
    const response = await request(app)
      .post('/api/course-registration') 
      .set('Cookie', 'role=PROGRAMME_EXAM_OFFICER')
      .send({ action: 'approve', registrationId: '123' });
      
    expect(response.status).toBe(403);
  });
});
```

## Future Enhancements

### Phase 2 Features
1. **Bulk Actions**: Approve/reject multiple registrations
2. **Email Notifications**: Automated notifications to students
3. **Approval Workflows**: Multi-step approval processes
4. **Analytics**: Detailed approval metrics and reporting
5. **Prerequisites Checking**: Automated prerequisite validation
6. **Waitlist Management**: Handle course capacity limits

### Phase 3 Features  
1. **Mobile App**: Native mobile interface
2. **Real-time Updates**: Live status updates
3. **Integration**: LMS and student portal integration
4. **AI Assistance**: Smart approval recommendations
5. **Audit Trail**: Detailed change history
6. **Custom Rules**: Institution-specific approval rules

## Deployment Notes

### Prerequisites
- New roles system must be deployed
- Role-based access control components available
- User context properly configured

### Migration Steps
1. Deploy role system updates
2. Update ops dashboard with new tab
3. Deploy Course Approval component
4. Test role-based access control
5. Train users on new workflow

### Configuration
- No additional configuration required
- Uses existing user role system
- Inherits institution/programme scoping from user data

## Support & Maintenance

### Common Issues
1. **Access Denied**: Check user role assignment
2. **Empty Data**: Verify API connectivity and permissions
3. **Approval Not Working**: Confirm user has approval permissions

### Monitoring
- Track approval completion rates
- Monitor rejection reasons for trends
- Watch for permission errors in logs

### Performance
- Component uses efficient React patterns
- Mock data for development/testing
- Designed for real-time updates when API is connected

---

This Course Approval Management feature provides a solid foundation for managing student course registrations while leveraging the new role-based access control system for appropriate permissions and data scoping.