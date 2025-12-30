"use client"

import React, { forwardRef, useState } from "react"
import { UniversityIdCard } from "./university-id-card"
import { PrintableIdCard } from "./printable-id-card"

interface StudentIdCardProps {
  firstName: string
  lastName: string
  studentId: string
  faculty: string
  department: string
  programme: string
  endYear: string
  avatar?: string
  frontImage?: string
  backImage?: string
  institutionLogo?: string
  institutionEmail?: string
  institutionName?: string
  institutionAbbreviation?: string
}

// Modern ID Card Component with flip functionality
const ModernIdCard = ({ student, onPrint }: { student: any; onPrint?: () => void }) => {
  return (
    <div className="space-y-4">
      <UniversityIdCard student={student} />
      {onPrint && (
        <div className="text-center">
          <button
            onClick={onPrint}
            className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Print ID Card
          </button>
        </div>
      )}
    </div>
  )
}

// Printable version for react-to-print
const PrintableStudentIdCard = forwardRef<HTMLDivElement, StudentIdCardProps>((props, ref) => {
  const {
    firstName,
    lastName,
    studentId,
    faculty,
    department,
    programme,
    endYear,
    avatar,
    institutionLogo,
    institutionEmail,
    institutionName,
    institutionAbbreviation,
  } = props

  const student = {
    firstName: firstName || "",
    lastName: lastName || "",
    studentId: studentId || "",
    faculty: faculty ? faculty.replace("Faculty of ", "") : "",
    department: department ? department.replace("Department of ", "") : "",
    programme: programme || "",
    validThrough: endYear || new Date().getFullYear().toString(),
    photoUrl: avatar || "",
    institutionLogo: institutionLogo || "",
    institutionEmail: institutionEmail || "",
    institutionName: institutionName || "",
    institutionAbbreviation: institutionAbbreviation || "",
  }

  return (
    <div ref={ref}>
      <PrintableIdCard student={student} />
    </div>
  )
})

PrintableStudentIdCard.displayName = "PrintableStudentIdCard"

// Legacy component wrapper for backward compatibility
const IDCardComponent = (props: any) => {
  const [showModal, setShowModal] = useState(false)
  const { user = {}, student = {} } = props

  const studentData = {
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    studentId: student.reg_no || "",
    faculty: student.programme?.department?.faculty?.name?.replace("Faculty of ", "") || "",
    department: student.programme?.department?.name?.replace("Department of ", "") || "",
    programme: student.programme?.name || student.programme?.prefix || "",
    validThrough: new Date().getFullYear().toString(),
    photoUrl: user.avatar || "",
    institutionLogo: props.institutionLogo || "",
  }

  if (!showModal) {
    return (
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => setShowModal(true)}
      >
        My ID Card
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {user.first_name} {user.last_name}'s ID Card
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <ModernIdCard
          student={studentData}
          onPrint={() => window.print()}
        />
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Export all components
export default IDCardComponent
export { ModernIdCard, PrintableStudentIdCard, PrintableStudentIdCard as ComponentValue }
export type { StudentIdCardProps }