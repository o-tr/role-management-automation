import type {
  TMappingId,
  TNamespaceId,
  TSerializedMapping,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTSerializedMapping } from "./format/formatTSerializedMapping";

export const getExternalServiceGroupRoleMapping = async (
  namespaceId: TNamespaceId,
  mappingId: TMappingId,
): Promise<TSerializedMapping | null> => {
  const result = await prisma.externalServiceGroupRoleMapping.findUnique({
    where: {
      id: mappingId,
      namespaceId: namespaceId,
    },
  });
  if (!result) {
    return null;
  }
  return formatTSerializedMapping(result);
};
