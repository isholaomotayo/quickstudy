# Backend Role-Based Access Control System

This document describes the backend role-based access control system used in the iLearn application's API endpoints.

## Overview

The backend uses a centralized `checkAccess` function in `backend/helpers/utils.js` to protect API endpoints. This system works alongside the frontend role protection to provide comprehensive security.

## Core Backend Protection: `checkAccess` Function

### Function Signature

```javascript
exports.checkAccess = (
  req, // Fastify request object
  reply, // Fastify reply object
  allowedRoles = [], // Array of allowed roles
  bounceTo = "/error", // Redirect URL (not used in API context)
  fKey = "", // Filter key for data scoping
  fValue = "" // Filter value for data scoping
) => {
  // Returns: { validatedUser, filterKey, filterValue }
};
```

### How It Works

1. **Extracts user data** from JWT token stored in cookies
2. **Validates user role** against the allowed roles list
3. **Applies data filtering** based on user role and institution
4. **Returns 401 Unauthorized** if access is denied
5. **Clears authentication cookies** on unauthorized access

### Return Values

- **`validatedUser`**: The authenticated user object (or `undefined` if unauthorized)
- **`filterKey`**: Key for filtering data (e.g., `institution_id`)
- **`filterValue`**: Value for filtering data (e.g., user's institution ID)

## Usage Patterns

### 1. Basic Role Protection

```javascript
const checkAccess = require("../helpers/utils").checkAccess;

exports.getUsers = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  // If checkAccess fails, it returns 401 and execution stops here
  // validatedUser contains the authenticated user data

  try {
    // Your API logic here
    const users = await User.fetchAll();
    return users;
  } catch (err) {
    throw boom.boomify(err);
  }
};
```

### 2. Role-Based Data Filtering

```javascript
exports.getStaff = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  let query = Staff.forge();

  // Apply role-based filtering
  if (validatedUser.role === "HOD") {
    query.where("department_id", +validatedUser.staff.department_id);
  } else if (validatedUser.role === "ADMIN") {
    query.where("institution_id", +validatedUser.institution_id);
  } else if (validatedUser.role === "SUPERADMIN") {
    // No filtering - can see all staff
  } else {
    // Regular staff can only see themselves
    query.where("id", +validatedUser.staff.id);
  }

  const staff = await query.fetchAll();
  return staff;
};
```

### 3. Student/Applicant Data Protection

```javascript
exports.getProfile = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
  ];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  const userId = req.params.id || validatedUser.id;

  // Ensure users can only access their own profile unless they have admin privileges
  const isHigherAccess =
    ["ADMIN", "SUPERADMIN", "HOD"].indexOf(validatedUser.role) > -1;
  if (userId != validatedUser.id && !isHigherAccess) {
    throw boom.forbidden("Access denied");
  }

  // Continue with profile logic...
};
```

## Role Hierarchy in Backend

The backend follows the same role hierarchy as the frontend:

```
SUPERADMIN (7) > ADMIN (6) > HOD (5) > STAFF/LECTURER (4) > STUDENT (3) > APPLICANT (2) > AFFILIATE (1)
```

### Special Backend Rules

1. **Students and Applicants**: Can only access their own data unless explicitly allowed
2. **Staff**: Limited to their institution's data
3. **HOD**: Limited to their department's data
4. **Admin**: Limited to their institution's data
5. **SuperAdmin**: Can access all data across institutions

## Common Backend Protection Patterns

### 1. Admin-Only Endpoints

```javascript
exports.addUser = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  // Only admins can create users
  req.body.institution_id = validatedUser.institution_id;
  const newUser = await User.forge(req.body).save();
  return newUser;
};
```

### 2. Staff-Only Endpoints

```javascript
exports.addCourse = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  // Staff can create courses for their institution
  req.body.institution_id = validatedUser.institution_id;
  const newCourse = await Course.forge(req.body).save();
  return newCourse;
};
```

### 3. Student-Accessible Endpoints

```javascript
exports.getMyCourses = async (req, reply) => {
  const allowedRoles = ["STUDENT"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  // Students can only see their own courses
  const courses = await StudentCourse.where({
    student_id: validatedUser.student.id,
  }).fetchAll({
    withRelated: ["course"],
  });

  return courses;
};
```

### 4. Multi-Role Endpoints

```javascript
exports.getAnnouncements = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
  ];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  let query = Announcement.forge();

  // Filter by institution for non-superadmins
  if (validatedUser.role !== "SUPERADMIN") {
    query.where("institution_id", validatedUser.institution_id);
  }

  const announcements = await query.fetchAll();
  return announcements;
};
```

## Error Handling

### Unauthorized Access (401)

```javascript
// checkAccess automatically returns 401 for unauthorized users
{
  error: "Unauthorized request",
  code: 401,
  message: "Unauthorized request",
  statusCode: 401
}
```

### Forbidden Access (403)

```javascript
// For business logic violations
throw boom.forbidden("Access denied");
```

### Not Found (404)

```javascript
// For missing resources
throw boom.notFound("User not found");
```

## Integration with Frontend

### 1. Consistent Role Checking

Both frontend and backend use the same role hierarchy and validation logic:

```javascript
// Backend
const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];

// Frontend
@RequireRole(['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF'])
```

### 2. Data Scoping

Backend automatically scopes data based on user role, while frontend controls UI access:

```javascript
// Backend: Data filtering
if (validatedUser.role === "ADMIN") {
  query.where("institution_id", validatedUser.institution_id);
}

// Frontend: UI protection
<RequireRoleGuard allowedRoles={["ADMIN"]}>
  <AdminPanel />
</RequireRoleGuard>;
```

### 3. RejectRole Pattern

The backend can implement similar "reject" patterns:

```javascript
// Backend equivalent of @RejectRole(['STUDENT'])
exports.getAssignmentSubmissions = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  // Students are implicitly rejected by not being in allowedRoles
  // Or explicitly check:
  if (validatedUser.role === "STUDENT") {
    throw boom.forbidden("Students cannot access assignment submissions");
  }

  // Continue with logic...
};
```

## Best Practices

### 1. Always Use checkAccess

```javascript
// ✅ Good
const { validatedUser } = checkAccess(req, reply, allowedRoles);

// ❌ Bad - No protection
exports.getData = async (req, reply) => {
  // No role checking
};
```

### 2. Apply Data Filtering

```javascript
// ✅ Good - Filter data by role
if (validatedUser.role === "ADMIN") {
  query.where("institution_id", validatedUser.institution_id);
}

// ❌ Bad - No filtering
const allData = await Model.fetchAll(); // Could expose other institutions' data
```

### 3. Validate Resource Ownership

```javascript
// ✅ Good - Check resource ownership
if (userId != validatedUser.id && !isHigherAccess) {
  throw boom.forbidden("Access denied");
}

// ❌ Bad - No ownership validation
const user = await User.where({ id: req.params.id }).fetch();
```

### 4. Use Appropriate HTTP Status Codes

```javascript
// 401 - Unauthorized (authentication required)
// 403 - Forbidden (authenticated but not authorized)
// 404 - Not Found (resource doesn't exist)
```

## Security Considerations

1. **JWT Token Validation**: Tokens are validated on every request
2. **Cookie Clearing**: Authentication cookies are cleared on unauthorized access
3. **Data Scoping**: All data is automatically scoped to user's institution/role
4. **Input Validation**: Always validate and sanitize input data
5. **Error Messages**: Don't expose sensitive information in error messages

## Testing Backend Protection

### Unit Tests

```javascript
describe("User API", () => {
  it("should reject unauthorized users", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Cookie", "role=STUDENT");

    expect(response.status).toBe(401);
  });

  it("should allow authorized users", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Cookie", "role=ADMIN");

    expect(response.status).toBe(200);
  });
});
```

This backend protection system works seamlessly with the frontend role-based access control to provide comprehensive security throughout the application.
