import type { TMappingAction } from "@/types/actions";
import type { TMappingCondition } from "@/types/conditions";
import type {
  TMappingId,
  TNamespaceId,
  TSerializedMapping,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTSerializedMapping } from "./format/formatTSerializedMapping";

type TCreateMapping = {
  conditions: TMappingCondition;
  actions: TMappingAction[];
};

export const createExternalServiceGroupRoleMapping = async (
  namespaceId: TNamespaceId,
  data: TCreateMapping,
): Promise<TSerializedMapping> => {
  const result = await prisma.externalServiceGroupRoleMapping.create({
    data: {
      namespaceId: namespaceId,
      conditions: JSON.stringify(data.conditions),
      actions: JSON.stringify(data.actions),
    },
  });
  return formatTSerializedMapping(result);
};
