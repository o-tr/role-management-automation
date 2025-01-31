"use client";

import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
  type TColumnDef,
} from "@/app/ns/[nsId]/components/DataTable";
import { useMappings } from "@/app/ns/[nsId]/roles/_hooks/use-mappings";
import { Button } from "@/components/ui/button";
import { deleteMapping } from "@/requests/deleteMapping";
import type { TMapping } from "@/types/prisma";
import {
  onServiceGroupMappingChange,
  useOnServiceGroupMappingChange,
} from "../../_hooks/on-mappings-change";
import { ActionsDisplay } from "./ActionsDisplay";
import { ConditionsDisplay } from "./ConditionsDisplay";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { EditMapping } from "./EditMapping";

type InternalMapping = TMapping & { namespaceId: string };

export const columns: TColumnDef<InternalMapping>[] = [
  {
    id: "select",
    header: CommonCheckboxHeader,
    cell: CommonCheckboxCell,
    size: 50,
    maxSize: 50,
  },
  {
    id: "condition",
    header: "条件",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <ConditionsDisplay
          conditions={row.original.conditions}
          nsId={row.original.namespaceId}
        />
      </div>
    ),
    widthPercent: 30,
  },
  {
    id: "actions",
    header: "アクション",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <ActionsDisplay
          actions={row.original.actions}
          nsId={row.original.namespaceId}
        />
      </div>
    ),
    widthPercent: 60,
  },
  {
    id: "buttons",
    cell: ({ row }) => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      useOnServiceGroupMappingChange(() => setIsModalOpen(false));

      return (
        <div className="flex flex-row gap-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">編集</Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-full overflow-y-scroll">
              <DialogHeader>
                <DialogTitle>割り当てを編集</DialogTitle>
                <DialogDescription>
                  <EditMapping
                    nsId={row.original.namespaceId}
                    mapping={row.original}
                  />
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            onClick={async () => {
              await deleteMapping(row.original.namespaceId, row.original.id);
              onServiceGroupMappingChange();
            }}
          >
            削除
          </Button>
        </div>
      );
    },
    size: 150,
  },
];

const deleteMappings = async (groupId: string, mappingIds: string[]) => {
  await Promise.all(
    mappingIds.map((mappingId) => deleteMapping(groupId, mappingId)),
  );
  onServiceGroupMappingChange();
};

type TagListProps = {
  namespaceId: string;
};

export function MappingList({ namespaceId }: TagListProps) {
  const { mappings, isPending } = useMappings(namespaceId);

  if (isPending || !mappings) return <div>Loading...</div>;

  return (
    <div className="overflow-y-hidden">
      <DataTable
        columns={columns}
        data={mappings.map((v) => ({ ...v, namespaceId }))}
        footer={({ table }) => {
          const selected = table.getSelectedRowModel();
          if (selected.rows.length === 0) {
            return <div className="h-[40px]">&nbsp;</div>;
          }

          return (
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  deleteMappings(
                    namespaceId,
                    selected.rows.map((v) => v.original.id),
                  );
                }}
              >
                選択した {selected.rows.length} 件を削除
              </Button>
            </div>
          );
        }}
      />
    </div>
  );
}
