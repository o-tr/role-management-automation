import {
  TMember,
  type TMemberExternalServiceAccountId,
  type TMemberId,
  type TMemberWithRelation,
  type TNamespaceId,
  type TTagId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTMemberWithRelation } from "./format/formatTMemberWithRelation";

export const getMemberWithRelation = async (
  namespaceId: TNamespaceId,
  memberId: TMemberId,
): Promise<TMemberWithRelation | null> => {
  const result = await prisma.member.findUnique({
    where: {
      id: memberId,
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
  });
  if (!result) {
    return null;
  }
  return formatTMemberWithRelation(result);
};
