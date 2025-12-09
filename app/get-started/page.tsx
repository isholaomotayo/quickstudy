"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  User, 
  FileText, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

// Import step components
import ProgramSelectionStep from './steps/ProgramSelectionStep';
import PersonalDetailsStep from './steps/PersonalDetailsStep';
import DocumentsStep from './steps/DocumentsStep';
import ReviewStep from './steps/ReviewStep';

interface ApplicationData {
  // Program Selection
  programme_id: number | null;
  programName?: string;
  
  // Personal Details (from user table)
  first_name?: string;
  last_name?: string;
  other_name?: string;
  email?: string;
  phone?: string;
  
  // Personal Details (from student table)
  title?: string;
  gender?: string;
  dob?: string;
  nationality_id?: number;
  address?: string;
  marital_status?: string;
  employment_status?: string;
  
  // Location details (from student table)
  state_origin?: string;
  lga_origin?: string;
  state_residence?: string;
  lga_residence?: string;
  
  // Academic background (from student table)
  grad_year?: string;
  degree_grade?: string;
  type_degree?: string;
  course_studied?: string;
  inst_type?: string;
  inst_name?: string;
  
  // References (from student table)
  ref_fname?: string;
  ref_lname?: string;
  ref_phone?: string;
  ref_address?: string;
  
  // Documents (from student table + user avatar)
  avatar?: string;
  id_card?: string;
  inst_cert?: string;
  
  // Application metadata
  isAdditionalApplication: boolean;
  application_type: 'NEW' | 'ADDITIONAL';
}

const steps = [
  { id: 1, title: 'Program Selection', icon: BookOpen },
  { id: 2, title: 'Personal Details', icon: User },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Review & Submit', icon: CheckCircle },
];

function ApplicationProcessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    programme_id: null,
    isAdditionalApplication: false,
    application_type: 'NEW',
  });

  useEffect(() => {
    initializeApplication();
  }, []);

  const initializeApplication = async () => {
    try {
      setLoading(true);
      
      // Check if this is an additional application
      const isAdditional = searchParams?.get('additional') === 'true';
      const preselectedProgramme = searchParams?.get('programme');
      
      if (isAdditional) {
        // Fetch existing user data to prefill form
        const response = await fetch('/api/student/context');
        if (response.ok) {
          const data = await response.json();
          const activeStudent = data.activeStudent;
          
          if (activeStudent && activeStudent.user) {
            // Format date of birth for input field
            const formattedDob = activeStudent.dob 
              ? new Date(activeStudent.dob).toISOString().split('T')[0] 
              : '';
            
            setApplicationData(prev => ({
              ...prev,
              isAdditionalApplication: true,
              application_type: 'ADDITIONAL',
              programme_id: preselectedProgramme ? parseInt(preselectedProgramme) : null,
              
              // User table data
              first_name: activeStudent.user.first_name || '',
              last_name: activeStudent.user.last_name || '',
              other_name: activeStudent.user.other_name || '',
              email: activeStudent.user.email || '',
              phone: activeStudent.user.phone || '',
              avatar: activeStudent.user.avatar || '',
              
              // Student table data
              title: activeStudent.title || '',
              gender: activeStudent.gender || '',
              dob: formattedDob,
              nationality_id: activeStudent.nationality_id || null,
              address: activeStudent.address || '',
              marital_status: activeStudent.marital_status || 'SINGLE',
              employment_status: activeStudent.employment_status || '',
              
              // Location data from student table
              state_origin: activeStudent.state_origin || '',
              lga_origin: activeStudent.lga_origin || '',
              state_residence: activeStudent.state_residence || '',
              lga_residence: activeStudent.lga_residence || '',
              
              // Academic background from student table
              grad_year: activeStudent.grad_year || '',
              degree_grade: activeStudent.degree_grade || '',
              type_degree: activeStudent.type_degree || '',
              course_studied: activeStudent.course_studied || '',
              inst_type: activeStudent.inst_type || '',
              inst_name: activeStudent.inst_name || '',
              
              // Documents from student table
              id_card: activeStudent.id_card || '',
              inst_cert: Array.isArray(activeStudent.inst_cert) && activeStudent.inst_cert.length > 0 ? activeStudent.inst_cert[0] : '',
              
              // References from student table
              ref_fname: activeStudent.ref_fname || '',
              ref_lname: activeStudent.ref_lname || '',
              ref_phone: activeStudent.ref_phone || '',
              ref_address: activeStudent.ref_address || '',
            }));
            
            // If programme is preselected, skip to step 2
            if (preselectedProgramme) {
              setCurrentStep(2);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error initializing application:', error);
      toast.error('Failed to load application data');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationData = (updates: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitApplication = async () => {
    try {
      setSubmitting(true);
      
      if (applicationData.isAdditionalApplication) {
        // For additional applications, create new student record
        const response = await fetch('/api/student/additional-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            programmeId: applicationData.programme_id,
            applicationData: applicationData
          }),
        });

        if (response.ok) {
          toast.success('Additional program application submitted successfully!');
          router.push('/profile/programs?success=additional-application');
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to submit application');
        }
      } else {
        // For new applications, use existing flow
        const response = await fetch('/api/student/application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationData),
        });

        if (response.ok) {
          toast.success('Application submitted successfully!');
          router.push('/dashboard?success=new-application');
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to submit application');
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProgramSelectionStep
            data={applicationData}
            updateData={updateApplicationData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <PersonalDetailsStep
            data={applicationData}
            updateData={updateApplicationData}
            onNext={nextStep}
            onPrevious={prevStep}
          />
        );
      case 3:
        return (
          <DocumentsStep
            data={applicationData}
            updateData={updateApplicationData}
            onNext={nextStep}
            onPrevious={prevStep}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={applicationData}
            onSubmit={submitApplication}
            onPrevious={prevStep}
            isSubmitting={submitting}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            {applicationData.isAdditionalApplication && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Additional Program Application
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {applicationData.isAdditionalApplication 
              ? 'Apply for Additional Program' 
              : 'Student Application'
            }
          </h1>
          <p className="text-gray-600">
            Complete all steps to submit your application
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-16 h-0.5 bg-gray-200 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        {/* Current Step Content */}
        <Card className="shadow-lg">
          {renderCurrentStep()}
        </Card>
      </div>
    </div>
  );
}

export default function ApplicationProcess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ApplicationProcessContent />
    </Suspense>
  );
}