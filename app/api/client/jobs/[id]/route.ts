import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_proxy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(request, `/api/client/jobs/${id}/status`);
}
