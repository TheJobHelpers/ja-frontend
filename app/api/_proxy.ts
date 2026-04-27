// ─── Proxy helper for JA Admin API routes ────────────────────
// DRY wrapper: forwards requests from Next.js API routes to BACKEND_URL

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

export async function proxyRequest(
  req: NextRequest,
  backendPath: string,
  options: { method?: string; timeout?: number } = {}
): Promise<NextResponse> {
  const method = options.method || req.method;
  const timeout = options.timeout || 10000;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Forward auth header and cookies
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }
  
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
  }

  // Build body for non-GET requests
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = JSON.stringify(await req.json());
    } catch {
      // No body — that's fine for some POST requests like send-invite
    }
  }

  // Forward search parameters
  const search = req.nextUrl.search;
  const fullPath = `${backendPath}${search}`;

  try {
    const res = await fetch(`${BACKEND_URL}${fullPath}`, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(timeout),
    });

    // Extract headers to pass back
    const responseHeaders = new Headers();
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      responseHeaders.set("set-cookie", setCookie);
    }
    responseHeaders.set("Content-Type", "application/json");

    // 204 No Content — nothing to parse (DELETE responses)
    if (res.status === 204) {
      return new NextResponse(null, { status: 204, headers: responseHeaders });
    }

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Backend request failed" },
        { status: res.status, headers: responseHeaders }
      );
    }

    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error: unknown) {
    console.error(`[JA Proxy] ${method} ${backendPath} failed:`, error);
    return NextResponse.json(
      { error: "Backend Unavailable", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 }
    );
  }
}
