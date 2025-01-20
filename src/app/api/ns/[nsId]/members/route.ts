import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type AddMembersResponse =
  | {
      status: "success";
      members: {
        id: string;
        name: string;
      }[];
    }
  | {
      status: "error";
      error: string;
    };

const memberSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const addMembersSchema = z.array(
  z.object({
    name: z.string(),
    email: z.string().email(),
  }),
);

export async function POST(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<AddMembersResponse>> {
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

  const body = addMembersSchema.parse(await req.json());

  const members = await prisma.$transaction(
    body.map((member) =>
      prisma.member.create({
        data: {
          name: member.name,
          namespaceId: params.nsId,
        },
      }),
    ),
  );

  return NextResponse.json({
    status: "success",
    members,
  });
}
