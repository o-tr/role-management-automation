import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { updateNamespace } from "@/lib/prisma/updateNamespace";
import { validatePermission } from "@/lib/validatePermission";
import type { TNamespaceId, TUserId } from "@/types/prisma";
import type { NextRequest } from "next/server";

export type PostTransferNamespaceOwnerResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

export const POST = api(
  async (
    req: NextRequest,
    {
      params: { userId, nsId },
    }: { params: { nsId: TNamespaceId; userId: TUserId } },
  ): Promise<PostTransferNamespaceOwnerResponse> => {
    const namespace = await validatePermission(nsId, "owner");

    if (userId === namespace.ownerId) {
      throw new BadRequestException("Cannot transfer to the same user");
    }

    if (!namespace.admins.some((admin) => admin.id === userId)) {
      throw new NotFoundException("User is not found or not an admin");
    }

    await updateNamespace(nsId, {
      ownerId: userId,
    });

    return {
      status: "success",
    };
  },
);
