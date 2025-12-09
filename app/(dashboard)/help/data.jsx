import {
  BookOpen,
  CreditCard,
  Settings,
  Zap,
  Clock,
  Users,
  Shield,
  UserPlus,
  Database,
  FileText,
  Award,
  BarChart,
  Mail,
  Upload,
} from "lucide-react";

const KnowledgeBaseData = {
  STUDENT: {
    faqs: [
      {
        category: "Academic",
        icon: BookOpen,
        color: "from-blue-500 to-blue-600",
        questions: [
          {
            question: "How do I register for courses?",
            answer:
              "Navigate to the Course Registration section on your dashboard and click 'Register your semester courses'. Select your desired courses and submit for approval.",
          },
          {
            question: "When are exam results released?",
            answer:
              "Exam results are typically released 2-3 weeks after the examination period ends. You'll receive an email notification when results are available.",
          },
          {
            question: "How do I check my GPA?",
            answer:
              "Your current GPA is displayed on your dashboard. Click 'View GPA' for detailed semester-by-semester breakdown and grade history.",
          },
          {
            question: "How do I access course materials?",
            answer:
              "Course materials are available in the Learning Management System (LMS). Click on 'My Courses' from your dashboard to access lecture notes, assignments, and resources.",
          },
          {
            question: "What is the process for course withdrawal?",
            answer:
              "To withdraw from a course, submit a withdrawal request through the Academic section before the withdrawal deadline. Late withdrawals may affect your academic record.",
          },
        ],
      },
      {
        category: "Payments",
        icon: CreditCard,
        color: "from-emerald-500 to-emerald-600",
        questions: [
          {
            question: "What payment methods are accepted?",
            answer:
              "We accept bank transfers, debit cards, credit cards, and online banking. Payment can be made through our secure payment portal.",
          },
          {
            question: "When are fees due?",
            answer:
              "Tuition fees are due at the beginning of each semester. Registration fees must be paid before course registration. Check your payment dashboard for specific due dates.",
          },
          {
            question: "How do I get a payment receipt?",
            answer:
              "Payment receipts are automatically generated and sent to your email after successful payment. You can also download them from the Payments section.",
          },
          {
            question: "Can I pay in installments?",
            answer:
              "Yes, installment payment plans are available. Contact the finance office to set up a payment plan. You must pay at least 60% before examinations.",
          },
        ],
      },
      {
        category: "Technical",
        icon: Settings,
        color: "from-purple-500 to-purple-600",
        questions: [
          {
            question: "I can't access my account",
            answer:
              "Try resetting your password using the 'Forgot Password' link. If the issue persists, contact technical support with your student ID.",
          },
          {
            question: "The website is loading slowly",
            answer:
              "Clear your browser cache and cookies. Ensure you have a stable internet connection. Try accessing the site using a different browser.",
          },
          {
            question: "How do I update my profile information?",
            answer:
              "Click on 'View Profile' from your dashboard, then select 'Edit Profile' to update your personal information, contact details, and preferences.",
          },
          {
            question: "Which browsers are supported?",
            answer:
              "The portal works best with Chrome, Firefox, Safari, and Edge (latest versions). Enable JavaScript and cookies for optimal performance.",
          },
        ],
      },
    ],
    knowledgeBase: [
      {
        title: "Getting Started Guide",
        category: "Basics",
        description:
          "Complete guide for new students on how to navigate the portal",
        icon: Zap,
        color: "bg-gradient-to-r from-amber-500 to-orange-500",
      },
      {
        title: "Course Registration Process",
        category: "Academic",
        description:
          "Step-by-step guide to registering for your semester courses",
        icon: BookOpen,
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
      },
      {
        title: "Payment Guidelines",
        category: "Finance",
        description:
          "Everything you need to know about fees and payment methods",
        icon: CreditCard,
        color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      },
      {
        title: "Academic Calendar",
        category: "Schedule",
        description: "Important dates, deadlines, and academic events",
        icon: Clock,
        color: "bg-gradient-to-r from-teal-500 to-cyan-500",
      },
      {
        title: "Student Support Services",
        category: "Support",
        description: "Available support services and how to access them",
        icon: Users,
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
      },
      {
        title: "Privacy & Security",
        category: "Security",
        description: "How we protect your data and maintain account security",
        icon: Shield,
        color: "bg-gradient-to-r from-slate-500 to-slate-600",
      },
    ],
  },

  ADMIN: {
    faqs: [
      {
        category: "User Management",
        icon: UserPlus,
        color: "from-indigo-500 to-indigo-600",
        questions: [
          {
            question: "How do I create new user accounts?",
            answer:
              "Navigate to User Management > Create User. Select the user role (Student, Staff, or Lecturer), fill in the required information, and click 'Create Account'. The user will receive login credentials via email.",
          },
          {
            question: "Can I bulk import users?",
            answer:
              "Yes, go to User Management > Bulk Import. Download the CSV template, fill in user details, and upload the file. The system will validate and create accounts automatically.",
          },
          {
            question: "How do I reset user passwords?",
            answer:
              "In User Management, search for the user, click on their profile, and select 'Reset Password'. A temporary password will be sent to their registered email.",
          },
          {
            question: "Can I assign multiple roles to a single user?",
            answer:
              "Yes, users can have multiple roles. Edit the user profile and add additional roles under 'Role Management'. Each role grants specific permissions.",
          },
          {
            question: "How do I deactivate or suspend user accounts?",
            answer:
              "Search for the user in User Management, click 'Edit', and change the status to 'Inactive' or 'Suspended'. Suspended users cannot log in but their data is preserved.",
          },
        ],
      },
      {
        category: "Admissions & Enrollment",
        icon: Award,
        color: "from-green-500 to-green-600",
        questions: [
          {
            question: "How do I process provisional admissions?",
            answer:
              "Go to Admissions > Applications. Review pending applications, verify documents, and click 'Issue Provisional Admission'. The applicant will be notified via email.",
          },
          {
            question: "Can I view application statistics?",
            answer:
              "Yes, the Admissions Dashboard shows real-time statistics including total applications, approved/rejected counts, and demographic breakdowns.",
          },
          {
            question: "How do I set admission requirements?",
            answer:
              "Navigate to Settings > Admission Criteria. Define minimum scores, required documents, and prerequisites for each program. Changes apply to new applications only.",
          },
          {
            question: "Can I export admission lists?",
            answer:
              "Yes, go to Admissions > Reports. Select the admission period and status filters, then export as CSV or PDF for record-keeping or analysis.",
          },
          {
            question: "How do I handle admission appeals?",
            answer:
              "Appeals appear in Admissions > Appeals. Review the case, add comments, and either approve or reject. The decision is final and logged in the system.",
          },
        ],
      },
      {
        category: "Academic Configuration",
        icon: Database,
        color: "from-blue-500 to-blue-600",
        questions: [
          {
            question: "How do I set up faculties and departments?",
            answer:
              "Go to Academic Setup > Faculties. Click 'Add Faculty', enter details, then add departments within each faculty. Assign department heads and set capacity limits.",
          },
          {
            question: "Can I create and manage course curricula?",
            answer:
              "Yes, navigate to Academic Setup > Courses. Create courses with prerequisites, credit hours, and descriptions. Link courses to programs and define semester offerings.",
          },
          {
            question: "How do I configure the grading system?",
            answer:
              "In Settings > Grading System, define grade scales, weight distributions, and GPA calculations. You can create different systems for different programs.",
          },
          {
            question: "Can I set up automated academic rules?",
            answer:
              "Yes, configure rules in Academic Setup > Rules. Set minimum/maximum credit hours, prerequisite enforcement, and academic standing criteria.",
          },
          {
            question: "How do I manage academic sessions and semesters?",
            answer:
              "Go to Academic Setup > Sessions. Create academic years, define semester dates, and set registration periods. The system automatically manages transitions.",
          },
        ],
      },
      {
        category: "Financial Management",
        icon: BarChart,
        color: "from-emerald-500 to-emerald-600",
        questions: [
          {
            question: "How do I set and update fee structures?",
            answer:
              "Navigate to Finance > Fee Structure. Create fee categories, set amounts by program/level, and define payment schedules. Changes can be applied to specific cohorts.",
          },
          {
            question: "Can I generate financial reports?",
            answer:
              "Yes, go to Finance > Reports. Generate revenue reports, outstanding payments, collection summaries, and financial forecasts with customizable date ranges.",
          },
          {
            question: "How do I process refunds?",
            answer:
              "In Finance > Refunds, search for the student, select the payment to refund, specify the amount and reason, then process. Refunds are tracked and audited.",
          },
          {
            question: "Can I set up payment reminders?",
            answer:
              "Yes, configure automatic reminders in Finance > Settings. Set reminder intervals, customize messages, and define escalation procedures for overdue payments.",
          },
          {
            question: "How do I manage scholarships and waivers?",
            answer:
              "Go to Finance > Scholarships. Create scholarship types, set eligibility criteria, and assign to students. The system automatically adjusts fee calculations.",
          },
        ],
      },
      {
        category: "System Administration",
        icon: Settings,
        color: "from-purple-500 to-purple-600",
        questions: [
          {
            question: "How do I configure email notifications?",
            answer:
              "In Settings > Notifications, customize email templates for different events. Set trigger conditions, recipient groups, and scheduling preferences.",
          },
          {
            question: "Can I customize the portal interface?",
            answer:
              "Yes, go to Settings > Appearance. Upload logos, set color schemes, customize dashboards, and configure landing pages for different user roles.",
          },
          {
            question: "How do I manage system permissions?",
            answer:
              "Navigate to Settings > Permissions. Create custom roles, assign specific permissions, and set access levels for different modules and features.",
          },
          {
            question: "How do I perform system backups?",
            answer:
              "Automatic backups run daily. For manual backups, go to Settings > Backup. You can also schedule custom backup intervals and retention policies.",
          },
          {
            question: "Can I integrate with external systems?",
            answer:
              "Yes, in Settings > Integrations, configure APIs for payment gateways, SMS providers, email services, and third-party academic systems.",
          },
        ],
      },
    ],
    knowledgeBase: [
      {
        title: "Administrator Quick Start",
        category: "Basics",
        description: "Essential guide for system administrators to get started",
        icon: Zap,
        color: "bg-gradient-to-r from-amber-500 to-orange-500",
      },
      {
        title: "User Management Guide",
        category: "Users",
        description:
          "Complete guide to creating, managing, and organizing users",
        icon: UserPlus,
        color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      },
      {
        title: "Academic Configuration",
        category: "Academic",
        description: "Setting up faculties, departments, courses, and programs",
        icon: Database,
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
      },
      {
        title: "Financial Management",
        category: "Finance",
        description:
          "Managing fees, payments, scholarships, and financial reports",
        icon: BarChart,
        color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      },
      {
        title: "Admissions Processing",
        category: "Admissions",
        description:
          "Handling applications, provisional admissions, and enrollment",
        icon: Award,
        color: "bg-gradient-to-r from-green-500 to-green-600",
      },
      {
        title: "System Configuration",
        category: "System",
        description: "Portal customization, permissions, and integrations",
        icon: Settings,
        color: "bg-gradient-to-r from-purple-500 to-purple-600",
      },
      {
        title: "Reports & Analytics",
        category: "Analytics",
        description: "Generating and interpreting system-wide reports",
        icon: FileText,
        color: "bg-gradient-to-r from-pink-500 to-rose-500",
      },
      {
        title: "Security & Compliance",
        category: "Security",
        description:
          "Best practices for data security and regulatory compliance",
        icon: Shield,
        color: "bg-gradient-to-r from-slate-500 to-slate-600",
      },
    ],
  },

  STAFF: {
    faqs: [
      {
        category: "Student Support",
        icon: Users,
        color: "from-blue-500 to-blue-600",
        questions: [
          {
            question: "How do I assist students with registration issues?",
            answer:
              "Access Student Services > Registration Support. Search for the student by ID or name, view their registration status, and resolve holds or conflicts. You can override prerequisites with proper authorization.",
          },
          {
            question: "How do I verify student documents?",
            answer:
              "Go to Student Services > Document Verification. Review uploaded documents, mark as verified or request resubmission with specific feedback. Verification history is tracked.",
          },
          {
            question: "Can I update student information on their behalf?",
            answer:
              "Yes, with proper authorization. Search for the student, click 'Edit Profile', make necessary changes, and document the reason. All changes are logged for audit purposes.",
          },
          {
            question: "How do I generate student transcripts?",
            answer:
              "Navigate to Student Services > Transcripts. Select the student, choose official or unofficial format, and generate. Official transcripts require department head approval.",
          },
          {
            question: "How do I handle student complaints?",
            answer:
              "Log complaints in Student Services > Support Tickets. Assign priority, track resolution progress, and maintain communication history. Escalate complex issues to supervisors.",
          },
        ],
      },
      {
        category: "Course Management",
        icon: BookOpen,
        color: "from-green-500 to-green-600",
        questions: [
          {
            question: "How do I assign lecturers to courses?",
            answer:
              "Go to Course Management > Lecturer Assignment. Select the course, search for available lecturers, check their workload, and assign. Notifications are sent automatically.",
          },
          {
            question: "Can I modify course schedules?",
            answer:
              "Yes, in Course Management > Timetable. Select the course, choose new time slots, check for conflicts, and update. Students enrolled are notified of changes.",
          },
          {
            question: "How do I manage course capacity?",
            answer:
              "Navigate to Course Management > Capacity. View enrollment numbers, adjust limits, manage waitlists, and approve overrides for special cases.",
          },
          {
            question: "How do I upload course materials?",
            answer:
              "In Course Management > Materials, select the course, upload files (PDFs, videos, etc.), organize by week/topic, and set visibility dates for students.",
          },
          {
            question: "Can I track course attendance?",
            answer:
              "Yes, use Course Management > Attendance. Mark present/absent, generate attendance reports, and identify students with poor attendance for intervention.",
          },
        ],
      },
      {
        category: "Examination & Results",
        icon: FileText,
        color: "from-purple-500 to-purple-600",
        questions: [
          {
            question: "How do I upload examination results?",
            answer:
              "Go to Examinations > Upload Results. Download the template, enter scores, validate data, and upload. Results go through approval workflow before publication.",
          },
          {
            question: "Can I process grade changes?",
            answer:
              "Yes, in Examinations > Grade Changes. Submit a change request with justification, attach supporting documents. Requires department head and registrar approval.",
          },
          {
            question: "How do I schedule makeup exams?",
            answer:
              "Navigate to Examinations > Makeup Exams. Create exam sessions, assign eligible students, book venues, and notify participants. Generate attendance lists.",
          },
          {
            question: "How do I handle exam misconduct reports?",
            answer:
              "Document cases in Examinations > Misconduct. Upload evidence, record statements, and submit to disciplinary committee. Track case progress and outcomes.",
          },
          {
            question: "Can I generate result analysis reports?",
            answer:
              "Yes, in Examinations > Analytics. View pass/fail rates, grade distributions, compare across semesters, and identify courses needing intervention.",
          },
        ],
      },
      {
        category: "Communication",
        icon: Mail,
        color: "from-indigo-500 to-indigo-600",
        questions: [
          {
            question: "How do I send bulk notifications to students?",
            answer:
              "Use Communication > Bulk Messages. Select recipient groups, compose message, choose channels (email/SMS), and schedule delivery. Track open and response rates.",
          },
          {
            question: "Can I create announcement boards?",
            answer:
              "Yes, go to Communication > Announcements. Create announcements with priority levels, set display duration, and target specific student groups or departments.",
          },
          {
            question: "How do I manage the academic calendar?",
            answer:
              "In Communication > Calendar, add important dates, deadlines, and events. Set reminders, categorize by type, and sync with student portals.",
          },
          {
            question: "How do I respond to general inquiries?",
            answer:
              "Access Communication > Help Desk. View pending inquiries, provide responses, use templates for common questions, and escalate when necessary.",
          },
        ],
      },
      {
        category: "Reports & Documentation",
        icon: BarChart,
        color: "from-teal-500 to-cyan-500",
        questions: [
          {
            question: "What reports can I generate?",
            answer:
              "Access Reports Dashboard for enrollment statistics, academic performance, attendance summaries, payment status, and custom reports using the report builder.",
          },
          {
            question: "How do I export data for analysis?",
            answer:
              "In Reports > Export, select data types, apply filters, choose format (CSV, Excel, PDF), and download. Large exports are processed and emailed.",
          },
          {
            question: "Can I create custom report templates?",
            answer:
              "Yes, use Reports > Template Builder. Drag and drop data fields, apply filters, set groupings, and save templates for recurring reports.",
          },
          {
            question: "How do I archive academic records?",
            answer:
              "Go to Reports > Archive. Select records by year/semester, initiate archival process, and maintain searchable archive for compliance and historical reference.",
          },
        ],
      },
    ],
    knowledgeBase: [
      {
        title: "Staff Portal Overview",
        category: "Basics",
        description: "Introduction to staff portal features and navigation",
        icon: Zap,
        color: "bg-gradient-to-r from-amber-500 to-orange-500",
      },
      {
        title: "Student Support Procedures",
        category: "Support",
        description: "Best practices for assisting students effectively",
        icon: Users,
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
      },
      {
        title: "Course Administration",
        category: "Academic",
        description: "Managing courses, schedules, and academic resources",
        icon: BookOpen,
        color: "bg-gradient-to-r from-green-500 to-green-600",
      },
      {
        title: "Examination Management",
        category: "Exams",
        description: "Handling exams, results, and grade processing",
        icon: FileText,
        color: "bg-gradient-to-r from-purple-500 to-purple-600",
      },
      {
        title: "Communication Tools",
        category: "Communication",
        description: "Using messaging, announcements, and notifications",
        icon: Mail,
        color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      },
      {
        title: "Reporting & Analytics",
        category: "Reports",
        description:
          "Generating insights from academic and administrative data",
        icon: BarChart,
        color: "bg-gradient-to-r from-teal-500 to-cyan-500",
      },
      {
        title: "Document Management",
        category: "Documents",
        description: "Handling student documents and records",
        icon: Upload,
        color: "bg-gradient-to-r from-pink-500 to-rose-500",
      },
      {
        title: "Data Privacy Guidelines",
        category: "Compliance",
        description: "Ensuring student data protection and confidentiality",
        icon: Shield,
        color: "bg-gradient-to-r from-slate-500 to-slate-600",
      },
    ],
  },

  // Helper function to get data by role
  getByRole: function (role) {
    const upperRole = role?.toUpperCase();
    if (upperRole === "SUPERADMIN") {
      return this.ADMIN;
    }
    return this[upperRole] || this.STUDENT; // Default to STUDENT if role not found
  },
};

export default KnowledgeBaseData;
