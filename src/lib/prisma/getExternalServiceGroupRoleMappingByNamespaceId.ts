import type { TNamespaceId, TSerializedMapping } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTSerializedMapping } from "./format/formatTSerializedMapping";

export const getExternalServiceGroupRoleMappingsByNamespaceId = async (
  namespaceId: TNamespaceId,
): Promise<TSerializedMapping[]> => {
  const result = await prisma.externalServiceGroupRoleMapping.findMany({
    where: {
      namespaceId: namespaceId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return result.map(formatTSerializedMapping);
};
