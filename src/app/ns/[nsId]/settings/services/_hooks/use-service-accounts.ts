import type { GetExternalServiceAccountsResponse } from "@/app/api/ns/[nsId]/services/accounts/route";
import type { TServiceAccounts } from "@/types/prisma";
import { useCallback, useLayoutEffect, useState } from "react";

export const useServiceAccounts = (nsId: string) => {
  const [accounts, setAccounts] = useState<TServiceAccounts[]>([]);
  const [isPending, setIsPending] = useState(true);

  const fetchData = useCallback(async () => {
    const response = (await fetch(`/api/ns/${nsId}/services/accounts/`).then(
      (res) => res.json(),
    )) as GetExternalServiceAccountsResponse;
    if (response.status === "error") {
      throw new Error(response.error);
    }

    setAccounts(response.serviceAccounts);
    setIsPending(false);
  }, [nsId]);

  useLayoutEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    accounts,
    isPending,
    refetch: fetchData,
  };
};
