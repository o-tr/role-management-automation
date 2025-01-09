import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";

export type CreateTagResponse =
  | {
      status: "success";
      tag: {
        id: string;
        name: string;
      };
    }
  | {
      status: "error";
      error: string;
    };

export async function POST(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<CreateTagResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const { name } = await req.json();

  if (!name) {
    return NextResponse.json(
      { status: "error", error: "Name is required" },
      { status: 400 },
    );
  }

  const tag = await prisma.tag.create({
    data: {
      name,
      namespace: { connect: { id: params.nsId } },
    },
  });

  return NextResponse.json({
    status: "success",
    tag: {
      id: tag.id,
      name: tag.name,
    },
  });
}
