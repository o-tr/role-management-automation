import type { TMappingId, TNamespaceId } from "@/types/prisma";
import { prisma } from "../prisma";

export const deleteExternalServiceGroupRoleMapping = async (
  namespaceId: TNamespaceId,
  mappingId: TMappingId,
): Promise<void> => {
  await prisma.externalServiceGroupRoleMapping.delete({
    where: {
      namespaceId: namespaceId,
      id: mappingId,
    },
  });
};
