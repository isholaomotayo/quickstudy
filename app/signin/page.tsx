"use client";

import React, { Suspense } from "react";
import { removeCookies } from "cookies-next";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { GlassCard } from "../../components/ui/glass-card";
import { OptimizedDynamicBackground } from "@/components/ui/webgl-mesh-gradient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertTriangle, Mail, Lock, Eye, EyeOff } from "lucide-react";
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
}

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
  });

  React.useEffect(() => {
    const checkAuthAndLoadInstitution = async () => {
      // Handle logout
      if (searchParams.get("logout")) {
        try {
          // Call backend to delete httpOnly cookies
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Error calling logout API:', error);
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
    <OptimizedDynamicBackground>
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Centralized Content Container */}
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Welcome */}
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
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                  {state.institution?.name || "iLearn"}
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Your gateway to knowledge and excellence. Experience the future
                of digital learning.
              </p>
            </div>

            {/* Decorative Elements */}
            <div
              className="hidden lg:flex items-center space-x-4 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg">📚</span>
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">💡</span>
              </div>
            </div>

            {/* Mobile Institution Name */}
            <div className="lg:hidden">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Sign In
              </h2>
              <p className="text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Desktop Form Header */}
            <div
              className="hidden lg:block mb-8 text-center animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
              <p className="text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Login Form */}
            <GlassCard
              className="backdrop-blur-xl bg-white/80 border-white/50 shadow-2xl animate-slide-up"
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
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-gray-700 font-medium"
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
                    placeholder="Enter your email"
                    disabled={state.isLoading}
                    className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-gray-700 font-medium"
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm text-gray-600"
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
                    className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                  >
                    Forgot password?
                  </Button>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
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

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">
                      New to the platform?
                    </span>
                  </div>
                </div>

                {/* Register Button */}
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    If you don't have an account you can create one by clicking
                    the apply button to get started with any of the University
                    programmes
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg"
                  >
                    <Link href="/apply">Apply Now</Link>
                  </Button>
                </div>

                {/* Support Info */}
                <div className="text-center pt-6 border-t border-gray-200">
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

      {/* Modern Dialogs */}

      {/* Reset Password Dialog */}
      <Dialog
        open={state.resetPasswordDialogOpen}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, resetPasswordDialogOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-gray-200 text-gray-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800 flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter your new password below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-gray-700 font-medium"
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
                  className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-500 transition-colors"
                >
                  {state.showNewPassword ? (
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
                  placeholder="Confirm new password"
                  disabled={state.isLoading}
                  className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
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
            <DialogFooter>
              <Button
                type="submit"
                disabled={state.isLoading}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700"
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
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-gray-200 text-gray-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Forgot Password
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter your email address and we'll send you a password reset link
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="forgotEmail"
                className="text-gray-700 font-medium flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-blue-500" />
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
                className="bg-white/70 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-400"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={state.isLoading}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700"
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
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-gray-200 text-gray-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800 flex items-center gap-2">
              {state.verification === "success" ? (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  ✓
                </div>
              ) : (
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              )}
              Account Verification
            </DialogTitle>
            <DialogDescription className="text-gray-600">
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
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              }
            >
              {state.verification === "success"
                ? "Continue to Login"
                : "Try again"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default function Signin() {
  return (
    <Suspense
      fallback={
        <OptimizedDynamicBackground key="webgl-signin-fallback-v2">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </OptimizedDynamicBackground>
      }
    >
      <SigninComponent />
    </Suspense>
  );
}
