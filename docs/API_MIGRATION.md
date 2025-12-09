# API Migration Documentation

This document provides a comprehensive overview of the API endpoints currently in use by the frontend application. It is intended to serve as a blueprint for the new backend API, ensuring a seamless migration without requiring frontend code changes.

Each endpoint is detailed with its method, path, purpose, request payload, and expected success response.

## Announcements API

Base Path: `/api/schoolAnnouncement`

### Create Announcement

- **Method**: `POST`
- **Path**: `/`
- **Description**: Creates a new school-wide announcement.
- **Request Payload**:
  ```json
  {
    "title": "string",
    "body": "string",
    "user_id": "integer",
    "institution_id": "integer"
  }
  ```
- **Success Response** (200 OK):
  ```json
  {
    "id": "integer",
    "title": "string",
    "body": "string",
    "user_id": "integer",
    "institution_id": "integer",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "user": {
      "id": "integer",
      "first_name": "string",
      "last_name": "string"
    }
  }
  ```

### Get All Announcements

- **Method**: `GET`
- **Path**: `/`
- **Description**: Retrieves a paginated list of all announcements for the user's institution.
- **Query Parameters**:
  - `pgsize`: integer (default: 500) - Number of items per page.
  - `pg`: integer (default: 1) - Page number.
- **Success Response** (200 OK):
  ```json
  [
    {
      "id": "integer",
      "title": "string",
      "body": "string",
      "user_id": "integer",
      "institution_id": "integer",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "user": {
        "id": "integer",
        "first_name": "string",
        "last_name": "string"
      },
      "read": "boolean"
    }
  ]
  ```

### Update Announcement

- **Method**: `PUT`
- **Path**: `/:id`
- **Description**: Updates an existing announcement.
- **URL Parameters**:
  - `id`: integer (required) - The ID of the announcement to update.
- **Request Payload**:
  ```json
  {
    "title": "string",
    "body": "string"
  }
  ```
- **Success Response** (200 OK):
  ```json
  {
    "id": "integer",
    "title": "string",
    "body": "string",
    "user_id": "integer",
    "institution_id": "integer",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "user": {
      "id": "integer",
      "first_name": "string",
      "last_name": "string"
    }
  }
  ```

### Delete Announcement

- **Method**: `DELETE`
- **Path**: `/:id`
- **Description**: Deletes an announcement.
- **URL Parameters**:
  - `id`: integer (required) - The ID of the announcement to delete.
- **Success Response** (204 No Content): No body content.

### Search Announcements

- **Method**: `GET`
- **Path**: `/search`
- **Description**: Searches for announcements by title or body.
- **Query Parameters**:
  - `query`: string (required) - The search term.
  - `pgsize`: integer (default: 500)
  - `pg`: integer (default: 1)
- **Success Response** (200 OK):
  ```json
  [
    {
      "id": "integer",
      "title": "string",
      "body": "string",
      "user_id": "integer",
      "institution_id": "integer",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "user": {
        "id": "integer",
        "first_name": "string",
        "last_name": "string"
      },
      "read": "boolean"
    }
  ]
  ```

### Mark Announcement as Read

- **Method**: `POST`
- **Path**: `/:id/read`
- **Description**: Marks a single announcement as read for the current user.
- **URL Parameters**:
  - `id`: integer (required) - The ID of the announcement.
- **Success Response** (200 OK):
  ```json
  {
    "message": "string",
    "read": true
  }
  ```

### Mark All Announcements as Read

- **Method**: `POST`
- **Path**: `/mark-all-read`
- **Description**: Marks all announcements for the user's institution as read for the current user.
- **Success Response** (200 OK):
  ```json
  {
    "message": "string",
    "markedCount": "integer"
  }
  ```

## Courses API

This section covers APIs related to courses, course modules, and student course registrations.

### Get All Courses (for user)

- **Method**: `GET`
- **Path**: `/api/course`
- **Description**: Retrieves a list of courses. The course list is contextual to the user's role (e.g., a student sees their enrolled courses, an HOD sees courses in their department).
- **Query Parameters**:
  - `pgsize`: integer (default: 100) - Number of items per page.
  - `pg`: integer (default: 1) - Page number.
  - `search`: string - A search term to filter courses by name or code.
