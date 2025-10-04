import { type FC, useCallback, useEffect, useMemo } from "react";
import type {
  ApplyDiffResult,
  ApplyProgressUpdate,
} from "@/app/api/ns/[nsId]/mappings/apply/applyDiffWithProgress";
import { Button } from "@/components/ui/button";
import { makeDiffKeyFromItem } from "@/lib/diffKey";
import type {
  TExtendedDiffItem,
  TExtendedMemberWithDiff,
  TMemberWithDiff,
} from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import { useApplyDiffSSE } from "./_hooks/use-apply-diff-sse";
import { useCompareSSE } from "./_hooks/use-compare-sse";
import { MappingDiffList } from "./MappingDiffList";
import { ProgressDisplay } from "./ProgressDisplay";

// Pure helper: map compareState.diff with apply progress to inject per-diff status/reason
export const mapDiffWithProgress = (
  members: TMemberWithDiff[],
  progress?: ApplyProgressUpdate,
): TExtendedMemberWithDiff[] => {
  if (!progress || progress.type !== "progress") {
    // progress がない場合は、元の diff をそのまま拡張型として返す
    return members.map((member) => ({
      ...member,
      diff: member.diff.map((d) => ({ ...d }) as TExtendedDiffItem),
    }));
  }

  const services = progress.services;

  return members.map((memberWithDiff, mi) => {
    const newDiff: TExtendedDiffItem[] = memberWithDiff.diff.map((d, di) => {
      const key = makeDiffKeyFromItem(mi, di, d);
      const svc = services[key];

      const extendedDiff: TExtendedDiffItem = { ...d };

      if (svc) {
        if (svc.status === "error") {
          extendedDiff.status = "error";
          if (svc.error) extendedDiff.reason = svc.error;
        } else if (svc.status === "skipped") {
          extendedDiff.status = "skipped";
          if (svc.error) extendedDiff.reason = svc.error;
          else if (svc.message) extendedDiff.reason = svc.message;
        } else if (svc.status === "completed") {
          extendedDiff.status = "success";
        }
      }

      return extendedDiff;
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
  const applyState = useApplyDiffSSE<ApplyDiffResult[]>(nsId);

  // メモ化された差分データ（パフォーマンス最適化）
  const memoizedDiffWithProgress = useMemo(() => {
    return mapDiffWithProgress(compareState.diff, applyState.progress);
  }, [compareState.diff, applyState.progress]);
  // busyRef が渡されていれば apply の状態を反映
  useEffect(() => {
    if (!busyRef) return;
    busyRef.current = applyState.isPending;
    return () => {
      // unmount 時は undefined に戻す
      busyRef.current = undefined;
    };
  }, [applyState.isPending, busyRef]);

  // モーダルが開いたときに差分取得を開始（apply処理中でない場合のみ）
  useEffect(() => {
    if (
      isOpen &&
      compareState.state !== "loading" &&
      !applyState.isPending &&
      compareState.diff.length === 0
    ) {
      compareState.startCompare();
    }
  }, [
    isOpen,
    compareState.state,
    applyState.isPending,
    compareState.diff.length,
    compareState.startCompare,
  ]);

  const onButtonClick = useCallback(async () => {
    if (compareState.state !== "success") return;
    const result = await applyState.applyDiff(compareState.token);
    if (result.status === "success" && result.result) {
      onApplyResult?.(result.result);
      // 適用完了後に差分を再取得
      compareState.refetch();
    }
  }, [compareState, onApplyResult, applyState.applyDiff]);

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
            <MappingDiffList data={memoizedDiffWithProgress} />
          )
        ) : (
          <div className="flex flex-col gap-4">
            <div>差分を適用しています...</div>
          </div>
        )
      ) : compareState.state === "loading" && compareState.progress ? (
        <ProgressDisplay progress={compareState.progress} title="差分取得" />
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
