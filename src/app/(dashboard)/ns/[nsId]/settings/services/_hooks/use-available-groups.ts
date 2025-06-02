import type { GetAvailableGroupsResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/groups/availables/route";
import type { TAvailableGroup } from "@/types/prisma";
import { useCallback, useLayoutEffect, useState } from "react";

export const useAvailableGroups = (nsId: string, accountId: string) => {
  const [groups, setGroups] = useState<TAvailableGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(true);

  const fetchData = useCallback(async () => {
    if (!nsId || !accountId) {
      setError("Namespace ID or Account ID is missing.");
      return;
    }
    setIsPending(true);
    const response = (await fetch(
      `/api/ns/${nsId}/services/accounts/${accountId}/groups/availables`,
    ).then((res) => res.json())) as GetAvailableGroupsResponse;
    if (response.status === "error") {
      setError(response.error);
      setIsPending(false);
      return;
    }

    setGroups(response.groups);
    setIsPending(false);
  }, [nsId, accountId]);

  useLayoutEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    availableGroups: groups,
    error,
    isPending,
    refetch: fetchData,
  };
};
