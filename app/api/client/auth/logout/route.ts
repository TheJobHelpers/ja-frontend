import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/client/auth/logout`, {
      method: "POST",
      headers: { Authorization: authHeader },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Logout failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Client auth logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
