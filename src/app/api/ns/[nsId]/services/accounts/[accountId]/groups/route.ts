import type { NextRequest } from "next/server";
import { z } from "zod";
import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { createExternalServiceGroup } from "@/lib/prisma/createExternalServiceGroup";
import { getExternalServiceAccount } from "@/lib/prisma/getExternalServiceAccount";
import { getExternalServiceGroupByGroupId } from "@/lib/prisma/getExternalServiceGroupByGroupId";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { TExternalServiceAccountId, TNamespaceId } from "@/types/prisma";
import { getGroupDetail } from "./get-group-detail";

export type CreateExternalServiceGroupResponse =
  | {
      status: "success";
      group: {
        id: string;
        name: string;
        groupId: string;
        icon?: string;
      };
    }
  | ErrorResponseType;

const createGroupSchema = z.object({
  groupId: z.string().min(1, "GroupId is required"),
});

export const POST = api(
  async (
    req: NextRequest,
    {
      params,
    }: { params: { nsId: TNamespaceId; accountId: TExternalServiceAccountId } },
  ): Promise<CreateExternalServiceGroupResponse> => {
    await validatePermission(params.nsId, "owner");

    const body = await req.json();
    const result = createGroupSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException("Invalid request body");
    }

    const { groupId } = result.data;

    const serviceAccount = await getExternalServiceAccount(
      params.nsId,
      params.accountId,
    );

    if (!serviceAccount) {
      throw new NotFoundException("Service account not found");
    }
    const groupExists = await getExternalServiceGroupByGroupId(
      params.nsId,
      params.accountId,
      groupId,
    );

    if (groupExists) {
      throw new BadRequestException("Group already exists");
    }

    const data = await getGroupDetail(serviceAccount, groupId);

    const group = await createExternalServiceGroup(
      params.nsId,
      params.accountId,
      data,
    );

    return {
      status: "success",
      group: {
        id: group.id,
        name: group.name,
        groupId: group.groupId,
        icon: group.icon || undefined,
      },
    };
  },
);
