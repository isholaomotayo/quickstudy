# Development Configuration Guide

## API Authentication Bypass

For easier development, you can disable API authentication by setting the following environment variables:

### Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Development Environment
NODE_ENV=development

# ⚠️ WARNING: Only use in development environment
# This bypasses API authentication for easier development
DISABLE_API_AUTH=true
```

### How It Works

When `DISABLE_API_AUTH=true` and `NODE_ENV=development`:

1. **API Routes**: All API authentication checks are bypassed
2. **Mock User**: A development user with SUPERADMIN role is automatically used
3. **Institution Access**: All institution access checks are bypassed
4. **Role Checks**: All role-based permissions are bypassed

### Security Notes

- ⚠️ **NEVER** set `DISABLE_API_AUTH=true` in production
- ⚠️ **NEVER** commit `.env.local` to version control
- ⚠️ This bypass should only be used for local development

### Production Deployment

For production deployment, ensure:

```bash
NODE_ENV=production
DISABLE_API_AUTH=false
```

Or simply omit the `DISABLE_API_AUTH` variable entirely.

## Role-Based Access Control

### Available Roles

The system now supports the following roles:

- **SUPERADMIN**: Full system access across all institutions
- **ADMIN**: Institution-wide administrative access with user payment access
- **PROGRAMME_COORDINATOR**: Manages programme courses and assigns staff
- **HOD**: Department head with departmental oversight
- **PROGRAMME_EXAM_OFFICER**: Manages all results under their programme
- **FACILITATOR**: LMS and results access with course approval rights
- **ETUTOR**: LMS and results access with course approval rights
- **STAFF**: General staff member
- **LECTURER**: Teaching staff with course access
- **STUDENT**: Enrolled student with course access
- **APPLICANT**: Prospective student
- **AFFILIATE**: External user with limited access

### Permission Groups

- **FINANCE_OVERVIEW**: Only SUPERADMIN can access finance analytics
- **USER_PAYMENTS**: SUPERADMIN and ADMIN can view user payments
- **LMS_ACCESS**: SUPERADMIN, ADMIN, PROGRAMME_COORDINATOR, HOD, FACILITATOR, ETUTOR
- **RESULTS_ACCESS**: LMS_ACCESS + PROGRAMME_EXAM_OFFICER
- **COURSE_APPROVAL**: LMS_ACCESS (excludes PROGRAMME_EXAM_OFFICER)
- **USER_MANAGEMENT**: SUPERADMIN, ADMIN

### API Protection

All `/api/dashboard/*` routes are now protected with:

1. **Authentication**: User must be logged in
2. **Role-based permissions**: User must have appropriate role
3. **Institution scoping**: Users can only access their institution's data
4. **Development bypass**: Can be disabled for development

### Testing API Routes

#### With Authentication (Production-like)

```bash
curl -H "Cookie: userData=...; role=ADMIN" \
  http://localhost:3000/api/dashboard/payments?institutionId=1
```

#### With Development Bypass

```bash
# Set DISABLE_API_AUTH=true in .env.local
curl http://localhost:3000/api/dashboard/payments?institutionId=1
```

## Frontend Role Guards

### Using Hooks

```typescript
import { useRoles } from "@/hooks/useRoles";

function MyComponent() {
  const { hasFinanceOverviewAccess, hasUserPaymentsAccess } = useRoles();

  return (
    <div>
      {hasFinanceOverviewAccess() && <FinanceAnalytics />}
      {hasUserPaymentsAccess() && <UserPayments />}
    </div>
  );
}
```

### Using Guard Components

```typescript
import { LMSAccessOnly, ResultsAccessOnly } from "@/components/RoleGuards";

function Dashboard() {
  return (
    <div>
      <LMSAccessOnly>
        <LMSManagement />
      </LMSAccessOnly>

      <ResultsAccessOnly>
        <ResultsManagement />
      </ResultsAccessOnly>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check user role and permissions
2. **401 Unauthorized**: Check authentication cookies
3. **Institution Access Denied**: Verify user's institution_id

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG_MODE=true
```

This will log detailed information about:

- Authentication attempts
- Role checks
- Permission validations
- Institution access checks

### Development Tips

1. Use browser dev tools to inspect cookies
2. Check network tab for API responses
3. Verify role assignments in database
4. Test with different user roles
5. Use development bypass for quick testing
