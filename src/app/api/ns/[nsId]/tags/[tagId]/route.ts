import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export type DeleteTagResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

export async function DELETE(
  req: NextRequest,
  { params }: { params: { nsId: string; tagId: string } }
): Promise<NextResponse<DeleteTagResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 }
    );
  }

  const tag = await prisma.tag.findUnique({
    where: {
      id: params.tagId,
    },
  });

  if (!tag) {
    return NextResponse.json(
      { status: "error", error: "Tag not found" },
      { status: 404 }
    );
  }

  await prisma.tag.delete({
    where: {
      id: params.tagId,
    },
  });

  return NextResponse.json({ status: "success" });
}