- **Success Response** (200 OK):
  ```json
  [
    {
      "id": "integer",
      "programme_id": "integer",
      "code": "string",
      "name": "string",
      "level_id": "integer",
      "units": "integer",
      "description": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "semester_position": "integer",
      "department_id": "integer",
      "published": "boolean"
      // Additional progress fields are added for students
    }
  ]
  ```

### Create Course Module

- **Method**: `POST`
- **Path**: `/api/coursemodule`
- **Description**: Creates a new module within a course.
- **Request Payload**:
  ```json
  {
    "course_id": "integer",
    "name": "string",
    "order": "integer",
    "description": "string",
    "published": "boolean"
  }
  ```
- **Success Response** (200 OK):
  ```json
  {
    "id": "integer",
    "course_id": "integer",
    "name": "string",
    "order": "integer",
    "description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "published": "boolean"
  }
  ```

### Update Course Module

- **Method**: `PUT`
- **Path**: `/api/coursemodule/:id`
- **Description**: Updates an existing course module.
- **URL Parameters**:
  - `id`: integer (required) - The ID of the course module to update.
- **Request Payload**:
  ```json
  {
    "name": "string",
    "order": "integer",
    "description": "string",
    "published": "boolean"
  }
  ```
- **Success Response** (200 OK):
  ```json
  {
    "id": "integer",
    "course_id": "integer"
    // ... other fields
  }
  ```

### Delete Course Module

- **Method**: `DELETE`
- **Path**: `/api/coursemodule/:id`
- **Description**: Deletes a course module.
- **URL Parameters**:
  - `id`: integer (required) - The ID of the course module to delete.
- **Success Response** (200 OK):
  ```json
  {
    // Bookshelf model destroy response
  }
  ```

### Get Student's Enrolled Courses

- **Method**: `GET`
- **Path**: `/api/studentcourse/studentid/:student_id`
- **Description**: Retrieves all courses a specific student is enrolled in.
- **URL Parameters**:
  - `student_id`: integer (required) - The ID of the student.
- **Success Response** (200 OK):
  ```json
  [
    {
      "id": "integer",
      "student_id": "integer",
      "course_id": "integer",
      "level_id": "integer",
      "semester_id": "integer",
      // ... other fields
      "course": {
        "id": "integer",
        "code": "string",
        "name": "string",
        "units": "integer"
      }
    }
  ]
  ```

### Register for Courses

- **Method**: `POST`
- **Path**: `/api/studentcourse`
- **Description**: Registers a student for one or more courses. Can be sent as a single object or an array for bulk registration.
- **Request Payload** (Single):
  ```json
  {
    "student_id": "integer",
    "course_id": "integer",
    "level_id": "integer",
    "semester_id": "integer"
  }
  ```
- **Request Payload** (Bulk): `[ { ...course registration object... } ]`
- **Success Response** (200 OK): The created student course object or an array of them.

### De-register from a Course

- **Method**: `DELETE`
- **Path**: `/api/studentcourse/:id`
- **Description**: Removes a student's registration for a course.
- **URL Parameters**:
  - `id`: integer (required) - The ID of the `student_course` record.
- **Success Response** (200 OK):
  ```json
  {
    // Bookshelf model destroy response
  }
  ```

## Connect (Forum & Discussions) API

This section covers APIs related to school-wide forums, course-specific forums, and class discussions.

### Get Course Forum Topics

- **Method**: `GET`
- **Path**: `/api/courseForumTopic/:course_id`
- **Description**: Retrieves all forum topics for a specific course.
- **URL Parameters**:
  - `course_id`: integer (required) - The ID of the course.
- **Success Response** (200 OK):
  ```json
  [
    {
      "id": "integer",
      "title": "string",
      "description": "string",
      "user_id": "integer",
      "course_id": "integer",
      "user": { "..." },
      "thread": [ "... "],
      "course": { "..." }
    }
  ]
  ```

### Create Course Forum Topic

