import { prisma } from "@/lib/prisma";
import type { TExternalServiceGroupDetail } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";

export type GetExternalServiceGroupsResponse =
  | {
      status: "success";
      serviceGroups: TExternalServiceGroupDetail[];
    }
  | {
      status: "error";
      error: string;
    };

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string; accountId: string } },
): Promise<NextResponse<GetExternalServiceGroupsResponse>> {
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

  const serviceGroups = await prisma.externalServiceGroup.findMany({
    where: {
      namespaceId: params.nsId,
    },
    include: {
      account: true,
    },
  });

  return NextResponse.json({
    status: "success",
    serviceGroups: serviceGroups.map((group) => ({
      id: group.id,
      name: group.name,
      groupId: group.groupId,
      icon: group.icon || undefined,
      account: {
        id: group.account.id,
        name: group.account.name,
        service: group.account.service,
        icon: group.account.icon || undefined,
      },
    })),
  });
}
