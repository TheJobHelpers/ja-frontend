// ─── JA Internal Admin Auth Helpers ─────────────────────────
// Now uses HttpOnly cookies managed by the browser.

const JA_LOGGED_IN_KEY = "ja_admin_is_logged_in";
const JA_USER_KEY = "ja_user";

export interface JaUser {
  name: string;
  email: string;
  role: "admin" | "member";
}

export function getJaToken(): string | null {
  // We can no longer read the token from JS if it is HttpOnly.
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setJaToken(_token: string, _tokenType: string = "bearer", user?: JaUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(JA_LOGGED_IN_KEY, "true");
    if (user) {
      localStorage.setItem(JA_USER_KEY, JSON.stringify(user));
    }
  }
}

export function getJaUser(): JaUser | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(JA_USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as JaUser;
  } catch {
    return null;
  }
}

export function clearJaToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(JA_LOGGED_IN_KEY);
    localStorage.removeItem(JA_USER_KEY);
  }
}

export function isJaAuthenticated(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(JA_LOGGED_IN_KEY) === "true";
}
