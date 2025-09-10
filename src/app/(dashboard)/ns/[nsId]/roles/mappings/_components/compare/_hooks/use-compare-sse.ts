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

  // EventSource を安全に閉じるヘルパー関数
  const closeEventSource = useCallback((eventSource: EventSource) => {
    try {
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close();
      }
    } catch (error) {
      console.warn("EventSource close error:", error);
    }
  }, []);

  const startCompare = useCallback(() => {
    // 既存の接続があれば閉じる
    if (eventSourceRef.current) {
      closeEventSource(eventSourceRef.current);
      eventSourceRef.current = null;
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
          closeEventSource(eventSource);
          eventSourceRef.current = null;
        } else if (data.type === "error") {
          setState({
            isPending: false,
            isError: true,
            error: data.error,
            diff: [],
            progress: data,
          });
          closeEventSource(eventSource);
          eventSourceRef.current = null;
        }
      } catch (error) {
        console.error(
          "Failed to parse SSE data:",
          error,
          "Raw data:",
          event.data,
        );
        setState({
          isPending: false,
          isError: true,
          error: `データの解析に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
          diff: [],
          progress: undefined,
        });
        closeEventSource(eventSource);
        eventSourceRef.current = null;
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setState({
        isPending: false,
        isError: true,
        error: "サーバーとの接続でエラーが発生しました",
        diff: [],
        progress: undefined,
      });
      closeEventSource(eventSource);
      eventSourceRef.current = null;
    };

    return () => {
      closeEventSource(eventSource);
    };
  }, [nsId, closeEventSource]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        closeEventSource(eventSourceRef.current);
        eventSourceRef.current = null;
      }
    };
  }, [closeEventSource]);

  const refetch = useCallback(() => {
    startCompare();
  }, [startCompare]);

  return {
    ...state,
    startCompare,
    refetch,
  };
};
