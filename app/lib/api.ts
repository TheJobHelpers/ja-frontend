// ─── API Client Wrapper ──────────────────────────────────────
// Typed fetch helpers with automatic auth header injection

class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    
    let detail = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      detail = errorData.detail || errorData.error || errorData.message || detail;
    } catch {
      // Response body wasn't JSON
    }
    throw new ApiError(response.status, detail);
  }
  return response.json() as Promise<T>;
}

function buildHeaders(token: string | null, extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Typed GET request
 */
export async function apiGet<T>(
  url: string,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(null, extraHeaders),
    credentials: "include",
  });
  return handleResponse<T>(response);
}

/**
 * Typed POST request
 */
export async function apiPost<T>(
  url: string,
  body: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(null, extraHeaders),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

/**
 * Typed PUT request
 */
export async function apiPut<T>(
  url: string,
  body: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const response = await fetch(url, {
    method: "PUT",
    headers: buildHeaders(null, extraHeaders),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

/**
 * Typed PATCH request
 */
export async function apiPatch<T>(
  url: string,
  body: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: buildHeaders(null, extraHeaders),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

/**
 * Typed DELETE request
 */
export async function apiDelete<T>(
  url: string,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: buildHeaders(null, extraHeaders),
    credentials: "include",
  });
  return handleResponse<T>(response);
}

export { ApiError };