- **Method**: `POST`
- **Path**: `/api/courseForumTopic`
- **Description**: Creates a new forum topic within a course.
- **Request Payload**:
  ```json
  {
    "title": "string",
    "description": "string",
    "user_id": "integer",
    "course_id": "integer"
  }
  ```
- **Success Response** (200 OK): The created course forum topic object with user and thread relations.

### Update Course Forum Topic

- **Method**: `PUT`
- **Path**: `/api/courseForumTopic/:id`
- **Description**: Updates a course forum topic.
- **URL Parameters**: `id` (integer, required).
- **Request Payload**:
  ```json
  {
    "title": "string",
    "description": "string"
  }
  ```
- **Success Response** (200 OK): The updated topic object.

### Delete Course Forum Topic

- **Method**: `DELETE`
- **Path**: `/api/courseForumTopic/:id`
- **Description**: Deletes a course forum topic and its associated threads.
- **URL Parameters**: `id` (integer, required).
- **Success Response** (204 No Content).

### Create Forum/Discussion Post (Comment/Thread)

- **Method**: `POST`
- **Path**:
  - `/api/courseForumThread` (for course forums)
  - `/api/forumThread` (for school-wide forums)
  - `/api/discussionComment` (for class discussions)
- **Description**: Creates a new post (comment/thread) within a topic.
- **Request Payload** (`courseForumThread`):
  ```json
  {
    "body": "string",
    "user_id": "integer",
    "course_forum_topic_id": "integer"
  }
  ```
- **Success Response** (201 Created): The created thread/comment object with user relation.

### Update Forum/Discussion Post (Comment/Thread)

- **Method**: `PUT`
- **Path**:
  - `/api/courseForumThread/:id`
  - `/api/forumThread/:id`
  - `/api/discussionComment/:id`
- **Description**: Updates a post.
- **URL Parameters**: `id` (integer, required).
- **Request Payload**: `{ "body": "string" }`
- **Success Response** (200 OK): The updated post object.

### Delete Forum/Discussion Post (Comment/Thread)

- **Method**: `DELETE`
- **Path**:
  - `/api/courseForumThread/:id`
  - `/api/forumThread/:id`
  - `/api/discussionComment/:id`
- **Description**: Deletes a post.
- **URL Parameters**: `id` (integer, required).
- **Success Response** (204 No Content).

### Get Class Discussion Topics

- **Method**: `GET`
- **Path**: `/api/discussionTopic/:course_id`
- **Description**: Retrieves all discussion topics for a specific course.
- **URL Parameters**: `course_id` (integer, required).
- **Success Response** (200 OK): An array of discussion topic objects.

### Create Class Discussion Topic

- **Method**: `POST`
- **Path**: `/api/discussionTopic`
- **Description**: Creates a new class discussion topic.
- **Request Payload**:
  ```json
  {
    "title": "string",
    "body": "string",
    "user_id": "integer",
    "course_id": "integer",
    "start_date": "timestamp",
    "end_date": "timestamp"
  }
  ```
- **Success Response** (200 OK): The created discussion topic object.

### Update Class Discussion Topic

- **Method**: `PUT`
- **Path**: `/api/discussionTopic/:id`
- **Description**: Updates a class discussion topic.
- **URL Parameters**: `id` (integer, required).
- **Request Payload**: `{ ... all fields from create ... }`
- **Success Response** (200 OK): The updated discussion topic object.

### Delete Class Discussion Topic

- **Method**: `DELETE`
- **Path**: `/api/discussionTopic/:id`
- **Description**: Deletes a class discussion topic.
- **URL Parameters**: `id` (integer, required).
- **Success Response** (204 No Content).

## CGPA & Results API

This section covers APIs related to student results, GPAs, and tests (quizzes/assignments).

### Get Student Results

- **Method**: `GET`
- **Path**: `/api/studentresult/:student_id`
- **Description**: Retrieves all published results for a specific student.
- **URL Parameters**: `student_id` (integer, required).
- **Success Response** (200 OK):
  ```json
  [
    {
      "id": "integer",
      "student_course_id": "integer",
      "grade_id": "integer",
      "score": "number",
      "publish": true,
      "grade": { "..." },
      "studentcourse": { "..." }
    }
  ]
  ```

