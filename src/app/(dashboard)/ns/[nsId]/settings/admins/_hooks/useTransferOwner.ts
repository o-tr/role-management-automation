import { useState } from "react";
import { transferOwner as transferOwnerRequest } from "@/requests/transferOwner";
import type { TNamespaceId, TUserId } from "@/types/prisma";
import { onAdminsChange } from "./onAdminsChange";

export const useTransferOwner = (nsId: TNamespaceId) => {
  const [isPending, setIsPending] = useState(false);

  const transferOwner = async (userId: TUserId): Promise<void> => {
    setIsPending(true);
    const response = await transferOwnerRequest(nsId, userId);
    if (response.status === "error") {
      throw new Error(response.error);
    }
    onAdminsChange();
    setIsPending(false);
  };

  return {
    isPending,
    transferOwner,
  };
};
