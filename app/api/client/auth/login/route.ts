import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const COOKIE_NAME = "client_access_token";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/client/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Invalid credentials" },
        { status: res.status }
      );
    }

    // ✅ Set cookie directly via Next.js — guaranteed to reach the browser.
    // The FastAPI Set-Cookie is discarded; we set our own cookie here.
    const token = data.access_token;
    if (!token) {
      return NextResponse.json({ error: "No token in response" }, { status: 500 });
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      // Only require HTTPS in production; allow HTTP for local dev
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });

    console.log("[Client Auth] Cookie set successfully for user:", data.user?.email ?? body.email);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("[Client Auth] Login proxy failed:", error);
    return NextResponse.json(
      { error: "Backend Unavailable" },
      { status: 502 }
    );
  }
}
