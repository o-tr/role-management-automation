"use client";

import { Button } from "@/components/ui/button";
import type { TMapping, TTag } from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/app/ns/[nsId]/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { useMappings } from "@/hooks/use-mappings";
import { deleteMapping } from "@/requests/deleteMapping";
import { deleteTag } from "@/requests/deleteTag";

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
    accessorKey: "name",
    header: "Name",
    size: -1,
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
