import type { GetExternalServiceGroupsResponse } from "@/app/api/ns/[nsId]/services/groups/route";
import type { TExternalServiceGroupDetail } from "@/types/prisma";
import { useCallback, useLayoutEffect, useState } from "react";

export const useServiceGroups = (nsId: string) => {
  const [groups, setGroups] = useState<TExternalServiceGroupDetail[]>([]);
  const [isPending, setIsPending] = useState(true);

  const fetchData = useCallback(async () => {
    const response = (await fetch(`/api/ns/${nsId}/services/groups/`).then(
      (res) => res.json(),
    )) as GetExternalServiceGroupsResponse;
    if (response.status === "error") {
      throw new Error(response.error);
    }

    setGroups(response.serviceGroups);
    setIsPending(false);
  }, [nsId]);

  useLayoutEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    groups,
    isPending,
    refetch: fetchData,
  };
};
