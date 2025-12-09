"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AsyncSelect from 'react-select/async';
import { BookOpen, ArrowRight, Info } from 'lucide-react';

interface Programme {
  id: number;
  name: string;
  prefix?: string | null;
  description?: string | null;
  department_name?: string;
  value: number;
  label: string;
}

interface ProgramSelectionStepProps {
  data: any;
  updateData: (updates: any) => void;
  onNext: () => void;
}

export default function ProgramSelectionStep({ data, updateData, onNext }: ProgramSelectionStepProps) {
  const [selectedProgram, setSelectedProgram] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If programme is already selected (from URL params), fetch the program details
    if (data.programme_id && !selectedProgram) {
      fetchProgramDetails(data.programme_id);
    }
  }, [data.programme_id]);

  const fetchProgramDetails = async (programId: number) => {
    try {
      const response = await fetch(`/api/programme?search=`);
      if (response.ok) {
        const result = await response.json();
        const program = result.programmes?.find((p: Programme) => p.id === programId);
        if (program) {
          setSelectedProgram(program);
          updateData({ programName: program.name });
        }
      }
    } catch (error) {
      console.error('Error fetching program details:', error);
    }
  };

  const loadProgramOptions = async (inputValue: string): Promise<Programme[]> => {
    try {
      const response = await fetch(`/api/programme?search=${encodeURIComponent(inputValue)}`);
      if (response.ok) {
        const data = await response.json();
        return data.programmes || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading program options:', error);
      return [];
    }
  };

  const handleProgramSelect = (program: Programme | null) => {
    setSelectedProgram(program);
    updateData({ 
      programme_id: program?.id || null,
      programName: program?.name || null 
    });
  };

  const handleNext = () => {
    if (!selectedProgram) {
      toast.error('Please select a program to continue');
      return;
    }
    onNext();
  };

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Select Your Program</CardTitle>
            <p className="text-gray-600 text-sm">
              Choose the academic program you want to apply for
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {data.isAdditionalApplication && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Additional Program Application</h4>
                <p className="text-blue-700 text-sm mt-1">
                  You are applying for an additional program. Your existing personal information 
                  will be used to streamline this application process.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label htmlFor="program" className="text-base font-medium">
            Academic Program *
          </Label>
          
          <AsyncSelect
            cacheOptions
            loadOptions={loadProgramOptions}
            defaultOptions
            value={selectedProgram}
            onChange={handleProgramSelect}
            placeholder="Search for a program..."
            noOptionsMessage={({ inputValue }) =>
              inputValue.length === 0
                ? "Type to search for programs"
                : "No programs found"
            }
            className="text-sm"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '48px',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#cbd5e1',
                },
                '&:focus-within': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected
                  ? '#3b82f6'
                  : isFocused
                  ? '#f1f5f9'
                  : 'white',
                color: isSelected ? 'white' : '#374151',
                padding: '12px 16px',
                '&:hover': {
                  backgroundColor: isSelected ? '#3b82f6' : '#f1f5f9',
                },
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              }),
            }}
            formatOptionLabel={(program: Programme) => (
              <div>
                <div className="font-medium">{program.name}</div>
                {program.department_name && (
                  <div className="text-sm text-gray-500">
                    Department: {program.department_name}
                  </div>
                )}
                {program.description && (
                  <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {program.description}
                  </div>
                )}
              </div>
            )}
          />
          
          {selectedProgram && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <BookOpen className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">{selectedProgram.name}</h4>
                  {selectedProgram.department_name && (
                    <p className="text-sm text-green-700 mt-1">
                      Department: {selectedProgram.department_name}
                    </p>
                  )}
                  {selectedProgram.description && (
                    <p className="text-sm text-green-600 mt-2">
                      {selectedProgram.description}
                    </p>
                  )}
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                    Selected Program
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button 
            onClick={handleNext}
            disabled={!selectedProgram || loading}
            className="min-w-32"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </>
  );
}