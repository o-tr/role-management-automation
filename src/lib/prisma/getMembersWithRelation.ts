import type {
  TMemberExternalServiceAccountId,
  TMemberId,
  TMemberWithRelation,
  TNamespaceId,
  TTagId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTMemberWithRelation } from "./format/formatTMemberWithRelation";

export const getMembersWithRelation = async (
  namespaceId: TNamespaceId,
): Promise<TMemberWithRelation[]> => {
  const result = await prisma.member.findMany({
    where: {
      namespaceId: namespaceId,
    },
    include: {
      tags: {
        orderBy: {
          name: "asc",
        },
      },
      externalAccounts: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return result.map(formatTMemberWithRelation);
};
