import { prisma } from "@/lib/prisma";
import { type TMappingAction, ZMappingAction } from "@/types/actions";
import { type TMappingCondition, ZMappingCondition } from "@/types/conditions";
import type { TSerializedMapping } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGroupRoles } from "../services/accounts/[accountId]/groups/[groupId]/roles/get-group-roles";

export type CreateMappingResponse =
  | {
      status: "success";
      mapping: {
        id: string;
        conditions: TMappingCondition;
        actions: TMappingAction;
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
  conditions: ZMappingCondition,
  actions: z.array(ZMappingAction),
});
export type CreateMappingBody = z.infer<typeof createMappingSchema>;

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

  const { conditions, actions } = result.data;

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

  const tagIds = extractTags(conditions);

  const tags = await Promise.all(
    tagIds.map(async (tagId) => {
      return (
        (await prisma.tag.findUnique({
          where: {
            id: tagId,
            namespaceId: params.nsId,
          },
        })) || undefined
      );
    }),
  );

  if (tags.some((tag) => !tag)) {
    return NextResponse.json(
      { status: "error", error: "Invalid tag" },
      { status: 400 },
    );
  }

  const { roles } = extractServiceGroups(actions);

  const validate = await Promise.all(
    roles.map(async (item) => {
      const group = await prisma.externalServiceGroup.findUnique({
        where: {
          id: item.groupId,
          accountId: item.accountId,
          namespaceId: params.nsId,
        },
        include: {
          account: true,
        },
      });

      if (!group) {
        return undefined;
      }

      const roles = await getGroupRoles(group.account, group);
      return item.roleIds.every((roleId) =>
        roles.find((role) => role.id === roleId),
      );
    }),
  );

  if (validate.some((v) => !v)) {
    return NextResponse.json(
      { status: "error", error: "Invalid group or role" },
      { status: 400 },
    );
  }

  const mapping = await prisma.externalServiceGroupRoleMapping.create({
    data: {
      conditions: JSON.stringify(conditions),
      actions: JSON.stringify(actions),
      namespace: { connect: { id: params.nsId } },
    },
  });

  return NextResponse.json({
    status: "success",
    mapping: {
      id: mapping.id,
      conditions: JSON.parse(mapping.conditions),
      actions: JSON.parse(mapping.actions),
    },
  });
}

const extractTags = (
  actions: TMappingCondition,
  tags: string[] = [],
): string[] => {
  if (actions.type === "comparator") {
    if (!tags.includes(actions.value)) tags.push(actions.value);
    return tags;
  }
  if (actions.type === "not") {
    return extractTags(actions.condition, tags);
  }
  return actions.conditions.reduce((acc, cond) => extractTags(cond, acc), tags);
};

const extractServiceGroups = (actions: TMappingAction[]) => {
  const roles: { accountId: string; groupId: string; roleIds: string[] }[] = [];

  for (const action of actions) {
    const role = roles.find(
      (r) =>
        r.accountId === action.targetServiceAccountId &&
        r.groupId === action.targetServiceGroupId,
    );
    if (role) {
      role.roleIds.push(action.targetServiceRoleId);
    } else {
      roles.push({
        accountId: action.targetServiceAccountId,
        groupId: action.targetServiceGroupId,
        roleIds: [action.targetServiceRoleId],
      });
    }
  }

  return { roles };
};

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
  });

  return NextResponse.json({
    status: "success",
    mappings: mappings.map((mapping) => ({
      id: mapping.id,
      conditions: mapping.conditions,
      actions: mapping.actions,
    })),
  });
}
