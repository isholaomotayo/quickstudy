# Student Profile Management & Registration Number Improvements

## Overview

This document outlines the enhancements made to the user management system in the ops module, specifically focusing on student profile management and registration number generation.

## Key Improvements

### 1. Enhanced Registration Number Generation

**Previous Issue**: Used timestamp-based approach (`STU${Date.now()}`) which wasn't academically meaningful.

**New Implementation**:

- **Format**: `{INSTITUTION_CODE}/{YEAR}/{SEQUENCE}`
  - Example: `UNI/24/0001`, `MIT/24/0002`
- **Smart Generation**: Based on institution code, admission year, and sequential numbering
- **Fallback**: If generation fails, falls back to timestamp approach
- **Duplicate Prevention**: Checks for existing registration numbers before assignment

### 2. Student Profile Management Modal

**New Feature**: Comprehensive student profile management interface

**Capabilities**:

- **Basic Information**: Registration number, title, gender, date of birth
- **Academic Details**: Programme, session, semester, entry level information
- **Personal Information**: Marital status, employment status, address
- **Account Settings**: Student status, admission status toggles
- **Registration Number Management**:
  - Manual editing of registration numbers
  - One-click generation of new registration numbers
  - Validation to prevent duplicates

### 3. Enhanced User Management Table

**Improvements**:

- Added "Reg No./Staff No." column to display registration/staff numbers
- Visual distinction between student registration numbers (blue) and staff numbers (green)
- Clear indication when numbers are missing

### 4. Improved User Details View

**Enhanced ViewUserModal**:

- Prominent display of registration numbers in colored cards
- Detailed student information including status badges
- Academic information display (session, semester, level)
- Personal information display (marital status, employment, address)

## Technical Implementation

### New Components

1. **StudentProfileModal.tsx**: Comprehensive student profile management
2. **API Routes**:
   - `/api/students/profile` (PATCH): Update student profile
   - `/api/students/generate-reg-no` (POST): Generate new registration numbers

### Enhanced Functions

1. **generateRegistrationNumber()**: Smart registration number generation
2. **generateStaffNumber()**: Improved staff number generation
3. **updateStudentProfile()**: Comprehensive student data updates
4. **generateNewRegistrationNumber()**: On-demand registration number generation

### Database Integration

- Enhanced `getUsersData()` to include student and staff numbers in API responses
- Proper Prisma relations for student and staff data
- Validation to prevent duplicate registration numbers

## Usage Instructions

### For Administrators

1. **Access Student Management**:

   - Go to Ops → Users tab
   - Find a student user in the table
   - Click the actions menu (⋮) → "Manage Student"

2. **Update Student Profile**:

   - Edit registration number manually or generate new one
   - Update personal and academic information
   - Toggle student status and admission status
   - Save changes

3. **Generate Registration Numbers**:
   - In the student profile modal, click the refresh button next to registration number
   - System automatically generates format: `{INSTITUTION}/{YEAR}/{SEQUENCE}`

### Features Available

- **Search & Filter**: Find students by registration number in the users table
- **Batch Operations**: Registration numbers visible in main table for quick reference
- **Status Management**: Clear visual indicators for student status
- **Audit Trail**: All changes are logged with timestamps

## Benefits

1. **Professional Registration Numbers**: Academically meaningful format
2. **Complete Student Management**: Comprehensive profile management in one place
3. **Better Data Organization**: Clear display of registration numbers in user listings
4. **Improved User Experience**: Intuitive interface with proper validation
5. **Data Integrity**: Prevents duplicate registration numbers and validates inputs

## Next Steps

Consider implementing:

- Bulk registration number generation for existing students
- Integration with admission system for automatic profile creation
- Advanced search and filtering by registration number patterns
- Reporting features for student statistics and demographics
