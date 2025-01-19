import { prisma } from "@/lib/prisma";
import type { TExternalServiceGroupRole } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { getGroupRoles } from "./get-group-roles";

export type GetExternalServiceGroupRolesResponse =
  | {
      status: "success";
      serviceRoles: TExternalServiceGroupRole[];
    }
  | {
      status: "error";
      error: string;
    };

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string; accountId: string; groupId: string } },
): Promise<NextResponse<GetExternalServiceGroupRolesResponse>> {
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

  const group = await prisma.externalServiceGroup.findUnique({
    where: {
      id: params.groupId,
      accountId: params.accountId,
      namespaceId: params.nsId,
    },
    include: {
      account: true,
    },
  });

  if (!group) {
    return NextResponse.json(
      { status: "error", error: "Group not found" },
      { status: 404 },
    );
  }

  const serviceRoles = await getGroupRoles(group.account, group);

  return NextResponse.json({
    status: "success",
    serviceRoles,
  });
}
