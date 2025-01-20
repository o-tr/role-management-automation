"use client";

import { Button } from "@/components/ui/button";
import type { TMapping } from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/app/ns/[nsId]/components/DataTable";
import { useMappings } from "@/app/ns/[nsId]/roles/_hooks/use-mappings";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteMapping } from "@/requests/deleteMapping";
import {
  onServiceGroupMappingChange,
  useOnServiceGroupMappingChange,
} from "../_hooks/on-mappings-change";
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
    header: ({ table }) => (
      <div className={"grid place-items-center"}>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className={"grid place-items-center"}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
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

      return (
        <>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <div className="flex flex-row justify-end">
              <DialogTrigger asChild>
                <Button variant="outline">編集</Button>
              </DialogTrigger>
            </div>
            <DialogContent className="max-w-7xl">
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
        </>
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
        deleteSelected={(ids) =>
          deleteMappings(
            namespaceId,
            ids.rows.map((v) => v.original.id),
          )
        }
      />
    </div>
  );
}