### Get Student GPA

- **Method**: `GET`
- **Path**: `/api/studentgpa/studentid/:student_id`
- **Description**: Retrieves all GPA records for a student.
- **URL Parameters**: `student_id` (integer, required).
- **Success Response** (200 OK):
  ```json
  [
    {
      "id": "integer",
      "student_id": "integer",
      "semester_id": "integer",
      "level_id": "integer",
      "semester_gpa": "number",
      "cumulative_gpa": "number",
      "level": { "..." },
      "semester": { "..." }
    }
  ]
  ```

### Get Student Test Submissions

- **Method**: `GET`
- **Path**: `/api/studenttest`
- **Description**: Retrieves a list of test submissions. For students, it's filtered to their own submissions.
- **Query Parameters**: Can be filtered by `course_test_id`.
- **Success Response** (200 OK): An array of student test submission objects.

### Get New/Recent Student Tests

- **Method**: `GET`
- **Path**: `/api/studenttest/new`
- **Description**: Retrieves a list of recent tests taken by a student, including the course name.
- **Success Response** (200 OK):
  ```json
  [
    {
      "id": "integer",
      "course_test_id": "integer",
      "test_name": "string",
      "name": "string" // course name
    }
  ]
  ```

### Get Specific Student Test Submission

- **Method**: `GET`
- **Path**: `/api/studenttest/:id`
- **Description**: Retrieves a single test submission by its ID.
- **URL Parameters**: `id` (integer, required).
- **Success Response** (200 OK): A single student test submission object.

### Mark a Student Test

- **Method**: `POST`
- **Path**: `/api/studenttest/mark`
- **Description**: Marks a manually graded test (like an assignment).
- **Request Payload**:
  ```json
  {
    "student_test_id": "integer",
    "score": "number",
    "feedback": [
      {
        "questionId": "string",
        "feedback": "string"
      }
    ]
  }
  ```
- **Success Response** (200 OK): The updated student test submission object.

## Calendar API

### Get Institution Parameters

- **Method**: `POST`
- **Path**: `/api/institution/params`
- **Description**: Retrieves institution details, including calendar data.
- **Request Payload**: `{ "id": "integer" }`
- **Success Response** (200 OK): The institution object.

### Structure Calendar Data

- **Method**: `POST`
- **Path**: `/api/calendar/structure`
- **Description**: Processes raw text from a PDF and structures it into calendar data, which is then saved to the institution's record. This is a fire-and-forget endpoint.
- **Request Payload**:
  ```json
  {
    "rawText": "string",
    "institutionId": "integer"
  }
  ```
- **Success Response** (200 OK): `{ "message": "Calendar structuring initiated" }`

### Update Institution (for calendar)

- **Method**: `PUT`
- **Path**: `/api/institution/:id`
- **Description**: Updates the institution's record, primarily used here to save the URL of the uploaded school calendar PDF or to remove it.
- **Request Payload**: `{ "school_calendar": "string|null" }`
- **Success Response** (200 OK): The updated institution object.

## Student & Profile API

### Get Student Dashboard Data

- **Method**: `GET`
- **Path**: `/api/student/dashboard`
- **Description**: Retrieves aggregate data for the student dashboard.
- **Success Response** (200 OK): An object containing dashboard stats.

### Get Student Profile

- **Method**: `GET`
- **Path**: `/api/student/:id`
- **Description**: Fetches a student's detailed profile information.
- **URL Parameters**: `id` (integer, required).
- **Success Response** (200 OK): The student object with user relation.

### Get Programmes

- **Method**: `GET`
- **Path**: `/api/programme` (Note: frontend uses `/api/programmes`)
- **Description**: Fetches a list of academic programmes.
- **Success Response** (200 OK): An array of programme objects.

### Get User Profile

- **Method**: `GET`
- **Path**: `/api/profile`
- **Description**: Fetches the profile of the currently authenticated user.
- **Success Response** (200 OK): The user object.

### Update User Profile

- **Method**: `PUT`
- **Path**: `/api/profile`
- **Description**: Updates the profile of the currently authenticated user.
- **Request Payload**: An object with user fields to update.
- **Success Response** (200 OK): The updated user object.

