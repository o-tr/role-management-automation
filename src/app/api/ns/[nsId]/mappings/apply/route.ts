import {
  APPLY_VALIDATION_STAGES,
  PROGRESS_MESSAGES,
} from "@/lib/constants/progress";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { verifyPlan } from "@/lib/jwt/plan";
import { compareDiff } from "@/lib/mapping/compareDiff";
import { validatePermission } from "@/lib/validatePermission";
import { type TMemberWithDiff, ZMemberWithDiff } from "@/types/diff";
import type { TComparePlan } from "@/types/plan";
import type { TNamespaceId } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getMemberWithDiffWithProgress } from "../_shared/getMemberWithDiffWithProgress";
import type { CommonProgressUpdate } from "../_shared/types";
import {
  type ApplyProgressUpdate,
  applyDiffWithProgress,
} from "./applyDiffWithProgress";

// JWTトークンベースのリクエストスキーマ
const ZApplyMappingWithJWTSchema = z.object({
  token: z.string(),
});

export type TApplyMappingRequestBody = z.infer<
  typeof ZApplyMappingWithJWTSchema
>;

// JWTトークンからプランを復元するヘルパー関数
const verifyAndExtractPlan = (
  token: string,
  nsId: TNamespaceId,
  userId: string,
): TComparePlan => {
  try {
    const payload = verifyPlan(token);

    // NamespaceIDとUserIDの一致確認
    if (payload.nsId !== nsId) {
      throw new Error("Namespace ID mismatch");
    }
    if (payload.userId !== userId) {
      throw new Error("User ID mismatch");
    }

    return payload.data as TComparePlan;
  } catch (error) {
    throw new BadRequestException(
      `Invalid JWT token: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// CommonProgressUpdateからApplyProgressUpdateへの変換関数
const convertToApplyProgress = (
  commonProgress: CommonProgressUpdate,
  stage: "fetching_members" | "calculating_diff" | "applying_changes",
): ApplyProgressUpdate => {
  if (commonProgress.type === "progress") {
    return {
      type: "progress",
      stage,
      services: commonProgress.services,
    };
  }
  if (commonProgress.type === "complete") {
    // complete時は次の段階（差分検証）に進むため、progressとして返す
    return {
      type: "progress",
      stage: "applying_changes",
      services: {
        validation: {
          status: "completed",
          current: APPLY_VALIDATION_STAGES.COMPLETE,
          total: APPLY_VALIDATION_STAGES.TOTAL,
          message: PROGRESS_MESSAGES.DIFF_VALIDATION_COMPLETE,
        },
      },
    };
  }
  return {
    type: "error",
    error: commonProgress.error,
  };
};

export async function POST(
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

    const body = ZApplyMappingWithJWTSchema.safeParse(await req.json());

    if (!body.success) {
      throw new BadRequestException("Invalid request body");
    }

    const requestBody = body.data;
    const abortController = new AbortController();
    let isStreamClosed = false;

    const stream = new ReadableStream({
      start(controller) {
        getMemberWithDiffFromJWTAndApplyWithProgress(
          params.nsId,
          userId,
          requestBody.token,
          (progress) => {
            if (isStreamClosed || abortController.signal.aborted) {
              return;
            }
            try {
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
            } satisfies ApplyProgressUpdate)}\n\n`;
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

type ProgressCallback = (progress: ApplyProgressUpdate) => void;

// JWTトークンからプランを復元してApplyを実行する関数（フォールバック機能付き）
const getMemberWithDiffFromJWTAndApplyWithProgress = async (
  nsId: TNamespaceId,
  userId: string,
  jwtToken: string,
  onProgress: ProgressCallback,
  abortSignal?: AbortSignal,
): Promise<void> => {
  try {
    // Stage 1: JWT検証・プラン復元
    onProgress({
      type: "progress",
      stage: "applying_changes",
      services: {
        validation: {
          status: "in_progress",
          current: 0,
          total: APPLY_VALIDATION_STAGES.TOTAL,
          message: "JWTトークンを検証中...",
        },
      },
    });

    const plan: TComparePlan = verifyAndExtractPlan(jwtToken, nsId, userId);

    if (abortSignal?.aborted) {
      throw new Error("Operation aborted");
    }

    // Stage 2: プラン検証完了
    onProgress({
      type: "progress",
      stage: "applying_changes",
      services: {
        validation: {
          status: "completed",
          current: APPLY_VALIDATION_STAGES.COMPLETE,
          total: APPLY_VALIDATION_STAGES.TOTAL,
          message: "検証完了",
        },
      },
    });

    // Stage 3: 差分適用
    await applyDiffWithProgress(nsId, plan.diff, onProgress);

    // 完了
    onProgress({
      type: "complete",
      result: [], // applyDiffWithProgressは実際の結果を返すため、空配列で問題なし
    });
  } catch (error) {
    onProgress({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

const getMemberWithDiffAndApplyWithProgress = async (
  nsId: TNamespaceId,
  userId: string,
  requestBody: TMemberWithDiff[],
  onProgress: ProgressCallback,
  abortSignal?: AbortSignal,
): Promise<void> => {
  try {
    // Stage 1: 共通の差分計算を使用
    const calculatedDiff = await getMemberWithDiffWithProgress(
      nsId,
      userId,
      (commonProgress) => {
        if (abortSignal?.aborted) {
          return;
        }
        // 差分計算段階の進捗を適用用に変換
        if (commonProgress.type === "progress") {
          const stage = commonProgress.stage;
          onProgress(convertToApplyProgress(commonProgress, stage));
        }
        // complete時は何もしない（次の段階に進む）
        if (commonProgress.type === "error") {
          onProgress(
            convertToApplyProgress(commonProgress, "fetching_members"),
          );
        }
      },
      abortSignal,
    );

    if (abortSignal?.aborted) {
      throw new Error("Operation aborted");
    }

    // Stage 2: 差分検証
    onProgress({
      type: "progress",
      stage: "applying_changes",
      services: {
        validation: {
          status: "in_progress",
          current: 0,
          total: APPLY_VALIDATION_STAGES.TOTAL,
          message: PROGRESS_MESSAGES.DIFF_VALIDATING,
        },
      },
    });

    if (!compareDiff(calculatedDiff, requestBody)) {
      onProgress({
        type: "error",
        error: "Invalid request body - diff mismatch",
      });
      return;
    }

    onProgress({
      type: "progress",
      stage: "applying_changes",
      services: {
        validation: {
          status: "completed",
          current: APPLY_VALIDATION_STAGES.COMPLETE,
          total: APPLY_VALIDATION_STAGES.TOTAL,
          message: PROGRESS_MESSAGES.DIFF_VALIDATION_COMPLETE,
        },
      },
    });

    // Stage 3: 差分適用with進捗
    await applyDiffWithProgress(nsId, requestBody, onProgress);
  } catch (error) {
    onProgress({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
