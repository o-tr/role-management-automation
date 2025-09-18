import type {
  ResolveResponse,
  TResolveRequestType,
} from "@/app/api/ns/[nsId]/members/resolve/[type]/[serviceId]/route";
import pLimit from "p-limit";
import useSWR from "swr";

const limit = pLimit(5);

const fetcher = (url: string) =>
  limit(() => fetch(url).then((res) => res.json()));

export const useMemberResolve = (
  nsId: string,
  type: TResolveRequestType,
  serviceId: string,
) => {
  const { data, error } = useSWR<ResolveResponse>(
    `/api/ns/${nsId}/members/resolve/${type}/${serviceId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      refreshInterval: 0,
    },
  );

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};
