import type {
  ApplyDiffResult,
  ApplyProgressUpdate,
} from "@/app/api/ns/[nsId]/mappings/apply/applyDiffWithProgress";
import { Button } from "@/components/ui/button";
import { makeDiffKeyFromItem } from "@/lib/diffKey";
import type { TDiffItem, TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import { type FC, type MutableRefObject, useCallback, useEffect } from "react";
import { MappingDiffList } from "./MappingDiffList";
import { ProgressDisplay } from "./ProgressDisplay";
import { useApplyDiffSSE } from "./_hooks/use-apply-diff-sse";
import { useCompareSSE } from "./_hooks/use-compare-sse";

// Pure helper: map compareState.diff with apply progress to inject per-diff status/reason
export const mapDiffWithProgress = (
  members: TMemberWithDiff[],
  progress?: ApplyProgressUpdate,
) => {
  if (!progress || progress.type !== "progress") return members;

  const services = progress.services;

  return members.map((memberWithDiff, mi) => {
    const newDiff = memberWithDiff.diff.map((d, di) => {
      const key = makeDiffKeyFromItem(mi, di, d);

      const svc = services[key];
      if (!svc) return d;

      const out: TDiffItem & { status?: string; reason?: string } = {
        ...d,
      };
      if (svc.status === "completed" && svc.success && svc.success > 0) {
        out.status = "success";
      } else if (svc.status === "error") {
        out.status = "error";
        if (svc.error) out.reason = svc.error;
      } else if (
        svc.status === "completed" &&
        svc.current === 1 &&
        !svc.success &&
        !svc.errors
      ) {
        out.status = "success";
      } else if (svc.status === "skipped") {
        out.status = "skipped";
        if (svc.error) out.reason = svc.error;
        else if (svc.message) out.reason = svc.message;
      }

      return out;
    });
    return { ...memberWithDiff, diff: newDiff };
  });
};

type Props = {
  nsId: TNamespaceId;
  onApplyResult?: (result: ApplyDiffResult[]) => void;
  isOpen: boolean;
  busyRef?: React.MutableRefObject<boolean | undefined>;
};

export const DiffList: FC<Props> = ({
  nsId,
  onApplyResult,
  isOpen,
  busyRef,
}) => {
  const compareState = useCompareSSE(nsId);
  const applyState = useApplyDiffSSE(nsId);
  // busyRef が渡されていれば apply の状態を反映
  useEffect(() => {
    if (!busyRef) return;
    busyRef.current = applyState.isPending;
    return () => {
      // unmount 時は undefined に戻す
      busyRef.current = undefined;
    };
  }, [applyState.isPending, busyRef]);

  // モーダルが開いたときに差分取得を開始
  useEffect(() => {
    if (isOpen && !compareState.isPending && compareState.diff.length === 0) {
      compareState.startCompare();
    }
  }, [
    isOpen,
    compareState.isPending,
    compareState.diff.length,
    compareState.startCompare,
  ]);

  const onButtonClick = useCallback(async () => {
    const result = await applyState.applyDiff(compareState.diff);
    if (result.status === "success" && result.result) {
      onApplyResult?.(result.result);
      // 適用完了後に差分を再取得
      compareState.refetch();
    }
  }, [
    compareState.diff,
    compareState.refetch,
    onApplyResult,
    applyState.applyDiff,
  ]);

  return (
    <div className="flex flex-col gap-4">
      {applyState.isPending ? (
        applyState.progress ? (
          // applyState.progress の stage によって表示を切り替える
          applyState.progress.type === "progress" &&
          (applyState.progress.stage === "fetching_members" ||
            applyState.progress.stage === "calculating_diff") ? (
            // getMemberWithDiffWithProgress 実行中は従来の ProgressDisplay を表示
            <ProgressDisplay progress={applyState.progress} title="差分取得" />
          ) : (
            // それ以外（主に applying_changes）は差分リストに適用状況を注入して表示
            <MappingDiffList
              data={mapDiffWithProgress(compareState.diff, applyState.progress)}
            />
          )
        ) : (
          <div className="flex flex-col gap-4">
            <div>差分を適用しています...</div>
          </div>
        )
      ) : (
        <MappingDiffList data={compareState.diff} />
      )}

      <div>
        <Button
          type="button"
          onClick={onButtonClick}
          disabled={applyState.isPending || compareState.diff.length === 0}
        >
          {applyState.isPending ? "反映しています..." : "反映"}
        </Button>
      </div>
    </div>
  );
};
