import type { ApplyDiffResult } from "@/app/api/ns/[nsId]/mappings/apply/applyDiffWithProgress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TNamespaceId } from "@/types/prisma";
import { type FC, useCallback, useRef, useState } from "react";
import { DiffList } from "./DiffList";
import { MappingDiffList } from "./MappingDiffList";

type Props = {
  nsId: TNamespaceId;
};

export const Compare: FC<Props> = ({ nsId }) => {
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [applyResult, setApplyResult] = useState<ApplyDiffResult[] | undefined>(
    [],
  );
  const diffModalBusyRef = useRef<boolean | undefined>(false);
  const onApplyResult = useCallback((result: ApplyDiffResult[]) => {
    setIsDiffModalOpen(false);
    setApplyResult(result);
  }, []);
  return (
    <>
      <Dialog
        open={isDiffModalOpen}
        onOpenChange={(open) => {
          // 進行中は閉じる要求を無視する
          if (!open && diffModalBusyRef.current) return;
          setIsDiffModalOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button>差分を表示</Button>
        </DialogTrigger>
        <DialogContent className="max-w-7xl max-h-[90dvh] flex flex-col flex-nowrap">
          <DialogHeader>
            <DialogTitle>割り当ての差分</DialogTitle>
          </DialogHeader>
          <div className="p-4 overflow-y-auto h-full">
            {isDiffModalOpen && (
              <DiffList
                nsId={nsId}
                onApplyResult={onApplyResult}
                isOpen={isDiffModalOpen}
                busyRef={diffModalBusyRef}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!applyResult?.length}>
        <DialogContent className="max-w-7xl max-h-[90dvh] flex flex-col flex-nowrap">
          <DialogHeader>
            <DialogTitle>適用結果</DialogTitle>
          </DialogHeader>
          {applyResult && <MappingDiffList data={applyResult} />}
          <DialogFooter>
            <Button onClick={() => setApplyResult(undefined)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
