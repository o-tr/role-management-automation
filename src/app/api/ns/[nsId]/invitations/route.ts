import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { createNamespaceInvitation } from "@/lib/prisma/createNamespaceInvitation";
import { getNamespaceInvitations } from "@/lib/prisma/getNamespaceInvitations";
import { validatePermission } from "@/lib/validatePermission";
import type { TNamespaceId, TNamespaceInvitation } from "@/types/prisma";
import type { NextRequest } from "next/server";
import { z } from "zod";

export type CreateNamespaceInvitationResponse =
  | {
      status: "success";
      invitation: TNamespaceInvitation;
    }
  | {
      status: "error";
      error: string;
    };

export const createNamespaceInvitationSchema = z.object({
  expires: z.string().datetime(),
});
export type TCreateNamespaceInvitationRequestBody = z.infer<
  typeof createNamespaceInvitationSchema
>;

export const POST = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<CreateNamespaceInvitationResponse> => {
    await validatePermission(params.nsId, "admin");

    const body = createNamespaceInvitationSchema.safeParse(await req.json());

    if (!body.success) {
      throw new BadRequestException("Invalid request body");
    }

    const token = `${crypto.randomUUID()}-${btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
    )
      .substring(0, 32)
      .replace(/\//g, "_")
      .replace(/\+/g, "-")}`;

    const invitation = await createNamespaceInvitation(params.nsId, {
      token: token,
      expires: new Date(body.data.expires),
    });

    return {
      status: "success",
      invitation,
    };
  },
);

export type GetNamespaceInvitationsResponse =
  | {
      status: "success";
      invitations: TNamespaceInvitation[];
    }
  | {
      status: "error";
      error: string;
    };

export const GET = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<GetNamespaceInvitationsResponse> => {
    await validatePermission(params.nsId, "admin");

    const invitations = await getNamespaceInvitations(params.nsId);

    return {
      status: "success",
      invitations,
    };
  },
);
