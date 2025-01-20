import type { DeleteExternalServiceAccountResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/route";

export const deleteMapping = async (
  nsId: string,
  mappingId: string,
): Promise<DeleteExternalServiceAccountResponse> => {
  const response = await fetch(`/api/ns/${nsId}/mappings/${mappingId}`, {
    method: "DELETE",
  }).then((res) => res.json());
  return response;
};
