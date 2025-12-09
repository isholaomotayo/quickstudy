import { prisma } from "../lib/db";

export interface StudentProfile {
  id: bigint;
  user_id: bigint;
  programme_id: number | null;
  status: boolean;
  admitted: boolean;
  
  // Personal details from student table
  title?: string | null;
  gender?: string | null;
  dob?: Date | null;
  nationality_id?: number | null;
  address?: string | null;
  marital_status?: string | null;
  employment_status?: string | null;
  
  // Location data
  state_origin?: string | null;
  lga_origin?: string | null;
  state_residence?: string | null;
  lga_residence?: string | null;
  
  // Academic background
  grad_year?: string | null;
  degree_grade?: string | null;
  type_degree?: string | null;
  course_studied?: string | null;
  inst_type?: string | null;
  inst_name?: string | null;
  
  // References
  ref_fname?: string | null;
  ref_lname?: string | null;
  ref_phone?: string | null;
  ref_address?: string | null;
  
  // Documents
  id_card?: string | null;
  inst_cert?: string[] | null;
  
  programme?: {
    id: number;
    name: string;
    prefix?: string | null;
  } | null;
  user?: {
    id: bigint;
    first_name: string;
    last_name: string;
    other_name?: string | null;
    email: string;
    phone?: string | null;
    avatar?: string | null;
  } | null;
}

export interface StudentContext {
  userId: bigint;
  activeStudentId: bigint;
  allStudentProfiles: StudentProfile[];
}

/**
 * Get all student profiles for a user
 */
export const getUserStudentProfiles = async (userId: bigint): Promise<StudentProfile[]> => {
  const students = await prisma.student.findMany({
    where: {
      user_id: userId,
      is_deleted: false,
    },
    select: {
      id: true,
      user_id: true,
      programme_id: true,
      status: true,
      admitted: true,
      
      // Personal details that exist
      title: true,
      gender: true,
      dob: true,
      nationality_id: true,
      address: true,
      marital_status: true,
      employment_status: true,
      
      // Location data that exists
      state_origin: true,
      lga_origin: true,
      state_residence: true,
      lga_residence: true,
      
      // Academic background that exists
      grad_year: true,
      degree_grade: true,
      type_degree: true,
      course_studied: true,
      inst_type: true,
      inst_name: true,
      
      // References that exist
      ref_fname: true,
      ref_lname: true,
      ref_phone: true,
      ref_address: true,
      
      // Documents that exist
      id_card: true,
      inst_cert: true,
      
      programme: {
        select: {
          id: true,
          name: true,
          prefix: true,
        }
      },
      user_student_user_idTouser: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          other_name: true,
          email: true,
          phone: true,
          avatar: true,
        }
      }
    },
    orderBy: [
      { status: 'desc' },
      { created_at: 'asc' }
    ]
  });

  return students.map(student => ({
    id: student.id,
    user_id: student.user_id!,
    programme_id: student.programme_id,
    status: student.status,
    admitted: student.admitted,
    
    // Personal details
    title: student.title,
    gender: student.gender,
    dob: student.dob,
    nationality_id: student.nationality_id,
    address: student.address,
    marital_status: student.marital_status,
    employment_status: student.employment_status,
    
    // Location data
    state_origin: student.state_origin,
    lga_origin: student.lga_origin,
    state_residence: student.state_residence,
    lga_residence: student.lga_residence,
    
    // Academic background
    grad_year: student.grad_year,
    degree_grade: student.degree_grade,
    type_degree: student.type_degree,
    course_studied: student.course_studied,
    inst_type: student.inst_type,
    inst_name: student.inst_name,
    
    // References
    ref_fname: student.ref_fname,
    ref_lname: student.ref_lname,
    ref_phone: student.ref_phone,
    ref_address: student.ref_address,
    
    // Documents
    id_card: student.id_card,
    inst_cert: student.inst_cert,
    
    programme: student.programme,
    user: student.user_student_user_idTouser,
  }));
};

/**
 * Get the active student ID for a user
 */
export const getActiveStudentId = async (userId: bigint): Promise<bigint | null> => {
  const userStudents = await getUserStudentProfiles(userId);
  
  if (userStudents.length === 0) {
    return null;
  }

  // Return active student or first student
  const activeStudent = userStudents.find(s => s.status) || userStudents[0];
  return activeStudent.id;
};

/**
 * Set active student profile for a user
 */
export const setActiveStudentProfile = async (userId: bigint, studentId: bigint): Promise<boolean> => {
  try {
    const userStudents = await getUserStudentProfiles(userId);
    
    // Verify student belongs to user
    const targetStudent = userStudents.find(s => s.id === studentId);
    if (!targetStudent) {
      return false;
    }

    // Set all user's students to inactive
    await prisma.student.updateMany({
      where: {
        user_id: userId,
        is_deleted: false,
      },
      data: {
        status: false,
      }
    });

    // Set target student as active
    await prisma.student.update({
      where: {
        id: studentId,
      },
      data: {
        status: true,
      }
    });

    return true;
  } catch (error) {
    console.error('Error setting active student profile:', error);
    return false;
  }
};

/**
 * Resolve student context - core helper that all APIs should use
 */
