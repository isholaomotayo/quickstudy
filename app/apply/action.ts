"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

// Create a singleton Prisma client for serverless environments
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Email template (same as backend)
const mailTemplate = {
  header: `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <title>quickStudy | The Complete Learning Platform</title>
       
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <style type="text/css">
            /* CLIENT-SPECIFIC STYLES */
            #outlook a {
                padding: 0;
            }
    
            /* Force Outlook to provide a "view in browser" message */
            .ReadMsgBody {
                width: 100%;
            }
    
            .ExternalClass {
                width: 100%;
            }
    
            /* Force Hotmail to display emails at full width */
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
                line-height: 100%;
            }
    
            /* Force Hotmail to display normal line spacing */
            body,
            table,
            td,
            a {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
    
            /* Prevent WebKit and Windows mobile changing default text sizes */
            table,
            td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }
    
            /* Remove spacing between tables in Outlook 2007 and up */
            img {
                -ms-interpolation-mode: bicubic;
            }
    
            /* Allow smoother rendering of resized image in Internet Explorer */
    
            /* RESET STYLES */
            body {
                margin: 0;
                padding: 0;
            }
    
            img {
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
            }
    
            table {
                border-collapse: collapse !important;
            }
    
            body {
                height: 100% !important;
                margin: 0;
                padding: 0;
                width: 100% !important;
            }
    
            /* iOS BLUE LINKS */
            .appleBody a {
                color: #68440a;
                text-decoration: none;
            }
    
            .appleFooter a {
                color: #999999;
                text-decoration: none;
            }
    
            /* MOBILE STYLES */
            @media screen and (max-width: 525px) {
    
                /* ALLOWS FOR FLUID TABLES */
                table[class="wrapper"] {
                    width: 100% !important;
                }
    
                /* ADJUSTS LAYOUT OF LOGO IMAGE */
                td[class="logo"] {
                    text-align: left;
                    padding: 20px 0 20px 0 !important;
                }
    
                td[class="logo"] img {
                    margin: 0 auto !important;
                }
    
                /* USE THESE CLASSES TO HIDE CONTENT ON MOBILE */
                td[class="mobile-hide"] {
                    display: none;
                }
    
                img[class="mobile-hide"] {
                    display: none !important;
                }
    
                img[class="img-max"] {
                    max-width: 100% !important;
                    height: auto !important;
                }
    
                /* FULL-WIDTH TABLES */
                table[class="responsive-table"] {
                    width: 100% !important;
                }
    
                /* UTILITY CLASSES FOR ADJUSTING PADDING ON MOBILE */
                td[class="padding"] {
                    padding: 10px 5% 15px 5% !important;
                }
    
                td[class="padding-copy"] {
                    padding: 10px 5% 10px 5% !important;
                    text-align: center;
                }
    
                td[class="padding-meta"] {
                    padding: 30px 5% 0px 5% !important;
                    text-align: center;
                }
    
                td[class="no-pad"] {
                    padding: 0 0 20px 0 !important;
                }
    
                td[class="no-padding"] {
                    padding: 0 !important;
                }
    
                td[class="section-padding"] {
                    padding: 50px 15px 50px 15px !important;
                }
    
                td[class="section-padding-bottom-image"] {
                    padding: 50px 15px 0 15px !important;
                }
    
                /* ADJUST BUTTONS ON MOBILE */
                td[class="mobile-wrapper"] {
                    padding: 10px 5% 15px 5% !important;
                }
    
                table[class="mobile-button-container"] {
                    margin: 0 auto;
                    width: 100% !important;
                }
    
                a[class="mobile-button"] {
                    width: 80% !important;
                    padding: 15px !important;
                    border: 0 !important;
                    font-size: 16px !important;
                }
    
            }
        </style>
    </head>
    
    <body style="margin: 0; padding: 0;">
    
        <!-- HEADER -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff">
                    <div align="center" style="padding: 0px 15px 0px 15px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="500" class="wrapper">
                            <!-- LOGO/PREHEADER TEXT -->
                            <tr>
                                <td style="padding: 20px 0px 30px 0px;" class="logo">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td bgcolor="#ffffff" width="100" align="left"><a href=${process.env.FRONTEND_URL}
                                                    target="_blank"><img alt="Logo"
                                                        src="https://res.cloudinary.com/emergingplatforms/image/upload/v1578335840/logo/unn_nkmf0v.png"
                                                        width="102" height="46"
                                                        style="display: block; font-family: Helvetica, Arial, sans-serif; color: #666666; font-size: 16px;"
                                                        border="0"></a></td>
                                            <td bgcolor="#ffffff" width="400" align="right" class="mobile-hide">
                                                <table border="0" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td align="right"
                                                            style="padding: 0 0 5px 0; font-size: 14px; font-family: Arial, sans-serif; color: #666666; text-decoration: none;">
                                                            <span style="color: #666666; text-decoration: none;">quickStudy -
                                                                The complete learning platform<br></span></td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>

        <!-- ONE COLUMN SECTION -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff" align="center" style="padding: 70px 15px 70px 15px;" class="section-padding">
                    <table border="0" cellpadding="0" cellspacing="0" width="500" class="responsive-table">
                        <tr>
                            <td>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                            <!-- HERO IMAGE -->
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tbody>
                                                    <tr>
                                                        <td class="padding-copy">
                                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                                <tr>
                                                                    <td>`,

  hero: (
    url = "https://firebasestorage.googleapis.com/v0/b/foodapp-6bbb9.appspot.com/o/ilearn-mails%2Fresponsive-email.jpg?alt=media&token=d4add93e-d01d-4ebe-9e92-a73e2a3087c2",
    text = "Welcome to the complete learning platform"
  ) => `<a href=${url} target="_blank"><img
                                                                    src=${url}
                                                                    width="500" height="200" border="0"
                                                                    alt=${text}
                                                                    style="display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; width: 500px; height: 200px;"
                                                                    class="img-max"></a>`,
  prebody: `</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td>
<!-- COPY -->
<table width="100%" border="0" cellspacing="0" cellpadding="0">

<tr>
<td align="center"
    style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;"
    class="padding-copy">`,

  footer: (url = process.env.FRONTEND_URL, text = "Learn More") => ` </td>
</tr>
</table>
</td>
</tr>
<tr>
<td>
    <!-- BULLETPROOF BUTTON -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0"
        class="mobile-button-container">
        <tr>
            <td align="center" style="padding: 25px 0 0 0;" class="padding-copy">
                <table border="0" cellspacing="0" cellpadding="0"
                    class="responsive-table">
                    <tr>
                        <td align="center"><a href=${url}
                                target="_blank"
                                style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; font-weight: normal; color: #ffffff; text-decoration: none; background-color: #5D9CEC; border-top: 15px solid #5D9CEC; border-bottom: 15px solid #5D9CEC; border-left: 25px solid #5D9CEC; border-right: 25px solid #5D9CEC; border-radius: 3px; -webkit-border-radius: 3px; -moz-border-radius: 3px; display: inline-block;"
                                class="mobile-button">${text} &rarr;</a></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>


<!-- FOOTER -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td bgcolor="#ffffff" align="center">
<table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
<tr>
<td style="padding: 20px 0px 20px 0px;">
<!-- UNSUBSCRIBE COPY -->
<table width="500" border="0" cellspacing="0" cellpadding="0" align="center"
class="responsive-table">
<tr>
<td align="center" valign="middle"
    style="font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#666666;">
    <span class="appleFooter" style="color:#666666;">An EDU Platforms
        Products</span><br><a class="original-only"
        style="color: #666666; text-decoration: none;">Unsubscribe</br><span
            class="original-only"
            style="font-family: Arial, sans-serif; font-size: 12px; color: #444444;">&nbsp;&nbsp;&nbsp;
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>

</body>

</html>`,
};

