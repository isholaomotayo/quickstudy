import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createSecureCookieData } from "@/lib/api-auth";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWTSECRET = process.env.JWTSECRET || "fallback-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user with staff and student relations
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      include: {
        staff_staff_user_idTouser: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        student_student_user_idTouser: {
          include: {
            programme: {
              select: {
                id: true,
                name: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            level: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Authentication was not successful. Invalid Account credentials provided",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error:
            "Authentication was not successful. Invalid Account credentials provided",
        },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.account_active) {
      return NextResponse.json(
        {
          error:
            "Authentication was not successful. Your account has been deactivated. Please contact support.",
        },
        { status: 401 }
      );
    }

    // Get the first staff or student relation (Bookshelf returns single object, not array)
    const staff = user.staff_staff_user_idTouser?.[0];
    const student = user.student_student_user_idTouser?.[0];

    // Prepare user data with essential fields only
    const userData = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      other_name: user.other_name || undefined,
      role: user.role || "APPLICANT",
      avatar: user.avatar || undefined,
      institution_id: user.institution_id || undefined,
      phone: user.phone || undefined,
      admin: user.admin,
      active: user.active,
      referral_code: user.referral_code || undefined,
      registration_source: user.registration_source || undefined,
      enable_contact_me: user.enable_contact_me,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };

    // Add staff data if exists
    const staffData = staff
      ? {
          id: staff.id.toString(),
          user_id: staff.user_id?.toString(),
          staff_no: staff.staff_no || undefined,
          title: staff.title || undefined,
          department_id: staff.department_id || undefined,
          department: staff.department
            ? {
                id: staff.department.id,
                name: staff.department.name,
              }
            : undefined,
        }
      : undefined;

    // Add student data if exists (excluding sensitive inst_cert field)
    const studentData = student
      ? {
          id: student.id.toString(),
          user_id: student.user_id?.toString(),
          reg_no: student.reg_no || undefined,
          programme_id: student.programme_id || undefined,
          entry_level_id: student.entry_level_id || undefined,
          session_admitted_id: student.session_admitted_id || undefined,
          programme: student.programme
            ? {
                id: student.programme.id,
                name: student.programme.name,
                department: student.programme.department
                  ? {
                      id: student.programme.department.id,
                      name: student.programme.department.name,
                    }
                  : undefined,
              }
            : undefined,
          level: student.level
            ? {
                id: student.level.id,
                name: student.level.name,
              }
            : undefined,
        }
      : undefined;

    // Create response data with only essential fields
    const responseData: any = { ...userData };
    if (staffData) {
      responseData.staff = staffData;
    }
    if (studentData) {
      responseData.student = studentData;
    }

    // Generate JWT token
    const token = jwt.sign(responseData, JWTSECRET, {
      expiresIn: "60d", // 60 days
    });

    // Add token to response
    responseData.token = token;

    // Set secure cookies
    const cookieStore = await cookies();

    // Set JWT token cookie
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    // Create userData cookie with all fields (matching old setAuthCookies format)
    const userDataForCookie = {
      id: userData.id,
      institution_id: userData.institution_id || 0,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      role: userData.role,
      avatar: userData.avatar || "",
      student_id: studentData?.id?.toString() || "",
      fee_plan: (studentData as any)?.fee_plan || "",
      staff_id: staffData?.id?.toString() || "",
      // Additional fields for compatibility
      programme_id: studentData?.programme_id,
      department_id: staffData?.department_id,
    };

    // Create signatures for security
    const userDataString = JSON.stringify(userDataForCookie);
    const AUTH_SECRET = process.env.JWTSECRET || "fallback-secret-key";
    const userSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(userDataString)
      .digest("hex");
    const roleSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(userData.role)
      .digest("hex");

    cookieStore.set("userData", userDataString, {
      httpOnly: false, // Accessible to client-side JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    cookieStore.set("userSignature", userSignature, {
      httpOnly: true, // Signature is httpOnly for security
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    cookieStore.set("role", userData.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    cookieStore.set("roleSignature", roleSignature, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    // Set additional cookies for backward compatibility with client code
    cookieStore.set("userId", userData.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    cookieStore.set("institutionId", String(userData.institution_id || ""), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    // TODO: Send login notification email (commented out in Fastify controller)
    // Consider implementing this as a background job

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: error.message || "An error occurred during login",
      },
      { status: 500 }
    );
  }
}
