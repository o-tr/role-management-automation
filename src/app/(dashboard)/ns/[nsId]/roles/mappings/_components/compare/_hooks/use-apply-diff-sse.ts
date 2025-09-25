import { useCallback, useEffect, useRef, useState } from "react";
import type { ApplyProgressUpdate } from "@/app/api/ns/[nsId]/mappings/apply/applyDiffWithProgress";
import { processSSEChunk, processSSEFinalBuffer } from "@/lib/sse";
import type { TNamespaceId } from "@/types/prisma";

export type ApplyDiffSSEState<TResult> = {
  isPending: boolean;
  isError: boolean;
  error?: string;
  result?:
    | { status: "success"; result: TResult }
    | { status: "error"; error: string };
  progress?: ApplyProgressUpdate;
};

export const useApplyDiffSSE = <TResult>(nsId: TNamespaceId) => {
  const [state, setState] = useState<ApplyDiffSSEState<TResult>>({
    isPending: false,
    isError: false,
  });

  // AbortController ref for cancelling fetch requests
  const controllerRef = useRef<AbortController | null>(null);

  const applyDiff = useCallback(
    async (
      token: string,
    ): Promise<
      | { status: "success"; result: TResult }
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
        progress: undefined,
      });

      try {
        // まずPOSTリクエストを送信
        const controller = new AbortController();
        controllerRef.current = controller;

        const response = await fetch(`/api/ns/${nsId}/mappings/apply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
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
              processSSEChunk<ApplyProgressUpdate>(buffer, value, decoder);
            buffer = newBuffer;

            for (const data of events) {
              if (data.type === "progress") {
                setState((prev) => ({
                  ...prev,
                  progress: data,
                  // メモリ効率のため、古いresultは保持しない
                  result: undefined,
                }));
              } else if (data.type === "complete") {
                setState({
                  isPending: false,
                  isError: false,
                  result: { status: "success", result: data.result as TResult },
                  // 完了時はprogressをクリア（メモリ節約）
                  progress: undefined,
                });
                return { status: "success", result: data.result as TResult };
              } else if (data.type === "error") {
                setState({
                  isPending: false,
                  isError: true,
                  error: data.error,
                  result: undefined,
                  // エラー時もprogressをクリア（メモリ節約）
                  progress: undefined,
                });
                return { status: "error", error: data.error };
              }
            }
          }

          // 最後のバッファ内容も処理
          const finalEvents =
            processSSEFinalBuffer<ApplyProgressUpdate>(buffer);
          for (const data of finalEvents) {
            if (data.type === "complete") {
              setState({
                isPending: false,
                isError: false,
                result: { status: "success", result: data.result as TResult },
                // 完了時はprogressをクリア（メモリ節約）
                progress: undefined,
              });
              return { status: "success", result: data.result as TResult };
            }
            if (data.type === "error") {
              setState({
                isPending: false,
                isError: true,
                error: data.error,
                result: undefined,
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

        return { status: "success", result: [] as TResult };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "不明なエラー";
        console.error("Apply diff error:", error);
        setState({
          isPending: false,
          isError: true,
          error: `差分の適用でエラーが発生しました: ${errorMessage}`,
          result: undefined,
          progress: undefined,
        });
        return { status: "error", error: errorMessage };
      }
    },
    [nsId],
  );

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
    applyDiff,
  };
};
