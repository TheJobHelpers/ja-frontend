import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const useStream =
      url.searchParams.get("stream") === "true" ||
      url.pathname.includes("/stream");
    const bypassCache = url.searchParams.get("bypass_cache") === "true";

    // Forward the request to the backend
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add API key if configured (required in production)
    if (API_KEY) {
      headers["X-API-Key"] = API_KEY;
    }

    // Use streaming endpoint if requested; append bypass_cache when set
    const baseEndpoint = useStream
      ? `${BACKEND_URL}/api/jobs/linkedin/stream`
      : `${BACKEND_URL}/api/jobs/linkedin`;
    const endpoint = bypassCache ? `${baseEndpoint}?bypass_cache=true` : baseEndpoint;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(
        {
          error:
            errorData.detail ||
            errorData.error ||
            `Backend error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    // If streaming, return the stream as-is
    if (useStream && response.body) {
      return new NextResponse(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("LinkedIn API error:", error);
    return NextResponse.json(
      { error: "Failed to search LinkedIn jobs", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
