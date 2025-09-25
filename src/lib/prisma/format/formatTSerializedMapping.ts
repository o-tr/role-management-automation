import type { ExternalServiceGroupRoleMapping } from "@prisma/client";
import type { TMappingId, TSerializedMapping } from "@/types/prisma";

export const formatTSerializedMapping = (
  input: ExternalServiceGroupRoleMapping,
): TSerializedMapping => {
  return {
    id: input.id as TMappingId,
    conditions: input.conditions,
    actions: input.actions,
    enabled: input.enabled,
  };
};
