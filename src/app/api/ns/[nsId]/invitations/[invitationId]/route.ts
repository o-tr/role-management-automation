import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { deleteNamespaceInvitation } from "@/lib/prisma/deleteNamespaceInvitation";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { TNamespaceId, TNamespaceInvitationId } from "@/types/prisma";

export type DeleteNamespaceInvitationResponse =
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
        invitationId: TNamespaceInvitationId;
      }>;
    },
  ): Promise<DeleteNamespaceInvitationResponse> => {
    const { nsId, invitationId } = await params;
    await validatePermission(nsId, "owner");

    await deleteNamespaceInvitation(nsId, invitationId);

    return {
      status: "success",
    };
  },
);
