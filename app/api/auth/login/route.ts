import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Create form data for OAuth2 password flow
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    // Forward the request to the backend auth endpoint
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Authentication failed",
          detail: data.detail,
        },
        { status: response.status }
      );
    }

    // Return the token response
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