## Course Announcements API

Base Path: `/api/courseannouncements`

### Create Course Announcement

- **Method**: `POST`
- **Path**: `/`
- **Description**: Creates an announcement for a specific course.
- **Request Payload**:
  ```json
  {
    "title": "string",
    "body": "string",
    "user_id": "integer",
    "course_id": "integer"
  }
  ```
- **Success Response** (200 OK): The created announcement object with user relation.

### Get Course Announcements

- **Method**: `GET`
- **Path**: `/?course_id={course_id}`
- **Description**: Retrieves all announcements for a specific course.
- **Query Parameters**: `course_id` (integer, required).
- **Success Response** (200 OK): An array of announcement objects.

### Update Course Announcement

- **Method**: `PUT`
- **Path**: `/:id`
- **Description**: Updates a course announcement.
- **URL Parameters**: `id` (integer, required).
- **Request Payload**:
  ```json
  {
    "title": "string",
    "body": "string"
  }
  ```
- **Success Response** (200 OK): The updated announcement object.

### Delete Course Announcement

- **Method**: `DELETE`
- **Path**: `/:id`
- **Description**: Deletes a course announcement.
- **URL Parameters**: `id` (integer, required).
- **Success Response** (204 No Content).

## Authentication API

Base Path: `/api`

### Login

- **Method**: `POST`
- **Path**: `/login`
- **Description**: Authenticates a user and returns a JWT token in a cookie.
- **Request Payload**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response** (200 OK): The full user object (with student/staff relations) and a `token` cookie set on the response.

### Get Authenticated Profile

- **Method**: `GET`
- **Path**: `/auth/profile`
- **Description**: Retrieves the profile of the currently logged-in user (from the token).
- **Success Response** (200 OK): The user object associated with the token.

## Academic Structure API (Institution, Faculty, Department)

### Get All Institutions

- **Method**: `GET`
- **Path**: `/api/institution`
- **Description**: Retrieves a list of all institutions.
- **Success Response** (200 OK): An array of institution objects.

### Create Institution

- **Method**: `POST`
- **Path**: `/api/institution`
- **Description**: Creates a new institution.
- **Request Payload**: An object with institution details.
- **Success Response** (200 OK): The newly created institution object.

### Delete Institution

- **Method**: `DELETE`
- **Path**: `/api/institution/:id`
- **Description**: Deletes an institution.
- **Success Response** (200 OK): The deleted object info.

### Get All Faculties

- **Method**: `GET`
- **Path**: `/api/faculty`
- **Description**: Retrieves a list of all faculties.
- **Success Response** (200 OK): An array of faculty objects.

### Create Faculty

- **Method**: `POST`
- **Path**: `/api/faculty`
- **Description**: Creates a new faculty.
- **Request Payload**: An object with faculty details.
- **Success Response** (200 OK): The newly created faculty object.

### Get Faculty with Departments

- **Method**: `GET`
- **Path**: `/api/faculty/:id`
- **Description**: Retrieves a specific faculty and its departments.
- **Success Response** (200 OK): A faculty object with a nested `departments` array.

### Update Faculty

- **Method**: `PUT`
- **Path**: `/api/faculty/:id`
- **Description**: Updates a faculty.
- **Success Response** (200 OK): The updated faculty object.

### Delete Faculty

- **Method**: `DELETE`
- **Path**: `/api/faculty/:id`
- **Description**: Deletes a faculty.
- **Success Response** (200 OK): The deleted object info.

### Get All Departments

- **Method**: `GET`
- **Path**: `/api/department`
- **Description**: Retrieves a list of all departments.
- **Success Response** (200 OK): An array of department objects.

### Create Department

- **Method**: `POST`
- **Path**: `/api/department`
- **Description**: Creates a new department.
- **Request Payload**: An object with department details.
- **Success Response** (200 OK): The newly created department object.

### Get Department with Programmes

- **Method**: `GET`
- **Path**: `/api/department/:id`
- **Description**: Retrieves a specific department and its programmes.
- **Success Response** (200 OK): A department object with a nested `programmes` array.

### Update Department

