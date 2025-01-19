import type { GetTagsResponse } from "@/app/api/ns/[nsId]/tags/route";
import type { TTag } from "@/types/prisma";
import { useCallback, useLayoutEffect, useState } from "react";

export const useTags = (nsId: string) => {
  const [tags, setTags] = useState<TTag[]>([]);
  const [isPending, setIsPending] = useState(true);

  const fetchData = useCallback(async () => {
    const response = (await fetch(`/api/ns/${nsId}/tags/`).then((res) =>
      res.json(),
    )) as GetTagsResponse;
    if (response.status === "error") {
      throw new Error(response.error);
    }

    setTags(response.tags);
    setIsPending(false);
  }, [nsId]);

  useLayoutEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    tags,
    isPending,
    refetch: fetchData,
  };
};
