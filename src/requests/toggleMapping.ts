import type { ToggleMappingResponse } from "@/app/api/ns/[nsId]/mappings/[mappingId]/toggle/route";
import { BaseException } from "@/lib/exceptions/BaseException";
import type { TMappingId, TNamespaceId } from "@/types/prisma";

export const toggleMapping = async (
  nsId: TNamespaceId,
  mappingId: TMappingId,
): Promise<void> => {
  const response = await fetch(`/api/ns/${nsId}/mappings/${mappingId}/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new BaseException(
      `Failed to toggle mapping: ${response.status} ${errorText}`,
    );
  }

  const result: ToggleMappingResponse = await response.json();
  if (result.status !== "success") {
    throw new BaseException(`Failed to toggle mapping: ${result.error}`);
  }
};
