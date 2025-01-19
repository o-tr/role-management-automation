import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

export type GetTagsResponse =
  | {
      status: "success";
      tags: {
        id: string;
        name: string;
      }[];
    }
  | {
      status: "error";
      error: string;
    };

const createTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

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

  const body = await req.json();
  const result = createTagSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { status: "error", error: result.error.errors[0].message },
      { status: 400 },
    );
  }

  const { name } = result.data;

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

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<GetTagsResponse>> {
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

  const tags = await prisma.tag.findMany({
    where: {
      namespaceId: params.nsId,
    },
  });

  return NextResponse.json({
    status: "success",
    tags: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
  });
}
