import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { isBelongToNamespace } from "@/lib/isBelongToNamespace";
import { connectUserAndNamespace } from "@/lib/prisma/connectUserAndNamespace";
import { formatTNamespace } from "@/lib/prisma/format/formatTNamespace";
import { getNamespaceInvitationWithRelationByToken } from "@/lib/prisma/getNamespaceInvitationWithRelationByToken";
import { getNamespaceWithOwnerAndAdmins } from "@/lib/prisma/getNamespaceWithOwnerAndAdmin";
import { requireLoggedIn } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { TNamespace, TNamespaceInvitationToken } from "@/types/prisma";
import type { NextRequest } from "next/server";

export type PostAcceptInvitationResponse =
  | {
      status: "success";
      namespace: TNamespace;
    }
  | ErrorResponseType;

export const POST = api(
  async (
    req: NextRequest,
    { params }: { params: { token: TNamespaceInvitationToken } },
  ): Promise<PostAcceptInvitationResponse> => {
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

    await connectUserAndNamespace(user.id, invitation.namespaceId);

    return {
      status: "success",
      namespace: formatTNamespace(namespace),
    };
  },
);
