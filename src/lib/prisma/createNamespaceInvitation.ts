import type { TNamespaceId } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTNamespaceInvitation } from "./format/formatTNamespaceInvitation";

export type TNamespaceInvitationInput = {
  token: string;
  expires: Date;
};

export const createNamespaceInvitation = async (
  nsId: TNamespaceId,
  { token, expires }: TNamespaceInvitationInput,
) => {
  const invitation = await prisma.namespaceInvitation.create({
    data: {
      namespaceId: nsId,
      token,
      expires,
    },
  });
  return formatTNamespaceInvitation(invitation);
};
