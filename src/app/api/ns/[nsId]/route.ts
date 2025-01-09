import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { TNamespaceDetail } from "@/types/prisma";

export type GetNamespaceDetailResponse =
  | {
      status: "success";
      namespace: TNamespaceDetail;
    }
  | {
      status: "error";
      error: string;
    };

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string } }
): Promise<NextResponse<GetNamespaceDetailResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 }
    );
  }

  const namespace = await prisma.namespace.findUnique({
    where: {
      id: params.nsId,
    },
    include: {
      owner: true,
      admins: true,
      members: true,
      tags: true,
    },
  });

  if (!namespace) {
    return NextResponse.json(
      { status: "error", error: "Namespace not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    status: "success",
    namespace: {
      id: namespace.id,
      name: namespace.name,
      owner: {
        id: namespace.owner.id,
        name: namespace.owner.name,
        email: namespace.owner.email,
      },
      admins: namespace.admins.map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
      })),
      members: namespace.members.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
      })),
      tags: namespace.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
    },
  });
}
