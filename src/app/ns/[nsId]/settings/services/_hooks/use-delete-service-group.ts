import { deleteServiceGroup as deleteServiceGroupRequest } from "@/requests/deleteServiceGroup";
import { useCallback, useState } from "react";
import { onServiceGroupChange } from "./on-groups-change";

export const useDeleteServiceGroup = () => {
  const [isPending, setIsPending] = useState(false);

  const deleteServiceGroup = useCallback(
    async (nsId: string, groupId: string): Promise<void> => {
      setIsPending(true);
      const response = await deleteServiceGroupRequest(nsId, groupId);
      if (response.status === "error") {
        throw new Error(response.error);
      }
      onServiceGroupChange();
      setIsPending(false);
    },
    [],
  );

  const deleteServiceGroups = useCallback(
    async (nsId: string, groupIds: string[]): Promise<void> => {
      setIsPending(true);
      const response = await Promise.all(
        groupIds.map((groupId) => deleteServiceGroupRequest(nsId, groupId)),
      );
      if (response.some((res) => res.status === "error")) {
        throw new Error("Failed to delete some service accounts");
      }
      onServiceGroupChange();
      setIsPending(false);
    },
    [],
  );

  return {
    isPending,
    deleteServiceGroup,
    deleteServiceGroups,
  };
};
