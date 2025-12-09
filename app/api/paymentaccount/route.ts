import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  try {
    // SUPERADMIN returns null (security measure)
    if (user.role === "SUPERADMIN") {
      return createJsonResponse(null);
    }

    // Get payment account for user's institution
    const paymentAccount = await prisma.payment_account.findFirst({
      where: {
        institution_id: user.institution_id,
      },
      select: {
        id: true,
        institution_id: true,
        merchant_id: true,
        terminal_id: true,
        public_key: true,
        test_public_key: true,
        // Exclude secret keys for security
      },
    });

    if (!paymentAccount) {
      return createJsonResponse(null);
    }

    // Use test public key in development/staging environments
    const serverEnv = process.env.SERVER_ENV || process.env.NODE_ENV;
    if (
      serverEnv &&
      ["testing", "local", "staging", "development"].includes(serverEnv)
    ) {
      return createJsonResponse({
        ...paymentAccount,
        public_key: paymentAccount.test_public_key,
        test_public_key: undefined,
      });
    }

    return createJsonResponse({
      ...paymentAccount,
      test_public_key: undefined,
    });
  } catch (error) {
    console.error("Error fetching payment account:", error);
    return createAuthErrorResponse("Failed to fetch payment account", 500);
  }
}
