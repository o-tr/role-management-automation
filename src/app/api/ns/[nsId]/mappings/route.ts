import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { createExternalServiceGroupRoleMapping } from "@/lib/prisma/createExternalServiceGroupRoleMapping";
import { getExternalServiceGroup } from "@/lib/prisma/getExternalServiceGroup";
import { getExternalServiceGroupRoleMappingsByNamespaceId } from "@/lib/prisma/getExternalServiceGroupRoleMappingByNamespaceId";
import { getTag } from "@/lib/prisma/getTag";
import { validatePermission } from "@/lib/validatePermission";
import { type TMappingAction, ZMappingAction } from "@/types/actions";
import { type TMappingCondition, ZMappingCondition } from "@/types/conditions";
import type {
  TExternalServiceAccountId,
  TExternalServiceGroupId,
  TNamespaceId,
  TSerializedMapping,
  TTagId,
} from "@/types/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGroupRoles } from "../services/accounts/[accountId]/groups/[groupId]/roles/get-group-roles";

export type CreateMappingResponse =
  | {
      status: "success";
      mapping: TSerializedMapping;
    }
  | {
      status: "error";
      error: string;
    };

export type GetSerializedMappingsResponse =
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

export const POST = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<CreateMappingResponse> => {
    await validatePermission(params.nsId, "admin");

    const body = await req.json();
    const result = createMappingSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException("Invalid request body");
    }

    const { conditions, actions } = result.data;

    const tagIds = extractTags(conditions);

    const tags = await Promise.all(
      tagIds.map(async (tagId) => {
        return (await getTag(params.nsId, tagId)) || undefined;
      }),
    );

    if (tags.some((tag) => !tag)) {
      throw new BadRequestException("Invalid tag");
    }

    const { roles } = extractServiceGroups(actions);

    const validate = await Promise.all(
      roles.map(async (item) => {
        const group = await getExternalServiceGroup(
          params.nsId,
          item.accountId,
          item.groupId,
        );
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
      throw new BadRequestException("Invalid role");
    }

    const mapping = await createExternalServiceGroupRoleMapping(
      params.nsId,
      result.data,
    );

    return {
      status: "success",
      mapping,
    };
  },
);

const extractTags = (
  actions: TMappingCondition,
  tags: TTagId[] = [],
): TTagId[] => {
  if (actions.type === "comparator") {
    if (!tags.includes(actions.value as TTagId))
      tags.push(actions.value as TTagId);
    return tags;
  }
  if (actions.type === "not") {
    return extractTags(actions.condition, tags);
  }
  return actions.conditions.reduce((acc, cond) => extractTags(cond, acc), tags);
};

const extractServiceGroups = (actions: TMappingAction[]) => {
  const roles: {
    accountId: TExternalServiceAccountId;
    groupId: TExternalServiceGroupId;
    roleIds: string[];
  }[] = [];

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
        accountId: action.targetServiceAccountId as TExternalServiceAccountId,
        groupId: action.targetServiceGroupId as TExternalServiceGroupId,
        roleIds: [action.targetServiceRoleId],
      });
    }
  }

  return { roles };
};

export const GET = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<GetSerializedMappingsResponse> => {
    await validatePermission(params.nsId, "admin");

    const mappings = await getExternalServiceGroupRoleMappingsByNamespaceId(
      params.nsId,
    );

    return {
      status: "success",
      mappings,
    };
  },
);