- **Method**: `PUT`
- **Path**: `/api/department/:id`
- **Description**: Updates a department.
- **Success Response** (200 OK): The updated department object.

### Delete Department

- **Method**: `DELETE`
- **Path**: `/api/department/:id`
- **Description**: Deletes a department.
- **Success Response** (200 OK): The deleted object info.

## Programme Course API

Base Path: `/api/programmecourse`

### Get Programme Courses

- **Method**: `GET`
- **Path**: `/`
- **Description**: Retrieves a list of all programme-course associations.
- **Success Response** (200 OK): An array of programme course objects.

### Create Programme Course

- **Method**: `POST`
- **Path**: `/`
- **Description**: Associates a course with a programme.
- **Request Payload**:
  ```json
  {
    "programme_id": "integer",
    "course_id": "integer",
    "level_id": "integer",
    "semester_id": "integer",
    "course_type": "string"
  }
  ```
- **Success Response** (200 OK): The created programme course object.

### Update Programme Course

- **Method**: `PUT`
- **Path**: `/:id`
- **Description**: Updates a programme-course association.
- **Success Response** (200 OK): The updated programme course object.

### Delete Programme Course

- **Method**: `DELETE`
- **Path**: `/:id`
- **Description**: Deletes a programme-course association.
- **Success Response** (200 OK): The deleted object info.

## Course Progress & Learning API

### Get Course Progress

- **Method**: `GET`
- **Path**: `/api/course-progress/:course_id`
- **Description**: Retrieves a student's progress for a specific course.
- **URL Parameters**: `course_id` (integer, required).
- **Query Parameters**: `student_id` (integer, required for non-students).
- **Success Response** (200 OK): A course progress object.

### Update Module Progress

- **Method**: `PUT`
- **Path**: `/api/module-progress/:course_module_id`
- **Description**: Updates a student's progress within a specific module.
- **Request Payload**:
  ```json
  {
    "completed_lessons": ["integer"],
    "current_lesson_id": "integer",
    "last_lesson_id": "integer",
    "time_spent_minutes": "integer"
  }
  ```
- **Success Response** (200 OK): The updated course progress object.

### Start Learning Session

- **Method**: `POST`
- **Path**: `/api/learning-session/start`
- **Description**: Logs the start of a learning session for a student in a course.
- **Request Payload**:
  ```json
  {
    "course_id": "integer",
    "course_module_id": "integer"
  }
  ```
- **Success Response** (200 OK): An object containing the `session_id` and the updated progress.

## Student Test API

### Start Test

- **Method**: `POST`
- **Path**: `/api/studenttest/start`
- **Description**: Creates a student test record to signify the start of a test attempt.
- **Request Payload**:
  ```json
  {
    "course_test_id": "integer"
  }
  ```
- **Success Response** (200 OK):
  ```json
  {
    "id": "integer",
    "user_id": "integer",
    "course_test_id": "integer",
    "test_name": "string",
    "attempt_number": "integer",
    "endtime": "timestamp",
    "submitted_at": null
  }
  ```

### Finish Test

- **Method**: `POST`
- **Path**: `/api/studenttest/finish`
- **Description**: Submits the answers for a test that has been started.
- **Request Payload**:
  ```json
  {
    "student_test_id": "integer",
    "questions_answers": [
      {
        "questionId": "integer",
        "selection": { "A": { "is_answer": true } }, // Example for MCQ
        "text_answer": "string", // For theory questions
        "file_answer": "string" // For file upload questions
      }
    ]
  }
  ```
- **Success Response** (200 OK): The updated `student_test` object with `submitted_at` timestamp and calculated `score`.

### Upload Offline Test Results

- **Method**: `POST`
- **Path**: `/api/studenttest/uploadresults`
- **Description**: Bulk upload of scores for offline tests via a CSV file.
- **Request Payload**:
  ```json
  {
    "test_id": "integer",
    "results_file": "string" // Base64 encoded CSV string
  }
  ```
- **Success Response** (200 OK):
  ```json
  {
    "rows_received": "integer",
    "rows_confirmed": "integer",
    "rows_saved": "integer",
    "errors": {}
  }
  ```

