"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TNamespaceId, TTag } from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "@/app/ns/[nsId]/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { createTag } from "@/requests/createTag";
import { deleteTag } from "@/requests/deleteTag";
import { TbTag } from "react-icons/tb";
import { TagDisplay } from "../../components/TagDisplay";
import { onTagsChange } from "../_hooks/on-tags-change";
import { useTags } from "../_hooks/use-tags";
import { EditTag } from "./EditTag";

type InternalTag = TTag & { namespaceId: TNamespaceId };

export const columns: ColumnDef<InternalTag>[] = [
  {
    id: "select",
    header: CommonCheckboxHeader,
    cell: CommonCheckboxCell,
    size: 50,
    maxSize: 50,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <TagDisplay tag={row.original} variant="ghost" />,
    size: -1,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <EditTag nsId={row.original.namespaceId} tag={row.original} />
        <Button
          variant="outline"
          onClick={async () => {
            await deleteTag(row.original.namespaceId, row.original.id);
            onTagsChange();
          }}
        >
          削除
        </Button>
      </div>
    ),
    size: 150,
  },
];

const deleteTags = async (groupId: string, tagIds: string[]) => {
  await Promise.all(tagIds.map((tagId) => deleteTag(groupId, tagId)));
  onTagsChange();
};

type TagListProps = {
  namespaceId: TNamespaceId;
};

export function TagList({ namespaceId }: TagListProps) {
  const { tags, refetch, isPending } = useTags(namespaceId);
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
    <div className="overflow-y-hidden">
      <DataTable
        columns={columns}
        data={tags?.map((v) => ({ ...v, namespaceId })) || []}
        footer={({ table }) => {
          const selected = table.getSelectedRowModel();
          return (
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  deleteTags(
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
