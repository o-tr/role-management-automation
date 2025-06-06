import type { DeleteExternalServiceAccountResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/route";

export const deleteServiceAccount = async (
  nsId: string,
  accountId: string,
): Promise<DeleteExternalServiceAccountResponse> => {
  const response = await fetch(
    `/api/ns/${nsId}/services/accounts/${accountId}`,
    {
      method: "DELETE",
    },
  ).then((res) => res.json());
  return response;
};
