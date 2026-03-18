import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Mock client credentials for development (until backend is ready)
const MOCK_CLIENTS = [
  { email: "client@tjh.com", password: "client123", name: "John Doe" },
  { email: "demo@tjh.com", password: "demo123", name: "Demo User" },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Try backend first, fallback to mock if backend is unreachable
    try {
      const response = await fetch(`${BACKEND_URL}/api/client/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(3000), // 3s timeout
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: data.detail || "Authentication failed" },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } catch {
      // Backend unreachable — use mock auth
      console.log("[Client Auth] Backend unreachable, using mock authentication");

      const mockUser = MOCK_CLIENTS.find(
        (u) => u.email === email && u.password === password
      );

      if (!mockUser) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Generate a mock token
      const mockToken = Buffer.from(
        JSON.stringify({
          sub: mockUser.email,
          name: mockUser.name,
          exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
          mock: true,
        })
      ).toString("base64");

      return NextResponse.json({
        access_token: `mock_${mockToken}`,
        token_type: "bearer",
      });
    }
  } catch (error: unknown) {
    console.error("Client auth login error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
