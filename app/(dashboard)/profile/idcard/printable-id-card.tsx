"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  Hash,
  FileText,
  Shield,
  Phone,
  Mail,
} from "lucide-react";

interface StudentData {
  firstName: string;
  lastName: string;
  studentId: string;
  faculty: string;
  department: string;
  programme: string;
  class?: string;
  validThrough: string;
  photoUrl?: string;
  institutionLogo?: string;
}

interface PrintableIdCardProps {
  student: StudentData;
}

export function PrintableIdCard({ student }: PrintableIdCardProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .print-container {
              display: flex !important;
              flex-direction: column !important;
              gap: 0.75in !important;
              justify-content: center !important;
              align-items: center !important;
            }
            
            .id-card {
              width: 3.375in !important;
              height: 2.125in !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: 1px solid #000 !important;
              font-size: 6px !important;
              overflow: hidden !important;
            }
            
            .print-background {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .print-background svg {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            @page {
              size: portrait;
              margin: 0.5in;
            }
          }
        `,
        }}
      />

      {/* Print Button */}
      <div className="text-center print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Print ID Card
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Preview shows exact print dimensions (3.375" x 2.125") - Scaled 1.5x
          for visibility
        </p>
      </div>

      <div
        className="space-y-32 print:space-y-8 print-container flex flex-col items-center"
        style={{ padding: "4rem 0" }}
      >
        {/* Front Side */}
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-12 print:hidden">
            Front Side
          </h3>
          <Card
            className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden id-card relative"
            style={{
              width: "3.375in",
              height: "2.125in",
              transform: "scale(1.5)",
              transformOrigin: "center",
              margin: "2rem auto",
            }}
          >
            {/* Colorful Print-Friendly Background */}
            <div className="absolute inset-0 overflow-hidden print-background">
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 250"
              >
                <defs>
                  {/* Colorful gradient that prints well */}
                  <linearGradient
                    id="bgGradientFront"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f0f9ff" />
                    <stop offset="30%" stopColor="#dbeafe" />
                    <stop offset="70%" stopColor="#e0e7ff" />
                    <stop offset="100%" stopColor="#f3e8ff" />
                  </linearGradient>

                  {/* Colorful dots pattern */}
                  <pattern
                    id="dotsPatternFront"
                    x="0"
                    y="0"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="1.5"
                      fill="#3b82f6"
                      fillOpacity="0.2"
                    />
                    <circle
                      cx="6"
                      cy="6"
                      r="0.8"
                      fill="#8b5cf6"
                      fillOpacity="0.15"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="0.8"
                      fill="#10b981"
                      fillOpacity="0.15"
                    />
                    <circle
                      cx="18"
                      cy="6"
                      r="0.6"
                      fill="#f59e0b"
                      fillOpacity="0.12"
                    />
                    <circle
                      cx="6"
                      cy="18"
                      r="0.6"
                      fill="#ec4899"
                      fillOpacity="0.12"
                    />
                  </pattern>

                  {/* Grid lines with color */}
                  <pattern
                    id="gridPatternFront"
                    x="0"
                    y="0"
                    width="30"
                    height="30"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M30 0 L0 0 0 30"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="0.4"
                      strokeOpacity="0.15"
                    />
                  </pattern>

                  {/* Hexagonal pattern */}
                  <pattern
                    id="hexPatternFront"
                    x="0"
                    y="0"
                    width="32"
                    height="28"
                    patternUnits="userSpaceOnUse"
                  >
                    <polygon
                      points="16,3 26,9 26,19 16,25 6,19 6,9"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="0.6"
                      strokeOpacity="0.1"
                    />
                  </pattern>
                </defs>

                {/* Base colorful gradient */}
                <rect width="100%" height="100%" fill="url(#bgGradientFront)" />

                {/* Layered colorful patterns */}
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#gridPatternFront)"
                />
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#dotsPatternFront)"
                />
                <rect width="100%" height="100%" fill="url(#hexPatternFront)" />

                {/* Colorful decorative elements */}
                <g opacity="0.2">
                  <circle
                    cx="60"
                    cy="60"
                    r="18"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="340"
                    cy="190"
                    r="20"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="315"
                    y="45"
                    width="28"
                    height="28"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    rx="6"
                  />
                  <rect
                    x="40"
                    y="185"
                    width="30"
                    height="30"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    rx="8"
                  />
                </g>

                {/* Colorful accent waves */}
                <path
                  d="M0 80 Q100 60 200 80 T400 80 L400 95 Q300 115 200 95 T0 95 Z"
                  fill="#3b82f6"
                  fillOpacity="0.08"
                />
                <path
                  d="M0 160 Q100 140 200 160 T400 160 L400 175 Q300 195 200 175 T0 175 Z"
                  fill="#8b5cf6"
                  fillOpacity="0.08"
                />

                {/* Subtle border with color */}
                <rect
                  x="3"
                  y="3"
                  width="394"
                  height="244"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="0.8"
                  strokeOpacity="0.15"
                  rx="8"
                />
              </svg>
            </div>

            {/* Header Section */}
            <div className="bg-green-900/55 text-white px-2 py-1.5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-8 rounded-lg flex items-center justify-center p-1 shadow-sm ">
                    <img
                      src={
                        student.institutionLogo ||
                        "https://www.cdel.unn.edu.ng/images/InstitutionLogo.png"
                      }
                      alt="Institution Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-[10px] font-bold tracking-wide leading-tight">
                      UNIVERSITY OF NIGERIA, NSUKKA
                    </h1>
                    <p className="text-[8px] opacity-90 font-medium">
                      CENTRE FOR DISTANCE & e-LEARNING
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-[8px]">CDeL</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-2 relative z-10 bg-white/60">
              <div className="flex gap-1.5">
                {/* Photo Section */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-16 bg-gray-100 border-2 border-yellow-500 rounded-lg overflow-hidden mb-1">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl || "/placeholder.svg"}
                        alt="Student Photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <Badge className="text-[7px] bg-yellow-500 text-white w-full justify-center py-0.5">
                    <Calendar className="w-1.5 h-1.5 mr-0.5" />
                    <span className="text-[7px]">
                      Valid {student.validThrough}
                    </span>
                  </Badge>
                </div>

                {/* Student Information */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="mb-0.5">
                    <h2 className="text-[11px] text-justify font-bold text-gray-900 leading-tight mb-0.5">
                      {student.firstName} {student.lastName}
                    </h2>
                    <div className="flex items-center gap-0.5 text-gray-600">
                      <Hash className="w-1.5 h-1.5" />
                      <span className="font-mono text-[8px] font-semibold">
                        {student.studentId}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex">
                      <span className="text-[7px] font-semibold text-gray-500 w-10 flex-shrink-0">
                        FACULTY:
                      </span>
                      <span className="text-[7px] font-medium text-gray-900 flex-1 leading-tight">
                        {student.faculty}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-[7px] font-semibold text-gray-500 w-10 flex-shrink-0">
                        DEPT:
                      </span>
                      <span className="text-[7px] font-medium text-gray-900 flex-1 leading-tight">
                        {student.department}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-[7px] font-semibold text-gray-500 w-10 flex-shrink-0">
                        PROG:
                      </span>
                      <span className="text-[7px] font-medium text-gray-900 flex-1 leading-tight">
                        {student.programme}
                      </span>
                    </div>
                    {student.class && (
                      <div className="flex">
                        <span className="text-[7px] font-semibold text-gray-500 w-10 flex-shrink-0">
                          CLASS:
                        </span>
                        <span className="text-[7px] font-medium text-gray-900 flex-1 leading-tight">
                          {student.class}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-1.5 pt-1 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-[7px] text-gray-600 flex-1 leading-tight">
                    <p className="font-medium">
                      Property of Centre for Distance & e-Learning, UNN
                    </p>
                    <p>If found please return to CDeL UNN</p>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 border border-gray-200 rounded flex items-center justify-center flex-shrink-0 ml-1">
                    <div className="w-3 h-3 bg-gray-200 rounded grid grid-cols-3 gap-px">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="bg-gray-400 rounded-sm" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Back Side */}
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-12 print:hidden">
            Back Side
          </h3>
          <Card
            className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden id-card"
            style={{
              width: "3.375in",
              height: "2.125in",
              transform: "scale(1.5)",
              transformOrigin: "center",
              margin: "2rem auto",
            }}
          >
            {/* Header Section - Back */}
            <div className="bg-green-700 text-white px-2 py-1.5">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-[10px] font-bold tracking-wide">
                    STUDENT IDENTIFICATION CARD
                  </h2>
                  <p className="text-[8px] opacity-90">BACK</p>
                </div>
              </div>
            </div>

            {/* Main Content - Back */}
            <div className="p-2 space-y-2">
              {/* Terms and Conditions */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-0.5 mb-0.5">
                  <FileText className="w-2 h-2 text-green-700" />
                  <h3 className="font-semibold text-[8px] text-gray-900">
                    TERMS AND CONDITIONS
                  </h3>
                </div>
                <div className="text-[7px] text-gray-600 space-y-0.5 leading-tight">
                  <p>• Property of University of Nigeria, Nsukka</p>
                  <p>• Must be carried on university premises</p>
                  <p>• Report loss to CDeL immediately</p>
                  <p>• Unauthorized use prohibited</p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-0.5 mb-0.5">
                  <Shield className="w-2 h-2 text-green-700" />
                  <h3 className="font-semibold text-[8px] text-gray-900">
                    EMERGENCY CONTACT
                  </h3>
                </div>
                <div className="space-y-0.5 text-[7px]">
                  <div className="flex items-center gap-0.5">
                    <Phone className="w-1.5 h-1.5 text-gray-500" />
                    <span className="text-gray-600">
                      +234 (0) +234 805 411 8026
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Mail className="w-1.5 h-1.5 text-gray-500" />
                    <span className="text-gray-600">
                      support.cdel@unn.edu.ng
                    </span>
                  </div>
                </div>
              </div>

              {/* Authorized Signatory Section */}
              <div className="space-y-1 border-t border-gray-200 pt-1">
                <h3 className="font-semibold text-[8px] text-gray-900 text-center">
                  AUTHORIZED SIGNATORY
                </h3>

                <div className="grid grid-cols-2 gap-1">
                  {/* Student Signature */}
                  <div className="space-y-0.5">
                    <label className="text-[6px] font-medium text-gray-500 uppercase tracking-wide block">
                      Student
                    </label>
                    <div className="h-4 border-b border-dashed border-gray-300"></div>
                  </div>

                  {/* Official Signature */}
                  <div className="space-y-0.5">
                    <label className="text-[6px] font-medium text-gray-500 uppercase tracking-wide block">
                      Registrar
                    </label>
                    <div className="h-4 border-b border-dashed border-gray-300"></div>
                  </div>
                </div>

                {/* Official Stamp Area */}
                <div className="text-center mt-1">
                  <label className="text-[6px] font-medium text-gray-500 uppercase tracking-wide block mb-0.5">
                    Official Stamp
                  </label>
                  <div className="w-6 h-6 border border-dashed border-gray-300 rounded-full mx-auto"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-0.5 border-t border-gray-200">
                <p className="text-[6px] text-gray-500 leading-tight">
                  Centre for Distance & e-Learning, UNN
                </p>
                <p className="text-[6px] text-gray-500">
                  www.unn.edu.ng | {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Print Instructions */}
      <div className="text-center text-xs text-gray-600 border-t pt-4 print:hidden">
        <p className="font-medium mb-2">Printing Instructions:</p>
        <p>1. Print on cardstock or heavy paper for durability</p>
        <p>2. Cut along the card edges</p>
        <p>3. Fold or laminate for professional finish</p>
      </div>
    </div>
  );
}
