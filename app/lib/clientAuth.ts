// ─── Client Auth Helpers ─────────────────────────────────────
// Now uses HttpOnly cookies managed by the browser.
// Local storage and JS-accessible cookies are only used for UI state, not for tokens.

const LOGGED_IN_KEY = "client_is_logged_in";

export function getClientToken(): string | null {
  // We can no longer read the token from JS if it is HttpOnly.
  // This function is kept for backward compatibility with existing API calls
  // that might still be manually adding the Bearer header.
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setClientToken(_token: string, _tokenType: string = "bearer"): void {
  // The token is now set via Set-Cookie header from the backend.
  // We only set a flag for the UI to know we are logged in.
  if (typeof window !== "undefined") {
    localStorage.setItem(LOGGED_IN_KEY, "true");
  }
}

export function clearClientToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOGGED_IN_KEY);
    // Note: The actual HttpOnly cookie must be cleared by the backend /logout endpoint.
  }
}

export function isClientAuthenticated(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(LOGGED_IN_KEY) === "true";
}
