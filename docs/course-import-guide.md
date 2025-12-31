# Course Import/Export Guide

This guide explains how to use the markdown-based course import and export system.

## Overview

The course import/export system allows you to:
- Create courses using structured markdown documents
- Import complete courses with modules, lessons, tests, assignments, and practice questions
- Export existing courses to markdown format for backup or editing

## Importing a Course

### Method 1: Using the API

You can import a course by sending a POST request to `/api/course/import` with either:

**Option A: Upload a markdown file**
```javascript
const formData = new FormData();
formData.append('file', markdownFile);
formData.append('department_id', '1');

const response = await fetch('/api/course/import', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});
```

**Option B: Send markdown text directly**
```javascript
const formData = new FormData();
formData.append('markdown', markdownText);
formData.append('department_id', '1');

const response = await fetch('/api/course/import', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});
```

### Method 2: Using the UI (if implemented)

1. Navigate to the course management page
2. Click "Import Course"
3. Select or paste your markdown file
4. Select the department
5. Click "Import"

### Required Fields

- **Course Code**: Unique identifier for the course
- **Course Name**: Display name of the course
- **Description**: Course description
- **Units**: Credit units (must be at least 1)
- **Department ID**: Either in the markdown metadata or provided in the form

### Import Process

1. The system parses the markdown document
2. Validates all required fields and structure
3. Creates the course in a database transaction
4. Creates modules, lessons, tests, and questions in order
5. Returns a summary of what was created

### Import Response

```json
{
  "success": true,
  "data": {
    "success": true,
    "courseId": 123,
    "created": {
      "course": true,
      "modules": 2,
      "lessons": 5,
      "tests": 3,
      "questions": 15,
      "practiceQuestions": 10
    },
    "warnings": []
  }
}
```

## Exporting a Course

### Method 1: Using the API

Export a course by sending a GET request to `/api/course/export`:

```javascript
const courseId = 123;
const response = await fetch(
  `/api/course/export?course_id=${courseId}&include_unpublished=false&include_practice_questions=true`,
  {
    credentials: 'include'
  }
);

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `course-${courseId}.md`;
a.click();
```

### Method 2: Using the UI (if implemented)

1. Navigate to the course page
2. Click "Export Course"
3. Choose export options
4. Download the generated markdown file

### Export Parameters

- `course_id` (required): ID of the course to export
- `include_unpublished` (optional): Include unpublished modules/tests (default: false)
- `include_practice_questions` (optional): Include practice questions (default: true)

## Markdown Format

See [course-markdown-specification.md](./course-markdown-specification.md) for complete format details.

### Quick Start Template

```markdown
<!-- @course: {"code": "COURSE101", "name": "Course Name", "description": "Course description", "units": 3} -->

## Module: Module Name
<!-- @module: {"order": 1, "description": "Module description"} -->

### Lesson: Lesson Name
<!-- @lesson: {"order": 1, "description": "Lesson description"} -->

Lesson content goes here...

#### Practice Questions
<!-- @practice: {} -->

**Q1:** Question text?
- [ ] Option A
- [x] Option B (correct)
- [ ] Option C

**Explanation:** Explanation text
**Difficulty:** easy
**Type:** multiple_choice

#### Test: Test Name
<!-- @test: {"name": "Test Name", "duration_mins": 30, "max_attempts": 2, "format": "quiz"} -->

**Q1:** Question text?
- [ ] Option A
- [x] Option B (correct)
- [ ] Option C

**Explanation:** Explanation text
**Marks:** 2
**Order:** 1
```

## Best Practices

### 1. Course Structure

- Organize content logically into modules
- Use clear, descriptive names for modules and lessons
- Maintain consistent ordering (1, 2, 3, etc.)

### 2. Content Quality

- Write clear, concise lesson descriptions
- Provide detailed explanations for questions
- Use appropriate difficulty levels for practice questions
- Include code examples where relevant

### 3. Questions

- Write clear, unambiguous questions
- Provide plausible distractors (wrong answers)
- Include comprehensive explanations
- Set appropriate marks/points for test questions

### 4. Tests vs Assignments

- Use `format: "quiz"` or leave empty for quizzes/tests
- Use `format: "assignment"` for assignments that require manual grading
- Set appropriate deadlines for assignments
- Consider max_attempts (1 for assignments, more for practice quizzes)

### 5. Validation

- Always validate your markdown before importing
- Check for duplicate order numbers
- Ensure all required fields are present
- Test with a small course first

## Troubleshooting

### Import Errors

**"Validation failed"**
- Check that all required fields are present
- Verify JSON syntax in metadata comments
- Ensure order numbers are unique within each level

**"Department ID is required"**
- Either include `department_id` in course metadata
- Or provide it in the import form

**"Duplicate module order"**
- Each module must have a unique order number
- Check that order numbers are sequential and unique

### Export Issues

**"Course not found"**
- Verify the course ID is correct
- Ensure you have permission to access the course

**Missing content in export**
- Check if content is unpublished (use `include_unpublished=true`)
- Verify practice questions exist if they're missing

## Examples

See [sample-course.md](./examples/sample-course.md) for a complete example course.

## API Reference

### POST /api/course/import

**Request:**
- `file` (File, optional): Markdown file
- `markdown` (string, optional): Markdown text
- `department_id` (string, required if not in metadata): Department ID

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "courseId": number,
    "created": {
      "course": boolean,
      "modules": number,
      "lessons": number,
      "tests": number,
      "questions": number,
      "practiceQuestions": number
    },
    "warnings": ValidationError[]
  }
}
```

### GET /api/course/export

**Query Parameters:**
- `course_id` (required): Course ID to export
- `include_unpublished` (optional): Include unpublished content
- `include_practice_questions` (optional): Include practice questions

**Response:**
- Markdown file download

## Support

For issues or questions:
1. Check the [specification document](./course-markdown-specification.md)
2. Review the [example course](./examples/sample-course.md)
3. Contact the development team


