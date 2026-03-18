import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Check if this is a mock token
    if (token.startsWith("mock_")) {
      try {
        const payload = JSON.parse(
          Buffer.from(token.replace("mock_", ""), "base64").toString()
        );

        if (payload.exp < Date.now()) {
          return NextResponse.json(
            { error: "Token expired" },
            { status: 401 }
          );
        }

        return NextResponse.json({
          id: "mock-client-001",
          email: payload.sub,
          full_name: payload.name,
          phone: "",
          disabled: false,
          resume: null,
          preferences: {
            role: "",
            industry: "",
            salary_min: 0,
            salary_max: 0,
            work_type: "",
            locations: [],
          },
          daily_search_limit: 10,
          searches_today: 0,
          searches_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch {
        return NextResponse.json(
          { error: "Invalid mock token" },
          { status: 401 }
        );
      }
    }

    // Real backend call
    const response = await fetch(`${BACKEND_URL}/api/client/auth/me`, {
      method: "GET",
      headers: { Authorization: authHeader },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to fetch profile" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Client auth me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
