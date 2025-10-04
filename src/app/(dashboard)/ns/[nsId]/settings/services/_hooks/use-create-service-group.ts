import { useCallback, useState } from "react";
import type { CreateExternalServiceGroupResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/groups/route";
import { onServiceAccountChange } from "./on-accounts-change";

export const useCreateServiceGroup = (nsId: string, accountId: string) => {
  const [loading, setLoading] = useState(false);

  const createServiceGroup = useCallback(
    async (groupId: string): Promise<CreateExternalServiceGroupResponse> => {
      setLoading(true);
      const response = await fetch(
        `/api/ns/${nsId}/services/accounts/${accountId}/groups/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ groupId }),
        },
      ).then((res) => res.json());
      setLoading(false);
      onServiceAccountChange();
      return response;
    },
    [nsId, accountId],
  );

  return {
    loading,
    createServiceGroup,
  };
};
