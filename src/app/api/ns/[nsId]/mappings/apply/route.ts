import {
  APPLY_VALIDATION_STAGES,
  PROGRESS_MESSAGES,
} from "@/lib/constants/progress";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { verifyDiffToken } from "@/lib/jwt";
import { compareDiff } from "@/lib/mapping/compareDiff";
import { validatePermission } from "@/lib/validatePermission";
import { type TMemberWithDiff, ZMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  type ApplyProgressUpdate,
  applyDiffWithProgress,
} from "./applyDiffWithProgress";

const ZApplyMappingSchema = z.object({
  diff: z.array(ZMemberWithDiff),
  token: z.string(),
});
export type TApplyMappingRequestBody = z.infer<typeof ZApplyMappingSchema>;

// この関数は不要になったため削除

export async function POST(
  req: NextRequest,
  { params }: { params: { nsId: TNamespaceId } },
) {
  try {
    await validatePermission(params.nsId, "admin");

    const body = ZApplyMappingSchema.safeParse(await req.json());

    if (!body.success) {
      throw new BadRequestException("Invalid request body");
    }

    const { diff: requestDiff, token } = body.data;

    const stream = new ReadableStream({
      start(controller) {
        applyDiffWithToken(params.nsId, requestDiff, token, (progress) => {
          const data = `data: ${JSON.stringify(progress)}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));

          if (progress.type === "complete" || progress.type === "error") {
            controller.close();
          }
        }).catch((error) => {
          const errorData = `data: ${JSON.stringify({
            type: "error",
            error: error.message,
          } satisfies ApplyProgressUpdate)}\n\n`;
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

type ProgressCallback = (progress: ApplyProgressUpdate) => void;

const applyDiffWithToken = async (
  nsId: TNamespaceId,
  requestDiff: TMemberWithDiff[],
  token: string,
  onProgress: ProgressCallback,
): Promise<void> => {
  try {
    // Stage 1: JWTトークンから差分データを取得
    onProgress({
      type: "progress",
      stage: "applying_changes",
      services: {
        validation: {
          status: "in_progress",
          current: 0,
          total: APPLY_VALIDATION_STAGES.TOTAL,
          message: "トークンを検証中...",
        },
      },
    });

    const tokenDiff = await verifyDiffToken(token, nsId);

    // Stage 2: 差分検証
    onProgress({
      type: "progress",
      stage: "applying_changes",
      services: {
        validation: {
          status: "in_progress",
          current: 1,
          total: APPLY_VALIDATION_STAGES.TOTAL,
          message: PROGRESS_MESSAGES.DIFF_VALIDATING,
        },
      },
    });

    if (!compareDiff(tokenDiff, requestDiff)) {
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
    await applyDiffWithProgress(nsId, requestDiff, onProgress);
  } catch (error) {
    onProgress({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
