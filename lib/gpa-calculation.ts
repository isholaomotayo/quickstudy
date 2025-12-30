import { prisma } from '@/lib/db';

/**
 * Calculate and update GPA for a student
 * This is the full port of backend/controllers/studentGpaController.js calculateAndUpdateGPA
 */
export async function calculateAndUpdateGPA(studentId: bigint, userId?: bigint) {
  try {
    console.log(`Starting GPA calculation for student ID: ${studentId}`);

    // Get all approved and published results for the student
    const studentResults = await prisma.student_result.findMany({
      where: {
        approved: true,
        publish: true,
        student_course: {
          student_id: studentId,
        },
      },
      include: {
        grade: true,
        student_course: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                units: true,
              },
            },
            semester: {
              select: {
                id: true,
                name: true,
                position: true,
              },
            },
            level: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(
      `Found ${studentResults.length} approved/published results for student ${studentId}`
    );

    if (!studentResults || studentResults.length === 0) {
      console.log(
        `No approved/published results found for student ${studentId}`
      );
      return {
        studentId: studentId.toString(),
        message: 'No approved results found',
        cgpa: 0,
        totalCourses: 0,
        success: false,
      };
    }

    // Group results by semester and level for GPA calculation
    const resultsBySemester: Record<number, {
      semesterName: string;
      totalPoints: number;
      totalUnits: number;
      results: typeof studentResults;
    }> = {};
    
    const resultsByLevel: Record<number, {
      levelName: string;
      totalPoints: number;
      totalUnits: number;
      results: typeof studentResults;
    }> = {};
    
    let totalPoints = 0;
    let totalUnits = 0;

    for (const result of studentResults) {
      const course = result.student_course?.course;
      const semester = result.student_course?.semester;
      const level = result.student_course?.level;
      const grade = result.grade;

      if (!course || !semester || !level || !grade) {
        console.warn('Missing required data for result:', result.id);
        continue;
      }

      const courseUnits = course.units || 0;
      const gradePoint = grade.point ? Number(grade.point) : 0;

      const semesterId = semester.id;
      const levelId = level.id;

      console.log(
        `Processing course: ${course.name}, Units: ${courseUnits}, Grade: ${grade.name}, Points: ${gradePoint}`
      );

      // If grade point is still 0, log warning but continue
      if (gradePoint === 0) {
        console.warn(
          `Grade point is 0 for grade ${grade.name} (ID: ${grade.id}). Please check grade configuration.`
        );
      }

      // Calculate points for this course
      const coursePoints = courseUnits * gradePoint;

      // Semester GPA calculation
      if (!resultsBySemester[semesterId]) {
        resultsBySemester[semesterId] = {
          semesterName: semester.name,
          totalPoints: 0,
          totalUnits: 0,
          results: [],
        };
      }
      resultsBySemester[semesterId].totalPoints += coursePoints;
      resultsBySemester[semesterId].totalUnits += courseUnits;
      resultsBySemester[semesterId].results.push(result);

      // Level GPA calculation
      if (!resultsByLevel[levelId]) {
        resultsByLevel[levelId] = {
          levelName: level.name,
          totalPoints: 0,
          totalUnits: 0,
          results: [],
        };
      }
      resultsByLevel[levelId].totalPoints += coursePoints;
      resultsByLevel[levelId].totalUnits += courseUnits;
      resultsByLevel[levelId].results.push(result);

      // Overall CGPA calculation
      totalPoints += coursePoints;
      totalUnits += courseUnits;
    }

    console.log(
      `Total calculation: ${totalPoints} points / ${totalUnits} units`
    );

    // Calculate semester GPAs
    const semesterGPAs: Record<string, any> = {};
    for (const [semesterId, data] of Object.entries(resultsBySemester)) {
      const gpa =
        data.totalUnits > 0
          ? parseFloat((data.totalPoints / data.totalUnits).toFixed(2))
          : 0;
      semesterGPAs[semesterId] = {
        semesterName: data.semesterName,
        gpa,
        totalPoints: data.totalPoints,
        totalUnits: data.totalUnits,
        coursesCount: data.results.length,
      };
    }

    // Calculate level GPAs
    const levelGPAs: Record<string, any> = {};
    for (const [levelId, data] of Object.entries(resultsByLevel)) {
      const gpa =
        data.totalUnits > 0
          ? parseFloat((data.totalPoints / data.totalUnits).toFixed(2))
          : 0;
      levelGPAs[levelId] = {
        levelName: data.levelName,
        gpa,
        totalPoints: data.totalPoints,
        totalUnits: data.totalUnits,
        coursesCount: data.results.length,
      };
    }

    // Calculate overall CGPA
    const cgpa =
      totalUnits > 0 ? parseFloat((totalPoints / totalUnits).toFixed(2)) : 0;

    console.log(`Calculated CGPA: ${cgpa} for student ${studentId}`);

    // Use semester and level from the first result's student course
    const firstResult = studentResults[0];
    const semesterId = firstResult.student_course?.semester?.id;
    const levelId = firstResult.student_course?.level?.id;

    if (!semesterId || !levelId) {
      throw new Error('Missing semester or level information in student results');
    }

    console.log(
      `Using semester_id: ${semesterId}, level_id: ${levelId} from student course relationship`
    );

    // Get previous GPA record for cumulative calculation
    const previousGpa = await prisma.student_gpa.findFirst({
      where: {
        student_id: studentId,
        level_id: levelId,
        semester_id: {
          lt: semesterId,
        },
      },
      orderBy: {
        semester_id: 'desc',
      },
    });

    const prevTnu = previousGpa?.cumulative_tnu ? Number(previousGpa.cumulative_tnu) : 0;
    const prevTcp = previousGpa?.cumulative_tcp ? Number(previousGpa.cumulative_tcp) : 0;
    const prevGpa = previousGpa?.cumulative_gpa ? Number(previousGpa.cumulative_gpa) : 0;

    const cumulativeTnu = prevTnu + totalUnits;
    const cumulativeTcp = prevTcp + totalPoints;
    const cumulativeGpa = parseFloat((cumulativeTcp / cumulativeTnu).toFixed(2));

    // Get class degrees from database to determine the correct class_degree_id based on cumulative GPA
    const classDegrees = await prisma.class_degree.findMany();
    let finalClassDegreeId: number | null = null;
    let classDegreeInfo: any = null;

    for (const degree of classDegrees) {
      const minPoint = degree.min_point ? Number(degree.min_point) : 0;
      const maxPoint = degree.max_point ? Number(degree.max_point) : 0;
      const cgpaValue = cumulativeGpa; // Use cumulative GPA for class degree determination

      if (cgpaValue >= minPoint && cgpaValue <= maxPoint) {
        finalClassDegreeId = degree.id;
        classDegreeInfo = {
          id: degree.id,
          name: degree.name,
          code: degree.code,
          minPoint,
          maxPoint,
        };
        console.log(
          `CGPA ${cgpaValue} falls in range ${minPoint}-${maxPoint}: ${degree.name} (ID: ${finalClassDegreeId})`
        );
        break;
      }
    }

    if (!finalClassDegreeId) {
      console.warn(
        `No class degree found for CGPA ${cumulativeGpa}. Using default (Fail)`
      );
      // Default to Fail if no match found (ID 12 based on backend data)
      finalClassDegreeId = 12;
    }

    // Store GPA data in student_gpa table
    try {
      // Look for existing GPA record for this student, semester, and level
      const existingGPA = await prisma.student_gpa.findFirst({
        where: {
          student_id: studentId,
          level_id: levelId,
          semester_id: semesterId,
        },
      });

      let gpaData: any;
      if (existingGPA) {
        gpaData = {
          student_id: studentId,
          level_id: levelId,
          semester_id: semesterId,
          prev_tnu: prevTnu,
          prev_tcp: prevTcp,
          prev_gpa: prevGpa,
          current_tnu: totalUnits,
          current_tcp: totalPoints,
          current_gpa: cgpa,
          cumulative_tnu: cumulativeTnu,
          cumulative_tcp: cumulativeTcp,
          cumulative_gpa: cumulativeGpa,
          class_degree_id: finalClassDegreeId,
          updated_by: userId || null,
          updated_at: new Date(),
        };
      } else {
        gpaData = {
          student_id: studentId,
          level_id: levelId,
          semester_id: semesterId,
          prev_tnu: prevTnu,
          prev_tcp: prevTcp,
          prev_gpa: prevGpa,
          current_tnu: totalUnits,
          current_tcp: totalPoints,
          current_gpa: cgpa,
          cumulative_tnu: cumulativeTnu,
          cumulative_tcp: cumulativeTcp,
          cumulative_gpa: cumulativeGpa,
          class_degree_id: finalClassDegreeId,
          created_by: userId || null,
          updated_by: userId || null,
        };
      }

      let studentGPARecord;
      if (existingGPA) {
        // Update existing record
        studentGPARecord = await prisma.student_gpa.update({
          where: { id: existingGPA.id },
          data: gpaData,
        });
        console.log(
          `Updated existing GPA record for student ${studentId} with class degree ${finalClassDegreeId} (${classDegreeInfo?.name})`
        );
      } else {
        // Create new record
        studentGPARecord = await prisma.student_gpa.create({
          data: gpaData,
        });
        console.log(
          `Created new GPA record for student ${studentId} with class degree ${finalClassDegreeId} (${classDegreeInfo?.name})`
        );
      }

      const gpaResult = {
        studentId: studentId.toString(),
        cgpa: cumulativeGpa, // Use cumulative GPA for final result
        currentGpa: cgpa,
        totalPoints,
        totalUnits,
        cumulativePoints: cumulativeTcp,
        cumulativeUnits: cumulativeTnu,
        totalCourses: studentResults.length,
        semesterGPAs,
        levelGPAs,
        classDegreeId: finalClassDegreeId,
        classDegreeInfo,
        calculatedAt: new Date(),
        success: true,
        databaseUpdated: true,
        gpaRecordId: studentGPARecord.id.toString(),
      };

      console.log(`GPA calculation completed for student ${studentId}:`, {
        cgpa: gpaResult.cgpa,
        totalCourses: gpaResult.totalCourses,
        totalUnits: gpaResult.totalUnits,
        classDegreeId: gpaResult.classDegreeId,
        classDegree: gpaResult.classDegreeInfo?.name,
        semestersCount: Object.keys(semesterGPAs).length,
        levelsCount: Object.keys(levelGPAs).length,
        databaseUpdated: gpaResult.databaseUpdated,
      });

      return gpaResult;
    } catch (gpaError) {
      console.error(
        `Error saving GPA data for student ${studentId}:`,
        gpaError
      );

      // Return calculation results even if database save fails
      return {
        studentId: studentId.toString(),
        cgpa: cumulativeGpa,
        currentGpa: cgpa,
        totalPoints,
        totalUnits,
        cumulativePoints: cumulativeTcp,
        cumulativeUnits: cumulativeTnu,
        totalCourses: studentResults.length,
        semesterGPAs,
        levelGPAs,
        classDegreeId: finalClassDegreeId,
        classDegreeInfo,
        calculatedAt: new Date(),
        success: true,
        databaseUpdated: false,
        error: gpaError instanceof Error ? gpaError.message : 'Unknown error',
      };
    }
  } catch (error) {
    console.error(`Error calculating GPA for student ${studentId}:`, error);
    throw error;
  }
}

/**
 * Calculate GPA for a specific student, semester, and level combination
 * This properly handles cumulative GPA by looking at previous semesters
 * Port of backend/controllers/studentGpaController.js calculateStudentGpa
 */
export async function calculateStudentGpa(
  studentId: bigint,
  semesterId: number,
  levelId: number,
  userId?: bigint
) {
  try {
    console.log(
      `Calculating GPA for student ${studentId}, semester ${semesterId}, level ${levelId}`
    );

    // Fetch student courses with results for this semester and level
    const studentCourses = await prisma.student_course.findMany({
      where: {
        student_id: studentId,
        semester_id: semesterId,
        level_id: levelId,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            units: true,
          },
        },
        student_result: {
          where: {
            approved: true,
            publish: true,
          },
          include: {
            grade: {
              select: {
                id: true,
                name: true,
                point: true,
              },
            },
          },
        },
      },
    });

    console.log(
      `Fetched ${studentCourses.length} studentCourse records`
    );

    // Filter courses that have results
    const coursesWithResults = studentCourses.filter(
      (course) => course.student_result && course.student_result.length > 0
    );
    console.log(`Courses with results: ${coursesWithResults.length}`);

    // Compute semester totals
    let totalUnits = 0;
    let totalCreditPoints = 0;

    coursesWithResults.forEach((courseReg) => {
      const result = courseReg.student_result[0]; // Get first result
      const units = courseReg.course?.units || 0;
      const gradePoint = result.grade?.point ? Number(result.grade.point) : 0;
      totalUnits += units;
      totalCreditPoints += units * gradePoint;
    });

    console.log(
      `TotalUnits: ${totalUnits}, TotalCreditPoints: ${totalCreditPoints}`
    );

    if (totalUnits === 0) {
      return {
        message: 'Total units is zero; cannot compute GPA.',
        success: false,
      };
    }

    const currentGpa = parseFloat((totalCreditPoints / totalUnits).toFixed(2));

    // Get last prior GPA record for cumulative calculation
    const previousGpa = await prisma.student_gpa.findFirst({
      where: {
        student_id: studentId,
        level_id: levelId,
        semester_id: {
          lt: semesterId,
        },
      },
      orderBy: {
        semester_id: 'desc',
      },
    });

    const prevTnu = previousGpa?.cumulative_tnu ? Number(previousGpa.cumulative_tnu) : 0;
    const prevTcp = previousGpa?.cumulative_tcp ? Number(previousGpa.cumulative_tcp) : 0;
    const prevGpa = previousGpa?.cumulative_gpa ? Number(previousGpa.cumulative_gpa) : 0;

    const cumulativeTnu = prevTnu + totalUnits;
    const cumulativeTcp = prevTcp + totalCreditPoints;
    const cumulativeGpa = parseFloat((cumulativeTcp / cumulativeTnu).toFixed(2));

    // Determine class degree based on cumulative GPA
    let classdegree_id: number | null = null;
    const classDegrees = await prisma.class_degree.findMany();

    for (const degree of classDegrees) {
      const minGpa = degree.min_point ? Number(degree.min_point) : 0;
      const maxGpa = degree.max_point ? Number(degree.max_point) : 5;
      if (cumulativeGpa >= minGpa && cumulativeGpa <= maxGpa) {
        classdegree_id = degree.id;
        break;
      }
    }

    // Prepare upsert data
    const gpaData: any = {
      student_id: studentId,
      semester_id: semesterId,
      level_id: levelId,
      class_degree_id: classdegree_id,
      prev_tnu: prevTnu,
      prev_tcp: prevTcp,
      prev_gpa: prevGpa,
      current_tnu: totalUnits,
      current_tcp: totalCreditPoints,
      current_gpa: currentGpa,
      cumulative_tnu: cumulativeTnu,
      cumulative_tcp: cumulativeTcp,
      cumulative_gpa: cumulativeGpa,
      updated_by: userId || null,
      updated_at: new Date(),
    };

    if (userId) {
      gpaData.created_by = userId;
    }

    console.log('Upserting GPA record with data:', gpaData);

    // Upsert the GPA record
    const existing = await prisma.student_gpa.findFirst({
      where: {
        student_id: studentId,
        semester_id: semesterId,
        level_id: levelId,
      },
    });

    const studentGpa = existing
      ? await prisma.student_gpa.update({
          where: { id: existing.id },
          data: gpaData,
        })
      : await prisma.student_gpa.create({
          data: gpaData,
        });

    return {
      success: true,
      studentGpa,
      currentGpa,
      cumulativeGpa,
      totalUnits,
      totalCreditPoints,
    };
  } catch (error) {
    console.error('Error in calculateStudentGpa:', error);
    throw error;
  }
}

