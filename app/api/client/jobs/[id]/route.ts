import { NextRequest } from "next/server";
import { proxyRequest } from "../../../_proxy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyRequest(request, `/api/client/jobs/${params.id}/status`);
}
