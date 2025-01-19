import { prisma } from "@/lib/prisma";
import { type TMappingAction, ZMappingAction } from "@/types/actions";
import { type TMappingCondition, ZMappingCondition } from "@/types/conditions";
import type { TSerializedMapping } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zu } from "zod_utilz";

export type CreateMappingResponse =
  | {
      status: "success";
      mapping: {
        id: string;
        name: string;
        conditions: TMappingCondition;
        actions: TMappingAction;
        groupId: string;
        accountId: string;
      };
    }
  | {
      status: "error";
      error: string;
    };

export type GeTSerializedMappingsResponse =
  | {
      status: "success";
      mappings: TSerializedMapping[];
    }
  | {
      status: "error";
      error: string;
    };

const createMappingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  conditions: ZMappingCondition,
  actions: ZMappingAction,
  groupId: z.string().min(1, "Group ID is required"),
  accountId: z.string().min(1, "Account ID is required"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<CreateMappingResponse>> {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const result = createMappingSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        status: "error",
        error: result.error.errors.map((e) => e.message).join(", "),
      },
      { status: 400 },
    );
  }

  const { name, conditions, actions, groupId, accountId } = result.data;

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

  const account = await prisma.externalServiceAccount.findUnique({
    where: {
      id: accountId,
      namespaceId: params.nsId,
    },
  });

  if (!account) {
    return NextResponse.json(
      { status: "error", error: "Service account not found" },
      { status: 404 },
    );
  }

  const group = await prisma.externalServiceGroup.findUnique({
    where: {
      id: groupId,
      namespaceId: params.nsId,
    },
  });

  if (!group) {
    return NextResponse.json(
      { status: "error", error: "Group not found" },
      { status: 404 },
    );
  }

  const mapping = await prisma.externalServiceGroupRoleMapping.create({
    data: {
      name,
      conditions: JSON.stringify(conditions),
      actions: JSON.stringify(actions),
      group: { connect: { id: groupId } },
      account: { connect: { id: accountId } },
      namespace: { connect: { id: params.nsId } },
    },
  });

  return NextResponse.json({
    status: "success",
    mapping: {
      id: mapping.id,
      name: mapping.name,
      conditions: JSON.parse(mapping.conditions),
      actions: JSON.parse(mapping.actions),
      groupId: mapping.groupId,
      accountId: mapping.accountId,
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<GeTSerializedMappingsResponse>> {
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

  const mappings = await prisma.externalServiceGroupRoleMapping.findMany({
    where: {
      namespaceId: params.nsId,
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          icon: true,
        },
      },
      account: {
        select: {
          id: true,
          name: true,
          service: true,
          icon: true,
        },
      },
    },
  });

  return NextResponse.json({
    status: "success",
    mappings: mappings.map((mapping) => ({
      id: mapping.id,
      name: mapping.name,
      conditions: mapping.conditions,
      actions: mapping.actions,
      groupId: mapping.groupId,
      accountId: mapping.accountId,
      group: {
        id: mapping.group.id,
        name: mapping.group.name,
        icon: mapping.group.icon || undefined,
      },
      account: {
        id: mapping.account.id,
        name: mapping.account.name,
        service: mapping.account.service,
        icon: mapping.account.icon || undefined,
      },
    })),
  });
}
