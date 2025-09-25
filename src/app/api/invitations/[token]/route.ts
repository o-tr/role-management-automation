import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { isBelongToNamespace } from "@/lib/isBelongToNamespace";
import { getNamespaceInvitationWithRelationByToken } from "@/lib/prisma/getNamespaceInvitationWithRelationByToken";
import { getNamespaceWithOwnerAndAdmins } from "@/lib/prisma/getNamespaceWithOwnerAndAdmin";
import { requireLoggedIn } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TNamespaceInvitationToken,
  TNamespaceInvitationWithRelation,
} from "@/types/prisma";

export type GetNamespaceInvitationResponse =
  | {
      status: "success";
      invitation: TNamespaceInvitationWithRelation;
    }
  | ErrorResponseType;

export const GET = api(
  async (
    _req: NextRequest,
    { params }: { params: { token: TNamespaceInvitationToken } },
  ): Promise<GetNamespaceInvitationResponse> => {
    const user = await requireLoggedIn();
    const invitation = await getNamespaceInvitationWithRelationByToken(
      params.token,
    );

    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    const namespace = await getNamespaceWithOwnerAndAdmins(
      invitation.namespaceId,
    );

    if (!namespace) {
      throw new NotFoundException("Namespace not found");
    }

    if (isBelongToNamespace(namespace, user.id)) {
      throw new BadRequestException("already_belongs");
    }

    return {
      status: "success",
      invitation,
    };
  },
);
