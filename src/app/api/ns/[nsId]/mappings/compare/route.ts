import { validatePermission } from "@/lib/validatePermission";
import type { TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import type { NextRequest } from "next/server";
import { getMemberWithDiffWithProgress } from "../_shared/getMemberWithDiffWithProgress";
import type { CommonProgressUpdate } from "../_shared/types";

export type ProgressCallback = (progress: ProgressUpdate) => void;

// CommonProgressUpdateからProgressUpdateへの変換関数
const convertToCompareProgress = (
  commonProgress: CommonProgressUpdate,
): ProgressUpdate => {
  if (commonProgress.type === "progress") {
    return {
      type: "progress",
      stage: commonProgress.stage,
      services: commonProgress.services,
    };
  }
  if (commonProgress.type === "complete") {
    return {
      type: "complete",
      result: commonProgress.result,
      token: commonProgress.token,
    };
  }
  return {
    type: "error",
    error: commonProgress.error,
  };
};

export type ProgressUpdate =
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

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: TNamespaceId } },
) {
  try {
    await validatePermission(params.nsId, "admin");

    // セッション情報からユーザーIDを取得
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = session.user.email;

    const abortController = new AbortController();
    let isStreamClosed = false;

    const stream = new ReadableStream({
      start(controller) {
        getMemberWithDiffWithProgress(
          params.nsId,
          userId,
          (commonProgress) => {
            if (isStreamClosed || abortController.signal.aborted) {
              return;
            }
            try {
              const progress = convertToCompareProgress(commonProgress);
              const data = `data: ${JSON.stringify(progress)}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));

              if (progress.type === "complete" || progress.type === "error") {
                isStreamClosed = true;
                controller.close();
              }
            } catch (error) {
              // Controller already closed, ignore the error
              isStreamClosed = true;
            }
          },
          abortController.signal,
        ).catch((error) => {
          if (isStreamClosed || abortController.signal.aborted) {
            return;
          }
          try {
            const errorData = `data: ${JSON.stringify({
              type: "error",
              error: error.message,
            } satisfies ProgressUpdate)}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorData));
            isStreamClosed = true;
            controller.close();
          } catch {
            // Controller already closed, ignore the error
            isStreamClosed = true;
          }
        });
      },
      cancel() {
        isStreamClosed = true;
        abortController.abort();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
