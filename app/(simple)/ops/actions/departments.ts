'use server'

import { revalidatePath } from 'next/cache'
import { createDepartment, createProgramme, createCourse, updateDepartment, deleteDepartment } from '@/lib/data'

export async function createDepartmentAction(
  name: string,
  code: string,
  description: string,
  facultyId: number
) {
  try {
    const department = await createDepartment(name, code, description, facultyId)
    revalidatePath('/ops')
    return { success: true, data: department }
  } catch (error) {
    console.error('Error in createDepartmentAction:', error)
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
    const programme = await createProgramme(name, description, departmentId, years, prefix, regnoFormat)
    revalidatePath('/ops')
    return { success: true, data: programme }
  } catch (error) {
    console.error('Error in createProgrammeAction:', error)
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
    console.error('Error in createCourseAction:', error)
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
    const department = await updateDepartment(id, name, code, description, facultyId)
    revalidatePath('/ops')
    return { success: true, data: department }
  } catch (error) {
    console.error('Error in updateDepartmentAction:', error)
    return { success: false, error: 'Failed to update department' }
  }
}

export async function deleteDepartmentAction(id: number) {
  try {
    await deleteDepartment(id)
    revalidatePath('/ops')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteDepartmentAction:', error)
    return { success: false, error: 'Failed to delete department' }
  }
}