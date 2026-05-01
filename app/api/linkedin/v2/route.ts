import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const useStream = url.searchParams.get("stream") === "true";
    const bypassCache = url.searchParams.get("bypass_cache") === "true";
    const looseSearch = url.searchParams.get("loose_search") === "true";

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (API_KEY) {
      headers["X-API-Key"] = API_KEY;
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const baseEndpoint = useStream
      ? `${BACKEND_URL}/api/jobs/linkedin/v2/stream`
      : `${BACKEND_URL}/api/jobs/linkedin/v2`;
    const backendParams = new URLSearchParams();
    if (bypassCache) backendParams.set("bypass_cache", "true");
    if (looseSearch) backendParams.set("loose_search", "true");
    const qs = backendParams.toString();
    const endpoint = qs ? `${baseEndpoint}?${qs}` : baseEndpoint;

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
    console.error("LinkedIn v2 API error:", error);
    return NextResponse.json(
      {
        error: "Failed to search LinkedIn v2 jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
