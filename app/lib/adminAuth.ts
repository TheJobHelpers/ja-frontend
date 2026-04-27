// ─── Admin Auth Helpers ──────────────────────────────────────
// Now uses HttpOnly cookies managed by the browser.

const ADMIN_LOGGED_IN_KEY = "ja_admin_is_logged_in";

export function getAdminToken(): string | null {
  // We can no longer read the token from JS if it is HttpOnly.
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setAdminToken(_token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_LOGGED_IN_KEY, "true");
  }
}

export function clearAdminToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_LOGGED_IN_KEY);
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ADMIN_LOGGED_IN_KEY) === "true";
}
