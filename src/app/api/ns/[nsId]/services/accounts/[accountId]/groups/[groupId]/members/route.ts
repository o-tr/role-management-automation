import { prisma } from "@/lib/prisma";
import type {
  TExternalServiceGroupDetail,
  TExternalServiceGroupMember,
} from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMembers } from "./getMembers";

export type GetExternalServiceGroupMembersResponse =
  | {
      status: "success";
      members: TExternalServiceGroupMember[];
    }
  | {
      status: "error";
      error: string;
    };

const getGroupsSchema = z.object({
  nsId: z.string().uuid(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string; accountId: string; groupId: string } },
): Promise<NextResponse<GetExternalServiceGroupMembersResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const result = getGroupsSchema.safeParse(params);

  if (!result.success) {
    return NextResponse.json(
      {
        status: "error",
        error: result.error.errors.map((e) => e.message).join(", "),
      },
      { status: 400 },
    );
  }

  const { nsId } = result.data;

  const namespace = await prisma.namespace.findUnique({
    where: {
      id: nsId,
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

  const serviceGroup = await prisma.externalServiceGroup.findUnique({
    where: {
      id: params.groupId,
      accountId: params.accountId,
      namespaceId: nsId,
    },
    include: {
      account: true,
    },
  });

  if (!serviceGroup) {
    return NextResponse.json(
      { status: "error", error: "Service group not found" },
      { status: 404 },
    );
  }

  const members = await getMembers(serviceGroup);

  return NextResponse.json({
    status: "success",
    members,
  });
}
