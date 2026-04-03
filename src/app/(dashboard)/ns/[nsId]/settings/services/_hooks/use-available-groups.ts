import { useCallback, useEffect, useState } from "react";
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
    try {
      const response = (await fetch(
        `/api/ns/${nsId}/services/accounts/${accountId}/groups/availables`,
      ).then((res) => res.json())) as GetAvailableGroupsResponse;
      if (response.status === "error") {
        setError(response.error);
        setGroups([]);
        return;
      }

      setError(null);
      setGroups(response.groups);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "利用可能グループの取得に失敗しました",
      );
      setGroups([]);
    } finally {
      setIsPending(false);
    }
  }, [nsId, accountId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    availableGroups: groups,
    error,
    isPending,
    refetch: fetchData,
  };
};
