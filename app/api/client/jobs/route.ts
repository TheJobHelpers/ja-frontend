import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "../../_proxy";

export async function GET(request: NextRequest) {
  return proxyRequest(request, "/api/client/jobs");
}

export async function POST(request: NextRequest) {
  // Proxy to POST /api/client/jobs
  // Payload: { job_title, company, location, apply_link, description, match_score, source, status }
  // Backend returns 403 if weekly quota exceeded
  const proxyRes = await proxyRequest(request, "/api/client/jobs");

  if (proxyRes.status === 403) {
    // Quota exceeded — pass through the backend's error response
    return proxyRes;
  }

  if (proxyRes.status >= 400) {
    // Real backend error — surface it to the client
    console.error("Backend POST /api/client/jobs failed with status:", proxyRes.status);
    const body = await proxyRes.json().catch(() => ({ error: "Backend error" }));
    return NextResponse.json(
      { error: body.error || body.detail || "Failed to save job" },
      { status: proxyRes.status }
    );
  }

  return proxyRes;
}
