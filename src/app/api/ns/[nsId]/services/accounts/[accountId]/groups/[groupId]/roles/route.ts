import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { getExternalServiceGroup } from "@/lib/prisma/getExternalServiceGroup";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TExternalServiceAccountId,
  TExternalServiceGroupId,
  TExternalServiceGroupRole,
  TNamespaceId,
} from "@/types/prisma";
import { getGroupRoles } from "./get-group-roles";

export type GetExternalServiceGroupRolesResponse =
  | {
      status: "success";
      serviceRoles: TExternalServiceGroupRole[];
    }
  | ErrorResponseType;

export const GET = api(
  async (
    _req: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        nsId: TNamespaceId;
        accountId: TExternalServiceAccountId;
        groupId: TExternalServiceGroupId;
      }>;
    },
  ): Promise<GetExternalServiceGroupRolesResponse> => {
    const { nsId, accountId, groupId } = await params;
    await validatePermission(nsId, "admin");

    const group = await getExternalServiceGroup(nsId, accountId, groupId);

    if (!group) {
      throw new NotFoundException("Service group not found");
    }

    const serviceRoles = await getGroupRoles(group.account, group);

    return {
      status: "success",
      serviceRoles,
    };
  },
);
