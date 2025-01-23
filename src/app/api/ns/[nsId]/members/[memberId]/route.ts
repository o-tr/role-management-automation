import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";

export type DeleteMemberResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

export async function DELETE(
  req: NextRequest,
  { params }: { params: { nsId: string; memberId: string } },
): Promise<NextResponse<DeleteMemberResponse>> {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const namespace = await prisma.namespace.findUnique({
    where: { id: params.nsId },
    include: { owner: true },
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

  const member = await prisma.member.findUnique({
    where: { id: params.memberId, namespaceId: params.nsId },
  });

  if (!member) {
    return NextResponse.json(
      { status: "error", error: "Member not found" },
      { status: 404 },
    );
  }

  await prisma.$transaction([
    prisma.memberExternalServiceAccount.deleteMany({
      where: { memberId: member.id },
    }),
    prisma.member.delete({
      where: { id: member.id },
    }),
  ]);

  return NextResponse.json({ status: "success" });
}
