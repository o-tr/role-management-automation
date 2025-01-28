import type { TMapping, TSerializedMapping } from "@/types/prisma";

export const convertTSerializedMappingToTMapping = (
  serializedMapping: TSerializedMapping,
): TMapping => {
  return {
    ...serializedMapping,
    conditions: JSON.parse(serializedMapping.conditions),
    actions: JSON.parse(serializedMapping.actions),
  };
};
