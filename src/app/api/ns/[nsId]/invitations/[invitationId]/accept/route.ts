import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { connectUserAndNamespace } from "@/lib/prisma/connectUserAndNamespace";
import { getNamespaceInvitation } from "@/lib/prisma/getNamespaceInvitation";
import { validatePermission } from "@/lib/validatePermission";
import type { TNamespaceId, TNamespaceInvitationId } from "@/types/prisma";
import type { NextRequest } from "next/server";

export type PostAcceptInvitationResponse =
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
      params,
    }: { params: { nsId: TNamespaceId; invitationId: TNamespaceInvitationId } },
  ): Promise<PostAcceptInvitationResponse> => {
    const { user } = await validatePermission(params.nsId, "logged-in");

    const invitation = await getNamespaceInvitation(
      params.nsId,
      params.invitationId,
    );

    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    await connectUserAndNamespace(user.id, invitation.namespaceId);

    return {
      status: "success",
    };
  },
);
