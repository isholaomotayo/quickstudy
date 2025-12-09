"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileText, ArrowRight, ArrowLeft, Upload, CheckCircle, AlertCircle, X } from 'lucide-react';

interface DocumentsStepProps {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export default function DocumentsStep({ 
  data, 
  updateData, 
  onNext, 
  onPrevious 
}: DocumentsStepProps) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const documentTypes = [
    {
      key: 'avatar',
      label: 'Profile Photo',
      description: 'Upload a clear passport photograph',
      required: true,
      accept: 'image/*'
    },
    {
      key: 'id_card',
      label: 'Valid ID Card',
      description: 'National ID, International Passport, or Driver\'s License',
      required: true,
      accept: 'image/*,.pdf'
    },
    {
      key: 'inst_cert',
      label: 'Previous Academic Certificate',
      description: 'Your highest academic certificate (O\'Level, Diploma, Degree, etc.)',
      required: true,
      accept: 'image/*,.pdf'
    },
  ];

  const handleFileUpload = async (file: File, documentKey: string) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(prev => ({ ...prev, [documentKey]: true }));
    setUploadProgress(prev => ({ ...prev, [documentKey]: 0 }));

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'student-documents');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [documentKey]: Math.min((prev[documentKey] || 0) + 10, 90)
        }));
      }, 200);

      // Upload to Cloudinary (you'll need to implement this endpoint)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const result = await response.json();
        setUploadProgress(prev => ({ ...prev, [documentKey]: 100 }));
        
        // Update the application data
        updateData({
          [documentKey]: result.secure_url || result.url
        });

        toast.success(`${documentTypes.find(doc => doc.key === documentKey)?.label} uploaded successfully!`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
      setUploadProgress(prev => ({ ...prev, [documentKey]: 0 }));
    } finally {
      setUploading(prev => ({ ...prev, [documentKey]: false }));
    }
  };

  const removeDocument = (documentKey: string) => {
    updateData({ [documentKey]: null });
    setUploadProgress(prev => ({ ...prev, [documentKey]: 0 }));
    toast.success('Document removed');
  };

  const validateDocuments = () => {
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const missingDocs = requiredDocs.filter(doc => !data[doc.key]);
    
    if (missingDocs.length > 0) {
      toast.error(`Please upload: ${missingDocs.map(doc => doc.label).join(', ')}`);
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateDocuments()) {
      onNext();
    }
  };

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Upload Documents</CardTitle>
            <p className="text-gray-600 text-sm">
              Upload the required documents for your application
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {documentTypes.map((docType) => (
          <div key={docType.key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Label className="font-medium text-base">
                    {docType.label}
                  </Label>
                  {docType.required && (
                    <span className="text-red-500 text-sm">*</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {docType.description}
                </p>
              </div>
              
              {data[docType.key] && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(docType.key)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {data[docType.key] ? (
              // Document uploaded
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900">Document Uploaded</p>
                  <p className="text-sm text-green-700">Ready for submission</p>
                </div>
              </div>
            ) : uploading[docType.key] ? (
              // Uploading
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-600">Uploading...</span>
                  <span className="text-sm text-gray-500">
                    {uploadProgress[docType.key] || 0}%
                  </span>
                </div>
                <Progress value={uploadProgress[docType.key] || 0} className="h-2" />
              </div>
            ) : (
              // Upload area
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept={docType.accept}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, docType.key);
                  }}
                  className="hidden"
                  id={`upload-${docType.key}`}
                />
                <label
                  htmlFor={`upload-${docType.key}`}
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      Max file size: 5MB
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        ))}

        {/* Upload Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Upload Guidelines</h4>
              <ul className="text-blue-700 text-sm mt-2 space-y-1">
                <li>• All documents must be clear and legible</li>
                <li>• Supported formats: JPG, PNG, PDF</li>
                <li>• Maximum file size: 5MB per document</li>
                <li>• Ensure all text in documents is clearly visible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNext}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </>
  );
}