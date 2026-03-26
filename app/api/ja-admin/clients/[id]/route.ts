import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(req, `/api/ja-admin/clients/${id}`);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Determine sub-resource from request body keys
  const body = await req.clone().json();
  if ("status" in body) {
    return proxyRequest(req, `/api/ja-admin/clients/${id}/status`, { method: "PATCH" });
  }
  if ("password" in body) {
    return proxyRequest(req, `/api/ja-admin/clients/${id}/credentials`, { method: "PATCH" });
  }
  return proxyRequest(req, `/api/ja-admin/clients/${id}`, { method: "PATCH" });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // send-invite
  return proxyRequest(req, `/api/ja-admin/clients/${id}/send-invite`, { method: "POST" });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(req, `/api/ja-admin/clients/${id}`, { method: "DELETE" });
}
