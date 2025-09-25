import { useState } from "react";
import { deleteAdmin as deleteAdminRequest } from "@/requests/deleteAdmin";
import type { TNamespaceId, TUserId } from "@/types/prisma";
import { onAdminsChange } from "./onAdminsChange";

export const useDeleteAdmin = (nsId: TNamespaceId) => {
  const [isPending, setIsPending] = useState(false);

  const deleteAdmin = async (userId: TUserId): Promise<void> => {
    setIsPending(true);
    const response = await deleteAdminRequest(nsId, userId);
    if (response.status === "error") {
      throw new Error(response.error);
    }
    onAdminsChange();
    setIsPending(false);
  };

  return {
    isPending,
    deleteAdmin,
  };
};
