import { prisma } from "@/lib/prisma";
import type { TAvailableGroup } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { getAvailableGroups } from "./get-available-groups";

export type GetAvailableGroupsResponse =
  | {
      status: "success";
      groups: TAvailableGroup[];
    }
  | {
      status: "error";
      error: string;
    };

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string; accountId: string } },
): Promise<NextResponse<GetAvailableGroupsResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const namespace = await prisma.namespace.findUnique({
    where: {
      id: params.nsId,
    },
    include: {
      owner: true,
    },
  });

  if (!namespace) {
    return NextResponse.json(
      { status: "error", error: "Namespace not found" },
      { status: 404 },
    );
  }

  if (namespace.owner.email !== email) {
    return NextResponse.json(
      { status: "error", error: "Not authorized" },
      { status: 403 },
    );
  }

  const serviceAccount = await prisma.externalServiceAccount.findUnique({
    where: {
      id: params.accountId,
      namespaceId: params.nsId,
    },
  });

  if (!serviceAccount) {
    return NextResponse.json(
      { status: "error", error: "Service account not found" },
      { status: 404 },
    );
  }

  const groups = await getAvailableGroups(serviceAccount);

  return NextResponse.json({ status: "success", groups });
}
