import { handleMediaDelivery } from "@/lib/mediaDelivery";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  return handleMediaDelivery(req, pathSegments);
}