## Academic Primitives API (Levels, Degrees)

### Get All Levels

- **Method**: `GET`
- **Path**: `/api/level`
- **Description**: Retrieves a list of all academic levels (e.g., 100 Level, 200 Level).
- **Success Response** (200 OK):
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "description": "string",
      "institution_id": "integer"
    }
  ]
  ```

### Create Level

- **Method**: `POST`
- **Path**: `/api/level`
- **Description**: Creates a new academic level.
- **Request Payload**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Success Response** (200 OK): The newly created level object.

### Update Level

- **Method**: `PUT`
- **Path**: `/api/level/:id`
- **Description**: Updates an academic level.
- **URL Parameters**: `id` (integer, required).
- **Request Payload**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Success Response** (200 OK): The updated level object.

### Delete Level

- **Method**: `DELETE`
- **Path**: `/api/level/:id`
- **Description**: Deletes an academic level.
- **URL Parameters**: `id` (integer, required).
- **Success Response** (200 OK): The deleted object info.

### Get All Class Degrees

- **Method**: `GET`
- **Path**: `/api/classdegree`
- **Description**: Retrieves the list of all possible degree classifications (e.g., First Class, Second Class).
- **Success Response** (200 OK):
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "code": "string",
      "min_point": "number",
      "max_point": "number"
    }
  ]
  ```

### Create Class Degree

- **Method**: `POST`
- **Path**: `/api/classdegree`
- **Description**: Creates a new degree classification.
- **Request Payload**:
  ```json
  {
    "name": "string",
    "code": "string",
    "min_point": "number",
    "max_point": "number"
  }
  ```
- **Success Response** (200 OK): The newly created class degree object.

## Reports & Support API

### Get Reports Data

- **Method**: `GET`
- **Path**: `/api/report/:institution_id`
- **Description**: Retrieves aggregated data for various reports based on an institution.
- **URL Parameters**: `institution_id` (integer, required).
- **Success Response** (200 OK):
  ```json
  {
    "applicant": [],
    "admitted": [],
    "completedApplication": [],
    "acceptanceFeePaid": []
  }
  ```

### Get Weekly Reports

- **Method**: `GET`
- **Path**: `/api/report/weekly`
- **Description**: Retrieves a weekly summary report.
- **Query Parameters**: `startDate`, `endDate` (optional).
- **Success Response** (200 OK): An array of report objects with `title`, `description`, and `value`.

### Get Analytics Data

- **Method**: `GET`
- **Path**: `/api/report/analytics/:institution_id`
- **Description**: Retrieves detailed analytics data for dashboards.
- **URL Parameters**: `institution_id` (integer, required).
- **Query Parameters**: `startDate`, `endDate` (optional).
- **Success Response** (200 OK):
  ```json
  {
    "summary": {
      "totalApplications": "integer",
      "ongoingApplications": "integer",
      "completedApplications": "integer",
      "admittedStudents": "integer",
      "acceptanceFeePaid": "integer",
      "conversionRate": "number",
      "completionRate": "number",
      "acceptanceRate": "number"
    },
    "monthlyTrends": [],
    "distributions": {},
    "demographics": {},
    "financial": {}
  }
  ```

### Send Support Message

- **Method**: `POST`
- **Path**: `/api/support`
- **Description**: Sends an email to the support address.
- **Request Payload**:
  ```json
  {
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "subject": "string",
    "message": "string"
  }
  ```
- **Success Response** (200 OK): `success` (string)

## Immersive Test & Assignments API

This section covers APIs for creating and managing tests, questions, and lessons.

### Get Course Tests

- **Method**: `GET`
- **Path**: `/api/coursetest`
- **Description**: Retrieves a list of tests, often filtered by `course_id`.
- **Success Response** (200 OK): An array of course test objects.

### Create Course Test

- **Method**: `POST`
- **Path**: `/api/coursetest`
- **Description**: Creates a new test.
- **Request Payload**: An object representing the new `coursetest`.
- **Success Response** (200 OK): The created course test object.

### Update Course Test

