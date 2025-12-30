# Course Markdown Specification

This document defines the structured markdown format for importing and exporting courses in the platform.

## Overview

Courses can be defined in markdown format with special annotations that map to the database structure:
- **Course** → **Course Module** → **Course Lesson**
- **Course Test/Assignment** (can attach to Course, Module, or Lesson)
- **Course Question** (belongs to Course Test)
- **Practice Question** (belongs to Course Lesson)

## Syntax Rules

### 1. Course Metadata

Course metadata must appear at the very top of the document using an HTML comment:

```markdown
<!-- @course: {"code": "CS101", "name": "Introduction to Computer Science", "description": "A comprehensive introduction...", "units": 3, "department_id": 1} -->
```

**Required fields:**
- `code`: Course code (string)
- `name`: Course name (string)
- `description`: Course description (string)
- `units`: Number of credit units (number)

**Optional fields:**
- `department_id`: Department ID (number)
- `programme_id`: Programme ID (number)
- `level_id`: Level ID (number)
- `semester_position`: Semester position (number)
- `published`: Whether course is published (boolean, default: true)

### 2. Module Sections

Modules are defined using level 2 headings:

```markdown
## Module: Introduction to Programming
<!-- @module: {"order": 1, "description": "This module covers the basics of programming"} -->
```

**Required fields:**
- `order`: Display order (number, starting from 1)

**Optional fields:**
- `description`: Module description (string)
- `published`: Whether module is published (boolean, default: true)

### 3. Lesson Sections

Lessons are defined using level 3 headings and must appear within a module:

```markdown
### Lesson: Variables and Data Types
<!-- @lesson: {"order": 1, "description": "Learn about variables and data types"} -->

This is the lesson content. You can use standard markdown here:
- Lists
- **Bold text**
- *Italic text*
- Code blocks

```javascript
const example = "code";
```
```

**Required fields:**
- `order`: Display order (number, starting from 1)

**Optional fields:**
- `description`: Lesson description (string)
- `content`: Lesson content (markdown text - can be written directly after the heading)

### 4. Test/Assignment Sections

Tests and assignments are defined using level 4 headings. They can appear at the course, module, or lesson level:

```markdown
#### Test: Variables Quiz
<!-- @test: {"name": "Variables Quiz", "instructions": "Answer all questions", "duration_mins": 30, "max_attempts": 2, "deadline": "2024-12-31T23:59:59Z", "format": "quiz", "published": true} -->
```

**Required fields:**
- `name`: Test/Assignment name (string)

**Optional fields:**
- `instructions`: Test instructions (string)
- `duration_mins`: Duration in minutes (number)
- `max_attempts`: Maximum attempts allowed (number, default: 1)
- `deadline`: Deadline date in ISO format (string)
- `format`: Format type - "quiz", "assignment", or "" (string, default: "")
- `published`: Whether test is published (boolean, default: true)

**For Assignments:**
Set `format: "assignment"` to create an assignment instead of a test.

### 5. Test Questions

Questions for tests/assignments are defined after the test section:

```markdown
#### Test: Variables Quiz
<!-- @test: {...} -->

**Q1:** What is a variable?
- [ ] Option A
- [x] Option B (correct)
- [ ] Option C
- [ ] Option D

**Explanation:** Variables are used to store data values.
**Marks:** 2
**Order:** 1

**Q2:** Which keyword is used to declare a variable in JavaScript?
- [ ] var
- [x] All of the above
- [ ] let
- [ ] const

**Explanation:** JavaScript supports var, let, and const.
**Marks:** 1
**Order:** 2
```

**Question Format:**
- Question text starts with `**Q{number}:**`
- Options use checkbox syntax: `- [ ]` for incorrect, `- [x]` for correct
- Each question must have:
  - `**Explanation:**` - Explanation text
  - `**Marks:**` - Points for the question (number)
  - `**Order:**` - Display order (number)

### 6. Practice Questions

Practice questions are defined using level 4 headings within lessons:

