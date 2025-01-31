import type { TNamespace, TNamespaceId } from "@/types/prisma";
import type { Namespace } from "@prisma/client";

export const formatTNamespace = (input: Namespace | TNamespace): TNamespace => {
  return {
    id: input.id as TNamespaceId,
    name: input.name,
  };
};
