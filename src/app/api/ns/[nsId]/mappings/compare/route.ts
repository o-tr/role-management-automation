import { validatePermission } from "@/lib/validatePermission";
import type { TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
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
        };
      };
    }
  | {
      type: "complete";
      result: TMemberWithDiff[];
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

    const stream = new ReadableStream({
      start(controller) {
        getMemberWithDiffWithProgress(params.nsId, (commonProgress) => {
          const progress = convertToCompareProgress(commonProgress);
          const data = `data: ${JSON.stringify(progress)}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));

          if (progress.type === "complete" || progress.type === "error") {
            controller.close();
          }
        }).catch((error) => {
          const errorData = `data: ${JSON.stringify({
            type: "error",
            error: error.message,
          } satisfies ProgressUpdate)}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        });
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
