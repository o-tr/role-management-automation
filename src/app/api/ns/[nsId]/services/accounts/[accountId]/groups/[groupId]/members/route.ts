import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { getExternalServiceGroup } from "@/lib/prisma/getExternalServiceGroup";
import { validatePermission } from "@/lib/validatePermission";
import type {
  TExternalServiceAccountId,
  TExternalServiceGroupId,
  TExternalServiceGroupMember,
  TNamespaceId,
} from "@/types/prisma";
import type { ExternalServiceName } from "@prisma/client";
import type { NextRequest } from "next/server";
import { getMembers } from "./getMembers";

export type GetExternalServiceGroupMembersResponse =
  | {
      status: "success";
      members: TExternalServiceGroupMember[];
      service: ExternalServiceName;
    }
  | {
      status: "error";
      error: string;
    };

export const GET = api(
  async (
    req: NextRequest,
    {
      params,
    }: {
      params: {
        nsId: TNamespaceId;
        accountId: TExternalServiceAccountId;
        groupId: TExternalServiceGroupId;
      };
    },
  ): Promise<GetExternalServiceGroupMembersResponse> => {
    await validatePermission(params.nsId, "admin");

    const serviceGroup = await getExternalServiceGroup(
      params.nsId,
      params.accountId,
      params.groupId,
    );

    if (!serviceGroup) {
      throw new NotFoundException("Service group not found");
    }

    const members = await getMembers(serviceGroup);

    return {
      status: "success",
      members,
      service: serviceGroup.account.service,
    };
  },
);
