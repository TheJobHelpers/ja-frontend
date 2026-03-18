// ─── Admin Auth Helpers ──────────────────────────────────────
// Reuses the existing HR access_token for admin operations

const ADMIN_TOKEN_KEY = "access_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem("token_type", "bearer");
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem("token_type");
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}
