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
    }: { params: { nsId: TNamespaceId; invitationId: TNamespaceInvitationId } },
  ): Promise<DeleteNamespaceInvitationResponse> => {
    await validatePermission(params.nsId, "owner");

    await deleteNamespaceInvitation(params.nsId, params.invitationId);

    return {
      status: "success",
    };
  },
);
