// ─── JA Internal Admin Auth Helpers ─────────────────────────
// Separate token key to avoid collisions with client or HR tokens

const JA_TOKEN_KEY = "ja_access_token";
const JA_TOKEN_TYPE_KEY = "ja_token_type";
const JA_USER_KEY = "ja_user";

export interface JaUser {
  name: string;
  email: string;
  role: "admin" | "member";
}

export function getJaToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JA_TOKEN_KEY);
}

export function setJaToken(token: string, tokenType: string = "bearer", user?: JaUser): void {
  localStorage.setItem(JA_TOKEN_KEY, token);
  localStorage.setItem(JA_TOKEN_TYPE_KEY, tokenType);
  if (user) {
    localStorage.setItem(JA_USER_KEY, JSON.stringify(user));
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
  localStorage.removeItem(JA_TOKEN_KEY);
  localStorage.removeItem(JA_TOKEN_TYPE_KEY);
  localStorage.removeItem(JA_USER_KEY);
}

export function isJaAuthenticated(): boolean {
  const token = getJaToken();
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadStr);
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        clearJaToken();
        return false;
      }
    }
  } catch (e) {
    // Ignore decode errors, token might be opaque
  }

  return true;
}
