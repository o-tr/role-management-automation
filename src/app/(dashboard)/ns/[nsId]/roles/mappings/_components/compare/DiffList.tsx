import { DataTable } from "@/app/(dashboard)/ns/[nsId]/components/DataTable";
import { MemberExternalAccountDisplay } from "@/app/(dashboard)/ns/[nsId]/components/MemberExternalAccountDisplay";
import type { ApplyDiffResult } from "@/app/api/ns/[nsId]/mappings/apply/applyDiff";
import { Button } from "@/components/ui/button";
import { TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import type { ColumnDef, RowModel } from "@tanstack/react-table";
import { type FC, useCallback, useState } from "react";
import { DIffItemDisplay } from "./DiffItemDisplay";
import { MappingDiffList } from "./MappingDiffList";
import { useApplyDiff } from "./_hooks/use-apply-diff";
import { useCompare } from "./_hooks/useCompare";

type Props = {
  nsId: TNamespaceId;
  onApplyResult?: (result: ApplyDiffResult[]) => void;
};

export const DiffList: FC<Props> = ({ nsId, onApplyResult }) => {
  const { isPending, diff, refetch } = useCompare(nsId);
  const { applyDiff, isPending: isApplying } = useApplyDiff(nsId);

  const onButtonClick = useCallback(async () => {
    const result = await applyDiff(diff);
    if (result.status === "success") {
      onApplyResult?.(result.result);
      refetch();
    }
  }, [diff, refetch, onApplyResult, applyDiff]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <MappingDiffList data={diff} />
      <div>
        <Button
          type="button"
          onClick={onButtonClick}
          disabled={isApplying || diff.length === 0}
        >
          {isApplying ? "反映しています..." : "反映"}
        </Button>
      </div>
    </div>
  );
};
