"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { GlassCard } from "../../components/ui/glass-card";
import { OptimizedDynamicBackground } from "../../components/ui/webgl-mesh-gradient";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
    User,
    Mail,
    Lock,
    Phone,
    Eye,
    EyeOff,
    AlertTriangle,
    GraduationCap, UserCheck
} from "lucide-react";
import {
    verifyRefCode,
    getInstituionByParams,
} from "../../helpers/FetchWrapper";
import { userNameValid } from "../../helpers/utils";
import { registerUser } from "./action";

interface ApplyState {
  username: string;
  password: string;
  confirmPassword: string;
  lastName: string;
  firstName: string;
  otherName: string;
  phone: string;
  email: string;
  referral_code: string;
  is_affiliate: boolean;
  bank: string;
  account_no: string;
  institution_id: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  error?: string;
  institution?: any;
}

function ApplyComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = React.useState<ApplyState>({
    username: "",
    password: "",
    confirmPassword: "",
    lastName: "",
    firstName: "",
    otherName: "",
    phone: "",
    email: "",
    referral_code: searchParams?.get("referrerCode") || "",
    is_affiliate: false,
    bank: "",
    account_no: "",
    institution_id: "1",
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    error: undefined,
    institution: null,
  });

  React.useEffect(() => {
    const loadInstitution = async () => {
      try {
        const institution = await getInstituionByParams({ id: "1" }, {});
        setState((prev) => ({
          ...prev,
          institution,
          institution_id: institution.id,
        }));
      } catch (error) {
        console.error("Error loading institution:", error);
      }
    };

    loadInstitution();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      error: undefined, // Clear error when user starts typing
    }));
  };

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    setState((prev) => ({
      ...prev,
      [`show${field.charAt(0).toUpperCase() + field.slice(1)}`]:
        !prev[
          `show${
            field.charAt(0).toUpperCase() + field.slice(1)
          }` as keyof ApplyState
        ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Validation checks
      if (state.password !== state.confirmPassword) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Your password and confirm password fields must match",
        }));
        return;
      }

      if (!userNameValid(state.username)) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            "Only lowercase alphabets and numbers can be in your username.",
        }));
        return;
      }

      if (state.referral_code && state.referral_code === state.username) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Your username must be different from your Referral code",
        }));
        return;
      }

      // Verify referral code if provided
      if (state.referral_code) {
        const verification = await verifyRefCode(
          state.referral_code.toLowerCase()
        );

        if (verification.status !== 200) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error:
              "This Referral code does not exist. Kindly enter a correct Referral code or leave the field empty",
          }));
          return;
        }
      }

      // Use the new server action for registration
      const result = await registerUser({
        firstName: state.firstName,
        lastName: state.lastName,
        otherName: state.otherName,
        username: state.username,
        email: state.email,
        phone: state.phone,
        password: state.password,
        referral_code: state.referral_code,
        is_affiliate: state.is_affiliate,
        bank: state.bank,
        account_no: state.account_no,
        institution_id: state.institution_id,
      });

      if (result.success) {
        toast.success(
          "Registration successful! You have been automatically logged in. Please check your email for account verification instructions."
        );

        // Redirect to application start page
        router.push("/apply/start");
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            result.error ||
            "An error occurred during registration. Please try again.",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Network error. Please try again.",
      }));
    }
  };

  return (
    <OptimizedDynamicBackground>
      <div className="flex items-center justify-center p-4 relative min-h-[calc(100vh-8rem)]">
        {/* Centralized Content Container */}
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Information */}
          <div className="text-center lg:text-left space-y-8">
            {/* Institution Logo */}
            <div className="flex justify-center lg:justify-start">
              {state.institution?.logo && (
                <img
                  className="h-20 w-auto animate-fade-in"
                  src={state.institution.logo}
                  alt="Institution Logo"
                />
              )}
            </div>

            {/* Welcome Text */}
            <div
              className="space-y-4 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                Join{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                  {state.institution?.name || "iLearn"}
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Start your educational journey with us. Apply now to access
                world-class programs and unlock your potential.
              </p>
            </div>

            {/* Information Points */}
            <div
              className="space-y-4 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <h3 className="font-semibold text-gray-800 mb-2">
                  📋 Required Documents
                </h3>
                <p className="text-sm text-gray-600">
                  Professional passport photograph, International Passport,
                  Voter's ID Card, or Driver's License
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <h3 className="font-semibold text-gray-800 mb-2">
                  ✉️ Email Verification
                </h3>
                <p className="text-sm text-gray-600">
                  After registration, check your email for verification
                  instructions
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div
              className="hidden lg:flex items-center space-x-4 animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg">📚</span>
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">🎓</span>
              </div>
            </div>

            {/* Mobile Institution Name */}
            <div className="lg:hidden">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Apply Now
              </h2>
              <p className="text-gray-600">
                Fill out the form to start your application
              </p>
            </div>
          </div>

          {/* Right Side - Application Form */}
          <div className="w-full max-w-2xl mx-auto lg:mx-0">
            {/* Desktop Form Header */}
            <div
              className="hidden lg:block mb-8 text-center animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Apply Now
              </h2>
              <p className="text-gray-600">
                Fill out all fields to complete your application
              </p>
            </div>

            {/* Application Form */}
            <GlassCard
              className="backdrop-blur-xl bg-white/80 border-white/50 shadow-2xl animate-slide-up max-h-[80vh] overflow-y-auto"
              style={{ animationDelay: "0.4s" }}
            >
              {state.error && (
                <Alert
                  variant="destructive"
                  className="mb-6 bg-red-50 border-red-200"
                >
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {state.error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Personal Information
                  </h3>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-gray-700 font-medium"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={state.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        disabled={state.isLoading}
                        className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-gray-700 font-medium"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={state.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        disabled={state.isLoading}
                        className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                  </div>

                  {/* Other Name and Username */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="otherName"
                        className="text-gray-700 font-medium"
                      >
                        Other Name
                      </Label>
                      <Input
                        id="otherName"
                        name="otherName"
                        type="text"
                        required
                        value={state.otherName}
                        onChange={handleChange}
                        placeholder="Enter your other name"
                        disabled={state.isLoading}
                        className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="text-gray-700 font-medium"
                      >
                        Username
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={state.username}
                        onChange={handleChange}
                        placeholder="lowercase letters and numbers only"
                        disabled={state.isLoading}
                        className={`bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20 ${
                          state.username && !userNameValid(state.username)
                            ? "border-red-400 focus:border-red-400"
                            : ""
                        }`}
                      />
                      {state.username && !userNameValid(state.username) && (
                        <p className="text-sm text-red-600">
                          lowercase alphabets and numbers only
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-gray-700 font-medium flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4 text-blue-500" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={state.showPassword ? "text" : "password"}
                          required
                          value={state.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          disabled={state.isLoading}
                          className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("password")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-500 transition-colors"
                        >
                          {state.showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-gray-700 font-medium"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={state.showConfirmPassword ? "text" : "password"}
                          required
                          value={state.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          disabled={state.isLoading}
                          className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("confirmPassword")
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-500 transition-colors"
                        >
                          {state.showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-green-500" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4 text-blue-500" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={state.email}
                        onChange={handleChange}
                        placeholder="We will send login details to you"
                        disabled={state.isLoading}
                        className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-gray-700 font-medium flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-blue-500" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={state.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        disabled={state.isLoading}
                        className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="referral_code"
                      className="text-gray-700 font-medium flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4 text-purple-500" />
                      Referrer's Code (Optional)
                    </Label>
                    <Input
                      id="referral_code"
                      name="referral_code"
                      type="text"
                      value={state.referral_code}
                      onChange={handleChange}
                      placeholder="Enter referrer's code if you were referred"
                      disabled={
                        state.isLoading || !!searchParams?.get("referrerCode")
                      }
                      className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </div>
                </div>

                {/* Affiliate Program Section */}
                {/* <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_affiliate"
                      name="is_affiliate"
                      checked={state.is_affiliate}
                      onCheckedChange={(checked) =>
                        setState((prev) => ({
                          ...prev,
                          is_affiliate: !!checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="is_affiliate"
                      className="text-gray-700 font-medium flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4 text-orange-500" />
                      Join Affiliate Program
                    </Label>
                  </div>

                  {state.is_affiliate && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="space-y-2">
                        <Label
                          htmlFor="bank"
                          className="text-gray-700 font-medium flex items-center gap-2"
                        >
                          <Building2 className="h-4 w-4 text-orange-500" />
                          Bank Name
                        </Label>
                        <Input
                          id="bank"
                          name="bank"
                          type="text"
                          required={state.is_affiliate}
                          value={state.bank}
                          onChange={handleChange}
                          placeholder="Enter your bank name"
                          disabled={state.isLoading}
                          className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-orange-400 focus:ring-orange-400/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="account_no"
                          className="text-gray-700 font-medium"
                        >
                          Account Number
                        </Label>
                        <Input
                          id="account_no"
                          name="account_no"
                          type="text"
                          required={state.is_affiliate}
                          value={state.account_no}
                          onChange={handleChange}
                          placeholder="Enter your account number"
                          disabled={state.isLoading}
                          className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-orange-400 focus:ring-orange-400/20"
                        />
                      </div>
                    </div>
                  )}
                </div> */}

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                    size="lg"
                    disabled={state.isLoading}
                  >
                    {state.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Application...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>

                {/* Login Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/signin"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Sign In Here
                    </Link>
                  </p>
                </div>

                {/* Support Info */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    For any questions or concerns, send an email to{" "}
                    <strong className="text-blue-600">
                      support.cdel@unn.edu.ng
                    </strong>
                  </p>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </OptimizedDynamicBackground>
  );
}

export default function Apply() {
  return (
    <Suspense
      fallback={
        <OptimizedDynamicBackground>
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </OptimizedDynamicBackground>
      }
    >
      <ApplyComponent />
    </Suspense>
  );
}
