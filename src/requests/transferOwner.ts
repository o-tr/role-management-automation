import type { PostTransferNamespaceOwnerResponse } from "@/app/api/ns/[nsId]/admins/[userId]/transferOwner/route";
import type { TNamespaceId, TUserId } from "@/types/prisma";

export const transferOwner = async (
  nsId: TNamespaceId,
  userId: TUserId,
): Promise<PostTransferNamespaceOwnerResponse> => {
  const response = await fetch(
    `/api/ns/${nsId}/admins/${userId}/transferOwner`,
    {
      method: "POST",
    },
  ).then((res) => res.json());
  return response;
};
