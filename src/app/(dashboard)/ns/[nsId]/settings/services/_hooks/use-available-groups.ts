import { useCallback, useLayoutEffect, useState } from "react";
import type { GetAvailableGroupsResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/groups/availables/route";
import type { TAvailableGroup } from "@/types/prisma";

export const useAvailableGroups = (nsId: string, accountId: string) => {
  const [groups, setGroups] = useState<TAvailableGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(true);

  const fetchData = useCallback(async () => {
    if (!nsId || !accountId) {
      setError(null);
      setGroups([]);
      setIsPending(false);
      return;
    }
    setIsPending(true);
    const response = (await fetch(
      `/api/ns/${nsId}/services/accounts/${accountId}/groups/availables`,
    ).then((res) => res.json())) as GetAvailableGroupsResponse;
    if (response.status === "error") {
      setError(response.error);
      setGroups([]);
      setIsPending(false);
      return;
    }

    setError(null);
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
