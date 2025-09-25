import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { deleteExternalServiceGroup } from "@/lib/prisma/deleteExternalServiceGroup";
import { getExternalServiceGroup } from "@/lib/prisma/getExternalServiceGroup";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TExternalServiceAccountId,
  TExternalServiceGroupId,
  TNamespaceId,
} from "@/types/prisma";

export type DeleteExternalServiceGroupResponse =
  | {
      status: "success";
    }
  | ErrorResponseType;

export const DELETE = api(
  async (
    _req: NextRequest,
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
    await validatePermission(params.nsId, "owner");

    const serviceGroup = await getExternalServiceGroup(
      params.nsId,
      params.accountId,
      params.groupId,
    );

    if (!serviceGroup) {
      throw new NotFoundException("Service group not found");
    }

    await deleteExternalServiceGroup(params.nsId, params.groupId);

    return {
      status: "success",
    };
  },
);
