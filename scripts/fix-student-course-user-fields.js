#!/usr/bin/env node

/**
 * Script to fix student_course records with missing created_by and updated_by fields
 * 
 * This script updates all student_course records where created_by or updated_by is NULL
 * by setting them to the corresponding student's user_id.
 * 
 * Usage: node scripts/fix-student-course-user-fields.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixStudentCourseUserFields() {
  try {
    console.log('🔍 Starting fix for student_course user fields...');

    // First, get all student_course records with missing user tracking fields
    const studentCoursesToFix = await prisma.student_course.findMany({
      where: {
        OR: [
          { created_by: null },
          { updated_by: null }
        ]
      },
      include: {
        student: {
          include: {
            user_student_user_idTouser: {
              select: { id: true, first_name: true, last_name: true, email: true, role: true }
            }
          }
        },
        course: {
          select: { code: true, name: true }
        }
      }
    });

    console.log(`📊 Found ${studentCoursesToFix.length} student_course records to fix`);

    if (studentCoursesToFix.length === 0) {
      console.log('✅ No records need fixing. All student_course records have proper user tracking.');
      return;
    }

    let fixedCount = 0;
    let errors = [];

    for (const studentCourse of studentCoursesToFix) {
      try {
        const student = studentCourse.student;
        const user = student?.user_student_user_idTouser;
        
        if (!user) {
          console.warn(`⚠️  Skipping student_course ${studentCourse.id}: No associated user found for student ${student?.id}`);
          errors.push(`No user found for student ${student?.id} in student_course ${studentCourse.id}`);
          continue;
        }

        // Only update students (role === 'STUDENT')
        if (user.role !== 'STUDENT') {
          console.warn(`⚠️  Skipping student_course ${studentCourse.id}: User ${user.email} is not a STUDENT (role: ${user.role})`);
          errors.push(`User ${user.email} is not a STUDENT for student_course ${studentCourse.id}`);
          continue;
        }

        // Update the student_course record
        const updateData = {};
        
        if (!studentCourse.created_by) {
          updateData.created_by = user.id;
        }
        
        if (!studentCourse.updated_by) {
          updateData.updated_by = user.id;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.student_course.update({
            where: { id: studentCourse.id },
            data: updateData
          });

          console.log(`✅ Fixed student_course ${studentCourse.id} for student ${user.first_name} ${user.last_name} (${user.email}) - Course: ${studentCourse.course?.code || 'Unknown'}`);
          fixedCount++;
        }

      } catch (error) {
        console.error(`❌ Error fixing student_course ${studentCourse.id}:`, error.message);
        errors.push(`Error fixing student_course ${studentCourse.id}: ${error.message}`);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Successfully fixed: ${fixedCount} records`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    console.log('\n🎉 Student course user fields fix completed!');

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixStudentCourseUserFields();