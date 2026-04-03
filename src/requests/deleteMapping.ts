import type { DeleteExternalServiceAccountResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/route";

export const deleteMapping = async (
  nsId: string,
  mappingId: string,
): Promise<DeleteExternalServiceAccountResponse> => {
  try {
    const res = await fetch(`/api/ns/${nsId}/mappings/${mappingId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        status: "error",
        code: res.status,
        error: text || `Request failed with status ${res.status}`,
      };
    }
    try {
      return (await res.json()) as DeleteExternalServiceAccountResponse;
    } catch (_error) {
      return {
        status: "error",
        code: 500,
        error: "Failed to parse JSON response",
      };
    }
  } catch (error) {
    return {
      status: "error",
      code: 500,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