- **Method**: `PUT`
- **Path**: `/api/coursetest/:id`
- **Description**: Updates a test.
- **Request Payload**: An object with fields to update.
- **Success Response** (200 OK): The updated course test object.

### Delete Course Test

- **Method**: `DELETE`
- **Path**: `/api/coursetest/:id`
- **Description**: Deletes a test.
- **Success Response** (200 OK): The deleted object info.

### Get Course Questions

- **Method**: `GET`
- **Path**: `/api/coursequestion`
- **Description**: Retrieves questions, usually filtered by `course_test_id`.
- **Success Response** (200 OK): An array of course question objects.

### Create Course Question

- **Method**: `POST`
- **Path**: `/api/coursequestion`
- **Description**: Creates a new question for a test.
- **Success Response** (200 OK): The created question object.

### Delete Course Question

- **Method**: `DELETE`
- **Path**: `/api/coursequestion/:id`
- **Description**: Deletes a question.
- **Success Response** (200 OK): The deleted object info.

### Create Course Lesson

- **Method**: `POST`
- **Path**: `/api/courselesson`
- **Description**: Creates a new lesson in a module.
- **Success Response** (200 OK): The created lesson object.

### Update Course Lesson

- **Method**: `PUT`
- **Path**: `/api/courselesson/:id`
- **Description**: Updates a lesson.
- **Success Response** (200 OK): The updated lesson object.

### Delete Course Lesson

- **Method**: `DELETE`
- **Path**: `/api/courselesson/:id`
- **Description**: Deletes a lesson.
- **Success Response** (200 OK): The deleted object info.

## Payments & Verification API

### Get Payments

- **Method**: `GET`
- **Path**: `/api/payment2`
- **Description**: Retrieves payment records.
- **Success Response** (200 OK): An array of payment objects.

### Create Payment

- **Method**: `POST`
- **Path**: `/api/payment2`
- **Description**: Creates a new payment record.
- **Success Response** (200 OK): The created payment object.

### Get Payables

- **Method**: `GET`
- **Path**: `/api/payment2/payables`
- **Description**: Retrieves payable fees for a student.
- **Success Response** (200 OK): An array of payable objects.

### Get Payment Account

- **Method**: `GET`
- **Path**: `/api/paymentaccount`
- **Description**: Retrieves the payment account details for the user.
- **Success Response** (200 OK): The payment account object.

## Unused Endpoints to Exclude

The following endpoints were found in the Fastify backend's documentation but were not detected in the frontend code scan. They can be safely excluded from the migration unless a specific need for them is identified.

### Affiliate

- `POST /api/affiliate/verifyToken`
- `POST /api/affiliate/login`
- `GET /api/affiliate`
- `POST /api/affiliate`
- `GET /api/affiliate/applicant`
- `GET /api/affiliate/{id}`
- `PUT /api/affiliate/{id}`
- `DELETE /api/affiliate/{id}`

### Student Test

- `POST /api/studenttest/start`
- `POST /api/studenttest/finish`
- `POST /api/studenttest/uploadresults`

### Levels, Degrees, Countries, States, LGAs

- All `/api/level` endpoints
- All `/api/classdegree` endpoints
- All `/api/country` endpoints
- All `/api/state` endpoints
- All `/api/lga` endpoints

### Fees

- All `/api/fee`, `/api/feestudent`, `/api/feestudentpaymentfrequency`, `/api/feestudentpayment` endpoints

### Grades

- All `/api/grade` endpoints

### Result Batch

- All `/api/resultbatch` endpoints

### Semester & Session

- `POST /api/semester`
- `GET /api/semester/{id}`
- `PUT /api/semester/{id}`
- `DELETE /api/semester/{id}`
- All `/api/session` endpoints

### Staff & Staff Course

- All `/api/staff` and `/api/staffcourse` endpoints

### Reports & Support

- All `/api/report` and `/api/support` endpoints

### Deferment, Payment Plan, Reject Applicant

- All `/api/deferment`, `/api/paymentplan`, `/api/reject` endpoints

### Self Institution

- All `/api/selfInstitution` endpoints

### User

- All `/api/user` endpoints (Note: `/api/profile` is used, which is a subset of this)

### Schema

- `GET /api/schema/{table}`
