"use client";

import React, { Suspense } from "react";
import { removeCookies } from "cookies-next";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { GlassCard } from "../../components/ui/glass-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  getAuthData,
  getInstituionByParams,
  resetPassword,
  sendForgotPasswordLink,
} from "../../helpers/FetchWrapper";
import { useApp } from "../../contexts/AppContext";

interface SigninState {
  resetCode?: string;
  resetPasswordDialogOpen: boolean;
  forgotPasswordDialogOpen: boolean;
  toDashboard: boolean;
  url: string;
  email: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
  verification?: string;
  institution?: any;
  showPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  error?: string;
  verificationDialogOpen: boolean;
  rememberMe: boolean;
}

const GeneratedIllustration = () => (
  <svg
    viewBox="0 0 520 360"
    className="w-full h-full"
    role="img"
    aria-label="Learning campus illustration"
  >
    <defs>
      <linearGradient id="panel" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f1f5f9" />
      </linearGradient>
    </defs>
    <rect x="30" y="30" width="460" height="300" rx="26" fill="url(#panel)" />
    <rect x="60" y="70" width="160" height="120" rx="16" fill="#e2e8f0" />
    <rect x="250" y="70" width="210" height="56" rx="14" fill="#e2e8f0" />
    <rect x="250" y="140" width="210" height="56" rx="14" fill="#e2e8f0" />
    <rect x="60" y="210" width="400" height="32" rx="12" fill="#dbeafe" />
    <rect x="60" y="255" width="280" height="32" rx="12" fill="#ccfbf1" />
    <circle cx="110" cy="120" r="26" fill="#0f766e" />
    <circle cx="160" cy="120" r="26" fill="#14b8a6" opacity="0.9" />
    <circle cx="135" cy="150" r="10" fill="#99f6e4" />
    <path
      d="M320 248c26 0 46 10 60 30H260c14-20 34-30 60-30z"
      fill="#0f766e"
      opacity="0.2"
    />
    <path
      d="M120 246c22 0 38 8 50 24H70c12-16 28-24 50-24z"
      fill="#2563eb"
      opacity="0.2"
    />
  </svg>
);

function SigninComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appContext = useApp();

  if (!searchParams) {
    return null;
  }

  const [state, setState] = React.useState<SigninState>({
    resetCode: searchParams.get("resetPassword") || undefined,
    resetPasswordDialogOpen: !!searchParams.get("resetPassword"),
    forgotPasswordDialogOpen: !!searchParams.get("forgotPassword"),
    toDashboard: false,
    url: "/signin",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    verification: searchParams.get("verification") || undefined,
    institution: null,
    showPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    error: undefined,
    verificationDialogOpen: false,
    rememberMe: false,
  });

  React.useEffect(() => {
    const checkAuthAndLoadInstitution = async () => {
      // Handle logout
      if (searchParams.get("logout")) {
        try {
          // Call backend to delete httpOnly cookies
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Error calling logout API:", error);
        }

        // Clear client-side cookies
        const cookieOptions = { path: "/" };
        removeCookies(null, "userData", cookieOptions);
        removeCookies(null, "role", cookieOptions);
        removeCookies(null, "userId", cookieOptions);
        removeCookies(null, "institutionId", cookieOptions);

        // Clear context
        if (appContext?.clearAuthCookies) {
          await appContext.clearAuthCookies();
        }

        // Clear local state
        setState((prev) => ({
          ...prev,
          email: "",
          password: "",
          error: undefined,
        }));

        return;
      }

      try {
        // Load institution data
        const institution = await getInstituionByParams({ id: "1" }, {});
        setState((prev) => ({ ...prev, institution }));

        // Check if user is already authenticated
        const authData = await getAuthData(null);
        const { userRole } = authData || {};

        if (userRole) {
          let redirectUrl = "/signin";

          if (userRole === "APPLICANT") {
            redirectUrl = "/applicant";
          } else if (userRole === "STUDENT") {
            redirectUrl = "/students";
          } else if (userRole === "STAFF" || userRole === "LECTURER") {
            redirectUrl = "/staff";
          } else if (userRole && userRole.slice(-5) === "ADMIN") {
            redirectUrl = "/admin";
          }

          if (redirectUrl !== "/signin") {
            router.push(redirectUrl);
          }
        }
      } catch (error) {
        console.error("Error loading institution or checking auth:", error);
      }
    };

    checkAuthAndLoadInstitution();
  }, [searchParams, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkRedirect = () => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      const url = `/${redirect}`;
      setState((prev) => ({ ...prev, url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Use the new Next.js API route which sets signed cookies
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.email,
          password: state.password,
        }),
      });

      if (response.ok) {
        const loginData = await response.json();
        const userRole = loginData.role;

        setState((prev) => ({
          ...prev,
          email: "",
          password: "",
          isLoading: false,
        }));

        // Check role and set appropriate redirect url
        let redirectUrl = "/signin";

        if (userRole === "APPLICANT") {
          redirectUrl = "/apply/start";
        } else if (userRole === "AFFILIATE") {
          redirectUrl = "/affiliate";
        } else if (userRole === "STUDENT") {
          redirectUrl = "/students";
        } else if (userRole === "SUPERADMIN") {
          redirectUrl = "/ops";
        } else if (userRole === "STAFF" || userRole === "LECTURER") {
          redirectUrl = "/manage";
        } else if (userRole && userRole.endsWith("ADMIN")) {
          redirectUrl = "/manage";
        }

        // Check for redirect parameter
        const redirect = searchParams.get("redirect");
        if (redirect) {
          redirectUrl = `/${redirect}`;
        }

        toast.success("Sign in successful!");

        // Add a small delay to ensure cookies are set before redirecting
        setTimeout(() => {
          router.push(redirectUrl);
        }, 100);
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));

        if (response.status === 401) {
          setState((prev) => ({
            ...prev,
            error: "Email or Password Incorrect. Please try again.",
          }));
        } else {
          const errorData = await response.json();
          if (errorData.error?.includes("Your account has been deactivated")) {
            setState((prev) => ({ ...prev, error: errorData.error }));
          } else {
            setState((prev) => ({
              ...prev,
              error: errorData.error || "Login Error! Please try again.",
            }));
          }
        }
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Network error. Please try again.",
      }));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = {
      email: state.email,
    };

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await sendForgotPasswordLink(userData);

      if (result.status === 200) {
        toast.success(
          "Email sent! Please check your email to retrieve your new password"
        );
        setState((prev) => ({
          ...prev,
          forgotPasswordDialogOpen: false,
          isLoading: false,
        }));
      } else {
        toast.error(
          "Email sending failed. Please ensure that you use the email you registered with for this operation to be successful"
        );
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const togglePasswordVisibility = (
    field: "password" | "newPassword" | "confirmPassword"
  ) => {
    setState((prev) => ({
      ...prev,
      [`show${field.charAt(0).toUpperCase() + field.slice(1)}`]:
        !prev[
          `show${
            field.charAt(0).toUpperCase() + field.slice(1)
          }` as keyof SigninState
        ],
    }));
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.newPassword !== state.confirmPassword) {
      toast.error("Your password and confirm password fields must match");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const postData = {
        newPassword: state.newPassword,
        resetCode: state.resetCode,
      };
      const result = await resetPassword(postData);

      if (result.status === 200) {
        setState((prev) => ({
          ...prev,
          resetPasswordDialogOpen: false,
          isLoading: false,
        }));
        toast.success("New Password successfully saved. You may now login.");
        router.push("/signin");
      } else {
        toast.error("Could not save new password.");
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle verification alerts
  React.useEffect(() => {
    if (state.verification === "success" || state.verification === "fail") {
      setState((prev) => ({ ...prev, verificationDialogOpen: true }));
    }
  }, [state.verification]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,118,110,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(15,118,110,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-teal-100/50 blur-3xl" />
      <div className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-center justify-center lg:justify-start gap-4">
              {state.institution?.logo && (
                <img
                  className="h-14 w-auto"
                  src={state.institution.logo}
                  alt="Institution Logo"
                />
              )}
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                  Campus Portal
                </p>
                <h1 className="text-3xl font-semibold text-slate-900">
                  {state.institution?.name || "quickStudy"}
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight">
                Sign in to your learning workspace
              </h2>
              <p className="text-lg text-slate-600 max-w-xl">
                Access courses, assignments, and the full academic ecosystem in
                one secure space designed for students and faculty.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-teal-600" />
                <p className="mt-3 text-sm font-medium text-slate-900">
                  Secure sign-in
                </p>
                <p className="text-xs text-slate-500">
                  Enterprise grade access controls.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <BookOpen className="h-5 w-5 text-teal-600" />
                <p className="mt-3 text-sm font-medium text-slate-900">
                  Unified learning
                </p>
                <p className="text-xs text-slate-500">
                  Courses, exams, and results in one hub.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <Users className="h-5 w-5 text-teal-600" />
                <p className="mt-3 text-sm font-medium text-slate-900">
                  Community ready
                </p>
                <p className="text-xs text-slate-500">
                  Connect with staff and peers instantly.
                </p>
              </div>
            </div>

            <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <GeneratedIllustration />
            </div>

            <div className="lg:hidden rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <p className="text-sm text-slate-600">
                Sign in to access your courses, materials, and messages in a
                focused workspace.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Welcome back
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">Sign in</h2>
              <p className="text-slate-600">
                Enter your credentials to continue
              </p>
            </div>

            <GlassCard className="border-slate-200 bg-white/90 shadow-xl">
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
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-slate-700 font-medium"
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
                    placeholder="you@institution.edu"
                    disabled={state.isLoading}
                    className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-slate-700 font-medium"
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={state.rememberMe}
                      onCheckedChange={(checked) =>
                        setState((prev) => ({
                          ...prev,
                          rememberMe: checked === true,
                        }))
                      }
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm text-slate-600 cursor-pointer"
                    >
                      Keep me signed in
                    </Label>
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        forgotPasswordDialogOpen: true,
                      }))
                    }
                    className="p-0 h-auto font-normal text-teal-700 hover:text-teal-900"
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200/60"
                  size="lg"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-slate-500">
                      New to the platform?
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-slate-600">
                    If you do not have an account, apply to access any of the
                    university programs.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Link href="/apply" className="flex items-center gap-2">
                      Apply Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="text-center pt-6 border-t border-slate-200">
                  {state.institution?.support_mail || state.institution?.email ? (
                    <p className="text-sm text-slate-600">
                      For questions, email{" "}
                      <strong className="text-teal-700">
                        {state.institution?.support_mail || state.institution?.email}
                      </strong>
                    </p>
                  ) : null}
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Modern Dialogs */}

      {/* Reset Password Dialog */}
      <Dialog
        open={state.resetPasswordDialogOpen}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, resetPasswordDialogOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-slate-200 text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <Lock className="h-5 w-5 text-teal-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Enter your new password below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-slate-700 font-medium"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={state.showNewPassword ? "text" : "password"}
                  required
                  value={state.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  disabled={state.isLoading}
                  className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-teal-600 transition-colors"
                >
                  {state.showNewPassword ? (
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
                  placeholder="Confirm new password"
                  disabled={state.isLoading}
                  className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
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
            <DialogFooter>
              <Button
                type="submit"
                disabled={state.isLoading}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {state.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog
        open={state.forgotPasswordDialogOpen}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, forgotPasswordDialogOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-slate-200 text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <Mail className="h-5 w-5 text-teal-600" />
              Forgot Password
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Enter your email address and we'll send you a password reset link
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="forgotEmail"
                className="text-slate-700 font-medium flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-teal-600" />
                Email Address
              </Label>
              <Input
                id="forgotEmail"
                name="email"
                type="email"
                required
                value={state.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={state.isLoading}
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-teal-500"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={state.isLoading}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {state.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog
        open={state.verificationDialogOpen}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, verificationDialogOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-slate-200 text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              {state.verification === "success" ? (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  ✓
                </div>
              ) : (
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              )}
              Account Verification
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Your account{" "}
              {state.verification === "success"
                ? "has been successfully verified"
                : "verification failed"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setState((prev) => ({
                  ...prev,
                  verificationDialogOpen: false,
                }));
                router.push("/");
              }}
              className={
                state.verification === "success"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }
            >
              {state.verification === "success"
                ? "Continue to Login"
                : "Try again"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Signin() {
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
      <SigninComponent />
    </Suspense>
  );
}
