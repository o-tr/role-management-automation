import type { TExternalServiceGroupId, TNamespaceId } from "@/types/prisma";
import { prisma } from "../prisma";

export const deleteExternalServiceGroup = async (
  namespaceId: TNamespaceId,
  groupId: TExternalServiceGroupId,
): Promise<void> => {
  await prisma.externalServiceGroup.delete({
    where: {
      namespaceId: namespaceId,
      id: groupId,
    },
  });
};
