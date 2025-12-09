"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  ArrowLeft, 
  Send, 
  User, 
  BookOpen, 
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase
} from 'lucide-react';

interface ReviewStepProps {
  data: any;
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

export default function ReviewStep({ 
  data, 
  onSubmit, 
  onPrevious, 
  isSubmitting 
}: ReviewStepProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompletionStatus = () => {
    const requiredFields = [
      'programme_id',
      'first_name',
      'last_name',
      'email',
      'phone',
      'gender',
      'dob',
      'address',
      'avatar',
      'id_card',
      'inst_cert'
    ];

    const completedFields = requiredFields.filter(field => data[field]);
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  };

  const status = getCompletionStatus();

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Review & Submit</CardTitle>
            <p className="text-gray-600 text-sm">
              Review your application details before submission
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Completion Status */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">Application Progress</h3>
              <p className="text-sm text-green-700">
                {status.completed} of {status.total} required fields completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {status.percentage}%
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {status.percentage === 100 ? 'Complete' : 'In Progress'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Program Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">Program Selection</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">{data.programName || 'Selected Program'}</h4>
                <p className="text-sm text-gray-600">
                  {data.isAdditionalApplication ? 'Additional Program Application' : 'New Application'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Personal Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Name:</strong> {data.title} {data.first_name} {data.last_name} {data.other_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Email:</strong> {data.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Phone:</strong> {data.phone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Date of Birth:</strong> {formatDate(data.dob)}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Gender:</strong> {data.gender}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Marital Status:</strong> {data.marital_status || 'Not specified'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Employment:</strong> {data.employment_status || 'Not specified'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="text-sm">
                  <strong>Address:</strong> {data.address}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Documents */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">Documents</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'avatar', label: 'Profile Photo', required: true },
              { key: 'id_card', label: 'Valid ID Card', required: true },
              { key: 'inst_cert', label: 'Academic Certificate', required: true }
            ].map((doc) => (
              <div key={doc.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">{doc.label}</span>
                  {doc.required && <span className="text-red-500">*</span>}
                </div>
                <Badge 
                  variant={data[doc.key] ? "default" : "secondary"}
                  className={data[doc.key] ? "bg-green-100 text-green-800" : ""}
                >
                  {data[doc.key] ? 'Uploaded' : 'Not uploaded'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Application Type Notice */}
        {data.isAdditionalApplication && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Additional Program Application</h4>
            <p className="text-blue-700 text-sm">
              This is an additional program application. Upon submission, a new student profile 
              will be created for the selected program while maintaining your existing enrollment(s).
            </p>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Declaration</h4>
          <p className="text-gray-700 text-sm">
            By submitting this application, I declare that all information provided is true and accurate 
            to the best of my knowledge. I understand that providing false information may result in the 
            rejection of my application or cancellation of admission.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={isSubmitting || status.percentage < 100}
            className="min-w-40"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </>
  );
}