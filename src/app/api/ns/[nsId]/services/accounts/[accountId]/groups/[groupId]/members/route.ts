import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { getExternalServiceGroup } from "@/lib/prisma/getExternalServiceGroup";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TExternalServiceAccountId,
  TExternalServiceGroupId,
  TExternalServiceGroupMember,
  TNamespaceId,
} from "@/types/prisma";
import type { ExternalServiceName } from "@prisma/client";
import type { NextRequest } from "next/server";
import { getMembers } from "./getMembers";

export type TExternalServiceGroupMembers = {
  serviceAccountId: TExternalServiceAccountId;
  serviceGroupId: TExternalServiceGroupId;
  members: TExternalServiceGroupMember[];
  service: ExternalServiceName;
};

export type GetExternalServiceGroupMembersResponse =
  | {
      status: "success";
      data: TExternalServiceGroupMembers;
    }
  | ErrorResponseType;

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
      data: {
        serviceAccountId: serviceGroup.account.id,
        serviceGroupId: serviceGroup.id,
        members,
        service: serviceGroup.account.service,
      },
    };
  },
);
