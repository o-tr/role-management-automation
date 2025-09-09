import type { ApplyDiffResult } from "@/app/api/ns/[nsId]/mappings/apply/applyDiffWithProgress";
import { Button } from "@/components/ui/button";
import type { TNamespaceId } from "@/types/prisma";
import { type FC, type MutableRefObject, useCallback, useEffect } from "react";
import { MappingDiffList } from "./MappingDiffList";
import { ProgressDisplay } from "./ProgressDisplay";
import { useApplyDiffSSE } from "./_hooks/use-apply-diff-sse";
import { useCompareSSE } from "./_hooks/use-compare-sse";

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

  if (compareState.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <div>差分を計算しています...</div>
        {compareState.progress && (
          <ProgressDisplay progress={compareState.progress} title="差分取得" />
        )}
      </div>
    );
  }

  if (compareState.isError) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-red-500">
          エラーが発生しました: {compareState.error}
        </div>
        <Button onClick={compareState.refetch}>再試行</Button>
      </div>
    );
  }

  // applyState.progress から taskKey ベースでステータスを compareState.diff に注入する
  const getMappingDataWithProgress = () => {
    if (!applyState.progress || applyState.progress.type !== "progress") {
      return compareState.diff;
    }

    const services = applyState.progress.services;

    return compareState.diff.map((memberWithDiff, mi) => {
      const newDiff = memberWithDiff.diff.map((d, di) => {
        const key = `${mi}-${di}-${d.serviceGroup.service}-${String(
          d.serviceGroup.groupId,
        )}-${String(
          d.groupMember?.serviceId ?? d.groupMember?.serviceUsername ?? "",
        )}-${String(d.roleId)}`;

        const svc = services[key];
        if (!svc) return d;

        // Apply status and reason if available
        const out: typeof d & { status?: string; reason?: string } = {
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
          // completed but no success/errors: treat as success
          out.status = "success";
        } else if (svc.status === "skipped") {
          out.status = "skipped";
          // provide message or error as reason if available
          if (svc.error) out.reason = svc.error;
          else if (svc.message) out.reason = svc.message;
        } else if (svc.status === "pending") {
          // leave as-is
        } else if (svc.status === "in_progress") {
          // in progress - don't set final status
        }

        return out as typeof d & { status?: string; reason?: string };
      });
      return { ...memberWithDiff, diff: newDiff };
    });
  };

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
            <MappingDiffList data={getMappingDataWithProgress()} />
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
