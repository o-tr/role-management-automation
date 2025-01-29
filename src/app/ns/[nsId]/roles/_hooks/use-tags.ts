import type { GetTagsResponse } from "@/app/api/ns/[nsId]/tags/route";
import useSWR from "swr";
import { useOnTagsChange } from "./on-tags-change";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useTags = (nsId: string) => {
  const { data, error, mutate } = useSWR<GetTagsResponse>(
    `/api/ns/${nsId}/tags/`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useOnTagsChange(mutate);

  return {
    tags: data && data.status === "success" ? data.tags : undefined,
    isPending: !error && !data,
    refetch: mutate,
  };
};
