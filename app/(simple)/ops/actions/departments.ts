'use server'

import { revalidatePath } from 'next/cache'
import { createDepartment, createProgramme, createCourse, updateDepartment, deleteDepartment } from '@/lib/data'
import { requireAuth } from '@/lib/server-action-auth'
import { canCreateCourses } from '@/lib/roles'

export async function createDepartmentAction(
  name: string,
  code: string,
  description: string,
  facultyId: number
) {
  try {
    // Authenticate and verify permissions
    const authCheck = await requireAuth({
      requiredRoles: ["SUPERADMIN", "SYSADMIN", "ADMIN"],
      errorMessage: "Insufficient permissions to create departments",
    });

    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const department = await createDepartment(name, code, description, facultyId)
    revalidatePath('/ops')
    return { success: true, data: department }
  } catch (error) {
    console.error('Error in createDepartmentAction:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      name,
      code,
      facultyId,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Failed to create department' }
  }
}

export async function createProgrammeAction(
  name: string,
  description: string,
  departmentId: number,
  years: number = 4,
  prefix?: string,
  regnoFormat?: string
) {
  try {
    // Authenticate and verify permissions
    const authCheck = await requireAuth({
      requiredRoles: ["SUPERADMIN", "SYSADMIN", "ADMIN", "PROGRAMME_COORDINATOR"],
      errorMessage: "Insufficient permissions to create programmes",
    });

    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const programme = await createProgramme(name, description, departmentId, years, prefix, regnoFormat)
    revalidatePath('/ops')
    return { success: true, data: programme }
  } catch (error) {
    console.error('Error in createProgrammeAction:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      name,
      departmentId,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Failed to create programme' }
  }
}

export async function createCourseAction(
  name: string,
  code: string,
  description: string,
  units: number = 3,
  departmentId: number,
  programmes?: number[],
  levelId?: number,
  semesterPosition?: number
) {
  try {
    // Authenticate and verify permissions
    const authCheck = await requireAuth({
      customCheck: (user) => canCreateCourses(user.role),
      errorMessage: "Insufficient permissions to create courses",
    });

    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const course = await createCourse(
      name,
      code,
      description,
      units,
      departmentId,
      programmes,
      levelId,
      semesterPosition
    )
    revalidatePath('/ops')
    return { success: true, data: course }
  } catch (error) {
    console.error('Error in createCourseAction:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      name,
      code,
      departmentId,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Failed to create course' }
  }
}

export async function updateDepartmentAction(
  id: number,
  name: string,
  code: string,
  description: string,
  facultyId: number
) {
  try {
    // Authenticate and verify permissions
    const authCheck = await requireAuth({
      requiredRoles: ["SUPERADMIN", "SYSADMIN", "ADMIN"],
      errorMessage: "Insufficient permissions to update departments",
    });

    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const department = await updateDepartment(id, name, code, description, facultyId)
    revalidatePath('/ops')
    return { success: true, data: department }
  } catch (error) {
    console.error('Error in updateDepartmentAction:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Failed to update department' }
  }
}

export async function deleteDepartmentAction(id: number) {
  try {
    // Authenticate and verify permissions
    const authCheck = await requireAuth({
      requiredRoles: ["SUPERADMIN", "SYSADMIN", "ADMIN"],
      errorMessage: "Insufficient permissions to delete departments",
    });

    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    await deleteDepartment(id)
    revalidatePath('/ops')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteDepartmentAction:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Failed to delete department' }
  }
}