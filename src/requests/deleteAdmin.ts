import type { DeleteAdminResponse } from "@/app/api/ns/[nsId]/admins/[userId]/route";
import type { TNamespaceId, TUserId } from "@/types/prisma";

export const deleteAdmin = async (
  nsId: TNamespaceId,
  userId: TUserId,
): Promise<DeleteAdminResponse> => {
  const response = await fetch(`/api/ns/${nsId}/admins/${userId}`, {
    method: "DELETE",
  }).then((res) => res.json());
  return response;
};