// Email service using Brevo (same as backend)
async function sendEmail(emailData: {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        to: [{ email: emailData.to }],
        sender: { email: emailData.from },
        subject: emailData.subject,
        htmlContent: emailData.html,
        textContent: emailData.text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Email sent successfully via Brevo:", result);
    return result;
  } catch (error) {
    console.error("Error sending email via Brevo:", error);
    throw error;
  }
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  otherName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  referral_code?: string;
  is_affiliate?: boolean;
  bank?: string;
  account_no?: string;
  institution_id?: string;
}

interface RegisterResult {
  success: boolean;
  error?: string;
  user?: any;
  student?: any;
}

export async function registerUser(
  formData: RegisterFormData
): Promise<RegisterResult> {
  try {
    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.otherName ||
      !formData.username ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      return {
        success: false,
        error: "All required fields must be filled",
      };
    }

    // Validate username format (lowercase letters and numbers only)
    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(formData.username)) {
      return {
        success: false,
        error: "Username must contain only lowercase letters and numbers",
      };
    }

    // Check if username is different from referral code
    if (
      formData.referral_code &&
      formData.referral_code === formData.username
    ) {
      return {
        success: false,
        error: "Username must be different from referral code",
      };
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(formData.password, saltRounds);

    // Generate verification code
    const verificationCode = randomUUID();

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if user already exists
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [
            { email: formData.email },
            { username: formData.username },
            { phone: formData.phone },
          ],
        },
      });

      if (existingUser) {
        let errorMessage =
          "An error occurred while creating your profile. Please check your details and try again";

        if (existingUser.username === formData.username) {
          errorMessage =
            "Another user has already created an account with this username. Please choose a different username and try again";
        } else if (existingUser.phone === formData.phone) {
          errorMessage =
            "Another user has already created an account with this phone number. Please choose a different phone number and try again";
        } else if (existingUser.email === formData.email) {
          errorMessage =
            "Another user has already created an account with this email address. Please choose a different email address and try again";
        }

        throw new Error(errorMessage);
      }

      // Verify referral code if provided
      if (formData.referral_code) {
        const referralUser = await tx.user.findFirst({
          where: { username: formData.referral_code.toLowerCase() },
        });

        if (!referralUser) {
          throw new Error(
            "This Referral code does not exist. Kindly enter a correct Referral code or leave the field empty"
          );
        }
      }

      // Create user
      const newUser = await tx.user.create({
        data: {
          username: formData.username,
          password: hashedPassword,
          first_name: formData.firstName,
          last_name: formData.lastName,
          other_name: formData.otherName,
          email: formData.email.toLowerCase(),
          phone: formData.phone,
          referral_code: formData.referral_code || "UNN",
          institution_id: parseInt(formData.institution_id || "1"),
          role: "APPLICANT",
          active: false, // Will be activated after email verification
          registration_source: "web",
          code: verificationCode, // Add verification code
        },
      });

      // Create student record
      const newStudent = await tx.student.create({
        data: {
          user_id: newUser.id,
          programme_id: null, // Will be set during application process
          status: false, // Application not complete yet
          admitted: false,
          application_type: "NEW",
        },
      });

      // Create affiliate record if requested
      if (formData.is_affiliate && formData.bank && formData.account_no) {
        await tx.affiliate.create({
          data: {
            user_id: newUser.id,
            bank: formData.bank,
            account_no: formData.account_no,
          },
        });
      }

      return { newUser, newStudent };
    });

    // Send welcome email with verification link
    try {
      // Fetch institution data for email
      const institutionId = result.newUser.institution_id || 1;
      const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
        select: { support_mail: true, email: true },
      });
      const supportEmail = institution?.support_mail || institution?.email || process.env.SUPPORT_EMAIL || "support.cdel@unn.edu.ng";

      const emailTemplateParams = {
        subject: `Welcome to ${process.env.NAME || "quickStudy"}`,
        email: result.newUser.email,
        activate: `${process.env.API_URL}/api/verify?code=${verificationCode}-${result.newUser.id}`,
        name: result.newUser.first_name,
        organization: process.env.NAME || "quickStudy",
      };

      const msg = {
        to: result.newUser.email,
        from: supportEmail,
        subject: emailTemplateParams.subject,
        text: `Hi ${emailTemplateParams.name}, welcome to ${emailTemplateParams.organization}! Use the link: ${emailTemplateParams.activate} to activate your account`,
        html:
          mailTemplate.header +
          mailTemplate.hero() +
          mailTemplate.prebody +
          `Hi ${emailTemplateParams.name}, welcome to ${emailTemplateParams.organization}! Use the link: <a href="${emailTemplateParams.activate}">Verification Link</a> to activate your account` +
          mailTemplate.footer(emailTemplateParams.activate, "Activate Account"),
      };

      await sendEmail(msg);
      console.log("Welcome email sent successfully to:", result.newUser.email);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the registration if email fails
    }

    // Create JWT token just like the backend login system
    const userWithToken = {
      id: result.newUser.id.toString(),
      institution_id: result.newUser.institution_id,
      username: result.newUser.username,
      first_name: result.newUser.first_name,
      last_name: result.newUser.last_name,
      email: result.newUser.email,
      role: result.newUser.role,
      avatar: result.newUser.avatar || "",
      student: {
        id: result.newStudent.id.toString(),
        user_id: result.newUser.id.toString(),
        status: result.newStudent.status,
        admitted: result.newStudent.admitted,
        application_type: result.newStudent.application_type,
      },
    };

    const loginToken = jwt.sign(userWithToken, process.env.JWTSECRET!, {
      expiresIn: 86400 * 60, // expires in 60 days (same as backend)
    });

    // Set authentication cookies (matching backend format exactly)
    const cookieStore = await cookies();
    const maxAge = 1000 * 60 * 60 * 24 * 365; // 1 year in milliseconds

    // Set token cookie (same as backend)
    cookieStore.set("token", loginToken, {
      maxAge: maxAge,
      path: "/",
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });

    // Set additional cookies for compatibility
    cookieStore.set("role", result.newUser.role || "APPLICANT", {
      maxAge: maxAge,
      path: "/",
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });

    cookieStore.set("userId", result.newUser.id.toString(), {
      maxAge: maxAge,
      path: "/",
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });

    cookieStore.set(
      "institutionId",
      result.newUser.institution_id?.toString() || "1",
      {
        maxAge: maxAge,
        path: "/",
        sameSite: "none",
        secure: true,
        httpOnly: true,
      }
    );

    // Set user data cookie (non-httpOnly for client access)
    cookieStore.set(
      "userData",
      JSON.stringify({
        id: result.newUser.id.toString(),
        institution_id: result.newUser.institution_id,
        username: result.newUser.username,
        first_name: result.newUser.first_name,
        last_name: result.newUser.last_name,
        email: result.newUser.email,
        role: result.newUser.role,
        avatar: result.newUser.avatar || "",
        student_id: result.newStudent.id.toString(),
        fee_plan: "",
        staff_id: "",
      }),
      {
        maxAge: maxAge,
        path: "/",
        sameSite: "none",
        secure: true,
        httpOnly: false,
      }
    );

    return {
      success: true,
      user: result.newUser,
      student: result.newStudent,
    };
  } catch (error) {
    console.error("Registration error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during registration",
    };
  }
}

export async function registerAndRedirect(formData: RegisterFormData) {
  const result = await registerUser(formData);

  if (result.success) {
    // Redirect to application page based on user role
    redirect("/apply/start");
  } else {
    // Return error to be handled by the form
    return result;
  }
}
