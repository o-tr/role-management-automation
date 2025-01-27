import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { prisma } from "@/lib/prisma";
import { getExternalServiceGroup } from "@/lib/prisma/getExternalServiceGroup";
import { validatePermission } from "@/lib/validatePermission";
import type {
  TExternalServiceAccountId,
  TExternalServiceGroupId,
  TNamespaceId,
} from "@/types/prisma";
import type { NextRequest } from "next/server";

export type DeleteExternalServiceGroupResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

export const DELETE = api(
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
  ): Promise<DeleteExternalServiceGroupResponse> => {
    await validatePermission(params.nsId, "admin");

    const serviceGroup = await getExternalServiceGroup(
      params.nsId,
      params.accountId,
      params.groupId,
    );

    if (!serviceGroup) {
      throw new NotFoundException("Service group not found");
    }

    await prisma.externalServiceGroup.delete({
      where: {
        id: params.groupId,
      },
    });

    return {
      status: "success",
    };
  },
);
