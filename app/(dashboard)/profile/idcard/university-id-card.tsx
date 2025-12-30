"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Hash, FileText, Shield, Phone, Mail } from "lucide-react"
import { useState } from "react"

interface StudentData {
  firstName: string
  lastName: string
  studentId: string
  faculty: string
  department: string
  programme: string
  class?: string
  validThrough: string
  photoUrl?: string
  institutionLogo?: string
  institutionEmail?: string
  institutionName?: string
  institutionAbbreviation?: string
}

interface UniversityIdCardProps {
  student: StudentData
  showBack?: boolean
}

export function UniversityIdCard({ student, showBack = false }: UniversityIdCardProps) {
  const [isFlipped, setIsFlipped] = useState(showBack)

  if (isFlipped) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white border-2 border-gray-200 shadow-lg overflow-hidden">
        {/* Header Section - Back */}
        <div className="bg-green-700 text-white px-6 py-3">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-sm font-bold tracking-wide">STUDENT IDENTIFICATION CARD</h2>
              <p className="text-xs opacity-90">BACK</p>
            </div>
          </div>
        </div>

        {/* Main Content - Back */}
        <div className="p-6 space-y-6">
          {/* Terms and Conditions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-green-700" />
              <h3 className="font-semibold text-sm text-gray-900">TERMS AND CONDITIONS</h3>
            </div>
            <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>• This card remains the property of {student.institutionName || "the Institution"}</p>
              <p>• Must be carried at all times while on university premises</p>
              <p>• Report loss or damage immediately to {student.institutionAbbreviation || student.institutionName || "the Institution"}</p>
              <p>• Unauthorized use, alteration, or duplication is strictly prohibited</p>
              <p>• Valid only for the academic session indicated</p>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-green-700" />
              <h3 className="font-semibold text-sm text-gray-900">EMERGENCY CONTACT</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600">+234 (0) 42 771 940</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600">{student.institutionEmail || "support.cdel@unn.edu.ng"}</span>
              </div>
            </div>
          </div>

          {/* Authorized Signatory Section */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-sm text-gray-900 text-center">AUTHORIZED SIGNATORY</h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Student Signature */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student Signature</label>
                <div className="h-12 border-b-2 border-dashed border-gray-300"></div>
                <p className="text-xs text-gray-500 text-center">Student</p>
              </div>

              {/* Official Signature */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Official Signature</label>
                <div className="h-12 border-b-2 border-dashed border-gray-300"></div>
                <p className="text-xs text-gray-500 text-center">Registrar, CDeL</p>
              </div>
            </div>

            {/* Official Stamp Area */}
            <div className="mt-6 text-center">
              <div className="inline-block">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                  Official Stamp
                </label>
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">{student.institutionAbbreviation || student.institutionName || "Institution"}</p>
            <p className="text-xs text-gray-500 mt-1">{student.institutionName || "Institution"} | Issued: {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Flip Button */}
        <div className="px-6 pb-4">
          <button
            onClick={() => setIsFlipped(false)}
            className="w-full py-2 text-xs text-green-700 hover:text-green-600 transition-colors"
          >
            ← View Front Side
          </button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white border-2 border-gray-200 shadow-lg overflow-hidden relative">
      {/* Beautiful Static Background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
          <defs>
            {/* Enhanced gradient for screen viewing */}
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0f9ff" />
              <stop offset="25%" stopColor="#dbeafe" />
              <stop offset="75%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#f3e8ff" />
            </linearGradient>
            
            {/* Visible dot pattern */}
            <pattern id="dotsPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.2" fill="#3b82f6" fillOpacity="0.12"/>
            </pattern>
            
            {/* Grid lines */}
            <pattern id="gridPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M30 0 L0 0 0 30" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.08"/>
            </pattern>
            
            {/* Hexagonal accent pattern */}
            <pattern id="hexPattern" x="0" y="0" width="40" height="35" patternUnits="userSpaceOnUse">
              <polygon points="20,5 30,12 30,23 20,30 10,23 10,12" 
                       fill="none" stroke="#8b5cf6" strokeWidth="0.8" strokeOpacity="0.06"/>
            </pattern>
          </defs>
          
          {/* Base gradient */}
          <rect width="100%" height="100%" fill="url(#bgGradient)"/>
          
          {/* Layered patterns */}
          <rect width="100%" height="100%" fill="url(#gridPattern)"/>
          <rect width="100%" height="100%" fill="url(#dotsPattern)"/>
          <rect width="100%" height="100%" fill="url(#hexPattern)"/>
          
          {/* Enhanced decorative elements */}
          <g opacity="0.15">
            <circle cx="70" cy="60" r="18" fill="none" stroke="#3b82f6" strokeWidth="2"/>
            <circle cx="330" cy="190" r="22" fill="none" stroke="#8b5cf6" strokeWidth="2"/>
            <rect x="310" y="50" width="28" height="28" fill="none" stroke="#10b981" strokeWidth="1.8" rx="6"/>
            <rect x="50" y="180" width="32" height="32" fill="none" stroke="#f59e0b" strokeWidth="1.8" rx="8"/>
          </g>
          
          {/* Flowing accent waves */}
          <path d="M0 70 Q100 50 200 70 T400 70 L400 85 Q300 105 200 85 T0 85 Z" 
                fill="#3b82f6" fillOpacity="0.06"/>
          <path d="M0 165 Q100 145 200 165 T400 165 L400 180 Q300 200 200 180 T0 180 Z" 
                fill="#8b5cf6" fillOpacity="0.06"/>
                
          {/* Corner flourishes */}
          <g opacity="0.08">
            <path d="M0 0 Q20 0 20 20 Q0 20 0 40" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
            <path d="M400 0 Q380 0 380 20 Q400 20 400 40" fill="none" stroke="#8b5cf6" strokeWidth="1.5"/>
            <path d="M0 250 Q20 250 20 230 Q0 230 0 210" fill="none" stroke="#10b981" strokeWidth="1.5"/>
            <path d="M400 250 Q380 250 380 230 Q400 230 400 210" fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
          </g>
        </svg>
      </div>

      {/* Header Section */}
      <div className="bg-green-700/85 text-white px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg border-2 border-white/20">
              <img
                src={student.institutionLogo || "https://www.cdel.unn.edu.ng/images/InstitutionLogo.png"}
                alt="Institution Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">{student.institutionName?.toUpperCase() || "INSTITUTION NAME"}</h1>
              <p className="text-sm opacity-90 font-medium">{student.institutionAbbreviation?.toUpperCase() || "INSTITUTION"}</p>
            </div>
          </div>
          <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {student.institutionAbbreviation?.substring(0, 4).toUpperCase() || "INST"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 relative z-10 bg-white/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo Section */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-40 bg-gray-100 border-2 border-yellow-500 rounded-lg overflow-hidden mb-3">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl || "/placeholder.svg"}
                  alt="Student Photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <Badge className="text-xs bg-yellow-500 text-white">
              <Calendar className="w-3 h-3 mr-1" />
              Valid Through {student.validThrough}
            </Badge>
          </div>

          {/* Student Information */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Hash className="w-4 h-4" />
                <span className="font-mono text-sm">{student.studentId}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Faculty</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{student.faculty}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{student.department}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Programme</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{student.programme}</p>
                </div>
                {student.class && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Class</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{student.class}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              <p>This card is the property of {student.institutionAbbreviation || student.institutionName || "Institution"}</p>
              <p>{student.institutionName || "Institution"}</p>
              <p className="mt-1">If found please return to {student.institutionAbbreviation || student.institutionName || "Institution"}</p>
            </div>
            <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-200 rounded grid grid-cols-4 gap-px">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="bg-gray-400 rounded-sm" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flip Button */}
      <div className="px-6 pb-4">
        <button
          onClick={() => setIsFlipped(true)}
          className="w-full py-2 text-xs text-green-700 hover:text-green-600 transition-colors"
        >
          View Back Side →
        </button>
      </div>
    </Card>
  )
}