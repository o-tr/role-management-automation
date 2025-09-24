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
  conditions?: TMappingCondition;
  actions?: TMappingAction[];
  enabled?: boolean;
};

export const updateExternalServiceGroupRoleMapping = async (
  namespaceId: TNamespaceId,
  mappingId: TMappingId,
  data: TUpdateMapping,
): Promise<TSerializedMapping> => {
  const updateData: {
    conditions?: string;
    actions?: string;
    enabled?: boolean;
  } = {};

  if (data.conditions !== undefined) {
    updateData.conditions = JSON.stringify(data.conditions);
  }
  if (data.actions !== undefined) {
    updateData.actions = JSON.stringify(data.actions);
  }
  if (data.enabled !== undefined) {
    updateData.enabled = data.enabled;
  }

  if (Object.keys(updateData).length === 0) {
    const currentMapping =
      await prisma.externalServiceGroupRoleMapping.findUniqueOrThrow({
        where: {
          id: mappingId,
          namespaceId: namespaceId,
        },
      });
    return formatTSerializedMapping(currentMapping);
  }

  const result = await prisma.externalServiceGroupRoleMapping.update({
    where: {
      id: mappingId,
      namespaceId: namespaceId,
    },
    data: updateData,
  });
  return formatTSerializedMapping(result);
};