export const resolveStudentContext = async (
  userId: bigint, 
  requestedStudentId?: bigint
): Promise<StudentProfile | null> => {
  const userStudents = await getUserStudentProfiles(userId);
  
  if (userStudents.length === 0) {
    return null;
  }

  if (requestedStudentId) {
    // Verify requested student belongs to user
    const student = userStudents.find(s => s.id === requestedStudentId);
    if (!student) {
      throw new Error('Student not found or access denied');
    }
    return student;
  }
  
  // Return active student or first student
  return userStudents.find(s => s.status) || userStudents[0];
};

/**
 * Get student by user ID (backward compatibility helper)
 */
export const getStudentByUserIdWithContext = async (userId: bigint): Promise<StudentProfile | null> => {
  return await resolveStudentContext(userId);
};

/**
 * Check if user can apply for additional programs
 */
export const canApplyForAdditionalProgram = async (userId: bigint): Promise<boolean> => {
  const userStudents = await getUserStudentProfiles(userId);
  
  // User can apply for additional programs if they have at least one admitted student
  return userStudents.some(student => student.admitted && student.status);
};

/**
 * Create new student profile for additional program application
 * Copies data from existing student record to ensure complete application
 */
export const createAdditionalProgramApplication = async (
  userId: bigint, 
  programmeId: number
): Promise<StudentProfile | null> => {
  try {
    // Check if user already has application/enrollment for this program
    const existingStudent = await prisma.student.findFirst({
      where: {
        user_id: userId,
        programme_id: programmeId,
        is_deleted: false,
      }
    });

    if (existingStudent) {
      throw new Error('User already has an application/enrollment for this program');
    }

    // Get user data for new student record
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get the user's primary/active student record to copy data from
    const primaryStudent = await prisma.student.findFirst({
      where: {
        user_id: userId,
        is_deleted: false,
      },
      orderBy: [
        { status: 'desc' }, // Active student first
        { created_at: 'asc' }  // Then oldest (likely original application)
      ]
    });

    if (!primaryStudent) {
      throw new Error('No existing student record found to copy data from');
    }

    // Create new student record for additional program, copying relevant data from primary student
    const newStudent = await prisma.student.create({
      data: {
        user_id: userId,
        programme_id: programmeId,
        application_type: 'ADDITIONAL', // Always ADDITIONAL for this flow
        status: false, // Pending application
        admitted: false,
        is_active: false, // Not active until approved
        created_at: new Date(),
        updated_at: new Date(),
        
        // Copy personal details from primary student
        title: primaryStudent.title,
        gender: primaryStudent.gender,
        dob: primaryStudent.dob,
        nationality_id: primaryStudent.nationality_id,
        address: primaryStudent.address,
        marital_status: primaryStudent.marital_status,
        employment_status: primaryStudent.employment_status,
        
        // Copy location data
        state_origin: primaryStudent.state_origin,
        lga_origin: primaryStudent.lga_origin,
        state_residence: primaryStudent.state_residence,
        lga_residence: primaryStudent.lga_residence,
        
        // Copy academic background
        grad_year: primaryStudent.grad_year,
        degree_grade: primaryStudent.degree_grade,
        type_degree: primaryStudent.type_degree,
        course_studied: primaryStudent.course_studied,
        inst_type: primaryStudent.inst_type,
        inst_name: primaryStudent.inst_name,
        
        // Copy references
        ref_fname: primaryStudent.ref_fname,
        ref_lname: primaryStudent.ref_lname,
        ref_phone: primaryStudent.ref_phone,
        ref_address: primaryStudent.ref_address,
        
        // Copy documents (these can be reused or updated)
        id_card: primaryStudent.id_card,
        inst_cert: primaryStudent.inst_cert,
      },
      include: {
        programme: {
          select: {
            id: true,
            name: true,
            prefix: true,
          }
        },
        user_student_user_idTouser: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            other_name: true,
            email: true,
            phone: true,
            avatar: true,
          }
        }
      }
    });

    return {
      id: newStudent.id,
      user_id: newStudent.user_id!,
      programme_id: newStudent.programme_id,
      status: newStudent.status,
      admitted: newStudent.admitted,
      
      // Personal details
      title: newStudent.title,
      gender: newStudent.gender,
      dob: newStudent.dob,
      nationality_id: newStudent.nationality_id,
      address: newStudent.address,
      marital_status: newStudent.marital_status,
      employment_status: newStudent.employment_status,
      
      // Location data
      state_origin: newStudent.state_origin,
      lga_origin: newStudent.lga_origin,
      state_residence: newStudent.state_residence,
      lga_residence: newStudent.lga_residence,
      
      // Academic background
      grad_year: newStudent.grad_year,
      degree_grade: newStudent.degree_grade,
      type_degree: newStudent.type_degree,
      course_studied: newStudent.course_studied,
      inst_type: newStudent.inst_type,
      inst_name: newStudent.inst_name,
      
      // References
      ref_fname: newStudent.ref_fname,
      ref_lname: newStudent.ref_lname,
      ref_phone: newStudent.ref_phone,
      ref_address: newStudent.ref_address,
      
      // Documents
      id_card: newStudent.id_card,
      inst_cert: newStudent.inst_cert,
      
      programme: null, // Will be populated when fetched separately
      user: null, // Will be populated when fetched separately
    };
  } catch (error) {
    console.error('Error creating additional program application:', error);
    return null;
  }
};