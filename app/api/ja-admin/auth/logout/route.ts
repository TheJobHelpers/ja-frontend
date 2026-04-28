import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "ja_admin_access_token";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST() {
  try {
    // Read the token to call backend logout (best effort — don't fail if it can't)
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      await fetch(`${BACKEND_URL}/api/ja-admin/auth/logout`, {
        method: "POST",
        headers: {
          "Cookie": `${COOKIE_NAME}=${token}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }).catch(() => {/* Ignore backend errors on logout */});
    }

    // Delete the Next.js-managed session cookie
    cookieStore.delete(COOKIE_NAME);

    console.log("[JA Auth] Cookie cleared on logout");
    return NextResponse.json({ message: "Successfully logged out" });
  } catch (error: unknown) {
    console.error("[JA Auth] Logout failed:", error);
    // Even if something fails, we still try to clear the cookie
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ message: "Logged out" });
  }
}
