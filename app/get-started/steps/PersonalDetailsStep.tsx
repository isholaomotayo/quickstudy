"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, ArrowRight, ArrowLeft, Info } from 'lucide-react';

interface PersonalDetailsStepProps {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function PersonalDetailsStep({ 
  data, 
  updateData, 
  onNext, 
  onPrevious 
}: PersonalDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!data.title?.trim()) newErrors.title = 'Title is required';
    if (!data.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!data.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (!data.email?.trim()) newErrors.email = 'Email is required';
    if (!data.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!data.gender) newErrors.gender = 'Gender is required';
    if (!data.dob) newErrors.dob = 'Date of birth is required';
    if (!data.address?.trim()) newErrors.address = 'Address is required';

    // Email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (basic)
    if (data.phone && !/^\+?[\d\s-()]{10,}$/.test(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    } else {
      toast.error('Please fill in all required fields correctly');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Personal Details</CardTitle>
            <p className="text-gray-600 text-sm">
              Provide your personal information for the application
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {data.isAdditionalApplication && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Information Pre-filled</h4>
                <p className="text-green-700 text-sm mt-1">
                  Your personal information has been pre-filled from your existing profile. 
                  You can review and update any details as needed.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Select
              value={data.title || ''}
              onValueChange={(value) => handleInputChange('title', value)}
            >
              <SelectTrigger className={errors.title ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem>
                <SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Miss">Miss</SelectItem>
                <SelectItem value="Ms">Ms</SelectItem>
                <SelectItem value="Dr">Dr</SelectItem>
                <SelectItem value="Prof">Prof</SelectItem>
              </SelectContent>
            </Select>
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="first_name" className="text-sm font-medium">
              First Name *
            </Label>
            <Input
              id="first_name"
              value={data.first_name || ''}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Enter your first name"
              className={errors.first_name ? 'border-red-500' : ''}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="last_name" className="text-sm font-medium">
              Last Name *
            </Label>
            <Input
              id="last_name"
              value={data.last_name || ''}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Enter your last name"
              className={errors.last_name ? 'border-red-500' : ''}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
            )}
          </div>

          {/* Other Name */}
          <div>
            <Label htmlFor="other_name" className="text-sm font-medium">
              Other Name
            </Label>
            <Input
              id="other_name"
              value={data.other_name || ''}
              onChange={(e) => handleInputChange('other_name', e.target.value)}
              placeholder="Enter other names (optional)"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender" className="text-sm font-medium">
              Gender *
            </Label>
            <Select
              value={data.gender || ''}
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dob" className="text-sm font-medium">
              Date of Birth *
            </Label>
            <Input
              id="dob"
              type="date"
              value={data.dob || ''}
              onChange={(e) => handleInputChange('dob', e.target.value)}
              className={errors.dob ? 'border-red-500' : ''}
            />
            {errors.dob && (
              <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
            )}
          </div>

          {/* Marital Status */}
          <div>
            <Label htmlFor="marital_status" className="text-sm font-medium">
              Marital Status
            </Label>
            <Select
              value={data.marital_status || 'SINGLE'}
              onValueChange={(value) => handleInputChange('marital_status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE">Single</SelectItem>
                <SelectItem value="MARRIED">Married</SelectItem>
                <SelectItem value="DIVORCED">Divorced</SelectItem>
                <SelectItem value="WIDOWED">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employment Status */}
          <div>
            <Label htmlFor="employment_status" className="text-sm font-medium">
              Employment Status
            </Label>
            <Select
              value={data.employment_status || ''}
              onValueChange={(value) => handleInputChange('employment_status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYED">Employed</SelectItem>
                <SelectItem value="UNEMPLOYED">Unemployed</SelectItem>
                <SelectItem value="SELF_EMPLOYED">Self Employed</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="RETIRED">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="text-sm font-medium">
            Address *
          </Label>
          <Textarea
            id="address"
            value={data.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter your full address"
            rows={3}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
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