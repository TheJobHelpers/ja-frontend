import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/ja-admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Invalid credentials" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("[JA Auth] Login proxy failed:", error);
    return NextResponse.json(
      { error: "Backend Unavailable" },
      { status: 502 }
    );
  }
}
