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
      params: Promise<{
        nsId: TNamespaceId;
        accountId: TExternalServiceAccountId;
        groupId: TExternalServiceGroupId;
      }>;
    },
  ): Promise<DeleteExternalServiceGroupResponse> => {
    const { nsId, accountId, groupId } = await params;
    await validatePermission(nsId, "owner");

    const serviceGroup = await getExternalServiceGroup(
      nsId,
      accountId,
      groupId,
    );

    if (!serviceGroup) {
      throw new NotFoundException("Service group not found");
    }

    await deleteExternalServiceGroup(nsId, groupId);

    return {
      status: "success",
    };
  },
);
