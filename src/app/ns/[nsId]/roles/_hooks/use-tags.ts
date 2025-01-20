import type { GetTagsResponse } from "@/app/api/ns/[nsId]/tags/route";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useTags = (nsId: string) => {
  const { data, error, mutate } = useSWR<GetTagsResponse>(
    `/api/ns/${nsId}/tags/`,
    fetcher,
  );

  return {
    tags: data && data.status === "success" ? data.tags : undefined,
    isPending: !error && !data,
    refetch: mutate,
  };
};
