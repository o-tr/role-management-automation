import type { TMappingAction } from "@/types/actions";
import type { TMappingCondition } from "@/types/conditions";
import type {
  TMappingId,
  TNamespaceId,
  TSerializedMapping,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTSerializedMapping } from "./format/formatTSerializedMapping";

type TUpdateMapping = {
  conditions: TMappingCondition;
  actions: TMappingAction[];
};

export const updateExternalServiceGroupRoleMapping = async (
  namespaceId: TNamespaceId,
  mappingId: TMappingId,
  data: TUpdateMapping,
): Promise<TSerializedMapping> => {
  const result = await prisma.externalServiceGroupRoleMapping.update({
    where: {
      id: mappingId,
      namespaceId: namespaceId,
    },
    data: {
      conditions: JSON.stringify(data.conditions),
      actions: JSON.stringify(data.actions),
    },
  });
  return formatTSerializedMapping(result);
};
