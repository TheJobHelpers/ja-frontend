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
  const token = getClientToken();
  if (!token) return false;

  try {
    if (token.startsWith("mock_")) {
      const payloadStr = atob(token.replace("mock_", ""));
      const payload = JSON.parse(payloadStr);
      if (payload.exp && Date.now() > payload.exp) {
        clearClientToken();
        return false;
      }
      return true;
    }

    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadStr);
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        clearClientToken();
        return false;
      }
    }
  } catch (e) {
    // Ignore decode errors, token might be opaque
  }

  return true;
}
