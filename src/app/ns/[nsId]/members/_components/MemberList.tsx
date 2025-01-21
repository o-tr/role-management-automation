"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TMember } from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { DataTable } from "@/app/ns/[nsId]/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { createTag } from "@/requests/createTag";
import { deleteTag } from "@/requests/deleteTag";
import { useMembers } from "../_hooks/use-tags";

export const columns: ColumnDef<TMember>[] = [
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
        onClick={async () => {
          await deleteTag(row.original.namespaceId, row.original.id);
        }}
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

type MemberListProps = {
  namespaceId: string;
};

export function MemberList({ namespaceId }: MemberListProps) {
  const { members, isPending, refetch } = useMembers(namespaceId);
  const [newTagName, setNewTagName] = useState("");

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTag(namespaceId, newTagName);
    await refetch();
    setNewTagName("");
  };

  if (isPending) {
    return <div>loading...</div>;
  }

  return (
    <div className="mt-6">
      <DataTable columns={columns} data={members || []} />
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
