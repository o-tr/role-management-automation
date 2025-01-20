"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TTag } from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { DataTable } from "@/app/ns/[nsId]/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { useNamespace } from "@/hooks/use-namespace";
import { createTag } from "@/requests/createTag";
import { deleteTag } from "@/requests/deleteTag";

type InternalTag = TTag & { namespaceId: string };

export const columns: ColumnDef<InternalTag>[] = [
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
          void deleteTag(row.original.namespaceId, row.original.id)
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

export function TagList({ namespaceId }: TagListProps) {
  const { namespace, isPending, refetch } = useNamespace({ namespaceId });
  const [newTagName, setNewTagName] = useState("");

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namespace) return;
    await createTag(namespace.id, newTagName);
    await refetch();
    setNewTagName("");
  };

  if (isPending || !namespace) return <div>Loading...</div>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">タグ</h2>
      <DataTable
        columns={columns}
        data={namespace.tags.map((v) => ({ ...v, namespaceId }))}
        deleteSelected={(selected) => {
          deleteTags(
            namespace.id,
            selected.rows.map((v) => v.original.id),
          );
        }}
      />
      <form onSubmit={handleAddTag} className="mt-4 flex space-x-2">
        <Input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="新しいタグ名"
          required
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending}>
          追加
        </Button>
      </form>
    </div>
  );
}
