import type { ProgressUpdate } from "@/app/api/ns/[nsId]/mappings/compare/route";
import type { TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import { useCallback, useEffect, useRef, useState } from "react";

export type CompareSSEState = {
  isPending: boolean;
  isError: boolean;
  error?: string;
  diff: TMemberWithDiff[];
  progress?: ProgressUpdate;
};

export const useCompareSSE = (nsId: TNamespaceId) => {
  const [state, setState] = useState<CompareSSEState>({
    isPending: false,
    isError: false,
    diff: [],
    progress: undefined,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  const startCompare = useCallback(() => {
    // 既存の接続があれば閉じる
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setState({
      isPending: true,
      isError: false,
      diff: [],
      progress: undefined,
    });

    const eventSource = new EventSource(`/api/ns/${nsId}/mappings/compare`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressUpdate = JSON.parse(event.data);

        if (data.type === "progress") {
          setState((prev) => ({
            ...prev,
            progress: data,
          }));
        } else if (data.type === "complete") {
          setState({
            isPending: false,
            isError: false,
            diff: data.result,
            progress: data,
          });
          eventSource.close();
        } else if (data.type === "error") {
          setState({
            isPending: false,
            isError: true,
            error: data.error,
            diff: [],
            progress: data,
          });
          eventSource.close();
        }
      } catch (error) {
        console.error("Failed to parse SSE data:", error);
        setState({
          isPending: false,
          isError: true,
          error: "Failed to parse progress data",
          diff: [],
          progress: undefined,
        });
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setState({
        isPending: false,
        isError: true,
        error: "Connection error",
        diff: [],
        progress: undefined,
      });
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [nsId]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const refetch = useCallback(() => {
    startCompare();
  }, [startCompare]);

  return {
    ...state,
    startCompare,
    refetch,
  };
};
