"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { GlassCard } from "../../components/ui/glass-card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
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
  isLoadingInstitution: boolean;
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
    isLoadingInstitution: true,
    error: undefined,
    institution: null,
  });

  React.useEffect(() => {
    const loadInstitution = async () => {
      try {
        setState((prev) => ({ ...prev, isLoadingInstitution: true }));

        // Get current URL from window location
        const currentUrl =
          typeof window !== "undefined" ? window.location.origin : "";

        // Try to fetch by URL first, fallback to ID if URL fails
        let institution: any = null;
        if (currentUrl) {
          try {
            institution = await getInstituionByParams({ url: currentUrl }, {});
          } catch (urlError) {
            console.warn(
              "Failed to fetch institution by URL, trying ID:",
              urlError
            );
          }
        }

        // Check if institution is valid (has id property)
        const hasValidId =
          institution &&
          typeof institution === "object" &&
          "id" in institution &&
          institution.id;

        // Fallback to ID if URL lookup failed or returned empty
        if (!hasValidId) {
          institution = await getInstituionByParams({ id: "1" }, {});
        }

        // Ensure we have a valid institution object
        const isValidInstitution =
          institution &&
          typeof institution === "object" &&
          "id" in institution &&
          institution.id;

        if (isValidInstitution) {
          setState((prev) => ({
            ...prev,
            institution,
            institution_id: String(institution.id || "1"),
            isLoadingInstitution: false,
          }));
        } else {
          console.error("Invalid institution data received:", institution);
          setState((prev) => ({
            ...prev,
            isLoadingInstitution: false,
          }));
        }
      } catch (error) {
        console.error("Error loading institution:", error);
        setState((prev) => ({
          ...prev,
          isLoadingInstitution: false,
        }));
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
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,118,110,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(15,118,110,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-teal-100/50 blur-3xl" />
      <div className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight">
                Start your application with confidence
              </h2>
              <p className="text-lg text-slate-600 max-w-xl">
                Complete your profile, verify your email, and unlock the next
                step in your academic journey.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
              <Image
                src="/images/a-group-of-three-african-american-students.jpg"
                alt="Prospective students collaborating"
                width={620}
                height={420}
                className="w-full rounded-xl object-cover"
                priority
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  Required documents
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Passport photo, International Passport, Voter ID, or Driver's
                  License.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-teal-600" />
                  Email verification
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  We'll send a verification link after registration.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-2xl mx-auto lg:mx-0">
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Apply now
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">
                Create your account
              </h2>
              <p className="text-slate-600">
                Fill out all fields to complete your application
              </p>
            </div>

            <GlassCard className="border-slate-200 bg-white/90 shadow-xl max-h-[80vh] overflow-y-auto">
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
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-teal-600" />
                    Personal Information
                  </h3>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-slate-700 font-medium"
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
                        className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-slate-700 font-medium"
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
                        className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>
                  </div>

                  {/* Other Name and Username */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="otherName"
                        className="text-slate-700 font-medium"
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
                        className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="text-slate-700 font-medium"
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
                        className={`bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20 ${
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
                        className="text-slate-700 font-medium flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4 text-teal-600" />
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
                          className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("password")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-teal-600 transition-colors"
                        >
                          {state.showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-slate-700 font-medium"
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
                          className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("confirmPassword")
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-teal-600 transition-colors"
                        >
                          {state.showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-teal-600" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-slate-700 font-medium flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4 text-teal-600" />
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
                        className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-slate-700 font-medium flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-teal-600" />
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
                        className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="referral_code"
                      className="text-slate-700 font-medium flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4 text-teal-600" />
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
                      className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
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
                    className="w-full bg-teal-600 text-white font-semibold border-0 shadow-lg hover:bg-teal-700 transition-all"
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
                <div className="text-center pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link
                      href="/signin"
                      className="text-teal-700 hover:text-teal-900 font-medium"
                    >
                      Sign In Here
                    </Link>
                  </p>
                </div>

                {/* Support Info */}
                {state.institution?.support_mail || state.institution?.email ? (
                  <div className="text-center pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      For any questions or concerns, send an email to{" "}
                      <strong className="text-teal-700">
                        {state.institution?.support_mail ||
                          state.institution?.email}
                      </strong>
                    </p>
                  </div>
                ) : null}
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Apply() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ApplyComponent />
    </Suspense>
  );
}
