import type { ExternalServiceName } from "@prisma/client";
import type { NextRequest } from "next/server";
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
  ): Promise<GetExternalServiceGroupMembersResponse> => {
    const { nsId, accountId, groupId } = await params;
    await validatePermission(nsId, "admin");

    const serviceGroup = await getExternalServiceGroup(
      nsId,
      accountId,
      groupId,
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
