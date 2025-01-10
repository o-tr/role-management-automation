import type { DeleteExternalServiceGroupResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/groups/[groupId]/route";

export const deleteServiceGroup = async (
  nsId: string,
  accountId: string,
  groupId: string,
): Promise<DeleteExternalServiceGroupResponse> => {
  const response = await fetch(
    `/api/ns/${nsId}/services/accounts/${accountId}/groups/${groupId}`,
    {
      method: "DELETE",
    },
  ).then((res) => res.json());
  return response;
};
