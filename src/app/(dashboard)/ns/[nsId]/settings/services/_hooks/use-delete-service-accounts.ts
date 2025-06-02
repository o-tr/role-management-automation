import { deleteServiceAccount as deleteServiceAccountRequest } from "@/requests/deleteServiceAccount";
import { useState } from "react";
import { onServiceAccountChange } from "./on-accounts-change";

export const useDeleteServiceAccount = () => {
  const [isPending, setIsPending] = useState(false);

  const deleteServiceAccount = async (
    nsId: string,
    accountId: string,
  ): Promise<void> => {
    setIsPending(true);
    const response = await deleteServiceAccountRequest(nsId, accountId);
    if (response.status === "error") {
      throw new Error(response.error);
    }
    onServiceAccountChange();
    setIsPending(false);
  };

  const deleteServiceAccounts = async (
    nsId: string,
    accountIds: string[],
  ): Promise<void> => {
    setIsPending(true);
    const response = await Promise.all(
      accountIds.map((accountId) =>
        deleteServiceAccountRequest(nsId, accountId),
      ),
    );
    if (response.some((res) => res.status === "error")) {
      throw new Error("Failed to delete some service accounts");
    }
    onServiceAccountChange();
    setIsPending(false);
  };

  return {
    isPending,
    deleteServiceAccount,
    deleteServiceAccounts,
  };
};
