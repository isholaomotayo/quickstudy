<!-- @course: {"code": "CS101", "name": "Introduction to Computer Science", "description": "A comprehensive introduction to computer science fundamentals including programming basics, data structures, and algorithms.", "units": 3, "department_id": 1} -->

## Module: Introduction to Programming

<!-- @module: {"order": 1, "description": "Learn the basics of programming including variables, data types, and control structures", "published": true} -->

### Lesson: Variables and Data Types

<!-- @lesson: {"order": 1, "description": "Understanding variables and data types in programming"} -->

Variables are containers for storing data values. In programming, variables allow us to store and manipulate data.

#### Key Concepts

1. **Variables**: Named storage locations in memory
2. **Data Types**: Different kinds of data (numbers, strings, booleans, etc.)
3. **Declaration**: Creating a variable with a name
4. **Assignment**: Giving a variable a value

#### Example Code

```javascript
// Variable declaration
let name = "John";
let age = 25;
let isStudent = true;
```

#### Practice Questions

<!-- @practice: {"difficulty": "easy"} -->

**Q1:** What is a variable?

- [ ] A function that performs calculations
- [x] A container for storing data values
- [ ] A loop that repeats code
- [ ] A conditional statement

**Explanation:** Variables are named containers that store data values in memory. They allow programs to work with data dynamically.
**Difficulty:** easy
**Type:** multiple_choice

**Q2:** Which of the following is a valid variable name?

- [ ] 123variable
- [x] myVariable
- [ ] var
- [ ] my-variable

**Explanation:** Variable names must start with a letter or underscore, and can contain letters, numbers, and underscores. They cannot start with numbers or contain hyphens.
**Difficulty:** easy
**Type:** multiple_choice

**Q3:** True or False: Variables can be reassigned after declaration.

- [x] True
- [ ] False

**Explanation:** In most programming languages, variables declared with `var` or `let` can be reassigned to new values after their initial declaration.
**Difficulty:** medium
**Type:** true_false

#### Test: Variables Quiz

<!-- @test: {"name": "Variables Quiz", "instructions": "Answer all questions carefully. You have 30 minutes to complete this quiz.", "duration_mins": 30, "max_attempts": 2, "format": "quiz", "published": true} -->

**Q1:** What keyword is used to declare a constant variable in JavaScript?

- [ ] var
- [ ] let
- [x] const
- [ ] constant

**Explanation:** The `const` keyword is used to declare constant variables that cannot be reassigned after initialization.
**Marks:** 2
**Order:** 1

**Q2:** Which data type is used to store text?

- [ ] number
- [x] string
- [ ] boolean
- [ ] array

**Explanation:** Strings are used to store text data. They are typically enclosed in quotes.
**Marks:** 1
**Order:** 2

**Q3:** What is the result of: `let x = 5; x = 10; console.log(x);`?

- [ ] 5
- [x] 10
- [ ] undefined
- [ ] null

**Explanation:** The variable x is first assigned 5, then reassigned to 10. The console.log will output 10.
**Marks:** 2
**Order:** 3

### Lesson: Functions

<!-- @lesson: {"order": 2, "description": "Learn about functions and how to create reusable code blocks"} -->

Functions are reusable blocks of code that perform specific tasks. They help organize code and make it more maintainable.

#### Function Syntax

```javascript
function greet(name) {
  return "Hello, " + name;
}
```

#### Practice Questions

<!-- @practice: {"difficulty": "medium"} -->

**Q1:** What is the purpose of the `return` statement in a function?

- [ ] To stop the function execution
- [x] To send a value back to the caller
- [ ] To print output to the console
- [ ] To declare a variable

**Explanation:** The `return` statement sends a value back to the code that called the function, allowing the function to produce a result.
**Difficulty:** medium
**Type:** multiple_choice

**Q2:** True or False: A function must always return a value.

- [ ] True
- [x] False

**Explanation:** Functions can return values, but they don't have to. Functions without a return statement return `undefined`.
**Difficulty:** easy
**Type:** true_false

#### Assignment: Function Implementation

<!-- @test: {"name": "Function Implementation", "instructions": "Implement the following functions according to the specifications. Submit your code in the text area provided.", "deadline": "2024-12-31T23:59:59Z", "format": "assignment", "max_attempts": 1, "published": true} -->

**Q1:** Implement a function named `add` that takes two numbers as parameters and returns their sum.

**Explanation:** Create a function that accepts two numeric parameters and returns the result of adding them together. Example: `add(5, 3)` should return `8`.
**Marks:** 10
**Order:** 1

**Q2:** Implement a function named `isEven` that takes a number as a parameter and returns `true` if the number is even, `false` otherwise.

**Explanation:** An even number is divisible by 2 with no remainder. Use the modulo operator (%) to check if a number is even.
**Marks:** 10
**Order:** 2

**Q3:** Implement a function named `greet` that takes a name as a parameter and returns a greeting string in the format: "Hello, [name]!".

**Explanation:** The function should concatenate the string "Hello, " with the name parameter and an exclamation mark. Example: `greet("Alice")` should return `"Hello, Alice!"`.
**Marks:** 10
**Order:** 3

## Module: Data Structures

<!-- @module: {"order": 2, "description": "Learn about arrays, objects, and other data structures", "published": true} -->

### Lesson: Arrays

<!-- @lesson: {"order": 1, "description": "Understanding arrays and array operations"} -->

Arrays are ordered collections of elements. They allow you to store multiple values in a single variable.

#### Array Basics

```javascript
let fruits = ["apple", "banana", "orange"];
console.log(fruits[0]); // "apple"
```

#### Practice Questions

<!-- @practice: {"difficulty": "medium"} -->

**Q1:** What is the index of the first element in an array?

- [x] 0
- [ ] 1
- [ ] -1
- [ ] undefined

**Explanation:** Arrays in most programming languages use zero-based indexing, meaning the first element is at index 0.
**Difficulty:** easy
**Type:** multiple_choice

**Q2:** Which method adds an element to the end of an array?

- [ ] push()
- [x] push()
- [ ] pop()
- [ ] shift()

**Explanation:** The `push()` method adds one or more elements to the end of an array and returns the new length of the array.
**Difficulty:** medium
**Type:** multiple_choice

#### Test: Arrays Assessment

<!-- @test: {"name": "Arrays Assessment", "instructions": "Complete all questions. This test covers array fundamentals.", "duration_mins": 45, "max_attempts": 1, "format": "quiz", "published": true} -->

**Q1:** What does the `length` property of an array return?

- [ ] The last index
- [x] The number of elements
- [ ] The first element
- [ ] The array itself

**Explanation:** The `length` property returns the number of elements in the array, not the last index.
**Marks:** 2
**Order:** 1

**Q2:** What is the result of: `[1, 2, 3].pop()`?

- [ ] 1
- [ ] [1, 2]
- [x] 3
- [ ] undefined

**Explanation:** The `pop()` method removes and returns the last element of an array. In this case, it returns 3.
**Marks:** 2
**Order:** 2
