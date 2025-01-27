import type { TMappingId, TSerializedMapping } from "@/types/prisma";
import type { ExternalServiceGroupRoleMapping } from "@prisma/client";

export const formatTSerializedMapping = (
  input: ExternalServiceGroupRoleMapping,
): TSerializedMapping => {
  return {
    id: input.id as TMappingId,
    conditions: input.conditions,
    actions: input.actions,
  };
};
