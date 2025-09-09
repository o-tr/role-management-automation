import type { ApplyProgressUpdate } from "@/app/api/ns/[nsId]/mappings/apply/applyDiffWithProgress";
import type { TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import { useCallback, useEffect, useRef, useState } from "react";

export type ApplyDiffSSEState = {
  isPending: boolean;
  isError: boolean;
  error?: string;
  result?:
    | { status: "success"; result: unknown }
    | { status: "error"; error: string };
  progress?: ApplyProgressUpdate;
};

export const useApplyDiffSSE = (nsId: TNamespaceId) => {
  const [state, setState] = useState<ApplyDiffSSEState>({
    isPending: false,
    isError: false,
  });

  // AbortController ref for cancelling fetch requests
  const controllerRef = useRef<AbortController | null>(null);

  const applyDiff = useCallback(
    async (diff: TMemberWithDiff[]) => {
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
          body: JSON.stringify(diff),
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

            // チャンクをバッファに追加
            buffer += decoder.decode(value, { stream: true });

            // 完全な行を処理
            const lines = buffer.split("\n");
            // 最後の行は不完全な可能性があるので保持
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const jsonData = line.slice(6).trim();
                  if (jsonData) {
                    const data: ApplyProgressUpdate = JSON.parse(jsonData);

                    if (data.type === "progress") {
                      setState((prev) => ({
                        ...prev,
                        progress: data,
                      }));
                    } else if (data.type === "complete") {
                      setState({
                        isPending: false,
                        isError: false,
                        result: { status: "success", result: data.result },
                        progress: data,
                      });
                      return { status: "success", result: data.result };
                    } else if (data.type === "error") {
                      setState({
                        isPending: false,
                        isError: true,
                        error: data.error,
                        result: undefined,
                        progress: data,
                      });
                      return { status: "error", error: data.error };
                    }
                  }
                } catch (error) {
                  console.error(
                    "Failed to parse SSE data:",
                    error,
                    "Line:",
                    line,
                  );
                }
              }
            }
          }

          // 最後のバッファ内容も処理
          if (buffer.trim() && buffer.startsWith("data: ")) {
            try {
              const jsonData = buffer.slice(6).trim();
              if (jsonData) {
                const data: ApplyProgressUpdate = JSON.parse(jsonData);

                if (data.type === "complete") {
                  setState({
                    isPending: false,
                    isError: false,
                    result: { status: "success", result: data.result },
                    progress: data,
                  });
                  return { status: "success", result: data.result };
                }
                if (data.type === "error") {
                  setState({
                    isPending: false,
                    isError: true,
                    error: data.error,
                    result: undefined,
                    progress: data,
                  });
                  return { status: "error", error: data.error };
                }
              }
            } catch (error) {
              console.error(
                "Failed to parse final SSE data:",
                error,
                "Buffer:",
                buffer,
              );
            }
          }
        } finally {
          try {
            reader.releaseLock();
          } catch (e) {
            // ignore
          }
          // clear controller reference
          controllerRef.current = null;
        }

        return { status: "success", result: [] };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState({
          isPending: false,
          isError: true,
          error: errorMessage,
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
