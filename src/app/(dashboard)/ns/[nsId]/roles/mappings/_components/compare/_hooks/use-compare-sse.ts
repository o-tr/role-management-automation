import { useCallback, useEffect, useRef, useState } from "react";
import type { ProgressUpdate } from "@/app/api/ns/[nsId]/mappings/compare/route";
import type { TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";

export type CompareSSEState =
  | {
      state: "uninitialized";
      diff: [];
      progress: undefined;
      token: undefined;
    }
  | {
      state: "error";
      error: string;
      diff: [];
    }
  | {
      state: "success";
      diff: TMemberWithDiff[];
      progress: undefined;
      token: string;
    }
  | {
      state: "loading";
      diff: TMemberWithDiff[];
      progress?: ProgressUpdate;
      token?: string;
    };

export const useCompareSSE = (nsId: TNamespaceId) => {
  const [state, setState] = useState<CompareSSEState>({
    state: "uninitialized",
    diff: [],
    progress: undefined,
    token: undefined,
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
      state: "loading",
      diff: [],
      progress: undefined,
      token: undefined,
    });

    const eventSource = new EventSource(`/api/ns/${nsId}/mappings/compare`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressUpdate = JSON.parse(event.data);

        if (data.type === "progress") {
          setState((_prev) => ({
            state: "loading",
            progress: data,
            diff: [],
          }));
        } else if (data.type === "complete") {
          setState({
            state: "success",
            diff: data.result,
            progress: undefined,
            token: data.token,
          });
          closeEventSource(eventSource);
          eventSourceRef.current = null;
        } else if (data.type === "error") {
          setState({
            state: "error",
            error: data.error,
            diff: [],
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
          state: "error",
          error: `データの解析に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
          diff: [],
        });
        closeEventSource(eventSource);
        eventSourceRef.current = null;
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setState({
        state: "error",
        error: "サーバーとの接続でエラーが発生しました",
        diff: [],
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
