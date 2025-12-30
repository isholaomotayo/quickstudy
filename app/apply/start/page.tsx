"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { GlassCard } from "../../../components/ui/glass-card";

import { initializeIcons } from "@fluentui/react";
import dynamic from "next/dynamic";
initializeIcons();

const DatePickerNoSSR = dynamic(
  () => import("@fluentui/react/lib/DatePicker").then((mod) => mod.DatePicker),
  { ssr: false }
);
const SelectNoSSR = dynamic(
  () => import("react-select").then((mod) => mod.default),
  {
    ssr: false,
  }
);

import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Progress } from "../../../components/ui/progress";
import {
  User,
  Phone,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle,
  FileText,
  BookOpen,
} from "lucide-react";
import {
  postStudent,
  postAffiliate,
  getAllProgrammes,
} from "../../../helpers/FetchWrapper";
import statesData from "../../../helpers/states.js";
import { useApp } from "../../../contexts/AppContext";
import { useInstitutionByUrl } from "../../../hooks/useInstitution";

interface ApplicationFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  otherName: string;
  dateOfBirth: string;
  gender: string;
  stateOfOrigin: string;
  localGovernment: string;

  // Contact Information
  email: string;
  phone: string;
  alternativePhone: string;
  address: string;
  city: string;
  state: string;

  // Educational Background & Academic History
  previousInstitution: string;
  institutionType: string;
  courseStudied: string;
  degreeType: string;
  degreeGrade: string;
  graduationYear: string;
  qualifications: string;

  // Program Preferences
  preferredProgram: string; // Program ID

  // Document Uploads
  passportPhoto: string;
  identityDocument: string;
  certificates: string[];

  // Personal Details (additional)
  maritalStatus: string;
  employmentStatus: string;

  // Additional Information
  is_affiliate: boolean;
  bank: string;
  account_no: string;

  // System fields
  institution_id: string;
  currentStep: number;
  isComplete: boolean;
  lastSaved: string;
}

interface ApplicationStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: string[];
}

const steps: ApplicationStep[] = [
  {
    id: 1,
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: <User className="h-5 w-5" />,
    fields: [
      "firstName",
      "lastName",
      "otherName",
      "dateOfBirth",
      "gender",
      "stateOfOrigin",
      "localGovernment",
      "maritalStatus",
      "employmentStatus",
    ],
  },
  {
    id: 2,
    title: "Contact Details",
    description: "How can we reach you?",
    icon: <Phone className="h-5 w-5" />,
    fields: ["email", "phone", "alternativePhone", "address", "city", "state"],
  },
  {
    id: 3,
    title: "Educational Background",
    description: "Your academic history",
    icon: <BookOpen className="h-5 w-5" />,
    fields: [
      "previousInstitution",
      "institutionType",
      "courseStudied",
      "degreeType",
      "degreeGrade",
      "graduationYear",
      "passportPhoto",
      "identityDocument",
      "certificates",
    ],
  },
  {
    id: 4,
    title: "Program Selection",
    description: "Choose your preferred program",
    icon: <GraduationCap className="h-5 w-5" />,
    fields: ["preferredProgram"],
  },
  {
    id: 5,
    title: "Review & Submit",
    description: "Review your application details",
    icon: <FileText className="h-5 w-5" />,
    fields: [], // No validation needed for review step
  },
];

const STORAGE_KEY = "application_form_data";

