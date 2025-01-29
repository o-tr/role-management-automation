"use client";

import { Button } from "@/components/ui/button";
import type { TMapping } from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";

import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "@/app/ns/[nsId]/components/DataTable";
import { useMappings } from "@/app/ns/[nsId]/roles/_hooks/use-mappings";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteMapping } from "@/requests/deleteMapping";
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

export const columns: ColumnDef<InternalMapping>[] = [
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
  },
  {
    id: "buttons",
    cell: ({ row }) => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      useOnServiceGroupMappingChange(() => setIsModalOpen(false));

      return (
        <div className="flex flex-col gap-2">
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
            onClick={() =>
              void deleteMapping(row.original.namespaceId, row.original.id)
            }
          >
            削除
          </Button>
        </div>
      );
    },
    size: 100,
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
  const { mappings, isPending, refetch } = useMappings(namespaceId);
  useOnServiceGroupMappingChange(() => refetch());

  if (isPending || !mappings) return <div>Loading...</div>;

  return (
    <div className="mt-6">
      <DataTable
        columns={columns}
        data={mappings.map((v) => ({ ...v, namespaceId }))}
        footer={({ table }) => {
          const selected = table.getSelectedRowModel();
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
