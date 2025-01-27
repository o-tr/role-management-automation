import type { TMember, TMemberId, TNamespaceId } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTMember } from "./format/formatTMember";

export const getMember = async (
  namespaceId: TNamespaceId,
  memberId: TMemberId,
): Promise<TMember | null> => {
  const result = await prisma.member.findUnique({
    where: {
      id: memberId,
      namespaceId: namespaceId,
    },
  });
  if (!result) {
    return null;
  }
  return formatTMember(result);
};
