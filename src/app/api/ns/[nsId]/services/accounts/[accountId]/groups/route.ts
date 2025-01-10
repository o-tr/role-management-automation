import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGroupDetail } from "./get-group-detail";

export type CreateExternalServiceGroupResponse =
  | {
      status: "success";
      group: {
        id: string;
        name: string;
        groupId: string;
        icon?: string;
      };
    }
  | {
      status: "error";
      error: string;
    };

const createGroupSchema = z.object({
  groupId: z.string().min(1, "GroupId is required"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { nsId: string; accountId: string } },
): Promise<NextResponse<CreateExternalServiceGroupResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const result = createGroupSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        status: "error",
        error: result.error.errors.map((e) => e.message).join(", "),
      },
      { status: 400 },
    );
  }

  const { groupId } = result.data;

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

  const serviceAccount = await prisma.externalServiceAccount.findUnique({
    where: {
      id: params.accountId,
      namespaceId: params.nsId,
    },
  });

  if (!serviceAccount) {
    return NextResponse.json(
      { status: "error", error: "Service account not found" },
      { status: 404 },
    );
  }
  const groupExists = await prisma.externalServiceGroup.findFirst({
    where: {
      namespaceId: params.nsId,
      accountId: params.accountId,
      groupId,
    },
  });

  if (groupExists) {
    return NextResponse.json(
      { status: "error", error: "Group already exists" },
      { status: 400 },
    );
  }

  const data = await getGroupDetail(serviceAccount, groupId);

  const group = await prisma.externalServiceGroup.create({
    data: {
      name: data.name,
      groupId: data.id,
      icon: data.icon,
      account: { connect: { id: params.accountId } },
      namespace: { connect: { id: params.nsId } },
    },
  });

  return NextResponse.json({
    status: "success",
    group: {
      id: group.id,
      name: group.name,
      groupId: group.groupId,
      icon: group.icon || undefined,
    },
  });
}
