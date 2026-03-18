// ─── Client Auth Helpers ─────────────────────────────────────
// Uses a SEPARATE token key from HR to avoid conflicts

const CLIENT_TOKEN_KEY = "client_access_token";
const CLIENT_TOKEN_TYPE_KEY = "client_token_type";

export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CLIENT_TOKEN_KEY);
}

export function setClientToken(token: string, tokenType: string = "bearer"): void {
  localStorage.setItem(CLIENT_TOKEN_KEY, token);
  localStorage.setItem(CLIENT_TOKEN_TYPE_KEY, tokenType);
}

export function clearClientToken(): void {
  localStorage.removeItem(CLIENT_TOKEN_KEY);
  localStorage.removeItem(CLIENT_TOKEN_TYPE_KEY);
}

export function isClientAuthenticated(): boolean {
  return !!getClientToken();
}
