import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const COOKIE_NAME = "client_access_token";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      // Best-effort: tell the backend to invalidate the session
      await fetch(`${BACKEND_URL}/api/client/auth/logout`, {
        method: "POST",
        headers: {
          "Cookie": `${COOKIE_NAME}=${token}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }).catch(() => {/* Ignore backend errors on logout */});
    }

    // Always clear the Next.js-managed cookie
    cookieStore.delete(COOKIE_NAME);

    console.log("[Client Auth] Cookie cleared on logout");
    return NextResponse.json({ message: "Successfully logged out" });
  } catch (error: unknown) {
    console.error("[Client Auth] Logout failed:", error);
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ message: "Logged out" });
  }
}
