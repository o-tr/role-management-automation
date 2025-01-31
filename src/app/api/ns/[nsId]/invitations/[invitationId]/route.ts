import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { deleteNamespaceInvitation } from "@/lib/prisma/deleteNamespaceInvitation";
import { getNamespaceInvitation } from "@/lib/prisma/getNamespaceInvitation";
import { getNamespaceInvitationWithRelationByToken } from "@/lib/prisma/getNamespaceInvitationWithRelationByToken";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TNamespaceId,
  TNamespaceInvitation,
  TNamespaceInvitationId,
  TNamespaceInvitationToken,
  TNamespaceInvitationWithRelation,
} from "@/types/prisma";
import type { NextRequest } from "next/server";

export type DeleteNamespaceInvitationResponse =
  | {
      status: "success";
    }
  | ErrorResponseType;

export const DELETE = api(
  async (
    req: NextRequest,
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
