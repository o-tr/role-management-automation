import type { TMemberId, TNamespaceId } from "@/types/prisma";
import { prisma } from "../prisma";

export const deleteMember = async (
  namespaceId: TNamespaceId,
  memberId: TMemberId,
): Promise<void> => {
  await prisma.$transaction([
    prisma.memberExternalServiceAccount.deleteMany({
      where: {
        memberId: memberId,
        namespaceId: namespaceId,
      },
    }),
    prisma.member.delete({
      where: {
        id: memberId,
        namespaceId: namespaceId,
      },
    }),
  ]);
};
