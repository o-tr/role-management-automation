import type { ApplyDiffResult } from "@/app/api/ns/[nsId]/mappings/apply/applyDiff";
import { Button } from "@/components/ui/button";
import type { TNamespaceId } from "@/types/prisma";
import { type FC, useCallback, useEffect } from "react";
import { MappingDiffList } from "./MappingDiffList";
import { ProgressDisplay } from "./ProgressDisplay";
import { useApplyDiffSSE } from "./_hooks/use-apply-diff-sse";
import { useCompareSSE } from "./_hooks/use-compare-sse";

type Props = {
  nsId: TNamespaceId;
  onApplyResult?: (result: ApplyDiffResult[]) => void;
  isOpen: boolean;
};

export const DiffList: FC<Props> = ({ nsId, onApplyResult, isOpen }) => {
  const compareState = useCompareSSE(nsId);
  const applyState = useApplyDiffSSE(nsId);

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

  return (
    <div className="flex flex-col gap-4">
      {applyState.isPending &&
        (applyState.progress ? (
          <ProgressDisplay progress={applyState.progress} title="変更適用" />
        ) : (
          <div className="flex flex-col gap-4">
            <div>差分を適用しています...</div>
          </div>
        ))}

      <MappingDiffList data={compareState.diff} />

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
