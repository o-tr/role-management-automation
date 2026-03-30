import { useCallback, useState } from "react";
import { deleteServiceGroup as deleteServiceGroupRequest } from "@/requests/deleteServiceGroup";
import { onServiceGroupChange } from "./on-groups-change";

export const useDeleteServiceGroup = (nsId: string) => {
  const [isPending, setIsPending] = useState(false);

  const deleteServiceGroup = useCallback(
    async (accountId: string, groupId: string): Promise<void> => {
      setIsPending(true);
      try {
        const response = await deleteServiceGroupRequest(
          nsId,
          accountId,
          groupId,
        );
        if (response.status === "error") {
          throw new Error(response.error);
        }
        onServiceGroupChange();
      } finally {
        setIsPending(false);
      }
    },
    [nsId],
  );

  const deleteServiceGroups = useCallback(
    async (accountId: string, groupIds: string[]): Promise<void> => {
      setIsPending(true);
      try {
        const response = await Promise.all(
          groupIds.map((groupId) =>
            deleteServiceGroupRequest(nsId, accountId, groupId),
          ),
        );
        if (response.some((res) => res.status === "error")) {
          throw new Error("Failed to delete some service accounts");
        }
        onServiceGroupChange();
      } finally {
        setIsPending(false);
      }
    },
    [nsId],
  );

  return {
    isPending,
    deleteServiceGroup,
    deleteServiceGroups,
  };
};
