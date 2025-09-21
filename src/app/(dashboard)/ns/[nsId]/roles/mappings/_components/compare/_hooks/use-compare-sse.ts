import { processSSEChunk, processSSEFinalBuffer } from "@/lib/sse";
import type { TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import { useCallback, useEffect, useRef, useState } from "react";

export type CompareProgressUpdate =
  | {
      type: "progress";
      stage: "fetching_members" | "calculating_diff" | "complete";
      services: {
        [key: string]: {
          status: "pending" | "in_progress" | "completed" | "error";
          current: number;
          total: number | "unknown";
          message: string;
          error?: string;
          isApproximate?: boolean;
        };
      };
    }
  | {
      type: "complete";
      result: TMemberWithDiff[];
      token: string;
    }
  | {
      type: "error";
      error: string;
    };

export type CompareSSEState = {
  isPending: boolean;
  isError: boolean;
  error?: string;
  result?: TMemberWithDiff[];
  token?: string;
  progress?: CompareProgressUpdate;
};

export const useCompareSSE = (nsId: TNamespaceId) => {
  const [state, setState] = useState<CompareSSEState>({
    isPending: false,
    isError: false,
  });

  // AbortController ref for cancelling fetch requests
  const controllerRef = useRef<AbortController | null>(null);

  const compare = useCallback(async (): Promise<
    | { status: "success"; result: TMemberWithDiff[]; token: string }
    | { status: "error"; error: string }
  > => {
    // 既存の接続があれば中止する
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    setState({
      isPending: true,
      isError: false,
      result: undefined,
      token: undefined,
      progress: undefined,
    });

    try {
      const controller = new AbortController();
      controllerRef.current = controller;

      const response = await fetch(`/api/ns/${nsId}/mappings/compare`, {
        method: "GET",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // SSEストリームを読み取り
      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const { buffer: newBuffer, events } =
            processSSEChunk<CompareProgressUpdate>(buffer, value, decoder);
          buffer = newBuffer;

          for (const data of events) {
            if (data.type === "progress") {
              setState((prev) => ({
                ...prev,
                progress: data,
                // メモリ効率のため、古いresultは保持しない
                result: undefined,
                token: undefined,
              }));
            } else if (data.type === "complete") {
              setState({
                isPending: false,
                isError: false,
                result: data.result,
                token: data.token,
                // 完了時はprogressをクリア（メモリ節約）
                progress: undefined,
              });
              return {
                status: "success",
                result: data.result,
                token: data.token,
              };
            } else if (data.type === "error") {
              setState({
                isPending: false,
                isError: true,
                error: data.error,
                result: undefined,
                token: undefined,
                // エラー時もprogressをクリア（メモリ節約）
                progress: undefined,
              });
              return { status: "error", error: data.error };
            }
          }
        }

        // 最後のバッファ内容も処理
        const finalEvents =
          processSSEFinalBuffer<CompareProgressUpdate>(buffer);
        for (const data of finalEvents) {
          if (data.type === "complete") {
            setState({
              isPending: false,
              isError: false,
              result: data.result,
              token: data.token,
              // 完了時はprogressをクリア（メモリ節約）
              progress: undefined,
            });
            return {
              status: "success",
              result: data.result,
              token: data.token,
            };
          }
          if (data.type === "error") {
            setState({
              isPending: false,
              isError: true,
              error: data.error,
              result: undefined,
              token: undefined,
              // エラー時もprogressをクリア（メモリ節約）
              progress: undefined,
            });
            return { status: "error", error: data.error };
          }
        }
      } finally {
        try {
          reader.releaseLock();
        } catch (e) {
          console.warn("Reader release error:", e);
        }
        // clear controller reference
        controllerRef.current = null;
      }

      return { status: "success", result: [], token: "" };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラー";
      console.error("Compare error:", error);
      setState({
        isPending: false,
        isError: true,
        error: `差分の確認でエラーが発生しました: ${errorMessage}`,
        result: undefined,
        token: undefined,
        progress: undefined,
      });
      // リソースリークを防ぐため、controllerRefをクリア
      controllerRef.current = null;
      return { status: "error", error: errorMessage };
    }
  }, [nsId]);

  // クリーンアップ: 進行中の fetch を中止
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    compare,
  };
};
