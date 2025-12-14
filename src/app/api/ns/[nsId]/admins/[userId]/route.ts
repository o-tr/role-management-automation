import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { disconnectUserAndNamespace } from "@/lib/prisma/disconnectUserAndNamespace";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { TNamespaceId, TUserId } from "@/types/prisma";

export type DeleteAdminResponse =
  | {
      status: "success";
    }
  | ErrorResponseType;

export const DELETE = api(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ nsId: TNamespaceId; userId: TUserId }> },
  ): Promise<DeleteAdminResponse> => {
    const { nsId, userId } = await params;
    const namespace = await validatePermission(nsId, "owner");

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
