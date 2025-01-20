"use client";

import { Button } from "@/components/ui/button";
import type { TMapping } from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/app/ns/[nsId]/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { useMappings } from "@/hooks/use-mappings";
import { deleteMapping } from "@/requests/deleteMapping";
import { deleteTag } from "@/requests/deleteTag";
import { ActionsDisplay } from "./ActionsDisplay";
import { ConditionsDisplay } from "./ConditionsDisplay";

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
        <div>{JSON.stringify(row.original.actions)}</div>
        <ActionsDisplay
          actions={row.original.actions}
          nsId={row.original.namespaceId}
        />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="outline"
        onClick={() =>
          void deleteMapping(
            row.original.namespaceId,
            row.original.accountId,
            row.original.groupId,
            row.original.id,
          )
        }
      >
        削除
      </Button>
    ),
    size: 100,
  },
];

const deleteTags = async (groupId: string, tagIds: string[]) => {
  await Promise.all(tagIds.map((tagId) => deleteTag(groupId, tagId)));
};

type TagListProps = {
  namespaceId: string;
};

export function MappingList({ namespaceId }: TagListProps) {
  const { mappings, isPending, refetch } = useMappings(namespaceId);

  if (isPending || !mappings) return <div>Loading...</div>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">割り当て</h2>
      <DataTable
        columns={columns}
        data={mappings.map((v) => ({ ...v, namespaceId }))}
      />
    </div>
  );
}