```markdown
#### Practice Questions
<!-- @practice: {"difficulty": "easy", "count": 5} -->

**Q1:** What is a variable?
- [ ] Option A
- [x] Option B (correct)
- [ ] Option C
- [ ] Option D

**Explanation:** Variables store data values.
**Difficulty:** easy
**Type:** multiple_choice

**Q2:** True or False: Variables can be reassigned.
- [x] True
- [ ] False

**Explanation:** Variables declared with var or let can be reassigned.
**Difficulty:** medium
**Type:** true_false
```

**Practice Question Format:**
- Same format as test questions
- Additional fields:
  - `**Difficulty:**` - "easy", "medium", or "hard" (string)
  - `**Type:**` - "multiple_choice" or "true_false" (string, default: "multiple_choice")

**Practice Section Metadata:**
- `difficulty`: Default difficulty level (optional)
- `count`: Expected number of questions (optional, for validation)

## Complete Example

```markdown
<!-- @course: {"code": "CS101", "name": "Introduction to Computer Science", "description": "A comprehensive introduction to computer science fundamentals", "units": 3} -->

## Module: Introduction to Programming
<!-- @module: {"order": 1, "description": "Learn the basics of programming"} -->

### Lesson: Variables and Data Types
<!-- @lesson: {"order": 1, "description": "Understanding variables and data types"} -->

Variables are containers for storing data values. In JavaScript, you can declare variables using `var`, `let`, or `const`.

#### Practice Questions
<!-- @practice: {"difficulty": "easy"} -->

**Q1:** What is a variable?
- [ ] A function
- [x] A container for storing data
- [ ] A loop
- [ ] A condition

**Explanation:** Variables are containers that store data values.
**Difficulty:** easy
**Type:** multiple_choice

#### Test: Variables Quiz
<!-- @test: {"name": "Variables Quiz", "instructions": "Answer all questions carefully", "duration_mins": 30, "max_attempts": 2, "format": "quiz"} -->

**Q1:** Which keyword is used to declare a constant variable?
- [ ] var
- [ ] let
- [x] const
- [ ] constant

**Explanation:** The const keyword is used to declare constant variables.
**Marks:** 2
**Order:** 1

### Lesson: Functions
<!-- @lesson: {"order": 2, "description": "Learn about functions"} -->

Functions are reusable blocks of code that perform specific tasks.

#### Assignment: Function Implementation
<!-- @test: {"name": "Function Implementation", "instructions": "Implement the following functions", "deadline": "2024-12-31T23:59:59Z", "format": "assignment", "max_attempts": 1} -->

**Q1:** Implement a function that adds two numbers.
**Explanation:** Create a function named `add` that takes two parameters and returns their sum.
**Marks:** 10
**Order:** 1

**Q2:** Implement a function that checks if a number is even.
**Explanation:** Create a function named `isEven` that returns true if the number is even, false otherwise.
**Marks:** 10
**Order:** 2
```

## Validation Rules

1. **Course metadata** must be present at the top
2. **Modules** must have unique order values within a course
3. **Lessons** must have unique order values within a module
4. **Tests/Assignments** must have a name
5. **Questions** must have at least one correct answer marked with `[x]`
6. **Practice questions** must specify difficulty and type
7. **Test questions** must specify marks and order

## Notes

- All metadata is in JSON format within HTML comments
- Markdown content supports standard markdown syntax
- Code blocks are supported using triple backticks
- Images can be included using standard markdown image syntax
- The parser will preserve HTML content in lesson descriptions
- Dates should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)

## Import Process

1. Parse markdown document
2. Extract course metadata
3. Extract modules in order
4. Extract lessons within each module
5. Extract tests/assignments at appropriate levels
6. Extract questions for each test
7. Extract practice questions for each lesson
8. Validate all data
9. Create database records in transaction

## Export Process

1. Fetch course with all relations from database
2. Generate markdown following this specification
3. Include all modules, lessons, tests, and questions
4. Format dates in ISO 8601 format
5. Return markdown file for download

