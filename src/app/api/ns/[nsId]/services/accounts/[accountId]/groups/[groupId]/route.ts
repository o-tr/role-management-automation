import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";

export type DeleteExternalServiceGroupResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

export async function DELETE(
  req: NextRequest,
  { params }: { params: { nsId: string; groupId: string } },
): Promise<NextResponse<DeleteExternalServiceGroupResponse>> {
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

  const serviceGroup = await prisma.externalServiceGroup.findUnique({
    where: {
      id: params.groupId,
      namespaceId: params.nsId,
    },
  });

  if (!serviceGroup) {
    return NextResponse.json(
      { status: "error", error: "Service group not found" },
      { status: 404 },
    );
  }

  await prisma.externalServiceGroup.delete({
    where: {
      id: params.groupId,
    },
  });

  return NextResponse.json({
    status: "success",
  });
}
