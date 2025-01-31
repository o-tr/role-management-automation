import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { deleteNamespaceInvitation } from "@/lib/prisma/deleteNamespaceInvitation";
import { getNamespaceInvitation } from "@/lib/prisma/getNamespaceInvitation";
import { validatePermission } from "@/lib/validatePermission";
import type {
  TNamespaceId,
  TNamespaceInvitation,
  TNamespaceInvitationId,
} from "@/types/prisma";
import type { NextRequest } from "next/server";

export type DeleteNamespaceInvitationResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

export const DELETE = api(
  async (
    req: NextRequest,
    {
      params,
    }: { params: { nsId: TNamespaceId; invitationId: TNamespaceInvitationId } },
  ): Promise<DeleteNamespaceInvitationResponse> => {
    await validatePermission(params.nsId, "admin");

    await deleteNamespaceInvitation(params.nsId, params.invitationId);

    return {
      status: "success",
    };
  },
);

export type GetNamespaceInvitationResponse =
  | {
      status: "success";
      invitation: TNamespaceInvitation;
    }
  | {
      status: "error";
      error: string;
    };

export const GET = api(
  async (
    req: NextRequest,
    {
      params,
    }: { params: { nsId: TNamespaceId; invitationId: TNamespaceInvitationId } },
  ): Promise<GetNamespaceInvitationResponse> => {
    await validatePermission(params.nsId, "logged-in");
    const invitation = await getNamespaceInvitation(
      params.nsId,
      params.invitationId,
    );

    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    return {
      status: "success",
      invitation,
    };
  },
);
