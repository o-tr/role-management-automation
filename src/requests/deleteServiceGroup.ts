import type { DeleteExternalServiceGroupResponse } from "@/app/api/ns/[nsId]/services/groups/[groupId]/route";

export const deleteServiceGroup = async (
  nsId: string,
  groupId: string,
): Promise<DeleteExternalServiceGroupResponse> => {
  const response = await fetch(`/api/ns/${nsId}/services/groups/${groupId}`, {
    method: "DELETE",
  }).then((res) => res.json());
  return response;
};
