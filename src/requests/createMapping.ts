import type { TMappingAction } from "@/types/actions";
import type { TMappingCondition } from "@/types/conditions";

export const createMapping = async (
  namespaceId: string,
  groupId: string,
  accountId: string,
  name: string,
  conditions: TMappingCondition,
  actions: TMappingAction,
) => {
  const res = await fetch(`/api/ns/${namespaceId}/mappings`, {
    method: "POST",
    body: JSON.stringify({
      groupId,
      accountId,
      name,
      conditions,
      actions,
    }),
  });
  const data = await res.json();
  if (data.status === "error") {
    throw new Error(data.error);
  }
  return data.mapping;
};