export default function ApplicationStart() {
  const router = useRouter();
  const { userData, isLoading: userLoading } = useApp();
  const { institution, isLoading: isLoadingInstitution } =
    useInstitutionByUrl();

  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: "",
    lastName: "",
    otherName: "",
    dateOfBirth: "",
    gender: "",
    stateOfOrigin: "",
    localGovernment: "",
    email: "",
    phone: "",
    alternativePhone: "",
    address: "",
    city: "",
    state: "",
    // Educational Background & Academic History
    previousInstitution: "",
    institutionType: "",
    courseStudied: "",
    degreeType: "",
    degreeGrade: "",
    graduationYear: "",
    qualifications: "",
    preferredProgram: "",

    // Document Uploads
    passportPhoto: "",
    identityDocument: "",
    certificates: [],

    // Personal Details (additional)
    maritalStatus: "",
    employmentStatus: "",

    // Additional Information
    is_affiliate: false,
    bank: "",
    account_no: "",
    institution_id: "1",
    currentStep: 1,
    isComplete: false,
    lastSaved: "",
  });

  const [uiState, setUiState] = useState({
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    isSaving: false,
    error: "",
    hasUnsavedChanges: false,
    uploadingPassportPhoto: false,
    uploadingIdentityDocument: false,
    uploadingCertificates: false,
  });

  const [programs, setPrograms] = useState<any[]>([]);
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // Prepare state options for react-select
  const stateOptions = Object.keys(statesData).map((stateName) => ({
    value: stateName,
    label: stateName,
  }));

  // Get LGA options based on selected state
  const lgaOptions = React.useMemo(() => {
    if (!formData.stateOfOrigin) return [];
    return (
      statesData[formData.stateOfOrigin]?.map((lgaName: string) => ({
        value: lgaName,
        label: lgaName,
      })) || []
    );
  }, [formData.stateOfOrigin]);

  // Load saved data from database on mount
  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        const response = await fetch("/api/application/load", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setFormData(result.data);
            toast.success("Application data loaded from database!");
          } else {
            // No existing application, load from localStorage as fallback
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
              try {
                const parsed = JSON.parse(savedData);
                setFormData(parsed);
                toast.success(
                  "Previous application data restored from local storage!"
                );
              } catch (error) {
                console.error("Error parsing saved data:", error);
              }
            }
          }
        } else {
          // Fallback to localStorage if API fails
          const savedData = localStorage.getItem(STORAGE_KEY);
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData);
              setFormData(parsed);
              toast.success(
                "Previous application data restored from local storage!"
              );
            } catch (error) {
              console.error("Error parsing saved data:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading application data:", error);
        // Fallback to localStorage
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setFormData(parsed);
            toast.success(
              "Previous application data restored from local storage!"
            );
          } catch (parseError) {
            console.error("Error parsing saved data:", parseError);
          }
        }
      }

      // Mark that we've attempted to load from storage
      setHasLoadedFromStorage(true);
    };

    loadApplicationData();
    loadPrograms();
  }, []);

  // Update institution_id when institution loads from hook
  useEffect(() => {
    if (institution?.id) {
      setFormData((prev) => ({
        ...prev,
        institution_id: String(institution.id),
      }));
    } else if (!isLoadingInstitution && !institution) {
      // If loading is complete and no institution found, ensure we use ID 1
      setFormData((prev) => ({
        ...prev,
        institution_id: "1",
      }));
    }
  }, [institution, isLoadingInstitution]);

  // Auto-save functionality
  useEffect(() => {
    if (uiState.hasUnsavedChanges) {
      const timer = setTimeout(() => {
        saveProgress();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [formData, uiState.hasUnsavedChanges]);

  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const [isStateSelectReady, setIsStateSelectReady] = useState(false);

  // Mark state select as ready after a short delay to ensure it's rendered
  useEffect(() => {
    if (hasLoadedFromStorage) {
      const timer = setTimeout(() => {
        setIsStateSelectReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasLoadedFromStorage]);

  // Institution is now loaded via useInstitutionByUrl hook
  // No need for separate loadInstitution function

  const loadPrograms = async () => {
    try {
      const result = await getAllProgrammes({});
      setPrograms(result?.programmes || []);
    } catch (error) {
      console.error("Error loading programs:", error);
    }
  };

  const saveProgress = async () => {
    setUiState((prev) => ({ ...prev, isSaving: true }));

    const dataToSave = {
      ...formData,
      lastSaved: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

    // Also save to API
    try {
      const sessionId = `application_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const response = await fetch("/api/application/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          formData: dataToSave,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save progress to server");
      }
    } catch (error) {
      console.error("Error saving progress to API:", error);
      // Continue with local storage save even if API fails
    }

    setFormData((prev) => ({ ...prev, lastSaved: new Date().toISOString() }));

    // Add a small delay to show the saving state
    setTimeout(() => {
      setUiState((prev) => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
      }));
    }, 500);

    toast.success("Progress saved!", { duration: 1500 });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setUiState((prev) => ({
      ...prev,
      error: "",
      hasUnsavedChanges: true,
    }));
  };

  const handleDateChange = (
    date: Date | null | undefined,
    fieldName: string
  ) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      setFormData((prev) => ({
        ...prev,
        [fieldName]: formattedDate,
      }));

      setUiState((prev) => ({
        ...prev,
        error: "",
        hasUnsavedChanges: true,
      }));
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ilearn");
    formData.append("cloud_name", "emergingplatforms");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/emergingplatforms/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    isMultiple = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Set specific loading state based on field
    const loadingStateKey =
      fieldName === "passportPhoto"
        ? "uploadingPassportPhoto"
        : fieldName === "identityDocument"
        ? "uploadingIdentityDocument"
        : fieldName === "certificates"
        ? "uploadingCertificates"
        : null;

    if (loadingStateKey) {
      setUiState((prev) => ({ ...prev, [loadingStateKey]: true, error: "" }));
    }

    try {
      if (!isMultiple) {
        // For single file uploads
        const file = files[0];
        const uploadedUrl = await uploadToCloudinary(file);
        setFormData((prev) => ({
          ...prev,
          [fieldName]: uploadedUrl,
        }));
      } else {
        // For multiple file uploads (certificates)
        const uploadPromises = Array.from(files).map((file) =>
          uploadToCloudinary(file)
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        setFormData((prev) => ({
          ...prev,
          [fieldName]: [
            ...((prev[fieldName as keyof ApplicationFormData] as string[]) ||
              []),
            ...uploadedUrls,
          ],
        }));
      }

      if (loadingStateKey) {
        setUiState((prev) => ({
          ...prev,
          [loadingStateKey]: false,
          hasUnsavedChanges: true,
        }));
      }
    } catch (error) {
      if (loadingStateKey) {
        setUiState((prev) => ({
          ...prev,
          [loadingStateKey]: false,
          error: "Failed to upload file. Please try again.",
        }));
      }
    }
  };

  const _onParseDateFromString = (dateStr: string): Date => {
    const date = Date.parse(dateStr);
    return !isNaN(date) ? new Date(date) : new Date();
  };

  const validateStep = (stepNumber: number): boolean => {
    const step = steps.find((s) => s.id === stepNumber);
    if (!step) return false;

    const requiredFields = step.fields.filter((field) => {
      // Make affiliate fields optional unless affiliate is checked
      if (
        (field === "bank" || field === "account_no") &&
        !formData.is_affiliate
      ) {
        return false;
      }
      // Make some fields optional
      if (
        [
          "alternativePhone",
          "otherName",
          "qualifications", // Legacy field, use degreeType instead
        ].includes(field)
      ) {
        return false;
      }
      return true;
    });

    // Check each required field and build specific error message
    const missingFields: string[] = [];
    for (const field of requiredFields) {
      if (!formData[field as keyof ApplicationFormData]) {
        // Convert field names to readable format
        const readableFieldName = field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .replace("Of", "of");
        missingFields.push(readableFieldName);
      }
    }

    if (missingFields.length > 0) {
      setUiState((prev) => ({
        ...prev,
        error: `Please fill in the following required fields: ${missingFields.join(
          ", "
        )}`,
      }));
      return false;
    }

    // Validate file uploads for step 3 (now Educational Background)
    if (stepNumber === 3) {
      if (!formData.passportPhoto) {
        setUiState((prev) => ({
          ...prev,
          error: "Please upload your passport photograph",
        }));
        return false;
      }

      if (!formData.identityDocument) {
        setUiState((prev) => ({
          ...prev,
          error: "Please upload an identity document",
        }));
        return false;
      }

      if (!formData.certificates || formData.certificates.length === 0) {
        setUiState((prev) => ({
          ...prev,
          error: "Please upload at least one academic certificate",
        }));
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(formData.currentStep)) {
      saveProgress();
      setFormData((prev) => ({
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, steps.length),
      }));
    }
  };

  const prevStep = () => {
    setFormData((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const submitApplication = async () => {
    if (!validateStep(5)) return;

    // Check if user data is still loading
    if (userLoading) {
      toast.error("Please wait while we verify your authentication...");
      return;
    }

    setUiState((prev) => ({ ...prev, isLoading: true, error: "" }));

    try {
      // Get current user ID from AppContext
      if (!userData || !userData.id) {
        throw new Error("User not authenticated. Please login again.");
      }

      const userId = userData.id.toString();
      // Create/update student profile for logged-in user
      const studentData = {
        // User ID (required)
        user_id: userId,

        // Personal Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        otherName: formData.otherName,
        email: formData.email,
        phone: formData.phone,
        alternativePhone: formData.alternativePhone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        stateOfOrigin: formData.stateOfOrigin,
        localGovernment: formData.localGovernment,
        maritalStatus: formData.maritalStatus,
        employmentStatus: formData.employmentStatus,

        // Contact Information
        address: formData.address,
        city: formData.city,
        state: formData.state,

        // Academic Information
        previousInstitution: formData.previousInstitution,
        institutionType: formData.institutionType,
        courseStudied: formData.courseStudied,
        degreeType: formData.degreeType,
        degreeGrade: formData.degreeGrade,
        graduationYear: formData.graduationYear,

        // Program Selection
        preferredProgram: formData.preferredProgram,

        // Documents
        passportPhoto: formData.passportPhoto,
        identityDocument: formData.identityDocument,
        certificates: formData.certificates,

        // Additional Information
        institution_id: formData.institution_id,
      };

      const studentResult = await postStudent(studentData);

      if (!studentResult?.newStudent?.id) {
        throw new Error("Failed to save student application");
      }

      // Update user avatar if passport photo is provided
      if (formData.passportPhoto && formData.passportPhoto.trim() !== "") {
        try {
          const { updateUserAvatar } = await import(
            "../../../helpers/FetchWrapper"
          );
          await updateUserAvatar(formData.passportPhoto, userId);
        } catch (avatarError) {
          console.error("Error updating user avatar:", avatarError);
          // Continue even if avatar update fails
        }
      }

      // Create affiliate record if requested
      if (formData.is_affiliate && formData.bank && formData.account_no) {
        await postAffiliate({
          user_id: studentResult.newStudent.id,
          bank: formData.bank,
          account_no: formData.account_no,
        });
      }

      // Clear saved data
      localStorage.removeItem(STORAGE_KEY);

      // Mark as complete
      setFormData((prev) => ({ ...prev, isComplete: true }));

      toast.success(
        "Application submitted successfully! Your application is now under review."
      );

      // Redirect to applicant dashboard
      setTimeout(() => {
        router.push("/applicant");
      }, 2000);
    } catch (error) {
      console.error("Application submission error:", error);
      setUiState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit application",
      }));
    }
  };

  const currentStepData = steps.find(
    (step) => step.id === formData.currentStep
  );
  const progress = (formData.currentStep / steps.length) * 100;

  // Show loading state while user data is being loaded
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="max-w-md text-center backdrop-blur-xl bg-white/80">
          <div className="p-8 space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Verifying Authentication
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your login status...
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Redirect to signin if user is not authenticated
  if (!userData) {
    router.push("/signin?redirect=apply/start");
    return null;
  }

  if (formData.isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="max-w-md text-center backdrop-blur-xl bg-white/80">
          <div className="p-8 space-y-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Application Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                Your application has been submitted and is now under review. Our
                admissions team will carefully review your application and get
                back to you with a decision.
              </p>
              <p className="text-sm text-gray-500">
                You will receive an email notification once your application has
                been reviewed. Please check your email regularly for updates.
              </p>
            </div>
            <Button
              onClick={() => router.push("/signin?logout=1")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Return to Sign In
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Application Form
          </h1>
          <p className="text-gray-600">
            Step {formData.currentStep} of {steps.length}:{" "}
            {currentStepData?.title}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Progress</span>
            <div className="flex items-center gap-2">
              {uiState.isSaving && (
                <>
                  <Save className="h-4 w-4 text-blue-500 animate-pulse" />
                  <span className="text-sm text-blue-600">Saving...</span>
                </>
              )}
              {formData.lastSaved && !uiState.isSaving && (
                <span className="text-sm text-green-600">
                  Last saved:{" "}
                  {new Date(formData.lastSaved).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2" />

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= formData.currentStep
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step.id < formData.currentStep
                      ? "bg-blue-600 border-blue-600 text-white"
                      : step.id === formData.currentStep
                      ? "border-blue-600 bg-white text-blue-600"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {step.id < formData.currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-xs mt-1 text-center max-w-20">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <GlassCard className="backdrop-blur-xl bg-white/80 border-white/50 shadow-2xl">
          {uiState.error && (
            <Alert
              variant="destructive"
              className="mb-6 bg-red-50 border-red-200"
            >
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {uiState.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {currentStepData?.icon}
              {currentStepData?.title}
            </h2>
            <p className="text-gray-600 mt-1">{currentStepData?.description}</p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Personal Information */}
            {formData.currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="bg-white/70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="bg-white/70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="otherName">Other Name</Label>
                    <Input
                      id="otherName"
                      name="otherName"
                      value={formData.otherName}
                      onChange={handleChange}
                      placeholder="Enter your other name"
                      className="bg-white/70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <DatePickerNoSSR
                      value={
                        formData.dateOfBirth
                          ? new Date(formData.dateOfBirth)
                          : new Date()
                      }
                      isRequired={true}
                      placeholder="Select your date of birth..."
                      ariaLabel="Select your date of birth"
                      minDate={new Date("1900-01-01")}
                      allowTextInput={true}
                      onSelectDate={(date) =>
                        handleDateChange(date, "dateOfBirth")
                      }
                      parseDateFromString={_onParseDateFromString}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="stateOfOrigin">State of Origin *</Label>
                    <SelectNoSSR
                      key={`state-${formData.stateOfOrigin}`}
                      options={stateOptions}
                      value={stateOptions.find(
                        (option) => option.value === formData.stateOfOrigin
                      )}
                      onChange={(
                        selectedOption: { value: string; label: string } | null
                      ) => {
                        setFormData((prev) => ({
                          ...prev,
                          stateOfOrigin: selectedOption?.value || "",
                        }));
                        setUiState((prev) => ({
                          ...prev,
                          hasUnsavedChanges: true,
                        }));
                      }}
                      placeholder="Select your state"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          borderColor: state.isFocused ? "#60a5fa" : "#d1d5db",
                          boxShadow: state.isFocused
                            ? "0 0 0 1px #60a5fa"
                            : "none",
                          "&:hover": {
                            borderColor: "#60a5fa",
                          },
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? "#3b82f6"
                            : state.isFocused
                            ? "#dbeafe"
                            : "white",
                          color: state.isSelected ? "white" : "#374151",
                        }),
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="localGovernment">
                    Local Government Area *
                  </Label>
                  {isStateSelectReady ? (
                    <SelectNoSSR
                      key={`lga-${formData.stateOfOrigin}-${formData.localGovernment}`}
                      options={lgaOptions}
                      value={lgaOptions.find(
                        (option: { value: string; label: string }) =>
                          option.value === formData.localGovernment
                      )}
                      onChange={(
                        selectedOption: { value: string; label: string } | null
                      ) => {
                        setFormData((prev) => ({
                          ...prev,
                          localGovernment: selectedOption?.value || "",
                        }));
                        setUiState((prev) => ({
                          ...prev,
                          hasUnsavedChanges: true,
                        }));
                      }}
                      placeholder={
                        formData.stateOfOrigin
                          ? "Select your LGA"
                          : "Select state first"
                      }
                      isDisabled={!formData.stateOfOrigin}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          borderColor: state.isFocused ? "#60a5fa" : "#d1d5db",
                          boxShadow: state.isFocused
                            ? "0 0 0 1px #60a5fa"
                            : "none",
                          "&:hover": {
                            borderColor: "#60a5fa",
                          },
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? "#3b82f6"
                            : state.isFocused
                            ? "#dbeafe"
                            : "white",
                          color: state.isSelected ? "white" : "#374151",
                        }),
                      }}
                    />
                  ) : (
                    <div className="h-10 bg-white/70 border border-gray-200 rounded-md flex items-center px-3 text-gray-500">
                      Loading LGA options...
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maritalStatus">Marital Status *</Label>
                    <select
                      id="maritalStatus"
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Marital Status</option>
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="DIVORCED">Divorced</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="employmentStatus">
                      Employment Status *
                    </Label>
                    <select
                      id="employmentStatus"
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Employment Status</option>
                      <option value="UNEMPLOYED">Unemployed</option>
                      <option value="EMPLOYED">Employed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {formData.currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="bg-white/70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+234 xxx xxx xxxx"
                      className="bg-white/70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="alternativePhone">Alternative Phone</Label>
                    <Input
                      id="alternativePhone"
                      name="alternativePhone"
                      type="tel"
                      value={formData.alternativePhone}
                      onChange={handleChange}
                      placeholder="Alternative contact"
                      className="bg-white/70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter your city"
                      className="bg-white/70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <SelectNoSSR
                      key={`contact-state-${formData.state}`}
                      options={stateOptions}
                      value={stateOptions.find(
                        (option) => option.value === formData.state
                      )}
                      onChange={(
                        selectedOption: { value: string; label: string } | null
                      ) => {
                        setFormData((prev) => ({
                          ...prev,
                          state: selectedOption?.value || "",
                        }));
                        setUiState((prev) => ({
                          ...prev,
                          hasUnsavedChanges: true,
                        }));
                      }}
                      placeholder="Select your state"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          borderColor: state.isFocused ? "#60a5fa" : "#d1d5db",
                          boxShadow: state.isFocused
                            ? "0 0 0 1px #60a5fa"
                            : "none",
                          "&:hover": {
                            borderColor: "#60a5fa",
                          },
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? "#3b82f6"
                            : state.isFocused
                            ? "#dbeafe"
                            : "white",
                          color: state.isSelected ? "white" : "#374151",
                        }),
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      className="bg-white/70"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Educational Background & Documents */}
            {formData.currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Academic History
                  </h3>

                  <div>
                    <Label htmlFor="previousInstitution">
                      Name of Institution *
                    </Label>
                    <Input
                      id="previousInstitution"
                      name="previousInstitution"
                      value={formData.previousInstitution}
                      onChange={handleChange}
                      placeholder="Name of your previous school/university"
                      className="bg-white/70"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institutionType">
                        Type of Institution *
                      </Label>
                      <select
                        id="institutionType"
                        name="institutionType"
                        value={formData.institutionType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Institution Type</option>
                        <option value="University">University</option>
                        <option value="Polytechnic">Polytechnic</option>
                        <option value="College of Education">
                          College of Education
                        </option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="courseStudied">Course of Study *</Label>
                      <Input
                        id="courseStudied"
                        name="courseStudied"
                        value={formData.courseStudied}
                        onChange={handleChange}
                        placeholder="e.g., Computer Science"
                        className="bg-white/70"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="degreeType">Type of Degree *</Label>
                      <select
                        id="degreeType"
                        name="degreeType"
                        value={formData.degreeType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Degree Type</option>
                        <option value="BSc">BSc</option>
                        <option value="MSc">MSc</option>
                        <option value="HND">HND</option>
                        <option value="B.A">B.A</option>
                        <option value="B.ENG">B.ENG</option>
                        <option value="B.PHARM">B.PHARM</option>
                        <option value="BSc (ED)">BSc (ED)</option>
                        <option value="MBBS">MBBS</option>
                        <option value="B.TECH">B.TECH</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="degreeGrade">Grade *</Label>
                      <select
                        id="degreeGrade"
                        name="degreeGrade"
                        value={formData.degreeGrade}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Grade</option>
                        <option value="First Class">First Class</option>
                        <option value="Second Class Upper">
                          Second Class Upper
                        </option>
                        <option value="Second Class Lower">
                          Second Class Lower
                        </option>
                        <option value="Third Class">Third Class</option>
                        <option value="Upper Credit">Upper Credit</option>
                        <option value="Lower Credit">Lower Credit</option>
                        <option value="Distinction">Distinction</option>
                        <option value="Merit">Merit</option>
                        <option value="Pass">Pass</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="graduationYear">Graduation Year *</Label>
                      <DatePickerNoSSR
                        value={
                          formData.graduationYear
                            ? new Date(formData.graduationYear)
                            : new Date()
                        }
                        isRequired={true}
                        placeholder="Select graduation year..."
                        ariaLabel="Select graduation year"
                        maxDate={new Date()}
                        minDate={new Date(1950, 0, 1)}
                        allowTextInput={true}
                        onSelectDate={(date) =>
                          handleDateChange(date, "graduationYear")
                        }
                        parseDateFromString={_onParseDateFromString}
                        styles={{
                          root: { width: "100%" },
                          textField: {
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            outline: "none",
                            "&:hover": { borderColor: "#60a5fa" },
                            "&:focus-within": {
                              borderColor: "#60a5fa",
                              boxShadow: "0 0 0 1px #60a5fa",
                              outline: "none",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800">
                    Document Uploads
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="passportPhoto">Profile Photo *</Label>
                      <div
                        className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() =>
                          document.getElementById("passportPhoto")?.click()
                        }
                      >
                        <input
                          type="file"
                          id="passportPhoto"
                          accept="image/jpeg,image/png"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "passportPhoto")}
                        />
                        <div className="text-center">
                          {uiState.uploadingPassportPhoto ? (
                            <div className="space-y-2">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                              <div className="text-blue-600 text-sm">
                                Uploading photo...
                              </div>
                            </div>
                          ) : formData.passportPhoto ? (
                            <div className="space-y-2">
                              <img
                                src={formData.passportPhoto}
                                alt="Profile"
                                className="h-20 w-20 object-cover mx-auto rounded cursor-pointer hover:opacity-80"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewDocument({
                                    url: formData.passportPhoto,
                                    name: "Profile Photo",
                                  });
                                }}
                              />
                              <div className="text-green-600 text-sm">
                                ✓ Photo uploaded (click to preview)
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-gray-500 text-sm">
                                Click to upload or drag and drop
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                JPG, PNG up to 2MB
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="identityDocument">
                        Identity Document *
                      </Label>
                      <div
                        className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() =>
                          document.getElementById("identityDocument")?.click()
                        }
                      >
                        <input
                          type="file"
                          id="identityDocument"
                          accept="image/jpeg,image/png,application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e, "identityDocument")
                          }
                        />
                        <div className="text-center">
                          {uiState.uploadingIdentityDocument ? (
                            <div className="space-y-2">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                              <div className="text-blue-600 text-sm">
                                Uploading document...
                              </div>
                            </div>
                          ) : formData.identityDocument ? (
                            <div className="space-y-2">
                              <div
                                className="text-green-600 text-sm cursor-pointer hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewDocument({
                                    url: formData.identityDocument,
                                    name: "Identity Document",
                                  });
                                }}
                              >
                                ✓ Document uploaded (click to preview)
                              </div>
                              <div className="text-xs text-gray-500">
                                Click box to change
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-gray-500 text-sm">
                                Click to upload or drag and drop
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Voter's Card, International Passport, or
                                Driver's License
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="certificates">
                      Academic Certificates *
                    </Label>
                    <div
                      className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() =>
                        document.getElementById("certificates")?.click()
                      }
                    >
                      <input
                        type="file"
                        id="certificates"
                        accept="image/jpeg,image/png,application/pdf"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, "certificates", true)
                        }
                      />
                      <div className="text-center">
                        {uiState.uploadingCertificates ? (
                          <div className="space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <div className="text-blue-600 text-sm">
                              Uploading certificates...
                            </div>
                          </div>
                        ) : formData.certificates &&
                          formData.certificates.length > 0 ? (
                          <div className="space-y-2">
                            <div className="text-green-600 text-sm">
                              ✓ {formData.certificates.length} certificate(s)
                              uploaded
                            </div>
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                              {formData.certificates.map((cert, index) => (
                                <div
                                  key={index}
                                  className="text-xs text-blue-600 cursor-pointer hover:underline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewDocument({
                                      url: cert,
                                      name: `Certificate ${index + 1}`,
                                    });
                                  }}
                                >
                                  📄 Certificate {index + 1} (click to preview)
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500">
                              Click box to add more
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-gray-500 text-sm">
                              Click to upload or drag and drop multiple files
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Upload all relevant certificates (PDF, JPG, PNG up
                              to 5MB each)
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Program Selection */}
            {formData.currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preferredProgram">Preferred Program *</Label>
                  <select
                    id="preferredProgram"
                    name="preferredProgram"
                    value={formData.preferredProgram}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {formData.currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Application Review
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Please review your application details before submitting.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Personal Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Name:</span>{" "}
                          {formData.firstName} {formData.otherName}{" "}
                          {formData.lastName}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {formData.email}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {formData.phone}
                        </p>
                        <p>
                          <span className="font-medium">Gender:</span>{" "}
                          {formData.gender}
                        </p>
                        <p>
                          <span className="font-medium">Date of Birth:</span>{" "}
                          {formData.dateOfBirth}
                        </p>
                        <p>
                          <span className="font-medium">State of Origin:</span>{" "}
                          {formData.stateOfOrigin}
                        </p>
                        <p>
                          <span className="font-medium">LGA:</span>{" "}
                          {formData.localGovernment}
                        </p>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Academic History
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">
                            Previous Institution:
                          </span>{" "}
                          {formData.previousInstitution}
                        </p>
                        <p>
                          <span className="font-medium">Institution Type:</span>{" "}
                          {formData.institutionType}
                        </p>
                        <p>
                          <span className="font-medium">Course Studied:</span>{" "}
                          {formData.courseStudied}
                        </p>
                        <p>
                          <span className="font-medium">Degree Type:</span>{" "}
                          {formData.degreeType}
                        </p>
                        <p>
                          <span className="font-medium">Grade:</span>{" "}
                          {formData.degreeGrade}
                        </p>
                        <p>
                          <span className="font-medium">Graduation Year:</span>{" "}
                          {formData.graduationYear}
                        </p>
                      </div>
                    </div>

                    {/* Program Selection */}
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Program Selection
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Selected Program:</span>{" "}
                          {programs.find(
                            (p) =>
                              p.id.toString() ===
                              formData.preferredProgram.toString()
                          )?.name || "Not selected"}
                        </p>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Documents Uploaded
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Profile Photo:</span>{" "}
                          {formData.passportPhoto
                            ? "✓ Uploaded"
                            : "✗ Not uploaded"}
                        </p>
                        <p>
                          <span className="font-medium">
                            Identity Document:
                          </span>{" "}
                          {formData.identityDocument
                            ? "✓ Uploaded"
                            : "✗ Not uploaded"}
                        </p>
                        <p>
                          <span className="font-medium">Certificates:</span>{" "}
                          {formData.certificates.length > 0
                            ? `✓ ${formData.certificates.length} file(s)`
                            : "✗ Not uploaded"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
            <div className="flex items-center gap-4">
              {formData.currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={saveProgress}
                disabled={uiState.isSaving}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  uiState.isSaving
                    ? "text-blue-500 cursor-not-allowed"
                    : uiState.hasUnsavedChanges
                    ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                    : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                }`}
              >
                {uiState.isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      className={`h-4 w-4 ${
                        uiState.hasUnsavedChanges ? "animate-pulse" : ""
                      }`}
                    />
                    {uiState.hasUnsavedChanges
                      ? "Save Changes"
                      : "Save Progress"}
                  </>
                )}
              </Button>
            </div>

            {formData.currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={submitApplication}
                disabled={uiState.isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600"
              >
                {uiState.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </GlassCard>

        {/* Document Preview Modal */}
        {previewDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {previewDocument.name}
                </h3>
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                {previewDocument.url.toLowerCase().includes(".pdf") ? (
                  <iframe
                    src={previewDocument.url}
                    className="w-full h-96"
                    title={previewDocument.name}
                  />
                ) : (
                  <img
                    src={previewDocument.url}
                    alt={previewDocument.name}
                    className="max-w-full max-h-96 mx-auto"
                  />
                )}
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
