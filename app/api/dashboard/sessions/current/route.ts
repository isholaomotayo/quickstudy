import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function GET() {
  try {
    const currentSession = await prisma.session.findFirst({
      where: {
        is_active: true,
      },
    });
    return NextResponse.json({ session: currentSession });
  } catch (error) {
    console.error("Error fetching current session:", error);
    return NextResponse.json(
      { error: "Failed to fetch current session" },
      { status: 500 }
    );
  }
}
