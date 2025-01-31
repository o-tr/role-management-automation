import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { disconnectUserAndNamespace } from "@/lib/prisma/disconnectUserAndNamespace";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { TNamespaceId, TUserId } from "@/types/prisma";
import type { NextRequest } from "next/server";

export type DeleteAdminResponse =
  | {
      status: "success";
    }
  | ErrorResponseType;

export const DELETE = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId; userId: TUserId } },
  ): Promise<DeleteAdminResponse> => {
    const namespace = await validatePermission(params.nsId, "owner");

    const { nsId, userId } = params;

    if (userId === namespace.ownerId) {
      throw new BadRequestException("Cannot remove owner");
    }

    if (!namespace.admins.some((admin) => admin.id === userId)) {
      throw new NotFoundException("User is not found or not an admin");
    }

    await disconnectUserAndNamespace(userId, nsId);

    return {
      status: "success",
    };
  },
);
