import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get("institutionId");

  if (!institutionId) {
    return NextResponse.json(
      { error: "Institution ID is required" },
      { status: 400 }
    );
  }

  try {
    const sessions = await prisma.session.findMany({
      where: {
        institution_id: parseInt(institutionId),
      },
      orderBy: {
        name: "desc",
      },
    });
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
